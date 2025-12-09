import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import {
  User,
  CreateUserInput,
  UpdateUserInput,
  SearchUsersInput,
} from '@/types/zodSchemas';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface UserFormData {
  user_id: string | null;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: 'customer' | 'staff' | 'manager' | 'admin';
  account_status: 'active' | 'suspended' | 'deleted';
  marketing_opt_in: boolean;
}

interface UserFilters {
  user_type: string;
  status: string;
  search: string;
  date_from: string | null;
  date_to: string | null;
  sort_by: string;
  sort_order: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchUsers = async (
  filters: UserFilters,
  auth_token: string
): Promise<{ data: User[]; total: number; limit: number; offset: number }> => {
  const params: any = {
    limit: 20,
    offset: 0,
  };

  if (filters.search) params.query = filters.search;
  if (filters.user_type && filters.user_type !== 'all')
    params.user_type = filters.user_type;
  if (filters.status && filters.status !== 'all')
    params.account_status = filters.status;
  if (filters.sort_by) params.sort_by = filters.sort_by;
  if (filters.sort_order) params.sort_order = filters.sort_order;

  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users`,
    {
      headers: {
        Authorization: `Bearer ${auth_token}`,
      },
      params,
    }
  );

  return response.data;
};

const createUser = async (
  userData: UserFormData,
  auth_token: string
): Promise<User> => {
  const payload: CreateUserInput = {
    email: userData.email,
    password: userData.password,
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone_number: userData.phone_number,
    user_type: userData.user_type,
    marketing_opt_in: userData.marketing_opt_in,
  };

  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${auth_token}`,
      },
    }
  );

  return response.data;
};

const updateUser = async (
  userData: UserFormData,
  auth_token: string
): Promise<User> => {
  if (!userData.user_id) throw new Error('User ID required for update');

  const payload: Partial<UpdateUserInput> = {
    user_id: userData.user_id,
    email: userData.email,
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone_number: userData.phone_number,
    user_type: userData.user_type,
    account_status: userData.account_status,
    marketing_opt_in: userData.marketing_opt_in,
  };

  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${userData.user_id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${auth_token}`,
      },
    }
  );

  return response.data;
};

const deactivateUser = async (
  user_id: string,
  auth_token: string
): Promise<User> => {
  const payload = {
    user_id,
    account_status: 'suspended' as const,
  };

  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${user_id}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${auth_token}`,
      },
    }
  );

  return response.data;
};

