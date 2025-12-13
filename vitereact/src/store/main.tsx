import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { io, Socket } from 'socket.io-client';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// User Types (from Zod userSchema)
interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  user_type: 'customer' | 'staff' | 'manager' | 'admin';
  account_status: 'active' | 'suspended' | 'deleted';
  marketing_opt_in: boolean;
  loyalty_points_balance: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

// Location Type (from Zod locationSchema)
interface Location {
  location_id: string;
  location_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  phone_number: string;
  email: string;
  is_collection_enabled: boolean;
  is_delivery_enabled: boolean;
  delivery_radius_km: number | null;
  delivery_fee: number | null;
  free_delivery_threshold: number | null;
  estimated_delivery_time_minutes: number | null;
  estimated_preparation_time_minutes: number;
  allow_scheduled_pickups: boolean;
  just_eat_url: string | null;
  deliveroo_url: string | null;
  opening_hours: string; // JSON string
  created_at: string;
  updated_at: string;
}

// Cart Item Type
interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  primary_image_url: string;
  customer_name?: string;
  selected_toppings?: Array<{
    topping_id: string;
    topping_name: string;
    price: number;
  }>;
  selected_sauces?: Array<{
    topping_id: string;
    topping_name: string;
    price: number;
  }>;
}

// Toast Notification Type
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration: number;
  dismissible: boolean;
  action: {
    label: string;
    callback: () => void;
  } | null;
}

// Confirmation Modal Type
interface ConfirmationModal {
  visible: boolean;
  title: string;
  message: string;
  confirm_text: string;
  cancel_text: string;
  on_confirm: (() => void) | null;
  on_cancel: (() => void) | null;
  danger_action: boolean;
}

// System Setting Type
interface SystemSetting {
  setting_id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  setting_group: string;
  updated_at: string;
}

// ============================================================================
// STATE INTERFACES
// ============================================================================

interface AuthenticationState {
  current_user: User | null;
  auth_token: string | null;
  authentication_status: {
    is_authenticated: boolean;
    is_loading: boolean;
  };
  error_message: string | null;
}

interface CartState {
  items: CartItem[];
  selected_location: string | null;
  fulfillment_method: 'collection' | 'delivery' | null;
  totals: {
    subtotal: number;
    delivery_fee: number;
    discount: number;
    tax: number;
    total: number;
  };
  applied_discounts: {
    loyalty_points_used: number;
    promo_code: string | null;
    promo_code_discount: number;
  };
}

interface LocationState {
  current_location: string | null;
  available_locations: Location[];
  location_details: Location | null;
}

interface UIState {
  loading_overlay_visible: boolean;
  loading_message: string;
  cart_panel_open: boolean;
  confirmation_modal: ConfirmationModal | null;
  cookie_consent_given: boolean;
}

interface NotificationState {
  toasts: Toast[];
  session_warning_visible: boolean;
  session_expires_in_seconds: number | null;
  unread_count: number;
}

interface SystemConfigState {
  loyalty_points_per_euro: number;
  points_redemption_rate: number;
  minimum_order_for_delivery: number;
  free_delivery_threshold: number;
  default_preparation_time_minutes: number;
  tax_rate_percentage: number;
  max_failed_login_attempts: number;
  account_lockout_duration_minutes: number;
  password_reset_token_validity_hours: number;
  company_email: string;
  company_phone: string;
  enable_loyalty_program: boolean;
  enable_corporate_orders: boolean;
  loaded: boolean;
}

interface WebSocketState {
  socket: Socket | null;
  is_connected: boolean;
  subscribed_rooms: string[];
}

// ============================================================================
// MAIN STORE INTERFACE
// ============================================================================

interface AppStore {
  // State
  authentication_state: AuthenticationState;
  cart_state: CartState;
  location_state: LocationState;
  ui_state: UIState;
  notification_state: NotificationState;
  system_config_state: SystemConfigState;
  websocket_state: WebSocketState;

