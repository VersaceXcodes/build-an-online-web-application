import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { CheckCircle, Package, MapPin, Calendar, CreditCard, Gift, ArrowRight } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS (from Zod schemas)
// ============================================================================

interface Order {
  order_id: string;
  order_number: string;
  ticket_number: string | null;
  ticket_token: string | null;
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  location_name: string;
  order_type: 'standard' | 'corporate' | 'celebration';
  fulfillment_method: 'delivery' | 'collection';
  order_status: string;
  delivery_address_line1: string | null;
  delivery_address_line2: string | null;
  delivery_city: string | null;
  delivery_postal_code: string | null;
  delivery_phone: string | null;
  delivery_instructions: string | null;
  special_instructions: string | null;
  scheduled_for: string | null;
  estimated_ready_time: string | null;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  loyalty_points_used: number;
  loyalty_points_earned: number;
  promo_code: string | null;
  payment_method: string;
  payment_status: string;
  payment_transaction_id: string | null;
  card_last_four: string | null;
  collection_code: string | null;
  feedback_submitted: boolean;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface OrderItem {
  item_id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price_at_purchase: number;
  quantity: number;
  subtotal: number;
  product_specific_notes: string | null;
}

// interface OrderResponse {
//   order: Order;
//   items: OrderItem[];
// }

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchOrderDetails = async (order_id: string): Promise<{ order: Order; items: OrderItem[] }> => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  
  const response = await axios.get<Order & { items: OrderItem[] }>(
    `${API_BASE_URL}/api/orders/${order_id}`
  );
  
  // Extract order and items from response
  const { items, ...orderData } = response.data;
  
  return {
    order: orderData as Order,
    items: items || []
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_Checkout_Step3: React.FC = () => {
  const { order_id } = useParams<{ order_id: string }>();
  const navigate = useNavigate();
  
  // CRITICAL: Individual Zustand selectors - NO object destructuring
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const clearCart = useAppStore(state => state.clear_cart);
  
  // Local state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  
  // Fetch order details with TanStack Query
  const { 
    data: orderData, 
    isLoading: orderLoading, 
    error: orderError 
  } = useQuery({
    queryKey: ['order-confirmation', order_id],
    queryFn: () => fetchOrderDetails(order_id!),
    enabled: !!order_id,
    retry: 1,
    staleTime: 60000,
    select: (data) => ({
      order: {
        ...data.order,
        subtotal: Number(data.order.subtotal || 0),
        delivery_fee: Number(data.order.delivery_fee || 0),
        discount_amount: Number(data.order.discount_amount || 0),
        tax_amount: Number(data.order.tax_amount || 0),
        total_amount: Number(data.order.total_amount || 0),
        loyalty_points_used: Number(data.order.loyalty_points_used || 0),
        loyalty_points_earned: Number(data.order.loyalty_points_earned || 0),
      },
      items: data.items.map(item => ({
        ...item,
        price_at_purchase: Number(item.price_at_purchase || 0),
        quantity: Number(item.quantity || 0),
        subtotal: Number(item.subtotal || 0),
      }))
    })
  });
  
  const order = orderData?.order;
  const orderItems = orderData?.items || [];
  
  // Effects
  useEffect(() => {
    if (!order_id) {
      navigate('/', { replace: true });
    }
  }, [order_id, navigate]);
  
  useEffect(() => {
    if (order) {
      // Show success animation
      setShowSuccessAnimation(true);
      
      // Check if account was created (new user with recent created_at)
      if (currentUser && order.user_id === currentUser.user_id) {
        const userCreatedAt = new Date(currentUser.created_at);
        const orderCreatedAt = new Date(order.created_at);
        const timeDiff = Math.abs(orderCreatedAt.getTime() - userCreatedAt.getTime());
        
        // If user created within 1 minute of order, show account created message
        if (timeDiff < 60000) {
          setAccountCreated(true);
        }
      }
      
      // Cart is already cleared by the payment page before navigation
      // But clear it as a safety measure in case user navigates directly to this URL
      setTimeout(() => {
        clearCart();
      }, 100);
    }
  }, [order, clearCart, currentUser]);
  
  // Error handling - redirect to home
  useEffect(() => {
    if (orderError) {
      navigate('/', { replace: true });
    }
  }, [orderError, navigate]);
  
  // Format date/time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString('en-IE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Loading state
  if (orderLoading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700 text-lg font-medium">Loading your order confirmation...</p>
          </div>
        </div>
      </>
    );
  }
  
  // Order not found or error
  if (!order) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
          <div className="text-center">
            <p className="text-gray-600 text-lg mb-4">Order not found</p>
            <Link 
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Animation & Header */}
          <div className="text-center mb-8">
            {showSuccessAnimation && (
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            )}
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Order Confirmed!
            </h1>
            
