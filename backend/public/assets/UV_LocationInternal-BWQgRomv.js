import { g as useParams, h as useNavigate, r as reactExports, u as useAppStore, a as useQuery, j as jsxRuntimeExports, M as MapPin, L as Link, P as Phone, c as Mail, C as Clock, i as Package, E as ExternalLink, k as ChevronRight, T as Truck, d as CircleAlert, X, b as axios } from "./index-HeRxKVXe.js";
const fetchLocationBySlug = async (slug) => {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/locations/slug/${slug}`
  );
  const loc = response.data;
  return {
    ...loc,
    delivery_radius_km: loc.delivery_radius_km ? Number(loc.delivery_radius_km) : null,
    delivery_fee: loc.delivery_fee ? Number(loc.delivery_fee) : null,
    free_delivery_threshold: loc.free_delivery_threshold ? Number(loc.free_delivery_threshold) : null,
    estimated_delivery_time_minutes: loc.estimated_delivery_time_minutes ? Number(loc.estimated_delivery_time_minutes) : null,
    estimated_preparation_time_minutes: Number(loc.estimated_preparation_time_minutes || 20)
  };
};
const parseOpeningHours = (opening_hours_json) => {
  try {
    return JSON.parse(opening_hours_json);
  } catch (error) {
    console.error("Failed to parse opening hours:", error);
    return null;
  }
};
const formatDayName = (day) => {
  return day.charAt(0).toUpperCase() + day.slice(1);
};
const getTodayDay = () => {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[(/* @__PURE__ */ new Date()).getDay()];
};
const UV_LocationInternal = () => {
  var _a;
  const { location_name } = useParams();
  const navigate = useNavigate();
  const [showProviderModal, setShowProviderModal] = reactExports.useState(false);
  const [selectedFulfillmentMethod, setSelectedFulfillmentMethod] = reactExports.useState(null);
  const setCurrentLocation = useAppStore((state) => state.set_current_location);
  const setCartLocation = useAppStore((state) => state.set_cart_location);
  const setFulfillmentMethod = useAppStore((state) => state.set_fulfillment_method);
  const setLocationDetails = useAppStore((state) => state.set_location_details);
  const authState = useAppStore((state) => state.auth_state);
  const {
    data: location_details,
    isLoading,
    error,
    isError
  } = useQuery({
    queryKey: ["location", location_name],
    queryFn: () => fetchLocationBySlug(location_name),
    enabled: !!location_name,
    staleTime: 6e4,
    // Cache for 1 minute
    retry: 2,
    retryDelay: 1e3
  });
  const opening_hours_parsed = reactExports.useMemo(() => {
    if (!location_details) return null;
    if (location_details.opening_hours_structured && Array.isArray(location_details.opening_hours_structured)) {
      const hoursMap = {};
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      location_details.opening_hours_structured.forEach((hour) => {
        const dayName = dayNames[hour.day_of_week];
        if (hour.is_closed) {
          hoursMap[dayName] = {
            open: "Closed",
            close: "Closed"
          };
        } else {
          hoursMap[dayName] = {
            open: hour.opens_at || "",
            close: hour.closes_at || ""
          };
        }
      });
      return hoursMap;
    }
    if (location_details.opening_hours) {
      return parseOpeningHours(location_details.opening_hours);
    }
    return null;
  }, [location_details]);
  const todays_hours = reactExports.useMemo(() => {
    if (!opening_hours_parsed) return null;
    const today = getTodayDay();
    return opening_hours_parsed[today] || null;
  }, [opening_hours_parsed]);
  const isExternalOnly = reactExports.useMemo(() => {
    if (!location_details) return false;
    return location_details.ordering_mode === "external_only";
  }, [location_details]);
  const externalProviders = reactExports.useMemo(() => {
    if (!location_details) return [];
    if (location_details.external_providers) {
      try {
        const parsed = JSON.parse(location_details.external_providers);
        if (Array.isArray(parsed)) {
          return parsed.filter((p) => p.is_active && p.name && p.url).sort((a, b) => a.display_order - b.display_order);
        }
      } catch {
      }
    }
    const providers = [];
    if (location_details.just_eat_url) {
      providers.push({
        name: "Just Eat",
        url: location_details.just_eat_url,
        display_order: 1,
        is_active: true
      });
    }
    if (location_details.deliveroo_url) {
      providers.push({
        name: "Deliveroo",
        url: location_details.deliveroo_url,
        display_order: 2,
        is_active: true
      });
    }
    return providers;
  }, [location_details]);
  const hasActiveProviders = isExternalOnly && externalProviders.length > 0;
  const handleSelectFulfillment = (method) => {
    if (!location_details) return;
    if (method === "collection" && !location_details.is_collection_enabled) {
      return;
    }
    if (method === "delivery" && !location_details.is_delivery_enabled) {
      return;
    }
    if (isExternalOnly) {
      if (externalProviders.length === 0) {
        return;
      }
      setSelectedFulfillmentMethod(method);
      setShowProviderModal(true);
      return;
    }
    setCurrentLocation(location_details.location_name);
    setCartLocation(location_details.location_name);
    setFulfillmentMethod(method);
    setLocationDetails(location_details);
    navigate(`/location/${location_name}/menu?fulfillment=${method}`);
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-64 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8 animate-pulse", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 bg-gray-200 rounded w-1/3 mb-6" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-2/3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64 bg-white rounded-xl shadow-lg animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64 bg-white rounded-xl shadow-lg animate-pulse" })
        ] })
      ] }) })
    ] }) });
  }
  if (isError || !isLoading && !location_details) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-md w-full text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-8 w-8 text-red-600" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Location Not Found" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600 mb-2", children: [
        `Sorry, we couldn't find the location "`,
        location_name,
        '".'
      ] }),
      error && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-red-600 mb-6", children: [
        "Error: ",
        error instanceof Error ? error.message : "Unknown error"
      ] }),
      !error && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500 mb-6", children: "This location may not exist or may be temporarily unavailable." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl",
          children: "Return to Home"
        }
      )
    ] }) }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-64 bg-kake-cream-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/5" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl md:text-5xl font-bold text-kake-chocolate-500 mb-4 font-serif", children: location_details.location_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl text-kake-chocolate-500/80 font-medium font-sans", children: "Choose your ordering preference" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "mb-8", "aria-label": "Breadcrumb", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "flex items-center space-x-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "text-gray-500 hover:text-gray-700 transition-colors", children: "Home" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-gray-400", children: "/" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-gray-900 font-medium", children: location_details.location_name })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 py-6 border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Location Details" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-5 w-5 text-kake-caramel-500 mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-kake-chocolate-500 mb-1", children: "Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-600 leading-relaxed", children: [
                  location_details.address_line1,
                  location_details.address_line2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                    location_details.address_line2
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  location_details.city,
                  " ",
                  location_details.postal_code,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                  location_details.country
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-5 w-5 text-kake-caramel-500 mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-kake-chocolate-500 mb-1", children: "Phone" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: `tel:${location_details.phone_number}`,
                    className: "text-kake-caramel-500 hover:text-kake-caramel-400 transition-colors",
                    children: location_details.phone_number
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-5 w-5 text-kake-caramel-500 mt-0.5 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-kake-chocolate-500 mb-1", children: "Email" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: `mailto:${location_details.email}`,
                    className: "text-kake-caramel-500 hover:text-kake-caramel-400 transition-colors",
                    children: location_details.email
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 text-kake-caramel-500 mt-0.5 flex-shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-kake-chocolate-500 mb-3", children: "Opening Hours" }),
              todays_hours && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-kake-cream-100 border border-kake-caramel-500/30 rounded-lg px-4 py-3 mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-kake-chocolate-500", children: todays_hours.open === "Closed" ? /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: "Today: Closed" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                "Today: ",
                todays_hours.open,
                " – ",
                todays_hours.close
              ] }) }) }),
              opening_hours_parsed && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: Object.entries(opening_hours_parsed).map(([day, hours]) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "div",
                {
                  className: `flex justify-between text-sm ${day === getTodayDay() ? "font-semibold text-gray-900" : "text-gray-600"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "capitalize", children: formatDayName(day) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: hours.open === "Closed" ? "Closed" : `${hours.open} – ${hours.close}` })
                  ]
                },
                day
              )) })
            ] })
          ] }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold text-gray-900 text-center mb-4", children: "How would you like to receive your order?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-center mb-8", children: "Choose your preferred fulfillment method to continue" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [
          location_details.is_collection_enabled && (!isExternalOnly || hasActiveProviders) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleSelectFulfillment("collection"),
              className: "group bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-200 p-8 text-left focus:outline-none focus:ring-4 focus:ring-blue-100",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-6", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-14 w-14 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-7 w-7 text-blue-600" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-1", children: "Collection" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Pick up in-store" })
                    ] })
                  ] }),
                  isExternalOnly ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6", children: [
                  !isExternalOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-gray-700", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 mr-2 text-gray-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                      "Ready in ",
                      location_details.estimated_preparation_time_minutes,
                      " minutes"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-green-600 font-semibold", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg", children: "FREE" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 text-sm text-gray-500", children: "No delivery fee" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: isExternalOnly ? `Order via our delivery partners for collection at ${location_details.location_name}` : `Order now and collect from our ${location_details.location_name} location` }) })
              ]
            }
          ),
          location_details.is_delivery_enabled && (!isExternalOnly || hasActiveProviders) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleSelectFulfillment("delivery"),
              className: "group bg-white rounded-xl shadow-lg border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-200 p-8 text-left focus:outline-none focus:ring-4 focus:ring-blue-100",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-6", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center h-14 w-14 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-7 w-7 text-indigo-600" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-1", children: "Delivery" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "To your door" })
                    ] })
                  ] }),
                  isExternalOnly ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-6 w-6 text-gray-400 group-hover:text-blue-600 transition-colors" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6", children: [
                  !isExternalOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-gray-700", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-5 w-5 mr-2 text-gray-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                      "Delivered in ",
                      (location_details.estimated_preparation_time_minutes || 0) + (location_details.estimated_delivery_time_minutes || 0),
                      " minutes"
                    ] })
                  ] }),
                  !isExternalOnly && location_details.delivery_fee !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center text-gray-700", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                      "Delivery fee: €",
                      Number(location_details.delivery_fee || 0).toFixed(2)
                    ] }) }),
                    location_details.free_delivery_threshold && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-green-600 font-medium", children: [
                      "FREE delivery over €",
                      Number(location_details.free_delivery_threshold).toFixed(2)
                    ] })
                  ] }),
                  isExternalOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-blue-600 font-medium", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4 mr-2" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Order via delivery partners" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-4 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: isExternalOnly ? `Order via our delivery partners for delivery from ${location_details.location_name}` : `We deliver within ${location_details.delivery_radius_km || 10}km of ${location_details.location_name}` }) })
              ]
            }
          ),
          !location_details.is_collection_enabled && !location_details.is_delivery_enabled && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-yellow-800 font-medium", children: "Ordering is currently unavailable at this location." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/",
                className: "inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium",
                children: "Choose another location →"
              }
            )
          ] }),
          isExternalOnly && externalProviders.length === 0 && (location_details.is_collection_enabled || location_details.is_delivery_enabled) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-full bg-amber-50 border border-amber-200 rounded-lg p-6 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-8 h-8 text-amber-600 mx-auto mb-3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-amber-800 font-medium", children: "Online orders for Glasnevin are currently unavailable." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-700 mt-2", children: "Please visit us in store or check back later." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/",
                className: "inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium",
                children: "Choose another location →"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-xl p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-gray-900 mb-3", children: "What happens next?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-2 text-gray-700", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0", children: "1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Browse our delicious menu and add items to your cart" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0", children: "2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Review your order and proceed to checkout" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-bold mr-3 mt-0.5 flex-shrink-0", children: "3" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: location_details.is_collection_enabled && location_details.is_delivery_enabled ? "We'll prepare your order for collection or delivery" : location_details.is_collection_enabled ? "We'll prepare your order for collection" : "We'll deliver your order to your door" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/",
          className: "inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 mr-1 rotate-180" }),
            "Back to all locations"
          ]
        }
      ) }),
      isExternalOnly && externalProviders.length === 0 && authState.is_authenticated && ((_a = authState.user) == null ? void 0 : _a.user_type) === "admin" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-amber-800", children: "Admin Notice" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-amber-700 mt-1", children: "No external providers configured for Glasnevin. Customers will not be able to order. Please add providers in System Settings → Locations." })
        ] })
      ] }) })
    ] }),
    showProviderModal && isExternalOnly && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75",
          onClick: () => setShowProviderModal(false)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 w-full max-w-md p-6 mx-auto bg-white rounded-xl shadow-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowProviderModal(false),
            className: "absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-6 w-6 text-blue-600" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Choose your ordering service" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-2", children: selectedFulfillmentMethod === "collection" ? "Select a service to place your collection order" : "Select a service to place your delivery order" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: externalProviders.map((provider, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "a",
          {
            href: provider.url,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center justify-between w-full px-4 py-3 bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg transition-all group",
            onClick: () => setShowProviderModal(false),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-gray-900 group-hover:text-blue-700", children: provider.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-4 h-4 text-gray-400 group-hover:text-blue-600" })
            ]
          },
          index
        )) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowProviderModal(false),
            className: "w-full mt-4 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors",
            children: "Cancel"
          }
        )
      ] })
    ] }) })
  ] });
};
export {
  UV_LocationInternal as default
};
