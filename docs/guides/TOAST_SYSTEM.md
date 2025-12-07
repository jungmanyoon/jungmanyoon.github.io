# Toast Notification System

Modern, accessible toast notification system built with Zustand and React.

## Features

✅ **Modern Design** - Clean, accessible UI with smooth animations
✅ **Multiple Types** - Success, Error, Warning, Info variants
✅ **Auto-dismiss** - Configurable duration with automatic removal
✅ **Action Support** - Undo functionality and custom actions
✅ **Stack Management** - Multiple toasts displayed vertically
✅ **Accessibility** - ARIA labels, keyboard navigation, screen reader support
✅ **Zustand State** - Centralized state management
✅ **TypeScript** - Full type safety

## Installation

The Toast system is already integrated into the app. No additional setup required.

## Basic Usage

```tsx
import { toast } from '@utils/toast'

// Simple notifications
toast.success('레시피가 저장되었습니다')
toast.error('파일을 불러올 수 없습니다')
toast.warning('일부 재료의 정보가 누락되었습니다')
toast.info('새로운 기능이 추가되었습니다')
```

## Advanced Usage

### Custom Duration

```tsx
// Error stays for 5 seconds (default is 3s)
toast.error('오류가 발생했습니다', {
  duration: 5000
})

// Toast that doesn't auto-dismiss
toast.info('Processing...', {
  duration: 0  // Won't auto-dismiss
})
```

### Action Buttons (Undo Support)

```tsx
const handleDelete = (recipe: Recipe) => {
  // Store deleted recipe for potential restoration
  const deletedRecipe = { ...recipe }

  // Show toast with undo action
  toast.success('레시피가 삭제되었습니다', {
    duration: 5000,
    action: {
      label: '되돌리기',
      onClick: () => {
        // Restore the deleted recipe
        restoreRecipe(deletedRecipe)
        toast.info('레시피가 복원되었습니다')
      }
    }
  })
}
```

### Manual Control

```tsx
// Get toast ID for manual control
const toastId = toast.info('업로드 중...', {
  duration: 0  // Won't auto-dismiss
})

// Later, dismiss it manually
fetch('/api/upload', data)
  .then(() => {
    toast.dismiss(toastId)
    toast.success('업로드 완료')
  })
  .catch(() => {
    toast.dismiss(toastId)
    toast.error('업로드 실패')
  })
```

### Custom Toast

```tsx
toast.custom({
  type: 'warning',
  message: '변환 과정에서 오차가 발생할 수 있습니다',
  duration: 6000,
  action: {
    label: '자세히 보기',
    onClick: () => {
      navigateTo('/help/conversion-accuracy')
    }
  }
})
```

### Dismiss All Toasts

```tsx
// Clear all active toasts
toast.dismissAll()
```

## API Reference

### Toast Types

```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info'
```

### Toast Options

```typescript
interface ToastOptions {
  duration?: number        // Duration in ms (default: 3000, 0 = no auto-dismiss)
  action?: {
    label: string         // Action button label
    onClick: () => void   // Action button handler
  }
}
```

### Toast Functions

#### `toast.success(message, options?)`
Show success toast (green, CheckCircle icon)

#### `toast.error(message, options?)`
Show error toast (red, XCircle icon, default 5s duration)

#### `toast.warning(message, options?)`
Show warning toast (amber, AlertCircle icon, default 4s duration)

#### `toast.info(message, options?)`
Show info toast (blue, Info icon)

#### `toast.custom(toast)`
Show custom toast with full configuration

#### `toast.dismiss(id)`
Dismiss specific toast by ID

#### `toast.dismissAll()`
Dismiss all active toasts

## Design System

The toast system uses semantic colors that adapt to your design:

| Type | Color | Icon | Default Duration |
|------|-------|------|------------------|
| Success | Green | CheckCircle | 3s |
| Error | Red | XCircle | 5s |
| Warning | Amber | AlertCircle | 4s |
| Info | Blue | Info | 3s |

## Accessibility

- **ARIA Labels**: Each toast has proper `role="alert"` and `aria-live="polite"`
- **Keyboard Navigation**: Toasts can be dismissed with click or keyboard
- **Screen Readers**: Messages are announced when toasts appear
- **Focus Management**: Doesn't trap focus, allows normal page interaction

## Examples in the App

See `ToastExample.tsx` for comprehensive usage examples:

```tsx
import { ToastExamples } from '@components/common/ToastExample'

// Use in any component to see live examples
<ToastExamples />
```

## Best Practices

### ✅ DO

- Use success for confirmations: "레시피가 저장되었습니다"
- Use error for failures: "파일을 불러올 수 없습니다"
- Use warning for non-critical issues: "일부 데이터가 누락되었습니다"
- Use info for neutral notifications: "새로운 기능이 추가되었습니다"
- Provide undo actions for destructive operations
- Keep messages concise and actionable

### ❌ DON'T

- Don't use toasts for critical errors (use modals instead)
- Don't stack too many toasts (they auto-clear to prevent overflow)
- Don't use long messages (keep under 2 lines)
- Don't rely solely on color (icons provide semantic meaning)
- Don't use toasts for persistent information (use banners instead)

## Integration Points

### App.lazy.tsx
```tsx
import { ToastContainer } from '@components/common/ToastContainer'

// ToastContainer is rendered at app root
<ToastContainer />
```

### Store Integration
```tsx
import { useToastStore } from '@stores/useToastStore'

// Direct store access if needed
const toasts = useToastStore(state => state.toasts)
const addToast = useToastStore(state => state.addToast)
```

## File Structure

```
src/
├── stores/
│   └── useToastStore.ts          # Zustand store
├── components/
│   └── common/
│       ├── Toast.tsx             # Individual toast component
│       ├── ToastContainer.tsx    # Toast container renderer
│       └── ToastExample.tsx      # Usage examples
└── utils/
    └── toast.ts                  # Helper functions
```

## Performance

- **Minimal Re-renders**: Only toasts that change re-render
- **Auto-cleanup**: Toasts auto-remove from DOM after dismissal
- **Lightweight**: ~2KB gzipped
- **Animations**: GPU-accelerated transforms for smooth 60fps

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Future Enhancements

Potential improvements for future iterations:

- [ ] Toast positioning options (top-right, top-center, bottom-right, etc.)
- [ ] Progress bar for duration visualization
- [ ] Sound effects for different toast types
- [ ] Toast queue management with priority levels
- [ ] Swipe-to-dismiss on mobile
- [ ] Custom icons and colors
- [ ] Toast groups/categories
- [ ] Persistent toasts that survive page refresh

---

**Version**: 1.0.0
**Last Updated**: 2025-10-05
**Author**: Recipe Book Team
