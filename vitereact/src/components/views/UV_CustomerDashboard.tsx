import React, { useState, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  User, 
  MapPin, 
  Package, 
  Star, 
  MessageSquare, 
  Settings, 
  ChevronRight,
  Edit2,
  Trash2,
  Plus,
  Check,
  X,
  Calendar,
  TrendingUp,
  RefreshCw,
  Eye,
  Lock,
  Mail,
  Phone,
  MapPinned,
  Home
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS (from Zod schemas)
// ============================================================================

interface Order {
  order_id: string;
  order_number: string;
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  location_name: string;
  order_type: string;
  fulfillment_method: 'delivery' | 'collection';
  order_status: string;
  delivery_address_line1: string | null;
  delivery_city: string | null;
  delivery_postal_code: string | null;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  loyalty_points_used: number;
  loyalty_points_earned: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  feedback_submitted: boolean;
}

interface LoyaltyPointsTransaction {
  transaction_id: string;
  user_id: string;
  transaction_type: 'earned' | 'redeemed' | 'manual_adjustment' | 'expired';
  points_change: number;
  balance_after: number;
  order_id: string | null;
  description: string;
  created_at: string;
}

interface Address {
  address_id: string;
  user_id: string;
  address_label: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  delivery_phone: string | null;
  delivery_instructions: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface CustomerFeedback {
  feedback_id: string;
  order_id: string;
  user_id: string | null;
  overall_rating: number;
  product_rating: number;
  fulfillment_rating: number;
  product_comment: string | null;
  fulfillment_comment: string | null;
  overall_comment: string | null;
  order_number?: string;
  location_name?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_CustomerDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ============================================================================
  // GLOBAL STATE ACCESS (INDIVIDUAL SELECTORS - CRITICAL!)
  // ============================================================================

  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);
  const showConfirmation = useAppStore(state => state.show_confirmation);
  const hideConfirmation = useAppStore(state => state.hide_confirmation);
  const addToCart = useAppStore(state => state.add_to_cart);
  const setCartLocation = useAppStore(state => state.set_cart_location);
  const updateUserProfile = useAppStore(state => state.update_user_profile);

  // ============================================================================
  // LOCAL STATE
  // ============================================================================

  const activeTab = searchParams.get('tab') || 'overview';
  
  // Order filters
  const [orderFilters, setOrderFilters] = useState<{
    order_status: string | null;
    date_from: string | null;
    date_to: string | null;
    location_name: string | null;
  }>({
    order_status: null,
    date_from: null,
    date_to: null,
    location_name: null,
  });

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
    phone_number: currentUser?.phone_number || '',
    marketing_opt_in: currentUser?.marketing_opt_in || false,
  });

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Address form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressFormData, setAddressFormData] = useState({
    address_label: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    delivery_phone: '',
    delivery_instructions: '',
    is_default: false,
  });

  // ============================================================================
  // API CONFIGURATION
  // ============================================================================

  const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api`;

  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
  });

  // ============================================================================
  // DATA FETCHING - REACT QUERY
  // ============================================================================

  // Fetch recent orders (overview tab)
  const { data: recentOrdersData, isLoading: recentOrdersLoading } = useQuery({
    queryKey: ['recent-orders', currentUser?.user_id],
    queryFn: async () => {
      const response = await apiClient.get('/orders', {
        params: {
          user_id: currentUser?.user_id,
          limit: 5,
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });
      return response.data;
    },
    enabled: activeTab === 'overview' && !!currentUser?.user_id,
    staleTime: 60000,
  });

  const recentOrders = useMemo(() => {
    return (recentOrdersData?.data || []).map((order: any) => ({
      ...order,
      subtotal: Number(order.subtotal || 0),
      delivery_fee: Number(order.delivery_fee || 0),
      discount_amount: Number(order.discount_amount || 0),
      tax_amount: Number(order.tax_amount || 0),
      total_amount: Number(order.total_amount || 0),
      loyalty_points_used: Number(order.loyalty_points_used || 0),
      loyalty_points_earned: Number(order.loyalty_points_earned || 0),
    }));
  }, [recentOrdersData]);

  // Fetch all orders (orders tab)
  const { data: allOrdersData, isLoading: allOrdersLoading } = useQuery({
    queryKey: ['all-orders', currentUser?.user_id, orderFilters],
    queryFn: async () => {
      const response = await apiClient.get('/orders', {
        params: {
          user_id: currentUser?.user_id,
          order_status: orderFilters.order_status || undefined,
          date_from: orderFilters.date_from || undefined,
          date_to: orderFilters.date_to || undefined,
          location_name: orderFilters.location_name || undefined,
          limit: 20,
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });
      return response.data;
    },
    enabled: activeTab === 'orders' && !!currentUser?.user_id,
    staleTime: 30000,
  });

  const allOrders = useMemo(() => {
    return (allOrdersData?.data || []).map((order: any) => ({
      ...order,
      subtotal: Number(order.subtotal || 0),
      delivery_fee: Number(order.delivery_fee || 0),
      discount_amount: Number(order.discount_amount || 0),
      tax_amount: Number(order.tax_amount || 0),
      total_amount: Number(order.total_amount || 0),
      loyalty_points_used: Number(order.loyalty_points_used || 0),
      loyalty_points_earned: Number(order.loyalty_points_earned || 0),
    }));
  }, [allOrdersData]);

  // Fetch loyalty transactions
  const { data: loyaltyData, isLoading: loyaltyLoading } = useQuery({
    queryKey: ['loyalty-transactions', currentUser?.user_id],
    queryFn: async () => {
      const response = await apiClient.get('/loyalty-points/transactions', {
        params: {
          limit: 50,
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });
      return response.data;
    },
    enabled: activeTab === 'loyalty_points' && !!currentUser?.user_id,
    staleTime: 60000,
  });

  const loyaltyTransactions = useMemo(() => {
    return (loyaltyData?.data || []).map((txn: any) => ({
      ...txn,
      points_change: Number(txn.points_change || 0),
      balance_after: Number(txn.balance_after || 0),
    }));
  }, [loyaltyData]);

  // Fetch addresses
  const { data: addressesData, isLoading: addressesLoading, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses', currentUser?.user_id],
    queryFn: async () => {
      const response = await apiClient.get('/addresses');
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },
    enabled: activeTab === 'addresses' && !!currentUser?.user_id,
    staleTime: 60000,
  });

  const savedAddresses: Address[] = addressesData || [];

  // Fetch feedback
  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ['customer-feedback', currentUser?.user_id],
    queryFn: async () => {
      const response = await apiClient.get('/feedback/customer', {
        params: {
          limit: 20,
          sort_by: 'created_at',
          sort_order: 'desc',
        },
      });
      return response.data;
    },
    enabled: activeTab === 'feedback' && !!currentUser?.user_id,
    staleTime: 60000,
  });

  const submittedFeedback: CustomerFeedback[] = useMemo(() => {
    return (feedbackData?.data || []).map((fb: any) => ({
      ...fb,
      overall_rating: Number(fb.overall_rating || 0),
      product_rating: Number(fb.product_rating || 0),
      fulfillment_rating: Number(fb.fulfillment_rating || 0),
    }));
  }, [feedbackData]);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileFormData) => {
      const response = await apiClient.put('/users/me', data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      updateUserProfile(updatedUser);
      setIsEditingProfile(false);
      showToast('success', 'Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      queryClient.invalidateQueries({ queryKey: ['all-orders'] });
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update profile');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: { current_password: string; new_password: string }) => {
      const response = await apiClient.post('/users/me/change-password', data);
      return response.data;
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      showToast('success', 'Password changed successfully');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to change password');
    },
  });

  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: async (data: typeof addressFormData) => {
      const response = await apiClient.post('/addresses', {
        ...data,
        user_id: currentUser?.user_id,
      });
      return response.data;
    },
    onSuccess: () => {
      setIsAddingAddress(false);
      resetAddressForm();
      showToast('success', 'Address added successfully');
      refetchAddresses();
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to add address');
    },
  });

  // Update address mutation
  const updateAddressMutation = useMutation({
    mutationFn: async ({ address_id, data }: { address_id: string; data: Partial<typeof addressFormData> }) => {
      const response = await apiClient.put(`/addresses/${address_id}`, data);
      return response.data;
    },
    onSuccess: () => {
      setEditingAddressId(null);
      resetAddressForm();
      showToast('success', 'Address updated successfully');
      refetchAddresses();
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update address');
    },
  });

  // Delete address mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (address_id: string) => {
      const response = await apiClient.delete(`/addresses/${address_id}`);
      return response.data;
    },
    onSuccess: () => {
      showToast('success', 'Address deleted successfully');
      refetchAddresses();
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to delete address');
    },
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileFormData);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast('error', 'Passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      showToast('error', 'Password must be at least 8 characters');
      return;
    }

    changePasswordMutation.mutate({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddressId) {
      updateAddressMutation.mutate({
        address_id: editingAddressId,
        data: addressFormData,
      });
    } else {
      addAddressMutation.mutate(addressFormData);
    }
  };

  const handleDeleteAddress = (address_id: string) => {
    showConfirmation({
      title: 'Delete Address',
      message: 'Are you sure you want to delete this address?',
      confirm_text: 'Delete',
      cancel_text: 'Cancel',
      on_confirm: () => {
        deleteAddressMutation.mutate(address_id);
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      },
      danger_action: true,
    });
  };

  const handleSetDefaultAddress = (address_id: string) => {
    updateAddressMutation.mutate({
      address_id,
      data: { is_default: true },
    });
  };

  const handleReorder = async (order_id: string) => {
    try {
      const response = await apiClient.get(`/orders/${order_id}`);
      const order = response.data;
      
      if (order.items && Array.isArray(order.items)) {
        // Clear existing cart and set location
        setCartLocation(order.location_name);
        
        // Add items to cart
        order.items.forEach((item: any) => {
          addToCart({
            product_id: item.product_id,
            product_name: item.product_name,
            price: Number(item.price_at_purchase || 0),
            quantity: Number(item.quantity || 0),
            subtotal: Number(item.price_at_purchase || 0) * Number(item.quantity || 0),
            primary_image_url: '',
          });
        });
        
        showToast('success', 'Items added to cart!');
        navigate(`/location/${order.location_name}/menu`);
      }
    } catch (error: any) {
      showToast('error', error.response?.data?.message || 'Failed to reorder');
    }
  };

  const startEditAddress = (address: Address) => {
    setEditingAddressId(address.address_id);
    setAddressFormData({
      address_label: address.address_label || '',
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      postal_code: address.postal_code,
      delivery_phone: address.delivery_phone || '',
      delivery_instructions: address.delivery_instructions || '',
      is_default: address.is_default,
    });
    setIsAddingAddress(true);
  };

  const resetAddressForm = () => {
    setAddressFormData({
      address_label: '',
      address_line1: '',
      address_line2: '',
      city: '',
      postal_code: '',
      delivery_phone: '',
      delivery_instructions: '',
      is_default: false,
    });
    setEditingAddressId(null);
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toFixed(2)}`;
  };

  const getOrderStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { label: string; color: string } } = {
      pending_payment: { label: 'Pending Payment', color: 'bg-gray-100 text-gray-800' },
      payment_confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
      preparing: { label: 'Preparing', color: 'bg-yellow-100 text-yellow-800' },
      ready_for_collection: { label: 'Ready', color: 'bg-green-100 text-green-800' },
      out_for_delivery: { label: 'Out for Delivery', color: 'bg-purple-100 text-purple-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // ============================================================================
  // TAB DEFINITIONS
  // ============================================================================

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'loyalty_points', label: 'Loyalty Points', icon: Star },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!currentUser) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please log in to access your account</p>
            <Link 
              to="/login"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Page Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Welcome back, {currentUser.first_name}!
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">Loyalty Points</p>
                  <p className="text-2xl font-bold text-purple-600">{Number(currentUser.loyalty_points_balance || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Sidebar Tabs - Desktop */}
            <div className="hidden lg:block lg:col-span-3">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Tab Select */}
            <div className="lg:hidden mb-6">
              <select
                value={activeTab}
                onChange={(e) => handleTabChange(e.target.value)}
                className="block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Total Orders</p>
                          <p className="text-2xl font-bold text-gray-900">{allOrdersData?.total || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                          <Star className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Loyalty Points</p>
                          <p className="text-2xl font-bold text-gray-900">{Number(currentUser.loyalty_points_balance || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Points Value</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(Number(currentUser.loyalty_points_balance || 0) / 100)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
                        <button
                          onClick={() => handleTabChange('orders')}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          View all
                        </button>
                      </div>
                    </div>
                    
                    {recentOrdersLoading ? (
                      <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-20 bg-gray-200 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : recentOrders.length === 0 ? (
                      <div className="p-12 text-center">
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No orders yet</p>
                        <Link
                          to="/"
                          className="mt-4 inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Start Shopping
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {recentOrders.map((order: Order) => (
                          <div key={order.order_id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                                  {getOrderStatusBadge(order.order_status)}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {order.location_name} • {formatDate(order.created_at)}
                                </p>
                                <p className="text-sm font-medium text-gray-900 mt-1">
                                  {formatCurrency(order.total_amount)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Link
                                  to={`/orders/${order.order_id}`}
                                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                                <button
                                  onClick={() => handleReorder(order.order_id)}
                                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reorder
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      onClick={() => handleTabChange('addresses')}
                      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all text-left"
                    >
                      <MapPin className="h-8 w-8 text-purple-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Manage Addresses</h3>
                      <p className="text-sm text-gray-600">
                        {savedAddresses.length} saved address{savedAddresses.length !== 1 ? 'es' : ''}
                      </p>
                    </button>

                    <button
                      onClick={() => handleTabChange('loyalty_points')}
                      className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all text-left"
                    >
                      <Star className="h-8 w-8 text-purple-600 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Loyalty Points</h3>
                      <p className="text-sm text-gray-600">
                        {Number(currentUser.loyalty_points_balance || 0).toLocaleString()} points available
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                  </div>

                  {!isEditingProfile ? (
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <p className="text-base text-gray-900">{currentUser.first_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <p className="text-base text-gray-900">{currentUser.last_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <p className="text-base text-gray-900">{currentUser.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                          <p className="text-base text-gray-900">{currentUser.phone_number}</p>
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={currentUser.marketing_opt_in}
                            disabled
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Receive marketing emails</span>
                        </label>
                      </div>

                      <div className="flex space-x-4 pt-4">
                        <button
                          onClick={() => {
                            setProfileFormData({
                              first_name: currentUser.first_name,
                              last_name: currentUser.last_name,
                              phone_number: currentUser.phone_number,
                              marketing_opt_in: currentUser.marketing_opt_in,
                            });
                            setIsEditingProfile(true);
                          }}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </button>
                        <button
                          onClick={() => setIsChangingPassword(true)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleProfileUpdate} className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            id="first_name"
                            value={profileFormData.first_name}
                            onChange={(e) => setProfileFormData({ ...profileFormData, first_name: e.target.value })}
                            required
                            className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                          />
                        </div>
                        <div>
                          <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            id="last_name"
                            value={profileFormData.last_name}
                            onChange={(e) => setProfileFormData({ ...profileFormData, last_name: e.target.value })}
                            required
                            className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone_number"
                            value={profileFormData.phone_number}
                            onChange={(e) => setProfileFormData({ ...profileFormData, phone_number: e.target.value })}
                            required
                            className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={profileFormData.marketing_opt_in}
                            onChange={(e) => setProfileFormData({ ...profileFormData, marketing_opt_in: e.target.checked })}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Receive marketing emails</span>
                        </label>
                      </div>

                      <div className="flex space-x-4 pt-4 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50"
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <Check className="h-5 w-5 mr-2" />
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <X className="h-5 w-5 mr-2" />
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
                  </div>

                  {/* Filters */}
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <select
                        value={orderFilters.order_status || ''}
                        onChange={(e) => setOrderFilters({ ...orderFilters, order_status: e.target.value || null })}
                        className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                      >
                        <option value="">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="preparing">In Progress</option>
                        <option value="cancelled">Cancelled</option>
                      </select>

                      <select
                        value={orderFilters.location_name || ''}
                        onChange={(e) => setOrderFilters({ ...orderFilters, location_name: e.target.value || null })}
                        className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                      >
                        <option value="">All Locations</option>
                        <option value="Blanchardstown">Blanchardstown</option>
                        <option value="Tallaght">Tallaght</option>
                        <option value="Glasnevin">Glasnevin</option>
                      </select>

                      <input
                        type="date"
                        value={orderFilters.date_from || ''}
                        onChange={(e) => setOrderFilters({ ...orderFilters, date_from: e.target.value || null })}
                        placeholder="From Date"
                        className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                      />

                      <input
                        type="date"
                        value={orderFilters.date_to || ''}
                        onChange={(e) => setOrderFilters({ ...orderFilters, date_to: e.target.value || null })}
                        placeholder="To Date"
                        className="rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                      />
                    </div>
                  </div>

                  {allOrdersLoading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-24 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : allOrders.length === 0 ? (
                    <div className="p-12 text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No orders found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {allOrders.map((order: Order) => (
                        <div key={order.order_id} className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                                {getOrderStatusBadge(order.order_status)}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {order.location_name} • {order.fulfillment_method === 'delivery' ? 'Delivery' : 'Collection'}
                              </p>
                              <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                              <p className="text-lg font-semibold text-gray-900 mt-2">
                                {formatCurrency(order.total_amount)}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/orders/${order.order_id}`}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                              {!order.feedback_submitted && order.order_status === 'completed' && (
                                <Link
                                  to={`/feedback/order/${order.order_id}`}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Leave Feedback
                                </Link>
                              )}
                              <button
                                onClick={() => handleReorder(order.order_id)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reorder
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Loyalty Points Tab */}
              {activeTab === 'loyalty_points' && (
                <div className="space-y-6">
                  {/* Points Balance Card */}
                  <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-purple-200 text-sm font-medium mb-2">Your Balance</p>
                        <p className="text-5xl font-bold">{Number(currentUser.loyalty_points_balance || 0).toLocaleString()}</p>
                        <p className="text-purple-200 text-sm mt-2">
                          Worth {formatCurrency(Number(currentUser.loyalty_points_balance || 0) / 100)}
                        </p>
                      </div>
                      <Star className="h-16 w-16 text-purple-300" />
                    </div>
                    <div className="bg-purple-700/50 rounded-lg p-4">
                      <p className="text-sm text-purple-100">
                        Earn 10 points for every €1 spent • Redeem 100 points for €1 off
                      </p>
                    </div>
                  </div>

                  {/* Transaction History */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">Points History</h2>
                    </div>

                    {loyaltyLoading ? (
                      <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-gray-200 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : loyaltyTransactions.length === 0 ? (
                      <div className="p-12 text-center">
                        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No transactions yet</p>
                        <p className="text-sm text-gray-500 mt-2">Start ordering to earn points!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {loyaltyTransactions.map((txn: LoyaltyPointsTransaction) => (
                          <div key={txn.transaction_id} className="p-6 flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{txn.description}</p>
                              <p className="text-xs text-gray-600 mt-1">{formatDate(txn.created_at)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${txn.points_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {txn.points_change > 0 ? '+' : ''}{txn.points_change}
                              </p>
                              <p className="text-xs text-gray-600">Balance: {txn.balance_after}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
                    <button
                      onClick={() => {
                        resetAddressForm();
                        setIsAddingAddress(true);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Address
                    </button>
                  </div>

                  {isAddingAddress && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {editingAddressId ? 'Edit Address' : 'New Address'}
                      </h3>
                      <form onSubmit={handleAddAddress} className="space-y-4">
                        <div>
                          <label htmlFor="address_label" className="block text-sm font-medium text-gray-700 mb-2">
                            Label (optional)
                          </label>
                          <input
                            type="text"
                            id="address_label"
                            value={addressFormData.address_label}
                            onChange={(e) => setAddressFormData({ ...addressFormData, address_label: e.target.value })}
                            placeholder="e.g., Home, Work"
                            className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                          />
                        </div>

                        <div>
                          <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            id="address_line1"
                            value={addressFormData.address_line1}
                            onChange={(e) => setAddressFormData({ ...addressFormData, address_line1: e.target.value })}
                            required
                            className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                          />
                        </div>

                        <div>
                          <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700 mb-2">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            id="address_line2"
                            value={addressFormData.address_line2}
                            onChange={(e) => setAddressFormData({ ...addressFormData, address_line2: e.target.value })}
                            className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                              City *
                            </label>
                            <input
                              type="text"
                              id="city"
                              value={addressFormData.city}
                              onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                              required
                              className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                            />
                          </div>

                          <div>
                            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                              Postal Code *
                            </label>
                            <input
                              type="text"
                              id="postal_code"
                              value={addressFormData.postal_code}
                              onChange={(e) => setAddressFormData({ ...addressFormData, postal_code: e.target.value })}
                              required
                              className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="delivery_phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Phone
                          </label>
                          <input
                            type="tel"
                            id="delivery_phone"
                            value={addressFormData.delivery_phone}
                            onChange={(e) => setAddressFormData({ ...addressFormData, delivery_phone: e.target.value })}
                            className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                          />
                        </div>

                        <div>
                          <label htmlFor="delivery_instructions" className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Instructions
                          </label>
                          <textarea
                            id="delivery_instructions"
                            value={addressFormData.delivery_instructions}
                            onChange={(e) => setAddressFormData({ ...addressFormData, delivery_instructions: e.target.value })}
                            rows={3}
                            className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                          />
                        </div>

                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={addressFormData.is_default}
                              onChange={(e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked })}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Set as default address</span>
                          </label>
                        </div>

                        <div className="flex space-x-4 pt-4">
                          <button
                            type="submit"
                            disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50"
                          >
                            {(addAddressMutation.isPending || updateAddressMutation.isPending) ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Add Address')}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingAddress(false);
                              resetAddressForm();
                            }}
                            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {addressesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-48 bg-gray-200 rounded-xl"></div>
                        </div>
                      ))}
                    </div>
                  ) : savedAddresses.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                      <MapPinned className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No saved addresses</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {savedAddresses.map((address: Address) => (
                        <div
                          key={address.address_id}
                          className={`bg-white rounded-xl shadow-lg border p-6 ${
                            address.is_default ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              {address.address_label && (
                                <p className="text-sm font-semibold text-purple-600 mb-1">{address.address_label}</p>
                              )}
                              {address.is_default && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-2">
                                  <Check className="h-3 w-3 mr-1" />
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditAddress(address)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Edit address"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(address.address_id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                aria-label="Delete address"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-sm text-gray-700 space-y-1">
                            <p>{address.address_line1}</p>
                            {address.address_line2 && <p>{address.address_line2}</p>}
                            <p>{address.city}, {address.postal_code}</p>
                            {address.delivery_phone && <p className="text-gray-600">Phone: {address.delivery_phone}</p>}
                            {address.delivery_instructions && (
                              <p className="text-gray-600 mt-2 italic">{address.delivery_instructions}</p>
                            )}
                          </div>
                          {!address.is_default && (
                            <button
                              onClick={() => handleSetDefaultAddress(address.address_id)}
                              className="mt-4 w-full text-sm text-purple-600 hover:text-purple-700 font-medium"
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Feedback Tab */}
              {activeTab === 'feedback' && (
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">My Feedback</h2>
                  </div>

                  {feedbackLoading ? (
                    <div className="p-6 space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-32 bg-gray-200 rounded-lg"></div>
                        </div>
                      ))}
                    </div>
                  ) : submittedFeedback.length === 0 ? (
                    <div className="p-12 text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No feedback submitted yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {submittedFeedback.map((feedback: CustomerFeedback) => (
                        <div key={feedback.feedback_id} className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">
                                Order {feedback.order_number}
                              </p>
                              <p className="text-xs text-gray-600">{formatDate(feedback.created_at)}</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              {getRatingStars(feedback.overall_rating)}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center">
                                <span className="text-gray-600 mr-2">Product:</span>
                                <div className="flex items-center space-x-1">
                                  {getRatingStars(feedback.product_rating)}
                                </div>
                              </div>
                              <div className="flex items-center">
                                <span className="text-gray-600 mr-2">Service:</span>
                                <div className="flex items-center space-x-1">
                                  {getRatingStars(feedback.fulfillment_rating)}
                                </div>
                              </div>
                            </div>

                            {feedback.overall_comment && (
                              <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-700">{feedback.overall_comment}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {isChangingPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
                <button
                  onClick={() => setIsChangingPassword(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="current_password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    required
                    className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                  />
                </div>

                <div>
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new_password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    required
                    minLength={8}
                    className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                  />
                </div>

                <div>
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirm_password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    required
                    minLength={8}
                    className="block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50"
                  >
                    {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsChangingPassword(false)}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
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

export default UV_CustomerDashboard;