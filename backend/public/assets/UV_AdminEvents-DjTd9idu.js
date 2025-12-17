import { o as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, L as Link, d as CircleAlert, t as Plus, X, aP as Link$1, ag as Upload, z as Check, y as Eye, x as EyeOff, M as MapPin, J as Calendar, C as Clock, E as ExternalLink, ap as Image, aK as SquarePen, b as axios } from "./index-HeRxKVXe.js";
import { u as useMutation } from "./useMutation-7uzCkorR.js";
const fetchStallEvents = async (token) => {
  const { data } = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/stall-events`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const createStallEvent = async (token, eventData) => {
  const { data } = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/stall-events`,
    eventData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const updateStallEvent = async (token, event_id, eventData) => {
  const { data } = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/stall-events/${event_id}`,
    eventData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const UV_AdminEvents = () => {
  var _a, _b;
  const queryClient = useQueryClient();
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const [editingEventId, setEditingEventId] = reactExports.useState(null);
  const [editingEventData, setEditingEventData] = reactExports.useState({});
  const [showAddEvent, setShowAddEvent] = reactExports.useState(false);
  const [newEventData, setNewEventData] = reactExports.useState({
    is_visible: true,
    // Default to visible so events appear on landing page immediately
    cta_button_action: "internal_link",
    is_drop_of_the_month: false,
    special_price: null,
    available_until: null,
    preorder_button_label: null,
    preorder_button_url: null
  });
  const [imageUploadMode, setImageUploadMode] = reactExports.useState("url");
  const [editImageUploadMode, setEditImageUploadMode] = reactExports.useState("url");
  const [isUploadingImage, setIsUploadingImage] = reactExports.useState(false);
  const [uploadedImagePreview, setUploadedImagePreview] = reactExports.useState(null);
  const [editUploadedImagePreview, setEditUploadedImagePreview] = reactExports.useState(null);
  const {
    data: events,
    isLoading: loadingEvents,
    error: eventsError
  } = useQuery({
    queryKey: ["admin-stall-events"],
    queryFn: () => fetchStallEvents(authToken),
    enabled: !!authToken,
    staleTime: 6e4,
    refetchOnWindowFocus: false
  });
  const createEventMutation = useMutation({
    mutationFn: (eventData) => createStallEvent(authToken, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stall-events"] });
      queryClient.invalidateQueries({ queryKey: ["stall-event"] });
      showToast("success", "Event created successfully and is now visible on the landing page");
      setShowAddEvent(false);
      setNewEventData({
        is_visible: true,
        // Reset to visible default
        cta_button_action: "internal_link"
      });
      setUploadedImagePreview(null);
      setImageUploadMode("url");
    },
    onError: (error) => {
      var _a2, _b2;
      showToast("error", ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to create event");
    }
  });
  const updateEventMutation = useMutation({
    mutationFn: ({ event_id, eventData }) => updateStallEvent(authToken, event_id, eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stall-events"] });
      queryClient.invalidateQueries({ queryKey: ["stall-event"] });
      showToast("success", "Event updated successfully");
      setEditingEventId(null);
      setEditingEventData({});
      setEditUploadedImagePreview(null);
      setEditImageUploadMode("url");
    },
    onError: (error) => {
      var _a2, _b2;
      showToast("error", ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to update event");
    }
  });
  const startEditEvent = (event) => {
    setEditingEventId(event.event_id);
    setEditingEventData(event);
    setEditUploadedImagePreview(null);
    setEditImageUploadMode("url");
  };
  const cancelEditEvent = () => {
    setEditingEventId(null);
    setEditingEventData({});
    setEditUploadedImagePreview(null);
    setEditImageUploadMode("url");
  };
  const saveEvent = () => {
    if (!editingEventId) return;
    updateEventMutation.mutate({
      event_id: editingEventId,
      eventData: editingEventData
    });
  };
  const handleEventFieldChange = (field, value) => {
    setEditingEventData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleNewEventFieldChange = (field, value) => {
    setNewEventData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleCreateEvent = () => {
    if (!newEventData.event_name || !newEventData.venue_location || !newEventData.event_date || !newEventData.event_time) {
      showToast("error", "Event name, location, date, and time are required");
      return;
    }
    createEventMutation.mutate(newEventData);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const handleImageUpload = async (file, isEditMode = false) => {
    var _a2, _b2;
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("error", "Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("error", "File size must be less than 5MB");
      return;
    }
    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const response = await axios.post(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/upload-event-image`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      const imageUrl = response.data.image_url;
      if (isEditMode) {
        setEditUploadedImagePreview(imageUrl);
        handleEventFieldChange("event_image_url", imageUrl);
      } else {
        setUploadedImagePreview(imageUrl);
        handleNewEventFieldChange("event_image_url", imageUrl);
      }
      showToast("success", "Image uploaded successfully");
    } catch (error) {
      showToast("error", ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Special Event Alerts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Manage special event cards displayed on the landing page" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/admin/dashboard",
          className: "px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium",
          children: "Back to Dashboard"
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      loadingEvents && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading events..." })
      ] }) }),
      eventsError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-red-600 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error Loading Events" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700 mt-1", children: ((_b = (_a = eventsError == null ? void 0 : eventsError.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to load events" })
        ] })
      ] }) }),
      !loadingEvents && !eventsError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-blue-900 mb-1", children: "How Event Alerts Work" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-blue-800", children: 'Event alerts are displayed as prominent special cards on the landing page. Make sure to check the "Make visible on landing page" checkbox when creating events so customers can see them.' })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Event Alerts" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "These alerts appear as special cards on the homepage when marked as visible" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowAddEvent(true),
              className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
                "Add Event Alert"
              ]
            }
          )
        ] }),
        showAddEvent && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border-2 border-blue-200 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 text-blue-600" }),
              "Create New Event Alert"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => {
                  setShowAddEvent(false);
                  setUploadedImagePreview(null);
                  setImageUploadMode("url");
                },
                className: "p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Event Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newEventData.event_name || "",
                    onChange: (e) => handleNewEventFieldChange("event_name", e.target.value),
                    placeholder: "e.g., Christmas Market",
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Venue Location *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newEventData.venue_location || "",
                    onChange: (e) => handleNewEventFieldChange("venue_location", e.target.value),
                    placeholder: "e.g., Phoenix Park, Dublin",
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Event Date *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "date",
                    value: newEventData.event_date || "",
                    onChange: (e) => handleNewEventFieldChange("event_date", e.target.value),
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Event Time *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newEventData.event_time || "",
                    onChange: (e) => handleNewEventFieldChange("event_time", e.target.value),
                    placeholder: "e.g., 10:00 AM - 5:00 PM",
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Description" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "textarea",
                  {
                    value: newEventData.description || "",
                    onChange: (e) => handleNewEventFieldChange("description", e.target.value),
                    placeholder: "Add event description...",
                    rows: 3,
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Event Image" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setImageUploadMode("url"),
                      className: `flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${imageUploadMode === "url" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { className: "w-4 h-4" }),
                        "URL"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setImageUploadMode("upload"),
                      className: `flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${imageUploadMode === "upload" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" }),
                        "Upload"
                      ]
                    }
                  )
                ] }),
                imageUploadMode === "url" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newEventData.event_image_url || "",
                    onChange: (e) => handleNewEventFieldChange("event_image_url", e.target.value),
                    placeholder: "https://...",
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                ),
                imageUploadMode === "upload" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "file",
                      accept: "image/jpeg,image/jpg,image/png,image/gif,image/webp",
                      onChange: (e) => {
                        var _a2;
                        const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
                        if (file) handleImageUpload(file, false);
                      },
                      disabled: isUploadingImage,
                      className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                    }
                  ),
                  isUploadingImage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2 text-sm text-gray-600", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" }),
                    "Uploading..."
                  ] })
                ] }),
                (uploadedImagePreview || newEventData.event_image_url) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: uploadedImagePreview || newEventData.event_image_url,
                    alt: "Event preview",
                    className: "max-w-xs h-32 object-cover rounded-lg border-2 border-gray-200",
                    onError: (e) => {
                      e.currentTarget.style.display = "none";
                    }
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Call-to-Action Button Text" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newEventData.cta_button_text || "",
                    onChange: (e) => handleNewEventFieldChange("cta_button_text", e.target.value),
                    placeholder: "e.g., Learn More",
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Button Action Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: newEventData.cta_button_action || "internal_link",
                    onChange: (e) => handleNewEventFieldChange("cta_button_action", e.target.value),
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "internal_link", children: "Internal Link" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "external_link", children: "External Link" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Button URL" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newEventData.cta_button_url || "",
                    onChange: (e) => handleNewEventFieldChange("cta_button_url", e.target.value),
                    placeholder: newEventData.cta_button_action === "external_link" ? "https://..." : "/location/...",
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-4 mt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "checkbox",
                    id: "new-is-drop",
                    checked: newEventData.is_drop_of_the_month === true,
                    onChange: (e) => handleNewEventFieldChange("is_drop_of_the_month", e.target.checked),
                    className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "new-is-drop", className: "text-sm font-medium text-gray-900", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-semibold", children: "★" }),
                  " Use as Drop of the Month in Corporate & Event Orders section"
                ] })
              ] }),
              newEventData.is_drop_of_the_month && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 ml-6 p-4 bg-blue-50 rounded-lg", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Special Price (€)" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "number",
                      step: "0.01",
                      min: "0",
                      value: newEventData.special_price || "",
                      onChange: (e) => handleNewEventFieldChange("special_price", e.target.value ? parseFloat(e.target.value) : null),
                      className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                      placeholder: "6.50"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Available Until" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "date",
                      value: newEventData.available_until || "",
                      onChange: (e) => handleNewEventFieldChange("available_until", e.target.value),
                      className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Pre-order Button Label" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      value: newEventData.preorder_button_label || "",
                      onChange: (e) => handleNewEventFieldChange("preorder_button_label", e.target.value),
                      className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                      placeholder: "Pre-order Now"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Pre-order Button URL" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      value: newEventData.preorder_button_url || "",
                      onChange: (e) => handleNewEventFieldChange("preorder_button_url", e.target.value),
                      className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                      placeholder: "/corporate-order"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  id: "new-is-visible",
                  checked: newEventData.is_visible === true,
                  onChange: (e) => handleNewEventFieldChange("is_visible", e.target.checked),
                  className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: "new-is-visible", className: "text-sm font-medium text-gray-900", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-semibold", children: "✓" }),
                " Make visible on landing page"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleCreateEvent,
                  disabled: createEventMutation.isPending,
                  className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2",
                  children: createEventMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }),
                    "Creating..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }),
                    "Create Event"
                  ] })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => {
                    setShowAddEvent(false);
                    setUploadedImagePreview(null);
                    setImageUploadMode("url");
                  },
                  disabled: createEventMutation.isPending,
                  className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors",
                  children: "Cancel"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          events == null ? void 0 : events.map((event) => {
            const isEditing = editingEventId === event.event_id;
            const currentData = isEditing ? editingEventData : event;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4", children: !isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-gray-900", children: event.event_name }),
                      event.is_visible ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }),
                        "Visible"
                      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-3 h-3" }),
                        "Hidden"
                      ] }),
                      event.is_drop_of_the_month && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1", children: "★ Drop of the Month" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm text-gray-600", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4 text-gray-400" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: event.venue_location })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-4 h-4 text-gray-400" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDate(event.event_date) })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-gray-400" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: event.event_time })
                      ] }),
                      event.description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-gray-700", children: event.description }),
                      event.cta_button_text && event.cta_button_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { className: "w-4 h-4 text-gray-400" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Button:" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: event.cta_button_text }),
                        event.cta_button_action === "external_link" && /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3 h-3 text-gray-400" })
                      ] }),
                      event.event_image_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-4 h-4 text-gray-400" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: event.event_image_url, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline text-xs", children: "View Image" })
                      ] }),
                      event.is_drop_of_the_month && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-amber-900 mb-2", children: "Drop of the Month Details:" }),
                        event.special_price && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-800", children: [
                          "Special Price: €",
                          Number(event.special_price).toFixed(2)
                        ] }),
                        event.available_until && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-800", children: [
                          "Available Until: ",
                          new Date(event.available_until).toLocaleDateString()
                        ] }),
                        event.preorder_button_label && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-800", children: [
                          "Button: ",
                          event.preorder_button_label
                        ] }),
                        event.preorder_button_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-800", children: [
                          "URL: ",
                          event.preorder_button_url
                        ] })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => startEditEvent(event),
                      className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "w-4 h-4" }),
                        "Edit"
                      ]
                    }
                  ) })
                ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Event Name" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "text",
                          value: currentData.event_name || "",
                          onChange: (e) => handleEventFieldChange("event_name", e.target.value),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Venue Location" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "text",
                          value: currentData.venue_location || "",
                          onChange: (e) => handleEventFieldChange("venue_location", e.target.value),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Event Date" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "date",
                          value: currentData.event_date || "",
                          onChange: (e) => handleEventFieldChange("event_date", e.target.value),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Event Time" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "text",
                          value: currentData.event_time || "",
                          onChange: (e) => handleEventFieldChange("event_time", e.target.value),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Description" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "textarea",
                        {
                          value: currentData.description || "",
                          onChange: (e) => handleEventFieldChange("description", e.target.value),
                          rows: 3,
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Event Image" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            type: "button",
                            onClick: () => setEditImageUploadMode("url"),
                            className: `flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${editImageUploadMode === "url" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { className: "w-4 h-4" }),
                              "URL"
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs(
                          "button",
                          {
                            type: "button",
                            onClick: () => setEditImageUploadMode("upload"),
                            className: `flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${editImageUploadMode === "upload" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`,
                            children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" }),
                              "Upload"
                            ]
                          }
                        )
                      ] }),
                      editImageUploadMode === "url" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "text",
                          value: currentData.event_image_url || "",
                          onChange: (e) => handleEventFieldChange("event_image_url", e.target.value),
                          placeholder: "https://...",
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      ),
                      editImageUploadMode === "upload" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "file",
                            accept: "image/jpeg,image/jpg,image/png,image/gif,image/webp",
                            onChange: (e) => {
                              var _a2;
                              const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
                              if (file) handleImageUpload(file, true);
                            },
                            disabled: isUploadingImage,
                            className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                          }
                        ),
                        isUploadingImage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-2 text-sm text-gray-600", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" }),
                          "Uploading..."
                        ] })
                      ] }),
                      (editUploadedImagePreview || currentData.event_image_url) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "img",
                        {
                          src: editUploadedImagePreview || currentData.event_image_url,
                          alt: "Event preview",
                          className: "max-w-xs h-32 object-cover rounded-lg border-2 border-gray-200",
                          onError: (e) => {
                            e.currentTarget.style.display = "none";
                          }
                        }
                      ) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Call-to-Action Button Text" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "text",
                          value: currentData.cta_button_text || "",
                          onChange: (e) => handleEventFieldChange("cta_button_text", e.target.value),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Button Action Type" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "select",
                        {
                          value: currentData.cta_button_action || "internal_link",
                          onChange: (e) => handleEventFieldChange("cta_button_action", e.target.value),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "internal_link", children: "Internal Link" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "external_link", children: "External Link" })
                          ]
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Button URL" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "text",
                          value: currentData.cta_button_url || "",
                          onChange: (e) => handleEventFieldChange("cta_button_url", e.target.value),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-gray-200 pt-4 mt-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "checkbox",
                          id: `is-drop-${event.event_id}`,
                          checked: currentData.is_drop_of_the_month === true,
                          onChange: (e) => handleEventFieldChange("is_drop_of_the_month", e.target.checked),
                          className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: `is-drop-${event.event_id}`, className: "text-sm font-medium text-gray-900", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-semibold", children: "★" }),
                        " Use as Drop of the Month in Corporate & Event Orders section"
                      ] })
                    ] }),
                    currentData.is_drop_of_the_month && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 ml-6 p-4 bg-blue-50 rounded-lg", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Special Price (€)" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "number",
                            step: "0.01",
                            min: "0",
                            value: currentData.special_price || "",
                            onChange: (e) => handleEventFieldChange("special_price", e.target.value ? parseFloat(e.target.value) : null),
                            className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                            placeholder: "6.50"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Available Until" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "date",
                            value: currentData.available_until || "",
                            onChange: (e) => handleEventFieldChange("available_until", e.target.value),
                            className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Pre-order Button Label" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "text",
                            value: currentData.preorder_button_label || "",
                            onChange: (e) => handleEventFieldChange("preorder_button_label", e.target.value),
                            className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                            placeholder: "Pre-order Now"
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Pre-order Button URL" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "text",
                            value: currentData.preorder_button_url || "",
                            onChange: (e) => handleEventFieldChange("preorder_button_url", e.target.value),
                            className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                            placeholder: "/corporate-order"
                          }
                        )
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        id: `is-visible-${event.event_id}`,
                        checked: currentData.is_visible === true,
                        onChange: (e) => handleEventFieldChange("is_visible", e.target.checked),
                        className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { htmlFor: `is-visible-${event.event_id}`, className: "text-sm font-medium text-gray-900", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-semibold", children: "✓" }),
                      " Make visible on landing page"
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: saveEvent,
                        disabled: updateEventMutation.isPending,
                        className: "flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2",
                        children: updateEventMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }),
                          "Saving..."
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }),
                          "Save Changes"
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: cancelEditEvent,
                        disabled: updateEventMutation.isPending,
                        className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors",
                        children: "Cancel"
                      }
                    )
                  ] })
                ] }) })
              },
              event.event_id
            );
          }),
          (events == null ? void 0 : events.length) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-16 h-16 mx-auto mb-4 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Events Yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-6", children: "Create your first event alert to display on the homepage." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setShowAddEvent(true),
                className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
                  "Add Event Alert"
                ]
              }
            )
          ] }) })
        ] })
      ] })
    ] })
  ] }) });
};
export {
  UV_AdminEvents as default
};
