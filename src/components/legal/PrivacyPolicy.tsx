/**
 * 개인정보처리방침 페이지
 * AdSense 심사 필수 페이지
 */

import { useTranslation } from 'react-i18next'

interface PrivacyPolicyProps {
  onBack?: () => void
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('legal.privacy.title')}</h1>
        <p className="text-gray-500 mb-8">{t('legal.lastUpdated')}</p>

        <div className="prose prose-bread max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.privacy.section1Title')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.section1Content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.privacy.section2Title')}</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              {t('legal.privacy.section2Intro')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t('legal.privacy.section2Auto')}</li>
              <li>{t('legal.privacy.section2Local')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.privacy.section3Title')}</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t('legal.privacy.section3Item1')}</li>
              <li>{t('legal.privacy.section3Item2')}</li>
              <li>{t('legal.privacy.section3Item3')}</li>
              <li>{t('legal.privacy.section3Item4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.privacy.section4Title')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.section4Content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.privacy.section5Title')}</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              {t('legal.privacy.section5Intro')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t('legal.privacy.section5Item1')}</li>
              <li>{t('legal.privacy.section5Item2')}</li>
              <li>{t('legal.privacy.section5Item3')}</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              {t('legal.privacy.section5Note')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.privacy.section6Title')}</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              {t('legal.privacy.section6Intro')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bread-600 hover:underline"
                >
                  {t('legal.privacy.section6AdPolicy')}
                </a>
              </li>
              <li>
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bread-600 hover:underline"
                >
                  {t('legal.privacy.section6AdSettings')}
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.privacy.section7Title')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.section7Content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.privacy.section8Title')}</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              {t('legal.privacy.section8Intro')}
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>{t('legal.privacy.section8Item1')}</li>
              <li>{t('legal.privacy.section8Item2')}</li>
              <li>{t('legal.privacy.section8Item3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.privacy.section9Title')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.section9Content')}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">{t('legal.privacy.section10Title')}</h2>
            <p className="text-gray-600 leading-relaxed">
              {t('legal.privacy.section10Content')}
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>{t('legal.contact.serviceName')}:</strong> {t('legal.contact.serviceNameValue')}
              </p>
              <p className="text-gray-700">
                <strong>{t('legal.contact.email')}:</strong> jmyoon0702@gmail.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
