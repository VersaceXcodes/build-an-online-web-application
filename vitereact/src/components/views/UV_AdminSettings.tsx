import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  Settings, 
  MapPin, 
  Bell, 
  Building2,
  X,
  Edit,
  Check,
  AlertCircle,
  Clock,
  TrendingUp,
  Mail,
  Phone,
  Percent
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface SystemSetting {
  setting_id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  setting_group: string;
  updated_at: string;
}

interface Location {
  location_id: string;
  location_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  phone_number: string;
  email: string;
  is_collection_enabled: boolean;
  is_delivery_enabled: boolean;
  delivery_radius_km: number | null;
  delivery_fee: number | null;
  free_delivery_threshold: number | null;
  estimated_delivery_time_minutes: number | null;
  estimated_preparation_time_minutes: number;
  allow_scheduled_pickups: boolean;
  just_eat_url: string | null;
  deliveroo_url: string | null;
  opening_hours: string;
  created_at: string;
  updated_at: string;
}

type SectionType = 'general' | 'locations' | 'loyalty_points' | 'orders' | 'notifications';

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchSystemSettings = async (token: string, setting_group?: string) => {
  const params = new URLSearchParams();
  if (setting_group) {
    params.append('setting_group', setting_group);
  }
  params.append('limit', '100');
  params.append('offset', '0');

  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/settings?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data as SystemSetting[];
};

const fetchLocations = async (token: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data as Location[];
};

