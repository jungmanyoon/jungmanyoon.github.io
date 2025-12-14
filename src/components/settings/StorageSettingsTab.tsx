/**
 * 데이터 저장 설정 탭
 * File System Access API를 사용한 로컬 폴더 저장 설정
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useRecipeStore } from '@/stores/useRecipeStore'
import {
  fileSystemStorage,
  isFileSystemAccessSupported
} from '@/utils/storage/fileSystemStorage'
import { toast } from '@/utils/toast'
import {
  FolderOpen,
  HardDrive,
  Cloud,
  Check,
  AlertTriangle,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Info,
  ExternalLink
} from 'lucide-react'

export default function StorageSettingsTab() {
  const { storage, setStorageDirectory, setAutoSave, updateLastSaved } = useSettingsStore()
  const { recipes, importRecipes, exportRecipes, resetToSampleRecipes } = useRecipeStore()

  const [isSupported, setIsSupported] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 브라우저 지원 여부 및 저장소 초기화
  useEffect(() => {
    const checkSupport = async () => {
      const supported = isFileSystemAccessSupported()
      setIsSupported(supported)

      if (supported && storage.type === 'filesystem') {
        // 이전에 선택한 폴더가 있으면 복원 시도
        const initialized = await fileSystemStorage.initialize()
        setIsInitialized(initialized)

        if (!initialized && storage.directoryName) {
          // 권한이 만료되었을 수 있음
          toast.info('폴더 접근 권한이 만료되었습니다. 다시 연결해주세요.')
        }
      }
    }

    checkSupport()
  }, [storage.type, storage.directoryName])

  // 폴더 선택
  const handleSelectFolder = useCallback(async () => {
    setIsConnecting(true)
    try {
      const folderName = await fileSystemStorage.selectDirectory()
      if (folderName) {
        setStorageDirectory(folderName)
        setIsInitialized(true)
        toast.success(`'${folderName}' 폴더가 연결되었습니다.`)
      }
    } catch (error: any) {
      toast.error(error.message || '폴더 선택에 실패했습니다.')
    } finally {
      setIsConnecting(false)
    }
  }, [setStorageDirectory])

  // 폴더 연결 해제
  const handleDisconnect = useCallback(async () => {
    if (window.confirm('폴더 연결을 해제하시겠습니까?\n데이터는 브라우저 저장소에 유지됩니다.')) {
      await fileSystemStorage.disconnect()
      setStorageDirectory(null)
      setIsInitialized(false)
      toast.success('폴더 연결이 해제되었습니다.')
    }
  }, [setStorageDirectory])

  // 설정 데이터 가져오기 (storage 제외)
  const settingsStore = useSettingsStore()
  const getSettingsData = useCallback(() => {
    const { pan, product, yieldLoss, method, environment, ingredient, advanced } = settingsStore
    return { pan, product, yieldLoss, method, environment, ingredient, advanced }
  }, [settingsStore])

  // 수동 저장 (레시피 + 설정)
  const handleManualSave = useCallback(async () => {
    if (!isInitialized) {
      toast.error('먼저 저장 폴더를 선택해주세요.')
      return
    }

    try {
      // 레시피 저장
      await fileSystemStorage.writeFile('RECIPES', recipes)
      // 설정 저장
      await fileSystemStorage.writeFile('SETTINGS', getSettingsData())
      updateLastSaved()
      toast.success('레시피와 설정이 저장되었습니다.')
    } catch (error: any) {
      toast.error(error.message || '저장에 실패했습니다.')
    }
  }, [isInitialized, recipes, getSettingsData, updateLastSaved])

  // 파일에서 불러오기 (레시피 + 설정)
  const handleLoadFromFile = useCallback(async () => {
    if (!isInitialized) {
      toast.error('먼저 저장 폴더를 선택해주세요.')
      return
    }

    try {
      let loadedCount = 0

      // 레시피 불러오기
      const recipesData = await fileSystemStorage.readFile<any[]>('RECIPES')
      if (recipesData && Array.isArray(recipesData)) {
        await importRecipes(recipesData)
        loadedCount += recipesData.length
      }

      // 설정 불러오기
      const settingsData = await fileSystemStorage.readFile<any>('SETTINGS')
      if (settingsData) {
        settingsStore.importSettings(JSON.stringify(settingsData))
      }

      if (loadedCount > 0 || settingsData) {
        toast.success(`레시피 ${loadedCount}개와 설정을 불러왔습니다.`)
      } else {
        toast.info('저장된 파일이 없습니다.')
      }
    } catch (error: any) {
      toast.error(error.message || '불러오기에 실패했습니다.')
    }
  }, [isInitialized, importRecipes, settingsStore])

  // JSON 파일 내보내기 (다운로드)
  const handleExportJson = useCallback(async () => {
    try {
      const blob = await exportRecipes()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `recipes-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('레시피를 내보냈습니다.')
    } catch (error) {
      toast.error('내보내기에 실패했습니다.')
    }
  }, [exportRecipes])

  // JSON 파일 가져오기 (업로드)
  const handleImportJson = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!Array.isArray(data)) {
        throw new Error('잘못된 파일 형식입니다.')
      }

      const recipesWithDates = data.map((recipe: any) => ({
        ...recipe,
        createdAt: recipe.createdAt ? new Date(recipe.createdAt) : new Date(),
        updatedAt: recipe.updatedAt ? new Date(recipe.updatedAt) : new Date()
      }))

      await importRecipes(recipesWithDates)
      toast.success(`${data.length}개의 레시피를 가져왔습니다.`)
    } catch (error) {
      toast.error('파일 형식이 올바르지 않습니다.')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [importRecipes])

  // 샘플 레시피 불러오기
  const handleResetToSamples = useCallback(() => {
    if (window.confirm('기존 레시피를 모두 삭제하고 샘플 레시피로 교체합니다.\n계속하시겠습니까?')) {
      resetToSampleRecipes()
      toast.success('샘플 레시피를 불러왔습니다.')
    }
  }, [resetToSampleRecipes])

  const lastSavedText = storage.lastSavedAt
    ? new Date(storage.lastSavedAt).toLocaleString('ko-KR')
    : '없음'

  return (
    <div className="space-y-6">
      {/* 저장소 타입 선택 */}
      <section className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-amber-600" />
          데이터 저장 위치
        </h3>

        <div className="space-y-4">
          {/* 현재 상태 */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {storage.type === 'filesystem' && isInitialized ? (
              <>
                <div className="p-2 bg-green-100 rounded-full">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    로컬 폴더: {storage.directoryName}
                  </p>
                  <p className="text-sm text-gray-500">
                    마지막 저장: {lastSavedText}
                  </p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  연결 해제
                </button>
              </>
            ) : storage.type === 'filesystem' && !isInitialized ? (
              <>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    폴더 연결 필요
                  </p>
                  <p className="text-sm text-gray-500">
                    권한이 만료되었거나 폴더가 선택되지 않았습니다.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-2 bg-blue-100 rounded-full">
                  <Cloud className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    브라우저 저장소 사용 중
                  </p>
                  <p className="text-sm text-gray-500">
                    데이터가 브라우저에 자동 저장됩니다.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* 폴더 선택 버튼 */}
          {isSupported ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSelectFolder}
                disabled={isConnecting}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isConnecting ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <FolderOpen className="w-5 h-5" />
                )}
                {storage.type === 'filesystem' ? '다른 폴더 선택' : '로컬 폴더 선택'}
              </button>

              {storage.type === 'filesystem' && isInitialized && (
                <div className="flex gap-2">
                  <button
                    onClick={handleManualSave}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    폴더에 저장
                  </button>
                  <button
                    onClick={handleLoadFromFile}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    폴더에서 불러오기
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">
                    이 브라우저에서는 폴더 저장을 지원하지 않습니다.
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Chrome 또는 Edge 브라우저를 사용하시면 로컬 폴더에 데이터를 저장할 수 있습니다.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 자동 저장 옵션 */}
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={storage.autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
            />
            <div>
              <p className="font-medium text-gray-800">자동 저장</p>
              <p className="text-sm text-gray-500">
                변경사항을 자동으로 저장합니다.
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* 수동 백업/복원 */}
      <section className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-amber-600" />
          수동 백업/복원
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          JSON 파일로 레시피를 백업하거나 복원할 수 있습니다.
          다른 기기로 데이터를 이동할 때 유용합니다.
        </p>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />

          <button
            onClick={handleExportJson}
            disabled={recipes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            JSON 내보내기
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Upload className="w-4 h-4" />
            JSON 가져오기
          </button>

          <button
            onClick={handleResetToSamples}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            샘플 불러오기
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          현재 저장된 레시피: {recipes.length}개
        </p>
      </section>

      {/* 안내 */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">로컬 폴더 저장 안내</p>
            <ul className="space-y-1 text-blue-700">
              <li>- Chrome/Edge 브라우저에서만 지원됩니다.</li>
              <li>- 선택한 폴더에 다음 파일이 생성됩니다:</li>
              <li className="ml-4">• <code className="bg-blue-100 px-1 rounded">recipes.json</code> - 모든 레시피</li>
              <li className="ml-4">• <code className="bg-blue-100 px-1 rounded">settings.json</code> - 팬, 환경, 제법 등 모든 설정</li>
              <li>- 브라우저를 닫아도 권한이 유지됩니다.</li>
              <li>- 클라우드 폴더(OneDrive, Google Drive 등)를 선택하면 자동 동기화됩니다.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
