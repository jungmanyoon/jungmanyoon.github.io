/**
 * 문의하기 페이지
 * AdSense 심사 권장 - 신뢰도 향상
 */

interface ContactProps {
  onBack?: () => void
}

export default function Contact({ onBack }: ContactProps) {
  const handleEmailClick = () => {
    window.location.href = 'mailto:jmyoon0702@gmail.com?subject=[레시피북] 문의드립니다'
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
            돌아가기
          </button>
        )}

        <h1 className="text-3xl font-bold text-gray-900 mb-2">문의하기</h1>
        <p className="text-gray-500 mb-8">궁금한 점이나 제안이 있으시면 연락해 주세요</p>

        <div className="space-y-8">
          {/* 문의 방법 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">연락 방법</h2>
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
                    <h3 className="font-medium text-gray-900">이메일</h3>
                    <p className="text-bread-600">jmyoon0702@gmail.com</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  기능 제안, 버그 신고, 일반 문의 등 모든 문의를 환영합니다.
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
                    <h3 className="font-medium text-gray-900">GitHub</h3>
                    <p className="text-gray-600">이슈 & 기여</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  버그 리포트, 기능 요청, 코드 기여를 환영합니다.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">자주 묻는 질문</h2>
            <div className="space-y-4">
              <details className="group border rounded-lg">
                <summary className="p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-700">저장한 레시피가 사라졌어요</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600">
                  <p>레시피는 브라우저의 로컬 저장소에 저장됩니다. 브라우저 데이터를 삭제하거나
                  시크릿 모드를 사용하면 데이터가 유지되지 않습니다. 중요한 레시피는
                  '내보내기' 기능으로 백업해 두세요.</p>
                </div>
              </details>

              <details className="group border rounded-lg">
                <summary className="p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-700">다른 기기에서 레시피를 사용하고 싶어요</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600">
                  <p>현재 기기에서 레시피를 '내보내기'한 후, 다른 기기에서 '가져오기'를
                  사용하면 됩니다. JSON 파일 형식으로 저장되어 쉽게 공유할 수 있습니다.</p>
                </div>
              </details>

              <details className="group border rounded-lg">
                <summary className="p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-700">계산 결과가 정확한가요?</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600">
                  <p>본 서비스의 계산은 전문 제빵 공식을 기반으로 하지만, 참고용입니다.
                  실제 베이킹 시에는 오븐 특성, 재료 상태 등에 따라 조정이 필요할 수 있습니다.
                  상업적 용도로 사용 시에는 반드시 직접 검증하세요.</p>
                </div>
              </details>

              <details className="group border rounded-lg">
                <summary className="p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-700">앱을 오프라인에서도 사용할 수 있나요?</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600">
                  <p>네! 이 앱은 PWA(Progressive Web App)로 제작되어 한 번 방문 후에는
                  오프라인에서도 사용할 수 있습니다. 모바일에서는 '홈 화면에 추가'를 통해
                  앱처럼 사용할 수 있습니다.</p>
                </div>
              </details>

              <details className="group border rounded-lg">
                <summary className="p-4 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50">
                  <span className="font-medium text-gray-700">서비스는 무료인가요?</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-gray-600">
                  <p>네, 모든 기능을 무료로 사용할 수 있습니다. 서비스 운영을 위해
                  광고가 표시될 수 있습니다.</p>
                </div>
              </details>
            </div>
          </section>

          {/* 피드백 요청 */}
          <section className="bg-gradient-to-r from-bread-50 to-amber-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-bread-800 mb-3">여러분의 의견을 기다립니다</h2>
            <p className="text-gray-700 mb-4">
              레시피북은 사용자 피드백을 바탕으로 계속 발전하고 있습니다.
              새로운 기능 아이디어, 개선 제안, 또는 버그 발견 시 언제든지 연락해 주세요.
            </p>
            <button
              onClick={handleEmailClick}
              className="px-6 py-2 bg-bread-600 text-white rounded-lg hover:bg-bread-700 transition-colors"
            >
              피드백 보내기
            </button>
          </section>

          {/* 서비스 정보 */}
          <section className="border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">서비스 정보</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>서비스명:</strong> 레시피북 - 제과제빵 레시피 변환기</p>
              <p><strong>버전:</strong> 1.0.0</p>
              <p><strong>개발:</strong> 개인 프로젝트 (취미)</p>
              <p><strong>기술 스택:</strong> React, TypeScript, Tailwind CSS, PWA</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
