import { h as useNavigate, g as useParams, l as useSearchParams, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, p as LoaderCircle, d as CircleAlert, L as Link, I as CircleCheckBig, a2 as ArrowLeft, V as Star, b as axios } from "./index-i76FChob.js";
import { u as useMutation } from "./useMutation-vNQrkO0c.js";
const POSITIVE_TAGS = [
  "Fresh",
  "Delicious",
  "Great Value",
  "Fast Service",
  "Friendly Staff",
  "Perfect Packaging"
];
const NEGATIVE_TAGS = [
  "Late",
  "Wrong Item",
  "Poor Quality",
  "Cold",
  "Missing Items",
  "Damaged"
];
const fetchOrderForFeedback = async (order_id, token, auth_token) => {
  const api_base_url = "https://123build-an-online-web-application.launchpulse.ai";
  const config = {
    params: token ? { token } : void 0
  };
  if (auth_token) {
    config.headers = {
      Authorization: `Bearer ${auth_token}`
    };
  }
  const response = await axios.get(
    `${api_base_url}/api/orders/${order_id}`,
    config
  );
  const order = response.data;
  const eligible_statuses = ["completed", "delivered", "collected"];
  if (!eligible_statuses.includes(order.order_status)) {
    throw new Error("Order must be completed to submit feedback");
  }
  if (order.feedback_submitted === true) {
    throw new Error("Feedback already submitted for this order");
  }
  return order;
};
const submitFeedback = async (payload, auth_token) => {
  const api_base_url = "https://123build-an-online-web-application.launchpulse.ai";
  const config = {};
  if (auth_token) {
    config.headers = {
      Authorization: `Bearer ${auth_token}`
    };
  }
  const response = await axios.post(
    `${api_base_url}/api/feedback/customer`,
    payload,
    config
  );
  return response.data;
};
const StarRating = ({ rating, onRatingChange, label, required = false }) => {
  const [hover, setHover] = reactExports.useState(0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-900", children: [
      label,
      required && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 ml-1", children: "*" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
      [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onRatingChange(star),
          onMouseEnter: () => setHover(star),
          onMouseLeave: () => setHover(0),
          className: "focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-transform hover:scale-110",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Star,
            {
              className: `w-8 h-8 transition-colors ${star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-300"}`
            }
          )
        },
        star
      )),
      rating > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-sm text-gray-600 font-medium", children: [
        rating,
        " / 5"
      ] })
    ] })
  ] });
};
const QuickTagButton = ({ tag, selected, onToggle }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      type: "button",
      onClick: () => onToggle(tag),
      className: `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${selected ? "bg-blue-600 text-white shadow-md" : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"}`,
      children: tag
    }
  );
};
const UV_FeedbackForm = () => {
  var _a, _b;
  const navigate = useNavigate();
  const { order_id } = useParams();
  const [searchParams] = useSearchParams();
  const secure_token = searchParams.get("token");
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const [overall_rating, set_overall_rating] = reactExports.useState(0);
  const [product_rating, set_product_rating] = reactExports.useState(0);
  const [fulfillment_rating, set_fulfillment_rating] = reactExports.useState(0);
  const [product_comment, set_product_comment] = reactExports.useState("");
  const [fulfillment_comment, set_fulfillment_comment] = reactExports.useState("");
  const [overall_comment, set_overall_comment] = reactExports.useState("");
  const [selected_quick_tags, set_selected_quick_tags] = reactExports.useState([]);
  const [allow_contact, set_allow_contact] = reactExports.useState(false);
  const [submission_success, set_submission_success] = reactExports.useState(false);
  const [bonus_points_awarded] = reactExports.useState(25);
  const {
    data: order_details,
    isLoading: order_loading,
    error: order_error
  } = useQuery({
    queryKey: ["order-feedback", order_id, secure_token],
    queryFn: () => fetchOrderForFeedback(order_id, secure_token, authToken),
    enabled: !!order_id,
    retry: 1,
    staleTime: 0
    // Don't cache, always fresh check
  });
  const submit_mutation = useMutation({
    mutationFn: (payload) => submitFeedback(payload, authToken),
    onSuccess: () => {
      set_submission_success(true);
      showToast(
        "success",
        `Feedback submitted! You earned +${bonus_points_awarded} loyalty points`
      );
      setTimeout(() => {
        if (currentUser) {
          navigate("/account?tab=feedback");
        } else {
          navigate(`/orders/${order_id}`);
        }
      }, 3e3);
    },
    onError: (error) => {
      var _a2, _b2;
      const error_message = ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || error.message || "Failed to submit feedback. Please try again.";
      showToast("error", error_message);
    }
  });
  const handle_submit = (e) => {
    e.preventDefault();
    if (overall_rating === 0 || product_rating === 0 || fulfillment_rating === 0) {
      showToast("error", "Please provide all three ratings");
      return;
    }
    const payload = {
      order_id,
      user_id: (currentUser == null ? void 0 : currentUser.user_id) || null,
      overall_rating,
      product_rating,
      fulfillment_rating,
      product_comment: product_comment.trim() || null,
      fulfillment_comment: fulfillment_comment.trim() || null,
      overall_comment: overall_comment.trim() || null,
      quick_tags: selected_quick_tags.length > 0 ? selected_quick_tags.join(",") : null,
      allow_contact
    };
    submit_mutation.mutate(payload);
  };
  const toggle_quick_tag = (tag) => {
    set_selected_quick_tags(
      (prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };
  reactExports.useEffect(() => {
    if (order_error) {
      const error_message = order_error.message || "Failed to load order";
      if (error_message.includes("already submitted")) {
        showToast("info", "Feedback already submitted for this order");
        setTimeout(() => {
          navigate(currentUser ? "/account?tab=feedback" : "/");
        }, 2e3);
      } else if (error_message.includes("must be completed")) {
        showToast("error", "Can only submit feedback for completed orders");
        setTimeout(() => {
          navigate("/");
        }, 2e3);
      } else {
        showToast("error", "Order not found");
        setTimeout(() => {
          navigate("/");
        }, 2e3);
      }
    }
  }, [order_error, navigate, currentUser, showToast]);
  if (order_loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-lg", children: "Loading order details..." })
    ] }) });
  }
  if (order_error || !order_details) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8 max-w-md w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-16 h-16 text-red-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 text-center mb-2", children: "Unable to Load Order" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-center mb-6", children: (order_error == null ? void 0 : order_error.message) || "Order not found or invalid" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors",
          children: "Return Home"
        }
      )
    ] }) });
  }
  if (submission_success) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 animate-bounce", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-20 h-20 text-green-600 mx-auto" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold text-gray-900 mb-4", children: "Thank You!" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-lg mb-6", children: "Your feedback has been submitted successfully" }),
      currentUser && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-blue-900 font-semibold text-lg", children: [
          "+",
          bonus_points_awarded,
          " Loyalty Points Earned!"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-700 text-sm mt-1", children: "Thank you for taking the time to share your feedback" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm", children: "Redirecting you back in a moment..." })
    ] }) });
  }
  const is_form_valid = overall_rating > 0 && product_rating > 0 && fulfillment_rating > 0;
  const is_submitting = submit_mutation.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: currentUser ? "/account?tab=orders" : `/orders/${order_id}`,
          className: "inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }),
            "Back to Order"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-2", children: "Share Your Experience" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-lg", children: "Help us improve by sharing your feedback" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: [
          "Order ",
          order_details.order_number
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600 text-sm", children: [
          order_details.location_name,
          " • ",
          order_details.fulfillment_method === "delivery" ? "Delivery" : "Collection"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-500 text-sm mt-1", children: [
          "Completed: ",
          new Date(order_details.completed_at || order_details.created_at).toLocaleDateString("en-IE", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [
          "€",
          Number(order_details.total_amount || 0).toFixed(2)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-500 text-sm", children: [
          ((_a = order_details.items) == null ? void 0 : _a.length) || 0,
          " item",
          ((_b = order_details.items) == null ? void 0 : _b.length) !== 1 ? "s" : ""
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handle_submit, className: "bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3", children: "Rate Your Experience" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StarRating,
          {
            rating: overall_rating,
            onRatingChange: set_overall_rating,
            label: "Overall Experience",
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StarRating,
          {
            rating: product_rating,
            onRatingChange: set_product_rating,
            label: "Product Quality",
            required: true
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          StarRating,
          {
            rating: fulfillment_rating,
            onRatingChange: set_fulfillment_rating,
            label: order_details.fulfillment_method === "delivery" ? "Delivery Service" : "Collection Service",
            required: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3", children: [
          "Tell Us More",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-gray-500 ml-2", children: "(Optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "product_comment", className: "block text-sm font-medium text-gray-900 mb-2", children: "How were the products?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "product_comment",
              value: product_comment,
              onChange: (e) => set_product_comment(e.target.value),
              maxLength: 1e3,
              rows: 3,
              placeholder: "Tell us about the taste, freshness, presentation...",
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1 text-right", children: [
            product_comment.length,
            " / 1000"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "fulfillment_comment", className: "block text-sm font-medium text-gray-900 mb-2", children: [
            "How was the ",
            order_details.fulfillment_method === "delivery" ? "delivery" : "collection",
            " experience?"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "fulfillment_comment",
              value: fulfillment_comment,
              onChange: (e) => set_fulfillment_comment(e.target.value),
              maxLength: 1e3,
              rows: 3,
              placeholder: order_details.fulfillment_method === "delivery" ? "Tell us about the delivery time, driver, packaging..." : "Tell us about the pickup process, wait time, staff...",
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1 text-right", children: [
            fulfillment_comment.length,
            " / 1000"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "overall_comment", className: "block text-sm font-medium text-gray-900 mb-2", children: "Any other comments?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "overall_comment",
              value: overall_comment,
              onChange: (e) => set_overall_comment(e.target.value),
              maxLength: 1e3,
              rows: 4,
              placeholder: "Share any additional thoughts about your experience...",
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1 text-right", children: [
            overall_comment.length,
            " / 1000"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-bold text-gray-900 border-b border-gray-200 pb-3", children: [
          "Quick Feedback Tags",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-normal text-gray-500 ml-2", children: "(Optional)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700 mb-3", children: "What did you love?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: POSITIVE_TAGS.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              QuickTagButton,
              {
                tag,
                selected: selected_quick_tags.includes(tag),
                onToggle: toggle_quick_tag
              },
              tag
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700 mb-3", children: "What could be improved?" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: NEGATIVE_TAGS.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              QuickTagButton,
              {
                tag,
                selected: selected_quick_tags.includes(tag),
                onToggle: toggle_quick_tag
              },
              tag
            )) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 rounded-lg p-6 border border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start cursor-pointer", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            checked: allow_contact,
            onChange: (e) => set_allow_contact(e.target.checked),
            className: "mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Allow us to contact you about your feedback" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: "We may reach out to better understand your experience and resolve any issues" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6 border-t border-gray-200", children: [
        !is_form_valid && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-600 mb-4 text-center", children: "Please provide all three ratings to submit your feedback" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: !is_form_valid || is_submitting,
            className: "w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:hover:shadow-lg",
            children: is_submitting ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 animate-spin mr-2" }),
              "Submitting Feedback..."
            ] }) : "Submit Feedback"
          }
        ),
        currentUser && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-sm text-green-700 font-medium mt-4", children: [
          "🎁 You'll earn +",
          bonus_points_awarded,
          " loyalty points for your feedback!"
        ] })
      ] })
    ] })
  ] }) }) });
};
export {
  UV_FeedbackForm as default
};
