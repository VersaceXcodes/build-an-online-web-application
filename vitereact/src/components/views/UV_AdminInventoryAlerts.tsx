import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  AlertTriangle, 
  PackageX, 
  Clock, 
  CheckCircle2, 
  X, 
  Filter,
  ChevronDown,
  MapPin,
  Calendar,
  FileText,
  AlertCircle
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS (from Zod schemas)
// ============================================================================

// interface InventoryAlert {
//   alert_id: string;
//   reference_number: string;
//   submitted_by_user_id: string;
//   location_name: string;
//   item_name: string;
//   alert_type: 'low_stock' | 'out_of_stock' | 'quality_issue' | 'expiring_soon';
//   current_quantity: number | null;
//   notes: string | null;
//   priority: 'low' | 'medium' | 'high' | 'urgent';
//   status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved';
//   acknowledged_by_user_id: string | null;
//   acknowledged_at: string | null;
//   resolution_notes: string | null;
//   resolved_by_user_id: string | null;
//   resolved_at: string | null;
//   created_at: string;
//   updated_at: string;
// }

interface AlertFilters {
  location_name: string | null;
  alert_type: string | null;
  status: string | null;
  priority: string | null;
}

interface ResolutionFormData {
  status: 'acknowledged' | 'in_progress' | 'resolved';
  resolution_notes: string | null;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchInventoryAlerts = async (filters: AlertFilters, token: string) => {
  const params = new URLSearchParams();
  
  if (filters.location_name) params.append('location_name', filters.location_name);
  if (filters.alert_type) params.append('alert_type', filters.alert_type);
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  params.append('limit', '50');
  params.append('offset', '0');
  params.append('sort_by', 'created_at');
  params.append('sort_order', 'desc');

  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/inventory/alerts?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return {
    alerts: response.data.data.map((alert: any) => ({
      ...alert,
      current_quantity: alert.current_quantity ? Number(alert.current_quantity) : null
    })),
    total: response.data.total
  };
};

const fetchAlertDetails = async (alert_id: string, token: string) => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/inventory/alerts/${alert_id}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return {
    ...response.data,
    current_quantity: response.data.current_quantity ? Number(response.data.current_quantity) : null
  };
};

