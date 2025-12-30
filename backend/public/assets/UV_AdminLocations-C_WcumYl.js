import { u as useAppStore, o as useQueryClient, r as reactExports, a as useQuery, R as React, j as jsxRuntimeExports, aI as Building2, aK as SquarePen, M as MapPin, X, C as Clock, aO as Save, b as axios } from "./index-BU6_V1I5.js";
import { u as useMutation } from "./useMutation-oexYD0Jy.js";
import { B as Button } from "./button-CunN5QwN.js";
import { C as Card } from "./card-B1ZFsrlN.js";
import "./utils-DL4harQt.js";
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const fetchLocations = async (token) => {
  const { data } = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/locations`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
const fetchOpeningHours = async (token, location_id) => {
  const { data } = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/locations/${location_id}/opening-hours`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
const updateLocation = async (token, location_id, locationData) => {
  const { data } = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/locations/${location_id}`,
    locationData,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
const updateOpeningHours = async (token, location_id, hours) => {
  const { data } = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/locations/${location_id}/opening-hours`,
    { hours },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return data;
};
const UV_AdminLocations = () => {
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showNotification = useAppStore((state) => state.show_notification);
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = reactExports.useState(null);
  const [editingHours, setEditingHours] = reactExports.useState(false);
  const [formData, setFormData] = reactExports.useState({});
  const [hoursData, setHoursData] = reactExports.useState([]);
  const { data: locations, isLoading } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: () => fetchLocations(authToken),
    enabled: !!authToken
  });
  const { data: openingHours } = useQuery({
    queryKey: ["opening-hours", selectedLocation == null ? void 0 : selectedLocation.location_id],
    queryFn: () => fetchOpeningHours(authToken, selectedLocation.location_id),
    enabled: !!authToken && !!selectedLocation
  });
  const updateLocationMutation = useMutation({
    mutationFn: ({ location_id, data }) => updateLocation(authToken, location_id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
      showNotification("Location updated successfully", "success");
      setSelectedLocation(null);
      setFormData({});
    },
    onError: () => {
      showNotification("Failed to update location", "error");
    }
  });
  const updateHoursMutation = useMutation({
    mutationFn: ({ location_id, hours }) => updateOpeningHours(authToken, location_id, hours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opening-hours", selectedLocation == null ? void 0 : selectedLocation.location_id] });
      showNotification("Opening hours updated successfully", "success");
      setEditingHours(false);
    },
    onError: () => {
      showNotification("Failed to update opening hours", "error");
    }
  });
  React.useEffect(() => {
    if (openingHours && editingHours) {
      if (openingHours.length > 0) {
        setHoursData(openingHours);
      } else {
        setHoursData(DAYS.map((_, idx) => ({
          day_of_week: idx,
          opens_at: idx === 0 ? null : "09:00",
          closes_at: idx === 0 ? null : "18:00",
          is_closed: idx === 0
        })));
      }
    }
  }, [openingHours, editingHours]);
  const handleEditLocation = (location) => {
    setSelectedLocation(location);
    setFormData(location);
    setEditingHours(false);
  };
  const handleSaveLocation = () => {
    if (!selectedLocation) return;
    updateLocationMutation.mutate({
      location_id: selectedLocation.location_id,
      data: formData
    });
  };
  const handleSaveHours = () => {
    if (!selectedLocation) return;
    for (const hour of hoursData) {
      if (!hour.is_closed) {
        if (!hour.opens_at || !hour.closes_at) {
          showNotification(`Please set opening and closing times for ${DAYS[hour.day_of_week]} or mark it as closed`, "error");
          return;
        }
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(hour.opens_at) || !timeRegex.test(hour.closes_at)) {
          showNotification(`Invalid time format for ${DAYS[hour.day_of_week]}. Use HH:MM format`, "error");
          return;
        }
        if (hour.closes_at <= hour.opens_at) {
          showNotification(`Closing time must be after opening time for ${DAYS[hour.day_of_week]}`, "error");
          return;
        }
      }
    }
    updateHoursMutation.mutate({
      location_id: selectedLocation.location_id,
      hours: hoursData
    });
  };
  const handleHourChange = (dayIndex, field, value) => {
    setHoursData(
      (prev) => prev.map((hour, idx) => {
        if (idx !== dayIndex) return hour;
        if (field === "is_closed" && value === true) {
          return { ...hour, is_closed: true, opens_at: null, closes_at: null };
        }
        if (field === "is_closed" && value === false) {
          return {
            ...hour,
            is_closed: false,
            opens_at: hour.opens_at || "09:00",
            closes_at: hour.closes_at || "18:00"
          };
        }
        return { ...hour, [field]: value };
      })
    );
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 bg-gray-200 rounded w-1/3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-64 bg-gray-200 rounded" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-bold text-gray-900 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-8 w-8" }),
        "Location Management"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mt-2", children: "Manage location details, contact information, and opening hours" })
    ] }),
    !selectedLocation ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: locations == null ? void 0 : locations.map((location) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6 hover:shadow-lg transition-shadow", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900", children: location.location_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500", children: [
            "/",
            location.slug
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            onClick: () => handleEditLocation(location),
            variant: "ghost",
            size: "sm",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "h-4 w-4" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2 text-gray-600", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-4 w-4" }),
          location.city
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: location.phone_number }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: location.email }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-4", children: [
          location.is_collection_enabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 bg-green-100 text-green-800 rounded text-xs", children: "Collection" }),
          location.is_delivery_enabled && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs", children: "Delivery" }),
          !location.is_active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 py-1 bg-red-100 text-red-800 rounded text-xs", children: "Inactive" })
        ] })
      ] })
    ] }, location.location_id)) }) : (
      /* Edit Form */
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-bold", children: [
            "Edit ",
            selectedLocation.location_name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
            setSelectedLocation(null);
            setEditingHours(false);
          }, variant: "ghost", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4 mb-6 border-b", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setEditingHours(false),
              className: `px-4 py-2 ${!editingHours ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`,
              children: "Location Details"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setEditingHours(true),
              className: `px-4 py-2 flex items-center gap-2 ${editingHours ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-4 w-4" }),
                "Opening Hours"
              ]
            }
          )
        ] }),
        !editingHours ? (
          /* Location Details Form */
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Location Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: formData.location_name || "",
                    onChange: (e) => setFormData({ ...formData, location_name: e.target.value }),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Slug *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: formData.slug || "",
                    onChange: (e) => setFormData({ ...formData, slug: e.target.value }),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Address Line 1 *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: formData.address_line1 || "",
                    onChange: (e) => setFormData({ ...formData, address_line1: e.target.value }),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Address Line 2" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: formData.address_line2 || "",
                    onChange: (e) => setFormData({ ...formData, address_line2: e.target.value }),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "City *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: formData.city || "",
                    onChange: (e) => setFormData({ ...formData, city: e.target.value }),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Postal Code *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: formData.postal_code || "",
                    onChange: (e) => setFormData({ ...formData, postal_code: e.target.value }),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Country *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: formData.country || "",
                    onChange: (e) => setFormData({ ...formData, country: e.target.value }),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "tel",
                    value: formData.phone_number || "",
                    onChange: (e) => setFormData({ ...formData, phone_number: e.target.value }),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "email",
                    value: formData.email || "",
                    onChange: (e) => setFormData({ ...formData, email: e.target.value }),
                    className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: formData.is_collection_enabled ?? false,
                      onChange: (e) => setFormData({ ...formData, is_collection_enabled: e.target.checked }),
                      className: "rounded"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Collection Enabled" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: formData.is_delivery_enabled ?? false,
                      onChange: (e) => setFormData({ ...formData, is_delivery_enabled: e.target.checked }),
                      className: "rounded"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Delivery Enabled" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: formData.is_active ?? true,
                      onChange: (e) => setFormData({ ...formData, is_active: e.target.checked }),
                      className: "rounded"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "Active" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => {
                setSelectedLocation(null);
                setFormData({});
              }, variant: "outline", children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSaveLocation, disabled: updateLocationMutation.isPending, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
                "Save Changes"
              ] })
            ] })
          ] })
        ) : (
          /* Opening Hours Form */
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-4", children: "Day" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-4", children: "Opens At" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-4", children: "Closes At" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-2 px-4", children: "Closed" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: DAYS.map((day, idx) => {
                const hour = hoursData.find((h) => h.day_of_week === idx) || {
                  opens_at: null,
                  closes_at: null,
                  is_closed: true
                };
                return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-4 font-medium", children: day }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "time",
                      value: hour.opens_at || "",
                      onChange: (e) => handleHourChange(idx, "opens_at", e.target.value),
                      disabled: hour.is_closed,
                      className: "px-2 py-1 border rounded disabled:bg-gray-100"
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "time",
                      value: hour.closes_at || "",
                      onChange: (e) => handleHourChange(idx, "closes_at", e.target.value),
                      disabled: hour.is_closed,
                      className: "px-2 py-1 border rounded disabled:bg-gray-100"
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "py-2 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "checkbox",
                      checked: hour.is_closed,
                      onChange: (e) => handleHourChange(idx, "is_closed", e.target.checked),
                      className: "rounded"
                    }
                  ) })
                ] }, idx);
              }) })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 pt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setEditingHours(false), variant: "outline", children: "Cancel" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: handleSaveHours, disabled: updateHoursMutation.isPending, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-4 w-4 mr-2" }),
                "Save Hours"
              ] })
            ] })
          ] })
        )
      ] })
    )
  ] });
};
export {
  UV_AdminLocations as default
};
