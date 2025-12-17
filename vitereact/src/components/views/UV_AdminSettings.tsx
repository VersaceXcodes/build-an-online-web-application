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
  Percent,
  Share2,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon
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

interface ExternalProvider {
  name: string;
  url: string;
  display_order: number;
  is_active: boolean;
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
  external_providers: string | null; // JSON string of ExternalProvider[]
  opening_hours: string;
  created_at: string;
  updated_at: string;
}

interface SocialMediaLink {
  link_id: string;
  platform_name: string;
  platform_url: string;
  icon_type: 'lucide' | 'custom';
  icon_name: string | null;
  icon_url: string | null;
  hover_color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type SectionType = 'general' | 'locations' | 'loyalty_points' | 'orders' | 'notifications' | 'social_media';

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

const updateLocation = async (token: string, location_id: string, locationData: Partial<Location>) => {
  const { data } = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations/${location_id}`,
    locationData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data as Location;
};

const fetchSocialLinks = async (token: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/social-links`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data as SocialMediaLink[];
};

const createSocialLink = async (token: string, linkData: Partial<SocialMediaLink>) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/social-links`,
    linkData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data as SocialMediaLink;
};

const updateSocialLink = async (token: string, link_id: string, linkData: Partial<SocialMediaLink>) => {
  const { data } = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/social-links/${link_id}`,
    linkData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data as SocialMediaLink;
};

