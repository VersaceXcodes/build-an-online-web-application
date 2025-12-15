import { k as useSearchParams, g as useNavigate, l as useQueryClient, u as useAppStore, r as reactExports, b as axios, a as useQuery, j as jsxRuntimeExports, L as Link, K as House, z as User, h as Package, N as Star, M as MapPin, O as MessageSquare, Q as TrendingUp, i as ChevronRight, v as Eye, V as RefreshCw, H as Heart, W as Pen, t as Lock, w as Check, X, q as Plus, Y as MapPinned, Z as Trash2 } from "./index-nYaE10KP.js";
import { u as useMutation } from "./useMutation-BdRga-lQ.js";
const UV_CustomerDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const showConfirmation = useAppStore((state) => state.show_confirmation);
  const hideConfirmation = useAppStore((state) => state.hide_confirmation);
  const addToCart = useAppStore((state) => state.add_to_cart);
  const setCartLocation = useAppStore((state) => state.set_cart_location);
  const updateUserProfile = useAppStore((state) => state.update_user_profile);
  const activeTab = searchParams.get("tab") || "overview";
  const [orderFilters, setOrderFilters] = reactExports.useState({
    order_status: null,
    date_from: null,
    date_to: null,
    location_name: null
  });
  const [loyaltyFilters, setLoyaltyFilters] = reactExports.useState({
    transaction_type: null,
    date_from: null,
    date_to: null
  });
  const [isEditingProfile, setIsEditingProfile] = reactExports.useState(false);
  const [profileFormData, setProfileFormData] = reactExports.useState({
    first_name: (currentUser == null ? void 0 : currentUser.first_name) || "",
    last_name: (currentUser == null ? void 0 : currentUser.last_name) || "",
    phone_number: (currentUser == null ? void 0 : currentUser.phone_number) || "",
    marketing_opt_in: (currentUser == null ? void 0 : currentUser.marketing_opt_in) || false
  });
  const [isChangingPassword, setIsChangingPassword] = reactExports.useState(false);
  const [passwordForm, setPasswordForm] = reactExports.useState({
    current_password: "",
    new_password: "",
    confirm_password: ""
  });
  const [isAddingAddress, setIsAddingAddress] = reactExports.useState(false);
  const [editingAddressId, setEditingAddressId] = reactExports.useState(null);
  const [addressFormData, setAddressFormData] = reactExports.useState({
    address_label: "",
    address_line1: "",
    address_line2: "",
    city: "",
    postal_code: "",
    delivery_phone: "",
    delivery_instructions: "",
    is_default: false
  });
  const API_BASE_URL = `${"https://123build-an-online-web-application.launchpulse.ai"}/api`;
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...authToken && { Authorization: `Bearer ${authToken}` }
    }
  });
  const { data: recentOrdersData, isLoading: recentOrdersLoading } = useQuery({
    queryKey: ["recent-orders", currentUser == null ? void 0 : currentUser.user_id],
    queryFn: async () => {
      const response = await apiClient.get("/orders", {
        params: {
          user_id: currentUser == null ? void 0 : currentUser.user_id,
          limit: 5,
          sort_by: "created_at",
          sort_order: "desc"
        }
      });
      return response.data;
    },
    enabled: activeTab === "overview" && !!(currentUser == null ? void 0 : currentUser.user_id),
    staleTime: 6e4
  });
  const recentOrders = reactExports.useMemo(() => {
    return ((recentOrdersData == null ? void 0 : recentOrdersData.data) || []).map((order) => ({
      ...order,
      subtotal: Number(order.subtotal || 0),
      delivery_fee: Number(order.delivery_fee || 0),
      discount_amount: Number(order.discount_amount || 0),
      tax_amount: Number(order.tax_amount || 0),
      total_amount: Number(order.total_amount || 0),
      loyalty_points_used: Number(order.loyalty_points_used || 0),
      loyalty_points_earned: Number(order.loyalty_points_earned || 0)
    }));
  }, [recentOrdersData]);
  const { data: allOrdersData, isLoading: allOrdersLoading } = useQuery({
    queryKey: ["all-orders", currentUser == null ? void 0 : currentUser.user_id, orderFilters],
    queryFn: async () => {
      const response = await apiClient.get("/orders", {
        params: {
          user_id: currentUser == null ? void 0 : currentUser.user_id,
          order_status: orderFilters.order_status || void 0,
          date_from: orderFilters.date_from || void 0,
          date_to: orderFilters.date_to || void 0,
          location_name: orderFilters.location_name || void 0,
          limit: 20,
          sort_by: "created_at",
          sort_order: "desc"
        }
      });
      return response.data;
    },
    enabled: activeTab === "orders" && !!(currentUser == null ? void 0 : currentUser.user_id),
    staleTime: 3e4
  });
  const allOrders = reactExports.useMemo(() => {
    return ((allOrdersData == null ? void 0 : allOrdersData.data) || []).map((order) => ({
      ...order,
      subtotal: Number(order.subtotal || 0),
      delivery_fee: Number(order.delivery_fee || 0),
      discount_amount: Number(order.discount_amount || 0),
      tax_amount: Number(order.tax_amount || 0),
      total_amount: Number(order.total_amount || 0),
      loyalty_points_used: Number(order.loyalty_points_used || 0),
      loyalty_points_earned: Number(order.loyalty_points_earned || 0)
    }));
  }, [allOrdersData]);
  const { data: loyaltyData, isLoading: loyaltyLoading } = useQuery({
    queryKey: ["loyalty-transactions", currentUser == null ? void 0 : currentUser.user_id, loyaltyFilters],
    queryFn: async () => {
      const response = await apiClient.get("/loyalty-points/transactions", {
        params: {
          transaction_type: loyaltyFilters.transaction_type || void 0,
          date_from: loyaltyFilters.date_from || void 0,
          date_to: loyaltyFilters.date_to || void 0,
          limit: 50,
          sort_by: "created_at",
          sort_order: "desc"
        }
      });
      return response.data;
    },
    enabled: activeTab === "loyalty_points" && !!(currentUser == null ? void 0 : currentUser.user_id),
    staleTime: 6e4
  });
  const loyaltyTransactions = reactExports.useMemo(() => {
    return ((loyaltyData == null ? void 0 : loyaltyData.data) || []).map((txn) => ({
      ...txn,
      points_change: Number(txn.points_change || 0),
      balance_after: Number(txn.balance_after || 0)
    }));
  }, [loyaltyData]);
  const { data: addressesData, isLoading: addressesLoading, refetch: refetchAddresses } = useQuery({
    queryKey: ["addresses", currentUser == null ? void 0 : currentUser.user_id],
    queryFn: async () => {
      var _a;
      const response = await apiClient.get("/addresses");
      return Array.isArray(response.data) ? response.data : ((_a = response.data) == null ? void 0 : _a.data) || [];
    },
    enabled: activeTab === "addresses" && !!(currentUser == null ? void 0 : currentUser.user_id),
    staleTime: 6e4
  });
  const savedAddresses = addressesData || [];
  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ["customer-feedback", currentUser == null ? void 0 : currentUser.user_id],
    queryFn: async () => {
      const response = await apiClient.get("/feedback/customer", {
        params: {
          limit: 20,
          sort_by: "created_at",
          sort_order: "desc"
        }
      });
      return response.data;
    },
    enabled: activeTab === "feedback" && !!(currentUser == null ? void 0 : currentUser.user_id),
    staleTime: 6e4
  });
  const submittedFeedback = reactExports.useMemo(() => {
    return ((feedbackData == null ? void 0 : feedbackData.data) || []).map((fb) => ({
      ...fb,
      overall_rating: Number(fb.overall_rating || 0),
      product_rating: Number(fb.product_rating || 0),
      fulfillment_rating: Number(fb.fulfillment_rating || 0)
    }));
  }, [feedbackData]);
  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.put("/users/me", data);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      updateUserProfile(updatedUser);
      setIsEditingProfile(false);
      showToast("success", "Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["recent-orders"] });
      queryClient.invalidateQueries({ queryKey: ["all-orders"] });
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update profile");
    }
  });
  const changePasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/users/me/change-password", data);
      return response.data;
    },
    onSuccess: () => {
      setIsChangingPassword(false);
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      showToast("success", "Password changed successfully");
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to change password");
    }
  });
  const addAddressMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post("/addresses", {
        ...data,
        user_id: currentUser == null ? void 0 : currentUser.user_id
      });
      return response.data;
    },
    onSuccess: () => {
      setIsAddingAddress(false);
      resetAddressForm();
      showToast("success", "Address added successfully");
      refetchAddresses();
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to add address");
    }
  });
  const updateAddressMutation = useMutation({
    mutationFn: async ({ address_id, data }) => {
      const response = await apiClient.put(`/addresses/${address_id}`, data);
      return response.data;
    },
    onSuccess: () => {
      setEditingAddressId(null);
      resetAddressForm();
      showToast("success", "Address updated successfully");
      refetchAddresses();
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update address");
    }
  });
  const deleteAddressMutation = useMutation({
    mutationFn: async (address_id) => {
      const response = await apiClient.delete(`/addresses/${address_id}`);
      return response.data;
    },
    onSuccess: () => {
      showToast("success", "Address deleted successfully");
      refetchAddresses();
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to delete address");
    }
  });
  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileFormData);
  };
  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast("error", "Passwords do not match");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      showToast("error", "Password must be at least 8 characters");
      return;
    }
    changePasswordMutation.mutate({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password
    });
  };
  const handleAddAddress = (e) => {
    e.preventDefault();
    if (editingAddressId) {
      updateAddressMutation.mutate({
        address_id: editingAddressId,
        data: addressFormData
      });
    } else {
      addAddressMutation.mutate(addressFormData);
    }
  };
  const handleDeleteAddress = (address_id) => {
    showConfirmation({
      title: "Delete Address",
      message: "Are you sure you want to delete this address?",
      confirm_text: "Delete",
      cancel_text: "Cancel",
      on_confirm: () => {
        deleteAddressMutation.mutate(address_id);
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      },
      danger_action: true
    });
  };
  const handleSetDefaultAddress = (address_id) => {
    updateAddressMutation.mutate({
      address_id,
      data: { is_default: true }
    });
  };
  const handleReorder = async (order_id) => {
    var _a, _b;
    try {
      const response = await apiClient.get(`/orders/${order_id}`);
      const order = response.data;
      if (order.items && Array.isArray(order.items)) {
        setCartLocation(order.location_name);
        order.items.forEach((item) => {
          addToCart({
            product_id: item.product_id,
            product_name: item.product_name,
            price: Number(item.price_at_purchase || 0),
            quantity: Number(item.quantity || 0),
            subtotal: Number(item.price_at_purchase || 0) * Number(item.quantity || 0),
            primary_image_url: ""
          });
        });
        showToast("success", "Items added to cart!");
        navigate(`/location/${order.location_name}/menu`);
      }
    } catch (error) {
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to reorder");
    }
  };
  const startEditAddress = (address) => {
    setEditingAddressId(address.address_id);
    setAddressFormData({
      address_label: address.address_label || "",
      address_line1: address.address_line1,
      address_line2: address.address_line2 || "",
      city: address.city,
      postal_code: address.postal_code,
      delivery_phone: address.delivery_phone || "",
      delivery_instructions: address.delivery_instructions || "",
      is_default: address.is_default
    });
    setIsAddingAddress(true);
  };
  const resetAddressForm = () => {
    setAddressFormData({
      address_label: "",
      address_line1: "",
      address_line2: "",
      city: "",
      postal_code: "",
      delivery_phone: "",
      delivery_instructions: "",
      is_default: false
    });
    setEditingAddressId(null);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const formatCurrency = (amount) => {
    return `€${amount.toFixed(2)}`;
  };
  const getOrderStatusBadge = (status) => {
    const statusConfig = {
      pending_payment: { label: "Pending Payment", color: "bg-gray-100 text-gray-800" },
      paid_awaiting_confirmation: { label: "Awaiting Confirmation", color: "bg-blue-50 text-blue-700" },
      payment_confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
      accepted_in_preparation: { label: "In Preparation", color: "bg-yellow-100 text-yellow-800" },
      preparing: { label: "Preparing", color: "bg-yellow-100 text-yellow-800" },
      ready_for_collection: { label: "Ready", color: "bg-green-100 text-green-800" },
      out_for_delivery: { label: "Out for Delivery", color: "bg-purple-100 text-purple-800" },
      collected: { label: "Collected", color: "bg-green-100 text-green-800" },
      delivered: { label: "Delivered", color: "bg-green-100 text-green-800" },
      completed: { label: "Completed", color: "bg-green-100 text-green-800" },
      cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" }
    };
    const config = statusConfig[status] || { label: status, color: "bg-gray-100 text-gray-800" };
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`, children: config.label });
  };
  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Star,
      {
        className: `h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`
      },
      i
    ));
  };
  const tabs = [
    { id: "overview", label: "Overview", icon: House },
    { id: "profile", label: "Profile", icon: User },
    { id: "orders", label: "Orders", icon: Package },
    { id: "loyalty_points", label: "Loyalty Points", icon: Star },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "feedback", label: "Feedback", icon: MessageSquare }
  ];
  if (!currentUser) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "Please log in to access your account" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/login",
          className: "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors",
          children: "Go to Login"
        }
      )
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "My Account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-gray-600", children: [
          "Welcome back, ",
          currentUser.first_name,
          "!"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Loyalty Points" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-purple-600", children: Number(currentUser.loyalty_points_balance || 0).toLocaleString() })
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:grid lg:grid-cols-12 lg:gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block lg:col-span-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "space-y-1", children: tabs.map((tab) => {
        const Icon = tab.icon;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => handleTabChange(tab.id),
            className: `w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id ? "bg-purple-50 text-purple-700" : "text-gray-700 hover:bg-gray-50"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5 mr-3" }),
              tab.label
            ]
          },
          tab.id
        );
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "select",
        {
          value: activeTab,
          onChange: (e) => handleTabChange(e.target.value),
          className: "block w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100",
          children: tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: tab.id, children: tab.label }, tab.id))
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-9", children: [
        activeTab === "overview" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 bg-blue-100 rounded-lg p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-6 w-6 text-blue-600" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Orders" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900", children: (allOrdersData == null ? void 0 : allOrdersData.total) || 0 })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 bg-purple-100 rounded-lg p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-6 w-6 text-purple-600" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "Loyalty Points" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900", children: Number(currentUser.loyalty_points_balance || 0).toLocaleString() })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 bg-green-100 rounded-lg p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-6 w-6 text-green-600" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "Points Value" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-gray-900", children: formatCurrency(Number(currentUser.loyalty_points_balance || 0) / 100) })
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Recent Orders" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => handleTabChange("orders"),
                  className: "text-sm text-purple-600 hover:text-purple-700 font-medium",
                  children: "View all"
                }
              )
            ] }) }),
            recentOrdersLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 bg-gray-200 rounded-lg" }) }, i)) }) : recentOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "No orders yet" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/",
                  className: "mt-4 inline-flex items-center text-purple-600 hover:text-purple-700 font-medium",
                  children: [
                    "Start Shopping",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 ml-1" })
                  ]
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-gray-200", children: recentOrders.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 hover:bg-gray-50 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-900", children: order.order_number }),
                  getOrderStatusBadge(order.order_status)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                  order.location_name,
                  " • ",
                  formatDate(order.created_at)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900 mt-1", children: formatCurrency(order.total_amount) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: `/orders/${order.order_id}`,
                    className: "inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-2" }),
                      "View"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => handleReorder(order.order_id),
                    className: "inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
                      "Reorder"
                    ]
                  }
                )
              ] })
            ] }) }, order.order_id)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/favorites",
                className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all text-left",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-8 w-8 text-purple-600 mb-3" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: "My Favorites" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "View saved products" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => handleTabChange("addresses"),
                className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all text-left",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-8 w-8 text-purple-600 mb-3" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: "Manage Addresses" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                    savedAddresses.length,
                    " saved address",
                    savedAddresses.length !== 1 ? "es" : ""
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => handleTabChange("loyalty_points"),
                className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all text-left",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-8 w-8 text-purple-600 mb-3" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: "Loyalty Points" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                    Number(currentUser.loyalty_points_balance || 0).toLocaleString(),
                    " points available"
                  ] })
                ]
              }
            )
          ] })
        ] }),
        activeTab === "profile" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Profile Settings" }) }),
          !isEditingProfile ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "First Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-gray-900", children: currentUser.first_name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Last Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-gray-900", children: currentUser.last_name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-gray-900", children: currentUser.email })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-gray-900", children: currentUser.phone_number })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: currentUser.marketing_opt_in,
                  disabled: true,
                  className: "rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Receive marketing emails" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-4 pt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => {
                    setProfileFormData({
                      first_name: currentUser.first_name,
                      last_name: currentUser.last_name,
                      phone_number: currentUser.phone_number,
                      marketing_opt_in: currentUser.marketing_opt_in
                    });
                    setIsEditingProfile(true);
                  },
                  className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-4 w-4 mr-2" }),
                    "Edit Profile"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setIsChangingPassword(true),
                  className: "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-4 w-4 mr-2" }),
                    "Change Password"
                  ]
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleProfileUpdate, className: "p-6 space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "first_name", className: "block text-sm font-medium text-gray-700 mb-2", children: "First Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "first_name",
                    value: profileFormData.first_name,
                    onChange: (e) => setProfileFormData({ ...profileFormData, first_name: e.target.value }),
                    required: true,
                    className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "last_name", className: "block text-sm font-medium text-gray-700 mb-2", children: "Last Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "last_name",
                    value: profileFormData.last_name,
                    onChange: (e) => setProfileFormData({ ...profileFormData, last_name: e.target.value }),
                    required: true,
                    className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "phone_number", className: "block text-sm font-medium text-gray-700 mb-2", children: "Phone Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "tel",
                    id: "phone_number",
                    value: profileFormData.phone_number,
                    onChange: (e) => setProfileFormData({ ...profileFormData, phone_number: e.target.value }),
                    required: true,
                    className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: profileFormData.marketing_opt_in,
                  onChange: (e) => setProfileFormData({ ...profileFormData, marketing_opt_in: e.target.checked }),
                  className: "rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Receive marketing emails" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-4 pt-4 border-t border-gray-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "submit",
                  disabled: updateProfileMutation.isPending,
                  className: "flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50",
                  children: updateProfileMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" }),
                    "Saving..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 mr-2" }),
                    "Save Changes"
                  ] })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => setIsEditingProfile(false),
                  className: "flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5 mr-2" }),
                    "Cancel"
                  ]
                }
              )
            ] })
          ] })
        ] }),
        activeTab === "orders" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Order History" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: orderFilters.order_status || "",
                onChange: (e) => setOrderFilters({ ...orderFilters, order_status: e.target.value || null }),
                className: "rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Statuses" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "payment_confirmed", children: "Confirmed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "paid_awaiting_confirmation", children: "Awaiting Confirmation" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "accepted_in_preparation", children: "In Preparation" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ready_for_collection", children: "Ready" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "out_for_delivery", children: "Out for Delivery" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "collected", children: "Collected" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "delivered", children: "Delivered" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "completed", children: "Completed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cancelled", children: "Cancelled" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: orderFilters.location_name || "",
                onChange: (e) => setOrderFilters({ ...orderFilters, location_name: e.target.value || null }),
                className: "rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Locations" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Blanchardstown", children: "Blanchardstown" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Tallaght", children: "Tallaght" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Glasnevin", children: "Glasnevin" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: orderFilters.date_from || "",
                onChange: (e) => setOrderFilters({ ...orderFilters, date_from: e.target.value || null }),
                placeholder: "From Date",
                className: "rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: orderFilters.date_to || "",
                onChange: (e) => setOrderFilters({ ...orderFilters, date_to: e.target.value || null }),
                placeholder: "To Date",
                className: "rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
              }
            )
          ] }) }),
          allOrdersLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-4", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-24 bg-gray-200 rounded-lg" }) }, i)) }) : allOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "No orders found" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-gray-200", children: allOrders.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-900", children: order.order_number }),
                getOrderStatusBadge(order.order_status)
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mb-1", children: [
                order.location_name,
                " • ",
                order.fulfillment_method === "delivery" ? "Delivery" : "Collection"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: formatDate(order.created_at) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-semibold text-gray-900 mt-2", children: formatCurrency(order.total_amount) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: `/orders/${order.order_id}`,
                  className: "inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4 mr-2" }),
                    "View Details"
                  ]
                }
              ),
              !order.feedback_submitted && order.order_status === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: `/feedback/order/${order.order_id}`,
                  className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4 mr-2" }),
                    "Leave Feedback"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => handleReorder(order.order_id),
                  className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 mr-2" }),
                    "Reorder"
                  ]
                }
              )
            ] })
          ] }) }, order.order_id)) })
        ] }),
        activeTab === "loyalty_points" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg p-8 text-white", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-purple-200 text-sm font-medium mb-2", children: "Your Balance" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-5xl font-bold", children: Number(currentUser.loyalty_points_balance || 0).toLocaleString() }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-purple-200 text-sm mt-2", children: [
                  "Worth ",
                  formatCurrency(Number(currentUser.loyalty_points_balance || 0) / 100)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-16 w-16 text-purple-300" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-purple-700/50 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-purple-100", children: "Earn 10 points for every €1 spent • Redeem 100 points for €1 off" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Points History" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 bg-gray-50 border-b border-gray-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "transaction_type", className: "block text-sm font-medium text-gray-700 mb-2", children: "Transaction Type" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "select",
                    {
                      id: "transaction_type",
                      value: loyaltyFilters.transaction_type || "",
                      onChange: (e) => setLoyaltyFilters({ ...loyaltyFilters, transaction_type: e.target.value || null }),
                      className: "w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Types" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "earned", children: "Earned" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "redeemed", children: "Redeemed" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "manual_adjustment", children: "Manual Adjustment" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "expired", children: "Expired" })
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "loyalty_date_from", className: "block text-sm font-medium text-gray-700 mb-2", children: "From Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "date",
                      id: "loyalty_date_from",
                      value: loyaltyFilters.date_from || "",
                      onChange: (e) => setLoyaltyFilters({ ...loyaltyFilters, date_from: e.target.value || null }),
                      className: "w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "loyalty_date_to", className: "block text-sm font-medium text-gray-700 mb-2", children: "To Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "date",
                      id: "loyalty_date_to",
                      value: loyaltyFilters.date_to || "",
                      onChange: (e) => setLoyaltyFilters({ ...loyaltyFilters, date_to: e.target.value || null }),
                      className: "w-full rounded-lg border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"
                    }
                  )
                ] })
              ] }),
              (loyaltyFilters.transaction_type || loyaltyFilters.date_from || loyaltyFilters.date_to) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => setLoyaltyFilters({ transaction_type: null, date_from: null, date_to: null }),
                  className: "inline-flex items-center px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 mr-1" }),
                    "Clear Filters"
                  ]
                }
              ) })
            ] }),
            loyaltyLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 bg-gray-200 rounded-lg" }) }, i)) }) : loyaltyTransactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "No transactions found" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mt-2", children: loyaltyFilters.transaction_type || loyaltyFilters.date_from || loyaltyFilters.date_to ? "Try adjusting your filters" : "Start ordering to earn points!" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-gray-200", children: loyaltyTransactions.map((txn) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 flex items-center justify-between hover:bg-gray-50 transition-colors", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: txn.description }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${txn.transaction_type === "earned" ? "bg-green-100 text-green-800" : txn.transaction_type === "redeemed" ? "bg-blue-100 text-blue-800" : txn.transaction_type === "expired" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`, children: txn.transaction_type.replace("_", " ") })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: formatDate(txn.created_at) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-lg font-bold ${txn.points_change > 0 ? "text-green-600" : "text-red-600"}`, children: [
                    txn.points_change > 0 ? "+" : "",
                    txn.points_change
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600", children: [
                    "Balance: ",
                    txn.balance_after
                  ] })
                ] })
              ] }, txn.transaction_id)) }),
              (loyaltyData == null ? void 0 : loyaltyData.total) !== void 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-3 bg-gray-50 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 text-center", children: [
                "Showing ",
                loyaltyTransactions.length,
                " of ",
                loyaltyData.total,
                " transaction",
                loyaltyData.total !== 1 ? "s" : ""
              ] }) })
            ] })
          ] })
        ] }),
        activeTab === "addresses" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Saved Addresses" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => {
                  resetAddressForm();
                  setIsAddingAddress(true);
                },
                className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4 mr-2" }),
                  "Add Address"
                ]
              }
            )
          ] }),
          isAddingAddress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: editingAddressId ? "Edit Address" : "New Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleAddAddress, className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "address_label", className: "block text-sm font-medium text-gray-700 mb-2", children: "Label (optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "address_label",
                    value: addressFormData.address_label,
                    onChange: (e) => setAddressFormData({ ...addressFormData, address_label: e.target.value }),
                    placeholder: "e.g., Home, Work",
                    className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "address_line1", className: "block text-sm font-medium text-gray-700 mb-2", children: "Address Line 1 *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "address_line1",
                    value: addressFormData.address_line1,
                    onChange: (e) => setAddressFormData({ ...addressFormData, address_line1: e.target.value }),
                    required: true,
                    className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "address_line2", className: "block text-sm font-medium text-gray-700 mb-2", children: "Address Line 2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    id: "address_line2",
                    value: addressFormData.address_line2,
                    onChange: (e) => setAddressFormData({ ...addressFormData, address_line2: e.target.value }),
                    className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "city", className: "block text-sm font-medium text-gray-700 mb-2", children: "City *" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      id: "city",
                      value: addressFormData.city,
                      onChange: (e) => setAddressFormData({ ...addressFormData, city: e.target.value }),
                      required: true,
                      className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "postal_code", className: "block text-sm font-medium text-gray-700 mb-2", children: "Postal Code *" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      id: "postal_code",
                      value: addressFormData.postal_code,
                      onChange: (e) => setAddressFormData({ ...addressFormData, postal_code: e.target.value }),
                      required: true,
                      className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "delivery_phone", className: "block text-sm font-medium text-gray-700 mb-2", children: "Delivery Phone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "tel",
                    id: "delivery_phone",
                    value: addressFormData.delivery_phone,
                    onChange: (e) => setAddressFormData({ ...addressFormData, delivery_phone: e.target.value }),
                    className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "delivery_instructions", className: "block text-sm font-medium text-gray-700 mb-2", children: "Delivery Instructions" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    id: "delivery_instructions",
                    value: addressFormData.delivery_instructions,
                    onChange: (e) => setAddressFormData({ ...addressFormData, delivery_instructions: e.target.value }),
                    rows: 3,
                    className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: addressFormData.is_default,
                    onChange: (e) => setAddressFormData({ ...addressFormData, is_default: e.target.checked }),
                    className: "rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm text-gray-700", children: "Set as default address" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-4 pt-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "submit",
                    disabled: addAddressMutation.isPending || updateAddressMutation.isPending,
                    className: "flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50",
                    children: addAddressMutation.isPending || updateAddressMutation.isPending ? "Saving..." : editingAddressId ? "Update Address" : "Add Address"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => {
                      setIsAddingAddress(false);
                      resetAddressForm();
                    },
                    className: "flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors",
                    children: "Cancel"
                  }
                )
              ] })
            ] })
          ] }),
          addressesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 bg-gray-200 rounded-xl" }) }, i)) }) : savedAddresses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPinned, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "No saved addresses" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: savedAddresses.map((address) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: `bg-white rounded-xl shadow-lg border p-6 ${address.is_default ? "border-purple-300 ring-2 ring-purple-100" : "border-gray-100"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    address.address_label && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-purple-600 mb-1", children: address.address_label }),
                    address.is_default && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3 w-3 mr-1" }),
                      "Default"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => startEditAddress(address),
                        className: "p-2 text-gray-400 hover:text-gray-600 transition-colors",
                        "aria-label": "Edit address",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "h-4 w-4" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => handleDeleteAddress(address.address_id),
                        className: "p-2 text-gray-400 hover:text-red-600 transition-colors",
                        "aria-label": "Delete address",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "h-4 w-4" })
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-700 space-y-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: address.address_line1 }),
                  address.address_line2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: address.address_line2 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                    address.city,
                    ", ",
                    address.postal_code
                  ] }),
                  address.delivery_phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600", children: [
                    "Phone: ",
                    address.delivery_phone
                  ] }),
                  address.delivery_instructions && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mt-2 italic", children: address.delivery_instructions })
                ] }),
                !address.is_default && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleSetDefaultAddress(address.address_id),
                    className: "mt-4 w-full text-sm text-purple-600 hover:text-purple-700 font-medium",
                    children: "Set as Default"
                  }
                )
              ]
            },
            address.address_id
          )) })
        ] }),
        activeTab === "feedback" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl shadow-lg border border-purple-100 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Have feedback for management?" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Share your suggestions, compliments, or concerns directly with our management team. Your feedback helps us improve our service." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/feedback/submit",
                className: "ml-4 inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-5 w-5 mr-2" }),
                  "Submit Feedback"
                ]
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 border-b border-gray-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "My Order Feedback" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Feedback submitted for previous orders" })
            ] }),
            feedbackLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 space-y-4", children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 bg-gray-200 rounded-lg" }) }, i)) }) : submittedFeedback.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "No order feedback submitted yet" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-gray-200", children: submittedFeedback.map((feedback) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-gray-900", children: [
                    "Order ",
                    feedback.order_number
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: formatDate(feedback.created_at) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-1", children: getRatingStars(feedback.overall_rating) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 mr-2", children: "Product:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-1", children: getRatingStars(feedback.product_rating) })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 mr-2", children: "Service:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-1", children: getRatingStars(feedback.fulfillment_rating) })
                  ] })
                ] }),
                feedback.overall_comment && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 p-4 bg-gray-50 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700", children: feedback.overall_comment }) })
              ] })
            ] }, feedback.feedback_id)) })
          ] })
        ] })
      ] })
    ] }) }),
    isChangingPassword && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-md w-full p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-gray-900", children: "Change Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setIsChangingPassword(false),
            className: "text-gray-400 hover:text-gray-600",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handlePasswordChange, className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "current_password", className: "block text-sm font-medium text-gray-700 mb-2", children: "Current Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              id: "current_password",
              value: passwordForm.current_password,
              onChange: (e) => setPasswordForm({ ...passwordForm, current_password: e.target.value }),
              required: true,
              className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "new_password", className: "block text-sm font-medium text-gray-700 mb-2", children: "New Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              id: "new_password",
              value: passwordForm.new_password,
              onChange: (e) => setPasswordForm({ ...passwordForm, new_password: e.target.value }),
              required: true,
              minLength: 8,
              className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "confirm_password", className: "block text-sm font-medium text-gray-700 mb-2", children: "Confirm New Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "password",
              id: "confirm_password",
              value: passwordForm.confirm_password,
              onChange: (e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value }),
              required: true,
              minLength: 8,
              className: "block w-full rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 px-4 py-3"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-4 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: changePasswordMutation.isPending,
              className: "flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-all disabled:opacity-50",
              children: changePasswordMutation.isPending ? "Updating..." : "Update Password"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setIsChangingPassword(false),
              className: "flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors",
              children: "Cancel"
            }
          )
        ] })
      ] })
    ] }) })
  ] }) });
};
export {
  UV_CustomerDashboard as default
};
