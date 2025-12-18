import { u as useAppStore, l as useSearchParams, r as reactExports, o as useQueryClient, a as useQuery, j as jsxRuntimeExports, L as Link, i as Package, D as CircleX, d as CircleAlert, I as CircleCheckBig, b as axios, C as Clock, a7 as TriangleAlert } from "./index-i76FChob.js";
import { u as useMutation } from "./useMutation-vNQrkO0c.js";
const UV_StaffInventoryAlerts = () => {
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatusFilter = searchParams.get("status") || null;
  const urlAlertTypeFilter = searchParams.get("alert_type") || null;
  const [formData, setFormData] = reactExports.useState({
    location_name: "",
    item_name: "",
    alert_type: "low_stock",
    current_quantity: "",
    notes: "",
    priority: "medium"
  });
  const [formErrors, setFormErrors] = reactExports.useState({});
  const [statusFilter, setStatusFilter] = reactExports.useState(urlStatusFilter);
  const [typeFilter, setTypeFilter] = reactExports.useState(urlAlertTypeFilter);
  const queryClient = useQueryClient();
  const fetchInventoryAlerts = async (status, alertType) => {
    const params = {
      limit: 50,
      sort_by: "created_at",
      sort_order: "desc"
    };
    if (status) params.status = status;
    if (alertType) params.alert_type = alertType;
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/inventory/alerts`,
      {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  };
  const createInventoryAlert = async (payload) => {
    const response = await axios.post(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/inventory/alerts`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      }
    );
    return response.data;
  };
  const {
    data: alertsData,
    isLoading: isLoadingAlerts,
    error: alertsError,
    refetch: refetchAlerts
  } = useQuery({
    queryKey: ["inventoryAlerts", statusFilter, typeFilter],
    queryFn: () => fetchInventoryAlerts(statusFilter, typeFilter),
    staleTime: 3e4,
    // 30 seconds
    refetchOnWindowFocus: true,
    select: (data) => ({
      alerts: data.data.map((alert) => ({
        ...alert,
        current_quantity: alert.current_quantity !== null ? Number(alert.current_quantity) : null
      })),
      total: data.total
    })
  });
  const submitAlertMutation = useMutation({
    mutationFn: createInventoryAlert,
    onSuccess: (data) => {
      setFormData({
        location_name: "",
        item_name: "",
        alert_type: "low_stock",
        current_quantity: "",
        notes: "",
        priority: "medium"
      });
      setFormErrors({});
      showToast(
        "success",
        `Alert ${data.reference_number} submitted successfully!`,
        5e3
      );
      queryClient.invalidateQueries({ queryKey: ["inventoryAlerts"] });
      refetchAlerts();
    },
    onError: (error) => {
      var _a, _b;
      const errorMessage = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to submit alert";
      showToast("error", errorMessage);
    }
  });
  reactExports.useEffect(() => {
    setStatusFilter(urlStatusFilter);
    setTypeFilter(urlAlertTypeFilter);
  }, [urlStatusFilter, urlAlertTypeFilter]);
  reactExports.useEffect(() => {
    let autoPriority = "medium";
    if (formData.alert_type === "out_of_stock") {
      autoPriority = "high";
    } else if (formData.alert_type === "quality_issue") {
      autoPriority = "high";
    } else if (formData.alert_type === "expiring_soon") {
      autoPriority = "medium";
    } else if (formData.alert_type === "low_stock") {
      autoPriority = "medium";
    }
    setFormData((prev) => ({
      ...prev,
      priority: autoPriority
    }));
  }, [formData.alert_type]);
  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  const validateForm = () => {
    const errors = {};
    if (!formData.location_name || formData.location_name.trim() === "") {
      errors.location_name = "Location is required";
    }
    if (!formData.item_name || formData.item_name.trim() === "") {
      errors.item_name = "Item name is required";
    }
    if (formData.item_name && formData.item_name.trim().length > 255) {
      errors.item_name = "Item name too long (max 255 characters)";
    }
    if (formData.current_quantity && isNaN(Number(formData.current_quantity))) {
      errors.current_quantity = "Quantity must be a valid number";
    }
    if (formData.current_quantity && Number(formData.current_quantity) < 0) {
      errors.current_quantity = "Quantity cannot be negative";
    }
    if (formData.notes && formData.notes.length > 1e3) {
      errors.notes = "Notes too long (max 1000 characters)";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("error", "Please fix form errors before submitting");
      return;
    }
    if (!currentUser) {
      showToast("error", "Authentication required");
      return;
    }
    const payload = {
      submitted_by_user_id: currentUser.user_id,
      location_name: formData.location_name,
      item_name: formData.item_name.trim(),
      alert_type: formData.alert_type,
      current_quantity: formData.current_quantity ? Number(formData.current_quantity) : null,
      notes: formData.notes.trim() || null,
      priority: formData.priority
    };
    submitAlertMutation.mutate(payload);
  };
  const handleFilterChange = (filterType, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(filterType, value);
    } else {
      newParams.delete(filterType);
    }
    setSearchParams(newParams);
  };
  const getAlertTypeBadge = (type) => {
    const badges = {
      low_stock: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4" }), color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Running Low" },
      out_of_stock: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "size-4" }), color: "bg-red-100 text-red-800 border-red-300", label: "Out of Stock" },
      quality_issue: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-4" }), color: "bg-orange-100 text-orange-800 border-orange-300", label: "Quality Issue" },
      expiring_soon: { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-4" }), color: "bg-purple-100 text-purple-800 border-purple-300", label: "Expiring Soon" }
    };
    const badge = badges[type] || badges.low_stock;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`, children: [
      badge.icon,
      badge.label
    ] });
  };
  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", label: "Pending" },
      acknowledged: { color: "bg-blue-100 text-blue-800 border-blue-300", label: "Acknowledged" },
      in_progress: { color: "bg-purple-100 text-purple-800 border-purple-300", label: "In Progress" },
      resolved: { color: "bg-green-100 text-green-800 border-green-300", label: "Resolved" }
    };
    const badge = badges[status] || badges.pending;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`, children: badge.label });
  };
  const getPriorityBadge = (priority) => {
    const badges = {
      low: { color: "bg-gray-100 text-gray-700", label: "Low" },
      medium: { color: "bg-blue-100 text-blue-700", label: "Medium" },
      high: { color: "bg-orange-100 text-orange-700", label: "High" },
      urgent: { color: "bg-red-100 text-red-700", label: "Urgent" }
    };
    const badge = badges[priority] || badges.medium;
    return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex px-2 py-0.5 rounded text-xs font-semibold ${badge.color}`, children: badge.label });
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Inventory Alerts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Report inventory issues and track resolution status" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/staff/dashboard",
          className: "inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors",
          children: "← Back to Dashboard"
        }
      )
    ] }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden sticky top-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-br from-purple-50 to-purple-100 px-6 py-4 border-b border-purple-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-purple-900 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "size-6" }),
          "Submit New Alert"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "p-6 space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "location_name", className: "block text-sm font-semibold text-gray-900 mb-2", children: [
              "Location ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "location_name",
                value: formData.location_name,
                onChange: (e) => handleFormChange("location_name", e.target.value),
                className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.location_name ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"} transition-all duration-200`,
                required: true,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select Location" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Blanchardstown", children: "Blanchardstown" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Tallaght", children: "Tallaght" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Glasnevin", children: "Glasnevin" })
                ]
              }
            ),
            formErrors.location_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.location_name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "item_name", className: "block text-sm font-semibold text-gray-900 mb-2", children: [
              "Item Name ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "item_name",
                value: formData.item_name,
                onChange: (e) => handleFormChange("item_name", e.target.value),
                placeholder: "e.g., All-Purpose Flour",
                className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.item_name ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"} transition-all duration-200`,
                maxLength: 255,
                required: true
              }
            ),
            formErrors.item_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.item_name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "alert_type", className: "block text-sm font-semibold text-gray-900 mb-2", children: [
              "Alert Type ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                id: "alert_type",
                value: formData.alert_type,
                onChange: (e) => handleFormChange("alert_type", e.target.value),
                className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200",
                required: true,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low_stock", children: "Running Low" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "out_of_stock", children: "Out of Stock" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "quality_issue", children: "Quality Issue" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "expiring_soon", children: "Expiring Soon" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Priority is automatically set based on alert type" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "current_quantity", className: "block text-sm font-semibold text-gray-900 mb-2", children: "Current Quantity (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                id: "current_quantity",
                value: formData.current_quantity,
                onChange: (e) => handleFormChange("current_quantity", e.target.value),
                placeholder: "Enter quantity if known",
                min: "0",
                className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.current_quantity ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"} transition-all duration-200`
              }
            ),
            formErrors.current_quantity && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.current_quantity })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-2", children: "Priority (Auto-calculated)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50", children: getPriorityBadge(formData.priority) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "notes", className: "block text-sm font-semibold text-gray-900 mb-2", children: "Additional Notes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "textarea",
              {
                id: "notes",
                value: formData.notes,
                onChange: (e) => handleFormChange("notes", e.target.value),
                placeholder: "Any additional details about the issue...",
                rows: 4,
                maxLength: 1e3,
                className: `w-full px-4 py-3 rounded-lg border-2 ${formErrors.notes ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100"} transition-all duration-200 resize-none`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-gray-500 text-right", children: [
              formData.notes.length,
              "/1000 characters"
            ] }),
            formErrors.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.notes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: submitAlertMutation.isPending,
              className: "w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl",
              children: submitAlertMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin h-5 w-5", fill: "none", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ] }),
                "Submitting Alert..."
              ] }) : "Submit Alert"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-blue-900", children: "My Submitted Alerts" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-4 border-b border-gray-200 bg-gray-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "status_filter", className: "block text-sm font-medium text-gray-700 mb-2", children: "Filter by Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  id: "status_filter",
                  value: statusFilter || "",
                  onChange: (e) => handleFilterChange("status", e.target.value || null),
                  className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Statuses" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pending", children: "Pending" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "acknowledged", children: "Acknowledged" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_progress", children: "In Progress" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "resolved", children: "Resolved" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "type_filter", className: "block text-sm font-medium text-gray-700 mb-2", children: "Filter by Type" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  id: "type_filter",
                  value: typeFilter || "",
                  onChange: (e) => handleFilterChange("alert_type", e.target.value || null),
                  className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Types" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low_stock", children: "Running Low" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "out_of_stock", children: "Out of Stock" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "quality_issue", children: "Quality Issue" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "expiring_soon", children: "Expiring Soon" })
                  ]
                }
              )
            ] })
          ] }),
          (statusFilter || typeFilter) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-600 font-medium", children: "Active filters:" }),
            statusFilter && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => handleFilterChange("status", null),
                className: "inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200",
                children: [
                  "Status: ",
                  statusFilter,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "size-3" })
                ]
              }
            ),
            typeFilter && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => handleFilterChange("alert_type", null),
                className: "inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium hover:bg-purple-200",
                children: [
                  "Type: ",
                  typeFilter,
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "size-3" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-gray-100", children: isLoadingAlerts ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-12 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-3 text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin h-6 w-6 text-purple-600", fill: "none", viewBox: "0 0 24 24", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: "Loading alerts..." })
        ] }) }) : alertsError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-8 text-red-600 mx-auto mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 font-medium", children: "Failed to load alerts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm mt-1", children: alertsError.message || "Please try again" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => refetchAlerts(),
              className: "mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors",
              children: "Retry"
            }
          )
        ] }) }) : !alertsData || alertsData.alerts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "size-16 text-gray-300 mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Alerts Found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-sm", children: statusFilter || typeFilter ? "No alerts match your current filters" : "You haven't submitted any inventory alerts yet" })
        ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[calc(100vh-300px)] overflow-y-auto", children: alertsData.alerts.map((alert) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "px-6 py-5 hover:bg-gray-50 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gray-900", children: alert.item_name }),
                    getPriorityBadge(alert.priority)
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 font-medium mb-1", children: [
                    "Ref: ",
                    alert.reference_number
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: alert.location_name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end gap-2", children: [
                  getStatusBadge(alert.status),
                  getAlertTypeBadge(alert.alert_type)
                ] })
              ] }),
              alert.current_quantity !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-yellow-800 font-medium", children: [
                "Current Quantity: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: alert.current_quantity })
              ] }) }),
              alert.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 rounded-lg px-3 py-2 mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-700", children: alert.notes }) }),
              alert.resolution_notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg px-3 py-2 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-700 font-semibold mb-1", children: "Resolution Notes:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-800", children: alert.resolution_notes })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "Submitted ",
                  formatDate(alert.created_at)
                ] }),
                alert.resolved_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-green-600 font-medium", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "size-3" }),
                  "Resolved ",
                  formatDate(alert.resolved_at)
                ] })
              ] })
            ]
          },
          alert.alert_id
        )) }) }),
        alertsData && alertsData.alerts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4 bg-gray-50 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
          "Showing ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: alertsData.alerts.length }),
          " of",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: alertsData.total }),
          " alerts"
        ] }) })
      ] }) })
    ] }) })
  ] }) });
};
export {
  UV_StaffInventoryAlerts as default
};
