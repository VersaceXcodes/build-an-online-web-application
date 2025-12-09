import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { ShoppingCart, X, Plus, Minus, Trash2, Tag, Award, AlertCircle } from 'lucide-react';
import axios from 'axios';

const GV_CartSlidePanel: React.FC = () => {
  const navigate = useNavigate();
  
  // CRITICAL: Individual Zustand selectors (no object destructuring!)
  const isAuthenticated = useAppStore(state => state.authentication_state.authentication_status.is_authenticated);
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const cartItems = useAppStore(state => state.cart_state.items);
  const selectedLocation = useAppStore(state => state.cart_state.selected_location);
  const fulfillmentMethod = useAppStore(state => state.cart_state.fulfillment_method);
  const totals = useAppStore(state => state.cart_state.totals);
  const appliedDiscounts = useAppStore(state => state.cart_state.applied_discounts);
  const cartPanelOpen = useAppStore(state => state.ui_state.cart_panel_open);
  const pointsRedemptionRate = useAppStore(state => state.system_config_state.points_redemption_rate);
  const freeDeliveryThreshold = useAppStore(state => state.system_config_state.free_delivery_threshold);
  
  // Store actions
  const updateCartQuantity = useAppStore(state => state.update_cart_quantity);
  const removeFromCart = useAppStore(state => state.remove_from_cart);
  const applyPromoCodeAction = useAppStore(state => state.apply_promo_code);
  const removePromoCodeAction = useAppStore(state => state.remove_promo_code);
  const applyLoyaltyPointsAction = useAppStore(state => state.apply_loyalty_points);
  const removeLoyaltyPointsAction = useAppStore(state => state.remove_loyalty_points);
  const clearCart = useAppStore(state => state.clear_cart);
  const closeCartPanel = useAppStore(state => state.close_cart_panel);
  const showToast = useAppStore(state => state.show_toast);
  const showConfirmation = useAppStore(state => state.show_confirmation);
  const hideConfirmation = useAppStore(state => state.hide_confirmation);
  
  // Local state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null);
  
  // Calculate loyalty points that can be used
  const loyaltyPointsAvailable = currentUser?.loyalty_points_balance || 0;
  const maxLoyaltyDiscount = Math.min(
    loyaltyPointsAvailable / pointsRedemptionRate,
    totals.subtotal
  );
  const maxLoyaltyPointsUsable = Math.floor(maxLoyaltyDiscount * pointsRedemptionRate);
  
  // Check if free delivery is eligible
  const isFreeDeliveryEligible = fulfillmentMethod === 'delivery' && 
    totals.subtotal >= (freeDeliveryThreshold || 30);
  
  // Sync loyalty points toggle with store state
  useEffect(() => {
    setUseLoyaltyPoints(appliedDiscounts.loyalty_points_used > 0);
  }, [appliedDiscounts.loyalty_points_used]);
  
  // Sync promo code input with store state
  useEffect(() => {
    if (appliedDiscounts.promo_code) {
      setPromoCodeInput(appliedDiscounts.promo_code);
      setPromoCodeError(null);
    } else {
      setPromoCodeInput('');
    }
  }, [appliedDiscounts.promo_code]);
  
  // Handle escape key to close panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cartPanelOpen) {
        closeCartPanel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [cartPanelOpen, closeCartPanel]);
  
  // Prevent body scroll when panel open
  useEffect(() => {
    if (cartPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [cartPanelOpen]);
  
  // Handle item quantity update
  const handleQuantityUpdate = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    
    setUpdatingQuantity(productId);
    updateCartQuantity(productId, newQuantity);
    
    // Simulate async update delay (store handles immediately)
    setTimeout(() => setUpdatingQuantity(null), 200);
  };
  
  // Handle item removal with confirmation
  const handleRemoveItem = (productId: string) => {
    const item = cartItems.find(i => i.product_id === productId);
    if (!item) return;
    
    showConfirmation({
      title: 'Remove item from cart?',
      message: `Are you sure you want to remove ${item.product_name} from your cart?`,
      confirm_text: 'Remove',
      cancel_text: 'Cancel',
      on_confirm: () => {
        removeFromCart(productId);
        showToast('info', 'Item removed from cart');
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      },
      danger_action: false,
    });
  };
  
  // Handle promo code application
  const handleApplyPromo = async () => {
    const trimmedCode = promoCodeInput.trim().toUpperCase();
    
    if (!trimmedCode) {
      setPromoCodeError('Please enter a promo code');
      return;
    }
    
    setApplyingPromo(true);
    setPromoCodeError(null);
    
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/promo-codes/validate`,
        {
          code: trimmedCode,
          order_total: totals.subtotal,
          location_name: selectedLocation,
          product_ids: cartItems.map(item => item.product_id),
        }
      );
      
      if (response.data.is_valid) {
        applyPromoCodeAction(trimmedCode);
        showToast('success', `Promo code applied! €${response.data.discount_amount.toFixed(2)} discount`);
        setPromoCodeError(null);
      } else {
        setPromoCodeError(response.data.message || 'Invalid promo code');
      }
    } catch (error: any) {
      setPromoCodeError(error.response?.data?.message || 'Failed to validate promo code');
    } finally {
      setApplyingPromo(false);
    }
  };
  
  // Handle promo code removal
  const handleRemovePromo = () => {
    removePromoCodeAction();
    setPromoCodeInput('');
    setPromoCodeError(null);
    showToast('info', 'Promo code removed');
  };
  
  // Handle loyalty points toggle
  const handleLoyaltyToggle = (checked: boolean) => {
    setUseLoyaltyPoints(checked);
    
    if (checked) {
      if (maxLoyaltyPointsUsable > 0) {
        applyLoyaltyPointsAction(maxLoyaltyPointsUsable);
        showToast('success', `Using ${maxLoyaltyPointsUsable} points for €${maxLoyaltyDiscount.toFixed(2)} discount`);
      } else {
        setUseLoyaltyPoints(false);
        showToast('warning', 'Not enough points to redeem');
      }
    } else {
      removeLoyaltyPointsAction();
      showToast('info', 'Loyalty points removed');
    }
  };
  
  // Handle checkout navigation
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showToast('warning', 'Your cart is empty');
      return;
    }
    
    closeCartPanel();
    navigate('/checkout');
  };
  
  // Handle continue shopping
  const handleContinueShopping = () => {
    closeCartPanel();
  };
  
  // Render nothing if panel not open
  if (!cartPanelOpen) return null;
  
  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={closeCartPanel}
        aria-hidden="true"
      />
      
      {/* Cart panel */}
      <div 
        className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 
            id="cart-panel-title" 
            className="text-xl font-bold text-gray-900 flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Your Cart
            {cartItems.length > 0 && (
              <span className="text-sm font-medium text-gray-600">
                ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </h2>
          <button
            onClick={closeCartPanel}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {/* Cart content */}
        <div className="flex-1 overflow-y-auto">
          {/* Empty cart state */}
          {cartItems.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Add some delicious desserts to get started!
              </p>
              <button
                onClick={handleContinueShopping}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          )}
          
          {/* Cart with items */}
          {cartItems.length > 0 && (
            <div className="px-4 py-4 space-y-6">
              {/* Location & Fulfillment Info */}
              {selectedLocation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Ordering from: <span className="font-semibold">{selectedLocation}</span>
                      </p>
                      {fulfillmentMethod && (
                        <p className="text-sm text-blue-700 mt-1">
                          Method: <span className="capitalize font-medium">{fulfillmentMethod}</span>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        showConfirmation({
                          title: 'Change location?',
                          message: 'Changing location will clear your cart. Are you sure?',
                          confirm_text: 'Clear Cart',
                          cancel_text: 'Cancel',
                          on_confirm: () => {
                            clearCart();
                            closeCartPanel();
                            navigate('/');
                            hideConfirmation();
                          },
                          on_cancel: () => {
                            hideConfirmation();
                          },
                          danger_action: true,
                        });
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium underline"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
              
              {/* Cart Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={item.product_id}
                    className="flex gap-4 bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    {/* Product Image */}
                    <Link
                      to={`/location/${selectedLocation}/product/${item.product_id}`}
                      onClick={closeCartPanel}
                      className="flex-shrink-0"
                    >
                      <img
                        src={item.primary_image_url}
                        alt={item.product_name}
                        className="w-20 h-20 object-cover rounded-md hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/location/${selectedLocation}/product/${item.product_id}`}
                        onClick={closeCartPanel}
                        className="block"
                      >
                        <h4 className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                          {item.product_name}
                        </h4>
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        €{Number(item.price || 0).toFixed(2)} each
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleQuantityUpdate(item.product_id, item.quantity - 1)}
                            disabled={updatingQuantity === item.product_id || item.quantity <= 1}
                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="px-4 py-1 text-sm font-medium text-gray-900 min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityUpdate(item.product_id, item.quantity + 1)}
                            disabled={updatingQuantity === item.product_id}
                            className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveItem(item.product_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Item Subtotal */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-gray-900">
                        €{Number(item.subtotal || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Loyalty Points Section (Authenticated only) */}
              {isAuthenticated && currentUser && loyaltyPointsAvailable > 0 && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-purple-900">
                          Loyalty Points Available: {loyaltyPointsAvailable}
                        </p>
                      </div>
                      
                      {maxLoyaltyPointsUsable > 0 ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useLoyaltyPoints}
                            onChange={(e) => handleLoyaltyToggle(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-purple-800">
                            Use {maxLoyaltyPointsUsable} points for €{maxLoyaltyDiscount.toFixed(2)} discount
                          </span>
                        </label>
                      ) : (
                        <p className="text-xs text-purple-700">
                          Minimum order value required to use points
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Promo Code Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Have a promo code?
                  </h3>
                </div>
                
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
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                        disabled={applyingPromo}
                      />
                      <button
                        onClick={handleApplyPromo}
                        disabled={applyingPromo || !promoCodeInput.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {applyingPromo ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Checking...
                          </span>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    
                    {promoCodeError && (
                      <div className="flex items-start gap-2 text-red-600 text-xs">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{promoCodeError}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        {appliedDiscounts.promo_code}
                      </span>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              
              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Order Summary
                </h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">€{Number(totals.subtotal || 0).toFixed(2)}</span>
                  </div>
                  
                  {fulfillmentMethod === 'delivery' && (
                    <div className="flex justify-between text-gray-700">
                      <span>Delivery Fee</span>
                      {isFreeDeliveryEligible ? (
                        <span className="text-green-600 font-semibold">FREE</span>
                      ) : (
                        <span className="font-medium">€{Number(totals.delivery_fee || 0).toFixed(2)}</span>
                      )}
                    </div>
                  )}
                  
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-€{Number(totals.discount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Free delivery progress */}
                  {fulfillmentMethod === 'delivery' && !isFreeDeliveryEligible && freeDeliveryThreshold && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                      <p className="text-xs text-blue-800 mb-2">
                        Add €{(freeDeliveryThreshold - totals.subtotal).toFixed(2)} more for FREE delivery!
                      </p>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((totals.subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between text-gray-900">
                      <span className="text-base font-bold">Total</span>
                      <span className="text-xl font-bold">€{Number(totals.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        {cartItems.length > 0 && (
          <div className="border-t border-gray-200 bg-white px-4 py-4 space-y-3 sticky bottom-0">
            <button
              onClick={handleCheckout}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold text-base hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Checkout - €{Number(totals.total || 0).toFixed(2)}
            </button>
            
            <button
              onClick={handleContinueShopping}
              className="w-full px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default GV_CartSlidePanel;