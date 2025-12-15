import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  Save,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  AlertCircle,
  Check,
  Edit
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface HomepageCorporateSection {
  id: number;
  section_title: string;
  section_subtitle: string | null;
  card_title: string;
  card_description: string;
  card_image_url: string;
  special_price: string | null;
  available_until: string | null;
  cta_text: string;
  cta_link: string;
  is_enabled: boolean;
  updated_at: string;
  created_at: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchCorporateSection = async (token: string): Promise<HomepageCorporateSection> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/homepage/corporate-section`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};

const updateCorporateSection = async (token: string, sectionData: Partial<HomepageCorporateSection>): Promise<HomepageCorporateSection> => {
  const { data } = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/homepage/corporate-section`,
    sectionData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};

const uploadImage = async (token: string, file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/upload/event-image`,
    formData,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    }
  );
  return data.url;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminHomepage: React.FC = () => {
  const queryClient = useQueryClient();

  // CRITICAL: Individual Zustand selectors
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);

  // Local state for form
  const [formData, setFormData] = useState<Partial<HomepageCorporateSection>>({});
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  // React Query - Fetch section
  const {
    data: section,
    isLoading: loadingSection,
    error: sectionError
  } = useQuery({
    queryKey: ['admin-homepage-corporate-section'],
    queryFn: () => fetchCorporateSection(authToken!),
    enabled: !!authToken,
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  // Initialize form data when section loads
  React.useEffect(() => {
    if (section) {
      setFormData(section);
    }
  }, [section]);

  // Mutation - Update section
  const updateSectionMutation = useMutation({
    mutationFn: (sectionData: Partial<HomepageCorporateSection>) => updateCorporateSection(authToken!, sectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-homepage-corporate-section'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-corporate-section'] });
      showToast('success', 'Homepage section updated successfully');
      setUploadedImagePreview(null);
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update section');
    }
  });

  // Event handlers
  const handleFieldChange = (field: keyof HomepageCorporateSection, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = () => {
    updateSectionMutation.mutate(formData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 5MB');
      return;
    }

    try {
      setIsUploadingImage(true);
      const imageUrl = await uploadImage(authToken!, file);
      handleFieldChange('card_image_url', imageUrl);
      setUploadedImagePreview(imageUrl);
      showToast('success', 'Image uploaded successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Loading state
  if (loadingSection) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state - show friendly message directing to Event Alerts
  if (sectionError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-6">
              <AlertCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Homepage Content Management
              </h2>
              <p className="text-gray-600">
                Control your homepage Corporate & Event Orders section through Event Alerts
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Manage Homepage Content</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Go to the <strong>Event Alerts</strong> page</li>
                <li>Create a new event or edit an existing one</li>
                <li>Check the <strong>"Use as Drop of the Month"</strong> option</li>
                <li>Fill in the special price, available until date, and pre-order button details</li>
                <li>Save the event - it will automatically appear in the homepage Corporate & Event Orders section</li>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <p>Only ONE event can be marked as "Drop of the Month" at a time. When you mark a new event, any previously marked event will automatically be unmarked.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to="/admin/events"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Go to Event Alerts
              </Link>
              <Link
                to="/admin/dashboard"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If no data but no error, show the same helpful message
  if (!loadingSection && !section) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
            <div className="text-center mb-6">
              <AlertCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                No Homepage Content Configured
              </h2>
              <p className="text-gray-600">
                Set up your homepage Corporate & Event Orders section through Event Alerts
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Set Up Homepage Content</h3>
              <ol className="list-decimal list-inside space-y-2 text-blue-800">
                <li>Go to the <strong>Event Alerts</strong> page</li>
                <li>Create a new event or edit an existing one</li>
                <li>Check the <strong>"Use as Drop of the Month"</strong> option</li>
                <li>Fill in the special price, available until date, and pre-order button details</li>
                <li>Make sure the event is marked as <strong>"Make visible on landing page"</strong></li>
                <li>Save the event - it will automatically appear in the homepage Corporate & Event Orders section</li>
              </ol>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <p>Only ONE event can be marked as "Drop of the Month" at a time. When you mark a new event, any previously marked event will automatically be unmarked.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to="/admin/events"
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
              >
                Go to Event Alerts
              </Link>
              <Link
                to="/admin/dashboard"
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Landing Page Content
          </h1>
          <p className="text-gray-600">
            Viewing Drop of the Month - Edit in Event Alerts
          </p>
        </div>

        {/* Read-only Display */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6">
          
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Viewing Drop of the Month Event</p>
                <p>This content is managed through Event Alerts. Click "Edit in Event Alerts" below to make changes.</p>
              </div>
            </div>
          </div>
          
          {/* Section Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <label className="font-semibold text-gray-900">
                Section Visibility
              </label>
              <p className="text-sm text-gray-600 mt-1">
                {formData.is_enabled ? 'Section is visible on the homepage' : 'Section is hidden from the homepage'}
              </p>
            </div>
            <span
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                formData.is_enabled
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {formData.is_enabled ? (
                <>
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">Visible</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-5 w-5" />
                  <span className="font-medium">Hidden</span>
                </>
              )}
            </span>
          </div>

          {/* Read-only fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {formData.card_title || 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 whitespace-pre-wrap">
                {formData.card_description || 'N/A'}
              </div>
            </div>

            {formData.card_image_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                <img
                  src={formData.card_image_url}
                  alt="Event preview"
                  className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}

            {formData.special_price && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Price</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  €{formData.special_price}
                </div>
              </div>
            )}

            {formData.available_until && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Until</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                  {new Date(formData.available_until).toLocaleDateString('en-IE', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pre-order Button Label</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {formData.cta_text || 'N/A'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pre-order Button URL</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                {formData.cta_link || 'N/A'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-200 flex gap-3">
            <Link
              to="/admin/events"
              className="flex-1 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2"
            >
              <Edit className="h-5 w-5" />
              Edit in Event Alerts
            </Link>
            <Link
              to="/admin/dashboard"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UV_AdminHomepage;
