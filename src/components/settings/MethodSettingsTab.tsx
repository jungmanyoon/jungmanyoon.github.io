/**
 * 제법 설정 탭
 * 스트레이트, 중종법, 폴리쉬, 비가, 르방, 저온발효, 저온숙성, 오토리즈 설정
 *
 * 적용: --persona-backend (제법 계산 로직)
 */

import { useState, useMemo, useCallback } from 'react'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { MethodConfig } from '@/types/settings.types'
import {
  FlaskConical,
  Clock,
  Thermometer,
  Save,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  Beaker
} from 'lucide-react'

// 제법 아이콘 및 색상
const METHOD_META: Record<string, { icon: string; color: string; description: string }> = {
  straight: {
    icon: '🥖',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    description: '모든 재료를 한 번에 믹싱하는 기본 방식'
  },
  sponge: {
    icon: '🧪',
    color: 'bg-amber-100 text-amber-700 border-amber-300',
    description: '밀가루 60%로 중종 반죽 후 본반죽'
  },
  poolish: {
    icon: '🫧',
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: '밀가루:물 = 1:1 비율의 액종 (프랑스식)'
  },
  biga: {
    icon: '🇮🇹',
    color: 'bg-green-100 text-green-700 border-green-300',
    description: '단단한 사전반죽 (이탈리아식)'
  },
  tangzhong: {
    icon: '🍜',
    color: 'bg-pink-100 text-pink-700 border-pink-300',
    description: '밀가루:물 = 1:5 비율로 호화시킨 탕종 사용'
  },
  levain: {
    icon: '🌾',
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    description: '천연 발효종 사용 (사워도우)'
  },
  coldFerment: {
    icon: '❄️',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    description: '냉장고에서 12~72시간 발효'
  },
  retard: {
    icon: '🌙',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    description: '성형 후 냉장 숙성'
  },
  autolyse: {
    icon: '💧',
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    description: '밀가루+물 휴지 후 나머지 투입'
  }
}

interface MethodSettingsTabProps {
  className?: string
}

