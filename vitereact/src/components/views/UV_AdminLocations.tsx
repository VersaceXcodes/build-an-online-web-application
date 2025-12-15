import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { MapPin, Plus, Edit, Trash2, Clock, Save, X, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Types
interface Location {
  location_id: string;
  location_name: string;
  slug: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone_number: string;
  email: string;
  is_collection_enabled: boolean;
  is_delivery_enabled: boolean;
  is_active: boolean;
  delivery_radius_km: number | null;
  delivery_fee: number | null;
  free_delivery_threshold: number | null;
  estimated_delivery_time_minutes: number | null;
  estimated_preparation_time_minutes: number;
  created_at: string;
  updated_at: string;
}

interface OpeningHour {
  id?: string;
  location_id?: string;
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// API Functions
const fetchLocations = async (token: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data as Location[];
};

const fetchOpeningHours = async (token: string, location_id: string) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations/${location_id}/opening-hours`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data as OpeningHour[];
};

const updateLocation = async (token: string, location_id: string, locationData: Partial<Location>) => {
  const { data } = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations/${location_id}`,
    locationData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

const updateOpeningHours = async (token: string, location_id: string, hours: OpeningHour[]) => {
  const { data} = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations/${location_id}/opening-hours`,
    { hours },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};

const UV_AdminLocations: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showNotification = useAppStore(state => state.show_notification);
  const queryClient = useQueryClient();
  
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [editingHours, setEditingHours] = useState(false);
  const [formData, setFormData] = useState<Partial<Location>>({});
  const [hoursData, setHoursData] = useState<OpeningHour[]>([]);

  // Fetch locations
  const { data: locations, isLoading } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: () => fetchLocations(authToken!),
    enabled: !!authToken,
  });

  // Fetch opening hours for selected location
  const { data: openingHours } = useQuery({
    queryKey: ['opening-hours', selectedLocation?.location_id],
    queryFn: () => fetchOpeningHours(authToken!, selectedLocation!.location_id),
    enabled: !!authToken && !!selectedLocation,
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: ({ location_id, data }: { location_id: string; data: Partial<Location> }) =>
      updateLocation(authToken!, location_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
      showNotification('Location updated successfully', 'success');
      setSelectedLocation(null);
      setFormData({});
    },
    onError: () => {
      showNotification('Failed to update location', 'error');
    },
  });

  // Update opening hours mutation
  const updateHoursMutation = useMutation({
    mutationFn: ({ location_id, hours }: { location_id: string; hours: OpeningHour[] }) =>
      updateOpeningHours(authToken!, location_id, hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opening-hours', selectedLocation?.location_id] });
      showNotification('Opening hours updated successfully', 'success');
      setEditingHours(false);
    },
    onError: () => {
      showNotification('Failed to update opening hours', 'error');
    },
  });

  // Initialize hours data when opening hours are loaded
  React.useEffect(() => {
    if (openingHours && editingHours) {
      if (openingHours.length > 0) {
        setHoursData(openingHours);
      } else {
        // Initialize with default hours if none exist
        setHoursData(DAYS.map((_, idx) => ({
          day_of_week: idx,
          opens_at: idx === 0 ? null : '09:00',
          closes_at: idx === 0 ? null : '18:00',
          is_closed: idx === 0,
        })));
      }
    }
  }, [openingHours, editingHours]);

  const handleEditLocation = (location: Location) => {
    setSelectedLocation(location);
    setFormData(location);
    setEditingHours(false);
  };

  const handleSaveLocation = () => {
    if (!selectedLocation) return;
    updateLocationMutation.mutate({
      location_id: selectedLocation.location_id,
      data: formData,
    });
  };

  const handleSaveHours = () => {
    if (!selectedLocation) return;
    updateHoursMutation.mutate({
      location_id: selectedLocation.location_id,
      hours: hoursData,
    });
  };

  const handleHourChange = (dayIndex: number, field: keyof OpeningHour, value: any) => {
    setHoursData(prev =>
      prev.map((hour, idx) =>
        idx === dayIndex ? { ...hour, [field]: value } : hour
      )
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-8 w-8" />
          Location Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage location details, contact information, and opening hours
        </p>
      </div>

      {/* Locations Grid */}
      {!selectedLocation ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations?.map(location => (
            <Card key={location.location_id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{location.location_name}</h3>
                  <p className="text-sm text-gray-500">/{location.slug}</p>
                </div>
                <Button
                  onClick={() => handleEditLocation(location)}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {location.city}
                </p>
                <p className="text-gray-600">{location.phone_number}</p>
                <p className="text-gray-600">{location.email}</p>
                <div className="flex gap-2 mt-4">
                  {location.is_collection_enabled && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      Collection
                    </span>
                  )}
                  {location.is_delivery_enabled && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      Delivery
                    </span>
                  )}
                  {!location.is_active && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* Edit Form */
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Edit {selectedLocation.location_name}
            </h2>
            <Button onClick={() => { setSelectedLocation(null); setEditingHours(false); }} variant="ghost">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setEditingHours(false)}
              className={`px-4 py-2 ${!editingHours ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              Location Details
            </button>
            <button
              onClick={() => setEditingHours(true)}
              className={`px-4 py-2 flex items-center gap-2 ${editingHours ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
            >
              <Clock className="h-4 w-4" />
              Opening Hours
            </button>
          </div>

          {!editingHours ? (
            /* Location Details Form */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    value={formData.location_name || ''}
                    onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    value={formData.address_line1 || ''}
                    onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.address_line2 || ''}
                    onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={formData.postal_code || ''}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone_number || ''}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_collection_enabled ?? false}
                      onChange={(e) => setFormData({ ...formData, is_collection_enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Collection Enabled</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_delivery_enabled ?? false}
                      onChange={(e) => setFormData({ ...formData, is_delivery_enabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Delivery Enabled</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active ?? true}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={() => { setSelectedLocation(null); setFormData({}); }} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleSaveLocation} disabled={updateLocationMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          ) : (
            /* Opening Hours Form */
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Day</th>
                      <th className="text-left py-2 px-4">Opens At</th>
                      <th className="text-left py-2 px-4">Closes At</th>
                      <th className="text-left py-2 px-4">Closed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day, idx) => {
                      const hour = hoursData.find(h => h.day_of_week === idx) || {
                        day_of_week: idx,
                        opens_at: null,
                        closes_at: null,
                        is_closed: true,
                      };
                      
                      return (
                        <tr key={idx} className="border-b">
                          <td className="py-2 px-4 font-medium">{day}</td>
                          <td className="py-2 px-4">
                            <input
                              type="time"
                              value={hour.opens_at || ''}
                              onChange={(e) => handleHourChange(idx, 'opens_at', e.target.value)}
                              disabled={hour.is_closed}
                              className="px-2 py-1 border rounded disabled:bg-gray-100"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="time"
                              value={hour.closes_at || ''}
                              onChange={(e) => handleHourChange(idx, 'closes_at', e.target.value)}
                              disabled={hour.is_closed}
                              className="px-2 py-1 border rounded disabled:bg-gray-100"
                            />
                          </td>
                          <td className="py-2 px-4">
                            <input
                              type="checkbox"
                              checked={hour.is_closed}
                              onChange={(e) => handleHourChange(idx, 'is_closed', e.target.checked)}
                              className="rounded"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button onClick={() => setEditingHours(false)} variant="outline">
                  Cancel
                </Button>
                <Button onClick={handleSaveHours} disabled={updateHoursMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Hours
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default UV_AdminLocations;