const fetchUserDetails = async (
  user_id: string,
  auth_token: string
): Promise<User> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${user_id}`,
    {
      headers: {
        Authorization: `Bearer ${auth_token}`,
      },
    }
  );

  return response.data;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Global state access (CRITICAL: Individual selectors only)
  const auth_token = useAppStore(
    (state) => state.authentication_state.auth_token
  );
  const current_user = useAppStore(
    (state) => state.authentication_state.current_user
  );
  const show_toast = useAppStore((state) => state.show_toast);
  const show_confirmation = useAppStore((state) => state.show_confirmation);
  const hide_confirmation = useAppStore((state) => state.hide_confirmation);

  // Parse URL params into filters
  const [user_filters, set_user_filters] = useState<UserFilters>({
    user_type: searchParams.get('user_type') || 'all',
    status: searchParams.get('status') || 'active',
    search: searchParams.get('search') || '',
    date_from: searchParams.get('date_from') || null,
    date_to: searchParams.get('date_to') || null,
    sort_by: searchParams.get('sort_by') || 'created_at',
    sort_order: searchParams.get('sort_order') || 'desc',
  });

  // User form state
  const [user_form_modal_open, set_user_form_modal_open] = useState(false);
  const [user_form_mode, set_user_form_mode] = useState<'create' | 'edit'>(
    'create'
  );
  const [user_form_data, set_user_form_data] = useState<UserFormData>({
    user_id: null,
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    user_type: 'customer',
    account_status: 'active',
    marketing_opt_in: false,
  });
  const [user_form_errors, set_user_form_errors] = useState<{
    [key: string]: string;
  }>({});

  // Deactivate modal state
  const [deactivate_user_modal, set_deactivate_user_modal] = useState<{
    open: boolean;
    user_id: string | null;
  }>({
    open: false,
    user_id: null,
  });

  // Password reset modal state
  const [password_reset_modal, set_password_reset_modal] = useState<{
    open: boolean;
    user_id: string | null;
  }>({
    open: false,
    user_id: null,
  });

  // Sync URL params with filters
  useEffect(() => {
    const params = new URLSearchParams();
    if (user_filters.user_type !== 'all')
      params.set('user_type', user_filters.user_type);
    if (user_filters.status !== 'active')
      params.set('status', user_filters.status);
    if (user_filters.search) params.set('search', user_filters.search);
    if (user_filters.date_from) params.set('date_from', user_filters.date_from);
    if (user_filters.date_to) params.set('date_to', user_filters.date_to);
    if (user_filters.sort_by !== 'created_at')
      params.set('sort_by', user_filters.sort_by);
    if (user_filters.sort_order !== 'desc')
      params.set('sort_order', user_filters.sort_order);

    setSearchParams(params, { replace: true });
  }, [user_filters, setSearchParams]);

  // React Query: Fetch users
  const {
    data: users_data,
    isLoading: users_loading,
    error: users_error,
  } = useQuery({
    queryKey: ['admin-users', user_filters],
    queryFn: () => fetchUsers(user_filters, auth_token || ''),
    enabled: !!auth_token,
    staleTime: 60000, // 1 minute
  });

  const users_list = users_data?.data || [];
  const total_users_count = users_data?.total || 0;

  // Mutation: Create user
  const create_user_mutation = useMutation({
    mutationFn: (userData: UserFormData) =>
      createUser(userData, auth_token || ''),
    onSuccess: (new_user) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      set_user_form_modal_open(false);
      reset_user_form();
      show_toast(
        'success',
        `User ${new_user.first_name} ${new_user.last_name} created successfully`
      );
    },
    onError: (error: any) => {
      const error_message =
        error.response?.data?.message || 'Failed to create user';
      show_toast('error', error_message);
    },
  });

  // Mutation: Update user
  const update_user_mutation = useMutation({
    mutationFn: (userData: UserFormData) =>
      updateUser(userData, auth_token || ''),
    onSuccess: (updated_user) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      set_user_form_modal_open(false);
      reset_user_form();
      show_toast(
        'success',
        `User ${updated_user.first_name} ${updated_user.last_name} updated successfully`
      );
    },
    onError: (error: any) => {
      const error_message =
        error.response?.data?.message || 'Failed to update user';
      show_toast('error', error_message);
    },
  });

  // Mutation: Deactivate user
  const deactivate_user_mutation = useMutation({
    mutationFn: (user_id: string) =>
      deactivateUser(user_id, auth_token || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      set_deactivate_user_modal({ open: false, user_id: null });
      show_toast('success', 'User account deactivated successfully');
    },
    onError: (error: any) => {
      const error_message =
        error.response?.data?.message || 'Failed to deactivate user';
      show_toast('error', error_message);
    },
  });

  // ============================================================================
  // HANDLER FUNCTIONS
  // ============================================================================

  const reset_user_form = () => {
    set_user_form_data({
      user_id: null,
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      user_type: 'customer',
      account_status: 'active',
      marketing_opt_in: false,
    });
    set_user_form_errors({});
  };

  const open_create_modal = () => {
    reset_user_form();
    set_user_form_mode('create');
    set_user_form_modal_open(true);
  };

  const open_edit_modal = async (user: User) => {
    set_user_form_data({
      user_id: user.user_id,
      email: user.email,
      password: '', // Don't populate password for security
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
      user_type: user.user_type as any,
      account_status: user.account_status as any,
      marketing_opt_in: user.marketing_opt_in,
    });
    set_user_form_mode('edit');
    set_user_form_modal_open(true);
  };

  const validate_user_form = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!user_form_data.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(user_form_data.email)) {
      errors.email = 'Invalid email format';
    }

    if (user_form_mode === 'create' && !user_form_data.password) {
      errors.password = 'Password is required';
    }

    if (user_form_mode === 'create' && user_form_data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!user_form_data.first_name) {
      errors.first_name = 'First name is required';
    }

    if (!user_form_data.last_name) {
      errors.last_name = 'Last name is required';
    }

    if (!user_form_data.phone_number) {
      errors.phone_number = 'Phone number is required';
    }

    set_user_form_errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handle_save_user = () => {
    if (!validate_user_form()) {
      show_toast('error', 'Please correct the form errors');
      return;
    }

    if (user_form_mode === 'create') {
      create_user_mutation.mutate(user_form_data);
    } else {
      update_user_mutation.mutate(user_form_data);
    }
  };

  const handle_deactivate_user = (user_id: string) => {
    // Prevent self-deactivation
    if (current_user?.user_id === user_id) {
      show_toast('error', 'You cannot deactivate your own account');
      return;
    }

    set_deactivate_user_modal({ open: true, user_id });
  };

  const confirm_deactivate_user = () => {
    if (deactivate_user_modal.user_id) {
      deactivate_user_mutation.mutate(deactivate_user_modal.user_id);
    }
  };

  const handle_password_reset = (user_id: string) => {
    set_password_reset_modal({ open: true, user_id });
  };

  const confirm_password_reset = () => {
    // NOTE: Endpoint missing - would call POST /api/auth/admin-reset-password
    show_toast(
      'info',
      'Password reset email would be sent (endpoint not implemented)'
    );
    set_password_reset_modal({ open: false, user_id: null });
  };

  const update_filter = (key: keyof UserFilters, value: string | null) => {
    set_user_filters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const get_user_type_badge_color = (user_type: string): string => {
    switch (user_type) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'staff':
        return 'bg-green-100 text-green-800';
      case 'customer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const get_status_badge_color = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-yellow-100 text-yellow-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const format_date = (date_string: string): string => {
    const date = new Date(date_string);
    return date.toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage user accounts, roles, and permissions
                </p>
              </div>
              <button
                onClick={open_create_modal}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create User
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={user_filters.search}
                  onChange={(e) => update_filter('search', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* User Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Type
                </label>
                <select
                  value={user_filters.user_type}
                  onChange={(e) => update_filter('user_type', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                >
                  <option value="all">All Types</option>
                  <option value="customer">Customer</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Status
                </label>
                <select
                  value={user_filters.status}
                  onChange={(e) => update_filter('status', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={user_filters.sort_by}
                  onChange={(e) => update_filter('sort_by', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                >
                  <option value="created_at">Date Created</option>
                  <option value="email">Email</option>
                  <option value="last_login_at">Last Login</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing{' '}
                <span className="font-semibold text-gray-900">
                  {users_list.length}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-gray-900">
                  {total_users_count}
                </span>{' '}
                users
              </p>
            </div>
          </div>

          {/* Users List */}
          {users_loading ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Loading users...</p>
              </div>
            </div>
          ) : users_error ? (
            <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Failed to load users
                </h3>
                <p className="text-gray-600">
                  Please try refreshing the page
                </p>
              </div>
            </div>
          ) : users_list.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                  <svg
                    className="h-8 w-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your filters or create a new user
                </p>
                <button
                  onClick={open_create_modal}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create User
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Last Login
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users_list.map((user) => (
                      <tr
                        key={user.user_id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.first_name[0]}
                                {user.last_name[0]}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {user.user_id.slice(0, 12)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.phone_number}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${get_user_type_badge_color(
                              user.user_type
                            )}`}
                          >
                            {user.user_type.charAt(0).toUpperCase() +
                              user.user_type.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${get_status_badge_color(
                              user.account_status
                            )}`}
                          >
                            {user.account_status.charAt(0).toUpperCase() +
                              user.account_status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {format_date(user.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.last_login_at
                            ? format_date(user.last_login_at)
                            : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => open_edit_modal(user)}
                              className="text-blue-600 hover:text-blue-900 font-medium transition-colors"
                            >
                              Edit
                            </button>
                            {user.account_status === 'active' && (
                              <button
                                onClick={() =>
                                  handle_deactivate_user(user.user_id)
                                }
                                className="text-red-600 hover:text-red-900 font-medium transition-colors"
                                disabled={current_user?.user_id === user.user_id}
                              >
                                Deactivate
                              </button>
                            )}
                            <button
                              onClick={() => handle_password_reset(user.user_id)}
                              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                            >
                              Reset Password
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Create/Edit User Modal */}
        {user_form_modal_open && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() => set_user_form_modal_open(false)}
              ></div>

              {/* Modal panel */}
              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {user_form_mode === 'create'
                        ? 'Create New User'
                        : 'Edit User'}
                    </h3>
                    <button
                      onClick={() => set_user_form_modal_open(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={user_form_data.email}
                        onChange={(e) => {
                          set_user_form_data((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }));
                          set_user_form_errors((prev) => ({
                            ...prev,
                            email: '',
                          }));
                        }}
                        className={`w-full px-4 py-3 rounded-lg border-2 ${
                          user_form_errors.email
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500'
                        } focus:ring-4 focus:ring-blue-100 transition-all`}
                        placeholder="user@example.com"
                      />
                      {user_form_errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {user_form_errors.email}
                        </p>
                      )}
                    </div>

                    {/* Password (create mode only) */}
                    {user_form_mode === 'create' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={user_form_data.password}
                          onChange={(e) => {
                            set_user_form_data((prev) => ({
                              ...prev,
                              password: e.target.value,
                            }));
                            set_user_form_errors((prev) => ({
                              ...prev,
                              password: '',
                            }));
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 ${
                            user_form_errors.password
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-blue-500'
                          } focus:ring-4 focus:ring-blue-100 transition-all`}
                          placeholder="Minimum 8 characters"
                        />
                        {user_form_errors.password && (
                          <p className="mt-1 text-sm text-red-600">
                            {user_form_errors.password}
                          </p>
                        )}
                      </div>
                    )}

                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={user_form_data.first_name}
                          onChange={(e) => {
                            set_user_form_data((prev) => ({
                              ...prev,
                              first_name: e.target.value,
                            }));
                            set_user_form_errors((prev) => ({
                              ...prev,
                              first_name: '',
                            }));
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 ${
                            user_form_errors.first_name
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-blue-500'
                          } focus:ring-4 focus:ring-blue-100 transition-all`}
                        />
                        {user_form_errors.first_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {user_form_errors.first_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={user_form_data.last_name}
                          onChange={(e) => {
                            set_user_form_data((prev) => ({
                              ...prev,
                              last_name: e.target.value,
                            }));
                            set_user_form_errors((prev) => ({
                              ...prev,
                              last_name: '',
                            }));
                          }}
                          className={`w-full px-4 py-3 rounded-lg border-2 ${
                            user_form_errors.last_name
                              ? 'border-red-300 focus:border-red-500'
                              : 'border-gray-200 focus:border-blue-500'
                          } focus:ring-4 focus:ring-blue-100 transition-all`}
                        />
                        {user_form_errors.last_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {user_form_errors.last_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={user_form_data.phone_number}
                        onChange={(e) => {
                          set_user_form_data((prev) => ({
                            ...prev,
                            phone_number: e.target.value,
                          }));
                          set_user_form_errors((prev) => ({
                            ...prev,
                            phone_number: '',
                          }));
                        }}
                        className={`w-full px-4 py-3 rounded-lg border-2 ${
                          user_form_errors.phone_number
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-200 focus:border-blue-500'
                        } focus:ring-4 focus:ring-blue-100 transition-all`}
                        placeholder="+353 1 234 5678"
                      />
                      {user_form_errors.phone_number && (
                        <p className="mt-1 text-sm text-red-600">
                          {user_form_errors.phone_number}
                        </p>
                      )}
                    </div>

                    {/* User Type & Account Status */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          User Type *
                        </label>
                        <select
                          value={user_form_data.user_type}
                          onChange={(e) =>
                            set_user_form_data((prev) => ({
                              ...prev,
                              user_type: e.target.value as any,
                            }))
                          }
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>

                      {user_form_mode === 'edit' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Status *
                          </label>
                          <select
                            value={user_form_data.account_status}
                            onChange={(e) =>
                              set_user_form_data((prev) => ({
                                ...prev,
                                account_status: e.target.value as any,
                              }))
                            }
                            className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                          >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="deleted">Deleted</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Marketing Opt-in */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={user_form_data.marketing_opt_in}
                        onChange={(e) =>
                          set_user_form_data((prev) => ({
                            ...prev,
                            marketing_opt_in: e.target.checked,
                          }))
                        }
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-3 text-sm text-gray-700">
                        Opted in to marketing communications
                      </label>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    onClick={() => set_user_form_modal_open(false)}
                    className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handle_save_user}
                    disabled={
                      create_user_mutation.isPending ||
                      update_user_mutation.isPending
                    }
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
                  >
                    {(create_user_mutation.isPending ||
                      update_user_mutation.isPending) && (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    {user_form_mode === 'create' ? 'Create User' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Deactivate User Modal */}
        {deactivate_user_modal.open && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() =>
                  set_deactivate_user_modal({ open: false, user_id: null })
                }
              ></div>

              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Deactivate User Account
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          Are you sure you want to deactivate this user account?
                          This action will suspend their access to the system.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    onClick={() =>
                      set_deactivate_user_modal({ open: false, user_id: null })
                    }
                    className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirm_deactivate_user}
                    disabled={deactivate_user_mutation.isPending}
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 inline-flex items-center"
                  >
                    {deactivate_user_mutation.isPending && (
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    )}
                    Deactivate Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {password_reset_modal.open && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={() =>
                  set_password_reset_modal({ open: false, user_id: null })
                }
              ></div>

              <div className="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-6 pt-6 pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <svg
                        className="h-6 w-6 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                        />
                      </svg>
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Reset User Password
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          A password reset link will be sent to the user's email
                          address.
                        </p>
                        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                          <p className="text-xs text-yellow-800">
                            <strong>Note:</strong> Backend endpoint for
                            admin-initiated password reset is not yet implemented.
                            This is a UI demonstration.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    onClick={() =>
                      set_password_reset_modal({ open: false, user_id: null })
                    }
                    className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirm_password_reset}
                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Send Reset Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UV_AdminUsers;