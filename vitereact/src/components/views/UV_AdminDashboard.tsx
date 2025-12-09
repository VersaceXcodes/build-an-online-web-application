import React, { useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Clock,
  AlertTriangle,
  Download,
  RefreshCw,
  BarChart3,
  Users,
  Package,
  Calendar
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface DashboardMetrics {
  today_orders_count: number;
  today_revenue: number;
  this_week_orders_count: number;
  this_week_revenue: number;
  this_month_orders_count: number;
  this_month_revenue: number;
  active_orders_count: number;
  orders_by_status: {
    [key: string]: number;
  };
  orders_by_location: {
    [key: string]: number;
  };
  top_products: Array<{
    product_name: string;
    quantity_sold: number;
    revenue: number;
  }>;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchDashboardMetrics = async (
  token: string,
  date_range: string,
  start_date: string | null,
  end_date: string | null,
  location: string
): Promise<DashboardMetrics> => {
  const params: any = { date_range };
  
  if (date_range === 'custom' && start_date && end_date) {
    params.start_date = start_date;
    params.end_date = end_date;
  }
  
  if (location !== 'all') {
    params.location = location;
  }

  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/analytics/dashboard`,
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

const exportDashboardReport = async (
  token: string,
  report_type: string,
  date_from: string | null,
  date_to: string | null,
  location: string,
  format: string
): Promise<Blob> => {
  const params: any = { report_type, format };
  
  if (date_from) params.date_from = date_from;
  if (date_to) params.date_to = date_to;
  if (location !== 'all') params.location = location;

  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/analytics/reports`,
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    }
  );

  return response.data;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminDashboard: React.FC = () => {
  // ==================================
  // ZUSTAND STATE ACCESS (Individual Selectors - CRITICAL!)
  // ==================================
  
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const showToast = useAppStore(state => state.show_toast);
  const showLoading = useAppStore(state => state.show_loading);
  const hideLoading = useAppStore(state => state.hide_loading);

  // ==================================
  // URL PARAMS STATE
  // ==================================
  
  const [searchParams, setSearchParams] = useSearchParams();
  
  const date_range = searchParams.get('date_range') || 'this_week';
  const start_date = searchParams.get('start_date') || null;
  const end_date = searchParams.get('end_date') || null;
  const location_filter = searchParams.get('location') || 'all';

  // ==================================
  // REACT QUERY - DASHBOARD METRICS
  // ==================================
  
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ['dashboard-metrics', date_range, start_date, end_date, location_filter],
    queryFn: () => fetchDashboardMetrics(
      authToken!,
      date_range,
      start_date,
      end_date,
      location_filter
    ),
    enabled: !!authToken,
    staleTime: 60000, // 1 minute
    refetchInterval: 60000, // Auto-refresh every minute
  });

  // ==================================
  // COMPUTED VALUES
  // ==================================
  
  const ordersByStatus = useMemo(() => {
    return metrics?.orders_by_status || {};
  }, [metrics]);

  const ordersByLocation = useMemo(() => {
    return metrics?.orders_by_location || {};
  }, [metrics]);

  const topProducts = useMemo(() => {
    return metrics?.top_products || [];
  }, [metrics]);

  // Calculate operational alerts
  const operationalAlerts = useMemo(() => {
    const lateOrders = ordersByStatus['paid_awaiting_confirmation'] || 0;
    return {
      late_orders_count: lateOrders,
      inventory_alerts_pending: 0, // Would come from separate endpoint
      staff_feedback_pending: 0, // Would come from separate endpoint
    };
  }, [ordersByStatus]);

  // ==================================
  // EVENT HANDLERS
  // ==================================
  
  const handleDateRangeChange = (range: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('date_range', range);
    
    // Clear custom dates if not custom range
    if (range !== 'custom') {
      newParams.delete('start_date');
      newParams.delete('end_date');
    }
    
    setSearchParams(newParams);
  };

  const handleLocationChange = (location: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('location', location);
    setSearchParams(newParams);
  };

  const handleExportReport = async (format: 'csv' | 'pdf') => {
    if (!authToken) return;
    
    try {
      showLoading('Generating report...');
      
      const blob = await exportDashboardReport(
        authToken,
        'daily_sales',
        start_date,
        end_date,
        location_filter,
        format
      );
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dashboard-report-${date_range}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      hideLoading();
      showToast('success', 'Report downloaded successfully');
    } catch (error) {
      hideLoading();
      showToast('error', 'Failed to download report');
      console.error('Export error:', error);
    }
  };

  const handleManualRefresh = () => {
    refetchMetrics();
    showToast('info', 'Dashboard refreshed');
  };

  // ==================================
  // HELPER FUNCTIONS
  // ==================================
  
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-IE').format(num);
  };

  // ==================================
  // RENDER
  // ==================================
  
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Title */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Welcome back, {currentUser?.first_name}. Here's what's happening with your business.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleManualRefresh}
                  disabled={metricsLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${metricsLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                
                <button
                  onClick={() => handleExportReport('csv')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
                
                <button
                  onClick={() => handleExportReport('pdf')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Filters Section */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              {/* Date Range Filter */}
              <div className="flex-1">
                <label htmlFor="date-range" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  id="date-range"
                  value={date_range}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                >
                  <option value="today">Today</option>
                  <option value="this_week">This Week</option>
                  <option value="this_month">This Month</option>
                  <option value="last_month">Last Month</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="flex-1">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  id="location"
                  value={location_filter}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                >
                  <option value="all">All Locations</option>
                  <option value="blanchardstown">Blanchardstown</option>
                  <option value="tallaght">Tallaght</option>
                  <option value="glasnevin">Glasnevin</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Error State */}
          {metricsError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    Failed to load dashboard metrics. Please try again.
                  </p>
                  <button
                    onClick={() => refetchMetrics()}
                    className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Today's Orders */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                  {metricsLoading ? (
                    <div className="mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {formatNumber(metrics?.today_orders_count || 0)}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Today's Revenue */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                  {metricsLoading ? (
                    <div className="mt-2 h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {formatCurrency(metrics?.today_revenue || 0)}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            {/* This Week */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  {metricsLoading ? (
                    <div className="mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <>
                      <p className="mt-2 text-3xl font-bold text-gray-900">
                        {formatNumber(metrics?.this_week_orders_count || 0)}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {formatCurrency(metrics?.this_week_revenue || 0)}
                      </p>
                    </>
                  )}
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Active Orders */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Orders</p>
                  {metricsLoading ? (
                    <div className="mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <p className="mt-2 text-3xl font-bold text-gray-900">
                      {formatNumber(metrics?.active_orders_count || 0)}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">In progress</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Orders by Status Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Orders by Status */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
              
              {metricsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(ordersByStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'paid_awaiting_confirmation' ? 'bg-yellow-500' :
                          status === 'accepted_in_preparation' ? 'bg-blue-500' :
                          status === 'ready_for_collection' ? 'bg-green-500' :
                          status === 'out_for_delivery' ? 'bg-purple-500' :
                          'bg-gray-400'
                        }`}></div>
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                  
                  {Object.keys(ordersByStatus).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No active orders</p>
                  )}
                </div>
              )}
            </div>

            {/* Orders by Location */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Location</h3>
              
              {metricsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(ordersByLocation).map(([location, count]) => (
                    <div key={location} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 capitalize">{location}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">{count}</span>
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${(count / (metrics?.today_orders_count || 1)) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {Object.keys(ordersByLocation).length === 0 && (
                    <p className="text-center text-gray-500 py-8">No location data</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Top Products Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            
            {metricsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.product_name}</p>
                        <p className="text-sm text-gray-500">{formatNumber(product.quantity_sold)} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))}
                
                {topProducts.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No product sales data</p>
                )}
              </div>
            )}
          </div>

          {/* Operational Alerts Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Operational Alerts</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Late Orders */}
              <Link 
                to="/admin/orders?status=paid_awaiting_confirmation"
                className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg hover:bg-yellow-100 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Late Orders</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">
                      {operationalAlerts.late_orders_count}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </Link>

              {/* Inventory Alerts */}
              <Link 
                to="/admin/inventory/alerts?status=pending"
                className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg hover:bg-red-100 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-800">Inventory Alerts</p>
                    <p className="text-2xl font-bold text-red-900 mt-1">
                      {operationalAlerts.inventory_alerts_pending}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </Link>

              {/* Staff Feedback */}
              <Link 
                to="/admin/staff-feedback?status=pending"
                className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg hover:bg-blue-100 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Staff Feedback</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {operationalAlerts.staff_feedback_pending}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </Link>
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/admin/orders"
                className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all"
              >
                <ShoppingCart className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium text-blue-900">Manage Orders</span>
              </Link>

              <Link
                to="/admin/products"
                className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all"
              >
                <Package className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium text-green-900">Products</span>
              </Link>

              <Link
                to="/admin/users"
                className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all"
              >
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium text-purple-900">Users</span>
              </Link>

              <Link
                to="/admin/reports"
                className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all"
              >
                <BarChart3 className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium text-orange-900">Reports</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_AdminDashboard;