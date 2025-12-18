import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * 팬 계산 시각화 컴포넌트
 * - 팬 크기 비교 차트
 * - 반죽 분배 파이 차트
 * - 부피 비율 막대 그래프
 */
export default function PanVisualization({ results }) {
  const { t } = useTranslation()
  if (!results || !results.pans) return null

  // 최대 부피 계산
  const maxVolume = useMemo(() => {
    return Math.max(...results.pans.map(pan => pan.volume))
  }, [results.pans])

  // 색상 팔레트
  const colors = [
    '#8B4513', '#D2691E', '#CD853F', '#DEB887', '#F4A460',
    '#DAA520', '#B8860B', '#BC8F8F', '#A0522D', '#6B4423'
  ]

  return (
    <div className="space-y-6">
      {/* 팬 크기 비교 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-bread-800 mb-4">📏 {t('components.panVisualization.panSizeComparison')}</h3>
        <div className="space-y-3">
          {results.pans.map((pan, index) => {
            const widthPercent = (pan.volume / maxVolume) * 100
            return (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{t('components.panVisualization.panNumber', { number: index + 1 })}</span>
                  <span className="text-gray-600">
                    {pan.volume.toLocaleString()} cm³
                  </span>
                </div>
                <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  >
                    {widthPercent > 20 && (
                      <span className="text-white text-xs font-semibold">
                        {t('components.panVisualization.countUnit', { count: pan.count })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 반죽 분배 파이 차트 (CSS) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-bread-800 mb-4">🥐 {t('components.panVisualization.doughDistribution')}</h3>

        {/* 도넛 차트 */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {results.pans.map((pan, index) => {
                const totalDough = results.totalDough
                const percentage = (pan.totalDough / totalDough) * 100
                const radius = 40
                const circumference = 2 * Math.PI * radius

                // 이전 팬들의 누적 퍼센트
                const prevPercentage = results.pans
                  .slice(0, index)
                  .reduce((sum, p) => sum + (p.totalDough / totalDough) * 100, 0)

                const offset = circumference - (percentage / 100) * circumference
                const rotation = (prevPercentage / 100) * 360

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth="20"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                      transformOrigin: 'center',
                      transform: `rotate(${rotation}deg)`
                    }}
                  />
                )
              })}
            </svg>

            {/* 중앙 텍스트 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-bread-800">
                {results.totalDough.toLocaleString()}g
              </div>
              <div className="text-xs text-gray-600">{t('components.panVisualization.totalDough')}</div>
            </div>
          </div>
        </div>

        {/* 범례 */}
        <div className="grid grid-cols-2 gap-2">
          {results.pans.map((pan, index) => {
            const percentage = ((pan.totalDough / results.totalDough) * 100).toFixed(1)
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div className="flex-1 text-sm">
                  <div className="font-medium">{t('components.panVisualization.panNumber', { number: index + 1 })}</div>
                  <div className="text-gray-600 text-xs">
                    {pan.totalDough.toLocaleString()}g ({percentage}%)
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 팬당 반죽량 막대 그래프 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-bread-800 mb-4">🍞 {t('components.panVisualization.doughPerPan')}</h3>
        <div className="space-y-3">
          {results.pans.map((pan, index) => {
            const maxDoughPerPan = Math.max(...results.pans.map(p => p.doughPerPan))
            const widthPercent = (pan.doughPerPan / maxDoughPerPan) * 100

            return (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">
                    {t('components.panVisualization.panNumber', { number: index + 1 })}
                    {pan.type === 'rectangle' && ` (${pan.length}×${pan.width}×${pan.height}cm)`}
                    {pan.type === 'round' && ` (Ø${pan.length}×${pan.height}cm)`}
                  </span>
                  <span className="text-gray-600">
                    {t('components.panVisualization.gramsPerPan', { grams: pan.doughPerPan.toLocaleString() })}
                  </span>
                </div>
                <div className="relative h-6 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="absolute h-full rounded transition-all duration-500 flex items-center justify-end pr-2"
                    style={{
                      width: `${widthPercent}%`,
                      backgroundColor: colors[index % colors.length],
                      opacity: 0.8
                    }}
                  >
                    {widthPercent > 25 && (
                      <span className="text-white text-xs font-semibold">
                        {t('components.panVisualization.countUnit', { count: pan.count })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-bread-800 mb-4">📊 {t('components.panVisualization.statisticsSummary')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-bread-50 rounded">
            <div className="text-2xl font-bold text-bread-800">
              {results.totalPans}
            </div>
            <div className="text-xs text-gray-600">{t('components.panVisualization.totalPanCount')}</div>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-800">
              {Math.round(results.totalVolume).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">{t('components.panVisualization.totalVolume')}</div>
          </div>

          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-800">
              {Math.round(results.totalDough / results.totalPans)}g
            </div>
            <div className="text-xs text-gray-600">{t('components.panVisualization.averagePerPan')}</div>
          </div>

          <div className="text-center p-3 bg-orange-50 rounded">
            <div className="text-2xl font-bold text-orange-800">
              {results.scalingFactor}x
            </div>
            <div className="text-xs text-gray-600">{t('components.panVisualization.recipeScaling')}</div>
          </div>
        </div>
      </div>

      {/* 3D 팬 시각화 (간단한 CSS 3D) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-semibold text-bread-800 mb-4">📐 {t('components.panVisualization.preview3D')}</h3>
        <div className="flex flex-wrap gap-6 justify-center">
          {results.pans.slice(0, 3).map((pan, index) => {
            const scale = Math.min(1, 150 / Math.max(pan.length, pan.width))
            const width = pan.type === 'round' ? pan.length : pan.length
            const depth = pan.type === 'round' ? pan.length : pan.width
            const height = pan.height * 2 // 시각적 강조

            return (
              <div key={index} className="text-center">
                <div className="mb-2 text-sm font-medium">{t('components.panVisualization.panNumber', { number: index + 1 })}</div>
                <div
                  className="relative mx-auto"
                  style={{
                    width: `${width * scale}px`,
                    height: `${height * scale + depth * scale * 0.5}px`,
                    perspective: '500px'
                  }}
                >
                  {/* 3D 팬 */}
                  <div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
                    style={{
                      width: `${width * scale}px`,
                      height: `${height * scale}px`,
                      backgroundColor: colors[index % colors.length],
                      border: '2px solid rgba(0,0,0,0.2)',
                      borderRadius: pan.type === 'round' ? '50%' : '4px',
                      transformStyle: 'preserve-3d',
                      transform: 'rotateX(60deg)',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.2)'
                    }}
                  >
                    {/* 팬 뒷면 (깊이감) */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: colors[index % colors.length],
                        filter: 'brightness(0.7)',
                        transform: `translateZ(-${depth * scale * 0.3}px)`,
                        borderRadius: pan.type === 'round' ? '50%' : '4px'
                      }}
                    />
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-600">
                  {pan.type === 'round'
                    ? `Ø${pan.length}cm`
                    : `${pan.length}×${pan.width}cm`
                  } × {pan.height}cm
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
