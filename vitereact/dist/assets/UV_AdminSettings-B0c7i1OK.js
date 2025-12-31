import { l as useSearchParams, o as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, L as Link, aF as Settings, M as MapPin, aG as Share2, Y as TrendingUp, C as Clock, aH as Bell, d as CircleAlert, aI as Building2, c as Mail, P as Phone, aJ as Percent, z as Check, aK as SquarePen, X, a0 as Trash2, t as Plus, ag as Upload, ap as Image, y as Eye, x as EyeOff, b as axios } from "./index-BU6_V1I5.js";
import { u as useMutation } from "./useMutation-oexYD0Jy.js";
const fetchSystemSettings = async (token, setting_group) => {
  const params = new URLSearchParams();
  {
    params.append("setting_group", setting_group);
  }
  params.append("limit", "100");
  params.append("offset", "0");
  const { data } = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/settings?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const fetchLocations = async (token) => {
  const { data } = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/locations`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const updateSystemSetting = async (token, setting_id, setting_value) => {
  const { data } = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/settings/${setting_id}`,
    { setting_value },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const updateLocation = async (token, location_id, locationData) => {
  const { data } = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/locations/${location_id}`,
    locationData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const fetchSocialLinks = async (token) => {
  const { data } = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/social-links`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const createSocialLink = async (token, linkData) => {
  const { data } = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/social-links`,
    linkData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const updateSocialLink = async (token, link_id, linkData) => {
  const { data } = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/social-links/${link_id}`,
    linkData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const deleteSocialLink = async (token, link_id) => {
  const { data } = await axios.delete(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/social-links/${link_id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const uploadSocialIcon = async (token, file) => {
  const formData = new FormData();
  formData.append("icon", file);
  const { data } = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/upload-social-icon`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    }
  );
  return data;
};
const UV_AdminSettings = () => {
  var _a, _b, _c, _d, _e, _f;
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const activeSection = searchParams.get("section") || "general";
  const [editingSettingId, setEditingSettingId] = reactExports.useState(null);
  const [editingSettingValue, setEditingSettingValue] = reactExports.useState("");
  const [editingLocationId, setEditingLocationId] = reactExports.useState(null);
  const [editingLocationData, setEditingLocationData] = reactExports.useState({});
  const [editingSocialLinkId, setEditingSocialLinkId] = reactExports.useState(null);
  const [editingSocialLinkData, setEditingSocialLinkData] = reactExports.useState({});
  const [showAddSocialLink, setShowAddSocialLink] = reactExports.useState(false);
  const [uploadingIcon, setUploadingIcon] = reactExports.useState(false);
  const [uploadedIconUrl, setUploadedIconUrl] = reactExports.useState("");
  const [editUploadedIconUrl, setEditUploadedIconUrl] = reactExports.useState("");
  const [newSocialLinkData, setNewSocialLinkData] = reactExports.useState({
    icon_type: "lucide",
    hover_color: "#3b82f6",
    display_order: 0,
    is_active: true
  });
  const sectionToGroupMap = {
    "general": "general",
    "loyalty_points": "loyalty",
    "orders": "orders",
    "notifications": "notifications"
  };
  const settingGroup = sectionToGroupMap[activeSection] || activeSection;
  const {
    data: systemSettings,
    isLoading: loadingSettings,
    error: settingsError
  } = useQuery({
    queryKey: ["system-settings", activeSection],
    queryFn: () => fetchSystemSettings(authToken, settingGroup),
    enabled: !!authToken,
    staleTime: 6e4,
    refetchOnWindowFocus: false
  });
  const {
    data: locations,
    isLoading: loadingLocations,
    error: locationsError
  } = useQuery({
    queryKey: ["locations-settings"],
    queryFn: () => fetchLocations(authToken),
    enabled: !!authToken && activeSection === "locations",
    staleTime: 6e4,
    refetchOnWindowFocus: false
  });
  const {
    data: socialLinks,
    isLoading: loadingSocialLinks,
    error: socialLinksError
  } = useQuery({
    queryKey: ["social-links-settings"],
    queryFn: () => fetchSocialLinks(authToken),
    enabled: !!authToken && activeSection === "social_media",
    staleTime: 6e4,
    refetchOnWindowFocus: false
  });
  const updateSettingMutation = useMutation({
    mutationFn: ({ setting_id, setting_value }) => updateSystemSetting(authToken, setting_id, setting_value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      showToast("success", "Setting updated successfully");
      setEditingSettingId(null);
      setEditingSettingValue("");
    },
    onError: (error) => {
      var _a2, _b2;
      showToast("error", ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to update setting");
    }
  });
  const updateLocationMutation = useMutation({
    mutationFn: ({ location_id, locationData }) => updateLocation(authToken, location_id, locationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations-settings"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      showToast("success", "Location updated successfully");
      setEditingLocationId(null);
      setEditingLocationData({});
    },
    onError: (error) => {
      var _a2, _b2;
      showToast("error", ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to update location");
    }
  });
  const createSocialLinkMutation = useMutation({
    mutationFn: (linkData) => createSocialLink(authToken, linkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links-settings"] });
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      showToast("success", "Social media link created successfully");
      setShowAddSocialLink(false);
      setNewSocialLinkData({
        icon_type: "lucide",
        hover_color: "#3b82f6",
        display_order: 0,
        is_active: true
      });
      setUploadedIconUrl("");
    },
    onError: (error) => {
      var _a2, _b2;
      showToast("error", ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to create social media link");
    }
  });
  const updateSocialLinkMutation = useMutation({
    mutationFn: ({ link_id, linkData }) => updateSocialLink(authToken, link_id, linkData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links-settings"] });
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      showToast("success", "Social media link updated successfully");
      setEditingSocialLinkId(null);
      setEditingSocialLinkData({});
      setEditUploadedIconUrl("");
    },
    onError: (error) => {
      var _a2, _b2;
      showToast("error", ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to update social media link");
    }
  });
  const deleteSocialLinkMutation = useMutation({
    mutationFn: (link_id) => deleteSocialLink(authToken, link_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links-settings"] });
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      showToast("success", "Social media link deleted successfully");
    },
    onError: (error) => {
      var _a2, _b2;
      showToast("error", ((_b2 = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Failed to delete social media link");
    }
  });
  const changeSection = (section) => {
    setSearchParams({ section });
  };
  const startEditSetting = (setting) => {
    setEditingSettingId(setting.setting_id);
    setEditingSettingValue(setting.setting_value);
  };
  const cancelEditSetting = () => {
    setEditingSettingId(null);
    setEditingSettingValue("");
  };
  const saveSetting = () => {
    if (!editingSettingId) return;
    updateSettingMutation.mutate({
      setting_id: editingSettingId,
      setting_value: editingSettingValue
    });
  };
  const startEditLocation = (location) => {
    setEditingLocationId(location.location_id);
    setEditingLocationData(location);
  };
  const cancelEditLocation = () => {
    setEditingLocationId(null);
    setEditingLocationData({});
  };
  const saveLocation = () => {
    if (!editingLocationId) return;
    updateLocationMutation.mutate({
      location_id: editingLocationId,
      locationData: editingLocationData
    });
  };
  const handleLocationFieldChange = (field, value) => {
    setEditingLocationData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const parseExternalProviders = (location) => {
    if (location.external_providers) {
      try {
        const parsed = JSON.parse(location.external_providers);
        if (Array.isArray(parsed)) {
          return parsed.sort((a, b) => a.display_order - b.display_order);
        }
      } catch {
      }
    }
    const providers = [];
    if (location.just_eat_url) {
      providers.push({
        name: "Just Eat",
        url: location.just_eat_url,
        display_order: 1,
        is_active: true
      });
    }
    if (location.deliveroo_url) {
      providers.push({
        name: "Deliveroo",
        url: location.deliveroo_url,
        display_order: 2,
        is_active: true
      });
    }
    return providers;
  };
  const updateExternalProviders = (providers) => {
    const sorted = [...providers].sort((a, b) => a.display_order - b.display_order);
    handleLocationFieldChange("external_providers", JSON.stringify(sorted));
  };
  const addExternalProvider = () => {
    const current = parseExternalProviders(editingLocationData);
    const maxOrder = current.length > 0 ? Math.max(...current.map((p) => p.display_order)) : 0;
    const newProvider = {
      name: "",
      url: "",
      display_order: maxOrder + 1,
      is_active: true
    };
    updateExternalProviders([...current, newProvider]);
  };
  const removeExternalProvider = (index) => {
    const current = parseExternalProviders(editingLocationData);
    const updated = current.filter((_, i) => i !== index);
    updateExternalProviders(updated);
  };
  const updateProviderField = (index, field, value) => {
    const current = parseExternalProviders(editingLocationData);
    current[index] = { ...current[index], [field]: value };
    updateExternalProviders(current);
  };
  const startEditSocialLink = (link) => {
    setEditingSocialLinkId(link.link_id);
    setEditingSocialLinkData(link);
  };
  const cancelEditSocialLink = () => {
    setEditingSocialLinkId(null);
    setEditingSocialLinkData({});
  };
  const saveSocialLink = () => {
    if (!editingSocialLinkId) return;
    updateSocialLinkMutation.mutate({
      link_id: editingSocialLinkId,
      linkData: editingSocialLinkData
    });
  };
  const handleSocialLinkFieldChange = (field, value) => {
    setEditingSocialLinkData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleNewSocialLinkFieldChange = (field, value) => {
    setNewSocialLinkData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const handleCreateSocialLink = () => {
    if (!newSocialLinkData.platform_name || !newSocialLinkData.platform_url) {
      showToast("error", "Platform name and URL are required");
      return;
    }
    createSocialLinkMutation.mutate(newSocialLinkData);
  };
  const handleIconFileUpload = async (e, isEditing = false) => {
    var _a2, _b2, _c2;
    const file = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      showToast("error", "Invalid file type. Only JPEG, PNG, GIF, WEBP, and SVG images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast("error", "File size must be less than 2MB");
      return;
    }
    setUploadingIcon(true);
    try {
      const result = await uploadSocialIcon(authToken, file);
      const iconUrl = result.icon_url;
      if (isEditing) {
        setEditUploadedIconUrl(iconUrl);
        handleSocialLinkFieldChange("icon_url", iconUrl);
      } else {
        setUploadedIconUrl(iconUrl);
        handleNewSocialLinkFieldChange("icon_url", iconUrl);
      }
      showToast("success", "Icon uploaded successfully");
    } catch (error) {
      showToast("error", ((_c2 = (_b2 = error.response) == null ? void 0 : _b2.data) == null ? void 0 : _c2.message) || "Failed to upload icon");
    } finally {
      setUploadingIcon(false);
    }
  };
  const handleDeleteSocialLink = (link_id, platform_name) => {
    if (window.confirm(`Are you sure you want to delete ${platform_name}?`)) {
      deleteSocialLinkMutation.mutate(link_id);
    }
  };
  const sections = [
    { id: "general", label: "General", icon: Settings },
    { id: "locations", label: "Locations", icon: MapPin },
    { id: "social_media", label: "Social Media", icon: Share2 },
    { id: "loyalty_points", label: "Loyalty Points", icon: TrendingUp },
    { id: "orders", label: "Orders", icon: Clock },
    { id: "notifications", label: "Notifications", icon: Bell }
  ];
  const getSettingsByGroup = (group) => {
    return (systemSettings == null ? void 0 : systemSettings.filter((s) => s.setting_group === group)) || [];
  };
  const renderSettingInput = (setting) => {
    const isEditing = editingSettingId === setting.setting_id;
    if (!isEditing) {
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: setting.setting_key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: setting.setting_type === "boolean" ? setting.setting_value === "true" ? "Enabled" : "Disabled" : setting.setting_value })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => startEditSetting(setting),
            className: "ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
            "aria-label": "Edit setting",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "w-4 h-4" })
          }
        )
      ] });
    }
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900", children: setting.setting_key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) }),
      setting.setting_type === "boolean" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "select",
        {
          value: editingSettingValue,
          onChange: (e) => setEditingSettingValue(e.target.value),
          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "true", children: "Enabled" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "false", children: "Disabled" })
          ]
        }
      ) : setting.setting_type === "number" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "number",
          value: editingSettingValue,
          onChange: (e) => setEditingSettingValue(e.target.value),
          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: editingSettingValue,
          onChange: (e) => setEditingSettingValue(e.target.value),
          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: saveSetting,
            disabled: updateSettingMutation.isPending,
            className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2",
            children: updateSettingMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }),
              "Saving..."
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }),
              "Save"
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: cancelEditSetting,
            disabled: updateSettingMutation.isPending,
            className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
          }
        )
      ] })
    ] });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "System Settings" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Configure system-wide settings and operational parameters" })
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "nav",
      {
        className: "flex overflow-x-auto gap-6 px-4 sm:px-6 lg:px-8 scrollbar-hide",
        "aria-label": "Settings sections",
        style: {
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch"
        },
        children: sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => changeSection(section.id),
              className: `
                      flex items-center gap-2 px-4 py-4 border-b-2 font-medium text-sm transition-all whitespace-nowrap flex-shrink-0
                      ${isActive ? "border-blue-600 text-blue-600 font-bold" : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 opacity-60"}
                    `,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "w-4 h-4" }),
                section.label
              ]
            },
            section.id
          );
        })
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      loadingSettings && activeSection !== "locations" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading settings..." })
      ] }) }),
      settingsError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-red-600 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error Loading Settings" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700 mt-1", children: ((_b = (_a = settingsError == null ? void 0 : settingsError.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to load system settings" })
        ] })
      ] }) }),
      activeSection === "general" && systemSettings && !loadingSettings && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-5 border-b border-gray-200 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "w-5 h-5" }),
            "Company Information"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
            getSettingsByGroup("company").map((setting) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3 border-b border-gray-100 last:border-0", children: renderSettingInput(setting) }, setting.setting_id)),
            getSettingsByGroup("company").length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "w-5 h-5 text-gray-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Company Email" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "info@kake.ie" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "w-5 h-5 text-gray-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Company Phone" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "+353 1 234 5678" })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-5 border-b border-gray-200 bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-5 h-5" }),
            "System Configuration"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
            getSettingsByGroup("system").map((setting) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3 border-b border-gray-100 last:border-0", children: renderSettingInput(setting) }, setting.setting_id)),
            getSettingsByGroup("system").length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Percent, { className: "w-5 h-5 text-gray-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Tax Rate" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "23% (VAT)" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-5 h-5 text-gray-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Enable Loyalty Program" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Currently enabled" })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-5 h-5 text-gray-400" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Enable Corporate Orders" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Currently enabled" })
                ] })
              ] }) })
            ] })
          ] })
        ] })
      ] }),
      activeSection === "locations" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: loadingLocations ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading locations..." })
      ] }) }) : locationsError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-red-600 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error Loading Locations" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700 mt-1", children: ((_d = (_c = locationsError == null ? void 0 : locationsError.response) == null ? void 0 : _c.data) == null ? void 0 : _d.message) || "Failed to load locations" })
        ] })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: locations == null ? void 0 : locations.map((location) => {
        const isEditing = editingLocationId === location.location_id;
        const currentData = isEditing ? editingLocationData : location;
        const mapsAddress = `${location.address_line1}, ${location.city}, ${location.postal_code}`;
        const googleMapsApiKey = "AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";
        const mapsUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(mapsAddress)}`;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-5 h-5 text-blue-600" }),
                  currentData.location_name
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full", children: "Active" }),
                  !isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => startEditLocation(location),
                      className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2",
                      "aria-label": "Edit location",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "w-4 h-4" }),
                        "Edit"
                      ]
                    }
                  ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: saveLocation,
                        disabled: updateLocationMutation.isPending,
                        className: "px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2",
                        children: updateLocationMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }),
                          "Saving..."
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }),
                          "Save"
                        ] })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: cancelEditLocation,
                        disabled: updateLocationMutation.isPending,
                        className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
                      }
                    )
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: isEditing ? (
                /* Edit Form */
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Contact Information" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Location Name" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "text",
                              value: currentData.location_name || "",
                              onChange: (e) => handleLocationFieldChange("location_name", e.target.value),
                              className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Address Line 1" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "text",
                              value: currentData.address_line1 || "",
                              onChange: (e) => handleLocationFieldChange("address_line1", e.target.value),
                              className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Address Line 2 (Optional)" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "text",
                              value: currentData.address_line2 || "",
                              onChange: (e) => handleLocationFieldChange("address_line2", e.target.value),
                              className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "City" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "input",
                              {
                                type: "text",
                                value: currentData.city || "",
                                onChange: (e) => handleLocationFieldChange("city", e.target.value),
                                className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Postal Code" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "input",
                              {
                                type: "text",
                                value: currentData.postal_code || "",
                                onChange: (e) => handleLocationFieldChange("postal_code", e.target.value),
                                className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                              }
                            )
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Phone" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "text",
                              value: currentData.phone_number || "",
                              onChange: (e) => handleLocationFieldChange("phone_number", e.target.value),
                              className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "email",
                              value: currentData.email || "",
                              onChange: (e) => handleLocationFieldChange("email", e.target.value),
                              className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Opening Hours" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-800 mb-2 font-medium", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "inline h-4 w-4 mr-1" }),
                              "Opening hours are now managed in the dedicated Locations page"
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              Link,
                              {
                                to: "/admin/locations",
                                className: "text-sm text-blue-600 hover:text-blue-700 underline",
                                children: "Go to Location Management →"
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Use the Locations page for full day-by-day hour management" })
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Operational Settings" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-blue-50 border border-blue-200 rounded-lg", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-900 mb-2", children: "Ordering Mode" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-blue-100 transition-colors", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "input",
                                {
                                  type: "radio",
                                  name: `ordering_mode_${location.location_id}`,
                                  checked: (currentData.ordering_mode || "internal") === "internal",
                                  onChange: () => handleLocationFieldChange("ordering_mode", "internal"),
                                  className: "w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-900", children: "Kake ordering (collection & delivery)" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Customers order through the internal menu" })
                              ] })
                            ] }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-blue-100 transition-colors", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx(
                                "input",
                                {
                                  type: "radio",
                                  name: `ordering_mode_${location.location_id}`,
                                  checked: currentData.ordering_mode === "external_only",
                                  onChange: () => handleLocationFieldChange("ordering_mode", "external_only"),
                                  className: "w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                }
                              ),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-900", children: "3rd-party delivery services only" }),
                                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500", children: "Customers are redirected to external providers" })
                              ] })
                            ] })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: currentData.ordering_mode === "external_only" ? "opacity-50" : "", children: [
                          currentData.ordering_mode === "external_only" && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded mb-3 flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-3 h-3" }),
                            "Internal ordering is disabled for this location"
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "input",
                              {
                                type: "checkbox",
                                checked: currentData.is_collection_enabled || false,
                                onChange: (e) => handleLocationFieldChange("is_collection_enabled", e.target.checked),
                                disabled: currentData.ordering_mode === "external_only",
                                className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Collection Enabled" })
                          ] }) }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "input",
                              {
                                type: "checkbox",
                                checked: currentData.is_delivery_enabled || false,
                                onChange: (e) => handleLocationFieldChange("is_delivery_enabled", e.target.checked),
                                disabled: currentData.ordering_mode === "external_only",
                                className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                              }
                            ),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Delivery Enabled" })
                          ] }) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Preparation Time (minutes)" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "number",
                              value: currentData.estimated_preparation_time_minutes || "",
                              onChange: (e) => handleLocationFieldChange("estimated_preparation_time_minutes", parseInt(e.target.value)),
                              className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Delivery Time (minutes)" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "number",
                              value: currentData.estimated_delivery_time_minutes || "",
                              onChange: (e) => handleLocationFieldChange("estimated_delivery_time_minutes", parseInt(e.target.value) || null),
                              className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Delivery Fee (€)" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "number",
                              step: "0.01",
                              value: currentData.delivery_fee || "",
                              onChange: (e) => handleLocationFieldChange("delivery_fee", parseFloat(e.target.value) || null),
                              className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            }
                          )
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Free Delivery Threshold (€)" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "number",
                              step: "0.01",
                              value: currentData.free_delivery_threshold || "",
                              onChange: (e) => handleLocationFieldChange("free_delivery_threshold", parseFloat(e.target.value) || null),
                              className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                            }
                          )
                        ] })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6 border-t border-gray-200", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold text-gray-900 mb-1", children: [
                      "External Ordering ",
                      currentData.ordering_mode === "external_only" ? "(Required)" : "(Optional)"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mb-4", children: "Add external delivery services for this location. Customers can order through these services instead of the internal menu." }),
                    currentData.ordering_mode === "external_only" && parseExternalProviders(currentData).filter((p) => p.name && p.url).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700", children: "Add at least one delivery service when using 3rd-party ordering mode." })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mb-4", children: [
                      parseExternalProviders(currentData).map((provider, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 grid md:grid-cols-3 gap-3", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Provider Name" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "input",
                              {
                                type: "text",
                                value: provider.name,
                                onChange: (e) => updateProviderField(index, "name", e.target.value),
                                className: "w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
                                placeholder: "e.g. Just Eat"
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Provider URL" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "input",
                              {
                                type: "url",
                                value: provider.url,
                                onChange: (e) => updateProviderField(index, "url", e.target.value),
                                className: "w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500",
                                placeholder: "https://..."
                              }
                            )
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs font-medium text-gray-600 mb-1", children: "Order" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx(
                              "input",
                              {
                                type: "number",
                                min: "1",
                                value: provider.display_order,
                                onChange: (e) => updateProviderField(index, "display_order", parseInt(e.target.value) || 1),
                                className: "w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                              }
                            )
                          ] }) })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "button",
                          {
                            type: "button",
                            onClick: () => removeExternalProvider(index),
                            className: "mt-5 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors",
                            title: "Remove provider",
                            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                          }
                        )
                      ] }, index)),
                      parseExternalProviders(currentData).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-400 italic py-2", children: "No external providers configured" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        type: "button",
                        onClick: addExternalProvider,
                        className: "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
                          "Add Provider"
                        ]
                      }
                    )
                  ] })
                ] })
              ) : (
                /* View Mode */
                /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-6 mb-6", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Contact Information" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Address:" }),
                          " ",
                          location.address_line1,
                          location.address_line2 && `, ${location.address_line2}`
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "City:" }),
                          " ",
                          location.city,
                          ", ",
                          location.postal_code
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Phone:" }),
                          " ",
                          location.phone_number
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Email:" }),
                          " ",
                          location.email
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t border-gray-200", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-medium text-gray-900 mb-1 flex items-center gap-2", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 text-blue-600" }),
                            "Opening Hours"
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            Link,
                            {
                              to: "/admin/locations",
                              className: "text-sm text-blue-600 hover:text-blue-700 underline inline-flex items-center gap-1",
                              children: "Manage in Locations page →"
                            }
                          )
                        ] })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-3", children: "Operational Settings" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", children: location.ordering_mode === "external_only" ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full", children: "3rd-party ordering only" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full", children: "Kake ordering" }) }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 ${location.ordering_mode === "external_only" ? "opacity-50" : ""}`, children: [
                          location.is_collection_enabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-red-600" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "Collection" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 ${location.ordering_mode === "external_only" ? "opacity-50" : ""}`, children: [
                          location.is_delivery_enabled ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 text-red-600" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-600", children: "Delivery" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Prep Time:" }),
                          " ",
                          location.estimated_preparation_time_minutes,
                          " min"
                        ] }),
                        location.estimated_delivery_time_minutes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Delivery Time:" }),
                          " ",
                          location.estimated_delivery_time_minutes,
                          " min"
                        ] }),
                        location.delivery_fee !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Delivery Fee:" }),
                          " €",
                          Number(location.delivery_fee).toFixed(2)
                        ] }),
                        location.free_delivery_threshold !== null && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Free Delivery Over:" }),
                          " €",
                          Number(location.free_delivery_threshold).toFixed(2)
                        ] })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "w-4 h-4 text-blue-600" }),
                      "Location Map"
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "iframe",
                      {
                        title: `Map of ${location.location_name}`,
                        width: "100%",
                        height: "100%",
                        style: { border: 0 },
                        loading: "lazy",
                        allowFullScreen: true,
                        src: mapsUrl,
                        onError: (e) => {
                          var _a2;
                          const target = e.target;
                          target.style.display = "none";
                          const fallback = document.createElement("img");
                          fallback.src = "/assets/images/location-map-placeholder.jpeg";
                          fallback.alt = "Location map placeholder";
                          fallback.className = "w-full h-full object-cover";
                          (_a2 = target.parentElement) == null ? void 0 : _a2.appendChild(fallback);
                        }
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-500 mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "a",
                      {
                        href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsAddress)}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "text-blue-600 hover:underline",
                        children: "View in Google Maps →"
                      }
                    ) })
                  ] }),
                  parseExternalProviders(location).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-6 border-t border-gray-200", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-gray-900 mb-3", children: "External Ordering" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: parseExternalProviders(location).map((provider, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-medium", children: [
                        provider.name,
                        ":"
                      ] }),
                      " ",
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "a",
                        {
                          href: provider.url,
                          target: "_blank",
                          rel: "noopener noreferrer",
                          className: "text-blue-600 hover:underline",
                          children: provider.url
                        }
                      )
                    ] }, index)) })
                  ] })
                ] })
              ) })
            ]
          },
          location.location_id
        );
      }) }) }),
      activeSection === "loyalty_points" && systemSettings && !loadingSettings && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "w-5 h-5 text-purple-600" }),
            "Loyalty Points Configuration"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Configure how customers earn and redeem loyalty points" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
          getSettingsByGroup("loyalty").map((setting) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3 border-b border-gray-100 last:border-0", children: renderSettingInput(setting) }, setting.setting_id)),
          getSettingsByGroup("loyalty").length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Points Per Euro Spent" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Customers earn this many points per €1 spent" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-gray-900", children: "10 points" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Points Redemption Rate" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Points needed for €1 discount" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-gray-900", children: "100 points" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Minimum Order for Redemption" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Minimum order value to use points" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-gray-900", children: "€15" })
            ] })
          ] })
        ] })
      ] }) }),
      activeSection === "orders" && systemSettings && !loadingSettings && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-green-50 to-emerald-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5 text-green-600" }),
            "Order Configuration"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Configure order processing, thresholds, and defaults" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
          getSettingsByGroup("orders").map((setting) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3 border-b border-gray-100 last:border-0", children: renderSettingInput(setting) }, setting.setting_id)),
          getSettingsByGroup("orders").length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Minimum Order for Delivery" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Minimum order value required for delivery" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-gray-900", children: "€15" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Default Preparation Time" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Default preparation time for orders" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-gray-900", children: "20 minutes" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-900", children: "Max Failed Login Attempts" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mt-1", children: "Attempts before account lockout" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-lg font-bold text-gray-900", children: "5 attempts" })
            ] })
          ] })
        ] })
      ] }) }),
      activeSection === "notifications" && systemSettings && !loadingSettings && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-orange-50 to-amber-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-5 h-5 text-orange-600" }),
            "Notification Configuration"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Configure email templates and notification preferences" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
          getSettingsByGroup("notifications").map((setting) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-3 border-b border-gray-100 last:border-0", children: renderSettingInput(setting) }, setting.setting_id)),
          getSettingsByGroup("notifications").length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-12 h-12 mx-auto mb-3 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "No notification settings available" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1", children: "Email templates are configured in the database" })
          ] })
        ] })
      ] }) }),
      activeSection === "social_media" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-6", children: loadingSocialLinks ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Loading social media links..." })
      ] }) }) : socialLinksError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-5 h-5 text-red-600 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-red-800", children: "Error Loading Social Links" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-700 mt-1", children: ((_f = (_e = socialLinksError == null ? void 0 : socialLinksError.response) == null ? void 0 : _e.data) == null ? void 0 : _f.message) || "Failed to load social media links" })
        ] })
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Follow Us Links" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Manage social media links displayed in the footer" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowAddSocialLink(true),
              className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
                "Add Social Link"
              ]
            }
          )
        ] }),
        showAddSocialLink && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border-2 border-blue-200 overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-5 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 text-blue-600" }),
              "Add New Social Media Link"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => setShowAddSocialLink(false),
                className: "p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Platform Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newSocialLinkData.platform_name || "",
                    onChange: (e) => handleNewSocialLinkFieldChange("platform_name", e.target.value),
                    placeholder: "e.g., Instagram, Twitter",
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Platform URL *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "url",
                    value: newSocialLinkData.platform_url || "",
                    onChange: (e) => handleNewSocialLinkFieldChange("platform_url", e.target.value),
                    placeholder: "https://...",
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Icon Type" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: newSocialLinkData.icon_type || "lucide",
                    onChange: (e) => handleNewSocialLinkFieldChange("icon_type", e.target.value),
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "lucide", children: "Lucide Icon" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "custom", children: "Custom Image" })
                    ]
                  }
                )
              ] }),
              newSocialLinkData.icon_type === "lucide" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Icon Name" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newSocialLinkData.icon_name || "",
                    onChange: (e) => handleNewSocialLinkFieldChange("icon_name", e.target.value),
                    placeholder: "e.g., Instagram, Facebook, Twitter",
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900", children: "Icon Image" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex-1 cursor-pointer", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: uploadingIcon ? "Uploading..." : "Upload Image" })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "file",
                        accept: "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml",
                        onChange: (e) => handleIconFileUpload(e, false),
                        disabled: uploadingIcon,
                        className: "hidden"
                      }
                    )
                  ] }),
                  (uploadedIconUrl || newSocialLinkData.icon_url) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-green-50 border-2 border-green-200 rounded-lg", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-4 h-4 text-green-600" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-700 font-medium", children: "Uploaded" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Or enter URL manually:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "input",
                    {
                      type: "text",
                      value: newSocialLinkData.icon_url || "",
                      onChange: (e) => handleNewSocialLinkFieldChange("icon_url", e.target.value),
                      placeholder: "/uploads/social-icons/...",
                      className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm"
                    }
                  )
                ] }),
                newSocialLinkData.icon_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mb-2", children: "Preview:" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "img",
                    {
                      src: newSocialLinkData.icon_url,
                      alt: "Icon preview",
                      className: "w-full h-full object-contain",
                      onError: (e) => {
                        e.target.style.display = "none";
                      }
                    }
                  ) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Hover Color (Hex)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: newSocialLinkData.hover_color || "#3b82f6",
                    onChange: (e) => handleNewSocialLinkFieldChange("hover_color", e.target.value),
                    placeholder: "#3b82f6",
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Display Order" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "number",
                    value: newSocialLinkData.display_order || 0,
                    onChange: (e) => handleNewSocialLinkFieldChange("display_order", parseInt(e.target.value)),
                    className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  id: "new-is-active",
                  checked: newSocialLinkData.is_active !== false,
                  onChange: (e) => handleNewSocialLinkFieldChange("is_active", e.target.checked),
                  className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "new-is-active", className: "text-sm font-medium text-gray-900", children: "Active (visible in footer)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: handleCreateSocialLink,
                  disabled: createSocialLinkMutation.isPending,
                  className: "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2",
                  children: createSocialLinkMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }),
                    "Creating..."
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }),
                    "Create Link"
                  ] })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => setShowAddSocialLink(false),
                  disabled: createSocialLinkMutation.isPending,
                  className: "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors",
                  children: "Cancel"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          socialLinks == null ? void 0 : socialLinks.map((link) => {
            const isEditing = editingSocialLinkId === link.link_id;
            const currentData = isEditing ? editingSocialLinkData : link;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-6 py-4", children: !isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-6 h-6 text-gray-600" }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-semibold text-gray-900 flex items-center gap-2", children: [
                        link.platform_name,
                        link.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }),
                          "Active"
                        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full flex items-center gap-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-3 h-3" }),
                          "Hidden"
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: link.platform_url, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline", children: link.platform_url }) }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mt-2 text-xs text-gray-500", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "Order: ",
                          link.display_order
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "Icon: ",
                          link.icon_type === "lucide" ? link.icon_name : "Custom"
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                          "Color: ",
                          link.hover_color
                        ] })
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "button",
                      {
                        onClick: () => startEditSocialLink(link),
                        className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2",
                        children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "w-4 h-4" }),
                          "Edit"
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: () => handleDeleteSocialLink(link.link_id, link.platform_name),
                        className: "p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-5 h-5" })
                      }
                    )
                  ] })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Platform Name" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "text",
                          value: currentData.platform_name || "",
                          onChange: (e) => handleSocialLinkFieldChange("platform_name", e.target.value),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Platform URL" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "url",
                          value: currentData.platform_url || "",
                          onChange: (e) => handleSocialLinkFieldChange("platform_url", e.target.value),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Icon Type" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs(
                        "select",
                        {
                          value: currentData.icon_type || "lucide",
                          onChange: (e) => handleSocialLinkFieldChange("icon_type", e.target.value),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500",
                          children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "lucide", children: "Lucide Icon" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "custom", children: "Custom Image" })
                          ]
                        }
                      )
                    ] }),
                    currentData.icon_type === "lucide" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Icon Name" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "text",
                          value: currentData.icon_name || "",
                          onChange: (e) => handleSocialLinkFieldChange("icon_name", e.target.value),
                          placeholder: "e.g., Instagram, Facebook, Twitter",
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900", children: "Icon Image" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex-1 cursor-pointer", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-4 h-4" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: uploadingIcon ? "Uploading..." : "Upload Image" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx(
                            "input",
                            {
                              type: "file",
                              accept: "image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml",
                              onChange: (e) => handleIconFileUpload(e, true),
                              disabled: uploadingIcon,
                              className: "hidden"
                            }
                          )
                        ] }),
                        (editUploadedIconUrl || currentData.icon_url) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-3 py-2 bg-green-50 border-2 border-green-200 rounded-lg", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-4 h-4 text-green-600" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-green-700 font-medium", children: "Uploaded" })
                        ] })
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-xs text-gray-600 mb-1", children: "Or enter URL manually:" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "input",
                          {
                            type: "text",
                            value: currentData.icon_url || "",
                            onChange: (e) => handleSocialLinkFieldChange("icon_url", e.target.value),
                            placeholder: "/uploads/social-icons/...",
                            className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-sm"
                          }
                        )
                      ] }),
                      currentData.icon_url && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-gray-600 mb-2", children: "Preview:" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "img",
                          {
                            src: currentData.icon_url,
                            alt: "Icon preview",
                            className: "w-full h-full object-contain",
                            onError: (e) => {
                              e.target.style.display = "none";
                            }
                          }
                        ) })
                      ] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Hover Color (Hex)" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "text",
                          value: currentData.hover_color || "#3b82f6",
                          onChange: (e) => handleSocialLinkFieldChange("hover_color", e.target.value),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-900 mb-2", children: "Display Order" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "input",
                        {
                          type: "number",
                          value: currentData.display_order || 0,
                          onChange: (e) => handleSocialLinkFieldChange("display_order", parseInt(e.target.value)),
                          className: "w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500"
                        }
                      )
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        type: "checkbox",
                        id: `is-active-${link.link_id}`,
                        checked: currentData.is_active !== false,
                        onChange: (e) => handleSocialLinkFieldChange("is_active", e.target.checked),
                        className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: `is-active-${link.link_id}`, className: "text-sm font-medium text-gray-900", children: "Active (visible in footer)" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-4", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: saveSocialLink,
                        disabled: updateSocialLinkMutation.isPending,
                        className: "flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2",
                        children: updateSocialLinkMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
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
                        onClick: cancelEditSocialLink,
                        disabled: updateSocialLinkMutation.isPending,
                        className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 transition-colors",
                        children: "Cancel"
                      }
                    )
                  ] })
                ] }) })
              },
              link.link_id
            );
          }),
          (socialLinks == null ? void 0 : socialLinks.length) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-16 h-16 mx-auto mb-4 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Social Links Yet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-6", children: "Add your first social media link to display in the footer." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setShowAddSocialLink(true),
                className: "px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
                  "Add Social Link"
                ]
              }
            )
          ] }) })
        ] })
      ] }) }),
      activeSection !== "locations" && !loadingSettings && systemSettings && systemSettings.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-16 h-16 mx-auto mb-4 text-gray-400" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No Settings Found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "No settings are configured for this section yet." })
      ] }) })
    ] })
  ] }) });
};
export {
  UV_AdminSettings as default
};