const updateAlertStatus = async (
  alert_id: string,
  data: { status: string; resolution_notes?: string | null; priority?: string },
  user_id: string,
  token: string
) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/inventory/alerts/${alert_id}`,
    {
      ...data,
      ...(data.status === 'acknowledged' && { acknowledged_by_user_id: user_id }),
      ...(data.status === 'resolved' && { resolved_by_user_id: user_id })
    },
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

const UV_AdminInventoryAlerts: React.FC = () => {
  // ====================================================================
  // ZUSTAND STORE ACCESS (individual selectors - CRITICAL)
  // ====================================================================
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);

  // ====================================================================
  // URL PARAMETERS & FILTERS
  // ====================================================================
  const [searchParams, setSearchParams] = useSearchParams();
  
  const filters: AlertFilters = useMemo(() => ({
    location_name: searchParams.get('location_name') || null,
    alert_type: searchParams.get('alert_type') || null,
    status: searchParams.get('status') || null,
    priority: searchParams.get('priority') || null,
  }), [searchParams]);

  // ====================================================================
  // LOCAL STATE
  // ====================================================================
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionForm, setResolutionForm] = useState<ResolutionFormData>({
    status: 'acknowledged',
    resolution_notes: null
  });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // ====================================================================
  // REACT QUERY - DATA FETCHING
  // ====================================================================
  const queryClient = useQueryClient();

  const { data: alertsData, isLoading: alertsLoading, error: alertsError } = useQuery({
    queryKey: ['inventory-alerts', filters],
    queryFn: () => fetchInventoryAlerts(filters, authToken || ''),
    enabled: !!authToken,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false
  });

  const { data: selectedAlert, isLoading: alertDetailLoading } = useQuery({
    queryKey: ['inventory-alert', selectedAlertId],
    queryFn: () => fetchAlertDetails(selectedAlertId!, authToken || ''),
    enabled: !!selectedAlertId && !!authToken,
    staleTime: 10000
  });

  // ====================================================================
  // REACT QUERY - MUTATIONS
  // ====================================================================
  const acknowledgeMutation = useMutation({
    mutationFn: (alert_id: string) =>
      updateAlertStatus(
        alert_id,
        { status: 'acknowledged' },
        currentUser?.user_id || '',
        authToken || ''
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alert', selectedAlertId] });
      showToast('success', 'Alert acknowledged successfully');
      setDetailModalOpen(false);
      setSelectedAlertId(null);
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to acknowledge alert');
    }
  });

  const resolveMutation = useMutation({
    mutationFn: ({ alert_id, form }: { alert_id: string; form: ResolutionFormData }) =>
      updateAlertStatus(
        alert_id,
        {
          status: 'resolved',
          resolution_notes: form.resolution_notes
        },
        currentUser?.user_id || '',
        authToken || ''
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alert', selectedAlertId] });
      showToast('success', 'Alert resolved successfully');
      setResolutionModalOpen(false);
      setDetailModalOpen(false);
      setSelectedAlertId(null);
      setResolutionForm({ status: 'acknowledged', resolution_notes: null });
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to resolve alert');
    }
  });

  const updatePriorityMutation = useMutation({
    mutationFn: ({ alert_id, priority }: { alert_id: string; priority: string }) =>
      updateAlertStatus(
        alert_id,
        { status: selectedAlert?.status || 'pending', priority },
        currentUser?.user_id || '',
        authToken || ''
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-alert', selectedAlertId] });
      showToast('success', 'Alert priority updated');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update priority');
    }
  });

  // ====================================================================
  // HANDLERS
  // ====================================================================
  const handleFilterChange = (key: keyof AlertFilters, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handleAlertClick = (alert_id: string) => {
    setSelectedAlertId(alert_id);
    setDetailModalOpen(true);
  };

  const handleAcknowledge = () => {
    if (!selectedAlertId) return;
    acknowledgeMutation.mutate(selectedAlertId);
  };

  const handleOpenResolutionModal = () => {
    setResolutionModalOpen(true);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlertId) return;
    
    if (!resolutionForm.resolution_notes?.trim()) {
      showToast('error', 'Resolution notes are required');
      return;
    }

    resolveMutation.mutate({
      alert_id: selectedAlertId,
      form: resolutionForm
    });
  };

  const handleUpdatePriority = (priority: string) => {
    if (!selectedAlertId) return;
    updatePriorityMutation.mutate({ alert_id: selectedAlertId, priority });
  };

  // ====================================================================
  // COMPUTED VALUES
  // ====================================================================
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.location_name) count++;
    if (filters.alert_type) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    return count;
  }, [filters]);

  const alerts = alertsData?.alerts || [];

  // Count by status for stats
  const statsCounts = useMemo(() => {
    const pending = alerts.filter(a => a.status === 'pending').length;
    const acknowledged = alerts.filter(a => a.status === 'acknowledged').length;
    const in_progress = alerts.filter(a => a.status === 'in_progress').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;
    const urgent = alerts.filter(a => a.priority === 'urgent').length;
    
    return { pending, acknowledged, in_progress, resolved, urgent };
  }, [alerts]);

  // ====================================================================
  // UTILITY FUNCTIONS
  // ====================================================================
  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock': return <PackageX className="w-5 h-5" />;
      case 'low_stock': return <AlertTriangle className="w-5 h-5" />;
      case 'expiring_soon': return <Clock className="w-5 h-5" />;
      case 'quality_issue': return <AlertCircle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'out_of_stock': return 'text-red-600 bg-red-50';
      case 'low_stock': return 'text-orange-600 bg-orange-50';
      case 'expiring_soon': return 'text-yellow-600 bg-yellow-50';
      case 'quality_issue': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'acknowledged': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAlertType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // ====================================================================
  // RENDER
  // ====================================================================
  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Inventory Alerts</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage and resolve staff-submitted inventory alerts
                </p>
              </div>
              <Link
                to="/admin/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-red-600">{statsCounts.pending}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Acknowledged</p>
                  <p className="text-2xl font-bold text-yellow-600">{statsCounts.acknowledged}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{statsCounts.in_progress}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">{statsCounts.resolved}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">{statsCounts.urgent}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Filter Bar */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-700">
                    Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${filterPanelOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Filter Panel */}
              {filterPanelOpen && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <select
                      value={filters.location_name || ''}
                      onChange={(e) => handleFilterChange('location_name', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Locations</option>
                      <option value="Blanchardstown">Blanchardstown</option>
                      <option value="Tallaght">Tallaght</option>
                      <option value="Glasnevin">Glasnevin</option>
                    </select>
                  </div>

                  {/* Alert Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alert Type
                    </label>
                    <select
                      value={filters.alert_type || ''}
                      onChange={(e) => handleFilterChange('alert_type', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Types</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="low_stock">Low Stock</option>
                      <option value="quality_issue">Quality Issue</option>
                      <option value="expiring_soon">Expiring Soon</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={filters.priority || ''}
                      onChange={(e) => handleFilterChange('priority', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Alerts List */}
            <div className="p-6">
              {alertsLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                </div>
              )}

              {alertsError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <p className="text-red-700 font-medium">Failed to load alerts</p>
                  <p className="text-red-600 text-sm mt-1">Please try refreshing the page</p>
                </div>
              )}

              {!alertsLoading && !alertsError && alerts.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts found</h3>
                  <p className="text-gray-600">
                    {activeFiltersCount > 0 
                      ? 'Try adjusting your filters to see more alerts'
                      : 'All inventory alerts are resolved! Great work!'
                    }
                  </p>
                </div>
              )}

              {!alertsLoading && !alertsError && alerts.length > 0 && (
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.alert_id}
                      onClick={() => handleAlertClick(alert.alert_id)}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        alert.priority === 'urgent' 
                          ? 'border-red-300 bg-red-50 hover:bg-red-100' 
                          : alert.priority === 'high'
                          ? 'border-orange-300 bg-orange-50 hover:bg-orange-100'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-2 rounded-lg ${getAlertTypeColor(alert.alert_type)}`}>
                            {getAlertTypeIcon(alert.alert_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {alert.item_name}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(alert.priority)}`}>
                                {alert.priority.toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`}>
                                {alert.status.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{alert.location_name}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(alert.created_at)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText className="w-4 h-4" />
                                <span className="font-mono text-xs">{alert.reference_number}</span>
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-700">
                              <span className="font-medium">{formatAlertType(alert.alert_type)}</span>
                              {alert.current_quantity !== null && (
                                <span className="ml-2">- Current: {alert.current_quantity} units</span>
                              )}
                            </div>
                            
                            {alert.notes && (
                              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                {alert.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertClick(alert.alert_id);
                            }}
                            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alert Detail Modal */}
        {detailModalOpen && selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Alert Details</h2>
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedAlertId(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              {alertDetailLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                </div>
              )}

              {!alertDetailLoading && selectedAlert && (
                <div className="p-6 space-y-6">
                  {/* Alert Header Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-3 rounded-lg ${getAlertTypeColor(selectedAlert.alert_type)}`}>
                        {getAlertTypeIcon(selectedAlert.alert_type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {selectedAlert.item_name}
                        </h3>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getPriorityColor(selectedAlert.priority)}`}>
                            {selectedAlert.priority.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedAlert.status)}`}>
                            {selectedAlert.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 font-mono">
                          Ref: {selectedAlert.reference_number}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alert Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-gray-700">Location</p>
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        {selectedAlert.location_name}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-4 h-4 text-purple-600" />
                        <p className="text-sm font-medium text-gray-700">Alert Type</p>
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        {formatAlertType(selectedAlert.alert_type)}
                      </p>
                    </div>
                    
                    {selectedAlert.current_quantity !== null && (
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <PackageX className="w-4 h-4 text-orange-600" />
                          <p className="text-sm font-medium text-gray-700">Current Quantity</p>
                        </div>
                        <p className="text-base font-semibold text-gray-900">
                          {selectedAlert.current_quantity} units
                        </p>
                      </div>
                    )}
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-medium text-gray-700">Submitted</p>
                      </div>
                      <p className="text-base font-semibold text-gray-900">
                        {formatDate(selectedAlert.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Staff Notes */}
                  {selectedAlert.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Staff Notes</h4>
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-700 leading-relaxed">{selectedAlert.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Acknowledgment Info */}
                  {selectedAlert.acknowledged_at && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Acknowledgment</h4>
                      <p className="text-sm text-gray-700">
                        Acknowledged on {formatDate(selectedAlert.acknowledged_at)}
                      </p>
                    </div>
                  )}

                  {/* Resolution Info */}
                  {selectedAlert.resolved_at && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Resolution</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Resolved on {formatDate(selectedAlert.resolved_at)}
                      </p>
                      {selectedAlert.resolution_notes && (
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <p className="text-gray-700 leading-relaxed">
                            {selectedAlert.resolution_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    {selectedAlert.status === 'pending' && (
                      <button
                        onClick={handleAcknowledge}
                        disabled={acknowledgeMutation.isPending}
                        className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {acknowledgeMutation.isPending ? 'Acknowledging...' : 'Acknowledge Alert'}
                      </button>
                    )}
                    
                    {['pending', 'acknowledged', 'in_progress'].includes(selectedAlert.status) && (
                      <button
                        onClick={handleOpenResolutionModal}
                        className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Resolve Alert
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setDetailModalOpen(false);
                        setSelectedAlertId(null);
                      }}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Close
                    </button>
                  </div>

                  {/* Priority Update */}
                  {selectedAlert.status !== 'resolved' && (
                    <div className="pt-4 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Update Priority
                      </label>
                      <div className="flex space-x-2">
                        {['low', 'medium', 'high', 'urgent'].map((p) => (
                          <button
                            key={p}
                            onClick={() => handleUpdatePriority(p)}
                            disabled={updatePriorityMutation.isPending || selectedAlert.priority === p}
                            className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                              selectedAlert.priority === p
                                ? getPriorityColor(p)
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resolution Modal */}
        {resolutionModalOpen && selectedAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Resolve Alert</h3>
                <button
                  onClick={() => {
                    setResolutionModalOpen(false);
                    setResolutionForm({ status: 'acknowledged', resolution_notes: null });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Alert:</strong> {selectedAlert.item_name} at {selectedAlert.location_name}
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    <strong>Type:</strong> {formatAlertType(selectedAlert.alert_type)}
                  </p>
                </div>

                <div>
                  <label htmlFor="resolution_notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Resolution Notes <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="resolution_notes"
                    rows={4}
                    required
                    value={resolutionForm.resolution_notes || ''}
                    onChange={(e) => setResolutionForm(prev => ({
                      ...prev,
                      resolution_notes: e.target.value
                    }))}
                    placeholder="Describe what action was taken to resolve this alert..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This will be visible to staff who submitted the alert
                  </p>
                </div>

                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={resolveMutation.isPending}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resolveMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resolving...
                      </span>
                    ) : (
                      'Mark as Resolved'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResolutionModalOpen(false);
                      setResolutionForm({ status: 'acknowledged', resolution_notes: null });
                    }}
                    disabled={resolveMutation.isPending}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_AdminInventoryAlerts;