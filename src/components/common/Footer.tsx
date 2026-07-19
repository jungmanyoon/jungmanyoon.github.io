/**
 * Footer 컴포넌트
 * 개인정보처리방침, 이용약관, 가이드, 문의 링크 포함
 */

import { useTranslation } from 'react-i18next'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { useAppStore } from '@stores/useAppStore'

export default function Footer() {
  const { t } = useTranslation()
  const { setActiveTab } = useAppStore()

  const handleNavigation = (tab: string) => {
    setActiveTab(tab as any)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-ink text-white/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 서비스 정보 */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-ink-inverse font-bold text-lg mb-3">
              {t('footer.appName')}
            </h3>
            <p className="text-sm text-white/70 mb-4">
              {t('footer.description')}
            </p>
            <p className="text-xs text-white/60">
              {t('footer.copyright')}
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-ink-inverse font-semibold mb-3">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNavigation('dashboard')}
                  className="hover:text-ink-inverse transition-colors"
                >
                  {t('nav.converter')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('recipes')}
                  className="hover:text-ink-inverse transition-colors"
                >
                  {t('footer.recipeList')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('calculator')}
                  className="hover:text-ink-inverse transition-colors"
                >
                  {t('footer.ddtCalc')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('guide')}
                  className="hover:text-ink-inverse transition-colors"
                >
                  {t('footer.userGuide')}
                </button>
              </li>
            </ul>
          </div>

          {/* 법적 정보 */}
          <div>
            <h4 className="text-ink-inverse font-semibold mb-3">{t('footer.info')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNavigation('privacy')}
                  className="hover:text-ink-inverse transition-colors"
                >
                  {t('footer.privacy')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('terms')}
                  className="hover:text-ink-inverse transition-colors"
                >
                  {t('footer.terms')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('contact')}
                  className="hover:text-ink-inverse transition-colors"
                >
                  {t('footer.contact')}
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/jungmanyoon/baking-converter"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink-inverse transition-colors inline-flex items-center gap-1"
                >
                  GitHub
                  <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 면책 조항 */}
        <div className="border-t border-white/10 mt-8 pt-6">
          <p className="text-xs text-white/60 text-center flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />
            <span>{t('footer.disclaimer')}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
