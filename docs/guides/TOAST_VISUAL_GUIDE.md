# Toast Notification System - Visual Guide

## Toast Types & Appearances

### 1. Success Toast (Green)
```
┌────────────────────────────────────────┐
│ ✓  레시피가 저장되었습니다          × │
└────────────────────────────────────────┘
```
- **Color**: Green (green-50 bg, green-600 icon)
- **Icon**: CheckCircle ✓
- **Use Case**: Successful operations, confirmations
- **Default Duration**: 3 seconds

### 2. Error Toast (Red)
```
┌────────────────────────────────────────┐
│ ⊗  파일을 불러올 수 없습니다        × │
│    [다시 시도]                          │
└────────────────────────────────────────┘
```
- **Color**: Red (red-50 bg, red-600 icon)
- **Icon**: XCircle ⊗
- **Use Case**: Errors, failures, critical issues
- **Default Duration**: 5 seconds (longer than others)

### 3. Warning Toast (Amber)
```
┌────────────────────────────────────────┐
│ ⚠  일부 재료의 정보가 누락되었습니다 × │
└────────────────────────────────────────┘
```
- **Color**: Amber (amber-50 bg, amber-600 icon)
- **Icon**: AlertCircle ⚠
- **Use Case**: Warnings, non-critical issues
- **Default Duration**: 4 seconds

### 4. Info Toast (Blue)
```
┌────────────────────────────────────────┐
│ ℹ  새로운 기능이 추가되었습니다      × │
│    [자세히 보기]                        │
└────────────────────────────────────────┘
```
- **Color**: Blue (blue-50 bg, blue-600 icon)
- **Icon**: Info ℹ
- **Use Case**: Information, updates, tips
- **Default Duration**: 3 seconds

## Toast with Action Button

```
┌────────────────────────────────────────┐
│ ✓  레시피가 삭제되었습니다          × │
│    [되돌리기]                           │
└────────────────────────────────────────┘
```
- Action buttons appear below the message
- Styled as underlined links
- Click action executes callback and dismisses toast

## Toast Stack (Multiple Toasts)

```
Position: Fixed Top-Right
Gap: 8px (0.5rem)

┌────────────────────────────┐ ← Top (newest)
│ ℹ  업로드 중...          × │
└────────────────────────────┘
         ↓ 8px gap
┌────────────────────────────┐
│ ⚠  인터넷 연결 불안정    × │
└────────────────────────────┘
         ↓ 8px gap
┌────────────────────────────┐ ← Bottom (oldest)
│ ✓  저장 완료             × │
└────────────────────────────┘
```

## Responsive Behavior

### Desktop (>768px)
```
┌─────────────────────────────────────────────────┐
│                    Viewport            [Toast] │
│                                                 │
│   Content                              [Toast] │
│                                                 │
│                                        [Toast] │
└─────────────────────────────────────────────────┘
```
- **Position**: Top-right corner
- **Width**: 320px - 480px (min-max)
- **Offset**: 16px from top and right

### Mobile (<768px)
```
┌──────────────────┐
│    [Toast]       │
│                  │
│    [Toast]       │
│                  │
│  Content         │
│                  │
│                  │
└──────────────────┘
```
- **Position**: Top-right (centered on very small screens)
- **Width**: Adaptive (min: 320px)
- **Touch**: Tap to dismiss

## Animation Timeline

### Enter Animation (300ms)
```
0ms:   translateX(120%) opacity(0)   [Off screen right]
       ─────────────────────────────────────────>
300ms: translateX(0) opacity(100%)   [Fully visible]
```
- **Easing**: ease-out
- **Properties**: transform, opacity
- **Performance**: GPU-accelerated (translateX)

### Exit Animation (300ms)
```
0ms:   translateX(0) opacity(100%)   [Fully visible]
       ─────────────────────────────────────────>
300ms: translateX(120%) opacity(0)   [Off screen right]
```
- **Trigger**: Manual dismiss or auto-dismiss
- **Cleanup**: Component removed from DOM after animation

## Accessibility Features

### Screen Reader Announcements
```
<div role="alert" aria-live="polite" aria-atomic="true">
  Success: 레시피가 저장되었습니다
</div>
```
- **role="alert"**: Announced to screen readers
- **aria-live="polite"**: Non-interrupting announcements
- **aria-atomic="true"**: Read entire message at once

### Keyboard Navigation
```
[Tab] → Focus next interactive element (close button, action button)
[Enter/Space] → Activate focused button
[Escape] → (Future) Dismiss focused toast
```

### Color Independence
- Icons provide semantic meaning beyond color
- Text labels are clear and descriptive
- Contrast ratios meet WCAG AA standards

## Size Specifications

