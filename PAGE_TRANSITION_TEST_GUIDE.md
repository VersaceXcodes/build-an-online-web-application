# Page Transition Animation - Testing Guide

## Quick Test Commands

### Start Development Server
```bash
cd /app/vitereact
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

### Build for Production
```bash
cd /app/vitereact
npm run build
npm run preview
```

---

## Test Case 1: Basic Navigation Transition

**Objective**: Verify the logo animation appears on route changes

**Steps**:
1. Open the app in browser
2. Navigate from Home (/) to About (/about)
3. Observe the animation

**Expected Result**:
- ✅ Full-screen cream-colored overlay appears
- ✅ Kake logo animates from header position to center
- ✅ Logo bounces with scale animation (0.9 → 1.05 → 1.0)
- ✅ Subtle vertical "drip wiggle" movement
- ✅ Logo fades out and returns to header
- ✅ New page (About) fades in smoothly
- ✅ Total animation takes ~750ms

---

## Test Case 2: Multiple Route Transitions

**Test Routes**:
- Home (/) → About (/about)
- About → Menu (/location/kake-london/menu)
- Login → Register
- Dashboard navigation (authenticated)

**Expected**: Consistent animation across all routes

---

## Test Case 3: Mobile Responsiveness

**Steps**:
1. Open DevTools (F12)
2. Enable device emulation (iPhone/Android)
3. Navigate between pages

**Expected**:
- Logo centered on all screen sizes
- Smooth 60fps animation
- No horizontal scrollbars

---

## Test Case 4: Reduced Motion Accessibility

**Browser DevTools Method**:
1. Chrome: DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion" → "reduce"
2. Navigate between pages

**Expected**:
- Simple fade transitions only
- No bouncing or wiggle animations
- Shorter duration (~400ms)

---

## Test Case 5: Performance

**Steps**:
1. DevTools → Performance tab
2. Record while navigating 5-10 pages
3. Check timeline

**Expected**:
- Consistent 60fps
- No layout shifts
- No long tasks

---

## Success Criteria

✅ Animation triggers on route changes
✅ ~750ms duration (snappy)
✅ Works on mobile and desktop
✅ Reduced motion fallback works
✅ 60fps performance
✅ No stuck overlays
✅ Clicks blocked during animation
