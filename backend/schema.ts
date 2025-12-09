import { z } from 'zod';

// ============================================
// USERS SCHEMAS
// ============================================

export const userSchema = z.object({
  user_id: z.string(),
  email: z.string(),
  password_hash: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  phone_number: z.string(),
  user_type: z.string(),
  account_status: z.string(),
  marketing_opt_in: z.boolean(),
  loyalty_points_balance: z.number(),
  failed_login_attempts: z.number(),
  locked_until: z.string().nullable(),
  last_login_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createUserInputSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(100),
  first_name: z.string().min(1).max(100),
  last_name: z.string().min(1).max(100),
  phone_number: z.string().min(10).max(20),
  user_type: z.enum(['customer', 'staff', 'manager', 'admin']).default('customer'),
  marketing_opt_in: z.boolean().default(false)
});

export const updateUserInputSchema = z.object({
  user_id: z.string(),
  email: z.string().email().max(255).optional(),
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  phone_number: z.string().min(10).max(20).optional(),
  user_type: z.enum(['customer', 'staff', 'manager', 'admin']).optional(),
  account_status: z.enum(['active', 'suspended', 'deleted']).optional(),
  marketing_opt_in: z.boolean().optional(),
  loyalty_points_balance: z.number().nonnegative().optional(),
  failed_login_attempts: z.number().int().nonnegative().optional(),
  locked_until: z.string().nullable().optional()
});

