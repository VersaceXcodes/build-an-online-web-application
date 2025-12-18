import { l as useSearchParams, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, L as Link, ak as ChartColumn, F as FileText, i as Package, U as Users, aF as Settings, C as Clock, ah as Filter, n as ChevronDown, aL as FileJson, aM as FileSpreadsheet, ai as Download, a7 as TriangleAlert, t as Plus, J as Calendar, Y as TrendingUp, W as MessageSquare, am as GraduationCap, b as axios } from "./index-i76FChob.js";
const UV_AdminReports = () => {
  var _a;
  const [searchParams, setSearchParams] = useSearchParams();
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const showLoading = useAppStore((state) => state.show_loading);
  const hideLoading = useAppStore((state) => state.hide_loading);
  const globalLocations = useAppStore((state) => state.location_state.available_locations);
  const [selectedReportType, setSelectedReportType] = reactExports.useState(
    searchParams.get("report_type") || "daily_sales"
  );
  const [dateRangeStart, setDateRangeStart] = reactExports.useState(
    searchParams.get("date_from") || ""
  );
  const [dateRangeEnd, setDateRangeEnd] = reactExports.useState(
    searchParams.get("date_to") || ""
  );
  const [selectedLocationFilter, setSelectedLocationFilter] = reactExports.useState(
    searchParams.get("location") || "all"
  );
  const [selectedFormat, setSelectedFormat] = reactExports.useState(
    searchParams.get("format") || "json"
  );
  const [generatedReportData, setGeneratedReportData] = reactExports.useState(null);
  const [generatedReportUrl, setGeneratedReportUrl] = reactExports.useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = reactExports.useState(false);
  const [generationError, setGenerationError] = reactExports.useState(null);
  const [activeTab, setActiveTab] = reactExports.useState("generate");
  const availableReportTypes = [
    {
      id: "daily_sales",
      name: "Daily Sales",
      description: "Comprehensive daily sales summary with order counts, revenue, and trends",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-5 h-5" }),
      estimated_duration: "~5 seconds"
    },
    {
      id: "weekly_performance",
      name: "Weekly Performance",
      description: "Week-over-week performance metrics and comparisons",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5" }),
      estimated_duration: "~10 seconds"
    },
    {
      id: "monthly_summary",
      name: "Monthly Summary",
      description: "Complete monthly business summary with detailed breakdowns",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-5 h-5" }),
      estimated_duration: "~15 seconds"
    },
    {
      id: "product_performance",
      name: "Product Performance",
      description: "Best sellers, revenue by product, and inventory insights",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-5 h-5" }),
      estimated_duration: "~10 seconds"
    },
    {
      id: "feedback_summary",
      name: "Feedback Summary",
      description: "Customer satisfaction ratings and feedback analysis",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-5 h-5" }),
      estimated_duration: "~8 seconds"
    },
    {
      id: "training_progress",
      name: "Training Progress",
      description: "Staff training completion rates and compliance metrics",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "w-5 h-5" }),
      estimated_duration: "~7 seconds"
    },
    {
      id: "inventory_alerts",
      name: "Inventory Alerts",
      description: "Summary of inventory issues and resolution times",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5" }),
      estimated_duration: "~5 seconds"
    }
  ];
  const { data: availableLocations, isLoading: locationsLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      if (globalLocations && globalLocations.length > 0) {
        return globalLocations;
      }
      const response = await axios.get(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/locations`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      return response.data.map((location) => ({
        location_id: location.location_id,
        location_name: location.location_name,
        address_line1: location.address_line1,
        city: location.city,
        is_collection_enabled: location.is_collection_enabled,
        is_delivery_enabled: location.is_delivery_enabled
      }));
    },
    staleTime: 6e4,
    enabled: !!authToken
  });
  const generateReport = async () => {
    var _a2, _b;
    if (!dateRangeStart || !dateRangeEnd) {
      showToast("error", "Please select both start and end dates");
      return;
    }
    if (new Date(dateRangeStart) > new Date(dateRangeEnd)) {
      showToast("error", "Start date must be before end date");
      return;
    }
    setIsGeneratingReport(true);
    setGenerationError(null);
    setGeneratedReportData(null);
    setGeneratedReportUrl(null);
    showLoading("Generating report...");
    try {
      const response = await axios.get(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/analytics/reports`,
        {
          params: {
            report_type: selectedReportType,
            date_from: dateRangeStart,
            date_to: dateRangeEnd,
            location: selectedLocationFilter !== "all" ? selectedLocationFilter : void 0,
            format: selectedFormat
          },
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          responseType: selectedFormat === "json" ? "json" : "blob"
        }
      );
      if (selectedFormat === "json") {
        setGeneratedReportData(response.data);
        showToast("success", "Report generated successfully");
      } else {
        const blob = new Blob([response.data], {
          type: selectedFormat === "pdf" ? "application/pdf" : "text/csv"
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedReportType}_${dateRangeStart}_${dateRangeEnd}.${selectedFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        showToast("success", "Report downloaded successfully");
      }
    } catch (error) {
      const errorMessage = ((_b = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.message) || "Failed to generate report";
      setGenerationError(errorMessage);
      showToast("error", errorMessage);
      console.error("Report generation error:", error);
    } finally {
      setIsGeneratingReport(false);
      hideLoading();
    }
  };
  const updateUrlParams = () => {
    const params = {};
    if (selectedReportType) params.report_type = selectedReportType;
    if (dateRangeStart) params.date_from = dateRangeStart;
    if (dateRangeEnd) params.date_to = dateRangeEnd;
    if (selectedLocationFilter !== "all") params.location = selectedLocationFilter;
    if (selectedFormat !== "json") params.format = selectedFormat;
    setSearchParams(params);
  };
  reactExports.useEffect(() => {
    updateUrlParams();
  }, [selectedReportType, dateRangeStart, dateRangeEnd, selectedLocationFilter, selectedFormat]);
  const setDateRangePreset = (preset) => {
    const today = /* @__PURE__ */ new Date();
    let startDate = /* @__PURE__ */ new Date();
    let endDate = /* @__PURE__ */ new Date();
    switch (preset) {
      case "today":
        startDate = today;
        endDate = today;
        break;
      case "yesterday":
        startDate = new Date(today.getTime() - 24 * 60 * 60 * 1e3);
        endDate = new Date(today.getTime() - 24 * 60 * 60 * 1e3);
        break;
      case "last_7_days":
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1e3);
        endDate = today;
        break;
      case "last_30_days":
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1e3);
        endDate = today;
        break;
      case "this_month":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case "last_month": {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        startDate = lastMonth;
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      }
    }
    setDateRangeStart(startDate.toISOString().split("T")[0]);
    setDateRangeEnd(endDate.toISOString().split("T")[0]);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-64 bg-white border-r border-gray-200 min-h-screen", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Admin Panel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Reports & Analytics" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "px-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/admin/dashboard",
            className: "flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Dashboard" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/admin/orders",
            className: "flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Orders" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/admin/products",
            className: "flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Products" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/admin/users",
            className: "flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Users" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 font-medium text-xs text-gray-500 uppercase tracking-wider px-4", children: "Reports" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/admin/reports",
            className: "flex items-center space-x-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Generate Reports" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/admin/settings",
            className: "flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-5 h-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Settings" })
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex-1 p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Business Reports" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mt-2", children: "Generate comprehensive business reports with customizable parameters and export options" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex space-x-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setActiveTab("generate"),
            className: `pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "generate" ? "border-purple-600 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
            children: "Generate Reports"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setActiveTab("scheduled"),
            className: `pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "scheduled" ? "border-purple-600 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
            children: "Scheduled Reports"
          }
        )
      ] }) }),
      activeTab === "generate" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-purple-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Select Report Type" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: availableReportTypes.map((reportType) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setSelectedReportType(reportType.id);
                setGeneratedReportData(null);
                setGeneratedReportUrl(null);
                setGenerationError(null);
              },
              className: `p-4 rounded-lg border-2 text-left transition-all ${selectedReportType === reportType.id ? "border-purple-600 bg-purple-50" : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `p-2 rounded-lg ${selectedReportType === reportType.id ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"}`, children: reportType.icon }),
                  selectedReportType === reportType.id && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-3 h-3 text-white", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900 mb-1", children: reportType.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-2", children: reportType.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-xs text-gray-500", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3 mr-1" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: reportType.estimated_duration })
                ] })
              ]
            },
            reportType.id
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Filter, { className: "w-5 h-5 text-purple-600" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Configure Report Parameters" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Date Range" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2 mb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setDateRangePreset("today"),
                      className: "px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors",
                      children: "Today"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setDateRangePreset("yesterday"),
                      className: "px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors",
                      children: "Yesterday"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setDateRangePreset("last_7_days"),
                      className: "px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors",
                      children: "Last 7 Days"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setDateRangePreset("this_month"),
                      className: "px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors",
                      children: "This Month"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Start Date" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "date",
                        value: dateRangeStart,
                        onChange: (e) => {
                          setDateRangeStart(e.target.value);
                          setGenerationError(null);
                        },
                        className: "w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "End Date" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "date",
                        value: dateRangeEnd,
                        onChange: (e) => {
                          setDateRangeEnd(e.target.value);
                          setGenerationError(null);
                        },
                        className: "w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Location Filter" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "select",
                    {
                      value: selectedLocationFilter,
                      onChange: (e) => {
                        setSelectedLocationFilter(e.target.value);
                        setGenerationError(null);
                      },
                      className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 appearance-none transition-all",
                      disabled: locationsLoading,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Locations" }),
                        availableLocations == null ? void 0 : availableLocations.map((location) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: location.location_name, children: location.location_name }, location.location_id))
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" })
                ] }),
                locationsLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Loading locations..." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Export Format" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "radio",
                        name: "format",
                        value: "json",
                        checked: selectedFormat === "json",
                        onChange: (e) => setSelectedFormat(e.target.value),
                        className: "w-4 h-4 text-purple-600 focus:ring-purple-500"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 flex items-center space-x-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileJson, { className: "w-5 h-5 text-gray-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: "JSON Preview" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "View report data in-page" })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "radio",
                        name: "format",
                        value: "csv",
                        checked: selectedFormat === "csv",
                        onChange: (e) => setSelectedFormat(e.target.value),
                        className: "w-4 h-4 text-purple-600 focus:ring-purple-500"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 flex items-center space-x-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileSpreadsheet, { className: "w-5 h-5 text-gray-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: "CSV Export" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Download spreadsheet file" })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "radio",
                        name: "format",
                        value: "pdf",
                        checked: selectedFormat === "pdf",
                        onChange: (e) => setSelectedFormat(e.target.value),
                        className: "w-4 h-4 text-purple-600 focus:ring-purple-500"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3 flex items-center space-x-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 text-gray-600" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: "PDF Export" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Download formatted document" })
                      ] })
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-purple-50 border border-purple-200 rounded-lg p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-purple-900 mb-2", children: "Selected Report" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-purple-700", children: ((_a = availableReportTypes.find((r) => r.id === selectedReportType)) == null ? void 0 : _a.name) || "Daily Sales" }),
                dateRangeStart && dateRangeEnd && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-purple-600 mt-1", children: [
                  new Date(dateRangeStart).toLocaleDateString(),
                  " - ",
                  new Date(dateRangeEnd).toLocaleDateString()
                ] }),
                selectedLocationFilter !== "all" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-purple-600 mt-1", children: [
                  "Location: ",
                  selectedLocationFilter
                ] })
              ] })
            ] })
          ] }),
          generationError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 bg-red-50 border border-red-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700", children: generationError }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex justify-end space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setGeneratedReportData(null);
                  setGeneratedReportUrl(null);
                  setGenerationError(null);
                  setDateRangeStart("");
                  setDateRangeEnd("");
                  setSelectedLocationFilter("all");
                  setSelectedFormat("json");
                  setSelectedReportType("daily_sales");
                },
                className: "px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all",
                children: "Clear Filters"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: generateReport,
                disabled: isGeneratingReport || !dateRangeStart || !dateRangeEnd,
                className: "px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center space-x-2",
                children: isGeneratingReport ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin h-5 w-5 text-white", fill: "none", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Generating..." })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-5 h-5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Generate Report" })
                ] })
              }
            )
          ] })
        ] }),
        generatedReportData && selectedFormat === "json" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "w-5 h-5 text-purple-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Report Preview" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  navigator.clipboard.writeText(JSON.stringify(generatedReportData, null, 2));
                  showToast("success", "Report data copied to clipboard");
                },
                className: "px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
                children: "Copy JSON"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "text-sm text-gray-800 whitespace-pre-wrap", children: JSON.stringify(generatedReportData, null, 2) }) })
        ] }),
        selectedFormat !== "json" && generatedReportUrl === null && !isGeneratingReport && !generationError && dateRangeStart && dateRangeEnd && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-8 h-8 text-purple-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Ready to Generate" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600 mb-4", children: [
            'Click "Generate Report" to create and download your ',
            selectedFormat.toUpperCase(),
            " file"
          ] })
        ] })
      ] }),
      activeTab === "scheduled" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-5 h-5 text-yellow-600 mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-yellow-900 mb-1", children: "Feature In Development" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-yellow-700 mb-3", children: "Scheduled reports functionality requires the following backend endpoints to be implemented:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-xs text-yellow-600 space-y-1 list-disc list-inside", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-yellow-100 px-1 py-0.5 rounded", children: "GET /api/reports/scheduled" }),
                " - Fetch scheduled reports"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-yellow-100 px-1 py-0.5 rounded", children: "POST /api/reports/scheduled" }),
                " - Create scheduled report"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-yellow-100 px-1 py-0.5 rounded", children: "PUT /api/reports/scheduled/:id" }),
                " - Update scheduled report"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-yellow-100 px-1 py-0.5 rounded", children: "DELETE /api/reports/scheduled/:id" }),
                " - Delete scheduled report"
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 flex items-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5 text-purple-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Scheduled Reports" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                disabled: true,
                className: "px-4 py-2 bg-purple-200 text-purple-400 font-medium rounded-lg cursor-not-allowed flex items-center space-x-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Schedule New Report" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-8 h-8 text-gray-400" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No Scheduled Reports Yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "Scheduled reports will appear here once the feature is enabled" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "This feature requires backend API implementation" })
          ] })
        ] })
      ] })
    ] })
  ] }) }) });
};
export {
  UV_AdminReports as default
};
