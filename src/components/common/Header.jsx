import React from 'react'
import { useTranslation } from 'react-i18next'
import { useAppStore } from '@stores/useAppStore'

function Header() {
  const { t } = useTranslation()
  const { activeTab, setActiveTab } = useAppStore()

  // 네비게이션 탭 - 번역 키 사용
  const navTabs = [
    { id: 'home', labelKey: 'nav.home', icon: '🏠' },
    { id: 'dashboard', labelKey: 'nav.converter', icon: '⚖️' },
    { id: 'recipes', labelKey: 'nav.recipes', icon: '📖' },
    { id: 'calculator', labelKey: 'nav.ddt', icon: '🌡️' },
  ]

  const utilTabs = [
    { id: 'settings', labelKey: 'nav.settings', icon: '⚙️' },
    { id: 'help', labelKey: 'nav.help', icon: '❓' },
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
            <span className="text-xl">🍞</span>
            <h1 className="text-lg font-bold text-white">{t('app.name')}</h1>
          </button>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {/* Main Navigation */}
            {navTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/70 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
                aria-label={t(tab.labelKey)}
                title={t(tab.labelKey)}
              >
                {tab.icon} {t(tab.labelKey)}
              </button>
            ))}

            {/* Divider */}
            <span className="w-px h-6 bg-white/20 mx-2"></span>

            {/* Utility Tabs */}
            {utilTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/70 transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white/20'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                aria-label={t(tab.labelKey)}
                title={t(tab.labelKey)}
              >
                {tab.icon}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header