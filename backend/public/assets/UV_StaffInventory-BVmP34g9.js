import { l as useSearchParams, o as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, R as React, j as jsxRuntimeExports, d as CircleAlert, Z as RefreshCw, a5 as Search, i as Package, s as Minus, t as Plus, _ as Pen, D as CircleX, I as CircleCheckBig, b as axios } from "./index-HeRxKVXe.js";
import { u as useMutation } from "./useMutation-7uzCkorR.js";
const fetchInventory = async (params) => {
  const { token, ...queryParams } = params;
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/staff/inventory`,
    {
      params: queryParams,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const updateInventory = async (data) => {
  const { token, product_id, ...body } = data;
  const response = await axios.patch(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/staff/inventory/${product_id}`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const getStockStatus = (product) => {
  if (product.availability_status === "out_of_stock" || product.stock_quantity !== null && product.stock_quantity === 0) {
    return {
      label: "Out of Stock",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-4 h-4" })
    };
  }
  if (product.stock_quantity !== null && product.low_stock_threshold !== null && product.stock_quantity <= product.low_stock_threshold) {
    return {
      label: "Low Stock",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4" })
    };
  }
  return {
    label: "In Stock",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-4 h-4" })
  };
};
const UV_StaffInventory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const categoryFilter = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [editingProduct, setEditingProduct] = reactExports.useState(null);
  const [newQuantity, setNewQuantity] = reactExports.useState("");
  const [localSearchInput, setLocalSearchInput] = reactExports.useState(searchQuery);
  const itemsPerPage = 50;
  const assignedLocations = reactExports.useMemo(() => {
    if (currentUser && "assigned_locations" in currentUser && Array.isArray(currentUser.assigned_locations)) {
      const locations = currentUser.assigned_locations;
      return locations.length > 0 ? locations : [];
    }
    return [];
  }, [currentUser]);
  const currentLocationFilter = searchParams.get("location") || assignedLocations[0] || "";
  const queryParams = reactExports.useMemo(() => ({
    location_name: currentLocationFilter || void 0,
    category: categoryFilter || void 0,
    search: searchQuery || void 0,
    availability_status: statusFilter || void 0,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    token: authToken || ""
  }), [currentLocationFilter, categoryFilter, searchQuery, statusFilter, currentPage, authToken]);
  const { data: inventoryData, isLoading, error } = useQuery({
    queryKey: ["staff-inventory", queryParams],
    queryFn: () => fetchInventory(queryParams),
    enabled: !!authToken && !!currentLocationFilter,
    staleTime: 3e4
  });
  const updateMutation = useMutation({
    mutationFn: (data) => updateInventory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-inventory"] });
      showToast("success", "Inventory updated successfully");
      setEditingProduct(null);
      setNewQuantity("");
    },
    onError: (error2) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error2.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update inventory");
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
  const handleToggleAvailability = (product) => {
    const newStatus = product.availability_status === "out_of_stock" ? "in_stock" : "out_of_stock";
    updateMutation.mutate({
      product_id: product.product_id,
      location_name: currentLocationFilter,
      availability_status: newStatus,
      token: authToken || ""
    });
  };
  const handleUpdateStock = (product) => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) {
      showToast("error", "Please enter a valid quantity");
      return;
    }
    updateMutation.mutate({
      product_id: product.product_id,
      location_name: currentLocationFilter,
      stock_quantity: quantity,
      token: authToken || ""
    });
  };
  const handleQuickAdjust = (product, adjustment) => {
    const currentStock = product.stock_quantity || 0;
    const newStock = Math.max(0, currentStock + adjustment);
    updateMutation.mutate({
      product_id: product.product_id,
      location_name: currentLocationFilter,
      stock_quantity: newStock,
      token: authToken || ""
    });
  };
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchInput !== searchQuery) {
        handleFilterChange("search", localSearchInput);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearchInput]);
  if (assignedLocations.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-red-200 p-12 max-w-md text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900 mb-2", children: "No Location Assigned" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "You don't have any locations assigned. Please contact your administrator to get access." })
    ] }) });
  }
  const totalPages = inventoryData ? Math.ceil(inventoryData.total / itemsPerPage) : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white shadow-sm border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Stock Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: currentLocationFilter })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => queryClient.invalidateQueries({ queryKey: ["staff-inventory"] }),
            disabled: isLoading,
            className: "flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { size: 16, className: isLoading ? "animate-spin" : "" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Refresh" })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-1 md:grid-cols-4 gap-4", children: [
        assignedLocations.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Location" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "select",
            {
              value: currentLocationFilter,
              onChange: (e) => handleFilterChange("location", e.target.value),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              children: assignedLocations.map((loc) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: loc, children: loc }, loc))
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: categoryFilter,
              onChange: (e) => handleFilterChange("category", e.target.value),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Categories" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Signature Kakes", children: "Signature Kakes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Seasonal Special", children: "Seasonal Special" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Celebration Kakes", children: "Celebration Kakes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Mini Kakes", children: "Mini Kakes" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Toppings", children: "Toppings" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Beverages", children: "Beverages" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Stock Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: statusFilter,
              onChange: (e) => handleFilterChange("status", e.target.value),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Status" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_stock", children: "In Stock" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "out_of_stock", children: "Out of Stock" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Search" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: localSearchInput,
                onChange: (e) => setLocalSearchInput(e.target.value),
                placeholder: "Product name...",
                className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { size: 18, className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      inventoryData && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 text-sm text-gray-600", children: [
        "Showing ",
        inventoryData.data.length,
        " of ",
        inventoryData.total,
        " products"
      ] }),
      isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "w-12 h-12 text-blue-500 animate-spin mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 font-medium", children: "Loading inventory..." })
      ] }) }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-red-200 p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-12 h-12 text-red-500 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 font-medium mb-2", children: "Failed to load inventory" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-sm", children: "Please try refreshing the page" })
      ] }) }) : !inventoryData || inventoryData.data.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-12 h-12 text-gray-400 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 font-medium mb-2", children: "No products found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-500 text-sm", children: "Try adjusting your filters" })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Stock" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: inventoryData.data.map((product) => {
          var _a;
          const stockStatus = getStockStatus(product);
          const isEditing = editingProduct === product.product_id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              product.primary_image_url && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: product.primary_image_url,
                  alt: product.product_name,
                  className: "h-12 w-12 rounded-lg object-cover mr-3"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-gray-900", children: product.product_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: product.short_description })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-sm text-gray-900", children: product.category }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${stockStatus.color}`, children: [
              stockStatus.icon,
              stockStatus.label
            ] }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  value: newQuantity,
                  onChange: (e) => setNewQuantity(e.target.value),
                  placeholder: ((_a = product.stock_quantity) == null ? void 0 : _a.toString()) || "0",
                  className: "w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm",
                  autoFocus: true
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => handleUpdateStock(product),
                  disabled: updateMutation.isPending,
                  className: "px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50",
                  children: "Save"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    setEditingProduct(null);
                    setNewQuantity("");
                  },
                  className: "px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300",
                  children: "Cancel"
                }
              )
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => handleQuickAdjust(product, -1),
                  disabled: updateMutation.isPending || (product.stock_quantity || 0) === 0,
                  className: "p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50",
                  title: "Decrease by 1",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { size: 16 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-gray-900 min-w-[40px] text-center", children: product.stock_quantity !== null ? product.stock_quantity : "N/A" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => handleQuickAdjust(product, 1),
                  disabled: updateMutation.isPending,
                  className: "p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50",
                  title: "Increase by 1",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 16 })
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-2", children: [
              !isEditing && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    var _a2;
                    setEditingProduct(product.product_id);
                    setNewQuantity(((_a2 = product.stock_quantity) == null ? void 0 : _a2.toString()) || "0");
                  },
                  className: "p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors",
                  title: "Edit Stock",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { size: 16 })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => handleToggleAvailability(product),
                  disabled: updateMutation.isPending,
                  className: `px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${product.availability_status === "out_of_stock" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"}`,
                  children: product.availability_status === "out_of_stock" ? "Mark Available" : "Mark Unavailable"
                }
              )
            ] }) })
          ] }, product.product_id);
        }) })
      ] }) }) }),
      inventoryData && inventoryData.total > itemsPerPage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-600", children: [
          "Page ",
          currentPage,
          " of ",
          totalPages
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleFilterChange("page", (currentPage - 1).toString()),
              disabled: currentPage === 1,
              className: "px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
              children: "Previous"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleFilterChange("page", (currentPage + 1).toString()),
              disabled: currentPage === totalPages,
              className: "px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed",
              children: "Next"
            }
          )
        ] })
      ] })
    ] })
  ] });
};
export {
  UV_StaffInventory as default
};
