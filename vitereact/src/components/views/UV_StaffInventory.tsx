import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  Package, 
  Search, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Edit2
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Product {
  product_id: string;
  product_name: string;
  short_description: string;
  category: string;
  price: number;
  primary_image_url: string | null;
  availability_status: string;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  location_name: string;
  updated_at: string;
}

interface InventoryResponse {
  data: Product[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchInventory = async (params: {
  location_name?: string;
  category?: string;
  search?: string;
  availability_status?: string;
  limit: number;
  offset: number;
  token: string;
}): Promise<InventoryResponse> => {
  const { token, ...queryParams } = params;
  
  const response = await axios.get<InventoryResponse>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/staff/inventory`,
    {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

const updateInventory = async (data: {
  product_id: string;
  location_name: string;
  availability_status?: string;
  stock_quantity?: number;
  token: string;
}): Promise<Product> => {
  const { token, product_id, ...body } = data;
  
  const response = await axios.patch<Product>(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/staff/inventory/${product_id}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  return response.data;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStockStatus = (product: Product): { label: string; color: string; icon: React.ReactNode } => {
  if (product.availability_status === 'out_of_stock' || (product.stock_quantity !== null && product.stock_quantity === 0)) {
    return { 
      label: 'Out of Stock', 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <XCircle className="w-4 h-4" />
    };
  }
  
  if (product.stock_quantity !== null && product.low_stock_threshold !== null && product.stock_quantity <= product.low_stock_threshold) {
    return { 
      label: 'Low Stock', 
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: <AlertCircle className="w-4 h-4" />
    };
  }
  
  return { 
    label: 'In Stock', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle className="w-4 h-4" />
  };
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_StaffInventory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  
  // Zustand store access
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);
  
  // URL-driven state
  const categoryFilter = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  // Local state
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [localSearchInput, setLocalSearchInput] = useState(searchQuery);
  
  const itemsPerPage = 50;
  
  // Get assigned locations
  const assignedLocations = useMemo(() => {
    if (currentUser && 'assigned_locations' in currentUser && Array.isArray((currentUser as any).assigned_locations)) {
      const locations = (currentUser as any).assigned_locations;
      return locations.length > 0 ? locations : [];
    }
    return [];
  }, [currentUser]);
  
  const currentLocationFilter = searchParams.get('location') || assignedLocations[0] || '';
  
  // Build query params
  const queryParams = useMemo(() => ({
    location_name: currentLocationFilter || undefined,
    category: categoryFilter || undefined,
    search: searchQuery || undefined,
    availability_status: statusFilter || undefined,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    token: authToken || '',
  }), [currentLocationFilter, categoryFilter, searchQuery, statusFilter, currentPage, authToken]);
  
  // Fetch inventory
  const { data: inventoryData, isLoading, error } = useQuery({
    queryKey: ['staff-inventory', queryParams],
    queryFn: () => fetchInventory(queryParams),
    enabled: !!authToken && !!currentLocationFilter,
    staleTime: 30000,
  });
  
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { product_id: string; location_name: string; availability_status?: string; stock_quantity?: number; token: string }) =>
      updateInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-inventory'] });
      showToast('success', 'Inventory updated successfully');
      setEditingProduct(null);
      setNewQuantity('');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update inventory');
    },
  });
  
  // Handlers
  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };
  
  const handleToggleAvailability = (product: Product) => {
    const newStatus = product.availability_status === 'out_of_stock' ? 'in_stock' : 'out_of_stock';
    updateMutation.mutate({
      product_id: product.product_id,
      location_name: currentLocationFilter,
      availability_status: newStatus,
      token: authToken || '',
    });
  };
  
  const handleUpdateStock = (product: Product) => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) {
      showToast('error', 'Please enter a valid quantity');
      return;
    }
    
    updateMutation.mutate({
      product_id: product.product_id,
      location_name: currentLocationFilter,
      stock_quantity: quantity,
      token: authToken || '',
    });
  };
  
  const handleQuickAdjust = (product: Product, adjustment: number) => {
    const currentStock = product.stock_quantity || 0;
    const newStock = Math.max(0, currentStock + adjustment);
    
    updateMutation.mutate({
      product_id: product.product_id,
      location_name: currentLocationFilter,
      stock_quantity: newStock,
      token: authToken || '',
    });
  };
  
  // Auto-update search with debounce
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchInput !== searchQuery) {
        handleFilterChange('search', localSearchInput);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchInput]);
  
  // Show no location error
  if (assignedLocations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Location Assigned</h2>
          <p className="text-gray-600">
            You don't have any locations assigned. Please contact your administrator to get access.
          </p>
        </div>
      </div>
    );
  }
  
  const totalPages = inventoryData ? Math.ceil(inventoryData.total / itemsPerPage) : 0;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                {currentLocationFilter}
              </p>
            </div>
            <button
              onClick={() => queryClient.invalidateQueries({ queryKey: ['staff-inventory'] })}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
          
          {/* Filters */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location Selector */}
            {assignedLocations.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <select
                  value={currentLocationFilter}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {assignedLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Signature Kakes">Signature Kakes</option>
                <option value="Seasonal Special">Seasonal Special</option>
                <option value="Celebration Kakes">Celebration Kakes</option>
                <option value="Mini Kakes">Mini Kakes</option>
                <option value="Toppings">Toppings</option>
                <option value="Beverages">Beverages</option>
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={localSearchInput}
                  onChange={(e) => setLocalSearchInput(e.target.value)}
                  placeholder="Product name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Summary */}
        {inventoryData && (
          <div className="mb-4 text-sm text-gray-600">
            Showing {inventoryData.data.length} of {inventoryData.total} products
          </div>
        )}
        
        {/* Inventory List */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading inventory...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
              <p className="text-red-600 font-medium mb-2">Failed to load inventory</p>
              <p className="text-gray-600 text-sm">Please try refreshing the page</p>
            </div>
          </div>
        ) : !inventoryData || inventoryData.data.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <Package className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium mb-2">No products found</p>
              <p className="text-gray-500 text-sm">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryData.data.map((product) => {
                    const stockStatus = getStockStatus(product);
                    const isEditing = editingProduct === product.product_id;
                    
                    return (
                      <tr key={product.product_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {product.primary_image_url && (
                              <img 
                                src={product.primary_image_url} 
                                alt={product.product_name}
                                className="h-12 w-12 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div>
                              <p className="font-medium text-gray-900">{product.product_name}</p>
                              <p className="text-sm text-gray-500">{product.short_description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {product.category}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${stockStatus.color}`}>
                              {stockStatus.icon}
                              {stockStatus.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isEditing ? (
                            <div className="flex items-center justify-center space-x-2">
                              <input
                                type="number"
                                value={newQuantity}
                                onChange={(e) => setNewQuantity(e.target.value)}
                                placeholder={product.stock_quantity?.toString() || '0'}
                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                autoFocus
                              />
                              <button
                                onClick={() => handleUpdateStock(product)}
                                disabled={updateMutation.isPending}
                                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingProduct(null);
                                  setNewQuantity('');
                                }}
                                className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleQuickAdjust(product, -1)}
                                disabled={updateMutation.isPending || (product.stock_quantity || 0) === 0}
                                className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                title="Decrease by 1"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="text-lg font-bold text-gray-900 min-w-[40px] text-center">
                                {product.stock_quantity !== null ? product.stock_quantity : 'N/A'}
                              </span>
                              <button
                                onClick={() => handleQuickAdjust(product, 1)}
                                disabled={updateMutation.isPending}
                                className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                title="Increase by 1"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            {!isEditing && (
                              <button
                                onClick={() => {
                                  setEditingProduct(product.product_id);
                                  setNewQuantity(product.stock_quantity?.toString() || '0');
                                }}
                                className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                title="Edit Stock"
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleAvailability(product)}
                              disabled={updateMutation.isPending}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                                product.availability_status === 'out_of_stock'
                                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                  : 'bg-red-100 text-red-700 hover:bg-red-200'
                              }`}
                            >
                              {product.availability_status === 'out_of_stock' ? 'Mark Available' : 'Mark Unavailable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {inventoryData && inventoryData.total > itemsPerPage && (
          <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFilterChange('page', (currentPage - 1).toString())}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange('page', (currentPage + 1).toString())}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UV_StaffInventory;
