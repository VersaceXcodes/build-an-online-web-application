import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface DropOfTheMonth {
  drop_id: string;
  product_name: string;
  description: string;
  price: number;
  product_image_url: string;
  available_from: string;
  available_until: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateOrderPayload {
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  company_name: string;
  order_type: 'corporate';
  fulfillment_method: 'delivery';
  delivery_address_line1: string;
  delivery_address_line2: string | null;
  delivery_city: string;
  delivery_postal_code: string;
  event_date: string;
  guest_count: number;
  event_type: string;
  special_instructions: string;
  payment_method: 'online';
  items: Array<{ product_id: string; quantity: number }>;
}

interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: 'customer';
  marketing_opt_in: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

const UV_CorporateOrderForm: React.FC = () => {
  const navigate = useNavigate();

  // Global state - Individual selectors (CRITICAL)
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const showToast = useAppStore(state => state.show_toast);
  const showLoading = useAppStore(state => state.show_loading);
  const hideLoading = useAppStore(state => state.hide_loading);

  // Local form state
  const [customer_email, setCustomerEmail] = useState('');
  const [customer_name, setCustomerName] = useState('');
  const [customer_phone, setCustomerPhone] = useState('');
  const [company_name, setCompanyName] = useState('');
  const [event_date, setEventDate] = useState('');
  const [guest_count, setGuestCount] = useState<number | ''>('');
  const [event_type, setEventType] = useState('');
  const [delivery_address_line1, setDeliveryAddressLine1] = useState('');
  const [delivery_address_line2, setDeliveryAddressLine2] = useState('');
  const [delivery_city, setDeliveryCity] = useState('');
  const [delivery_postal_code, setDeliveryPostalCode] = useState('');
  const [special_instructions, setSpecialInstructions] = useState('');
  const [ordering_drop, setOrderingDrop] = useState(false);
  const [drop_quantity, setDropQuantity] = useState(1);
  const [custom_order_description, setCustomOrderDescription] = useState('');
  const [create_account, setCreateAccount] = useState(false);
  const [account_password, setAccountPassword] = useState('');
  const [form_errors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // ============================================================================
  // API: Fetch Active Drop of the Month
  // ============================================================================

  const { data: active_drop, isLoading: drop_loading } = useQuery({
    queryKey: ['drop-of-the-month', 'active'],
    queryFn: async () => {
      const response = await axios.get<DropOfTheMonth>(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/drop-of-the-month`
      );
      return response.data;
    },
    retry: 1,
    staleTime: 60000,
  });

  // ============================================================================
  // API: Create Corporate Order
  // ============================================================================

  const createOrderMutation = useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/orders`,
        payload,
        currentUser
          ? {
              headers: {
                Authorization: `Bearer ${useAppStore.getState().authentication_state.auth_token}`,
              },
            }
          : undefined
      );
      return response.data;
    },
  });

  // ============================================================================
  // API: Register New User (Conditional)
  // ============================================================================

  const registerMutation = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/auth/register`,
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update global auth state
      const registerUser = useAppStore.getState().register_user;
      // Auth state already updated by register endpoint
      showToast('success', 'Account created successfully!');
    },
  });

  // ============================================================================
  // Pre-fill Form from Auth State
  // ============================================================================

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setCustomerEmail(currentUser.email || '');
      setCustomerName(`${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim());
      setCustomerPhone(currentUser.phone_number || '');
    }
  }, [isAuthenticated, currentUser]);

  // ============================================================================
  // Validation Helper
  // ============================================================================

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!customer_email) {
      errors.customer_email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      errors.customer_email = 'Invalid email format';
    }

    // Name validation
    if (!customer_name || customer_name.trim().length < 2) {
      errors.customer_name = 'Full name is required';
    }

    // Phone validation
    if (!customer_phone || customer_phone.length < 10) {
      errors.customer_phone = 'Valid phone number is required (min 10 digits)';
    }

    // Company name
    if (!company_name || company_name.trim().length < 2) {
      errors.company_name = 'Company name is required';
    }

    // Event date (must be future)
    if (!event_date) {
      errors.event_date = 'Event date is required';
    } else if (new Date(event_date) <= new Date()) {
      errors.event_date = 'Event date must be in the future';
    }

    // Guest count
    if (!guest_count || guest_count < 1) {
      errors.guest_count = 'Guest count must be at least 1';
    }

    // Event type
    if (!event_type) {
      errors.event_type = 'Event type is required';
    }

    // Delivery address
    if (!delivery_address_line1 || delivery_address_line1.trim().length < 3) {
      errors.delivery_address_line1 = 'Address is required';
    }
    if (!delivery_city || delivery_city.trim().length < 2) {
      errors.delivery_city = 'City is required';
    }
    if (!delivery_postal_code || delivery_postal_code.trim().length < 3) {
      errors.delivery_postal_code = 'Postal code is required';
    }

    // Order specifics
    if (ordering_drop) {
      if (drop_quantity < 1) {
        errors.drop_quantity = 'Quantity must be at least 1';
      }
    } else {
      if (!custom_order_description || custom_order_description.trim().length < 20) {
        errors.custom_order_description = 'Please provide detailed order description (min 20 characters)';
      }
    }

    // Account creation validation
    if (!isAuthenticated && create_account) {
      if (!account_password || account_password.length < 8) {
        errors.account_password = 'Password must be at least 8 characters';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ============================================================================
  // Form Submission Handler
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setFormErrors({});

    // Validate
    if (!validateForm()) {
      showToast('error', 'Please fix the errors in the form');
      // Scroll to first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);
    showLoading('Submitting your corporate order request...');

    try {
      // Build order payload
      const items: Array<{ product_id: string; quantity: number }> = ordering_drop && active_drop
        ? [{ product_id: active_drop.drop_id, quantity: drop_quantity }]
        : [];

      const combined_instructions = ordering_drop
        ? special_instructions
        : `${custom_order_description}\n\n${special_instructions}`.trim();

      const orderPayload: CreateOrderPayload = {
        user_id: currentUser?.user_id || null,
        customer_email,
        customer_name,
        customer_phone,
        company_name,
        order_type: 'corporate',
        fulfillment_method: 'delivery',
        delivery_address_line1,
        delivery_address_line2: delivery_address_line2 || null,
        delivery_city,
        delivery_postal_code,
        event_date,
        guest_count: Number(guest_count),
        event_type,
        special_instructions: combined_instructions,
        payment_method: 'online',
        items,
      };

      // Create order
      const orderResponse = await createOrderMutation.mutateAsync(orderPayload);

      // Create account if requested
      if (!isAuthenticated && create_account && account_password) {
        const [first_name, ...last_name_parts] = customer_name.split(' ');
        const last_name = last_name_parts.join(' ') || first_name;

        const registerPayload: RegisterPayload = {
          email: customer_email,
          password: account_password,
          first_name,
          last_name,
          phone_number: customer_phone,
          user_type: 'customer',
          marketing_opt_in: false,
        };

        await registerMutation.mutateAsync(registerPayload);
      }

      // Success
      hideLoading();
      setSubmitting(false);

      showToast(
        'success',
        `Corporate order request submitted! Order number: ${orderResponse.order_number}. We'll contact you within 24 hours.`,
        5000
      );

      // Redirect after short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Corporate order submission error:', error);
      hideLoading();
      setSubmitting(false);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to submit corporate order request';

      showToast('error', errorMessage);
    }
  };

  // ============================================================================
  // Clear Error on Input Change
  // ============================================================================

  const clearFieldError = (fieldName: string) => {
    if (form_errors[fieldName]) {
      setFormErrors(prev => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Corporate & Event Orders
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Planning a special event? Let us create something extraordinary for your celebration.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              All corporate orders require admin confirmation. We'll contact you within 24 hours.
            </p>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Drop of the Month Section */}
              {active_drop && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Featured This Month
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <img
                        src={active_drop.product_image_url}
                        alt={active_drop.product_name}
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {active_drop.product_name}
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {active_drop.description}
                      </p>
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold text-purple-700">
                          €{Number(active_drop.price || 0).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          per item
                        </span>
                      </div>
                      
                      <div className="pt-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={ordering_drop}
                            onChange={(e) => {
                              setOrderingDrop(e.target.checked);
                              if (!e.target.checked) {
                                setDropQuantity(1);
                              }
                            }}
                            className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-lg font-medium text-gray-900">
                            Order this for my event
                          </span>
                        </label>
                        
                        {ordering_drop && (
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={drop_quantity}
                              onChange={(e) => {
                                setDropQuantity(parseInt(e.target.value) || 1);
                                clearFieldError('drop_quantity');
                              }}
                              className={`w-32 px-4 py-2 rounded-lg border-2 ${
                                form_errors.drop_quantity
                                  ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                                  : 'border-gray-200 focus:border-purple-500 focus:ring-purple-100'
                              } focus:ring-4 focus:outline-none transition-all`}
                            />
                            {form_errors.drop_quantity && (
                              <p className="mt-1 text-sm text-red-600">
                                {form_errors.drop_quantity}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Information Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3">
                  Contact Information
                </h2>

                {isAuthenticated && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      ✓ Ordering as <strong>{currentUser?.first_name} {currentUser?.last_name}</strong> ({currentUser?.email})
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="customer_name"
                      value={customer_name}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        clearFieldError('customer_name');
                      }}
                      placeholder="John Smith"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        form_errors.customer_name
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:ring-4 focus:outline-none transition-all`}
                    />
                    {form_errors.customer_name && (
                      <p className="mt-1 text-sm text-red-600">{form_errors.customer_name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="customer_email"
                      value={customer_email}
                      onChange={(e) => {
                        setCustomerEmail(e.target.value);
                        clearFieldError('customer_email');
                      }}
                      placeholder="john@company.com"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        form_errors.customer_email
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:ring-4 focus:outline-none transition-all`}
                    />
                    {form_errors.customer_email && (
                      <p className="mt-1 text-sm text-red-600">{form_errors.customer_email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="customer_phone"
                      value={customer_phone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        clearFieldError('customer_phone');
                      }}
                      placeholder="+353 1 234 5678"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        form_errors.customer_phone
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:ring-4 focus:outline-none transition-all`}
                    />
                    {form_errors.customer_phone && (
                      <p className="mt-1 text-sm text-red-600">{form_errors.customer_phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      value={company_name}
                      onChange={(e) => {
                        setCompanyName(e.target.value);
                        clearFieldError('company_name');
                      }}
                      placeholder="Acme Corporation"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        form_errors.company_name
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:ring-4 focus:outline-none transition-all`}
                    />
                    {form_errors.company_name && (
                      <p className="mt-1 text-sm text-red-600">{form_errors.company_name}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Details Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3">
                  Event Details
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="event_date" className="block text-sm font-medium text-gray-700 mb-2">
                      Event Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="event_date"
                      value={event_date}
                      onChange={(e) => {
                        setEventDate(e.target.value);
                        clearFieldError('event_date');
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        form_errors.event_date
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:ring-4 focus:outline-none transition-all`}
                    />
                    {form_errors.event_date && (
                      <p className="mt-1 text-sm text-red-600">{form_errors.event_date}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="guest_count" className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Count <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="guest_count"
                      min="1"
                      value={guest_count}
                      onChange={(e) => {
                        setGuestCount(e.target.value ? parseInt(e.target.value) : '');
                        clearFieldError('guest_count');
                      }}
                      placeholder="50"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        form_errors.guest_count
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:ring-4 focus:outline-none transition-all`}
                    />
                    {form_errors.guest_count && (
                      <p className="mt-1 text-sm text-red-600">{form_errors.guest_count}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="event_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="event_type"
                      value={event_type}
                      onChange={(e) => {
                        setEventType(e.target.value);
                        clearFieldError('event_type');
                      }}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        form_errors.event_type
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:ring-4 focus:outline-none transition-all`}
                    >
                      <option value="">Select event type</option>
                      <option value="Conference">Conference</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Birthday">Birthday Party</option>
                      <option value="Corporate Meeting">Corporate Meeting</option>
                      <option value="Product Launch">Product Launch</option>
                      <option value="Team Building">Team Building</option>
                      <option value="Other">Other</option>
                    </select>
                    {form_errors.event_type && (
                      <p className="mt-1 text-sm text-red-600">{form_errors.event_type}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3">
                  Delivery Address
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="delivery_address_line1" className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="delivery_address_line1"
                      value={delivery_address_line1}
                      onChange={(e) => {
                        setDeliveryAddressLine1(e.target.value);
                        clearFieldError('delivery_address_line1');
                      }}
                      placeholder="123 Main Street"
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        form_errors.delivery_address_line1
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:ring-4 focus:outline-none transition-all`}
                    />
                    {form_errors.delivery_address_line1 && (
                      <p className="mt-1 text-sm text-red-600">{form_errors.delivery_address_line1}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="delivery_address_line2" className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2 <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      id="delivery_address_line2"
                      value={delivery_address_line2}
                      onChange={(e) => setDeliveryAddressLine2(e.target.value)}
                      placeholder="Suite 100"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="delivery_city" className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="delivery_city"
                        value={delivery_city}
                        onChange={(e) => {
                          setDeliveryCity(e.target.value);
                          clearFieldError('delivery_city');
                        }}
                        placeholder="Dublin"
                        className={`w-full px-4 py-3 rounded-lg border-2 ${
                          form_errors.delivery_city
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        } focus:ring-4 focus:outline-none transition-all`}
                      />
                      {form_errors.delivery_city && (
                        <p className="mt-1 text-sm text-red-600">{form_errors.delivery_city}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="delivery_postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="delivery_postal_code"
                        value={delivery_postal_code}
                        onChange={(e) => {
                          setDeliveryPostalCode(e.target.value);
                          clearFieldError('delivery_postal_code');
                        }}
                        placeholder="D02 XY12"
                        className={`w-full px-4 py-3 rounded-lg border-2 ${
                          form_errors.delivery_postal_code
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                        } focus:ring-4 focus:outline-none transition-all`}
                      />
                      {form_errors.delivery_postal_code && (
                        <p className="mt-1 text-sm text-red-600">{form_errors.delivery_postal_code}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Specifications Section */}
              {!ordering_drop && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3">
                    Order Details
                  </h2>

                  <div>
                    <label htmlFor="custom_order_description" className="block text-sm font-medium text-gray-700 mb-2">
                      Describe Your Order Requirements <span className="text-red-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 mb-2">
                      Please provide detailed information about what you'd like us to create for your event.
                    </p>
                    <textarea
                      id="custom_order_description"
                      value={custom_order_description}
                      onChange={(e) => {
                        setCustomOrderDescription(e.target.value);
                        clearFieldError('custom_order_description');
                      }}
                      rows={6}
                      placeholder="Example: We need assorted desserts for 50 people including gluten-free options. Mix of brownies, cookies, and cake slices. Prefer chocolate and vanilla flavors..."
                      className={`w-full px-4 py-3 rounded-lg border-2 ${
                        form_errors.custom_order_description
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                          : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'
                      } focus:ring-4 focus:outline-none transition-all`}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {form_errors.custom_order_description ? (
                        <p className="text-sm text-red-600">{form_errors.custom_order_description}</p>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {custom_order_description.length} / 2000 characters (min 20)
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Special Instructions */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3">
                  Additional Information
                </h2>

                <div>
                  <label htmlFor="special_instructions" className="block text-sm font-medium text-gray-700 mb-2">
                    Special Instructions or Dietary Requirements
                  </label>
                  <textarea
                    id="special_instructions"
                    value={special_instructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    rows={4}
                    placeholder="E.g., Allergen information, setup requirements, delivery time preferences..."
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {special_instructions.length} / 500 characters
                  </p>
                </div>
              </div>

              {/* Account Creation for Guests */}
              {!isAuthenticated && (
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={create_account}
                      onChange={(e) => {
                        setCreateAccount(e.target.checked);
                        if (!e.target.checked) {
                          setAccountPassword('');
                          clearFieldError('account_password');
                        }
                      }}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
                    />
                    <div className="flex-1">
                      <span className="text-base font-medium text-gray-900">
                        Create a Kake account for faster future orders
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Save your details, track orders, and earn loyalty points
                      </p>
                    </div>
                  </label>

                  {create_account && (
                    <div className="mt-4">
                      <label htmlFor="account_password" className="block text-sm font-medium text-gray-700 mb-2">
                        Create Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        id="account_password"
                        value={account_password}
                        onChange={(e) => {
                          setAccountPassword(e.target.value);
                          clearFieldError('account_password');
                        }}
                        placeholder="Min 8 characters"
                        className={`w-full px-4 py-3 rounded-lg border-2 ${
                          form_errors.account_password
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
                            : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                        } focus:ring-4 focus:outline-none transition-all`}
                      />
                      {form_errors.account_password && (
                        <p className="mt-1 text-sm text-red-600">{form_errors.account_password}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Request...
                    </span>
                  ) : (
                    'Submit Corporate Order Request'
                  )}
                </button>
                
                <p className="text-center text-sm text-gray-500 mt-4">
                  Our team will review your request and contact you within 24 hours with pricing and availability.
                </p>
              </div>
            </form>
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Questions about corporate orders?{' '}
              <a
                href={`mailto:${useAppStore.getState().system_config_state.company_email}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact us
              </a>
              {' '}or call{' '}
              <a
                href={`tel:${useAppStore.getState().system_config_state.company_phone}`}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {useAppStore.getState().system_config_state.company_phone}
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_CorporateOrderForm;