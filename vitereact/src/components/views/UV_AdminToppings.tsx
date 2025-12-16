import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Topping {
  topping_id: string;
  topping_name: string;
  topping_type: 'topping' | 'sauce';
  price: number;
  is_available: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface ToppingFormData {
  topping_id: string | null;
  topping_name: string;
  topping_type: 'topping' | 'sauce';
  price: number;
  is_available: boolean;
  display_order: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminToppings: React.FC = () => {
  const queryClient = useQueryClient();

  // Global state access
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);
  const showConfirmation = useAppStore(state => state.show_confirmation);
  const hideConfirmation = useAppStore(state => state.hide_confirmation);

  // State variables
  const [toppingFormModalOpen, setToppingFormModalOpen] = useState(false);
  const [toppingFormMode, setToppingFormMode] = useState<'create' | 'edit'>('create');
  const [toppingFormData, setToppingFormData] = useState<ToppingFormData>({
    topping_id: null,
    topping_name: '',
    topping_type: 'topping',
    price: 0,
    is_available: true,
    display_order: 0
  });
  const [filterType, setFilterType] = useState<'all' | 'topping' | 'sauce'>('all');

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const fetchToppings = async () => {
    const params: Record<string, string> = {
      limit: '100',
      offset: '0'
    };

    if (filterType !== 'all') {
      params.topping_type = filterType;
    }

    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/toppings`,
      { params }
    );

    return response.data;
  };

  const createTopping = async (data: ToppingFormData) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/toppings`,
      data,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  };

  const updateTopping = async (data: ToppingFormData) => {
    const response = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/toppings/${data.topping_id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  };

  const deleteTopping = async (topping_id: string) => {
    const response = await axios.delete(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/toppings/${topping_id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  };

  // ============================================================================
  // REACT QUERY HOOKS
  // ============================================================================

  const { data: toppings = [], isLoading: toppingsLoading } = useQuery({
    queryKey: ['toppings', filterType],
    queryFn: fetchToppings,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  const createToppingMutation = useMutation({
    mutationFn: createTopping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toppings'] });
      setToppingFormModalOpen(false);
      resetToppingForm();
      showToast('success', 'Topping created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create topping';
      showToast('error', message);
    }
  });

  const updateToppingMutation = useMutation({
    mutationFn: updateTopping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toppings'] });
      setToppingFormModalOpen(false);
      resetToppingForm();
      showToast('success', 'Topping updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update topping';
      showToast('error', message);
    }
  });

  const deleteToppingMutation = useMutation({
    mutationFn: deleteTopping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['toppings'] });
      showToast('success', 'Topping deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete topping';
      showToast('error', message);
    }
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const resetToppingForm = () => {
    setToppingFormData({
      topping_id: null,
      topping_name: '',
      topping_type: 'topping',
      price: 0,
      is_available: true,
      display_order: 0
    });
  };

  const openCreateModal = () => {
    resetToppingForm();
    setToppingFormMode('create');
    setToppingFormModalOpen(true);
  };

  const openEditModal = (topping: Topping) => {
    setToppingFormData({
      topping_id: topping.topping_id,
      topping_name: topping.topping_name,
      topping_type: topping.topping_type,
      price: topping.price,
      is_available: topping.is_available,
      display_order: topping.display_order
    });
    setToppingFormMode('edit');
    setToppingFormModalOpen(true);
  };

  const handleFormChange = (key: keyof ToppingFormData, value: any) => {
    setToppingFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!toppingFormData.topping_name.trim()) {
      showToast('error', 'Please enter a topping name');
      return;
    }

    if (toppingFormMode === 'create') {
      createToppingMutation.mutate(toppingFormData);
    } else {
      updateToppingMutation.mutate(toppingFormData);
    }
  };

  const handleDeleteTopping = (topping: Topping) => {
    showConfirmation({
      title: 'Delete Topping',
      message: `Are you sure you want to delete "${topping.topping_name}"? This will remove it from all products.`,
      confirm_text: 'Delete Topping',
      cancel_text: 'Cancel',
      danger_action: true,
      on_confirm: () => {
        deleteToppingMutation.mutate(topping.topping_id);
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      }
    });
  };

  // Split toppings by type
  const toppingsList = toppings.filter((t: Topping) => t.topping_type === 'topping');
  const saucesList = toppings.filter((t: Topping) => t.topping_type === 'sauce');

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Toppings & Sauces</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage toppings and sauces that customers can add to products
                </p>
              </div>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Topping/Sauce
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  filterType === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All ({toppings.length})
              </button>
              <button
                onClick={() => setFilterType('topping')}
                className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  filterType === 'topping'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Toppings ({toppingsList.length})
              </button>
              <button
                onClick={() => setFilterType('sauce')}
                className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  filterType === 'sauce'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Sauces ({saucesList.length})
              </button>
            </div>
          </div>
        </div>

        {/* Toppings List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {toppingsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading toppings...</p>
              </div>
            </div>
          ) : toppings.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Toppings Found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first topping or sauce</p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Topping/Sauce
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Display Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {toppings.map((topping: Topping) => (
                    <tr key={topping.topping_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{topping.topping_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          topping.topping_type === 'topping' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {topping.topping_type === 'topping' ? '🍫 Topping' : '🍯 Sauce'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {topping.price === 0 ? 'Free' : `€${topping.price.toFixed(2)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{topping.display_order}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {topping.is_available ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Available
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Unavailable
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(topping)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors mr-2"
                        >
                          <Edit2 className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTopping(topping)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Form Modal */}
        {toppingFormModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Backdrop */}
              <div 
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => setToppingFormModalOpen(false)}
              />

              {/* Modal Panel */}
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-white">
                      {toppingFormMode === 'create' ? 'Add Topping/Sauce' : 'Edit Topping/Sauce'}
                    </h3>
                    <button
                      onClick={() => setToppingFormModalOpen(false)}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmitForm} className="px-6 py-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={toppingFormData.topping_name}
                        onChange={(e) => handleFormChange('topping_name', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g., Kinder Bueno"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={toppingFormData.topping_type}
                        onChange={(e) => handleFormChange('topping_type', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="topping">Topping</option>
                        <option value="sauce">Sauce</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (€) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={toppingFormData.price}
                        onChange={(e) => handleFormChange('price', parseFloat(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                      <p className="mt-1 text-xs text-gray-500">Price charged when added as an extra. Set to 0 for free.</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={toppingFormData.display_order}
                        onChange={(e) => handleFormChange('display_order', parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                      <p className="mt-1 text-xs text-gray-500">Lower numbers appear first</p>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={toppingFormData.is_available}
                        onChange={(e) => handleFormChange('is_available', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-3 text-sm font-medium text-gray-900">
                        Available for customers
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="mt-6 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setToppingFormModalOpen(false)}
                      className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createToppingMutation.isPending || updateToppingMutation.isPending}
                      className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {toppingFormMode === 'create' ? 'Create' : 'Update'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_AdminToppings;
