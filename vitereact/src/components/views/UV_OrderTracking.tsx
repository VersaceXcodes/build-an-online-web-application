import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useAppStore } from '@/store/main';
import { 
  CheckCircle, 
  Clock, 
  Package, 
  Truck, 
  MapPin, 
  AlertCircle, 
  RefreshCw, 
  X,
  Phone,
  Mail,
  Calendar,
  FileText,
  QrCode
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface OrderDetails {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  location_name: string;
  fulfillment_method: 'collection' | 'delivery';
  order_status: string;
  delivery_address_line1: string | null;
  delivery_address_line2: string | null;
  delivery_city: string | null;
  delivery_postal_code: string | null;
  delivery_instructions: string | null;
  special_instructions: string | null;
  estimated_ready_time: string | null;
  scheduled_for: string | null;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  loyalty_points_earned: number;
  loyalty_points_used: number;
  collection_code: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface OrderItem {
  item_id: string;
  product_id: string;
  product_name: string;
  price_at_purchase: number;
  quantity: number;
  subtotal: number;
  product_specific_notes: string | null;
}

interface StatusHistory {
  history_id: string;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by_user_id: string | null;
  changed_by_name?: string | null;
  notes: string | null;
  changed_at: string;
}

interface OrderResponse {
  order_id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  location_name: string;
  fulfillment_method: string;
  order_status: string;
  delivery_address_line1: string | null;
  delivery_address_line2: string | null;
  delivery_city: string | null;
  delivery_postal_code: string | null;
  delivery_instructions: string | null;
  special_instructions: string | null;
  estimated_ready_time: string | null;
  scheduled_for: string | null;
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  tax_amount: string;
  total_amount: string;
  loyalty_points_earned: string;
  loyalty_points_used: string;
  collection_code: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  items: {
    item_id: string;
    product_id: string;
    product_name: string;
    price_at_purchase: string;
    quantity: string;
    subtotal: string;
    product_specific_notes: string | null;
  }[];
  status_history: {
    history_id: string;
    order_id: string;
    previous_status: string | null;
    new_status: string;
    changed_by_user_id: string | null;
    changed_by_name?: string | null;
    notes: string | null;
    changed_at: string;
  }[];
}

interface CancelOrderRequest {
  reason: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchOrderDetails = async (
  order_id: string, 
  auth_token: string | null,
  secure_token: string | null
): Promise<{ order_details: OrderDetails; order_items: OrderItem[]; status_history: StatusHistory[] }> => {
  const config: any = {
    headers: {},
    params: {},
  };

  // Use Bearer auth if authenticated, otherwise use token query param
  if (auth_token) {
    config.headers.Authorization = `Bearer ${auth_token}`;
  } else if (secure_token) {
    config.params.token = secure_token;
  }

  const response = await axios.get<OrderResponse>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/orders/${order_id}`,
    config
  );

  // Transform response (convert string numbers to actual numbers)
  const order_details: OrderDetails = {
    ...response.data,
    fulfillment_method: response.data.fulfillment_method as 'collection' | 'delivery',
    subtotal: Number(response.data.subtotal || 0),
    delivery_fee: Number(response.data.delivery_fee || 0),
    discount_amount: Number(response.data.discount_amount || 0),
    tax_amount: Number(response.data.tax_amount || 0),
    total_amount: Number(response.data.total_amount || 0),
    loyalty_points_earned: Number(response.data.loyalty_points_earned || 0),
    loyalty_points_used: Number(response.data.loyalty_points_used || 0),
  };

  const order_items: OrderItem[] = response.data.items.map(item => ({
    ...item,
    price_at_purchase: Number(item.price_at_purchase || 0),
    quantity: Number(item.quantity || 0),
    subtotal: Number(item.subtotal || 0),
  }));

  const status_history: StatusHistory[] = response.data.status_history || [];

  return {
    order_details,
    order_items,
    status_history,
  };
};

const cancelOrder = async (
  order_id: string,
  auth_token: string,
  reason: string
): Promise<OrderDetails> => {
  const response = await axios.post<OrderResponse>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/orders/${order_id}/cancel`,
    { reason } as CancelOrderRequest,
    {
      headers: {
        Authorization: `Bearer ${auth_token}`,
      },
    }
  );

  return {
    ...response.data,
    fulfillment_method: response.data.fulfillment_method as 'collection' | 'delivery',
    subtotal: Number(response.data.subtotal || 0),
    delivery_fee: Number(response.data.delivery_fee || 0),
    discount_amount: Number(response.data.discount_amount || 0),
    tax_amount: Number(response.data.tax_amount || 0),
    total_amount: Number(response.data.total_amount || 0),
    loyalty_points_earned: Number(response.data.loyalty_points_earned || 0),
    loyalty_points_used: Number(response.data.loyalty_points_used || 0),
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'pending_payment': 'gray',
    'payment_confirmed': 'yellow',
    'preparing': 'blue',
    'ready_for_collection': 'green',
    'out_for_delivery': 'blue',
    'collected': 'green',
    'delivered': 'green',
    'completed': 'green',
    'failed_delivery': 'orange',
    'cancelled': 'red',
    'refunded': 'orange',
  };
  return colors[status] || 'gray';
};

const getStatusDisplayName = (status: string): string => {
  const names: { [key: string]: string } = {
    'pending_payment': 'Pending Payment',
    'payment_confirmed': 'Payment Confirmed',
    'preparing': 'Preparing Your Order',
    'ready_for_collection': 'Ready for Pickup',
    'out_for_delivery': 'Out for Delivery',
    'collected': 'Collected',
    'delivered': 'Delivered',
    'completed': 'Completed',
    'failed_delivery': 'Delivery Failed',
    'cancelled': 'Cancelled',
    'refunded': 'Refunded',
  };
  return names[status] || status;
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTimeRemaining = (targetTime: string): string => {
  const now = new Date();
  const target = new Date(targetTime);
  const diffMs = target.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Any moment now';
  
  const diffMins = Math.ceil(diffMs / 60000);
  
  if (diffMins < 60) return `${diffMins} minutes`;
  
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  
  if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  
  return `${hours}h ${mins}m`;
};

const generateQRCodeDataURL = (text: string): string => {
  // Simple QR code placeholder - in production, use a QR code library
  // For now, return a placeholder SVG
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" font-size="24" text-anchor="middle" fill="black">${text}</text>
    </svg>`
  )}`;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_OrderTracking: React.FC = () => {
  // Route parameters
  const { order_id } = useParams<{ order_id: string }>();
  const [searchParams] = useSearchParams();
  const secure_token = searchParams.get('token');

  // Global state
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const socket = useAppStore(state => state.websocket_state.socket);
  const isSocketConnected = useAppStore(state => state.websocket_state.is_connected);
  const joinOrderRoom = useAppStore(state => state.join_order_room);
  const leaveOrderRoom = useAppStore(state => state.leave_order_room);
  const showToast = useAppStore(state => state.show_toast);

  // Local state
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Fetch order details
  const {
    data: orderData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['order', order_id, secure_token],
    queryFn: () => fetchOrderDetails(order_id || '', authToken, secure_token),
    enabled: !!order_id,
    staleTime: 30000, // 30 seconds
    refetchInterval: autoRefreshEnabled ? 30000 : false,
    refetchIntervalInBackground: false,
    select: (data) => ({
      ...data,
      can_cancel_order: 
        data.order_details.order_status === 'pending_payment' || 
        data.order_details.order_status === 'payment_confirmed',
    }),
  });

  const order_details = orderData?.order_details;
  const order_items = orderData?.order_items || [];
  const status_history = orderData?.status_history || [];
  const can_cancel_order = orderData?.can_cancel_order || false;

  // Cancel order mutation
  const cancelMutation = useMutation({
    mutationFn: (reason: string) => {
      if (!authToken) {
        throw new Error('Must be logged in to cancel order');
      }
      return cancelOrder(order_id || '', authToken, reason);
    },
    onSuccess: () => {
      showToast('success', 'Order cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      refetch();
    },
    onError: (error: AxiosError<any>) => {
      const errorMsg = error.response?.data?.message || 'Failed to cancel order';
      showToast('error', errorMsg);
    },
  });

  // WebSocket setup
  useEffect(() => {
    if (order_id && socket && isSocketConnected) {
      // Join order-specific room
      joinOrderRoom(order_id);

      // Listen for status updates
      const handleStatusUpdate = (data: any) => {
        if (data.order_id === order_id) {
          showToast('info', `Order status updated: ${getStatusDisplayName(data.new_status)}`);
          refetch();
        }
      };

      socket.on('order_status_changed', handleStatusUpdate);

      return () => {
        socket.off('order_status_changed', handleStatusUpdate);
        leaveOrderRoom(order_id);
      };
    }
  }, [order_id, socket, isSocketConnected, joinOrderRoom, leaveOrderRoom, refetch, showToast]);

  // Stop auto-refresh for terminal statuses
  useEffect(() => {
    if (order_details) {
      const terminalStatuses = ['completed', 'collected', 'delivered', 'cancelled', 'refunded'];
      if (terminalStatuses.includes(order_details.order_status)) {
        setAutoRefreshEnabled(false);
      }
    }
  }, [order_details?.order_status]);

  // Handle cancel order
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = () => {
    if (!cancelReason.trim()) {
      showToast('error', 'Please provide a reason for cancellation');
      return;
    }
    cancelMutation.mutate(cancelReason);
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setCancelReason('');
  };

  // Manual refresh
  const handleManualRefresh = () => {
    refetch();
    showToast('info', 'Refreshing order status...');
  };

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="space-y-3">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="mt-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading order details...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================================================
  // RENDER: ERROR STATE
  // ============================================================================

  if (error) {
    const axiosError = error as AxiosError<any>;
    const errorMessage = axiosError.response?.data?.message || 'Order not found';
    
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Unable to Load Order
                </h2>
                <p className="text-gray-600 mb-6">{errorMessage}</p>
                
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleManualRefresh}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                  <Link
                    to="/"
                    className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================================================
  // RENDER: ORDER NOT FOUND
  // ============================================================================

  if (!order_details) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Order Not Found
                </h2>
                <p className="text-gray-600 mb-6">
                  We couldn't find the order you're looking for.
                </p>
                <Link
                  to="/"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================================================
  // STATUS CONFIGURATION
  // ============================================================================

  const statusColor = getStatusColor(order_details.order_status);
  const statusDisplayName = getStatusDisplayName(order_details.order_status);

  const statusColorClasses = {
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    red: 'bg-red-100 text-red-800 border-red-300',
  };

  const badgeClasses = statusColorClasses[statusColor as keyof typeof statusColorClasses] || statusColorClasses.gray;

  // ============================================================================
  // RENDER: MAIN CONTENT
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Order {order_details.order_number}
                </h1>
                <p className="text-sm text-gray-600">
                  Placed {formatDateTime(order_details.created_at)}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleManualRefresh}
                  disabled={isLoading}
                  className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50"
                  aria-label="Refresh order status"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
                
                <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${badgeClasses}`}>
                  {statusDisplayName}
                </div>
              </div>
            </div>

            {/* Auto-refresh indicator */}
            <div className="flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${autoRefreshEnabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                </div>
                <span className="text-sm text-gray-700">
                  {autoRefreshEnabled ? 'Auto-refreshing every 30 seconds' : 'Auto-refresh paused'}
                </span>
              </div>
              <button
                onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {autoRefreshEnabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Progress</h2>
            
            <div className="space-y-4" role="list" aria-label="Order status timeline">
              {status_history.map((history, index) => {
                const isLatest = index === status_history.length - 1;
                const historyColor = getStatusColor(history.new_status);
                
                return (
                  <div 
                    key={history.history_id} 
                    className="flex gap-4"
                    role="listitem"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isLatest ? 'bg-blue-600 ring-4 ring-blue-100' : historyColor === 'green' ? 'bg-green-500' : 'bg-gray-300'}
                      `}>
                        <CheckCircle className={`w-6 h-6 ${isLatest || historyColor === 'green' ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                      {index < status_history.length - 1 && (
                        <div className="w-0.5 h-full min-h-[40px] bg-gray-200 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 pb-8">
                      <div className="flex items-baseline justify-between gap-4 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {getStatusDisplayName(history.new_status)}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {formatTime(history.changed_at)}
                        </span>
                      </div>
                      {history.notes && (
                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                      )}
                      {history.changed_by_name && (
                        <p className="text-xs text-gray-500 mt-1">
                          Updated by {history.changed_by_name}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Details</h2>
              
              <div className="space-y-4">
                {/* Fulfillment Method */}
                <div className="flex items-start gap-3">
                  {order_details.fulfillment_method === 'delivery' ? (
                    <Truck className="w-5 h-5 text-blue-600 mt-0.5" />
                  ) : (
                    <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Fulfillment Method</p>
                    <p className="text-gray-900 font-medium">
                      {order_details.fulfillment_method === 'delivery' ? 'Delivery' : 'Collection'}
                    </p>
                  </div>
                </div>

                {/* Delivery Address or Collection Location */}
                {order_details.fulfillment_method === 'delivery' ? (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Delivery Address</p>
                      <p className="text-gray-900">{order_details.delivery_address_line1}</p>
                      {order_details.delivery_address_line2 && (
                        <p className="text-gray-900">{order_details.delivery_address_line2}</p>
                      )}
                      <p className="text-gray-900">
                        {order_details.delivery_city}, {order_details.delivery_postal_code}
                      </p>
                      {order_details.delivery_instructions && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Instructions:</span> {order_details.delivery_instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Pickup Location</p>
                      <p className="text-gray-900 font-medium">{order_details.location_name}</p>
                    </div>
                  </div>
                )}

                {/* Estimated Time */}
                {order_details.estimated_ready_time && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">
                        {order_details.fulfillment_method === 'delivery' ? 'Estimated Delivery' : 'Estimated Ready Time'}
                      </p>
                      <p className="text-gray-900 font-medium">
                        {formatDateTime(order_details.estimated_ready_time)}
                      </p>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        {getTimeRemaining(order_details.estimated_ready_time)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Special Instructions */}
                {order_details.special_instructions && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">Special Instructions</p>
                      <p className="text-gray-900">{order_details.special_instructions}</p>
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-500 mb-3">Customer Contact</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${order_details.customer_phone}`} className="text-blue-600 hover:text-blue-700">
                        {order_details.customer_phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${order_details.customer_email}`} className="text-blue-600 hover:text-blue-700">
                        {order_details.customer_email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Collection Code (if ready for pickup) */}
            {order_details.fulfillment_method === 'collection' && order_details.collection_code && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 lg:p-8 border-2 border-green-200">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 mb-4">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Your Collection Code
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Show this code when collecting your order
                  </p>
                  
                  <div className="bg-white rounded-lg p-6 mb-4 border-2 border-green-300">
                    <p className="text-4xl font-bold text-green-700 tracking-wider">
                      {order_details.collection_code}
                    </p>
                  </div>
                  
                  <img 
                    src={generateQRCodeDataURL(order_details.collection_code)} 
                    alt={`QR code for collection: ${order_details.collection_code}`}
                    className="mx-auto w-48 h-48 bg-white p-2 rounded-lg border border-gray-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Items & Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
            
            <div className="space-y-4 mb-6">
              {order_items.map((item) => (
                <div 
                  key={item.item_id} 
                  className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity} × €{Number(item.price_at_purchase || 0).toFixed(2)}
                    </p>
                    {item.product_specific_notes && (
                      <p className="text-sm text-gray-500 mt-1">
                        Note: {item.product_specific_notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      €{Number(item.subtotal || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="border-t-2 border-gray-200 pt-6 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>€{Number(order_details.subtotal || 0).toFixed(2)}</span>
              </div>
              
              {Number(order_details.delivery_fee || 0) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>€{Number(order_details.delivery_fee || 0).toFixed(2)}</span>
                </div>
              )}
              
              {Number(order_details.discount_amount || 0) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-€{Number(order_details.discount_amount || 0).toFixed(2)}</span>
                </div>
              )}
              
              {Number(order_details.tax_amount || 0) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>€{Number(order_details.tax_amount || 0).toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>€{Number(order_details.total_amount || 0).toFixed(2)}</span>
              </div>

              {Number(order_details.loyalty_points_earned || 0) > 0 && (
                <div className="flex justify-between text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg">
                  <span>Loyalty Points Earned</span>
                  <span className="font-semibold">+{Number(order_details.loyalty_points_earned || 0).toFixed(0)} points</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {can_cancel_order && (
              <button
                onClick={handleCancelClick}
                disabled={cancelMutation.isPending}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            
            <Link
              to="/"
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
            >
              Back to Home
            </Link>
            
            {currentUser && (
              <Link
                to="/account?tab=orders"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center"
              >
                View All Orders
              </Link>
            )}
          </div>

          {/* Support Section */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6 lg:p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={`tel:${order_details.customer_phone}`}
                className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Call Us</p>
                  <p className="text-sm text-gray-600">{order_details.customer_phone}</p>
                </div>
              </a>
              
              <a
                href={`mailto:${order_details.customer_email}`}
                className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email Us</p>
                  <p className="text-sm text-gray-600">{order_details.customer_email}</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleCancelModalClose}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="cancel-modal-title"
            aria-describedby="cancel-modal-description"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 id="cancel-modal-title" className="text-xl font-bold text-gray-900">
                Cancel Order?
              </h3>
              <button
                onClick={handleCancelModalClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <p id="cancel-modal-description" className="text-gray-600 mb-4">
              Are you sure you want to cancel order {order_details.order_number}? This action cannot be undone.
            </p>
            
            <div className="mb-6">
              <label htmlFor="cancel-reason" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation <span className="text-red-500">*</span>
              </label>
              <textarea
                id="cancel-reason"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                required
                placeholder="Please tell us why you're cancelling..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={handleCancelModalClose}
                disabled={cancelMutation.isPending}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelConfirm}
                disabled={cancelMutation.isPending || !cancelReason.trim()}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Cancelling...
                  </span>
                ) : (
                  'Cancel Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_OrderTracking;