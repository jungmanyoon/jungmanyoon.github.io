/**
 * 고급 설정 탭
 * 믹서 마찰열, 단위, 정밀도, 전문가 모드
 *
 * 적용: --persona-frontend (UX) + --persona-backend (계산 설정)
 */

import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { AdvancedSettings } from '@/types/settings.types'
import {
  Settings,
  Zap,
  Scale,
  Thermometer,
  Eye,
  RotateCcw,
  Info,
  AlertCircle,
  Hand,
  Coffee
} from 'lucide-react'

// 믹서 타입 정보 (키와 아이콘만 정의, 라벨은 번역 사용)
const MIXER_TYPES: { key: keyof AdvancedSettings['mixerFriction']; icon: React.ReactNode; defaultValue: number }[] = [
  { key: 'hand', icon: <Hand className="w-5 h-5" />, defaultValue: 0 },
  { key: 'stand', icon: <Coffee className="w-5 h-5" />, defaultValue: 24 },
  { key: 'spiral', icon: <Zap className="w-5 h-5" />, defaultValue: 22 },
  { key: 'planetary', icon: <Settings className="w-5 h-5" />, defaultValue: 26 }
]

// 단위 옵션 (키만 정의, 라벨은 번역 사용)
const UNIT_OPTIONS = {
  weight: ['g', 'oz'],
  volume: ['ml', 'cup'],
  temperature: ['C', 'F']
}

// 정밀도 옵션 (값만 정의, 라벨은 번역 사용)
const PRECISION_OPTIONS = [0, 1, 2]

interface AdvancedSettingsTabProps {
  className?: string
}

