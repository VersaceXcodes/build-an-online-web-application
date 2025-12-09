import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useAppStore } from '@/store/main';
import { 
  Search, 
  Filter, 
  Download, 
  X, 
  Eye, 
  RefreshCw, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  DollarSign,
  User,
  MapPin,
  Calendar,
  Phone,
  Mail,
  CreditCard,
  FileText,
  ChevronRight,
  ChevronDown,
  Edit,
  RotateCcw
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Order {
  order_id: string;
  order_number: string;
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
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  tax_amount: string;
  total_amount: string;
  loyalty_points_used: string;
  loyalty_points_earned: string;
  promo_code: string | null;
  payment_method: string;
  payment_status: string;
  payment_transaction_id: string | null;
  card_last_four: string | null;
  event_date: string | null;
  guest_count: string | null;
  event_type: string | null;
  company_name: string | null;
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
  price_at_purchase: string;
  quantity: string;
  subtotal: string;
  product_specific_notes: string | null;
}

interface OrderStatusHistory {
  history_id: string;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by_user_id: string | null;
  changed_by_name?: string | null;
  notes: string | null;
  changed_at: string;
}

interface Refund {
  refund_id: string;
  order_id: string;
  refund_amount: string;
  refund_type: 'full' | 'partial';
  refund_reason: string;
  refund_items: string | null;
  payment_transaction_id: string | null;
  processed_by_user_id: string;
  status: string;
  processed_at: string | null;
  created_at: string;
}

interface OrdersResponse {
  data: Order[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

interface OrderDetailResponse {
  order_id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  location_name: string;
  order_type: string;
  fulfillment_method: string;
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
  subtotal: string;
  delivery_fee: string;
  discount_amount: string;
  tax_amount: string;
  total_amount: string;
  loyalty_points_used: string;
  loyalty_points_earned: string;
  promo_code: string | null;
  payment_method: string;
  payment_status: string;
  payment_transaction_id: string | null;
  card_last_four: string | null;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchOrders = async (params: {
  query?: string;
  location_name?: string;
  order_status?: string;
  fulfillment_method?: string;
  date_from?: string;
  date_to?: string;
  limit: number;
  offset: number;
  sort_by: string;
  sort_order: string;
  token: string;
}): Promise<OrdersResponse> => {
  const { token, ...queryParams } = params;
  
  const response = await axios.get<OrdersResponse>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/orders`,
    {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

const fetchOrderDetail = async (order_id: string, token: string): Promise<OrderDetailResponse> => {
  const response = await axios.get<OrderDetailResponse>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/orders/${order_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

const updateOrderStatus = async (data: {
  order_id: string;
  order_status: string;
  notes?: string;
  token: string;
}): Promise<Order> => {
  const { token, order_id, ...body } = data;
  
  const response = await axios.put<Order>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/orders/${order_id}/status`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

const exportOrdersCSV = async (params: {
  report_type: string;
  format: string;
  location?: string;
  date_from?: string;
  date_to?: string;
  token: string;
}): Promise<Blob> => {
  const { token, ...queryParams } = params;
  
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/analytics/reports`,
    {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    }
  );
  
  return response.data;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatCurrency = (value: string | number): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `€${num.toFixed(2)}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'pending_payment': 'bg-gray-100 text-gray-800',
    'payment_confirmed': 'bg-yellow-100 text-yellow-800',
    'preparing': 'bg-blue-100 text-blue-800',
    'ready_for_collection': 'bg-green-100 text-green-800',
    'out_for_delivery': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-gray-100 text-gray-800',
    'delivered': 'bg-green-100 text-green-800',
    'collected': 'bg-green-100 text-green-800',
    'refunded': 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusIcon = (status: string) => {
  const icons: { [key: string]: React.ReactNode } = {
    'pending_payment': <Clock className="w-4 h-4" />,
    'payment_confirmed': <CheckCircle className="w-4 h-4" />,
    'preparing': <Package className="w-4 h-4" />,
    'ready_for_collection': <CheckCircle className="w-4 h-4" />,
    'out_for_delivery': <Truck className="w-4 h-4" />,
    'delivered': <CheckCircle className="w-4 h-4" />,
    'collected': <CheckCircle className="w-4 h-4" />,
    'completed': <CheckCircle className="w-4 h-4" />,
    'cancelled': <XCircle className="w-4 h-4" />,
    'refunded': <RotateCcw className="w-4 h-4" />,
  };
  return icons[status] || <AlertCircle className="w-4 h-4" />;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminOrders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Zustand store access - CRITICAL: Individual selectors
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const showToast = useAppStore(state => state.show_toast);
  const showConfirmation = useAppStore(state => state.show_confirmation);
  const hideConfirmation = useAppStore(state => state.hide_confirmation);
  
  // URL-driven filter state
  const activeTab = searchParams.get('tab') || 'all';
  const statusFilter = searchParams.get('status') || '';
  const locationFilter = searchParams.get('location') || '';
  const dateFromFilter = searchParams.get('date_from') || '';
  const dateToFilter = searchParams.get('date_to') || '';
  const fulfillmentFilter = searchParams.get('fulfillment') || '';
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  // Local state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchInput, setLocalSearchInput] = useState(searchQuery);
  
  const itemsPerPage = 20;
  
  // Auto-update search query with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchInput !== searchQuery) {
        const newParams = new URLSearchParams(searchParams);
        if (localSearchInput) {
          newParams.set('search', localSearchInput);
        } else {
          newParams.delete('search');
        }
        newParams.set('page', '1'); // Reset to page 1 on search
        setSearchParams(newParams);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [localSearchInput]);
  
  // Build query params for API
  const queryParams = useMemo(() => ({
    query: searchQuery || undefined,
    location_name: locationFilter || undefined,
    order_status: statusFilter || undefined,
    fulfillment_method: fulfillmentFilter || undefined,
    date_from: dateFromFilter || undefined,
    date_to: dateToFilter || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    sort_by: sortBy,
    sort_order: 'desc',
    token: authToken || '',
  }), [searchQuery, locationFilter, statusFilter, fulfillmentFilter, dateFromFilter, dateToFilter, currentPage, sortBy, authToken]);
  
  // Fetch orders list
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['admin-orders', queryParams],
    queryFn: () => fetchOrders(queryParams),
    enabled: !!authToken,
    staleTime: 30000,
    select: (data) => ({
      ...data,
      data: data.data.map(order => ({
        ...order,
        subtotal: Number(order.subtotal || 0),
        delivery_fee: Number(order.delivery_fee || 0),
        discount_amount: Number(order.discount_amount || 0),
        tax_amount: Number(order.tax_amount || 0),
        total_amount: Number(order.total_amount || 0),
        loyalty_points_used: Number(order.loyalty_points_used || 0),
        loyalty_points_earned: Number(order.loyalty_points_earned || 0),
        guest_count: order.guest_count ? Number(order.guest_count) : null,
      }))
    })
  });
  
  // Fetch order details
  const { data: orderDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['order-detail', selectedOrderId],
    queryFn: () => fetchOrderDetail(selectedOrderId!, authToken!),
    enabled: !!selectedOrderId && !!authToken,
    staleTime: 10000,
    select: (data) => ({
      ...data,
      subtotal: Number(data.subtotal || 0),
      delivery_fee: Number(data.delivery_fee || 0),
      discount_amount: Number(data.discount_amount || 0),
      tax_amount: Number(data.tax_amount || 0),
      total_amount: Number(data.total_amount || 0),
      loyalty_points_used: Number(data.loyalty_points_used || 0),
      loyalty_points_earned: Number(data.loyalty_points_earned || 0),
      items: data.items.map(item => ({
        ...item,
        price_at_purchase: Number(item.price_at_purchase || 0),
        quantity: Number(item.quantity || 0),
        subtotal: Number(item.subtotal || 0),
      })),
    })
  });
  
  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { order_id: string; order_status: string; notes?: string; token: string }) =>
      updateOrderStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail', selectedOrderId] });
      showToast('success', 'Order status updated successfully');
    },
    onError: (error: AxiosError<any>) => {
      showToast('error', error.response?.data?.message || 'Failed to update order status');
    },
  });
  
  // Export CSV mutation
  const exportMutation = useMutation({
    mutationFn: (params: {
      report_type: string;
      format: string;
      location?: string;
      date_from?: string;
      date_to?: string;
      token: string;
    }) => exportOrdersCSV(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('success', 'Orders exported successfully');
    },
    onError: (error: AxiosError<any>) => {
      showToast('error', error.response?.data?.message || 'Failed to export orders');
    },
  });
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };
  
  const handleClearFilters = () => {
    setSearchParams({ tab: activeTab });
    setLocalSearchInput('');
  };
  
  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };
  
  const handleViewDetails = (order_id: string) => {
    setSelectedOrderId(order_id);
    setShowDetailPanel(true);
  };
  
  const handleCloseDetailPanel = () => {
    setShowDetailPanel(false);
    setTimeout(() => setSelectedOrderId(null), 300);
  };
  
  const handleStatusUpdate = (newStatus: string, notes?: string) => {
    if (!selectedOrderId || !authToken) return;
    
    showConfirmation({
      title: 'Update Order Status',
      message: `Are you sure you want to change the status to "${newStatus}"?`,
      confirm_text: 'Update Status',
      cancel_text: 'Cancel',
      on_confirm: () => {
        updateStatusMutation.mutate({
          order_id: selectedOrderId,
          order_status: newStatus,
          notes,
          token: authToken,
        });
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      },
      danger_action: false,
    });
  };
  
  const handleOpenRefundModal = () => {
    if (orderDetail) {
      setRefundAmount(orderDetail.total_amount.toString());
      setRefundType('full');
      setRefundReason('');
      setShowRefundModal(true);
    }
  };
  
  const handleProcessRefund = () => {
    // Note: This would need a POST /api/refunds endpoint which is noted as missing
    showToast('warning', 'Refund endpoint not yet implemented');
    setShowRefundModal(false);
  };
  
  const handleExportCSV = () => {
    if (!authToken) return;
    
    exportMutation.mutate({
      report_type: 'orders_export',
      format: 'csv',
      location: locationFilter || undefined,
      date_from: dateFromFilter || undefined,
      date_to: dateToFilter || undefined,
      token: authToken,
    });
  };
  
  // Calculate pagination
  const totalPages = ordersData ? Math.ceil(ordersData.total / itemsPerPage) : 0;
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage and track all orders across locations
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportCSV}
                  disabled={exportMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {exportMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </>
                  )}
                </button>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-orders'] })}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex-1 max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={localSearchInput}
                    onChange={(e) => setLocalSearchInput(e.target.value)}
                    placeholder="Search by order number, customer name, phone, or email..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200 ${
                    showFilters || statusFilter || locationFilter || dateFromFilter || fulfillmentFilter
                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {(statusFilter || locationFilter || dateFromFilter || fulfillmentFilter) && (
                    <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </button>
                {(searchQuery || statusFilter || locationFilter || dateFromFilter || fulfillmentFilter) && (
                  <button
                    onClick={handleClearFilters}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Filter Panel */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="payment_confirmed">Payment Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready_for_collection">Ready for Collection</option>
                    <option value="out_for_delivery">Out for Delivery</option>
                    <option value="delivered">Delivered</option>
                    <option value="collected">Collected</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={locationFilter}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All Locations</option>
                    <option value="Blanchardstown">Blanchardstown</option>
                    <option value="Tallaght">Tallaght</option>
                    <option value="Glasnevin">Glasnevin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fulfillment Method
                  </label>
                  <select
                    value={fulfillmentFilter}
                    onChange={(e) => handleFilterChange('fulfillment', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All Methods</option>
                    <option value="delivery">Delivery</option>
                    <option value="collection">Collection</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Results Summary */}
          {ordersData && (
            <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {ordersData.data.length} of {ordersData.total} orders
              </span>
              {ordersData.total > itemsPerPage && (
                <span>
                  Page {currentPage} of {totalPages}
                </span>
              )}
            </div>
          )}
          
          {/* Orders List */}
          {ordersLoading ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="flex flex-col items-center justify-center">
                <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Loading orders...</p>
              </div>
            </div>
          ) : ordersError ? (
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12">
              <div className="flex flex-col items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-600 font-medium mb-2">Failed to load orders</p>
                <p className="text-gray-600 text-sm">Please try refreshing the page</p>
              </div>
            </div>
          ) : !ordersData || ordersData.data.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
              <div className="flex flex-col items-center justify-center">
                <Package className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium mb-2">No orders found</p>
                <p className="text-gray-500 text-sm">Try adjusting your filters or search criteria</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {ordersData.data.map((order) => (
                <div
                  key={order.order_id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      {/* Order Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900">
                                {order.order_number}
                              </h3>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`}>
                                {getStatusIcon(order.order_status)}
                                {order.order_status.replace(/_/g, ' ')}
                              </span>
                              {order.order_type === 'corporate' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800">
                                  Corporate
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{order.customer_name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                <span>{order.customer_email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <span>{order.customer_phone}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Location</p>
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {order.location_name}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Fulfillment</p>
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                              {order.fulfillment_method === 'delivery' ? (
                                <Truck className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Package className="w-4 h-4 text-gray-400" />
                              )}
                              {order.fulfillment_method === 'delivery' ? 'Delivery' : 'Collection'}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Order Date</p>
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {formatDate(order.created_at)}
                            </div>
                          </div>
                          
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                            <div className="flex items-center gap-1 text-sm font-bold text-gray-900">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              {formatCurrency(order.total_amount)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Payment Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <CreditCard className="w-3 h-3" />
                            Payment: {order.payment_status}
                            {order.card_last_four && ` (•••• ${order.card_last_four})`}
                          </div>
                          {order.promo_code && (
                            <div className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Promo: {order.promo_code}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewDetails(order.order_id)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {ordersData && ordersData.total > itemsPerPage && (
            <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, ordersData.total)} of{' '}
                {ordersData.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Order Detail Slide Panel */}
        {showDetailPanel && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={handleCloseDetailPanel}
              ></div>
              
              {/* Panel */}
              <div className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-3xl">
                  <div className="h-full flex flex-col bg-white shadow-xl">
                    {/* Panel Header */}
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                        <button
                          onClick={handleCloseDetailPanel}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto">
                      {detailLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                      ) : orderDetail ? (
                        <div className="p-6 space-y-6">
                          {/* Order Header */}
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                                  {orderDetail.order_number}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Placed on {formatDate(orderDetail.created_at)}
                                </p>
                              </div>
                              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(orderDetail.order_status)}`}>
                                {getStatusIcon(orderDetail.order_status)}
                                {orderDetail.order_status.replace(/_/g, ' ').toUpperCase()}
                              </span>
                            </div>
                            
                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={handleOpenRefundModal}
                                disabled={orderDetail.payment_status === 'refunded'}
                                className="inline-flex items-center px-4 py-2 border border-orange-300 rounded-lg text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Issue Refund
                              </button>
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleStatusUpdate(e.target.value);
                                  }
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                              >
                                <option value="">Update Status...</option>
                                <option value="payment_confirmed">Payment Confirmed</option>
                                <option value="preparing">Preparing</option>
                                <option value="ready_for_collection">Ready for Collection</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                                <option value="collected">Collected</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Customer Information */}
                          <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Name</p>
                                <p className="text-sm font-medium text-gray-900">{orderDetail.customer_name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                <p className="text-sm font-medium text-gray-900">{orderDetail.customer_email}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Phone</p>
                                <p className="text-sm font-medium text-gray-900">{orderDetail.customer_phone}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Location</p>
                                <p className="text-sm font-medium text-gray-900">{orderDetail.location_name}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Fulfillment Details */}
                          <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Fulfillment Details</h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                {orderDetail.fulfillment_method === 'delivery' ? (
                                  <Truck className="w-5 h-5 text-blue-600" />
                                ) : (
                                  <Package className="w-5 h-5 text-green-600" />
                                )}
                                <span className="text-sm font-medium text-gray-900">
                                  {orderDetail.fulfillment_method === 'delivery' ? 'Delivery' : 'Collection'}
                                </span>
                              </div>
                              
                              {orderDetail.fulfillment_method === 'delivery' && orderDetail.delivery_address_line1 && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                  <p className="text-xs text-gray-500 mb-2">Delivery Address</p>
                                  <p className="text-sm text-gray-900">{orderDetail.delivery_address_line1}</p>
                                  {orderDetail.delivery_address_line2 && (
                                    <p className="text-sm text-gray-900">{orderDetail.delivery_address_line2}</p>
                                  )}
                                  <p className="text-sm text-gray-900">
                                    {orderDetail.delivery_city}, {orderDetail.delivery_postal_code}
                                  </p>
                                  {orderDetail.delivery_instructions && (
                                    <p className="text-xs text-gray-600 mt-2">
                                      Instructions: {orderDetail.delivery_instructions}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {orderDetail.collection_code && (
                                <div className="bg-blue-50 rounded-lg p-4">
                                  <p className="text-xs text-gray-500 mb-1">Collection Code</p>
                                  <p className="text-2xl font-bold text-blue-900">{orderDetail.collection_code}</p>
                                </div>
                              )}
                              
                              {orderDetail.special_instructions && (
                                <div className="bg-yellow-50 rounded-lg p-4">
                                  <p className="text-xs text-gray-500 mb-1">Special Instructions</p>
                                  <p className="text-sm text-gray-900">{orderDetail.special_instructions}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Order Items */}
                          <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                            <div className="space-y-3">
                              {orderDetail.items.map((item) => (
                                <div
                                  key={item.item_id}
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{item.product_name}</p>
                                    <p className="text-sm text-gray-600">
                                      {formatCurrency(item.price_at_purchase)} × {item.quantity}
                                    </p>
                                    {item.product_specific_notes && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Note: {item.product_specific_notes}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-gray-900">{formatCurrency(item.subtotal)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Order Summary */}
                          <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-900">{formatCurrency(orderDetail.subtotal)}</span>
                              </div>
                              {orderDetail.delivery_fee > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Delivery Fee</span>
                                  <span className="font-medium text-gray-900">{formatCurrency(orderDetail.delivery_fee)}</span>
                                </div>
                              )}
                              {orderDetail.discount_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Discount</span>
                                  <span className="font-medium text-green-600">-{formatCurrency(orderDetail.discount_amount)}</span>
                                </div>
                              )}
                              {orderDetail.tax_amount > 0 && (
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">Tax</span>
                                  <span className="font-medium text-gray-900">{formatCurrency(orderDetail.tax_amount)}</span>
                                </div>
                              )}
                              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                <span className="text-gray-900">Total</span>
                                <span className="text-gray-900">{formatCurrency(orderDetail.total_amount)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Payment Information */}
                          <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                                <p className="text-sm font-medium text-gray-900 capitalize">{orderDetail.payment_method}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                                <p className="text-sm font-medium text-gray-900 capitalize">{orderDetail.payment_status}</p>
                              </div>
                              {orderDetail.card_last_four && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Card</p>
                                  <p className="text-sm font-medium text-gray-900">•••• {orderDetail.card_last_four}</p>
                                </div>
                              )}
                              {orderDetail.payment_transaction_id && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                                  <p className="text-sm font-mono text-gray-900">{orderDetail.payment_transaction_id}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Status History */}
                          <div className="border-t border-gray-200 pt-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Status History</h4>
                            <div className="space-y-4">
                              {orderDetail.status_history.map((history, index) => (
                                <div key={history.history_id} className="flex gap-4">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-3 h-3 rounded-full ${
                                      index === orderDetail.status_history.length - 1
                                        ? 'bg-blue-600'
                                        : 'bg-gray-300'
                                    }`}></div>
                                    {index < orderDetail.status_history.length - 1 && (
                                      <div className="w-0.5 h-full bg-gray-300 my-1"></div>
                                    )}
                                  </div>
                                  <div className="flex-1 pb-4">
                                    <div className="flex items-center justify-between mb-1">
                                      <p className="font-medium text-gray-900">
                                        {history.new_status.replace(/_/g, ' ').toUpperCase()}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {formatDate(history.changed_at)}
                                      </p>
                                    </div>
                                    {history.notes && (
                                      <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                                    )}
                                    {history.changed_by_name && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        By: {history.changed_by_name}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-64">
                          <p className="text-gray-500">Failed to load order details</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Refund Modal */}
        {showRefundModal && orderDetail && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setShowRefundModal(false)}
              ></div>
              
              {/* Modal */}
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-6 pt-5 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Process Refund</h3>
                    <button
                      onClick={() => setShowRefundModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refund Type
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="full"
                            checked={refundType === 'full'}
                            onChange={(e) => {
                              setRefundType(e.target.value as 'full');
                              setRefundAmount(orderDetail.total_amount.toString());
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-900">Full Refund</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="partial"
                            checked={refundType === 'partial'}
                            onChange={(e) => {
                              setRefundType(e.target.value as 'partial');
                              setRefundAmount('');
                            }}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-900">Partial Refund</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refund Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          disabled={refundType === 'full'}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Refund Reason *
                      </label>
                      <textarea
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        rows={4}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Enter reason for refund..."
                      />
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-800">
                          <p className="font-medium mb-1">Warning</p>
                          <p>
                            This action will process a refund of {formatCurrency(refundAmount || 0)} to the customer's original payment method.
                            This cannot be undone.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={() => setShowRefundModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessRefund}
                    disabled={!refundReason || !refundAmount || parseFloat(refundAmount) <= 0}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Process Refund
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_AdminOrders;