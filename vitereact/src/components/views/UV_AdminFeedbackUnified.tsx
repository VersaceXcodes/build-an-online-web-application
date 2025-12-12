import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import {
  Filter,
  X,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  MessageCircle,
  ArrowLeft,
  Star,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface UnifiedFeedback {
  feedback_id: string;
  created_by_user_id: string;
  created_by_role: 'customer' | 'staff' | 'manager';
  location: string;
  order_id: string | null;
  category: string;
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assigned_to_user_id: string | null;
  internal_notes: string | null;
  public_response: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  created_by_first_name?: string;
  created_by_last_name?: string;
  created_by_email?: string;
  assigned_to_first_name?: string;
  assigned_to_last_name?: string;
}

interface FeedbackListResponse {
  data: UnifiedFeedback[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

interface InternalUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_type: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchUnifiedFeedback = async (
  token: string,
  filters: {
    location?: string | null;
    category?: string | null;
    priority?: string | null;
    status?: string | null;
    role?: string | null;
    limit?: number;
    offset?: number;
  }
): Promise<FeedbackListResponse> => {
  const params: any = {
    limit: filters.limit || 20,
    offset: filters.offset || 0,
  };

  if (filters.location) params.location = filters.location;
  if (filters.category) params.category = filters.category;
  if (filters.priority) params.priority = filters.priority;
  if (filters.status) params.status = filters.status;
  if (filters.role) params.role = filters.role;

  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/unified-feedback`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params,
    }
  );

  return response.data;
};

const fetchInternalUsers = async (token: string): Promise<InternalUser[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/internal-users`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

const updateFeedback = async (
  token: string,
  feedback_id: string,
  data: {
    priority?: string;
    status?: string;
    assigned_to_user_id?: string | null;
    internal_notes?: string;
    public_response?: string;
  }
): Promise<UnifiedFeedback> => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/unified-feedback/${feedback_id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminFeedbackUnified: React.FC = () => {
  // ==================================
  // ZUSTAND STATE ACCESS
  // ==================================

  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);

  // ==================================
  // LOCAL STATE
  // ==================================

  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<UnifiedFeedback | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    priority: '',
    status: '',
    assigned_to_user_id: '',
    internal_notes: '',
    public_response: '',
  });

  // URL params
  const location = searchParams.get('location') || '';
  const category = searchParams.get('category') || '';
  const priority = searchParams.get('priority') || '';
  const status = searchParams.get('status') || '';
  const role = searchParams.get('role') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  // ==================================
  // REACT QUERY
  // ==================================

  const queryClient = useQueryClient();

  const {
    data: feedbackResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['unified-feedback', location, category, priority, status, role, offset],
    queryFn: () =>
      fetchUnifiedFeedback(authToken!, {
        location: location || null,
        category: category || null,
        priority: priority || null,
        status: status || null,
        role: role || null,
        limit,
        offset,
      }),
    enabled: !!authToken,
  });

  const { data: internalUsers = [] } = useQuery({
    queryKey: ['internal-users'],
    queryFn: () => fetchInternalUsers(authToken!),
    enabled: !!authToken,
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      feedback_id: string;
      updates: {
        priority?: string;
        status?: string;
        assigned_to_user_id?: string | null;
        internal_notes?: string;
        public_response?: string;
      };
    }) => updateFeedback(authToken!, data.feedback_id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unified-feedback'] });
      showToast('success', 'Feedback updated successfully');
      setShowUpdateModal(false);
      setSelectedFeedback(null);
    },
    onError: () => {
      showToast('error', 'Failed to update feedback');
    },
  });

  // ==================================
  // EVENT HANDLERS
  // ==================================

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  const handleViewFeedback = (feedback: UnifiedFeedback) => {
    setSelectedFeedback(feedback);
    setUpdateForm({
      priority: feedback.priority,
      status: feedback.status,
      assigned_to_user_id: feedback.assigned_to_user_id || '',
      internal_notes: feedback.internal_notes || '',
      public_response: feedback.public_response || '',
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedback) return;

    updateMutation.mutate({
      feedback_id: selectedFeedback.feedback_id,
      updates: {
        priority: updateForm.priority,
        status: updateForm.status,
        assigned_to_user_id: updateForm.assigned_to_user_id || null,
        internal_notes: updateForm.internal_notes,
        public_response: updateForm.public_response,
      },
    });
  };

  // ==================================
  // COMPUTED VALUES
  // ==================================

  const feedbackList = feedbackResponse?.data || [];
  const totalPages = feedbackResponse
    ? Math.ceil(feedbackResponse.total / limit)
    : 0;
  const activeFiltersCount = [location, category, priority, status, role].filter(
    Boolean
  ).length;

  // ==================================
  // HELPER FUNCTIONS
  // ==================================

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'customer':
        return <User className="h-4 w-4" />;
      case 'staff':
        return <Users className="h-4 w-4" />;
      case 'manager':
        return <MessageCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // ==================================
  // RENDER
  // ==================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All Feedback</h1>
                <p className="mt-1 text-sm text-gray-600">
                  View feedback from customers, staff, and managers
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Role Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Roles</option>
                    <option value="customer">Customer</option>
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Locations</option>
                    <option value="blanchardstown">Blanchardstown</option>
                    <option value="tallaght">Tallaght</option>
                    <option value="glasnevin">Glasnevin</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="order_issue">Order Issue</option>
                    <option value="product_quality">Product Quality</option>
                    <option value="delivery">Delivery</option>
                    <option value="customer_service">Customer Service</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="complaint">Complaint</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => handleFilterChange('priority', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Failed to load feedback. Please try again.
                </p>
                <button
                  onClick={() => refetch()}
                  className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-40 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Feedback List */}
        {!isLoading && feedbackList.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">No feedback found</p>
            <p className="text-sm text-gray-600">
              Try adjusting your filters or check back later.
            </p>
          </div>
        )}

        {!isLoading && feedbackList.length > 0 && (
          <div className="space-y-4">
            {feedbackList.map((feedback) => (
              <div
                key={feedback.feedback_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                          {getRoleIcon(feedback.created_by_role)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {feedback.subject}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                              feedback.priority
                            )}`}
                          >
                            {feedback.priority}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                              feedback.status
                            )}`}
                          >
                            {feedback.status}
                          </span>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            {getRoleIcon(feedback.created_by_role)}
                            <span className="capitalize">{feedback.created_by_role}</span>
                            {feedback.created_by_first_name && (
                              <span>
                                - {feedback.created_by_first_name}{' '}
                                {feedback.created_by_last_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span className="capitalize">{feedback.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(feedback.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span className="capitalize">{feedback.category.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="pl-14">
                      <p className="text-gray-700 mb-4 line-clamp-2">{feedback.message}</p>

                      {/* Assignment */}
                      {feedback.assigned_to_user_id && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                          <Users className="h-4 w-4" />
                          <span>
                            Assigned to: {feedback.assigned_to_first_name}{' '}
                            {feedback.assigned_to_last_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewFeedback(feedback)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View & Update</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {offset + 1} to {Math.min(offset + limit, feedbackResponse?.total || 0)}{' '}
              of {feedbackResponse?.total || 0} results
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center space-x-1">
                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                  if (pageNum > totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Update Modal */}
      {showUpdateModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Feedback Details</h2>
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Feedback Information */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">{selectedFeedback.subject}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">From:</span>{' '}
                    <span className="font-medium capitalize">
                      {selectedFeedback.created_by_role} -{' '}
                      {selectedFeedback.created_by_first_name}{' '}
                      {selectedFeedback.created_by_last_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>{' '}
                    <span className="font-medium capitalize">{selectedFeedback.location}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Category:</span>{' '}
                    <span className="font-medium capitalize">
                      {selectedFeedback.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>{' '}
                    <span className="font-medium">{formatDate(selectedFeedback.created_at)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Message:</span>
                  <p className="mt-1 text-gray-900">{selectedFeedback.message}</p>
                </div>
              </div>

              {/* Update Form */}
              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={updateForm.priority}
                      onChange={(e) =>
                        setUpdateForm({ ...updateForm, priority: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To
                  </label>
                  <select
                    value={updateForm.assigned_to_user_id}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, assigned_to_user_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {internalUsers.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.first_name} {user.last_name} ({user.user_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Notes (Private)
                  </label>
                  <textarea
                    value={updateForm.internal_notes}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, internal_notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add internal notes..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Public Response (Visible to submitter)
                  </label>
                  <textarea
                    value={updateForm.public_response}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, public_response: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add public response..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updateMutation.isPending ? 'Updating...' : 'Update Feedback'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UV_AdminFeedbackUnified;
