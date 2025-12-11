# Product Visibility Feature Implementation

## Summary
Added the ability for admins to control product visibility - allowing them to hide products from customers without deleting them.

## Changes Made

### 1. Database Schema Updates
**File: `/app/backend/schema.ts`**
- Added `is_visible: z.boolean()` to `productSchema`
- Added `is_visible: z.boolean().default(true)` to `createProductInputSchema`
- Added `is_visible: z.boolean().optional()` to `updateProductInputSchema`

**File: `/app/backend/db.sql`**
- Added `is_visible BOOLEAN NOT NULL DEFAULT true` column to products table definition

**Migration: `/app/backend/add-product-visibility.sql`**
- Created migration script to add the column to existing database
- Successfully applied to production database

### 2. Backend API Updates
**File: `/app/backend/server.ts`**

#### GET /api/products
- Added visibility filter: only shows visible products by default
- Added `show_hidden` query parameter for admins to see all products
- Customer-facing requests see only `is_visible=true` products

#### GET /api/products/:product_id
- Added visibility check on single product fetch
- Respects `show_hidden` query parameter

#### POST /api/products
- Added `is_visible = true` to destructured request body
- Included `is_visible` in INSERT statement

#### PUT /api/products/:product_id
- Added `is_visible` to updatable fields array

#### POST /api/orders (product validation)
- Added `AND is_visible = true` to product availability check
- Prevents customers from ordering hidden products directly

### 3. Admin UI Updates
**File: `/app/vitereact/src/components/views/UV_AdminProducts.tsx`**

#### Type Definitions
- Added `is_visible: boolean` to `Product` interface
- Added `is_visible: boolean` to `ProductFormData` interface

#### State Management
- Added `is_visible: true` to default product form data
- Added visibility to form reset function
- Added visibility to edit modal data loading

#### API Integration
- Added `show_hidden: 'true'` to admin products fetch (line 162)
- Admins can see all products including hidden ones
- Added `is_visible` to create/update product payloads

#### UI Components
- Added "Visible to Customers" checkbox in product form Options section
- Added helpful tooltip explaining the feature
- Added "Hidden" badge on product cards (gray, with EyeOff icon)
- Badges display on product image for easy visual identification

#### Imports
- Added `EyeOff` and `Eye` icons from lucide-react

### 4. Customer-Facing Pages
**Files: `/app/vitereact/src/components/views/UV_Menu.tsx`, `UV_LocationExternal.tsx`, `UV_ProductDetail.tsx`**
- No changes needed - these pages don't pass `show_hidden=true`
- Backend automatically filters to show only visible products
- Hidden products won't appear in menus, searches, or direct URLs

## How It Works

### For Admins
1. Navigate to Admin Dashboard → Products
2. Click "Add New Product" or "Edit" on existing product
3. In the product form, under "Options" section:
   - Check "Visible to Customers" to show the product to customers
   - Uncheck to hide the product from customer view
4. Save the product
5. Hidden products show a "Hidden" badge on the product card
6. Admins can still see and edit hidden products

### For Customers
- Hidden products are completely invisible
- They won't appear in:
  - Menu pages
  - Product searches
  - Product listings
  - Direct product URLs (404 error)
  - Order creation (validation prevents adding hidden products)

## Testing

To test the feature:
1. Log in as admin
2. Create or edit a product
3. Uncheck "Visible to Customers"
4. Save the product
5. Log out and view the menu as a customer
6. Verify the product is not visible
7. Log back in as admin and verify you can still see and edit it

## Files Modified

### Backend
- `/app/backend/schema.ts` - Added visibility field to schemas
- `/app/backend/server.ts` - Added visibility logic to API endpoints
- `/app/backend/db.sql` - Updated table definition
- `/app/backend/add-product-visibility.sql` - Migration script (NEW)

### Frontend
- `/app/vitereact/src/components/views/UV_AdminProducts.tsx` - Added visibility toggle UI

## Database Migration Applied
✓ Column `is_visible` successfully added to products table
✓ All existing products set to visible by default
