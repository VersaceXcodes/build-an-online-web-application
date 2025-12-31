import { a as useQuery, j as jsxRuntimeExports, d as CircleAlert, e as Shield, b as axios } from "./index-CwVo5_So.js";
const fetchPrivacyPolicy = async () => {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/legal/privacy`
  );
  return response.data;
};
const UV_Privacy = () => {
  const {
    data: document,
    isLoading,
    error
  } = useQuery({
    queryKey: ["legal-privacy"],
    queryFn: fetchPrivacyPolicy,
    staleTime: 3e5
    // 5 minutes
  });
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen gradient-cream py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-cream shadow-caramel-lg rounded-2xl p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "animate-pulse space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-12 bg-gray-200 rounded w-2/3" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-full" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" })
    ] }) }) }) });
  }
  if (error || !document) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen gradient-cream py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "glass-cream shadow-caramel-lg rounded-2xl p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-6 w-6 text-red-500 flex-shrink-0 mt-1" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-serif text-2xl font-bold text-kake-chocolate-500 mb-2", children: "Content Not Available" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-kake-chocolate-500/80", children: "We're unable to load the privacy policy at this time. Please check back later or contact us for more information." })
      ] })
    ] }) }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen gradient-cream py-16", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-cream shadow-caramel-lg rounded-2xl p-8 md:p-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4 mb-8 pb-6 border-b border-kake-caramel-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 gradient-caramel rounded-xl", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-8 w-8 text-white" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-serif text-4xl font-bold text-kake-chocolate-500", children: document.title })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "prose prose-lg max-w-none\n              prose-headings:font-serif prose-headings:text-kake-chocolate-500\n              prose-p:font-sans prose-p:text-kake-chocolate-500/90 prose-p:leading-relaxed\n              prose-a:text-kake-caramel-600 prose-a:no-underline hover:prose-a:underline\n              prose-strong:text-kake-chocolate-500 prose-strong:font-semibold\n              prose-ul:font-sans prose-ul:text-kake-chocolate-500/90\n              prose-ol:font-sans prose-ol:text-kake-chocolate-500/90\n              prose-li:leading-relaxed",
        dangerouslySetInnerHTML: { __html: document.content }
      }
    )
  ] }) }) });
};
export {
  UV_Privacy as default
};
