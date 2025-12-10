# Accessibility Alt Text - Testing Guide

## Quick Test Reference

### What Was Fixed
- Removed conflicting `aria-hidden="false"` attribute from hero image
- All images now have proper alt text attributes without conflicts

### URLs to Test
- **Frontend:** https://123build-an-online-web-application.launchpulse.ai
- **Backend:** https://123build-an-online-web-application.launchpulse.ai/api

### Images to Verify

#### 1. Hero Image
- **Location:** Top of landing page
- **Expected Alt Text:** "Decorative background showing artisan desserts"
- **Verification:** Screen reader should announce the alt text
- **DOM Selector:** `img[src*="photo-1486427944299"]`

#### 2. London Location Card
- **Location:** First location card in "Our Locations" section
- **Expected Alt Text:** "London Flagship storefront - Collection and Delivery available"
- **Verification:** Should be announced as a clickable image
- **DOM Selector:** `img[src*="photo-1559056199"]`

#### 3. Manchester Location Card
- **Location:** Second location card in "Our Locations" section
- **Expected Alt Text:** "Manchester Store storefront - Collection and Delivery available"
- **Verification:** Should be announced as a clickable image
- **DOM Selector:** `img[src*="photo-1517433670267"]`

#### 4. Birmingham Location Card
- **Location:** Third location card in "Our Locations" section
- **Expected Alt Text:** "Birmingham Store storefront - Order via Just Eat and Deliveroo"
- **Verification:** Should be announced as a clickable image
- **DOM Selector:** `img[src*="photo-1556910103"]`

## Manual Testing Steps

### Using Browser DevTools
1. Open the site in Chrome/Edge/Firefox
2. Right-click on each image → Inspect
3. Verify `alt` attribute is present and contains expected text
4. Verify no `aria-hidden="false"` attributes on images with alt text

### Using Lighthouse
1. Open DevTools (F12)
2. Navigate to Lighthouse tab
3. Select "Accessibility" category
4. Run audit
5. Verify "Image elements have [alt] attributes" passes

### Using NVDA (Windows)
1. Install NVDA screen reader (free)
2. Start NVDA (Ctrl+Alt+N)
3. Navigate to the site
4. Use arrow keys to navigate through images
5. Verify NVDA announces the alt text for each image

### Using JAWS (Windows)
1. Start JAWS
2. Navigate to the site
3. Use Insert+F5 to list all images
4. Verify all images have alt text

### Using VoiceOver (macOS)
1. Enable VoiceOver (Cmd+F5)
2. Navigate to the site
3. Use VO+Cmd+G to list all images
4. Verify all images have alt text

### Using axe DevTools
1. Install axe DevTools browser extension
2. Open the extension on the landing page
3. Run full page scan
4. Verify no "Images must have alternate text" violations

## Automated Testing

### Using Browser Console
```javascript
// Check all images have alt attributes
const images = document.querySelectorAll('img');
const imagesWithoutAlt = Array.from(images).filter(img => !img.hasAttribute('alt'));
console.log('Images without alt:', imagesWithoutAlt.length);
console.log('Details:', imagesWithoutAlt);

// Check hero image specifically
const heroImage = document.querySelector('img[src*="photo-1486427944299"]');
console.log('Hero alt text:', heroImage?.alt);
console.log('Hero aria-hidden:', heroImage?.getAttribute('aria-hidden'));

// Check location card images
const locationImages = [
  document.querySelector('img[src*="photo-1559056199"]'), // London
  document.querySelector('img[src*="photo-1517433670267"]'), // Manchester
  document.querySelector('img[src*="photo-1556910103"]') // Birmingham
];

locationImages.forEach((img, index) => {
  const location = ['London', 'Manchester', 'Birmingham'][index];
  console.log(`${location} alt:`, img?.alt);
});
```

### Expected Console Output
```
Images without alt: 0
Details: []
Hero alt text: Decorative background showing artisan desserts
Hero aria-hidden: null
London alt: London Flagship storefront - Collection and Delivery available
Manchester alt: Manchester Store storefront - Collection and Delivery available
Birmingham alt: Birmingham Store storefront - Order via Just Eat and Deliveroo
```

## WCAG Success Criteria

This fix addresses:
- **WCAG 2.1 Level A - 1.1.1 Non-text Content:** All non-text content has a text alternative
- **WCAG 2.1 Level A - 4.1.2 Name, Role, Value:** For all UI components, the name and role can be programmatically determined

## Common Issues to Watch For

### ❌ Failures
- Image has empty alt text: `alt=""`
- Image has no alt attribute
- Image has `aria-hidden="true"` AND alt text (conflicting)
- Image has `aria-hidden="false"` (redundant)

### ✅ Correct Patterns
- Decorative images: `alt=""` OR `aria-hidden="true"`
- Meaningful images: `alt="descriptive text"`
- No aria-hidden attribute needed for images with alt text

## Deployment Checklist

- [x] Build React application with fixes
- [x] Copy build files to backend public directory
- [x] Verify index.html references correct JS bundle
- [x] Confirm all image alt attributes in source code
- [ ] Test with automated accessibility tools
- [ ] Test with screen readers
- [ ] Verify in browser testing environment
- [ ] Confirm no console errors

## Files Changed
- `/app/vitereact/src/components/views/UV_Landing.tsx` - Removed `aria-hidden="false"` from hero image

## Build Artifacts
- JavaScript: `/app/backend/public/assets/index-C5MaPGDK.js`
- CSS: `/app/backend/public/assets/index-BIbT_BCp.css`
- HTML: `/app/backend/public/index.html`
