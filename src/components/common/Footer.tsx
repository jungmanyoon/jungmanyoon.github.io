/**
 * Footer 컴포넌트
 * 개인정보처리방침, 이용약관, 가이드, 문의 링크 포함
 */

import { useTranslation } from 'react-i18next'
import { useAppStore } from '@stores/useAppStore'

export default function Footer() {
  const { t } = useTranslation()
  const { setActiveTab } = useAppStore()

  const handleNavigation = (tab: string) => {
    setActiveTab(tab as any)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gray-800 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 서비스 정보 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-white font-bold text-lg mb-3">
              {t('footer.appName')}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              {t('footer.description')}
            </p>
            <p className="text-xs text-gray-500">
              {t('footer.copyright')}
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-white font-semibold mb-3">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNavigation('dashboard')}
                  className="hover:text-white transition-colors"
                >
                  {t('nav.dashboard')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('recipes')}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.recipeList')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('calculator')}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.ddtCalc')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('guide')}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.userGuide')}
                </button>
              </li>
            </ul>
          </div>

          {/* 법적 정보 */}
          <div>
            <h4 className="text-white font-semibold mb-3">{t('footer.info')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNavigation('privacy')}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.privacy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('terms')}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.terms')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('contact')}
                  className="hover:text-white transition-colors"
                >
                  {t('footer.contact')}
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/jungmanyoon/baking-converter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  GitHub
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 면책 조항 */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <p className="text-xs text-gray-500 text-center">
            ⚠️ {t('footer.disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  )
}
