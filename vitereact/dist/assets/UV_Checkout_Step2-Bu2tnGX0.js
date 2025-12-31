import { h as useNavigate, u as useAppStore, r as reactExports, R as React, b as axios, j as jsxRuntimeExports } from "./index-CwVo5_So.js";
import { u as useMutation } from "./useMutation-HzYQCpti.js";
const UV_Checkout_Step2 = () => {
  const navigate = useNavigate();
  const cartItems = useAppStore((state) => state.cart_state.items);
  const selectedLocation = useAppStore((state) => state.cart_state.selected_location);
  const cartTotals = useAppStore((state) => state.cart_state.totals);
  const appliedDiscounts = useAppStore((state) => state.cart_state.applied_discounts);
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showLoading = useAppStore((state) => state.show_loading);
  const hideLoading = useAppStore((state) => state.hide_loading);
  const showToast = useAppStore((state) => state.show_toast);
  const clearCart = useAppStore((state) => state.clear_cart);
  const registerUser = useAppStore((state) => state.register_user);
  const applyPromoCode = useAppStore((state) => state.apply_promo_code);
  const removePromoCode = useAppStore((state) => state.remove_promo_code);
  const [checkoutData, setCheckoutData] = reactExports.useState(null);
  const [paymentMethod, setPaymentMethod] = reactExports.useState("card");
  const [cardholderName, setCardholderName] = reactExports.useState("");
  const [billingSameAsDelivery, setBillingSameAsDelivery] = reactExports.useState(true);
  const [billingAddress, setBillingAddress] = reactExports.useState({
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: ""
  });
  const [cardNumber, setCardNumber] = reactExports.useState("");
  const [cardExpiry, setCardExpiry] = reactExports.useState("");
  const [cardCvc, setCardCvc] = reactExports.useState("");
  const [, setOrderIdPending] = reactExports.useState(null);
  const [processingPayment, setProcessingPayment] = reactExports.useState(false);
  const [paymentError, setPaymentError] = reactExports.useState(null);
  const orderBeingPlacedRef = React.useRef(false);
  const [promoCodeInput, setPromoCodeInput] = reactExports.useState("");
  const [applyingPromo, setApplyingPromo] = reactExports.useState(false);
  const [promoCodeError, setPromoCodeError] = reactExports.useState(null);
  const api = axios.create({
    baseURL: `${"https://123build-an-online-web-application.launchpulse.ai"}/api`,
    headers: {
      "Content-Type": "application/json"
    },
    timeout: 3e4
    // 30 second timeout
  });
  if (authToken) {
    api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
  }
  reactExports.useEffect(() => {
    const sessionDataStr = sessionStorage.getItem("kake_checkout_session");
    if (!sessionDataStr) {
      showToast("error", "Please complete order details first");
      navigate("/checkout");
      return;
    }
    try {
      const sessionData = JSON.parse(sessionDataStr);
      setCheckoutData(sessionData);
      setCardholderName(sessionData.customer_name);
      if (sessionData.fulfillment_method === "delivery" && sessionData.delivery_address_line1) {
        setBillingAddress({
          address_line1: sessionData.delivery_address_line1,
          address_line2: sessionData.delivery_address_line2 || "",
          city: sessionData.delivery_city || "",
          postal_code: sessionData.delivery_postal_code || ""
        });
      }
    } catch (error) {
      console.error("Failed to parse session data:", error);
      showToast("error", "Invalid session data. Please start again.");
      navigate("/checkout");
    }
  }, [navigate, showToast]);
  reactExports.useEffect(() => {
    if (cartItems.length === 0 && !orderBeingPlacedRef.current) {
      console.log("[CHECKOUT STEP 2] Cart empty, redirecting to home");
      showToast("error", "Your cart is empty");
      navigate("/");
    }
  }, [cartItems, navigate, showToast]);
  reactExports.useEffect(() => {
    if (appliedDiscounts.promo_code) {
      setPromoCodeInput(appliedDiscounts.promo_code);
    }
  }, [appliedDiscounts.promo_code]);
  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const response = await api.post("/orders", orderData);
      return response.data;
    },
    onSuccess: (data) => {
      setOrderIdPending(data.order_id);
    },
    onError: (error) => {
      var _a, _b;
      const errorMessage = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to create order";
      setPaymentError(errorMessage);
      hideLoading();
      showToast("error", errorMessage);
    }
  });
  const confirmPaymentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put(`/orders/${data.order_id}/confirm-payment`, data.payload);
      return response.data;
    }
  });
  const handleApplyPromoCode = async () => {
    var _a, _b;
    if (!promoCodeInput.trim()) {
      setPromoCodeError("Please enter a promo code");
      return;
    }
    setApplyingPromo(true);
    setPromoCodeError(null);
    try {
      const response = await axios.post(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/promo-codes/validate`,
        {
          code: promoCodeInput.trim(),
          order_total: cartTotals.subtotal,
          location_name: selectedLocation
        }
      );
      if (response.data.is_valid) {
        const discountAmount = response.data.discount_amount || 0;
        console.log("[PROMO] API returned valid promo with discount:", discountAmount);
        console.log("[PROMO] Current cart subtotal:", cartTotals.subtotal);
        console.log("[PROMO] Full API response:", response.data);
        applyPromoCode(promoCodeInput.trim().toUpperCase(), discountAmount);
        showToast("success", response.data.message || "Promo code applied!");
        setPromoCodeError(null);
      } else {
        console.log("[PROMO] API returned invalid promo:", response.data.message);
        setPromoCodeError(response.data.message || "Invalid promo code");
      }
    } catch (error) {
      setPromoCodeError(((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to validate promo code");
    } finally {
      setApplyingPromo(false);
    }
  };
  const handleRemovePromoCode = () => {
    removePromoCode();
    setPromoCodeInput("");
    setPromoCodeError(null);
    showToast("info", "Promo code removed");
  };
  const validatePaymentForm = () => {
    if (paymentMethod === "cash") {
      setPaymentError(null);
      return true;
    }
    if (!cardholderName.trim()) {
      setPaymentError("Cardholder name is required");
      return false;
    }
    if (!cardNumber || cardNumber.length < 13) {
      setPaymentError("Please enter a valid card number");
      return false;
    }
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      setPaymentError("Please enter expiry date (MM/YY)");
      return false;
    }
    if (!cardCvc || cardCvc.length < 3) {
      setPaymentError("Please enter valid CVV");
      return false;
    }
    if (!billingSameAsDelivery) {
      if (!billingAddress.address_line1.trim()) {
        setPaymentError("Billing address is required");
        return false;
      }
      if (!billingAddress.city.trim()) {
        setPaymentError("Billing city is required");
        return false;
      }
      if (!billingAddress.postal_code.trim()) {
        setPaymentError("Billing postal code is required");
        return false;
      }
    }
    setPaymentError(null);
    return true;
  };
  const handlePlaceOrder = async () => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    if (!checkoutData) {
      showToast("error", "Session data missing");
      navigate("/checkout");
      return;
    }
    if (!validatePaymentForm()) {
      return;
    }
    orderBeingPlacedRef.current = true;
    setProcessingPayment(true);
    setPaymentError(null);
    showLoading("Processing your payment...");
    try {
      const orderPayload = {
        user_id: (currentUser == null ? void 0 : currentUser.user_id) || null,
        customer_email: checkoutData.customer_email,
        customer_name: checkoutData.customer_name,
        customer_phone: checkoutData.customer_phone,
        location_name: selectedLocation || "",
        order_type: "standard",
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
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          product_specific_notes: null
        }))
      };
      const orderResponse = await createOrderMutation.mutateAsync(orderPayload);
      const orderId = orderResponse.order_id;
      await new Promise((resolve) => setTimeout(resolve, 1500));
      let paymentTransactionId;
      let cardLastFour;
      if (paymentMethod === "cash") {
        paymentTransactionId = `cash_${Date.now()}`;
        cardLastFour = void 0;
      } else {
        paymentTransactionId = `txn_${Date.now()}`;
        cardLastFour = cardNumber.slice(-4);
      }
      await confirmPaymentMutation.mutateAsync({
        order_id: orderId,
        payload: {
          payment_transaction_id: paymentTransactionId,
          card_last_four: cardLastFour
        }
      });
      if (checkoutData.create_account && checkoutData.account_password) {
        try {
          const nameParts = checkoutData.customer_name.trim().split(" ");
          const firstName = nameParts[0] || checkoutData.customer_name;
          const lastName = nameParts.slice(1).join(" ") || "";
          await registerUser({
            email: checkoutData.customer_email,
            password: checkoutData.account_password,
            first_name: firstName,
            last_name: lastName,
            phone_number: checkoutData.customer_phone,
            marketing_opt_in: false
          });
          showToast("success", "Account created successfully!");
        } catch (error) {
          console.error("Account creation failed:", error);
          showToast("warning", "Order placed, but account creation failed. Please register separately.");
        }
      }
      const confirmationPath = orderResponse.confirmationUrl || `/order-confirmation/${orderId}`;
      console.log("[ORDER SUCCESS] Navigating to confirmation:", confirmationPath, "Order ID:", orderId);
      hideLoading();
      setProcessingPayment(false);
      clearCart();
      sessionStorage.removeItem("kake_checkout_session");
      navigate(confirmationPath, { replace: true });
    } catch (error) {
      console.error("Order placement error:", error);
      console.error("Error details:", {
        status: (_a = error.response) == null ? void 0 : _a.status,
        statusText: (_b = error.response) == null ? void 0 : _b.statusText,
        data: (_c = error.response) == null ? void 0 : _c.data,
        message: error.message,
        code: error.code
      });
      let errorMessage = "Payment processing failed. Please try again.";
      if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED") {
        errorMessage = "Unable to connect to the server. Please check your internet connection and try again.";
      } else if (error.code === "ERR_BAD_RESPONSE" && ((_d = error.response) == null ? void 0 : _d.status) === 530) {
        errorMessage = "The server is temporarily unavailable. Please try again in a few moments.";
      } else if (((_e = error.response) == null ? void 0 : _e.status) === 500) {
        errorMessage = ((_g = (_f = error.response) == null ? void 0 : _f.data) == null ? void 0 : _g.message) || "Server error. Please try again or contact support.";
      } else if ((_i = (_h = error.response) == null ? void 0 : _h.data) == null ? void 0 : _i.message) {
        errorMessage = error.response.data.message;
      }
      setPaymentError(errorMessage);
      setProcessingPayment(false);
      orderBeingPlacedRef.current = false;
      hideLoading();
      showToast("error", errorMessage);
    }
  };
  if (!checkoutData) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading checkout..." })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 md:py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-semibold", children: "✓" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm font-medium text-gray-900", children: "Details" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-0.5 bg-blue-600 max-w-[100px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold", children: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm font-medium text-gray-900", children: "Payment" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-0.5 bg-gray-300 max-w-[100px]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-semibold", children: "3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm font-medium text-gray-500", children: "Confirmation" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Payment Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: `border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${paymentMethod === "card" ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`,
                onClick: () => setPaymentMethod("card"),
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "radio",
                      id: "payment-card",
                      name: "payment-method",
                      checked: paymentMethod === "card",
                      onChange: () => setPaymentMethod("card"),
                      className: "h-5 w-5 text-blue-600 focus:ring-blue-500"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "payment-card", className: "ml-3 flex items-center cursor-pointer", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-semibold text-gray-900", children: "Credit / Debit Card" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 flex items-center space-x-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Visa" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Mastercard" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-500", children: "Amex" })
                    ] })
                  ] })
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: `border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${paymentMethod === "cash" ? "border-blue-600 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`,
                onClick: () => setPaymentMethod("cash"),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "radio",
                        id: "payment-cash",
                        name: "payment-method",
                        checked: paymentMethod === "cash",
                        onChange: () => setPaymentMethod("cash"),
                        className: "h-5 w-5 text-blue-600 focus:ring-blue-500"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "payment-cash", className: "ml-3 flex items-center cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-semibold text-gray-900", children: "Cash on Delivery / Collection" }) })
                  ] }),
                  paymentMethod === "cash" && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 ml-8 text-sm text-gray-600", children: "Pay with cash when your order is delivered or when you collect it." })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-green-600 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: paymentMethod === "card" ? "Secure payment powered by industry-standard encryption" : "Pay securely with cash upon delivery or collection" })
          ] })
        ] }),
        paymentMethod === "card" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-6", children: "Card Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "cardholder-name", className: "block text-sm font-semibold text-gray-700 mb-2", children: "Cardholder Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  id: "cardholder-name",
                  value: cardholderName,
                  onChange: (e) => {
                    setCardholderName(e.target.value);
                    setPaymentError(null);
                  },
                  placeholder: "Name as it appears on card",
                  className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "card-number", className: "block text-sm font-semibold text-gray-700 mb-2", children: "Card Number" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  id: "card-number",
                  value: cardNumber,
                  onChange: (e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setCardNumber(value.slice(0, 16));
                    setPaymentError(null);
                  },
                  placeholder: "1234 5678 9012 3456",
                  maxLength: 16,
                  className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-mono"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "card-expiry", className: "block text-sm font-semibold text-gray-700 mb-2", children: "Expiry Date" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "card-expiry",
                    value: cardExpiry,
                    onChange: (e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.length >= 2) {
                        value = value.slice(0, 2) + "/" + value.slice(2, 4);
                      }
                      setCardExpiry(value);
                      setPaymentError(null);
                    },
                    placeholder: "MM/YY",
                    maxLength: 5,
                    className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-mono"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "card-cvc", className: "block text-sm font-semibold text-gray-700 mb-2", children: "CVV" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "card-cvc",
                    value: cardCvc,
                    onChange: (e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setCardCvc(value.slice(0, 4));
                      setPaymentError(null);
                    },
                    placeholder: "123",
                    maxLength: 4,
                    className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-mono"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        paymentMethod === "card" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-6", children: "Billing Address" }),
          checkoutData.fulfillment_method === "delivery" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: billingSameAsDelivery,
                onChange: (e) => setBillingSameAsDelivery(e.target.checked),
                className: "h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-base font-medium text-gray-700", children: "Same as delivery address" })
          ] }) }),
          !billingSameAsDelivery && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "billing-address-line1", className: "block text-sm font-semibold text-gray-700 mb-2", children: "Address Line 1" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  id: "billing-address-line1",
                  value: billingAddress.address_line1,
                  onChange: (e) => {
                    setBillingAddress((prev) => ({ ...prev, address_line1: e.target.value }));
                    setPaymentError(null);
                  },
                  placeholder: "Street address",
                  className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "billing-address-line2", className: "block text-sm font-semibold text-gray-700 mb-2", children: [
                "Address Line 2 ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400 font-normal", children: "(Optional)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  id: "billing-address-line2",
                  value: billingAddress.address_line2,
                  onChange: (e) => setBillingAddress((prev) => ({ ...prev, address_line2: e.target.value })),
                  placeholder: "Apartment, suite, etc.",
                  className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "billing-city", className: "block text-sm font-semibold text-gray-700 mb-2", children: "City" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "billing-city",
                    value: billingAddress.city,
                    onChange: (e) => {
                      setBillingAddress((prev) => ({ ...prev, city: e.target.value }));
                      setPaymentError(null);
                    },
                    placeholder: "City",
                    className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "billing-postal-code", className: "block text-sm font-semibold text-gray-700 mb-2", children: "Postal Code" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "billing-postal-code",
                    value: billingAddress.postal_code,
                    onChange: (e) => {
                      setBillingAddress((prev) => ({ ...prev, postal_code: e.target.value }));
                      setPaymentError(null);
                    },
                    placeholder: "Postal code",
                    className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  }
                )
              ] })
            ] })
          ] })
        ] }),
        paymentMethod === "cash" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-4", children: "Cash Payment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-blue-900 mb-2", children: "Payment Instructions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Have the exact amount ready or be prepared with change" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                  "• Payment is due upon ",
                  (checkoutData == null ? void 0 : checkoutData.fulfillment_method) === "delivery" ? "delivery" : "collection"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "• Please have your order number ready: you'll receive it after placing your order" })
              ] })
            ] })
          ] }) })
        ] }),
        paymentError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border-2 border-red-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-red-600 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-red-800", children: "Payment Error" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700 mt-1", children: paymentError })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8 sticky top-24", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-6", children: "Order Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 mb-6 pb-6 border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-1", children: "Customer" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-gray-900", children: checkoutData.customer_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: checkoutData.customer_email })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-700 mb-1", children: "Fulfillment" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-gray-900 capitalize", children: checkoutData.fulfillment_method }),
            checkoutData.fulfillment_method === "delivery" && checkoutData.delivery_address_line1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
              checkoutData.delivery_address_line1,
              checkoutData.delivery_address_line2 && `, ${checkoutData.delivery_address_line2}`,
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
              checkoutData.delivery_city,
              ", ",
              checkoutData.delivery_postal_code
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-semibold text-gray-700 mb-3", children: [
            "Items (",
            cartItems.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: cartItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-600 font-medium", children: [
                item.quantity,
                "x"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-900", children: item.product_name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-900 font-semibold", children: [
              "€",
              Number(item.subtotal || 0).toFixed(2)
            ] })
          ] }, item.product_id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 pb-6 border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-700 mb-3", children: "Have a promo code?" }),
          !appliedDiscounts.promo_code ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: promoCodeInput,
                  onChange: (e) => {
                    setPromoCodeInput(e.target.value.toUpperCase());
                    setPromoCodeError(null);
                  },
                  placeholder: "Enter code",
                  className: "flex-1 px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-sm uppercase",
                  disabled: applyingPromo
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleApplyPromoCode,
                  disabled: applyingPromo || !promoCodeInput.trim(),
                  className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
                  children: applyingPromo ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin h-4 w-4", fill: "none", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                  ] }) }) : "Apply"
                }
              )
            ] }),
            promoCodeError && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-red-600 mt-1", children: promoCodeError })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-green-800", children: appliedDiscounts.promo_code })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleRemovePromoCode,
                className: "text-sm text-red-600 hover:text-red-800 font-medium",
                children: "Remove"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6 pb-6 border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-base text-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              "€",
              Number(cartTotals.subtotal || 0).toFixed(2)
            ] })
          ] }),
          cartTotals.delivery_fee > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-base text-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delivery Fee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              "€",
              Number(cartTotals.delivery_fee || 0).toFixed(2)
            ] })
          ] }),
          cartTotals.discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-base text-green-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              "-€",
              Number(cartTotals.discount || 0).toFixed(2)
            ] })
          ] }),
          appliedDiscounts.loyalty_points_used > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-blue-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Loyalty Points (",
              appliedDiscounts.loyalty_points_used,
              " pts)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              "-€",
              Number(appliedDiscounts.loyalty_points_used / 100 || 0).toFixed(2)
            ] })
          ] }),
          appliedDiscounts.promo_code && appliedDiscounts.promo_code_discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-green-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Promo Code (",
              appliedDiscounts.promo_code,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              "-€",
              Number(appliedDiscounts.promo_code_discount || 0).toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-base text-gray-700", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tax (20%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              "€",
              Number(cartTotals.tax || 0).toFixed(2)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl font-bold text-gray-900", children: "Total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold text-blue-600", children: [
            "€",
            Number(cartTotals.total || 0).toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handlePlaceOrder,
            disabled: processingPayment || paymentMethod === "card" && (!cardholderName || !cardNumber || !cardExpiry || !cardCvc),
            className: "w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-blue-100",
            "data-testid": "place-order-button",
            "aria-label": `Place order for total of €${Number(cartTotals.total || 0).toFixed(2)}`,
            children: processingPayment ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", fill: "none", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
              ] }),
              "Processing ",
              paymentMethod === "cash" ? "Order" : "Payment",
              "..."
            ] }) : Number(cartTotals.total || 0) === 0 ? "Place Order (Free)" : paymentMethod === "cash" ? `Place Order (Pay Cash €${Number(cartTotals.total || 0).toFixed(2)})` : `Place Order & Pay €${Number(cartTotals.total || 0).toFixed(2)}`
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => navigate("/checkout"),
            disabled: processingPayment,
            className: "w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-6 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
            children: "Back to Details"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 pt-6 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 text-green-600 mr-2", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Your payment is secure and encrypted" })
        ] }) })
      ] }) })
    ] })
  ] }) }) });
};
export {
  UV_Checkout_Step2 as default
};
