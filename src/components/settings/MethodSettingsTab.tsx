/**
 * 제법 설정 탭
 * 스트레이트, 중종법, 폴리쉬, 비가, 르방, 저온발효, 저온숙성, 오토리즈 설정
 *
 * 적용: --persona-backend (제법 계산 로직)
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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

// 제법 아이콘 및 색상 (description은 번역 키로 대체)
const METHOD_META: Record<string, { icon: string; color: string }> = {
  straight: {
    icon: '🥖',
    color: 'bg-surface-muted text-ink-muted border-line'
  },
  sponge: {
    icon: '🧪',
    color: 'bg-amber-100 text-amber-700 border-amber-300'
  },
  poolish: {
    icon: '🫧',
    color: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  biga: {
    icon: '🇮🇹',
    color: 'bg-green-100 text-green-700 border-green-300'
  },
  tangzhong: {
    icon: '🍜',
    color: 'bg-pink-100 text-pink-700 border-pink-300'
  },
  levain: {
    icon: '🌾',
    color: 'bg-orange-100 text-orange-700 border-orange-300'
  },
  coldFerment: {
    icon: '❄️',
    color: 'bg-cyan-100 text-cyan-700 border-cyan-300'
  },
  retard: {
    icon: '🌙',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-300'
  },
  autolyse: {
    icon: '💧',
    color: 'bg-purple-100 text-purple-700 border-purple-300'
  }
}

interface MethodSettingsTabProps {
  className?: string
}

export default function MethodSettingsTab({ className = '' }: MethodSettingsTabProps) {
  const { t } = useTranslation()
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
              <div className="font-semibold">{t(`settings.method.methods.${m.id}.name`)}</div>
              <div className="text-xs opacity-75">{m.name}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {m.flourRatio > 0 && (
              <span className="text-xs px-2 py-0.5 bg-white/50 rounded">
                {t('settings.method.preferment')} {(m.flourRatio * 100).toFixed(0)}%
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
          <div className="p-4 bg-surface-paper border-t space-y-4">
            <p className="text-sm text-ink-muted italic">{t(`settings.method.methods.${m.id}.desc`)}</p>

            {isEditing ? (
              // 편집 모드
              <div className="space-y-4">
                {/* 사전반죽 비율 */}
                {m.id !== 'straight' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-ink-subtle mb-1">
                        {t('settings.method.flourRatio')}
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
                        <span className="text-sm text-ink-subtle">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-ink-subtle mb-1">
                        {t('settings.method.waterRatio')}
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
                        <span className="text-sm text-ink-subtle">%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 이스트 조정 */}
                <div>
                  <label className="block text-xs text-ink-subtle mb-1">
                    {t('settings.method.yeastAdjust')}
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
                    <span className="w-16 text-sm text-ink-muted font-mono text-right">
                      {((editForm.yeastAdjustment || 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-ink-disabled mt-1">
                    {(editForm.yeastAdjustment || 1) === 0
                      ? t('settings.method.yeastNone')
                      : t('settings.method.yeastAmount', { percent: ((editForm.yeastAdjustment || 1) * 100).toFixed(0) })
                    }
                  </p>
                </div>

                {/* 발효 시간 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-ink-subtle mb-1">
                      {t('settings.method.prefermentTime')}
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
                      <span className="text-ink-disabled">~</span>
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
                    <label className="block text-xs text-ink-subtle mb-1">
                      {t('settings.method.prefermentTemp')}
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
                      <span className="text-ink-disabled">~</span>
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
                    {t('common.save')}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 border border-line rounded hover:bg-surface-muted text-sm"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              // 보기 모드
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  {m.flourRatio > 0 && (
                    <div className="p-2 bg-surface-muted rounded">
                      <div className="text-xs text-ink-subtle">{t('settings.method.flour')}</div>
                      <div className="font-mono font-medium">{(m.flourRatio * 100).toFixed(0)}%</div>
                    </div>
                  )}
                  {m.waterRatio > 0 && (
                    <div className="p-2 bg-surface-muted rounded">
                      <div className="text-xs text-ink-subtle">{t('settings.method.water')}</div>
                      <div className="font-mono font-medium">{(m.waterRatio * 100).toFixed(0)}%</div>
                    </div>
                  )}
                  <div className="p-2 bg-surface-muted rounded">
                    <div className="text-xs text-ink-subtle">{t('settings.method.yeast')}</div>
                    <div className="font-mono font-medium">
                      {m.yeastAdjustment === 0
                        ? t('settings.method.none')
                        : `${(m.yeastAdjustment * 100).toFixed(0)}%`
                      }
                    </div>
                  </div>
                  {(m.prefermentTime.min > 0 || m.prefermentTime.max > 0) && (
                    <div className="p-2 bg-surface-muted rounded">
                      <div className="text-xs text-ink-subtle">{t('settings.method.fermentationTime')}</div>
                      <div className="font-mono font-medium">
                        {m.prefermentTime.min}~{m.prefermentTime.max}h
                      </div>
                    </div>
                  )}
                </div>

                {(m.prefermentTemp.min > 0 || m.prefermentTemp.max > 0) && (
                  <div className="flex items-center gap-2 text-sm text-ink-muted">
                    <Thermometer className="w-4 h-4 text-ink-disabled" />
                    {t('settings.method.fermentationTemp')}: {m.prefermentTemp.min}~{m.prefermentTemp.max}°C
                  </div>
                )}

                <button
                  onClick={() => startEditing(m.id)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('settings.method.editSettings')}
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
        <h3 className="text-lg font-semibold text-ink flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-orange-500" />
          {t('settings.method.title')}
        </h3>
        <p className="text-sm text-ink-subtle mt-1">
          {t('settings.method.titleDesc')}
        </p>
      </div>

      {/* 이스트 변환 비율 */}
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
        <h4 className="font-medium text-amber-800 mb-3 flex items-center gap-2">
          <Beaker className="w-4 h-4" />
          {t('settings.method.yeastConversion')}
        </h4>
        <p className="text-xs text-amber-600 mb-3">
          {t('settings.method.yeastConversionDesc')}
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-ink-subtle mb-1">{t('settings.method.freshYeast')}</label>
            <input
              type="number"
              value={method.yeastConversion.fresh}
              onChange={(e) => setYeastConversion('fresh', parseFloat(e.target.value) || 1)}
              step="0.1"
              min="0.1"
              max="2"
              className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono bg-surface-paper"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-subtle mb-1">{t('settings.method.activeDry')}</label>
            <input
              type="number"
              value={method.yeastConversion.activeDry}
              onChange={(e) => setYeastConversion('activeDry', parseFloat(e.target.value) || 0.4)}
              step="0.05"
              min="0.1"
              max="1"
              className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono bg-surface-paper"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-subtle mb-1">{t('settings.method.instant')}</label>
            <input
              type="number"
              value={method.yeastConversion.instant}
              onChange={(e) => setYeastConversion('instant', parseFloat(e.target.value) || 0.33)}
              step="0.05"
              min="0.1"
              max="1"
              className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono bg-surface-paper"
            />
          </div>
        </div>
        <div className="mt-3 text-xs text-amber-600">
          <Info className="w-3 h-3 inline mr-1" />
          {t('settings.method.yeastExample', { value: (10 * method.yeastConversion.instant).toFixed(1) })}
        </div>
      </div>

      {/* 기준 온도/소금 설정 */}
      <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {t('settings.method.fermentationBase')}
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-ink-subtle mb-1">
              {t('settings.method.baseTemp')}
            </label>
            <input
              type="number"
              value={method.baseTemperature}
              onChange={(e) => setBaseTemperature(parseInt(e.target.value) || 26)}
              min="20"
              max="32"
              className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono bg-surface-paper"
            />
            <p className="text-xs text-ink-disabled mt-1">
              {t('settings.method.baseTempDesc')}
            </p>
          </div>
          <div>
            <label className="block text-xs text-ink-subtle mb-1">
              {t('settings.method.baseSalt')}
            </label>
            <input
              type="number"
              value={method.baseSaltPercent}
              onChange={(e) => setBaseSaltPercent(parseFloat(e.target.value) || 1.5)}
              min="0.5"
              max="3"
              step="0.1"
              className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono bg-surface-paper"
            />
            <p className="text-xs text-ink-disabled mt-1">
              {t('settings.method.baseSaltDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* 제법 목록 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-ink-muted">{t('settings.method.methodSettings')}</h4>
          <button
            onClick={() => {
              if (confirm(t('settings.method.resetConfirm'))) {
                resetToDefaults('method')
              }
            }}
            className="flex items-center gap-1 text-sm text-ink-subtle hover:text-ink-muted"
          >
            <RotateCcw className="w-4 h-4" />
            {t('settings.method.resetToDefault')}
          </button>
        </div>

        {sortedMethods.map(m => renderMethodCard(m))}
      </div>

      {/* 발효 공식 설명 */}
      <div className="p-4 bg-surface-muted border border-line rounded-lg text-sm text-ink-muted">
        <h4 className="font-medium text-ink-muted mb-2">{t('settings.method.formulaTitle')}</h4>
        <div className="space-y-1 text-xs font-mono">
          <div>{t('settings.method.formulaTempCoef')}</div>
          <div>{t('settings.method.formulaSaltCoef')}</div>
          <div>{t('settings.method.formulaAdjustedTime')}</div>
        </div>
        <div className="mt-2 text-xs text-ink-subtle">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          {t('settings.method.formulaNote')}
        </div>
      </div>
    </div>
  )
}
