import { l as useSearchParams, h as useNavigate, r as reactExports, u as useAppStore, j as jsxRuntimeExports, v as kakeLogo, L as Link, c as Mail, w as Lock, x as EyeOff, y as Eye } from "./index-i76FChob.js";
const UV_Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const redirectUrl = searchParams.get("redirect") || "/";
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [rememberMe, setRememberMe] = reactExports.useState(false);
  const [showPassword, setShowPassword] = reactExports.useState(false);
  const [formErrors, setFormErrors] = reactExports.useState({
    email: null,
    password: null
  });
  const isLoading = useAppStore((state) => state.authentication_state.authentication_status.is_loading);
  const isAuthenticated = useAppStore((state) => state.authentication_state.authentication_status.is_authenticated);
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authError = useAppStore((state) => state.authentication_state.error_message);
  const loginUser = useAppStore((state) => state.login_user);
  const clearAuthError = useAppStore((state) => state.clear_auth_error);
  reactExports.useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.user_type === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (currentUser.user_type === "staff" || currentUser.user_type === "manager") {
        navigate("/staff/dashboard", { replace: true });
      } else if (currentUser.user_type === "customer") {
        navigate(redirectUrl === "/login" ? "/account" : redirectUrl, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate, redirectUrl]);
  reactExports.useEffect(() => {
    clearAuthError();
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);
  const validateEmail = (value) => {
    if (!value) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Please enter a valid email address";
    }
    return null;
  };
  const validatePassword = (value) => {
    if (!value) {
      return "Password is required";
    }
    return null;
  };
  const validateForm = () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setFormErrors({
      email: emailError,
      password: passwordError
    });
    return !emailError && !passwordError;
  };
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: null }));
    }
    if (authError) {
      clearAuthError();
    }
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (formErrors.password) {
      setFormErrors((prev) => ({ ...prev, password: null }));
    }
    if (authError) {
      clearAuthError();
    }
  };
  const handleEmailBlur = () => {
    const error = validateEmail(email);
    setFormErrors((prev) => ({ ...prev, email: error }));
  };
  const handlePasswordBlur = () => {
    const error = validatePassword(password);
    setFormErrors((prev) => ({ ...prev, password: error }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearAuthError();
    if (!validateForm()) {
      return;
    }
    try {
      await loginUser(email, password, rememberMe);
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 pt-8 pb-6 bg-gradient-to-r from-blue-600 to-indigo-600", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: kakeLogo, alt: "Kake Logo", className: "h-16 w-auto mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-bold text-white mb-2", children: "Welcome to Kake" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-100 text-base", children: "Sign in to your account to continue" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-8 py-8", children: [
        authError && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md", role: "alert", "aria-live": "polite", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { className: "h-5 w-5 text-red-500", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { fillRule: "evenodd", d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z", clipRule: "evenodd" }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-red-800 font-medium", children: authError }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/checkout",
            className: "\n                    w-full flex justify-center items-center\n                    px-6 py-3 \n                    bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700\n                    text-white font-bold text-base\n                    rounded-lg\n                    shadow-lg hover:shadow-xl\n                    focus:outline-none focus:ring-4 focus:ring-green-100\n                    transition-all duration-200\n                    hover:scale-105\n                  ",
            children: "Guest Checkout"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-gray-200" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-4 bg-white text-gray-500 font-medium", children: "Or sign in to your account" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", noValidate: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "email", className: "block text-sm font-semibold text-gray-900 mb-2", children: "Email Address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-5 w-5 text-gray-400" }) }),
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
                  disabled: isLoading,
                  placeholder: "your.email@example.com",
                  "data-testid": "login-email-input",
                  className: `
                        block w-full pl-10 pr-4 py-3 
                        border-2 rounded-lg
                        text-gray-900 placeholder-gray-400
                        focus:outline-none focus:ring-4 focus:ring-blue-100
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${formErrors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}
                      `,
                  "aria-invalid": !!formErrors.email,
                  "aria-describedby": formErrors.email ? "email-error" : void 0
                }
              )
            ] }),
            formErrors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", id: "email-error", role: "alert", children: formErrors.email })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "password", className: "block text-sm font-semibold text-gray-900 mb-2", children: "Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-5 w-5 text-gray-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "password",
                  name: "password",
                  type: showPassword ? "text" : "password",
                  autoComplete: "current-password",
                  required: true,
                  value: password,
                  onChange: handlePasswordChange,
                  onBlur: handlePasswordBlur,
                  disabled: isLoading,
                  placeholder: "Enter your password",
                  "data-testid": "login-password-input",
                  className: `
                        block w-full pl-10 pr-12 py-3 
                        border-2 rounded-lg
                        text-gray-900 placeholder-gray-400
                        focus:outline-none focus:ring-4 focus:ring-blue-100
                        transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${formErrors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"}
                      `,
                  "aria-invalid": !!formErrors.password,
                  "aria-describedby": formErrors.password ? "password-error" : void 0
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: togglePasswordVisibility,
                  className: "absolute inset-y-0 right-0 pr-3 flex items-center",
                  tabIndex: -1,
                  "aria-label": showPassword ? "Hide password" : "Show password",
                  children: showPassword ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" })
                }
              )
            ] }),
            formErrors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", id: "password-error", role: "alert", children: formErrors.password })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  id: "remember_me",
                  name: "remember_me",
                  type: "checkbox",
                  checked: rememberMe,
                  onChange: (e) => setRememberMe(e.target.checked),
                  disabled: isLoading,
                  className: "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "remember_me", className: "ml-2 block text-sm text-gray-700 font-medium", children: "Remember me for 30 days" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Link,
              {
                to: "/forgot-password",
                className: "text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:underline",
                children: "Forgot password?"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: isLoading,
              "data-testid": "login-submit-button",
              className: "\n                      w-full flex justify-center items-center\n                      px-6 py-3 \n                      bg-blue-600 hover:bg-blue-700 \n                      text-white font-semibold text-base\n                      rounded-lg\n                      shadow-lg hover:shadow-xl\n                      focus:outline-none focus:ring-4 focus:ring-blue-100\n                      transition-all duration-200\n                      hover:scale-105\n                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:shadow-lg disabled:hover:scale-100\n                    ",
              children: isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
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
                "Signing in..."
              ] }) : "Sign In"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
          "Don't have an account?",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: `/register${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`,
              className: "font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none focus:underline",
              children: "Sign up for free"
            }
          )
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500", children: [
      "By signing in, you agree to our",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/terms", className: "text-blue-600 hover:text-blue-700 underline", children: "Terms of Service" }),
      " ",
      "and",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/privacy", className: "text-blue-600 hover:text-blue-700 underline", children: "Privacy Policy" })
    ] }) })
  ] }) }) });
};
export {
  UV_Login as default
};
