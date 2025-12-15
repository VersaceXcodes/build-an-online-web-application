import { i as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, R as React, j as jsxRuntimeExports, l as CircleAlert, L as Link, t as Eye, E as EyeOff, aH as SquarePen, b as axios } from "./index-B48j776u.js";
import { u as useMutation } from "./useMutation-CgqDeWnj.js";
const fetchCorporateSection = async (token) => {
  const { data } = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/homepage/corporate-section`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const updateCorporateSection = async (token, sectionData) => {
  const { data } = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/homepage/corporate-section`,
    sectionData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const UV_AdminHomepage = () => {
  const queryClient = useQueryClient();
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const [formData, setFormData] = reactExports.useState({});
  const [imageUploadMode, setImageUploadMode] = reactExports.useState("url");
  const [isUploadingImage, setIsUploadingImage] = reactExports.useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = reactExports.useState(null);
  const {
    data: section,
    isLoading: loadingSection,
    error: sectionError
  } = useQuery({
    queryKey: ["admin-homepage-corporate-section"],
    queryFn: () => fetchCorporateSection(authToken),
    enabled: !!authToken,
    staleTime: 6e4,
    refetchOnWindowFocus: false
  });
  React.useEffect(() => {
    if (section) {
      setFormData(section);
    }
  }, [section]);
  useMutation({
    mutationFn: (sectionData) => updateCorporateSection(authToken, sectionData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-homepage-corporate-section"] });
      queryClient.invalidateQueries({ queryKey: ["homepage-corporate-section"] });
      showToast("success", "Homepage section updated successfully");
      setUploadedImagePreview(null);
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update section");
    }
  });
  if (loadingSection) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8 animate-pulse", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 bg-gray-200 rounded w-1/3 mb-6" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 bg-gray-200 rounded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 bg-gray-200 rounded" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-32 bg-gray-200 rounded" })
      ] })
    ] }) }) });
  }
  if (sectionError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200 p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-16 w-16 text-blue-500 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Homepage Content Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Control your homepage Corporate & Event Orders section through Event Alerts" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-blue-900 mb-3", children: "How to Manage Homepage Content" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside space-y-2 text-blue-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Go to the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Event Alerts" }),
            " page"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Create a new event or edit an existing one" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Check the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Use as Drop of the Month"' }),
            " option"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Fill in the special price, available until date, and pre-order button details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Save the event - it will automatically appear in the homepage Corporate & Event Orders section" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-amber-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "Important:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'Only ONE event can be marked as "Drop of the Month" at a time. When you mark a new event, any previously marked event will automatically be unmarked.' })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/admin/events",
            className: "flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center",
            children: "Go to Event Alerts"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/admin/dashboard",
            className: "px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors",
            children: "Back to Dashboard"
          }
        )
      ] })
    ] }) }) });
  }
  if (!loadingSection && !section) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200 p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-16 w-16 text-blue-500 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900 mb-2", children: "No Homepage Content Configured" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Set up your homepage Corporate & Event Orders section through Event Alerts" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-blue-900 mb-3", children: "How to Set Up Homepage Content" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ol", { className: "list-decimal list-inside space-y-2 text-blue-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Go to the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Event Alerts" }),
            " page"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Create a new event or edit an existing one" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Check the ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Use as Drop of the Month"' }),
            " option"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Fill in the special price, available until date, and pre-order button details" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "Make sure the event is marked as ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: '"Make visible on landing page"' })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Save the event - it will automatically appear in the homepage Corporate & Event Orders section" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-amber-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "Important:" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'Only ONE event can be marked as "Drop of the Month" at a time. When you mark a new event, any previously marked event will automatically be unmarked.' })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/admin/events",
            className: "flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center",
            children: "Go to Event Alerts"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/admin/dashboard",
            className: "px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors",
            children: "Back to Dashboard"
          }
        )
      ] })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Landing Page Content" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Viewing Drop of the Month - Edit in Event Alerts" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg p-6 md:p-8 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-blue-800", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold mb-1", children: "Viewing Drop of the Month Event" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: 'This content is managed through Event Alerts. Click "Edit in Event Alerts" below to make changes.' })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "font-semibold text-gray-900", children: "Section Visibility" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: formData.is_enabled ? "Section is visible on the homepage" : "Section is hidden from the homepage" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "span",
          {
            className: `flex items-center space-x-2 px-4 py-2 rounded-lg ${formData.is_enabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`,
            children: formData.is_enabled ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-5 w-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Visible" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-5 w-5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Hidden" })
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Event Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900", children: formData.card_title || "N/A" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 whitespace-pre-wrap", children: formData.card_description || "N/A" })
        ] }),
        formData.card_image_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Image" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: formData.card_image_url,
              alt: "Event preview",
              className: "w-full max-w-md h-48 object-cover rounded-lg border border-gray-200"
            }
          )
        ] }),
        formData.special_price && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Special Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900", children: [
            "€",
            formData.special_price
          ] })
        ] }),
        formData.available_until && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Available Until" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900", children: new Date(formData.available_until).toLocaleDateString("en-IE", { year: "numeric", month: "long", day: "numeric" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Pre-order Button Label" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900", children: formData.cta_text || "N/A" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Pre-order Button URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900", children: formData.cta_link || "N/A" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6 border-t border-gray-200 flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/admin/events",
            className: "flex-1 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-center flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-5 w-5" }),
              "Edit in Event Alerts"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/admin/dashboard",
            className: "px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors",
            children: "Back to Dashboard"
          }
        )
      ] })
    ] })
  ] }) });
};
export {
  UV_AdminHomepage as default
};