export default function AdvancedSettingsTab({ className = '' }: AdvancedSettingsTabProps) {
  const { t } = useTranslation()
  const {
    advanced,
    setMixerFriction,
    setUnits,
    setPrecision,
    setExpertMode,
    resetToDefaults
  } = useSettingsStore()

  const [showMixerInfo, setShowMixerInfo] = useState(false)

  // 믹서 마찰열 변경
  const handleMixerChange = useCallback((type: keyof AdvancedSettings['mixerFriction'], value: number) => {
    setMixerFriction(type, value)
  }, [setMixerFriction])

  // 단위 변경
  const handleUnitChange = useCallback((
    unitType: 'weight' | 'volume' | 'temperature',
    value: string
  ) => {
    setUnits({ [unitType]: value as 'g' | 'oz' | 'ml' | 'cup' | 'C' | 'F' })
  }, [setUnits])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            {t('settings.advanced.title')}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('settings.advanced.titleDesc')}
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm(t('settings.advanced.resetConfirm'))) {
              resetToDefaults('advanced')
            }
          }}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-4 h-4" />
          {t('settings.advanced.resetToDefault')}
        </button>
      </div>

      {/* 전문가 모드 */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-lg">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-800">{t('settings.advanced.expertMode.title')}</div>
              <div className="text-xs text-gray-500">
                {t('settings.advanced.expertMode.description')}
              </div>
            </div>
          </div>
          <div
            className={`w-14 h-7 rounded-full transition-colors ${
              advanced.expertMode ? 'bg-purple-500' : 'bg-gray-300'
            } relative cursor-pointer`}
            onClick={() => setExpertMode(!advanced.expertMode)}
          >
            <div
              className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                advanced.expertMode ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </div>
        </label>
        {advanced.expertMode && (
          <div className="mt-3 text-xs text-purple-600 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {t('settings.advanced.expertMode.enabledInfo')}
          </div>
        )}
      </div>

      {/* 믹서 마찰열 설정 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              {t('settings.advanced.mixer.title')}
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('settings.advanced.mixer.titleDesc')}
            </p>
          </div>
          <button
            onClick={() => setShowMixerInfo(!showMixerInfo)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {showMixerInfo ? t('settings.advanced.mixer.showLess') : t('settings.advanced.mixer.showMore')}
          </button>
        </div>

        {showMixerInfo && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
            <p className="font-medium mb-2">{t('settings.advanced.mixer.infoTitle')}</p>
            <p className="text-xs">
              {t('settings.advanced.mixer.infoDesc')}
            </p>
            <div className="mt-2 text-xs">
              <strong>{t('settings.advanced.mixer.formula')}</strong>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MIXER_TYPES.map(mixer => {
            const currentValue = advanced.mixerFriction[mixer.key] ?? mixer.defaultValue
            const isCustom = mixer.key === 'custom'

            return (
              <div
                key={mixer.key}
                className={`p-4 border rounded-lg ${
                  isCustom ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-gray-600">
                  {mixer.icon}
                  <span className="font-medium text-sm">{t(`settings.advanced.mixer.types.${mixer.key}.name`)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{t(`settings.advanced.mixer.types.${mixer.key}.description`)}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={currentValue}
                    onChange={(e) => handleMixerChange(mixer.key, parseInt(e.target.value) || 0)}
                    min="0"
                    max="40"
                    className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono"
                  />
                  <span className="text-sm text-gray-500">°C</span>
                </div>
                {currentValue !== mixer.defaultValue && (
                  <button
                    onClick={() => handleMixerChange(mixer.key, mixer.defaultValue)}
                    className="text-xs text-gray-400 hover:text-gray-600 mt-1"
                  >
                    {t('settings.advanced.mixer.defaultValue', { value: mixer.defaultValue })}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* 커스텀 믹서 */}
        {advanced.expertMode && (
          <div className="p-4 border border-dashed border-gray-300 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-sm text-gray-600">{t('settings.advanced.mixer.custom')}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              {t('settings.advanced.mixer.customDesc')}
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={advanced.mixerFriction.custom ?? ''}
                onChange={(e) => handleMixerChange('custom', parseInt(e.target.value) || 0)}
                placeholder={t('settings.advanced.mixer.customPlaceholder')}
                min="0"
                max="40"
                className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono"
              />
              <span className="text-sm text-gray-500">°C</span>
            </div>
          </div>
        )}
      </div>

      {/* 단위 설정 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-500" />
          {t('settings.advanced.units.title')}
        </h4>

        <div className="grid grid-cols-3 gap-4">
          {/* 무게 단위 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.advanced.units.weight')}
            </label>
            <div className="space-y-2">
              {UNIT_OPTIONS.weight.map(opt => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    advanced.units.weight === opt
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="weight-unit"
                    value={opt}
                    checked={advanced.units.weight === opt}
                    onChange={() => handleUnitChange('weight', opt)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      advanced.units.weight === opt
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {advanced.units.weight === opt && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm">{t(`settings.advanced.units.options.${opt}`)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 부피 단위 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('settings.advanced.units.volume')}
            </label>
            <div className="space-y-2">
              {UNIT_OPTIONS.volume.map(opt => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    advanced.units.volume === opt
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="volume-unit"
                    value={opt}
                    checked={advanced.units.volume === opt}
                    onChange={() => handleUnitChange('volume', opt)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      advanced.units.volume === opt
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {advanced.units.volume === opt && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm">{t(`settings.advanced.units.options.${opt}`)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 온도 단위 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Thermometer className="w-4 h-4" />
              {t('settings.advanced.units.temperature')}
            </label>
            <div className="space-y-2">
              {UNIT_OPTIONS.temperature.map(opt => (
                <label
                  key={opt}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    advanced.units.temperature === opt
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="temp-unit"
                    value={opt}
                    checked={advanced.units.temperature === opt}
                    onChange={() => handleUnitChange('temperature', opt)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      advanced.units.temperature === opt
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {advanced.units.temperature === opt && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm">{t(`settings.advanced.units.options.${opt}`)}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 정밀도 설정 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">{t('settings.advanced.precision.title')}</h4>

        <div className="space-y-2">
          {PRECISION_OPTIONS.map(opt => (
            <label
              key={opt}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                advanced.precision === opt
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    advanced.precision === opt
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {advanced.precision === opt && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{t(`settings.advanced.precision.options.${opt}.label`)}</div>
                  <div className="text-xs text-gray-500">{t(`settings.advanced.precision.options.${opt}.description`)}</div>
                </div>
              </div>
              <input
                type="radio"
                name="precision"
                value={opt}
                checked={advanced.precision === opt}
                onChange={() => setPrecision(opt as 0 | 1 | 2)}
                className="sr-only"
              />
            </label>
          ))}
        </div>
      </div>

      {/* 팁 */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-700">{t('settings.advanced.tips.title')}</p>
            <ul className="text-xs mt-1 space-y-1">
              <li>• {t('settings.advanced.tips.mixer')}</li>
              <li>• {t('settings.advanced.tips.hand')}</li>
              <li>• {t('settings.advanced.tips.precision')}</li>
              <li>• {t('settings.advanced.tips.expert')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
