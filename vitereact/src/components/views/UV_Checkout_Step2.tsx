import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CheckoutSessionData {
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  fulfillment_method: 'collection' | 'delivery';
  delivery_address_line1?: string;
  delivery_address_line2?: string;
  delivery_city?: string;
  delivery_postal_code?: string;
  delivery_phone?: string;
  delivery_instructions?: string;
  special_instructions?: string;
  scheduled_time?: string | null;
  create_account: boolean;
  account_password?: string;
}

interface BillingAddress {
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
}

interface CreateOrderPayload {
  user_id: string | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  location_name: string;
  order_type: string;
  fulfillment_method: string;
  delivery_address_line1?: string | null;
  delivery_address_line2?: string | null;
  delivery_city?: string | null;
  delivery_postal_code?: string | null;
  delivery_phone?: string | null;
  delivery_instructions?: string | null;
  special_instructions?: string | null;
  scheduled_for?: string | null;
  promo_code?: string | null;
  payment_method: string;
  loyalty_points_used: number;
  items: Array<{
    product_id: string;
    quantity: number;
    product_specific_notes?: string | null;
  }>;
}

interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  orderNumber: string;
  confirmationUrl: string;
  order_id: string;
  order_number: string;
  order_status: string;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  items: any[];
}

interface UpdateOrderStatusPayload {
  order_status?: string;
  payment_transaction_id?: string;
  card_last_four?: string;
}

