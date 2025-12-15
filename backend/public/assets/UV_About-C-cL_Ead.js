import { u as useAppStore, a as useQuery, r as reactExports, j as jsxRuntimeExports, H as Heart, C as Clock, M as MapPin, P as Phone, c as Mail, L as Link, A as Award, S as Sparkles, U as Users, b as axios } from "./index-B48j776u.js";
const fetchAboutPageContent = async () => {
  const API_BASE_URL = `${"https://123build-an-online-web-application.launchpulse.ai"}/api`;
  const response = await axios.get(`${API_BASE_URL}/about-page`);
  return response.data;
};
const fetchLocations = async () => {
  const API_BASE_URL = `${"https://123build-an-online-web-application.launchpulse.ai"}/api`;
  const response = await axios.get(`${API_BASE_URL}/locations`);
  if (Array.isArray(response.data)) {
    return response.data;
  }
  return response.data.data || response.data.locations || [];
};
const parseOpeningHours = (opening_hours_json) => {
  try {
    return JSON.parse(opening_hours_json);
  } catch (error) {
    console.error("Failed to parse opening hours:", error);
    return {};
  }
};
const getValueIcon = (icon_name) => {
  const icons = {
    quality: /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-8 h-8" }),
    community: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-8 h-8" }),
    innovation: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-8 h-8" }),
    sustainability: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-8 h-8" })
  };
  return icons[icon_name] || /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-8 h-8" });
};
const UV_About = () => {
  const available_locations = useAppStore((state) => state.location_state.available_locations);
  const {
    data: page_content,
    isLoading: content_loading,
    error: content_error
  } = useQuery({
    queryKey: ["about-page-content"],
    queryFn: fetchAboutPageContent,
    staleTime: 60 * 60 * 1e3
    // 1 hour
  });
  const {
    data: locations_data,
    isLoading: locations_loading,
    error: locations_error
  } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
    staleTime: 60 * 60 * 1e3,
    // 1 hour
    enabled: available_locations.length === 0,
    // Only fetch if not in global state
    select: (data) => data.map((loc) => ({
      ...loc,
      delivery_radius_km: loc.delivery_radius_km ? Number(loc.delivery_radius_km) : null,
      delivery_fee: loc.delivery_fee ? Number(loc.delivery_fee) : null,
      free_delivery_threshold: loc.free_delivery_threshold ? Number(loc.free_delivery_threshold) : null,
      estimated_delivery_time_minutes: loc.estimated_delivery_time_minutes ? Number(loc.estimated_delivery_time_minutes) : null,
      estimated_preparation_time_minutes: Number(loc.estimated_preparation_time_minutes || 20)
    }))
  });
  const locations_for_visit = available_locations.length > 0 ? available_locations : locations_data || [];
  reactExports.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  if (content_loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading..." })
    ] }) });
  }
  if (content_error || !page_content) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-md mx-auto px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600 mb-4", children: "Failed to load about page content" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => window.location.reload(),
          className: "px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700",
          children: "Retry"
        }
      )
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative h-[500px] lg:h-[600px] overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0 bg-cover bg-center",
          style: {
            backgroundImage: `url(${page_content.hero_image_url})`
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-purple-900/90 to-purple-600/80" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-full flex items-center justify-center px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-4xl mx-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in", children: page_content.page_title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl md:text-2xl text-purple-100 max-w-2xl mx-auto", children: "Handcrafted desserts made with love, served with pride" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 lg:py-24 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl lg:text-4xl font-bold text-gray-900 mb-4", children: "The Kake Story" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-1 bg-purple-600 mx-auto rounded-full" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "prose prose-lg max-w-none text-gray-600 leading-relaxed",
          dangerouslySetInnerHTML: { __html: page_content.story_content }
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 lg:py-24 bg-gradient-to-br from-purple-50 to-pink-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl lg:text-4xl font-bold text-gray-900 mb-4", children: "Our Journey" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl text-gray-600 max-w-2xl mx-auto", children: "Every milestone marks a moment we're proud of" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-purple-300" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-12 lg:space-y-16", children: page_content.milestones.map((milestone, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: `relative flex flex-col lg:flex-row items-center ${index % 2 === 0 ? "lg:flex-row-reverse" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden lg:flex absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-lg z-10" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-full lg:w-5/12 ${index % 2 === 0 ? "lg:text-right lg:pr-12" : "lg:pl-12"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8 border border-purple-100 hover:shadow-xl transition-shadow duration-200", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-block px-4 py-2 bg-purple-600 text-white font-bold text-lg rounded-lg mb-4", children: milestone.year }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-3", children: milestone.title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 leading-relaxed", children: milestone.description })
              ] }) })
            ]
          },
          index
        )) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 lg:py-24 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl lg:text-4xl font-bold text-gray-900 mb-4", children: "Our Values" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl text-gray-600 max-w-2xl mx-auto", children: "The principles that guide everything we do" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8", children: page_content.values.map((value, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "text-center p-8 rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-100 hover:shadow-xl transition-all duration-200 hover:scale-105",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex items-center justify-center w-16 h-16 bg-purple-600 text-white rounded-full mb-6", children: getValueIcon(value.icon_name) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-3", children: value.value_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 leading-relaxed", children: value.description })
          ]
        },
        index
      )) })
    ] }) }),
    page_content.team_members && page_content.team_members.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 lg:py-24 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl lg:text-4xl font-bold text-gray-900 mb-4", children: "Meet the Team" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl text-gray-600 max-w-2xl mx-auto", children: "The passionate people behind every delicious creation" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12", children: page_content.team_members.map((member, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "text-center",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 relative inline-block", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: member.photo_url,
                  alt: member.name,
                  className: "w-48 h-48 rounded-full object-cover mx-auto border-4 border-white shadow-xl"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-2 -right-2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-6 h-6 text-white", fill: "currentColor" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: member.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-purple-600 font-semibold mb-4", children: member.role }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 leading-relaxed", children: member.bio })
          ]
        },
        index
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 lg:py-24 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl lg:text-4xl font-bold text-gray-900 mb-4", children: "Visit Us" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl text-gray-600 max-w-2xl mx-auto", children: "Find us at one of our Dublin locations" })
      ] }),
      locations_loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", role: "status", "aria-live": "polite", "aria-label": "Loading locations", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden animate-pulse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-purple-200 to-pink-200 p-6 h-28", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 bg-purple-300 rounded w-3/4 mb-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-purple-200 rounded w-1/2" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-5/6" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-4/5" })
        ] })
      ] }, i)) }),
      locations_error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-center", children: "Unable to load location details. Please try refreshing the page." }) }),
      !locations_loading && !locations_error && locations_for_visit.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: locations_for_visit.map((location) => {
        const todayIndex = (/* @__PURE__ */ new Date()).getDay();
        let todayHoursDisplay = "Hours not set";
        if (location.opening_hours_structured && location.opening_hours_structured.length > 0) {
          const todayHours = location.opening_hours_structured.find((h) => h.day_of_week === todayIndex);
          if (todayHours) {
            if (todayHours.is_closed) {
              todayHoursDisplay = "Closed Today";
            } else {
              todayHoursDisplay = `Today: ${todayHours.opens_at} - ${todayHours.closes_at}`;
            }
          }
        } else if (location.opening_hours) {
          const opening_hours = parseOpeningHours(location.opening_hours);
          const today = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
          const today_hours = opening_hours[today] || { open: "Closed", close: "" };
          todayHoursDisplay = today_hours.open !== "Closed" ? `Today: ${today_hours.open} - ${today_hours.close}` : "Closed Today";
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-200 hover:scale-105",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-purple-600 to-pink-600 p-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-white mb-2", children: location.location_name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-purple-100", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 mr-2" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: todayHoursDisplay })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-5 h-5 text-purple-600 flex-shrink-0 mt-1" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900 font-medium", children: location.address_line1 }),
                    location.address_line2 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900", children: location.address_line2 }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-gray-900", children: [
                      location.city,
                      ", ",
                      location.postal_code
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-5 h-5 text-purple-600 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: `tel:${location.phone_number}`,
                      className: "text-gray-900 hover:text-purple-600 transition-colors",
                      children: location.phone_number
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-5 h-5 text-purple-600 flex-shrink-0" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "a",
                    {
                      href: `mailto:${location.email}`,
                      className: "text-gray-900 hover:text-purple-600 transition-colors",
                      children: location.email
                    }
                  )
                ] })
              ] })
            ]
          },
          location.location_id
        );
      }) }),
      !locations_loading && !locations_error && locations_for_visit.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-lg", children: "Location information coming soon" }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 lg:py-20 bg-gradient-to-br from-purple-600 to-pink-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl lg:text-4xl font-bold text-white mb-6", children: "Ready to Experience Kake?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl text-purple-100 mb-8 max-w-2xl mx-auto", children: "Choose your location and discover our handcrafted desserts" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg bg-white text-purple-600 hover:bg-gray-100 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105",
          children: "Start Ordering"
        }
      )
    ] }) })
  ] });
};
export {
  UV_About as default
};
