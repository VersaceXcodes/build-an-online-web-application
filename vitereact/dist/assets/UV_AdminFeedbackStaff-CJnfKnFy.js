import { u as useAppStore, l as useSearchParams, r as reactExports, o as useQueryClient, a as useQuery, j as jsxRuntimeExports, L as Link, ah as Filter, M as MapPin, aB as Flag, J as Calendar, a7 as TriangleAlert, W as MessageSquare, G as User, C as Clock, y as Eye, aC as PenLine, X, B as CircleCheck, a4 as Send, b as axios } from "./index-CwVo5_So.js";
import { u as useMutation } from "./useMutation-HzYQCpti.js";
const fetchStaffFeedback = async (filters, token) => {
  const params = new URLSearchParams();
  if (filters.location_name) params.append("location_name", filters.location_name);
  if (filters.feedback_type) params.append("feedback_type", filters.feedback_type);
  if (filters.status) params.append("status", filters.status);
  if (filters.priority) params.append("priority", filters.priority);
  if (filters.date_from) params.append("date_from", filters.date_from);
  if (filters.date_to) params.append("date_to", filters.date_to);
  params.append("limit", "20");
  params.append("offset", "0");
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/feedback/staff?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const fetchFeedbackDetails = async (feedback_id, token) => {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/feedback/staff/${feedback_id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const updateFeedbackStatus = async (payload, token) => {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/feedback/staff/${payload.feedback_id}`,
    payload,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const UV_AdminFeedbackStaff = () => {
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const [searchParams, setSearchParams] = useSearchParams();
  const [feedbackFilters, setFeedbackFilters] = reactExports.useState({
    location_name: searchParams.get("location_name") || null,
    feedback_type: searchParams.get("feedback_type") || null,
    status: searchParams.get("status") || null,
    priority: searchParams.get("priority") || null,
    date_from: searchParams.get("date_from") || null,
    date_to: searchParams.get("date_to") || null
  });
  const [selectedFeedbackId, setSelectedFeedbackId] = reactExports.useState(null);
  const [detailModalOpen, setDetailModalOpen] = reactExports.useState(false);
  const [statusModalOpen, setStatusModalOpen] = reactExports.useState(false);
  const [responseModalOpen, setResponseModalOpen] = reactExports.useState(false);
  const [statusUpdateForm, setStatusUpdateForm] = reactExports.useState({
    status: "pending_review",
    priority: "medium",
    assigned_to_user_id: null,
    resolution_notes: null
  });
  const [responseFormData, setResponseFormData] = reactExports.useState({
    response_text: "",
    is_internal_note: false
  });
  const [filterPanelOpen, setFilterPanelOpen] = reactExports.useState(false);
  const queryClient = useQueryClient();
  const { data: feedbackList, isLoading, error } = useQuery({
    queryKey: ["staff-feedback", feedbackFilters],
    queryFn: () => fetchStaffFeedback(feedbackFilters, authToken || ""),
    enabled: !!authToken,
    staleTime: 3e4
    // 30 seconds
  });
  const { data: selectedFeedback } = useQuery({
    queryKey: ["staff-feedback-detail", selectedFeedbackId],
    queryFn: () => fetchFeedbackDetails(selectedFeedbackId, authToken || ""),
    enabled: !!selectedFeedbackId && !!authToken
  });
  reactExports.useEffect(() => {
    if (selectedFeedback) {
      setStatusUpdateForm({
        status: selectedFeedback.status,
        priority: selectedFeedback.priority,
        assigned_to_user_id: selectedFeedback.assigned_to_user_id,
        resolution_notes: selectedFeedback.resolution_notes
      });
    }
  }, [selectedFeedback]);
  const updateMutation = useMutation({
    mutationFn: (payload) => updateFeedbackStatus(payload, authToken || ""),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["staff-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["staff-feedback-detail", data.feedback_id] });
      showToast("success", "Feedback updated successfully");
      setStatusModalOpen(false);
      setDetailModalOpen(false);
    },
    onError: (error2) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error2.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update feedback");
    }
  });
  reactExports.useEffect(() => {
    const newParams = new URLSearchParams();
    if (feedbackFilters.location_name) newParams.set("location_name", feedbackFilters.location_name);
    if (feedbackFilters.feedback_type) newParams.set("feedback_type", feedbackFilters.feedback_type);
    if (feedbackFilters.status) newParams.set("status", feedbackFilters.status);
    if (feedbackFilters.priority) newParams.set("priority", feedbackFilters.priority);
    if (feedbackFilters.date_from) newParams.set("date_from", feedbackFilters.date_from);
    if (feedbackFilters.date_to) newParams.set("date_to", feedbackFilters.date_to);
    setSearchParams(newParams, { replace: true });
  }, [feedbackFilters, setSearchParams]);
  const handleFilterChange = (key, value) => {
    setFeedbackFilters((prev) => ({ ...prev, [key]: value }));
  };
  const handleClearFilters = () => {
    setFeedbackFilters({
      location_name: null,
      feedback_type: null,
      status: null,
      priority: null,
      date_from: null,
      date_to: null
    });
  };
  const handleViewDetails = (feedback_id) => {
    setSelectedFeedbackId(feedback_id);
    setDetailModalOpen(true);
    const feedback = feedbackList == null ? void 0 : feedbackList.data.find((f) => f.feedback_id === feedback_id);
    if (feedback) {
      setStatusUpdateForm({
        status: feedback.status,
        priority: feedback.priority,
        assigned_to_user_id: feedback.assigned_to_user_id,
        resolution_notes: feedback.resolution_notes
      });
    }
  };
  const handleOpenStatusModal = (feedback) => {
    setSelectedFeedbackId(feedback.feedback_id);
    setStatusUpdateForm({
      status: feedback.status,
      priority: feedback.priority,
      assigned_to_user_id: feedback.assigned_to_user_id,
      resolution_notes: feedback.resolution_notes
    });
    setStatusModalOpen(true);
  };
  const handleUpdateStatus = () => {
    if (!selectedFeedbackId) return;
    updateMutation.mutate({
      feedback_id: selectedFeedbackId,
      ...statusUpdateForm
    });
  };
  const handleAddResponse = () => {
    if (!selectedFeedback || !responseFormData.response_text.trim()) {
      showToast("error", "Please enter a response");
      return;
    }
    const updatedNotes = selectedFeedback.resolution_notes ? `${selectedFeedback.resolution_notes}

--- Admin Response (${(/* @__PURE__ */ new Date()).toLocaleDateString()}) ---
${responseFormData.response_text}` : `--- Admin Response (${(/* @__PURE__ */ new Date()).toLocaleDateString()}) ---
${responseFormData.response_text}`;
    updateMutation.mutate({
      feedback_id: selectedFeedback.feedback_id,
      resolution_notes: updatedNotes,
      status: "under_review"
      // Move to under_review when responding
    });
    setResponseFormData({ response_text: "", is_internal_note: false });
    setResponseModalOpen(false);
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "pending_review":
        return "bg-red-100 text-red-800";
      case "under_review":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const getTypeIcon = (type) => {
    switch (type) {
      case "safety_concern":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-red-600" });
      case "equipment_issue":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-orange-600" });
      case "complaint":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-5 h-5 text-yellow-600" });
      case "suggestion":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-5 h-5 text-blue-600" });
      case "process_improvement":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-5 h-5 text-green-600" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-5 h-5 text-gray-600" });
    }
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const formatTypeLabel = (type) => {
    return type.split("_").map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };
  const formatStatusLabel = (status) => {
    return status.split("_").map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/admin/dashboard",
              className: "text-gray-600 hover:text-gray-900 transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 19l-7-7 7-7" }) })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Staff Feedback Management" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mt-1", children: "Review and respond to internal staff feedback and concerns" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-600", children: [
            (feedbackList == null ? void 0 : feedbackList.total) || 0,
            " total feedback items"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setFilterPanelOpen(!filterPanelOpen),
              className: "px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-5 h-5" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Filters" })
              ]
            }
          )
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
        filterPanelOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Filter Feedback" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleClearFilters,
                className: "text-sm text-blue-600 hover:text-blue-700 font-medium",
                children: "Clear All Filters"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4 inline mr-1" }),
                "Location"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: feedbackFilters.location_name || "",
                  onChange: (e) => handleFilterChange("location_name", e.target.value || null),
                  className: "w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Feedback Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: feedbackFilters.feedback_type || "",
                  onChange: (e) => handleFilterChange("feedback_type", e.target.value || null),
                  className: "w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Types" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "suggestion", children: "Suggestion" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "complaint", children: "Complaint" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "safety_concern", children: "Safety Concern" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "equipment_issue", children: "Equipment Issue" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "process_improvement", children: "Process Improvement" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: feedbackFilters.status || "",
                  onChange: (e) => handleFilterChange("status", e.target.value || null),
                  className: "w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Statuses" }),
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
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Flag, { className: "w-4 h-4 inline mr-1" }),
                "Priority"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: feedbackFilters.priority || "",
                  onChange: (e) => handleFilterChange("priority", e.target.value || null),
                  className: "w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Priorities" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "urgent", children: "Urgent" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "high", children: "High" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "medium", children: "Medium" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low", children: "Low" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 inline mr-1" }),
                "From Date"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: feedbackFilters.date_from || "",
                  onChange: (e) => handleFilterChange("date_from", e.target.value || null),
                  className: "w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "To Date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "date",
                  value: feedbackFilters.date_to || "",
                  onChange: (e) => handleFilterChange("date_to", e.target.value || null),
                  className: "w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                }
              )
            ] })
          ] })
        ] }),
        isLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading staff feedback..." })
        ] }),
        error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border-2 border-red-200 rounded-xl p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-6 h-6 text-red-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-red-900", children: "Failed to load feedback" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: error.message })
          ] })
        ] }) }),
        !isLoading && !error && feedbackList && feedbackList.data.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No feedback found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: Object.values(feedbackFilters).some((v) => v !== null) ? "No feedback matches your current filters. Try adjusting your search criteria." : "No staff feedback has been submitted yet." }),
          Object.values(feedbackFilters).some((v) => v !== null) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleClearFilters,
              className: "px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium",
              children: "Clear Filters"
            }
          )
        ] }),
        !isLoading && !error && feedbackList && feedbackList.data.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: feedbackList.data.map((feedback) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3 mb-3", children: [
                getTypeIcon(feedback.feedback_type),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: feedback.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(feedback.priority)}`, children: feedback.priority.toUpperCase() })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-600 mb-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center space-x-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: feedback.location_name })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center space-x-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: feedback.is_anonymous ? `Anonymous Staff - ${feedback.location_name}` : "Staff Member" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center space-x-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(feedback.created_at) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 mb-3 line-clamp-2", children: feedback.description }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`, children: formatStatusLabel(feedback.status) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                      "Type: ",
                      formatTypeLabel(feedback.feedback_type)
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                      "Ref: ",
                      feedback.reference_number
                    ] })
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 ml-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => handleViewDetails(feedback.feedback_id),
                    className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View Details" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => handleOpenStatusModal(feedback),
                    className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Update Status" })
                    ]
                  }
                )
              ] })
            ] })
          },
          feedback.feedback_id
        )) })
      ] })
    ] }),
    detailModalOpen && selectedFeedback && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
          getTypeIcon(selectedFeedback.feedback_type),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900", children: selectedFeedback.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
              "Ref: ",
              selectedFeedback.reference_number
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setDetailModalOpen(false);
              setSelectedFeedbackId(null);
            },
            className: "text-gray-400 hover:text-gray-600 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(selectedFeedback.status)}`, children: formatStatusLabel(selectedFeedback.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `px-4 py-2 rounded-lg text-sm font-medium border ${getPriorityColor(selectedFeedback.priority)}`, children: [
            "Priority: ",
            selectedFeedback.priority.toUpperCase()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-4 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-800", children: formatTypeLabel(selectedFeedback.feedback_type) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: selectedFeedback.location_name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Submitted By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: selectedFeedback.is_anonymous ? `Anonymous Staff - ${selectedFeedback.location_name}` : "Staff Member" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Submitted On" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: formatDate(selectedFeedback.created_at) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Last Updated" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: formatDate(selectedFeedback.updated_at) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-wrap", children: selectedFeedback.description }) })
        ] }),
        selectedFeedback.resolution_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Admin Notes & Responses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 rounded-lg p-4 border border-blue-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 whitespace-pre-wrap", children: selectedFeedback.resolution_notes }) })
        ] }),
        selectedFeedback.resolved_at && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-green-50 rounded-lg p-4 border border-green-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-green-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            "Resolved on ",
            formatDate(selectedFeedback.resolved_at)
          ] })
        ] }) }),
        selectedFeedback.attachment_urls && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-3", children: "Attachments" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-600", children: [
            "Attachment URLs: ",
            selectedFeedback.attachment_urls
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-6 mt-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Update Feedback" }),
          (selectedFeedback.status === "resolved" || selectedFeedback.status === "closed") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-yellow-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
            " This feedback is currently marked as ",
            formatStatusLabel(selectedFeedback.status),
            ". You can still update it if needed."
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Change Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: statusUpdateForm.status,
                  onChange: (e) => setStatusUpdateForm((prev) => ({
                    ...prev,
                    status: e.target.value
                  })),
                  className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
                  children: [
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Priority Level" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: statusUpdateForm.priority,
                  onChange: (e) => setStatusUpdateForm((prev) => ({
                    ...prev,
                    priority: e.target.value
                  })),
                  className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-100",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low", children: "Low" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "medium", children: "Medium" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "high", children: "High" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "urgent", children: "Urgent" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Add Internal Note" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  value: statusUpdateForm.resolution_notes || "",
                  onChange: (e) => setStatusUpdateForm((prev) => ({
                    ...prev,
                    resolution_notes: e.target.value || null
                  })),
                  rows: 4,
                  placeholder: "Add notes about resolution, actions taken, or follow-up required...",
                  className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: "These notes will be visible to the staff member who submitted the feedback" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setDetailModalOpen(false);
              setSelectedFeedbackId(null);
            },
            className: "px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium",
            children: "Close"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleUpdateStatus,
            disabled: updateMutation.isPending,
            className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2",
            children: [
              updateMutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: updateMutation.isPending ? "Saving..." : "Save Changes" })
            ]
          }
        ) })
      ] })
    ] }) }),
    statusModalOpen && selectedFeedbackId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-2xl w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between rounded-t-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-white", children: "Update Feedback Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setStatusModalOpen(false),
            className: "text-white hover:text-gray-200 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: statusUpdateForm.status,
              onChange: (e) => setStatusUpdateForm((prev) => ({
                ...prev,
                status: e.target.value
              })),
              className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
              children: [
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
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Priority Level" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: statusUpdateForm.priority,
              onChange: (e) => setStatusUpdateForm((prev) => ({
                ...prev,
                priority: e.target.value
              })),
              className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low", children: "Low" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "medium", children: "Medium" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "high", children: "High" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "urgent", children: "Urgent" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Resolution Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: statusUpdateForm.resolution_notes || "",
              onChange: (e) => setStatusUpdateForm((prev) => ({
                ...prev,
                resolution_notes: e.target.value || null
              })),
              rows: 4,
              placeholder: "Add notes about resolution, actions taken, or follow-up required...",
              className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: "These notes will be visible to the staff member who submitted the feedback" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setStatusModalOpen(false),
            disabled: updateMutation.isPending,
            className: "px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleUpdateStatus,
            disabled: updateMutation.isPending,
            className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2",
            children: [
              updateMutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: updateMutation.isPending ? "Updating..." : "Save Changes" })
            ]
          }
        )
      ] })
    ] }) }),
    responseModalOpen && selectedFeedback && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-2xl w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between rounded-t-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-white", children: "Respond to Feedback" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setResponseModalOpen(false);
              setResponseFormData({ response_text: "", is_internal_note: false });
            },
            className: "text-white hover:text-gray-200 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
          " Your response will be added to the resolution notes and the staff member will be able to see it when the feedback is updated."
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Your Response" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: responseFormData.response_text,
              onChange: (e) => setResponseFormData((prev) => ({
                ...prev,
                response_text: e.target.value
              })),
              rows: 6,
              placeholder: "Type your response to the staff member...",
              className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 resize-none"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              id: "internal-note",
              checked: responseFormData.is_internal_note,
              onChange: (e) => setResponseFormData((prev) => ({
                ...prev,
                is_internal_note: e.target.checked
              })),
              className: "w-4 h-4 text-green-600 rounded focus:ring-green-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "internal-note", className: "text-sm text-gray-700", children: "Internal note only (not visible to staff)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setResponseModalOpen(false);
              setResponseFormData({ response_text: "", is_internal_note: false });
            },
            disabled: updateMutation.isPending,
            className: "px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleAddResponse,
            disabled: updateMutation.isPending || !responseFormData.response_text.trim(),
            className: "px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2",
            children: [
              updateMutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: updateMutation.isPending ? "Sending..." : "Send Response" })
            ]
          }
        )
      ] })
    ] }) })
  ] });
};
export {
  UV_AdminFeedbackStaff as default
};
