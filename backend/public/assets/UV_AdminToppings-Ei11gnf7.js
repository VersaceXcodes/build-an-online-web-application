import { l as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, q as Plus, W as Pen, Z as Trash2, X, aN as Save, b as axios } from "./index-nYaE10KP.js";
import { u as useMutation } from "./useMutation-BdRga-lQ.js";
const UV_AdminToppings = () => {
  const queryClient = useQueryClient();
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const showConfirmation = useAppStore((state) => state.show_confirmation);
  const hideConfirmation = useAppStore((state) => state.hide_confirmation);
  const [toppingFormModalOpen, setToppingFormModalOpen] = reactExports.useState(false);
  const [toppingFormMode, setToppingFormMode] = reactExports.useState("create");
  const [toppingFormData, setToppingFormData] = reactExports.useState({
    topping_id: null,
    topping_name: "",
    topping_type: "topping",
    price: 0,
    is_available: true,
    display_order: 0
  });
  const [filterType, setFilterType] = reactExports.useState("all");
  const fetchToppings = async () => {
    const params = {
      limit: "100",
      offset: "0"
    };
    if (filterType !== "all") {
      params.topping_type = filterType;
    }
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/toppings`,
      { params }
    );
    return response.data;
  };
  const createTopping = async (data) => {
    const response = await axios.post(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/toppings`,
      data,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  };
  const updateTopping = async (data) => {
    const response = await axios.put(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/toppings/${data.topping_id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  };
  const deleteTopping = async (topping_id) => {
    const response = await axios.delete(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/toppings/${topping_id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  };
  const { data: toppings = [], isLoading: toppingsLoading } = useQuery({
    queryKey: ["toppings", filterType],
    queryFn: fetchToppings,
    staleTime: 6e4,
    refetchOnWindowFocus: false
  });
  const createToppingMutation = useMutation({
    mutationFn: createTopping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["toppings"] });
      setToppingFormModalOpen(false);
      resetToppingForm();
      showToast("success", "Topping created successfully");
    },
    onError: (error) => {
      var _a, _b;
      const message = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to create topping";
      showToast("error", message);
    }
  });
  const updateToppingMutation = useMutation({
    mutationFn: updateTopping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["toppings"] });
      setToppingFormModalOpen(false);
      resetToppingForm();
      showToast("success", "Topping updated successfully");
    },
    onError: (error) => {
      var _a, _b;
      const message = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update topping";
      showToast("error", message);
    }
  });
  const deleteToppingMutation = useMutation({
    mutationFn: deleteTopping,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["toppings"] });
      showToast("success", "Topping deleted successfully");
    },
    onError: (error) => {
      var _a, _b;
      const message = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to delete topping";
      showToast("error", message);
    }
  });
  const resetToppingForm = () => {
    setToppingFormData({
      topping_id: null,
      topping_name: "",
      topping_type: "topping",
      price: 0,
      is_available: true,
      display_order: 0
    });
  };
  const openCreateModal = () => {
    resetToppingForm();
    setToppingFormMode("create");
    setToppingFormModalOpen(true);
  };
  const openEditModal = (topping) => {
    setToppingFormData({
      topping_id: topping.topping_id,
      topping_name: topping.topping_name,
      topping_type: topping.topping_type,
      price: topping.price,
      is_available: topping.is_available,
      display_order: topping.display_order
    });
    setToppingFormMode("edit");
    setToppingFormModalOpen(true);
  };
  const handleFormChange = (key, value) => {
    setToppingFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!toppingFormData.topping_name.trim()) {
      showToast("error", "Please enter a topping name");
      return;
    }
    if (toppingFormMode === "create") {
      createToppingMutation.mutate(toppingFormData);
    } else {
      updateToppingMutation.mutate(toppingFormData);
    }
  };
  const handleDeleteTopping = (topping) => {
    showConfirmation({
      title: "Delete Topping",
      message: `Are you sure you want to delete "${topping.topping_name}"? This will remove it from all products.`,
      confirm_text: "Delete Topping",
      cancel_text: "Cancel",
      danger_action: true,
      on_confirm: () => {
        deleteToppingMutation.mutate(topping.topping_id);
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      }
    });
  };
  const toppingsList = toppings.filter((t) => t.topping_type === "topping");
  const saucesList = toppings.filter((t) => t.topping_type === "sauce");
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Toppings & Sauces" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Manage toppings and sauces that customers can add to products" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: openCreateModal,
          className: "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 mr-2" }),
            "Add Topping/Sauce"
          ]
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setFilterType("all"),
          className: `px-4 py-3 border-b-2 font-medium text-sm transition-colors ${filterType === "all" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
          children: [
            "All (",
            toppings.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setFilterType("topping"),
          className: `px-4 py-3 border-b-2 font-medium text-sm transition-colors ${filterType === "topping" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
          children: [
            "Toppings (",
            toppingsList.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setFilterType("sauce"),
          className: `px-4 py-3 border-b-2 font-medium text-sm transition-colors ${filterType === "sauce" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
          children: [
            "Sauces (",
            saucesList.length,
            ")"
          ]
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: toppingsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading toppings..." })
    ] }) }) : toppings.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border-2 border-gray-200 p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No Toppings Found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: "Get started by adding your first topping or sauce" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: openCreateModal,
          className: "inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 mr-2" }),
            "Add Topping/Sauce"
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Name" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Type" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Price" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Display Order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: toppings.map((topping) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-gray-900", children: topping.topping_name }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${topping.topping_type === "topping" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"}`, children: topping.topping_type === "topping" ? "🍫 Topping" : "🍯 Sauce" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-900", children: topping.price === 0 ? "Free" : `€${topping.price.toFixed(2)}` }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-900", children: topping.display_order }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: topping.is_available ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800", children: "Available" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800", children: "Unavailable" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => openEditModal(topping),
              className: "inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors mr-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-4 h-4 mr-1" }),
                "Edit"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleDeleteTopping(topping),
              className: "inline-flex items-center px-3 py-1.5 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4 mr-1" }),
                "Delete"
              ]
            }
          )
        ] })
      ] }, topping.topping_id)) })
    ] }) }) }),
    toppingFormModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
          onClick: () => setToppingFormModalOpen(false)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-white", children: toppingFormMode === "create" ? "Add Topping/Sauce" : "Edit Topping/Sauce" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setToppingFormModalOpen(false),
              className: "text-white hover:text-gray-200 transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmitForm, className: "px-6 py-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
                "Name ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: toppingFormData.topping_name,
                  onChange: (e) => handleFormChange("topping_name", e.target.value),
                  className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  placeholder: "e.g., Kinder Bueno",
                  required: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
                "Type ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "select",
                {
                  value: toppingFormData.topping_type,
                  onChange: (e) => handleFormChange("topping_type", e.target.value),
                  className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "topping", children: "Topping" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "sauce", children: "Sauce" })
                  ]
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
                "Price (€) ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  step: "0.01",
                  min: "0",
                  value: toppingFormData.price,
                  onChange: (e) => handleFormChange("price", parseFloat(e.target.value) || 0),
                  className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  placeholder: "0.00"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Set to 0 for free" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Display Order" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  min: "0",
                  value: toppingFormData.display_order,
                  onChange: (e) => handleFormChange("display_order", parseInt(e.target.value) || 0),
                  className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                  placeholder: "0"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Lower numbers appear first" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: toppingFormData.is_available,
                  onChange: (e) => handleFormChange("is_available", e.target.checked),
                  className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "ml-3 text-sm font-medium text-gray-900", children: "Available for customers" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-end space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setToppingFormModalOpen(false),
                className: "px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "submit",
                disabled: createToppingMutation.isPending || updateToppingMutation.isPending,
                className: "inline-flex items-center px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
                  toppingFormMode === "create" ? "Create" : "Update"
                ]
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] }) });
};
export {
  UV_AdminToppings as default
};
