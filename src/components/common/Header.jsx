import React, { useState } from 'react'

import { useAppStore } from '@stores/useAppStore'

function Header() {
  const { activeTab, setActiveTab } = useAppStore()
  const [showMore, setShowMore] = useState(false)

  // 메인 탭과 더보기 탭 구분
  const mainTabs = [
    { id: 'dashboard', label: '🔄 변환', title: '레시피 변환 대시보드 (권장)' },
    { id: 'recipes', label: '📖 레시피', title: '레시피 목록' },
  ]

  const moreTabs = [
    { id: 'workspace', label: '📋 워크스페이스', title: '기존 워크스페이스' },
    { id: 'calculator', label: '🌡️ DDT', title: 'DDT 계산기' },
    { id: 'pan-calculator', label: '🍞 팬 계산', title: '빠른 팬 반죽량 계산' },
    { id: 'excel-calculator', label: '📊 엑셀 계산', title: '엑셀 스타일 레시피 계산' },
    { id: 'converter', label: '🔧 변환 콘솔', title: '기존 변환 콘솔' },
  ]

  const utilTabs = [
    { id: 'settings', label: '⚙️', title: '설정' },
    { id: 'help', label: '❓', title: '도움말' },
  ]

  return (
    <header className="bg-bread-600 text-white shadow">
      <div className="container mx-auto px-2 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl">🍞</span>
            <h1 className="text-lg font-bold text-white">레시피북</h1>
          </button>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {/* Main Tabs */}
            {mainTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/70 transition-colors ${activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                aria-label={tab.title}
                title={tab.title}
              >
                {tab.label}
              </button>
            ))}

            {/* Divider */}
            <span className="w-px h-6 bg-white/20 mx-1"></span>

            {/* More Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMore(!showMore)}
                className={`px-2 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/70 transition-colors ${showMore ? 'bg-white/20' : 'hover:bg-white/10'
                  }`}
                aria-label="더보기"
              >
                ⋯ 더보기
              </button>

              {showMore && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMore(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-20">
                    {moreTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id)
                          setShowMore(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${activeTab === tab.id
                            ? 'bg-bread-100 dark:bg-bread-900 text-bread-700 dark:text-bread-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Util Tabs */}
            {utilTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-white/70 transition-colors ${activeTab === tab.id
                    ? 'bg-white/20'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                aria-label={tab.title}
                title={tab.title}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header