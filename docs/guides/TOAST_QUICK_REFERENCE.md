# Toast System - Quick Reference Card

## Import

```tsx
import { toast } from '@utils/toast'
```

## Basic Usage

```tsx
// Success (green, 3s)
toast.success('작업이 완료되었습니다')

// Error (red, 5s)
toast.error('오류가 발생했습니다')

// Warning (amber, 4s)
toast.warning('주의가 필요합니다')

// Info (blue, 3s)
toast.info('새로운 정보입니다')
```

## With Options

```tsx
// Custom duration
toast.success('메시지', { duration: 6000 })

// No auto-dismiss
toast.info('처리 중...', { duration: 0 })

// With action button
toast.error('실패', {
  action: {
    label: '재시도',
    onClick: () => retry()
  }
})

// Undo functionality
toast.success('삭제됨', {
  duration: 5000,
  action: {
    label: '되돌리기',
    onClick: () => restore()
  }
})
```

## Advanced

```tsx
// Get toast ID for manual control
const id = toast.info('Loading...', { duration: 0 })
// Later...
toast.dismiss(id)

// Dismiss all toasts
toast.dismissAll()

// Custom toast with all options
toast.custom({
  type: 'warning',
  message: '경고 메시지',
  duration: 4000,
  action: {
    label: '확인',
    onClick: () => console.log('Clicked')
  }
})
```

## Common Patterns

### Save Success
```tsx
const handleSave = () => {
  saveData()
  toast.success('저장되었습니다')
}
```

### Error with Retry
```tsx
const handleUpload = async () => {
  try {
    await uploadFile()
    toast.success('업로드 완료')
  } catch (error) {
    toast.error('업로드 실패', {
      action: {
        label: '재시도',
        onClick: handleUpload
      }
    })
  }
}
```

### Delete with Undo
```tsx
const handleDelete = (item) => {
  const backup = { ...item }
  deleteItem(item.id)

  toast.success('삭제되었습니다', {
    duration: 5000,
    action: {
      label: '되돌리기',
      onClick: () => {
        restoreItem(backup)
        toast.info('복원되었습니다')
      }
    }
  })
}
```

### Loading State
```tsx
const handleProcess = async () => {
  const id = toast.info('처리 중...', { duration: 0 })

  try {
    await processData()
    toast.dismiss(id)
    toast.success('완료')
  } catch (error) {
    toast.dismiss(id)
    toast.error('실패')
  }
}
```

## Types Reference

```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastOptions {
  duration?: number        // ms, default: 3000 (0 = no dismiss)
  action?: {
    label: string         // Button text
    onClick: () => void   // Button callback
  }
}

interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
  action?: ToastAction
}
```

## API Methods

| Method | Description | Return |
|--------|-------------|--------|
| `toast.success(msg, opts?)` | Show success toast | `string` (ID) |
| `toast.error(msg, opts?)` | Show error toast | `string` (ID) |
| `toast.warning(msg, opts?)` | Show warning toast | `string` (ID) |
| `toast.info(msg, opts?)` | Show info toast | `string` (ID) |
| `toast.custom(toast)` | Show custom toast | `string` (ID) |
| `toast.dismiss(id)` | Dismiss specific toast | `void` |
| `toast.dismissAll()` | Dismiss all toasts | `void` |

## Default Durations

| Type | Duration | Reason |
|------|----------|--------|
| Success | 3000ms | Quick confirmation |
| Error | 5000ms | More time to read/act |
| Warning | 4000ms | Important but not critical |
| Info | 3000ms | Brief information |

## Visual Indicators

| Type | Icon | Color |
|------|------|-------|
| Success | ✓ CheckCircle | Green |
| Error | ⊗ XCircle | Red |
| Warning | ⚠ AlertCircle | Amber |
| Info | ℹ Info | Blue |

## Best Practices

### ✅ DO
```tsx
// Concise messages
toast.success('저장됨')

// Undo for destructive actions
toast.success('삭제됨', { action: { label: '되돌리기', onClick: undo } })

// Longer duration for errors
toast.error('오류', { duration: 5000 })

// Dismiss loading toasts
const id = toast.info('Loading...')
// later: toast.dismiss(id)
```

### ❌ DON'T
```tsx
// Too long
toast.success('사용자님의 레시피가 성공적으로 데이터베이스에 저장되었습니다.')

// Immediate execution
toast.success('Done', { action: { onClick: fn() } })  // Wrong

// Critical errors
toast.error('Server crashed!')  // Use modal instead

// Blocking UI
// Toasts are non-blocking by design
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Click close (×) | Dismiss toast |
| Click action | Execute & dismiss |
| Click anywhere | Dismiss toast |

## Accessibility

- **Screen Reader**: Announces messages via `role="alert"`
- **Color Independent**: Icons provide semantic meaning
- **Keyboard**: All interactive elements focusable
- **ARIA**: `aria-live="polite"` for non-interrupting

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Toast not showing | Check ToastContainer in App.tsx |
| Not auto-dismissing | Check `duration` setting |
| Action not working | Use arrow function `() => fn()` |
| TypeScript error | Import type from `@stores/useToastStore` |

## File Locations

```
src/
├── stores/useToastStore.ts       # State management
├── components/common/
│   ├── Toast.tsx                 # Toast component
│   └── ToastContainer.tsx        # Container
└── utils/toast.ts                # Helper functions ← Import this!
```

## Integration

```tsx
// App.tsx
import { ToastContainer } from '@components/common/ToastContainer'

function App() {
  return (
    <>
      <ToastContainer />  {/* Add this once at root */}
      {/* Rest of app */}
    </>
  )
}

// Any component
import { toast } from '@utils/toast'

function MyComponent() {
  return (
    <button onClick={() => toast.success('Clicked!')}>
      Click Me
    </button>
  )
}
```

## Examples

See full examples in:
- `src/components/common/ToastExample.tsx` - Interactive demos
- `src/examples/ToastIntegrationExample.tsx` - Real-world usage
- `TOAST_SYSTEM.md` - Complete documentation

---

**Quick Reference**: v1.0.0 | Keep this card handy for fast development!
