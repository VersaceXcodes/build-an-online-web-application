import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Phone, 
  Mail, 
  MapPin, 
  Printer,
  X,
  Truck,
  ShoppingBag
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
  order_type: string;
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
  payment_method: string;
  payment_status: string;
  collection_code: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  items?: OrderItem[];
  status_history?: StatusHistoryEntry[];
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

interface StatusHistoryEntry {
  history_id: string;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by_user_id: string | null;
  changed_by_name: string | null;
  notes: string | null;
  changed_at: string;
}

interface OrderCounts {
  awaiting_confirmation: number;
  in_preparation: number;
  ready_collection: number;
  out_for_delivery: number;
  completed_today: number;
}

interface FetchOrdersParams {
  location_name?: string;
  order_status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  fulfillment_method?: string;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

interface UpdateStatusPayload {
  order_status: string;
  notes?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchOrders = async (params: FetchOrdersParams, token: string): Promise<{ data: Order[]; total: number }> => {
  const queryParams = new URLSearchParams();
  
  if (params.location_name) queryParams.append('location_name', params.location_name);
  if (params.order_status) queryParams.append('order_status', params.order_status);
  if (params.date_from) queryParams.append('date_from', params.date_from);
  if (params.date_to) queryParams.append('date_to', params.date_to);
  if (params.search) queryParams.append('search', params.search);
  if (params.fulfillment_method) queryParams.append('fulfillment_method', params.fulfillment_method);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);

  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/orders?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const fetchOrderDetails = async (order_id: string, token: string): Promise<Order> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/orders/${order_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const updateOrderStatus = async (
  order_id: string,
  payload: UpdateStatusPayload,
  token: string
): Promise<Order> => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/orders/${order_id}/status`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const isToday = (dateString: string | null): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isOrderLate = (order: Order): boolean => {
  const now = Date.now();
  const created = new Date(order.created_at).getTime();
  const minutesSinceCreated = (now - created) / (1000 * 60);

  // Late thresholds
  if (order.order_status === 'payment_confirmed' && minutesSinceCreated > 15) return true;
  if (order.order_status === 'preparing' && minutesSinceCreated > 30) return true;
  
  return false;
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IE', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-IE', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
};

const getStatusColor = (status: string): string => {
  const colors: { [key: string]: string } = {
    'payment_confirmed': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'preparing': 'bg-blue-100 text-blue-800 border-blue-200',
    'ready_for_collection': 'bg-green-100 text-green-800 border-green-200',
    'out_for_delivery': 'bg-blue-100 text-blue-800 border-blue-200',
    'completed': 'bg-gray-100 text-gray-800 border-gray-200',
    'cancelled': 'bg-red-100 text-red-800 border-red-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getStatusDisplayName = (status: string): string => {
  const names: { [key: string]: string } = {
    'payment_confirmed': 'Awaiting Confirmation',
    'preparing': 'In Preparation',
    'ready_for_collection': 'Ready for Pickup',
    'out_for_delivery': 'Out for Delivery',
    'completed': 'Completed',
    'cancelled': 'Cancelled',
  };
  return names[status] || status;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_StaffDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // ========================================
  // ZUSTAND STATE ACCESS (Individual Selectors - CRITICAL)
  // ========================================
  
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);

  // ========================================
  // LOCAL STATE
  // ========================================

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusUpdateNotes, setStatusUpdateNotes] = useState('');
  const [selectedNewStatus, setSelectedNewStatus] = useState<string>('');

  // Extract URL params
  const statusFilter = searchParams.get('status') || null;
  const locationFilter = searchParams.get('location') || null;
  const dateFilter = searchParams.get('date') || 'today';
  const fulfillmentFilter = searchParams.get('fulfillment') || null;
  const searchQuery = searchParams.get('search') || '';

  // ========================================
  // DEFINE ASSIGNED LOCATIONS
  // ========================================
  
  // Get assigned locations from user data (fetched from backend staff_assignments table)
  const assignedLocations = useMemo(() => {
    // Check if user has assigned_locations from backend
    if (currentUser && 'assigned_locations' in currentUser && Array.isArray((currentUser as any).assigned_locations)) {
      const locations = (currentUser as any).assigned_locations;
      return locations.length > 0 ? locations : ['London Flagship']; // Fallback to London Flagship if no assignments
    }
    
    // Fallback for users without assigned_locations (shouldn't happen for staff)
    return ['London Flagship'];
  }, [currentUser]);

  // Current location filter - default to first assigned location
  const currentLocationFilter = locationFilter || assignedLocations[0];

  // ========================================
  // CALCULATE DATE RANGE
  // ========================================

  const { dateFrom, dateTo } = useMemo(() => {
    const now = new Date();
    let from: string;
    let to: string = now.toISOString();

    if (dateFilter === 'today') {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      from = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString();
      to = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59).toISOString();
    } else if (dateFilter === 'last_7_days') {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    }

    return { dateFrom: from, dateTo: to };
  }, [dateFilter]);

  // ========================================
  // FETCH ORDERS WITH REACT QUERY
  // ========================================

  const {
    data: ordersResponse,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['staff-orders', currentLocationFilter, statusFilter, dateFrom, dateTo, searchQuery, fulfillmentFilter],
    queryFn: () => fetchOrders(
      {
        location_name: currentLocationFilter,
        // Don't send 'ready_out' to API - filter client-side instead
        order_status: (statusFilter && statusFilter !== 'ready_out') ? statusFilter : undefined,
        date_from: dateFrom,
        date_to: dateTo,
        search: searchQuery || undefined,
        fulfillment_method: fulfillmentFilter || undefined,
        limit: 50,
        sort_by: 'created_at',
        sort_order: 'asc'
      },
      authToken || ''
    ),
    enabled: !!authToken && !!currentLocationFilter,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 0, // Always treat as stale for real-time updates
  });

  const ordersList = ordersResponse?.data || [];

  // ========================================
  // CALCULATE ORDER COUNTS
  // ========================================

  const orderCounts: OrderCounts = useMemo(() => {
    return {
      awaiting_confirmation: ordersList.filter(o => o.order_status === 'payment_confirmed').length,
      in_preparation: ordersList.filter(o => o.order_status === 'preparing').length,
      ready_collection: ordersList.filter(o => o.order_status === 'ready_for_collection').length,
      out_for_delivery: ordersList.filter(o => o.order_status === 'out_for_delivery').length,
      completed_today: ordersList.filter(o => 
        o.order_status === 'completed' && isToday(o.completed_at)
      ).length,
    };
  }, [ordersList]);

  // ========================================
  // CALCULATE LATE ORDERS
  // ========================================

  const lateOrdersCount = useMemo(() => {
    return ordersList.filter(isOrderLate).length;
  }, [ordersList]);

  // ========================================
  // FETCH ORDER DETAILS
  // ========================================

  const {
    data: selectedOrderDetail,
    isLoading: isLoadingDetail,
  } = useQuery({
    queryKey: ['order-detail', selectedOrderId],
    queryFn: () => fetchOrderDetails(selectedOrderId!, authToken || ''),
    enabled: !!selectedOrderId && !!authToken,
  });

  // ========================================
  // UPDATE ORDER STATUS MUTATION
  // ========================================

  const updateStatusMutation = useMutation({
    mutationFn: ({ order_id, payload }: { order_id: string; payload: UpdateStatusPayload }) =>
      updateOrderStatus(order_id, payload, authToken || ''),
    onSuccess: (updatedOrder) => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['staff-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-detail', updatedOrder.order_id] });
      
      showToast('success', `Order status updated to ${getStatusDisplayName(updatedOrder.order_status)}`);
      
      // Reset status update form
      setSelectedNewStatus('');
      setStatusUpdateNotes('');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update order status');
    },
  });

  // ========================================
  // HANDLERS
  // ========================================

  const handleFilterChange = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    setSearchParams(newParams);
  };

  const handleViewOrderDetails = (order_id: string) => {
    setSelectedOrderId(order_id);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrderId(null);
    setSelectedNewStatus('');
    setStatusUpdateNotes('');
  };

  const handleUpdateStatus = () => {
    if (!selectedOrderId || !selectedNewStatus) return;

    updateStatusMutation.mutate({
      order_id: selectedOrderId,
      payload: {
        order_status: selectedNewStatus,
        notes: statusUpdateNotes || undefined,
      },
    });
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const handleQuickStatusUpdate = (order_id: string, new_status: string) => {
    updateStatusMutation.mutate({
      order_id,
      payload: {
        order_status: new_status,
      },
    });
  };

  // ========================================
  // STATUS WORKFLOW OPTIONS
  // ========================================

  const getNextStatusOptions = (current_status: string): string[] => {
    const workflows: { [key: string]: string[] } = {
      'payment_confirmed': ['preparing', 'cancelled'],
      'preparing': ['ready_for_collection', 'out_for_delivery', 'cancelled'],
      'ready_for_collection': ['completed'],
      'out_for_delivery': ['completed', 'failed_delivery'],
    };
    return workflows[current_status] || [];
  };

  // ========================================
  // ACTIVE TAB LOGIC
  // ========================================

  const activeTab = statusFilter === 'payment_confirmed' ? 'awaiting_confirmation'
    : statusFilter === 'preparing' ? 'in_preparation'
    : statusFilter === 'ready_out' ? 'ready_out'
    : statusFilter === 'completed' ? 'completed_today'
    : statusFilter || 'awaiting_confirmation';

  const tabs = [
    { 
      id: 'awaiting_confirmation', 
      label: 'Awaiting Confirmation', 
      count: orderCounts.awaiting_confirmation,
      status_filter: 'payment_confirmed'
    },
    { 
      id: 'in_preparation', 
      label: 'In Preparation', 
      count: orderCounts.in_preparation,
      status_filter: 'preparing'
    },
    { 
      id: 'ready_out', 
      label: 'Ready/Out', 
      count: orderCounts.ready_collection + orderCounts.out_for_delivery,
      status_filter: 'ready_out' // Special filter value to show both ready_for_collection and out_for_delivery
    },
    { 
      id: 'completed_today', 
      label: 'Completed Today', 
      count: orderCounts.completed_today,
      status_filter: 'completed'
    },
  ];

  // ========================================
  // FILTER ORDERS BY ACTIVE TAB
  // ========================================

  const filteredOrders = useMemo(() => {
    // Special handling for ready_out tab - show both ready_for_collection and out_for_delivery
    if (activeTab === 'ready_out' || statusFilter === 'ready_out') {
      return ordersList.filter(o => 
        o.order_status === 'ready_for_collection' || o.order_status === 'out_for_delivery'
      );
    }
    
    const tabConfig = tabs.find(t => t.id === activeTab);
    if (tabConfig?.status_filter && tabConfig.status_filter !== 'ready_out') {
      return ordersList.filter(o => o.order_status === tabConfig.status_filter);
    }
    
    return ordersList;
  }, [ordersList, activeTab, statusFilter]);

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
                <p className="text-sm text-gray-600 mt-1">
                  {currentLocationFilter} - {dateFilter === 'today' ? 'Today' : dateFilter === 'yesterday' ? 'Yesterday' : 'Last 7 Days'}
                </p>
              </div>
              
              <button
                onClick={() => refetchOrders()}
                disabled={isLoadingOrders}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={16} className={isLoadingOrders ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Filters Row */}
            <div className="mt-6 flex flex-wrap gap-4">
              {/* Location Filter */}
              {assignedLocations.length > 1 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select
                    value={currentLocationFilter}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {assignedLocations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <select
                  value={dateFilter}
                  onChange={(e) => handleFilterChange('date', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="last_7_days">Last 7 Days</option>
                </select>
              </div>

              {/* Fulfillment Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fulfillment</label>
                <select
                  value={fulfillmentFilter || 'all'}
                  onChange={(e) => handleFilterChange('fulfillment', e.target.value === 'all' ? null : e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All</option>
                  <option value="collection">Collection</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>

              {/* Search */}
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleFilterChange('search', e.target.value || null)}
                    placeholder="Order number or customer name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {/* Awaiting Confirmation */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-700 text-sm font-medium">Awaiting</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">{orderCounts.awaiting_confirmation}</p>
                </div>
                <Clock size={32} className="text-yellow-600" />
              </div>
            </div>

            {/* In Preparation */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Preparing</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">{orderCounts.in_preparation}</p>
                </div>
                <Package size={32} className="text-blue-600" />
              </div>
            </div>

            {/* Ready for Collection */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Ready</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">{orderCounts.ready_collection}</p>
                </div>
                <ShoppingBag size={32} className="text-green-600" />
              </div>
            </div>

            {/* Out for Delivery */}
            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-700 text-sm font-medium">Out</p>
                  <p className="text-3xl font-bold text-indigo-900 mt-1">{orderCounts.out_for_delivery}</p>
                </div>
                <Truck size={32} className="text-indigo-600" />
              </div>
            </div>

            {/* Completed Today */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{orderCounts.completed_today}</p>
                </div>
                <CheckCircle size={32} className="text-gray-600" />
              </div>
            </div>
          </div>

          {/* Late Orders Alert */}
          {lateOrdersCount > 0 && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-3">
              <AlertTriangle size={24} className="text-red-600 flex-shrink-0" />
              <div>
                <p className="text-red-900 font-semibold">
                  {lateOrdersCount} late {lateOrdersCount === 1 ? 'order' : 'orders'} requiring attention
                </p>
                <p className="text-red-700 text-sm">Orders exceeding expected preparation time</p>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px overflow-x-auto">
                {tabs.map((tab) => {
                  // Check if this tab should be highlighted as active
                  const isActive = activeTab === tab.id || (tab.id === 'ready_out' && statusFilter === 'ready_out');
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleFilterChange('status', tab.status_filter)}
                      className={`
                        whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors
                        ${isActive
                          ? 'border-blue-500 text-blue-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <span className="flex items-center space-x-2">
                        <span>{tab.label}</span>
                        {tab.count > 0 && (
                          <span className={`
                            inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                            ${isActive
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-700'
                            }
                          `}>
                            {tab.count}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Orders List */}
            <div className="p-6">
              {isLoadingOrders ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse bg-gray-100 h-32 rounded-lg"></div>
                  ))}
                </div>
              ) : ordersError ? (
                <div className="text-center py-12">
                  <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
                  <p className="text-gray-900 font-semibold mb-2">Failed to load orders</p>
                  <p className="text-gray-600 text-sm mb-4">Please try refreshing the page</p>
                  <button
                    onClick={() => refetchOrders()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-900 font-semibold mb-2">No orders found</p>
                  <p className="text-gray-600 text-sm">
                    {searchQuery ? 'Try adjusting your search or filters' : 'New orders will appear here'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => {
                    const isLate = isOrderLate(order);
                    
                    return (
                      <div
                        key={order.order_id}
                        className={`
                          bg-white border-2 rounded-xl p-6 transition-all hover:shadow-md cursor-pointer
                          ${isLate ? 'border-red-300 bg-red-50' : 'border-gray-200'}
                        `}
                        onClick={() => handleViewOrderDetails(order.order_id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {/* Order Header */}
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="text-lg font-bold text-gray-900">
                                {order.order_number}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.order_status)}`}>
                                {getStatusDisplayName(order.order_status)}
                              </span>
                              {isLate && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 flex items-center space-x-1">
                                  <AlertTriangle size={12} />
                                  <span>LATE</span>
                                </span>
                              )}
                            </div>

                            {/* Customer Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center space-x-2 text-gray-700">
                                <span className="font-medium">Customer:</span>
                                <span>{order.customer_name}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-gray-700">
                                <Phone size={14} />
                                <span>{order.customer_phone}</span>
                              </div>
                            </div>

                            {/* Fulfillment Method */}
                            <div className="flex items-center space-x-4 text-sm">
                              <span className={`
                                px-3 py-1 rounded-lg font-medium
                                ${order.fulfillment_method === 'delivery' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-green-100 text-green-800'
                                }
                              `}>
                                {order.fulfillment_method === 'delivery' ? (
                                  <span className="flex items-center space-x-1">
                                    <Truck size={14} />
                                    <span>Delivery</span>
                                  </span>
                                ) : (
                                  <span className="flex items-center space-x-1">
                                    <ShoppingBag size={14} />
                                    <span>Collection</span>
                                  </span>
                                )}
                              </span>
                              <span className="text-gray-600">
                                €{Number(order.total_amount || 0).toFixed(2)}
                              </span>
                              <span className="text-gray-600">
                                {formatTime(order.created_at)}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex flex-col space-y-2 ml-4">
                            {order.order_status === 'payment_confirmed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickStatusUpdate(order.order_id, 'preparing');
                                }}
                                disabled={updateStatusMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                              >
                                Accept
                              </button>
                            )}
                            
                            {order.order_status === 'preparing' && order.fulfillment_method === 'collection' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickStatusUpdate(order.order_id, 'ready_for_collection');
                                }}
                                disabled={updateStatusMutation.isPending}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                              >
                                Mark Ready
                              </button>
                            )}
                            
                            {order.order_status === 'preparing' && order.fulfillment_method === 'delivery' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickStatusUpdate(order.order_id, 'out_for_delivery');
                                }}
                                disabled={updateStatusMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50"
                              >
                                Out for Delivery
                              </button>
                            )}
                            
                            {(order.order_status === 'ready_for_collection' || order.order_status === 'out_for_delivery') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickStatusUpdate(order.order_id, 'completed');
                                }}
                                disabled={updateStatusMutation.isPending}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                              >
                                Complete
                              </button>
                            )}
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewOrderDetails(order.order_id);
                              }}
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Detail Modal */}
        {isDetailModalOpen && selectedOrderId && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                onClick={handleCloseDetailModal}
              ></div>

              {/* Modal */}
              <div className="relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                {isLoadingDetail ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading order details...</p>
                  </div>
                ) : selectedOrderDetail ? (
                  <>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {selectedOrderDetail.order_number}
                          </h2>
                          <p className="text-blue-100 text-sm mt-1">
                            {formatDateTime(selectedOrderDetail.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={handlePrintOrder}
                            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                            title="Print Order"
                          >
                            <Printer size={20} className="text-white" />
                          </button>
                          <button
                            onClick={handleCloseDetailModal}
                            className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                          >
                            <X size={20} className="text-white" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <span className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getStatusColor(selectedOrderDetail.order_status)} bg-white`}>
                          {getStatusDisplayName(selectedOrderDetail.order_status)}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                      {/* Customer Contact */}
                      <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Mail size={18} className="text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Email</p>
                              <p className="text-sm font-medium text-gray-900">{selectedOrderDetail.customer_email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Phone size={18} className="text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Phone</p>
                              <a 
                                href={`tel:${selectedOrderDetail.customer_phone}`}
                                className="text-sm font-medium text-blue-600 hover:underline"
                              >
                                {selectedOrderDetail.customer_phone}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fulfillment Details */}
                      <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          {selectedOrderDetail.fulfillment_method === 'delivery' ? 'Delivery Details' : 'Collection Details'}
                        </h3>
                        
                        {selectedOrderDetail.fulfillment_method === 'delivery' ? (
                          <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <MapPin size={18} className="text-gray-600 mt-1 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{selectedOrderDetail.delivery_address_line1}</p>
                                {selectedOrderDetail.delivery_address_line2 && (
                                  <p className="text-sm text-gray-700">{selectedOrderDetail.delivery_address_line2}</p>
                                )}
                                <p className="text-sm text-gray-700">
                                  {selectedOrderDetail.delivery_city}, {selectedOrderDetail.delivery_postal_code}
                                </p>
                              </div>
                            </div>
                            
                            {selectedOrderDetail.delivery_instructions && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-xs font-semibold text-yellow-800 mb-1">Delivery Instructions</p>
                                <p className="text-sm text-yellow-900">{selectedOrderDetail.delivery_instructions}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-gray-700">
                              Customer will collect from {selectedOrderDetail.location_name}
                            </p>
                            {selectedOrderDetail.collection_code && (
                              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                                <p className="text-xs font-semibold text-green-800 mb-2">Collection Code</p>
                                <p className="text-3xl font-bold text-green-900 tracking-wider">
                                  {selectedOrderDetail.collection_code}
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {selectedOrderDetail.special_instructions && (
                          <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                            <p className="text-xs font-semibold text-orange-800 mb-1">Special Instructions</p>
                            <p className="text-sm text-orange-900">{selectedOrderDetail.special_instructions}</p>
                          </div>
                        )}
                      </div>

                      {/* Order Items */}
                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Item
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Qty
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Price
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                  Subtotal
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {selectedOrderDetail.items?.map((item) => (
                                <tr key={item.item_id}>
                                  <td className="px-6 py-4">
                                    <div>
                                      <p className="font-medium text-gray-900">{item.product_name}</p>
                                      {item.product_specific_notes && (
                                        <p className="text-xs text-gray-600 mt-1">{item.product_specific_notes}</p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-center text-gray-900 font-medium">
                                    {item.quantity}
                                  </td>
                                  <td className="px-6 py-4 text-right text-gray-900">
                                    €{Number(item.price_at_purchase || 0).toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 text-right font-medium text-gray-900">
                                    €{Number(item.subtotal || 0).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                              <tr>
                                <td colSpan={3} className="px-6 py-3 text-right font-semibold text-gray-700">
                                  Total
                                </td>
                                <td className="px-6 py-3 text-right font-bold text-gray-900 text-lg">
                                  €{Number(selectedOrderDetail.total_amount || 0).toFixed(2)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Status History */}
                      {selectedOrderDetail.status_history && selectedOrderDetail.status_history.length > 0 && (
                        <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Status History</h3>
                          <div className="space-y-3">
                            {selectedOrderDetail.status_history.map((entry, index) => (
                              <div key={entry.history_id} className="flex items-start space-x-3">
                                <div className={`
                                  w-3 h-3 rounded-full mt-1.5 flex-shrink-0
                                  ${index === selectedOrderDetail.status_history!.length - 1 ? 'bg-blue-600' : 'bg-gray-300'}
                                `}></div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-semibold text-gray-900">{getStatusDisplayName(entry.new_status)}</p>
                                    <p className="text-xs text-gray-600">{formatDateTime(entry.changed_at)}</p>
                                  </div>
                                  {entry.changed_by_name && (
                                    <p className="text-xs text-gray-600 mt-1">By: {entry.changed_by_name}</p>
                                  )}
                                  {entry.notes && (
                                    <p className="text-sm text-gray-700 mt-1">{entry.notes}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Update Status Section */}
                      {getNextStatusOptions(selectedOrderDetail.order_status).length > 0 && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-4">Update Order Status</h3>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Status
                              </label>
                              <select
                                value={selectedNewStatus}
                                onChange={(e) => setSelectedNewStatus(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                              >
                                <option value="">Select new status...</option>
                                {getNextStatusOptions(selectedOrderDetail.order_status).map(status => (
                                  <option key={status} value={status}>
                                    {getStatusDisplayName(status)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes (Optional)
                              </label>
                              <textarea
                                value={statusUpdateNotes}
                                onChange={(e) => setStatusUpdateNotes(e.target.value)}
                                rows={3}
                                placeholder="Add notes about this status change..."
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                              />
                            </div>

                            <button
                              onClick={handleUpdateStatus}
                              disabled={!selectedNewStatus || updateStatusMutation.isPending}
                              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {updateStatusMutation.isPending ? (
                                <span className="flex items-center justify-center space-x-2">
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                  <span>Updating...</span>
                                </span>
                              ) : (
                                'Update Status'
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                      <button
                        onClick={handleCloseDetailModal}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-gray-600">Order not found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Print-only Order Ticket */}
        {selectedOrderDetail && (
          <div className="hidden print:block print:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Kake</h1>
                <p className="text-xl font-semibold mt-2">{selectedOrderDetail.location_name}</p>
                <p className="text-lg mt-1">ORDER TICKET</p>
              </div>

              <div className="border-t-2 border-b-2 border-black py-4 mb-6">
                <p className="text-2xl font-bold text-center">{selectedOrderDetail.order_number}</p>
                <p className="text-center mt-1">{formatDateTime(selectedOrderDetail.created_at)}</p>
              </div>

              <div className="mb-6">
                <p className="font-bold mb-2">Customer: {selectedOrderDetail.customer_name}</p>
                <p>Phone: {selectedOrderDetail.customer_phone}</p>
                <p className="mt-2 font-semibold">
                  {selectedOrderDetail.fulfillment_method === 'delivery' ? 'DELIVERY' : 'COLLECTION'}
                </p>
              </div>

              {selectedOrderDetail.fulfillment_method === 'delivery' && (
                <div className="mb-6">
                  <p className="font-bold mb-2">Delivery Address:</p>
                  <p>{selectedOrderDetail.delivery_address_line1}</p>
                  {selectedOrderDetail.delivery_address_line2 && <p>{selectedOrderDetail.delivery_address_line2}</p>}
                  <p>{selectedOrderDetail.delivery_city}, {selectedOrderDetail.delivery_postal_code}</p>
                  {selectedOrderDetail.delivery_instructions && (
                    <p className="mt-2 italic">Instructions: {selectedOrderDetail.delivery_instructions}</p>
                  )}
                </div>
              )}

              <div className="mb-6">
                <p className="font-bold mb-3 text-lg">ITEMS:</p>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black">
                      <th className="text-left pb-2">Item</th>
                      <th className="text-center pb-2">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrderDetail.items?.map((item) => (
                      <tr key={item.item_id} className="border-b border-gray-300">
                        <td className="py-2">
                          <p className="font-medium">{item.product_name}</p>
                          {item.product_specific_notes && (
                            <p className="text-sm italic">Note: {item.product_specific_notes}</p>
                          )}
                        </td>
                        <td className="text-center py-2 font-bold">{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedOrderDetail.special_instructions && (
                <div className="mb-6 border-2 border-black p-4">
                  <p className="font-bold mb-2">SPECIAL INSTRUCTIONS:</p>
                  <p className="text-lg">{selectedOrderDetail.special_instructions}</p>
                </div>
              )}

              <div className="text-center mt-8 pt-6 border-t-2 border-black">
                <p className="text-sm">Thank you for choosing Kake!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_StaffDashboard;