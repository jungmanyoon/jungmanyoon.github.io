/**
 * 데이터 저장 설정 탭
 * File System Access API를 사용한 로컬 폴더 저장 설정
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
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
  Info
} from 'lucide-react'

export default function StorageSettingsTab() {
  const { t } = useTranslation()
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
          toast.info(t('settings.storage.permissionExpiredToast'))
        }
      }
    }

    checkSupport()
  }, [storage.type, storage.directoryName, t])

  // 폴더 선택
  const handleSelectFolder = useCallback(async () => {
    setIsConnecting(true)
    try {
      const folderName = await fileSystemStorage.selectDirectory()
      if (folderName) {
        setStorageDirectory(folderName)
        setIsInitialized(true)
        toast.success(t('settings.storage.folderConnected', { name: folderName }))
      }
    } catch (error: any) {
      toast.error(error.message || t('settings.storage.folderSelectFailed'))
    } finally {
      setIsConnecting(false)
    }
  }, [setStorageDirectory, t])

  // 폴더 연결 해제
  const handleDisconnect = useCallback(async () => {
    if (window.confirm(t('settings.storage.disconnectConfirm'))) {
      await fileSystemStorage.disconnect()
      setStorageDirectory(null)
      setIsInitialized(false)
      toast.success(t('settings.storage.disconnected'))
    }
  }, [setStorageDirectory, t])

  // 설정 데이터 가져오기 (storage 제외)
  const settingsStore = useSettingsStore()
  const getSettingsData = useCallback(() => {
    const { pan, product, yieldLoss, method, environment, ingredient, advanced } = settingsStore
    return { pan, product, yieldLoss, method, environment, ingredient, advanced }
  }, [settingsStore])

  // 수동 저장 (레시피 + 설정)
  const handleManualSave = useCallback(async () => {
    if (!isInitialized) {
      toast.error(t('settings.storage.selectFolderFirst'))
      return
    }

    try {
      // 레시피 저장
      await fileSystemStorage.writeFile('RECIPES', recipes)
      // 설정 저장
      await fileSystemStorage.writeFile('SETTINGS', getSettingsData())
      updateLastSaved()
      toast.success(t('settings.storage.savedSuccess'))
    } catch (error: any) {
      toast.error(error.message || t('settings.storage.saveFailed'))
    }
  }, [isInitialized, recipes, getSettingsData, updateLastSaved, t])

  // 파일에서 불러오기 (레시피 + 설정)
  const handleLoadFromFile = useCallback(async () => {
    if (!isInitialized) {
      toast.error(t('settings.storage.selectFolderFirst'))
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
        toast.success(t('settings.storage.loadedSuccess', { count: loadedCount }))
      } else {
        toast.info(t('settings.storage.noSavedFiles'))
      }
    } catch (error: any) {
      toast.error(error.message || t('settings.storage.loadFailed'))
    }
  }, [isInitialized, importRecipes, settingsStore, t])

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
      toast.success(t('settings.storage.exportedSuccess'))
    } catch (error) {
      toast.error(t('settings.storage.exportFailed'))
    }
  }, [exportRecipes, t])

  // JSON 파일 가져오기 (업로드)
  const handleImportJson = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!Array.isArray(data)) {
        throw new Error(t('settings.storage.invalidFileFormat'))
      }

      const recipesWithDates = data.map((recipe: any) => ({
        ...recipe,
        createdAt: recipe.createdAt ? new Date(recipe.createdAt) : new Date(),
        updatedAt: recipe.updatedAt ? new Date(recipe.updatedAt) : new Date()
      }))

      await importRecipes(recipesWithDates)
      toast.success(t('settings.storage.importedSuccess', { count: data.length }))
    } catch (error) {
      toast.error(t('settings.storage.invalidFileFormatError'))
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [importRecipes, t])

  // 샘플 레시피 불러오기
  const handleResetToSamples = useCallback(() => {
    if (window.confirm(t('settings.storage.resetSamplesConfirm'))) {
      resetToSampleRecipes()
      toast.success(t('settings.storage.samplesLoaded'))
    }
  }, [resetToSampleRecipes, t])

  const lastSavedText = storage.lastSavedAt
    ? new Date(storage.lastSavedAt).toLocaleString()
    : t('settings.storage.none')

  return (
    <div className="space-y-6">
      {/* 저장소 타입 선택 */}
      <section className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-amber-600" />
          {t('settings.storage.title')}
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
                    {t('settings.storage.localFolder')}: {storage.directoryName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('settings.storage.lastSaved')}: {lastSavedText}
                  </p>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  {t('settings.storage.disconnect')}
                </button>
              </>
            ) : storage.type === 'filesystem' && !isInitialized ? (
              <>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {t('settings.storage.folderNeeded')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('settings.storage.permissionExpired')}
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
                    {t('settings.storage.browserStorage')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t('settings.storage.browserStorageDesc')}
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
                {storage.type === 'filesystem' ? t('settings.storage.selectOtherFolder') : t('settings.storage.selectFolder')}
              </button>

              {storage.type === 'filesystem' && isInitialized && (
                <div className="flex gap-2">
                  <button
                    onClick={handleManualSave}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {t('settings.storage.saveToFolder')}
                  </button>
                  <button
                    onClick={handleLoadFromFile}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    {t('settings.storage.loadFromFolder')}
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
                    {t('settings.storage.notSupported')}
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {t('settings.storage.useChromeEdge')}
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
              <p className="font-medium text-gray-800">{t('settings.storage.autoSave')}</p>
              <p className="text-sm text-gray-500">
                {t('settings.storage.autoSaveDesc')}
              </p>
            </div>
          </label>
        </div>
      </section>

      {/* 수동 백업/복원 */}
      <section className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-amber-600" />
          {t('settings.storage.backupRestore')}
        </h3>

        <p className="text-sm text-gray-600 mb-4">
          {t('settings.storage.backupRestoreDesc')}
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
            {t('settings.storage.exportJson')}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {t('settings.storage.importJson')}
          </button>

          <button
            onClick={handleResetToSamples}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            {t('settings.storage.loadSamples')}
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          {t('settings.storage.currentRecipes')}: {recipes.length}
        </p>
      </section>

      {/* 안내 */}
      <section className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">{t('settings.storage.infoTitle')}</p>
            <ul className="space-y-1 text-blue-700">
              <li>- {t('settings.storage.infoLine1')}</li>
              <li>- {t('settings.storage.infoLine2')}</li>
              <li className="ml-4">• <code className="bg-blue-100 px-1 rounded">recipes.json</code> - {t('settings.storage.infoRecipesFile')}</li>
              <li className="ml-4">• <code className="bg-blue-100 px-1 rounded">settings.json</code> - {t('settings.storage.infoSettingsFile')}</li>
              <li>- {t('settings.storage.infoLine3')}</li>
              <li>- {t('settings.storage.infoLine4')}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
