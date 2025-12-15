import React, { useState } from 'react';
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
  Check
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
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      // Initialize form with fetched data
      setFormData(data);
    }
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
      <div className="min-h-screen bg-luxury-darkCocoa py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-luxury rounded-xl shadow-luxury p-8 animate-pulse">
            <div className="h-8 bg-luxury-gold-500/20 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-luxury-gold-500/10 rounded"></div>
              <div className="h-12 bg-luxury-gold-500/10 rounded"></div>
              <div className="h-32 bg-luxury-gold-500/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (sectionError) {
    return (
      <div className="min-h-screen bg-luxury-darkCocoa py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="glass-luxury border-2 border-red-500/50 rounded-xl p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 font-medium">Failed to load homepage section</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-darkCocoa py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-luxury-champagne mb-2">
            Landing Page Content
          </h1>
          <p className="text-luxury-champagne/70 font-sans">
            Manage the "Corporate & Event Orders" section on the homepage
          </p>
        </div>

        {/* Form */}
        <div className="glass-luxury rounded-xl shadow-luxury-lg p-6 md:p-8 space-y-6">
          
          {/* Section Visibility Toggle */}
          <div className="flex items-center justify-between p-4 glass-luxury-darker rounded-lg border border-luxury-gold-500/30">
            <div>
              <label className="font-semibold text-luxury-champagne font-sans">
                Section Visibility
              </label>
              <p className="text-sm text-luxury-champagne/60 mt-1 font-sans">
                {formData.is_enabled ? 'Section is visible on the homepage' : 'Section is hidden from the homepage'}
              </p>
            </div>
            <button
              onClick={() => handleFieldChange('is_enabled', !formData.is_enabled)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-sans ${
                formData.is_enabled
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              {formData.is_enabled ? (
                <>
                  <Eye className="h-5 w-5" />
                  <span>Visible</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-5 w-5" />
                  <span>Hidden</span>
                </>
              )}
            </button>
          </div>

          {/* Section Title */}
          <div>
            <label className="block text-sm font-medium text-luxury-champagne mb-2 font-sans">
              Section Title
            </label>
            <input
              type="text"
              value={formData.section_title || ''}
              onChange={(e) => handleFieldChange('section_title', e.target.value)}
              className="w-full px-4 py-3 bg-luxury-darkCharcoal border border-luxury-gold-500/30 rounded-lg text-luxury-champagne placeholder-luxury-champagne/40 focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 font-sans"
              placeholder="Corporate & Event Orders"
            />
          </div>

          {/* Section Subtitle */}
          <div>
            <label className="block text-sm font-medium text-luxury-champagne mb-2 font-sans">
              Section Subtitle <span className="text-luxury-champagne/50">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.section_subtitle || ''}
              onChange={(e) => handleFieldChange('section_subtitle', e.target.value)}
              className="w-full px-4 py-3 bg-luxury-darkCharcoal border border-luxury-gold-500/30 rounded-lg text-luxury-champagne placeholder-luxury-champagne/40 focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 font-sans"
              placeholder="Make your special occasions unforgettable..."
            />
          </div>

          {/* Divider */}
          <div className="border-t border-luxury-gold-500/20 my-6"></div>

          {/* Card Title */}
          <div>
            <label className="block text-sm font-medium text-luxury-champagne mb-2 font-sans">
              Card Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.card_title || ''}
              onChange={(e) => handleFieldChange('card_title', e.target.value)}
              className="w-full px-4 py-3 bg-luxury-darkCharcoal border border-luxury-gold-500/30 rounded-lg text-luxury-champagne placeholder-luxury-champagne/40 focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 font-sans"
              placeholder="Winter Spice Loaf"
              required
            />
          </div>

          {/* Card Description */}
          <div>
            <label className="block text-sm font-medium text-luxury-champagne mb-2 font-sans">
              Card Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={formData.card_description || ''}
              onChange={(e) => handleFieldChange('card_description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-luxury-darkCharcoal border border-luxury-gold-500/30 rounded-lg text-luxury-champagne placeholder-luxury-champagne/40 focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 font-sans"
              placeholder="Elevate your corporate events, celebrations, and special occasions..."
              required
            />
          </div>

          {/* Card Image */}
          <div>
            <label className="block text-sm font-medium text-luxury-champagne mb-2 font-sans">
              Card Image <span className="text-red-400">*</span>
            </label>
            
            {/* Image upload mode toggle */}
            <div className="flex space-x-2 mb-3">
              <button
                onClick={() => setImageUploadMode('url')}
                className={`px-4 py-2 rounded-lg transition-colors font-sans ${
                  imageUploadMode === 'url'
                    ? 'gradient-gold text-luxury-darkCharcoal'
                    : 'bg-luxury-darkCharcoal text-luxury-champagne border border-luxury-gold-500/30 hover:border-luxury-gold-500'
                }`}
              >
                <LinkIcon className="h-4 w-4 inline mr-2" />
                Image URL
              </button>
              <button
                onClick={() => setImageUploadMode('upload')}
                className={`px-4 py-2 rounded-lg transition-colors font-sans ${
                  imageUploadMode === 'upload'
                    ? 'gradient-gold text-luxury-darkCharcoal'
                    : 'bg-luxury-darkCharcoal text-luxury-champagne border border-luxury-gold-500/30 hover:border-luxury-gold-500'
                }`}
              >
                <Upload className="h-4 w-4 inline mr-2" />
                Upload
              </button>
            </div>

            {/* URL input */}
            {imageUploadMode === 'url' && (
              <input
                type="text"
                value={formData.card_image_url || ''}
                onChange={(e) => handleFieldChange('card_image_url', e.target.value)}
                className="w-full px-4 py-3 bg-luxury-darkCharcoal border border-luxury-gold-500/30 rounded-lg text-luxury-champagne placeholder-luxury-champagne/40 focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 font-sans"
                placeholder="https://images.unsplash.com/..."
                required
              />
            )}

            {/* File upload */}
            {imageUploadMode === 'upload' && (
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                  className="w-full px-4 py-3 bg-luxury-darkCharcoal border border-luxury-gold-500/30 rounded-lg text-luxury-champagne file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-luxury-gold-500 file:text-luxury-darkCharcoal hover:file:bg-luxury-gold-600 disabled:opacity-50 font-sans"
                />
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-luxury-darkCharcoal/80 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-gold-500"></div>
                  </div>
                )}
              </div>
            )}

            {/* Image preview */}
            {(uploadedImagePreview || formData.card_image_url) && (
              <div className="mt-4">
                <img
                  src={uploadedImagePreview || formData.card_image_url}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg border border-luxury-gold-500/30"
                />
              </div>
            )}
          </div>

          {/* Special Price */}
          <div>
            <label className="block text-sm font-medium text-luxury-champagne mb-2 font-sans">
              Special Price <span className="text-luxury-champagne/50">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.special_price || ''}
              onChange={(e) => handleFieldChange('special_price', e.target.value)}
              className="w-full px-4 py-3 bg-luxury-darkCharcoal border border-luxury-gold-500/30 rounded-lg text-luxury-champagne placeholder-luxury-champagne/40 focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 font-sans"
              placeholder="€24.99"
            />
          </div>

          {/* Available Until */}
          <div>
            <label className="block text-sm font-medium text-luxury-champagne mb-2 font-sans">
              Available Until <span className="text-luxury-champagne/50">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.available_until || ''}
              onChange={(e) => handleFieldChange('available_until', e.target.value)}
              className="w-full px-4 py-3 bg-luxury-darkCharcoal border border-luxury-gold-500/30 rounded-lg text-luxury-champagne placeholder-luxury-champagne/40 focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 font-sans"
              placeholder="Dec 31"
            />
            <p className="mt-2 text-sm text-luxury-champagne/50 font-sans">
              This is a display-only field. Enter text like "Dec 31" or "End of Month"
            </p>
          </div>

          {/* Divider */}
          <div className="border-t border-luxury-gold-500/20 my-6"></div>

          {/* CTA Text */}
          <div>
            <label className="block text-sm font-medium text-luxury-champagne mb-2 font-sans">
              Call-to-Action Button Text <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.cta_text || ''}
              onChange={(e) => handleFieldChange('cta_text', e.target.value)}
              className="w-full px-4 py-3 bg-luxury-darkCharcoal border border-luxury-gold-500/30 rounded-lg text-luxury-champagne placeholder-luxury-champagne/40 focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 font-sans"
              placeholder="Pre-order Now"
              required
            />
          </div>

          {/* CTA Link */}
          <div>
            <label className="block text-sm font-medium text-luxury-champagne mb-2 font-sans">
              Call-to-Action Button Link <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.cta_link || ''}
              onChange={(e) => handleFieldChange('cta_link', e.target.value)}
              className="w-full px-4 py-3 bg-luxury-darkCharcoal border border-luxury-gold-500/30 rounded-lg text-luxury-champagne placeholder-luxury-champagne/40 focus:outline-none focus:ring-2 focus:ring-luxury-gold-500 font-sans"
              placeholder="/corporate-order"
              required
            />
            <p className="mt-2 text-sm text-luxury-champagne/50 font-sans">
              Use internal routes like "/corporate-order" or external URLs like "https://example.com"
            </p>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-luxury-gold-500/20">
            <button
              onClick={handleSaveChanges}
              disabled={updateSectionMutation.isLoading || !formData.card_title || !formData.card_description || !formData.card_image_url || !formData.cta_text || !formData.cta_link}
              className="w-full gradient-gold text-luxury-darkCharcoal font-semibold px-6 py-4 rounded-xl shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-sans"
            >
              {updateSectionMutation.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-luxury-darkCharcoal"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>

          {/* Info box */}
          <div className="glass-luxury-darker rounded-lg p-4 border border-luxury-gold-500/30">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-luxury-gold-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-luxury-champagne/70 font-sans">
                <p className="font-semibold text-luxury-champagne mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Changes take effect immediately on the homepage</li>
                  <li>If section is disabled, it will be completely hidden from visitors</li>
                  <li>Special price and "Available Until" are optional display fields</li>
                  <li>Recommended image size: 800x600px or larger</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UV_AdminHomepage;
