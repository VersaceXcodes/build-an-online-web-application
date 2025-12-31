import { u as useAppStore, l as useSearchParams, a as useQuery, r as reactExports, j as jsxRuntimeExports, Z as RefreshCw, ai as Download, a7 as TriangleAlert, a3 as ShoppingCart, aj as DollarSign, J as Calendar, C as Clock, i as Package, L as Link, U as Users, f as Cookie, W as MessageSquare, ak as ChartColumn, S as Sparkles, Q as House, al as Scale, am as GraduationCap, b as axios } from "./index-CwVo5_So.js";
const fetchDashboardMetrics = async (token, date_range, start_date, end_date, location) => {
  const params = { date_range };
  if (date_range === "custom" && start_date && end_date) {
    params.start_date = start_date;
    params.end_date = end_date;
  }
  if (location !== "all") {
    params.location = location;
  }
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/analytics/dashboard`,
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const exportDashboardReport = async (token, report_type, date_from, date_to, location, format) => {
  const params = { report_type, format };
  if (date_from) params.date_from = date_from;
  if (date_to) params.date_to = date_to;
  if (location !== "all") params.location = location;
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/analytics/reports`,
    {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: "blob"
    }
  );
  return response.data;
};
const UV_AdminDashboard = () => {
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const showToast = useAppStore((state) => state.show_toast);
  const showLoading = useAppStore((state) => state.show_loading);
  const hideLoading = useAppStore((state) => state.hide_loading);
  const [searchParams, setSearchParams] = useSearchParams();
  const date_range = searchParams.get("date_range") || "this_week";
  const start_date = searchParams.get("start_date") || null;
  const end_date = searchParams.get("end_date") || null;
  const location_filter = searchParams.get("location") || "all";
  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ["dashboard-metrics", date_range, start_date, end_date, location_filter],
    queryFn: () => fetchDashboardMetrics(
      authToken,
      date_range,
      start_date,
      end_date,
      location_filter
    ),
    enabled: !!authToken,
    staleTime: 6e4,
    // 1 minute
    refetchInterval: 6e4
    // Auto-refresh every minute
  });
  const ordersByStatus = reactExports.useMemo(() => {
    return (metrics == null ? void 0 : metrics.orders_by_status) || {};
  }, [metrics]);
  const ordersByLocation = reactExports.useMemo(() => {
    return (metrics == null ? void 0 : metrics.orders_by_location) || {};
  }, [metrics]);
  const topProducts = reactExports.useMemo(() => {
    return (metrics == null ? void 0 : metrics.top_products) || [];
  }, [metrics]);
  const operationalAlerts = reactExports.useMemo(() => {
    const lateOrders = ordersByStatus["paid_awaiting_confirmation"] || 0;
    return {
      late_orders_count: lateOrders,
      inventory_alerts_pending: 0,
      // Would come from separate endpoint
      staff_feedback_pending: 0
      // Would come from separate endpoint
    };
  }, [ordersByStatus]);
  const handleDateRangeChange = (range) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("date_range", range);
    if (range !== "custom") {
      newParams.delete("start_date");
      newParams.delete("end_date");
    }
    setSearchParams(newParams);
  };
  const handleLocationChange = (location) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("location", location);
    setSearchParams(newParams);
  };
  const handleExportReport = async (format) => {
    if (!authToken) return;
    try {
      showLoading("Generating report...");
      const blob = await exportDashboardReport(
        authToken,
        "daily_sales",
        start_date,
        end_date,
        location_filter,
        format
      );
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard-report-${date_range}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      hideLoading();
      showToast("success", "Report downloaded successfully");
    } catch (error) {
      hideLoading();
      showToast("error", "Failed to download report");
      console.error("Export error:", error);
    }
  };
  const handleManualRefresh = () => {
    refetchMetrics();
    showToast("info", "Dashboard refreshed");
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };
  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-IE").format(num);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gradient-to-br from-gray-50 to-gray-100", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white shadow-sm border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Business Analytics" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-sm text-gray-600", children: [
            "Welcome back, ",
            currentUser == null ? void 0 : currentUser.first_name,
            ". Here's what's happening with your business."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleManualRefresh,
              disabled: metricsLoading,
              className: "inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `h-4 w-4 mr-2 ${metricsLoading ? "animate-spin" : ""}` }),
                "Refresh"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleExportReport("csv"),
              className: "inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
                "Export CSV"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleExportReport("pdf"),
              className: "inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 mr-2" }),
                "Export PDF"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col sm:flex-row gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "date-range", className: "block text-sm font-medium text-gray-700 mb-1", children: "Date Range" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "date-range",
              value: date_range,
              onChange: (e) => handleDateRangeChange(e.target.value),
              className: "block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "today", children: "Today" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "this_week", children: "This Week" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "this_month", children: "This Month" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "last_month", children: "Last Month" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "custom", children: "Custom Range" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "location", className: "block text-sm font-medium text-gray-700 mb-1", children: "Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "location",
              value: location_filter,
              onChange: (e) => handleLocationChange(e.target.value),
              className: "block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Locations" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "blanchardstown", children: "Blanchardstown" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "tallaght", children: "Tallaght" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "glasnevin", children: "Glasnevin" })
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      metricsError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 text-red-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700", children: "Failed to load dashboard metrics. Please try again." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => refetchMetrics(),
              className: "mt-2 text-sm font-medium text-red-700 hover:text-red-600",
              children: "Retry"
            }
          )
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "Today's Orders" }),
            metricsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold text-gray-900", children: formatNumber((metrics == null ? void 0 : metrics.today_orders_count) || 0) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-blue-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-6 w-6 text-blue-600" }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "Today's Revenue" }),
            metricsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-8 w-24 bg-gray-200 rounded animate-pulse" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold text-gray-900", children: formatCurrency((metrics == null ? void 0 : metrics.today_revenue) || 0) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-green-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DollarSign, { className: "h-6 w-6 text-green-600" }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "This Week" }),
            metricsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold text-gray-900", children: formatNumber((metrics == null ? void 0 : metrics.this_week_orders_count) || 0) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: formatCurrency((metrics == null ? void 0 : metrics.this_week_revenue) || 0) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-purple-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-6 w-6 text-purple-600" }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 transition-all hover:shadow-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active Orders" }),
            metricsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-bold text-gray-900", children: formatNumber((metrics == null ? void 0 : metrics.active_orders_count) || 0) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-500", children: "In progress" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-orange-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-6 w-6 text-orange-600" }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Orders by Status" }),
          metricsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 bg-gray-200 rounded animate-pulse" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            Object.entries(ordersByStatus).map(([status, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-3 h-3 rounded-full ${status === "paid_awaiting_confirmation" ? "bg-yellow-500" : status === "accepted_in_preparation" ? "bg-blue-500" : status === "ready_for_collection" ? "bg-green-500" : status === "out_for_delivery" ? "bg-purple-500" : "bg-gray-400"}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700 capitalize", children: status.replace(/_/g, " ") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-gray-900", children: count })
            ] }, status)),
            Object.keys(ordersByStatus).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-gray-500 py-8", children: "No active orders" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Orders by Location" }),
          metricsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 bg-gray-200 rounded animate-pulse" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            Object.entries(ordersByLocation).map(([location, count]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700 capitalize", children: location }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-gray-900", children: count }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "bg-blue-600 h-2 rounded-full transition-all",
                    style: {
                      width: `${count / ((metrics == null ? void 0 : metrics.today_orders_count) || 1) * 100}%`
                    }
                  }
                ) })
              ] })
            ] }, location)),
            Object.keys(ordersByLocation).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-gray-500 py-8", children: "No location data" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Top Selling Products" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5 text-gray-400" })
        ] }),
        metricsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 bg-gray-200 rounded animate-pulse" }, i)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          topProducts.slice(0, 5).map((product, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-md transition-all", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full font-bold", children: index + 1 }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: product.product_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
                  formatNumber(product.quantity_sold),
                  " sold"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-gray-900", children: formatCurrency(product.revenue) }) })
          ] }, index)),
          topProducts.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-gray-500 py-8", children: "No product sales data" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Operational Alerts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/admin/orders?status=paid_awaiting_confirmation",
              className: "p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg hover:bg-yellow-100 transition-all",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-yellow-800", children: "Late Orders" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-yellow-900 mt-1", children: operationalAlerts.late_orders_count })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-8 w-8 text-yellow-600" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/admin/inventory/alerts?status=pending",
              className: "p-4 bg-red-50 border-l-4 border-red-400 rounded-lg hover:bg-red-100 transition-all",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-red-800", children: "Inventory Alerts" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-red-900 mt-1", children: operationalAlerts.inventory_alerts_pending })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-8 w-8 text-red-600" })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/admin/staff-feedback?status=pending",
              className: "p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg hover:bg-blue-100 transition-all",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-blue-800", children: "Staff Feedback" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-2xl font-bold text-blue-900 mt-1", children: operationalAlerts.staff_feedback_pending })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-8 w-8 text-blue-600" })
              ] })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Quick Actions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/admin/orders",
              className: "flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-8 w-8 text-blue-600 mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-blue-900", children: "Manage Orders" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/admin/products",
              className: "flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:from-green-100 hover:to-green-200 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-8 w-8 text-green-600 mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-green-900", children: "Products" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/admin/toppings",
              className: "flex flex-col items-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg hover:from-amber-100 hover:to-amber-200 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Cookie, { className: "h-8 w-8 text-amber-600 mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-amber-900", children: "Toppings" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/admin/users",
              className: "flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:from-purple-100 hover:to-purple-200 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-8 w-8 text-purple-600 mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-purple-900", children: "Users" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/admin/feedback-all",
              className: "flex flex-col items-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg hover:from-pink-100 hover:to-pink-200 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-8 w-8 text-pink-600 mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-pink-900", children: "All Feedback" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/admin/reports",
              className: "flex flex-col items-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:from-orange-100 hover:to-orange-200 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ChartColumn, { className: "h-8 w-8 text-orange-600 mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-orange-900", children: "Reports" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/admin/events",
              className: "flex flex-col items-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg hover:from-indigo-100 hover:to-indigo-200 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-8 w-8 text-indigo-600 mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-indigo-900", children: "Event Alerts" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/admin/homepage",
              className: "flex flex-col items-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg hover:from-teal-100 hover:to-teal-200 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "h-8 w-8 text-teal-600 mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-teal-900", children: "Homepage Content" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/admin/legal",
              className: "flex flex-col items-center p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg hover:from-slate-100 hover:to-slate-200 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Scale, { className: "h-8 w-8 text-slate-600 mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-slate-900", children: "Legal Pages" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/admin/training",
              className: "flex flex-col items-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg hover:from-emerald-100 hover:to-emerald-200 transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(GraduationCap, { className: "h-8 w-8 text-emerald-600 mb-2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-emerald-900", children: "Training" })
              ]
            }
          )
        ] })
      ] })
    ] })
  ] }) });
};
export {
  UV_AdminDashboard as default
};
