import { u as useAppStore, l as useSearchParams, r as reactExports, o as useQueryClient, a as useQuery, j as jsxRuntimeExports, L as Link, a7 as TriangleAlert, C as Clock, B as CircleCheck, d as CircleAlert, ah as Filter, n as ChevronDown, M as MapPin, J as Calendar, F as FileText, X, aE as PackageX, b as axios } from "./index-HeRxKVXe.js";
import { u as useMutation } from "./useMutation-7uzCkorR.js";
const fetchInventoryAlerts = async (filters, token) => {
  const params = new URLSearchParams();
  if (filters.location_name) params.append("location_name", filters.location_name);
  if (filters.alert_type) params.append("alert_type", filters.alert_type);
  if (filters.status) params.append("status", filters.status);
  if (filters.priority) params.append("priority", filters.priority);
  params.append("limit", "50");
  params.append("offset", "0");
  params.append("sort_by", "created_at");
  params.append("sort_order", "desc");
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/inventory/alerts?${params.toString()}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
  );
  return {
    alerts: response.data.data.map((alert) => ({
      ...alert,
      current_quantity: alert.current_quantity ? Number(alert.current_quantity) : null
    })),
    total: response.data.total
  };
};
const fetchAlertDetails = async (alert_id, token) => {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/inventory/alerts/${alert_id}`,
    {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
  );
  return {
    ...response.data,
    current_quantity: response.data.current_quantity ? Number(response.data.current_quantity) : null
  };
};
const updateAlertStatus = async (alert_id, data, user_id, token) => {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/inventory/alerts/${alert_id}`,
    {
      ...data,
      ...data.status === "acknowledged" && { acknowledged_by_user_id: user_id },
      ...data.status === "resolved" && { resolved_by_user_id: user_id }
    },
    {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const UV_AdminInventoryAlerts = () => {
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = reactExports.useMemo(() => ({
    location_name: searchParams.get("location_name") || null,
    alert_type: searchParams.get("alert_type") || null,
    status: searchParams.get("status") || null,
    priority: searchParams.get("priority") || null
  }), [searchParams]);
  const [selectedAlertId, setSelectedAlertId] = reactExports.useState(null);
  const [detailModalOpen, setDetailModalOpen] = reactExports.useState(false);
  const [resolutionModalOpen, setResolutionModalOpen] = reactExports.useState(false);
  const [resolutionForm, setResolutionForm] = reactExports.useState({
    status: "acknowledged",
    resolution_notes: null
  });
  const [filterPanelOpen, setFilterPanelOpen] = reactExports.useState(false);
  const queryClient = useQueryClient();
  const { data: alertsData, isLoading: alertsLoading, error: alertsError } = useQuery({
    queryKey: ["inventory-alerts", filters],
    queryFn: () => fetchInventoryAlerts(filters, authToken || ""),
    enabled: !!authToken,
    staleTime: 3e4,
    // 30 seconds
    refetchOnWindowFocus: false
  });
  const { data: selectedAlert, isLoading: alertDetailLoading } = useQuery({
    queryKey: ["inventory-alert", selectedAlertId],
    queryFn: () => fetchAlertDetails(selectedAlertId, authToken || ""),
    enabled: !!selectedAlertId && !!authToken,
    staleTime: 1e4
  });
  const acknowledgeMutation = useMutation({
    mutationFn: (alert_id) => updateAlertStatus(
      alert_id,
      { status: "acknowledged" },
      (currentUser == null ? void 0 : currentUser.user_id) || "",
      authToken || ""
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-alert", selectedAlertId] });
      showToast("success", "Alert acknowledged successfully");
      setDetailModalOpen(false);
      setSelectedAlertId(null);
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to acknowledge alert");
    }
  });
  const resolveMutation = useMutation({
    mutationFn: ({ alert_id, form }) => updateAlertStatus(
      alert_id,
      {
        status: "resolved",
        resolution_notes: form.resolution_notes
      },
      (currentUser == null ? void 0 : currentUser.user_id) || "",
      authToken || ""
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-alert", selectedAlertId] });
      showToast("success", "Alert resolved successfully");
      setResolutionModalOpen(false);
      setDetailModalOpen(false);
      setSelectedAlertId(null);
      setResolutionForm({ status: "acknowledged", resolution_notes: null });
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to resolve alert");
    }
  });
  const updatePriorityMutation = useMutation({
    mutationFn: ({ alert_id, priority }) => updateAlertStatus(
      alert_id,
      { status: (selectedAlert == null ? void 0 : selectedAlert.status) || "pending", priority },
      (currentUser == null ? void 0 : currentUser.user_id) || "",
      authToken || ""
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-alert", selectedAlertId] });
      showToast("success", "Alert priority updated");
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update priority");
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
  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };
  const handleAlertClick = (alert_id) => {
    setSelectedAlertId(alert_id);
    setDetailModalOpen(true);
  };
  const handleAcknowledge = () => {
    if (!selectedAlertId) return;
    acknowledgeMutation.mutate(selectedAlertId);
  };
  const handleOpenResolutionModal = () => {
    setResolutionModalOpen(true);
  };
  const handleResolveSubmit = (e) => {
    var _a;
    e.preventDefault();
    if (!selectedAlertId) return;
    if (!((_a = resolutionForm.resolution_notes) == null ? void 0 : _a.trim())) {
      showToast("error", "Resolution notes are required");
      return;
    }
    resolveMutation.mutate({
      alert_id: selectedAlertId,
      form: resolutionForm
    });
  };
  const handleUpdatePriority = (priority) => {
    if (!selectedAlertId) return;
    updatePriorityMutation.mutate({ alert_id: selectedAlertId, priority });
  };
  const activeFiltersCount = reactExports.useMemo(() => {
    let count = 0;
    if (filters.location_name) count++;
    if (filters.alert_type) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    return count;
  }, [filters]);
  const alerts = (alertsData == null ? void 0 : alertsData.alerts) || [];
  const statsCounts = reactExports.useMemo(() => {
    const pending = alerts.filter((a) => a.status === "pending").length;
    const acknowledged = alerts.filter((a) => a.status === "acknowledged").length;
    const in_progress = alerts.filter((a) => a.status === "in_progress").length;
    const resolved = alerts.filter((a) => a.status === "resolved").length;
    const urgent = alerts.filter((a) => a.priority === "urgent").length;
    return { pending, acknowledged, in_progress, resolved, urgent };
  }, [alerts]);
  const getAlertTypeIcon = (type) => {
    switch (type) {
      case "out_of_stock":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(PackageX, { className: "w-5 h-5" });
      case "low_stock":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5" });
      case "expiring_soon":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5" });
      case "quality_issue":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5" });
    }
  };
  const getAlertTypeColor = (type) => {
    switch (type) {
      case "out_of_stock":
        return "text-red-600 bg-red-50";
      case "low_stock":
        return "text-orange-600 bg-orange-50";
      case "expiring_soon":
        return "text-yellow-600 bg-yellow-50";
      case "quality_issue":
        return "text-purple-600 bg-purple-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
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
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "acknowledged":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  const formatAlertType = (type) => {
    return type.split("_").map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Inventory Alerts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Manage and resolve staff-submitted inventory alerts" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/admin/dashboard",
          className: "px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
          children: "Back to Dashboard"
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "Pending" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-600", children: statsCounts.pending })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-8 h-8 text-red-600" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "Acknowledged" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-yellow-600", children: statsCounts.acknowledged })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-8 h-8 text-yellow-600" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "In Progress" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-blue-600", children: statsCounts.in_progress })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-8 h-8 text-blue-600" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "Resolved" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-green-600", children: statsCounts.resolved })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-8 h-8 text-green-600" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm border border-red-200 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "Urgent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-600", children: statsCounts.urgent })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-8 h-8 text-red-600" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-gray-200 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setFilterPanelOpen(!filterPanelOpen),
              className: "flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-5 h-5 text-gray-600" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium text-gray-700", children: [
                  "Filters ",
                  activeFiltersCount > 0 && `(${activeFiltersCount})`
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `w-4 h-4 text-gray-600 transition-transform ${filterPanelOpen ? "rotate-180" : ""}` })
              ]
            }
          ),
          activeFiltersCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleClearFilters,
              className: "text-sm text-blue-600 hover:text-blue-700 font-medium",
              children: "Clear all filters"
            }
          )
        ] }),
        filterPanelOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Location" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: filters.location_name || "",
                onChange: (e) => handleFilterChange("location_name", e.target.value || null),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
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
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Alert Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: filters.alert_type || "",
                onChange: (e) => handleFilterChange("alert_type", e.target.value || null),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Types" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "out_of_stock", children: "Out of Stock" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low_stock", children: "Low Stock" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "quality_issue", children: "Quality Issue" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "expiring_soon", children: "Expiring Soon" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: filters.status || "",
                onChange: (e) => handleFilterChange("status", e.target.value || null),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
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
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Priority" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: filters.priority || "",
                onChange: (e) => handleFilterChange("priority", e.target.value || null),
                className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Priorities" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "urgent", children: "Urgent" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "high", children: "High" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "medium", children: "Medium" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "low", children: "Low" })
                ]
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
        alertsLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" }) }),
        alertsError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-12 h-12 text-red-600 mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 font-medium", children: "Failed to load alerts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 text-sm mt-1", children: "Please try refreshing the page" })
        ] }),
        !alertsLoading && !alertsError && alerts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-16 h-16 text-green-600 mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No alerts found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: activeFiltersCount > 0 ? "Try adjusting your filters to see more alerts" : "All inventory alerts are resolved! Great work!" })
        ] }),
        !alertsLoading && !alertsError && alerts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: alerts.map((alert) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            onClick: () => handleAlertClick(alert.alert_id),
            className: `border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${alert.priority === "urgent" ? "border-red-300 bg-red-50 hover:bg-red-100" : alert.priority === "high" ? "border-orange-300 bg-orange-50 hover:bg-orange-100" : "border-gray-200 bg-white hover:bg-gray-50"}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-4 flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-2 rounded-lg ${getAlertTypeColor(alert.alert_type)}`, children: getAlertTypeIcon(alert.alert_type) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 truncate", children: alert.item_name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(alert.priority)}`, children: alert.priority.toUpperCase() }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(alert.status)}`, children: alert.status.replace("_", " ").toUpperCase() })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4 text-sm text-gray-600 mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: alert.location_name })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(alert.created_at) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs", children: alert.reference_number })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-700", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: formatAlertType(alert.alert_type) }),
                    alert.current_quantity !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2", children: [
                      "- Current: ",
                      alert.current_quantity,
                      " units"
                    ] })
                  ] }),
                  alert.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-2 line-clamp-2", children: alert.notes })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    handleAlertClick(alert.alert_id);
                  },
                  className: "px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors",
                  children: "View Details"
                }
              ) })
            ] })
          },
          alert.alert_id
        )) })
      ] })
    ] }) }),
    detailModalOpen && selectedAlert && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Alert Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setDetailModalOpen(false);
              setSelectedAlertId(null);
            },
            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6 text-gray-600" })
          }
        )
      ] }),
      alertDetailLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" }) }),
      !alertDetailLoading && selectedAlert && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-3 rounded-lg ${getAlertTypeColor(selectedAlert.alert_type)}`, children: getAlertTypeIcon(selectedAlert.alert_type) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2", children: selectedAlert.item_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 text-sm font-semibold rounded-full border ${getPriorityColor(selectedAlert.priority)}`, children: selectedAlert.priority.toUpperCase() }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedAlert.status)}`, children: selectedAlert.status.replace("_", " ").toUpperCase() })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600 font-mono", children: [
              "Ref: ",
              selectedAlert.reference_number
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4 text-blue-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700", children: "Location" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-semibold text-gray-900", children: selectedAlert.location_name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-purple-50 rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-4 h-4 text-purple-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700", children: "Alert Type" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-semibold text-gray-900", children: formatAlertType(selectedAlert.alert_type) })
          ] }),
          selectedAlert.current_quantity !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-orange-50 rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(PackageX, { className: "w-4 h-4 text-orange-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700", children: "Current Quantity" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-base font-semibold text-gray-900", children: [
              selectedAlert.current_quantity,
              " units"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 rounded-lg p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 text-green-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700", children: "Submitted" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base font-semibold text-gray-900", children: formatDate(selectedAlert.created_at) })
          ] })
        ] }),
        selectedAlert.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Staff Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 rounded-lg p-4 border border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 leading-relaxed", children: selectedAlert.notes }) })
        ] }),
        selectedAlert.acknowledged_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Acknowledgment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-700", children: [
            "Acknowledged on ",
            formatDate(selectedAlert.acknowledged_at)
          ] })
        ] }),
        selectedAlert.resolved_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-900 mb-2", children: "Resolution" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-700 mb-2", children: [
            "Resolved on ",
            formatDate(selectedAlert.resolved_at)
          ] }),
          selectedAlert.resolution_notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg p-3 border border-green-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 leading-relaxed", children: selectedAlert.resolution_notes }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 pt-4 border-t border-gray-200", children: [
          selectedAlert.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleAcknowledge,
              disabled: acknowledgeMutation.isPending,
              className: "flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: acknowledgeMutation.isPending ? "Acknowledging..." : "Acknowledge Alert"
            }
          ),
          ["pending", "acknowledged", "in_progress"].includes(selectedAlert.status) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleOpenResolutionModal,
              className: "flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors",
              children: "Resolve Alert"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setDetailModalOpen(false);
                setSelectedAlertId(null);
              },
              className: "px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors",
              children: "Close"
            }
          )
        ] }),
        selectedAlert.status !== "resolved" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Update Priority" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex space-x-2", children: ["low", "medium", "high", "urgent"].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleUpdatePriority(p),
              disabled: updatePriorityMutation.isPending || selectedAlert.priority === p,
              className: `px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${selectedAlert.priority === p ? getPriorityColor(p) : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"} disabled:opacity-50 disabled:cursor-not-allowed`,
              children: p.charAt(0).toUpperCase() + p.slice(1)
            },
            p
          )) })
        ] })
      ] })
    ] }) }),
    resolutionModalOpen && selectedAlert && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-lg w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-gray-200 px-6 py-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Resolve Alert" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setResolutionModalOpen(false);
              setResolutionForm({ status: "acknowledged", resolution_notes: null });
            },
            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5 text-gray-600" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleResolveSubmit, className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Alert:" }),
            " ",
            selectedAlert.item_name,
            " at ",
            selectedAlert.location_name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800 mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Type:" }),
            " ",
            formatAlertType(selectedAlert.alert_type)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "resolution_notes", className: "block text-sm font-medium text-gray-700 mb-2", children: [
            "Resolution Notes ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600", children: "*" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              id: "resolution_notes",
              rows: 4,
              required: true,
              value: resolutionForm.resolution_notes || "",
              onChange: (e) => setResolutionForm((prev) => ({
                ...prev,
                resolution_notes: e.target.value
              })),
              placeholder: "Describe what action was taken to resolve this alert...",
              className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: "This will be visible to staff who submitted the alert" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3 pt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: resolveMutation.isPending,
              className: "flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
              children: resolveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", fill: "none", viewBox: "0 0 24 24", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                ] }),
                "Resolving..."
              ] }) : "Mark as Resolved"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => {
                setResolutionModalOpen(false);
                setResolutionForm({ status: "acknowledged", resolution_notes: null });
              },
              disabled: resolveMutation.isPending,
              className: "px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50",
              children: "Cancel"
            }
          )
        ] })
      ] })
    ] }) })
  ] }) });
};
export {
  UV_AdminInventoryAlerts as default
};
