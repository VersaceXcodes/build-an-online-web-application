import { k as useSearchParams, l as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, b as axios } from "./index-nYaE10KP.js";
import { u as useMutation } from "./useMutation-BdRga-lQ.js";
const fetchUsers = async (filters, auth_token) => {
  const params = {
    limit: 20,
    offset: 0
  };
  if (filters.search) params.query = filters.search;
  if (filters.user_type && filters.user_type !== "all")
    params.user_type = filters.user_type;
  if (filters.status && filters.status !== "all")
    params.account_status = filters.status;
  if (filters.sort_by) params.sort_by = filters.sort_by;
  if (filters.sort_order) params.sort_order = filters.sort_order;
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/users`,
    {
      headers: {
        Authorization: `Bearer ${auth_token}`
      },
      params
    }
  );
  return response.data;
};
const createUser = async (userData, auth_token) => {
  const payload = {
    email: userData.email,
    password: userData.password,
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone_number: userData.phone_number,
    user_type: userData.user_type,
    marketing_opt_in: userData.marketing_opt_in
  };
  const response = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/users`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${auth_token}`
      }
    }
  );
  return response.data;
};
const updateUser = async (userData, auth_token) => {
  if (!userData.user_id) throw new Error("User ID required for update");
  const payload = {
    user_id: userData.user_id,
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone_number: userData.phone_number,
    user_type: userData.user_type,
    account_status: userData.account_status,
    marketing_opt_in: userData.marketing_opt_in
  };
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/users/${userData.user_id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${auth_token}`
      }
    }
  );
  return response.data;
};
const deactivateUser = async (user_id, auth_token) => {
  const payload = {
    user_id,
    account_status: "suspended"
  };
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/users/${user_id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${auth_token}`
      }
    }
  );
  return response.data;
};
const UV_AdminUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const auth_token = useAppStore(
    (state) => state.authentication_state.auth_token
  );
  const current_user = useAppStore((state) => state.authentication_state.current_user);
  const show_toast = useAppStore((state) => state.show_toast);
  const [user_filters, set_user_filters] = reactExports.useState({
    user_type: searchParams.get("user_type") || "all",
    status: searchParams.get("status") || "active",
    search: searchParams.get("search") || "",
    date_from: searchParams.get("date_from") || null,
    date_to: searchParams.get("date_to") || null,
    sort_by: searchParams.get("sort_by") || "created_at",
    sort_order: searchParams.get("sort_order") || "desc"
  });
  const [user_form_modal_open, set_user_form_modal_open] = reactExports.useState(false);
  const [user_form_mode, set_user_form_mode] = reactExports.useState(
    "create"
  );
  const [user_form_data, set_user_form_data] = reactExports.useState({
    user_id: null,
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    user_type: "customer",
    account_status: "active",
    marketing_opt_in: false
  });
  const [user_form_errors, set_user_form_errors] = reactExports.useState({});
  const [deactivate_user_modal, set_deactivate_user_modal] = reactExports.useState({
    open: false,
    user_id: null
  });
  const [password_reset_modal, set_password_reset_modal] = reactExports.useState({
    open: false,
    user_id: null
  });
  reactExports.useEffect(() => {
    const params = new URLSearchParams();
    if (user_filters.user_type !== "all")
      params.set("user_type", user_filters.user_type);
    if (user_filters.status !== "active")
      params.set("status", user_filters.status);
    if (user_filters.search) params.set("search", user_filters.search);
    if (user_filters.date_from) params.set("date_from", user_filters.date_from);
    if (user_filters.date_to) params.set("date_to", user_filters.date_to);
    if (user_filters.sort_by !== "created_at")
      params.set("sort_by", user_filters.sort_by);
    if (user_filters.sort_order !== "desc")
      params.set("sort_order", user_filters.sort_order);
    setSearchParams(params, { replace: true });
  }, [user_filters, setSearchParams]);
  const {
    data: users_data,
    isLoading: users_loading,
    error: users_error
  } = useQuery({
    queryKey: ["admin-users", user_filters],
    queryFn: () => fetchUsers(user_filters, auth_token || ""),
    enabled: !!auth_token,
    staleTime: 6e4
    // 1 minute
  });
  const users_list = (users_data == null ? void 0 : users_data.data) || [];
  const total_users_count = (users_data == null ? void 0 : users_data.total) || 0;
  const create_user_mutation = useMutation({
    mutationFn: (userData) => createUser(userData, auth_token || ""),
    onSuccess: (new_user) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      set_user_form_modal_open(false);
      reset_user_form();
      show_toast(
        "success",
        `User ${new_user.first_name} ${new_user.last_name} created successfully`
      );
    },
    onError: (error) => {
      var _a, _b;
      const error_message = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to create user";
      show_toast("error", error_message);
    }
  });
  const update_user_mutation = useMutation({
    mutationFn: (userData) => updateUser(userData, auth_token || ""),
    onSuccess: (updated_user) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      set_user_form_modal_open(false);
      reset_user_form();
      show_toast(
        "success",
        `User ${updated_user.first_name} ${updated_user.last_name} updated successfully`
      );
    },
    onError: (error) => {
      var _a, _b;
      const error_message = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to update user";
      show_toast("error", error_message);
    }
  });
  const deactivate_user_mutation = useMutation({
    mutationFn: (user_id) => deactivateUser(user_id, auth_token || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      set_deactivate_user_modal({ open: false, user_id: null });
      show_toast("success", "User account deactivated successfully");
    },
    onError: (error) => {
      var _a, _b;
      const error_message = ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to deactivate user";
      show_toast("error", error_message);
    }
  });
  const reset_user_form = () => {
    set_user_form_data({
      user_id: null,
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      user_type: "customer",
      account_status: "active",
      marketing_opt_in: false
    });
    set_user_form_errors({});
  };
  const open_create_modal = () => {
    reset_user_form();
    set_user_form_mode("create");
    set_user_form_modal_open(true);
  };
  const open_edit_modal = async (user) => {
    set_user_form_data({
      user_id: user.user_id,
      email: user.email,
      password: "",
      // Don't populate password for security
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      user_type: user.user_type,
      account_status: user.account_status,
      marketing_opt_in: user.marketing_opt_in
    });
    set_user_form_mode("edit");
    set_user_form_modal_open(true);
  };
  const validate_user_form = () => {
    const errors = {};
    if (!user_form_data.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(user_form_data.email)) {
      errors.email = "Invalid email format";
    }
    if (user_form_mode === "create" && !user_form_data.password) {
      errors.password = "Password is required";
    }
    if (user_form_mode === "create" && user_form_data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!user_form_data.first_name) {
      errors.first_name = "First name is required";
    }
    if (!user_form_data.last_name) {
      errors.last_name = "Last name is required";
    }
    if (!user_form_data.phone_number) {
      errors.phone_number = "Phone number is required";
    }
    set_user_form_errors(errors);
    return Object.keys(errors).length === 0;
  };
  const handle_save_user = () => {
    if (!validate_user_form()) {
      show_toast("error", "Please correct the form errors");
      return;
    }
    if (user_form_mode === "create") {
      create_user_mutation.mutate(user_form_data);
    } else {
      update_user_mutation.mutate(user_form_data);
    }
  };
  const handle_deactivate_user = (user_id) => {
    if ((current_user == null ? void 0 : current_user.user_id) === user_id) {
      show_toast("error", "You cannot deactivate your own account");
      return;
    }
    set_deactivate_user_modal({ open: true, user_id });
  };
  const confirm_deactivate_user = () => {
    if (deactivate_user_modal.user_id) {
      deactivate_user_mutation.mutate(deactivate_user_modal.user_id);
    }
  };
  const handle_password_reset = (user_id) => {
    set_password_reset_modal({ open: true, user_id });
  };
  const confirm_password_reset = () => {
    show_toast(
      "info",
      "Password reset email would be sent (endpoint not implemented)"
    );
    set_password_reset_modal({ open: false, user_id: null });
  };
  const update_filter = (key, value) => {
    set_user_filters((prev) => ({
      ...prev,
      [key]: value
    }));
  };
  const get_user_type_badge_color = (user_type) => {
    switch (user_type) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "staff":
        return "bg-green-100 text-green-800";
      case "customer":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const get_status_badge_color = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-yellow-100 text-yellow-800";
      case "deleted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  const format_date = (date_string) => {
    const date = new Date(date_string);
    return date.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "User Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Manage user accounts, roles, and permissions" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: open_create_modal,
          className: "inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "svg",
              {
                className: "w-5 h-5 mr-2",
                fill: "none",
                stroke: "currentColor",
                viewBox: "0 0 24 24",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "path",
                  {
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    strokeWidth: 2,
                    d: "M12 4v16m8-8H4"
                  }
                )
              }
            ),
            "Create User"
          ]
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Search" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                placeholder: "Name or email...",
                value: user_filters.search,
                onChange: (e) => update_filter("search", e.target.value),
                className: "w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "User Type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: user_filters.user_type,
                onChange: (e) => update_filter("user_type", e.target.value),
                className: "w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Types" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "customer", children: "Customer" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "staff", children: "Staff" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "manager", children: "Manager" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: "Admin" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Account Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: user_filters.status,
                onChange: (e) => update_filter("status", e.target.value),
                className: "w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Status" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "active", children: "Active" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "suspended", children: "Suspended" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "deleted", children: "Deleted" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Sort By" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: user_filters.sort_by,
                onChange: (e) => update_filter("sort_by", e.target.value),
                className: "w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "created_at", children: "Date Created" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "email", children: "Email" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "last_login_at", children: "Last Login" })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 pt-4 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-600", children: [
          "Showing",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900", children: users_list.length }),
          " ",
          "of",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-gray-900", children: total_users_count }),
          " ",
          "users"
        ] }) })
      ] }),
      users_loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 font-medium", children: "Loading users..." })
      ] }) }) : users_error ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-red-200 p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            className: "h-8 w-8 text-red-600",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "Failed to load users" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Please try refreshing the page" })
      ] }) }) : users_list.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 p-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "svg",
          {
            className: "h-8 w-8 text-gray-400",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "path",
              {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: 2,
                d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "No users found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "Try adjusting your filters or create a new user" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: open_create_modal,
            className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors",
            children: "Create User"
          }
        )
      ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "User" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "Contact" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "Created" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "Last Login" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: users_list.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "tr",
          {
            className: "hover:bg-gray-50 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-white font-semibold text-sm", children: [
                  user.first_name[0],
                  user.last_name[0]
                ] }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-medium text-gray-900", children: [
                    user.first_name,
                    " ",
                    user.last_name
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-500", children: [
                    "ID: ",
                    user.user_id.slice(0, 12),
                    "..."
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 whitespace-nowrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-900", children: user.email }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-500", children: user.phone_number })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${get_user_type_badge_color(
                    user.user_type
                  )}`,
                  children: user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${get_status_badge_color(
                    user.account_status
                  )}`,
                  children: user.account_status.charAt(0).toUpperCase() + user.account_status.slice(1)
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600", children: format_date(user.created_at) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600", children: user.last_login_at ? format_date(user.last_login_at) : "Never" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => open_edit_modal(user),
                    className: "text-blue-600 hover:text-blue-900 font-medium transition-colors",
                    children: "Edit"
                  }
                ),
                user.account_status === "active" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handle_deactivate_user(user.user_id),
                    className: "text-red-600 hover:text-red-900 font-medium transition-colors",
                    disabled: (current_user == null ? void 0 : current_user.user_id) === user.user_id,
                    children: "Deactivate"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handle_password_reset(user.user_id),
                    className: "text-gray-600 hover:text-gray-900 font-medium transition-colors",
                    children: "Reset Password"
                  }
                )
              ] }) })
            ]
          },
          user.user_id
        )) })
      ] }) }) })
    ] }),
    user_form_modal_open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
          onClick: () => set_user_form_modal_open(false)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white px-6 pt-6 pb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-bold text-gray-900", children: user_form_mode === "create" ? "Create New User" : "Edit User" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => set_user_form_modal_open(false),
                className: "text-gray-400 hover:text-gray-600 transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "svg",
                  {
                    className: "h-6 w-6",
                    fill: "none",
                    stroke: "currentColor",
                    viewBox: "0 0 24 24",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "path",
                      {
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                        strokeWidth: 2,
                        d: "M6 18L18 6M6 6l12 12"
                      }
                    )
                  }
                )
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Email Address *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "email",
                  value: user_form_data.email,
                  onChange: (e) => {
                    set_user_form_data((prev) => ({
                      ...prev,
                      email: e.target.value
                    }));
                    set_user_form_errors((prev) => ({
                      ...prev,
                      email: ""
                    }));
                  },
                  className: `w-full px-4 py-3 rounded-lg border-2 ${user_form_errors.email ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"} focus:ring-4 focus:ring-blue-100 transition-all`,
                  placeholder: "user@example.com"
                }
              ),
              user_form_errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: user_form_errors.email })
            ] }),
            user_form_mode === "create" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Password *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "password",
                  value: user_form_data.password,
                  onChange: (e) => {
                    set_user_form_data((prev) => ({
                      ...prev,
                      password: e.target.value
                    }));
                    set_user_form_errors((prev) => ({
                      ...prev,
                      password: ""
                    }));
                  },
                  className: `w-full px-4 py-3 rounded-lg border-2 ${user_form_errors.password ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"} focus:ring-4 focus:ring-blue-100 transition-all`,
                  placeholder: "Minimum 8 characters"
                }
              ),
              user_form_errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: user_form_errors.password })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "First Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: user_form_data.first_name,
                    onChange: (e) => {
                      set_user_form_data((prev) => ({
                        ...prev,
                        first_name: e.target.value
                      }));
                      set_user_form_errors((prev) => ({
                        ...prev,
                        first_name: ""
                      }));
                    },
                    className: `w-full px-4 py-3 rounded-lg border-2 ${user_form_errors.first_name ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"} focus:ring-4 focus:ring-blue-100 transition-all`
                  }
                ),
                user_form_errors.first_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: user_form_errors.first_name })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Last Name *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "text",
                    value: user_form_data.last_name,
                    onChange: (e) => {
                      set_user_form_data((prev) => ({
                        ...prev,
                        last_name: e.target.value
                      }));
                      set_user_form_errors((prev) => ({
                        ...prev,
                        last_name: ""
                      }));
                    },
                    className: `w-full px-4 py-3 rounded-lg border-2 ${user_form_errors.last_name ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"} focus:ring-4 focus:ring-blue-100 transition-all`
                  }
                ),
                user_form_errors.last_name && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: user_form_errors.last_name })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Phone Number *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "tel",
                  value: user_form_data.phone_number,
                  onChange: (e) => {
                    set_user_form_data((prev) => ({
                      ...prev,
                      phone_number: e.target.value
                    }));
                    set_user_form_errors((prev) => ({
                      ...prev,
                      phone_number: ""
                    }));
                  },
                  className: `w-full px-4 py-3 rounded-lg border-2 ${user_form_errors.phone_number ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-blue-500"} focus:ring-4 focus:ring-blue-100 transition-all`,
                  placeholder: "+353 1 234 5678"
                }
              ),
              user_form_errors.phone_number && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: user_form_errors.phone_number })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "User Type *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: user_form_data.user_type,
                    onChange: (e) => set_user_form_data((prev) => ({
                      ...prev,
                      user_type: e.target.value
                    })),
                    className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "customer", children: "Customer" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "staff", children: "Staff" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "manager", children: "Manager" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: "Admin" })
                    ]
                  }
                )
              ] }),
              user_form_mode === "edit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Account Status *" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "select",
                  {
                    value: user_form_data.account_status,
                    onChange: (e) => set_user_form_data((prev) => ({
                      ...prev,
                      account_status: e.target.value
                    })),
                    className: "w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "active", children: "Active" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "suspended", children: "Suspended" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "deleted", children: "Deleted" })
                    ]
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  checked: user_form_data.marketing_opt_in,
                  onChange: (e) => set_user_form_data((prev) => ({
                    ...prev,
                    marketing_opt_in: e.target.checked
                  })),
                  className: "h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "ml-3 text-sm text-gray-700", children: "Opted in to marketing communications" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 px-6 py-4 flex justify-end space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => set_user_form_modal_open(false),
              className: "px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handle_save_user,
              disabled: create_user_mutation.isPending || update_user_mutation.isPending,
              className: "px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center",
              children: [
                (create_user_mutation.isPending || update_user_mutation.isPending) && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "svg",
                  {
                    className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white",
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
                user_form_mode === "create" ? "Create User" : "Save Changes"
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    deactivate_user_modal.open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
          onClick: () => set_deactivate_user_modal({ open: false, user_id: null })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white px-6 pt-6 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:flex sm:items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "svg",
            {
              className: "h-6 w-6 text-red-600",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                }
              )
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: "Deactivate User Account" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "Are you sure you want to deactivate this user account? This action will suspend their access to the system." }) })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 px-6 py-4 flex justify-end space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => set_deactivate_user_modal({ open: false, user_id: null }),
              className: "px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: confirm_deactivate_user,
              disabled: deactivate_user_mutation.isPending,
              className: "px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center",
              children: [
                deactivate_user_mutation.isPending && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "svg",
                  {
                    className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white",
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
                "Deactivate Account"
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    password_reset_modal.open && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity",
          onClick: () => set_password_reset_modal({ open: false, user_id: null })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white px-6 pt-6 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:flex sm:items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "svg",
            {
              className: "h-6 w-6 text-blue-600",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "path",
                {
                  strokeLinecap: "round",
                  strokeLinejoin: "round",
                  strokeWidth: 2,
                  d: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                }
              )
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg leading-6 font-medium text-gray-900", children: "Reset User Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600", children: "A password reset link will be sent to the user's email address." }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-yellow-800", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
                " Backend endpoint for admin-initiated password reset is not yet implemented. This is a UI demonstration."
              ] }) })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 px-6 py-4 flex justify-end space-x-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => set_password_reset_modal({ open: false, user_id: null }),
              className: "px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: confirm_password_reset,
              className: "px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors",
              children: "Send Reset Link"
            }
          )
        ] })
      ] })
    ] }) })
  ] }) });
};
export {
  UV_AdminUsers as default
};
