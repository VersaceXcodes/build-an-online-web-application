import { k as useSearchParams, l as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, ae as Filter, C as Clock, d as CircleAlert, O as MessageSquare, E as EyeOff, D as Calendar, M as MapPin, v as Eye, o as ChevronLeft, i as ChevronRight, X, B as CircleCheckBig, N as Star, b as axios } from "./index-nYaE10KP.js";
import { u as useMutation } from "./useMutation-BdRga-lQ.js";
const fetchCustomerFeedback = async (token, filters) => {
  const params = {
    limit: filters.limit || 20,
    offset: filters.offset || 0,
    sort_by: "created_at",
    sort_order: "desc"
  };
  if (filters.reviewed_status) params.reviewed_status = filters.reviewed_status;
  if (filters.min_rating) params.min_rating = filters.min_rating;
  if (filters.max_rating) params.max_rating = filters.max_rating;
  if (filters.date_from) params.date_from = filters.date_from;
  if (filters.date_to) params.date_to = filters.date_to;
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/feedback/customer`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params
    }
  );
  return response.data;
};
const markFeedbackAsReviewed = async (token, feedback_id, data) => {
  const response = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/feedback/customer/${feedback_id}/review`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const toggleFeedbackVisibility = async (token, feedback_id, is_hidden) => {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/feedback/customer/${feedback_id}`,
    {
      feedback_id,
      is_hidden_from_staff: is_hidden
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const UV_AdminFeedbackCustomer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const reviewed_status = searchParams.get("reviewed_status") || null;
  const min_rating = searchParams.get("min_rating") ? Number(searchParams.get("min_rating")) : null;
  const max_rating = searchParams.get("max_rating") ? Number(searchParams.get("max_rating")) : null;
  const date_from = searchParams.get("date_from") || null;
  const date_to = searchParams.get("date_to") || null;
  const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;
  const [selected_feedback, set_selected_feedback] = reactExports.useState(null);
  const [detail_modal_open, set_detail_modal_open] = reactExports.useState(false);
  const [review_modal_open, set_review_modal_open] = reactExports.useState(false);
  const [review_form_data, set_review_form_data] = reactExports.useState({
    reviewed_status: "reviewed",
    notes: ""
  });
  const [filter_panel_open, set_filter_panel_open] = reactExports.useState(false);
  const [internal_note, set_internal_note] = reactExports.useState("");
  const [feedback_status, set_feedback_status] = reactExports.useState("pending_review");
  const limit = 20;
  const offset = (page - 1) * limit;
  const { data: feedback_data, isLoading: feedback_loading, error: feedback_error } = useQuery({
    queryKey: ["admin-customer-feedback", reviewed_status, min_rating, max_rating, date_from, date_to, offset],
    queryFn: () => fetchCustomerFeedback(authToken, {
      reviewed_status,
      min_rating,
      max_rating,
      date_from,
      date_to,
      limit,
      offset
    }),
    enabled: !!authToken,
    staleTime: 3e4
    // 30 seconds
  });
  const markReviewedMutation = useMutation({
    mutationFn: (data) => markFeedbackAsReviewed(authToken, data.feedback_id, {
      reviewed_status: data.reviewed_status,
      notes: data.notes
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-customer-feedback"] });
      showToast("success", "Feedback marked as reviewed");
      set_review_modal_open(false);
      set_detail_modal_open(false);
      set_selected_feedback(null);
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update feedback");
    }
  });
  const toggleVisibilityMutation = useMutation({
    mutationFn: (data) => toggleFeedbackVisibility(authToken, data.feedback_id, data.is_hidden),
    onSuccess: (updated_feedback) => {
      queryClient.invalidateQueries({ queryKey: ["admin-customer-feedback"] });
      showToast("success", updated_feedback.is_hidden_from_staff ? "Feedback hidden from staff" : "Feedback visible to staff");
      if ((selected_feedback == null ? void 0 : selected_feedback.feedback_id) === updated_feedback.feedback_id) {
        set_selected_feedback(updated_feedback);
      }
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update visibility");
    }
  });
  const feedback_items = (feedback_data == null ? void 0 : feedback_data.data) || [];
  const total_count = (feedback_data == null ? void 0 : feedback_data.total) || 0;
  const total_pages = Math.ceil(total_count / limit);
  const analytics = reactExports.useMemo(() => {
    if (!feedback_items.length) {
      return {
        average_overall: 0,
        average_product: 0,
        average_fulfillment: 0,
        rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        pending_count: 0,
        requires_attention_count: 0
      };
    }
    const avg_overall = feedback_items.reduce((sum, f) => sum + Number(f.overall_rating || 0), 0) / feedback_items.length;
    const avg_product = feedback_items.reduce((sum, f) => sum + Number(f.product_rating || 0), 0) / feedback_items.length;
    const avg_fulfillment = feedback_items.reduce((sum, f) => sum + Number(f.fulfillment_rating || 0), 0) / feedback_items.length;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedback_items.forEach((f) => {
      const rating = Number(f.overall_rating || 0);
      if (rating >= 1 && rating <= 5) {
        distribution[rating]++;
      }
    });
    const pending = feedback_items.filter((f) => f.reviewed_status === "pending_review").length;
    const attention = feedback_items.filter((f) => f.reviewed_status === "requires_attention").length;
    return {
      average_overall: avg_overall,
      average_product: avg_product,
      average_fulfillment: avg_fulfillment,
      rating_distribution: distribution,
      pending_count: pending,
      requires_attention_count: attention
    };
  }, [feedback_items]);
  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    params.delete("page");
    setSearchParams(params);
  };
  const handlePageChange = (new_page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(new_page));
    setSearchParams(params);
  };
  const handleOpenDetail = (feedback) => {
    set_selected_feedback(feedback);
    set_feedback_status(feedback.reviewed_status);
    set_internal_note("");
    set_detail_modal_open(true);
  };
  const handleCloseDetail = () => {
    set_detail_modal_open(false);
    set_selected_feedback(null);
    set_internal_note("");
    set_feedback_status("pending_review");
  };
  const handleOpenReview = (feedback) => {
    set_selected_feedback(feedback);
    set_review_form_data({
      reviewed_status: "reviewed",
      notes: ""
    });
    set_review_modal_open(true);
  };
  const handleSubmitReview = () => {
    if (!selected_feedback) return;
    markReviewedMutation.mutate({
      feedback_id: selected_feedback.feedback_id,
      reviewed_status: review_form_data.reviewed_status,
      notes: review_form_data.notes || void 0
    });
  };
  const handleToggleVisibility = (feedback) => {
    toggleVisibilityMutation.mutate({
      feedback_id: feedback.feedback_id,
      is_hidden: !feedback.is_hidden_from_staff
    });
  };
  const handleClearFilters = () => {
    setSearchParams({});
  };
  const handleSaveDetailChanges = () => {
    if (!selected_feedback) return;
    if (feedback_status !== selected_feedback.reviewed_status || internal_note.trim()) {
      markReviewedMutation.mutate({
        feedback_id: selected_feedback.feedback_id,
        reviewed_status: feedback_status,
        notes: internal_note.trim() || void 0
      });
    } else {
      handleCloseDetail();
    }
  };
  const renderStars = (rating) => {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-1", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Star,
      {
        className: `w-4 h-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`
      },
      star
    )) });
  };
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "pending_review":
        return "bg-yellow-100 text-yellow-800";
      case "reviewed":
        return "bg-green-100 text-green-800";
      case "requires_attention":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "pending_review":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" });
      case "reviewed":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4" });
      case "requires_attention":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4" });
      default:
        return null;
    }
  };
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-blue-600";
    if (rating >= 2.5) return "text-yellow-600";
    return "text-red-600";
  };
  const active_filter_count = [
    reviewed_status,
    min_rating,
    max_rating,
    date_from,
    date_to
  ].filter((f) => f !== null).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Customer Feedback" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Review and manage customer feedback to improve service quality" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => set_filter_panel_open(!filter_panel_open),
              className: "flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-5 h-5 text-gray-700" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: "Filters" }),
                active_filter_count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center", children: active_filter_count })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-600 font-medium", children: "Average Rating" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-3xl font-bold mt-1 ${getRatingColor(analytics.average_overall)}`, children: analytics.average_overall.toFixed(1) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-end", children: renderStars(Math.round(analytics.average_overall)) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-600 font-medium", children: "Product Rating" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-green-700 mt-1", children: analytics.average_product.toFixed(1) })
            ] }),
            renderStars(Math.round(analytics.average_product))
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-purple-600 font-medium", children: "Fulfillment Rating" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-purple-700 mt-1", children: analytics.average_fulfillment.toFixed(1) })
            ] }),
            renderStars(Math.round(analytics.average_fulfillment))
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-yellow-600 font-medium", children: "Pending Review" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-3xl font-bold text-yellow-700 mt-1", children: analytics.pending_count })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-8 h-8 text-yellow-600" })
          ] }) })
        ] })
      ] }) }),
      filter_panel_open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Filters" }),
          active_filter_count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleClearFilters,
              className: "text-sm text-blue-600 hover:text-blue-800 font-medium",
              children: "Clear all filters"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Review Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: reviewed_status || "",
                onChange: (e) => handleFilterChange("reviewed_status", e.target.value || null),
                className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Statuses" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending_review", children: "Pending Review" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "reviewed", children: "Reviewed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "requires_attention", children: "Requires Attention" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Minimum Rating" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: min_rating || "",
                onChange: (e) => handleFilterChange("min_rating", e.target.value ? Number(e.target.value) : null),
                className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Any Rating" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1", children: "1+ Stars" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "2", children: "2+ Stars" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "3", children: "3+ Stars" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "4", children: "4+ Stars" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "5", children: "5 Stars" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Maximum Rating" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: max_rating || "",
                onChange: (e) => handleFilterChange("max_rating", e.target.value ? Number(e.target.value) : null),
                className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Any Rating" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "1", children: "Up to 1 Star" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "2", children: "Up to 2 Stars" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "3", children: "Up to 3 Stars" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "4", children: "Up to 4 Stars" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "5", children: "Up to 5 Stars" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "From Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: date_from || "",
                onChange: (e) => handleFilterChange("date_from", e.target.value || null),
                className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "To Date" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "date",
                value: date_to || "",
                onChange: (e) => handleFilterChange("date_to", e.target.value || null),
                className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              }
            )
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
        feedback_loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" }) }),
        feedback_error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-12 h-12 text-red-600 mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-red-900 mb-2", children: "Failed to Load Feedback" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700", children: "Please try refreshing the page" })
        ] }),
        !feedback_loading && !feedback_error && feedback_items.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border-2 border-gray-200 p-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No Feedback Found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: active_filter_count > 0 ? "Try adjusting your filters to see more results" : "No customer feedback submitted yet" })
        ] }),
        !feedback_loading && !feedback_error && feedback_items.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: feedback_items.map((feedback) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "bg-white rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer",
            onClick: () => handleOpenDetail(feedback),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-4 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold text-gray-900", children: [
                        "Order #",
                        feedback.order_number || feedback.order_id.slice(0, 8)
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusBadgeColor(feedback.reviewed_status)}`, children: [
                        getStatusIcon(feedback.reviewed_status),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: feedback.reviewed_status === "pending_review" ? "Pending" : feedback.reviewed_status === "reviewed" ? "Reviewed" : "Needs Attention" })
                      ] }),
                      feedback.is_hidden_from_staff && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center space-x-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-3 h-3" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hidden from Staff" })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-600", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(feedback.created_at).toLocaleDateString() })
                      ] }),
                      feedback.location_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: feedback.location_name })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end space-y-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-600", children: "Overall:" }),
                      renderStars(Number(feedback.overall_rating || 0))
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-600", children: "Product:" }),
                      renderStars(Number(feedback.product_rating || 0))
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-600", children: "Service:" }),
                      renderStars(Number(feedback.fulfillment_rating || 0))
                    ] })
                  ] })
                ] }),
                feedback.overall_comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-700 text-sm line-clamp-2 mb-3", children: [
                  '"',
                  feedback.overall_comment,
                  '"'
                ] }),
                feedback.quick_tags && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: feedback.quick_tags.split(",").map((tag, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: "px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium",
                    children: tag.trim()
                  },
                  idx
                )) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col space-y-2 ml-4", children: [
                feedback.reviewed_status === "pending_review" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleOpenReview(feedback);
                    },
                    className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium",
                    children: "Mark Reviewed"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: (e) => {
                      e.stopPropagation();
                      handleToggleVisibility(feedback);
                    },
                    disabled: toggleVisibilityMutation.isPending,
                    className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center space-x-2",
                    children: feedback.is_hidden_from_staff ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Show" })
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hide" })
                    ] })
                  }
                )
              ] })
            ] })
          },
          feedback.feedback_id
        )) }),
        !feedback_loading && !feedback_error && total_pages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
            "Showing ",
            offset + 1,
            " to ",
            Math.min(offset + limit, total_count),
            " of ",
            total_count,
            " results"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handlePageChange(page - 1),
                disabled: page === 1,
                className: "p-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-5 h-5 text-gray-700" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700 font-medium", children: [
              "Page ",
              page,
              " of ",
              total_pages
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handlePageChange(page + 1),
                disabled: page === total_pages,
                className: "p-2 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-5 h-5 text-gray-700" })
              }
            )
          ] })
        ] })
      ] })
    ] }),
    detail_modal_open && selected_feedback && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-b border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-6 h-6 text-blue-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Feedback Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
              "Order #",
              selected_feedback.order_number || selected_feedback.order_id.slice(0, 8)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleCloseDetail,
            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6 text-gray-600" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-6 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-4 border-b border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${getStatusBadgeColor(selected_feedback.reviewed_status)}`, children: [
              getStatusIcon(selected_feedback.reviewed_status),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: selected_feedback.reviewed_status === "pending_review" ? "Pending Review" : selected_feedback.reviewed_status === "reviewed" ? "Reviewed" : "Requires Attention" })
            ] }),
            selected_feedback.is_hidden_from_staff && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hidden from Staff" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-600", children: [
            "Submitted ",
            new Date(selected_feedback.created_at).toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 rounded-lg p-4 border border-blue-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-600 font-medium mb-2", children: "Overall Rating" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              renderStars(Number(selected_feedback.overall_rating || 0)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-blue-700", children: Number(selected_feedback.overall_rating || 0).toFixed(1) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 rounded-lg p-4 border border-green-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-600 font-medium mb-2", children: "Product Quality" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              renderStars(Number(selected_feedback.product_rating || 0)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-green-700", children: Number(selected_feedback.product_rating || 0).toFixed(1) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-purple-50 rounded-lg p-4 border border-purple-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-purple-600 font-medium mb-2", children: "Service Quality" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              renderStars(Number(selected_feedback.fulfillment_rating || 0)),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-purple-700", children: Number(selected_feedback.fulfillment_rating || 0).toFixed(1) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          selected_feedback.overall_comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-2", children: "Overall Comment" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: selected_feedback.overall_comment })
          ] }),
          selected_feedback.product_comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-2", children: "Product Feedback" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: selected_feedback.product_comment })
          ] }),
          selected_feedback.fulfillment_comment && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-2", children: "Service Feedback" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700", children: selected_feedback.fulfillment_comment })
          ] })
        ] }),
        selected_feedback.quick_tags && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-2", children: "Quick Tags" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: selected_feedback.quick_tags.split(",").map((tag, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium",
              children: tag.trim()
            },
            idx
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: "Customer allows follow-up contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm font-semibold ${selected_feedback.allow_contact ? "text-green-600" : "text-gray-500"}`, children: selected_feedback.allow_contact ? "Yes" : "No" })
        ] }),
        selected_feedback.reviewed_at && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-green-50 rounded-lg p-4 border border-green-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-green-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-5 h-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium", children: [
            "Reviewed on ",
            new Date(selected_feedback.reviewed_at).toLocaleString()
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Admin Actions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Change status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: feedback_status,
                onChange: (e) => set_feedback_status(e.target.value),
                className: "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending_review", children: "Pending Review" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "reviewed", children: "Reviewed" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "requires_attention", children: "Requires Attention" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Add internal note" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: internal_note,
                onChange: (e) => set_internal_note(e.target.value),
                rows: 4,
                placeholder: "Add any internal notes about this feedback...",
                className: "w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              handleToggleVisibility(selected_feedback);
            },
            disabled: toggleVisibilityMutation.isPending,
            className: "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center space-x-2",
            children: selected_feedback.is_hidden_from_staff ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Show to Staff" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Hide from Staff" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleSaveDetailChanges,
              disabled: markReviewedMutation.isPending,
              className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed",
              children: markReviewedMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Saving..." })
              ] }) : "Save Changes"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleCloseDetail,
              className: "px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium",
              children: "Close"
            }
          )
        ] })
      ] })
    ] }) }),
    review_modal_open && selected_feedback && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-2xl max-w-2xl w-full p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Mark Feedback as Reviewed" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => set_review_modal_open(false),
            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6 text-gray-600" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Review Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: review_form_data.reviewed_status,
              onChange: (e) => set_review_form_data((prev) => ({
                ...prev,
                reviewed_status: e.target.value
              })),
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "reviewed", children: "Reviewed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "requires_attention", children: "Requires Attention" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Internal Notes (Optional)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: review_form_data.notes,
              onChange: (e) => set_review_form_data((prev) => ({ ...prev, notes: e.target.value })),
              rows: 4,
              placeholder: "Add any internal notes about this feedback...",
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end space-x-3 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => set_review_modal_open(false),
              className: "px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleSubmitReview,
              disabled: markReviewedMutation.isPending,
              className: "px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed",
              children: markReviewedMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Saving..." })
              ] }) : "Save Review"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
};
export {
  UV_AdminFeedbackCustomer as default
};
