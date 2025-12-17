import { h as useNavigate, n as useQueryClient, u as useAppStore, b as axios, a as useQuery, j as jsxRuntimeExports, H as Heart, L as Link, i as Package, a1 as ShoppingCart } from "./index-1l1MB-L0.js";
import { u as useMutation } from "./useMutation-9MRSSmm2.js";
const UV_Favorites = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const isAuthenticated = useAppStore((state) => state.authentication_state.authentication_status.is_authenticated);
  const showToast = useAppStore((state) => state.show_toast);
  const addToCart = useAppStore((state) => state.add_to_cart);
  const selectedLocation = useAppStore((state) => state.cart_state.selected_location);
  const API_BASE_URL = `${"https://123build-an-online-web-application.launchpulse.ai"}/api`;
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...authToken && { Authorization: `Bearer ${authToken}` }
    }
  });
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id],
    queryFn: async () => {
      const response = await apiClient.get("/favorites");
      return response.data;
    },
    enabled: !!(currentUser == null ? void 0 : currentUser.user_id) && isAuthenticated
  });
  const deleteFavoriteMutation = useMutation({
    mutationFn: async (favoriteId) => {
      await apiClient.delete(`/favorites/${favoriteId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", currentUser == null ? void 0 : currentUser.user_id] });
      showToast("info", "Removed from favorites");
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to remove from favorites");
    }
  });
  const handleRemoveFromFavorites = (favoriteId) => {
    deleteFavoriteMutation.mutate(favoriteId);
  };
  const handleAddToCart = (favorite) => {
    if (!selectedLocation) {
      showToast("info", "Please select a location first");
      navigate("/");
      return;
    }
    addToCart({
      product_id: favorite.product_id,
      product_name: favorite.product_name,
      price: Number(favorite.product_price),
      quantity: 1,
      subtotal: Number(favorite.product_price),
      primary_image_url: favorite.product_image_url
    });
    showToast("success", "Added to cart!");
  };
  const formatCurrency = (amount) => {
    return `€${amount.toFixed(2)}`;
  };
  if (!isAuthenticated || !currentUser) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Please Log In" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: "You need to be logged in to view your favorites" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/login",
          className: "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",
          children: "Go to Login"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "My Favorites" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600", children: [
        favorites.length,
        " ",
        favorites.length === 1 ? "item" : "items",
        " saved"
      ] })
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: [1, 2, 3, 4, 5, 6].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-48 bg-gray-200" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 bg-gray-200 rounded" })
      ] })
    ] }) }, i)) }) : favorites.length === 0 ? (
      /* Empty State */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-16 w-16 text-gray-400 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "No Favorites Yet" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: "Start adding products to your favorites to see them here" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/",
            className: "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-5 w-5 mr-2" }),
              "Browse Products"
            ]
          }
        )
      ] })
    ) : (
      /* Favorites Grid */
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: favorites.map((favorite) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-48 bg-gray-200", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: favorite.product_image_url,
                  alt: favorite.product_name,
                  className: "w-full h-full object-cover",
                  onError: (e) => {
                    e.target.src = "https://images.unsplash.com/photo-1555507036-ab1f4038808a";
                  }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => handleRemoveFromFavorites(favorite.favorite_id),
                  className: "absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-all group",
                  "aria-label": "Remove from favorites",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 fill-red-500 text-red-500 group-hover:fill-white group-hover:text-red-600" })
                }
              ),
              favorite.availability_status !== "in_stock" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-3 left-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800", children: "Out of Stock" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: favorite.product_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 capitalize", children: favorite.product_category })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl font-bold text-purple-600", children: formatCurrency(Number(favorite.product_price)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => handleAddToCart(favorite),
                    disabled: favorite.availability_status !== "in_stock",
                    className: `flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors ${favorite.availability_status === "in_stock" ? "text-white bg-purple-600 hover:bg-purple-700" : "text-gray-400 bg-gray-100 cursor-not-allowed"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-4 w-4 mr-2" }),
                      "Add to Cart"
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: `/location/${selectedLocation || "london-flagship"}/product/${favorite.product_id}`,
                    className: "inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors",
                    children: "View"
                  }
                )
              ] })
            ] })
          ]
        },
        favorite.favorite_id
      )) })
    )
  ] }) });
};
export {
  UV_Favorites as default
};
