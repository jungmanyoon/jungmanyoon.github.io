import React from 'react'
import { useTranslation } from 'react-i18next'
import { Home, Scale, BookOpen, Thermometer, Settings, HelpCircle, Wheat } from 'lucide-react'
import { useAppStore } from '@stores/useAppStore'

function Header() {
  const { t } = useTranslation()
  const { activeTab, setActiveTab } = useAppStore()

  // 네비게이션 탭 - 번역 키 사용 (icon은 lucide-react 컴포넌트 참조)
  const navTabs = [
    { id: 'home', labelKey: 'nav.home', icon: Home },
    { id: 'dashboard', labelKey: 'nav.converter', icon: Scale },
    { id: 'recipes', labelKey: 'nav.recipes', icon: BookOpen },
    { id: 'calculator', labelKey: 'nav.ddt', icon: Thermometer },
  ]

  const utilTabs = [
    { id: 'settings', labelKey: 'nav.settings', icon: Settings },
    { id: 'help', labelKey: 'nav.help', icon: HelpCircle },
  ]

  return (
    <header className="bg-bread-600 text-white shadow">
      {/* 모바일 패딩 축소(px-2 py-2), sm 이상 기존 패딩(py-3) 보존 */}
      <div className="container mx-auto px-2 py-2 sm:py-3">
        {/* 좁은 화면에서 로고와 nav가 겹치지 않도록 gap 부여 */}
        <div className="flex items-center justify-between gap-2">
          {/* Logo - 터치영역 44px, 좁은 화면에서 줄어들지 않도록 shrink-0 */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-2 min-h-[44px] shrink-0 hover:opacity-80 transition-opacity"
          >
            <Wheat className="w-5 h-5" />
            {/* 앱 이름: 모바일 text-base, sm 이상 기존 text-lg 보존 */}
            <h1 className="text-base sm:text-lg font-bold text-white">{t('app.name')}</h1>
          </button>

          {/* Navigation
              - 모바일: 라벨 숨김(아이콘 only) + 가로 넘침 시 내부 스크롤(overflow-x-auto)로 화면 가로 스크롤 차단
              - sm 이상: 기존 라벨 노출 + 간격 보존 */}
          <nav
            className="flex items-center gap-0.5 sm:gap-1 min-w-0 overflow-x-auto"
            // 모바일 가로 스크롤 시 스크롤바 숨김(별도 CSS 클래스 의존 없이 인라인 처리)
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Main Navigation */}
            {navTabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] min-w-[44px] shrink-0 px-2 py-2 sm:px-3 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/70 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-label={t(tab.labelKey)}
                  title={t(tab.labelKey)}
                >
                  {/* 라벨은 sm 이상에서만 노출(모바일은 아이콘만으로 컴팩트) */}
                  <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{t(tab.labelKey)}</span>
                </button>
              )
            })}

            {/* Divider - 모바일은 간격 축소 */}
            <span className="w-px h-6 bg-white/20 mx-1 sm:mx-2 shrink-0"></span>

            {/* Utility Tabs - 아이콘 only, 터치영역 44px */}
            {utilTabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] shrink-0 px-2 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/70 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white/20'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-label={t(tab.labelKey)}
                  title={t(tab.labelKey)}
                >
                  <Icon className="w-4 h-4" />
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header