import { r as reactExports, u as useAppStore, h as useNavigate, R as React, j as jsxRuntimeExports, L as Link, b as axios } from "./index-HeRxKVXe.js";
const UV_ForgotPassword = () => {
  const [email, setEmail] = reactExports.useState("");
  const [is_loading, setIsLoading] = reactExports.useState(false);
  const [success_message, setSuccessMessage] = reactExports.useState(null);
  const [form_errors, setFormErrors] = reactExports.useState({ email: null });
  const showToast = useAppStore((state) => state.show_toast);
  const isAuthenticated = useAppStore((state) => state.authentication_state.authentication_status.is_authenticated);
  const navigate = useNavigate();
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/account");
    }
  }, [isAuthenticated, navigate]);
  const validateEmail = (email_value) => {
    if (!email_value) {
      return "Email address is required";
    }
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(email_value)) {
      return "Please enter a valid email address";
    }
    return null;
  };
  const handleEmailChange = (e) => {
    const new_email = e.target.value;
    setEmail(new_email);
    if (form_errors.email) {
      setFormErrors({ email: null });
    }
    if (success_message) {
      setSuccessMessage(null);
    }
  };
  const handleEmailBlur = () => {
    const error = validateEmail(email);
    setFormErrors({ email: error });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const email_error = validateEmail(email);
    if (email_error) {
      setFormErrors({ email: email_error });
      return;
    }
    setFormErrors({ email: null });
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/auth/forgot-password`,
        { email },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
      setSuccessMessage(
        response.data.message || "If an account exists with this email, you will receive password reset instructions shortly."
      );
      setEmail("");
      showToast(
        "success",
        "Password reset instructions sent! Please check your email.",
        5e3
      );
    } catch (error) {
      setSuccessMessage(
        "If an account exists with this email, you will receive password reset instructions shortly."
      );
      console.error("Password reset request error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-bold text-gray-900 mb-4", children: "Forgot Password?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg text-gray-600 leading-relaxed", children: "No worries! Enter your email address and we'll send you instructions to reset your password." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
        success_message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 bg-green-50 border-2 border-green-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "svg",
            {
              className: "h-6 w-6 text-green-600 mr-3 mt-0.5 flex-shrink-0",
              fill: "none",
              viewBox: "0 0 24 24",
              stroke: "currentColor",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold text-green-800 mb-1", children: "Check Your Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-green-700 leading-relaxed", children: success_message }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-green-600 mt-2", children: "If you don't receive an email within 5 minutes, please check your spam folder." })
          ] })
        ] }) }),
        !success_message && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", noValidate: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "label",
              {
                htmlFor: "email",
                className: "block text-sm font-semibold text-gray-900 mb-2",
                children: "Email Address"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "email",
                name: "email",
                type: "email",
                autoComplete: "email",
                required: true,
                value: email,
                onChange: handleEmailChange,
                onBlur: handleEmailBlur,
                disabled: is_loading,
                placeholder: "you@example.com",
                className: `
                        w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
                        focus:outline-none focus:ring-4
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${form_errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"}
                      `,
                "aria-invalid": !!form_errors.email,
                "aria-describedby": form_errors.email ? "email-error" : void 0
              }
            ),
            form_errors.email && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "p",
              {
                id: "email-error",
                className: "mt-2 text-sm text-red-600 flex items-center",
                role: "alert",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "svg",
                    {
                      className: "h-4 w-4 mr-1 flex-shrink-0",
                      fill: "currentColor",
                      viewBox: "0 0 20 20",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          fillRule: "evenodd",
                          d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
                          clipRule: "evenodd"
                        }
                      )
                    }
                  ),
                  form_errors.email
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: is_loading || !!form_errors.email,
              className: "\n                      w-full px-6 py-3 rounded-lg font-medium text-white\n                      bg-blue-600 hover:bg-blue-700\n                      shadow-lg hover:shadow-xl\n                      transition-all duration-200\n                      focus:outline-none focus:ring-4 focus:ring-blue-100\n                      disabled:opacity-50 disabled:cursor-not-allowed\n                      disabled:hover:bg-blue-600 disabled:hover:shadow-lg\n                    ",
              children: is_loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "svg",
                  {
                    className: "animate-spin -ml-1 mr-3 h-5 w-5 text-white",
                    xmlns: "http://www.w3.org/2000/svg",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "circle",
                        {
                          className: "opacity-25",
                          cx: "12",
                          cy: "12",
                          r: "10",
                          stroke: "currentColor",
                          strokeWidth: "4"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          className: "opacity-75",
                          fill: "currentColor",
                          d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        }
                      )
                    ]
                  }
                ),
                "Sending Reset Link..."
              ] }) : "Send Reset Link"
            }
          )
        ] }),
        success_message && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/login",
              className: "\n                      block w-full text-center px-6 py-3 rounded-lg font-medium\n                      bg-blue-600 text-white\n                      hover:bg-blue-700\n                      shadow-lg hover:shadow-xl\n                      transition-all duration-200\n                      focus:outline-none focus:ring-4 focus:ring-blue-100\n                    ",
              children: "Return to Login"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setSuccessMessage(null);
                setEmail("");
              },
              className: "\n                      block w-full text-center px-6 py-3 rounded-lg font-medium\n                      bg-gray-100 text-gray-900 border border-gray-300\n                      hover:bg-gray-200\n                      transition-all duration-200\n                      focus:outline-none focus:ring-4 focus:ring-gray-100\n                    ",
              children: "Send Another Reset Link"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-8 py-6 bg-gray-50 border-t border-gray-100", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-3", children: "Remember your password?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/login",
              className: "\n                    inline-flex items-center text-blue-600 hover:text-blue-700\n                    font-medium text-sm transition-colors duration-200\n                  ",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "svg",
                  {
                    className: "h-4 w-4 mr-2",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M10 19l-7-7m0 0l7-7m-7 7h18"
                      }
                    )
                  }
                ),
                "Back to Login"
              ]
            }
          )
        ] }),
        !success_message && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 pt-6 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 text-center leading-relaxed", children: [
          "Need help? Contact us at",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "mailto:info@kake.ie",
              className: "text-blue-600 hover:text-blue-700 font-medium",
              children: "info@kake.ie"
            }
          ),
          " ",
          "or call",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "a",
            {
              href: "tel:+35312345678",
              className: "text-blue-600 hover:text-blue-700 font-medium",
              children: "+353 1 234 5678"
            }
          )
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 leading-relaxed", children: [
      "For security reasons, we don't disclose whether an email address is registered.",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      "Password reset links are valid for 60 minutes."
    ] }) })
  ] }) }) });
};
export {
  UV_ForgotPassword as default
};
