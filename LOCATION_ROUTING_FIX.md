# Location Routing Fix

## Problem
Users were getting a persistent "Location Not Found" error when trying to select any location from the landing page and navigate to the location detail page.

## Root Cause
The issue was a **complete mismatch between the hardcoded location slugs in the frontend and the actual location names in the database**:

### Database Locations:
- `London Flagship`
- `Manchester Store`  
- `Birmingham Store`

### Frontend Landing Page (Before Fix):
- `blanchardstown`
- `tallaght`
- `glasnevin`

The frontend was generating URLs like `/location/blanchardstown`, but when the `UV_LocationInternal` component tried to match this against the database locations, it couldn't find any matches because the database had completely different location names.

## Solution

### 1. Updated Landing Page Location Data (`UV_Landing.tsx`)
Changed the hardcoded location data to match the actual database locations:

```typescript
// BEFORE
const location_card_data = [
  { name: 'Blanchardstown', slug: 'blanchardstown', ... },
  { name: 'Tallaght', slug: 'tallaght', ... },
  { name: 'Glasnevin', slug: 'glasnevin', ... },
];

// AFTER
const location_card_data = [
  { name: 'London Flagship', slug: 'london-flagship', ... },
  { name: 'Manchester Store', slug: 'manchester-store', ... },
  { name: 'Birmingham Store', slug: 'birmingham-store', ... },
];
```

Also updated the matching logic to use exact name matching instead of lowercase slug matching.

### 2. Enhanced Location Matching (`UV_LocationInternal.tsx`)
Added a helper function to convert location names to URL slugs and updated the location matching logic:

```typescript
// Helper function to convert location name to URL slug
const nameToSlug = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '-');
};

// Find matching location by comparing URL slug
const location_details = useMemo(() => {
  if (!locations || !location_name) return null;
  return locations.find(
    loc => nameToSlug(loc.location_name) === location_name.toLowerCase()
  ) || null;
}, [locations, location_name]);
```

This ensures that:
- URL: `/location/london-flagship` → matches location name: `London Flagship`
- URL: `/location/manchester-store` → matches location name: `Manchester Store`
- URL: `/location/birmingham-store` → matches location name: `Birmingham Store`

### 3. Fixed Menu Page Location Handling (`UV_Menu.tsx`)
Added location fetching and slug-to-name conversion in the menu component:

```typescript
// Fetch locations to convert slug to name
const { data: locations } = useQuery({
  queryKey: ['locations'],
  queryFn: async () => {
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/api/locations`
    );
    return response.data;
  },
  staleTime: 60000,
});

// Helper to convert slug to location name
const slugToLocationName = (slug: string): string => {
  if (!locations) return slug;
  const location = locations.find((loc: any) => 
    loc.location_name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
  );
  return location ? location.location_name : slug;
};

const location_slug = location_name || 'london-flagship';
const current_location_name = slugToLocationName(location_slug);
```

This ensures the menu page API calls use the correct location name when querying for products.

## Testing
After the fix:
1. Users can now click "Start Ordering" on any location card
2. The location detail page loads correctly showing the location information
3. Users can select collection or delivery method
4. Navigation to the menu page works properly

## URL Structure
The application now uses the following URL structure:
- Landing page: `/`
- Location detail: `/location/london-flagship`, `/location/manchester-store`, `/location/birmingham-store`
- Menu: `/location/london-flagship/menu?fulfillment=collection`
- Product detail: `/location/london-flagship/product/prod_001`

All URLs use kebab-case slugs derived from the actual location names in the database.
