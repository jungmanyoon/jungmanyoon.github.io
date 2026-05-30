/**
 * 설정 페이지 - 모든 설정 탭 통합
 * 사용자 커스터마이징을 위한 종합 설정 페이지
 *
 * 적용: --persona-frontend (UX) + --persona-architect (구조 설계)
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/useSettingsStore'
import PanSettingsTab from './PanSettingsTab'
import ProductSettingsTab from './ProductSettingsTab'
import EnvironmentSettingsTab from './EnvironmentSettingsTab'
import MethodSettingsTab from './MethodSettingsTab'
import YieldLossSettingsTab from './YieldLossSettingsTab'
import IngredientSettingsTab from './IngredientSettingsTab'
import AdvancedSettingsTab from './AdvancedSettingsTab'
import StorageSettingsTab from './StorageSettingsTab'
import LocaleSettingsTab from './LocaleSettingsTab'
import {
  Settings,
  Box,
  Thermometer,
  FlaskConical,
  TrendingDown,
  Apple,
  Cog,
  Download,
  Upload,
  RotateCcw,
  X,
  Check,
  AlertTriangle,
  ChevronLeft,
  Scale,
  HardDrive,
  Globe
} from 'lucide-react'

// 탭 정의 (번역 키 사용)
const TABS = [
  {
    id: 'locale',
    nameKey: 'settingsTabs.locale',
    icon: Globe,
    // 무지개 색상 제거 -> brand 체계로 통일 (active=brand, inactive=gray)
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
    descKey: 'settingsTabs.localeDesc'
  },
  {
    id: 'storage',
    nameKey: 'settingsTabs.storage',
    icon: HardDrive,
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
    descKey: 'settingsTabs.storageDesc'
  },
  {
    id: 'pan',
    nameKey: 'settingsTabs.pan',
    icon: Box,
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
    descKey: 'settingsTabs.panDesc'
  },
  {
    id: 'product',
    nameKey: 'settingsTabs.product',
    icon: Scale,
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
    descKey: 'settingsTabs.productDesc'
  },
  {
    id: 'environment',
    nameKey: 'settingsTabs.environment',
    icon: Thermometer,
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
    descKey: 'settingsTabs.environmentDesc'
  },
  {
    id: 'method',
    nameKey: 'settingsTabs.method',
    icon: FlaskConical,
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
    descKey: 'settingsTabs.methodDesc'
  },
  {
    id: 'yieldLoss',
    nameKey: 'settingsTabs.yieldLoss',
    icon: TrendingDown,
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
    descKey: 'settingsTabs.yieldLossDesc'
  },
  {
    id: 'ingredient',
    nameKey: 'settingsTabs.ingredient',
    icon: Apple,
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
    descKey: 'settingsTabs.ingredientDesc'
  },
  {
    id: 'advanced',
    nameKey: 'settingsTabs.advanced',
    icon: Cog,
    // 이미 무채색이었으나 active 시 brand로 통일해 일관성 확보
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    borderColor: 'border-brand-200',
    descKey: 'settingsTabs.advancedDesc'
  }
]

interface SettingsPageProps {
  className?: string
  onClose?: () => void
  initialTab?: string
}

export default function SettingsPage({
  className = '',
  onClose,
  initialTab = 'locale'
}: SettingsPageProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [showExportModal, setShowExportModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importData, setImportData] = useState('')
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)

  const { exportSettings, importSettings, resetAllSettings } = useSettingsStore()

  // 내보내기 처리
  const handleExport = useCallback(() => {
    const data = exportSettings()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recipe-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setShowExportModal(false)
  }, [exportSettings])

  // 가져오기 처리
  const handleImport = useCallback(() => {
    setImportError('')
    setImportSuccess(false)

    if (!importData.trim()) {
      setImportError(t('settings.modal.enterData'))
      return
    }

    const success = importSettings(importData)
    if (success) {
      setImportSuccess(true)
      setTimeout(() => {
        setShowImportModal(false)
        setImportData('')
        setImportSuccess(false)
      }, 1500)
    } else {
      setImportError(t('settings.modal.invalidFormat'))
    }
  }, [importData, importSettings, t])

  // 파일로 가져오기
  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setImportData(content)
    }
    reader.readAsText(file)
  }, [])

  // 초기화 처리
  const handleResetAll = useCallback(() => {
    if (confirm(t('settings.modal.resetConfirm'))) {
      if (confirm(t('settings.modal.resetConfirm2'))) {
        resetAllSettings()
      }
    }
  }, [resetAllSettings, t])

  // 탭 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'locale':
        return <LocaleSettingsTab />
      case 'storage':
        return <StorageSettingsTab />
      case 'pan':
        return <PanSettingsTab />
      case 'product':
        return <ProductSettingsTab />
      case 'environment':
        return <EnvironmentSettingsTab />
      case 'method':
        return <MethodSettingsTab />
      case 'yieldLoss':
        return <YieldLossSettingsTab />
      case 'ingredient':
        return <IngredientSettingsTab />
      case 'advanced':
        return <AdvancedSettingsTab />
      default:
        return <StorageSettingsTab />
    }
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4">
          {/* 모바일: 헤더 버튼이 많아 가로 넘침 방지를 위해 gap 축소, 버튼 라벨은 sm 이상에서만 표시 */}
          <div className="flex items-center justify-between gap-2 h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center justify-center min-w-[44px] min-h-[44px] hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-2 min-w-0">
                <Settings className="w-6 h-6 text-gray-600 flex-shrink-0" />
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">{t('settings.title')}</h1>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* 터치타깃 44px 보장(min-h-[44px]), 모바일은 아이콘만/데스크톱은 라벨 동반 */}
              <button
                onClick={() => setShowExportModal(true)}
                aria-label={t('common.export')}
                className="flex items-center justify-center gap-1 min-h-[44px] px-2 sm:px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.export')}</span>
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                aria-label={t('common.import')}
                className="flex items-center justify-center gap-1 min-h-[44px] px-2 sm:px-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.import')}</span>
              </button>
              <button
                onClick={handleResetAll}
                aria-label={t('common.reset')}
                className="flex items-center justify-center gap-1 min-h-[44px] px-2 sm:px-3 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common.reset')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
        {/* 모바일: 세로 스택(flex-col) + 데스크톱: 좌측 탭 2단 레이아웃(lg:flex-row) 보존 */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* 모바일: 상단 가로 스크롤 탭바 / 데스크톱(lg:): 좌측 세로 사이드바 보존 */}
          <div className="w-full lg:w-56 lg:flex-shrink-0">
            {/* 모바일은 가로 스크롤(overflow-x-auto)로 탭 노출, 데스크톱은 세로 정렬 */}
            <nav className="flex flex-row lg:flex-col gap-1 lg:space-y-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0 lg:sticky lg:top-24">
              {TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 lg:gap-3 min-h-[44px] flex-shrink-0 lg:w-full px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left whitespace-nowrap lg:whitespace-normal transition-all ${
                      isActive
                        ? `${tab.bgColor} ${tab.borderColor} border-2`
                        : 'hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? tab.color : 'text-gray-400'}`} />
                    <div className="min-w-0">
                      <div className={`text-sm font-medium ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                        {t(tab.nameKey)}
                      </div>
                      {/* 설명문은 데스크톱에서만 노출(모바일 가로 탭에서는 폭 절약 위해 숨김) */}
                      <div className="hidden lg:block text-xs text-gray-500 truncate">
                        {t(tab.descKey)}
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* 메인 콘텐츠 - 모바일 전체 폭 */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* 내보내기 모달 */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-md p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('settings.modal.exportTitle')}</h3>
              <button
                onClick={() => setShowExportModal(false)}
                aria-label={t('common.cancel')}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {t('settings.modal.exportDesc')}
            </p>
            {/* 모바일: 버튼 세로 스택 / 데스크톱: 우측 정렬 가로 배치 보존 */}
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="min-h-[44px] px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-1 min-h-[44px] px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                <Download className="w-4 h-4" />
                {t('common.download')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 가져오기 모달 */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{t('settings.modal.importTitle')}</h3>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportData('')
                  setImportError('')
                  setImportSuccess(false)
                }}
                aria-label={t('common.cancel')}
                className="flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importSuccess ? (
              <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                <Check className="w-5 h-5" />
                {t('settings.modal.importSuccess')}
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.modal.selectFile')}
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.modal.orPaste')}
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='{"pan": {...}, "method": {...}, ...}'
                    rows={6}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono resize-none"
                  />
                </div>

                {importError && (
                  <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    {importError}
                  </div>
                )}

                {/* 모바일: 버튼 세로 스택 / 데스크톱: 우측 정렬 가로 배치 보존 */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                  <button
                    onClick={() => {
                      setShowImportModal(false)
                      setImportData('')
                      setImportError('')
                    }}
                    className="min-h-[44px] px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importData.trim()}
                    className="flex items-center justify-center gap-1 min-h-[44px] px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    {t('common.import')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