const updateSystemSetting = async (token: string, setting_id: string, setting_value: string) => {
  const { data } = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/settings/${setting_id}`,
    { setting_value },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data as SystemSetting;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminSettings: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // CRITICAL: Individual Zustand selectors - NO object destructuring
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);

  // URL param for active section
  const activeSection = (searchParams.get('section') as SectionType) || 'general';

  // Local state for forms
  const [editingSettingId, setEditingSettingId] = useState<string | null>(null);
  const [editingSettingValue, setEditingSettingValue] = useState<string>('');

  // React Query - Fetch system settings
  // Map section names to setting_group values in the database
  const sectionToGroupMap: Record<string, string> = {
    'general': 'general',
    'loyalty_points': 'loyalty',
    'orders': 'orders',
    'notifications': 'notifications'
  };

  const settingGroup = sectionToGroupMap[activeSection] || activeSection;

  const {
    data: systemSettings,
    isLoading: loadingSettings,
    error: settingsError
  } = useQuery({
    queryKey: ['system-settings', activeSection],
    queryFn: () => fetchSystemSettings(authToken!, settingGroup),
    enabled: !!authToken,
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  // React Query - Fetch locations
  const {
    data: locations,
    isLoading: loadingLocations,
    error: locationsError
  } = useQuery({
    queryKey: ['locations-settings'],
    queryFn: () => fetchLocations(authToken!),
    enabled: !!authToken && activeSection === 'locations',
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  // Mutation - Update setting
  const updateSettingMutation = useMutation({
    mutationFn: ({ setting_id, setting_value }: { setting_id: string; setting_value: string }) =>
      updateSystemSetting(authToken!, setting_id, setting_value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      showToast('success', 'Setting updated successfully');
      setEditingSettingId(null);
      setEditingSettingValue('');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update setting');
    }
  });

  // Handle section change
  const changeSection = (section: SectionType) => {
    setSearchParams({ section });
  };

  // Handle setting edit
  const startEditSetting = (setting: SystemSetting) => {
    setEditingSettingId(setting.setting_id);
    setEditingSettingValue(setting.setting_value);
  };

  const cancelEditSetting = () => {
    setEditingSettingId(null);
    setEditingSettingValue('');
  };

  const saveSetting = () => {
    if (!editingSettingId) return;
    updateSettingMutation.mutate({
      setting_id: editingSettingId,
      setting_value: editingSettingValue
    });
  };

  // Section navigation items
  const sections: Array<{ id: SectionType; label: string; icon: any }> = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'loyalty_points', label: 'Loyalty Points', icon: TrendingUp },
    { id: 'orders', label: 'Orders', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell }
  ];

  // Group settings by key for display
  const getSettingsByGroup = (group: string) => {
    return systemSettings?.filter(s => s.setting_group === group) || [];
  };

  // Render setting input based on type
  const renderSettingInput = (setting: SystemSetting) => {
    const isEditing = editingSettingId === setting.setting_id;

    if (!isEditing) {
      return (
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {setting.setting_type === 'boolean' 
                ? (setting.setting_value === 'true' ? 'Enabled' : 'Disabled')
                : setting.setting_value}
            </p>
          </div>
          <button
            onClick={() => startEditSetting(setting)}
            className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit setting"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">
          {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </label>
        
        {setting.setting_type === 'boolean' ? (
          <select
            value={editingSettingValue}
            onChange={(e) => setEditingSettingValue(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
          >
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        ) : setting.setting_type === 'number' ? (
          <input
            type="number"
            value={editingSettingValue}
            onChange={(e) => setEditingSettingValue(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
          />
        ) : (
          <input
            type="text"
            value={editingSettingValue}
            onChange={(e) => setEditingSettingValue(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
          />
        )}
        
        <div className="flex gap-2">
          <button
            onClick={saveSetting}
            disabled={updateSettingMutation.isPending}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {updateSettingMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save
              </>
            )}
          </button>
          <button
            onClick={cancelEditSetting}
            disabled={updateSettingMutation.isPending}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Configure system-wide settings and operational parameters
                </p>
              </div>
              <Link
                to="/admin/dashboard"
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Section Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8" aria-label="Settings sections">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => changeSection(section.id)}
                    className={`
                      flex items-center gap-2 px-3 py-4 border-b-2 font-medium text-sm transition-colors
                      ${isActive 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading State */}
          {loadingSettings && activeSection !== 'locations' && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading settings...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {settingsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Loading Settings</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {(settingsError as any)?.response?.data?.message || 'Failed to load system settings'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* General Settings Section */}
          {activeSection === 'general' && systemSettings && !loadingSettings && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Company Information
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {getSettingsByGroup('company').map((setting) => (
                    <div key={setting.setting_id} className="py-3 border-b border-gray-100 last:border-0">
                      {renderSettingInput(setting)}
                    </div>
                  ))}
                  
                  {getSettingsByGroup('company').length === 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Company Email</p>
                          <p className="text-sm text-gray-600">info@kake.ie</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Company Phone</p>
                          <p className="text-sm text-gray-600">+353 1 234 5678</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    System Configuration
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {getSettingsByGroup('system').map((setting) => (
                    <div key={setting.setting_id} className="py-3 border-b border-gray-100 last:border-0">
                      {renderSettingInput(setting)}
                    </div>
                  ))}
                  
                  {getSettingsByGroup('system').length === 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Percent className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Tax Rate</p>
                          <p className="text-sm text-gray-600">23% (VAT)</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Enable Loyalty Program</p>
                            <p className="text-sm text-gray-600">Currently enabled</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Enable Corporate Orders</p>
                            <p className="text-sm text-gray-600">Currently enabled</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Locations Settings Section */}
          {activeSection === 'locations' && (
            <div className="space-y-6">
              {loadingLocations ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading locations...</p>
                  </div>
                </div>
              ) : locationsError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error Loading Locations</h3>
                      <p className="text-sm text-red-700 mt-1">
                        {(locationsError as any)?.response?.data?.message || 'Failed to load locations'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Missing Endpoint Warning */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-yellow-800">Backend Endpoint Required</h3>
                        <p className="text-sm text-yellow-700 mt-1">
                          The PUT /api/locations/:location_id endpoint is not implemented yet. Location editing is temporarily disabled.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Locations List */}
                  {locations?.map((location) => (
                    <div
                      key={location.location_id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            {location.location_name}
                          </h2>
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Active
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Contact Information */}
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Address:</span> {location.address_line1}
                                {location.address_line2 && `, ${location.address_line2}`}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">City:</span> {location.city}, {location.postal_code}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Phone:</span> {location.phone_number}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Email:</span> {location.email}
                              </p>
                            </div>
                          </div>

                          {/* Operational Settings */}
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Operational Settings</h3>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {location.is_collection_enabled ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <X className="w-4 h-4 text-red-600" />
                                )}
                                <span className="text-sm text-gray-600">Collection</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {location.is_delivery_enabled ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <X className="w-4 h-4 text-red-600" />
                                )}
                                <span className="text-sm text-gray-600">Delivery</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Prep Time:</span> {location.estimated_preparation_time_minutes} min
                              </p>
                              {location.estimated_delivery_time_minutes && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Delivery Time:</span> {location.estimated_delivery_time_minutes} min
                                </p>
                              )}
                              {location.delivery_fee !== null && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Delivery Fee:</span> €{Number(location.delivery_fee).toFixed(2)}
                                </p>
                              )}
                              {location.free_delivery_threshold !== null && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Free Delivery Over:</span> €{Number(location.free_delivery_threshold).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* External URLs (if applicable) */}
                        {(location.just_eat_url || location.deliveroo_url) && (
                          <div className="mt-6 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">External Ordering</h3>
                            <div className="space-y-2">
                              {location.just_eat_url && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Just Eat:</span>{' '}
                                  <a 
                                    href={location.just_eat_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {location.just_eat_url}
                                  </a>
                                </p>
                              )}
                              {location.deliveroo_url && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Deliveroo:</span>{' '}
                                  <a 
                                    href={location.deliveroo_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    {location.deliveroo_url}
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Loyalty Points Settings Section */}
          {activeSection === 'loyalty_points' && systemSettings && !loadingSettings && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Loyalty Points Configuration
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure how customers earn and redeem loyalty points
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  {getSettingsByGroup('loyalty').map((setting) => (
                    <div key={setting.setting_id} className="py-3 border-b border-gray-100 last:border-0">
                      {renderSettingInput(setting)}
                    </div>
                  ))}
                  
                  {getSettingsByGroup('loyalty').length === 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Points Per Euro Spent</p>
                          <p className="text-xs text-gray-600 mt-1">Customers earn this many points per €1 spent</p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">10 points</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Points Redemption Rate</p>
                          <p className="text-xs text-gray-600 mt-1">Points needed for €1 discount</p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">100 points</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Minimum Order for Redemption</p>
                          <p className="text-xs text-gray-600 mt-1">Minimum order value to use points</p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">€15</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Settings Section */}
          {activeSection === 'orders' && systemSettings && !loadingSettings && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    Order Configuration
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure order processing, thresholds, and defaults
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  {getSettingsByGroup('orders').map((setting) => (
                    <div key={setting.setting_id} className="py-3 border-b border-gray-100 last:border-0">
                      {renderSettingInput(setting)}
                    </div>
                  ))}
                  
                  {getSettingsByGroup('orders').length === 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Minimum Order for Delivery</p>
                          <p className="text-xs text-gray-600 mt-1">Minimum order value required for delivery</p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">€15</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Default Preparation Time</p>
                          <p className="text-xs text-gray-600 mt-1">Default preparation time for orders</p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">20 minutes</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Max Failed Login Attempts</p>
                          <p className="text-xs text-gray-600 mt-1">Attempts before account lockout</p>
                        </div>
                        <span className="text-lg font-bold text-gray-900">5 attempts</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings Section */}
          {activeSection === 'notifications' && systemSettings && !loadingSettings && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-orange-50 to-amber-50">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-600" />
                    Notification Configuration
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Configure email templates and notification preferences
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  {getSettingsByGroup('notifications').map((setting) => (
                    <div key={setting.setting_id} className="py-3 border-b border-gray-100 last:border-0">
                      {renderSettingInput(setting)}
                    </div>
                  ))}
                  
                  {getSettingsByGroup('notifications').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-sm">No notification settings available</p>
                      <p className="text-xs mt-1">Email templates are configured in the database</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Empty State for No Settings */}
          {activeSection !== 'locations' && !loadingSettings && systemSettings && systemSettings.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-12 text-center">
                <Settings className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Settings Found</h3>
                <p className="text-sm text-gray-600">
                  No settings are configured for this section yet.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_AdminSettings;