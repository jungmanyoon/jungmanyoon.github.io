/**
 * 환경 설정 탭
 * 온도, 습도, 고도 설정 및 프로필 관리
 *
 * 적용: --persona-frontend (UX) + --persona-backend (발효 계산)
 */

import { useState, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
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
      const percent = Math.round((1 - coefficient) * 100)
      return {
        direction: 'faster',
        percent,
        message: t('settings.environment.fermentationFaster', { percent })
      }
    } else if (coefficient > 1) {
      // 온도가 낮으면 느리게
      const percent = Math.round((coefficient - 1) * 100)
      return {
        direction: 'slower',
        percent,
        message: t('settings.environment.fermentationSlower', { percent })
      }
    }
    return {
      direction: 'normal',
      percent: 0,
      message: t('settings.environment.fermentationNormal')
    }
  }, [currentEnvironment.temperature, t])

  // 고도 영향 메시지
  const altitudeImpact = useMemo(() => {
    const alt = currentEnvironment.altitude
    if (alt < 900) return null

    if (alt >= 2100) {
      return {
        level: 'high',
        message: t('settings.environment.altitudeHigh')
      }
    } else if (alt >= 1500) {
      return {
        level: 'medium',
        message: t('settings.environment.altitudeMedium')
      }
    } else {
      return {
        level: 'low',
        message: t('settings.environment.altitudeLow')
      }
    }
  }, [currentEnvironment.altitude, t])

  // 습도 영향 메시지
  const humidityImpact = useMemo(() => {
    const hum = currentEnvironment.humidity
    if (hum < 40) {
      return { level: 'low', message: t('settings.environment.humidityLowWarning') }
    } else if (hum > 70) {
      return { level: 'high', message: t('settings.environment.humidityHighWarning') }
    }
    return null
  }, [currentEnvironment.humidity, t])

  // 빌트인 프로필 ID 목록
  const BUILTIN_PROFILE_IDS = ['spring', 'summer', 'winter']

  // 프로필 표시 이름 가져오기 (빌트인은 번역, 사용자 프로필은 그대로)
  const getProfileDisplayName = useCallback((profile: EnvironmentProfile) => {
    if (BUILTIN_PROFILE_IDS.includes(profile.id)) {
      return t(`settings.environment.profileNames.${profile.id}`)
    }
    return profile.name
  }, [t])

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
      alert(t('settings.environment.profileNameRequired'))
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
  }, [profileForm, editingProfileId, updateEnvironmentProfile, addEnvironmentProfile, resetProfileForm, t])

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
          {t('settings.environment.currentEnvironment')}
          {activeProfile && (
            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
              {getProfileDisplayName(activeProfile)}
            </span>
          )}
        </h3>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white/70 rounded-lg">
            <Thermometer className="w-5 h-5 mx-auto text-red-500 mb-1" />
            <div className="text-2xl font-bold text-gray-800">
              {currentEnvironment.temperature}°C
            </div>
            <div className="text-xs text-gray-500">{t('settings.environment.temperature')}</div>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-lg">
            <Droplets className="w-5 h-5 mx-auto text-blue-500 mb-1" />
            <div className="text-2xl font-bold text-gray-800">
              {currentEnvironment.humidity}%
            </div>
            <div className="text-xs text-gray-500">{t('settings.environment.humidity')}</div>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-lg">
            <Mountain className="w-5 h-5 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold text-gray-800">
              {currentEnvironment.altitude}m
            </div>
            <div className="text-xs text-gray-500">{t('settings.environment.altitude')}</div>
          </div>
        </div>

        {/* 발효 영향 */}
        <div className="mt-3 p-2 bg-white/50 rounded flex items-center gap-2">
          <Timer className="w-4 h-4 text-orange-500" />
          <span className="text-sm text-gray-700">
            {t('settings.environment.fermentationTime')}: {' '}
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
        <h3 className="text-lg font-semibold text-gray-800">{t('settings.environment.defaultSettings')}</h3>
        <p className="text-sm text-gray-500">
          {t('settings.environment.defaultSettingsDesc')}
        </p>

        {/* 온도 슬라이더 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Thermometer className="w-4 h-4 text-red-500" />
              {t('settings.environment.temperature')}
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
            <span>{t('settings.environment.tempWinter')}</span>
            <span>{t('settings.environment.tempOptimal')}</span>
            <span>{t('settings.environment.tempSummer')}</span>
          </div>
        </div>

        {/* 습도 슬라이더 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Droplets className="w-4 h-4 text-blue-500" />
              {t('settings.environment.humidity')}
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
            <span>{t('settings.environment.humidityDry')}</span>
            <span>{t('settings.environment.humidityOptimal')}</span>
            <span>{t('settings.environment.humidityWet')}</span>
          </div>
        </div>

        {/* 고도 입력 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Mountain className="w-4 h-4 text-green-600" />
              {t('settings.environment.altitudeLabel')}
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
            <span>{t('settings.environment.seaLevel')}</span>
            <span>{t('settings.environment.lowAltitude')}</span>
            <span>1500m</span>
            <span>3000m</span>
          </div>
        </div>
      </div>

      {/* 환경 프로필 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{t('settings.environment.profiles')}</h3>
            <p className="text-sm text-gray-500">
              {t('settings.environment.profilesDesc')}
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
            {t('settings.environment.addProfile')}
          </button>
        </div>

        {/* 프로필 폼 */}
        {showProfileForm && (
          <div className="p-4 border border-cyan-200 bg-cyan-50/50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">
                {editingProfileId ? t('settings.environment.editProfile') : t('settings.environment.newProfile')}
              </h4>
              <button onClick={resetProfileForm} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('settings.environment.profileName')}
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('settings.environment.profileNamePlaceholder')}
                className="w-full px-3 py-2 text-sm border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">{t('settings.environment.temperature')} (°C)</label>
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
                <label className="block text-xs text-gray-500 mb-1">{t('settings.environment.humidity')} (%)</label>
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
                <label className="block text-xs text-gray-500 mb-1">{t('settings.environment.altitude')} (m)</label>
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
                {editingProfileId ? t('common.save') : t('settings.environment.addProfile')}
              </button>
              <button
                onClick={resetProfileForm}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
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
              <span className="font-medium text-gray-800">{t('settings.environment.default')}</span>
              {!environment.activeProfileId && (
                <Check className="w-4 h-4 text-cyan-600" />
              )}
            </div>
            <div className="text-xs text-gray-500 space-y-0.5">
              <div>{environment.defaults.temperature}°C</div>
              <div>{environment.defaults.humidity}% {t('settings.environment.humidityUnit')}</div>
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
                      <span className="font-medium text-gray-800">{getProfileDisplayName(profile)}</span>
                    </div>
                    {isActive && (
                      <Check className="w-4 h-4 text-cyan-600" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    <div>{profile.temperature}°C</div>
                    <div>{profile.humidity}% {t('settings.environment.humidityUnit')}</div>
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
                        if (confirm(t('settings.environment.deleteProfileConfirm', { name: getProfileDisplayName(profile) }))) {
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
          {t('settings.environment.altitudeGuide')}
        </h4>
        <div className="text-sm text-amber-700 space-y-2">
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="font-medium">{t('settings.environment.altitude')}</div>
            <div className="font-medium">{t('settings.environment.flour')}</div>
            <div className="font-medium">{t('settings.environment.sugar')}</div>
            <div className="font-medium">{t('settings.environment.yeast')}</div>
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
