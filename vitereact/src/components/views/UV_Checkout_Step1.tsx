import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Package, MapPin, Clock, User, AlertCircle } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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

interface FormErrors {
  customer_email?: string;
  customer_name?: string;
  customer_phone?: string;
  account_password?: string;
  delivery_address_line1?: string;
  delivery_city?: string;
  delivery_postal_code?: string;
  scheduled_pickup_date?: string;
  scheduled_pickup_time?: string;
  general?: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchSavedAddresses = async (_userId: string, token: string): Promise<Address[]> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/addresses`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_Checkout_Step1: React.FC = () => {
  const navigate = useNavigate();

  // ====================================================================
  // GLOBAL STATE ACCESS (Individual selectors - NO object destructuring)
  // ====================================================================

  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  
  const cartItems = useAppStore(state => state.cart_state.items);
  const cartSubtotal = useAppStore(state => state.cart_state.totals.subtotal);
  const cartDeliveryFee = useAppStore(state => state.cart_state.totals.delivery_fee);
  const cartDiscount = useAppStore(state => state.cart_state.totals.discount);
  const cartTotal = useAppStore(state => state.cart_state.totals.total);
  const selectedLocation = useAppStore(state => state.cart_state.selected_location);
  const cartFulfillmentMethod = useAppStore(state => state.cart_state.fulfillment_method);
  const loyaltyPointsUsed = useAppStore(state => state.cart_state.applied_discounts.loyalty_points_used);
  const appliedPromoCode = useAppStore(state => state.cart_state.applied_discounts.promo_code);
  
  const locationDetails = useAppStore(state => state.location_state.location_details);
  const availableLocations = useAppStore(state => state.location_state.available_locations);
  
  const pointsRedemptionRate = useAppStore(state => state.system_config_state.points_redemption_rate);
  const minimumOrderForDelivery = useAppStore(state => state.system_config_state.minimum_order_for_delivery);
  
  // Global actions
  const setDeliveryFee = useAppStore(state => state.set_delivery_fee);
  const applyLoyaltyPoints = useAppStore(state => state.apply_loyalty_points);
  const removeLoyaltyPoints = useAppStore(state => state.remove_loyalty_points);
  const applyPromoCode = useAppStore(state => state.apply_promo_code);
  const removePromoCode = useAppStore(state => state.remove_promo_code);
  const showToast = useAppStore(state => state.show_toast);

  // ====================================================================
  // LOCAL STATE
  // ====================================================================

  // Customer Information
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');

  // Fulfillment Method
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'collection' | 'delivery'>('collection');

  // Collection Options
  const [pickupTimeOption, setPickupTimeOption] = useState<'asap' | 'scheduled'>('asap');
  const [scheduledPickupDate, setScheduledPickupDate] = useState('');
  const [scheduledPickupTime, setScheduledPickupTime] = useState('');

  // Delivery Address
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [deliveryAddressLine1, setDeliveryAddressLine1] = useState('');
  const [deliveryAddressLine2, setDeliveryAddressLine2] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPostalCode, setDeliveryPostalCode] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Special Instructions
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Validation & UI State
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  // ====================================================================
  // REACT QUERY - FETCH SAVED ADDRESSES
  // ====================================================================

  const { data: savedAddresses = [] } = useQuery({
    queryKey: ['addresses', currentUser?.user_id],
    queryFn: () => fetchSavedAddresses(currentUser!.user_id, authToken!),
    enabled: isAuthenticated && !!currentUser && !!authToken && fulfillmentMethod === 'delivery',
    staleTime: 60000,
  });

  // ====================================================================
  // EFFECTS
  // ====================================================================

  // Redirect if cart empty
  useEffect(() => {
    if (cartItems.length === 0) {
      showToast('warning', 'Your cart is empty. Please add items before checkout.');
      navigate('/');
    }
  }, [cartItems.length, navigate, showToast]);

  // Pre-fill customer info if authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setCustomerEmail(currentUser.email);
      setCustomerName(`${currentUser.first_name} ${currentUser.last_name}`);
      setCustomerPhone(currentUser.phone_number);
    }
  }, [isAuthenticated, currentUser]);

  // Set fulfillment method from cart
  useEffect(() => {
    if (cartFulfillmentMethod) {
      setFulfillmentMethod(cartFulfillmentMethod);
      // Ensure pickup time option is set when switching to collection
      if (cartFulfillmentMethod === 'collection' && !pickupTimeOption) {
        setPickupTimeOption('asap');
      }
    }
  }, [cartFulfillmentMethod, pickupTimeOption]);

  // Auto-select default address
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddress = savedAddresses.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.address_id);
        setUseSavedAddress(true);
        applySelectedAddress(defaultAddress);
      }
    }
  }, [savedAddresses]);

  // Calculate delivery fee when fulfillment method changes
  useEffect(() => {
    if (fulfillmentMethod === 'collection') {
      setDeliveryFee(0);
      // Ensure pickup time option is always set for collection
      if (!pickupTimeOption) {
        setPickupTimeOption('asap');
      }
    } else if (fulfillmentMethod === 'delivery' && locationDetails) {
      // Check if cart meets free delivery threshold
      const freeThreshold = locationDetails.free_delivery_threshold || 0;
      if (cartSubtotal >= freeThreshold) {
        setDeliveryFee(0);
      } else {
        setDeliveryFee(Number(locationDetails.delivery_fee || 0));
      }
    }
  }, [fulfillmentMethod, cartSubtotal, locationDetails, setDeliveryFee, pickupTimeOption]);

  // ====================================================================
  // HELPER FUNCTIONS
  // ====================================================================

  const applySelectedAddress = (address: Address) => {
    setDeliveryAddressLine1(address.address_line1);
    setDeliveryAddressLine2(address.address_line2 || '');
    setDeliveryCity(address.city);
    setDeliveryPostalCode(address.postal_code);
    setDeliveryPhone(address.delivery_phone || customerPhone);
    setDeliveryInstructions(address.delivery_instructions || '');
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Irish phone format: +353 or 0 followed by digits
    const phoneRegex = /^(\+353|0)[0-9]{8,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validatePostalCode = (code: string): boolean => {
    // Basic format check (not strict Irish Eircode validation)
    return code.length >= 3 && code.length <= 20;
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    // Customer info validation
    if (!customerEmail) {
      errors.customer_email = 'Email is required';
    } else if (!validateEmail(customerEmail)) {
      errors.customer_email = 'Invalid email format';
    }

    if (!customerName || customerName.trim().length < 2) {
      errors.customer_name = 'Full name is required';
    }

    if (!customerPhone) {
      errors.customer_phone = 'Phone number is required';
    } else if (!validatePhone(customerPhone)) {
      errors.customer_phone = 'Invalid phone number format';
    }

    // Account creation validation
    if (createAccount && !isAuthenticated) {
      if (!accountPassword || accountPassword.length < 8) {
        errors.account_password = 'Password must be at least 8 characters';
      }
    }

    // Delivery address validation
    if (fulfillmentMethod === 'delivery') {
      if (!deliveryAddressLine1) {
        errors.delivery_address_line1 = 'Address is required';
      }
      if (!deliveryCity) {
        errors.delivery_city = 'City is required';
      }
      if (!deliveryPostalCode) {
        errors.delivery_postal_code = 'Postal code is required';
      } else if (!validatePostalCode(deliveryPostalCode)) {
        errors.delivery_postal_code = 'Invalid postal code format';
      }
      
      // Check minimum order for delivery
      if (cartSubtotal < minimumOrderForDelivery) {
        errors.general = `Minimum order for delivery is €${minimumOrderForDelivery.toFixed(2)}`;
      }
    }

    // Collection pickup time validation
    if (fulfillmentMethod === 'collection') {
      // Ensure pickup time option is selected (should always be set, but adding explicit validation)
      if (!pickupTimeOption) {
        errors.general = 'Please select a pickup time option';
      }
      
      // Scheduled pickup validation
      if (pickupTimeOption === 'scheduled') {
        if (!scheduledPickupDate) {
          errors.scheduled_pickup_date = 'Pickup date is required';
        }
        if (!scheduledPickupTime) {
          errors.scheduled_pickup_time = 'Pickup time is required';
        }
        
        // Check if date/time is in the future (min 2 hours ahead)
        if (scheduledPickupDate && scheduledPickupTime) {
          const scheduledDateTime = new Date(`${scheduledPickupDate}T${scheduledPickupTime}`);
          const minDateTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
          if (scheduledDateTime < minDateTime) {
            errors.scheduled_pickup_date = 'Pickup must be at least 2 hours in advance';
          }
        }
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToPayment = () => {
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast('error', 'Please fix the errors before continuing');
      return;
    }

    // Store checkout data in sessionStorage
    const checkoutData = {
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone,
      create_account: createAccount && !isAuthenticated,
      account_password: createAccount ? accountPassword : null,
      fulfillment_method: fulfillmentMethod,
      delivery_address_line1: fulfillmentMethod === 'delivery' ? deliveryAddressLine1 : null,
      delivery_address_line2: fulfillmentMethod === 'delivery' ? deliveryAddressLine2 : null,
      delivery_city: fulfillmentMethod === 'delivery' ? deliveryCity : null,
      delivery_postal_code: fulfillmentMethod === 'delivery' ? deliveryPostalCode : null,
      delivery_phone: fulfillmentMethod === 'delivery' ? (deliveryPhone || customerPhone) : null,
      delivery_instructions: fulfillmentMethod === 'delivery' ? deliveryInstructions : null,
      special_instructions: specialInstructions || null,
      scheduled_for: pickupTimeOption === 'scheduled' ? `${scheduledPickupDate}T${scheduledPickupTime}` : null,
    };

    sessionStorage.setItem('kake_checkout_data', JSON.stringify(checkoutData));
    navigate('/checkout/payment');
  };

  const handleSavedAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find(a => a.address_id === addressId);
    if (address) {
      applySelectedAddress(address);
    }
  };

  const handleLoyaltyPointsToggle = (checked: boolean) => {
    if (checked && currentUser) {
      const availablePoints = Number(currentUser.loyalty_points_balance || 0);
      const maxPointsUsable = Math.floor(cartSubtotal * pointsRedemptionRate);
      const pointsToUse = Math.min(availablePoints, maxPointsUsable);
      
      if (pointsToUse > 0) {
        applyLoyaltyPoints(pointsToUse);
        showToast('success', `Using ${pointsToUse} points for €${(pointsToUse / pointsRedemptionRate).toFixed(2)} discount`);
      } else {
        showToast('warning', 'Not enough points available');
      }
    } else {
      removeLoyaltyPoints();
    }
  };

  // Calculate estimated ready time
  const getEstimatedReadyTime = (): string => {
    if (!locationDetails) return 'Processing...';
    
    const prepTime = Number(locationDetails.estimated_preparation_time_minutes || 20);
    const delivTime = fulfillmentMethod === 'delivery' 
      ? Number(locationDetails.estimated_delivery_time_minutes || 0) 
      : 0;
    const totalMinutes = prepTime + delivTime;
    
    if (pickupTimeOption === 'scheduled' && scheduledPickupDate && scheduledPickupTime) {
      return `Scheduled for ${scheduledPickupDate} at ${scheduledPickupTime}`;
    }
    
    const readyTime = new Date(Date.now() + totalMinutes * 60000);
    return readyTime.toLocaleString('en-IE', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: 'numeric',
      month: 'short'
    });
  };

  // Get current location details
  const getCurrentLocation = () => {
    if (!selectedLocation) return null;
    return availableLocations.find(loc => loc.location_name.toLowerCase() === selectedLocation.toLowerCase()) || locationDetails;
  };

  const currentLocationData = getCurrentLocation();

  // ====================================================================
  // RENDER
  // ====================================================================

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold">
                  1
                </div>
                <span className="ml-2 text-sm font-medium text-blue-600">Order Details</span>
              </div>
              
              <div className="w-16 h-1 bg-gray-300"></div>
              
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 text-gray-600 rounded-full font-semibold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">Payment</span>
              </div>
              
              <div className="w-16 h-1 bg-gray-300"></div>
              
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 text-gray-600 rounded-full font-semibold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-600">Confirmation</span>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* General Error Display */}
              {formErrors.general && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start space-x-3" data-error="true">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-medium">{formErrors.general}</p>
                </div>
              )}

              {/* Customer Information Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <User className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Customer Information</h2>
                </div>

                {isAuthenticated && currentUser ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 mb-2">
                        <span className="font-semibold">Ordering as:</span> {currentUser.first_name} {currentUser.last_name}
                      </p>
                      <p className="text-sm text-blue-700">{currentUser.email}</p>
                      <p className="text-sm text-blue-700">{currentUser.phone_number}</p>
                    </div>
                    <p className="text-xs text-gray-600 italic">
                      Need to use different information? Update in your account settings after checkout.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="customer_email"
                        value={customerEmail}
                        onChange={(e) => {
                          setCustomerEmail(e.target.value);
                          if (formErrors.customer_email) {
                            setFormErrors(prev => ({ ...prev, customer_email: undefined }));
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border-2 ${
                          formErrors.customer_email 
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                        } transition-all duration-200`}
                        placeholder="your.email@example.com"
                        data-error={!!formErrors.customer_email}
                      />
                      {formErrors.customer_email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.customer_email}</p>
                      )}
                    </div>

                    {/* Full Name */}
                    <div>
                      <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="customer_name"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (formErrors.customer_name) {
                            setFormErrors(prev => ({ ...prev, customer_name: undefined }));
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border-2 ${
                          formErrors.customer_name 
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                        } transition-all duration-200`}
                        placeholder="John Doe"
                        data-error={!!formErrors.customer_name}
                      />
                      {formErrors.customer_name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.customer_name}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="customer_phone"
                        value={customerPhone}
                        onChange={(e) => {
                          setCustomerPhone(e.target.value);
                          if (formErrors.customer_phone) {
                            setFormErrors(prev => ({ ...prev, customer_phone: undefined }));
                          }
                        }}
                        className={`w-full px-4 py-3 rounded-lg border-2 ${
                          formErrors.customer_phone 
                            ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                            : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                        } transition-all duration-200`}
                        placeholder="+353 86 123 4567"
                        data-error={!!formErrors.customer_phone}
                      />
                      {formErrors.customer_phone && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.customer_phone}</p>
                      )}
                    </div>

                    {/* Create Account Option */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={createAccount}
                          onChange={(e) => setCreateAccount(e.target.checked)}
                          className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          Create an account for faster checkouts and loyalty points
                        </span>
                      </label>
                      
                      {createAccount && (
                        <div className="mt-4">
                          <label htmlFor="account_password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            id="account_password"
                            value={accountPassword}
                            onChange={(e) => {
                              setAccountPassword(e.target.value);
                              if (formErrors.account_password) {
                                setFormErrors(prev => ({ ...prev, account_password: undefined }));
                              }
                            }}
                            className={`w-full px-4 py-3 rounded-lg border-2 ${
                              formErrors.account_password 
                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                            } transition-all duration-200`}
                            placeholder="Minimum 8 characters"
                            data-error={!!formErrors.account_password}
                          />
                          {formErrors.account_password && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.account_password}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Fulfillment Method Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Package className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">Fulfillment Method</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <label
                    className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      fulfillmentMethod === 'collection'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fulfillment_method"
                      value="collection"
                      checked={fulfillmentMethod === 'collection'}
                      onChange={() => setFulfillmentMethod('collection')}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <Package className={`w-8 h-8 mx-auto mb-2 ${
                        fulfillmentMethod === 'collection' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <p className={`font-semibold ${
                        fulfillmentMethod === 'collection' ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        Collection
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Pick up at store</p>
                    </div>
                  </label>

                  <label
                    className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      fulfillmentMethod === 'delivery'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fulfillment_method"
                      value="delivery"
                      checked={fulfillmentMethod === 'delivery'}
                      onChange={() => setFulfillmentMethod('delivery')}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <MapPin className={`w-8 h-8 mx-auto mb-2 ${
                        fulfillmentMethod === 'delivery' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <p className={`font-semibold ${
                        fulfillmentMethod === 'delivery' ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        Delivery
                      </p>
                      <p className="text-xs text-gray-600 mt-1">Deliver to address</p>
                    </div>
                  </label>
                </div>

                {/* Collection Details */}
                {fulfillmentMethod === 'collection' && currentLocationData && (
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Collect from:</p>
                      <p className="text-sm text-gray-700">{currentLocationData.location_name}</p>
                      <p className="text-sm text-gray-600">{currentLocationData.address_line1}</p>
                      {currentLocationData.address_line2 && (
                        <p className="text-sm text-gray-600">{currentLocationData.address_line2}</p>
                      )}
                      <p className="text-sm text-gray-600">{currentLocationData.city} {currentLocationData.postal_code}</p>
                    </div>

                    {/* Pickup Time Selection */}
                    <div className={formErrors.general && formErrors.general.includes('pickup') ? 'border-2 border-red-300 rounded-lg p-4' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Pickup Time <span className="text-red-500">*</span>
                      </label>
                      
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer" data-pickup-option="asap">
                          <input
                            type="radio"
                            name="pickup_time"
                            value="asap"
                            checked={pickupTimeOption === 'asap'}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setPickupTimeOption('asap');
                                // Clear any scheduled pickup errors
                                setFormErrors(prev => ({ 
                                  ...prev, 
                                  scheduled_pickup_date: undefined,
                                  scheduled_pickup_time: undefined 
                                }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            data-testid="pickup-asap"
                          />
                          <span className="text-sm text-gray-700">
                            ASAP (Ready in {Number(currentLocationData.estimated_preparation_time_minutes || 20)} minutes)
                          </span>
                        </label>

                        {currentLocationData.allow_scheduled_pickups && (
                          <label className="flex items-center space-x-3 cursor-pointer" data-pickup-option="scheduled">
                            <input
                              type="radio"
                              name="pickup_time"
                              value="scheduled"
                              checked={pickupTimeOption === 'scheduled'}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setPickupTimeOption('scheduled');
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              data-testid="pickup-scheduled"
                            />
                            <span className="text-sm text-gray-700">Schedule for later</span>
                          </label>
                        )}
                      </div>

                      {pickupTimeOption === 'scheduled' && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="pickup_date" className="block text-sm font-medium text-gray-700 mb-2">
                              Date <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              id="pickup_date"
                              value={scheduledPickupDate}
                              onChange={(e) => {
                                setScheduledPickupDate(e.target.value);
                                if (formErrors.scheduled_pickup_date) {
                                  setFormErrors(prev => ({ ...prev, scheduled_pickup_date: undefined }));
                                }
                              }}
                              min={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString().split('T')[0]}
                              className={`w-full px-4 py-3 rounded-lg border-2 ${
                                formErrors.scheduled_pickup_date 
                                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                              } transition-all duration-200`}
                              data-error={!!formErrors.scheduled_pickup_date}
                            />
                            {formErrors.scheduled_pickup_date && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.scheduled_pickup_date}</p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="pickup_time" className="block text-sm font-medium text-gray-700 mb-2">
                              Time <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="time"
                              id="pickup_time"
                              value={scheduledPickupTime}
                              onChange={(e) => {
                                setScheduledPickupTime(e.target.value);
                                if (formErrors.scheduled_pickup_time) {
                                  setFormErrors(prev => ({ ...prev, scheduled_pickup_time: undefined }));
                                }
                              }}
                              className={`w-full px-4 py-3 rounded-lg border-2 ${
                                formErrors.scheduled_pickup_time 
                                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                              } transition-all duration-200`}
                              data-error={!!formErrors.scheduled_pickup_time}
                            />
                            {formErrors.scheduled_pickup_time && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.scheduled_pickup_time}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Estimated ready time: {getEstimatedReadyTime()}</span>
                    </div>
                  </div>
                )}

                {/* Delivery Details */}
                {fulfillmentMethod === 'delivery' && (
                  <div className="border-t border-gray-200 pt-6 space-y-4">
                    
                    {/* Saved Addresses (if authenticated) */}
                    {isAuthenticated && savedAddresses.length > 0 && (
                      <div>
                        <label className="flex items-center space-x-3 cursor-pointer mb-3">
                          <input
                            type="checkbox"
                            checked={useSavedAddress}
                            onChange={(e) => {
                              setUseSavedAddress(e.target.checked);
                              if (!e.target.checked) {
                                setSelectedAddressId(null);
                                setDeliveryAddressLine1('');
                                setDeliveryAddressLine2('');
                                setDeliveryCity('');
                                setDeliveryPostalCode('');
                                setDeliveryPhone('');
                                setDeliveryInstructions('');
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Use saved address</span>
                        </label>

                        {useSavedAddress && (
                          <select
                            value={selectedAddressId || ''}
                            onChange={(e) => handleSavedAddressChange(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                          >
                            <option value="">Select an address</option>
                            {savedAddresses.map((address) => (
                              <option key={address.address_id} value={address.address_id}>
                                {address.address_label ? `${address.address_label} - ` : ''}
                                {address.address_line1}, {address.city}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    {/* Address Form (shown if no saved address selected or guest) */}
                    {(!useSavedAddress || !isAuthenticated) && (
                      <div className="space-y-4">
                        {/* Address Line 1 */}
                        <div>
                          <label htmlFor="delivery_address_line1" className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="delivery_address_line1"
                            value={deliveryAddressLine1}
                            onChange={(e) => {
                              setDeliveryAddressLine1(e.target.value);
                              if (formErrors.delivery_address_line1) {
                                setFormErrors(prev => ({ ...prev, delivery_address_line1: undefined }));
                              }
                            }}
                            className={`w-full px-4 py-3 rounded-lg border-2 ${
                              formErrors.delivery_address_line1 
                                ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                            } transition-all duration-200`}
                            placeholder="123 Main Street"
                            data-error={!!formErrors.delivery_address_line1}
                          />
                          {formErrors.delivery_address_line1 && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.delivery_address_line1}</p>
                          )}
                        </div>

                        {/* Address Line 2 */}
                        <div>
                          <label htmlFor="delivery_address_line2" className="block text-sm font-medium text-gray-700 mb-2">
                            Apartment, Suite, etc. (Optional)
                          </label>
                          <input
                            type="text"
                            id="delivery_address_line2"
                            value={deliveryAddressLine2}
                            onChange={(e) => setDeliveryAddressLine2(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                            placeholder="Apt 4B"
                          />
                        </div>

                        {/* City and Postal Code */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="delivery_city" className="block text-sm font-medium text-gray-700 mb-2">
                              City <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="delivery_city"
                              value={deliveryCity}
                              onChange={(e) => {
                                setDeliveryCity(e.target.value);
                                if (formErrors.delivery_city) {
                                  setFormErrors(prev => ({ ...prev, delivery_city: undefined }));
                                }
                              }}
                              className={`w-full px-4 py-3 rounded-lg border-2 ${
                                formErrors.delivery_city 
                                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                              } transition-all duration-200`}
                              placeholder="Dublin"
                              data-error={!!formErrors.delivery_city}
                            />
                            {formErrors.delivery_city && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.delivery_city}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="delivery_postal_code" className="block text-sm font-medium text-gray-700 mb-2">
                              Postal Code <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              id="delivery_postal_code"
                              value={deliveryPostalCode}
                              onChange={(e) => {
                                setDeliveryPostalCode(e.target.value);
                                if (formErrors.delivery_postal_code) {
                                  setFormErrors(prev => ({ ...prev, delivery_postal_code: undefined }));
                                }
                              }}
                              className={`w-full px-4 py-3 rounded-lg border-2 ${
                                formErrors.delivery_postal_code 
                                  ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                                  : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                              } transition-all duration-200`}
                              placeholder="D02 XY12"
                              data-error={!!formErrors.delivery_postal_code}
                            />
                            {formErrors.delivery_postal_code && (
                              <p className="mt-1 text-sm text-red-600">{formErrors.delivery_postal_code}</p>
                            )}
                          </div>
                        </div>

                        {/* Delivery Phone */}
                        <div>
                          <label htmlFor="delivery_phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            id="delivery_phone"
                            value={deliveryPhone}
                            onChange={(e) => setDeliveryPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                            placeholder="Defaults to your phone number"
                          />
                        </div>

                        {/* Delivery Instructions */}
                        <div>
                          <label htmlFor="delivery_instructions" className="block text-sm font-medium text-gray-700 mb-2">
                            Delivery Instructions (Optional)
                          </label>
                          <textarea
                            id="delivery_instructions"
                            value={deliveryInstructions}
                            onChange={(e) => setDeliveryInstructions(e.target.value)}
                            rows={2}
                            maxLength={200}
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                            placeholder="E.g., Ring doorbell, leave at gate"
                          />
                          <p className="mt-1 text-xs text-gray-500">{deliveryInstructions.length}/200 characters</p>
                        </div>
                      </div>
                    )}

                    {/* Delivery Fee Display */}
                    {currentLocationData && (
                      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                        <span className="text-sm font-medium text-green-900">Delivery Fee:</span>
                        <span className="text-sm font-bold text-green-900">
                          {cartSubtotal >= Number(currentLocationData.free_delivery_threshold || 0) 
                            ? 'FREE' 
                            : `€${Number(currentLocationData.delivery_fee || 0).toFixed(2)}`}
                        </span>
                      </div>
                    )}

                    {cartSubtotal < Number(currentLocationData?.free_delivery_threshold || 0) && (
                      <p className="text-xs text-gray-600 italic">
                        Add €{(Number(currentLocationData?.free_delivery_threshold || 0) - cartSubtotal).toFixed(2)} more for free delivery!
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Special Instructions Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Instructions</h3>
                <textarea
                  id="special_instructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                  placeholder="Any special requests or allergy information? (Optional)"
                />
                <p className="mt-1 text-xs text-gray-500">{specialInstructions.length}/500 characters</p>
              </div>

              {/* Mobile Order Summary Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setShowOrderSummary(!showOrderSummary)}
                  className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-900 transition-colors duration-200"
                >
                  {showOrderSummary ? 'Hide' : 'Show'} Order Summary
                </button>
              </div>

              {/* Continue to Payment Button (Mobile) */}
              <div className="lg:hidden">
                <button
                  onClick={handleContinueToPayment}
                  className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Continue to Payment
                </button>
              </div>
            </div>

            {/* Right Column - Order Summary (Sticky on Desktop) */}
            <div className={`lg:col-span-1 ${showOrderSummary ? 'block' : 'hidden lg:block'}`}>
              <div className="lg:sticky lg:top-24">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                  {/* Items */}
                  <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map((item) => (
                      <div key={item.product_id} className="flex items-center space-x-3 pb-3 border-b border-gray-100">
                        <img
                          src={item.primary_image_url}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">€{Number(item.subtotal || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-900">€{Number(cartSubtotal || 0).toFixed(2)}</span>
                    </div>

                    {fulfillmentMethod === 'delivery' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium text-gray-900">
                          {cartDeliveryFee === 0 ? 'FREE' : `€${Number(cartDeliveryFee || 0).toFixed(2)}`}
                        </span>
                      </div>
                    )}

                    {/* Loyalty Points Section */}
                    {isAuthenticated && currentUser && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Loyalty Points</span>
                          <span className="text-xs text-gray-600">
                            {Number(currentUser.loyalty_points_balance || 0)} available
                          </span>
                        </div>
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={loyaltyPointsUsed > 0}
                            onChange={(e) => handleLoyaltyPointsToggle(e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            Use points for discount
                          </span>
                        </label>
                        {loyaltyPointsUsed > 0 && (
                          <p className="text-xs text-green-600 mt-2">
                            -{loyaltyPointsUsed} points (€{(loyaltyPointsUsed / pointsRedemptionRate).toFixed(2)} discount)
                          </p>
                        )}
                      </div>
                    )}

                    {/* Promo Code Section */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      {!appliedPromoCode ? (
                        <div>
                          <label htmlFor="promo_code" className="block text-sm font-medium text-gray-700 mb-2">
                            Promo Code
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              id="promo_code"
                              placeholder="Enter code"
                              className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const code = (e.target as HTMLInputElement).value.trim().toUpperCase();
                                  if (code) {
                                    applyPromoCode(code);
                                    showToast('success', 'Promo code applied!');
                                  }
                                }
                              }}
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById('promo_code') as HTMLInputElement;
                                const code = input?.value.trim().toUpperCase();
                                if (code) {
                                  applyPromoCode(code);
                                  showToast('success', 'Promo code applied!');
                                }
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors duration-200"
                            >
                              Apply
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-green-900">Code: {appliedPromoCode}</p>
                            <p className="text-xs text-green-700">Discount applied</p>
                          </div>
                          <button
                            onClick={() => {
                              removePromoCode();
                              showToast('info', 'Promo code removed');
                            }}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Total Discount */}
                    {cartDiscount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span className="font-medium">-€{Number(cartDiscount || 0).toFixed(2)}</span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-300 pt-4 mt-4">
                      <span>Total</span>
                      <span>€{Number(cartTotal || 0).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Continue Button (Desktop) */}
                  <div className="hidden lg:block mt-6">
                    <button
                      onClick={handleContinueToPayment}
                      className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_Checkout_Step1;