// interface RegisterUserPayload {
//   email: string;
//   password: string;
//   first_name: string;
//   last_name: string;
//   phone_number: string;
//   user_type: string;
//   marketing_opt_in: boolean;
// }

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_Checkout_Step2: React.FC = () => {
  const navigate = useNavigate();

  // ====================================================================
  // ZUSTAND STATE ACCESS (Individual selectors - CRITICAL!)
  // ====================================================================
  
  const cartItems = useAppStore(state => state.cart_state.items);
  const selectedLocation = useAppStore(state => state.cart_state.selected_location);
  const cartTotals = useAppStore(state => state.cart_state.totals);
  const appliedDiscounts = useAppStore(state => state.cart_state.applied_discounts);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showLoading = useAppStore(state => state.show_loading);
  const hideLoading = useAppStore(state => state.hide_loading);
  const showToast = useAppStore(state => state.show_toast);
  const clearCart = useAppStore(state => state.clear_cart);
  const registerUser = useAppStore(state => state.register_user);
  const applyPromoCode = useAppStore(state => state.apply_promo_code);
  const removePromoCode = useAppStore(state => state.remove_promo_code);

  // ====================================================================
  // LOCAL STATE
  // ====================================================================

  const [checkoutData, setCheckoutData] = useState<CheckoutSessionData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('card'); // 'card' or 'cash'
  const [cardholderName, setCardholderName] = useState<string>('');
  const [billingSameAsDelivery, setBillingSameAsDelivery] = useState<boolean>(true);
  const [billingAddress, setBillingAddress] = useState<BillingAddress>({
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
  });
  
  // Simulated Stripe Elements state
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvc, setCardCvc] = useState<string>('');
  
  const [, setOrderIdPending] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  
  // Track if order is being placed to prevent cart-empty redirect
  const orderBeingPlacedRef = React.useRef<boolean>(false);

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [applyingPromo, setApplyingPromo] = useState<boolean>(false);
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);

  // ====================================================================
  // API AXIOS INSTANCE
  // ====================================================================

  const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token if available
  if (authToken) {
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  }

  // ====================================================================
  // LOAD SESSION DATA ON MOUNT
  // ====================================================================

  useEffect(() => {
    // Load checkout data from session storage
    const sessionDataStr = sessionStorage.getItem('kake_checkout_session');
    
    if (!sessionDataStr) {
      // No session data, redirect to Step 1
      showToast('error', 'Please complete order details first');
      navigate('/checkout');
      return;
    }

    try {
      const sessionData: CheckoutSessionData = JSON.parse(sessionDataStr);
      setCheckoutData(sessionData);
      
      // Pre-fill cardholder name
      setCardholderName(sessionData.customer_name);
      
      // If delivery, set billing address same as delivery
      if (sessionData.fulfillment_method === 'delivery' && sessionData.delivery_address_line1) {
        setBillingAddress({
          address_line1: sessionData.delivery_address_line1,
          address_line2: sessionData.delivery_address_line2 || '',
          city: sessionData.delivery_city || '',
          postal_code: sessionData.delivery_postal_code || '',
        });
      }
    } catch (error) {
      console.error('Failed to parse session data:', error);
      showToast('error', 'Invalid session data. Please start again.');
      navigate('/checkout');
    }
  }, [navigate, showToast]);

  // Validate cart has items (but don't redirect if order is being placed)
  useEffect(() => {
    if (cartItems.length === 0 && !orderBeingPlacedRef.current) {
      console.log('[CHECKOUT STEP 2] Cart empty, redirecting to home');
      showToast('error', 'Your cart is empty');
      navigate('/');
    }
  }, [cartItems, navigate, showToast]);

  // Sync promo code input with store state
  useEffect(() => {
    if (appliedDiscounts.promo_code) {
      setPromoCodeInput(appliedDiscounts.promo_code);
    }
  }, [appliedDiscounts.promo_code]);

  // ====================================================================
  // API MUTATIONS
  // ====================================================================

  // Create Order Mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: CreateOrderPayload) => {
      const response = await api.post<CreateOrderResponse>('/orders', orderData);
      return response.data;
    },
    onSuccess: (data) => {
      setOrderIdPending(data.order_id);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'Failed to create order';
      setPaymentError(errorMessage);
      hideLoading();
      showToast('error', errorMessage);
    },
  });

  // Confirm Payment Mutation (updated to use new customer-friendly endpoint)
  const confirmPaymentMutation = useMutation({
    mutationFn: async (data: { order_id: string; payload: UpdateOrderStatusPayload }) => {
      const response = await api.put(`/orders/${data.order_id}/confirm-payment`, data.payload);
      return response.data;
    },
  });

  // Register User Mutation (if create_account = true)
  // const registerUserMutation = useMutation({
  //   mutationFn: async (userData: RegisterUserPayload) => {
  //     // Use the global store action
  //     await registerUser(userData);
  //   },
  // });

  // ====================================================================
  // PROMO CODE HANDLERS
  // ====================================================================

  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    setApplyingPromo(true);
    setPromoCodeError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/promo-codes/validate`,
        {
          code: promoCodeInput.trim(),
          order_total: cartTotals.subtotal,
          location_name: selectedLocation,
        }
      );

      if (response.data.is_valid) {
        const discountAmount = response.data.discount_amount || 0;
        console.log('[PROMO] API returned valid promo with discount:', discountAmount);
        console.log('[PROMO] Current cart subtotal:', cartTotals.subtotal);
        console.log('[PROMO] Full API response:', response.data);
        applyPromoCode(promoCodeInput.trim().toUpperCase(), discountAmount);
        showToast('success', response.data.message || 'Promo code applied!');
        setPromoCodeError(null);
      } else {
        console.log('[PROMO] API returned invalid promo:', response.data.message);
        setPromoCodeError(response.data.message || 'Invalid promo code');
      }
    } catch (error: any) {
      setPromoCodeError(error.response?.data?.message || 'Failed to validate promo code');
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    removePromoCode();
    setPromoCodeInput('');
    setPromoCodeError(null);
    showToast('info', 'Promo code removed');
  };

  // ====================================================================
  // FORM VALIDATION
  // ====================================================================

  const validatePaymentForm = (): boolean => {
    // Cash payment requires no validation
    if (paymentMethod === 'cash') {
      setPaymentError(null);
      return true;
    }

    // Card payment validation
    if (!cardholderName.trim()) {
      setPaymentError('Cardholder name is required');
      return false;
    }

    // Simulated card validation (in production, Stripe Elements handles this)
    if (!cardNumber || cardNumber.length < 13) {
      setPaymentError('Please enter a valid card number');
      return false;
    }

    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setPaymentError('Please enter expiry date (MM/YY)');
      return false;
    }

    if (!cardCvc || cardCvc.length < 3) {
      setPaymentError('Please enter valid CVV');
      return false;
    }

    // Billing address validation if different from delivery
    if (!billingSameAsDelivery) {
      if (!billingAddress.address_line1.trim()) {
        setPaymentError('Billing address is required');
        return false;
      }
      if (!billingAddress.city.trim()) {
        setPaymentError('Billing city is required');
        return false;
      }
      if (!billingAddress.postal_code.trim()) {
        setPaymentError('Billing postal code is required');
        return false;
      }
    }

    setPaymentError(null);
    return true;
  };

  // ====================================================================
  // PAYMENT PROCESSING FLOW
  // ====================================================================

  const handlePlaceOrder = async () => {
    if (!checkoutData) {
      showToast('error', 'Session data missing');
      navigate('/checkout');
      return;
    }

    // Validate payment form
    if (!validatePaymentForm()) {
      return;
    }

    // Set flag to prevent cart-empty redirect during order placement
    orderBeingPlacedRef.current = true;
    
    setProcessingPayment(true);
    setPaymentError(null);
    showLoading('Processing your payment...');

    try {
      // Step 1: Create order record (status: pending_payment)
      const orderPayload: CreateOrderPayload = {
        user_id: currentUser?.user_id || null,
        customer_email: checkoutData.customer_email,
        customer_name: checkoutData.customer_name,
        customer_phone: checkoutData.customer_phone,
        location_name: selectedLocation || '',
        order_type: 'standard',
        fulfillment_method: checkoutData.fulfillment_method,
        delivery_address_line1: checkoutData.delivery_address_line1 || null,
        delivery_address_line2: checkoutData.delivery_address_line2 || null,
        delivery_city: checkoutData.delivery_city || null,
        delivery_postal_code: checkoutData.delivery_postal_code || null,
        delivery_phone: checkoutData.delivery_phone || null,
        delivery_instructions: checkoutData.delivery_instructions || null,
        special_instructions: checkoutData.special_instructions || null,
        scheduled_for: checkoutData.scheduled_time || null,
        promo_code: appliedDiscounts.promo_code || null,
        payment_method: paymentMethod,
        loyalty_points_used: appliedDiscounts.loyalty_points_used || 0,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          product_specific_notes: null,
        })),
      };

      const orderResponse = await createOrderMutation.mutateAsync(orderPayload);
      const orderId = orderResponse.order_id;

      // Step 2: Simulate payment processing (in production: call Stripe/Square)
      // For MVP, we'll simulate a successful payment after 1.5 seconds
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulated payment response
      let paymentTransactionId: string;
      let cardLastFour: string | undefined;

      if (paymentMethod === 'cash') {
        paymentTransactionId = `cash_${Date.now()}`;
        cardLastFour = undefined; // No card for cash payment
      } else {
        paymentTransactionId = `txn_${Date.now()}`;
        cardLastFour = cardNumber.slice(-4);
      }

      // Step 3: Confirm payment (using customer-friendly endpoint)
      await confirmPaymentMutation.mutateAsync({
        order_id: orderId,
        payload: {
          payment_transaction_id: paymentTransactionId,
          card_last_four: cardLastFour,
        },
      });

      // Step 4: Create account if guest opted in
      if (checkoutData.create_account && checkoutData.account_password) {
        try {
          // Parse first and last name
          const nameParts = checkoutData.customer_name.trim().split(' ');
          const firstName = nameParts[0] || checkoutData.customer_name;
          const lastName = nameParts.slice(1).join(' ') || '';

          await registerUser({
            email: checkoutData.customer_email,
            password: checkoutData.account_password,
            first_name: firstName,
            last_name: lastName,
            phone_number: checkoutData.customer_phone,
            marketing_opt_in: false,
          });

          showToast('success', 'Account created successfully!');
        } catch (error) {
          console.error('Account creation failed:', error);
          // Don't block order completion if account creation fails
          showToast('warning', 'Order placed, but account creation failed. Please register separately.');
        }
      }

      // Step 5: Navigate to confirmation page
      // Use confirmationUrl from response if available
      const confirmationPath = orderResponse.confirmationUrl || `/order-confirmation/${orderId}`;
      
      console.log('[ORDER SUCCESS] Navigating to confirmation:', confirmationPath, 'Order ID:', orderId);
      
      hideLoading();
      setProcessingPayment(false);
      
      // Clear cart and session BEFORE navigation to prevent any race conditions
      clearCart();
      sessionStorage.removeItem('kake_checkout_session');
      
      // Navigate to confirmation page using replace to prevent back button issues
      navigate(confirmationPath, { replace: true });

    } catch (error: any) {
      console.error('Order placement error:', error);
      const errorMessage = error.response?.data?.message || 'Payment processing failed. Please try again.';
      setPaymentError(errorMessage);
      setProcessingPayment(false);
      orderBeingPlacedRef.current = false; // Reset flag on error
      hideLoading();
      showToast('error', errorMessage);
    }
  };

  // ====================================================================
  // LOADING STATE
  // ====================================================================

  if (!checkoutData) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        </div>
      </>
    );
  }

  // ====================================================================
  // MAIN RENDER
  // ====================================================================

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Details</span>
              </div>
              <div className="flex-1 h-0.5 bg-blue-600 max-w-[100px]"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">Payment</span>
              </div>
              <div className="flex-1 h-0.5 bg-gray-300 max-w-[100px]"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <span className="ml-2 text-sm font-medium text-gray-500">Confirmation</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Payment Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Method Selection */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                
                <div className="space-y-4">
                  {/* Card Payment */}
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'card' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="payment-card"
                        name="payment-method"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="payment-card" className="ml-3 flex items-center cursor-pointer">
                        <span className="text-lg font-semibold text-gray-900">Credit / Debit Card</span>
                        <div className="ml-3 flex items-center space-x-2">
                          <span className="text-xs font-medium text-gray-500">Visa</span>
                          <span className="text-xs font-medium text-gray-500">Mastercard</span>
                          <span className="text-xs font-medium text-gray-500">Amex</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Cash Payment */}
                  <div 
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                      paymentMethod === 'cash' 
                        ? 'border-blue-600 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="payment-cash"
                        name="payment-method"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="payment-cash" className="ml-3 flex items-center cursor-pointer">
                        <span className="text-lg font-semibold text-gray-900">Cash on Delivery / Collection</span>
                      </label>
                    </div>
                    {paymentMethod === 'cash' && (
                      <p className="mt-2 ml-8 text-sm text-gray-600">
                        Pay with cash when your order is delivered or when you collect it.
                      </p>
                    )}
                  </div>
                </div>

                {/* Secure Badge */}
                <div className="mt-4 flex items-center text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-medium">
                    {paymentMethod === 'card' 
                      ? 'Secure payment powered by industry-standard encryption'
                      : 'Pay securely with cash upon delivery or collection'}
                  </span>
                </div>
              </div>

              {/* Card Details Form - Only show when card payment is selected */}
              {paymentMethod === 'card' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Card Details</h3>
                
                <div className="space-y-5">
                  {/* Cardholder Name */}
                  <div>
                    <label htmlFor="cardholder-name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardholder-name"
                      value={cardholderName}
                      onChange={(e) => {
                        setCardholderName(e.target.value);
                        setPaymentError(null);
                      }}
                      placeholder="Name as it appears on card"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>

                  {/* Card Number (Simulated) */}
                  <div>
                    <label htmlFor="card-number" className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      id="card-number"
                      value={cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setCardNumber(value.slice(0, 16));
                        setPaymentError(null);
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={16}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-mono"
                    />
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="card-expiry" className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="card-expiry"
                        value={cardExpiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setCardExpiry(value);
                          setPaymentError(null);
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-mono"
                      />
                    </div>

                    <div>
                      <label htmlFor="card-cvc" className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="card-cvc"
                        value={cardCvc}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          setCardCvc(value.slice(0, 4));
                          setPaymentError(null);
                        }}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Billing Address - Only show when card payment is selected */}
              {paymentMethod === 'card' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Billing Address</h3>
                
                {checkoutData.fulfillment_method === 'delivery' && (
                  <div className="mb-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={billingSameAsDelivery}
                        onChange={(e) => setBillingSameAsDelivery(e.target.checked)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-base font-medium text-gray-700">
                        Same as delivery address
                      </span>
                    </label>
                  </div>
                )}

                {!billingSameAsDelivery && (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="billing-address-line1" className="block text-sm font-semibold text-gray-700 mb-2">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        id="billing-address-line1"
                        value={billingAddress.address_line1}
                        onChange={(e) => {
                          setBillingAddress(prev => ({ ...prev, address_line1: e.target.value }));
                          setPaymentError(null);
                        }}
                        placeholder="Street address"
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label htmlFor="billing-address-line2" className="block text-sm font-semibold text-gray-700 mb-2">
                        Address Line 2 <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="billing-address-line2"
                        value={billingAddress.address_line2}
                        onChange={(e) => setBillingAddress(prev => ({ ...prev, address_line2: e.target.value }))}
                        placeholder="Apartment, suite, etc."
                        className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="billing-city" className="block text-sm font-semibold text-gray-700 mb-2">
                          City
                        </label>
                        <input
                          type="text"
                          id="billing-city"
                          value={billingAddress.city}
                          onChange={(e) => {
                            setBillingAddress(prev => ({ ...prev, city: e.target.value }));
                            setPaymentError(null);
                          }}
                          placeholder="City"
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label htmlFor="billing-postal-code" className="block text-sm font-semibold text-gray-700 mb-2">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          id="billing-postal-code"
                          value={billingAddress.postal_code}
                          onChange={(e) => {
                            setBillingAddress(prev => ({ ...prev, postal_code: e.target.value }));
                            setPaymentError(null);
                          }}
                          placeholder="Postal code"
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              )}

              {/* Cash Payment Info */}
              {paymentMethod === 'cash' && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Cash Payment</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-2">
                        Payment Instructions
                      </p>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Have the exact amount ready or be prepared with change</li>
                        <li>• Payment is due upon {checkoutData?.fulfillment_method === 'delivery' ? 'delivery' : 'collection'}</li>
                        <li>• Please have your order number ready: you'll receive it after placing your order</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              )}

              {/* Error Display */}
              {paymentError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-semibold text-red-800">Payment Error</h3>
                      <p className="text-sm text-red-700 mt-1">{paymentError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h3>

                {/* Order Details Recap */}
                <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Customer</p>
                    <p className="text-base text-gray-900">{checkoutData.customer_name}</p>
                    <p className="text-sm text-gray-600">{checkoutData.customer_email}</p>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Fulfillment</p>
                    <p className="text-base text-gray-900 capitalize">{checkoutData.fulfillment_method}</p>
                    {checkoutData.fulfillment_method === 'delivery' && checkoutData.delivery_address_line1 && (
                      <p className="text-sm text-gray-600 mt-1">
                        {checkoutData.delivery_address_line1}
                        {checkoutData.delivery_address_line2 && `, ${checkoutData.delivery_address_line2}`}
                        <br />
                        {checkoutData.delivery_city}, {checkoutData.delivery_postal_code}
                      </p>
                    )}
                  </div>
                </div>

                {/* Cart Items */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Items ({cartItems.length})</h4>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.product_id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-600 font-medium">{item.quantity}x</span>
                          <span className="text-gray-900">{item.product_name}</span>
                        </div>
                        <span className="text-gray-900 font-semibold">
                          €{Number(item.subtotal || 0).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Have a promo code?
                  </h4>
                  
                  {!appliedDiscounts.promo_code ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCodeInput}
                          onChange={(e) => {
                            setPromoCodeInput(e.target.value.toUpperCase());
                            setPromoCodeError(null);
                          }}
                          placeholder="Enter code"
                          className="flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm uppercase"
                          disabled={applyingPromo}
                        />
                        <button
                          onClick={handleApplyPromoCode}
                          disabled={applyingPromo || !promoCodeInput.trim()}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {applyingPromo ? (
                            <span className="flex items-center">
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </span>
                          ) : (
                            'Apply'
                          )}
                        </button>
                      </div>
                      {promoCodeError && (
                        <p className="text-xs text-red-600 mt-1">{promoCodeError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-green-800">
                          {appliedDiscounts.promo_code}
                        </span>
                      </div>
                      <button
                        onClick={handleRemovePromoCode}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                  <div className="flex justify-between text-base text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">€{Number(cartTotals.subtotal || 0).toFixed(2)}</span>
                  </div>

                  {cartTotals.delivery_fee > 0 && (
                    <div className="flex justify-between text-base text-gray-700">
                      <span>Delivery Fee</span>
                      <span className="font-medium">€{Number(cartTotals.delivery_fee || 0).toFixed(2)}</span>
                    </div>
                  )}

                  {cartTotals.discount > 0 && (
                    <div className="flex justify-between text-base text-green-700">
                      <span>Discount</span>
                      <span className="font-medium">-€{Number(cartTotals.discount || 0).toFixed(2)}</span>
                    </div>
                  )}

                  {appliedDiscounts.loyalty_points_used > 0 && (
                    <div className="flex justify-between text-sm text-blue-700">
                      <span>Loyalty Points ({appliedDiscounts.loyalty_points_used} pts)</span>
                      <span className="font-medium">-€{Number(appliedDiscounts.loyalty_points_used / 100 || 0).toFixed(2)}</span>
                    </div>
                  )}

                  {appliedDiscounts.promo_code && appliedDiscounts.promo_code_discount > 0 && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Promo Code ({appliedDiscounts.promo_code})</span>
                      <span className="font-medium">-€{Number(appliedDiscounts.promo_code_discount || 0).toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base text-gray-700">
                    <span>Tax (20%)</span>
                    <span className="font-medium">€{Number(cartTotals.tax || 0).toFixed(2)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-blue-600">
                    €{Number(cartTotals.total || 0).toFixed(2)}
                  </span>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={
                    processingPayment || 
                    (paymentMethod === 'card' && (!cardholderName || !cardNumber || !cardExpiry || !cardCvc))
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-100"
                  data-testid="place-order-button"
                  aria-label={`Place order for total of €${Number(cartTotals.total || 0).toFixed(2)}`}
                >
                  {processingPayment ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing {paymentMethod === 'cash' ? 'Order' : 'Payment'}...
                    </span>
                  ) : Number(cartTotals.total || 0) === 0 ? (
                    'Place Order (Free)'
                  ) : paymentMethod === 'cash' ? (
                    `Place Order (Pay Cash €${Number(cartTotals.total || 0).toFixed(2)})`
                  ) : (
                    `Place Order & Pay €${Number(cartTotals.total || 0).toFixed(2)}`
                  )}
                </button>

                {/* Back to Details */}
                <button
                  onClick={() => navigate('/checkout')}
                  disabled={processingPayment}
                  className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back to Details
                </button>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Your payment is secure and encrypted</span>
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

export default UV_Checkout_Step2;