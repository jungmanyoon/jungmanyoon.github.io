/**
 * 환경 설정 탭
 * 온도, 습도, 고도 설정 및 프로필 관리
 *
 * 적용: --persona-frontend (UX) + --persona-backend (발효 계산)
 */

import { useState, useMemo, useCallback } from 'react'
import { useSettingsStore, calculateFermentationTimeCoefficient } from '@/stores/useSettingsStore'
import { EnvironmentProfile } from '@/types/settings.types'
import {
  Thermometer,
  Droplets,
  Mountain,
  Plus,
  Save,
  X,
  Edit2,
  Trash2,
  Check,
  Sun,
  Snowflake,
  Leaf,
  AlertCircle,
  Info,
  Timer
} from 'lucide-react'

// 계절 아이콘
const SEASON_ICONS: Record<string, React.ElementType> = {
  spring: Leaf,
  summer: Sun,
  winter: Snowflake
}

interface EnvironmentSettingsTabProps {
  className?: string
}

export default function EnvironmentSettingsTab({ className = '' }: EnvironmentSettingsTabProps) {
  const {
    environment,
    setEnvironmentDefaults,
    addEnvironmentProfile,
    updateEnvironmentProfile,
    deleteEnvironmentProfile,
    setActiveProfile
  } = useSettingsStore()

  const [showProfileForm, setShowProfileForm] = useState(false)
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null)
  const [profileForm, setProfileForm] = useState({
    name: '',
    temperature: 25,
    humidity: 60,
    altitude: 0
  })

  // 현재 활성 프로필
  const activeProfile = useMemo(() => {
    if (!environment.activeProfileId) return null
    return environment.profiles.find(p => p.id === environment.activeProfileId)
  }, [environment.activeProfileId, environment.profiles])

  // 현재 적용 중인 환경값
  const currentEnvironment = useMemo(() => {
    return activeProfile || environment.defaults
  }, [activeProfile, environment.defaults])

  // 발효 시간 영향 계산
  const fermentationImpact = useMemo(() => {
    const baseTemp = 26 // 기준 온도
    const coefficient = calculateFermentationTimeCoefficient(currentEnvironment.temperature, baseTemp)

    if (coefficient < 1) {
      // 온도가 높으면 빠르게
      return {
        direction: 'faster',
        percent: Math.round((1 - coefficient) * 100),
        message: `기준 대비 약 ${Math.round((1 - coefficient) * 100)}% 빠름`
      }
    } else if (coefficient > 1) {
      // 온도가 낮으면 느리게
      return {
        direction: 'slower',
        percent: Math.round((coefficient - 1) * 100),
        message: `기준 대비 약 ${Math.round((coefficient - 1) * 100)}% 느림`
      }
    }
    return {
      direction: 'normal',
      percent: 0,
      message: '기준과 동일'
    }
  }, [currentEnvironment.temperature])

  // 고도 영향 메시지
  const altitudeImpact = useMemo(() => {
    const alt = currentEnvironment.altitude
    if (alt < 900) return null

    if (alt >= 2100) {
      return {
        level: 'high',
        message: '고고도: 밀가루 +4%, 설탕 -4~8%, 이스트 -25%, 오븐 +8~15°C'
      }
    } else if (alt >= 1500) {
      return {
        level: 'medium',
        message: '중고도: 밀가루 +2~4%, 설탕 -2~4%, 이스트 -20%, 오븐 +5~8°C'
      }
    } else {
      return {
        level: 'low',
        message: '저고도: 밀가루 +1%, 설탕 -1~2%, 이스트 -8~15%, 오븐 +3~5°C'
      }
    }
  }, [currentEnvironment.altitude])

  // 습도 영향 메시지
  const humidityImpact = useMemo(() => {
    const hum = currentEnvironment.humidity
    if (hum < 40) {
      return { level: 'low', message: '건조함: 수분 손실 증가, 발효 중 덮개 필수' }
    } else if (hum > 70) {
      return { level: 'high', message: '습함: 굽기 시간 증가, 냉각 시 결로 주의' }
    }
    return null
  }, [currentEnvironment.humidity])

  // 프로필 폼 리셋
  const resetProfileForm = useCallback(() => {
    setProfileForm({
      name: '',
      temperature: 25,
      humidity: 60,
      altitude: 0
    })
    setEditingProfileId(null)
    setShowProfileForm(false)
  }, [])

  // 프로필 편집 시작
  const startEditingProfile = useCallback((profile: EnvironmentProfile) => {
    setProfileForm({
      name: profile.name,
      temperature: profile.temperature,
      humidity: profile.humidity,
      altitude: profile.altitude
    })
    setEditingProfileId(profile.id)
    setShowProfileForm(true)
  }, [])

  // 프로필 저장
  const handleSaveProfile = useCallback(() => {
    if (!profileForm.name.trim()) {
      alert('프로필 이름을 입력해주세요.')
      return
    }

    if (editingProfileId) {
      updateEnvironmentProfile(editingProfileId, {
        name: profileForm.name,
        temperature: profileForm.temperature,
        humidity: profileForm.humidity,
        altitude: profileForm.altitude
      })
    } else {
      addEnvironmentProfile({
        name: profileForm.name,
        temperature: profileForm.temperature,
        humidity: profileForm.humidity,
        altitude: profileForm.altitude
      })
    }
    resetProfileForm()
  }, [profileForm, editingProfileId, updateEnvironmentProfile, addEnvironmentProfile, resetProfileForm])

  // 기본값 온도/습도/고도 슬라이더 핸들러
  const handleDefaultChange = useCallback((
    field: 'temperature' | 'humidity' | 'altitude',
    value: number
  ) => {
    setEnvironmentDefaults({ [field]: value })
  }, [setEnvironmentDefaults])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 현재 환경 요약 */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
        <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
          <Thermometer className="w-4 h-4" />
          현재 적용 환경
          {activeProfile && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {activeProfile.name}
            </span>
          )}
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/70 rounded-lg">
            <Thermometer className="w-5 h-5 mx-auto text-red-500 mb-1" />
            <div className="text-2xl font-bold text-gray-800">
              {currentEnvironment.temperature}°C
            </div>
            <div className="text-xs text-gray-500">실내 온도</div>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-lg">
            <Droplets className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <div className="text-2xl font-bold text-gray-800">
              {currentEnvironment.humidity}%
            </div>
            <div className="text-xs text-gray-500">습도</div>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-lg">
            <Mountain className="w-5 h-5 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold text-gray-800">
              {currentEnvironment.altitude}m
            </div>
            <div className="text-xs text-gray-500">고도</div>
          </div>
        </div>

        {/* 발효 영향 */}
        <div className="mt-3 p-2 bg-white/50 rounded flex items-center gap-2">
          <Timer className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-gray-700">
            발효 시간: {' '}
            <span className={`font-medium ${
              fermentationImpact.direction === 'faster' ? 'text-orange-600' :
              fermentationImpact.direction === 'slower' ? 'text-blue-600' :
              'text-green-600'
            }`}>
              {fermentationImpact.message}
            </span>
          </span>
        </div>

        {/* 특이사항 알림 */}
        {(altitudeImpact || humidityImpact) && (
          <div className="mt-2 space-y-1">
            {altitudeImpact && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 rounded text-xs text-amber-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {altitudeImpact.message}
              </div>
            )}
            {humidityImpact && (
              <div className="flex items-start gap-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {humidityImpact.message}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 기본 설정 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">기본 환경 설정</h3>
        <p className="text-sm text-gray-500">
          프로필을 선택하지 않았을 때 적용되는 기본값입니다.
        </p>

        {/* 온도 슬라이더 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Thermometer className="w-4 h-4 text-red-500" />
              실내 온도
            </label>
            <span className="text-lg font-mono font-bold text-gray-800">
              {environment.defaults.temperature}°C
            </span>
          </div>
          <input
            type="range"
            min="15"
            max="35"
            step="1"
            value={environment.defaults.temperature}
            onChange={(e) => handleDefaultChange('temperature', parseInt(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-blue-300 via-green-300 to-red-300 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>15°C (겨울)</span>
            <span>25°C (적정)</span>
            <span>35°C (여름)</span>
          </div>
        </div>

        {/* 습도 슬라이더 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Droplets className="w-4 h-4 text-blue-500" />
              습도
            </label>
            <span className="text-lg font-mono font-bold text-gray-800">
              {environment.defaults.humidity}%
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="80"
            step="5"
            value={environment.defaults.humidity}
            onChange={(e) => handleDefaultChange('humidity', parseInt(e.target.value))}
            className="w-full h-2 bg-gradient-to-r from-yellow-200 via-blue-300 to-blue-500 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>30% (건조)</span>
            <span>55~65% (적정)</span>
            <span>80% (습함)</span>
          </div>
        </div>

        {/* 고도 입력 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mountain className="w-4 h-4 text-green-600" />
              고도 (해발)
            </label>
            <span className="text-lg font-mono font-bold text-gray-800">
              {environment.defaults.altitude}m
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="3000"
            step="100"
            value={environment.defaults.altitude}
            onChange={(e) => handleDefaultChange('altitude', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0m (해수면)</span>
            <span>900m (저고도)</span>
            <span>1500m</span>
            <span>3000m</span>
          </div>
        </div>
      </div>

      {/* 환경 프로필 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">환경 프로필</h3>
            <p className="text-sm text-gray-500">
              계절이나 상황에 맞는 프로필을 빠르게 적용하세요.
            </p>
          </div>
          <button
            onClick={() => {
              resetProfileForm()
              setShowProfileForm(true)
            }}
            className="flex items-center gap-1 px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            프로필 추가
          </button>
        </div>

        {/* 프로필 폼 */}
        {showProfileForm && (
          <div className="p-4 border border-cyan-200 bg-cyan-50/50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">
                {editingProfileId ? '프로필 수정' : '새 프로필 추가'}
              </h4>
              <button onClick={resetProfileForm} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                프로필 이름
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="예: 우리집 겨울, 베이킹 스튜디오"
                className="w-full px-3 py-2 text-sm border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">온도 (°C)</label>
                <input
                  type="number"
                  value={profileForm.temperature}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, temperature: parseInt(e.target.value) || 25 }))}
                  min="10"
                  max="40"
                  className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">습도 (%)</label>
                <input
                  type="number"
                  value={profileForm.humidity}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, humidity: parseInt(e.target.value) || 60 }))}
                  min="20"
                  max="90"
                  className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">고도 (m)</label>
                <input
                  type="number"
                  value={profileForm.altitude}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, altitude: parseInt(e.target.value) || 0 }))}
                  min="0"
                  max="5000"
                  step="100"
                  className="w-full px-2 py-1.5 text-sm border rounded text-center font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                className="flex items-center gap-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingProfileId ? '저장' : '추가'}
              </button>
              <button
                onClick={resetProfileForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 프로필 목록 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* 기본값 카드 (항상 표시) */}
          <button
            onClick={() => setActiveProfile(null)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              !environment.activeProfileId
                ? 'border-cyan-500 bg-cyan-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-800">기본값</span>
              {!environment.activeProfileId && (
                <Check className="w-4 h-4 text-cyan-600" />
              )}
            </div>
            <div className="text-xs text-gray-500 space-y-0.5">
              <div>{environment.defaults.temperature}°C</div>
              <div>{environment.defaults.humidity}% 습도</div>
              <div>{environment.defaults.altitude}m</div>
            </div>
          </button>

          {/* 사용자 프로필들 */}
          {environment.profiles.map(profile => {
            const SeasonIcon = SEASON_ICONS[profile.id] || Thermometer
            const isActive = environment.activeProfileId === profile.id
            const isBuiltIn = ['spring', 'summer', 'winter'].includes(profile.id)

            return (
              <div
                key={profile.id}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isActive
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <button
                  onClick={() => setActiveProfile(profile.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <SeasonIcon className={`w-4 h-4 ${
                        profile.id === 'summer' ? 'text-orange-500' :
                        profile.id === 'winter' ? 'text-blue-500' :
                        profile.id === 'spring' ? 'text-green-500' :
                        'text-gray-500'
                      }`} />
                      <span className="font-medium text-gray-800">{profile.name}</span>
                    </div>
                    {isActive && (
                      <Check className="w-4 h-4 text-cyan-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <div>{profile.temperature}°C</div>
                    <div>{profile.humidity}% 습도</div>
                    <div>{profile.altitude}m</div>
                  </div>
                </button>

                {/* 편집/삭제 버튼 (빌트인 아닌 경우만) */}
                {!isBuiltIn && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditingProfile(profile)
                      }}
                      className="p-1 bg-white rounded hover:bg-gray-100"
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`"${profile.name}" 프로필을 삭제하시겠습니까?`)) {
                          deleteEnvironmentProfile(profile.id)
                        }
                      }}
                      className="p-1 bg-white rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 고도 조정 팁 */}
      <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
        <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
          <Mountain className="w-4 h-4" />
          고도 조정 가이드
        </h4>
        <div className="text-sm text-amber-700 space-y-2">
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="font-medium">고도</div>
            <div className="font-medium">밀가루</div>
            <div className="font-medium">설탕</div>
            <div className="font-medium">이스트</div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>900~1500m</div>
            <div>+1%</div>
            <div>-1~2%</div>
            <div>-8~15%</div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>1500~2100m</div>
            <div>+2~4%</div>
            <div>-2~4%</div>
            <div>-20%</div>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>2100m+</div>
            <div>+4%</div>
            <div>-4~8%</div>
            <div>-25%</div>
          </div>
        </div>
      </div>
    </div>
  )
}
