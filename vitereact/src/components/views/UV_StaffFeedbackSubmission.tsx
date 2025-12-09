import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  FileText, 
  AlertTriangle, 
  Lightbulb, 
  Wrench, 
  TrendingUp,
  Send,
  Clock,
  CheckCircle,
  Eye,
  Shield,
  AlertCircle,
  Upload,
  X,
  Filter,
  RefreshCw
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

interface CreateStaffFeedbackPayload {
  submitted_by_user_id: string;
  location_name: string;
  feedback_type: 'suggestion' | 'complaint' | 'safety_concern' | 'equipment_issue' | 'process_improvement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachment_urls: string | null;
  is_anonymous: boolean;
}

interface FeedbackFormData {
  location_name: string;
  feedback_type: 'suggestion' | 'complaint' | 'safety_concern' | 'equipment_issue' | 'process_improvement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachment_urls: string[];
  is_anonymous: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const submitFeedback = async (payload: CreateStaffFeedbackPayload, token: string): Promise<StaffFeedback> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/feedback/staff`,
    payload,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  return response.data;
};

const fetchStaffFeedback = async (
  user_id: string,
  filters: { status: string; feedback_type: string },
  token: string
): Promise<{ data: StaffFeedback[]; total: number }> => {
  const params = new URLSearchParams({
    submitted_by_user_id: user_id,
    limit: '20',
    offset: '0',
    sort_by: 'created_at',
    sort_order: 'desc'
  });
  
  if (filters.status !== 'all') {
    params.append('status', filters.status);
  }
  
  if (filters.feedback_type !== 'all') {
    params.append('feedback_type', filters.feedback_type);
  }
  
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/feedback/staff?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  
  return response.data;
};

const fetchFeedbackDetail = async (feedback_id: string, token: string): Promise<StaffFeedback> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/feedback/staff/${feedback_id}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.data;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_StaffFeedbackSubmission: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  // Global state - CRITICAL: Individual selectors
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);
  
  // Determine active view from route
  const isMyFeedbackView = location.pathname.includes('/my-feedback');
  
  // Local state - Form data
  const [feedback_form_data, set_feedback_form_data] = useState<FeedbackFormData>({
    location_name: '',
    feedback_type: 'suggestion',
    title: '',
    description: '',
    priority: 'medium',
    attachment_urls: [],
    is_anonymous: false
  });
  
  const [feedback_form_errors, set_feedback_form_errors] = useState<{ [key: string]: string }>({});
  
  // Filters from URL params
  const [feedback_filters, set_feedback_filters] = useState({
    status: searchParams.get('status') || 'all',
    feedback_type: searchParams.get('feedback_type') || 'all'
  });
  
  // Detail modal state
  const [selected_feedback_id, set_selected_feedback_id] = useState<string | null>(null);
  
  // ========================================================================
  // REACT QUERY - Submit Feedback Mutation
  // ========================================================================
  
  const submit_feedback_mutation = useMutation({
    mutationFn: (payload: CreateStaffFeedbackPayload) => {
      if (!authToken) throw new Error('No auth token');
      return submitFeedback(payload, authToken);
    },
    onSuccess: (data) => {
      // Clear form
      set_feedback_form_data({
        location_name: '',
        feedback_type: 'suggestion',
        title: '',
        description: '',
        priority: 'medium',
        attachment_urls: [],
        is_anonymous: false
      });
      set_feedback_form_errors({});
      
      // Invalidate feedback list
      queryClient.invalidateQueries({ queryKey: ['staff-feedback'] });
      
      // Show success message
      showToast('success', `Feedback submitted! Reference: ${data.reference_number}`);
      
      // Navigate to my feedback list
      navigate('/staff/feedback/my-feedback');
    },
    onError: (error: any) => {
      const error_message = error.response?.data?.message || 'Failed to submit feedback';
      showToast('error', error_message);
    }
  });
  
  // ========================================================================
  // REACT QUERY - Fetch My Feedback
  // ========================================================================
  
  const { 
    data: feedback_list_data, 
    isLoading: feedback_list_loading,
    refetch: refetch_feedback_list
  } = useQuery({
    queryKey: ['staff-feedback', currentUser?.user_id, feedback_filters],
    queryFn: () => {
      if (!currentUser?.user_id || !authToken) {
        throw new Error('Missing user or token');
      }
      return fetchStaffFeedback(currentUser.user_id, feedback_filters, authToken);
    },
    enabled: !!currentUser?.user_id && !!authToken && isMyFeedbackView,
    staleTime: 60000,
    refetchOnWindowFocus: false
  });
  
  const submitted_feedback_list = feedback_list_data?.data || [];
  
  // ========================================================================
  // REACT QUERY - Fetch Feedback Detail
  // ========================================================================
  
  const { 
    data: selected_feedback_detail,
    isLoading: detail_loading
  } = useQuery({
    queryKey: ['staff-feedback-detail', selected_feedback_id],
    queryFn: () => {
      if (!selected_feedback_id || !authToken) {
        throw new Error('Missing feedback ID or token');
      }
      return fetchFeedbackDetail(selected_feedback_id, authToken);
    },
    enabled: !!selected_feedback_id && !!authToken,
    staleTime: 60000
  });
  
  // ========================================================================
  // EFFECTS
  // ========================================================================
  
  // Auto-set priority to urgent for safety concerns
  useEffect(() => {
    if (feedback_form_data.feedback_type === 'safety_concern' && feedback_form_data.priority !== 'urgent') {
      set_feedback_form_data(prev => ({
        ...prev,
        priority: 'urgent'
      }));
    }
  }, [feedback_form_data.feedback_type, feedback_form_data.priority]);
  
  // Update filters when URL params change
  useEffect(() => {
    const status = searchParams.get('status') || 'all';
    const feedback_type = searchParams.get('feedback_type') || 'all';
    
    set_feedback_filters({
      status,
      feedback_type
    });
  }, [searchParams]);
  
  // ========================================================================
  // FORM HANDLERS
  // ========================================================================
  
  const validate_form = (): boolean => {
    const errors: { [key: string]: string } = {};
    
    if (!feedback_form_data.location_name) {
      errors.location_name = 'Location is required';
    }
    
    if (!feedback_form_data.title || feedback_form_data.title.trim().length < 1) {
      errors.title = 'Title is required';
    } else if (feedback_form_data.title.length > 255) {
      errors.title = 'Title must be 255 characters or less';
    }
    
    if (!feedback_form_data.description || feedback_form_data.description.trim().length < 1) {
      errors.description = 'Description is required';
    } else if (feedback_form_data.description.length > 2000) {
      errors.description = 'Description must be 2000 characters or less';
    }
    
    set_feedback_form_errors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handle_submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate_form()) {
      showToast('error', 'Please fix the form errors');
      return;
    }
    
    if (!currentUser?.user_id) {
      showToast('error', 'User not authenticated');
      return;
    }
    
    const payload: CreateStaffFeedbackPayload = {
      submitted_by_user_id: currentUser.user_id,
      location_name: feedback_form_data.location_name,
      feedback_type: feedback_form_data.feedback_type,
      title: feedback_form_data.title,
      description: feedback_form_data.description,
      priority: feedback_form_data.priority,
      attachment_urls: feedback_form_data.attachment_urls.length > 0 
        ? feedback_form_data.attachment_urls.join(',') 
        : null,
      is_anonymous: feedback_form_data.is_anonymous
    };
    
    submit_feedback_mutation.mutate(payload);
  };
  
  const handle_filter_change = (key: 'status' | 'feedback_type', value: string) => {
    const new_params = new URLSearchParams(searchParams);
    
    if (value === 'all') {
      new_params.delete(key);
    } else {
      new_params.set(key, value);
    }
    
    setSearchParams(new_params);
  };
  
  const open_detail_modal = (feedback_id: string) => {
    set_selected_feedback_id(feedback_id);
  };
  
  const close_detail_modal = () => {
    set_selected_feedback_id(null);
  };
  
  // ========================================================================
  // HELPER FUNCTIONS
  // ========================================================================
  
  const get_feedback_type_icon = (type: string) => {
    switch (type) {
      case 'suggestion': return <Lightbulb className="w-5 h-5" />;
      case 'complaint': return <AlertCircle className="w-5 h-5" />;
      case 'safety_concern': return <AlertTriangle className="w-5 h-5" />;
      case 'equipment_issue': return <Wrench className="w-5 h-5" />;
      case 'process_improvement': return <TrendingUp className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };
  
  const get_status_badge_color = (status: string) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_review': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const get_priority_badge_color = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'urgent': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const format_date = (date_string: string) => {
    const date = new Date(date_string);
    return date.toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // ========================================================================
  // RENDER
  // ========================================================================
  
  if (!currentUser) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Please log in to access staff feedback</p>
            <Link to="/login" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Internal Staff Feedback</h1>
                <p className="text-gray-600 mt-1">Share suggestions, concerns, and feedback confidentially</p>
              </div>
              <Link
                to="/staff/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex -mb-px space-x-8" aria-label="Tabs">
              <Link
                to="/staff/feedback/submit"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  !isMyFeedbackView
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Send className="w-5 h-5" />
                  <span>Submit Feedback</span>
                </div>
              </Link>
              
              <Link
                to="/staff/feedback/my-feedback"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isMyFeedbackView
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>My Feedback</span>
                  {submitted_feedback_list.length > 0 && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {submitted_feedback_list.length}
                    </span>
                  )}
                </div>
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isMyFeedbackView ? (
            /* ============================================================ */
            /* SUBMIT FEEDBACK FORM VIEW */
            /* ============================================================ */
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Info Banner */}
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-blue-900">Confidential Feedback</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Your feedback helps us improve. You can submit anonymously if preferred. 
                        Safety concerns are automatically flagged as urgent.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Form */}
                <form onSubmit={handle_submit} className="p-6 space-y-6">
                  {/* Location Selection */}
                  <div>
                    <label htmlFor="location_name" className="block text-sm font-semibold text-gray-900 mb-2">
                      Location <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="location_name"
                      value={feedback_form_data.location_name}
                      onChange={(e) => {
                        set_feedback_form_data(prev => ({ ...prev, location_name: e.target.value }));
                        set_feedback_form_errors(prev => ({ ...prev, location_name: '' }));
                      }}
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-4 transition-all duration-200 ${
                        feedback_form_errors.location_name
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                    >
                      <option value="">Select a location</option>
                      <option value="Blanchardstown">Blanchardstown</option>
                      <option value="Tallaght">Tallaght</option>
                      <option value="Glasnevin">Glasnevin</option>
                    </select>
                    {feedback_form_errors.location_name && (
                      <p className="text-red-600 text-sm mt-2">{feedback_form_errors.location_name}</p>
                    )}
                  </div>
                  
                  {/* Feedback Type */}
                  <div>
                    <label htmlFor="feedback_type" className="block text-sm font-semibold text-gray-900 mb-2">
                      Feedback Type <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'blue' },
                        { value: 'complaint', label: 'Complaint', icon: AlertCircle, color: 'orange' },
                        { value: 'safety_concern', label: 'Safety Concern', icon: AlertTriangle, color: 'red' },
                        { value: 'equipment_issue', label: 'Equipment Issue', icon: Wrench, color: 'purple' },
                        { value: 'process_improvement', label: 'Process Improvement', icon: TrendingUp, color: 'green' }
                      ].map((type) => {
                        const Icon = type.icon;
                        const is_selected = feedback_form_data.feedback_type === type.value;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => set_feedback_form_data(prev => ({ 
                              ...prev, 
                              feedback_type: type.value as any 
                            }))}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                              is_selected
                                ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-900`
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${is_selected ? `text-${type.color}-600` : 'text-gray-400'}`} />
                            <span className="font-medium text-sm">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
                      Title <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={feedback_form_data.title}
                      onChange={(e) => {
                        set_feedback_form_data(prev => ({ ...prev, title: e.target.value }));
                        set_feedback_form_errors(prev => ({ ...prev, title: '' }));
                      }}
                      placeholder="Brief summary of your feedback"
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-4 transition-all duration-200 ${
                        feedback_form_errors.title
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                      maxLength={255}
                    />
                    <div className="flex justify-between items-center mt-2">
                      {feedback_form_errors.title && (
                        <p className="text-red-600 text-sm">{feedback_form_errors.title}</p>
                      )}
                      <p className="text-gray-500 text-xs ml-auto">
                        {feedback_form_data.title.length}/255 characters
                      </p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
                      Description <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      id="description"
                      value={feedback_form_data.description}
                      onChange={(e) => {
                        set_feedback_form_data(prev => ({ ...prev, description: e.target.value }));
                        set_feedback_form_errors(prev => ({ ...prev, description: '' }));
                      }}
                      placeholder="Provide detailed information about your feedback"
                      rows={6}
                      className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-4 transition-all duration-200 ${
                        feedback_form_errors.description
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                      maxLength={2000}
                    />
                    <div className="flex justify-between items-center mt-2">
                      {feedback_form_errors.description && (
                        <p className="text-red-600 text-sm">{feedback_form_errors.description}</p>
                      )}
                      <p className="text-gray-500 text-xs ml-auto">
                        {feedback_form_data.description.length}/2000 characters
                      </p>
                    </div>
                  </div>
                  
                  {/* Priority */}
                  <div>
                    <label htmlFor="priority" className="block text-sm font-semibold text-gray-900 mb-2">
                      Priority Level
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'urgent', label: 'Urgent' }
                      ].map((priority) => {
                        const is_selected = feedback_form_data.priority === priority.value;
                        const is_disabled = feedback_form_data.feedback_type === 'safety_concern' && priority.value !== 'urgent';
                        return (
                          <button
                            key={priority.value}
                            type="button"
                            disabled={is_disabled}
                            onClick={() => set_feedback_form_data(prev => ({ 
                              ...prev, 
                              priority: priority.value as any 
                            }))}
                            className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${
                              is_disabled
                                ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                                : is_selected
                                ? `${get_priority_badge_color(priority.value)} border-current`
                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            {priority.label}
                          </button>
                        );
                      })}
                    </div>
                    {feedback_form_data.feedback_type === 'safety_concern' && (
                      <p className="text-sm text-orange-600 mt-2 flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Safety concerns are automatically set to Urgent priority</span>
                      </p>
                    )}
                  </div>
                  
                  {/* File Attachments */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        File upload functionality coming soon
                      </p>
                      <p className="text-xs text-gray-500">
                        For now, please include file URLs in the description if needed
                      </p>
                    </div>
                  </div>
                  
                  {/* Anonymous Option */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={feedback_form_data.is_anonymous}
                        onChange={(e) => set_feedback_form_data(prev => ({ 
                          ...prev, 
                          is_anonymous: e.target.checked 
                        }))}
                        className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-4 focus:ring-blue-100"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-900 block">Submit Anonymously</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Your identity will be hidden from admin view, but an audit trail is preserved for system integrity.
                          This ensures confidentiality while maintaining accountability.
                        </p>
                      </div>
                    </label>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        set_feedback_form_data({
                          location_name: '',
                          feedback_type: 'suggestion',
                          title: '',
                          description: '',
                          priority: 'medium',
                          attachment_urls: [],
                          is_anonymous: false
                        });
                        set_feedback_form_errors({});
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      Clear Form
                    </button>
                    
                    <button
                      type="submit"
                      disabled={submit_feedback_mutation.isPending}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                    >
                      {submit_feedback_mutation.isPending ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Submit Feedback</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* MY FEEDBACK LIST VIEW */
            /* ============================================================ */
            <>
              {/* Filters */}
              <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                  </h3>
                  <button
                    onClick={() => refetch_feedback_list()}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status-filter"
                      value={feedback_filters.status}
                      onChange={(e) => handle_filter_change('status', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending_review">Pending Review</option>
                      <option value="under_review">Under Review</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  
                  {/* Type Filter */}
                  <div>
                    <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Feedback Type
                    </label>
                    <select
                      id="type-filter"
                      value={feedback_filters.feedback_type}
                      onChange={(e) => handle_filter_change('feedback_type', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">All Types</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="complaint">Complaint</option>
                      <option value="safety_concern">Safety Concern</option>
                      <option value="equipment_issue">Equipment Issue</option>
                      <option value="process_improvement">Process Improvement</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Feedback List */}
              {feedback_list_loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-600">Loading feedback...</p>
                  </div>
                </div>
              ) : submitted_feedback_list.length === 0 ? (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No feedback found</h3>
                  <p className="text-gray-600 mb-6">
                    {feedback_filters.status !== 'all' || feedback_filters.feedback_type !== 'all'
                      ? 'Try adjusting your filters'
                      : "You haven't submitted any feedback yet"}
                  </p>
                  {feedback_filters.status === 'all' && feedback_filters.feedback_type === 'all' && (
                    <Link
                      to="/staff/feedback/submit"
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Submit Your First Feedback
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {submitted_feedback_list.map((feedback) => (
                    <div
                      key={feedback.feedback_id}
                      className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="flex-shrink-0">
                            {get_feedback_type_icon(feedback.feedback_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{feedback.title}</h3>
                              {feedback.is_anonymous && (
                                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Anonymous
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{feedback.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2 ml-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${get_status_badge_color(feedback.status)}`}>
                            {feedback.status.replace(/_/g, ' ')}
                          </span>
                          <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${get_priority_badge_color(feedback.priority)}`}>
                            {feedback.priority}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{format_date(feedback.created_at)}</span>
                          </span>
                          <span className="font-medium text-gray-700">
                            {feedback.reference_number}
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                            {feedback.location_name}
                          </span>
                        </div>
                        
                        <button
                          onClick={() => open_detail_modal(feedback.feedback_id)}
                          className="inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-medium text-sm transition-colors duration-200"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* ================================================================== */}
      {/* DETAIL MODAL */}
      {/* ================================================================== */}
      
      {selected_feedback_id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Feedback Details</h2>
              <button
                onClick={close_detail_modal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              {detail_loading ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : selected_feedback_detail ? (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {get_feedback_type_icon(selected_feedback_detail.feedback_type)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {selected_feedback_detail.title}
                        </h3>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-700">
                            {selected_feedback_detail.reference_number}
                          </span>
                          {selected_feedback_detail.is_anonymous && (
                            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              <Shield className="w-3 h-3 mr-1" />
                              Anonymous
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${get_status_badge_color(selected_feedback_detail.status)}`}>
                        {selected_feedback_detail.status.replace(/_/g, ' ')}
                      </span>
                      <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${get_priority_badge_color(selected_feedback_detail.priority)}`}>
                        {selected_feedback_detail.priority}
                      </span>
                    </div>
                  </div>
                  
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Location</p>
                      <p className="text-sm font-semibold text-gray-900">{selected_feedback_detail.location_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Type</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">
                        {selected_feedback_detail.feedback_type.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Submitted</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {format_date(selected_feedback_detail.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-medium mb-1">Last Updated</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {format_date(selected_feedback_detail.updated_at)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Description</h4>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap">{selected_feedback_detail.description}</p>
                    </div>
                  </div>
                  
                  {/* Resolution Notes */}
                  {selected_feedback_detail.resolution_notes && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Resolution Notes</span>
                      </h4>
                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <p className="text-gray-700 whitespace-pre-wrap">{selected_feedback_detail.resolution_notes}</p>
                        {selected_feedback_detail.resolved_at && (
                          <p className="text-sm text-green-700 mt-2">
                            Resolved on {format_date(selected_feedback_detail.resolved_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Assigned To */}
                  {selected_feedback_detail.assigned_to_user_id && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <span className="font-semibold">Assigned to:</span> Admin Team Member
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Failed to load feedback details</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={close_detail_modal}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_StaffFeedbackSubmission;