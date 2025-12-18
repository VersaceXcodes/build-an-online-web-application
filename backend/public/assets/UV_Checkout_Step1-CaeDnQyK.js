import { h as useNavigate, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, d as CircleAlert, G as User, i as Package, M as MapPin, C as Clock, b as axios } from "./index-i76FChob.js";
const fetchSavedAddresses = async (_userId, token) => {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/addresses`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const UV_Checkout_Step1 = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAppStore((state) => state.authentication_state.authentication_status.is_authenticated);
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const cartItems = useAppStore((state) => state.cart_state.items);
  const cartSubtotal = useAppStore((state) => state.cart_state.totals.subtotal);
  const cartDeliveryFee = useAppStore((state) => state.cart_state.totals.delivery_fee);
  const cartDiscount = useAppStore((state) => state.cart_state.totals.discount);
  const cartTax = useAppStore((state) => state.cart_state.totals.tax);
  const cartTotal = useAppStore((state) => state.cart_state.totals.total);
  const selectedLocation = useAppStore((state) => state.cart_state.selected_location);
  const cartFulfillmentMethod = useAppStore((state) => state.cart_state.fulfillment_method);
  const loyaltyPointsUsed = useAppStore((state) => state.cart_state.applied_discounts.loyalty_points_used);
  const appliedPromoCode = useAppStore((state) => state.cart_state.applied_discounts.promo_code);
  const locationDetails = useAppStore((state) => state.location_state.location_details);
  const availableLocations = useAppStore((state) => state.location_state.available_locations);
  const pointsRedemptionRate = useAppStore((state) => state.system_config_state.points_redemption_rate);
  const minimumOrderForDelivery = useAppStore((state) => state.system_config_state.minimum_order_for_delivery);
  const setDeliveryFee = useAppStore((state) => state.set_delivery_fee);
  const applyLoyaltyPoints = useAppStore((state) => state.apply_loyalty_points);
  const removeLoyaltyPoints = useAppStore((state) => state.remove_loyalty_points);
  const applyPromoCode = useAppStore((state) => state.apply_promo_code);
  const removePromoCode = useAppStore((state) => state.remove_promo_code);
  const showToast = useAppStore((state) => state.show_toast);
  const [customerEmail, setCustomerEmail] = reactExports.useState("");
  const [customerName, setCustomerName] = reactExports.useState("");
  const [customerPhone, setCustomerPhone] = reactExports.useState("");
  const [createAccount, setCreateAccount] = reactExports.useState(false);
  const [accountPassword, setAccountPassword] = reactExports.useState("");
  const [fulfillmentMethod, setFulfillmentMethod] = reactExports.useState("collection");
  const [pickupTimeOption, setPickupTimeOption] = reactExports.useState("asap");
  const [scheduledPickupDate, setScheduledPickupDate] = reactExports.useState("");
  const [scheduledPickupTime, setScheduledPickupTime] = reactExports.useState("");
  const [useSavedAddress, setUseSavedAddress] = reactExports.useState(false);
  const [selectedAddressId, setSelectedAddressId] = reactExports.useState(null);
  const [deliveryAddressLine1, setDeliveryAddressLine1] = reactExports.useState("");
  const [deliveryAddressLine2, setDeliveryAddressLine2] = reactExports.useState("");
  const [deliveryCity, setDeliveryCity] = reactExports.useState("");
  const [deliveryPostalCode, setDeliveryPostalCode] = reactExports.useState("");
  const [deliveryPhone, setDeliveryPhone] = reactExports.useState("");
  const [deliveryInstructions, setDeliveryInstructions] = reactExports.useState("");
  const [specialInstructions, setSpecialInstructions] = reactExports.useState("");
  const [loyaltyPointsInput, setLoyaltyPointsInput] = reactExports.useState("");
  const [formErrors, setFormErrors] = reactExports.useState({});
  const [showOrderSummary, setShowOrderSummary] = reactExports.useState(false);
  const { data: savedAddresses = [] } = useQuery({
    queryKey: ["addresses", currentUser == null ? void 0 : currentUser.user_id],
    queryFn: () => fetchSavedAddresses(currentUser.user_id, authToken),
    enabled: isAuthenticated && !!currentUser && !!authToken && fulfillmentMethod === "delivery",
    staleTime: 6e4
  });
  reactExports.useEffect(() => {
    if (cartItems.length === 0) {
      showToast("warning", "Your cart is empty. Please add items before checkout.");
      navigate("/");
    }
  }, [cartItems.length, navigate, showToast]);
  reactExports.useEffect(() => {
    if (isAuthenticated && currentUser) {
      setCustomerEmail(currentUser.email);
      setCustomerName(`${currentUser.first_name} ${currentUser.last_name}`);
      setCustomerPhone(currentUser.phone_number);
    }
  }, [isAuthenticated, currentUser]);
  reactExports.useEffect(() => {
    if (cartFulfillmentMethod) {
      setFulfillmentMethod(cartFulfillmentMethod);
    }
  }, [cartFulfillmentMethod]);
  reactExports.useEffect(() => {
    if (fulfillmentMethod === "collection" && !pickupTimeOption) {
      console.log("[EFFECT] Setting default pickupTimeOption to asap");
      setPickupTimeOption("asap");
    }
  }, [fulfillmentMethod, pickupTimeOption]);
  reactExports.useEffect(() => {
    if (savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddress = savedAddresses.find((addr) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.address_id);
        setUseSavedAddress(true);
        applySelectedAddress(defaultAddress);
      }
    }
  }, [savedAddresses]);
  reactExports.useEffect(() => {
    if (loyaltyPointsUsed > 0) {
      setLoyaltyPointsInput(String(loyaltyPointsUsed));
    } else {
      setLoyaltyPointsInput("");
    }
  }, [loyaltyPointsUsed]);
  reactExports.useEffect(() => {
    if (fulfillmentMethod === "collection") {
      setDeliveryFee(0);
    } else if (fulfillmentMethod === "delivery" && locationDetails) {
      const freeThreshold = locationDetails.free_delivery_threshold || 0;
      if (cartSubtotal >= freeThreshold) {
        setDeliveryFee(0);
      } else {
        setDeliveryFee(Number(locationDetails.delivery_fee || 0));
      }
    }
  }, [fulfillmentMethod, cartSubtotal, locationDetails, setDeliveryFee]);
  const applySelectedAddress = (address) => {
    setDeliveryAddressLine1(address.address_line1);
    setDeliveryAddressLine2(address.address_line2 || "");
    setDeliveryCity(address.city);
    setDeliveryPostalCode(address.postal_code);
    setDeliveryPhone(address.delivery_phone || customerPhone);
    setDeliveryInstructions(address.delivery_instructions || "");
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const validatePhone = (phone) => {
    const phoneWithoutSpaces = phone.replace(/\s/g, "");
    const internationalRegex = /^\+[1-9][0-9]{9,14}$/;
    const localRegex = /^0[0-9]{8,9}$/;
    return internationalRegex.test(phoneWithoutSpaces) || localRegex.test(phoneWithoutSpaces);
  };
  const validatePostalCode = (code) => {
    return code.length >= 3 && code.length <= 20;
  };
  const validateForm = () => {
    const errors = {};
    console.log("[VALIDATE] Starting validation...");
    console.log("[VALIDATE] fulfillmentMethod:", fulfillmentMethod);
    console.log("[VALIDATE] pickupTimeOption:", pickupTimeOption);
    if (!customerEmail) {
      console.log("[VALIDATE] ERROR: Email is missing");
      errors.customer_email = "Email is required";
    } else if (!validateEmail(customerEmail)) {
      console.log("[VALIDATE] ERROR: Email format invalid");
      errors.customer_email = "Invalid email format";
    }
    if (!customerName || customerName.trim().length < 2) {
      console.log("[VALIDATE] ERROR: Name is missing or too short");
      errors.customer_name = "Full name is required";
    }
    if (!customerPhone) {
      console.log("[VALIDATE] ERROR: Phone is missing");
      errors.customer_phone = "Phone number is required";
    } else if (!validatePhone(customerPhone)) {
      console.log("[VALIDATE] ERROR: Phone format invalid");
      errors.customer_phone = "Invalid phone number format";
    }
    if (createAccount && !isAuthenticated) {
      if (!accountPassword || accountPassword.length < 8) {
        console.log("[VALIDATE] ERROR: Password too short");
        errors.account_password = "Password must be at least 8 characters";
      }
    }
    if (fulfillmentMethod === "delivery") {
      console.log("[VALIDATE] Validating delivery address...");
      if (!deliveryAddressLine1) {
        console.log("[VALIDATE] ERROR: Address line 1 missing");
        errors.delivery_address_line1 = "Address is required";
      }
      if (!deliveryCity) {
        console.log("[VALIDATE] ERROR: City missing");
        errors.delivery_city = "City is required";
      }
      if (!deliveryPostalCode) {
        console.log("[VALIDATE] ERROR: Postal code missing");
        errors.delivery_postal_code = "Postal code is required";
      } else if (!validatePostalCode(deliveryPostalCode)) {
        console.log("[VALIDATE] ERROR: Postal code format invalid");
        errors.delivery_postal_code = "Invalid postal code format";
      }
      if (cartSubtotal < minimumOrderForDelivery) {
        console.log("[VALIDATE] ERROR: Cart subtotal below minimum for delivery");
        errors.general = `Minimum order for delivery is €${minimumOrderForDelivery.toFixed(2)}`;
      }
    }
    if (fulfillmentMethod === "collection") {
      console.log("[VALIDATE] Validating collection pickup time...");
      console.log("[VALIDATE] pickupTimeOption:", pickupTimeOption);
      if (!pickupTimeOption || pickupTimeOption !== "asap" && pickupTimeOption !== "scheduled") {
        console.log("[VALIDATE] ERROR: pickupTimeOption is invalid:", pickupTimeOption);
        errors.general = "Please select a pickup time option (ASAP or Scheduled)";
      } else if (pickupTimeOption === "scheduled") {
        console.log("[VALIDATE] Validating scheduled pickup...");
        if (!scheduledPickupDate) {
          console.log("[VALIDATE] ERROR: Scheduled pickup date missing");
          errors.scheduled_pickup_date = "Pickup date is required";
        }
        if (!scheduledPickupTime) {
          console.log("[VALIDATE] ERROR: Scheduled pickup time missing");
          errors.scheduled_pickup_time = "Pickup time is required";
        }
        if (scheduledPickupDate && scheduledPickupTime) {
          const scheduledDateTime = /* @__PURE__ */ new Date(`${scheduledPickupDate}T${scheduledPickupTime}`);
          const minDateTime = new Date(Date.now() + 2 * 60 * 60 * 1e3);
          if (scheduledDateTime < minDateTime) {
            console.log("[VALIDATE] ERROR: Scheduled time too soon");
            errors.scheduled_pickup_date = "Pickup must be at least 2 hours in advance";
          }
        }
      } else {
        console.log("[VALIDATE] ASAP pickup selected - validation passed");
      }
    }
    console.log("[VALIDATE] Validation complete. Errors:", errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleContinueToPayment = () => {
    console.log("=== VALIDATION DEBUG ===");
    console.log("fulfillmentMethod:", fulfillmentMethod);
    console.log("pickupTimeOption:", pickupTimeOption);
    console.log("customerEmail:", customerEmail);
    console.log("customerName:", customerName);
    console.log("customerPhone:", customerPhone);
    if (!validateForm()) {
      console.log("Validation failed. Errors:", formErrors);
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      const errorFields = Object.keys(formErrors);
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0].replace(/_/g, " ");
        showToast("error", `Please fix the following: ${firstErrorField}`);
      } else {
        showToast("error", "Please fix the errors before continuing");
      }
      return;
    }
    console.log("Validation passed! Proceeding to payment...");
    const checkoutData = {
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone,
      create_account: createAccount && !isAuthenticated,
      account_password: createAccount ? accountPassword : null,
      fulfillment_method: fulfillmentMethod,
      delivery_address_line1: fulfillmentMethod === "delivery" ? deliveryAddressLine1 : null,
      delivery_address_line2: fulfillmentMethod === "delivery" ? deliveryAddressLine2 : null,
      delivery_city: fulfillmentMethod === "delivery" ? deliveryCity : null,
      delivery_postal_code: fulfillmentMethod === "delivery" ? deliveryPostalCode : null,
      delivery_phone: fulfillmentMethod === "delivery" ? deliveryPhone || customerPhone : null,
      delivery_instructions: fulfillmentMethod === "delivery" ? deliveryInstructions : null,
      special_instructions: specialInstructions || null,
      scheduled_for: pickupTimeOption === "scheduled" ? `${scheduledPickupDate}T${scheduledPickupTime}` : null
    };
    sessionStorage.setItem("kake_checkout_session", JSON.stringify(checkoutData));
    navigate("/checkout/payment");
  };
  const handleSavedAddressChange = (addressId) => {
    setSelectedAddressId(addressId);
    const address = savedAddresses.find((a) => a.address_id === addressId);
    if (address) {
      applySelectedAddress(address);
    }
  };
  const handleLoyaltyPointsToggle = (checked) => {
    if (checked && currentUser) {
      const availablePoints = Number(currentUser.loyalty_points_balance || 0);
      const maxPointsUsable = Math.floor(cartSubtotal * pointsRedemptionRate);
      const pointsToUse = Math.min(availablePoints, maxPointsUsable);
      if (pointsToUse > 0) {
        setLoyaltyPointsInput(String(pointsToUse));
        applyLoyaltyPoints(pointsToUse);
        showToast("success", `Using ${pointsToUse} points for €${(pointsToUse / pointsRedemptionRate).toFixed(2)} discount`);
      } else {
        showToast("warning", "Not enough points available");
      }
    } else {
      removeLoyaltyPoints();
      setLoyaltyPointsInput("");
    }
  };
  const handleLoyaltyPointsInputChange = (value) => {
    if (value === "" || /^\d+$/.test(value)) {
      setLoyaltyPointsInput(value);
    }
  };
  const handleApplyLoyaltyPoints = () => {
    if (!currentUser) return;
    const points = parseInt(loyaltyPointsInput) || 0;
    const availablePoints = Number(currentUser.loyalty_points_balance || 0);
    const maxPointsUsable = Math.floor(cartSubtotal * pointsRedemptionRate);
    if (points === 0) {
      showToast("warning", "Please enter a valid number of points");
      return;
    }
    if (points > availablePoints) {
      showToast("error", `You only have ${availablePoints} points available`);
      return;
    }
    if (points > maxPointsUsable) {
      showToast("error", `Maximum ${maxPointsUsable} points can be used for this order`);
      return;
    }
    applyLoyaltyPoints(points);
    const discount = (points / pointsRedemptionRate).toFixed(2);
    showToast("success", `Using ${points} points for €${discount} discount`);
  };
  const getEstimatedReadyTime = () => {
    if (!locationDetails) return "Processing...";
    const prepTime = Number(locationDetails.estimated_preparation_time_minutes || 20);
    const delivTime = fulfillmentMethod === "delivery" ? Number(locationDetails.estimated_delivery_time_minutes || 0) : 0;
    const totalMinutes = prepTime + delivTime;
    if (pickupTimeOption === "scheduled" && scheduledPickupDate && scheduledPickupTime) {
      return `Scheduled for ${scheduledPickupDate} at ${scheduledPickupTime}`;
    }
    const readyTime = new Date(Date.now() + totalMinutes * 6e4);
    return readyTime.toLocaleString("en-IE", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short"
    });
  };
  const getCurrentLocation = () => {
    if (!selectedLocation) return null;
    return availableLocations.find((loc) => loc.location_name.toLowerCase() === selectedLocation.toLowerCase()) || locationDetails;
  };
  const currentLocationData = getCurrentLocation();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 lg:py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-semibold", children: "1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm font-medium text-blue-600", children: "Order Details" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-1 bg-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-10 h-10 bg-gray-300 text-gray-600 rounded-full font-semibold", children: "2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm font-medium text-gray-600", children: "Payment" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-1 bg-gray-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-10 h-10 bg-gray-300 text-gray-600 rounded-full font-semibold", children: "3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm font-medium text-gray-600", children: "Confirmation" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
        formErrors.general && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start space-x-3", "data-error": "true", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm font-medium", children: formErrors.general })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-6 h-6 text-blue-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Customer Information" })
          ] }),
          isAuthenticated && currentUser ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Ordering as:" }),
                " ",
                currentUser.first_name,
                " ",
                currentUser.last_name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-700", children: currentUser.email }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-700", children: currentUser.phone_number })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 italic", children: "Need to use different information? Update in your account settings after checkout." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "customer_email", className: "block text-sm font-medium text-gray-700 mb-2", children: [
                "Email Address ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "email",
                  id: "customer_email",
                  value: customerEmail,
                  onChange: (e) => {
                    setCustomerEmail(e.target.value);
                    if (formErrors.customer_email) {
                      setFormErrors((prev) => ({ ...prev, customer_email: void 0 }));
                    }
                  },
                  className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.customer_email ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"} transition-all duration-200`,
                  placeholder: "your.email@example.com",
                  "data-error": !!formErrors.customer_email
                }
              ),
              formErrors.customer_email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.customer_email })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "customer_name", className: "block text-sm font-medium text-gray-700 mb-2", children: [
                "Full Name ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  id: "customer_name",
                  value: customerName,
                  onChange: (e) => {
                    setCustomerName(e.target.value);
                    if (formErrors.customer_name) {
                      setFormErrors((prev) => ({ ...prev, customer_name: void 0 }));
                    }
                  },
                  className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.customer_name ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"} transition-all duration-200`,
                  placeholder: "John Doe",
                  "data-error": !!formErrors.customer_name
                }
              ),
              formErrors.customer_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.customer_name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "customer_phone", className: "block text-sm font-medium text-gray-700 mb-2", children: [
                "Phone Number ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "tel",
                  id: "customer_phone",
                  value: customerPhone,
                  onChange: (e) => {
                    setCustomerPhone(e.target.value);
                    if (formErrors.customer_phone) {
                      setFormErrors((prev) => ({ ...prev, customer_phone: void 0 }));
                    }
                  },
                  className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.customer_phone ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"} transition-all duration-200`,
                  placeholder: "+353 86 123 4567",
                  "data-error": !!formErrors.customer_phone
                }
              ),
              formErrors.customer_phone && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.customer_phone })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-4 mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start space-x-3 cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: createAccount,
                    onChange: (e) => setCreateAccount(e.target.checked),
                    className: "mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "Create an account for faster checkouts and loyalty points" })
              ] }),
              createAccount && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "account_password", className: "block text-sm font-medium text-gray-700 mb-2", children: [
                  "Password ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "password",
                    id: "account_password",
                    value: accountPassword,
                    onChange: (e) => {
                      setAccountPassword(e.target.value);
                      if (formErrors.account_password) {
                        setFormErrors((prev) => ({ ...prev, account_password: void 0 }));
                      }
                    },
                    className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.account_password ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"} transition-all duration-200`,
                    placeholder: "Minimum 8 characters",
                    "data-error": !!formErrors.account_password
                  }
                ),
                formErrors.account_password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.account_password })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-6 h-6 text-blue-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Fulfillment Method" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                className: `relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${fulfillmentMethod === "collection" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "radio",
                      name: "fulfillment_method",
                      value: "collection",
                      checked: fulfillmentMethod === "collection",
                      onChange: () => setFulfillmentMethod("collection"),
                      className: "sr-only"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: `w-8 h-8 mx-auto mb-2 ${fulfillmentMethod === "collection" ? "text-blue-600" : "text-gray-400"}` }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-semibold ${fulfillmentMethod === "collection" ? "text-blue-600" : "text-gray-700"}`, children: "Collection" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Pick up at store" })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                className: `relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${fulfillmentMethod === "delivery" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "radio",
                      name: "fulfillment_method",
                      value: "delivery",
                      checked: fulfillmentMethod === "delivery",
                      onChange: () => setFulfillmentMethod("delivery"),
                      className: "sr-only"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: `w-8 h-8 mx-auto mb-2 ${fulfillmentMethod === "delivery" ? "text-blue-600" : "text-gray-400"}` }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `font-semibold ${fulfillmentMethod === "delivery" ? "text-blue-600" : "text-gray-700"}`, children: "Delivery" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Deliver to address" })
                  ] })
                ]
              }
            )
          ] }),
          fulfillmentMethod === "collection" && currentLocationData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-6 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-900 mb-2", children: "Collect from:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700", children: currentLocationData.location_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: currentLocationData.address_line1 }),
              currentLocationData.address_line2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: currentLocationData.address_line2 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                currentLocationData.city,
                " ",
                currentLocationData.postal_code
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: formErrors.general && formErrors.general.includes("pickup") ? "border-2 border-red-300 rounded-lg p-4" : "", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-3", children: [
                "Pickup Time ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center space-x-3 cursor-pointer", "data-pickup-option": "asap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "radio",
                      name: "pickup_time",
                      value: "asap",
                      checked: pickupTimeOption === "asap",
                      onChange: (e) => {
                        if (e.target.checked) {
                          setPickupTimeOption("asap");
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors.scheduled_pickup_date;
                            delete newErrors.scheduled_pickup_time;
                            if (newErrors.general && newErrors.general.toLowerCase().includes("pickup")) {
                              delete newErrors.general;
                            }
                            return newErrors;
                          });
                        }
                      },
                      className: "w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500",
                      "data-testid": "pickup-asap"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700", children: [
                    "ASAP (Ready in ",
                    Number(currentLocationData.estimated_preparation_time_minutes || 20),
                    " minutes)"
                  ] })
                ] }),
                currentLocationData.allow_scheduled_pickups && /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center space-x-3 cursor-pointer", "data-pickup-option": "scheduled", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "radio",
                      name: "pickup_time",
                      value: "scheduled",
                      checked: pickupTimeOption === "scheduled",
                      onChange: (e) => {
                        if (e.target.checked) {
                          setPickupTimeOption("scheduled");
                          setFormErrors((prev) => {
                            const newErrors = { ...prev };
                            if (newErrors.general && newErrors.general.toLowerCase().includes("pickup")) {
                              delete newErrors.general;
                            }
                            return newErrors;
                          });
                        }
                      },
                      className: "w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500",
                      "data-testid": "pickup-scheduled"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "Schedule for later" })
                ] })
              ] }),
              pickupTimeOption === "scheduled" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "pickup_date", className: "block text-sm font-medium text-gray-700 mb-2", children: [
                    "Date ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "date",
                      id: "pickup_date",
                      value: scheduledPickupDate,
                      onChange: (e) => {
                        setScheduledPickupDate(e.target.value);
                        if (formErrors.scheduled_pickup_date) {
                          setFormErrors((prev) => ({ ...prev, scheduled_pickup_date: void 0 }));
                        }
                      },
                      min: new Date(Date.now() + 2 * 60 * 60 * 1e3).toISOString().split("T")[0],
                      className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.scheduled_pickup_date ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"} transition-all duration-200`,
                      "data-error": !!formErrors.scheduled_pickup_date
                    }
                  ),
                  formErrors.scheduled_pickup_date && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.scheduled_pickup_date })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "pickup_time", className: "block text-sm font-medium text-gray-700 mb-2", children: [
                    "Time ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "time",
                      id: "pickup_time",
                      value: scheduledPickupTime,
                      onChange: (e) => {
                        setScheduledPickupTime(e.target.value);
                        if (formErrors.scheduled_pickup_time) {
                          setFormErrors((prev) => ({ ...prev, scheduled_pickup_time: void 0 }));
                        }
                      },
                      className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.scheduled_pickup_time ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"} transition-all duration-200`,
                      "data-error": !!formErrors.scheduled_pickup_time
                    }
                  ),
                  formErrors.scheduled_pickup_time && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.scheduled_pickup_time })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-blue-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Estimated ready time: ",
                getEstimatedReadyTime()
              ] })
            ] })
          ] }),
          fulfillmentMethod === "delivery" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-6 space-y-4", children: [
            isAuthenticated && savedAddresses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center space-x-3 cursor-pointer mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: useSavedAddress,
                    onChange: (e) => {
                      setUseSavedAddress(e.target.checked);
                      if (!e.target.checked) {
                        setSelectedAddressId(null);
                        setDeliveryAddressLine1("");
                        setDeliveryAddressLine2("");
                        setDeliveryCity("");
                        setDeliveryPostalCode("");
                        setDeliveryPhone("");
                        setDeliveryInstructions("");
                      }
                    },
                    className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Use saved address" })
              ] }),
              useSavedAddress && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: selectedAddressId || "",
                  onChange: (e) => handleSavedAddressChange(e.target.value),
                  className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select an address" }),
                    savedAddresses.map((address) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: address.address_id, children: [
                      address.address_label ? `${address.address_label} - ` : "",
                      address.address_line1,
                      ", ",
                      address.city
                    ] }, address.address_id))
                  ]
                }
              )
            ] }),
            (!useSavedAddress || !isAuthenticated) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "delivery_address_line1", className: "block text-sm font-medium text-gray-700 mb-2", children: [
                  "Street Address ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "delivery_address_line1",
                    value: deliveryAddressLine1,
                    onChange: (e) => {
                      setDeliveryAddressLine1(e.target.value);
                      if (formErrors.delivery_address_line1) {
                        setFormErrors((prev) => ({ ...prev, delivery_address_line1: void 0 }));
                      }
                    },
                    className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.delivery_address_line1 ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"} transition-all duration-200`,
                    placeholder: "123 Main Street",
                    "data-error": !!formErrors.delivery_address_line1
                  }
                ),
                formErrors.delivery_address_line1 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.delivery_address_line1 })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "delivery_address_line2", className: "block text-sm font-medium text-gray-700 mb-2", children: "Apartment, Suite, etc. (Optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "delivery_address_line2",
                    value: deliveryAddressLine2,
                    onChange: (e) => setDeliveryAddressLine2(e.target.value),
                    className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200",
                    placeholder: "Apt 4B"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "delivery_city", className: "block text-sm font-medium text-gray-700 mb-2", children: [
                    "City ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      id: "delivery_city",
                      value: deliveryCity,
                      onChange: (e) => {
                        setDeliveryCity(e.target.value);
                        if (formErrors.delivery_city) {
                          setFormErrors((prev) => ({ ...prev, delivery_city: void 0 }));
                        }
                      },
                      className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.delivery_city ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"} transition-all duration-200`,
                      placeholder: "Dublin",
                      "data-error": !!formErrors.delivery_city
                    }
                  ),
                  formErrors.delivery_city && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.delivery_city })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "delivery_postal_code", className: "block text-sm font-medium text-gray-700 mb-2", children: [
                    "Postal Code ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      id: "delivery_postal_code",
                      value: deliveryPostalCode,
                      onChange: (e) => {
                        setDeliveryPostalCode(e.target.value);
                        if (formErrors.delivery_postal_code) {
                          setFormErrors((prev) => ({ ...prev, delivery_postal_code: void 0 }));
                        }
                      },
                      className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.delivery_postal_code ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"} transition-all duration-200`,
                      placeholder: "D02 XY12",
                      "data-error": !!formErrors.delivery_postal_code
                    }
                  ),
                  formErrors.delivery_postal_code && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.delivery_postal_code })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "delivery_phone", className: "block text-sm font-medium text-gray-700 mb-2", children: "Delivery Phone (Optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "tel",
                    id: "delivery_phone",
                    value: deliveryPhone,
                    onChange: (e) => setDeliveryPhone(e.target.value),
                    className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200",
                    placeholder: "Defaults to your phone number"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "delivery_instructions", className: "block text-sm font-medium text-gray-700 mb-2", children: "Delivery Instructions (Optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    id: "delivery_instructions",
                    value: deliveryInstructions,
                    onChange: (e) => setDeliveryInstructions(e.target.value),
                    rows: 2,
                    maxLength: 200,
                    className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none",
                    placeholder: "E.g., Ring doorbell, leave at gate"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-gray-500", children: [
                  deliveryInstructions.length,
                  "/200 characters"
                ] })
              ] })
            ] }),
            currentLocationData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-green-900", children: "Delivery Fee:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-green-900", children: cartSubtotal >= Number(currentLocationData.free_delivery_threshold || 0) ? "FREE" : `€${Number(currentLocationData.delivery_fee || 0).toFixed(2)}` })
            ] }),
            cartSubtotal < Number((currentLocationData == null ? void 0 : currentLocationData.free_delivery_threshold) || 0) && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600 italic", children: [
              "Add €",
              (Number((currentLocationData == null ? void 0 : currentLocationData.free_delivery_threshold) || 0) - cartSubtotal).toFixed(2),
              " more for free delivery!"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Special Instructions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "special_instructions",
              value: specialInstructions,
              onChange: (e) => setSpecialInstructions(e.target.value),
              rows: 3,
              maxLength: 500,
              className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none",
              placeholder: "Any special requests or allergy information? (Optional)"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-gray-500", children: [
            specialInstructions.length,
            "/500 characters"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowOrderSummary(!showOrderSummary),
            className: "w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-900 transition-colors duration-200",
            children: [
              showOrderSummary ? "Hide" : "Show",
              " Order Summary"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleContinueToPayment,
            className: "w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl",
            children: "Continue to Payment"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `lg:col-span-1 ${showOrderSummary ? "block" : "hidden lg:block"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:sticky lg:top-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900 mb-6", children: "Order Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 mb-6 max-h-64 overflow-y-auto", children: cartItems.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3 pb-3 border-b border-gray-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: item.primary_image_url,
              alt: item.product_name,
              className: "w-16 h-16 object-cover rounded-lg flex-shrink-0"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: item.product_name }),
            item.customer_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-600 font-medium mt-1", children: [
              "For: ",
              item.customer_name
            ] }),
            item.selected_toppings && item.selected_toppings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600 mt-1", children: [
              "Toppings: ",
              item.selected_toppings.map(
                (t) => t.price > 0 ? `${t.topping_name} (+€${t.price.toFixed(2)})` : t.topping_name
              ).join(", ")
            ] }),
            item.selected_sauces && item.selected_sauces.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600 mt-1", children: [
              "Sauces: ",
              item.selected_sauces.map(
                (s) => s.price > 0 ? `${s.topping_name} (+€${s.price.toFixed(2)})` : s.topping_name
              ).join(", ")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600 mt-1", children: [
              "Qty: ",
              item.quantity
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-gray-900 flex-shrink-0", children: [
            "€",
            Number(item.subtotal || 0).toFixed(2)
          ] })
        ] }, `${item.product_id}-${index}`)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 border-t border-gray-200 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-900", children: [
              "€",
              Number(cartSubtotal || 0).toFixed(2)
            ] })
          ] }),
          fulfillmentMethod === "delivery" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Delivery Fee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900", children: cartDeliveryFee === 0 ? "FREE" : `€${Number(cartDeliveryFee || 0).toFixed(2)}` })
          ] }),
          isAuthenticated && currentUser && Number(currentUser.loyalty_points_balance || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-3 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Loyalty Points" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-600", children: [
                Number(currentUser.loyalty_points_balance || 0),
                " available"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center space-x-3 cursor-pointer mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: loyaltyPointsUsed > 0,
                  onChange: (e) => handleLoyaltyPointsToggle(e.target.checked),
                  className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "Use loyalty points" })
            ] }),
            loyaltyPointsUsed > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: loyaltyPointsInput,
                    onChange: (e) => handleLoyaltyPointsInputChange(e.target.value),
                    placeholder: "Enter points",
                    className: "flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleApplyLoyaltyPoints,
                    className: "px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors",
                    children: "Apply"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600", children: [
                "Max ",
                Math.min(Number(currentUser.loyalty_points_balance || 0), Math.floor(cartSubtotal * pointsRedemptionRate)),
                " points"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-green-600", children: [
                "Current: -",
                loyaltyPointsUsed,
                " points (€",
                (loyaltyPointsUsed / pointsRedemptionRate).toFixed(2),
                " discount)"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-t border-gray-200 pt-3 mt-3", children: !appliedPromoCode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "promo_code", className: "block text-sm font-medium text-gray-700 mb-2", children: "Promo Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  id: "promo_code",
                  placeholder: "Enter code",
                  className: "flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm",
                  onKeyDown: (e) => {
                    if (e.key === "Enter") {
                      const code = e.target.value.trim().toUpperCase();
                      if (code) {
                        applyPromoCode(code);
                        showToast("success", "Promo code applied!");
                      }
                    }
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    const input = document.getElementById("promo_code");
                    const code = input == null ? void 0 : input.value.trim().toUpperCase();
                    if (code) {
                      applyPromoCode(code);
                      showToast("success", "Promo code applied!");
                    }
                  },
                  className: "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors duration-200",
                  children: "Apply"
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-green-900", children: [
                "Code: ",
                appliedPromoCode
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700", children: "Discount applied" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  removePromoCode();
                  showToast("info", "Promo code removed");
                },
                className: "text-xs text-red-600 hover:text-red-700 font-medium",
                children: "Remove"
              }
            )
          ] }) }),
          cartDiscount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-green-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
              "-€",
              Number(cartDiscount || 0).toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Tax (20%)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-900", children: [
              "€",
              Number(cartTax || 0).toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-300 pt-4 mt-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "€",
              Number(cartTotal || 0).toFixed(2)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleContinueToPayment,
            className: "w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl",
            children: "Continue to Payment"
          }
        ) })
      ] }) }) })
    ] })
  ] }) }) });
};
export {
  UV_Checkout_Step1 as default
};
