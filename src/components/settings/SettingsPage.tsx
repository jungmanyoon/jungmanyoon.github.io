/**
 * 설정 페이지 - 모든 설정 탭 통합
 * 사용자 커스터마이징을 위한 종합 설정 페이지
 *
 * 적용: --persona-frontend (UX) + --persona-architect (구조 설계)
 */

import { useState, useCallback } from 'react'
import { useSettingsStore } from '@/stores/useSettingsStore'
import PanSettingsTab from './PanSettingsTab'
import ProductSettingsTab from './ProductSettingsTab'
import EnvironmentSettingsTab from './EnvironmentSettingsTab'
import MethodSettingsTab from './MethodSettingsTab'
import YieldLossSettingsTab from './YieldLossSettingsTab'
import IngredientSettingsTab from './IngredientSettingsTab'
import AdvancedSettingsTab from './AdvancedSettingsTab'
import StorageSettingsTab from './StorageSettingsTab'
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
  HardDrive
} from 'lucide-react'

// 탭 정의
const TABS = [
  {
    id: 'storage',
    name: '저장소',
    icon: HardDrive,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    description: '데이터 저장 위치 설정'
  },
  {
    id: 'pan',
    name: '팬/틀',
    icon: Box,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: '보유한 팬 등록 및 관리'
  },
  {
    id: 'product',
    name: '제품 비용적',
    icon: Scale,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: '빵/케이크 비용적 설정'
  },
  {
    id: 'environment',
    name: '환경',
    icon: Thermometer,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    description: '온도, 습도, 고도 설정'
  },
  {
    id: 'method',
    name: '제법',
    icon: FlaskConical,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: '중종법, 폴리쉬, 비가, 르방 등'
  },
  {
    id: 'yieldLoss',
    name: '수율',
    icon: TrendingDown,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: '공정별 손실률 설정'
  },
  {
    id: 'ingredient',
    name: '재료',
    icon: Apple,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    description: '커스텀 재료 및 대체재'
  },
  {
    id: 'advanced',
    name: '고급',
    icon: Cog,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    description: '믹서, 단위, 정밀도'
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
  initialTab = 'storage'
}: SettingsPageProps) {
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
      setImportError('데이터를 입력해주세요.')
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
      setImportError('잘못된 형식의 데이터입니다.')
    }
  }, [importData, importSettings])

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
    if (confirm('모든 설정을 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      if (confirm('정말로 초기화하시겠습니까?')) {
        resetAllSettings()
      }
    }
  }, [resetAllSettings])

  // 탭 콘텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
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
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex items-center gap-2">
                <Settings className="w-6 h-6 text-gray-600" />
                <h1 className="text-xl font-bold text-gray-800">설정</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                내보내기
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                가져오기
              </button>
              <button
                onClick={handleResetAll}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 사이드바 - 탭 네비게이션 */}
          <div className="w-56 flex-shrink-0">
            <nav className="space-y-1 sticky top-24">
              {TABS.map(tab => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                      isActive
                        ? `${tab.bgColor} ${tab.borderColor} border-2`
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-gray-400'}`} />
                    <div>
                      <div className={`font-medium ${isActive ? 'text-gray-800' : 'text-gray-600'}`}>
                        {tab.name}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {tab.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

      {/* 내보내기 모달 */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">설정 내보내기</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              현재 설정을 JSON 파일로 저장합니다.
              다른 기기에서 가져오기를 통해 복원할 수 있습니다.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Download className="w-4 h-4" />
                다운로드
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 가져오기 모달 */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">설정 가져오기</h3>
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportData('')
                  setImportError('')
                  setImportSuccess(false)
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importSuccess ? (
              <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-lg">
                <Check className="w-5 h-5" />
                설정을 성공적으로 가져왔습니다!
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    파일 선택
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    또는 직접 붙여넣기
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

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowImportModal(false)
                      setImportData('')
                      setImportError('')
                    }}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!importData.trim()}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-4 h-4" />
                    가져오기
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
