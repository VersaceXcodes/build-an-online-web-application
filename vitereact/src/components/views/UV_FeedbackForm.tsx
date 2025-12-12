import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Star, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS (from Zod schemas)
// ============================================================================

interface Order {
  order_id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  location_name: string;
  order_type: string;
  fulfillment_method: 'delivery' | 'collection';
  order_status: string;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  feedback_submitted: boolean;
  created_at: string;
  completed_at: string | null;
  items?: OrderItem[];
}

interface OrderItem {
  item_id: string;
  product_name: string;
  quantity: number;
  price_at_purchase: number;
  subtotal: number;
}

interface SubmitFeedbackPayload {
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
}

interface SubmitFeedbackResponse {
  feedback_id: string;
  order_id: string;
  overall_rating: number;
  created_at: string;
  // Note: backend doesn't return bonus_points in response based on main.js code
  // Points are awarded via separate loyalty transaction
}

// ============================================================================
// PREDEFINED QUICK TAGS
// ============================================================================

const POSITIVE_TAGS = [
  'Fresh',
  'Delicious', 
  'Great Value',
  'Fast Service',
  'Friendly Staff',
  'Perfect Packaging'
];

const NEGATIVE_TAGS = [
  'Late',
  'Wrong Item',
  'Poor Quality',
  'Cold',
  'Missing Items',
  'Damaged'
];

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchOrderForFeedback = async (
  order_id: string,
  token: string | null,
  auth_token: string | null
): Promise<Order> => {
  const api_base_url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  const config: any = {
    params: token ? { token } : undefined,
  };
  
  if (auth_token) {
    config.headers = {
      Authorization: `Bearer ${auth_token}`,
    };
  }
  
  const response = await axios.get<Order>(
    `${api_base_url}/api/orders/${order_id}`,
    config
  );
  
  const order = response.data;
  
  // Validate order eligibility
  const eligible_statuses = ['completed', 'delivered', 'collected'];
  if (!eligible_statuses.includes(order.order_status)) {
    throw new Error('Order must be completed to submit feedback');
  }
  
  if (order.feedback_submitted === true) {
    throw new Error('Feedback already submitted for this order');
  }
  
  return order;
};

const submitFeedback = async (
  payload: SubmitFeedbackPayload,
  auth_token: string | null
): Promise<SubmitFeedbackResponse> => {
  const api_base_url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  const config: any = {};
  
  if (auth_token) {
    config.headers = {
      Authorization: `Bearer ${auth_token}`,
    };
  }
  
  const response = await axios.post<SubmitFeedbackResponse>(
    `${api_base_url}/api/feedback/customer`,
    payload,
    config
  );
  
  return response.data;
};

// ============================================================================
// STAR RATING COMPONENT
// ============================================================================

