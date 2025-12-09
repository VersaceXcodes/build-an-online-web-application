import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { AlertTriangle, Package, XCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface InventoryAlert {
  alert_id: string;
  reference_number: string;
  submitted_by_user_id: string;
  location_name: string;
  item_name: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'quality_issue' | 'expiring_soon';
  current_quantity: number | null;
  notes: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'acknowledged' | 'in_progress' | 'resolved';
  acknowledged_by_user_id: string | null;
  acknowledged_at: string | null;
  resolution_notes: string | null;
  resolved_by_user_id: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateAlertPayload {
  submitted_by_user_id: string;
  location_name: string;
  item_name: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'quality_issue' | 'expiring_soon';
  current_quantity: number | null;
  notes: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface AlertFormData {
  location_name: string;
  item_name: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'quality_issue' | 'expiring_soon';
  current_quantity: string;
  notes: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// ============================================================================
// UV_STAFFINVENTORYALERTS COMPONENT
// ============================================================================

const UV_StaffInventoryAlerts: React.FC = () => {
  // ============================================================================
  // GLOBAL STATE ACCESS
  // ============================================================================
  
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);
  const showLoading = useAppStore(state => state.show_loading);
  const hideLoading = useAppStore(state => state.hide_loading);

  // ============================================================================
  // URL PARAMETERS
  // ============================================================================

  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatusFilter = searchParams.get('status') || null;
  const urlAlertTypeFilter = searchParams.get('alert_type') || null;

  // ============================================================================
  // LOCAL STATE
  // ============================================================================

  const [formData, setFormData] = useState<AlertFormData>({
    location_name: '',
    item_name: '',
    alert_type: 'low_stock',
    current_quantity: '',
    notes: '',
    priority: 'medium'
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [statusFilter, setStatusFilter] = useState<string | null>(urlStatusFilter);
  const [typeFilter, setTypeFilter] = useState<string | null>(urlAlertTypeFilter);

  // ============================================================================
  // REACT QUERY CLIENT
  // ============================================================================

  const queryClient = useQueryClient();

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const fetchInventoryAlerts = async (
    status: string | null,
    alertType: string | null
  ): Promise<{ data: InventoryAlert[]; total: number }> => {
    const params: any = {
      limit: 50,
      sort_by: 'created_at',
      sort_order: 'desc'
    };

    if (status) params.status = status;
    if (alertType) params.alert_type = alertType;

    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/inventory/alerts`,
      {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  };

  const createInventoryAlert = async (
    payload: CreateAlertPayload
  ): Promise<InventoryAlert> => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/inventory/alerts`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  };

  // ============================================================================
  // REACT QUERY HOOKS
  // ============================================================================

  const {
    data: alertsData,
    isLoading: isLoadingAlerts,
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery({
    queryKey: ['inventoryAlerts', statusFilter, typeFilter],
    queryFn: () => fetchInventoryAlerts(statusFilter, typeFilter),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    select: (data) => ({
      alerts: data.data.map(alert => ({
        ...alert,
        current_quantity: alert.current_quantity !== null ? Number(alert.current_quantity) : null
      })),
      total: data.total
    })
  });

  const submitAlertMutation = useMutation({
    mutationFn: createInventoryAlert,
    onSuccess: (data) => {
      // Reset form
      setFormData({
        location_name: '',
        item_name: '',
        alert_type: 'low_stock',
        current_quantity: '',
        notes: '',
        priority: 'medium'
      });
      setFormErrors({});

      // Show success toast
      showToast(
        'success',
        `Alert ${data.reference_number} submitted successfully!`,
        5000
      );

      // Refresh alerts list
      queryClient.invalidateQueries({ queryKey: ['inventoryAlerts'] });
      refetchAlerts();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message || 'Failed to submit alert';
      showToast('error', errorMessage);
    }
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Sync URL params with local filter state
  useEffect(() => {
    setStatusFilter(urlStatusFilter);
    setTypeFilter(urlAlertTypeFilter);
  }, [urlStatusFilter, urlAlertTypeFilter]);

  // Auto-calculate priority when alert type changes
  useEffect(() => {
    let autoPriority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

    if (formData.alert_type === 'out_of_stock') {
      autoPriority = 'high';
    } else if (formData.alert_type === 'quality_issue') {
      autoPriority = 'high';
    } else if (formData.alert_type === 'expiring_soon') {
      autoPriority = 'medium';
    } else if (formData.alert_type === 'low_stock') {
      autoPriority = 'medium';
    }

    setFormData(prev => ({
      ...prev,
      priority: autoPriority
    }));
  }, [formData.alert_type]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFormChange = (field: keyof AlertFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.location_name || formData.location_name.trim() === '') {
      errors.location_name = 'Location is required';
    }

    if (!formData.item_name || formData.item_name.trim() === '') {
      errors.item_name = 'Item name is required';
    }

    if (formData.item_name && formData.item_name.trim().length > 255) {
      errors.item_name = 'Item name too long (max 255 characters)';
    }

    if (formData.current_quantity && isNaN(Number(formData.current_quantity))) {
      errors.current_quantity = 'Quantity must be a valid number';
    }

    if (formData.current_quantity && Number(formData.current_quantity) < 0) {
      errors.current_quantity = 'Quantity cannot be negative';
    }

    if (formData.notes && formData.notes.length > 1000) {
      errors.notes = 'Notes too long (max 1000 characters)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Please fix form errors before submitting');
      return;
    }

    if (!currentUser) {
      showToast('error', 'Authentication required');
      return;
    }

    const payload: CreateAlertPayload = {
      submitted_by_user_id: currentUser.user_id,
      location_name: formData.location_name,
      item_name: formData.item_name.trim(),
      alert_type: formData.alert_type,
      current_quantity: formData.current_quantity
        ? Number(formData.current_quantity)
        : null,
      notes: formData.notes.trim() || null,
      priority: formData.priority
    };

    submitAlertMutation.mutate(payload);
  };

  const handleFilterChange = (filterType: 'status' | 'alert_type', value: string | null) => {
    const newParams = new URLSearchParams(searchParams);

    if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }

    setSearchParams(newParams);
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getAlertTypeBadge = (type: string) => {
    const badges = {
      low_stock: { icon: <AlertTriangle className="size-4" />, color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Running Low' },
      out_of_stock: { icon: <XCircle className="size-4" />, color: 'bg-red-100 text-red-800 border-red-300', label: 'Out of Stock' },
      quality_issue: { icon: <AlertCircle className="size-4" />, color: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Quality Issue' },
      expiring_soon: { icon: <Clock className="size-4" />, color: 'bg-purple-100 text-purple-800 border-purple-300', label: 'Expiring Soon' }
    };

    const badge = badges[type as keyof typeof badges] || badges.low_stock;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Pending' },
      acknowledged: { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Acknowledged' },
      in_progress: { color: 'bg-purple-100 text-purple-800 border-purple-300', label: 'In Progress' },
      resolved: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Resolved' }
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;

    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: { color: 'bg-gray-100 text-gray-700', label: 'Low' },
      medium: { color: 'bg-blue-100 text-blue-700', label: 'Medium' },
      high: { color: 'bg-orange-100 text-orange-700', label: 'High' },
      urgent: { color: 'bg-red-100 text-red-700', label: 'Urgent' }
    };

    const badge = badges[priority as keyof typeof badges] || badges.medium;

    return (
      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Inventory Alerts</h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Report inventory issues and track resolution status
                  </p>
                </div>
                <Link
                  to="/staff/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Submit Alert Form - Left Column */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200">
                  <h2 className="text-xl font-bold text-purple-900 flex items-center gap-2">
                    <Package className="size-6" />
                    Submit New Alert
                  </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Location Selection */}
                  <div>
                    <label htmlFor="location_name" className="block text-sm font-semibold text-gray-900 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="location_name"
                      value={formData.location_name}
                      onChange={(e) => handleFormChange('location_name', e.target.value)}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        formErrors.location_name
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                      } transition-all duration-200`}
                      required
                    >
                      <option value="">Select Location</option>
                      <option value="Blanchardstown">Blanchardstown</option>
                      <option value="Tallaght">Tallaght</option>
                      <option value="Glasnevin">Glasnevin</option>
                    </select>
                    {formErrors.location_name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.location_name}</p>
                    )}
                  </div>

                  {/* Item Name */}
                  <div>
                    <label htmlFor="item_name" className="block text-sm font-semibold text-gray-900 mb-2">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="item_name"
                      value={formData.item_name}
                      onChange={(e) => handleFormChange('item_name', e.target.value)}
                      placeholder="e.g., All-Purpose Flour"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        formErrors.item_name
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                      } transition-all duration-200`}
                      maxLength={255}
                      required
                    />
                    {formErrors.item_name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.item_name}</p>
                    )}
                  </div>

                  {/* Alert Type */}
                  <div>
                    <label htmlFor="alert_type" className="block text-sm font-semibold text-gray-900 mb-2">
                      Alert Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="alert_type"
                      value={formData.alert_type}
                      onChange={(e) => handleFormChange('alert_type', e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                      required
                    >
                      <option value="low_stock">Running Low</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="quality_issue">Quality Issue</option>
                      <option value="expiring_soon">Expiring Soon</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Priority is automatically set based on alert type
                    </p>
                  </div>

                  {/* Current Quantity */}
                  <div>
                    <label htmlFor="current_quantity" className="block text-sm font-semibold text-gray-900 mb-2">
                      Current Quantity (Optional)
                    </label>
                    <input
                      type="number"
                      id="current_quantity"
                      value={formData.current_quantity}
                      onChange={(e) => handleFormChange('current_quantity', e.target.value)}
                      placeholder="Enter quantity if known"
                      min="0"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        formErrors.current_quantity
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                      } transition-all duration-200`}
                    />
                    {formErrors.current_quantity && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.current_quantity}</p>
                    )}
                  </div>

                  {/* Priority Display */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Priority (Auto-calculated)
                    </label>
                    <div className="px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50">
                      {getPriorityBadge(formData.priority)}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      placeholder="Any additional details about the issue..."
                      rows={4}
                      maxLength={1000}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        formErrors.notes
                          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                          : 'border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100'
                      } transition-all duration-200 resize-none`}
                    />
                    <p className="mt-1 text-xs text-gray-500 text-right">
                      {formData.notes.length}/1000 characters
                    </p>
                    {formErrors.notes && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.notes}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitAlertMutation.isPending}
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {submitAlertMutation.isPending ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting Alert...
                      </span>
                    ) : (
                      'Submit Alert'
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Alerts List - Right Column */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                  <h2 className="text-xl font-bold text-blue-900">My Submitted Alerts</h2>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label htmlFor="status_filter" className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Status
                      </label>
                      <select
                        id="status_filter"
                        value={statusFilter || ''}
                        onChange={(e) => handleFilterChange('status', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="acknowledged">Acknowledged</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>

                    {/* Alert Type Filter */}
                    <div>
                      <label htmlFor="type_filter" className="block text-sm font-medium text-gray-700 mb-2">
                        Filter by Type
                      </label>
                      <select
                        id="type_filter"
                        value={typeFilter || ''}
                        onChange={(e) => handleFilterChange('alert_type', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Types</option>
                        <option value="low_stock">Running Low</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="quality_issue">Quality Issue</option>
                        <option value="expiring_soon">Expiring Soon</option>
                      </select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {(statusFilter || typeFilter) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-600 font-medium">Active filters:</span>
                      {statusFilter && (
                        <button
                          onClick={() => handleFilterChange('status', null)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                        >
                          Status: {statusFilter}
                          <XCircle className="size-3" />
                        </button>
                      )}
                      {typeFilter && (
                        <button
                          onClick={() => handleFilterChange('alert_type', null)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200"
                        >
                          Type: {typeFilter}
                          <XCircle className="size-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Alerts List */}
                <div className="divide-y divide-gray-100">
                  {isLoadingAlerts ? (
                    <div className="px-6 py-12 text-center">
                      <div className="inline-flex items-center gap-3 text-gray-600">
                        <svg className="animate-spin h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm font-medium">Loading alerts...</span>
                      </div>
                    </div>
                  ) : alertsError ? (
                    <div className="px-6 py-12">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <AlertCircle className="size-8 text-red-600 mx-auto mb-2" />
                        <p className="text-red-700 font-medium">Failed to load alerts</p>
                        <p className="text-red-600 text-sm mt-1">
                          {(alertsError as any).message || 'Please try again'}
                        </p>
                        <button
                          onClick={() => refetchAlerts()}
                          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                          Retry
                        </button>
                      </div>
                    </div>
                  ) : !alertsData || alertsData.alerts.length === 0 ? (
                    <div className="px-6 py-12">
                      <div className="text-center">
                        <Package className="size-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts Found</h3>
                        <p className="text-gray-600 text-sm">
                          {statusFilter || typeFilter
                            ? 'No alerts match your current filters'
                            : "You haven't submitted any inventory alerts yet"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
                      {alertsData.alerts.map((alert) => (
                        <div
                          key={alert.alert_id}
                          className="px-6 py-5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {alert.item_name}
                                </h3>
                                {getPriorityBadge(alert.priority)}
                              </div>
                              <p className="text-sm text-gray-600 font-medium mb-1">
                                Ref: {alert.reference_number}
                              </p>
                              <p className="text-sm text-gray-500">
                                {alert.location_name}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {getStatusBadge(alert.status)}
                              {getAlertTypeBadge(alert.alert_type)}
                            </div>
                          </div>

                          {alert.current_quantity !== null && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-3">
                              <p className="text-sm text-yellow-800 font-medium">
                                Current Quantity: <span className="font-bold">{alert.current_quantity}</span>
                              </p>
                            </div>
                          )}

                          {alert.notes && (
                            <div className="bg-gray-50 rounded-lg px-3 py-2 mb-3">
                              <p className="text-sm text-gray-700">{alert.notes}</p>
                            </div>
                          )}

                          {alert.resolution_notes && (
                            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3">
                              <p className="text-xs text-green-700 font-semibold mb-1">Resolution Notes:</p>
                              <p className="text-sm text-green-800">{alert.resolution_notes}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Submitted {formatDate(alert.created_at)}</span>
                            {alert.resolved_at && (
                              <span className="flex items-center gap-1 text-green-600 font-medium">
                                <CheckCircle className="size-3" />
                                Resolved {formatDate(alert.resolved_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Results Count */}
                {alertsData && alertsData.alerts.length > 0 && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Showing <span className="font-semibold">{alertsData.alerts.length}</span> of{' '}
                      <span className="font-semibold">{alertsData.total}</span> alerts
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_StaffInventoryAlerts;