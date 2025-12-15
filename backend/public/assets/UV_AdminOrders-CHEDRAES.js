import { k as useSearchParams, l as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, V as RefreshCw, af as Download, a2 as Search, ae as Filter, X, d as CircleAlert, h as Package, z as User, c as Mail, P as Phone, M as MapPin, T as Truck, D as Calendar, ag as DollarSign, G as CreditCard, F as FileText, v as Eye, ak as RotateCcw, b as axios, y as CircleX, B as CircleCheckBig, C as Clock } from "./index-nYaE10KP.js";
import { u as useMutation } from "./useMutation-BdRga-lQ.js";
const fetchOrders = async (params) => {
  const { token, ...queryParams } = params;
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/orders`,
    {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const fetchOrderDetail = async (order_id, token) => {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/orders/${order_id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const updateOrderStatus = async (data) => {
  const { token, order_id, ...body } = data;
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/orders/${order_id}/status`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const exportOrdersCSV = async (params) => {
  const { token, ...queryParams } = params;
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/analytics/reports`,
    {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: "blob"
    }
  );
  return response.data;
};
const formatCurrency = (value) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `€${num.toFixed(2)}`;
};
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
const getStatusColor = (status) => {
  const colors = {
    "pending_payment": "bg-gray-100 text-gray-800",
    "payment_confirmed": "bg-yellow-100 text-yellow-800",
    "preparing": "bg-blue-100 text-blue-800",
    "ready_for_collection": "bg-green-100 text-green-800",
    "out_for_delivery": "bg-blue-100 text-blue-800",
    "in_progress": "bg-blue-100 text-blue-800",
    "completed": "bg-green-100 text-green-800",
    "cancelled": "bg-gray-100 text-gray-800",
    "delivered": "bg-green-100 text-green-800",
    "collected": "bg-green-100 text-green-800",
    "refunded": "bg-orange-100 text-orange-800"
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};
const getStatusIcon = (status) => {
  const icons = {
    "pending_payment": /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
    "payment_confirmed": /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4" }),
    "preparing": /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4" }),
    "ready_for_collection": /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4" }),
    "out_for_delivery": /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-4 h-4" }),
    "delivered": /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4" }),
    "collected": /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4" }),
    "completed": /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4" }),
    "cancelled": /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4" }),
    "refunded": /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-4 h-4" })
  };
  return icons[status] || /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4" });
};
const UV_AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const showConfirmation = useAppStore((state) => state.show_confirmation);
  const hideConfirmation = useAppStore((state) => state.hide_confirmation);
  const activeTab = searchParams.get("tab") || "all";
  const statusFilter = searchParams.get("status") || "";
  const locationFilter = searchParams.get("location") || "";
  const dateFromFilter = searchParams.get("date_from") || "";
  const dateToFilter = searchParams.get("date_to") || "";
  const fulfillmentFilter = searchParams.get("fulfillment") || "";
  const searchQuery = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort_by") || "created_at";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [selectedOrderId, setSelectedOrderId] = reactExports.useState(null);
  const [showDetailPanel, setShowDetailPanel] = reactExports.useState(false);
  const [showRefundModal, setShowRefundModal] = reactExports.useState(false);
  const [refundType, setRefundType] = reactExports.useState("full");
  const [refundAmount, setRefundAmount] = reactExports.useState("");
  const [refundReason, setRefundReason] = reactExports.useState("");
  const [showFilters, setShowFilters] = reactExports.useState(false);
  const [localSearchInput, setLocalSearchInput] = reactExports.useState(searchQuery);
  const itemsPerPage = 20;
  reactExports.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchInput !== searchQuery) {
        const newParams = new URLSearchParams(searchParams);
        if (localSearchInput) {
          newParams.set("search", localSearchInput);
        } else {
          newParams.delete("search");
        }
        newParams.set("page", "1");
        setSearchParams(newParams);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchInput]);
  reactExports.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showDetailPanel) {
        setShowDetailPanel(false);
        setTimeout(() => setSelectedOrderId(null), 300);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showDetailPanel]);
  reactExports.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showRefundModal) {
        setShowRefundModal(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showRefundModal]);
  const queryParams = reactExports.useMemo(() => ({
    query: searchQuery || void 0,
    location_name: locationFilter || void 0,
    order_status: statusFilter || void 0,
    fulfillment_method: fulfillmentFilter || void 0,
    date_from: dateFromFilter || void 0,
    date_to: dateToFilter || void 0,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    sort_by: sortBy,
    sort_order: "desc",
    token: authToken || ""
  }), [searchQuery, locationFilter, statusFilter, fulfillmentFilter, dateFromFilter, dateToFilter, currentPage, sortBy, authToken]);
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ["admin-orders", queryParams],
    queryFn: () => fetchOrders(queryParams),
    enabled: !!authToken,
    staleTime: 3e4,
    select: (data) => ({
      ...data,
      data: data.data.map((order) => ({
        ...order,
        subtotal: Number(order.subtotal || 0),
        delivery_fee: Number(order.delivery_fee || 0),
        discount_amount: Number(order.discount_amount || 0),
        tax_amount: Number(order.tax_amount || 0),
        total_amount: Number(order.total_amount || 0),
        loyalty_points_used: Number(order.loyalty_points_used || 0),
        loyalty_points_earned: Number(order.loyalty_points_earned || 0),
        guest_count: order.guest_count ? Number(order.guest_count) : null
      }))
    })
  });
  const { data: orderDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["order-detail", selectedOrderId],
    queryFn: () => fetchOrderDetail(selectedOrderId, authToken),
    enabled: !!selectedOrderId && !!authToken,
    staleTime: 1e4,
    select: (data) => ({
      ...data,
      collection_code: data.collection_code,
      subtotal: Number(data.subtotal || 0),
      delivery_fee: Number(data.delivery_fee || 0),
      discount_amount: Number(data.discount_amount || 0),
      tax_amount: Number(data.tax_amount || 0),
      total_amount: Number(data.total_amount || 0),
      loyalty_points_used: Number(data.loyalty_points_used || 0),
      loyalty_points_earned: Number(data.loyalty_points_earned || 0),
      items: data.items.map((item) => ({
        ...item,
        price_at_purchase: Number(item.price_at_purchase || 0),
        quantity: Number(item.quantity || 0),
        subtotal: Number(item.subtotal || 0)
      }))
    })
  });
  const updateStatusMutation = useMutation({
    mutationFn: (data) => updateOrderStatus(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-detail", selectedOrderId] });
      showToast("success", "Order status updated successfully");
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update order status");
    }
  });
  const exportMutation = useMutation({
    mutationFn: (params) => exportOrdersCSV(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders_export_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast("success", "Orders exported successfully");
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to export orders");
    }
  });
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set("page", "1");
    setSearchParams(newParams);
  };
  const handleClearFilters = () => {
    setSearchParams({ tab: activeTab });
    setLocalSearchInput("");
  };
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", page.toString());
    setSearchParams(newParams);
  };
  const handleViewDetails = (order_id) => {
    setSelectedOrderId(order_id);
    setShowDetailPanel(true);
  };
  const handleCloseDetailPanel = () => {
    setShowDetailPanel(false);
    setTimeout(() => setSelectedOrderId(null), 300);
  };
  const handleStatusUpdate = (newStatus, notes) => {
    if (!selectedOrderId || !authToken) return;
    showConfirmation({
      title: "Update Order Status",
      message: `Are you sure you want to change the status to "${newStatus}"?`,
      confirm_text: "Update Status",
      cancel_text: "Cancel",
      on_confirm: () => {
        updateStatusMutation.mutate({
          order_id: selectedOrderId,
          order_status: newStatus,
          notes,
          token: authToken
        });
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      },
      danger_action: false
    });
  };
  const handleOpenRefundModal = () => {
    if (orderDetail) {
      setRefundAmount(orderDetail.total_amount.toString());
      setRefundType("full");
      setRefundReason("");
      setShowRefundModal(true);
    }
  };
  const handleProcessRefund = () => {
    showToast("warning", "Refund endpoint not yet implemented");
    setShowRefundModal(false);
  };
  const handleExportCSV = () => {
    if (!authToken) return;
    exportMutation.mutate({
      report_type: "orders_export",
      format: "csv",
      location: locationFilter || void 0,
      date_from: dateFromFilter || void 0,
      date_to: dateToFilter || void 0,
      token: authToken
    });
  };
  const totalPages = ordersData ? Math.ceil(ordersData.total / itemsPerPage) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white shadow-sm border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Order Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Manage and track all orders across locations" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleExportCSV,
            disabled: exportMutation.isPending,
            className: "inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
            children: exportMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2 animate-spin" }),
              "Exporting..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-4 h-4 mr-2" }),
              "Export CSV"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
            className: "inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4 mr-2" }),
              "Refresh"
            ]
          }
        )
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 max-w-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: localSearchInput,
                onChange: (e) => setLocalSearchInput(e.target.value),
                placeholder: "Search by order number, customer name, phone, or email...",
                className: "w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setShowFilters(!showFilters),
                className: `inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-all duration-200 ${showFilters || statusFilter || locationFilter || dateFromFilter || fulfillmentFilter ? "border-blue-500 text-blue-700 bg-blue-50" : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-4 h-4 mr-2" }),
                  "Filters",
                  (statusFilter || locationFilter || dateFromFilter || fulfillmentFilter) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full", children: "Active" })
                ]
              }
            ),
            (searchQuery || statusFilter || locationFilter || dateFromFilter || fulfillmentFilter) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleClearFilters,
                className: "inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 mr-1" }),
                  "Clear"
                ]
              }
            )
          ] })
        ] }),
        showFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: statusFilter,
                onChange: (e) => handleFilterChange("status", e.target.value),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Statuses" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending_payment", children: "Pending Payment" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "payment_confirmed", children: "Payment Confirmed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "preparing", children: "Preparing" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ready_for_collection", children: "Ready for Collection" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "out_for_delivery", children: "Out for Delivery" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "delivered", children: "Delivered" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "collected", children: "Collected" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "completed", children: "Completed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cancelled", children: "Cancelled" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "refunded", children: "Refunded" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: locationFilter,
                onChange: (e) => handleFilterChange("location", e.target.value),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Locations" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Blanchardstown", children: "Blanchardstown" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Tallaght", children: "Tallaght" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Glasnevin", children: "Glasnevin" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Fulfillment Method" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: fulfillmentFilter,
                onChange: (e) => handleFilterChange("fulfillment", e.target.value),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Methods" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "delivery", children: "Delivery" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "collection", children: "Collection" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Date From" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: dateFromFilter,
                onChange: (e) => handleFilterChange("date_from", e.target.value),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Date To" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: dateToFilter,
                onChange: (e) => handleFilterChange("date_to", e.target.value),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              }
            )
          ] })
        ] })
      ] }),
      ordersData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between text-sm text-gray-600", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Showing ",
          ordersData.data.length,
          " of ",
          ordersData.total,
          " orders"
        ] }),
        ordersData.total > itemsPerPage && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Page ",
          currentPage,
          " of ",
          totalPages
        ] })
      ] }),
      ordersLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-12 h-12 text-blue-500 animate-spin mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 font-medium", children: "Loading orders..." })
      ] }) }) : ordersError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-red-200 p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-12 h-12 text-red-500 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 font-medium mb-2", children: "Failed to load orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-sm", children: "Please try refreshing the page" })
      ] }) }) : !ordersData || ordersData.data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-12 h-12 text-gray-400 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 font-medium mb-2", children: "No orders found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm", children: "Try adjusting your filters or search criteria" })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: ordersData.data.map((order) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900", children: order.order_number }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.order_status)}`, children: [
                    getStatusIcon(order.order_status),
                    order.order_status.replace(/_/g, " ")
                  ] }),
                  order.order_type === "corporate" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800", children: "Corporate" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm text-gray-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: order.customer_name })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: order.customer_email })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: order.customer_phone })
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Location" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm font-medium text-gray-900", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4 text-gray-400" }),
                    order.location_name
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Fulfillment" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm font-medium text-gray-900", children: [
                    order.fulfillment_method === "delivery" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-4 h-4 text-gray-400" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-4 h-4 text-gray-400" }),
                    order.fulfillment_method === "delivery" ? "Delivery" : "Collection"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Order Date" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm font-medium text-gray-900", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 text-gray-400" }),
                    formatDate(order.created_at)
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Total Amount" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 text-sm font-bold text-gray-900", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "w-4 h-4 text-green-600" }),
                    formatCurrency(order.total_amount)
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 text-xs text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-3 h-3" }),
                  "Payment: ",
                  order.payment_status,
                  order.card_last_four && ` (•••• ${order.card_last_four})`
                ] }),
                order.promo_code && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3 h-3" }),
                  "Promo: ",
                  order.promo_code
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => handleViewDetails(order.order_id),
                className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 mr-2" }),
                  "View Details"
                ]
              }
            ) })
          ] }) })
        },
        order.order_id
      )) }),
      ordersData && ordersData.total > itemsPerPage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-600", children: [
          "Showing ",
          (currentPage - 1) * itemsPerPage + 1,
          " to",
          " ",
          Math.min(currentPage * itemsPerPage, ordersData.total),
          " of",
          " ",
          ordersData.total,
          " results"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handlePageChange(currentPage - 1),
              disabled: currentPage === 1,
              className: "px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
              children: "Previous"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-1", children: Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handlePageChange(pageNum),
                className: `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === pageNum ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`,
                children: pageNum
              },
              pageNum
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handlePageChange(currentPage + 1),
              disabled: currentPage === totalPages,
              className: "px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
              children: "Next"
            }
          )
        ] })
      ] })
    ] }),
    showDetailPanel && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
          onClick: handleCloseDetailPanel
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 right-0 max-w-full flex", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-screen max-w-3xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col bg-white shadow-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 bg-gray-50 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Order Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleCloseDetailPanel,
              className: "text-gray-400 hover:text-gray-600 transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto", children: detailLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-8 h-8 text-blue-500 animate-spin" }) }) : orderDetail ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-1", children: orderDetail.order_number }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                  "Placed on ",
                  formatDate(orderDetail.created_at)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(orderDetail.order_status)}`, children: [
                getStatusIcon(orderDetail.order_status),
                orderDetail.order_status.replace(/_/g, " ").toUpperCase()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: handleOpenRefundModal,
                  disabled: orderDetail.payment_status === "refunded",
                  className: "inline-flex items-center px-4 py-2 border border-orange-300 rounded-lg text-sm font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RotateCcw, { className: "w-4 h-4 mr-2" }),
                    "Issue Refund"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: "",
                  onChange: (e) => {
                    if (e.target.value) {
                      handleStatusUpdate(e.target.value);
                    }
                  },
                  className: "px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Update Status..." }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "payment_confirmed", children: "Payment Confirmed" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "preparing", children: "Preparing" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "ready_for_collection", children: "Ready for Collection" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "out_for_delivery", children: "Out for Delivery" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "delivered", children: "Delivered" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "collected", children: "Collected" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "completed", children: "Completed" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cancelled", children: "Cancelled" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Customer Information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: orderDetail.customer_name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: orderDetail.customer_email })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Phone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: orderDetail.customer_phone })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Location" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: orderDetail.location_name })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Fulfillment Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                orderDetail.fulfillment_method === "delivery" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-5 h-5 text-blue-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-5 h-5 text-green-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-900", children: orderDetail.fulfillment_method === "delivery" ? "Delivery" : "Collection" })
              ] }),
              orderDetail.fulfillment_method === "delivery" && orderDetail.delivery_address_line1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-2", children: "Delivery Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900", children: orderDetail.delivery_address_line1 }),
                orderDetail.delivery_address_line2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900", children: orderDetail.delivery_address_line2 }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-900", children: [
                  orderDetail.delivery_city,
                  ", ",
                  orderDetail.delivery_postal_code
                ] }),
                orderDetail.delivery_instructions && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600 mt-2", children: [
                  "Instructions: ",
                  orderDetail.delivery_instructions
                ] })
              ] }),
              orderDetail.collection_code && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Collection Code" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-blue-900", children: orderDetail.collection_code })
              ] }),
              orderDetail.special_instructions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-yellow-50 rounded-lg p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Special Instructions" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-900", children: orderDetail.special_instructions })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Order Items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: orderDetail.items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: item.product_name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                      formatCurrency(item.price_at_purchase),
                      " × ",
                      item.quantity
                    ] }),
                    item.product_specific_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                      "Note: ",
                      item.product_specific_notes
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold text-gray-900", children: formatCurrency(item.subtotal) }) })
                ]
              },
              item.item_id
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Order Summary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Subtotal" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900", children: formatCurrency(orderDetail.subtotal) })
              ] }),
              orderDetail.delivery_fee > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Delivery Fee" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900", children: formatCurrency(orderDetail.delivery_fee) })
              ] }),
              orderDetail.discount_amount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Discount" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-green-600", children: [
                  "-",
                  formatCurrency(orderDetail.discount_amount)
                ] })
              ] }),
              orderDetail.tax_amount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Tax" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900", children: formatCurrency(orderDetail.tax_amount) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-lg font-bold pt-2 border-t border-gray-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-900", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-900", children: formatCurrency(orderDetail.total_amount) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Payment Information" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Payment Method" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900 capitalize", children: orderDetail.payment_method })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Payment Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900 capitalize", children: orderDetail.payment_status })
              ] }),
              orderDetail.card_last_four && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Card" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-gray-900", children: [
                  "•••• ",
                  orderDetail.card_last_four
                ] })
              ] }),
              orderDetail.payment_transaction_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-1", children: "Transaction ID" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-mono text-gray-900", children: orderDetail.payment_transaction_id })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Status History" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: orderDetail.status_history.map((history, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-3 h-3 rounded-full ${index === orderDetail.status_history.length - 1 ? "bg-blue-600" : "bg-gray-300"}` }),
                index < orderDetail.status_history.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-0.5 h-full bg-gray-300 my-1" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 pb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: history.new_status.replace(/_/g, " ").toUpperCase() }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: formatDate(history.changed_at) })
                ] }),
                history.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: history.notes }),
                history.changed_by_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                  "By: ",
                  history.changed_by_name
                ] })
              ] })
            ] }, history.history_id)) })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500", children: "Failed to load order details" }) }) })
      ] }) }) })
    ] }) }),
    showRefundModal && orderDetail && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
          onClick: () => setShowRefundModal(false)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white px-6 pt-5 pb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Process Refund" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setShowRefundModal(false),
                className: "text-gray-400 hover:text-gray-600",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Refund Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "radio",
                      value: "full",
                      checked: refundType === "full",
                      onChange: (e) => {
                        setRefundType(e.target.value);
                        setRefundAmount(orderDetail.total_amount.toString());
                      },
                      className: "mr-2"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-900", children: "Full Refund" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "radio",
                      value: "partial",
                      checked: refundType === "partial",
                      onChange: (e) => {
                        setRefundType(e.target.value);
                        setRefundAmount("");
                      },
                      className: "mr-2"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-900", children: "Partial Refund" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Refund Amount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500", children: "€" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    step: "0.01",
                    value: refundAmount,
                    onChange: (e) => setRefundAmount(e.target.value),
                    disabled: refundType === "full",
                    className: "w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Refund Reason *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  value: refundReason,
                  onChange: (e) => setRefundReason(e.target.value),
                  rows: 4,
                  required: true,
                  className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
                  placeholder: "Enter reason for refund..."
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-orange-800", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium mb-1", children: "Warning" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
                  "This action will process a refund of ",
                  formatCurrency(refundAmount || 0),
                  " to the customer's original payment method. This cannot be undone."
                ] })
              ] })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 px-6 py-4 flex justify-end gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setShowRefundModal(false),
              className: "px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleProcessRefund,
              disabled: !refundReason || !refundAmount || parseFloat(refundAmount) <= 0,
              className: "px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200",
              children: "Process Refund"
            }
          )
        ] })
      ] })
    ] }) })
  ] }) });
};
export {
  UV_AdminOrders as default
};
