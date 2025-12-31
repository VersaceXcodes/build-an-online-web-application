import { l as useSearchParams, o as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, Z as RefreshCw, a5 as Search, C as Clock, i as Package, a6 as ShoppingBag, T as Truck, I as CircleCheckBig, a7 as TriangleAlert, P as Phone, a8 as Printer, X, c as Mail, M as MapPin, v as kakeLogo, b as axios } from "./index-CwVo5_So.js";
import { u as useMutation } from "./useMutation-HzYQCpti.js";
const fetchOrders = async (params, token) => {
  const queryParams = new URLSearchParams();
  if (params.location_name) queryParams.append("location_name", params.location_name);
  if (params.order_status) queryParams.append("order_status", params.order_status);
  if (params.date_from) queryParams.append("date_from", params.date_from);
  if (params.date_to) queryParams.append("date_to", params.date_to);
  if (params.search) queryParams.append("search", params.search);
  if (params.fulfillment_method) queryParams.append("fulfillment_method", params.fulfillment_method);
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sort_by) queryParams.append("sort_by", params.sort_by);
  if (params.sort_order) queryParams.append("sort_order", params.sort_order);
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/orders?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const fetchOrderDetails = async (order_id, token) => {
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
const updateOrderStatus = async (order_id, payload, token) => {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/orders/${order_id}/status`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const isToday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = /* @__PURE__ */ new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
};
const isOrderLate = (order) => {
  const now = Date.now();
  const created = new Date(order.created_at).getTime();
  const minutesSinceCreated = (now - created) / (1e3 * 60);
  if (order.order_status === "payment_confirmed" && minutesSinceCreated > 15) return true;
  if (order.order_status === "preparing" && minutesSinceCreated > 30) return true;
  return false;
};
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-IE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
};
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-IE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
};
const getStatusColor = (status) => {
  const colors = {
    "payment_confirmed": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "preparing": "bg-blue-100 text-blue-800 border-blue-200",
    "ready_for_collection": "bg-green-100 text-green-800 border-green-200",
    "out_for_delivery": "bg-blue-100 text-blue-800 border-blue-200",
    "completed": "bg-gray-100 text-gray-800 border-gray-200",
    "cancelled": "bg-red-100 text-red-800 border-red-200"
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-200";
};
const getStatusDisplayName = (status) => {
  const names = {
    "payment_confirmed": "Awaiting Confirmation",
    "preparing": "In Preparation",
    "ready_for_collection": "Ready for Pickup",
    "out_for_delivery": "Out for Delivery",
    "completed": "Completed",
    "cancelled": "Cancelled"
  };
  return names[status] || status;
};
const UV_StaffDashboard = () => {
  var _a, _b;
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const [selectedOrderId, setSelectedOrderId] = reactExports.useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = reactExports.useState(false);
  const [statusUpdateNotes, setStatusUpdateNotes] = reactExports.useState("");
  const [selectedNewStatus, setSelectedNewStatus] = reactExports.useState("");
  const statusFilter = searchParams.get("status") || null;
  const locationFilter = searchParams.get("location") || null;
  const dateFilter = searchParams.get("date") || "today";
  const fulfillmentFilter = searchParams.get("fulfillment") || null;
  const searchQuery = searchParams.get("search") || "";
  const assignedLocations = reactExports.useMemo(() => {
    if (currentUser && "assigned_locations" in currentUser && Array.isArray(currentUser.assigned_locations)) {
      const locations = currentUser.assigned_locations;
      return locations.length > 0 ? locations : ["London Flagship"];
    }
    return ["London Flagship"];
  }, [currentUser]);
  const currentLocationFilter = locationFilter || assignedLocations[0];
  const { dateFrom, dateTo } = reactExports.useMemo(() => {
    const now = /* @__PURE__ */ new Date();
    let from;
    let to = now.toISOString();
    if (dateFilter === "today") {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    } else if (dateFilter === "yesterday") {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1e3);
      from = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).toISOString();
      to = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59).toISOString();
    } else if (dateFilter === "last_7_days") {
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3).toISOString();
    } else {
      from = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    }
    return { dateFrom: from, dateTo: to };
  }, [dateFilter]);
  const {
    data: ordersResponse,
    isLoading: isLoadingOrders,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ["staff-orders", currentLocationFilter, statusFilter, dateFrom, dateTo, searchQuery, fulfillmentFilter],
    queryFn: () => fetchOrders(
      {
        location_name: currentLocationFilter,
        // Don't send 'ready_out' to API - filter client-side instead
        order_status: statusFilter && statusFilter !== "ready_out" ? statusFilter : void 0,
        date_from: dateFrom,
        date_to: dateTo,
        search: searchQuery || void 0,
        fulfillment_method: fulfillmentFilter || void 0,
        limit: 50,
        sort_by: "created_at",
        sort_order: "asc"
      },
      authToken || ""
    ),
    enabled: !!authToken && !!currentLocationFilter,
    refetchInterval: 3e4,
    // Auto-refresh every 30 seconds
    staleTime: 0
    // Always treat as stale for real-time updates
  });
  const ordersList = (ordersResponse == null ? void 0 : ordersResponse.data) || [];
  const orderCounts = reactExports.useMemo(() => {
    return {
      awaiting_confirmation: ordersList.filter((o) => o.order_status === "payment_confirmed").length,
      in_preparation: ordersList.filter((o) => o.order_status === "preparing").length,
      ready_collection: ordersList.filter((o) => o.order_status === "ready_for_collection").length,
      out_for_delivery: ordersList.filter((o) => o.order_status === "out_for_delivery").length,
      completed_today: ordersList.filter(
        (o) => o.order_status === "completed" && isToday(o.completed_at)
      ).length
    };
  }, [ordersList]);
  const lateOrdersCount = reactExports.useMemo(() => {
    return ordersList.filter(isOrderLate).length;
  }, [ordersList]);
  const {
    data: selectedOrderDetail,
    isLoading: isLoadingDetail
  } = useQuery({
    queryKey: ["order-detail", selectedOrderId],
    queryFn: () => fetchOrderDetails(selectedOrderId, authToken || ""),
    enabled: !!selectedOrderId && !!authToken
  });
  const updateStatusMutation = useMutation({
    mutationFn: ({ order_id, payload }) => updateOrderStatus(order_id, payload, authToken || ""),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["staff-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order-detail", updatedOrder.order_id] });
      showToast("success", `Order status updated to ${getStatusDisplayName(updatedOrder.order_status)}`);
      setSelectedNewStatus("");
      setStatusUpdateNotes("");
    },
    onError: (error) => {
      var _a2, _b2;
      showToast("error", ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to update order status");
    }
  });
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };
  const handleViewOrderDetails = (order_id) => {
    setSelectedOrderId(order_id);
    setIsDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrderId(null);
    setSelectedNewStatus("");
    setStatusUpdateNotes("");
  };
  const handleUpdateStatus = () => {
    if (!selectedOrderId || !selectedNewStatus) return;
    updateStatusMutation.mutate({
      order_id: selectedOrderId,
      payload: {
        order_status: selectedNewStatus,
        notes: statusUpdateNotes || void 0
      }
    });
  };
  const handlePrintOrder = () => {
    window.print();
  };
  const handleQuickStatusUpdate = (order_id, new_status) => {
    updateStatusMutation.mutate({
      order_id,
      payload: {
        order_status: new_status
      }
    });
  };
  const getNextStatusOptions = (current_status) => {
    const workflows = {
      "payment_confirmed": ["preparing", "cancelled"],
      "preparing": ["ready_for_collection", "out_for_delivery", "cancelled"],
      "ready_for_collection": ["completed"],
      "out_for_delivery": ["completed", "failed_delivery"]
    };
    return workflows[current_status] || [];
  };
  const activeTab = statusFilter === "payment_confirmed" ? "awaiting_confirmation" : statusFilter === "preparing" ? "in_preparation" : statusFilter === "ready_out" ? "ready_out" : statusFilter === "completed" ? "completed_today" : statusFilter || "awaiting_confirmation";
  const tabs = [
    {
      id: "awaiting_confirmation",
      label: "Awaiting Confirmation",
      count: orderCounts.awaiting_confirmation,
      status_filter: "payment_confirmed"
    },
    {
      id: "in_preparation",
      label: "In Preparation",
      count: orderCounts.in_preparation,
      status_filter: "preparing"
    },
    {
      id: "ready_out",
      label: "Ready/Out",
      count: orderCounts.ready_collection + orderCounts.out_for_delivery,
      status_filter: "ready_out"
      // Special filter value to show both ready_for_collection and out_for_delivery
    },
    {
      id: "completed_today",
      label: "Completed Today",
      count: orderCounts.completed_today,
      status_filter: "completed"
    }
  ];
  const filteredOrders = reactExports.useMemo(() => {
    if (activeTab === "ready_out" || statusFilter === "ready_out") {
      return ordersList.filter(
        (o) => o.order_status === "ready_for_collection" || o.order_status === "out_for_delivery"
      );
    }
    const tabConfig = tabs.find((t) => t.id === activeTab);
    if ((tabConfig == null ? void 0 : tabConfig.status_filter) && tabConfig.status_filter !== "ready_out") {
      return ordersList.filter((o) => o.order_status === tabConfig.status_filter);
    }
    return ordersList;
  }, [ordersList, activeTab, statusFilter]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white shadow-sm border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Order Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
            currentLocationFilter,
            " - ",
            dateFilter === "today" ? "Today" : dateFilter === "yesterday" ? "Yesterday" : "Last 7 Days"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => refetchOrders(),
            disabled: isLoadingOrders,
            className: "flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 16, className: isLoadingOrders ? "animate-spin" : "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Refresh" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap gap-4", children: [
        assignedLocations.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: currentLocationFilter,
              onChange: (e) => handleFilterChange("location", e.target.value),
              className: "px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              children: assignedLocations.map((loc) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: loc, children: loc }, loc))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Date" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: dateFilter,
              onChange: (e) => handleFilterChange("date", e.target.value),
              className: "px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "today", children: "Today" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "yesterday", children: "Yesterday" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "last_7_days", children: "Last 7 Days" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Fulfillment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: fulfillmentFilter || "all",
              onChange: (e) => handleFilterChange("fulfillment", e.target.value === "all" ? null : e.target.value),
              className: "px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "collection", children: "Collection" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "delivery", children: "Delivery" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-[250px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: searchQuery,
                onChange: (e) => handleFilterChange("search", e.target.value || null),
                placeholder: "Order number or customer name...",
                className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-yellow-700 text-sm font-medium", children: "Awaiting" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-yellow-900 mt-1", children: orderCounts.awaiting_confirmation })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 32, className: "text-yellow-600" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-700 text-sm font-medium", children: "Preparing" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-blue-900 mt-1", children: orderCounts.in_preparation })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 32, className: "text-blue-600" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-green-50 border-2 border-green-200 rounded-xl p-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-700 text-sm font-medium", children: "Ready" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-green-900 mt-1", children: orderCounts.ready_collection })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 32, className: "text-green-600" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-indigo-50 border-2 border-indigo-200 rounded-xl p-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-indigo-700 text-sm font-medium", children: "Out" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-indigo-900 mt-1", children: orderCounts.out_for_delivery })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 32, className: "text-indigo-600" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 border-2 border-gray-200 rounded-xl p-6 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 text-sm font-medium", children: "Completed" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-gray-900 mt-1", children: orderCounts.completed_today })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { size: 32, className: "text-gray-600" })
        ] }) })
      ] }),
      lateOrdersCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 24, className: "text-red-600 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-red-900 font-semibold", children: [
            lateOrdersCount,
            " late ",
            lateOrdersCount === 1 ? "order" : "orders",
            " requiring attention"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: "Orders exceeding expected preparation time" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex -mb-px overflow-x-auto", children: tabs.map((tab) => {
        const isActive = activeTab === tab.id || tab.id === "ready_out" && statusFilter === "ready_out";
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleFilterChange("status", tab.status_filter),
            className: `
                        whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm transition-colors
                        ${isActive ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
                      `,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: tab.label }),
              tab.count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `
                            inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full
                            ${isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}
                          `, children: tab.count })
            ] })
          },
          tab.id
        );
      }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: isLoadingOrders ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse bg-gray-100 h-32 rounded-lg" }, i)) }) : ordersError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 48, className: "mx-auto text-red-500 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900 font-semibold mb-2", children: "Failed to load orders" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-sm mb-4", children: "Please try refreshing the page" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => refetchOrders(),
            className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
            children: "Retry"
          }
        )
      ] }) : filteredOrders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { size: 48, className: "mx-auto text-gray-400 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900 font-semibold mb-2", children: "No orders found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-sm", children: searchQuery ? "Try adjusting your search or filters" : "New orders will appear here" })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: filteredOrders.map((order) => {
        const isLate = isOrderLate(order);
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `
                          bg-white border-2 rounded-xl p-6 transition-all hover:shadow-md cursor-pointer
                          ${isLate ? "border-red-300 bg-red-50" : "border-gray-200"}
                        `,
            onClick: () => handleViewOrderDetails(order.order_id),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 mb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900", children: order.order_number }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.order_status)}`, children: getStatusDisplayName(order.order_status) }),
                  isLate && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 flex items-center space-x-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { size: 12 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "LATE" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-gray-700", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Customer:" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: order.customer_name })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-gray-700", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 14 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: order.customer_phone })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `
                                px-3 py-1 rounded-lg font-medium
                                ${order.fulfillment_method === "delivery" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
                              `, children: order.fulfillment_method === "delivery" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center space-x-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { size: 14 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delivery" })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center space-x-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { size: 14 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Collection" })
                  ] }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-gray-600", children: [
                    "€",
                    Number(order.total_amount || 0).toFixed(2)
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: formatTime(order.created_at) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col space-y-2 ml-4", children: [
                order.order_status === "payment_confirmed" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleQuickStatusUpdate(order.order_id, "preparing");
                    },
                    disabled: updateStatusMutation.isPending,
                    className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50",
                    children: "Accept"
                  }
                ),
                order.order_status === "preparing" && order.fulfillment_method === "collection" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleQuickStatusUpdate(order.order_id, "ready_for_collection");
                    },
                    disabled: updateStatusMutation.isPending,
                    className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50",
                    children: "Mark Ready"
                  }
                ),
                order.order_status === "preparing" && order.fulfillment_method === "delivery" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleQuickStatusUpdate(order.order_id, "out_for_delivery");
                    },
                    disabled: updateStatusMutation.isPending,
                    className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50",
                    children: "Out for Delivery"
                  }
                ),
                (order.order_status === "ready_for_collection" || order.order_status === "out_for_delivery") && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleQuickStatusUpdate(order.order_id, "completed");
                    },
                    disabled: updateStatusMutation.isPending,
                    className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50",
                    children: "Complete"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleViewOrderDetails(order.order_id);
                    },
                    className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium",
                    children: "Details"
                  }
                )
              ] })
            ] })
          },
          order.order_id
        );
      }) }) })
    ] }) }),
    isDetailModalOpen && selectedOrderId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity",
          onClick: handleCloseDetailModal
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full", children: isLoadingDetail ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-gray-600", children: "Loading order details..." })
      ] }) : selectedOrderDetail ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-white", children: selectedOrderDetail.order_number }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-100 text-sm mt-1", children: formatDateTime(selectedOrderDetail.created_at) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handlePrintOrder,
                  className: "p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors",
                  title: "Print Order",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Printer, { size: 20, className: "text-white" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleCloseDetailModal,
                  className: "p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20, className: "text-white" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-4 py-2 rounded-lg text-sm font-semibold border-2 ${getStatusColor(selectedOrderDetail.order_status)} bg-white`, children: getStatusDisplayName(selectedOrderDetail.order_status) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-h-[calc(100vh-300px)] overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 bg-gray-50 rounded-xl p-6 border border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "Customer Contact" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { size: 18, className: "text-blue-600" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "Email" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: selectedOrderDetail.customer_email })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { size: 18, className: "text-green-600" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: "Phone" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: `tel:${selectedOrderDetail.customer_phone}`,
                      className: "text-sm font-medium text-blue-600 hover:underline",
                      children: selectedOrderDetail.customer_phone
                    }
                  )
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 bg-gray-50 rounded-xl p-6 border border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: selectedOrderDetail.fulfillment_method === "delivery" ? "Delivery Details" : "Collection Details" }),
            selectedOrderDetail.fulfillment_method === "delivery" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { size: 18, className: "text-gray-600 mt-1 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: selectedOrderDetail.delivery_address_line1 }),
                  selectedOrderDetail.delivery_address_line2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700", children: selectedOrderDetail.delivery_address_line2 }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-700", children: [
                    selectedOrderDetail.delivery_city,
                    ", ",
                    selectedOrderDetail.delivery_postal_code
                  ] })
                ] })
              ] }),
              selectedOrderDetail.delivery_instructions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-yellow-800 mb-1", children: "Delivery Instructions" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-yellow-900", children: selectedOrderDetail.delivery_instructions })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-700", children: [
                "Customer will collect from ",
                selectedOrderDetail.location_name
              ] }),
              selectedOrderDetail.collection_code && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border-2 border-green-300 rounded-lg p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-green-800 mb-2", children: "Collection Code" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-green-900 tracking-wider", children: selectedOrderDetail.collection_code })
              ] })
            ] }),
            selectedOrderDetail.special_instructions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-orange-800 mb-1", children: "Special Instructions" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-orange-900", children: selectedOrderDetail.special_instructions })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "Order Items" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border border-gray-200 rounded-xl overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Item" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Qty" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Price" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Subtotal" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: (_a = selectedOrderDetail.items) == null ? void 0 : _a.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: item.product_name }),
                  item.product_specific_notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: item.product_specific_notes })
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-center text-gray-900 font-medium", children: item.quantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right text-gray-900", children: [
                  "€",
                  Number(item.price_at_purchase || 0).toFixed(2)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 text-right font-medium text-gray-900", children: [
                  "€",
                  Number(item.subtotal || 0).toFixed(2)
                ] })
              ] }, item.item_id)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "px-6 py-3 text-right font-semibold text-gray-700", children: "Total" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-3 text-right font-bold text-gray-900 text-lg", children: [
                  "€",
                  Number(selectedOrderDetail.total_amount || 0).toFixed(2)
                ] })
              ] }) })
            ] }) })
          ] }),
          selectedOrderDetail.status_history && selectedOrderDetail.status_history.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "Status History" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: selectedOrderDetail.status_history.map((entry, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `
                                  w-3 h-3 rounded-full mt-1.5 flex-shrink-0
                                  ${index === selectedOrderDetail.status_history.length - 1 ? "bg-blue-600" : "bg-gray-300"}
                                ` }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-gray-900", children: getStatusDisplayName(entry.new_status) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600", children: formatDateTime(entry.changed_at) })
                ] }),
                entry.changed_by_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-600 mt-1", children: [
                  "By: ",
                  entry.changed_by_name
                ] }),
                entry.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700 mt-1", children: entry.notes })
              ] })
            ] }, entry.history_id)) })
          ] }),
          getNextStatusOptions(selectedOrderDetail.order_status).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border-2 border-blue-200 rounded-xl p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "Update Order Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "New Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: selectedNewStatus,
                    onChange: (e) => setSelectedNewStatus(e.target.value),
                    className: "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select new status..." }),
                      getNextStatusOptions(selectedOrderDetail.order_status).map((status) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: status, children: getStatusDisplayName(status) }, status))
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Notes (Optional)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    value: statusUpdateNotes,
                    onChange: (e) => setStatusUpdateNotes(e.target.value),
                    rows: 3,
                    placeholder: "Add notes about this status change...",
                    className: "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleUpdateStatus,
                  disabled: !selectedNewStatus || updateStatusMutation.isPending,
                  className: "w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed",
                  children: updateStatusMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-5 w-5 border-b-2 border-white" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Updating..." })
                  ] }) : "Update Status"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 px-6 py-4 flex justify-end space-x-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleCloseDetailModal,
            className: "px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium",
            children: "Close"
          }
        ) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Order not found" }) }) })
    ] }) }),
    selectedOrderDetail && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden print:block print:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: kakeLogo, alt: "Kake Logo", className: "h-16 w-auto mx-auto mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-semibold mt-2", children: selectedOrderDetail.location_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg mt-1", children: "ORDER TICKET" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t-2 border-b-2 border-black py-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-center", children: selectedOrderDetail.order_number }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center mt-1", children: formatDateTime(selectedOrderDetail.created_at) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-bold mb-2", children: [
          "Customer: ",
          selectedOrderDetail.customer_name
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          "Phone: ",
          selectedOrderDetail.customer_phone
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 font-semibold", children: selectedOrderDetail.fulfillment_method === "delivery" ? "DELIVERY" : "COLLECTION" })
      ] }),
      selectedOrderDetail.fulfillment_method === "delivery" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold mb-2", children: "Delivery Address:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: selectedOrderDetail.delivery_address_line1 }),
        selectedOrderDetail.delivery_address_line2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: selectedOrderDetail.delivery_address_line2 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
          selectedOrderDetail.delivery_city,
          ", ",
          selectedOrderDetail.delivery_postal_code
        ] }),
        selectedOrderDetail.delivery_instructions && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 italic", children: [
          "Instructions: ",
          selectedOrderDetail.delivery_instructions
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold mb-3 text-lg", children: "ITEMS:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-black", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left pb-2", children: "Item" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-center pb-2", children: "Qty" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: (_b = selectedOrderDetail.items) == null ? void 0 : _b.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-gray-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium", children: item.product_name }),
              item.product_specific_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm italic", children: [
                "Note: ",
                item.product_specific_notes
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "text-center py-2 font-bold", children: item.quantity })
          ] }, item.item_id)) })
        ] })
      ] }),
      selectedOrderDetail.special_instructions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 border-2 border-black p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold mb-2", children: "SPECIAL INSTRUCTIONS:" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg", children: selectedOrderDetail.special_instructions })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center mt-8 pt-6 border-t-2 border-black", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Thank you for choosing Kake!" }) })
    ] }) })
  ] }) });
};
export {
  UV_StaffDashboard as default
};
