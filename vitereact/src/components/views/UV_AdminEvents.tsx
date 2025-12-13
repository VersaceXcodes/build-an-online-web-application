import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  Calendar,
  MapPin,
  Edit,
  Check,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ExternalLink,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface StallEvent {
  event_id: string;
  event_name: string;
  venue_location: string;
  event_date: string;
  event_time: string;
  description: string | null;
  event_image_url: string | null;
  cta_button_text: string | null;
  cta_button_action: string | null;
  cta_button_url: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchStallEvents = async (token: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/stall-events`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data as StallEvent[];
};

const createStallEvent = async (token: string, eventData: Partial<StallEvent>) => {
  const { data } = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/stall-events`,
    eventData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data as StallEvent;
};

const updateStallEvent = async (token: string, event_id: string, eventData: Partial<StallEvent>) => {
  const { data } = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/stall-events/${event_id}`,
    eventData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data as StallEvent;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminEvents: React.FC = () => {
  const queryClient = useQueryClient();

  // CRITICAL: Individual Zustand selectors
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);

  // Local state
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventData, setEditingEventData] = useState<Partial<StallEvent>>({});
  const [showAddEvent, setShowAddEvent] = useState<boolean>(false);
  const [newEventData, setNewEventData] = useState<Partial<StallEvent>>({
    is_visible: true, // Default to visible so events appear on landing page immediately
    cta_button_action: 'internal_link'
  });
  const [imageUploadMode, setImageUploadMode] = useState<'url' | 'upload'>('url');
  const [editImageUploadMode, setEditImageUploadMode] = useState<'url' | 'upload'>('url');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [editUploadedImagePreview, setEditUploadedImagePreview] = useState<string | null>(null);

  // React Query - Fetch events
  const {
    data: events,
    isLoading: loadingEvents,
    error: eventsError
  } = useQuery({
    queryKey: ['admin-stall-events'],
    queryFn: () => fetchStallEvents(authToken!),
    enabled: !!authToken,
    staleTime: 60000,
    refetchOnWindowFocus: false
  });

  // Mutation - Create event
  const createEventMutation = useMutation({
    mutationFn: (eventData: Partial<StallEvent>) => createStallEvent(authToken!, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stall-events'] });
      queryClient.invalidateQueries({ queryKey: ['stall-event'] });
      showToast('success', 'Event created successfully and is now visible on the landing page');
      setShowAddEvent(false);
      setNewEventData({
        is_visible: true, // Reset to visible default
        cta_button_action: 'internal_link'
      });
      setUploadedImagePreview(null);
      setImageUploadMode('url');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to create event');
    }
  });

  // Mutation - Update event
  const updateEventMutation = useMutation({
    mutationFn: ({ event_id, eventData }: { event_id: string; eventData: Partial<StallEvent> }) =>
      updateStallEvent(authToken!, event_id, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stall-events'] });
      queryClient.invalidateQueries({ queryKey: ['stall-event'] });
      showToast('success', 'Event updated successfully');
      setEditingEventId(null);
      setEditingEventData({});
      setEditUploadedImagePreview(null);
      setEditImageUploadMode('url');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update event');
    }
  });

  // Event handlers
  const startEditEvent = (event: StallEvent) => {
    setEditingEventId(event.event_id);
    setEditingEventData(event);
    setEditUploadedImagePreview(null);
    setEditImageUploadMode('url');
  };

  const cancelEditEvent = () => {
    setEditingEventId(null);
    setEditingEventData({});
    setEditUploadedImagePreview(null);
    setEditImageUploadMode('url');
  };

  const saveEvent = () => {
    if (!editingEventId) return;
    updateEventMutation.mutate({
      event_id: editingEventId,
      eventData: editingEventData
    });
  };

  const handleEventFieldChange = (field: keyof StallEvent, value: any) => {
    setEditingEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNewEventFieldChange = (field: keyof StallEvent, value: any) => {
    setNewEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateEvent = () => {
    if (!newEventData.event_name || !newEventData.venue_location || !newEventData.event_date || !newEventData.event_time) {
      showToast('error', 'Event name, location, date, and time are required');
      return;
    }
    createEventMutation.mutate(newEventData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleImageUpload = async (file: File, isEditMode: boolean = false) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('error', 'Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'File size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/upload-event-image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const imageUrl = response.data.image_url;
      
      if (isEditMode) {
        setEditUploadedImagePreview(imageUrl);
        handleEventFieldChange('event_image_url', imageUrl);
      } else {
        setUploadedImagePreview(imageUrl);
        handleNewEventFieldChange('event_image_url', imageUrl);
      }

      showToast('success', 'Image uploaded successfully');
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Special Event Alerts</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Manage special event cards displayed on the landing page
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

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Loading State */}
          {loadingEvents && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading events...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {eventsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Loading Events</h3>
                  <p className="text-sm text-red-700 mt-1">
                    {(eventsError as any)?.response?.data?.message || 'Failed to load events'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {!loadingEvents && !eventsError && (
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">How Event Alerts Work</h3>
                    <p className="text-sm text-blue-800">
                      Event alerts are displayed as prominent special cards on the landing page. Make sure to check the "Make visible on landing page" checkbox when creating events so customers can see them.
                    </p>
                  </div>
                </div>
              </div>

              {/* Header with Add Button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Event Alerts</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    These alerts appear as special cards on the homepage when marked as visible
                  </p>
                </div>
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Event Alert
                </button>
              </div>

              {/* Add New Event Form */}
              {showAddEvent && (
                <div className="bg-white rounded-xl shadow-sm border-2 border-blue-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" />
                        Create New Event Alert
                      </h3>
                      <button
                        onClick={() => {
                          setShowAddEvent(false);
                          setUploadedImagePreview(null);
                          setImageUploadMode('url');
                        }}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Event Name *
                        </label>
                        <input
                          type="text"
                          value={newEventData.event_name || ''}
                          onChange={(e) => handleNewEventFieldChange('event_name', e.target.value)}
                          placeholder="e.g., Christmas Market"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Venue Location *
                        </label>
                        <input
                          type="text"
                          value={newEventData.venue_location || ''}
                          onChange={(e) => handleNewEventFieldChange('venue_location', e.target.value)}
                          placeholder="e.g., Phoenix Park, Dublin"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Event Date *
                        </label>
                        <input
                          type="date"
                          value={newEventData.event_date || ''}
                          onChange={(e) => handleNewEventFieldChange('event_date', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Event Time *
                        </label>
                        <input
                          type="text"
                          value={newEventData.event_time || ''}
                          onChange={(e) => handleNewEventFieldChange('event_time', e.target.value)}
                          placeholder="e.g., 10:00 AM - 5:00 PM"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Description
                        </label>
                        <textarea
                          value={newEventData.description || ''}
                          onChange={(e) => handleNewEventFieldChange('description', e.target.value)}
                          placeholder="Add event description..."
                          rows={3}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Event Image
                        </label>
                        
                        {/* Toggle between URL and Upload */}
                        <div className="flex gap-2 mb-3">
                          <button
                            type="button"
                            onClick={() => setImageUploadMode('url')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                              imageUploadMode === 'url'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <LinkIcon className="w-4 h-4" />
                            URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageUploadMode('upload')}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                              imageUploadMode === 'upload'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <Upload className="w-4 h-4" />
                            Upload
                          </button>
                        </div>

                        {/* URL Input */}
                        {imageUploadMode === 'url' && (
                          <input
                            type="text"
                            value={newEventData.event_image_url || ''}
                            onChange={(e) => handleNewEventFieldChange('event_image_url', e.target.value)}
                            placeholder="https://..."
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                          />
                        )}

                        {/* File Upload */}
                        {imageUploadMode === 'upload' && (
                          <div>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, false);
                              }}
                              disabled={isUploadingImage}
                              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                            />
                            {isUploadingImage && (
                              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                Uploading...
                              </div>
                            )}
                          </div>
                        )}

                        {/* Image Preview */}
                        {(uploadedImagePreview || newEventData.event_image_url) && (
                          <div className="mt-3">
                            <img
                              src={uploadedImagePreview || newEventData.event_image_url}
                              alt="Event preview"
                              className="max-w-xs h-32 object-cover rounded-lg border-2 border-gray-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Call-to-Action Button Text
                        </label>
                        <input
                          type="text"
                          value={newEventData.cta_button_text || ''}
                          onChange={(e) => handleNewEventFieldChange('cta_button_text', e.target.value)}
                          placeholder="e.g., Learn More"
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Button Action Type
                        </label>
                        <select
                          value={newEventData.cta_button_action || 'internal_link'}
                          onChange={(e) => handleNewEventFieldChange('cta_button_action', e.target.value)}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        >
                          <option value="internal_link">Internal Link</option>
                          <option value="external_link">External Link</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-2">
                          Button URL
                        </label>
                        <input
                          type="text"
                          value={newEventData.cta_button_url || ''}
                          onChange={(e) => handleNewEventFieldChange('cta_button_url', e.target.value)}
                          placeholder={newEventData.cta_button_action === 'external_link' ? 'https://...' : '/location/...'}
                          className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <input
                        type="checkbox"
                        id="new-is-visible"
                        checked={newEventData.is_visible === true}
                        onChange={(e) => handleNewEventFieldChange('is_visible', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="new-is-visible" className="text-sm font-medium text-gray-900">
                        <span className="text-blue-600 font-semibold">✓</span> Make visible on landing page
                      </label>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleCreateEvent}
                        disabled={createEventMutation.isPending}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {createEventMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Create Event
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowAddEvent(false);
                          setUploadedImagePreview(null);
                          setImageUploadMode('url');
                        }}
                        disabled={createEventMutation.isPending}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Events List */}
              <div className="space-y-4">
                {events?.map((event) => {
                  const isEditing = editingEventId === event.event_id;
                  const currentData = isEditing ? editingEventData : event;

                  return (
                    <div
                      key={event.event_id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                    >
                      <div className="px-6 py-4">
                        {!isEditing ? (
                          <div className="space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-semibold text-gray-900">
                                    {event.event_name}
                                  </h3>
                                  {event.is_visible ? (
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      Visible
                                    </span>
                                  ) : (
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex items-center gap-1">
                                      <EyeOff className="w-3 h-3" />
                                      Hidden
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>{event.venue_location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span>{formatDate(event.event_date)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span>{event.event_time}</span>
                                  </div>
                                  {event.description && (
                                    <p className="mt-2 text-gray-700">{event.description}</p>
                                  )}
                                  {event.cta_button_text && event.cta_button_url && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <LinkIcon className="w-4 h-4 text-gray-400" />
                                      <span className="font-medium">Button:</span>
                                      <span>{event.cta_button_text}</span>
                                      {event.cta_button_action === 'external_link' && (
                                        <ExternalLink className="w-3 h-3 text-gray-400" />
                                      )}
                                    </div>
                                  )}
                                  {event.event_image_url && (
                                    <div className="flex items-center gap-2">
                                      <ImageIcon className="w-4 h-4 text-gray-400" />
                                      <a href={event.event_image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                        View Image
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEditEvent(event)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Event Name
                                </label>
                                <input
                                  type="text"
                                  value={currentData.event_name || ''}
                                  onChange={(e) => handleEventFieldChange('event_name', e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Venue Location
                                </label>
                                <input
                                  type="text"
                                  value={currentData.venue_location || ''}
                                  onChange={(e) => handleEventFieldChange('venue_location', e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Event Date
                                </label>
                                <input
                                  type="date"
                                  value={currentData.event_date || ''}
                                  onChange={(e) => handleEventFieldChange('event_date', e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Event Time
                                </label>
                                <input
                                  type="text"
                                  value={currentData.event_time || ''}
                                  onChange={(e) => handleEventFieldChange('event_time', e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Description
                                </label>
                                <textarea
                                  value={currentData.description || ''}
                                  onChange={(e) => handleEventFieldChange('description', e.target.value)}
                                  rows={3}
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Event Image
                                </label>
                                
                                {/* Toggle between URL and Upload */}
                                <div className="flex gap-2 mb-3">
                                  <button
                                    type="button"
                                    onClick={() => setEditImageUploadMode('url')}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                      editImageUploadMode === 'url'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    <LinkIcon className="w-4 h-4" />
                                    URL
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditImageUploadMode('upload')}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                                      editImageUploadMode === 'upload'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    <Upload className="w-4 h-4" />
                                    Upload
                                  </button>
                                </div>

                                {/* URL Input */}
                                {editImageUploadMode === 'url' && (
                                  <input
                                    type="text"
                                    value={currentData.event_image_url || ''}
                                    onChange={(e) => handleEventFieldChange('event_image_url', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                  />
                                )}

                                {/* File Upload */}
                                {editImageUploadMode === 'upload' && (
                                  <div>
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleImageUpload(file, true);
                                      }}
                                      disabled={isUploadingImage}
                                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                                    />
                                    {isUploadingImage && (
                                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        Uploading...
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Image Preview */}
                                {(editUploadedImagePreview || currentData.event_image_url) && (
                                  <div className="mt-3">
                                    <img
                                      src={editUploadedImagePreview || currentData.event_image_url}
                                      alt="Event preview"
                                      className="max-w-xs h-32 object-cover rounded-lg border-2 border-gray-200"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Call-to-Action Button Text
                                </label>
                                <input
                                  type="text"
                                  value={currentData.cta_button_text || ''}
                                  onChange={(e) => handleEventFieldChange('cta_button_text', e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Button Action Type
                                </label>
                                <select
                                  value={currentData.cta_button_action || 'internal_link'}
                                  onChange={(e) => handleEventFieldChange('cta_button_action', e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                >
                                  <option value="internal_link">Internal Link</option>
                                  <option value="external_link">External Link</option>
                                </select>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                  Button URL
                                </label>
                                <input
                                  type="text"
                                  value={currentData.cta_button_url || ''}
                                  onChange={(e) => handleEventFieldChange('cta_button_url', e.target.value)}
                                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`is-visible-${event.event_id}`}
                                checked={currentData.is_visible === true}
                                onChange={(e) => handleEventFieldChange('is_visible', e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <label htmlFor={`is-visible-${event.event_id}`} className="text-sm font-medium text-gray-900">
                                <span className="text-blue-600 font-semibold">✓</span> Make visible on landing page
                              </label>
                            </div>
                            <div className="flex gap-3 pt-4">
                              <button
                                onClick={saveEvent}
                                disabled={updateEventMutation.isPending}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                              >
                                {updateEventMutation.isPending ? (
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
                                onClick={cancelEditEvent}
                                disabled={updateEventMutation.isPending}
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

                {events?.length === 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-12 text-center">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Yet</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Create your first event alert to display on the homepage.
                      </p>
                      <button
                        onClick={() => setShowAddEvent(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Event Alert
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_AdminEvents;
