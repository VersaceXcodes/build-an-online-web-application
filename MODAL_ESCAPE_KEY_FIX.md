# Modal Escape Key Fix

## Issue
Modal dialogs in the admin order management interface were not closing when the Escape key was pressed, which is a standard accessibility and UX behavior for modal dialogs.

## Root Cause
The "Process Refund" confirmation modal and the Order Detail slide panel in `UV_AdminOrders.tsx` did not have keyboard event listeners to handle the Escape key press.

## Solution
Added two `useEffect` hooks to listen for Escape key presses and close the respective modals/panels:

1. **Detail Panel Escape Handler** (lines 359-370):
   - Listens for Escape key when `showDetailPanel` is true
   - Closes the panel by setting `showDetailPanel` to false
   - Cleans up by setting `selectedOrderId` to null after a 300ms delay (matches the panel animation)

2. **Refund Modal Escape Handler** (lines 372-382):
   - Listens for Escape key when `showRefundModal` is true
   - Closes the modal by setting `showRefundModal` to false

## Implementation Details

### Code Added
```typescript
// Handle escape key to close detail panel
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showDetailPanel) {
      setShowDetailPanel(false);
      setTimeout(() => setSelectedOrderId(null), 300);
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [showDetailPanel]);

// Handle escape key to close refund modal
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && showRefundModal) {
      setShowRefundModal(false);
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [showRefundModal]);
```

## Files Modified
- `/app/vitereact/src/components/views/UV_AdminOrders.tsx`

## Testing
1. Log in as admin
2. Navigate to Order Management
3. Open any order detail
4. Click "Issue Refund" to open the refund modal
5. Press the Escape key - the modal should close
6. With the detail panel open, press Escape - the panel should close

## Accessibility Impact
This fix improves accessibility by:
- Following WCAG 2.1 guidelines for modal dialog keyboard navigation
- Providing expected keyboard interaction for screen reader users
- Matching standard UX patterns used across modern web applications

## Similar Pattern
This implementation follows the same pattern used in other components like `GV_CartSlidePanel.tsx`, ensuring consistency across the application.