export default function MethodSettingsTab({ className = '' }: MethodSettingsTabProps) {
  const {
    method,
    updateMethod,
    setYeastConversion,
    setBaseTemperature,
    setBaseSaltPercent,
    resetToDefaults
  } = useSettingsStore()

  const [expandedMethod, setExpandedMethod] = useState<string | null>(null)
  const [editingMethod, setEditingMethod] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<MethodConfig>>({})

  // 정렬된 제법 목록
  const sortedMethods = useMemo(() => {
    const order = ['straight', 'sponge', 'poolish', 'biga', 'tangzhong', 'levain', 'coldFerment', 'retard', 'autolyse']
    return order
      .filter(methodId => method.methods[methodId])
      .map(methodId => method.methods[methodId])
  }, [method.methods])

  // 편집 시작
  const startEditing = useCallback((methodId: string) => {
    const m = method.methods[methodId]
    setEditForm({
      flourRatio: m.flourRatio,
      waterRatio: m.waterRatio,
      yeastAdjustment: m.yeastAdjustment,
      prefermentTime: { ...m.prefermentTime },
      prefermentTemp: { ...m.prefermentTemp },
      mainDoughTime: { ...m.mainDoughTime },
      description: m.description
    })
    setEditingMethod(methodId)
    setExpandedMethod(methodId)
  }, [method.methods])

  // 저장
  const handleSave = useCallback(() => {
    if (!editingMethod) return
    updateMethod(editingMethod, editForm)
    setEditingMethod(null)
    setEditForm({})
  }, [editingMethod, editForm, updateMethod])

  // 취소
  const handleCancel = useCallback(() => {
    setEditingMethod(null)
    setEditForm({})
  }, [])

  // 제법 카드 렌더링
  const renderMethodCard = (m: MethodConfig) => {
    const meta = METHOD_META[m.id] || METHOD_META.straight
    const isExpanded = expandedMethod === m.id
    const isEditing = editingMethod === m.id

    return (
      <div
        key={m.id}
        className={`border rounded-lg overflow-hidden transition-all ${meta.color.split(' ')[0]} ${
          isEditing ? 'ring-2 ring-orange-400' : ''
        }`}
      >
        {/* 헤더 */}
        <button
          onClick={() => setExpandedMethod(isExpanded ? null : m.id)}
          className={`w-full flex items-center justify-between p-4 text-left ${meta.color}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{meta.icon}</span>
            <div>
              <div className="font-semibold">{m.nameKo}</div>
              <div className="text-xs opacity-75">{m.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {m.flourRatio > 0 && (
              <span className="text-xs px-2 py-0.5 bg-white/50 rounded">
                사전반죽 {(m.flourRatio * 100).toFixed(0)}%
              </span>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </button>

        {/* 상세 정보 */}
        {isExpanded && (
          <div className="p-4 bg-white border-t space-y-4">
            <p className="text-sm text-gray-600 italic">{meta.description}</p>

            {isEditing ? (
              // 편집 모드
              <div className="space-y-4">
                {/* 사전반죽 비율 */}
                {m.id !== 'straight' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        밀가루 비율 (사전반죽)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={(editForm.flourRatio || 0) * 100}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            flourRatio: parseFloat(e.target.value) / 100 || 0
                          }))}
                          min="0"
                          max="100"
                          step="5"
                          className="w-full px-2 py-1.5 text-sm border rounded text-right font-mono"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        수분 비율 (베이커스%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={(editForm.waterRatio || 0) * 100}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            waterRatio: parseFloat(e.target.value) / 100 || 0
                          }))}
                          min="0"
                          max="150"
                          step="5"
                          className="w-full px-2 py-1.5 text-sm border rounded text-right font-mono"
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 이스트 조정 */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    이스트 조정 계수
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="150"
                      step="5"
                      value={(editForm.yeastAdjustment || 1) * 100}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        yeastAdjustment: parseFloat(e.target.value) / 100
                      }))}
                      className="flex-1"
                    />
                    <span className="w-16 text-sm text-gray-600 font-mono text-right">
                      {((editForm.yeastAdjustment || 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {(editForm.yeastAdjustment || 1) === 0
                      ? '이스트 없음 (천연발효종 사용)'
                      : `원래 양의 ${((editForm.yeastAdjustment || 1) * 100).toFixed(0)}% 사용`
                    }
                  </p>
                </div>

                {/* 발효 시간 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      사전반죽 시간 (시간)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editForm.prefermentTime?.min || 0}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          prefermentTime: {
                            ...prev.prefermentTime!,
                            min: parseFloat(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono"
                        step="0.5"
                        min="0"
                      />
                      <span className="text-gray-400">~</span>
                      <input
                        type="number"
                        value={editForm.prefermentTime?.max || 0}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          prefermentTime: {
                            ...prev.prefermentTime!,
                            max: parseFloat(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono"
                        step="0.5"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      사전반죽 온도 (°C)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editForm.prefermentTemp?.min || 0}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          prefermentTemp: {
                            ...prev.prefermentTemp!,
                            min: parseFloat(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono"
                      />
                      <span className="text-gray-400">~</span>
                      <input
                        type="number"
                        value={editForm.prefermentTemp?.max || 0}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          prefermentTemp: {
                            ...prev.prefermentTemp!,
                            max: parseFloat(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    저장
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                  >
                    취소
                  </button>
                </div>
              </div>
            ) : (
              // 보기 모드
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {m.flourRatio > 0 && (
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">밀가루</div>
                      <div className="font-mono font-medium">{(m.flourRatio * 100).toFixed(0)}%</div>
                    </div>
                  )}
                  {m.waterRatio > 0 && (
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">수분</div>
                      <div className="font-mono font-medium">{(m.waterRatio * 100).toFixed(0)}%</div>
                    </div>
                  )}
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-500">이스트</div>
                    <div className="font-mono font-medium">
                      {m.yeastAdjustment === 0
                        ? '없음'
                        : `${(m.yeastAdjustment * 100).toFixed(0)}%`
                      }
                    </div>
                  </div>
                  {(m.prefermentTime.min > 0 || m.prefermentTime.max > 0) && (
                    <div className="p-2 bg-gray-50 rounded">
                      <div className="text-xs text-gray-500">발효 시간</div>
                      <div className="font-mono font-medium">
                        {m.prefermentTime.min}~{m.prefermentTime.max}h
                      </div>
                    </div>
                  )}
                </div>

                {(m.prefermentTemp.min > 0 || m.prefermentTemp.max > 0) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Thermometer className="w-4 h-4 text-gray-400" />
                    발효 온도: {m.prefermentTemp.min}~{m.prefermentTemp.max}°C
                  </div>
                )}

                <button
                  onClick={() => startEditing(m.id)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  설정 수정 →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-orange-500" />
          제법 설정
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          각 제법의 이스트 양, 발효 시간, 온도 설정을 커스터마이징합니다.
        </p>
      </div>

      {/* 이스트 변환 비율 */}
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
        <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
          <Beaker className="w-4 h-4" />
          이스트 변환 비율
        </h4>
        <p className="text-xs text-amber-600 mb-3">
          생이스트 기준 (1.0)으로 다른 이스트 종류의 변환 비율을 설정합니다.
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">생이스트</label>
            <input
              type="number"
              value={method.yeastConversion.fresh}
              onChange={(e) => setYeastConversion('fresh', parseFloat(e.target.value) || 1)}
              step="0.1"
              min="0.1"
              max="2"
              className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono bg-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">액티브 드라이</label>
            <input
              type="number"
              value={method.yeastConversion.activeDry}
              onChange={(e) => setYeastConversion('activeDry', parseFloat(e.target.value) || 0.4)}
              step="0.05"
              min="0.1"
              max="1"
              className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono bg-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">인스턴트</label>
            <input
              type="number"
              value={method.yeastConversion.instant}
              onChange={(e) => setYeastConversion('instant', parseFloat(e.target.value) || 0.33)}
              step="0.05"
              min="0.1"
              max="1"
              className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono bg-white"
            />
          </div>
        </div>
        <div className="mt-3 text-xs text-amber-600">
          <Info className="w-3 h-3 inline mr-1" />
          예: 생이스트 10g = 인스턴트 {(10 * method.yeastConversion.instant).toFixed(1)}g
        </div>
      </div>

      {/* 기준 온도/소금 설정 */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          발효 시간 계산 기준
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              기준 온도 (°C)
            </label>
            <input
              type="number"
              value={method.baseTemperature}
              onChange={(e) => setBaseTemperature(parseInt(e.target.value) || 26)}
              min="20"
              max="32"
              className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono bg-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              이 온도 기준으로 발효 시간이 조정됩니다
            </p>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              기준 소금 비율 (%)
            </label>
            <input
              type="number"
              value={method.baseSaltPercent}
              onChange={(e) => setBaseSaltPercent(parseFloat(e.target.value) || 1.5)}
              min="0.5"
              max="3"
              step="0.1"
              className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono bg-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              소금이 더 많으면 발효가 느려집니다
            </p>
          </div>
        </div>
      </div>

      {/* 제법 목록 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-700">제법별 설정</h4>
          <button
            onClick={() => {
              if (confirm('모든 제법 설정을 기본값으로 초기화하시겠습니까?')) {
                resetToDefaults('method')
              }
            }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="w-4 h-4" />
            기본값으로
          </button>
        </div>

        {sortedMethods.map(m => renderMethodCard(m))}
      </div>

      {/* 발효 공식 설명 */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
        <h4 className="font-medium text-gray-700 mb-2">발효 시간 계산 공식</h4>
        <div className="space-y-1 text-xs font-mono">
          <div>온도 계수 = 2^((실제온도 - 기준온도) / 10)</div>
          <div>소금 계수 = 1 / (1 - (소금% - 기준소금%) × 0.15)</div>
          <div>조정된 시간 = 기본시간 / 온도계수 × 소금계수</div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          온도가 10°C 오르면 발효 속도가 약 2배 빨라집니다.
        </div>
      </div>
    </div>
  )
}
