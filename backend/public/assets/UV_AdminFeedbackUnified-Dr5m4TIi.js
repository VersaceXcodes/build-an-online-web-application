import { u as useAppStore, k as useSearchParams, r as reactExports, l as useQueryClient, a as useQuery, j as jsxRuntimeExports, L as Link, $ as ArrowLeft, ae as Filter, d as CircleAlert, O as MessageSquare, M as MapPin, D as Calendar, U as Users, v as Eye, o as ChevronLeft, i as ChevronRight, X, aB as MessageCircle, z as User, b as axios } from "./index-nYaE10KP.js";
import { u as useMutation } from "./useMutation-BdRga-lQ.js";
const fetchUnifiedFeedback = async (token, filters) => {
  const params = {
    limit: filters.limit || 20,
    offset: filters.offset || 0
  };
  if (filters.location) params.location = filters.location;
  if (filters.category) params.category = filters.category;
  if (filters.priority) params.priority = filters.priority;
  if (filters.status) params.status = filters.status;
  if (filters.role) params.role = filters.role;
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/unified-feedback`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params
    }
  );
  return response.data;
};
const fetchInternalUsers = async (token) => {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/internal-users`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const updateFeedback = async (token, feedback_id, data) => {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/unified-feedback/${feedback_id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const UV_AdminFeedbackUnified = () => {
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = reactExports.useState(false);
  const [selectedFeedback, setSelectedFeedback] = reactExports.useState(null);
  const [showUpdateModal, setShowUpdateModal] = reactExports.useState(false);
  const [updateForm, setUpdateForm] = reactExports.useState({
    priority: "",
    status: "",
    assigned_to_user_id: "",
    internal_notes: "",
    public_response: ""
  });
  const location = searchParams.get("location") || "";
  const category = searchParams.get("category") || "";
  const priority = searchParams.get("priority") || "";
  const status = searchParams.get("status") || "";
  const role = searchParams.get("role") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;
  const offset = (page - 1) * limit;
  const queryClient = useQueryClient();
  const {
    data: feedbackResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["unified-feedback", location, category, priority, status, role, offset],
    queryFn: () => fetchUnifiedFeedback(authToken, {
      location: location || null,
      category: category || null,
      priority: priority || null,
      status: status || null,
      role: role || null,
      limit,
      offset
    }),
    enabled: !!authToken
  });
  const { data: internalUsers = [] } = useQuery({
    queryKey: ["internal-users"],
    queryFn: () => fetchInternalUsers(authToken),
    enabled: !!authToken
  });
  const updateMutation = useMutation({
    mutationFn: (data) => updateFeedback(authToken, data.feedback_id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unified-feedback"] });
      showToast("success", "Feedback updated successfully");
      setShowUpdateModal(false);
      setSelectedFeedback(null);
    },
    onError: () => {
      showToast("error", "Failed to update feedback");
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
    setSearchParams({});
  };
  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };
  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setUpdateForm({
      priority: feedback.priority,
      status: feedback.status,
      assigned_to_user_id: feedback.assigned_to_user_id || "",
      internal_notes: feedback.internal_notes || "",
      public_response: feedback.public_response || ""
    });
    setShowUpdateModal(true);
  };
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    updateMutation.mutate({
      feedback_id: selectedFeedback.feedback_id,
      updates: {
        priority: updateForm.priority,
        status: updateForm.status,
        assigned_to_user_id: updateForm.assigned_to_user_id || null,
        internal_notes: updateForm.internal_notes,
        public_response: updateForm.public_response
      }
    });
  };
  const feedbackList = (feedbackResponse == null ? void 0 : feedbackResponse.data) || [];
  const totalPages = feedbackResponse ? Math.ceil(feedbackResponse.total / limit) : 0;
  const activeFiltersCount = [location, category, priority, status, role].filter(
    Boolean
  ).length;
  const getPriorityColor = (priority2) => {
    switch (priority2) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "High":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  const getStatusColor = (status2) => {
    switch (status2) {
      case "Open":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Resolved":
        return "bg-green-100 text-green-800 border-green-300";
      case "Closed":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  const getRoleIcon = (role2) => {
    switch (role2) {
      case "customer":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "h-4 w-4" });
      case "staff":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" });
      case "manager":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" });
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white shadow-sm border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/admin/dashboard",
              className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5 text-gray-600" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "All Feedback" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: "View feedback from customers, staff, and managers" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setShowFilters(!showFilters),
            className: "inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "h-4 w-4 mr-2" }),
              "Filters",
              activeFiltersCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded-full", children: activeFiltersCount })
            ]
          }
        )
      ] }),
      showFilters && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Filters" }),
          activeFiltersCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleClearFilters,
              className: "text-sm text-blue-600 hover:text-blue-700 font-medium",
              children: "Clear all filters"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Role" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: role,
                onChange: (e) => handleFilterChange("role", e.target.value),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Roles" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "customer", children: "Customer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "staff", children: "Staff" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "manager", children: "Manager" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: location,
                onChange: (e) => handleFilterChange("location", e.target.value),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Locations" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "blanchardstown", children: "Blanchardstown" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "tallaght", children: "Tallaght" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "glasnevin", children: "Glasnevin" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Category" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: category,
                onChange: (e) => handleFilterChange("category", e.target.value),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Categories" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "order_issue", children: "Order Issue" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "product_quality", children: "Product Quality" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "delivery", children: "Delivery" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "customer_service", children: "Customer Service" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "suggestion", children: "Suggestion" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "complaint", children: "Complaint" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "other", children: "Other" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Priority" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: priority,
                onChange: (e) => handleFilterChange("priority", e.target.value),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Priorities" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Critical", children: "Critical" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "High", children: "High" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Medium", children: "Medium" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Low", children: "Low" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: status,
                onChange: (e) => handleFilterChange("status", e.target.value),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Statuses" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Open", children: "Open" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "In Progress", children: "In Progress" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Resolved", children: "Resolved" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Closed", children: "Closed" })
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-red-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700", children: "Failed to load feedback. Please try again." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => refetch(),
              className: "mt-2 text-sm font-medium text-red-700 hover:text-red-600",
              children: "Retry"
            }
          )
        ] })
      ] }) }),
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-40 animate-pulse",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4 mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2" })
          ]
        },
        i
      )) }),
      !isLoading && feedbackList.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-12 w-12 text-gray-400 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-medium text-gray-900 mb-2", children: "No feedback found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Try adjusting your filters or check back later." })
      ] }),
      !isLoading && feedbackList.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: feedbackList.map((feedback) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow",
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-4 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold", children: getRoleIcon(feedback.created_by_role) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: feedback.subject }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                          feedback.priority
                        )}`,
                        children: feedback.priority
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: `px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                          feedback.status
                        )}`,
                        children: feedback.status
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 text-sm text-gray-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
                      getRoleIcon(feedback.created_by_role),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: feedback.created_by_role }),
                      feedback.created_by_first_name && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                        "- ",
                        feedback.created_by_first_name,
                        " ",
                        feedback.created_by_last_name
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: feedback.location })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4 w-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(feedback.created_at) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: feedback.category.replace("_", " ") })
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pl-14", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 mb-4 line-clamp-2", children: feedback.message }),
                feedback.assigned_to_user_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                    "Assigned to: ",
                    feedback.assigned_to_first_name,
                    " ",
                    feedback.assigned_to_last_name
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => handleViewFeedback(feedback),
                className: "ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "View & Update" })
                ]
              }
            )
          ] })
        },
        feedback.feedback_id
      )) }),
      !isLoading && totalPages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-600", children: [
          "Showing ",
          offset + 1,
          " to ",
          Math.min(offset + limit, (feedbackResponse == null ? void 0 : feedbackResponse.total) || 0),
          " ",
          "of ",
          (feedbackResponse == null ? void 0 : feedbackResponse.total) || 0,
          " results"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handlePageChange(page - 1),
              disabled: page === 1,
              className: "p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "h-5 w-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-1", children: [...Array(Math.min(totalPages, 5))].map((_, i) => {
            const pageNum = page <= 3 ? i + 1 : page - 2 + i;
            if (pageNum > totalPages) return null;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handlePageChange(pageNum),
                className: `px-4 py-2 rounded-lg ${page === pageNum ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"}`,
                children: pageNum
              },
              pageNum
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handlePageChange(page + 1),
              disabled: page === totalPages,
              className: "p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5" })
            }
          )
        ] })
      ] })
    ] }),
    showUpdateModal && selectedFeedback && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Feedback Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowUpdateModal(false),
            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900", children: selectedFeedback.subject }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "From:" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium capitalize", children: [
                selectedFeedback.created_by_role,
                " -",
                " ",
                selectedFeedback.created_by_first_name,
                " ",
                selectedFeedback.created_by_last_name
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Location:" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium capitalize", children: selectedFeedback.location })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Category:" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium capitalize", children: selectedFeedback.category.replace("_", " ") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600", children: "Date:" }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatDate(selectedFeedback.created_at) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 text-sm", children: "Message:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-gray-900", children: selectedFeedback.message })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleUpdateSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Priority" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: updateForm.priority,
                  onChange: (e) => setUpdateForm({ ...updateForm, priority: e.target.value }),
                  className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Low", children: "Low" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Medium", children: "Medium" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "High", children: "High" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Critical", children: "Critical" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: updateForm.status,
                  onChange: (e) => setUpdateForm({ ...updateForm, status: e.target.value }),
                  className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Open", children: "Open" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "In Progress", children: "In Progress" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Resolved", children: "Resolved" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Closed", children: "Closed" })
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Assign To" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: updateForm.assigned_to_user_id,
                onChange: (e) => setUpdateForm({ ...updateForm, assigned_to_user_id: e.target.value }),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Unassigned" }),
                  internalUsers.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: user.user_id, children: [
                    user.first_name,
                    " ",
                    user.last_name,
                    " (",
                    user.user_type,
                    ")"
                  ] }, user.user_id))
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Internal Notes (Private)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: updateForm.internal_notes,
                onChange: (e) => setUpdateForm({ ...updateForm, internal_notes: e.target.value }),
                rows: 3,
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                placeholder: "Add internal notes..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Public Response (Visible to submitter)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                value: updateForm.public_response,
                onChange: (e) => setUpdateForm({ ...updateForm, public_response: e.target.value }),
                rows: 3,
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500",
                placeholder: "Add public response..."
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end space-x-3 pt-4 border-t border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowUpdateModal(false),
                className: "px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                disabled: updateMutation.isPending,
                className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50",
                children: updateMutation.isPending ? "Updating..." : "Update Feedback"
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] });
};
export {
  UV_AdminFeedbackUnified as default
};
