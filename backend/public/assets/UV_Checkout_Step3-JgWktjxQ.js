import { f as useParams, g as useNavigate, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, L as Link, B as CircleCheckBig, D as Calendar, G as CreditCard, M as MapPin, h as Package, I as Gift, J as ArrowRight, b as axios } from "./index-nYaE10KP.js";
const fetchOrderDetails = async (order_id) => {
  const API_BASE_URL = "https://123build-an-online-web-application.launchpulse.ai";
  const response = await axios.get(
    `${API_BASE_URL}/api/orders/${order_id}`
  );
  const { items, ...orderData } = response.data;
  return {
    order: orderData,
    items: items || []
  };
};
const UV_Checkout_Step3 = () => {
  const { order_id } = useParams();
  const navigate = useNavigate();
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const isAuthenticated = useAppStore((state) => state.authentication_state.authentication_status.is_authenticated);
  const clearCart = useAppStore((state) => state.clear_cart);
  const [showSuccessAnimation, setShowSuccessAnimation] = reactExports.useState(false);
  const [accountCreated, setAccountCreated] = reactExports.useState(false);
  const {
    data: orderData,
    isLoading: orderLoading,
    error: orderError
  } = useQuery({
    queryKey: ["order-confirmation", order_id],
    queryFn: () => fetchOrderDetails(order_id),
    enabled: !!order_id,
    retry: 1,
    staleTime: 6e4,
    select: (data) => ({
      order: {
        ...data.order,
        subtotal: Number(data.order.subtotal || 0),
        delivery_fee: Number(data.order.delivery_fee || 0),
        discount_amount: Number(data.order.discount_amount || 0),
        tax_amount: Number(data.order.tax_amount || 0),
        total_amount: Number(data.order.total_amount || 0),
        loyalty_points_used: Number(data.order.loyalty_points_used || 0),
        loyalty_points_earned: Number(data.order.loyalty_points_earned || 0)
      },
      items: data.items.map((item) => ({
        ...item,
        price_at_purchase: Number(item.price_at_purchase || 0),
        quantity: Number(item.quantity || 0),
        subtotal: Number(item.subtotal || 0)
      }))
    })
  });
  const order = orderData == null ? void 0 : orderData.order;
  const orderItems = (orderData == null ? void 0 : orderData.items) || [];
  reactExports.useEffect(() => {
    if (!order_id) {
      navigate("/", { replace: true });
    }
  }, [order_id, navigate]);
  reactExports.useEffect(() => {
    if (order) {
      setShowSuccessAnimation(true);
      if (currentUser && order.user_id === currentUser.user_id) {
        const userCreatedAt = new Date(currentUser.created_at);
        const orderCreatedAt = new Date(order.created_at);
        const timeDiff = Math.abs(orderCreatedAt.getTime() - userCreatedAt.getTime());
        if (timeDiff < 6e4) {
          setAccountCreated(true);
        }
      }
      setTimeout(() => {
        clearCart();
      }, 100);
    }
  }, [order, clearCart, currentUser]);
  reactExports.useEffect(() => {
    if (orderError) {
      navigate("/", { replace: true });
    }
  }, [orderError, navigate]);
  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-IE", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  if (orderLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 text-lg font-medium", children: "Loading your order confirmation..." })
    ] }) }) });
  }
  if (!order) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-lg mb-4", children: "Order not found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all duration-200",
          children: "Return to Home"
        }
      )
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      showSuccessAnimation && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-16 h-16 text-green-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl lg:text-5xl font-bold text-gray-900 mb-4", children: "Order Confirmed!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl text-gray-700 mb-2", children: [
        "Thank you, ",
        order.customer_name,
        "!"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Your order has been successfully placed and confirmed." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 inline-block bg-white rounded-xl shadow-lg px-8 py-4 border-2 border-blue-500", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Order Number" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-bold text-blue-600", children: [
          "#",
          order.order_number
        ] })
      ] })
    ] }),
    accountCreated && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 bg-green-50 border-2 border-green-200 rounded-xl p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-6 h-6 text-green-600 mt-1 flex-shrink-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-green-900 mb-1", children: "Welcome to Kake!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-green-700", children: [
          "Your account has been created successfully. You can now log in with ",
          order.customer_email,
          " to track orders and earn loyalty points."
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-blue-800", children: [
      "Confirmation has been sent to ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: order.customer_email })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 lg:p-8 border-b border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-6", children: "Order Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-5 h-5 text-gray-400 mt-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Order Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-medium text-gray-900", children: formatDateTime(order.created_at) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "w-5 h-5 text-gray-400 mt-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Payment Method" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-medium text-gray-900", children: order.payment_method === "cash" ? "Cash on Delivery / Collection" : `${order.payment_method === "card" ? "Card" : order.payment_method} ending in ${order.card_last_four || "****"}` })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 lg:p-8 border-b border-gray-200 bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: order.fulfillment_method === "delivery" ? "Delivery Information" : "Collection Information" }),
        order.fulfillment_method === "delivery" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-5 h-5 text-blue-600 mt-1 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Delivery Address" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-medium text-gray-900", children: order.delivery_address_line1 }),
              order.delivery_address_line2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-gray-700", children: order.delivery_address_line2 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base text-gray-700", children: [
                order.delivery_city,
                ", ",
                order.delivery_postal_code
              ] }),
              order.delivery_instructions && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 mt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Instructions:" }),
                " ",
                order.delivery_instructions
              ] })
            ] })
          ] }),
          order.estimated_ready_time && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-100 border border-blue-200 rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800 font-medium", children: [
              "Estimated Delivery Time: ",
              formatTime(order.estimated_ready_time)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-700 mt-1", children: "We'll notify you when your order is out for delivery." })
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-5 h-5 text-blue-600 mt-1 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Pickup Location" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-medium text-gray-900", children: order.location_name })
            ] })
          ] }),
          order.estimated_ready_time && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-100 border border-green-200 rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-green-800 font-medium", children: [
              "Estimated Ready Time: ",
              formatTime(order.estimated_ready_time)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-700 mt-1", children: "We'll notify you when your order is ready for pickup." })
          ] }),
          order.collection_code && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white border-2 border-blue-500 rounded-xl p-6 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-2", children: "Your Collection Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-4xl font-bold text-blue-600 tracking-wider mb-3", children: order.collection_code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Show this code when picking up your order" })
          ] })
        ] }),
        order.special_instructions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-yellow-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Special Instructions:" }),
          " ",
          order.special_instructions
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 lg:p-8 border-b border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Order Items" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: orderItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start py-3 border-b border-gray-100 last:border-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-medium text-gray-900", children: item.product_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
              "Quantity: ",
              item.quantity
            ] }),
            item.product_specific_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500 mt-1 italic", children: [
              "Note: ",
              item.product_specific_notes
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right ml-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base font-medium text-gray-900", children: [
              "€",
              item.subtotal.toFixed(2)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
              "€",
              item.price_at_purchase.toFixed(2),
              " each"
            ] })
          ] })
        ] }, item.item_id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 lg:p-8 bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Price Summary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-gray-700", children: "Subtotal" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base font-medium text-gray-900", children: [
              "€",
              order.subtotal.toFixed(2)
            ] })
          ] }),
          order.delivery_fee > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-gray-700", children: "Delivery Fee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base font-medium text-gray-900", children: [
              "€",
              order.delivery_fee.toFixed(2)
            ] })
          ] }),
          order.delivery_fee === 0 && order.fulfillment_method === "delivery" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-green-700 font-medium", children: "Delivery Fee" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-medium text-green-700", children: "FREE" })
          ] }),
          order.discount_amount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base text-green-700", children: [
              "Discount",
              order.promo_code && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-sm font-medium", children: [
                "(",
                order.promo_code,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base font-medium text-green-700", children: [
              "-€",
              order.discount_amount.toFixed(2)
            ] })
          ] }),
          order.loyalty_points_used > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base text-purple-700", children: [
              "Loyalty Points Used (",
              order.loyalty_points_used,
              " points)"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-medium text-purple-700", children: "Included in discount" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center pt-3 border-t-2 border-gray-300", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-bold text-gray-900", children: "Total" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xl font-bold text-gray-900", children: [
              "€",
              order.total_amount.toFixed(2)
            ] })
          ] })
        ] })
      ] }),
      order.loyalty_points_earned > 0 && isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 lg:p-8 border-t border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "w-8 h-8 text-purple-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-lg font-semibold text-gray-900", children: [
            "You Earned ",
            order.loyalty_points_earned,
            " Loyalty Points!"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Points will be added to your account when your order is completed" })
        ] })
      ] }) }) })
    ] }),
    order.payment_method === "cash" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-50 border-2 border-amber-200 rounded-xl p-6 mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-amber-900 mb-2", children: "Cash Payment Required" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-amber-800", children: [
          "Please have ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
            "€",
            order.total_amount.toFixed(2)
          ] }),
          " ready in cash when your order is ",
          order.fulfillment_method === "delivery" ? "delivered" : "collected",
          ".",
          order.fulfillment_method === "delivery" && " The delivery person will collect payment upon arrival.",
          order.fulfillment_method === "collection" && " Payment is due when you collect your order."
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8 mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "What Happens Next?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: order.fulfillment_method === "collection" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-bold text-sm", children: "1" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 pt-1", children: "We'll start preparing your order right away" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-bold text-sm", children: "2" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-700 pt-1", children: [
            "You'll receive a notification when your order is ready for pickup at ",
            order.location_name
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-bold text-sm", children: "3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-700 pt-1", children: [
            "Show your collection code ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: order.collection_code }),
            " when picking up"
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-bold text-sm", children: "1" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 pt-1", children: "We'll start preparing your order right away" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-bold text-sm", children: "2" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 pt-1", children: "You'll receive a notification when your order is out for delivery" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-bold text-sm", children: "3" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-700 pt-1", children: [
            "Your order will be delivered to ",
            order.delivery_address_line1
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: `/orders/${order.order_id}`,
          className: "inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-5 h-5 mr-2" }),
            "Track Your Order"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/",
          className: "inline-flex items-center justify-center px-8 py-4 bg-gray-100 text-gray-900 rounded-xl font-semibold hover:bg-gray-200 border border-gray-300 transition-all duration-200",
          children: [
            "Continue Shopping",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-5 h-5 ml-2" })
          ]
        }
      )
    ] }),
    accountCreated && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/account",
        className: "text-blue-600 hover:text-blue-700 font-medium text-sm underline",
        children: "Set up your profile to save addresses and track orders →"
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
      "Need help with your order?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: `mailto:${order.customer_email}?subject=Order%20${order.order_number}%20Support`,
          className: "text-blue-600 hover:text-blue-700 font-medium underline",
          children: "Contact us"
        }
      )
    ] }) })
  ] }) }) });
};
export {
  UV_Checkout_Step3 as default
};
