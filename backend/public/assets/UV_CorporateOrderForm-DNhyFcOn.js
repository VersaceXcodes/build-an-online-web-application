import { h as useNavigate, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, b as axios } from "./index-HeRxKVXe.js";
import { u as useMutation } from "./useMutation-7uzCkorR.js";
const UV_CorporateOrderForm = () => {
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const isAuthenticated = useAppStore((state) => state.authentication_state.authentication_status.is_authenticated);
  const showToast = useAppStore((state) => state.show_toast);
  const showLoading = useAppStore((state) => state.show_loading);
  const hideLoading = useAppStore((state) => state.hide_loading);
  const [customer_email, setCustomerEmail] = reactExports.useState("");
  const [customer_name, setCustomerName] = reactExports.useState("");
  const [customer_phone, setCustomerPhone] = reactExports.useState("");
  const [company_name, setCompanyName] = reactExports.useState("");
  const [event_date, setEventDate] = reactExports.useState("");
  const [guest_count, setGuestCount] = reactExports.useState("");
  const [event_type, setEventType] = reactExports.useState("");
  const [delivery_address_line1, setDeliveryAddressLine1] = reactExports.useState("");
  const [delivery_address_line2, setDeliveryAddressLine2] = reactExports.useState("");
  const [delivery_city, setDeliveryCity] = reactExports.useState("");
  const [delivery_postal_code, setDeliveryPostalCode] = reactExports.useState("");
  const [special_instructions, setSpecialInstructions] = reactExports.useState("");
  const [ordering_drop, setOrderingDrop] = reactExports.useState(false);
  const [drop_quantity, setDropQuantity] = reactExports.useState(1);
  const [custom_order_description, setCustomOrderDescription] = reactExports.useState("");
  const [create_account, setCreateAccount] = reactExports.useState(false);
  const [account_password, setAccountPassword] = reactExports.useState("");
  const [form_errors, setFormErrors] = reactExports.useState({});
  const [submitting, setSubmitting] = reactExports.useState(false);
  const { data: active_drop } = useQuery({
    queryKey: ["drop-of-the-month", "active"],
    queryFn: async () => {
      const response = await axios.get(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/drop-of-the-month`
      );
      return response.data;
    },
    retry: 1,
    staleTime: 6e4
  });
  const createOrderMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/orders`,
        payload,
        currentUser ? {
          headers: {
            Authorization: `Bearer ${useAppStore.getState().authentication_state.auth_token}`
          }
        } : void 0
      );
      return response.data;
    }
  });
  const registerMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/auth/register`,
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      showToast("success", "Account created successfully!");
    }
  });
  reactExports.useEffect(() => {
    if (isAuthenticated && currentUser) {
      setCustomerEmail(currentUser.email || "");
      setCustomerName(`${currentUser.first_name || ""} ${currentUser.last_name || ""}`.trim());
      setCustomerPhone(currentUser.phone_number || "");
    }
  }, [isAuthenticated, currentUser]);
  const validateForm = () => {
    const errors = {};
    if (!customer_email) {
      errors.customer_email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      errors.customer_email = "Invalid email format";
    }
    if (!customer_name || customer_name.trim().length < 2) {
      errors.customer_name = "Full name is required";
    }
    if (!customer_phone || customer_phone.length < 10) {
      errors.customer_phone = "Valid phone number is required (min 10 digits)";
    }
    if (!company_name || company_name.trim().length < 2) {
      errors.company_name = "Company name is required";
    }
    if (!event_date) {
      errors.event_date = "Event date is required";
    } else if (new Date(event_date) <= /* @__PURE__ */ new Date()) {
      errors.event_date = "Event date must be in the future";
    }
    if (!guest_count || guest_count < 1) {
      errors.guest_count = "Guest count must be at least 1";
    }
    if (!event_type) {
      errors.event_type = "Event type is required";
    }
    if (!delivery_address_line1 || delivery_address_line1.trim().length < 3) {
      errors.delivery_address_line1 = "Address is required";
    }
    if (!delivery_city || delivery_city.trim().length < 2) {
      errors.delivery_city = "City is required";
    }
    if (!delivery_postal_code || delivery_postal_code.trim().length < 3) {
      errors.delivery_postal_code = "Postal code is required";
    }
    if (ordering_drop) {
      if (drop_quantity < 1) {
        errors.drop_quantity = "Quantity must be at least 1";
      }
    } else {
      if (!custom_order_description || custom_order_description.trim().length < 20) {
        errors.custom_order_description = "Please provide detailed order description (min 20 characters)";
      }
    }
    if (!isAuthenticated && create_account) {
      if (!account_password || account_password.length < 8) {
        errors.account_password = "Password must be at least 8 characters";
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e) => {
    var _a, _b;
    e.preventDefault();
    setFormErrors({});
    if (!validateForm()) {
      showToast("error", "Please fix the errors in the form");
      const firstErrorField = document.querySelector(".border-red-500");
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setSubmitting(true);
    showLoading("Submitting your corporate order request...");
    try {
      const items = ordering_drop && active_drop ? [{ product_id: active_drop.drop_id, quantity: drop_quantity }] : [];
      const combined_instructions = ordering_drop ? special_instructions : `${custom_order_description}

${special_instructions}`.trim();
      const orderPayload = {
        user_id: (currentUser == null ? void 0 : currentUser.user_id) || null,
        customer_email,
        customer_name,
        customer_phone,
        company_name,
        order_type: "corporate",
        fulfillment_method: "delivery",
        delivery_address_line1,
        delivery_address_line2: delivery_address_line2 || null,
        delivery_city,
        delivery_postal_code,
        event_date,
        guest_count: Number(guest_count),
        event_type,
        special_instructions: combined_instructions,
        payment_method: "online",
        items
      };
      const orderResponse = await createOrderMutation.mutateAsync(orderPayload);
      if (!isAuthenticated && create_account && account_password) {
        const [first_name, ...last_name_parts] = customer_name.split(" ");
        const last_name = last_name_parts.join(" ") || first_name;
        const registerPayload = {
          email: customer_email,
          password: account_password,
          first_name,
          last_name,
          phone_number: customer_phone,
          user_type: "customer",
          marketing_opt_in: false
        };
        await registerMutation.mutateAsync(registerPayload);
      }
      hideLoading();
      setSubmitting(false);
      showToast(
        "success",
        `Corporate order request submitted! Order number: ${orderResponse.order_number}. We'll contact you within 24 hours.`,
        5e3
      );
      setTimeout(() => {
        navigate("/");
      }, 2e3);
    } catch (error) {
      console.error("Corporate order submission error:", error);
      hideLoading();
      setSubmitting(false);
      const errorMessage = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || error.message || "Failed to submit corporate order request";
      showToast("error", errorMessage);
    }
  };
  const clearFieldError = (fieldName) => {
    if (form_errors[fieldName]) {
      setFormErrors((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: "Corporate & Event Orders" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl text-gray-600 leading-relaxed", children: "Planning a special event? Let us create something extraordinary for your celebration." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-2", children: "All corporate orders require admin confirmation. We'll contact you within 24 hours." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "p-8 space-y-8", children: [
      active_drop && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-4", children: "Featured This Month" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: active_drop.product_image_url,
              alt: active_drop.product_name,
              className: "w-full h-64 object-cover rounded-lg shadow-md"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-gray-900", children: active_drop.product_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 leading-relaxed", children: active_drop.description }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-3xl font-bold text-purple-700", children: [
                "€",
                Number(active_drop.price || 0).toFixed(2)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-500", children: "per item" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center space-x-3 cursor-pointer", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: ordering_drop,
                    onChange: (e) => {
                      setOrderingDrop(e.target.checked);
                      if (!e.target.checked) {
                        setDropQuantity(1);
                      }
                    },
                    className: "w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-medium text-gray-900", children: "Order this for my event" })
              ] }),
              ordering_drop && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Quantity" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    min: "1",
                    value: drop_quantity,
                    onChange: (e) => {
                      setDropQuantity(parseInt(e.target.value) || 1);
                      clearFieldError("drop_quantity");
                    },
                    className: `w-32 px-4 py-2 rounded-lg border-2 ${form_errors.drop_quantity ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"} focus:ring-4 focus:outline-none transition-all`
                  }
                ),
                form_errors.drop_quantity && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.drop_quantity })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3", children: "Contact Information" }),
        isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800", children: [
          "✓ Ordering as ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            currentUser == null ? void 0 : currentUser.first_name,
            " ",
            currentUser == null ? void 0 : currentUser.last_name
          ] }),
          " (",
          currentUser == null ? void 0 : currentUser.email,
          ")"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
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
                value: customer_name,
                onChange: (e) => {
                  setCustomerName(e.target.value);
                  clearFieldError("customer_name");
                },
                placeholder: "John Smith",
                className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.customer_name ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 focus:outline-none transition-all`
              }
            ),
            form_errors.customer_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.customer_name })
          ] }),
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
                value: customer_email,
                onChange: (e) => {
                  setCustomerEmail(e.target.value);
                  clearFieldError("customer_email");
                },
                placeholder: "john@company.com",
                className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.customer_email ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 focus:outline-none transition-all`
              }
            ),
            form_errors.customer_email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.customer_email })
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
                value: customer_phone,
                onChange: (e) => {
                  setCustomerPhone(e.target.value);
                  clearFieldError("customer_phone");
                },
                placeholder: "+353 1 234 5678",
                className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.customer_phone ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 focus:outline-none transition-all`
              }
            ),
            form_errors.customer_phone && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.customer_phone })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "company_name", className: "block text-sm font-medium text-gray-700 mb-2", children: [
              "Company Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "company_name",
                value: company_name,
                onChange: (e) => {
                  setCompanyName(e.target.value);
                  clearFieldError("company_name");
                },
                placeholder: "Acme Corporation",
                className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.company_name ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 focus:outline-none transition-all`
              }
            ),
            form_errors.company_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.company_name })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3", children: "Event Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "event_date", className: "block text-sm font-medium text-gray-700 mb-2", children: [
              "Event Date ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                id: "event_date",
                value: event_date,
                onChange: (e) => {
                  setEventDate(e.target.value);
                  clearFieldError("event_date");
                },
                min: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
                className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.event_date ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 focus:outline-none transition-all`
              }
            ),
            form_errors.event_date && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.event_date })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "guest_count", className: "block text-sm font-medium text-gray-700 mb-2", children: [
              "Guest Count ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                id: "guest_count",
                min: "1",
                value: guest_count,
                onChange: (e) => {
                  setGuestCount(e.target.value ? parseInt(e.target.value) : "");
                  clearFieldError("guest_count");
                },
                placeholder: "50",
                className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.guest_count ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 focus:outline-none transition-all`
              }
            ),
            form_errors.guest_count && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.guest_count })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "event_type", className: "block text-sm font-medium text-gray-700 mb-2", children: [
              "Event Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "event_type",
                value: event_type,
                onChange: (e) => {
                  setEventType(e.target.value);
                  clearFieldError("event_type");
                },
                className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.event_type ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 focus:outline-none transition-all`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select event type" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Conference", children: "Conference" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Wedding", children: "Wedding" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Birthday", children: "Birthday Party" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Corporate Meeting", children: "Corporate Meeting" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Product Launch", children: "Product Launch" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Team Building", children: "Team Building" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Other", children: "Other" })
                ]
              }
            ),
            form_errors.event_type && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.event_type })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3", children: "Delivery Address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "delivery_address_line1", className: "block text-sm font-medium text-gray-700 mb-2", children: [
              "Address Line 1 ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "delivery_address_line1",
                value: delivery_address_line1,
                onChange: (e) => {
                  setDeliveryAddressLine1(e.target.value);
                  clearFieldError("delivery_address_line1");
                },
                placeholder: "123 Main Street",
                className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.delivery_address_line1 ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 focus:outline-none transition-all`
              }
            ),
            form_errors.delivery_address_line1 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.delivery_address_line1 })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "delivery_address_line2", className: "block text-sm font-medium text-gray-700 mb-2", children: [
              "Address Line 2 ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "(Optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "delivery_address_line2",
                value: delivery_address_line2,
                onChange: (e) => setDeliveryAddressLine2(e.target.value),
                placeholder: "Suite 100",
                className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
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
                  value: delivery_city,
                  onChange: (e) => {
                    setDeliveryCity(e.target.value);
                    clearFieldError("delivery_city");
                  },
                  placeholder: "Dublin",
                  className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.delivery_city ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 focus:outline-none transition-all`
                }
              ),
              form_errors.delivery_city && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.delivery_city })
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
                  value: delivery_postal_code,
                  onChange: (e) => {
                    setDeliveryPostalCode(e.target.value);
                    clearFieldError("delivery_postal_code");
                  },
                  placeholder: "D02 XY12",
                  className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.delivery_postal_code ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 focus:outline-none transition-all`
                }
              ),
              form_errors.delivery_postal_code && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.delivery_postal_code })
            ] })
          ] })
        ] })
      ] }),
      !ordering_drop && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3", children: "Order Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "custom_order_description", className: "block text-sm font-medium text-gray-700 mb-2", children: [
            "Describe Your Order Requirements ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-2", children: "Please provide detailed information about what you'd like us to create for your event." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "custom_order_description",
              value: custom_order_description,
              onChange: (e) => {
                setCustomOrderDescription(e.target.value);
                clearFieldError("custom_order_description");
              },
              rows: 6,
              placeholder: "Example: We need assorted desserts for 50 people including gluten-free options. Mix of brownies, cookies, and cake slices. Prefer chocolate and vanilla flavors...",
              className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.custom_order_description ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} focus:ring-4 focus:outline-none transition-all`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between items-center mt-1", children: form_errors.custom_order_description ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: form_errors.custom_order_description }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
            custom_order_description.length,
            " / 2000 characters (min 20)"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 border-b-2 border-gray-200 pb-3", children: "Additional Information" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "special_instructions", className: "block text-sm font-medium text-gray-700 mb-2", children: "Special Instructions or Dietary Requirements" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "special_instructions",
              value: special_instructions,
              onChange: (e) => setSpecialInstructions(e.target.value),
              rows: 4,
              placeholder: "E.g., Allergen information, setup requirements, delivery time preferences...",
              className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-gray-500", children: [
            special_instructions.length,
            " / 500 characters"
          ] })
        ] })
      ] }),
      !isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border-2 border-green-200 rounded-lg p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start space-x-3 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: create_account,
              onChange: (e) => {
                setCreateAccount(e.target.checked);
                if (!e.target.checked) {
                  setAccountPassword("");
                  clearFieldError("account_password");
                }
              },
              className: "w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-0.5"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-medium text-gray-900", children: "Create a Kake account for faster future orders" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Save your details, track orders, and earn loyalty points" })
          ] })
        ] }),
        create_account && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "account_password", className: "block text-sm font-medium text-gray-700 mb-2", children: [
            "Create Password ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              id: "account_password",
              value: account_password,
              onChange: (e) => {
                setAccountPassword(e.target.value);
                clearFieldError("account_password");
              },
              placeholder: "Min 8 characters",
              className: `w-full px-4 py-3 rounded-lg border-2 ${form_errors.account_password ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-green-500 focus:ring-green-100"} focus:ring-4 focus:outline-none transition-all`
            }
          ),
          form_errors.account_password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: form_errors.account_password })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: submitting,
            className: "w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
            children: submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white", fill: "none", viewBox: "0 0 24 24", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
              ] }),
              "Submitting Request..."
            ] }) : "Submit Corporate Order Request"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-sm text-gray-500 mt-4", children: "Our team will review your request and contact you within 24 hours with pricing and availability." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600", children: [
      "Questions about corporate orders?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: `mailto:${useAppStore.getState().system_config_state.company_email}`,
          className: "text-blue-600 hover:text-blue-700 font-medium",
          children: "Contact us"
        }
      ),
      " ",
      "or call",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: `tel:${useAppStore.getState().system_config_state.company_phone}`,
          className: "text-blue-600 hover:text-blue-700 font-medium",
          children: useAppStore.getState().system_config_state.company_phone
        }
      )
    ] }) })
  ] }) }) });
};
export {
  UV_CorporateOrderForm as default
};