const StarRating: React.FC<{
  rating: number;
  onRatingChange: (rating: number) => void;
  label: string;
  required?: boolean;
}> = ({ rating, onRatingChange, label, required = false }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hover || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-none text-gray-300'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-600 font-medium">
            {rating} / 5
          </span>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// QUICK TAG BUTTON COMPONENT
// ============================================================================

const QuickTagButton: React.FC<{
  tag: string;
  selected: boolean;
  onToggle: (tag: string) => void;
}> = ({ tag, selected, onToggle }) => {
  return (
    <button
      type="button"
      onClick={() => onToggle(tag)}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        selected
          ? 'bg-blue-600 text-white shadow-md'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
      }`}
    >
      {tag}
    </button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_FeedbackForm: React.FC = () => {
  const navigate = useNavigate();
  const { order_id } = useParams<{ order_id: string }>();
  const [searchParams] = useSearchParams();
  
  // Extract token from URL params
  const secure_token = searchParams.get('token');
  
  // Global state (individual selectors)
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);
  
  // Local state - Ratings
  const [overall_rating, set_overall_rating] = useState<number>(0);
  const [product_rating, set_product_rating] = useState<number>(0);
  const [fulfillment_rating, set_fulfillment_rating] = useState<number>(0);
  
  // Local state - Comments
  const [product_comment, set_product_comment] = useState<string>('');
  const [fulfillment_comment, set_fulfillment_comment] = useState<string>('');
  const [overall_comment, set_overall_comment] = useState<string>('');
  
  // Local state - Quick tags
  const [selected_quick_tags, set_selected_quick_tags] = useState<string[]>([]);
  
  // Local state - Options
  const [allow_contact, set_allow_contact] = useState<boolean>(false);
  
  // Local state - Submission
  const [submission_success, set_submission_success] = useState<boolean>(false);
  const [bonus_points_awarded] = useState<number>(25); // Default bonus from backend
  
  // ====================================================================
  // FETCH ORDER DETAILS
  // ====================================================================
  
  const {
    data: order_details,
    isLoading: order_loading,
    error: order_error,
  } = useQuery({
    queryKey: ['order-feedback', order_id, secure_token],
    queryFn: () => fetchOrderForFeedback(order_id!, secure_token, authToken),
    enabled: !!order_id,
    retry: 1,
    staleTime: 0, // Don't cache, always fresh check
  });
  
  // ====================================================================
  // SUBMIT FEEDBACK MUTATION
  // ====================================================================
  
  const submit_mutation = useMutation({
    mutationFn: (payload: SubmitFeedbackPayload) => 
      submitFeedback(payload, authToken),
    onSuccess: () => {
      set_submission_success(true);
      showToast(
        'success',
        `Feedback submitted! You earned +${bonus_points_awarded} loyalty points`
      );
      
      // Auto-redirect after 3 seconds
      setTimeout(() => {
        if (currentUser) {
          navigate('/account?tab=feedback');
        } else {
          navigate(`/orders/${order_id}`);
        }
      }, 3000);
    },
    onError: (error: any) => {
      const error_message = 
        error.response?.data?.message || 
        error.message || 
        'Failed to submit feedback. Please try again.';
      
      showToast('error', error_message);
    },
  });
  
  // ====================================================================
  // HANDLERS
  // ====================================================================
  
  const handle_submit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (overall_rating === 0 || product_rating === 0 || fulfillment_rating === 0) {
      showToast('error', 'Please provide all three ratings');
      return;
    }
    
    // Build payload
    const payload: SubmitFeedbackPayload = {
      order_id: order_id!,
      user_id: currentUser?.user_id || null,
      overall_rating,
      product_rating,
      fulfillment_rating,
      product_comment: product_comment.trim() || null,
      fulfillment_comment: fulfillment_comment.trim() || null,
      overall_comment: overall_comment.trim() || null,
      quick_tags: selected_quick_tags.length > 0 
        ? selected_quick_tags.join(',') 
        : null,
      allow_contact,
    };
    
    submit_mutation.mutate(payload);
  };
  
  const toggle_quick_tag = (tag: string) => {
    set_selected_quick_tags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  
  // ====================================================================
  // ERROR HANDLING
  // ====================================================================
  
  useEffect(() => {
    if (order_error) {
      const error_message = (order_error as any).message || 'Failed to load order';
      
      if (error_message.includes('already submitted')) {
        showToast('info', 'Feedback already submitted for this order');
        setTimeout(() => {
          navigate(currentUser ? '/account?tab=feedback' : '/');
        }, 2000);
      } else if (error_message.includes('must be completed')) {
        showToast('error', 'Can only submit feedback for completed orders');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        showToast('error', 'Order not found');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    }
  }, [order_error, navigate, currentUser, showToast]);
  
  // ====================================================================
  // LOADING STATE
  // ====================================================================
  
  if (order_loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  // ====================================================================
  // ERROR STATE
  // ====================================================================
  
  if (order_error || !order_details) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Unable to Load Order
          </h2>
          <p className="text-gray-600 text-center mb-6">
            {(order_error as any)?.message || 'Order not found or invalid'}
          </p>
          <Link
            to="/"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }
  
  // ====================================================================
  // SUCCESS STATE
  // ====================================================================
  
  if (submission_success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6 animate-bounce">
            <CheckCircle className="w-20 h-20 text-green-600 mx-auto" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Thank You!
          </h2>
          
          <p className="text-gray-600 text-lg mb-6">
            Your feedback has been submitted successfully
          </p>
          
          {currentUser && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-900 font-semibold text-lg">
                +{bonus_points_awarded} Loyalty Points Earned!
              </p>
              <p className="text-blue-700 text-sm mt-1">
                Thank you for taking the time to share your feedback
              </p>
            </div>
          )}
          
          <p className="text-gray-500 text-sm">
            Redirecting you back in a moment...
          </p>
        </div>
      </div>
    );
  }
  
  // ====================================================================
  // VALIDATION
  // ====================================================================
  
  const is_form_valid = 
    overall_rating > 0 && 
    product_rating > 0 && 
    fulfillment_rating > 0;
  
  const is_submitting = submit_mutation.isPending;
  
  // ====================================================================
  // MAIN FORM RENDER
  // ====================================================================
  
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              to={currentUser ? '/account?tab=orders' : `/orders/${order_id}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Order
            </Link>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Share Your Experience
            </h1>
            <p className="text-gray-600 text-lg">
              Help us improve by sharing your feedback
            </p>
          </div>
          
          {/* Order Context Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Order {order_details.order_number}
                </h3>
                <p className="text-gray-600 text-sm">
                  {order_details.location_name} • {
                    order_details.fulfillment_method === 'delivery' 
                      ? 'Delivery' 
                      : 'Collection'
                  }
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Completed: {new Date(order_details.completed_at || order_details.created_at).toLocaleDateString('en-IE', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  €{Number(order_details.total_amount || 0).toFixed(2)}
                </p>
                <p className="text-gray-500 text-sm">
                  {order_details.items?.length || 0} item{order_details.items?.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          
          {/* Feedback Form */}
          <form onSubmit={handle_submit} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-8">
            {/* Rating Sections */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                Rate Your Experience
              </h2>
              
              {/* Overall Rating */}
              <StarRating
                rating={overall_rating}
                onRatingChange={set_overall_rating}
                label="Overall Experience"
                required
              />
              
              {/* Product Rating */}
              <StarRating
                rating={product_rating}
                onRatingChange={set_product_rating}
                label="Product Quality"
                required
              />
              
              {/* Fulfillment Rating */}
              <StarRating
                rating={fulfillment_rating}
                onRatingChange={set_fulfillment_rating}
                label={
                  order_details.fulfillment_method === 'delivery'
                    ? 'Delivery Service'
                    : 'Collection Service'
                }
                required
              />
            </div>
            
            {/* Comments Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                Tell Us More
                <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
              </h2>
              
              {/* Product Comment */}
              <div>
                <label htmlFor="product_comment" className="block text-sm font-medium text-gray-900 mb-2">
                  How were the products?
                </label>
                <textarea
                  id="product_comment"
                  value={product_comment}
                  onChange={(e) => set_product_comment(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Tell us about the taste, freshness, presentation..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {product_comment.length} / 1000
                </p>
              </div>
              
              {/* Fulfillment Comment */}
              <div>
                <label htmlFor="fulfillment_comment" className="block text-sm font-medium text-gray-900 mb-2">
                  How was the {order_details.fulfillment_method === 'delivery' ? 'delivery' : 'collection'} experience?
                </label>
                <textarea
                  id="fulfillment_comment"
                  value={fulfillment_comment}
                  onChange={(e) => set_fulfillment_comment(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder={
                    order_details.fulfillment_method === 'delivery'
                      ? 'Tell us about the delivery time, driver, packaging...'
                      : 'Tell us about the pickup process, wait time, staff...'
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {fulfillment_comment.length} / 1000
                </p>
              </div>
              
              {/* Overall Comment */}
              <div>
                <label htmlFor="overall_comment" className="block text-sm font-medium text-gray-900 mb-2">
                  Any other comments?
                </label>
                <textarea
                  id="overall_comment"
                  value={overall_comment}
                  onChange={(e) => set_overall_comment(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Share any additional thoughts about your experience..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {overall_comment.length} / 1000
                </p>
              </div>
            </div>
            
            {/* Quick Tags Section */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                Quick Feedback Tags
                <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
              </h2>
              
              <div className="space-y-4">
                {/* Positive Tags */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    What did you love?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {POSITIVE_TAGS.map((tag) => (
                      <QuickTagButton
                        key={tag}
                        tag={tag}
                        selected={selected_quick_tags.includes(tag)}
                        onToggle={toggle_quick_tag}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Negative Tags */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    What could be improved?
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {NEGATIVE_TAGS.map((tag) => (
                      <QuickTagButton
                        key={tag}
                        tag={tag}
                        selected={selected_quick_tags.includes(tag)}
                        onToggle={toggle_quick_tag}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact Permission */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={allow_contact}
                  onChange={(e) => set_allow_contact(e.target.checked)}
                  className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Allow us to contact you about your feedback
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    We may reach out to better understand your experience and resolve any issues
                  </p>
                </div>
              </label>
            </div>
            
            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200">
              {!is_form_valid && (
                <p className="text-sm text-amber-600 mb-4 text-center">
                  Please provide all three ratings to submit your feedback
                </p>
              )}
              
              <button
                type="submit"
                disabled={!is_form_valid || is_submitting}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg"
              >
                {is_submitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Submitting Feedback...
                  </span>
                ) : (
                  'Submit Feedback'
                )}
              </button>
              
              {currentUser && (
                <p className="text-center text-sm text-green-700 font-medium mt-4">
                  🎁 You'll earn +{bonus_points_awarded} loyalty points for your feedback!
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default UV_FeedbackForm;