import { ad as useLocation, h as useNavigate, l as useSearchParams, o as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, L as Link, a4 as Send, F as FileText, e as Shield, ae as Lightbulb, d as CircleAlert, a7 as TriangleAlert, af as Wrench, Y as TrendingUp, ag as Upload, Z as RefreshCw, ah as Filter, C as Clock, y as Eye, X, I as CircleCheckBig, b as axios } from "./index-HeRxKVXe.js";
import { u as useMutation } from "./useMutation-7uzCkorR.js";
const submitFeedback = async (payload, token) => {
  const response = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/feedback/staff`,
    payload,
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.data;
};
const fetchStaffFeedback = async (user_id, filters, token) => {
  const params = new URLSearchParams({
    submitted_by_user_id: user_id,
    limit: "20",
    offset: "0",
    sort_by: "created_at",
    sort_order: "desc"
  });
  if (filters.status !== "all") {
    params.append("status", filters.status);
  }
  if (filters.feedback_type !== "all") {
    params.append("feedback_type", filters.feedback_type);
  }
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/feedback/staff?${params.toString()}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const fetchFeedbackDetail = async (feedback_id, token) => {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/feedback/staff/${feedback_id}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const UV_StaffFeedbackSubmission = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const isMyFeedbackView = location.pathname.includes("/my-feedback");
  const [feedback_form_data, set_feedback_form_data] = reactExports.useState({
    location_name: "",
    feedback_type: "suggestion",
    title: "",
    description: "",
    priority: "medium",
    attachment_urls: [],
    is_anonymous: false
  });
  const [feedback_form_errors, set_feedback_form_errors] = reactExports.useState({});
  const [feedback_filters, set_feedback_filters] = reactExports.useState({
    status: searchParams.get("status") || "all",
    feedback_type: searchParams.get("feedback_type") || "all"
  });
  const [selected_feedback_id, set_selected_feedback_id] = reactExports.useState(null);
  const submit_feedback_mutation = useMutation({
    mutationFn: (payload) => {
      if (!authToken) throw new Error("No auth token");
      return submitFeedback(payload, authToken);
    },
    onSuccess: (data) => {
      set_feedback_form_data({
        location_name: "",
        feedback_type: "suggestion",
        title: "",
        description: "",
        priority: "medium",
        attachment_urls: [],
        is_anonymous: false
      });
      set_feedback_form_errors({});
      queryClient.invalidateQueries({ queryKey: ["staff-feedback"] });
      showToast("success", `Feedback submitted! Reference: ${data.reference_number}`);
      navigate("/staff/feedback/my-feedback");
    },
    onError: (error) => {
      var _a, _b;
      const error_message = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to submit feedback";
      showToast("error", error_message);
    }
  });
  const {
    data: feedback_list_data,
    isLoading: feedback_list_loading,
    refetch: refetch_feedback_list
  } = useQuery({
    queryKey: ["staff-feedback", currentUser == null ? void 0 : currentUser.user_id, feedback_filters],
    queryFn: () => {
      if (!(currentUser == null ? void 0 : currentUser.user_id) || !authToken) {
        throw new Error("Missing user or token");
      }
      return fetchStaffFeedback(currentUser.user_id, feedback_filters, authToken);
    },
    enabled: !!(currentUser == null ? void 0 : currentUser.user_id) && !!authToken && isMyFeedbackView,
    staleTime: 6e4,
    refetchOnWindowFocus: false
  });
  const submitted_feedback_list = (feedback_list_data == null ? void 0 : feedback_list_data.data) || [];
  const {
    data: selected_feedback_detail,
    isLoading: detail_loading
  } = useQuery({
    queryKey: ["staff-feedback-detail", selected_feedback_id],
    queryFn: () => {
      if (!selected_feedback_id || !authToken) {
        throw new Error("Missing feedback ID or token");
      }
      return fetchFeedbackDetail(selected_feedback_id, authToken);
    },
    enabled: !!selected_feedback_id && !!authToken,
    staleTime: 6e4
  });
  reactExports.useEffect(() => {
    if (feedback_form_data.feedback_type === "safety_concern" && feedback_form_data.priority !== "urgent") {
      set_feedback_form_data((prev) => ({
        ...prev,
        priority: "urgent"
      }));
    }
  }, [feedback_form_data.feedback_type, feedback_form_data.priority]);
  reactExports.useEffect(() => {
    const status = searchParams.get("status") || "all";
    const feedback_type = searchParams.get("feedback_type") || "all";
    set_feedback_filters({
      status,
      feedback_type
    });
  }, [searchParams]);
  const validate_form = () => {
    const errors = {};
    if (!feedback_form_data.location_name) {
      errors.location_name = "Location is required";
    }
    if (!feedback_form_data.title || feedback_form_data.title.trim().length < 1) {
      errors.title = "Title is required";
    } else if (feedback_form_data.title.length > 255) {
      errors.title = "Title must be 255 characters or less";
    }
    if (!feedback_form_data.description || feedback_form_data.description.trim().length < 1) {
      errors.description = "Description is required";
    } else if (feedback_form_data.description.length > 2e3) {
      errors.description = "Description must be 2000 characters or less";
    }
    set_feedback_form_errors(errors);
    return Object.keys(errors).length === 0;
  };
  const handle_submit = async (e) => {
    e.preventDefault();
    if (!validate_form()) {
      showToast("error", "Please fix the form errors");
      return;
    }
    if (!(currentUser == null ? void 0 : currentUser.user_id)) {
      showToast("error", "User not authenticated");
      return;
    }
    const payload = {
      submitted_by_user_id: currentUser.user_id,
      location_name: feedback_form_data.location_name,
      feedback_type: feedback_form_data.feedback_type,
      title: feedback_form_data.title,
      description: feedback_form_data.description,
      priority: feedback_form_data.priority,
      attachment_urls: feedback_form_data.attachment_urls.length > 0 ? feedback_form_data.attachment_urls.join(",") : null,
      is_anonymous: feedback_form_data.is_anonymous
    };
    submit_feedback_mutation.mutate(payload);
  };
  const handle_filter_change = (key, value) => {
    const new_params = new URLSearchParams(searchParams);
    if (value === "all") {
      new_params.delete(key);
    } else {
      new_params.set(key, value);
    }
    setSearchParams(new_params);
  };
  const open_detail_modal = (feedback_id) => {
    set_selected_feedback_id(feedback_id);
  };
  const close_detail_modal = () => {
    set_selected_feedback_id(null);
  };
  const get_feedback_type_icon = (type) => {
    switch (type) {
      case "suggestion":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Lightbulb, { className: "w-5 h-5" });
      case "complaint":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5" });
      case "safety_concern":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5" });
      case "equipment_issue":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Wrench, { className: "w-5 h-5" });
      case "process_improvement":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5" });
    }
  };
  const get_status_badge_color = (status) => {
    switch (status) {
      case "pending_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  const get_priority_badge_color = (priority) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-700";
      case "medium":
        return "bg-blue-100 text-blue-700";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "urgent":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };
  const format_date = (date_string) => {
    const date = new Date(date_string);
    return date.toLocaleDateString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  if (!currentUser) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Please log in to access staff feedback" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-blue-600 hover:text-blue-700 mt-2 inline-block", children: "Go to Login" })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Internal Staff Feedback" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mt-1", children: "Share suggestions, concerns, and feedback confidentially" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/staff/dashboard",
            className: "inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200",
            children: "Back to Dashboard"
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex -mb-px space-x-8", "aria-label": "Tabs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/staff/feedback/submit",
            className: `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${!isMyFeedbackView ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Submit Feedback" })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/staff/feedback/my-feedback",
            className: `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${isMyFeedbackView ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "My Feedback" }),
              submitted_feedback_list.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full", children: submitted_feedback_list.length })
            ] })
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: !isMyFeedbackView ? (
        /* ============================================================ */
        /* SUBMIT FEEDBACK FORM VIEW */
        /* ============================================================ */
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-3xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 border-b border-blue-100 px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-blue-900", children: "Confidential Feedback" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-700 mt-1", children: "Your feedback helps us improve. You can submit anonymously if preferred. Safety concerns are automatically flagged as urgent." })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handle_submit, className: "p-6 space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "location_name", className: "block text-sm font-semibold text-gray-900 mb-2", children: [
                "Location ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  id: "location_name",
                  value: feedback_form_data.location_name,
                  onChange: (e) => {
                    set_feedback_form_data((prev) => ({ ...prev, location_name: e.target.value }));
                    set_feedback_form_errors((prev) => ({ ...prev, location_name: "" }));
                  },
                  className: `w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-4 transition-all duration-200 ${feedback_form_errors.location_name ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select a location" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Blanchardstown", children: "Blanchardstown" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Tallaght", children: "Tallaght" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Glasnevin", children: "Glasnevin" })
                  ]
                }
              ),
              feedback_form_errors.location_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm mt-2", children: feedback_form_errors.location_name })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "feedback_type", className: "block text-sm font-semibold text-gray-900 mb-2", children: [
                "Feedback Type ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
                { value: "suggestion", label: "Suggestion", icon: Lightbulb, color: "blue" },
                { value: "complaint", label: "Complaint", icon: CircleAlert, color: "orange" },
                { value: "safety_concern", label: "Safety Concern", icon: TriangleAlert, color: "red" },
                { value: "equipment_issue", label: "Equipment Issue", icon: Wrench, color: "purple" },
                { value: "process_improvement", label: "Process Improvement", icon: TrendingUp, color: "green" }
              ].map((type) => {
                const Icon = type.icon;
                const is_selected = feedback_form_data.feedback_type === type.value;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    onClick: () => set_feedback_form_data((prev) => ({
                      ...prev,
                      feedback_type: type.value
                    })),
                    className: `flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${is_selected ? `border-${type.color}-500 bg-${type.color}-50 text-${type.color}-900` : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `w-5 h-5 ${is_selected ? `text-${type.color}-600` : "text-gray-400"}` }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-sm", children: type.label })
                    ]
                  },
                  type.value
                );
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "title", className: "block text-sm font-semibold text-gray-900 mb-2", children: [
                "Title ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "title",
                  type: "text",
                  value: feedback_form_data.title,
                  onChange: (e) => {
                    set_feedback_form_data((prev) => ({ ...prev, title: e.target.value }));
                    set_feedback_form_errors((prev) => ({ ...prev, title: "" }));
                  },
                  placeholder: "Brief summary of your feedback",
                  className: `w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-4 transition-all duration-200 ${feedback_form_errors.title ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}`,
                  maxLength: 255
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mt-2", children: [
                feedback_form_errors.title && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm", children: feedback_form_errors.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-500 text-xs ml-auto", children: [
                  feedback_form_data.title.length,
                  "/255 characters"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "description", className: "block text-sm font-semibold text-gray-900 mb-2", children: [
                "Description ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  id: "description",
                  value: feedback_form_data.description,
                  onChange: (e) => {
                    set_feedback_form_data((prev) => ({ ...prev, description: e.target.value }));
                    set_feedback_form_errors((prev) => ({ ...prev, description: "" }));
                  },
                  placeholder: "Provide detailed information about your feedback",
                  rows: 6,
                  className: `w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-4 transition-all duration-200 ${feedback_form_errors.description ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}`,
                  maxLength: 2e3
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mt-2", children: [
                feedback_form_errors.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm", children: feedback_form_errors.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-500 text-xs ml-auto", children: [
                  feedback_form_data.description.length,
                  "/2000 characters"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "priority", className: "block text-sm font-semibold text-gray-900 mb-2", children: "Priority Level" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [
                { value: "low", label: "Low" },
                { value: "medium", label: "Medium" },
                { value: "high", label: "High" },
                { value: "urgent", label: "Urgent" }
              ].map((priority) => {
                const is_selected = feedback_form_data.priority === priority.value;
                const is_disabled = feedback_form_data.feedback_type === "safety_concern" && priority.value !== "urgent";
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    disabled: is_disabled,
                    onClick: () => set_feedback_form_data((prev) => ({
                      ...prev,
                      priority: priority.value
                    })),
                    className: `px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all duration-200 ${is_disabled ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400" : is_selected ? `${get_priority_badge_color(priority.value)} border-current` : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"}`,
                    children: priority.label
                  },
                  priority.value
                );
              }) }),
              feedback_form_data.feedback_type === "safety_concern" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-orange-600 mt-2 flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Safety concerns are automatically set to Urgent priority" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-2", children: "Attachments (Optional)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-8 h-8 text-gray-400 mx-auto mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-1", children: "File upload functionality coming soon" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "For now, please include file URLs in the description if needed" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start space-x-3 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: feedback_form_data.is_anonymous,
                  onChange: (e) => set_feedback_form_data((prev) => ({
                    ...prev,
                    is_anonymous: e.target.checked
                  })),
                  className: "mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-4 focus:ring-blue-100"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-gray-900 block", children: "Submit Anonymously" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Your identity will be hidden from admin view, but an audit trail is preserved for system integrity. This ensures confidentiality while maintaining accountability." })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end space-x-4 pt-4 border-t border-gray-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: () => {
                    set_feedback_form_data({
                      location_name: "",
                      feedback_type: "suggestion",
                      title: "",
                      description: "",
                      priority: "medium",
                      attachment_urls: [],
                      is_anonymous: false
                    });
                    set_feedback_form_errors({});
                  },
                  className: "px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200",
                  children: "Clear Form"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "submit",
                  disabled: submit_feedback_mutation.isPending,
                  className: "px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2",
                  children: submit_feedback_mutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-5 h-5 animate-spin" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Submitting..." })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-5 h-5" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Submit Feedback" })
                  ] })
                }
              )
            ] })
          ] })
        ] }) })
      ) : (
        /* ============================================================ */
        /* MY FEEDBACK LIST VIEW */
        /* ============================================================ */
        /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow border border-gray-200 p-4 mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-5 h-5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Filters" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => refetch_feedback_list(),
                  className: "text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-4 h-4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Refresh" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "status-filter", className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    id: "status-filter",
                    value: feedback_filters.status,
                    onChange: (e) => handle_filter_change("status", e.target.value),
                    className: "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Statuses" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending_review", children: "Pending Review" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "under_review", children: "Under Review" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_progress", children: "In Progress" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "resolved", children: "Resolved" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "closed", children: "Closed" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "type-filter", className: "block text-sm font-medium text-gray-700 mb-2", children: "Feedback Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    id: "type-filter",
                    value: feedback_filters.feedback_type,
                    onChange: (e) => handle_filter_change("feedback_type", e.target.value),
                    className: "w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Types" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "suggestion", children: "Suggestion" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "complaint", children: "Complaint" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "safety_concern", children: "Safety Concern" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "equipment_issue", children: "Equipment Issue" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "process_improvement", children: "Process Improvement" })
                    ]
                  }
                )
              ] })
            ] })
          ] }),
          feedback_list_loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading feedback..." })
          ] }) }) : submitted_feedback_list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow border border-gray-200 p-12 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-16 h-16 text-gray-300 mx-auto mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No feedback found" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: feedback_filters.status !== "all" || feedback_filters.feedback_type !== "all" ? "Try adjusting your filters" : "You haven't submitted any feedback yet" }),
            feedback_filters.status === "all" && feedback_filters.feedback_type === "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: "/staff/feedback/submit",
                className: "inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-5 h-5 mr-2" }),
                  "Submit Your First Feedback"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: submitted_feedback_list.map((feedback) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-4 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: get_feedback_type_icon(feedback.feedback_type) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: feedback.title }),
                        feedback.is_anonymous && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3 h-3 mr-1" }),
                          "Anonymous"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 line-clamp-2", children: feedback.description })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end space-y-2 ml-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${get_status_badge_color(feedback.status)}`, children: feedback.status.replace(/_/g, " ") }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-1 rounded text-xs font-medium ${get_priority_badge_color(feedback.priority)}`, children: feedback.priority })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-4 border-t border-gray-200", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-500", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center space-x-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: format_date(feedback.created_at) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-700", children: feedback.reference_number }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs", children: feedback.location_name })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => open_detail_modal(feedback.feedback_id),
                      className: "inline-flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-medium text-sm transition-colors duration-200",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 mr-2" }),
                        "View Details"
                      ]
                    }
                  )
                ] })
              ]
            },
            feedback.feedback_id
          )) })
        ] })
      ) })
    ] }),
    selected_feedback_id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Feedback Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: close_detail_modal,
            className: "text-gray-400 hover:text-gray-600 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: detail_loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-8 h-8 text-blue-600 animate-spin" }) }) : selected_feedback_detail ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: get_feedback_type_icon(selected_feedback_detail.feedback_type) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2", children: selected_feedback_detail.title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: selected_feedback_detail.reference_number }),
                selected_feedback_detail.is_anonymous && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3 h-3 mr-1" }),
                  "Anonymous"
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${get_status_badge_color(selected_feedback_detail.status)}`, children: selected_feedback_detail.status.replace(/_/g, " ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-1 rounded text-xs font-medium ${get_priority_badge_color(selected_feedback_detail.priority)}`, children: selected_feedback_detail.priority })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-900", children: selected_feedback_detail.location_name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-900 capitalize", children: selected_feedback_detail.feedback_type.replace(/_/g, " ") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Submitted" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-900", children: format_date(selected_feedback_detail.created_at) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 uppercase font-medium mb-1", children: "Last Updated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-gray-900", children: format_date(selected_feedback_detail.updated_at) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-2", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-wrap", children: selected_feedback_detail.description }) })
        ] }),
        selected_feedback_detail.resolution_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-semibold text-gray-900 mb-2 flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4 text-green-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Resolution Notes" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 rounded-lg p-4 border border-green-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-wrap", children: selected_feedback_detail.resolution_notes }),
            selected_feedback_detail.resolved_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-green-700 mt-2", children: [
              "Resolved on ",
              format_date(selected_feedback_detail.resolved_at)
            ] })
          ] })
        ] }),
        selected_feedback_detail.assigned_to_user_id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 rounded-lg p-4 border border-blue-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Assigned to:" }),
          " Admin Team Member"
        ] }) })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Failed to load feedback details" }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: close_detail_modal,
          className: "px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200",
          children: "Close"
        }
      ) })
    ] }) })
  ] });
};
export {
  UV_StaffFeedbackSubmission as default
};
