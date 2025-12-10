import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import {
  Star,
  Filter,
  X,
  Eye,
  EyeOff,
  MessageSquare,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CustomerFeedback {
  feedback_id: string;
  order_id: string;
  user_id: string | null;
  overall_rating: number;
  product_rating: number;
  fulfillment_rating: number;
  product_comment: string | null;
  fulfillment_comment: string | null;
  overall_comment: string | null;
  quick_tags: string | null;
  allow_contact: boolean;
  reviewed_status: 'pending_review' | 'reviewed' | 'requires_attention';
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  is_hidden_from_staff: boolean;
  created_at: string;
  updated_at: string;
  order_number?: string;
  location_name?: string;
}

interface FeedbackListResponse {
  data: CustomerFeedback[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchCustomerFeedback = async (
  token: string,
  filters: {
    reviewed_status?: string | null;
    min_rating?: number | null;
    max_rating?: number | null;
    date_from?: string | null;
    date_to?: string | null;
    limit?: number;
    offset?: number;
  }
): Promise<FeedbackListResponse> => {
  const params: any = {
    limit: filters.limit || 20,
    offset: filters.offset || 0,
    sort_by: 'created_at',
    sort_order: 'desc',
  };

  if (filters.reviewed_status) params.reviewed_status = filters.reviewed_status;
  if (filters.min_rating) params.min_rating = filters.min_rating;
  if (filters.max_rating) params.max_rating = filters.max_rating;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;

  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/feedback/customer`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params,
    }
  );

  return response.data;
};

const markFeedbackAsReviewed = async (
  token: string,
  feedback_id: string,
  data: {
    reviewed_status: string;
    notes?: string;
  }
): Promise<CustomerFeedback> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/feedback/customer/${feedback_id}/review`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

const toggleFeedbackVisibility = async (
  token: string,
  feedback_id: string,
  is_hidden: boolean
): Promise<CustomerFeedback> => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/feedback/customer/${feedback_id}`,
    {
      feedback_id,
      is_hidden_from_staff: is_hidden,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  return response.data;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminFeedbackCustomer: React.FC = () => {
  // const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Global state access (individual selectors)
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  // const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const showToast = useAppStore((state) => state.show_toast);

  // URL param filters
  const reviewed_status = searchParams.get('reviewed_status') || null;
  const min_rating = searchParams.get('min_rating') ? Number(searchParams.get('min_rating')) : null;
  const max_rating = searchParams.get('max_rating') ? Number(searchParams.get('max_rating')) : null;
  const date_from = searchParams.get('date_from') || null;
  const date_to = searchParams.get('date_to') || null;
  const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;

  // Local state
  const [selected_feedback, set_selected_feedback] = useState<CustomerFeedback | null>(null);
  const [detail_modal_open, set_detail_modal_open] = useState(false);
  const [review_modal_open, set_review_modal_open] = useState(false);
  const [review_form_data, set_review_form_data] = useState({
    reviewed_status: 'reviewed' as 'reviewed' | 'requires_attention',
    notes: '',
  });
  const [filter_panel_open, set_filter_panel_open] = useState(false);
  const [internal_note, set_internal_note] = useState('');
  const [feedback_status, set_feedback_status] = useState<'pending_review' | 'reviewed' | 'requires_attention'>('pending_review');

  const limit = 20;
  const offset = (page - 1) * limit;

  // ============================================================================
  // QUERIES
  // ============================================================================

  const { data: feedback_data, isLoading: feedback_loading, error: feedback_error } = useQuery<FeedbackListResponse>({
    queryKey: ['admin-customer-feedback', reviewed_status, min_rating, max_rating, date_from, date_to, offset],
    queryFn: () =>
      fetchCustomerFeedback(authToken!, {
        reviewed_status,
        min_rating,
        max_rating,
        date_from,
        date_to,
        limit,
        offset,
      }),
    enabled: !!authToken,
    staleTime: 30000, // 30 seconds
  });

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const markReviewedMutation = useMutation({
    mutationFn: (data: { feedback_id: string; reviewed_status: string; notes?: string }) =>
      markFeedbackAsReviewed(authToken!, data.feedback_id, {
        reviewed_status: data.reviewed_status,
        notes: data.notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customer-feedback'] });
      showToast('success', 'Feedback marked as reviewed');
      set_review_modal_open(false);
      set_detail_modal_open(false);
      set_selected_feedback(null);
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update feedback');
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: (data: { feedback_id: string; is_hidden: boolean }) =>
      toggleFeedbackVisibility(authToken!, data.feedback_id, data.is_hidden),
    onSuccess: (updated_feedback) => {
      queryClient.invalidateQueries({ queryKey: ['admin-customer-feedback'] });
      showToast('success', updated_feedback.is_hidden_from_staff ? 'Feedback hidden from staff' : 'Feedback visible to staff');
      
      // Update selected feedback if it's the one being modified
      if (selected_feedback?.feedback_id === updated_feedback.feedback_id) {
        set_selected_feedback(updated_feedback);
      }
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update visibility');
    },
  });

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const feedback_items = feedback_data?.data || [];
  const total_count = feedback_data?.total || 0;
  const total_pages = Math.ceil(total_count / limit);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (!feedback_items.length) {
      return {
        average_overall: 0,
        average_product: 0,
        average_fulfillment: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        pending_count: 0,
        requires_attention_count: 0,
      };
    }

    const avg_overall = feedback_items.reduce((sum, f) => sum + Number(f.overall_rating || 0), 0) / feedback_items.length;
    const avg_product = feedback_items.reduce((sum, f) => sum + Number(f.product_rating || 0), 0) / feedback_items.length;
    const avg_fulfillment = feedback_items.reduce((sum, f) => sum + Number(f.fulfillment_rating || 0), 0) / feedback_items.length;

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedback_items.forEach((f) => {
      const rating = Number(f.overall_rating || 0);
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });

    const pending = feedback_items.filter((f) => f.reviewed_status === 'pending_review').length;
    const attention = feedback_items.filter((f) => f.reviewed_status === 'requires_attention').length;

    return {
      average_overall: avg_overall,
      average_product: avg_product,
      average_fulfillment: avg_fulfillment,
      rating_distribution: distribution,
      pending_count: pending,
      requires_attention_count: attention,
    };
  }, [feedback_items]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFilterChange = (key: string, value: string | number | null) => {
    const params = new URLSearchParams(searchParams);
    
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    
    // Reset to page 1 when filters change
    params.delete('page');
    
    setSearchParams(params);
  };

  const handlePageChange = (new_page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(new_page));
    setSearchParams(params);
  };

  const handleOpenDetail = (feedback: CustomerFeedback) => {
    set_selected_feedback(feedback);
    set_feedback_status(feedback.reviewed_status);
    set_internal_note('');
    set_detail_modal_open(true);
  };

  const handleCloseDetail = () => {
    set_detail_modal_open(false);
    set_selected_feedback(null);
    set_internal_note('');
    set_feedback_status('pending_review');
  };

  const handleOpenReview = (feedback: CustomerFeedback) => {
    set_selected_feedback(feedback);
    set_review_form_data({
      reviewed_status: 'reviewed',
      notes: '',
    });
    set_review_modal_open(true);
  };

  const handleSubmitReview = () => {
    if (!selected_feedback) return;

    markReviewedMutation.mutate({
      feedback_id: selected_feedback.feedback_id,
      reviewed_status: review_form_data.reviewed_status,
      notes: review_form_data.notes || undefined,
    });
  };

  const handleToggleVisibility = (feedback: CustomerFeedback) => {
    toggleVisibilityMutation.mutate({
      feedback_id: feedback.feedback_id,
      is_hidden: !feedback.is_hidden_from_staff,
    });
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const handleSaveDetailChanges = () => {
    if (!selected_feedback) return;

    // Only save if status changed or internal note is provided
    if (feedback_status !== selected_feedback.reviewed_status || internal_note.trim()) {
      markReviewedMutation.mutate({
        feedback_id: selected_feedback.feedback_id,
        reviewed_status: feedback_status,
        notes: internal_note.trim() || undefined,
      });
    } else {
      handleCloseDetail();
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-green-100 text-green-800';
      case 'requires_attention':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_review':
        return <Clock className="w-4 h-4" />;
      case 'reviewed':
        return <CheckCircle className="w-4 h-4" />;
      case 'requires_attention':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-blue-600';
    if (rating >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const active_filter_count = [
    reviewed_status,
    min_rating,
    max_rating,
    date_from,
    date_to,
  ].filter((f) => f !== null).length;

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Feedback</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Review and manage customer feedback to improve service quality
                </p>
              </div>
              
              <button
                onClick={() => set_filter_panel_open(!filter_panel_open)}
                className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5 text-gray-700" />
                <span className="font-medium text-gray-700">Filters</span>
                {active_filter_count > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {active_filter_count}
                  </span>
                )}
              </button>
            </div>

            {/* Analytics Summary */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Average Rating</p>
                    <p className={`text-3xl font-bold mt-1 ${getRatingColor(analytics.average_overall)}`}>
                      {analytics.average_overall.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    {renderStars(Math.round(analytics.average_overall))}
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Product Rating</p>
                    <p className="text-3xl font-bold text-green-700 mt-1">
                      {analytics.average_product.toFixed(1)}
                    </p>
                  </div>
                  {renderStars(Math.round(analytics.average_product))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Fulfillment Rating</p>
                    <p className="text-3xl font-bold text-purple-700 mt-1">
                      {analytics.average_fulfillment.toFixed(1)}
                    </p>
                  </div>
                  {renderStars(Math.round(analytics.average_fulfillment))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-medium">Pending Review</p>
                    <p className="text-3xl font-bold text-yellow-700 mt-1">
                      {analytics.pending_count}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {filter_panel_open && (
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                {active_filter_count > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Review Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Status
                  </label>
                  <select
                    value={reviewed_status || ''}
                    onChange={(e) => handleFilterChange('reviewed_status', e.target.value || null)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending_review">Pending Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="requires_attention">Requires Attention</option>
                  </select>
                </div>

                {/* Min Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={min_rating || ''}
                    onChange={(e) => handleFilterChange('min_rating', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  >
                    <option value="">Any Rating</option>
                    <option value="1">1+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>

                {/* Max Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Rating
                  </label>
                  <select
                    value={max_rating || ''}
                    onChange={(e) => handleFilterChange('max_rating', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  >
                    <option value="">Any Rating</option>
                    <option value="1">Up to 1 Star</option>
                    <option value="2">Up to 2 Stars</option>
                    <option value="3">Up to 3 Stars</option>
                    <option value="4">Up to 4 Stars</option>
                    <option value="5">Up to 5 Stars</option>
                  </select>
                </div>

                {/* Date From */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From Date
                  </label>
                  <input
                    type="date"
                    value={date_from || ''}
                    onChange={(e) => handleFilterChange('date_from', e.target.value || null)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To Date
                  </label>
                  <input
                    type="date"
                    value={date_to || ''}
                    onChange={(e) => handleFilterChange('date_to', e.target.value || null)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading State */}
          {feedback_loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {feedback_error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Feedback</h3>
              <p className="text-red-700">Please try refreshing the page</p>
            </div>
          )}

          {/* Empty State */}
          {!feedback_loading && !feedback_error && feedback_items.length === 0 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Feedback Found</h3>
              <p className="text-gray-600">
                {active_filter_count > 0
                  ? 'Try adjusting your filters to see more results'
                  : 'No customer feedback submitted yet'}
              </p>
            </div>
          )}

          {/* Feedback List */}
          {!feedback_loading && !feedback_error && feedback_items.length > 0 && (
            <div className="space-y-4">
              {feedback_items.map((feedback) => (
                <div
                  key={feedback.feedback_id}
                  className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleOpenDetail(feedback)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-semibold text-gray-900">
                              Order #{feedback.order_number || feedback.order_id.slice(0, 8)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusBadgeColor(feedback.reviewed_status)}`}>
                              {getStatusIcon(feedback.reviewed_status)}
                              <span>
                                {feedback.reviewed_status === 'pending_review' ? 'Pending' : 
                                 feedback.reviewed_status === 'reviewed' ? 'Reviewed' : 
                                 'Needs Attention'}
                              </span>
                            </span>
                            {feedback.is_hidden_from_staff && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center space-x-1">
                                <EyeOff className="w-3 h-3" />
                                <span>Hidden from Staff</span>
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(feedback.created_at).toLocaleDateString()}</span>
                            </div>
                            {feedback.location_name && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{feedback.location_name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Ratings */}
                        <div className="flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">Overall:</span>
                            {renderStars(Number(feedback.overall_rating || 0))}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">Product:</span>
                            {renderStars(Number(feedback.product_rating || 0))}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600">Service:</span>
                            {renderStars(Number(feedback.fulfillment_rating || 0))}
                          </div>
                        </div>
                      </div>

                      {/* Comments Preview */}
                      {feedback.overall_comment && (
                        <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                          "{feedback.overall_comment}"
                        </p>
                      )}

                      {/* Quick Tags */}
                      {feedback.quick_tags && (
                        <div className="flex flex-wrap gap-2">
                          {feedback.quick_tags.split(',').map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      {feedback.reviewed_status === 'pending_review' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReview(feedback);
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Mark Reviewed
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(feedback);
                        }}
                        disabled={toggleVisibilityMutation.isPending}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                      >
                        {feedback.is_hidden_from_staff ? (
                          <>
                            <Eye className="w-4 h-4" />
                            <span>Show</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span>Hide</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!feedback_loading && !feedback_error && total_pages > 1 && (
            <div className="mt-8 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {offset + 1} to {Math.min(offset + limit, total_count)} of {total_count} results
              </p>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                
                <span className="text-sm text-gray-700 font-medium">
                  Page {page} of {total_pages}
                </span>
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === total_pages}
                  className="p-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detail_modal_open && selected_feedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Feedback Details</h2>
                  <p className="text-sm text-gray-600">
                    Order #{selected_feedback.order_number || selected_feedback.order_id.slice(0, 8)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDetail}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {/* Status & Metadata */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${getStatusBadgeColor(selected_feedback.reviewed_status)}`}>
                    {getStatusIcon(selected_feedback.reviewed_status)}
                    <span>
                      {selected_feedback.reviewed_status === 'pending_review' ? 'Pending Review' : 
                       selected_feedback.reviewed_status === 'reviewed' ? 'Reviewed' : 
                       'Requires Attention'}
                    </span>
                  </span>
                  {selected_feedback.is_hidden_from_staff && (
                    <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center space-x-2">
                      <EyeOff className="w-4 h-4" />
                      <span>Hidden from Staff</span>
                    </span>
                  )}
                </div>
                
                <div className="text-sm text-gray-600">
                  Submitted {new Date(selected_feedback.created_at).toLocaleString()}
                </div>
              </div>

              {/* Ratings Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-600 font-medium mb-2">Overall Rating</p>
                  <div className="flex items-center space-x-2">
                    {renderStars(Number(selected_feedback.overall_rating || 0))}
                    <span className="text-2xl font-bold text-blue-700">
                      {Number(selected_feedback.overall_rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <p className="text-sm text-green-600 font-medium mb-2">Product Quality</p>
                  <div className="flex items-center space-x-2">
                    {renderStars(Number(selected_feedback.product_rating || 0))}
                    <span className="text-2xl font-bold text-green-700">
                      {Number(selected_feedback.product_rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <p className="text-sm text-purple-600 font-medium mb-2">Service Quality</p>
                  <div className="flex items-center space-x-2">
                    {renderStars(Number(selected_feedback.fulfillment_rating || 0))}
                    <span className="text-2xl font-bold text-purple-700">
                      {Number(selected_feedback.fulfillment_rating || 0).toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-4">
                {selected_feedback.overall_comment && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Overall Comment</h4>
                    <p className="text-gray-700">{selected_feedback.overall_comment}</p>
                  </div>
                )}

                {selected_feedback.product_comment && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Product Feedback</h4>
                    <p className="text-gray-700">{selected_feedback.product_comment}</p>
                  </div>
                )}

                {selected_feedback.fulfillment_comment && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Service Feedback</h4>
                    <p className="text-gray-700">{selected_feedback.fulfillment_comment}</p>
                  </div>
                )}
              </div>

              {/* Quick Tags */}
              {selected_feedback.quick_tags && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selected_feedback.quick_tags.split(',').map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Permission */}
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                <span className="text-sm text-gray-700">Customer allows follow-up contact</span>
                <span className={`text-sm font-semibold ${selected_feedback.allow_contact ? 'text-green-600' : 'text-gray-500'}`}>
                  {selected_feedback.allow_contact ? 'Yes' : 'No'}
                </span>
              </div>

              {/* Reviewed Info */}
              {selected_feedback.reviewed_at && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      Reviewed on {new Date(selected_feedback.reviewed_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Admin Actions Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
                
                {/* Change Status */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Change status
                  </label>
                  <select
                    value={feedback_status}
                    onChange={(e) =>
                      set_feedback_status(e.target.value as 'pending_review' | 'reviewed' | 'requires_attention')
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  >
                    <option value="pending_review">Pending Review</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="requires_attention">Requires Attention</option>
                  </select>
                </div>

                {/* Add Internal Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add internal note
                  </label>
                  <textarea
                    value={internal_note}
                    onChange={(e) => set_internal_note(e.target.value)}
                    rows={4}
                    placeholder="Add any internal notes about this feedback..."
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleVisibility(selected_feedback);
                }}
                disabled={toggleVisibilityMutation.isPending}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center space-x-2"
              >
                {selected_feedback.is_hidden_from_staff ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>Show to Staff</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>Hide from Staff</span>
                  </>
                )}
              </button>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSaveDetailChanges}
                  disabled={markReviewedMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markReviewedMutation.isPending ? (
                    <span className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                
                <button
                  onClick={handleCloseDetail}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {review_modal_open && selected_feedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Mark Feedback as Reviewed</h2>
              <button
                onClick={() => set_review_modal_open(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Review Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Status
                </label>
                <select
                  value={review_form_data.reviewed_status}
                  onChange={(e) =>
                    set_review_form_data((prev) => ({
                      ...prev,
                      reviewed_status: e.target.value as 'reviewed' | 'requires_attention',
                    }))
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                >
                  <option value="reviewed">Reviewed</option>
                  <option value="requires_attention">Requires Attention</option>
                </select>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes (Optional)
                </label>
                <textarea
                  value={review_form_data.notes}
                  onChange={(e) =>
                    set_review_form_data((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={4}
                  placeholder="Add any internal notes about this feedback..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  onClick={() => set_review_modal_open(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReview}
                  disabled={markReviewedMutation.isPending}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markReviewedMutation.isPending ? (
                    <span className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    'Save Review'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_AdminFeedbackCustomer;