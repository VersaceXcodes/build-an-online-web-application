import { u as useAppStore, a as useQuery, j as jsxRuntimeExports, m as motion, L as Link, b as axios } from "./index-nYaE10KP.js";
const kakeWatermarkLogo = "/assets/kake-logo-C2DhmFCR.png";
const fetchLocations = async () => {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/locations`
  );
  return response.data;
};
const fetchDropOfTheMonth = async () => {
  var _a;
  try {
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/drop-of-the-month`
    );
    return response.data;
  } catch (error) {
    if (((_a = error.response) == null ? void 0 : _a.status) === 404) {
      return null;
    }
    throw error;
  }
};
const fetchStallEvent = async () => {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/stall-events?is_visible=true`
  );
  return response.data && response.data.length > 0 ? response.data[0] : null;
};
const fetchCorporateSection = async () => {
  var _a;
  try {
    const response = await axios.get(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/homepage/corporate-section`
    );
    return response.data;
  } catch (error) {
    if (((_a = error.response) == null ? void 0 : _a.status) === 404) {
      return null;
    }
    throw error;
  }
};
const UV_Landing = () => {
  const setCurrentLocation = useAppStore((state) => state.set_current_location);
  const setLocationDetails = useAppStore((state) => state.set_location_details);
  const {
    data: locations = [],
    isLoading: locations_loading,
    error: locations_error
  } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
    staleTime: 6e4,
    // 1 minute
    refetchOnWindowFocus: false
  });
  const {
    data: active_drop,
    isLoading: drop_loading
  } = useQuery({
    queryKey: ["drop-of-the-month"],
    queryFn: fetchDropOfTheMonth,
    staleTime: 6e4,
    refetchOnWindowFocus: false
  });
  const {
    data: active_event,
    isLoading: event_loading
  } = useQuery({
    queryKey: ["stall-event"],
    queryFn: fetchStallEvent,
    staleTime: 6e4,
    refetchOnWindowFocus: false
  });
  const {
    data: corporate_section,
    isLoading: corporate_loading
  } = useQuery({
    queryKey: ["homepage-corporate-section"],
    queryFn: fetchCorporateSection,
    staleTime: 6e4,
    refetchOnWindowFocus: false
  });
  const show_event_section = (active_event == null ? void 0 : active_event.is_visible) || false;
  const show_corporate_section = (corporate_section == null ? void 0 : corporate_section.is_enabled) || false;
  const nameToSlug = (name) => {
    return name.toLowerCase().trim().replace(/\s+/g, "-");
  };
  const getLocationDescription = (location) => {
    if (location.is_collection_enabled && location.is_delivery_enabled) {
      return "Collection & Delivery available";
    } else if (location.is_collection_enabled) {
      return "Collection available";
    } else if (location.is_delivery_enabled) {
      return "Delivery available";
    } else if (location.just_eat_url || location.deliveroo_url) {
      return "Order via Just Eat & Deliveroo";
    } else {
      return "Coming soon";
    }
  };
  const defaultLocationImages = [
    "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80",
    "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=800&q=80",
    "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
  ];
  const location_card_data = locations.map((location, index) => ({
    name: location.location_name,
    slug: nameToSlug(location.location_name),
    image: defaultLocationImages[index % defaultLocationImages.length],
    description: getLocationDescription(location),
    imageAlt: `${location.location_name} storefront - ${getLocationDescription(location)}`,
    location
    // Include the full location object for easy access
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative bg-luxury-darkCharcoal py-20 lg:py-32 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "absolute inset-0 opacity-0 animate-watermark-fade-in",
          style: {
            backgroundImage: `url(${kakeWatermarkLogo})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundSize: "80%",
            pointerEvents: "none",
            opacity: 0.05
          }
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-luxury backdrop-blur-glass rounded-3xl p-8 md:p-12 lg:p-16 shadow-luxury-lg animate-fade-in", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-luxury-champagne mb-6 leading-tight text-center", children: [
          "Indulge in Dublin's Finest",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-luxury-gold-500 mt-2", children: "Artisan Desserts" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-lg md:text-xl text-luxury-champagne/90 mb-8 max-w-2xl mx-auto leading-relaxed text-center", children: "Handcrafted treats made fresh daily across three Dublin locations. From classic pastries to celebration cakes, we bring joy to every bite." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "a",
          {
            href: "#locations",
            className: "inline-block gradient-gold text-luxury-darkCharcoal font-semibold px-8 py-4 min-h-[48px] rounded-xl shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 transform hover:scale-105",
            children: "Choose Your Location"
          }
        ) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative -mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "svg",
      {
        className: "w-full h-12 md:h-16 lg:h-20",
        viewBox: "0 0 1200 120",
        preserveAspectRatio: "none",
        xmlns: "http://www.w3.org/2000/svg",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              d: "M0,0 C150,60 350,60 600,30 C850,0 1050,0 1200,30 L1200,120 L0,120 Z",
              fill: "#D4AF37",
              opacity: "0.2"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              d: "M0,20 C200,80 400,80 600,50 C800,20 1000,20 1200,50 L1200,120 L0,120 Z",
              fill: "#D4AF37",
              opacity: "0.15"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "path",
            {
              d: "M0,40 C250,100 450,100 600,70 C750,40 950,40 1200,70 L1200,120 L0,120 Z",
              fill: "#121212"
            }
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "locations", className: "py-16 lg:py-24 bg-luxury-darkCocoa", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-3xl md:text-4xl font-bold text-luxury-champagne mb-4", children: "Our Locations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-lg text-luxury-champagne/80 max-w-2xl mx-auto", children: "Choose your nearest Kake location to start ordering" })
      ] }),
      locations_loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8", role: "status", "aria-live": "polite", "aria-label": "Loading locations", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-luxury rounded-xl shadow-luxury overflow-hidden animate-pulse", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-56 bg-gradient-to-br from-luxury-darkCocoa to-luxury-darkCharcoal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 bg-luxury-gold-500/20 rounded w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-luxury-gold-500/10 rounded w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-luxury-gold-500/10 rounded w-2/3" })
        ] })
      ] }, i)) }),
      locations_error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-luxury border-2 border-red-500/50 rounded-xl p-6 text-center shadow-glow-gold-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-400 font-medium", children: "Unable to load locations. Please refresh the page." }) }),
      !locations_loading && !locations_error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8", children: location_card_data.map((card, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 50 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-50px" },
          transition: {
            duration: 0.5,
            delay: index * 0.15,
            ease: [0.25, 0.46, 0.45, 0.94]
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: `/location/${card.slug}`,
              onClick: () => {
                console.log("Location card clicked:", {
                  cardName: card.name,
                  cardSlug: card.slug,
                  locationFound: true,
                  locationName: card.location.location_name,
                  navigatingTo: `/location/${card.slug}`
                });
                setCurrentLocation(card.location.location_name);
                setLocationDetails(card.location);
              },
              className: "block group glass-luxury rounded-2xl shadow-luxury border border-luxury-gold-500/30 overflow-hidden hover:shadow-glow-gold-lg hover:border-luxury-gold-500 hover:scale-[1.02] transition-all duration-300 min-h-[44px]",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-56 overflow-hidden", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: card.image,
                      alt: card.imageAlt,
                      className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500",
                      loading: "lazy"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-luxury-darkCharcoal/90 to-transparent" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-4 right-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-2xl font-bold text-luxury-champagne mb-1 group-hover:text-luxury-gold-500 transition-colors duration-300", children: card.name }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-luxury-champagne/80 mb-4 flex items-center font-sans", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-5 h-5 mr-2 text-luxury-gold-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M15 11a3 3 0 11-6 0 3 3 0 016 0z" })
                    ] }),
                    card.description
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm text-luxury-champagne/70 font-sans", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-start", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4 mt-0.5 mr-2 flex-shrink-0 text-luxury-gold-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" }) }),
                      card.location.address_line1,
                      ", ",
                      card.location.city
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-4 h-4 mr-2 text-luxury-gold-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" }) }),
                      card.location.phone_number
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-between text-luxury-gold-500 font-semibold font-sans group-hover:text-luxury-gold-400 min-h-[44px] md:min-h-[auto]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Start Ordering" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 transform group-hover:translate-x-1 transition-transform", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5l7 7-7 7" }) })
                  ] })
                ] })
              ]
            }
          )
        },
        card.slug
      )) })
    ] }) }),
    show_corporate_section && corporate_section && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 lg:py-24 bg-luxury-darkCharcoal", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-3xl md:text-4xl font-bold text-luxury-champagne mb-4", children: corporate_section.section_title }),
        corporate_section.section_subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-lg text-luxury-champagne/80 max-w-2xl mx-auto", children: corporate_section.section_subtitle })
      ] }),
      corporate_loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-luxury rounded-xl shadow-luxury overflow-hidden animate-pulse", role: "status", "aria-live": "polite", "aria-label": "Loading corporate section", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-80 md:h-full bg-gradient-to-br from-luxury-darkCocoa to-luxury-darkCharcoal" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 lg:p-12 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 bg-luxury-gold-500/20 rounded w-3/4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-luxury-gold-500/10 rounded w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-luxury-gold-500/10 rounded w-5/6" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-luxury-gold-500/10 rounded w-2/3" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-20 bg-luxury-gold-500/10 rounded" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 bg-luxury-gold-500/20 rounded w-48" })
        ] })
      ] }) }),
      !corporate_loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-luxury rounded-xl shadow-luxury-lg overflow-hidden border border-luxury-gold-500/30 hover:border-luxury-gold-500 hover:shadow-glow-gold-lg transition-all duration-300", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-80 md:h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: corporate_section.card_image_url,
            alt: corporate_section.card_title,
            className: "w-full h-full object-cover",
            loading: "lazy"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 lg:p-12 flex flex-col justify-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-3xl lg:text-4xl font-bold text-luxury-champagne mb-4", children: corporate_section.card_title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-lg text-luxury-champagne/80 mb-6 leading-relaxed", children: corporate_section.card_description }),
          (corporate_section.special_price || corporate_section.available_until) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-luxury-darker border border-luxury-gold-500/30 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            corporate_section.special_price && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-luxury-gold-500 font-medium mb-1", children: "Special Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-serif text-3xl font-bold text-luxury-champagne", children: corporate_section.special_price })
            ] }),
            corporate_section.available_until && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-luxury-gold-500 font-medium mb-1", children: "Available Until" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-lg font-semibold text-luxury-champagne", children: corporate_section.available_until })
            ] })
          ] }) }),
          corporate_section.cta_link.startsWith("http") ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "a",
            {
              href: corporate_section.cta_link,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "inline-flex items-center justify-center gradient-gold text-luxury-darkCharcoal font-semibold px-8 py-4 min-h-[48px] rounded-xl shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 transform hover:scale-105 font-sans",
              children: [
                corporate_section.cta_text,
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "ml-2 w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) })
              ]
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: corporate_section.cta_link,
              className: "inline-flex items-center justify-center gradient-gold text-luxury-darkCharcoal font-semibold px-8 py-4 min-h-[48px] rounded-xl shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 transform hover:scale-105 font-sans",
              children: [
                corporate_section.cta_text,
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "ml-2 w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) })
              ]
            }
          )
        ] })
      ] }) })
    ] }) }),
    show_event_section && active_event && /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 lg:py-24 bg-luxury-darkCocoa", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      event_loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-luxury rounded-xl shadow-luxury overflow-hidden border-2 border-luxury-gold-500/30 animate-pulse", role: "status", "aria-live": "polite", "aria-label": "Loading event details", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gradient-gold px-6 py-3 h-12" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64 md:h-full bg-gradient-to-br from-luxury-darkCocoa to-luxury-darkCharcoal" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 lg:p-12 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 bg-luxury-gold-500/20 rounded w-3/4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 bg-luxury-gold-500/10 rounded w-full" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 bg-luxury-gold-500/10 rounded w-5/6" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 bg-luxury-gold-500/10 rounded w-4/6" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-luxury-gold-500/10 rounded w-full" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 bg-gray-200 rounded w-48" })
          ] })
        ] })
      ] }),
      !event_loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-luxury rounded-xl shadow-luxury-lg overflow-hidden border-2 border-luxury-gold-500/50 hover:border-luxury-gold-500 hover:shadow-glow-gold-lg transition-all duration-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gradient-gold px-6 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-luxury-darkCharcoal font-bold text-lg text-center font-sans", children: "Special Event Alert!" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-0", children: [
          active_event.event_image_url && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-64 md:h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: active_event.event_image_url,
              alt: active_event.event_name,
              className: "w-full h-full object-cover",
              loading: "lazy"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `p-8 lg:p-12 ${!active_event.event_image_url ? "md:col-span-2" : ""}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-serif text-3xl font-bold text-luxury-champagne mb-4", children: active_event.event_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-6 font-sans", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-luxury-champagne/80", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 mr-3 text-luxury-gold-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: active_event.venue_location })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-luxury-champagne/80", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 mr-3 text-luxury-gold-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: new Date(active_event.event_date).toLocaleDateString("en-IE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-luxury-champagne/80", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-5 h-5 mr-3 text-luxury-gold-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: active_event.event_time })
              ] })
            ] }),
            active_event.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-luxury-champagne/80 mb-6 leading-relaxed", children: active_event.description }),
            active_event.cta_button_text && active_event.cta_button_url && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: active_event.cta_button_action === "external_link" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "a",
              {
                href: active_event.cta_button_url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "inline-flex items-center justify-center gradient-gold text-luxury-darkCharcoal font-semibold px-8 py-4 min-h-[48px] rounded-xl shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 transform hover:scale-105 font-sans",
                children: [
                  active_event.cta_button_text,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "ml-2 w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" }) })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: active_event.cta_button_url,
                className: "inline-flex items-center justify-center gradient-gold text-luxury-darkCharcoal font-semibold px-8 py-4 min-h-[48px] rounded-xl shadow-glow-gold hover:shadow-glow-gold-lg transition-all duration-300 transform hover:scale-105 font-sans",
                children: [
                  active_event.cta_button_text,
                  /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "ml-2 w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) })
                ]
              }
            ) })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 lg:py-24 bg-white", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl md:text-4xl font-bold text-kake-chocolate-500 mb-4", children: "Why Choose Kake?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-kake-chocolate-400 max-w-2xl mx-auto", children: "Indulge in quality, freshness, and convenience" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-kake-cream-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-10 h-10 text-kake-chocolate-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-kake-chocolate-500 mb-2", children: "Quality Ingredients" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-400 leading-relaxed", children: "We use only the finest ingredients to create our handcrafted desserts daily" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-kake-cream-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-10 h-10 text-kake-chocolate-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-kake-chocolate-500 mb-2", children: "Made Fresh Daily" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-400 leading-relaxed", children: "Every order is prepared fresh to ensure maximum flavor and quality" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-kake-cream-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "w-10 h-10 text-kake-chocolate-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-kake-chocolate-500 mb-2", children: "Flexible Ordering" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-kake-chocolate-400 leading-relaxed", children: "Collection or delivery options available at all our Dublin locations" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-16 lg:py-20 gradient-chocolate", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl md:text-4xl font-bold text-kake-lightCream-100 mb-6", children: "Ready to Order?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg md:text-xl text-kake-cream-200 mb-8 leading-relaxed", children: "Choose your location and start building your perfect dessert order today" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "#locations",
          className: "inline-block bg-kake-lightCream-100 text-kake-chocolate-500 hover:bg-kake-cream-200 font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105",
          children: "Browse Our Locations"
        }
      )
    ] }) })
  ] });
};
export {
  UV_Landing as default
};
