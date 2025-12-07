/**
 * Toast Usage Examples
 * This file demonstrates how to use the toast notification system
 * Remove this file after understanding the examples
 */

import React from 'react'
import { toast } from '@utils/toast'

export const ToastExamples: React.FC = () => {
  // Example 1: Simple success message
  const handleSaveRecipe = () => {
    toast.success('레시피가 저장되었습니다')
  }

  // Example 2: Error with longer duration
  const handleError = () => {
    toast.error('파일을 불러올 수 없습니다', {
      duration: 5000  // 5 seconds
    })
  }

  // Example 3: Warning message
  const handleWarning = () => {
    toast.warning('일부 재료의 정보가 누락되었습니다', {
      duration: 4000
    })
  }

  // Example 4: Info message
  const handleInfo = () => {
    toast.info('새로운 기능이 추가되었습니다')
  }

  // Example 5: Toast with action button (Undo functionality)
  const handleDelete = () => {
    const deletedRecipe = { name: '바게트 레시피' }

    toast.success('레시피가 삭제되었습니다', {
      duration: 5000,
      action: {
        label: '되돌리기',
        onClick: () => {
          // Restore the recipe
          console.log('Recipe restored:', deletedRecipe)
          toast.info('레시피가 복원되었습니다')
        }
      }
    })
  }

  // Example 6: Custom toast with all options
  const handleCustom = () => {
    toast.custom({
      type: 'warning',
      message: '변환 과정에서 오차가 발생할 수 있습니다',
      duration: 6000,
      action: {
        label: '자세히 보기',
        onClick: () => {
          console.log('Show details')
        }
      }
    })
  }

  // Example 7: Programmatic dismiss
  const handleDismissAll = () => {
    toast.dismissAll()
  }

  // Example 8: Get toast ID for manual control
  const handleManualControl = () => {
    const id = toast.info('처리 중입니다...', {
      duration: 0  // Won't auto-dismiss
    })

    // Later, dismiss it manually
    setTimeout(() => {
      toast.dismiss(id)
      toast.success('처리가 완료되었습니다')
    }, 3000)
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Toast Examples</h2>

      <div className="space-y-2">
        <button
          onClick={handleSaveRecipe}
          className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Show Success Toast
        </button>

        <button
          onClick={handleError}
          className="block w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Show Error Toast
        </button>

        <button
          onClick={handleWarning}
          className="block w-full px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          Show Warning Toast
        </button>

        <button
          onClick={handleInfo}
          className="block w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Show Info Toast
        </button>

        <button
          onClick={handleDelete}
          className="block w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Show Toast with Undo Action
        </button>

        <button
          onClick={handleCustom}
          className="block w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Show Custom Toast
        </button>

        <button
          onClick={handleManualControl}
          className="block w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Show Toast with Manual Control
        </button>

        <button
          onClick={handleDismissAll}
          className="block w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
        >
          Dismiss All Toasts
        </button>
      </div>

      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Usage in your components:</h3>
        <pre className="text-xs overflow-x-auto">
{`import { toast } from '@utils/toast'

// Simple usage
toast.success('레시피가 저장되었습니다')
toast.error('오류가 발생했습니다')
toast.warning('경고 메시지')
toast.info('정보 메시지')

// With options
toast.success('저장 완료', {
  duration: 5000,
  action: {
    label: '보기',
    onClick: () => console.log('Clicked')
  }
})

// Manual control
const id = toast.info('Processing...', { duration: 0 })
// Later...
toast.dismiss(id)
toast.dismissAll()
`}
        </pre>
      </div>
    </div>
  )
}