  // Authentication Actions
  login_user: (email: string, password: string, remember_me?: boolean) => Promise<void>;
  logout_user: () => Promise<void>;
  register_user: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    marketing_opt_in?: boolean;
  }) => Promise<void>;
  initialize_auth: () => Promise<void>;
  update_user_profile: (data: Partial<User>) => Promise<void>;
  clear_auth_error: () => void;

  // Cart Actions
  add_to_cart: (item: CartItem) => void;
  remove_from_cart: (product_id: string) => void;
  remove_cart_item_by_index: (index: number) => void;
  update_cart_quantity: (product_id: string, quantity: number) => void;
  update_cart_quantity_by_index: (index: number, quantity: number) => void;
  apply_promo_code: (code: string, discount_amount: number) => void;
  remove_promo_code: () => void;
  apply_loyalty_points: (points: number) => void;
  remove_loyalty_points: () => void;
  set_cart_location: (location: string) => void;
  set_fulfillment_method: (method: 'collection' | 'delivery') => void;
  set_delivery_fee: (fee: number) => void;
  calculate_cart_totals: () => void;
  clear_cart: () => void;

  // Location Actions
  set_current_location: (location: string) => void;
  fetch_locations: () => Promise<void>;
  set_location_details: (details: Location | null) => void;

  // UI Actions
  show_loading: (message?: string) => void;
  hide_loading: () => void;
  show_toast: (type: Toast['type'], message: string, duration?: number, action?: Toast['action']) => void;
  dismiss_toast: (id: string) => void;
  show_confirmation: (data: Omit<ConfirmationModal, 'visible'>) => void;
  hide_confirmation: () => void;
  open_cart_panel: () => void;
  close_cart_panel: () => void;
  set_cookie_consent: (given: boolean) => void;

  // Notification Actions
  start_session_countdown: (seconds: number) => void;
  stop_session_countdown: () => void;
  extend_session: () => void;
  set_unread_count: (count: number) => void;

  // System Config Actions
  load_system_settings: () => Promise<void>;

  // WebSocket Actions
  connect_socket: () => void;
  disconnect_socket: () => void;
  join_order_room: (order_id: string) => void;
  leave_order_room: (order_id: string) => void;
  emit_socket_event: (event: string, data: any) => void;
}