const deleteSocialLink = async (token: string, link_id: string) => {
  const { data } = await axios.delete(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/social-links/${link_id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};

const uploadSocialIcon = async (token: string, file: File) => {
  const formData = new FormData();
  formData.append('icon', file);
  
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/upload-social-icon`,
    formData,
    {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return data;
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
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [editingLocationData, setEditingLocationData] = useState<Partial<Location>>({});
  const [editingSocialLinkId, setEditingSocialLinkId] = useState<string | null>(null);
  const [editingSocialLinkData, setEditingSocialLinkData] = useState<Partial<SocialMediaLink>>({});
  const [showAddSocialLink, setShowAddSocialLink] = useState<boolean>(false);
  const [uploadingIcon, setUploadingIcon] = useState<boolean>(false);
  const [uploadedIconUrl, setUploadedIconUrl] = useState<string>('');
  const [editUploadedIconUrl, setEditUploadedIconUrl] = useState<string>('');
  const [newSocialLinkData, setNewSocialLinkData] = useState<Partial<SocialMediaLink>>({
    icon_type: 'lucide',
    hover_color: '#3b82f6',
    display_order: 0,
    is_active: true
  });

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

  // React Query - Fetch social media links
  const {
    data: socialLinks,
    isLoading: loadingSocialLinks,
    error: socialLinksError
  } = useQuery({
    queryKey: ['social-links-settings'],
    queryFn: () => fetchSocialLinks(authToken!),
    enabled: !!authToken && activeSection === 'social_media',
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

  // Mutation - Update location
  const updateLocationMutation = useMutation({
    mutationFn: ({ location_id, locationData }: { location_id: string; locationData: Partial<Location> }) =>
      updateLocation(authToken!, location_id, locationData),
    onSuccess: () => {
      // Invalidate both admin and public location queries to sync across all pages
      queryClient.invalidateQueries({ queryKey: ['locations-settings'] });
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      showToast('success', 'Location updated successfully');
      setEditingLocationId(null);
      setEditingLocationData({});
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update location');
    }
  });

  // Mutation - Create social link
  const createSocialLinkMutation = useMutation({
    mutationFn: (linkData: Partial<SocialMediaLink>) => createSocialLink(authToken!, linkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links-settings'] });
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
      showToast('success', 'Social media link created successfully');
      setShowAddSocialLink(false);
      setNewSocialLinkData({
        icon_type: 'lucide',
        hover_color: '#3b82f6',
        display_order: 0,
        is_active: true
      });
      setUploadedIconUrl('');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to create social media link');
    }
  });

  // Mutation - Update social link
  const updateSocialLinkMutation = useMutation({
    mutationFn: ({ link_id, linkData }: { link_id: string; linkData: Partial<SocialMediaLink> }) =>
      updateSocialLink(authToken!, link_id, linkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links-settings'] });
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
      showToast('success', 'Social media link updated successfully');
      setEditingSocialLinkId(null);
      setEditingSocialLinkData({});
      setEditUploadedIconUrl('');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update social media link');
    }
  });

  // Mutation - Delete social link
  const deleteSocialLinkMutation = useMutation({
    mutationFn: (link_id: string) => deleteSocialLink(authToken!, link_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-links-settings'] });
      queryClient.invalidateQueries({ queryKey: ['social-links'] });
      showToast('success', 'Social media link deleted successfully');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to delete social media link');
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

  // Handle location edit
  const startEditLocation = (location: Location) => {
    setEditingLocationId(location.location_id);
    setEditingLocationData(location);
  };

  const cancelEditLocation = () => {
    setEditingLocationId(null);
    setEditingLocationData({});
  };

  const saveLocation = () => {
    if (!editingLocationId) return;
    updateLocationMutation.mutate({
      location_id: editingLocationId,
      locationData: editingLocationData
    });
  };

  const handleLocationFieldChange = (field: keyof Location, value: any) => {
    setEditingLocationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper functions for external providers
  const parseExternalProviders = (location: Partial<Location>): ExternalProvider[] => {
    // First try to parse from external_providers JSON string
    if (location.external_providers) {
      try {
        const parsed = JSON.parse(location.external_providers);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => a.display_order - b.display_order);
        }
      } catch {
        // Fall through to legacy conversion
      }
    }
    
    // Fallback: convert legacy just_eat_url and deliveroo_url to providers format
    const providers: ExternalProvider[] = [];
    if (location.just_eat_url) {
      providers.push({
        name: 'Just Eat',
        url: location.just_eat_url,
        display_order: 1,
        is_active: true
      });
    }
    if (location.deliveroo_url) {
      providers.push({
        name: 'Deliveroo',
        url: location.deliveroo_url,
        display_order: 2,
        is_active: true
      });
    }
    return providers;
  };

  const updateExternalProviders = (providers: ExternalProvider[]) => {
    const sorted = [...providers].sort((a, b) => a.display_order - b.display_order);
    handleLocationFieldChange('external_providers', JSON.stringify(sorted));
  };

  const addExternalProvider = () => {
    const current = parseExternalProviders(editingLocationData);
    const maxOrder = current.length > 0 ? Math.max(...current.map(p => p.display_order)) : 0;
    const newProvider: ExternalProvider = {
      name: '',
      url: '',
      display_order: maxOrder + 1,
      is_active: true
    };
    updateExternalProviders([...current, newProvider]);
  };

  const removeExternalProvider = (index: number) => {
    const current = parseExternalProviders(editingLocationData);
    const updated = current.filter((_, i) => i !== index);
    updateExternalProviders(updated);
  };

  const updateProviderField = (index: number, field: keyof ExternalProvider, value: any) => {
    const current = parseExternalProviders(editingLocationData);
    current[index] = { ...current[index], [field]: value };
    updateExternalProviders(current);
  };

  // Handle social link edit
  const startEditSocialLink = (link: SocialMediaLink) => {
    setEditingSocialLinkId(link.link_id);
    setEditingSocialLinkData(link);
  };

  const cancelEditSocialLink = () => {
    setEditingSocialLinkId(null);
    setEditingSocialLinkData({});
  };

  const saveSocialLink = () => {
    if (!editingSocialLinkId) return;
    updateSocialLinkMutation.mutate({
      link_id: editingSocialLinkId,
      linkData: editingSocialLinkData
    });
  };

  const handleSocialLinkFieldChange = (field: keyof SocialMediaLink, value: any) => {
    setEditingSocialLinkData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewSocialLinkFieldChange = (field: keyof SocialMediaLink, value: any) => {
    setNewSocialLinkData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateSocialLink = () => {
    if (!newSocialLinkData.platform_name || !newSocialLinkData.platform_url) {
      showToast('error', 'Platform name and URL are required');
      return;
    }
    createSocialLinkMutation.mutate(newSocialLinkData);
  };

  const handleIconFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      showToast('error', 'Invalid file type. Only JPEG, PNG, GIF, WEBP, and SVG images are allowed.');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'File size must be less than 2MB');
      return;
    }

    setUploadingIcon(true);
    try {
      const result = await uploadSocialIcon(authToken!, file);
      const iconUrl = result.icon_url;
      
      if (isEditing) {
        setEditUploadedIconUrl(iconUrl);
        handleSocialLinkFieldChange('icon_url', iconUrl);
      } else {
        setUploadedIconUrl(iconUrl);
        handleNewSocialLinkFieldChange('icon_url', iconUrl);
      }
      
      showToast('success', 'Icon uploaded successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to upload icon');
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleDeleteSocialLink = (link_id: string, platform_name: string) => {
    if (window.confirm(`Are you sure you want to delete ${platform_name}?`)) {
      deleteSocialLinkMutation.mutate(link_id);
    }
  };

  // Section navigation items
  const sections: Array<{ id: SectionType; label: string; icon: any }> = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'social_media', label: 'Social Media', icon: Share2 },
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
          <div className="max-w-7xl mx-auto">
            <nav 
              className="flex overflow-x-auto gap-6 px-4 sm:px-6 lg:px-8 scrollbar-hide" 
              aria-label="Settings sections"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => changeSection(section.id)}
                    className={`
                      flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap flex-shrink-0
                      ${isActive 
                        ? 'border-blue-600 text-blue-600 font-bold' 
                        : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 opacity-60'
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
                  {/* Locations List */}
                  {locations?.map((location) => {
                    const isEditing = editingLocationId === location.location_id;
                    const currentData = isEditing ? editingLocationData : location;
                    
                    // Generate Google Maps URL
                    const mapsAddress = `${location.address_line1}, ${location.city}, ${location.postal_code}`;
                    const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8';
                    const mapsUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(mapsAddress)}`;
                    
                    return (
                      <div
                        key={location.location_id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                      >
                        <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                          <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-blue-600" />
                              {currentData.location_name}
                            </h2>
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Active
                              </span>
                              {!isEditing ? (
                                <button
                                  onClick={() => startEditLocation(location)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                  aria-label="Edit location"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                              ) : (
                                <div className="flex gap-2">
                                  <button
                                    onClick={saveLocation}
                                    disabled={updateLocationMutation.isPending}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                  >
                                    {updateLocationMutation.isPending ? (
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
                                    onClick={cancelEditLocation}
                                    disabled={updateLocationMutation.isPending}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-6">
                          {isEditing ? (
                            /* Edit Form */
                            <div className="space-y-6">
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* Contact Information */}
                                <div>
                                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                                      <input
                                        type="text"
                                        value={currentData.location_name || ''}
                                        onChange={(e) => handleLocationFieldChange('location_name', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                                      <input
                                        type="text"
                                        value={currentData.address_line1 || ''}
                                        onChange={(e) => handleLocationFieldChange('address_line1', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2 (Optional)</label>
                                      <input
                                        type="text"
                                        value={currentData.address_line2 || ''}
                                        onChange={(e) => handleLocationFieldChange('address_line2', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                        <input
                                          type="text"
                                          value={currentData.city || ''}
                                          onChange={(e) => handleLocationFieldChange('city', e.target.value)}
                                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                                        <input
                                          type="text"
                                          value={currentData.postal_code || ''}
                                          onChange={(e) => handleLocationFieldChange('postal_code', e.target.value)}
                                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                      <input
                                        type="text"
                                        value={currentData.phone_number || ''}
                                        onChange={(e) => handleLocationFieldChange('phone_number', e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                      />
                                    </div>
                                     <div>
                                       <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                       <input
                                         type="email"
                                         value={currentData.email || ''}
                                         onChange={(e) => handleLocationFieldChange('email', e.target.value)}
                                         className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                       />
                                     </div>
                                     <div>
                                       <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
                                       <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                         <p className="text-sm text-blue-800 mb-2 font-medium">
                                           <Clock className="inline h-4 w-4 mr-1" />
                                           Opening hours are now managed in the dedicated Locations page
                                         </p>
                                         <Link
                                           to="/admin/locations"
                                           className="text-sm text-blue-600 hover:text-blue-700 underline"
                                         >
                                           Go to Location Management →
                                         </Link>
                                       </div>
                                       <p className="text-xs text-gray-500 mt-1">Use the Locations page for full day-by-day hour management</p>
                                     </div>
                                   </div>
                                 </div>

                                 {/* Operational Settings */}
                                 <div>
                                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Operational Settings</h3>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={currentData.is_collection_enabled || false}
                                          onChange={(e) => handleLocationFieldChange('is_collection_enabled', e.target.checked)}
                                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Collection Enabled</span>
                                      </label>
                                    </div>
                                    <div>
                                      <label className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={currentData.is_delivery_enabled || false}
                                          onChange={(e) => handleLocationFieldChange('is_delivery_enabled', e.target.checked)}
                                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium text-gray-700">Delivery Enabled</span>
                                      </label>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Preparation Time (minutes)</label>
                                      <input
                                        type="number"
                                        value={currentData.estimated_preparation_time_minutes || ''}
                                        onChange={(e) => handleLocationFieldChange('estimated_preparation_time_minutes', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (minutes)</label>
                                      <input
                                        type="number"
                                        value={currentData.estimated_delivery_time_minutes || ''}
                                        onChange={(e) => handleLocationFieldChange('estimated_delivery_time_minutes', parseInt(e.target.value) || null)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (€)</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={currentData.delivery_fee || ''}
                                        onChange={(e) => handleLocationFieldChange('delivery_fee', parseFloat(e.target.value) || null)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-1">Free Delivery Threshold (€)</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={currentData.free_delivery_threshold || ''}
                                        onChange={(e) => handleLocationFieldChange('free_delivery_threshold', parseFloat(e.target.value) || null)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* External Providers List */}
                              <div className="pt-6 border-t border-gray-200">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">External Ordering (Optional)</h3>
                                <p className="text-xs text-gray-500 mb-4">
                                  Add external delivery services for this location. Customers can order through these services instead of the internal menu.
                                </p>
                                
                                {/* Provider List */}
                                <div className="space-y-3 mb-4">
                                  {parseExternalProviders(currentData).map((provider, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                      <div className="flex-1 grid md:grid-cols-3 gap-3">
                                        <div>
                                          <label className="block text-xs font-medium text-gray-600 mb-1">Provider Name</label>
                                          <input
                                            type="text"
                                            value={provider.name}
                                            onChange={(e) => updateProviderField(index, 'name', e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                            placeholder="e.g. Just Eat"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-xs font-medium text-gray-600 mb-1">Provider URL</label>
                                          <input
                                            type="url"
                                            value={provider.url}
                                            onChange={(e) => updateProviderField(index, 'url', e.target.value)}
                                            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                            placeholder="https://..."
                                          />
                                        </div>
                                        <div className="flex items-end gap-2">
                                          <div className="flex-1">
                                            <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                                            <input
                                              type="number"
                                              min="1"
                                              value={provider.display_order}
                                              onChange={(e) => updateProviderField(index, 'display_order', parseInt(e.target.value) || 1)}
                                              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeExternalProvider(index)}
                                        className="mt-5 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                        title="Remove provider"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                  
                                  {parseExternalProviders(currentData).length === 0 && (
                                    <p className="text-sm text-gray-400 italic py-2">No external providers configured</p>
                                  )}
                                </div>
                                
                                {/* Add Provider Button */}
                                <button
                                  type="button"
                                  onClick={addExternalProvider}
                                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Provider
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* View Mode */
                            <>
                              <div className="grid md:grid-cols-2 gap-6 mb-6">
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
                                     <div className="mt-3 pt-3 border-t border-gray-200">
                                       <p className="text-sm font-medium text-gray-900 mb-1 flex items-center gap-2">
                                         <Clock className="w-4 h-4 text-blue-600" />
                                         Opening Hours
                                       </p>
                                       <Link
                                         to="/admin/locations"
                                         className="text-sm text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1"
                                       >
                                         Manage in Locations page →
                                       </Link>
                                     </div>
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

                              {/* Google Maps */}
                              <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-blue-600" />
                                  Location Map
                                </h3>
                                <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md">
                                  <iframe
                                    title={`Map of ${location.location_name}`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={mapsUrl}
                                    onError={(e) => {
                                      // Fallback to placeholder image if map fails to load
                                      const target = e.target as HTMLIFrameElement;
                                      target.style.display = 'none';
                                      const fallback = document.createElement('img');
                                      fallback.src = '/assets/images/location-map-placeholder.jpeg';
                                      fallback.alt = 'Location map placeholder';
                                      fallback.className = 'w-full h-full object-cover';
                                      target.parentElement?.appendChild(fallback);
                                    }}
                                  ></iframe>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                  <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsAddress)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View in Google Maps →
                                  </a>
                                </p>
                              </div>

                              {/* External URLs (if applicable) */}
                              {(location.just_eat_url || location.deliveroo_url) && (
                                <div className="pt-6 border-t border-gray-200">
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
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
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

          {/* Social Media Settings Section */}
          {activeSection === 'social_media' && (
            <div className="space-y-6">
              {loadingSocialLinks ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading social media links...</p>
                  </div>
                </div>
              ) : socialLinksError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Error Loading Social Links</h3>
                      <p className="text-sm text-red-700 mt-1">
                        {(socialLinksError as any)?.response?.data?.message || 'Failed to load social media links'}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Header with Add Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Follow Us Links</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Manage social media links displayed in the footer
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddSocialLink(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Social Link
                    </button>
                  </div>

                  {/* Add New Social Link Form */}
                  {showAddSocialLink && (
                    <div className="bg-white rounded-xl shadow-sm border-2 border-blue-200 overflow-hidden">
                      <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-600" />
                            Add New Social Media Link
                          </h3>
                          <button
                            onClick={() => setShowAddSocialLink(false)}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Platform Name *
                            </label>
                            <input
                              type="text"
                              value={newSocialLinkData.platform_name || ''}
                              onChange={(e) => handleNewSocialLinkFieldChange('platform_name', e.target.value)}
                              placeholder="e.g., Instagram, Twitter"
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Platform URL *
                            </label>
                            <input
                              type="url"
                              value={newSocialLinkData.platform_url || ''}
                              onChange={(e) => handleNewSocialLinkFieldChange('platform_url', e.target.value)}
                              placeholder="https://..."
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Icon Type
                            </label>
                            <select
                              value={newSocialLinkData.icon_type || 'lucide'}
                              onChange={(e) => handleNewSocialLinkFieldChange('icon_type', e.target.value as 'lucide' | 'custom')}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            >
                              <option value="lucide">Lucide Icon</option>
                              <option value="custom">Custom Image</option>
                            </select>
                          </div>
                          {newSocialLinkData.icon_type === 'lucide' ? (
                            <div>
                              <label className="block text-sm font-medium text-gray-900 mb-2">
                                Icon Name
                              </label>
                              <input
                                type="text"
                                value={newSocialLinkData.icon_name || ''}
                                onChange={(e) => handleNewSocialLinkFieldChange('icon_name', e.target.value)}
                                placeholder="e.g., Instagram, Facebook, Twitter"
                                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                              />
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <label className="block text-sm font-medium text-gray-900">
                                Icon Image
                              </label>
                              
                              {/* File Upload Button */}
                              <div className="flex items-center gap-3">
                                <label className="flex-1 cursor-pointer">
                                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                      {uploadingIcon ? 'Uploading...' : 'Upload Image'}
                                    </span>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                                    onChange={(e) => handleIconFileUpload(e, false)}
                                    disabled={uploadingIcon}
                                    className="hidden"
                                  />
                                </label>
                                
                                {/* Preview */}
                                {(uploadedIconUrl || newSocialLinkData.icon_url) && (
                                  <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border-2 border-green-200 rounded-lg">
                                    <ImageIcon className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-green-700 font-medium">Uploaded</span>
                                  </div>
                                )}
                              </div>

                              {/* Manual URL Input */}
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Or enter URL manually:
                                </label>
                                <input
                                  type="text"
                                  value={newSocialLinkData.icon_url || ''}
                                  onChange={(e) => handleNewSocialLinkFieldChange('icon_url', e.target.value)}
                                  placeholder="/uploads/social-icons/..."
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm"
                                />
                              </div>

                              {/* Image Preview */}
                              {newSocialLinkData.icon_url && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-600 mb-2">Preview:</p>
                                  <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden">
                                    <img 
                                      src={newSocialLinkData.icon_url} 
                                      alt="Icon preview" 
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Hover Color (Hex)
                            </label>
                            <input
                              type="text"
                              value={newSocialLinkData.hover_color || '#3b82f6'}
                              onChange={(e) => handleNewSocialLinkFieldChange('hover_color', e.target.value)}
                              placeholder="#3b82f6"
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Display Order
                            </label>
                            <input
                              type="number"
                              value={newSocialLinkData.display_order || 0}
                              onChange={(e) => handleNewSocialLinkFieldChange('display_order', parseInt(e.target.value))}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="new-is-active"
                            checked={newSocialLinkData.is_active !== false}
                            onChange={(e) => handleNewSocialLinkFieldChange('is_active', e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="new-is-active" className="text-sm font-medium text-gray-900">
                            Active (visible in footer)
                          </label>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleCreateSocialLink}
                            disabled={createSocialLinkMutation.isPending}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                          >
                            {createSocialLinkMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating...
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                Create Link
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setShowAddSocialLink(false)}
                            disabled={createSocialLinkMutation.isPending}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Social Links List */}
                  <div className="space-y-4">
                    {socialLinks?.map((link) => {
                      const isEditing = editingSocialLinkId === link.link_id;
                      const currentData = isEditing ? editingSocialLinkData : link;

                      return (
                        <div
                          key={link.link_id}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                        >
                          <div className="px-6 py-4">
                            {!isEditing ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                                    <Share2 className="w-6 h-6 text-gray-600" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                      {link.platform_name}
                                      {link.is_active ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                                          <Eye className="w-3 h-3" />
                                          Active
                                        </span>
                                      ) : (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex items-center gap-1">
                                          <EyeOff className="w-3 h-3" />
                                          Hidden
                                        </span>
                                      )}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                      <a href={link.platform_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {link.platform_url}
                                      </a>
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                      <span>Order: {link.display_order}</span>
                                      <span>Icon: {link.icon_type === 'lucide' ? link.icon_name : 'Custom'}</span>
                                      <span>Color: {link.hover_color}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => startEditSocialLink(link)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSocialLink(link.link_id, link.platform_name)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                      Platform Name
                                    </label>
                                    <input
                                      type="text"
                                      value={currentData.platform_name || ''}
                                      onChange={(e) => handleSocialLinkFieldChange('platform_name', e.target.value)}
                                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                      Platform URL
                                    </label>
                                    <input
                                      type="url"
                                      value={currentData.platform_url || ''}
                                      onChange={(e) => handleSocialLinkFieldChange('platform_url', e.target.value)}
                                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                      Icon Type
                                    </label>
                                    <select
                                      value={currentData.icon_type || 'lucide'}
                                      onChange={(e) => handleSocialLinkFieldChange('icon_type', e.target.value as 'lucide' | 'custom')}
                                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                    >
                                      <option value="lucide">Lucide Icon</option>
                                      <option value="custom">Custom Image</option>
                                    </select>
                                  </div>
                                  {currentData.icon_type === 'lucide' ? (
                                    <div>
                                      <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Icon Name
                                      </label>
                                      <input
                                        type="text"
                                        value={currentData.icon_name || ''}
                                        onChange={(e) => handleSocialLinkFieldChange('icon_name', e.target.value)}
                                        placeholder="e.g., Instagram, Facebook, Twitter"
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                      />
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <label className="block text-sm font-medium text-gray-900">
                                        Icon Image
                                      </label>
                                      
                                      {/* File Upload Button */}
                                      <div className="flex items-center gap-3">
                                        <label className="flex-1 cursor-pointer">
                                          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                              {uploadingIcon ? 'Uploading...' : 'Upload Image'}
                                            </span>
                                          </div>
                                          <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml"
                                            onChange={(e) => handleIconFileUpload(e, true)}
                                            disabled={uploadingIcon}
                                            className="hidden"
                                          />
                                        </label>
                                        
                                        {/* Preview */}
                                        {(editUploadedIconUrl || currentData.icon_url) && (
                                          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border-2 border-green-200 rounded-lg">
                                            <ImageIcon className="w-4 h-4 text-green-600" />
                                            <span className="text-xs text-green-700 font-medium">Uploaded</span>
                                          </div>
                                        )}
                                      </div>

                                      {/* Manual URL Input */}
                                      <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                          Or enter URL manually:
                                        </label>
                                        <input
                                          type="text"
                                          value={currentData.icon_url || ''}
                                          onChange={(e) => handleSocialLinkFieldChange('icon_url', e.target.value)}
                                          placeholder="/uploads/social-icons/..."
                                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm"
                                        />
                                      </div>

                                      {/* Image Preview */}
                                      {currentData.icon_url && (
                                        <div className="mt-2">
                                          <p className="text-xs text-gray-600 mb-2">Preview:</p>
                                          <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden">
                                            <img 
                                              src={currentData.icon_url} 
                                              alt="Icon preview" 
                                              className="w-full h-full object-contain"
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                              }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                      Hover Color (Hex)
                                    </label>
                                    <input
                                      type="text"
                                      value={currentData.hover_color || '#3b82f6'}
                                      onChange={(e) => handleSocialLinkFieldChange('hover_color', e.target.value)}
                                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                      Display Order
                                    </label>
                                    <input
                                      type="number"
                                      value={currentData.display_order || 0}
                                      onChange={(e) => handleSocialLinkFieldChange('display_order', parseInt(e.target.value))}
                                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id={`is-active-${link.link_id}`}
                                    checked={currentData.is_active !== false}
                                    onChange={(e) => handleSocialLinkFieldChange('is_active', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <label htmlFor={`is-active-${link.link_id}`} className="text-sm font-medium text-gray-900">
                                    Active (visible in footer)
                                  </label>
                                </div>
                                <div className="flex gap-3 pt-4">
                                  <button
                                    onClick={saveSocialLink}
                                    disabled={updateSocialLinkMutation.isPending}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                  >
                                    {updateSocialLinkMutation.isPending ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                      </>
                                    ) : (
                                      <>
                                        <Check className="w-4 h-4" />
                                        Save Changes
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={cancelEditSocialLink}
                                    disabled={updateSocialLinkMutation.isPending}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {socialLinks?.length === 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-12 text-center">
                          <Share2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Social Links Yet</h3>
                          <p className="text-sm text-gray-600 mb-6">
                            Add your first social media link to display in the footer.
                          </p>
                          <button
                            onClick={() => setShowAddSocialLink(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add Social Link
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
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