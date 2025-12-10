# Loading States - Test Verification Guide

## Quick Test Checklist

### ✅ 1. Login Loading State
**Steps:**
1. Navigate to `/login`
2. Enter valid credentials (john.smith@example.com / Password123!)
3. Click "Sign In" button

**Expected:**
- Button shows spinner and "Signing in..." text
- Button is disabled (cannot click again)
- Form fields are disabled
- After successful login, redirects to appropriate dashboard

**Verification:** PASS if spinner visible for duration of API call

---

### ✅ 2. Logout Loading State
**Steps:**
1. Login as any user
2. Click on user avatar/name in top right
3. Click "Logout" in dropdown

**Expected:**
- Global loading overlay appears immediately
- "Logging out..." message displayed
- Semi-transparent backdrop with blur
- Animated spinner in center of screen
- Redirects to home page after completion

**Verification:** PASS if overlay visible during logout process

---

### ✅ 3. Page Navigation Loading (Home → About)
**Steps:**
1. On Home page, click "About" link in navigation

**Expected:**
- Brief loading overlay appears (150ms)
- Smooth fade-out of home page
- Smooth fade-in of about page
- Content loads with proper animations

**Verification:** PASS if transition overlay briefly visible

---

### ✅ 4. Page Navigation Loading (About → Home)
**Steps:**
1. On About page, click "Home" link in navigation

**Expected:**
- Brief loading overlay appears (150ms)
- Smooth transition between pages

**Verification:** PASS if transition overlay briefly visible

---

### ✅ 5. Home Page - Locations Loading
**Steps:**
1. Clear browser cache
2. Navigate to home page
3. Observe locations section

**Expected:**
- Three skeleton cards appear in grid layout
- Each skeleton shows:
  - Image placeholder (gray gradient)
  - Title placeholder bar
  - Description placeholder lines
- Skeletons animate with pulse effect
- Real content replaces skeletons when loaded

**Verification:** PASS if skeletons visible before data loads

---

### ✅ 6. Home Page - Drop of the Month Loading
**Steps:**
1. Clear browser cache
2. Navigate to home page
3. Observe "Corporate & Events" section

**Expected:**
- Two-column skeleton layout appears
- Left side: image placeholder
- Right side: text content placeholders
- Smooth transition to real content

**Verification:** PASS if skeleton visible before data loads

---

### ✅ 7. About Page - Locations Loading
**Steps:**
1. Clear browser cache
2. Navigate to about page
3. Scroll to "Visit Us" section

**Expected:**
- Three location card skeletons appear
- Each shows purple/pink gradient header placeholder
- Content area placeholders below
- Pulse animation active

**Verification:** PASS if skeletons visible before data loads

---

## Browser Testing Commands

### Test with Chrome DevTools Network Throttling
```bash
# Open Chrome DevTools (F12)
# Go to Network tab
# Set throttling to "Slow 3G" or "Fast 3G"
# Perform tests above
```

### Test with React Query Devtools
```bash
# Loading states can be observed in React Query Devtools
# Look for "fetching" status on queries
# Skeleton loaders should appear during this state
```

---

## Accessibility Testing

### Screen Reader Test
**Tool:** NVDA or JAWS
**Expected:** 
- Loading states announced as "Loading..." or specific message
- Status changes announced automatically
- No focus trap during loading

### Keyboard Navigation Test
**Steps:**
1. Tab through navigation during page transition
2. Attempt to interact with disabled elements

**Expected:**
- Focus management maintained
- No interaction with disabled elements
- Clear visual focus indicators

---

## Performance Metrics

### Target Metrics
- Page transition overlay: 150ms duration
- Skeleton display time: Should appear instantly (< 50ms)
- Loading overlay: Should appear within 100ms of action trigger

### Measurement
```javascript
// In browser console
performance.mark('nav-start');
// Navigate
performance.mark('nav-end');
performance.measure('nav-duration', 'nav-start', 'nav-end');
console.log(performance.getEntriesByName('nav-duration')[0].duration);
```

---

## Known Limitations

1. **Very Fast Network:** On very fast connections, loading states may be too brief to observe
   - **Solution:** Use network throttling in DevTools

2. **Cached Data:** React Query caches data, so subsequent loads may not show loading states
   - **Solution:** Clear cache or use "Disable cache" in DevTools

3. **SSR/Pre-rendering:** In production with pre-rendering, initial page load may not show skeletons
   - **Solution:** Test with cache cleared or navigation between pages

---

## Debugging Tips

### Loading Overlay Not Appearing?
1. Check Redux/Zustand store state: `ui_state.loading_overlay_visible`
2. Check console for errors
3. Verify `show_loading()` is being called
4. Verify `hide_loading()` is called in finally block

### Skeleton Loaders Not Showing?
1. Check React Query loading state: `isLoading` or `isFetching`
2. Verify data is not cached
3. Check network tab for pending requests
4. Clear browser cache

### Page Transitions Not Working?
1. Check React Router location changes
2. Verify `isTransitioning` state in App.tsx
3. Check for JavaScript errors in console
4. Verify transition timing (150ms)

---

## Success Criteria

All tests PASS when:
- ✅ Loading indicators appear for ALL async operations
- ✅ Indicators are visually consistent with design system
- ✅ Accessibility requirements met (ARIA labels, announcements)
- ✅ No UI freezing or blocking without feedback
- ✅ Smooth transitions without jarring changes
- ✅ Performance remains acceptable (no lag introduced)

---

## Automated Testing (Future)

```typescript
// Example E2E test with Playwright
test('should show loading indicator during login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.click();
  
  // Should see loading state
  await expect(page.locator('text=Signing in...')).toBeVisible();
  await expect(loginButton).toBeDisabled();
});
```

---

## Rollback Plan

If issues are discovered:

1. **Revert GV_TopNav.tsx** - Removes logout loading
2. **Revert App.tsx** - Removes page transitions
3. **Revert skeleton changes** - Falls back to simple loading states

Files to revert:
- `/app/vitereact/src/components/views/GV_TopNav.tsx`
- `/app/vitereact/src/App.tsx`
- `/app/vitereact/src/components/views/UV_Landing.tsx`
- `/app/vitereact/src/components/views/UV_About.tsx`
