import { h as useNavigate, l as useSearchParams, u as useAppStore, r as reactExports, j as jsxRuntimeExports, p as LoaderCircle, v as kakeLogo, z as Check, x as EyeOff, y as Eye, X, L as Link, b as axios } from "./index-CwVo5_So.js";
const UV_Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect_url = searchParams.get("redirect") || "/";
  const is_authenticated = useAppStore(
    (state) => state.authentication_state.authentication_status.is_authenticated
  );
  const is_auth_loading = useAppStore(
    (state) => state.authentication_state.authentication_status.is_loading
  );
  const auth_error_message = useAppStore(
    (state) => state.authentication_state.error_message
  );
  const current_user = useAppStore(
    (state) => state.authentication_state.current_user
  );
  const register_user = useAppStore((state) => state.register_user);
  const clear_auth_error = useAppStore((state) => state.clear_auth_error);
  const [email, setEmail] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [first_name, setFirstName] = reactExports.useState("");
  const [last_name, setLastName] = reactExports.useState("");
  const [phone_number, setPhoneNumber] = reactExports.useState("");
  const [marketing_opt_in, setMarketingOptIn] = reactExports.useState(false);
  const [terms_accepted, setTermsAccepted] = reactExports.useState(false);
  const [password_requirements_met, setPasswordRequirementsMet] = reactExports.useState({
    min_length: false,
    has_uppercase: false,
    has_lowercase: false,
    has_number: false
  });
  const [form_errors, setFormErrors] = reactExports.useState({
    email: null,
    password: null,
    first_name: null,
    last_name: null,
    phone_number: null,
    terms: null
  });
  const [show_password, setShowPassword] = reactExports.useState(false);
  const [email_availability_checked, setEmailAvailabilityChecked] = reactExports.useState(false);
  const [is_checking_email, setIsCheckingEmail] = reactExports.useState(false);
  const [is_submitting, setIsSubmitting] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (is_authenticated && current_user) {
      if (current_user.user_type === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (current_user.user_type === "staff" || current_user.user_type === "manager") {
        navigate("/staff/dashboard", { replace: true });
      } else {
        navigate("/account", { replace: true });
      }
    }
  }, [is_authenticated, current_user, navigate]);
  const validate_password_strength = reactExports.useCallback((pwd) => {
    const requirements = {
      min_length: pwd.length >= 8,
      has_uppercase: /[A-Z]/.test(pwd),
      has_lowercase: /[a-z]/.test(pwd),
      has_number: /[0-9]/.test(pwd)
    };
    setPasswordRequirementsMet(requirements);
    const all_met = Object.values(requirements).every((req) => req === true);
    return all_met;
  }, []);
  reactExports.useEffect(() => {
    if (password) {
      validate_password_strength(password);
    }
  }, [password, validate_password_strength]);
  const check_email_availability = async (email_to_check) => {
    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email_regex.test(email_to_check)) {
      setFormErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address"
      }));
      setEmailAvailabilityChecked(false);
      return;
    }
    setIsCheckingEmail(true);
    setFormErrors((prev) => ({ ...prev, email: null }));
    try {
      const response = await axios.get(
        `${"https://123build-an-online-web-application.launchpulse.ai"}/api/auth/check-email`,
        {
          params: { email: email_to_check }
        }
      );
      const is_available = response.data.available === true;
      if (!is_available) {
        setFormErrors((prev) => ({
          ...prev,
          email: "This email is already registered. Please log in instead."
        }));
        setEmailAvailabilityChecked(false);
      } else {
        setFormErrors((prev) => ({ ...prev, email: null }));
        setEmailAvailabilityChecked(true);
      }
    } catch (error) {
      console.error("Email availability check failed:", error);
      setEmailAvailabilityChecked(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };
  const validate_first_name = (value) => {
    if (!value || value.trim().length < 1) {
      setFormErrors((prev) => ({
        ...prev,
        first_name: "First name is required"
      }));
    } else if (value.length > 100) {
      setFormErrors((prev) => ({
        ...prev,
        first_name: "First name is too long (max 100 characters)"
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, first_name: null }));
    }
  };
  const validate_last_name = (value) => {
    if (!value || value.trim().length < 1) {
      setFormErrors((prev) => ({
        ...prev,
        last_name: "Last name is required"
      }));
    } else if (value.length > 100) {
      setFormErrors((prev) => ({
        ...prev,
        last_name: "Last name is too long (max 100 characters)"
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, last_name: null }));
    }
  };
  const validate_phone_number = (value) => {
    if (!value || value.trim().length < 10) {
      setFormErrors((prev) => ({
        ...prev,
        phone_number: "Phone number must be at least 10 characters"
      }));
    } else if (value.length > 20) {
      setFormErrors((prev) => ({
        ...prev,
        phone_number: "Phone number is too long (max 20 characters)"
      }));
    } else {
      setFormErrors((prev) => ({ ...prev, phone_number: null }));
    }
  };
  const handle_submit = async (e) => {
    e.preventDefault();
    clear_auth_error();
    let has_errors = false;
    if (!email) {
      setFormErrors((prev) => ({ ...prev, email: "Email is required" }));
      has_errors = true;
    }
    if (!password) {
      setFormErrors((prev) => ({ ...prev, password: "Password is required" }));
      has_errors = true;
    } else {
      const all_requirements_met = Object.values(password_requirements_met).every(
        (req) => req === true
      );
      if (!all_requirements_met) {
        setFormErrors((prev) => ({
          ...prev,
          password: "Password must meet all requirements"
        }));
        has_errors = true;
      }
    }
    if (!first_name || first_name.trim().length < 1) {
      setFormErrors((prev) => ({
        ...prev,
        first_name: "First name is required"
      }));
      has_errors = true;
    }
    if (!last_name || last_name.trim().length < 1) {
      setFormErrors((prev) => ({
        ...prev,
        last_name: "Last name is required"
      }));
      has_errors = true;
    }
    if (!phone_number || phone_number.trim().length < 10) {
      setFormErrors((prev) => ({
        ...prev,
        phone_number: "Phone number is required"
      }));
      has_errors = true;
    }
    if (!terms_accepted) {
      setFormErrors((prev) => ({
        ...prev,
        terms: "You must accept the Terms & Conditions"
      }));
      has_errors = true;
    }
    if (has_errors) {
      return;
    }
    setIsSubmitting(true);
    try {
      await register_user({
        email,
        password,
        first_name,
        last_name,
        phone_number,
        marketing_opt_in
      });
      navigate(redirect_url, { replace: true });
    } catch (error) {
      console.error("Registration failed:", error);
      setIsSubmitting(false);
    }
  };
  if (is_auth_loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-lg font-medium", children: "Loading..." })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white shadow-xl shadow-gray-200/50 rounded-xl p-8 border border-gray-100", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: kakeLogo, alt: "Kake Logo", className: "h-16 w-auto mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl md:text-4xl font-bold text-gray-900 mb-2", children: "Create Your Kake Account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-gray-600", children: "Join for faster checkout and loyalty rewards" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          disabled: true,
          className: "w-full flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 opacity-50 cursor-not-allowed",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { className: "w-5 h-5 mr-3", viewBox: "0 0 24 24", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  fill: "currentColor",
                  d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  fill: "currentColor",
                  d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  fill: "currentColor",
                  d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  fill: "currentColor",
                  d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                }
              )
            ] }),
            "Sign up with Google (Coming Soon)"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full border-t border-gray-200" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-4 bg-white text-gray-500 font-medium", children: "Or sign up with email" }) })
      ] }),
      auth_error_message && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg",
          role: "alert",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: auth_error_message })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handle_submit, className: "space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "first_name",
              className: "block text-sm font-medium text-gray-700 mb-2",
              children: "First Name"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "first_name",
              name: "first_name",
              type: "text",
              autoComplete: "given-name",
              required: true,
              value: first_name,
              onChange: (e) => {
                setFirstName(e.target.value);
                setFormErrors((prev) => ({ ...prev, first_name: null }));
              },
              onBlur: (e) => validate_first_name(e.target.value),
              className: `w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${form_errors.first_name ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`,
              placeholder: "John"
            }
          ),
          form_errors.first_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", role: "alert", children: form_errors.first_name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "last_name",
              className: "block text-sm font-medium text-gray-700 mb-2",
              children: "Last Name"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "last_name",
              name: "last_name",
              type: "text",
              autoComplete: "family-name",
              required: true,
              value: last_name,
              onChange: (e) => {
                setLastName(e.target.value);
                setFormErrors((prev) => ({ ...prev, last_name: null }));
              },
              onBlur: (e) => validate_last_name(e.target.value),
              className: `w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${form_errors.last_name ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`,
              placeholder: "Doe"
            }
          ),
          form_errors.last_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", role: "alert", children: form_errors.last_name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "email",
              className: "block text-sm font-medium text-gray-700 mb-2",
              children: "Email Address"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "email",
                name: "email",
                type: "email",
                autoComplete: "email",
                required: true,
                value: email,
                onChange: (e) => {
                  setEmail(e.target.value);
                  setFormErrors((prev) => ({ ...prev, email: null }));
                  setEmailAvailabilityChecked(false);
                },
                onBlur: (e) => {
                  if (e.target.value) {
                    check_email_availability(e.target.value);
                  }
                },
                className: `w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${form_errors.email ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : email_availability_checked ? "border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`,
                placeholder: "john@example.com"
              }
            ),
            is_checking_email && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-5 w-5 text-gray-400" }) }),
            email_availability_checked && !is_checking_email && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5 text-green-600" }) })
          ] }),
          form_errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", role: "alert", children: form_errors.email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "phone_number",
              className: "block text-sm font-medium text-gray-700 mb-2",
              children: "Phone Number"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "phone_number",
              name: "phone_number",
              type: "tel",
              autoComplete: "tel",
              required: true,
              value: phone_number,
              onChange: (e) => {
                setPhoneNumber(e.target.value);
                setFormErrors((prev) => ({ ...prev, phone_number: null }));
              },
              onBlur: (e) => validate_phone_number(e.target.value),
              className: `w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${form_errors.phone_number ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`,
              placeholder: "+353 86 123 4567"
            }
          ),
          form_errors.phone_number && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", role: "alert", children: form_errors.phone_number })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "password",
              className: "block text-sm font-medium text-gray-700 mb-2",
              children: "Password"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "password",
                name: "password",
                type: show_password ? "text" : "password",
                autoComplete: "new-password",
                required: true,
                value: password,
                onChange: (e) => {
                  setPassword(e.target.value);
                  setFormErrors((prev) => ({ ...prev, password: null }));
                },
                className: `w-full px-4 py-3 pr-12 rounded-lg border-2 transition-all duration-200 ${form_errors.password ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`,
                placeholder: "Enter password"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setShowPassword(!show_password),
                className: "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors",
                "aria-label": show_password ? "Hide password" : "Show password",
                children: show_password ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-5 w-5" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 space-y-2 bg-gray-50 rounded-lg p-4 border border-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-gray-700 mb-2", children: "Password Requirements:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                password_requirements_met.min_length ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-green-600 mr-2 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-gray-400 mr-2 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: password_requirements_met.min_length ? "text-green-700 font-medium" : "text-gray-600",
                    children: "Minimum 8 characters"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                password_requirements_met.has_uppercase ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-green-600 mr-2 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-gray-400 mr-2 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: password_requirements_met.has_uppercase ? "text-green-700 font-medium" : "text-gray-600",
                    children: "Contains uppercase letter"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                password_requirements_met.has_lowercase ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-green-600 mr-2 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-gray-400 mr-2 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: password_requirements_met.has_lowercase ? "text-green-700 font-medium" : "text-gray-600",
                    children: "Contains lowercase letter"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center text-sm", children: [
                password_requirements_met.has_number ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4 text-green-600 mr-2 flex-shrink-0" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4 text-gray-400 mr-2 flex-shrink-0" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: password_requirements_met.has_number ? "text-green-700 font-medium" : "text-gray-600",
                    children: "Contains number"
                  }
                )
              ] })
            ] })
          ] }),
          form_errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", role: "alert", children: form_errors.password })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center h-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              id: "marketing_opt_in",
              name: "marketing_opt_in",
              type: "checkbox",
              checked: marketing_opt_in,
              onChange: (e) => setMarketingOptIn(e.target.checked),
              className: "h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "label",
            {
              htmlFor: "marketing_opt_in",
              className: "text-sm text-gray-700",
              children: "Send me special offers, updates, and news about Kake products"
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center h-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "terms_accepted",
                name: "terms_accepted",
                type: "checkbox",
                required: true,
                checked: terms_accepted,
                onChange: (e) => {
                  setTermsAccepted(e.target.checked);
                  setFormErrors((prev) => ({ ...prev, terms: null }));
                },
                className: `h-5 w-5 border-gray-300 rounded focus:ring-4 transition-all ${form_errors.terms ? "border-red-300 text-red-600 focus:ring-red-100" : "border-gray-300 text-blue-600 focus:ring-blue-100 focus:ring-blue-500"}`
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "label",
              {
                htmlFor: "terms_accepted",
                className: "text-sm text-gray-700",
                children: [
                  "I agree to the",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Link,
                    {
                      to: "/terms",
                      className: "text-blue-600 hover:text-blue-700 font-medium underline",
                      target: "_blank",
                      children: "Terms & Conditions"
                    }
                  ),
                  " ",
                  "and",
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Link,
                    {
                      to: "/privacy",
                      className: "text-blue-600 hover:text-blue-700 font-medium underline",
                      target: "_blank",
                      children: "Privacy Policy"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-600 ml-1", children: "*" })
                ]
              }
            ) })
          ] }),
          form_errors.terms && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-red-600", role: "alert", children: form_errors.terms })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "submit",
            disabled: is_submitting || is_auth_loading,
            className: "w-full flex justify-center items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:shadow-lg disabled:hover:scale-100",
            children: is_submitting || is_auth_loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "animate-spin h-5 w-5 mr-2" }),
              "Creating account..."
            ] }) : "Create Account"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/login",
            className: "text-blue-600 hover:text-blue-700 font-medium transition-colors",
            children: "Log in"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: "By creating an account, you'll earn loyalty points on every order and enjoy faster checkout!" }) })
  ] }) }) });
};
export {
  UV_Register as default
};
