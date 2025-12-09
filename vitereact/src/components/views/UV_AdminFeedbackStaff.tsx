import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Filter, 
  MessageSquare, 
  X, 
  Calendar,
  MapPin,
  User,
  Flag,
  Eye,
  Edit3,
  Send
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS (from Zod schemas)
// ============================================================================

interface StaffFeedback {
  feedback_id: string;
  reference_number: string;
  submitted_by_user_id: string;
  location_name: string;
  feedback_type: 'suggestion' | 'complaint' | 'safety_concern' | 'equipment_issue' | 'process_improvement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachment_urls: string | null;
  is_anonymous: boolean;
  status: 'pending_review' | 'under_review' | 'in_progress' | 'resolved' | 'closed';
  assigned_to_user_id: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface FeedbackListResponse {
  data: StaffFeedback[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

interface UpdateStaffFeedbackPayload {
  feedback_id: string;
  status?: 'pending_review' | 'under_review' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to_user_id?: string | null;
  resolution_notes?: string | null;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchStaffFeedback = async (filters: any, token: string): Promise<FeedbackListResponse> => {
  const params = new URLSearchParams();
  
  if (filters.location_name) params.append('location_name', filters.location_name);
  if (filters.feedback_type) params.append('feedback_type', filters.feedback_type);
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  params.append('limit', '20');
  params.append('offset', '0');
  
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/feedback/staff?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data;
};

const fetchFeedbackDetails = async (feedback_id: string, token: string): Promise<StaffFeedback> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/feedback/staff/${feedback_id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data;
};

const updateFeedbackStatus = async (payload: UpdateStaffFeedbackPayload, token: string): Promise<StaffFeedback> => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/feedback/staff/${payload.feedback_id}`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  
  return response.data;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminFeedbackStaff: React.FC = () => {
  // ============================================================================
  // GLOBAL STATE ACCESS (Individual selectors)
  // ============================================================================
  
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  // const currentUser = useAppStore(state => state.authentication_state.current_user);
  const showToast = useAppStore(state => state.show_toast);
  // const showConfirmation = useAppStore(state => state.show_confirmation);
  
  // ============================================================================
  // URL PARAMETERS & FILTERS
  // ============================================================================
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [feedbackFilters, setFeedbackFilters] = useState({
    location_name: searchParams.get('location_name') || null,
    feedback_type: searchParams.get('feedback_type') || null,
    status: searchParams.get('status') || null,
    priority: searchParams.get('priority') || null,
    date_from: searchParams.get('date_from') || null,
    date_to: searchParams.get('date_to') || null,
  });
  
  // ============================================================================
  // LOCAL STATE
  // ============================================================================
  
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: 'pending_review' as StaffFeedback['status'],
    priority: 'medium' as StaffFeedback['priority'],
    assigned_to_user_id: null as string | null,
    resolution_notes: null as string | null,
  });
  
  const [responseFormData, setResponseFormData] = useState({
    response_text: '',
    is_internal_note: false,
  });
  
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  
  // ============================================================================
  // REACT QUERY
  // ============================================================================
  
  const queryClient = useQueryClient();
  
  // Fetch feedback list
  const { data: feedbackList, isLoading, error } = useQuery({
    queryKey: ['staff-feedback', feedbackFilters],
    queryFn: () => fetchStaffFeedback(feedbackFilters, authToken || ''),
    enabled: !!authToken,
    staleTime: 30000, // 30 seconds
  });
  
  // Fetch selected feedback details
  const { data: selectedFeedback } = useQuery({
    queryKey: ['staff-feedback-detail', selectedFeedbackId],
    queryFn: () => fetchFeedbackDetails(selectedFeedbackId!, authToken || ''),
    enabled: !!selectedFeedbackId && !!authToken,
  });
  
  // Update feedback mutation
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateStaffFeedbackPayload) => 
      updateFeedbackStatus(payload, authToken || ''),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['staff-feedback'] });
      queryClient.invalidateQueries({ queryKey: ['staff-feedback-detail', data.feedback_id] });
      showToast('success', 'Feedback updated successfully');
      setStatusModalOpen(false);
      setDetailModalOpen(false);
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update feedback');
    },
  });
  
  // ============================================================================
  // EFFECTS - Sync filters with URL
  // ============================================================================
  
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (feedbackFilters.location_name) newParams.set('location_name', feedbackFilters.location_name);
    if (feedbackFilters.feedback_type) newParams.set('feedback_type', feedbackFilters.feedback_type);
    if (feedbackFilters.status) newParams.set('status', feedbackFilters.status);
    if (feedbackFilters.priority) newParams.set('priority', feedbackFilters.priority);
    if (feedbackFilters.date_from) newParams.set('date_from', feedbackFilters.date_from);
    if (feedbackFilters.date_to) newParams.set('date_to', feedbackFilters.date_to);
    
    setSearchParams(newParams, { replace: true });
  }, [feedbackFilters, setSearchParams]);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleFilterChange = (key: string, value: string | null) => {
    setFeedbackFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const handleClearFilters = () => {
    setFeedbackFilters({
      location_name: null,
      feedback_type: null,
      status: null,
      priority: null,
      date_from: null,
      date_to: null,
    });
  };
  
  const handleViewDetails = (feedback_id: string) => {
    setSelectedFeedbackId(feedback_id);
    setDetailModalOpen(true);
  };
  
  const handleOpenStatusModal = (feedback: StaffFeedback) => {
    setSelectedFeedbackId(feedback.feedback_id);
    setStatusUpdateForm({
      status: feedback.status,
      priority: feedback.priority,
      assigned_to_user_id: feedback.assigned_to_user_id,
      resolution_notes: feedback.resolution_notes,
    });
    setStatusModalOpen(true);
  };
  
  const handleUpdateStatus = () => {
    if (!selectedFeedbackId) return;
    
    updateMutation.mutate({
      feedback_id: selectedFeedbackId,
      ...statusUpdateForm,
    });
  };
  
  const handleAddResponse = () => {
    if (!selectedFeedback || !responseFormData.response_text.trim()) {
      showToast('error', 'Please enter a response');
      return;
    }
    
    // Since dedicated response endpoint doesn't exist, add to resolution_notes
    const updatedNotes = selectedFeedback.resolution_notes 
      ? `${selectedFeedback.resolution_notes}\n\n--- Admin Response (${new Date().toLocaleDateString()}) ---\n${responseFormData.response_text}`
      : `--- Admin Response (${new Date().toLocaleDateString()}) ---\n${responseFormData.response_text}`;
    
    updateMutation.mutate({
      feedback_id: selectedFeedback.feedback_id,
      resolution_notes: updatedNotes,
      status: 'under_review', // Move to under_review when responding
    });
    
    setResponseFormData({ response_text: '', is_internal_note: false });
    setResponseModalOpen(false);
  };
  
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  
  const getPriorityColor = (priority: StaffFeedback['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };
  
  const getStatusColor = (status: StaffFeedback['status']) => {
    switch (status) {
      case 'pending_review': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getTypeIcon = (type: StaffFeedback['feedback_type']) => {
    switch (type) {
      case 'safety_concern': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'equipment_issue': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'complaint': return <MessageSquare className="w-5 h-5 text-yellow-600" />;
      case 'suggestion': return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'process_improvement': return <MessageSquare className="w-5 h-5 text-green-600" />;
      default: return <MessageSquare className="w-5 h-5 text-gray-600" />;
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
  
  const formatTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  const formatStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link 
                  to="/admin/dashboard"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Staff Feedback Management</h1>
                  <p className="text-gray-600 mt-1">Review and respond to internal staff feedback and concerns</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  {feedbackList?.total || 0} total feedback items
                </span>
                <button
                  onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                  className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filter Panel */}
          {filterPanelOpen && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Filter Feedback</h2>
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location
                  </label>
                  <select
                    value={feedbackFilters.location_name || ''}
                    onChange={(e) => handleFilterChange('location_name', e.target.value || null)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">All Locations</option>
                    <option value="Blanchardstown">Blanchardstown</option>
                    <option value="Tallaght">Tallaght</option>
                    <option value="Glasnevin">Glasnevin</option>
                  </select>
                </div>
                
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback Type
                  </label>
                  <select
                    value={feedbackFilters.feedback_type || ''}
                    onChange={(e) => handleFilterChange('feedback_type', e.target.value || null)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">All Types</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="complaint">Complaint</option>
                    <option value="safety_concern">Safety Concern</option>
                    <option value="equipment_issue">Equipment Issue</option>
                    <option value="process_improvement">Process Improvement</option>
                  </select>
                </div>
                
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={feedbackFilters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || null)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="under_review">Under Review</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Flag className="w-4 h-4 inline mr-1" />
                    Priority
                  </label>
                  <select
                    value={feedbackFilters.priority || ''}
                    onChange={(e) => handleFilterChange('priority', e.target.value || null)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                
                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    From Date
                  </label>
                  <input
                    type="date"
                    value={feedbackFilters.date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value || null)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
                
                {/* Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={feedbackFilters.date_to || ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value || null)}
                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading staff feedback...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900">Failed to load feedback</h3>
                  <p className="text-red-700 text-sm">{(error as any).message}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Empty State */}
          {!isLoading && !error && feedbackList && feedbackList.data.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No feedback found</h3>
              <p className="text-gray-600 mb-6">
                {Object.values(feedbackFilters).some(v => v !== null)
                  ? 'No feedback matches your current filters. Try adjusting your search criteria.'
                  : 'No staff feedback has been submitted yet.'}
              </p>
              {Object.values(feedbackFilters).some(v => v !== null) && (
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
          
          {/* Feedback List */}
          {!isLoading && !error && feedbackList && feedbackList.data.length > 0 && (
            <div className="space-y-4">
              {feedbackList.data.map((feedback) => (
                <div
                  key={feedback.feedback_id}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-3 mb-3">
                        {getTypeIcon(feedback.feedback_type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {feedback.title}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(feedback.priority)}`}>
                              {feedback.priority.toUpperCase()}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{feedback.location_name}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>
                                {feedback.is_anonymous 
                                  ? `Anonymous Staff - ${feedback.location_name}` 
                                  : 'Staff Member'}
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(feedback.created_at)}</span>
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-3 line-clamp-2">
                            {feedback.description}
                          </p>
                          
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                              {formatStatusLabel(feedback.status)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Type: {formatTypeLabel(feedback.feedback_type)}
                            </span>
                            <span className="text-xs text-gray-500">
                              Ref: {feedback.reference_number}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewDetails(feedback.feedback_id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                      
                      {feedback.status !== 'closed' && feedback.status !== 'resolved' && (
                        <button
                          onClick={() => handleOpenStatusModal(feedback)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Update Status</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* ========================================================================== */}
      {/* DETAIL MODAL */}
      {/* ========================================================================== */}
      
      {detailModalOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getTypeIcon(selectedFeedback.feedback_type)}
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedFeedback.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Ref: {selectedFeedback.reference_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedFeedbackId(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status and Priority Badges */}
              <div className="flex items-center space-x-3">
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedFeedback.status)}`}>
                  {formatStatusLabel(selectedFeedback.status)}
                </span>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getPriorityColor(selectedFeedback.priority)}`}>
                  Priority: {selectedFeedback.priority.toUpperCase()}
                </span>
                <span className="px-4 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-800">
                  {formatTypeLabel(selectedFeedback.feedback_type)}
                </span>
              </div>
              
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Location</p>
                  <p className="font-medium text-gray-900">{selectedFeedback.location_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Submitted By</p>
                  <p className="font-medium text-gray-900">
                    {selectedFeedback.is_anonymous 
                      ? `Anonymous Staff - ${selectedFeedback.location_name}` 
                      : 'Staff Member'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Submitted On</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedFeedback.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                  <p className="font-medium text-gray-900">{formatDate(selectedFeedback.updated_at)}</p>
                </div>
              </div>
              
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.description}</p>
                </div>
              </div>
              
              {/* Resolution Notes */}
              {selectedFeedback.resolution_notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes & Responses</h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.resolution_notes}</p>
                  </div>
                </div>
              )}
              
              {/* Resolved Info */}
              {selectedFeedback.resolved_at && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">
                      Resolved on {formatDate(selectedFeedback.resolved_at)}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Attachments */}
              {selectedFeedback.attachment_urls && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Attachments</h3>
                  <div className="text-sm text-gray-600">
                    Attachment URLs: {selectedFeedback.attachment_urls}
                  </div>
                </div>
              )}
            </div>
            
            {/* Modal Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedFeedbackId(null);
                }}
                className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              
              <div className="flex items-center space-x-3">
                {selectedFeedback.status !== 'resolved' && selectedFeedback.status !== 'closed' && (
                  <>
                    <button
                      onClick={() => {
                        setResponseModalOpen(true);
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Add Response</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setDetailModalOpen(false);
                        handleOpenStatusModal(selectedFeedback);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Update Status</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* ========================================================================== */}
      {/* STATUS UPDATE MODAL */}
      {/* ========================================================================== */}
      
      {statusModalOpen && selectedFeedbackId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold text-white">Update Feedback Status</h2>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusUpdateForm.status}
                  onChange={(e) => setStatusUpdateForm(prev => ({ 
                    ...prev, 
                    status: e.target.value as StaffFeedback['status'] 
                  }))}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="pending_review">Pending Review</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              
              {/* Priority Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={statusUpdateForm.priority}
                  onChange={(e) => setStatusUpdateForm(prev => ({ 
                    ...prev, 
                    priority: e.target.value as StaffFeedback['priority'] 
                  }))}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              {/* Resolution Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resolution Notes
                </label>
                <textarea
                  value={statusUpdateForm.resolution_notes || ''}
                  onChange={(e) => setStatusUpdateForm(prev => ({ 
                    ...prev, 
                    resolution_notes: e.target.value || null 
                  }))}
                  rows={4}
                  placeholder="Add notes about resolution, actions taken, or follow-up required..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  These notes will be visible to the staff member who submitted the feedback
                </p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-xl">
              <button
                onClick={() => setStatusModalOpen(false)}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
              >
                {updateMutation.isPending && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{updateMutation.isPending ? 'Updating...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ========================================================================== */}
      {/* RESPONSE MODAL */}
      {/* ========================================================================== */}
      
      {responseModalOpen && selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold text-white">Respond to Feedback</h2>
              <button
                onClick={() => {
                  setResponseModalOpen(false);
                  setResponseFormData({ response_text: '', is_internal_note: false });
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your response will be added to the resolution notes and the staff member will be able to see it when the feedback is updated.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={responseFormData.response_text}
                  onChange={(e) => setResponseFormData(prev => ({ 
                    ...prev, 
                    response_text: e.target.value 
                  }))}
                  rows={6}
                  placeholder="Type your response to the staff member..."
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 resize-none"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="internal-note"
                  checked={responseFormData.is_internal_note}
                  onChange={(e) => setResponseFormData(prev => ({ 
                    ...prev, 
                    is_internal_note: e.target.checked 
                  }))}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="internal-note" className="text-sm text-gray-700">
                  Internal note only (not visible to staff)
                </label>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-xl">
              <button
                onClick={() => {
                  setResponseModalOpen(false);
                  setResponseFormData({ response_text: '', is_internal_note: false });
                }}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddResponse}
                disabled={updateMutation.isPending || !responseFormData.response_text.trim()}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2"
              >
                {updateMutation.isPending && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <Send className="w-4 h-4" />
                <span>{updateMutation.isPending ? 'Sending...' : 'Send Response'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_AdminFeedbackStaff;