            <p className="text-xl text-gray-700 mb-2">
              Thank you, {order.customer_name}!
            </p>
            
            <p className="text-gray-600">
              Your order has been successfully placed and confirmed.
            </p>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="bg-white rounded-xl shadow-lg px-8 py-4 border-2 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Order Number</p>
                <p className="text-3xl font-bold text-blue-600">#{order.order_number}</p>
              </div>
              
              {order.ticket_number && (
                <div className="bg-white rounded-xl shadow-lg px-8 py-4 border-2 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Ticket Number</p>
                  <p className="text-3xl font-bold text-green-600">{order.ticket_number}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Account Created Confirmation */}
          {accountCreated && (
            <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-1">
                    Welcome to Kake!
                  </h3>
                  <p className="text-green-700">
                    Your account has been created successfully. You can now log in with {order.customer_email} to track orders and earn loyalty points.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Confirmation Sent Notice */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <p className="text-blue-800">
              Confirmation has been sent to <strong>{order.customer_email}</strong>
            </p>
          </div>
          
          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden mb-8">
            {/* Order Details Section */}
            <div className="p-6 lg:p-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date & Time */}
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="text-base font-medium text-gray-900">
                      {formatDateTime(order.created_at)}
                    </p>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div className="flex items-start space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="text-base font-medium text-gray-900">
                      {order.payment_method === 'cash' 
                        ? 'Cash on Delivery / Collection' 
                        : `${order.payment_method === 'card' ? 'Card' : order.payment_method} ending in ${order.card_last_four || '****'}`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Fulfillment Information */}
            <div className="p-6 lg:p-8 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {order.fulfillment_method === 'delivery' ? 'Delivery Information' : 'Collection Information'}
              </h3>
              
              {order.fulfillment_method === 'delivery' ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                      <p className="text-base font-medium text-gray-900">{order.delivery_address_line1}</p>
                      {order.delivery_address_line2 && (
                        <p className="text-base text-gray-700">{order.delivery_address_line2}</p>
                      )}
                      <p className="text-base text-gray-700">
                        {order.delivery_city}, {order.delivery_postal_code}
                      </p>
                      {order.delivery_instructions && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Instructions:</span> {order.delivery_instructions}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {order.estimated_ready_time && (
                    <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 font-medium">
                        Estimated Delivery Time: {formatTime(order.estimated_ready_time)}
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        We'll notify you when your order is out for delivery.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Package className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pickup Location</p>
                      <p className="text-base font-medium text-gray-900">{order.location_name}</p>
                    </div>
                  </div>
                  
                  {order.estimated_ready_time && (
                    <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-800 font-medium">
                        Estimated Ready Time: {formatTime(order.estimated_ready_time)}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        We'll notify you when your order is ready for pickup.
                      </p>
                    </div>
                  )}
                  
                  {order.collection_code && (
                    <div className="bg-white border-2 border-blue-500 rounded-xl p-6 text-center">
                      <p className="text-sm text-gray-600 mb-2">Your Collection Code</p>
                      <p className="text-4xl font-bold text-blue-600 tracking-wider mb-3">
                        {order.collection_code}
                      </p>
                      <p className="text-sm text-gray-600">
                        Show this code when picking up your order
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {order.special_instructions && (
                <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Special Instructions:</span> {order.special_instructions}
                  </p>
                </div>
              )}
            </div>
            
            {/* Order Items */}
            <div className="p-6 lg:p-8 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.item_id} className="flex justify-between items-start py-3 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-base font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      {item.product_specific_notes && (
                        <p className="text-sm text-gray-500 mt-1 italic">
                          Note: {item.product_specific_notes}
                        </p>
                      )}
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-base font-medium text-gray-900">
                        €{item.subtotal.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        €{item.price_at_purchase.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Price Breakdown */}
            <div className="p-6 lg:p-8 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-base text-gray-700">Subtotal</p>
                  <p className="text-base font-medium text-gray-900">€{order.subtotal.toFixed(2)}</p>
                </div>
                
                {order.delivery_fee > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-base text-gray-700">Delivery Fee</p>
                    <p className="text-base font-medium text-gray-900">€{order.delivery_fee.toFixed(2)}</p>
                  </div>
                )}
                
                {order.delivery_fee === 0 && order.fulfillment_method === 'delivery' && (
                  <div className="flex justify-between items-center">
                    <p className="text-base text-green-700 font-medium">Delivery Fee</p>
                    <p className="text-base font-medium text-green-700">FREE</p>
                  </div>
                )}
                
                {order.discount_amount > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-base text-green-700">
                      Discount
                      {order.promo_code && (
                        <span className="ml-2 text-sm font-medium">({order.promo_code})</span>
                      )}
                    </p>
                    <p className="text-base font-medium text-green-700">-€{order.discount_amount.toFixed(2)}</p>
                  </div>
                )}
                
                {order.loyalty_points_used > 0 && (
                  <div className="flex justify-between items-center">
                    <p className="text-base text-purple-700">
                      Loyalty Points Used ({order.loyalty_points_used} points)
                    </p>
                    <p className="text-base font-medium text-purple-700">
                      Included in discount
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                  <p className="text-xl font-bold text-gray-900">Total</p>
                  <p className="text-xl font-bold text-gray-900">€{order.total_amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            {/* Loyalty Points Earned */}
            {order.loyalty_points_earned > 0 && isAuthenticated && (
              <div className="p-6 lg:p-8 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Gift className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        You Earned {order.loyalty_points_earned} Loyalty Points!
                      </p>
                      <p className="text-sm text-gray-600">
                        Points will be added to your account when your order is completed
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
            {/* Cash Payment Reminder */}
            {order.payment_method === 'cash' && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-semibold text-amber-900 mb-2">
                      Cash Payment Required
                    </h3>
                    <p className="text-amber-800">
                      Please have <strong>€{order.total_amount.toFixed(2)}</strong> ready in cash when your order is {order.fulfillment_method === 'delivery' ? 'delivered' : 'collected'}. 
                      {order.fulfillment_method === 'delivery' && ' The delivery person will collect payment upon arrival.'}
                      {order.fulfillment_method === 'collection' && ' Payment is due when you collect your order.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next?</h3>
            
            <div className="space-y-4">
              {order.fulfillment_method === 'collection' ? (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <p className="text-gray-700 pt-1">
                      We'll start preparing your order right away
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <p className="text-gray-700 pt-1">
                      You'll receive a notification when your order is ready for pickup at {order.location_name}
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <p className="text-gray-700 pt-1">
                      Show your collection code <strong>{order.collection_code}</strong> when picking up
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <p className="text-gray-700 pt-1">
                      We'll start preparing your order right away
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <p className="text-gray-700 pt-1">
                      You'll receive a notification when your order is out for delivery
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <p className="text-gray-700 pt-1">
                      Your order will be delivered to {order.delivery_address_line1}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/orders/${order.order_id}`}
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Package className="w-5 h-5 mr-2" />
              Track Your Order
            </Link>
            
            <Link
              to="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 border border-gray-300 transition-all duration-200"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          
          {/* Account Setup Link (if account just created) */}
          {accountCreated && (
            <div className="mt-6 text-center">
              <Link
                to="/account"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
              >
                Set up your profile to save addresses and track orders →
              </Link>
            </div>
          )}
          
          {/* Support Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Need help with your order?{' '}
              <a 
                href={`mailto:${order.customer_email}?subject=Order%20${order.order_number}%20Support`}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Checkout_Step3;