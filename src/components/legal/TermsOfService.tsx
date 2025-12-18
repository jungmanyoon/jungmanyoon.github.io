/**
 * 이용약관 및 면책조항 페이지
 * AdSense 심사 권장 페이지
 */

import { useTranslation } from 'react-i18next'

interface TermsOfServiceProps {
  onBack?: () => void
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  const { t } = useTranslation()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 text-bread-600 hover:text-bread-700 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('legal.back')}
          </button>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('legal.terms.title')}</h1>
        <p className="text-gray-500 mb-8">{t('legal.lastUpdated')}</p>

        <div className="prose prose-bread max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.terms.article1Title')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.article1Content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.terms.article2Title')}</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>{t('legal.terms.article2Item1')}</li>
              <li>{t('legal.terms.article2Item2')}</li>
              <li>{t('legal.terms.article2Item3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.terms.article3Title')}</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              {t('legal.terms.article3Intro')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t('legal.terms.article3Item1')}</li>
              <li>{t('legal.terms.article3Item2')}</li>
              <li>{t('legal.terms.article3Item3')}</li>
              <li>{t('legal.terms.article3Item4')}</li>
              <li>{t('legal.terms.article3Item5')}</li>
              <li>{t('legal.terms.article3Item6')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.terms.article4Title')}</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>{t('legal.terms.article4Item1')}</li>
              <li>{t('legal.terms.article4Item2')}</li>
              <li>{t('legal.terms.article4Item3')}</li>
            </ul>
          </section>

          <section className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-800 mb-3">{t('legal.terms.article5Title')}</h2>
            <div className="text-amber-900 space-y-3">
              <p className="leading-relaxed">
                <strong>1.</strong> {t('legal.terms.article5Item1')}
              </p>
              <p className="leading-relaxed">
                <strong>2.</strong> {t('legal.terms.article5Item2')}
              </p>
              <p className="leading-relaxed">
                <strong>3.</strong> {t('legal.terms.article5Item3')}
              </p>
              <p className="leading-relaxed">
                <strong>4.</strong> {t('legal.terms.article5Item4')}
              </p>
              <p className="leading-relaxed">
                <strong>5. {t('legal.terms.article5Item5')}</strong>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.terms.article6Title')}</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>{t('legal.terms.article6Item1')}</li>
              <li>{t('legal.terms.article6Item2')}</li>
              <li>{t('legal.terms.article6Item3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.terms.article7Title')}</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              {t('legal.terms.article7Intro')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t('legal.terms.article7Item1')}</li>
              <li>{t('legal.terms.article7Item2')}</li>
              <li>{t('legal.terms.article7Item3')}</li>
              <li>{t('legal.terms.article7Item4')}</li>
              <li>{t('legal.terms.article7Item5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.terms.article8Title')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.article8Content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.terms.article9Title')}</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>{t('legal.terms.article9Item1')}</li>
              <li>{t('legal.terms.article9Item2')}</li>
              <li>{t('legal.terms.article9Item3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.terms.article10Title')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.article10Content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.terms.article11Title')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.article11Content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.terms.appendixTitle')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.terms.appendixContent')}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