// ============================================================================
// ZUSTAND STORE IMPLEMENTATION
// ============================================================================

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => {
      // Axios instance with interceptors
      const api: AxiosInstance = axios.create({
        baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api`,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add auth token to requests
      api.interceptors.request.use((config) => {
        const token = get().authentication_state.auth_token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      });

      // Handle auth errors
      api.interceptors.response.use(
        (response) => response,
        (error: AxiosError<any>) => {
          if (error.response?.status === 401) {
            // Token expired or invalid
            get().logout_user();
            get().show_toast('error', 'Session expired. Please log in again.');
          }
          return Promise.reject(error);
        }
      );

      // Session countdown interval and warning timer
      let session_countdown_interval: NodeJS.Timeout | null = null;
      let session_warning_timeout: NodeJS.Timeout | null = null;

      // Helper function to start session timer
      const startSessionTimer = () => {
        // Clear any existing timers
        if (session_warning_timeout) {
          clearTimeout(session_warning_timeout);
          session_warning_timeout = null;
        }
        if (session_countdown_interval) {
          clearInterval(session_countdown_interval);
          session_countdown_interval = null;
        }

        // Start session expiry warning timer
        // For security and testing: Show warning after 2 minutes of login, with 5 minutes to respond
        const timeUntilWarningMs = 2 * 60 * 1000; // Show warning after 2 minutes
        const warningDurationSeconds = 5 * 60; // 5 minutes countdown
        
        session_warning_timeout = setTimeout(() => {
          // Start the countdown with 5 minutes (300 seconds) remaining
          get().start_session_countdown(warningDurationSeconds);
        }, timeUntilWarningMs);
      };

      return {
        // ====================================================================
        // INITIAL STATE
        // ====================================================================

        authentication_state: {
          current_user: null,
          auth_token: null,
          authentication_status: {
            is_authenticated: false,
            is_loading: true,
          },
          error_message: null,
        },

        cart_state: {
          items: [],
          selected_location: null,
          fulfillment_method: null,
          totals: {
            subtotal: 0,
            delivery_fee: 0,
            discount: 0,
            tax: 0,
            total: 0,
          },
          applied_discounts: {
            loyalty_points_used: 0,
            promo_code: null,
            promo_code_discount: 0,
          },
        },

        location_state: {
          current_location: null,
          available_locations: [],
          location_details: null,
        },

        ui_state: {
          loading_overlay_visible: false,
          loading_message: 'Loading...',
          cart_panel_open: false,
          confirmation_modal: null,
          cookie_consent_given: false,
        },

        notification_state: {
          toasts: [],
          session_warning_visible: false,
          session_expires_in_seconds: null,
          unread_count: 0,
        },

        system_config_state: {
          loyalty_points_per_euro: 10,
          points_redemption_rate: 100,
          minimum_order_for_delivery: 15,
          free_delivery_threshold: 30,
          default_preparation_time_minutes: 20,
          tax_rate_percentage: 20,
          max_failed_login_attempts: 5,
          account_lockout_duration_minutes: 30,
          password_reset_token_validity_hours: 2,
          company_email: 'info@kake.ie',
          company_phone: '+353 1 234 5678',
          enable_loyalty_program: true,
          enable_corporate_orders: true,
          loaded: false,
        },

        websocket_state: {
          socket: null,
          is_connected: false,
          subscribed_rooms: [],
        },

        // ====================================================================
        // AUTHENTICATION ACTIONS
        // ====================================================================

        login_user: async (email: string, password: string, remember_me: boolean = false) => {
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: {
                ...state.authentication_state.authentication_status,
                is_loading: true,
              },
              error_message: null,
            },
          }));

          try {
            const response = await api.post('/auth/login', {
              email,
              password,
              remember_me,
            });

            const { user, token } = response.data;

            set(() => ({
              authentication_state: {
                current_user: user,
                auth_token: token,
                authentication_status: {
                  is_authenticated: true,
                  is_loading: false,
                },
                error_message: null,
              },
            }));

            // Connect WebSocket
            get().connect_socket();

            // Start session timer for existing session
            startSessionTimer();

            // Start session timer
            startSessionTimer();

            // Show success toast
            get().show_toast('success', `Welcome back, ${user.first_name}!`);
          } catch (error: any) {
            const error_message =
              error.response?.data?.message || error.message || 'Login failed';

            set(() => ({
              authentication_state: {
                current_user: null,
                auth_token: null,
                authentication_status: {
                  is_authenticated: false,
                  is_loading: false,
                },
                error_message,
              },
            }));

            get().show_toast('error', error_message);
            throw error;
          }
        },

        logout_user: async () => {
          const token = get().authentication_state.auth_token;

          try {
            if (token) {
              await api.post('/auth/logout');
            }
          } catch (error) {
            console.error('Logout API call failed:', error);
          }

          // Disconnect socket
          get().disconnect_socket();

          // Clear session timers
          if (session_warning_timeout) {
            clearTimeout(session_warning_timeout);
            session_warning_timeout = null;
          }
          get().stop_session_countdown();

          // Clear cart
          get().clear_cart();

          // Clear auth state
          set(() => ({
            authentication_state: {
              current_user: null,
              auth_token: null,
              authentication_status: {
                is_authenticated: false,
                is_loading: false,
              },
              error_message: null,
            },
          }));

          get().show_toast('info', 'Logged out successfully');
        },

        register_user: async (data) => {
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              authentication_status: {
                ...state.authentication_state.authentication_status,
                is_loading: true,
              },
              error_message: null,
            },
          }));

          try {
            const response = await api.post('/auth/register', {
              email: data.email,
              password: data.password,
              first_name: data.first_name,
              last_name: data.last_name,
              phone_number: data.phone_number,
              marketing_opt_in: data.marketing_opt_in || false,
            });

            const { user, token } = response.data;

            set(() => ({
              authentication_state: {
                current_user: user,
                auth_token: token,
                authentication_status: {
                  is_authenticated: true,
                  is_loading: false,
                },
                error_message: null,
              },
            }));

            // Connect WebSocket
            get().connect_socket();

            // Start session timer
            startSessionTimer();

            get().show_toast('success', `Welcome to Kake, ${user.first_name}!`);
          } catch (error: any) {
            const error_message =
              error.response?.data?.message || error.message || 'Registration failed';

            set((state) => ({
              authentication_state: {
                ...state.authentication_state,
                authentication_status: {
                  is_authenticated: false,
                  is_loading: false,
                },
                error_message,
              },
            }));

            get().show_toast('error', error_message);
            throw error;
          }
        },

        initialize_auth: async () => {
          const { authentication_state } = get();
          const token = authentication_state.auth_token;

          if (!token) {
            set((state) => ({
              authentication_state: {
                ...state.authentication_state,
                authentication_status: {
                  ...state.authentication_state.authentication_status,
                  is_loading: false,
                },
              },
            }));
            return;
          }

          try {
            const response = await api.get('/users/me');
            const user = response.data;

            set(() => ({
              authentication_state: {
                current_user: user,
                auth_token: token,
                authentication_status: {
                  is_authenticated: true,
                  is_loading: false,
                },
                error_message: null,
              },
            }));

            // Connect WebSocket
            get().connect_socket();
          } catch {
            // Token invalid, clear auth state
            set(() => ({
              authentication_state: {
                current_user: null,
                auth_token: null,
                authentication_status: {
                  is_authenticated: false,
                  is_loading: false,
                },
                error_message: null,
              },
            }));
          }
        },

        update_user_profile: async (data: Partial<User>) => {
          try {
            const response = await api.put('/users/me', data);
            const updated_user = response.data;

            set((state) => ({
              authentication_state: {
                ...state.authentication_state,
                current_user: updated_user,
              },
            }));

            get().show_toast('success', 'Profile updated successfully');
          } catch (error: any) {
            const error_message =
              error.response?.data?.message || 'Failed to update profile';
            get().show_toast('error', error_message);
            throw error;
          }
        },

        clear_auth_error: () => {
          set((state) => ({
            authentication_state: {
              ...state.authentication_state,
              error_message: null,
            },
          }));
        },

        // ====================================================================
        // CART ACTIONS
        // ====================================================================

        add_to_cart: (item: CartItem) => {
          set((state) => {
            // Check if exact same item exists (same product, customer, and toppings)
            const existing_item = state.cart_state.items.find((i) => {
              const sameProduct = i.product_id === item.product_id;
              const sameCustomer = (i.customer_name || '') === (item.customer_name || '');
              const sameToppings = JSON.stringify(i.selected_toppings || []) === JSON.stringify(item.selected_toppings || []);
              const sameSauces = JSON.stringify(i.selected_sauces || []) === JSON.stringify(item.selected_sauces || []);
              return sameProduct && sameCustomer && sameToppings && sameSauces;
            });

            let new_items: CartItem[];
            if (existing_item) {
              // Update quantity for existing item with same customization
              new_items = state.cart_state.items.map((i) => {
                const sameProduct = i.product_id === item.product_id;
                const sameCustomer = (i.customer_name || '') === (item.customer_name || '');
                const sameToppings = JSON.stringify(i.selected_toppings || []) === JSON.stringify(item.selected_toppings || []);
                const sameSauces = JSON.stringify(i.selected_sauces || []) === JSON.stringify(item.selected_sauces || []);
                
                if (sameProduct && sameCustomer && sameToppings && sameSauces) {
                  return {
                    ...i,
                    quantity: i.quantity + item.quantity,
                    subtotal: i.price * (i.quantity + item.quantity),
                  };
                }
                return i;
              });
            } else {
              // Add new item (different customization)
              new_items = [...state.cart_state.items, item];
            }

            return {
              cart_state: {
                ...state.cart_state,
                items: new_items,
              },
            };
          });

          // Recalculate totals
          get().calculate_cart_totals();
          get().show_toast('success', `${item.product_name} added to cart!`);
        },

        remove_from_cart: (product_id: string) => {
          set((state) => ({
            cart_state: {
              ...state.cart_state,
              items: state.cart_state.items.filter((i) => i.product_id !== product_id),
            },
          }));

          get().calculate_cart_totals();
          get().show_toast('info', 'Item removed from cart');
        },

        remove_cart_item_by_index: (index: number) => {
          set((state) => ({
            cart_state: {
              ...state.cart_state,
              items: state.cart_state.items.filter((_, i) => i !== index),
            },
          }));

          get().calculate_cart_totals();
          get().show_toast('info', 'Item removed from cart');
        },

        update_cart_quantity: (product_id: string, quantity: number) => {
          if (quantity < 1) {
            get().remove_from_cart(product_id);
            return;
          }

          set((state) => ({
            cart_state: {
              ...state.cart_state,
              items: state.cart_state.items.map((item) =>
                item.product_id === product_id
                  ? {
                      ...item,
                      quantity,
                      subtotal: item.price * quantity,
                    }
                  : item
              ),
            },
          }));

          get().calculate_cart_totals();
        },

        update_cart_quantity_by_index: (index: number, quantity: number) => {
          if (quantity < 1) {
            get().remove_cart_item_by_index(index);
            return;
          }

          set((state) => ({
            cart_state: {
              ...state.cart_state,
              items: state.cart_state.items.map((item, i) =>
                i === index
                  ? {
                      ...item,
                      quantity,
                      subtotal: item.price * quantity,
                    }
                  : item
              ),
            },
          }));

          get().calculate_cart_totals();
        },

        apply_promo_code: (code: string, discount_amount: number) => {
          console.log('[STORE] Applying promo code:', code, 'with discount:', discount_amount);
          set((state) => ({
            cart_state: {
              ...state.cart_state,
              applied_discounts: {
                ...state.cart_state.applied_discounts,
                promo_code: code,
                promo_code_discount: discount_amount,
              },
            },
          }));
          console.log('[STORE] After setting promo code, calling calculate_cart_totals');
          get().calculate_cart_totals();
          console.log('[STORE] Cart totals after promo:', get().cart_state.totals);
        },

        remove_promo_code: () => {
          set((state) => ({
            cart_state: {
              ...state.cart_state,
              applied_discounts: {
                ...state.cart_state.applied_discounts,
                promo_code: null,
                promo_code_discount: 0,
              },
            },
          }));
          get().calculate_cart_totals();
        },

        apply_loyalty_points: (points: number) => {
          set((state) => ({
            cart_state: {
              ...state.cart_state,
              applied_discounts: {
                ...state.cart_state.applied_discounts,
                loyalty_points_used: points,
              },
            },
          }));

          get().calculate_cart_totals();
        },

        remove_loyalty_points: () => {
          set((state) => ({
            cart_state: {
              ...state.cart_state,
              applied_discounts: {
                ...state.cart_state.applied_discounts,
                loyalty_points_used: 0,
              },
            },
          }));
          get().calculate_cart_totals();
        },

        set_cart_location: (location: string) => {
          set((state) => ({
            cart_state: {
              ...state.cart_state,
              selected_location: location,
            },
          }));
        },

        set_fulfillment_method: (method: 'collection' | 'delivery') => {
          set((state) => ({
            cart_state: {
              ...state.cart_state,
              fulfillment_method: method,
            },
          }));

          // Reset delivery fee if switching to collection
          if (method === 'collection') {
            get().set_delivery_fee(0);
          }
        },

        set_delivery_fee: (fee: number) => {
          set((state) => ({
            cart_state: {
              ...state.cart_state,
              totals: {
                ...state.cart_state.totals,
                delivery_fee: fee,
              },
            },
          }));
          get().calculate_cart_totals();
        },

        calculate_cart_totals: () => {
          const { cart_state, system_config_state } = get();
          const { items, applied_discounts } = cart_state;

          // Calculate subtotal
          const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

          // Calculate loyalty points discount
          const loyalty_discount =
            applied_discounts.loyalty_points_used /
            system_config_state.points_redemption_rate;

          // Calculate promo code discount
          const promo_discount = applied_discounts.promo_code_discount || 0;

          console.log('[CALCULATE_TOTALS] Subtotal:', subtotal);
          console.log('[CALCULATE_TOTALS] Loyalty discount:', loyalty_discount);
          console.log('[CALCULATE_TOTALS] Promo discount:', promo_discount);
          console.log('[CALCULATE_TOTALS] Applied discounts:', applied_discounts);

          // Total discount (loyalty + promo code)
          const total_discount = loyalty_discount + promo_discount;

          // Calculate tax on subtotal (before discounts and delivery)
          const tax_rate = system_config_state.tax_rate_percentage / 100;
          const tax = subtotal * tax_rate;

          // Calculate total
          const current_delivery_fee = cart_state.totals.delivery_fee;
          const total = Math.max(
            0,
            subtotal + current_delivery_fee + tax - total_discount
          );

          console.log('[CALCULATE_TOTALS] Total discount:', total_discount);
          console.log('[CALCULATE_TOTALS] Tax (20% of subtotal):', tax);
          console.log('[CALCULATE_TOTALS] Delivery fee:', current_delivery_fee);
          console.log('[CALCULATE_TOTALS] Final total:', total);

          set((state) => ({
            cart_state: {
              ...state.cart_state,
              totals: {
                ...state.cart_state.totals,
                subtotal,
                discount: total_discount,
                tax,
                total,
              },
            },
          }));
        },

        clear_cart: () => {
          set((state) => ({
            cart_state: {
              items: [],
              selected_location: state.cart_state.selected_location, // Preserve selected location
              fulfillment_method: null,
              totals: {
                subtotal: 0,
                delivery_fee: 0,
                discount: 0,
                tax: 0,
                total: 0,
              },
              applied_discounts: {
                loyalty_points_used: 0,
                promo_code: null,
                promo_code_discount: 0,
              },
            },
          }));
        },

        // ====================================================================
        // LOCATION ACTIONS
        // ====================================================================

        set_current_location: (location: string) => {
          set((state) => ({
            location_state: {
              ...state.location_state,
              current_location: location,
            },
          }));
        },

        fetch_locations: async () => {
          try {
            const response = await api.get('/locations');
            const locations = response.data;

            set((state) => ({
              location_state: {
                ...state.location_state,
                available_locations: Array.isArray(locations) ? locations : [],
              },
            }));
          } catch (error: any) {
            console.error('Failed to fetch locations:', error);
            // Don't show error toast for public endpoints
            // get().show_toast('error', 'Failed to load locations');
          }
        },

        set_location_details: (details: Location | null) => {
          set((state) => ({
            location_state: {
              ...state.location_state,
              location_details: details,
            },
          }));
        },

        // ====================================================================
        // UI ACTIONS
        // ====================================================================

        show_loading: (message: string = 'Loading...') => {
          set((state) => ({
            ui_state: {
              ...state.ui_state,
              loading_overlay_visible: true,
              loading_message: message,
            },
          }));
        },

        hide_loading: () => {
          set((state) => ({
            ui_state: {
              ...state.ui_state,
              loading_overlay_visible: false,
            },
          }));
        },

        show_toast: (
          type: Toast['type'],
          message: string,
          duration: number = 5000,
          action: Toast['action'] = null
        ) => {
          const id = `toast_${Date.now()}_${Math.random()}`;
          const new_toast: Toast = {
            id,
            type,
            message,
            duration,
            dismissible: true,
            action,
          };

          set((state) => ({
            notification_state: {
              ...state.notification_state,
              toasts: [...state.notification_state.toasts, new_toast],
            },
          }));

          // Note: Auto-dismiss is now handled in GV_NotificationToast component
          // to properly respect hover state and provide better user control
        },

        dismiss_toast: (id: string) => {
          set((state) => ({
            notification_state: {
              ...state.notification_state,
              toasts: state.notification_state.toasts.filter((t) => t.id !== id),
            },
          }));
        },

        show_confirmation: (data: Omit<ConfirmationModal, 'visible'>) => {
          set((state) => ({
            ui_state: {
              ...state.ui_state,
              confirmation_modal: {
                visible: true,
                ...data,
              },
            },
          }));
        },

        hide_confirmation: () => {
          set((state) => ({
            ui_state: {
              ...state.ui_state,
              confirmation_modal: null,
            },
          }));
        },

        open_cart_panel: () => {
          set((state) => ({
            ui_state: {
              ...state.ui_state,
              cart_panel_open: true,
            },
          }));
        },

        close_cart_panel: () => {
          set((state) => ({
            ui_state: {
              ...state.ui_state,
              cart_panel_open: false,
            },
          }));
        },

        set_cookie_consent: (given: boolean) => {
          set((state) => ({
            ui_state: {
              ...state.ui_state,
              cookie_consent_given: given,
            },
          }));
        },

        // ====================================================================
        // NOTIFICATION ACTIONS
        // ====================================================================

        start_session_countdown: (seconds: number) => {
          // Clear existing interval
          if (session_countdown_interval) {
            clearInterval(session_countdown_interval);
          }

          set((state) => ({
            notification_state: {
              ...state.notification_state,
              session_warning_visible: true,
              session_expires_in_seconds: seconds,
            },
          }));

          // Start countdown
          session_countdown_interval = setInterval(() => {
            const { notification_state } = get();
            const remaining = notification_state.session_expires_in_seconds;

            if (remaining === null || remaining <= 0) {
              get().stop_session_countdown();
              get().logout_user();
              get().show_toast('warning', 'Session expired. Please log in again.');
              return;
            }

            set((state) => ({
              notification_state: {
                ...state.notification_state,
                session_expires_in_seconds: remaining - 1,
              },
            }));
          }, 1000);
        },

        stop_session_countdown: () => {
          if (session_countdown_interval) {
            clearInterval(session_countdown_interval);
            session_countdown_interval = null;
          }

          set((state) => ({
            notification_state: {
              ...state.notification_state,
              session_warning_visible: false,
              session_expires_in_seconds: null,
            },
          }));
        },

        extend_session: () => {
          // Stop the current countdown
          get().stop_session_countdown();
          
          // Restart the session timer
          startSessionTimer();
          
          // Show confirmation
          get().show_toast('success', 'Session extended successfully');
        },

        set_unread_count: (count: number) => {
          set((state) => ({
            notification_state: {
              ...state.notification_state,
              unread_count: count,
            },
          }));
        },

        // ====================================================================
        // SYSTEM CONFIG ACTIONS
        // ====================================================================

        load_system_settings: async () => {
          try {
            // Prevent loading settings if not authenticated for public endpoints
            const token = get().authentication_state.auth_token;
            if (!token) {
              // Use defaults for unauthenticated users
              set((state) => ({
                system_config_state: {
                  ...state.system_config_state,
                  loaded: true,
                },
              }));
              return;
            }
            
            const response = await api.get('/settings');
            const settings: SystemSetting[] = response.data;

            // Parse settings into config object
            const config: any = {
              loaded: true,
            };

            settings.forEach((setting) => {
              let value: any = setting.setting_value;

              // Type conversion
              if (setting.setting_type === 'number') {
                value = parseFloat(value);
              } else if (setting.setting_type === 'boolean') {
                value = value === 'true';
              } else if (setting.setting_type === 'json') {
                try {
                  value = JSON.parse(value);
                } catch {
                  console.error('Failed to parse JSON setting:', setting.setting_key);
                }
              }

              // Map setting keys to state keys
              const key_map: { [key: string]: string } = {
                loyalty_points_per_pound: 'loyalty_points_per_euro',
                // Add other mappings as needed
              };

              const state_key = key_map[setting.setting_key] || setting.setting_key;
              config[state_key] = value;
            });

            set((state) => ({
              system_config_state: {
                ...state.system_config_state,
                ...config,
              },
            }));
          } catch (error) {
            console.error('Failed to load system settings:', error);
            // Use defaults
            set((state) => ({
              system_config_state: {
                ...state.system_config_state,
                loaded: true,
              },
            }));
          }
        },

        // ====================================================================
        // WEBSOCKET ACTIONS
        // ====================================================================

        connect_socket: () => {
          const { authentication_state, websocket_state } = get();
          const token = authentication_state.auth_token;

          // Already connected
          if (websocket_state.socket && websocket_state.is_connected) {
            return;
          }

          // No token, can't connect
          if (!token) {
            return;
          }

          try {
            const socket_url = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            
            const socket = io(socket_url, {
              auth: {
                token,
              },
              transports: ['websocket', 'polling'],
            });

            // Connection events
            socket.on('connect', () => {
              console.log('WebSocket connected');
              set((state) => ({
                websocket_state: {
                  ...state.websocket_state,
                  is_connected: true,
                },
              }));

              // Auto-join user room
              const user = get().authentication_state.current_user;
              if (user) {
                socket.emit('join_order_room', { user_id: user.user_id });
              }

              // Join staff/admin rooms if applicable
              if (user && (user.user_type === 'staff' || user.user_type === 'admin')) {
                socket.emit('join_staff_rooms', {});
              }

              if (user && user.user_type === 'admin') {
                socket.emit('join_admin_dashboard', {});
              }
            });

            socket.on('disconnect', () => {
              console.log('WebSocket disconnected');
              set((state) => ({
                websocket_state: {
                  ...state.websocket_state,
                  is_connected: false,
                  subscribed_rooms: [],
                },
              }));
            });

            socket.on('connect_error', (error) => {
              console.error('WebSocket connection error:', error);
            });

            // Event handlers
            socket.on('order_status_changed', (data) => {
              console.log('Order status changed:', data);
              get().show_toast(
                'info',
                `Order ${data.order_number} status: ${data.new_status}`
              );
            });

            socket.on('new_order', (data) => {
              console.log('New order received:', data);
              if (
                get().authentication_state.current_user?.user_type === 'staff' ||
                get().authentication_state.current_user?.user_type === 'admin'
              ) {
                get().show_toast(
                  'info',
                  `New order ${data.order_number} at ${data.location_name}`
                );
              }
            });

            socket.on('inventory_alert', (data) => {
              console.log('Inventory alert:', data);
              if (get().authentication_state.current_user?.user_type === 'admin') {
                get().show_toast(
                  'warning',
                  `Inventory alert: ${data.item_name} at ${data.location_name}`
                );
              }
            });

            socket.on('feedback_received', (data) => {
              console.log('Feedback received:', data);
              if (get().authentication_state.current_user?.user_type === 'admin') {
                get().show_toast(
                  'warning',
                  `Low rating feedback received for order ${data.order_number}`
                );
              }
            });

            socket.on('staff_feedback_response', (data) => {
              console.log('Staff feedback response:', data);
              get().show_toast(
                'info',
                `Response received for feedback ${data.reference_number}`
              );
            });

            socket.on('analytics_update', (data) => {
              console.log('Analytics updated:', data);
              // Dashboard views will handle this
            });

            set((state) => ({
              websocket_state: {
                ...state.websocket_state,
                socket,
              },
            }));
          } catch (error) {
            console.error('Failed to connect WebSocket:', error);
          }
        },

        disconnect_socket: () => {
          const { websocket_state } = get();
          const socket = websocket_state.socket;

          if (socket) {
            socket.disconnect();
            set(() => ({
              websocket_state: {
                socket: null,
                is_connected: false,
                subscribed_rooms: [],
              },
            }));
          }
        },

        join_order_room: (order_id: string) => {
          const { websocket_state } = get();
          const socket = websocket_state.socket;

          if (socket && socket.connected) {
            socket.emit('join_order_room', { order_id });
            
            set((state) => ({
              websocket_state: {
                ...state.websocket_state,
                subscribed_rooms: [
                  ...state.websocket_state.subscribed_rooms,
                  `order_${order_id}`,
                ],
              },
            }));
          }
        },

        leave_order_room: (order_id: string) => {
          const { websocket_state } = get();
          const socket = websocket_state.socket;

          if (socket && socket.connected) {
            socket.emit('leave_order_room', { order_id });
            
            set((state) => ({
              websocket_state: {
                ...state.websocket_state,
                subscribed_rooms: state.websocket_state.subscribed_rooms.filter(
                  (room) => room !== `order_${order_id}`
                ),
              },
            }));
          }
        },

        emit_socket_event: (event: string, data: any) => {
          const { websocket_state } = get();
          const socket = websocket_state.socket;

          if (socket && socket.connected) {
            socket.emit(event, data);
          }
        },
      };
    },
    {
      name: 'kake-app-storage',
      partialize: (state) => ({
        // Only persist auth state and cart state
        authentication_state: {
          current_user: state.authentication_state.current_user,
          auth_token: state.authentication_state.auth_token,
          authentication_status: {
            is_authenticated: state.authentication_state.authentication_status.is_authenticated,
            is_loading: false, // Never persist loading state
          },
          error_message: null, // Never persist errors
        },
        cart_state: state.cart_state,
        ui_state: {
          loading_overlay_visible: false,
          loading_message: 'Loading...',
          cart_panel_open: false,
          confirmation_modal: null,
          cookie_consent_given: state.ui_state.cookie_consent_given, // Only persist consent
        },
      }),
    }
  )
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  User,
  Location,
  CartItem,
  Toast,
  ConfirmationModal,
  SystemSetting,
  AuthenticationState,
  CartState,
  LocationState,
  UIState,
  NotificationState,
  SystemConfigState,
  WebSocketState,
  AppStore,
};