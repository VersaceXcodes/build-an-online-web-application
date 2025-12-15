# Phase 1: Location Management - Quick Start Guide

## Access Admin Location Management

### 1. Start the Application
```bash
# Terminal 1 - Backend
cd /app/backend
npm start

# Terminal 2 - Frontend
cd /app/vitereact
npm run dev
```

### 2. Access Admin Interface
1. Navigate to: `http://localhost:5173/login`
2. Login with admin credentials
3. Go to: `http://localhost:5173/admin/locations`

### 3. Edit a Location
1. Click the edit button on any location card
2. **Location Details Tab:**
   - Update name, address, phone, email
   - Modify slug for URL
   - Toggle collection/delivery options
   - Activate/deactivate location
3. **Opening Hours Tab:**
   - Set hours for each day (Monday-Sunday)
   - Check "Closed" for days the location is closed
   - Times in 24-hour format (e.g., 09:00, 18:00)
4. Click "Save Changes" or "Save Hours"

### 4. View Public Page
Visit any location using its slug:
- `http://localhost:5173/location/blanchardstown`
- `http://localhost:5173/location/tallaght`
- `http://localhost:5173/location/glasnevin`

Changes made in admin will appear on the public page after refresh!

---

## API Endpoints Quick Reference

### Public Endpoints
- `GET /api/locations` - List all active locations
- `GET /api/locations/slug/:slug` - Get location by slug
- `GET /api/locations/:location_id/opening-hours` - Get opening hours

### Admin Endpoints (Require Bearer Token)
- `POST /api/locations` - Create new location
- `PUT /api/locations/:location_id` - Update location
- `DELETE /api/locations/:location_id` - Deactivate location
- `PUT /api/locations/:location_id/opening-hours` - Update opening hours

---

## Common Tasks

### Update Location Phone Number
1. Go to `/admin/locations`
2. Click edit on the location
3. Update phone_number field
4. Click "Save Changes"
5. Refresh public page to see change

### Change Opening Hours
1. Go to `/admin/locations`
2. Click edit on the location
3. Switch to "Opening Hours" tab
4. Modify hours for any day
5. Click "Save Hours"
6. Public page will show new hours

### Make Location Inactive
1. Go to `/admin/locations`
2. Click edit on the location
3. Uncheck "Active" checkbox
4. Click "Save Changes"
5. Location won't appear on public pages

---

## Troubleshooting

**Issue:** Changes not appearing on public page
- **Solution:** Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

**Issue:** Admin page shows "Unauthorized"
- **Solution:** Ensure you're logged in as admin user (user_type='admin')

**Issue:** Slug validation error
- **Solution:** Each location must have unique slug. Try different slug.

**Issue:** Opening hours validation error
- **Solution:** When day is not closed, both opens_at and closes_at are required

---

## Files Modified in Phase 1

**Backend:**
- `/app/backend/server.ts` - New API endpoints
- `/app/backend/migrations/001_*.sql` - Database schema
- `/app/backend/migrations/002_*.sql` - Seed data

**Frontend:**
- `/app/vitereact/src/components/views/UV_AdminLocations.tsx` - NEW admin UI
- `/app/vitereact/src/components/views/UV_LocationInternal.tsx` - Updated public page
- `/app/vitereact/src/App.tsx` - Added route

---

## Next Steps: Phase 2

Phase 2 will update the visual theme of the location page to match the landing page:
- Replace blue hero with warm cream/brown palette
- Unify button styles with orange accent
- Match typography and spacing to landing page
