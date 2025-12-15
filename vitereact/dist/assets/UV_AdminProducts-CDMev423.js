import { l as useSearchParams, n as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, s as Plus, a3 as Search, al as ChevronDown, X, d as CircleAlert, i as Package, am as Image, D as CircleCheckBig, z as CircleX, O as Star, E as EyeOff, an as Tag, Y as Pen, _ as Trash2, ae as Upload, b as axios } from "./index-1l1MB-L0.js";
import { u as useMutation } from "./useMutation-9MRSSmm2.js";
const UV_AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const availableLocations = useAppStore((state) => state.location_state.available_locations);
  const showToast = useAppStore((state) => state.show_toast);
  const showConfirmation = useAppStore((state) => state.show_confirmation);
  const hideConfirmation = useAppStore((state) => state.hide_confirmation);
  const initialFilters = {
    location: searchParams.get("location") || null,
    availability: searchParams.get("availability") || "all",
    category: searchParams.get("category") || null,
    search: searchParams.get("search") || "",
    sort_by: searchParams.get("sort_by") || "created_at",
    sort_order: searchParams.get("sort_order") || "desc"
  };
  const [productFilters, setProductFilters] = reactExports.useState(initialFilters);
  const [productFormModalOpen, setProductFormModalOpen] = reactExports.useState(false);
  const [productFormMode, setProductFormMode] = reactExports.useState("create");
  const [productFormData, setProductFormData] = reactExports.useState({
    product_id: null,
    product_name: "",
    short_description: "",
    long_description: "",
    category: "pastries",
    price: 0,
    compare_at_price: null,
    primary_image_url: "",
    additional_images: [],
    availability_status: "in_stock",
    stock_quantity: null,
    low_stock_threshold: null,
    dietary_tags: [],
    custom_tags: [],
    is_featured: false,
    is_visible: true,
    available_for_corporate: true,
    available_from_date: null,
    available_until_date: null,
    location_assignments: []
  });
  const [productFormErrors, setProductFormErrors] = reactExports.useState({});
  const [selectedProductsForBulk, setSelectedProductsForBulk] = reactExports.useState([]);
  const [imageUploadProgress, setImageUploadProgress] = reactExports.useState({
    uploading: false,
    progress: 0,
    uploaded_urls: []
  });
  reactExports.useEffect(() => {
    const params = {};
    if (productFilters.location) params.location = productFilters.location;
    if (productFilters.availability !== "all") params.availability = productFilters.availability;
    if (productFilters.category) params.category = productFilters.category;
    if (productFilters.search) params.search = productFilters.search;
    params.sort_by = productFilters.sort_by;
    params.sort_order = productFilters.sort_order;
    setSearchParams(params);
  }, [productFilters, setSearchParams]);
  const fetchProducts = async () => {
    const params = {
      limit: 100,
      offset: 0,
      sort_by: productFilters.sort_by,
      sort_order: productFilters.sort_order,
      is_archived: "false",
      show_hidden: "true"
      // Admin can see hidden products
    };
    if (productFilters.search) params.query = productFilters.search;
    if (productFilters.category) params.category = productFilters.category;
    if (productFilters.availability !== "all") params.availability_status = productFilters.availability;
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/products`,
      {
        params,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  };
  const createProduct = async (data) => {
    const payload = {
      product_name: data.product_name,
      short_description: data.short_description,
      long_description: data.long_description || null,
      category: data.category,
      price: data.price,
      compare_at_price: data.compare_at_price,
      primary_image_url: data.primary_image_url,
      additional_images: data.additional_images.length > 0 ? JSON.stringify(data.additional_images) : null,
      availability_status: data.availability_status,
      stock_quantity: data.stock_quantity,
      low_stock_threshold: data.low_stock_threshold,
      dietary_tags: data.dietary_tags.length > 0 ? JSON.stringify(data.dietary_tags) : null,
      custom_tags: data.custom_tags.length > 0 ? JSON.stringify(data.custom_tags) : null,
      is_featured: data.is_featured,
      is_visible: data.is_visible,
      available_for_corporate: data.available_for_corporate,
      available_from_date: data.available_from_date,
      available_until_date: data.available_until_date,
      location_assignments: data.location_assignments
    };
    const response = await axios.post(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/products`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  };
  const updateProduct = async (data) => {
    const payload = {
      product_id: data.product_id,
      product_name: data.product_name,
      short_description: data.short_description,
      long_description: data.long_description || null,
      category: data.category,
      price: data.price,
      compare_at_price: data.compare_at_price,
      primary_image_url: data.primary_image_url,
      additional_images: data.additional_images.length > 0 ? JSON.stringify(data.additional_images) : null,
      availability_status: data.availability_status,
      stock_quantity: data.stock_quantity,
      low_stock_threshold: data.low_stock_threshold,
      dietary_tags: data.dietary_tags.length > 0 ? JSON.stringify(data.dietary_tags) : null,
      custom_tags: data.custom_tags.length > 0 ? JSON.stringify(data.custom_tags) : null,
      is_featured: data.is_featured,
      is_visible: data.is_visible,
      available_for_corporate: data.available_for_corporate,
      available_from_date: data.available_from_date,
      available_until_date: data.available_until_date,
      location_assignments: data.location_assignments
    };
    const response = await axios.put(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/products/${data.product_id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  };
  const deleteProduct = async (product_id) => {
    const response = await axios.delete(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/products/${product_id}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  };
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ["products", productFilters],
    queryFn: fetchProducts,
    staleTime: 6e4,
    refetchOnWindowFocus: false,
    retry: 1,
    select: (data) => {
      var _a;
      return {
        products: ((_a = data.data) == null ? void 0 : _a.map((p) => ({
          ...p,
          price: Number(p.price || 0),
          compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
          stock_quantity: p.stock_quantity ? Number(p.stock_quantity) : null,
          low_stock_threshold: p.low_stock_threshold ? Number(p.low_stock_threshold) : null
        }))) || [],
        total: data.total || 0
      };
    }
  });
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-locations"] });
      setProductFormModalOpen(false);
      resetProductForm();
      showToast("success", "Product created successfully");
    },
    onError: (error) => {
      var _a, _b;
      const message = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to create product";
      showToast("error", message);
    }
  });
  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-locations"] });
      setProductFormModalOpen(false);
      resetProductForm();
      showToast("success", "Product updated successfully");
    },
    onError: (error) => {
      var _a, _b;
      const message = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update product";
      showToast("error", message);
    }
  });
  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("success", "Product archived successfully");
    },
    onError: (error) => {
      var _a, _b;
      const message = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to delete product";
      showToast("error", message);
    }
  });
  const resetProductForm = () => {
    setProductFormData({
      product_id: null,
      product_name: "",
      short_description: "",
      long_description: "",
      category: "pastries",
      price: 0,
      compare_at_price: null,
      primary_image_url: "",
      additional_images: [],
      availability_status: "in_stock",
      stock_quantity: null,
      low_stock_threshold: null,
      dietary_tags: [],
      custom_tags: [],
      is_featured: false,
      is_visible: true,
      available_for_corporate: true,
      available_from_date: null,
      available_until_date: null,
      location_assignments: []
    });
    setProductFormErrors({});
  };
  const openCreateModal = () => {
    resetProductForm();
    setProductFormMode("create");
    setProductFormModalOpen(true);
  };
  const openEditModal = async (product) => {
    let locationAssignments = [];
    try {
      const response = await axios.get(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/product-locations`,
        {
          params: { product_id: product.product_id },
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      locationAssignments = response.data.map((assignment) => assignment.location_name);
    } catch (error) {
      console.error("Failed to fetch location assignments:", error);
      showToast("warning", "Could not load location assignments");
    }
    setProductFormData({
      product_id: product.product_id,
      product_name: product.product_name,
      short_description: product.short_description,
      long_description: product.long_description || "",
      category: product.category,
      price: product.price,
      compare_at_price: product.compare_at_price,
      primary_image_url: product.primary_image_url,
      additional_images: product.additional_images ? JSON.parse(product.additional_images) : [],
      availability_status: product.availability_status,
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      dietary_tags: product.dietary_tags ? (() => {
        try {
          return JSON.parse(product.dietary_tags);
        } catch {
          return product.dietary_tags.split(",");
        }
      })() : [],
      custom_tags: product.custom_tags ? (() => {
        try {
          return JSON.parse(product.custom_tags);
        } catch {
          return product.custom_tags.split(",");
        }
      })() : [],
      is_featured: product.is_featured,
      is_visible: product.is_visible,
      available_for_corporate: product.available_for_corporate,
      available_from_date: product.available_from_date,
      available_until_date: product.available_until_date,
      location_assignments: locationAssignments
    });
    setProductFormMode("edit");
    setProductFormModalOpen(true);
  };
  const validateProductForm = () => {
    const errors = {};
    if (!productFormData.product_name.trim()) {
      errors.product_name = "Product name is required";
    } else if (productFormData.product_name.length > 255) {
      errors.product_name = "Product name must be 255 characters or less";
    }
    if (!productFormData.short_description.trim()) {
      errors.short_description = "Short description is required";
    } else if (productFormData.short_description.length > 500) {
      errors.short_description = "Short description must be 500 characters or less";
    }
    if (productFormData.long_description && productFormData.long_description.length > 2e3) {
      errors.long_description = "Long description must be 2000 characters or less";
    }
    if (!productFormData.price || productFormData.price <= 0) {
      errors.price = "Price must be greater than 0";
    }
    if (productFormData.compare_at_price && productFormData.compare_at_price <= productFormData.price) {
      errors.compare_at_price = "Compare at price must be greater than regular price";
    }
    if (!productFormData.primary_image_url.trim()) {
      errors.primary_image_url = "Product image is required";
    }
    if (productFormData.location_assignments.length === 0) {
      errors.location_assignments = "Please assign at least one location";
    }
    setProductFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleFilterChange = (key, value) => {
    setProductFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const handleProductFormChange = (key, value) => {
    setProductFormData((prev) => ({
      ...prev,
      [key]: value
    }));
    if (productFormErrors[key]) {
      setProductFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };
  const handleImageUpload = (e, isPrimary = true) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadstart = () => {
      setImageUploadProgress((prev) => ({ ...prev, uploading: true, progress: 0 }));
    };
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round(event.loaded / event.total * 100);
        setImageUploadProgress((prev) => ({ ...prev, progress }));
      }
    };
    reader.onload = () => {
      const imageUrl = reader.result;
      if (isPrimary) {
        handleProductFormChange("primary_image_url", imageUrl);
      } else {
        handleProductFormChange("additional_images", [
          ...productFormData.additional_images,
          imageUrl
        ]);
      }
      setImageUploadProgress({ uploading: false, progress: 0, uploaded_urls: [] });
      showToast("success", "Image uploaded successfully");
    };
    reader.onerror = () => {
      setImageUploadProgress({ uploading: false, progress: 0, uploaded_urls: [] });
      showToast("error", "Failed to upload image");
    };
    reader.readAsDataURL(file);
  };
  const removeAdditionalImage = (index) => {
    handleProductFormChange(
      "additional_images",
      productFormData.additional_images.filter((_, i) => i !== index)
    );
  };
  const handleSubmitProductForm = async (e) => {
    e.preventDefault();
    if (!validateProductForm()) {
      showToast("error", "Please fix validation errors");
      return;
    }
    if (productFormMode === "create") {
      createProductMutation.mutate(productFormData);
    } else {
      updateProductMutation.mutate(productFormData);
    }
  };
  const handleDeleteProduct = (product) => {
    showConfirmation({
      title: "Delete Product",
      message: `Are you sure you want to archive "${product.product_name}"? This product will no longer appear in menus but order history will be preserved.`,
      confirm_text: "Archive Product",
      cancel_text: "Cancel",
      danger_action: true,
      on_confirm: () => {
        deleteProductMutation.mutate(product.product_id);
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      }
    });
  };
  const toggleProductSelection = (product_id) => {
    setSelectedProductsForBulk(
      (prev) => prev.includes(product_id) ? prev.filter((id) => id !== product_id) : [...prev, product_id]
    );
  };
  const toggleSelectAll = () => {
    if (selectedProductsForBulk.length === (productsData == null ? void 0 : productsData.products.length)) {
      setSelectedProductsForBulk([]);
    } else {
      setSelectedProductsForBulk((productsData == null ? void 0 : productsData.products.map((p) => p.product_id)) || []);
    }
  };
  const handleBulkAvailabilityUpdate = (_status) => {
    showToast("info", "Bulk update endpoint not yet implemented");
  };
  const addDietaryTag = (tag) => {
    if (tag && !productFormData.dietary_tags.includes(tag)) {
      handleProductFormChange("dietary_tags", [...productFormData.dietary_tags, tag]);
    }
  };
  const removeDietaryTag = (tag) => {
    handleProductFormChange(
      "dietary_tags",
      productFormData.dietary_tags.filter((t) => t !== tag)
    );
  };
  const toggleLocationAssignment = (location) => {
    if (productFormData.location_assignments.includes(location)) {
      handleProductFormChange(
        "location_assignments",
        productFormData.location_assignments.filter((l) => l !== location)
      );
    } else {
      handleProductFormChange(
        "location_assignments",
        [...productFormData.location_assignments, location]
      );
    }
  };
  const products = reactExports.useMemo(() => (productsData == null ? void 0 : productsData.products) || [], [productsData]);
  const totalCount = reactExports.useMemo(() => (productsData == null ? void 0 : productsData.total) || 0, [productsData]);
  const filteredProducts = reactExports.useMemo(() => {
    if (!productFilters.location) return products;
    return products;
  }, [products, productFilters.location]);
  const commonDietaryTags = ["vegetarian", "vegan", "gluten_free", "dairy_free", "sugar_free", "organic"];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Product Catalog" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Manage your products, pricing, and availability" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: openCreateModal,
          className: "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 mr-2" }),
            "Add New Product"
          ]
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Search products...",
              value: productFilters.search,
              onChange: (e) => handleFilterChange("search", e.target.value),
              className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: productFilters.category || "",
            onChange: (e) => handleFilterChange("category", e.target.value || null),
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Categories" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pastries", children: "Pastries" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "breads", children: "Breads" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cakes", children: "Cakes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "corporate", children: "Corporate" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: productFilters.availability,
            onChange: (e) => handleFilterChange("availability", e.target.value),
            className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_stock", children: "In Stock" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "out_of_stock", children: "Out of Stock" })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: `${productFilters.sort_by}_${productFilters.sort_order}`,
              onChange: (e) => {
                const [sort_by, sort_order] = e.target.value.split("_");
                setProductFilters((prev) => ({ ...prev, sort_by, sort_order }));
              },
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "created_at_desc", children: "Newest First" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "created_at_asc", children: "Oldest First" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "product_name_asc", children: "Name A-Z" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "product_name_desc", children: "Name Z-A" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_asc", children: "Price Low-High" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_desc", children: "Price High-Low" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
            totalCount,
            " products"
          ] }),
          (productFilters.search || productFilters.category || productFilters.availability !== "all") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "•" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setProductFilters({
                    location: null,
                    availability: "all",
                    category: null,
                    search: "",
                    sort_by: "created_at",
                    sort_order: "desc"
                  });
                },
                className: "text-blue-600 hover:text-blue-800 font-medium",
                children: "Clear filters"
              }
            )
          ] })
        ] }),
        selectedProductsForBulk.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-gray-700", children: [
            selectedProductsForBulk.length,
            " selected"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleBulkAvailabilityUpdate(),
              className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors",
              children: "Mark In Stock"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleBulkAvailabilityUpdate(),
              className: "px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium transition-colors",
              children: "Mark Out of Stock"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setSelectedProductsForBulk([]),
              className: "p-2 text-gray-600 hover:text-gray-900",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: productsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading products..." })
    ] }) }) : productsError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-12 h-12 text-red-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-red-900 mb-2", children: "Failed to Load Products" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700", children: "Please try refreshing the page" })
    ] }) : filteredProducts.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl border-2 border-gray-200 p-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No Products Found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: productFilters.search || productFilters.category ? "Try adjusting your filters or search terms" : "Get started by adding your first product" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: openCreateModal,
          className: "inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 mr-2" }),
            "Add Your First Product"
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "checkbox",
            checked: selectedProductsForBulk.length === filteredProducts.length && filteredProducts.length > 0,
            onChange: toggleSelectAll,
            className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "ml-2 text-sm font-medium text-gray-700", children: "Select All" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filteredProducts.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-48 bg-gray-100", children: [
              product.primary_image_url ? /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: product.primary_image_url,
                  alt: product.product_name,
                  className: "w-full h-full object-cover"
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-16 h-16 text-gray-300" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 left-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: selectedProductsForBulk.includes(product.product_id),
                  onChange: () => toggleProductSelection(product.product_id),
                  className: "w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 bg-white/90"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-3 right-3", children: product.availability_status === "in_stock" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-3 h-3 mr-1" }),
                "In Stock"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-3 h-3 mr-1" }),
                "Out of Stock"
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-3 left-3 flex gap-2", children: [
                product.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3 h-3 mr-1 fill-current" }),
                  "Featured"
                ] }),
                !product.is_visible && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-3 h-3 mr-1" }),
                  "Hidden"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between mb-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 leading-tight", children: product.product_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1 line-clamp-2", children: product.short_description })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mt-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 capitalize", children: product.category }),
                product.available_for_corporate && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800", children: "Corporate" })
              ] }),
              product.dietary_tags && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 mt-2", children: (() => {
                try {
                  return JSON.parse(product.dietary_tags);
                } catch {
                  return product.dietary_tags.split(",");
                }
              })().map((tag, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "span",
                {
                  className: "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-3 h-3 mr-1" }),
                    tag
                  ]
                },
                index
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-baseline space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold text-gray-900", children: [
                  "€",
                  Number(product.price || 0).toFixed(2)
                ] }),
                product.compare_at_price && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-500 line-through", children: [
                  "€",
                  Number(product.compare_at_price).toFixed(2)
                ] })
              ] }),
              product.stock_quantity !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-sm text-gray-600", children: [
                "Stock: ",
                product.stock_quantity,
                " units",
                product.low_stock_threshold && product.stock_quantity <= product.low_stock_threshold && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-orange-600 font-medium", children: "(Low Stock)" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => openEditModal(product),
                    className: "flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-4 h-4 mr-2" }),
                      "Edit"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleDeleteProduct(product),
                    className: "inline-flex items-center justify-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                  }
                )
              ] })
            ] })
          ]
        },
        product.product_id
      )) })
    ] }) }),
    productFormModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
          onClick: () => setProductFormModalOpen(false)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-white", children: productFormMode === "create" ? "Add New Product" : "Edit Product" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setProductFormModalOpen(false),
              className: "text-white hover:text-gray-200 transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmitProductForm, className: "px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Basic Information" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
                    "Product Name ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      value: productFormData.product_name,
                      onChange: (e) => handleProductFormChange("product_name", e.target.value),
                      className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${productFormErrors.product_name ? "border-red-500" : "border-gray-300"}`,
                      placeholder: "e.g., Classic Croissant"
                    }
                  ),
                  productFormErrors.product_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: productFormErrors.product_name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
                    "Short Description ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      value: productFormData.short_description,
                      onChange: (e) => handleProductFormChange("short_description", e.target.value),
                      rows: 2,
                      maxLength: 500,
                      className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${productFormErrors.short_description ? "border-red-500" : "border-gray-300"}`,
                      placeholder: "Brief product description for listings"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-1", children: [
                    productFormErrors.short_description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-600", children: productFormErrors.short_description }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                      productFormData.short_description.length,
                      "/500"
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Long Description" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "textarea",
                    {
                      value: productFormData.long_description,
                      onChange: (e) => handleProductFormChange("long_description", e.target.value),
                      rows: 4,
                      maxLength: 2e3,
                      className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                      placeholder: "Detailed product description for product detail page"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500", children: [
                    productFormData.long_description.length,
                    "/2000"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
                      "Category ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "select",
                      {
                        value: productFormData.category,
                        onChange: (e) => handleProductFormChange("category", e.target.value),
                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "pastries", children: "Pastries" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "breads", children: "Breads" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "cakes", children: "Cakes" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "corporate", children: "Corporate" })
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: [
                      "Availability ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "select",
                      {
                        value: productFormData.availability_status,
                        onChange: (e) => handleProductFormChange("availability_status", e.target.value),
                        className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_stock", children: "In Stock" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "out_of_stock", children: "Out of Stock" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "discontinued", children: "Discontinued" })
                        ]
                      }
                    )
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Pricing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
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
                      value: productFormData.price,
                      onChange: (e) => handleProductFormChange("price", parseFloat(e.target.value) || 0),
                      className: `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${productFormErrors.price ? "border-red-500" : "border-gray-300"}`,
                      placeholder: "0.00"
                    }
                  ),
                  productFormErrors.price && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: productFormErrors.price })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Compare at Price (€)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      step: "0.01",
                      min: "0",
                      value: productFormData.compare_at_price || "",
                      onChange: (e) => handleProductFormChange("compare_at_price", e.target.value ? parseFloat(e.target.value) : null),
                      className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                      placeholder: "0.00"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Show as discounted if higher than price" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Product Images" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: [
                  "Primary Image ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-4", children: [
                  productFormData.primary_image_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: productFormData.primary_image_url,
                        alt: "Primary",
                        className: "w-full h-full object-cover"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => handleProductFormChange("primary_image_url", ""),
                        className: "absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "file",
                        accept: "image/*",
                        onChange: (e) => handleImageUpload(e, true),
                        className: "hidden",
                        id: "primary-image-upload"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "label",
                      {
                        htmlFor: "primary-image-upload",
                        className: "inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4 mr-2" }),
                          imageUploadProgress.uploading ? `Uploading... ${imageUploadProgress.progress}%` : "Upload Image"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-gray-500", children: "JPG, PNG up to 5MB" })
                  ] })
                ] }),
                productFormErrors.primary_image_url && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", children: productFormErrors.primary_image_url })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Additional Images" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-4 gap-2", children: [
                  productFormData.additional_images.map((url, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "img",
                      {
                        src: url,
                        alt: `Additional ${index + 1}`,
                        className: "w-full h-full object-cover"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => removeAdditionalImage(index),
                        className: "absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
                      }
                    )
                  ] }, index)),
                  productFormData.additional_images.length < 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "file",
                        accept: "image/*",
                        onChange: (e) => handleImageUpload(e, false),
                        className: "hidden",
                        id: "additional-image-upload"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "label",
                      {
                        htmlFor: "additional-image-upload",
                        className: "flex items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-8 h-8 text-gray-400" })
                      }
                    )
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Stock Management" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Stock Quantity" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      min: "0",
                      value: productFormData.stock_quantity || "",
                      onChange: (e) => handleProductFormChange("stock_quantity", e.target.value ? parseInt(e.target.value) : null),
                      className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                      placeholder: "Leave blank for unlimited"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Low Stock Threshold" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      min: "0",
                      value: productFormData.low_stock_threshold || "",
                      onChange: (e) => handleProductFormChange("low_stock_threshold", e.target.value ? parseInt(e.target.value) : null),
                      className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500",
                      placeholder: "Alert when stock is low"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Dietary Tags" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: commonDietaryTags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => productFormData.dietary_tags.includes(tag) ? removeDietaryTag(tag) : addDietaryTag(tag),
                    className: `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${productFormData.dietary_tags.includes(tag) ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
                    children: tag.replace("_", " ")
                  },
                  tag
                )) }),
                productFormData.dietary_tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 pt-2 border-t border-gray-200", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Selected:" }),
                  productFormData.dietary_tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "span",
                    {
                      className: "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800",
                      children: [
                        tag,
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => removeDietaryTag(tag),
                            className: "ml-1.5 hover:text-green-900",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
                          }
                        )
                      ]
                    },
                    tag
                  ))
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: [
                "Location Assignment ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500", children: "*" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Select which locations will display this product on their menu" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: availableLocations.map((location) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "label",
                {
                  className: "flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        checked: productFormData.location_assignments.includes(location.location_name),
                        onChange: () => toggleLocationAssignment(location.location_name),
                        className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm font-medium text-gray-900", children: location.location_name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto text-xs text-gray-500", children: location.city })
                  ]
                },
                location.location_id
              )) }),
              productFormErrors.location_assignments && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", children: productFormErrors.location_assignments })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Available Customizations" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-900 mb-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
                  " All available toppings and sauces can be selected by customers when ordering this product."
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-blue-700", children: "To manage the list of available toppings and sauces, use the Toppings Management page in the admin menu." })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Options" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: productFormData.is_visible,
                      onChange: (e) => handleProductFormChange("is_visible", e.target.checked),
                      className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm font-medium text-gray-900", children: "Visible to Customers" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-xs text-gray-500", children: "(Unchecking will hide this product from customers)" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: productFormData.is_featured,
                      onChange: (e) => handleProductFormChange("is_featured", e.target.checked),
                      className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm font-medium text-gray-900", children: "Featured Product" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: productFormData.available_for_corporate,
                      onChange: (e) => handleProductFormChange("available_for_corporate", e.target.checked),
                      className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm font-medium text-gray-900", children: "Available for Corporate Orders" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 pt-6 border-t border-gray-200 flex items-center justify-end space-x-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setProductFormModalOpen(false),
                className: "px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "submit",
                disabled: createProductMutation.isPending || updateProductMutation.isPending,
                className: "px-6 py-2.5 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                children: createProductMutation.isPending || updateProductMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white", fill: "none", viewBox: "0 0 24 24", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })
                  ] }),
                  productFormMode === "create" ? "Creating..." : "Updating..."
                ] }) : productFormMode === "create" ? "Create Product" : "Update Product"
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] }) });
};
export {
  UV_AdminProducts as default
};
