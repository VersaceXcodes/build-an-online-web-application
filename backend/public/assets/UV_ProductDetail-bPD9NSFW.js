import { f as useParams, g as useNavigate, l as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, n as LoaderCircle, d as CircleAlert, L as Link, i as ChevronRight, o as ChevronLeft, H as Heart, p as Minus, q as Plus, b as axios } from "./index-nYaE10KP.js";
import { u as useMutation } from "./useMutation-BdRga-lQ.js";
const UV_ProductDetail = () => {
  const { location_name, product_id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const isAuthenticated = useAppStore((state) => state.authentication_state.authentication_status.is_authenticated);
  const addToCart = useAppStore((state) => state.add_to_cart);
  const showToast = useAppStore((state) => state.show_toast);
  const openCartPanel = useAppStore((state) => state.open_cart_panel);
  const [selectedQuantity, setSelectedQuantity] = reactExports.useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = reactExports.useState(0);
  const [additionalImagesArray, setAdditionalImagesArray] = reactExports.useState([]);
  const [customerName, setCustomerName] = reactExports.useState("");
  const [selectedToppings, setSelectedToppings] = reactExports.useState([]);
  const [selectedSauces, setSelectedSauces] = reactExports.useState([]);
  const fetchProductDetails = async (productId) => {
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/products/${productId}`
    );
    return {
      ...response.data,
      category: response.data.category,
      availability_status: response.data.availability_status,
      price: Number(response.data.price || 0),
      compare_at_price: response.data.compare_at_price ? Number(response.data.compare_at_price) : null,
      stock_quantity: response.data.stock_quantity ? Number(response.data.stock_quantity) : null,
      low_stock_threshold: response.data.low_stock_threshold ? Number(response.data.low_stock_threshold) : null
    };
  };
  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ["product", product_id],
    queryFn: () => fetchProductDetails(product_id),
    enabled: !!product_id,
    staleTime: 6e4,
    // 1 minute
    retry: 1
  });
  reactExports.useEffect(() => {
    if (product) {
      if (product.additional_images) {
        try {
          const parsed = JSON.parse(product.additional_images);
          setAdditionalImagesArray(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Failed to parse additional images:", e);
          setAdditionalImagesArray([]);
        }
      } else {
        setAdditionalImagesArray([]);
      }
    }
  }, [product]);
  const dietaryTagsArray = (product == null ? void 0 : product.dietary_tags) ? (() => {
    try {
      return JSON.parse(product.dietary_tags);
    } catch {
      return product.dietary_tags.split(",").map((tag) => tag.trim()).filter(Boolean);
    }
  })() : [];
  const allImages = product ? [product.primary_image_url, ...additionalImagesArray] : [];
  const fetchRelatedProducts = async (category, currentProductId) => {
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/products`,
      {
        params: {
          category,
          availability_status: "in_stock",
          is_archived: false,
          limit: 5,
          // Fetch 5 to filter out current and still have 4
          offset: 0,
          sort_by: "created_at",
          sort_order: "desc"
        }
      }
    );
    const products = response.data.data.map((p) => ({
      ...p,
      category: p.category,
      availability_status: p.availability_status,
      price: Number(p.price || 0),
      compare_at_price: p.compare_at_price ? Number(p.compare_at_price) : null,
      stock_quantity: p.stock_quantity ? Number(p.stock_quantity) : null,
      low_stock_threshold: p.low_stock_threshold ? Number(p.low_stock_threshold) : null
    }));
    return products.filter((p) => p.product_id !== currentProductId).slice(0, 4);
  };
  const { data: relatedProducts = [], isLoading: relatedLoading } = useQuery({
    queryKey: ["related-products", product == null ? void 0 : product.category, product == null ? void 0 : product.product_id],
    queryFn: () => fetchRelatedProducts(product.category, product.product_id),
    enabled: !!product && !!product.category,
    staleTime: 3e5
    // 5 minutes
  });
  const fetchToppings = async () => {
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/toppings`,
      {
        params: {
          is_available: true
        }
      }
    );
    return response.data.map((t) => ({
      ...t,
      price: Number(t.price || 0)
    }));
  };
  const { data: toppingsData = [] } = useQuery({
    queryKey: ["toppings"],
    queryFn: fetchToppings,
    staleTime: 3e5
    // 5 minutes
  });
  const availableToppings = toppingsData.filter((t) => t.topping_type === "topping");
  const availableSauces = toppingsData.filter((t) => t.topping_type === "sauce");
  const fetchFavorites = async () => {
    if (!currentUser) return [];
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/favorites`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  };
  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id],
    queryFn: fetchFavorites,
    enabled: isAuthenticated && !!currentUser,
    staleTime: 6e4
  });
  const isFavorited = favorites.some((fav) => fav.product_id === product_id);
  const addFavoriteMutation = useMutation({
    mutationFn: async (productId) => {
      const response = await axios.post(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/favorites`,
        {
          product_id: productId
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      return response.data;
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      const previousFavorites = queryClient.getQueryData(["favorites", currentUser == null ? void 0 : currentUser.user_id]);
      queryClient.setQueryData(
        ["favorites", currentUser == null ? void 0 : currentUser.user_id],
        (old) => [
          ...old || [],
          {
            favorite_id: `temp_${Date.now()}`,
            user_id: (currentUser == null ? void 0 : currentUser.user_id) || "",
            product_id: productId,
            created_at: (/* @__PURE__ */ new Date()).toISOString()
          }
        ]
      );
      return { previousFavorites };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      await queryClient.refetchQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      showToast("success", "Added to favorites");
    },
    onError: (error, _productId, context) => {
      var _a, _b;
      if (context == null ? void 0 : context.previousFavorites) {
        queryClient.setQueryData(["favorites", currentUser == null ? void 0 : currentUser.user_id], context.previousFavorites);
      }
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to add favorite");
    }
  });
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId) => {
      const response = await axios.delete(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/favorites/${favoriteId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      return response.data;
    },
    onMutate: async (favoriteId) => {
      await queryClient.cancelQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      const previousFavorites = queryClient.getQueryData(["favorites", currentUser == null ? void 0 : currentUser.user_id]);
      queryClient.setQueryData(
        ["favorites", currentUser == null ? void 0 : currentUser.user_id],
        (old) => (old || []).filter((fav) => fav.favorite_id !== favoriteId)
      );
      return { previousFavorites };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      await queryClient.refetchQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      showToast("info", "Removed from favorites");
    },
    onError: (error, _favoriteId, context) => {
      var _a, _b;
      if (context == null ? void 0 : context.previousFavorites) {
        queryClient.setQueryData(["favorites", currentUser == null ? void 0 : currentUser.user_id], context.previousFavorites);
      }
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to remove favorite");
    }
  });
  const handleQuantityChange = (delta) => {
    setSelectedQuantity((prev) => Math.max(1, prev + delta));
  };
  const handleAddToCart = () => {
    if (!product) return;
    if (product.availability_status !== "in_stock") {
      showToast("error", "This product is currently unavailable");
      return;
    }
    const toppingsCost = selectedToppings.reduce((sum, toppingId) => {
      const topping = toppingsData.find((t) => t.topping_id === toppingId);
      return sum + ((topping == null ? void 0 : topping.price) || 0);
    }, 0);
    const saucesCost = selectedSauces.reduce((sum, sauceId) => {
      const sauce = toppingsData.find((t) => t.topping_id === sauceId);
      return sum + ((sauce == null ? void 0 : sauce.price) || 0);
    }, 0);
    const totalPrice = product.price + toppingsCost + saucesCost;
    const cartItem = {
      product_id: product.product_id,
      product_name: product.product_name,
      price: totalPrice,
      quantity: selectedQuantity,
      subtotal: totalPrice * selectedQuantity,
      primary_image_url: product.primary_image_url,
      customer_name: customerName.trim() || void 0,
      selected_toppings: selectedToppings.map((id) => {
        const topping = toppingsData.find((t) => t.topping_id === id);
        return {
          topping_id: id,
          topping_name: (topping == null ? void 0 : topping.topping_name) || "",
          price: (topping == null ? void 0 : topping.price) || 0
        };
      }),
      selected_sauces: selectedSauces.map((id) => {
        const sauce = toppingsData.find((t) => t.topping_id === id);
        return {
          topping_id: id,
          topping_name: (sauce == null ? void 0 : sauce.topping_name) || "",
          price: (sauce == null ? void 0 : sauce.price) || 0
        };
      })
    };
    addToCart(cartItem);
    setSelectedQuantity(1);
    setCustomerName("");
    setSelectedToppings([]);
    setSelectedSauces([]);
    setTimeout(() => {
      openCartPanel();
    }, 500);
  };
  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      showToast("info", "Please log in to save favorites");
      navigate("/login");
      return;
    }
    if (addFavoriteMutation.isPending || removeFavoriteMutation.isPending) {
      return;
    }
    const favorite = favorites.find((fav) => fav.product_id === product_id);
    if (favorite) {
      if (!favorite.favorite_id.startsWith("temp_")) {
        removeFavoriteMutation.mutate(favorite.favorite_id);
      }
    } else {
      addFavoriteMutation.mutate(product_id);
    }
  };
  const handleImageSelect = (index) => {
    setSelectedImageIndex(index);
  };
  const handlePreviousImage = () => {
    setSelectedImageIndex(
      (prev) => prev === 0 ? allImages.length - 1 : prev - 1
    );
  };
  const handleNextImage = () => {
    setSelectedImageIndex(
      (prev) => prev === allImages.length - 1 ? 0 : prev + 1
    );
  };
  reactExports.useEffect(() => {
    if (productError) {
      showToast("error", "Product not found");
      navigate(`/location/${location_name}/menu`);
    }
  }, [productError, navigate, location_name, showToast]);
  if (productLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-kake-cream-50 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center min-h-[60vh]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-12 h-12 text-kake-caramel-500 animate-spin mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-500 text-lg", children: "Loading product details..." })
    ] }) }) }) }) });
  }
  if (!product) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-kake-cream-50 py-8 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-kake-chocolate-500 mb-2", children: "Product Not Found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-500/80 mb-6", children: "The product you're looking for doesn't exist." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: `/location/${location_name}/menu`,
          className: "inline-flex items-center px-6 py-3 gradient-caramel text-white rounded-xl hover:shadow-caramel-lg transition-all",
          children: "Back to Menu"
        }
      )
    ] }) }) });
  }
  const isOutOfStock = product.availability_status !== "in_stock";
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const favoriteLoading = addFavoriteMutation.isPending || removeFavoriteMutation.isPending;
  const dietaryIcons = {
    "vegan": "🌱",
    "vegetarian": "🥬",
    "gluten_free": "🌾",
    "dairy_free": "🥛",
    "nut_free": "🥜",
    "organic": "🌿"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-kake-cream-50 pb-20 lg:pb-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white/80 backdrop-blur-sm border-b border-kake-caramel-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center space-x-2 text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "text-kake-chocolate-500/70 hover:text-kake-chocolate-500 transition-colors",
          children: "Home"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-kake-chocolate-500/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: `/location/${location_name}`,
          className: "text-kake-chocolate-500/70 hover:text-kake-chocolate-500 transition-colors capitalize",
          children: location_name
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-kake-chocolate-500/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: `/location/${location_name}/menu`,
          className: "text-kake-chocolate-500/70 hover:text-kake-chocolate-500 transition-colors",
          children: "Menu"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 text-kake-chocolate-500/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-kake-chocolate-500 font-medium truncate max-w-xs", children: product.product_name })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative bg-white rounded-xl shadow-soft-lg overflow-hidden aspect-square", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: allImages[selectedImageIndex],
                alt: product.product_name,
                className: "w-full h-full object-cover",
                loading: "lazy"
              }
            ),
            allImages.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handlePreviousImage,
                  className: "absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-soft transition-all",
                  "aria-label": "Previous image",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-6 h-6 text-kake-chocolate-500" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleNextImage,
                  className: "absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-soft transition-all",
                  "aria-label": "Next image",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-6 h-6 text-kake-chocolate-500" })
                }
              )
            ] }),
            product.is_featured && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-4 gradient-caramel text-white px-3 py-1 rounded-full text-sm font-semibold shadow-caramel", children: "⭐ Featured" }),
            isOutOfStock && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg", children: "Out of Stock" })
          ] }),
          allImages.length > 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 overflow-x-auto pb-2", children: allImages.map((image, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleImageSelect(index),
              className: `flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index ? "border-kake-caramel-500 ring-2 ring-kake-caramel-500/20" : "border-kake-cream-300 hover:border-kake-cream-400"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: image,
                  alt: `${product.product_name} view ${index + 1}`,
                  className: "w-full h-full object-cover",
                  loading: "lazy"
                }
              )
            },
            index
          )) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-3xl lg:text-4xl font-bold text-kake-chocolate-500 leading-tight mb-3", children: product.product_name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-3 mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-serif text-4xl font-bold text-kake-chocolate-500", children: [
                  "€",
                  product.price.toFixed(2)
                ] }),
                hasDiscount && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-2xl font-medium text-kake-chocolate-500/50 line-through", children: [
                  "€",
                  product.compare_at_price.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-kake-chocolate-500/80 leading-relaxed", children: product.short_description })
            ] }),
            isAuthenticated && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: handleToggleFavorite,
                disabled: favoriteLoading,
                className: "flex-shrink-0 p-3 rounded-full border-2 border-kake-cream-300 hover:border-red-500 hover:bg-red-50 transition-all disabled:opacity-50",
                "aria-label": isFavorited ? "Remove from favorites" : "Add to favorites",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Heart,
                  {
                    className: `w-6 h-6 transition-colors ${isFavorited ? "fill-red-500 text-red-500" : "text-kake-chocolate-500/40"}`
                  }
                )
              }
            )
          ] }),
          dietaryTagsArray.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: dietaryTagsArray.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "span",
            {
              className: "inline-flex items-center gap-1 px-3 py-1.5 border-2 border-kake-caramel-500/30 text-kake-chocolate-500 bg-kake-cream-100 rounded-full text-sm font-medium hover:border-kake-caramel-500 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: dietaryIcons[tag.toLowerCase()] || "✓" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: tag.replace("_", " ") })
              ]
            },
            tag
          )) }),
          product.long_description && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose prose-blue max-w-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 bg-white rounded-xl shadow-soft border border-kake-caramel-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-500/80 leading-relaxed", children: product.long_description }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-3 h-3 rounded-full ${isOutOfStock ? "bg-red-500" : "bg-green-500"}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `font-medium ${isOutOfStock ? "text-red-700" : "text-green-700"}`, children: isOutOfStock ? "Out of Stock" : "In Stock" }),
            !isOutOfStock && product.stock_quantity && product.low_stock_threshold && product.stock_quantity <= product.low_stock_threshold && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-orange-600 font-medium ml-2", children: [
              "Only ",
              product.stock_quantity,
              " left!"
            ] })
          ] }),
          product.available_for_corporate && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-center gap-2 px-4 py-2 border-2 border-kake-caramel-500/30 bg-kake-cream-100 text-kake-chocolate-500 rounded-lg text-sm font-medium", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🎉" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Great for corporate orders" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "customer_name", className: "block text-sm font-semibold text-kake-chocolate-500", children: "Customer Name (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                id: "customer_name",
                value: customerName,
                onChange: (e) => setCustomerName(e.target.value),
                placeholder: "Enter name for this item",
                className: "w-full px-4 py-3 border-2 border-kake-cream-300 rounded-lg focus:border-kake-caramel-500 focus:ring-2 focus:ring-kake-caramel-500/20 transition-all",
                disabled: isOutOfStock
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-kake-chocolate-500/70", children: "Perfect for group orders - label each item with a name" })
          ] }),
          availableToppings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-kake-chocolate-500", children: "Choose Toppings (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: availableToppings.map((topping) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  if (selectedToppings.includes(topping.topping_id)) {
                    setSelectedToppings((prev) => prev.filter((id) => id !== topping.topping_id));
                  } else {
                    setSelectedToppings((prev) => [...prev, topping.topping_id]);
                  }
                },
                disabled: isOutOfStock,
                className: `px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${selectedToppings.includes(topping.topping_id) ? "border-kake-caramel-500 bg-kake-caramel-500 text-white shadow-caramel" : "border-kake-cream-300 bg-white text-kake-chocolate-500 hover:border-kake-caramel-500/50"} disabled:opacity-50 disabled:cursor-not-allowed`,
                children: [
                  topping.topping_name,
                  topping.price > 0 && ` (+€${topping.price.toFixed(2)})`
                ]
              },
              topping.topping_id
            )) })
          ] }),
          availableSauces.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-kake-chocolate-500", children: "Choose Sauces (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-2", children: availableSauces.map((sauce) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => {
                  if (selectedSauces.includes(sauce.topping_id)) {
                    setSelectedSauces((prev) => prev.filter((id) => id !== sauce.topping_id));
                  } else {
                    setSelectedSauces((prev) => [...prev, sauce.topping_id]);
                  }
                },
                disabled: isOutOfStock,
                className: `px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${selectedSauces.includes(sauce.topping_id) ? "border-kake-caramel-500 bg-kake-caramel-500 text-white shadow-caramel" : "border-kake-cream-300 bg-white text-kake-chocolate-500 hover:border-kake-caramel-500/50"} disabled:opacity-50 disabled:cursor-not-allowed`,
                children: [
                  sauce.topping_name,
                  sauce.price > 0 && ` (+€${sauce.price.toFixed(2)})`
                ]
              },
              sauce.topping_id
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-kake-chocolate-500", children: "Quantity" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-2 border-kake-cream-300 rounded-lg overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleQuantityChange(-1),
                    disabled: selectedQuantity <= 1 || isOutOfStock,
                    className: "px-4 py-3 bg-kake-cream-100 hover:bg-kake-cream-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                    "aria-label": "Decrease quantity",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-5 h-5 text-kake-chocolate-500" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-6 py-3 text-xl font-bold text-kake-chocolate-500 min-w-[60px] text-center", children: selectedQuantity }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleQuantityChange(1),
                    disabled: isOutOfStock,
                    className: "px-4 py-3 bg-kake-cream-100 hover:bg-kake-cream-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
                    "aria-label": "Increase quantity",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 text-kake-chocolate-500" })
                  }
                )
              ] }),
              !isOutOfStock && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-kake-chocolate-500/70 text-sm", children: [
                "Total: ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-kake-chocolate-500", children: [
                  "€",
                  (() => {
                    const toppingsCost = selectedToppings.reduce((sum, id) => {
                      const topping = toppingsData.find((t) => t.topping_id === id);
                      return sum + ((topping == null ? void 0 : topping.price) || 0);
                    }, 0);
                    const saucesCost = selectedSauces.reduce((sum, id) => {
                      const sauce = toppingsData.find((t) => t.topping_id === id);
                      return sum + ((sauce == null ? void 0 : sauce.price) || 0);
                    }, 0);
                    return ((product.price + toppingsCost + saucesCost) * selectedQuantity).toFixed(2);
                  })()
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: handleAddToCart,
              disabled: isOutOfStock,
              className: `w-full py-4 px-6 rounded-xl font-bold text-lg shadow-caramel transition-all duration-200 ${isOutOfStock ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "gradient-caramel text-white hover:shadow-caramel-lg hover:scale-105 glow-on-hover"}`,
              children: isOutOfStock ? "Out of Stock" : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add to Cart" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm opacity-90", children: [
                  "€",
                  (() => {
                    const toppingsCost = selectedToppings.reduce((sum, id) => {
                      const topping = toppingsData.find((t) => t.topping_id === id);
                      return sum + ((topping == null ? void 0 : topping.price) || 0);
                    }, 0);
                    const saucesCost = selectedSauces.reduce((sum, id) => {
                      const sauce = toppingsData.find((t) => t.topping_id === id);
                      return sum + ((sauce == null ? void 0 : sauce.price) || 0);
                    }, 0);
                    return ((product.price + toppingsCost + saucesCost) * selectedQuantity).toFixed(2);
                  })()
                ] })
              ] })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 pt-4 border-t border-kake-caramel-500/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-kake-chocolate-500/70 mb-1", children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-kake-chocolate-500 capitalize", children: product.category })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-kake-chocolate-500/70 mb-1", children: "Ready In" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold text-kake-chocolate-500", children: "20-30 minutes" })
            ] })
          ] })
        ] })
      ] }),
      relatedProducts.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl lg:text-3xl font-bold text-kake-chocolate-500 mb-6", children: "You Might Also Like" }),
        relatedLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-8 h-8 text-kake-caramel-500 animate-spin" }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6", children: relatedProducts.map((relatedProduct) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: `/location/${location_name}/product/${relatedProduct.product_id}`,
            className: "group bg-white rounded-xl shadow-soft border border-kake-caramel-500/20 hover:shadow-soft-lg hover:border-kake-caramel-500 overflow-hidden transition-all duration-200 hover:scale-105",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-square overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: relatedProduct.primary_image_url,
                  alt: relatedProduct.product_name,
                  className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300",
                  loading: "lazy"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-kake-chocolate-500 mb-1 line-clamp-1", children: relatedProduct.product_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-kake-chocolate-500/70 mb-2 line-clamp-2", children: relatedProduct.short_description }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-serif text-lg font-bold text-kake-caramel-500", children: [
                  "€",
                  relatedProduct.price.toFixed(2)
                ] })
              ] })
            ]
          },
          relatedProduct.product_id
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-kake-caramel-500/20 shadow-2xl z-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center border-2 border-kake-cream-300 rounded-lg overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleQuantityChange(-1),
            disabled: selectedQuantity <= 1 || isOutOfStock,
            className: "px-3 py-2 bg-kake-cream-100 hover:bg-kake-cream-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            "aria-label": "Decrease quantity",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Minus, { className: "w-4 h-4 text-kake-chocolate-500" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-4 py-2 text-lg font-bold text-kake-chocolate-500 min-w-[50px] text-center", children: selectedQuantity }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleQuantityChange(1),
            disabled: isOutOfStock,
            className: "px-3 py-2 bg-kake-cream-100 hover:bg-kake-cream-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
            "aria-label": "Increase quantity",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 text-kake-chocolate-500" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleAddToCart,
          disabled: isOutOfStock,
          className: `flex-1 py-3 px-6 rounded-xl font-bold text-base shadow-caramel transition-all ${isOutOfStock ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "gradient-caramel text-white hover:shadow-caramel-lg active:scale-95"}`,
          children: isOutOfStock ? "Out of Stock" : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Add to Cart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
              "€",
              (() => {
                const toppingsCost = selectedToppings.reduce((sum, id) => {
                  const topping = toppingsData.find((t) => t.topping_id === id);
                  return sum + ((topping == null ? void 0 : topping.price) || 0);
                }, 0);
                const saucesCost = selectedSauces.reduce((sum, id) => {
                  const sauce = toppingsData.find((t) => t.topping_id === id);
                  return sum + ((sauce == null ? void 0 : sauce.price) || 0);
                }, 0);
                return ((product.price + toppingsCost + saucesCost) * selectedQuantity).toFixed(2);
              })()
            ] })
          ] })
        }
      )
    ] }) }) })
  ] }) });
};
export {
  UV_ProductDetail as default
};
