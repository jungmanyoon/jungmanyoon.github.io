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
      <div className="container mx-auto px-2 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <Wheat className="w-5 h-5" />
            <h1 className="text-lg font-bold text-white">{t('app.name')}</h1>
          </button>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {/* Main Navigation */}
            {navTabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/70 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-label={t(tab.labelKey)}
                  title={t(tab.labelKey)}
                >
                  <Icon className="w-4 h-4" /> {t(tab.labelKey)}
                </button>
              )
            })}

            {/* Divider */}
            <span className="w-px h-6 bg-white/20 mx-2"></span>

            {/* Utility Tabs */}
            {utilTabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center px-2 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/70 transition-colors ${
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