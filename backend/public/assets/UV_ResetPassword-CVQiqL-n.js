import { h as useNavigate, l as useSearchParams, u as useAppStore, r as reactExports, j as jsxRuntimeExports, w as Lock, d as CircleAlert, L as Link, B as CircleCheck, x as EyeOff, y as Eye, D as CircleX, b as axios } from "./index-BU6_V1I5.js";
import { u as useMutation } from "./useMutation-oexYD0Jy.js";
const resetPassword = async (data) => {
  const response = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/auth/reset-password`,
    data,
    {
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
  return response.data;
};
const UV_ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showToast = useAppStore((state) => state.show_toast);
  const reset_token = searchParams.get("token") || "";
  const [new_password, setNewPassword] = reactExports.useState("");
  const [confirm_password, setConfirmPassword] = reactExports.useState("");
  const [show_password, setShowPassword] = reactExports.useState(false);
  const [show_confirm_password, setShowConfirmPassword] = reactExports.useState(false);
  const [form_errors, setFormErrors] = reactExports.useState({
    password: null,
    token: null
  });
  const [reset_success, setResetSuccess] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!reset_token) {
      setFormErrors((prev) => ({
        ...prev,
        token: "Invalid or missing reset token. Please request a new password reset."
      }));
    } else {
      setFormErrors((prev) => ({
        ...prev,
        token: null
      }));
    }
  }, [reset_token]);
  const password_requirements_met = reactExports.useMemo(() => {
    return {
      min_length: new_password.length >= 8,
      has_uppercase: /[A-Z]/.test(new_password),
      has_lowercase: /[a-z]/.test(new_password),
      has_number: /[0-9]/.test(new_password),
      passwords_match: new_password === confirm_password && new_password.length > 0
    };
  }, [new_password, confirm_password]);
  const all_requirements_met = reactExports.useMemo(() => {
    return Object.values(password_requirements_met).every((req) => req === true);
  }, [password_requirements_met]);
  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      setResetSuccess(true);
      showToast("success", "Password reset successful! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    },
    onError: (error) => {
      var _a;
      const errorData = (_a = error.response) == null ? void 0 : _a.data;
      const errorCode = errorData == null ? void 0 : errorData.error_code;
      const errorMessage = (errorData == null ? void 0 : errorData.message) || "Failed to reset password";
      if (errorCode === "INVALID_TOKEN") {
        setFormErrors((prev) => ({
          ...prev,
          token: "This password reset link is invalid. Please request a new one."
        }));
      } else if (errorCode === "TOKEN_EXPIRED") {
        setFormErrors((prev) => ({
          ...prev,
          token: "This password reset link has expired. Please request a new one."
        }));
      } else if (errorCode === "TOKEN_USED") {
        setFormErrors((prev) => ({
          ...prev,
          token: "This password reset link has already been used. Please request a new one."
        }));
      } else if (errorCode === "MISSING_FIELDS") {
        setFormErrors((prev) => ({
          ...prev,
          password: "Please enter a new password."
        }));
      } else {
        setFormErrors((prev) => ({
          ...prev,
          token: errorMessage
        }));
      }
      showToast("error", errorMessage);
    }
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({
      password: null,
      token: null
    });
    if (!reset_token) {
      setFormErrors((prev) => ({
        ...prev,
        token: "Invalid reset link. Please request a new password reset."
      }));
      return;
    }
    if (!all_requirements_met) {
      setFormErrors((prev) => ({
        ...prev,
        password: "Please meet all password requirements."
      }));
      return;
    }
    resetPasswordMutation.mutate({
      token: reset_token,
      password: new_password
    });
  };
  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
    if (form_errors.password) {
      setFormErrors((prev) => ({
        ...prev,
        password: null
      }));
    }
  };
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (form_errors.password) {
      setFormErrors((prev) => ({
        ...prev,
        password: null
      }));
    }
  };
  const is_loading = resetPasswordMutation.isPending;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white shadow-xl shadow-gray-200/50 rounded-2xl border border-gray-100 overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white/20 p-3 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-8 w-8 text-white" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-white", children: "Reset Password" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-blue-100 text-sm mt-2", children: "Create a new secure password for your account" })
      ] }),
      form_errors.token && !reset_success && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border-b border-red-200 px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start space-x-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-800 text-sm font-medium", children: "Invalid Reset Link" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm mt-1", children: form_errors.token }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/forgot-password",
              className: "text-red-900 text-sm font-semibold hover:text-red-700 underline mt-2 inline-block",
              children: "Request New Password Reset"
            }
          )
        ] })
      ] }) }),
      reset_success && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-8 py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-green-100 p-4 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-12 w-12 text-green-600" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-gray-900 mb-2", children: "Password Reset Complete!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: "Your password has been successfully updated. You can now log in with your new password." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "Redirecting to login page..." })
      ] }),
      !reset_success && reset_token && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "px-8 py-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "new_password", className: "block text-sm font-semibold text-gray-900 mb-2", children: "New Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "new_password",
                name: "new_password",
                type: show_password ? "text" : "password",
                value: new_password,
                onChange: handlePasswordChange,
                required: true,
                autoComplete: "new-password",
                placeholder: "Enter new password",
                disabled: is_loading,
                className: `w-full px-4 py-3 pr-12 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${form_errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} disabled:opacity-50 disabled:cursor-not-allowed`,
                "aria-describedby": form_errors.password ? "password-error" : "password-requirements"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword(!show_password),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none",
                "aria-label": show_password ? "Hide password" : "Show password",
                children: show_password ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-5 w-5" })
              }
            )
          ] }),
          form_errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { id: "password-error", className: "mt-2 text-sm text-red-600", children: form_errors.password })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "confirm_password", className: "block text-sm font-semibold text-gray-900 mb-2", children: "Confirm New Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "confirm_password",
                name: "confirm_password",
                type: show_confirm_password ? "text" : "password",
                value: confirm_password,
                onChange: handleConfirmPasswordChange,
                required: true,
                autoComplete: "new-password",
                placeholder: "Confirm new password",
                disabled: is_loading,
                className: `w-full px-4 py-3 pr-12 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-4 ${confirm_password && !password_requirements_met.passwords_match ? "border-red-300 focus:border-red-500 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-blue-100"} disabled:opacity-50 disabled:cursor-not-allowed`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowConfirmPassword(!show_confirm_password),
                className: "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none",
                "aria-label": show_confirm_password ? "Hide password" : "Show password",
                children: show_confirm_password ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-5 w-5" })
              }
            )
          ] }),
          confirm_password && !password_requirements_met.passwords_match && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", children: "Passwords do not match" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { id: "password-requirements", className: "bg-gray-50 border border-gray-200 rounded-lg p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide", children: "Password Requirements" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", "aria-live": "polite", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              password_requirements_met.min_length ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-gray-400 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm ${password_requirements_met.min_length ? "text-green-700 font-medium" : "text-gray-600"}`, children: "At least 8 characters" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              password_requirements_met.has_uppercase ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-gray-400 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm ${password_requirements_met.has_uppercase ? "text-green-700 font-medium" : "text-gray-600"}`, children: "One uppercase letter (A-Z)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              password_requirements_met.has_lowercase ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-gray-400 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm ${password_requirements_met.has_lowercase ? "text-green-700 font-medium" : "text-gray-600"}`, children: "One lowercase letter (a-z)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              password_requirements_met.has_number ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-gray-400 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm ${password_requirements_met.has_number ? "text-green-700 font-medium" : "text-gray-600"}`, children: "One number (0-9)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
              password_requirements_met.passwords_match ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-4 w-4 text-green-600 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4 text-gray-400 flex-shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-sm ${password_requirements_met.passwords_match ? "text-green-700 font-medium" : "text-gray-600"}`, children: "Passwords match" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: !all_requirements_met || is_loading || !!form_errors.token,
            className: "w-full flex justify-center items-center px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl",
            children: is_loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
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
              "Resetting Password..."
            ] }) : "Reset Password"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/login",
            className: "text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline",
            children: "Back to Login"
          }
        ) })
      ] }),
      !reset_token && !reset_success && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-8 py-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-100 p-4 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-12 w-12 text-red-600" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2", children: "Invalid Reset Link" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: "This password reset link is invalid or missing. Please request a new password reset." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/forgot-password",
              className: "px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl",
              children: "Request New Reset Link"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Link,
            {
              to: "/login",
              className: "px-6 py-3 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-all duration-200",
              children: "Back to Login"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
      "Need help?",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: `mailto:${useAppStore.getState().system_config_state.company_email}`,
          className: "text-blue-600 hover:text-blue-700 font-medium hover:underline",
          children: "Contact Support"
        }
      )
    ] }) })
  ] }) }) });
};
export {
  UV_ResetPassword as default
};