### Toast Dimensions
- **Min Width**: 320px
- **Max Width**: 480px
- **Height**: Auto (based on content)
- **Padding**: 16px (1rem)
- **Border Radius**: 8px (0.5rem)
- **Border**: 1px solid (type-specific color)

### Icon Size
- **Size**: 20px × 20px (w-5 h-5)
- **Margin**: 2px top (mt-0.5)

### Close Button
- **Size**: 16px × 16px (w-4 h-4)
- **Padding**: 4px (p-1)
- **Interactive Area**: 24px × 24px (with padding)

### Text
- **Font Size**: 14px (text-sm)
- **Font Weight**: 500 (font-medium)
- **Line Height**: 1.4 (for readability)

## Color Palette

### Success (Green)
```css
Background: #F0FDF4 (green-50)
Border: #BBF7D0 (green-200)
Icon: #16A34A (green-600)
Text: #14532D (green-900)
Button: #15803D (green-700)
```

### Error (Red)
```css
Background: #FEF2F2 (red-50)
Border: #FECACA (red-200)
Icon: #DC2626 (red-600)
Text: #7F1D1D (red-900)
Button: #B91C1C (red-700)
```

### Warning (Amber)
```css
Background: #FFFBEB (amber-50)
Border: #FDE68A (amber-200)
Icon: #D97706 (amber-600)
Text: #78350F (amber-900)
Button: #B45309 (amber-700)
```

### Info (Blue)
```css
Background: #EFF6FF (blue-50)
Border: #BFDBFE (blue-200)
Icon: #2563EB (blue-600)
Text: #1E3A8A (blue-900)
Button: #1D4ED8 (blue-700)
```

## Usage Patterns

### Pattern 1: Simple Notification
```tsx
toast.success('작업 완료')
```
```
┌──────────────────┐
│ ✓ 작업 완료    × │
└──────────────────┘
```

### Pattern 2: Error with Retry
```tsx
toast.error('오류 발생', {
  action: {
    label: '다시 시도',
    onClick: retry
  }
})
```
```
┌──────────────────┐
│ ⊗ 오류 발생    × │
│   [다시 시도]    │
└──────────────────┘
```

### Pattern 3: Undo Action
```tsx
toast.success('삭제됨', {
  action: {
    label: '되돌리기',
    onClick: undo
  }
})
```
```
┌──────────────────┐
│ ✓ 삭제됨       × │
│   [되돌리기]     │
└──────────────────┘
```

### Pattern 4: Long Running Operation
```tsx
const id = toast.info('처리 중...', { duration: 0 })
// ... async operation ...
toast.dismiss(id)
toast.success('완료')
```
```
Step 1:              Step 2 (after 3s):
┌──────────────┐    ┌──────────────┐
│ ℹ 처리 중  × │ →  │ ✓ 완료     × │
└──────────────┘    └──────────────┘
```

## Best Practices Checklist

### ✅ DO
- Keep messages concise (1-2 lines)
- Use appropriate toast type for context
- Provide action buttons for recoverable errors
- Use undo for destructive operations
- Set appropriate durations (errors longer)
- Test with screen readers
- Verify color contrast
- Test on mobile devices

### ❌ DON'T
- Don't use for critical errors (use modals)
- Don't show too many toasts at once
- Don't use very long messages (truncate)
- Don't rely only on color (use icons)
- Don't block important UI elements
- Don't use toasts for persistent info
- Don't make toasts too fast (< 2s)
- Don't skip accessibility features

## Troubleshooting

### Toast Not Appearing
```tsx
// ✅ Correct
import { toast } from '@utils/toast'
toast.success('Message')

// ❌ Wrong
import { useToastStore } from '@stores/useToastStore'
useToastStore.addToast({ ... })  // Works but verbose
```

### Toast Not Dismissing
```tsx
// Check duration setting
toast.info('Message', { duration: 0 })  // Won't auto-dismiss
toast.info('Message', { duration: 3000 })  // Will dismiss after 3s
```

### Action Not Working
```tsx
// ✅ Correct
toast.success('Deleted', {
  action: {
    label: 'Undo',
    onClick: () => restore()  // Arrow function
  }
})

// ❌ Wrong
toast.success('Deleted', {
  action: {
    label: 'Undo',
    onClick: restore()  // Calls immediately
  }
})
```

### Multiple Toasts Overlap
```
This is normal behavior. Toasts stack vertically.
Use toast.dismissAll() to clear all if needed.
```

## Performance Tips

1. **Limit Toast Count**: Clear old toasts before showing many new ones
2. **Optimize Re-renders**: Toasts use React.memo internally
3. **GPU Acceleration**: Animations use transform for better performance
4. **Memory Management**: Auto-cleanup prevents memory leaks
5. **Bundle Size**: Import only what you need from toast utils

---

**Visual Guide Version**: 1.0.0
**Last Updated**: 2025-10-05
