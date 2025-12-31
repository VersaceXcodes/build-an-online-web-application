import { g as useParams, l as useSearchParams, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, d as CircleAlert, L as Link, i as Package, Z as RefreshCw, I as CircleCheckBig, T as Truck, M as MapPin, C as Clock, F as FileText, P as Phone, c as Mail, a1 as QrCode, X, b as axios } from "./index-BU6_V1I5.js";
import { u as useMutation } from "./useMutation-oexYD0Jy.js";
const fetchOrderDetails = async (order_id, auth_token, secure_token) => {
  const config = {
    headers: {},
    params: {}
  };
  if (auth_token) {
    config.headers.Authorization = `Bearer ${auth_token}`;
  } else if (secure_token) {
    config.params.token = secure_token;
  }
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/orders/${order_id}`,
    config
  );
  const order_details = {
    ...response.data,
    fulfillment_method: response.data.fulfillment_method,
    subtotal: Number(response.data.subtotal || 0),
    delivery_fee: Number(response.data.delivery_fee || 0),
    discount_amount: Number(response.data.discount_amount || 0),
    tax_amount: Number(response.data.tax_amount || 0),
    total_amount: Number(response.data.total_amount || 0),
    loyalty_points_earned: Number(response.data.loyalty_points_earned || 0),
    loyalty_points_used: Number(response.data.loyalty_points_used || 0)
  };
  const order_items = response.data.items.map((item) => ({
    ...item,
    price_at_purchase: Number(item.price_at_purchase || 0),
    quantity: Number(item.quantity || 0),
    subtotal: Number(item.subtotal || 0)
  }));
  const status_history = response.data.status_history || [];
  return {
    order_details,
    order_items,
    status_history
  };
};
const cancelOrder = async (order_id, auth_token, reason) => {
  const response = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/orders/${order_id}/cancel`,
    { reason },
    {
      headers: {
        Authorization: `Bearer ${auth_token}`
      }
    }
  );
  return {
    ...response.data,
    fulfillment_method: response.data.fulfillment_method,
    subtotal: Number(response.data.subtotal || 0),
    delivery_fee: Number(response.data.delivery_fee || 0),
    discount_amount: Number(response.data.discount_amount || 0),
    tax_amount: Number(response.data.tax_amount || 0),
    total_amount: Number(response.data.total_amount || 0),
    loyalty_points_earned: Number(response.data.loyalty_points_earned || 0),
    loyalty_points_used: Number(response.data.loyalty_points_used || 0)
  };
};
const getStatusColor = (status) => {
  const colors = {
    "pending_payment": "gray",
    "payment_confirmed": "yellow",
    "preparing": "blue",
    "ready_for_collection": "green",
    "out_for_delivery": "blue",
    "collected": "green",
    "delivered": "green",
    "completed": "green",
    "failed_delivery": "orange",
    "cancelled": "red",
    "refunded": "orange"
  };
  return colors[status] || "gray";
};
const getStatusDisplayName = (status) => {
  const names = {
    "pending_payment": "Pending Payment",
    "payment_confirmed": "Payment Confirmed",
    "preparing": "Preparing Your Order",
    "ready_for_collection": "Ready for Pickup",
    "out_for_delivery": "Out for Delivery",
    "collected": "Collected",
    "delivered": "Delivered",
    "completed": "Completed",
    "failed_delivery": "Delivery Failed",
    "cancelled": "Cancelled",
    "refunded": "Refunded"
  };
  return names[status] || status;
};
const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-IE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};
const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-IE", {
    hour: "2-digit",
    minute: "2-digit"
  });
};
const getTimeRemaining = (targetTime) => {
  const now = /* @__PURE__ */ new Date();
  const target = new Date(targetTime);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Any moment now";
  const diffMins = Math.ceil(diffMs / 6e4);
  if (diffMins < 60) return `${diffMins} minutes`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${hours}h ${mins}m`;
};
const generateQRCodeDataURL = (text) => {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="white"/>
      <text x="100" y="100" font-size="24" text-anchor="middle" fill="black">${text}</text>
    </svg>`
  )}`;
};
const UV_OrderTracking = () => {
  var _a, _b;
  const { order_id } = useParams();
  const [searchParams] = useSearchParams();
  const secure_token = searchParams.get("token");
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const socket = useAppStore((state) => state.websocket_state.socket);
  const isSocketConnected = useAppStore((state) => state.websocket_state.is_connected);
  const joinOrderRoom = useAppStore((state) => state.join_order_room);
  const leaveOrderRoom = useAppStore((state) => state.leave_order_room);
  const showToast = useAppStore((state) => state.show_toast);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = reactExports.useState(true);
  const [cancelReason, setCancelReason] = reactExports.useState("");
  const [showCancelModal, setShowCancelModal] = reactExports.useState(false);
  const {
    data: orderData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["order", order_id, secure_token],
    queryFn: () => fetchOrderDetails(order_id || "", authToken, secure_token),
    enabled: !!order_id,
    staleTime: 3e4,
    // 30 seconds
    refetchInterval: autoRefreshEnabled ? 3e4 : false,
    refetchIntervalInBackground: false,
    select: (data) => ({
      ...data,
      can_cancel_order: data.order_details.order_status === "pending_payment" || data.order_details.order_status === "payment_confirmed"
    })
  });
  const order_details = orderData == null ? void 0 : orderData.order_details;
  const order_items = (orderData == null ? void 0 : orderData.order_items) || [];
  const status_history = (orderData == null ? void 0 : orderData.status_history) || [];
  const can_cancel_order = (orderData == null ? void 0 : orderData.can_cancel_order) || false;
  const cancelMutation = useMutation({
    mutationFn: (reason) => {
      if (!authToken) {
        throw new Error("Must be logged in to cancel order");
      }
      return cancelOrder(order_id || "", authToken, reason);
    },
    onSuccess: () => {
      showToast("success", "Order cancelled successfully");
      setShowCancelModal(false);
      setCancelReason("");
      refetch();
    },
    onError: (error2) => {
      var _a2, _b2;
      const errorMsg = ((_b2 = (_a2 = error2.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to cancel order";
      showToast("error", errorMsg);
    }
  });
  reactExports.useEffect(() => {
    if (order_id && socket && isSocketConnected) {
      joinOrderRoom(order_id);
      const handleStatusUpdate = (data) => {
        if (data.order_id === order_id) {
          showToast("info", `Order status updated: ${getStatusDisplayName(data.new_status)}`);
          refetch();
        }
      };
      socket.on("order_status_changed", handleStatusUpdate);
      return () => {
        socket.off("order_status_changed", handleStatusUpdate);
        leaveOrderRoom(order_id);
      };
    }
  }, [order_id, socket, isSocketConnected, joinOrderRoom, leaveOrderRoom, refetch, showToast]);
  reactExports.useEffect(() => {
    if (order_details) {
      const terminalStatuses = ["completed", "collected", "delivered", "cancelled", "refunded"];
      if (terminalStatuses.includes(order_details.order_status)) {
        setAutoRefreshEnabled(false);
      }
    }
  }, [order_details == null ? void 0 : order_details.order_status]);
  const handleCancelClick = () => {
    setShowCancelModal(true);
  };
  const handleCancelConfirm = () => {
    if (!cancelReason.trim()) {
      showToast("error", "Please provide a reason for cancellation");
      return;
    }
    cancelMutation.mutate(cancelReason);
  };
  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setCancelReason("");
  };
  const handleManualRefresh = () => {
    refetch();
    showToast("info", "Refreshing order status...");
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 bg-gray-200 rounded w-1/3" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-1/4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 bg-gray-200 rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 bg-gray-200 rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 bg-gray-200 rounded" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-gray-600", children: "Loading order details..." })
      ] })
    ] }) }) }) });
  }
  if (error) {
    const axiosError = error;
    const errorMessage = ((_b = (_a = axiosError.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Order not found";
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-10 w-10 text-red-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Unable to Load Order" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: errorMessage }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleManualRefresh,
            className: "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium",
            children: "Try Again"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/",
            className: "px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium",
            children: "Back to Home"
          }
        )
      ] })
    ] }) }) }) }) });
  }
  if (!order_details) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-10 w-10 text-gray-400" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Order Not Found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: "We couldn't find the order you're looking for." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium",
          children: "Back to Home"
        }
      )
    ] }) }) }) }) });
  }
  const statusColor = getStatusColor(order_details.order_status);
  const statusDisplayName = getStatusDisplayName(order_details.order_status);
  const statusColorClasses = {
    gray: "bg-gray-100 text-gray-800 border-gray-300",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-300",
    blue: "bg-blue-100 text-blue-800 border-blue-300",
    green: "bg-green-100 text-green-800 border-green-300",
    orange: "bg-orange-100 text-orange-800 border-orange-300",
    red: "bg-red-100 text-red-800 border-red-300"
  };
  const badgeClasses = statusColorClasses[statusColor] || statusColorClasses.gray;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: [
              "Order ",
              order_details.order_number
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
              "Placed ",
              formatDateTime(order_details.created_at)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleManualRefresh,
                disabled: isLoading,
                className: "p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors disabled:opacity-50",
                "aria-label": "Refresh order status",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `w-5 h-5 ${isLoading ? "animate-spin" : ""}` })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `px-4 py-2 rounded-lg border-2 font-semibold ${badgeClasses}`, children: statusDisplayName })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-3 px-4 bg-blue-50 rounded-lg border border-blue-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-2 h-2 rounded-full ${autoRefreshEnabled ? "bg-green-500 animate-pulse" : "bg-gray-400"}` }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: autoRefreshEnabled ? "Auto-refreshing every 30 seconds" : "Auto-refresh paused" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setAutoRefreshEnabled(!autoRefreshEnabled),
              className: "text-sm text-blue-600 hover:text-blue-700 font-medium",
              children: autoRefreshEnabled ? "Disable" : "Enable"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900 mb-6", children: "Order Progress" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", role: "list", "aria-label": "Order status timeline", children: status_history.map((history, index) => {
          const isLatest = index === status_history.length - 1;
          const historyColor = getStatusColor(history.new_status);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex gap-4",
              role: "listitem",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${isLatest ? "bg-blue-600 ring-4 ring-blue-100" : historyColor === "green" ? "bg-green-500" : "bg-gray-300"}
                      `, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: `w-6 h-6 ${isLatest || historyColor === "green" ? "text-white" : "text-gray-600"}` }) }),
                  index < status_history.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-0.5 h-full min-h-[40px] bg-gray-200 mt-2" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 pb-8", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline justify-between gap-4 mb-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: getStatusDisplayName(history.new_status) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-500", children: formatTime(history.changed_at) })
                  ] }),
                  history.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: history.notes }),
                  history.changed_by_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                    "Updated by ",
                    history.changed_by_name
                  ] })
                ] })
              ]
            },
            history.history_id
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 lg:p-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900 mb-6", children: "Order Details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              order_details.fulfillment_method === "delivery" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "w-5 h-5 text-blue-600 mt-0.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-5 h-5 text-blue-600 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500", children: "Fulfillment Method" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900 font-medium", children: order_details.fulfillment_method === "delivery" ? "Delivery" : "Collection" })
              ] })
            ] }),
            order_details.fulfillment_method === "delivery" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-5 h-5 text-blue-600 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500", children: "Delivery Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900", children: order_details.delivery_address_line1 }),
                order_details.delivery_address_line2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900", children: order_details.delivery_address_line2 }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-900", children: [
                  order_details.delivery_city,
                  ", ",
                  order_details.delivery_postal_code
                ] }),
                order_details.delivery_instructions && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Instructions:" }),
                  " ",
                  order_details.delivery_instructions
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-5 h-5 text-blue-600 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500", children: "Pickup Location" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900 font-medium", children: order_details.location_name })
              ] })
            ] }),
            order_details.estimated_ready_time && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5 text-blue-600 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500", children: order_details.fulfillment_method === "delivery" ? "Estimated Delivery" : "Estimated Ready Time" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900 font-medium", children: formatDateTime(order_details.estimated_ready_time) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-600 font-medium mt-1", children: getTimeRemaining(order_details.estimated_ready_time) })
              ] })
            ] }),
            order_details.special_instructions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-blue-600 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500", children: "Special Instructions" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900", children: order_details.special_instructions })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-gray-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-500 mb-3", children: "Customer Contact" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-4 h-4 text-gray-400" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${order_details.customer_phone}`, className: "text-blue-600 hover:text-blue-700", children: order_details.customer_phone })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-4 h-4 text-gray-400" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `mailto:${order_details.customer_email}`, className: "text-blue-600 hover:text-blue-700", children: order_details.customer_email })
                ] })
              ] })
            ] })
          ] })
        ] }),
        order_details.fulfillment_method === "collection" && order_details.collection_code && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 lg:p-8 border-2 border-green-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCode, { className: "w-8 h-8 text-white" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2", children: "Your Collection Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Show this code when collecting your order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg p-6 mb-4 border-2 border-green-300", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl font-bold text-green-700 tracking-wider", children: order_details.collection_code }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: generateQRCodeDataURL(order_details.collection_code),
              alt: `QR code for collection: ${order_details.collection_code}`,
              className: "mx-auto w-48 h-48 bg-white p-2 rounded-lg border border-gray-200"
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 lg:p-8 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900 mb-6", children: "Order Items" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4 mb-6", children: order_items.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-start gap-4 py-4 border-b border-gray-100 last:border-0",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: item.product_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [
                  "Quantity: ",
                  item.quantity,
                  " × €",
                  Number(item.price_at_purchase || 0).toFixed(2)
                ] }),
                item.product_specific_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [
                  "Note: ",
                  item.product_specific_notes
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-semibold text-gray-900", children: [
                "€",
                Number(item.subtotal || 0).toFixed(2)
              ] }) })
            ]
          },
          item.item_id
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t-2 border-gray-200 pt-6 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-gray-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "€",
              Number(order_details.subtotal || 0).toFixed(2)
            ] })
          ] }),
          Number(order_details.delivery_fee || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-gray-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Delivery Fee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "€",
              Number(order_details.delivery_fee || 0).toFixed(2)
            ] })
          ] }),
          Number(order_details.discount_amount || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-green-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Discount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "-€",
              Number(order_details.discount_amount || 0).toFixed(2)
            ] })
          ] }),
          Number(order_details.tax_amount || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-gray-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Tax" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "€",
              Number(order_details.tax_amount || 0).toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "€",
              Number(order_details.total_amount || 0).toFixed(2)
            ] })
          ] }),
          Number(order_details.loyalty_points_earned || 0) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Loyalty Points Earned" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold", children: [
              "+",
              Number(order_details.loyalty_points_earned || 0).toFixed(0),
              " points"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
        can_cancel_order && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleCancelClick,
            disabled: cancelMutation.isPending,
            className: "flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed",
            children: cancelMutation.isPending ? "Cancelling..." : "Cancel Order"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/",
            className: "flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center",
            children: "Back to Home"
          }
        ),
        currentUser && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/account?tab=orders",
            className: "flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-center",
            children: "View All Orders"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 bg-white rounded-xl shadow-lg p-6 lg:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900 mb-4", children: "Need Help?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: `tel:${order_details.customer_phone}`,
              className: "flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-10 h-10 rounded-full bg-blue-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-5 h-5 text-white" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Call Us" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: order_details.customer_phone })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: `mailto:${order_details.customer_email}`,
              className: "flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-10 h-10 rounded-full bg-blue-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-5 h-5 text-white" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Email Us" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: order_details.customer_email })
                ] })
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    showCancelModal && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50",
        onClick: handleCancelModalClose,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-white rounded-xl shadow-2xl max-w-md w-full p-6",
            onClick: (e) => e.stopPropagation(),
            role: "dialog",
            "aria-labelledby": "cancel-modal-title",
            "aria-describedby": "cancel-modal-description",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { id: "cancel-modal-title", className: "text-xl font-bold text-gray-900", children: "Cancel Order?" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleCancelModalClose,
                    className: "text-gray-400 hover:text-gray-600 transition-colors",
                    "aria-label": "Close modal",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { id: "cancel-modal-description", className: "text-gray-600 mb-4", children: [
                "Are you sure you want to cancel order ",
                order_details.order_number,
                "? This action cannot be undone."
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "cancel-reason", className: "block text-sm font-medium text-gray-700 mb-2", children: [
                  "Reason for cancellation ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    id: "cancel-reason",
                    value: cancelReason,
                    onChange: (e) => setCancelReason(e.target.value),
                    rows: 3,
                    required: true,
                    placeholder: "Please tell us why you're cancelling...",
                    className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleCancelModalClose,
                    disabled: cancelMutation.isPending,
                    className: "flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50",
                    children: "Keep Order"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: handleCancelConfirm,
                    disabled: cancelMutation.isPending || !cancelReason.trim(),
                    className: "flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed",
                    children: cancelMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }),
                      "Cancelling..."
                    ] }) : "Cancel Order"
                  }
                )
              ] })
            ]
          }
        )
      }
    )
  ] });
};
export {
  UV_OrderTracking as default
};
