/**
 * Real-world Toast Integration Examples
 * Demonstrates how to use toasts in actual app components
 */

import React from 'react'
import { toast } from '@utils/toast'
import type { Recipe } from '@types/recipe.types'

/**
 * Example 1: Recipe Save Handler
 * Shows success toast with undo functionality
 */
export const useRecipeSave = () => {
  const handleSaveRecipe = (recipe: Recipe) => {
    try {
      // Save recipe logic here
      saveToDatabase(recipe)

      toast.success(`"${recipe.name}" 저장 완료`, {
        duration: 4000
      })
    } catch (error) {
      toast.error('레시피 저장 중 오류가 발생했습니다', {
        duration: 5000,
        action: {
          label: '다시 시도',
          onClick: () => handleSaveRecipe(recipe)
        }
      })
    }
  }

  return { handleSaveRecipe }
}

/**
 * Example 2: Recipe Delete with Undo
 * Demonstrates undo functionality for destructive actions
 */
export const useRecipeDelete = () => {
  const handleDeleteRecipe = (recipe: Recipe) => {
    // Store deleted recipe temporarily
    const deletedRecipe = { ...recipe }

    // Delete from database
    deleteFromDatabase(recipe.id)

    // Show toast with undo action
    toast.success('레시피가 삭제되었습니다', {
      duration: 5000,
      action: {
        label: '되돌리기',
        onClick: () => {
          // Restore the recipe
          saveToDatabase(deletedRecipe)
          toast.info('레시피가 복원되었습니다')
        }
      }
    })
  }

  return { handleDeleteRecipe }
}

/**
 * Example 3: File Upload Progress
 * Shows manual toast control for long-running operations
 */
export const useFileUpload = () => {
  const handleUploadImage = async (file: File) => {
    // Show loading toast (no auto-dismiss)
    const toastId = toast.info('이미지 업로드 중...', {
      duration: 0
    })

    try {
      const result = await uploadFile(file)

      // Dismiss loading toast
      toast.dismiss(toastId)

      // Show success
      toast.success('이미지 업로드 완료')

      return result
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(toastId)

      // Show error with retry action
      toast.error('이미지 업로드 실패', {
        action: {
          label: '다시 시도',
          onClick: () => handleUploadImage(file)
        }
      })

      throw error
    }
  }

  return { handleUploadImage }
}

/**
 * Example 4: Form Validation
 * Shows validation warnings
 */
export const RecipeForm: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const formData = new FormData(e.target as HTMLFormElement)
    const name = formData.get('name') as string
    const ingredients = formData.get('ingredients') as string

    // Validation warnings
    if (!name) {
      toast.warning('레시피 이름을 입력해주세요')
      return
    }

    if (!ingredients) {
      toast.warning('재료를 입력해주세요')
      return
    }

    // Success
    toast.success('레시피가 생성되었습니다')
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}

/**
 * Example 5: Conversion Accuracy Warning
 * Shows info toast with additional details
 */
export const useConversionWarning = () => {
  const showConversionWarning = () => {
    toast.warning('변환 과정에서 소수점 오차가 발생할 수 있습니다', {
      duration: 6000,
      action: {
        label: '자세히',
        onClick: () => {
          // Navigate to help page
          window.location.href = '/help/conversion-accuracy'
        }
      }
    })
  }

  return { showConversionWarning }
}

/**
 * Example 6: Batch Operations
 * Shows toast for bulk actions
 */
export const useBatchOperations = () => {
  const handleBulkDelete = (recipes: Recipe[]) => {
    const count = recipes.length
    const deletedRecipes = [...recipes]

    // Delete all recipes
    recipes.forEach(recipe => deleteFromDatabase(recipe.id))

    toast.success(`${count}개의 레시피가 삭제되었습니다`, {
      duration: 5000,
      action: {
        label: '되돌리기',
        onClick: () => {
          // Restore all recipes
          deletedRecipes.forEach(recipe => saveToDatabase(recipe))
          toast.info(`${count}개의 레시피가 복원되었습니다`)
        }
      }
    })
  }

  return { handleBulkDelete }
}

/**
 * Example 7: PWA Installation Prompt
 * Shows info toast for PWA installation
 */
export const usePWAPrompt = () => {
  const showInstallPrompt = (deferredPrompt: any) => {
    toast.info('앱을 홈 화면에 추가할 수 있습니다', {
      duration: 8000,
      action: {
        label: '설치',
        onClick: async () => {
          deferredPrompt?.prompt()
          const choice = await deferredPrompt?.userChoice
          if (choice?.outcome === 'accepted') {
            toast.success('앱이 설치되었습니다')
          }
        }
      }
    })
  }

  return { showInstallPrompt }
}

/**
 * Example 8: Network Status
 * Shows toast for offline/online status
 */
export const useNetworkStatus = () => {
  React.useEffect(() => {
    const handleOffline = () => {
      toast.warning('인터넷 연결이 끊어졌습니다', {
        duration: 0  // Don't auto-dismiss
      })
    }

    const handleOnline = () => {
      toast.dismissAll()  // Clear offline warning
      toast.success('인터넷 연결이 복구되었습니다')
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])
}

// Dummy functions for examples
function saveToDatabase(recipe: any) { }
function deleteFromDatabase(id: string) { }
async function uploadFile(file: File) { return {} }
