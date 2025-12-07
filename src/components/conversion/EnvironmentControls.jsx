import React, { useState, useEffect } from 'react'
import Environmental from '../../utils/calculations/environmental.js'
import Button from '../common/Button.jsx'

function EnvironmentControls({ environment, onChange }) {
  const [showPresets, setShowPresets] = useState(false)
  const [adjustmentPreview, setAdjustmentPreview] = useState(null)
  
  // 계절별 프리셋
  const seasonalPresets = {
    spring: { temp: 20, humidity: 60, altitude: environment.altitude || 0 },
    summer: { temp: 30, humidity: 70, altitude: environment.altitude || 0 },
    fall: { temp: 15, humidity: 55, altitude: environment.altitude || 0 },
    winter: { temp: 5, humidity: 40, altitude: environment.altitude || 0 }
  }
  
  // 지역별 프리셋
  const regionalPresets = {
    seoul: { temp: 20, humidity: 60, altitude: 50, name: '서울' },
    busan: { temp: 22, humidity: 65, altitude: 0, name: '부산' },
    jeju: { temp: 23, humidity: 70, altitude: 0, name: '제주' },
    gangwon: { temp: 18, humidity: 55, altitude: 800, name: '강원' },
    daegu: { temp: 25, humidity: 55, altitude: 50, name: '대구' }
  }

  const handleChange = (field, value) => {
    const newEnv = {
      ...environment,
      [field]: parseFloat(value) || 0
    }
    onChange(newEnv)
    updatePreview(newEnv)
  }
  
  const updatePreview = (env) => {
    // 미리보기 계산
    const tempAdjustment = Environmental.calculateTemperatureAdjustment(env.temp)
    const humidityAdjustment = Environmental.calculateHumidityAdjustment(env.humidity)
    const altitudeAdjustment = Environmental.calculateAltitudeAdjustment(env.altitude)
    
    setAdjustmentPreview({
      temp: tempAdjustment,
      humidity: humidityAdjustment,
      altitude: altitudeAdjustment,
      fermentationTime: Environmental.calculateFermentationTime(25, env.temp, 60),
      pressure: Environmental.calculatePressure(env.altitude),
      boilingPoint: Environmental.calculateBoilingPoint(env.altitude)
    })
  }
  
  useEffect(() => {
    updatePreview(environment)
  }, [environment])

  const evaluation = Environmental.evaluateEnvironment(environment)

  return (
    <div>
      <h3 className="mb-4">환경 설정</h3>
      
      {/* 프리셋 버튼 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-bread-700">빠른 설정</h4>
          <Button 
            size="small" 
            variant="secondary"
            onClick={() => setShowPresets(!showPresets)}
          >
            {showPresets ? '프리셋 숨기기' : '프리셋 보기'}
          </Button>
        </div>
        
        {showPresets && (
          <div className="space-y-4 p-4 bg-bread-50 rounded-lg">
            {/* 계절 프리셋 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">계절별 설정</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(seasonalPresets).map(([season, preset]) => (
                  <Button
                    key={season}
                    size="small"
                    variant="secondary"
                    onClick={() => {
                      onChange(preset)
                      updatePreview(preset)
                    }}
                  >
                    {season === 'spring' && '봄'}
                    {season === 'summer' && '여름'}
                    {season === 'fall' && '가을'}
                    {season === 'winter' && '겨울'}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* 지역 프리셋 */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">지역별 설정</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(regionalPresets).map(([region, preset]) => (
                  <Button
                    key={region}
                    size="small"
                    variant="secondary"
                    onClick={() => {
                      const { name, ...envData } = preset
                      onChange(envData)
                      updatePreview(envData)
                    }}
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 수동 입력 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            온도 (°C)
          </label>
          <input
            type="number"
            value={environment.temp}
            onChange={(e) => handleChange('temp', e.target.value)}
            min="-10"
            max="40"
            step="1"
            className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
            placeholder="온도"
          />
          <p className="text-xs text-gray-500 mt-1">
            현재: {environment.temp}°C
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            습도 (%)
          </label>
          <input
            type="number"
            value={environment.humidity}
            onChange={(e) => handleChange('humidity', e.target.value)}
            min="0"
            max="100"
            step="5"
            className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
            placeholder="습도"
          />
          <p className="text-xs text-gray-500 mt-1">
            현재: {environment.humidity}%
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            고도 (m)
          </label>
          <input
            type="number"
            value={environment.altitude}
            onChange={(e) => handleChange('altitude', e.target.value)}
            min="0"
            max="4000"
            step="100"
            className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
            placeholder="고도"
          />
          <p className="text-xs text-gray-500 mt-1">
            현재: {environment.altitude}m
          </p>
        </div>
      </div>

      {/* 환경 평가 */}
      {evaluation.warnings.length > 0 && (
        <div className={`p-4 rounded-lg mb-6 ${
          evaluation.overall === 'caution' ? 'bg-yellow-50' : 
          evaluation.overall === 'extreme' ? 'bg-red-50' : 'bg-green-50'
        }`}>
          <h4 className={`font-medium mb-2 ${
            evaluation.overall === 'caution' ? 'text-yellow-900' : 
            evaluation.overall === 'extreme' ? 'text-red-900' : 'text-green-900'
          }`}>
            환경 평가: {
              evaluation.overall === 'good' && '양호' ||
              evaluation.overall === 'caution' && '주의' ||
              evaluation.overall === 'extreme' && '극한'
            }
          </h4>
          
          {evaluation.warnings.map((warning, idx) => (
            <p key={idx} className="text-sm text-yellow-800 mb-1">
              ⚠️ {warning}
            </p>
          ))}
          
          {evaluation.recommendations.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-1">권장사항:</p>
              {evaluation.recommendations.map((rec, idx) => (
                <p key={idx} className="text-sm text-gray-600 mb-1">
                  • {rec}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 조정 미리보기 */}
      {adjustmentPreview && (
        <div className="p-4 bg-bread-50 rounded-lg mb-6">
          <h4 className="font-medium text-bread-700 mb-3">환경 보정 미리보기</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">온도 보정:</p>
              <p className="font-medium">
                이스트 {((adjustmentPreview.temp.yeastAdjustment - 1) * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-gray-600">습도 보정:</p>
              <p className="font-medium">
                밀가루 {((adjustmentPreview.humidity.flourAdjustment - 1) * 100).toFixed(0)}%
              </p>
            </div>
            <div>
              <p className="text-gray-600">고도 보정:</p>
              <p className="font-medium">
                가스 온도 {adjustmentPreview.altitude.temperatureReduction}°C
              </p>
            </div>
            <div>
              <p className="text-gray-600">발효 시간:</p>
              <p className="font-medium">
                {adjustmentPreview.fermentationTime}분
              </p>
            </div>
          </div>
          
          {environment.altitude > 300 && (
            <div className="mt-3 pt-3 border-t border-bread-200">
              <p className="text-sm text-gray-700 mb-2">고도의 영향:</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">기압: </span>
                  <span className="font-medium">{adjustmentPreview.pressure.toFixed(1)} kPa</span>
                </div>
                <div>
                  <span className="text-gray-600">끓는점: </span>
                  <span className="font-medium">{adjustmentPreview.boilingPoint.toFixed(1)}°C</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 환경 요인 가이드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg text-sm">
          <h5 className="font-medium mb-2">환경 요인 영향</h5>
          <ul className="space-y-1 text-gray-700">
            <li>• 온도 1°C 상승 → 발효 시간 10% 감소</li>
            <li>• 습도 10% 상승 → 밀가루 2% 감소</li>
            <li>• 고도 300m 상승 → 가스 온도 2°C 감소</li>
            <li>• 고도 300m 상승 → 액체 끓는점 2°C 감소</li>
          </ul>
        </div>
        
        <div className="p-4 bg-yellow-50 rounded-lg text-sm">
          <h5 className="font-medium mb-2 text-yellow-800">계절별 팁</h5>
          <ul className="space-y-1 text-yellow-700">
            <li>• 봄/가을: 표준 레시피 사용</li>
            <li>• 여름: 차가운 재료, 발효 시간 단축</li>
            <li>• 겨울: 따뜻한 환경, 발효 시간 연장</li>
            <li>• 장마철: 밀가루 10% 감소 고려</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default EnvironmentControls