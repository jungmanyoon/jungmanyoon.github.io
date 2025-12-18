/**
 * 문의하기 페이지
 * AdSense 심사 권장 - 신뢰도 향상
 */

import { useTranslation } from 'react-i18next'

interface ContactProps {
  onBack?: () => void
}

export default function Contact({ onBack }: ContactProps) {
  const { t } = useTranslation()

  const handleEmailClick = () => {
    window.location.href = 'mailto:jmyoon0702@gmail.com?subject=[Recipe Book] Inquiry'
  }

  const handleGithubClick = () => {
    window.open('https://github.com/jungmanyoon/baking-converter', '_blank')
  }

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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('legal.contact.title')}</h1>
        <p className="text-gray-500 mb-8">{t('legal.contact.subtitle')}</p>

        <div className="space-y-8">
          {/* 문의 방법 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('legal.contact.methods')}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {/* 이메일 */}
              <div
                onClick={handleEmailClick}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-bread-400 hover:bg-bread-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-bread-100 rounded-full flex items-center justify-center group-hover:bg-bread-200 transition-colors">
                    <svg className="w-6 h-6 text-bread-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('legal.contact.email')}</h3>
                    <p className="text-bread-600">jmyoon0702@gmail.com</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  {t('legal.contact.emailDesc')}
                </p>
              </div>

              {/* GitHub */}
              <div
                onClick={handleGithubClick}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t('legal.contact.github')}</h3>
                    <p className="text-gray-600">{t('legal.contact.githubSubtitle')}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  {t('legal.contact.githubDesc')}
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('legal.contact.faq')}</h2>
            <div className="space-y-4">
              <details className="group border rounded-lg">
                <summary className="p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-700">{t('legal.contact.faq1q')}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600">
                  <p>{t('legal.contact.faq1a')}</p>
                </div>
              </details>

              <details className="group border rounded-lg">
                <summary className="p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-700">{t('legal.contact.faq2q')}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600">
                  <p>{t('legal.contact.faq2a')}</p>
                </div>
              </details>

              <details className="group border rounded-lg">
                <summary className="p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-700">{t('legal.contact.faq3q')}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600">
                  <p>{t('legal.contact.faq3a')}</p>
                </div>
              </details>

              <details className="group border rounded-lg">
                <summary className="p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-700">{t('legal.contact.faq4q')}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600">
                  <p>{t('legal.contact.faq4a')}</p>
                </div>
              </details>

              <details className="group border rounded-lg">
                <summary className="p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-700">{t('legal.contact.faq5q')}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600">
                  <p>{t('legal.contact.faq5a')}</p>
                </div>
              </details>
            </div>
          </section>

          {/* 피드백 요청 */}
          <section className="bg-gradient-to-r from-bread-50 to-amber-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-bread-800 mb-3">{t('legal.contact.feedbackTitle')}</h2>
            <p className="text-gray-700 mb-4">
              {t('legal.contact.feedbackDesc')}
            </p>
            <button
              onClick={handleEmailClick}
              className="px-6 py-2 bg-bread-600 text-white rounded-lg hover:bg-bread-700 transition-colors"
            >
              {t('legal.contact.sendFeedback')}
            </button>
          </section>

          {/* 서비스 정보 */}
          <section className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">{t('legal.contact.serviceInfo')}</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>{t('legal.contact.serviceName')}:</strong> {t('legal.contact.serviceNameValue')}</p>
              <p><strong>{t('legal.contact.version')}:</strong> 1.0.0</p>
              <p><strong>{t('legal.contact.development')}:</strong> {t('legal.contact.developmentValue')}</p>
              <p><strong>{t('legal.contact.techStack')}:</strong> React, TypeScript, Tailwind CSS, PWA</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
