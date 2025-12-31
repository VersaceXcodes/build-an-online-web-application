import { u as useAppStore, o as useQueryClient, r as reactExports, a as useQuery, j as jsxRuntimeExports, e as Shield, F as FileText, d as CircleAlert, I as CircleCheckBig, aO as Save, b as axios } from "./index-CwVo5_So.js";
import { u as useMutation } from "./useMutation-HzYQCpti.js";
const fetchLegalDocument = async (token, slug) => {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/legal/${slug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const updateLegalDocument = async (token, slug, data) => {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/legal/${slug}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};
const UV_AdminLegal = () => {
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = reactExports.useState("privacy-policy");
  const [title, setTitle] = reactExports.useState("");
  const [content, setContent] = reactExports.useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = reactExports.useState(false);
  const {
    data: document,
    isLoading,
    error
  } = useQuery({
    queryKey: ["admin-legal", activeTab],
    queryFn: () => fetchLegalDocument(authToken, activeTab),
    enabled: !!authToken,
    staleTime: 3e4
  });
  reactExports.useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
      setHasUnsavedChanges(false);
    }
  }, [document]);
  reactExports.useEffect(() => {
    if (document) {
      const changed = title !== document.title || content !== document.content;
      setHasUnsavedChanges(changed);
    }
  }, [title, content, document]);
  const updateMutation = useMutation({
    mutationFn: (data) => updateLegalDocument(authToken, activeTab, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-legal", activeTab] });
      queryClient.invalidateQueries({ queryKey: ["legal-privacy"] });
      queryClient.invalidateQueries({ queryKey: ["legal-terms"] });
      showToast("Legal document updated successfully", "success");
      setHasUnsavedChanges(false);
    },
    onError: (error2) => {
      var _a, _b;
      showToast(
        ((_b = (_a = error2.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update legal document",
        "error"
      );
    }
  });
  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      showToast("Title and content are required", "error");
      return;
    }
    updateMutation.mutate({ title, content });
  };
  const handleTabChange = (tab) => {
    if (hasUnsavedChanges) {
      if (!confirm(
        "You have unsaved changes. Are you sure you want to switch tabs? Your changes will be lost."
      )) {
        return;
      }
    }
    setActiveTab(tab);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Legal Pages Editor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Manage your Privacy Policy and Terms & Conditions content" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-b border-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => handleTabChange("privacy-policy"),
          className: `flex-1 px-6 py-4 text-center font-medium transition-all ${activeTab === "privacy-policy" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Privacy Policy" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => handleTabChange("terms-and-conditions"),
          className: `flex-1 px-6 py-4 text-center font-medium transition-all ${activeTab === "terms-and-conditions" ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"}`,
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Terms & Conditions" })
          ] })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-200 p-6", children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 bg-gray-200 rounded w-1/3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-96 bg-gray-200 rounded" })
    ] }) : error ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-6 w-6 text-red-500 flex-shrink-0 mt-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-red-900 mb-1", children: "Error Loading Document" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700", children: "Failed to load the legal document. Please try again later." })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      document && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "h-5 w-5 text-green-600" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-700", children: [
            "Last updated: ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: formatDate(document.updated_at) })
          ] })
        ] }),
        hasUnsavedChanges && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-amber-600", children: "Unsaved changes" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "title", className: "block text-sm font-medium text-gray-700 mb-2", children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            id: "title",
            value: title,
            onChange: (e) => setTitle(e.target.value),
            className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            placeholder: "Enter page title..."
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "content", className: "block text-sm font-medium text-gray-700 mb-2", children: "Content (HTML supported)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            id: "content",
            value: content,
            onChange: (e) => setContent(e.target.value),
            rows: 20,
            className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm",
            placeholder: "Enter HTML content..."
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-gray-500", children: "You can use HTML tags to format the content. Changes will be reflected on the public pages immediately after saving." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-end space-x-4 pt-4 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleSave,
          disabled: updateMutation.isPending || !hasUnsavedChanges,
          className: `flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${updateMutation.isPending || !hasUnsavedChanges ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "h-5 w-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: updateMutation.isPending ? "Saving..." : "Save Changes" })
          ]
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-900", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Preview:" }),
      " View the public",
      " ",
      activeTab === "privacy-policy" ? /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/privacy", target: "_blank", rel: "noopener noreferrer", className: "underline font-semibold hover:text-blue-700", children: "Privacy Policy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/terms", target: "_blank", rel: "noopener noreferrer", className: "underline font-semibold hover:text-blue-700", children: "Terms & Conditions" }),
      " ",
      "page to see your changes."
    ] }) })
  ] }) });
};
export {
  UV_AdminLegal as default
};
