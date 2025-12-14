/**
 * 고급 설정 탭
 * 믹서 마찰열, 단위, 정밀도, 전문가 모드
 *
 * 적용: --persona-frontend (UX) + --persona-backend (계산 설정)
 */

import { useState, useCallback } from 'react'
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

// 믹서 타입 정보
const MIXER_TYPES: { key: keyof AdvancedSettings['mixerFriction']; name: string; icon: React.ReactNode; description: string; defaultValue: number }[] = [
  {
    key: 'hand',
    name: '손반죽',
    icon: <Hand className="w-5 h-5" />,
    description: '손으로 직접 반죽',
    defaultValue: 0
  },
  {
    key: 'stand',
    name: '스탠드 믹서',
    icon: <Coffee className="w-5 h-5" />,
    description: '키친에이드 등 가정용',
    defaultValue: 24
  },
  {
    key: 'spiral',
    name: '스파이럴 믹서',
    icon: <Zap className="w-5 h-5" />,
    description: '제과점용 전문 믹서',
    defaultValue: 22
  },
  {
    key: 'planetary',
    name: '플래니터리 믹서',
    icon: <Settings className="w-5 h-5" />,
    description: '대용량 제과점용',
    defaultValue: 26
  }
]

// 단위 옵션
const UNIT_OPTIONS = {
  weight: [
    { value: 'g', label: '그램 (g)' },
    { value: 'oz', label: '온스 (oz)' }
  ],
  volume: [
    { value: 'ml', label: '밀리리터 (ml)' },
    { value: 'cup', label: '컵 (cup)' }
  ],
  temperature: [
    { value: 'C', label: '섭씨 (°C)' },
    { value: 'F', label: '화씨 (°F)' }
  ]
}

// 정밀도 옵션
const PRECISION_OPTIONS = [
  { value: 0, label: '정수 (10g)', description: '반올림하여 정수만 표시' },
  { value: 1, label: '소수점 1자리 (10.5g)', description: '일반적인 제과제빵 계량' },
  { value: 2, label: '소수점 2자리 (10.50g)', description: '정밀한 계량이 필요할 때' }
]

interface AdvancedSettingsTabProps {
  className?: string
}

export default function AdvancedSettingsTab({ className = '' }: AdvancedSettingsTabProps) {
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
            고급 설정
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            계산 정밀도, 단위, 전문가 옵션을 설정합니다.
          </p>
        </div>
        <button
          onClick={() => {
            if (confirm('모든 고급 설정을 기본값으로 초기화하시겠습니까?')) {
              resetToDefaults('advanced')
            }
          }}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-4 h-4" />
          기본값으로
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
              <div className="font-medium text-gray-800">전문가 모드</div>
              <div className="text-xs text-gray-500">
                고급 옵션과 상세 정보를 더 많이 표시합니다
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
            전문가 모드에서는 추가적인 계산 옵션과 상세 정보가 표시됩니다.
          </div>
        )}
      </div>

      {/* 믹서 마찰열 설정 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              믹서 마찰열 (Friction Factor)
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              DDT 계산 시 믹싱 과정에서 발생하는 온도 상승값
            </p>
          </div>
          <button
            onClick={() => setShowMixerInfo(!showMixerInfo)}
            className="text-xs text-blue-600 hover:text-blue-700"
          >
            {showMixerInfo ? '접기' : '자세히 보기'}
          </button>
        </div>

        {showMixerInfo && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-700">
            <p className="font-medium mb-2">마찰열이란?</p>
            <p className="text-xs">
              반죽 시 믹서의 회전으로 인해 반죽 온도가 상승합니다.
              이 온도 상승분을 '마찰열(Friction Factor)'이라고 합니다.
              DDT(Desired Dough Temperature) 계산에 사용됩니다.
            </p>
            <div className="mt-2 text-xs">
              <strong>공식:</strong> 물 온도 = (DDT × 3) - 실온 - 밀가루 온도 - 마찰열
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
                  <span className="font-medium text-sm">{mixer.name}</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{mixer.description}</p>
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
                    기본값 ({mixer.defaultValue}°C)
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
              <span className="font-medium text-sm text-gray-600">커스텀 믹서</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              특수 장비나 개인 측정값을 저장합니다
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={advanced.mixerFriction.custom ?? ''}
                onChange={(e) => handleMixerChange('custom', parseInt(e.target.value) || 0)}
                placeholder="직접 입력"
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
          표시 단위
        </h4>

        <div className="grid grid-cols-3 gap-4">
          {/* 무게 단위 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              무게
            </label>
            <div className="space-y-2">
              {UNIT_OPTIONS.weight.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    advanced.units.weight === opt.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="weight-unit"
                    value={opt.value}
                    checked={advanced.units.weight === opt.value}
                    onChange={() => handleUnitChange('weight', opt.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      advanced.units.weight === opt.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {advanced.units.weight === opt.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 부피 단위 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              부피
            </label>
            <div className="space-y-2">
              {UNIT_OPTIONS.volume.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    advanced.units.volume === opt.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="volume-unit"
                    value={opt.value}
                    checked={advanced.units.volume === opt.value}
                    onChange={() => handleUnitChange('volume', opt.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      advanced.units.volume === opt.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {advanced.units.volume === opt.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 온도 단위 */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Thermometer className="w-4 h-4" />
              온도
            </label>
            <div className="space-y-2">
              {UNIT_OPTIONS.temperature.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                    advanced.units.temperature === opt.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="radio"
                    name="temp-unit"
                    value={opt.value}
                    checked={advanced.units.temperature === opt.value}
                    onChange={() => handleUnitChange('temperature', opt.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      advanced.units.temperature === opt.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {advanced.units.temperature === opt.value && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 정밀도 설정 */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">계산 정밀도</h4>

        <div className="space-y-2">
          {PRECISION_OPTIONS.map(opt => (
            <label
              key={opt.value}
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                advanced.precision === opt.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    advanced.precision === opt.value
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  }`}
                >
                  {advanced.precision === opt.value && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-800">{opt.label}</div>
                  <div className="text-xs text-gray-500">{opt.description}</div>
                </div>
              </div>
              <input
                type="radio"
                name="precision"
                value={opt.value}
                checked={advanced.precision === opt.value}
                onChange={() => setPrecision(opt.value as 0 | 1 | 2)}
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
            <p className="font-medium text-gray-700">설정 팁</p>
            <ul className="text-xs mt-1 space-y-1">
              <li>• 가정용 믹서는 보통 22~26°C의 마찰열이 발생합니다</li>
              <li>• 손반죽은 마찰열이 거의 없지만 체온이 전달될 수 있습니다</li>
              <li>• 정밀도가 높을수록 세밀한 계량이 필요합니다</li>
              <li>• 전문가 모드에서 더 많은 옵션을 확인할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
