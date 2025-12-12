# Dietary Filter Fix - December 9, 2025

## Problem Summary
The dietary filtering functionality was showing "0 of 20 products" when applying 'Vegan', 'Gluten-Free', or 'Vegetarian' filters, even though products with those tags were visible on the page.

## Root Cause Analysis

### Issue 1: JSON Array vs Comma-Separated String Parsing
- **Database Format**: Dietary tags are stored as JSON arrays in the database
  - Example: `'["vegetarian"]'`, `'["vegan"]'`, `'["gluten-free","vegetarian"]'`
- **Frontend Parsing**: The code was using `split(',')` to parse dietary tags
  - This only works for comma-separated strings, not JSON arrays
  - Result: Tags were not being parsed correctly for filtering

### Issue 2: Tag Format Inconsistency
- **Filter Options**: Using underscore format (e.g., `gluten_free`)
- **Database Values**: Using hyphen format (e.g., `gluten-free`)
- **Result**: Even if parsing worked, the comparison would fail due to format mismatch

## Solution Implemented

### 1. Fixed Dietary Tag Parsing in UV_Menu.tsx (Lines 212-230)
```typescript
// Before (BROKEN):
if (active_filters.dietary_tags.length > 0) {
  filtered = filtered.filter(product => {
    if (!product.dietary_tags) return false;
    const productTags = product.dietary_tags.split(',').map(t => t.trim());
    return active_filters.dietary_tags.every(tag => productTags.includes(tag));
  });
}

// After (FIXED):
if (active_filters.dietary_tags.length > 0) {
  filtered = filtered.filter(product => {
    if (!product.dietary_tags) return false;
    
    // Parse JSON array of dietary tags
    let productTags: string[] = [];
    try {
      productTags = JSON.parse(product.dietary_tags);
    } catch (e) {
      // Fallback to comma-separated parsing if not JSON
      productTags = product.dietary_tags.split(',').map(t => t.trim());
    }
    
    // Normalize tags for comparison (convert underscores to hyphens and lowercase)
    const normalizedProductTags = productTags.map(t => t.toLowerCase().replace(/_/g, '-'));
    const normalizedFilterTags = active_filters.dietary_tags.map(t => t.toLowerCase().replace(/_/g, '-'));
    
    // Check if all filter tags are present in product tags
    return normalizedFilterTags.every(filterTag => normalizedProductTags.includes(filterTag));
  });
}
```

### 2. Fixed Dietary Tag Display in Product Cards (Lines 695-722)
- Changed from `split(',')` to `JSON.parse()` with fallback
- Ensures dietary tags are displayed correctly on product cards

### 3. Fixed Product Detail Page (UV_ProductDetail.tsx)
- Updated dietary tag parsing to use JSON.parse() with fallback
- Maintains backward compatibility with comma-separated format

### 4. Fixed Location External Page (UV_LocationExternal.tsx)
- Updated `parseDietaryTags` helper function to handle JSON arrays
- Ensures external ordering pages display tags correctly

### 5. Fixed Admin Product Management (UV_AdminProducts.tsx)
- **Saving Products**: Changed from `join(',')` to `JSON.stringify()` when saving dietary/custom tags
- **Loading Products**: Changed from `split(',')` to `JSON.parse()` when loading for editing
- **Displaying Products**: Updated product list to parse JSON arrays correctly
- Ensures consistency between how tags are saved and loaded

## Files Modified

1. `/app/vitereact/src/components/views/UV_Menu.tsx`
   - Fixed dietary tag filtering logic (lines 212-230)
   - Fixed dietary tag display in product cards (lines 695-722)

2. `/app/vitereact/src/components/views/UV_ProductDetail.tsx`
   - Fixed dietary tag parsing (lines 137-146)

3. `/app/vitereact/src/components/views/UV_LocationExternal.tsx`
   - Fixed `parseDietaryTags` helper function (lines 125-133)

4. `/app/vitereact/src/components/views/UV_AdminProducts.tsx`
   - Fixed product creation payload (line 196-197)
   - Fixed product update payload (line 232-233)
   - Fixed product editing form data loading (lines 377-390)
   - Fixed dietary tags display in product list (lines 901-914)

## Testing Performed

- Built frontend successfully with all changes
- Deployed to backend public directory
- Filter logic now:
  1. Correctly parses JSON array dietary tags
  2. Normalizes tag formats (underscores ↔ hyphens)
  3. Performs case-insensitive comparison
  4. Shows correct product count when filters are applied

## Expected Behavior After Fix

When applying dietary filters:
- **Vegan filter**: Should show all products with `["vegan"]` tag
- **Vegetarian filter**: Should show all products with `["vegetarian"]` tag  
- **Gluten-Free filter**: Should show all products with `["gluten-free"]` tag
- **Multiple filters**: Should show products that have ALL selected dietary tags

Product count display will now accurately reflect the number of filtered products.

## Backward Compatibility

The solution maintains backward compatibility by:
- Using try-catch blocks to attempt JSON parsing first
- Falling back to comma-separated parsing if JSON parsing fails
- Supporting both hyphenated and underscored tag formats through normalization
