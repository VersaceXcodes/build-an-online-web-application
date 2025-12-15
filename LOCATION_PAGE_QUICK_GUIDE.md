# Location Page Updates - Quick Reference Guide

## What Changed? 🎨

### 1. Hero Colors Match Landing Page ✅
- **Location pages** now use the same cream background and chocolate text as the landing page
- **Consistent branding** across all pages with caramel accent colors
- **Better UX** - no more jarring color transitions between pages

### 2. All Location Details Are Editable ✅
- **Addresses** - Full Irish addresses with country field
- **Contact Info** - Phone numbers and emails
- **Opening Hours** - Per-day schedule with open/closed toggle
- **No Code Changes** - Everything editable from Admin panel

---

## For Admins: How to Edit Location Details 👩‍💼

### Accessing Location Management
1. Log in to Admin panel
2. Navigate to **Location Management**
3. Click **Edit** on any location (Blanchardstown, Tallaght, or Glasnevin)

### Editing Address & Contact Details
**Tab: Location Details**

Fields you can edit:
- Location Name
- Slug (URL path)
- Address Line 1 *(required)*
- Address Line 2 *(optional)*
- City *(required)*
- Postal Code *(required)*
- **Country** *(new field - required)*
- Phone *(required)*
- Email *(required)*
- Collection/Delivery toggles
- Active status

Click **Save Changes** when done.

### Editing Opening Hours
**Tab: Opening Hours**

For each day (Sunday-Saturday):
1. **Check "Closed"** if the location is closed that day
2. **Uncheck "Closed"** to set opening hours:
   - Set **Opens At** time (e.g., 09:00)
   - Set **Closes At** time (e.g., 18:00)

Click **Save Hours** when done.

**💡 Tip:** Changes appear immediately on the public location pages!

---

## For Developers: Technical Overview 💻

### Files Changed

**Frontend:**
- `UV_LocationInternal.tsx` - Hero colors, opening hours display
- `UV_LocationExternal.tsx` - Hero colors, opening hours display
- `UV_AdminLocations.tsx` - Added country field
- `UV_Landing.tsx` - Interface updated

**Backend:**
- `schema.ts` - Added country field to location schemas
- Migration 003 - Adds country field to database
- Migration 004 - Seeds proper location data

### Database Migrations
```bash
cd /app/backend
npm install
node run-location-details-migration.mjs
```

### Opening Hours Structure
```typescript
{
  day_of_week: number,  // 0=Sunday, 6=Saturday
  opens_at: string,     // "09:00" format
  closes_at: string,    // "18:00" format
  is_closed: boolean    // true if closed that day
}
```

### API Endpoints
- `GET /api/locations/slug/:slug` - Get location with structured hours
- `GET /api/locations/:id/opening-hours` - Get opening hours
- `PUT /api/locations/:id` - Update location details (admin)
- `PUT /api/locations/:id/opening-hours` - Update hours (admin)

---

## Current Location Data 📍

### Blanchardstown
- **Address:** Unit 12, Blanchardstown Shopping Centre, Blanchardstown, Dublin 15, D15 X20F, Ireland
- **Phone:** +353 1 820 3456
- **Email:** blanchardstown@kake.ie
- **Hours:** Mon-Sat 9:00-18:00, Sun Closed

### Tallaght
- **Address:** Unit 45, The Square Shopping Centre, Tallaght, Dublin 24, D24 FP89, Ireland
- **Phone:** +353 1 462 8970
- **Email:** tallaght@kake.ie
- **Hours:** Mon-Sat 9:00-19:00, Sun 11:00-17:00

### Glasnevin
- **Address:** 156 Botanic Road, Glasnevin, Dublin 9, D09 C2R8, Ireland
- **Phone:** +353 1 830 5421
- **Email:** glasnevin@kake.ie
- **Hours:** Tue-Sat 10:00-18:00, Sun-Mon Closed

---

## Testing Checklist ✓

### Visual Tests
- [ ] Visit Blanchardstown page - hero matches landing page
- [ ] Visit Tallaght page - hero matches landing page
- [ ] Visit Glasnevin page - hero matches landing page
- [ ] Check mobile responsive design

### Data Tests
- [ ] All addresses display correctly with country
- [ ] Phone numbers are clickable (tel: links)
- [ ] Emails are clickable (mailto: links)
- [ ] Opening hours show correct times
- [ ] "Today" indicator highlights current day
- [ ] Closed days show "Closed"

### Admin Tests
- [ ] Edit Blanchardstown details - changes appear
- [ ] Edit Tallaght hours - changes appear
- [ ] Edit Glasnevin country - changes appear
- [ ] Try marking a day as closed - displays correctly
- [ ] Validation works (e.g., times required when open)

---

## Troubleshooting 🔧

### Opening Hours Not Showing
**Solution:** Check that opening_hours_structured is being returned from the API:
```bash
curl http://localhost:3000/api/locations/slug/blanchardstown
```

### Country Field Missing in Admin
**Solution:** Run migrations:
```bash
cd /app/backend
node run-location-details-migration.mjs
```

### Hero Colors Not Updating
**Solution:** Clear browser cache and rebuild frontend:
```bash
cd /app/vitereact
npm run build
```

### Changes Not Appearing
**Solution:** 
1. Check browser console for errors
2. Verify API is returning updated data
3. Clear React Query cache (refresh page)

---

## Quick Commands 📝

### Run Migrations
```bash
cd /app/backend && node run-location-details-migration.mjs
```

### Check Database
```bash
# Check locations table
psql $DATABASE_URL -c "SELECT location_name, country, phone_number FROM locations;"

# Check opening hours
psql $DATABASE_URL -c "SELECT * FROM opening_hours WHERE location_id = (SELECT location_id FROM locations WHERE location_name = 'Blanchardstown');"
```

### Rebuild Frontend
```bash
cd /app/vitereact && npm run build
```

### Restart Backend
```bash
cd /app/backend && npm run dev
```

---

## Support & Questions ❓

**For Location Data Issues:**
- Check Admin panel Location Management
- Verify migrations have run successfully
- Check database directly using psql commands above

**For Visual Issues:**
- Verify Tailwind classes are correct
- Check browser console for errors
- Test on different screen sizes

**For Opening Hours Issues:**
- Verify day_of_week values (0-6)
- Check is_closed boolean values
- Ensure times are in HH:MM format

---

**Last Updated:** December 15, 2025  
**Version:** 1.0  
**Status:** ✅ Production Ready