export const searchUsersInputSchema = z.object({
  query: z.string().optional(),
  user_type: z.enum(['customer', 'staff', 'manager', 'admin']).optional(),
  account_status: z.enum(['active', 'suspended', 'deleted']).optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'email', 'last_login_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersInputSchema>;

// ============================================
// STAFF ASSIGNMENTS SCHEMAS
// ============================================

export const staffAssignmentSchema = z.object({
  assignment_id: z.string(),
  user_id: z.string(),
  location_name: z.string(),
  assigned_at: z.string()
});

export const createStaffAssignmentInputSchema = z.object({
  user_id: z.string(),
  location_name: z.string().min(1).max(255)
});

export const updateStaffAssignmentInputSchema = z.object({
  assignment_id: z.string(),
  location_name: z.string().min(1).max(255).optional()
});

export const searchStaffAssignmentsInputSchema = z.object({
  user_id: z.string().optional(),
  location_name: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0)
});

export type StaffAssignment = z.infer<typeof staffAssignmentSchema>;
export type CreateStaffAssignmentInput = z.infer<typeof createStaffAssignmentInputSchema>;
export type UpdateStaffAssignmentInput = z.infer<typeof updateStaffAssignmentInputSchema>;
export type SearchStaffAssignmentsInput = z.infer<typeof searchStaffAssignmentsInputSchema>;

// ============================================
// LOCATIONS SCHEMAS
// ============================================

export const locationSchema = z.object({
  location_id: z.string(),
  location_name: z.string(),
  address_line1: z.string(),
  address_line2: z.string().nullable(),
  city: z.string(),
  postal_code: z.string(),
  phone_number: z.string(),
  email: z.string(),
  is_collection_enabled: z.boolean(),
  is_delivery_enabled: z.boolean(),
  delivery_radius_km: z.number().nullable(),
  delivery_fee: z.number().nullable(),
  free_delivery_threshold: z.number().nullable(),
  estimated_delivery_time_minutes: z.number().nullable(),
  estimated_preparation_time_minutes: z.number(),
  allow_scheduled_pickups: z.boolean(),
  just_eat_url: z.string().nullable(),
  deliveroo_url: z.string().nullable(),
  opening_hours: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createLocationInputSchema = z.object({
  location_name: z.string().min(1).max(255),
  address_line1: z.string().min(1).max(255),
  address_line2: z.string().max(255).nullable(),
  city: z.string().min(1).max(100),
  postal_code: z.string().min(1).max(20),
  phone_number: z.string().min(10).max(20),
  email: z.string().email().max(255),
  is_collection_enabled: z.boolean().default(true),
  is_delivery_enabled: z.boolean().default(true),
  delivery_radius_km: z.number().positive().nullable(),
  delivery_fee: z.number().nonnegative().nullable(),
  free_delivery_threshold: z.number().positive().nullable(),
  estimated_delivery_time_minutes: z.number().int().positive().nullable(),
  estimated_preparation_time_minutes: z.number().int().positive().default(20),
  allow_scheduled_pickups: z.boolean().default(true),
  just_eat_url: z.string().url().nullable(),
  deliveroo_url: z.string().url().nullable(),
  opening_hours: z.string().min(1)
});

export const updateLocationInputSchema = z.object({
  location_id: z.string(),
  location_name: z.string().min(1).max(255).optional(),
  address_line1: z.string().min(1).max(255).optional(),
  address_line2: z.string().max(255).nullable().optional(),
  city: z.string().min(1).max(100).optional(),
  postal_code: z.string().min(1).max(20).optional(),
  phone_number: z.string().min(10).max(20).optional(),
  email: z.string().email().max(255).optional(),
  is_collection_enabled: z.boolean().optional(),
  is_delivery_enabled: z.boolean().optional(),
  delivery_radius_km: z.number().positive().nullable().optional(),
  delivery_fee: z.number().nonnegative().nullable().optional(),
  free_delivery_threshold: z.number().positive().nullable().optional(),
  estimated_delivery_time_minutes: z.number().int().positive().nullable().optional(),
  estimated_preparation_time_minutes: z.number().int().positive().optional(),
  allow_scheduled_pickups: z.boolean().optional(),
  just_eat_url: z.string().url().nullable().optional(),
  deliveroo_url: z.string().url().nullable().optional(),
  opening_hours: z.string().min(1).optional()
});

export const searchLocationsInputSchema = z.object({
  query: z.string().optional(),
  is_collection_enabled: z.boolean().optional(),
  is_delivery_enabled: z.boolean().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type Location = z.infer<typeof locationSchema>;
export type CreateLocationInput = z.infer<typeof createLocationInputSchema>;
export type UpdateLocationInput = z.infer<typeof updateLocationInputSchema>;
export type SearchLocationsInput = z.infer<typeof searchLocationsInputSchema>;

// ============================================
// PRODUCTS SCHEMAS
// ============================================

export const productSchema = z.object({
  product_id: z.string(),
  product_name: z.string(),
  short_description: z.string(),
  long_description: z.string().nullable(),
  category: z.string(),
  price: z.number(),
  compare_at_price: z.number().nullable(),
  primary_image_url: z.string(),
  additional_images: z.string().nullable(),
  availability_status: z.string(),
  stock_quantity: z.number().nullable(),
  low_stock_threshold: z.number().nullable(),
  dietary_tags: z.string().nullable(),
  custom_tags: z.string().nullable(),
  is_featured: z.boolean(),
  available_for_corporate: z.boolean(),
  available_from_date: z.string().nullable(),
  available_until_date: z.string().nullable(),
  is_archived: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createProductInputSchema = z.object({
  product_name: z.string().min(1).max(255),
  short_description: z.string().min(1).max(500),
  long_description: z.string().max(2000).nullable(),
  category: z.enum(['pastries', 'breads', 'cakes', 'corporate']),
  price: z.number().positive(),
  compare_at_price: z.number().positive().nullable(),
  primary_image_url: z.string().url(),
  additional_images: z.string().nullable(),
  availability_status: z.enum(['in_stock', 'out_of_stock', 'discontinued']).default('in_stock'),
  stock_quantity: z.number().int().nonnegative().nullable(),
  low_stock_threshold: z.number().int().positive().nullable(),
  dietary_tags: z.string().nullable(),
  custom_tags: z.string().nullable(),
  is_featured: z.boolean().default(false),
  available_for_corporate: z.boolean().default(true),
  available_from_date: z.string().nullable(),
  available_until_date: z.string().nullable()
});

export const updateProductInputSchema = z.object({
  product_id: z.string(),
  product_name: z.string().min(1).max(255).optional(),
  short_description: z.string().min(1).max(500).optional(),
  long_description: z.string().max(2000).nullable().optional(),
  category: z.enum(['pastries', 'breads', 'cakes', 'corporate']).optional(),
  price: z.number().positive().optional(),
  compare_at_price: z.number().positive().nullable().optional(),
  primary_image_url: z.string().url().optional(),
  additional_images: z.string().nullable().optional(),
  availability_status: z.enum(['in_stock', 'out_of_stock', 'discontinued']).optional(),
  stock_quantity: z.number().int().nonnegative().nullable().optional(),
  low_stock_threshold: z.number().int().positive().nullable().optional(),
  dietary_tags: z.string().nullable().optional(),
  custom_tags: z.string().nullable().optional(),
  is_featured: z.boolean().optional(),
  available_for_corporate: z.boolean().optional(),
  available_from_date: z.string().nullable().optional(),
  available_until_date: z.string().nullable().optional(),
  is_archived: z.boolean().optional()
});

export const searchProductsInputSchema = z.object({
  query: z.string().optional(),
  category: z.enum(['pastries', 'breads', 'cakes', 'corporate']).optional(),
  availability_status: z.enum(['in_stock', 'out_of_stock', 'discontinued']).optional(),
  is_featured: z.boolean().optional(),
  is_archived: z.boolean().default(false),
  min_price: z.number().positive().optional(),
  max_price: z.number().positive().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['product_name', 'price', 'created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductInputSchema>;
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
export type SearchProductsInput = z.infer<typeof searchProductsInputSchema>;

// ============================================
// PRODUCT LOCATIONS SCHEMAS
// ============================================

export const productLocationSchema = z.object({
  assignment_id: z.string(),
  product_id: z.string(),
  location_name: z.string(),
  assigned_at: z.string()
});

export const createProductLocationInputSchema = z.object({
  product_id: z.string(),
  location_name: z.string().min(1).max(255)
});

export const searchProductLocationsInputSchema = z.object({
  product_id: z.string().optional(),
  location_name: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0)
});

export type ProductLocation = z.infer<typeof productLocationSchema>;
export type CreateProductLocationInput = z.infer<typeof createProductLocationInputSchema>;
export type SearchProductLocationsInput = z.infer<typeof searchProductLocationsInputSchema>;

// ============================================
// ORDERS SCHEMAS
// ============================================

export const orderSchema = z.object({
  order_id: z.string(),
  order_number: z.string(),
  user_id: z.string().nullable(),
  customer_email: z.string(),
  customer_name: z.string(),
  customer_phone: z.string(),
  location_name: z.string(),
  order_type: z.string(),
  fulfillment_method: z.string(),
  order_status: z.string(),
  delivery_address_line1: z.string().nullable(),
  delivery_address_line2: z.string().nullable(),
  delivery_city: z.string().nullable(),
  delivery_postal_code: z.string().nullable(),
  delivery_phone: z.string().nullable(),
  delivery_instructions: z.string().nullable(),
  special_instructions: z.string().nullable(),
  scheduled_for: z.string().nullable(),
  estimated_ready_time: z.string().nullable(),
  subtotal: z.number(),
  delivery_fee: z.number(),
  discount_amount: z.number(),
  tax_amount: z.number(),
  total_amount: z.number(),
  loyalty_points_used: z.number(),
  loyalty_points_earned: z.number(),
  promo_code: z.string().nullable(),
  payment_method: z.string(),
  payment_status: z.string(),
  payment_transaction_id: z.string().nullable(),
  card_last_four: z.string().nullable(),
  event_date: z.string().nullable(),
  guest_count: z.number().nullable(),
  event_type: z.string().nullable(),
  company_name: z.string().nullable(),
  collection_code: z.string().nullable(),
  feedback_submitted: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  completed_at: z.string().nullable()
});

export const createOrderInputSchema = z.object({
  user_id: z.string().nullable(),
  customer_email: z.string().email().max(255),
  customer_name: z.string().min(1).max(255),
  customer_phone: z.string().min(10).max(20),
  location_name: z.string().min(1).max(255),
  order_type: z.enum(['standard', 'corporate', 'celebration']).default('standard'),
  fulfillment_method: z.enum(['delivery', 'collection']),
  delivery_address_line1: z.string().max(255).nullable(),
  delivery_address_line2: z.string().max(255).nullable(),
  delivery_city: z.string().max(100).nullable(),
  delivery_postal_code: z.string().max(20).nullable(),
  delivery_phone: z.string().max(20).nullable(),
  delivery_instructions: z.string().max(500).nullable(),
  special_instructions: z.string().max(500).nullable(),
  scheduled_for: z.string().nullable(),
  event_date: z.string().nullable(),
  guest_count: z.number().int().positive().nullable(),
  event_type: z.string().max(100).nullable(),
  company_name: z.string().max(255).nullable(),
  promo_code: z.string().max(50).nullable(),
  payment_method: z.enum(['card', 'cash', 'online']),
  loyalty_points_used: z.number().int().nonnegative().default(0)
});

export const updateOrderInputSchema = z.object({
  order_id: z.string(),
  order_status: z.enum([
    'pending_payment',
    'payment_confirmed',
    'preparing',
    'ready_for_collection',
    'out_for_delivery',
    'in_progress',
    'completed',
    'cancelled'
  ]).optional(),
  payment_status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  payment_transaction_id: z.string().max(255).nullable().optional(),
  card_last_four: z.string().length(4).nullable().optional(),
  estimated_ready_time: z.string().nullable().optional(),
  collection_code: z.string().max(10).nullable().optional(),
  special_instructions: z.string().max(500).nullable().optional(),
  completed_at: z.string().nullable().optional()
});

export const searchOrdersInputSchema = z.object({
  query: z.string().optional(),
  user_id: z.string().optional(),
  location_name: z.string().optional(),
  order_type: z.enum(['standard', 'corporate', 'celebration']).optional(),
  order_status: z.enum([
    'pending_payment',
    'payment_confirmed',
    'preparing',
    'ready_for_collection',
    'out_for_delivery',
    'in_progress',
    'completed',
    'cancelled'
  ]).optional(),
  fulfillment_method: z.enum(['delivery', 'collection']).optional(),
  payment_status: z.enum(['pending', 'completed', 'failed', 'refunded']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'total_amount', 'order_number']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Order = z.infer<typeof orderSchema>;
export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderInputSchema>;
export type SearchOrdersInput = z.infer<typeof searchOrdersInputSchema>;

// ============================================
// ORDER ITEMS SCHEMAS
// ============================================

export const orderItemSchema = z.object({
  item_id: z.string(),
  order_id: z.string(),
  product_id: z.string(),
  product_name: z.string(),
  price_at_purchase: z.number(),
  quantity: z.number(),
  subtotal: z.number(),
  product_specific_notes: z.string().nullable()
});

export const createOrderItemInputSchema = z.object({
  order_id: z.string(),
  product_id: z.string(),
  product_name: z.string().min(1).max(255),
  price_at_purchase: z.number().positive(),
  quantity: z.number().int().positive(),
  product_specific_notes: z.string().max(500).nullable()
});

export const updateOrderItemInputSchema = z.object({
  item_id: z.string(),
  quantity: z.number().int().positive().optional(),
  product_specific_notes: z.string().max(500).nullable().optional()
});

export type OrderItem = z.infer<typeof orderItemSchema>;
export type CreateOrderItemInput = z.infer<typeof createOrderItemInputSchema>;
export type UpdateOrderItemInput = z.infer<typeof updateOrderItemInputSchema>;

// ============================================
// ORDER STATUS HISTORY SCHEMAS
// ============================================

export const orderStatusHistorySchema = z.object({
  history_id: z.string(),
  order_id: z.string(),
  previous_status: z.string().nullable(),
  new_status: z.string(),
  changed_by_user_id: z.string().nullable(),
  notes: z.string().nullable(),
  changed_at: z.string()
});

export const createOrderStatusHistoryInputSchema = z.object({
  order_id: z.string(),
  previous_status: z.string().max(50).nullable(),
  new_status: z.string().min(1).max(50),
  changed_by_user_id: z.string().nullable(),
  notes: z.string().max(1000).nullable()
});

export type OrderStatusHistory = z.infer<typeof orderStatusHistorySchema>;
export type CreateOrderStatusHistoryInput = z.infer<typeof createOrderStatusHistoryInputSchema>;

// ============================================
// ADDRESSES SCHEMAS
// ============================================

export const addressSchema = z.object({
  address_id: z.string(),
  user_id: z.string(),
  address_label: z.string().nullable(),
  address_line1: z.string(),
  address_line2: z.string().nullable(),
  city: z.string(),
  postal_code: z.string(),
  delivery_phone: z.string().nullable(),
  delivery_instructions: z.string().nullable(),
  is_default: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createAddressInputSchema = z.object({
  user_id: z.string(),
  address_label: z.string().max(100).nullable(),
  address_line1: z.string().min(1).max(255),
  address_line2: z.string().max(255).nullable(),
  city: z.string().min(1).max(100),
  postal_code: z.string().min(1).max(20),
  delivery_phone: z.string().max(20).nullable(),
  delivery_instructions: z.string().max(500).nullable(),
  is_default: z.boolean().default(false)
});

export const updateAddressInputSchema = z.object({
  address_id: z.string(),
  address_label: z.string().max(100).nullable().optional(),
  address_line1: z.string().min(1).max(255).optional(),
  address_line2: z.string().max(255).nullable().optional(),
  city: z.string().min(1).max(100).optional(),
  postal_code: z.string().min(1).max(20).optional(),
  delivery_phone: z.string().max(20).nullable().optional(),
  delivery_instructions: z.string().max(500).nullable().optional(),
  is_default: z.boolean().optional()
});

export const searchAddressesInputSchema = z.object({
  user_id: z.string(),
  is_default: z.boolean().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type Address = z.infer<typeof addressSchema>;
export type CreateAddressInput = z.infer<typeof createAddressInputSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressInputSchema>;
export type SearchAddressesInput = z.infer<typeof searchAddressesInputSchema>;

// ============================================
// LOYALTY POINTS TRANSACTIONS SCHEMAS
// ============================================

export const loyaltyPointsTransactionSchema = z.object({
  transaction_id: z.string(),
  user_id: z.string(),
  transaction_type: z.string(),
  points_change: z.number(),
  balance_after: z.number(),
  order_id: z.string().nullable(),
  description: z.string(),
  created_at: z.string()
});

export const createLoyaltyPointsTransactionInputSchema = z.object({
  user_id: z.string(),
  transaction_type: z.enum(['earned', 'redeemed', 'manual_adjustment', 'expired']),
  points_change: z.number().int(),
  balance_after: z.number().int().nonnegative(),
  order_id: z.string().nullable(),
  description: z.string().min(1).max(500)
});

export const searchLoyaltyPointsTransactionsInputSchema = z.object({
  user_id: z.string(),
  transaction_type: z.enum(['earned', 'redeemed', 'manual_adjustment', 'expired']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type LoyaltyPointsTransaction = z.infer<typeof loyaltyPointsTransactionSchema>;
export type CreateLoyaltyPointsTransactionInput = z.infer<typeof createLoyaltyPointsTransactionInputSchema>;
export type SearchLoyaltyPointsTransactionsInput = z.infer<typeof searchLoyaltyPointsTransactionsInputSchema>;

// ============================================
// CUSTOMER FEEDBACK SCHEMAS
// ============================================

export const customerFeedbackSchema = z.object({
  feedback_id: z.string(),
  order_id: z.string(),
  user_id: z.string().nullable(),
  overall_rating: z.number(),
  product_rating: z.number(),
  fulfillment_rating: z.number(),
  product_comment: z.string().nullable(),
  fulfillment_comment: z.string().nullable(),
  overall_comment: z.string().nullable(),
  quick_tags: z.string().nullable(),
  allow_contact: z.boolean(),
  reviewed_status: z.string(),
  reviewed_by_user_id: z.string().nullable(),
  reviewed_at: z.string().nullable(),
  is_hidden_from_staff: z.boolean(),
  original_feedback_id: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createCustomerFeedbackInputSchema = z.object({
  order_id: z.string(),
  user_id: z.string().nullable(),
  overall_rating: z.number().int().min(1).max(5),
  product_rating: z.number().int().min(1).max(5),
  fulfillment_rating: z.number().int().min(1).max(5),
  product_comment: z.string().max(1000).nullable(),
  fulfillment_comment: z.string().max(1000).nullable(),
  overall_comment: z.string().max(1000).nullable(),
  quick_tags: z.string().nullable(),
  allow_contact: z.boolean().default(false)
});

export const updateCustomerFeedbackInputSchema = z.object({
  feedback_id: z.string(),
  reviewed_status: z.enum(['pending_review', 'reviewed', 'requires_attention']).optional(),
  reviewed_by_user_id: z.string().nullable().optional(),
  is_hidden_from_staff: z.boolean().optional()
});

export const searchCustomerFeedbackInputSchema = z.object({
  order_id: z.string().optional(),
  user_id: z.string().optional(),
  reviewed_status: z.enum(['pending_review', 'reviewed', 'requires_attention']).optional(),
  min_rating: z.number().int().min(1).max(5).optional(),
  max_rating: z.number().int().min(1).max(5).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'overall_rating']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type CustomerFeedback = z.infer<typeof customerFeedbackSchema>;
export type CreateCustomerFeedbackInput = z.infer<typeof createCustomerFeedbackInputSchema>;
export type UpdateCustomerFeedbackInput = z.infer<typeof updateCustomerFeedbackInputSchema>;
export type SearchCustomerFeedbackInput = z.infer<typeof searchCustomerFeedbackInputSchema>;

// ============================================
// FEEDBACK INTERNAL NOTES SCHEMAS
// ============================================

export const feedbackInternalNoteSchema = z.object({
  note_id: z.string(),
  feedback_id: z.string(),
  created_by_user_id: z.string(),
  note_text: z.string(),
  created_at: z.string()
});

export const createFeedbackInternalNoteInputSchema = z.object({
  feedback_id: z.string(),
  created_by_user_id: z.string(),
  note_text: z.string().min(1).max(2000)
});

export type FeedbackInternalNote = z.infer<typeof feedbackInternalNoteSchema>;
export type CreateFeedbackInternalNoteInput = z.infer<typeof createFeedbackInternalNoteInputSchema>;

// ============================================
// STAFF FEEDBACK SCHEMAS
// ============================================

export const staffFeedbackSchema = z.object({
  feedback_id: z.string(),
  reference_number: z.string(),
  submitted_by_user_id: z.string(),
  location_name: z.string(),
  feedback_type: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.string(),
  attachment_urls: z.string().nullable(),
  is_anonymous: z.boolean(),
  status: z.string(),
  assigned_to_user_id: z.string().nullable(),
  resolution_notes: z.string().nullable(),
  resolved_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createStaffFeedbackInputSchema = z.object({
  submitted_by_user_id: z.string(),
  location_name: z.string().min(1).max(255),
  feedback_type: z.enum(['suggestion', 'complaint', 'safety_concern', 'equipment_issue', 'process_improvement']),
  title: z.string().min(1).max(255),
  description: z.string().min(1).max(2000),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  attachment_urls: z.string().nullable(),
  is_anonymous: z.boolean().default(false)
});

export const updateStaffFeedbackInputSchema = z.object({
  feedback_id: z.string(),
  status: z.enum(['pending_review', 'under_review', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assigned_to_user_id: z.string().nullable().optional(),
  resolution_notes: z.string().max(2000).nullable().optional()
});

export const searchStaffFeedbackInputSchema = z.object({
  location_name: z.string().optional(),
  feedback_type: z.enum(['suggestion', 'complaint', 'safety_concern', 'equipment_issue', 'process_improvement']).optional(),
  status: z.enum(['pending_review', 'under_review', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  submitted_by_user_id: z.string().optional(),
  assigned_to_user_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'priority']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type StaffFeedback = z.infer<typeof staffFeedbackSchema>;
export type CreateStaffFeedbackInput = z.infer<typeof createStaffFeedbackInputSchema>;
export type UpdateStaffFeedbackInput = z.infer<typeof updateStaffFeedbackInputSchema>;
export type SearchStaffFeedbackInput = z.infer<typeof searchStaffFeedbackInputSchema>;

// ============================================
// STAFF FEEDBACK RESPONSES SCHEMAS
// ============================================

export const staffFeedbackResponseSchema = z.object({
  response_id: z.string(),
  feedback_id: z.string(),
  responded_by_user_id: z.string(),
  response_text: z.string(),
  is_internal_note: z.boolean(),
  created_at: z.string()
});

export const createStaffFeedbackResponseInputSchema = z.object({
  feedback_id: z.string(),
  responded_by_user_id: z.string(),
  response_text: z.string().min(1).max(2000),
  is_internal_note: z.boolean().default(false)
});

export type StaffFeedbackResponse = z.infer<typeof staffFeedbackResponseSchema>;
export type CreateStaffFeedbackResponseInput = z.infer<typeof createStaffFeedbackResponseInputSchema>;

// ============================================
// INVENTORY ALERTS SCHEMAS
// ============================================

export const inventoryAlertSchema = z.object({
  alert_id: z.string(),
  reference_number: z.string(),
  submitted_by_user_id: z.string(),
  location_name: z.string(),
  item_name: z.string(),
  alert_type: z.string(),
  current_quantity: z.number().nullable(),
  notes: z.string().nullable(),
  priority: z.string(),
  status: z.string(),
  acknowledged_by_user_id: z.string().nullable(),
  acknowledged_at: z.string().nullable(),
  resolution_notes: z.string().nullable(),
  resolved_by_user_id: z.string().nullable(),
  resolved_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createInventoryAlertInputSchema = z.object({
  submitted_by_user_id: z.string(),
  location_name: z.string().min(1).max(255),
  item_name: z.string().min(1).max(255),
  alert_type: z.enum(['low_stock', 'out_of_stock', 'quality_issue', 'expiring_soon']),
  current_quantity: z.number().nonnegative().nullable(),
  notes: z.string().max(1000).nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

export const updateInventoryAlertInputSchema = z.object({
  alert_id: z.string(),
  status: z.enum(['pending', 'acknowledged', 'in_progress', 'resolved']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  acknowledged_by_user_id: z.string().nullable().optional(),
  resolution_notes: z.string().max(1000).nullable().optional(),
  resolved_by_user_id: z.string().nullable().optional()
});

export const searchInventoryAlertsInputSchema = z.object({
  location_name: z.string().optional(),
  alert_type: z.enum(['low_stock', 'out_of_stock', 'quality_issue', 'expiring_soon']).optional(),
  status: z.enum(['pending', 'acknowledged', 'in_progress', 'resolved']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'priority']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type InventoryAlert = z.infer<typeof inventoryAlertSchema>;
export type CreateInventoryAlertInput = z.infer<typeof createInventoryAlertInputSchema>;
export type UpdateInventoryAlertInput = z.infer<typeof updateInventoryAlertInputSchema>;
export type SearchInventoryAlertsInput = z.infer<typeof searchInventoryAlertsInputSchema>;

// ============================================
// TRAINING COURSES SCHEMAS
// ============================================

export const trainingCourseSchema = z.object({
  course_id: z.string(),
  course_title: z.string(),
  short_description: z.string(),
  long_description: z.string().nullable(),
  cover_image_url: z.string(),
  category: z.string(),
  tags: z.string().nullable(),
  status: z.string(),
  is_required: z.boolean(),
  estimated_duration_minutes: z.number().nullable(),
  prerequisite_course_ids: z.string().nullable(),
  created_by_user_id: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createTrainingCourseInputSchema = z.object({
  course_title: z.string().min(1).max(255),
  short_description: z.string().min(1).max(500),
  long_description: z.string().max(2000).nullable(),
  cover_image_url: z.string().url(),
  category: z.enum(['safety', 'customer_service', 'baking', 'equipment', 'management']),
  tags: z.string().nullable(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  is_required: z.boolean().default(false),
  estimated_duration_minutes: z.number().int().positive().nullable(),
  prerequisite_course_ids: z.string().nullable(),
  created_by_user_id: z.string()
});

export const updateTrainingCourseInputSchema = z.object({
  course_id: z.string(),
  course_title: z.string().min(1).max(255).optional(),
  short_description: z.string().min(1).max(500).optional(),
  long_description: z.string().max(2000).nullable().optional(),
  cover_image_url: z.string().url().optional(),
  category: z.enum(['safety', 'customer_service', 'baking', 'equipment', 'management']).optional(),
  tags: z.string().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  is_required: z.boolean().optional(),
  estimated_duration_minutes: z.number().int().positive().nullable().optional(),
  prerequisite_course_ids: z.string().nullable().optional()
});

export const searchTrainingCoursesInputSchema = z.object({
  query: z.string().optional(),
  category: z.enum(['safety', 'customer_service', 'baking', 'equipment', 'management']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  is_required: z.boolean().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'course_title']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type TrainingCourse = z.infer<typeof trainingCourseSchema>;
export type CreateTrainingCourseInput = z.infer<typeof createTrainingCourseInputSchema>;
export type UpdateTrainingCourseInput = z.infer<typeof updateTrainingCourseInputSchema>;
export type SearchTrainingCoursesInput = z.infer<typeof searchTrainingCoursesInputSchema>;

// ============================================
// TRAINING LESSONS SCHEMAS
// ============================================

export const trainingLessonSchema = z.object({
  lesson_id: z.string(),
  course_id: z.string(),
  lesson_title: z.string(),
  lesson_type: z.string(),
  content_url: z.string().nullable(),
  content_text: z.string().nullable(),
  duration_minutes: z.number().nullable(),
  additional_notes: z.string().nullable(),
  lesson_order: z.number(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createTrainingLessonInputSchema = z.object({
  course_id: z.string(),
  lesson_title: z.string().min(1).max(255),
  lesson_type: z.enum(['video', 'document', 'quiz', 'interactive']),
  content_url: z.string().url().nullable(),
  content_text: z.string().max(5000).nullable(),
  duration_minutes: z.number().int().positive().nullable(),
  additional_notes: z.string().max(1000).nullable(),
  lesson_order: z.number().int().positive()
});

export const updateTrainingLessonInputSchema = z.object({
  lesson_id: z.string(),
  lesson_title: z.string().min(1).max(255).optional(),
  lesson_type: z.enum(['video', 'document', 'quiz', 'interactive']).optional(),
  content_url: z.string().url().nullable().optional(),
  content_text: z.string().max(5000).nullable().optional(),
  duration_minutes: z.number().int().positive().nullable().optional(),
  additional_notes: z.string().max(1000).nullable().optional(),
  lesson_order: z.number().int().positive().optional()
});

export type TrainingLesson = z.infer<typeof trainingLessonSchema>;
export type CreateTrainingLessonInput = z.infer<typeof createTrainingLessonInputSchema>;
export type UpdateTrainingLessonInput = z.infer<typeof updateTrainingLessonInputSchema>;

// ============================================
// STAFF COURSE PROGRESS SCHEMAS
// ============================================

export const staffCourseProgressSchema = z.object({
  progress_id: z.string(),
  user_id: z.string(),
  course_id: z.string(),
  status: z.string(),
  progress_percentage: z.number(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  last_accessed_at: z.string().nullable()
});

export const createStaffCourseProgressInputSchema = z.object({
  user_id: z.string(),
  course_id: z.string()
});

export const updateStaffCourseProgressInputSchema = z.object({
  progress_id: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']).optional(),
  progress_percentage: z.number().min(0).max(100).optional(),
  started_at: z.string().nullable().optional(),
  completed_at: z.string().nullable().optional(),
  last_accessed_at: z.string().nullable().optional()
});

export type StaffCourseProgress = z.infer<typeof staffCourseProgressSchema>;
export type CreateStaffCourseProgressInput = z.infer<typeof createStaffCourseProgressInputSchema>;
export type UpdateStaffCourseProgressInput = z.infer<typeof updateStaffCourseProgressInputSchema>;

// ============================================
// STAFF LESSON COMPLETION SCHEMAS
// ============================================

export const staffLessonCompletionSchema = z.object({
  completion_id: z.string(),
  user_id: z.string(),
  lesson_id: z.string(),
  is_completed: z.boolean(),
  personal_notes: z.string().nullable(),
  completed_at: z.string().nullable()
});

export const createStaffLessonCompletionInputSchema = z.object({
  user_id: z.string(),
  lesson_id: z.string(),
  personal_notes: z.string().max(1000).nullable()
});

export const updateStaffLessonCompletionInputSchema = z.object({
  completion_id: z.string(),
  is_completed: z.boolean().optional(),
  personal_notes: z.string().max(1000).nullable().optional(),
  completed_at: z.string().nullable().optional()
});

export type StaffLessonCompletion = z.infer<typeof staffLessonCompletionSchema>;
export type CreateStaffLessonCompletionInput = z.infer<typeof createStaffLessonCompletionInputSchema>;
export type UpdateStaffLessonCompletionInput = z.infer<typeof updateStaffLessonCompletionInputSchema>;

// ============================================
// STAFF LESSON NOTES SCHEMAS
// ============================================

export const staffLessonNoteSchema = z.object({
  note_id: z.string(),
  user_id: z.string(),
  lesson_id: z.string(),
  note_text: z.string(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createStaffLessonNoteInputSchema = z.object({
  user_id: z.string(),
  lesson_id: z.string(),
  note_text: z.string().min(1).max(2000)
});

export const updateStaffLessonNoteInputSchema = z.object({
  note_id: z.string(),
  note_text: z.string().min(1).max(2000)
});

export type StaffLessonNote = z.infer<typeof staffLessonNoteSchema>;
export type CreateStaffLessonNoteInput = z.infer<typeof createStaffLessonNoteInputSchema>;
export type UpdateStaffLessonNoteInput = z.infer<typeof updateStaffLessonNoteInputSchema>;

// ============================================
// PROMO CODES SCHEMAS
// ============================================

export const promoCodeSchema = z.object({
  code_id: z.string(),
  code: z.string(),
  discount_type: z.string(),
  discount_value: z.number(),
  minimum_order_value: z.number().nullable(),
  valid_from: z.string(),
  valid_until: z.string(),
  usage_limit: z.number().nullable(),
  is_single_use: z.boolean(),
  times_used: z.number(),
  applicable_locations: z.string().nullable(),
  applicable_products: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createPromoCodeInputSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  discount_type: z.enum(['percentage', 'fixed', 'delivery']),
  discount_value: z.number().nonnegative(),
  minimum_order_value: z.number().positive().nullable(),
  valid_from: z.string(),
  valid_until: z.string(),
  usage_limit: z.number().int().positive().nullable(),
  is_single_use: z.boolean().default(false),
  applicable_locations: z.string().nullable(),
  applicable_products: z.string().nullable(),
  is_active: z.boolean().default(true)
});

export const updatePromoCodeInputSchema = z.object({
  code_id: z.string(),
  discount_value: z.number().nonnegative().optional(),
  minimum_order_value: z.number().positive().nullable().optional(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
  usage_limit: z.number().int().positive().nullable().optional(),
  is_active: z.boolean().optional()
});

export const searchPromoCodesInputSchema = z.object({
  query: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed', 'delivery']).optional(),
  is_active: z.boolean().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type PromoCode = z.infer<typeof promoCodeSchema>;
export type CreatePromoCodeInput = z.infer<typeof createPromoCodeInputSchema>;
export type UpdatePromoCodeInput = z.infer<typeof updatePromoCodeInputSchema>;
export type SearchPromoCodesInput = z.infer<typeof searchPromoCodesInputSchema>;

// ============================================
// PROMO CODE USAGE SCHEMAS
// ============================================

export const promoCodeUsageSchema = z.object({
  usage_id: z.string(),
  code_id: z.string(),
  order_id: z.string(),
  user_id: z.string().nullable(),
  discount_applied: z.number(),
  used_at: z.string()
});

export const createPromoCodeUsageInputSchema = z.object({
  code_id: z.string(),
  order_id: z.string(),
  user_id: z.string().nullable(),
  discount_applied: z.number().nonnegative()
});

export type PromoCodeUsage = z.infer<typeof promoCodeUsageSchema>;
export type CreatePromoCodeUsageInput = z.infer<typeof createPromoCodeUsageInputSchema>;

// ============================================
// DROP OF THE MONTH SCHEMAS
// ============================================

export const dropOfTheMonthSchema = z.object({
  drop_id: z.string(),
  product_name: z.string(),
  description: z.string(),
  price: z.number(),
  product_image_url: z.string(),
  available_from: z.string(),
  available_until: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createDropOfTheMonthInputSchema = z.object({
  product_name: z.string().min(1).max(255),
  description: z.string().min(1).max(1000),
  price: z.number().positive(),
  product_image_url: z.string().url(),
  available_from: z.string(),
  available_until: z.string(),
  is_active: z.boolean().default(false)
});

export const updateDropOfTheMonthInputSchema = z.object({
  drop_id: z.string(),
  product_name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).max(1000).optional(),
  price: z.number().positive().optional(),
  product_image_url: z.string().url().optional(),
  available_from: z.string().optional(),
  available_until: z.string().optional(),
  is_active: z.boolean().optional()
});

export type DropOfTheMonth = z.infer<typeof dropOfTheMonthSchema>;
export type CreateDropOfTheMonthInput = z.infer<typeof createDropOfTheMonthInputSchema>;
export type UpdateDropOfTheMonthInput = z.infer<typeof updateDropOfTheMonthInputSchema>;

// ============================================
// STALL EVENTS SCHEMAS
// ============================================

export const stallEventSchema = z.object({
  event_id: z.string(),
  event_name: z.string(),
  venue_location: z.string(),
  event_date: z.string(),
  event_time: z.string(),
  description: z.string().nullable(),
  event_image_url: z.string().nullable(),
  cta_button_text: z.string().nullable(),
  cta_button_action: z.string().nullable(),
  cta_button_url: z.string().nullable(),
  is_visible: z.boolean(),
  created_at: z.string(),
  updated_at: z.string()
});

export const createStallEventInputSchema = z.object({
  event_name: z.string().min(1).max(255),
  venue_location: z.string().min(1).max(255),
  event_date: z.string(),
  event_time: z.string().min(1).max(50),
  description: z.string().max(1000).nullable(),
  event_image_url: z.string().url().nullable(),
  cta_button_text: z.string().max(100).nullable(),
  cta_button_action: z.string().max(50).nullable(),
  cta_button_url: z.string().url().nullable(),
  is_visible: z.boolean().default(false)
});

export const updateStallEventInputSchema = z.object({
  event_id: z.string(),
  event_name: z.string().min(1).max(255).optional(),
  venue_location: z.string().min(1).max(255).optional(),
  event_date: z.string().optional(),
  event_time: z.string().min(1).max(50).optional(),
  description: z.string().max(1000).nullable().optional(),
  event_image_url: z.string().url().nullable().optional(),
  cta_button_text: z.string().max(100).nullable().optional(),
  cta_button_action: z.string().max(50).nullable().optional(),
  cta_button_url: z.string().url().nullable().optional(),
  is_visible: z.boolean().optional()
});

export const searchStallEventsInputSchema = z.object({
  is_visible: z.boolean().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0)
});

export type StallEvent = z.infer<typeof stallEventSchema>;
export type CreateStallEventInput = z.infer<typeof createStallEventInputSchema>;
export type UpdateStallEventInput = z.infer<typeof updateStallEventInputSchema>;
export type SearchStallEventsInput = z.infer<typeof searchStallEventsInputSchema>;

// ============================================
// FAVORITES SCHEMAS
// ============================================

export const favoriteSchema = z.object({
  favorite_id: z.string(),
  user_id: z.string(),
  product_id: z.string(),
  created_at: z.string()
});

export const createFavoriteInputSchema = z.object({
  user_id: z.string(),
  product_id: z.string()
});

export const searchFavoritesInputSchema = z.object({
  user_id: z.string(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0)
});

export type Favorite = z.infer<typeof favoriteSchema>;
export type CreateFavoriteInput = z.infer<typeof createFavoriteInputSchema>;
export type SearchFavoritesInput = z.infer<typeof searchFavoritesInputSchema>;

// ============================================
// PASSWORD RESET TOKENS SCHEMAS
// ============================================

export const passwordResetTokenSchema = z.object({
  token_id: z.string(),
  user_id: z.string(),
  token: z.string(),
  expires_at: z.string(),
  is_used: z.boolean(),
  created_at: z.string()
});

export const createPasswordResetTokenInputSchema = z.object({
  user_id: z.string(),
  token: z.string().min(20).max(255),
  expires_at: z.string()
});

export const updatePasswordResetTokenInputSchema = z.object({
  token_id: z.string(),
  is_used: z.boolean()
});

export type PasswordResetToken = z.infer<typeof passwordResetTokenSchema>;
export type CreatePasswordResetTokenInput = z.infer<typeof createPasswordResetTokenInputSchema>;
export type UpdatePasswordResetTokenInput = z.infer<typeof updatePasswordResetTokenInputSchema>;

// ============================================
// SYSTEM SETTINGS SCHEMAS
// ============================================

export const systemSettingSchema = z.object({
  setting_id: z.string(),
  setting_key: z.string(),
  setting_value: z.string(),
  setting_type: z.string(),
  setting_group: z.string(),
  updated_at: z.string()
});

export const createSystemSettingInputSchema = z.object({
  setting_key: z.string().min(1).max(100),
  setting_value: z.string().min(1).max(1000),
  setting_type: z.enum(['string', 'number', 'boolean', 'json']),
  setting_group: z.string().min(1).max(100)
});

export const updateSystemSettingInputSchema = z.object({
  setting_id: z.string(),
  setting_value: z.string().min(1).max(1000)
});

export const searchSystemSettingsInputSchema = z.object({
  setting_group: z.string().optional(),
  setting_type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0)
});

export type SystemSetting = z.infer<typeof systemSettingSchema>;
export type CreateSystemSettingInput = z.infer<typeof createSystemSettingInputSchema>;
export type UpdateSystemSettingInput = z.infer<typeof updateSystemSettingInputSchema>;
export type SearchSystemSettingsInput = z.infer<typeof searchSystemSettingsInputSchema>;

// ============================================
// AUDIT LOGS SCHEMAS
// ============================================

export const auditLogSchema = z.object({
  log_id: z.string(),
  user_id: z.string(),
  action_type: z.string(),
  entity_type: z.string(),
  entity_id: z.string(),
  old_value: z.string().nullable(),
  new_value: z.string().nullable(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string()
});

export const createAuditLogInputSchema = z.object({
  user_id: z.string(),
  action_type: z.enum(['create', 'update', 'delete', 'view']),
  entity_type: z.string().min(1).max(100),
  entity_id: z.string().min(1).max(255),
  old_value: z.string().nullable(),
  new_value: z.string().nullable(),
  ip_address: z.string().max(50).nullable(),
  user_agent: z.string().max(500).nullable()
});

export const searchAuditLogsInputSchema = z.object({
  user_id: z.string().optional(),
  action_type: z.enum(['create', 'update', 'delete', 'view']).optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type AuditLog = z.infer<typeof auditLogSchema>;
export type CreateAuditLogInput = z.infer<typeof createAuditLogInputSchema>;
export type SearchAuditLogsInput = z.infer<typeof searchAuditLogsInputSchema>;

// ============================================
// SESSIONS SCHEMAS
// ============================================

export const sessionSchema = z.object({
  session_id: z.string(),
  user_id: z.string(),
  token: z.string(),
  remember_me: z.boolean(),
  expires_at: z.string(),
  last_activity_at: z.string(),
  ip_address: z.string().nullable(),
  user_agent: z.string().nullable(),
  created_at: z.string()
});

export const createSessionInputSchema = z.object({
  user_id: z.string(),
  token: z.string().min(20).max(255),
  remember_me: z.boolean().default(false),
  expires_at: z.string(),
  ip_address: z.string().max(50).nullable(),
  user_agent: z.string().max(500).nullable()
});

export const updateSessionInputSchema = z.object({
  session_id: z.string(),
  last_activity_at: z.string()
});

export type Session = z.infer<typeof sessionSchema>;
export type CreateSessionInput = z.infer<typeof createSessionInputSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionInputSchema>;

// ============================================
// NOTIFICATIONS SCHEMAS
// ============================================

export const notificationSchema = z.object({
  notification_id: z.string(),
  user_id: z.string(),
  notification_type: z.string(),
  title: z.string(),
  message: z.string(),
  related_entity_type: z.string().nullable(),
  related_entity_id: z.string().nullable(),
  is_read: z.boolean(),
  read_at: z.string().nullable(),
  created_at: z.string()
});

export const createNotificationInputSchema = z.object({
  user_id: z.string(),
  notification_type: z.string().min(1).max(100),
  title: z.string().min(1).max(255),
  message: z.string().min(1).max(1000),
  related_entity_type: z.string().max(100).nullable(),
  related_entity_id: z.string().max(255).nullable()
});

export const updateNotificationInputSchema = z.object({
  notification_id: z.string(),
  is_read: z.boolean(),
  read_at: z.string().nullable().optional()
});

export const searchNotificationsInputSchema = z.object({
  user_id: z.string(),
  notification_type: z.string().optional(),
  is_read: z.boolean().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Notification = z.infer<typeof notificationSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationInputSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationInputSchema>;
export type SearchNotificationsInput = z.infer<typeof searchNotificationsInputSchema>;

// ============================================
// EMAIL LOGS SCHEMAS
// ============================================

export const emailLogSchema = z.object({
  email_id: z.string(),
  recipient_email: z.string(),
  email_type: z.string(),
  subject: z.string(),
  template_used: z.string().nullable(),
  related_order_id: z.string().nullable(),
  status: z.string(),
  sent_at: z.string().nullable(),
  error_message: z.string().nullable(),
  created_at: z.string()
});

export const createEmailLogInputSchema = z.object({
  recipient_email: z.string().email().max(255),
  email_type: z.string().min(1).max(100),
  subject: z.string().min(1).max(255),
  template_used: z.string().max(100).nullable(),
  related_order_id: z.string().nullable()
});

export const updateEmailLogInputSchema = z.object({
  email_id: z.string(),
  status: z.enum(['pending', 'sent', 'failed']),
  sent_at: z.string().nullable().optional(),
  error_message: z.string().max(1000).nullable().optional()
});

export const searchEmailLogsInputSchema = z.object({
  recipient_email: z.string().optional(),
  email_type: z.string().optional(),
  status: z.enum(['pending', 'sent', 'failed']).optional(),
  related_order_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().default(50),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type EmailLog = z.infer<typeof emailLogSchema>;
export type CreateEmailLogInput = z.infer<typeof createEmailLogInputSchema>;
export type UpdateEmailLogInput = z.infer<typeof updateEmailLogInputSchema>;
export type SearchEmailLogsInput = z.infer<typeof searchEmailLogsInputSchema>;

// ============================================
// REFUNDS SCHEMAS
// ============================================

export const refundSchema = z.object({
  refund_id: z.string(),
  order_id: z.string(),
  refund_amount: z.number(),
  refund_type: z.string(),
  refund_reason: z.string(),
  refund_items: z.string().nullable(),
  payment_transaction_id: z.string().nullable(),
  processed_by_user_id: z.string(),
  status: z.string(),
  processed_at: z.string().nullable(),
  created_at: z.string()
});

export const createRefundInputSchema = z.object({
  order_id: z.string(),
  refund_amount: z.number().positive(),
  refund_type: z.enum(['full', 'partial']),
  refund_reason: z.string().min(1).max(1000),
  refund_items: z.string().nullable(),
  payment_transaction_id: z.string().max(255).nullable(),
  processed_by_user_id: z.string()
});

export const updateRefundInputSchema = z.object({
  refund_id: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  processed_at: z.string().nullable().optional()
});

export const searchRefundsInputSchema = z.object({
  order_id: z.string().optional(),
  refund_type: z.enum(['full', 'partial']).optional(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
  processed_by_user_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().default(20),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['created_at', 'refund_amount']).default('created_at'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type Refund = z.infer<typeof refundSchema>;
export type CreateRefundInput = z.infer<typeof createRefundInputSchema>;
export type UpdateRefundInput = z.infer<typeof updateRefundInputSchema>;
export type SearchRefundsInput = z.infer<typeof searchRefundsInputSchema>;

// ============================================
// ANALYTICS SNAPSHOTS SCHEMAS
// ============================================

export const analyticsSnapshotSchema = z.object({
  snapshot_id: z.string(),
  snapshot_date: z.string(),
  snapshot_type: z.string(),
  location_name: z.string().nullable(),
  metrics: z.string(),
  created_at: z.string()
});

export const createAnalyticsSnapshotInputSchema = z.object({
  snapshot_date: z.string(),
  snapshot_type: z.enum(['daily_sales', 'inventory', 'customer_satisfaction', 'staff_training']),
  location_name: z.string().max(255).nullable(),
  metrics: z.string().min(1)
});

export const searchAnalyticsSnapshotsInputSchema = z.object({
  snapshot_type: z.enum(['daily_sales', 'inventory', 'customer_satisfaction', 'staff_training']).optional(),
  location_name: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  limit: z.number().int().positive().default(100),
  offset: z.number().int().nonnegative().default(0),
  sort_by: z.enum(['snapshot_date']).default('snapshot_date'),
  sort_order: z.enum(['asc', 'desc']).default('desc')
});

export type AnalyticsSnapshot = z.infer<typeof analyticsSnapshotSchema>;
export type CreateAnalyticsSnapshotInput = z.infer<typeof createAnalyticsSnapshotInputSchema>;
export type SearchAnalyticsSnapshotsInput = z.infer<typeof searchAnalyticsSnapshotsInputSchema>;