# Page Transition Animation - Test Guide

## Quick Start Testing

### 1. Start the Application
```bash
cd /app/vitereact
npm run dev
```

### 2. Basic Navigation Tests

#### Test 1: Home → About
1. Navigate to the home page (`/`)
2. Click "About" in the navigation
3. **Expected**: 
   - Cream-colored overlay appears
   - Kake logo animates to center with bounce
   - Logo wiggles up and down (drip effect)
   - New page fades in smoothly
   - Total time: ~600ms

#### Test 2: Any Route → Menu
1. From any page
2. Navigate to a menu page (e.g., `/location/london/menu`)
3. **Expected**: Same transition animation

#### Test 3: Multiple Quick Clicks
1. Rapidly click between Home → About → Home
2. **Expected**:
   - No stuck overlays
   - Clean transitions each time
   - No navigation during animation

### 3. Accessibility Tests

#### Test 4: Reduced Motion
1. **macOS**: System Preferences → Accessibility → Display → Reduce motion
2. **Windows**: Settings → Ease of Access → Display → Show animations
3. **Chrome DevTools**: 
   - Press F12
   - Cmd/Ctrl + Shift + P
   - Type "Rendering"
   - Enable "Emulate CSS prefers-reduced-motion"
4. Navigate between pages
5. **Expected**:
   - Simple fade in/out only
   - No bouncing or wiggling
   - Faster transition (~400ms)

### 4. Mobile Tests

#### Test 5: Mobile View
1. Open Chrome DevTools (F12)
2. Toggle device toolbar (Cmd/Ctrl + Shift + M)
3. Select iPhone or Android device
4. Navigate between pages
5. **Expected**:
   - Logo sized appropriately (smaller on mobile)
   - Smooth 60fps animation
   - Touch gestures disabled during transition

#### Test 6: Rapid Tapping
1. While in mobile view
2. Rapidly tap navigation links
3. **Expected**:
   - No double-navigation
   - Clean transitions
   - No UI glitches

### 5. Performance Tests

#### Test 7: Browser Back/Forward
1. Navigate through several pages (Home → About → Menu)
2. Use browser back button
3. Use browser forward button
4. **Expected**: Transition plays for each navigation

#### Test 8: Direct URL Changes
1. Type different URLs in address bar
2. Press Enter
3. **Expected**: Transition plays for each route change

### 6. Cross-Page Tests

Try navigating between these routes:
- `/` → `/about`
- `/about` → `/login`
- `/login` → `/register`
- `/` → `/location/london`
- `/location/london` → `/location/london/menu`
- `/account` → `/favorites` (if logged in)
- `/staff/dashboard` → `/staff/training` (if staff user)

All should show the transition.

---

## Visual Checklist

### ✅ Animation Quality
- [ ] Logo appears sharp and clear
- [ ] Bounce feels natural (not too fast/slow)
- [ ] Drip wiggle is subtle but noticeable
- [ ] Overlay color matches brand (cream/off-white)
- [ ] No flickering or tearing
- [ ] Smooth 60fps throughout

### ✅ Timing
- [ ] Total duration feels snappy (~600ms)
- [ ] Not too fast (readable)
- [ ] Not too slow (doesn't feel laggy)
- [ ] Reduced motion is faster (~400ms)

### ✅ User Experience
- [ ] Navigation disabled during transition
- [ ] Can't double-click links
- [ ] Works with keyboard navigation
- [ ] Works with mouse clicks
- [ ] Works with touch gestures

### ✅ Responsiveness
- [ ] Works on mobile (320px width)
- [ ] Works on tablet (768px width)
- [ ] Works on desktop (1920px width)
- [ ] Logo scales appropriately

---

## Expected Behavior

### Normal Motion (Default)
1. Click navigation link
2. Current page stays visible
3. Cream overlay fades in (150ms)
4. Logo appears at center
5. Logo bounces: small → big → normal size
6. Logo wiggles: up → down → settle
7. Logo shrinks and moves up
8. Overlay fades out
9. New page visible
10. Navigation re-enabled

**Total Time**: ~600ms

### Reduced Motion (Accessibility)
1. Click navigation link
2. Simple fade out (200ms)
3. Static logo appears
4. Simple fade in (200ms)
5. New page visible
6. Navigation re-enabled

**Total Time**: ~400ms

---

## Troubleshooting

### Issue: No transition appears
**Check**: 
- Is the app running?
- Are you navigating between different routes?
- Check browser console for errors

### Issue: Animation stutters
**Check**:
- Close other browser tabs
- Check GPU acceleration is enabled
- Test on different device

### Issue: Logo doesn't appear
**Check**:
- Image path: `/app/vitereact/src/assets/images/kake-dripping-logo.png`
- Image exists and is 53KB
- No 404 errors in Network tab

### Issue: Reduced motion not working
**Check**:
- System preference is actually enabled
- Refresh page after enabling
- Check browser supports `prefers-reduced-motion`

---

## Developer Testing

### Chrome DevTools Performance
1. Open DevTools → Performance tab
2. Start recording
3. Navigate between pages
4. Stop recording
5. **Expected**:
   - Smooth 60fps line
   - No long tasks
   - No layout thrashing
   - Animation uses GPU

### React DevTools
1. Install React DevTools extension
2. Check component tree
3. **Expected**:
   - `GV_PageTransition` wraps content
   - Clean unmount/mount cycles
   - No memory leaks

---

## Browser Compatibility

Test in these browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

All should show smooth transitions.

---

## Success Criteria

✅ Animation plays on every route change
✅ Total duration is 400-700ms
✅ No stuck overlays or frozen states
✅ Reduced motion respected
✅ Mobile performance is smooth
✅ No console errors
✅ Navigation blocked during transition
✅ Logo is sharp and clear
✅ Brand colors match design
✅ Drip wiggle is visible

---

## Quick Visual Test

**30-Second Test**:
1. Open app
2. Click Home → About → Home
3. Check: smooth, branded, no glitches
4. ✅ Pass or ❌ Fail

If it passes, the implementation is working! 🎉

---

## Notes

- The transition uses hardware acceleration for best performance
- Framer Motion handles the animation timing
- Component automatically detects route changes
- No manual configuration needed per page
- Works with React Router navigation hooks

**Happy Testing!** 🚀
