import { d as useParams, h as useSearchParams, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, L as Link, b as axios } from "./index-B48j776u.js";
const UV_Menu = () => {
  const { location_name } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const addToCart = useAppStore((state) => state.add_to_cart);
  const setCartLocation = useAppStore((state) => state.set_cart_location);
  const setFulfillmentMethod = useAppStore((state) => state.set_fulfillment_method);
  const showToast = useAppStore((state) => state.show_toast);
  const cartItems = useAppStore((state) => state.cart_state.items);
  const selectedLocation = useAppStore((state) => state.cart_state.selected_location);
  const [view_mode, setViewMode] = reactExports.useState("grid");
  const [filter_panel_open, setFilterPanelOpen] = reactExports.useState(false);
  const [search_input, setSearchInput] = reactExports.useState(searchParams.get("search") || "");
  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const response = await axios.get(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/locations`
      );
      return response.data;
    },
    staleTime: 6e4
  });
  const slugToLocationName = (slug) => {
    if (!locations) return slug;
    const location = locations.find(
      (loc) => loc.location_name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
    );
    return location ? location.location_name : slug;
  };
  const location_slug = location_name || "london-flagship";
  const current_location_name = slugToLocationName(location_slug);
  const current_fulfillment_method = searchParams.get("fulfillment") || null;
  const active_filters = reactExports.useMemo(() => {
    var _a;
    return {
      category: searchParams.get("category") || null,
      price_min: searchParams.get("price_min") ? parseFloat(searchParams.get("price_min")) : null,
      price_max: searchParams.get("price_max") ? parseFloat(searchParams.get("price_max")) : null,
      dietary_tags: ((_a = searchParams.get("dietary_tags")) == null ? void 0 : _a.split(",").filter(Boolean)) || [],
      availability_status: searchParams.get("availability_status") || null,
      search_query: searchParams.get("search") || ""
    };
  }, [searchParams]);
  const sort_config = reactExports.useMemo(() => ({
    sort_by: searchParams.get("sort_by") || "created_at",
    sort_order: searchParams.get("sort_order") || "desc"
  }), [searchParams]);
  const pagination_state = reactExports.useMemo(() => {
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    return {
      products_per_page: limit,
      current_page: Math.floor(offset / limit) + 1
    };
  }, [searchParams]);
  const { data: assignmentsData, isLoading: assignmentsLoading } = useQuery({
    queryKey: ["product-locations", current_location_name],
    queryFn: async () => {
      const response = await axios.get(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/product-locations`,
        {
          params: {
            location_name: current_location_name,
            limit: 1e3
          }
        }
      );
      return response.data;
    },
    staleTime: 6e4,
    // 1 minute
    refetchOnWindowFocus: false
  });
  const assigned_product_ids = reactExports.useMemo(() => {
    if (!assignmentsData) return [];
    const assignments = Array.isArray(assignmentsData) ? assignmentsData : assignmentsData.data || [];
    return assignments.map((a) => a.product_id);
  }, [assignmentsData]);
  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useQuery({
    queryKey: [
      "products",
      current_location_name,
      active_filters,
      sort_config,
      pagination_state,
      assigned_product_ids
    ],
    queryFn: async () => {
      const params = {
        is_archived: false,
        limit: pagination_state.products_per_page,
        offset: (pagination_state.current_page - 1) * pagination_state.products_per_page,
        sort_by: sort_config.sort_by,
        sort_order: sort_config.sort_order
      };
      if (active_filters.search_query) params.query = active_filters.search_query;
      if (active_filters.category) params.category = active_filters.category;
      if (active_filters.availability_status) params.availability_status = active_filters.availability_status;
      if (active_filters.price_min !== null) params.min_price = active_filters.price_min;
      if (active_filters.price_max !== null) params.max_price = active_filters.price_max;
      const response = await axios.get(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/products`,
        { params }
      );
      return response.data;
    },
    enabled: assigned_product_ids.length > 0,
    // Only fetch when assignments loaded
    staleTime: 3e4,
    // 30 seconds
    select: (data) => {
      let filtered = data.data || [];
      if (assigned_product_ids.length > 0) {
        filtered = filtered.filter((p) => assigned_product_ids.includes(p.product_id));
      }
      if (active_filters.dietary_tags.length > 0) {
        filtered = filtered.filter((product) => {
          if (!product.dietary_tags) return false;
          let productTags = [];
          try {
            productTags = JSON.parse(product.dietary_tags);
          } catch {
            productTags = product.dietary_tags.split(",").map((t) => t.trim());
          }
          const normalizedProductTags = productTags.map((t) => t.toLowerCase().replace(/_/g, "-"));
          const normalizedFilterTags = active_filters.dietary_tags.map((t) => t.toLowerCase().replace(/_/g, "-"));
          return normalizedFilterTags.every((filterTag) => normalizedProductTags.includes(filterTag));
        });
      }
      const transformedProducts = filtered.map((p) => ({
        ...p,
        price: Number(p.price || 0),
        compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
        stock_quantity: p.stock_quantity ? Number(p.stock_quantity) : null
      }));
      return {
        products: transformedProducts,
        total: data.total,
        limit: data.limit,
        offset: data.offset
      };
    }
  });
  const products = (productsData == null ? void 0 : productsData.products) || [];
  const total_products_count = (productsData == null ? void 0 : productsData.total) || 0;
  reactExports.useEffect(() => {
    const timer = setTimeout(() => {
      if (search_input !== active_filters.search_query) {
        updateFilter("search", search_input);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search_input]);
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (key === "price_min" || key === "price_max") {
      const currentMinPrice = key === "price_min" ? value : active_filters.price_min;
      const currentMaxPrice = key === "price_max" ? value : active_filters.price_max;
      if (currentMinPrice !== null && currentMaxPrice !== null && currentMinPrice > currentMaxPrice) {
        showToast("error", "Minimum price cannot be greater than maximum price");
        return;
      }
    }
    if (value === null || value === void 0 || value === "" || Array.isArray(value) && value.length === 0) {
      newParams.delete(key);
    } else if (Array.isArray(value)) {
      newParams.set(key, value.join(","));
    } else {
      newParams.set(key, value.toString());
    }
    if (key !== "offset" && key !== "limit") {
      newParams.delete("offset");
    }
    setSearchParams(newParams);
  };
  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    if (current_fulfillment_method) {
      newParams.set("fulfillment", current_fulfillment_method);
    }
    setSearchParams(newParams);
    setSearchInput("");
  };
  const toggleDietaryTag = (tag) => {
    const current = active_filters.dietary_tags;
    const newTags = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    updateFilter("dietary_tags", newTags);
  };
  const goToPage = (page) => {
    const offset = (page - 1) * pagination_state.products_per_page;
    updateFilter("offset", offset);
  };
  const handleAddToCart = (product) => {
    if (product.availability_status !== "in_stock") {
      showToast("error", "This product is currently out of stock");
      return;
    }
    if (selectedLocation && selectedLocation !== current_location_name) {
      showToast("warning", "Cart cleared - items from different location removed");
    }
    if (cartItems.length === 0) {
      setCartLocation(current_location_name);
      if (current_fulfillment_method) {
        setFulfillmentMethod(current_fulfillment_method);
      }
    }
    addToCart({
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      quantity: 1,
      subtotal: product.price,
      primary_image_url: product.primary_image_url
    });
    showToast("success", `${product.product_name} added to cart!`);
  };
  const dietary_tag_options = [
    { value: "vegan", label: "Vegan" },
    { value: "vegetarian", label: "Vegetarian" },
    { value: "gluten_free", label: "Gluten Free" },
    { value: "dairy_free", label: "Dairy Free" },
    { value: "nut_free", label: "Nut Free" },
    { value: "organic", label: "Organic" }
  ];
  const total_pages = Math.ceil(total_products_count / pagination_state.products_per_page);
  const has_previous = pagination_state.current_page > 1;
  const has_next = pagination_state.current_page < total_pages;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center space-x-2 text-sm text-gray-600 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "hover:text-blue-600 transition-colors", children: "Home" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "/" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: `/location/${location_slug}`, className: "hover:text-blue-600 transition-colors", children: current_location_name.charAt(0).toUpperCase() + current_location_name.slice(1) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "/" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-900 font-medium", children: "Menu" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold text-gray-900", children: [
            current_location_name.charAt(0).toUpperCase() + current_location_name.slice(1),
            " Menu"
          ] }),
          current_fulfillment_method && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mt-1", children: current_fulfillment_method === "delivery" ? "🚚 Delivery" : "🏪 Collection" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 bg-gray-100 rounded-lg p-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("grid"),
              className: `px-4 py-2 rounded-md text-sm font-medium transition-all ${view_mode === "grid" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`,
              children: "Grid"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("list"),
              className: `px-4 py-2 rounded-md text-sm font-medium transition-all ${view_mode === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`,
              children: "List"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "Search for desserts...",
            value: search_input,
            onChange: (e) => setSearchInput(e.target.value),
            className: "w-full px-4 py-3 pl-12 bg-gray-50 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            className: "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              }
            )
          }
        ),
        search_input && /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setSearchInput("");
              updateFilter("search", "");
            },
            className: "absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: productsLoading || assignmentsLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Loading products..." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Showing ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: products.length }),
          " of",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: total_products_count }),
          " products",
          active_filters.search_query && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            ' for "',
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: active_filters.search_query }),
            '"'
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "sort", className: "text-sm text-gray-600 hidden sm:block", children: "Sort by:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              id: "sort",
              value: `${sort_config.sort_by}_${sort_config.sort_order}`,
              onChange: (e) => {
                const [sortBy, sortOrder] = e.target.value.split("_");
                updateFilter("sort_by", sortBy);
                updateFilter("sort_order", sortOrder);
              },
              className: "px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "created_at_desc", children: "Newest First" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "product_name_asc", children: "Name (A-Z)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "product_name_desc", children: "Name (Z-A)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_asc", children: "Price (Low to High)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "price_desc", children: "Price (High to Low)" })
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:grid lg:grid-cols-4 lg:gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setFilterPanelOpen(!filter_panel_open),
          className: "w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Filters ",
              Object.values(active_filters).filter((v) => v !== null && v !== "" && (!Array.isArray(v) || v.length > 0)).length > 0 && `(${Object.values(active_filters).filter((v) => v !== null && v !== "" && (!Array.isArray(v) || v.length > 0)).length})`
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "svg",
              {
                className: `h-5 w-5 transition-transform ${filter_panel_open ? "rotate-180" : ""}`,
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19 9l-7 7-7-7" })
              }
            )
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: `lg:col-span-1 ${filter_panel_open ? "block" : "hidden lg:block"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 sticky top-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Filters" }),
          Object.values(active_filters).some((v) => v !== null && v !== "" && (!Array.isArray(v) || v.length > 0)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: clearAllFilters,
              className: "text-sm text-blue-600 hover:text-blue-700 font-medium",
              children: "Clear All"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Category" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: ["pastries", "breads", "cakes", "corporate"].map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "radio",
                name: "category",
                checked: active_filters.category === cat,
                onChange: () => updateFilter("category", active_filters.category === cat ? null : cat),
                className: "h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm text-gray-700 capitalize", children: cat })
          ] }, cat)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Price Range" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "price_min", className: "text-xs text-gray-600 block mb-1", children: "Min Price (€)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  id: "price_min",
                  min: "0",
                  step: "0.5",
                  value: active_filters.price_min || "",
                  onChange: (e) => updateFilter("price_min", e.target.value ? parseFloat(e.target.value) : null),
                  placeholder: "0.00",
                  className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "price_max", className: "text-xs text-gray-600 block mb-1", children: "Max Price (€)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "number",
                  id: "price_max",
                  min: "0",
                  step: "0.5",
                  value: active_filters.price_max || "",
                  onChange: (e) => updateFilter("price_max", e.target.value ? parseFloat(e.target.value) : null),
                  placeholder: "100.00",
                  className: "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Dietary Preferences" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: dietary_tag_options.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: active_filters.dietary_tags.includes(tag.value),
                onChange: () => toggleDietaryTag(tag.value),
                className: "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm text-gray-700", children: tag.label })
          ] }, tag.value)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Availability" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: active_filters.availability_status === "in_stock",
                onChange: () => updateFilter("availability_status", active_filters.availability_status === "in_stock" ? null : "in_stock"),
                className: "h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-3 text-sm text-gray-700", children: "Hide Out of Stock" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-3", children: [
        (productsLoading || assignmentsLoading) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading delicious treats..." })
        ] }) }),
        productsError && !productsLoading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 mb-4", children: "Failed to load products. Please try again." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => refetchProducts(),
              className: "px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors",
              children: "Retry"
            }
          )
        ] }),
        !productsLoading && !assignmentsLoading && !productsError && products.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "svg",
            {
              className: "mx-auto h-16 w-16 text-gray-400 mb-4",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 1.5,
                  d: "M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No desserts found" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: active_filters.search_query ? `No results for "${active_filters.search_query}"` : "Try adjusting your filters" }),
          Object.values(active_filters).some((v) => v !== null && v !== "" && (!Array.isArray(v) || v.length > 0)) && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: clearAllFilters,
              className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium",
              children: "Clear Filters"
            }
          )
        ] }),
        !productsLoading && !assignmentsLoading && !productsError && products.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: view_mode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4",
              children: products.map((product) => {
                const is_out_of_stock = product.availability_status !== "in_stock";
                let dietary_tags_array = [];
                if (product.dietary_tags) {
                  try {
                    dietary_tags_array = JSON.parse(product.dietary_tags);
                  } catch {
                    dietary_tags_array = product.dietary_tags.split(",").map((t) => t.trim());
                  }
                }
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "div",
                  {
                    className: `bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl ${is_out_of_stock ? "opacity-60" : ""} ${view_mode === "list" ? "flex" : ""}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        Link,
                        {
                          to: `/location/${location_slug}/product/${product.product_id}`,
                          className: `block ${view_mode === "list" ? "w-48 flex-shrink-0" : ""}`,
                          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "img",
                              {
                                src: product.primary_image_url,
                                alt: product.product_name,
                                loading: "lazy",
                                className: `w-full object-cover ${view_mode === "list" ? "h-full" : "h-56"}`
                              }
                            ),
                            product.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded", children: "Featured" }),
                            is_out_of_stock && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-red-600 text-white px-4 py-2 rounded-lg font-semibold", children: "Out of Stock" }) })
                          ] })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-6 ${view_mode === "list" ? "flex-1 flex flex-col justify-between" : ""}`, children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Link,
                            {
                              to: `/location/${location_slug}/product/${product.product_id}`,
                              className: "block",
                              children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2", children: product.product_name })
                            }
                          ),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-3 line-clamp-2", children: product.short_description }),
                          dietary_tags_array.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2 mb-3", children: [
                            dietary_tags_array.slice(0, 3).map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "span",
                              {
                                className: "px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium",
                                children: tag.replace("_", " ")
                              },
                              tag
                            )),
                            dietary_tags_array.length > 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium", children: [
                              "+",
                              dietary_tags_array.length - 3
                            ] })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center ${view_mode === "list" ? "justify-between" : "justify-between"} mt-4`, children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline space-x-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-bold text-gray-900", children: [
                              "€",
                              product.price.toFixed(2)
                            ] }),
                            product.compare_at_price && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-500 line-through", children: [
                              "€",
                              product.compare_at_price.toFixed(2)
                            ] })
                          ] }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "button",
                            {
                              onClick: () => handleAddToCart(product),
                              disabled: is_out_of_stock,
                              className: `px-6 py-3 rounded-lg font-medium transition-all duration-200 ${is_out_of_stock ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg transform hover:scale-105"}`,
                              children: is_out_of_stock ? "Out of Stock" : "Add to Cart"
                            }
                          )
                        ] })
                      ] })
                    ]
                  },
                  product.product_id
                );
              })
            }
          ),
          total_pages > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center justify-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => goToPage(pagination_state.current_page - 1),
                disabled: !has_previous,
                className: "px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                children: "Previous"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center space-x-1", children: Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
              let page_num;
              if (total_pages <= 5) {
                page_num = i + 1;
              } else if (pagination_state.current_page <= 3) {
                page_num = i + 1;
              } else if (pagination_state.current_page >= total_pages - 2) {
                page_num = total_pages - 4 + i;
              } else {
                page_num = pagination_state.current_page - 2 + i;
              }
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => goToPage(page_num),
                  className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${pagination_state.current_page === page_num ? "bg-blue-600 text-white" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`,
                  children: page_num
                },
                page_num
              );
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => goToPage(pagination_state.current_page + 1),
                disabled: !has_next,
                className: "px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                children: "Next"
              }
            )
          ] })
        ] })
      ] })
    ] }) })
  ] }) });
};
export {
  UV_Menu as default
};
