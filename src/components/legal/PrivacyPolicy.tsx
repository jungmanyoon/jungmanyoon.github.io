/**
 * 개인정보처리방침 페이지
 * AdSense 심사 필수 페이지
 */

interface PrivacyPolicyProps {
  onBack?: () => void
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
        <p className="text-gray-500 mb-8">최종 업데이트: 2024년 12월</p>

        <div className="prose prose-bread max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. 개요</h2>
            <p className="text-gray-600 leading-relaxed">
              레시피북 - 제과제빵 레시피 변환기(이하 "서비스")는 사용자의 개인정보를 중요시하며,
              개인정보보호법 등 관련 법령을 준수하고 있습니다. 본 개인정보처리방침은 서비스 이용 시
              수집되는 개인정보의 항목, 수집 목적, 이용 방법 등을 안내합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. 수집하는 개인정보 항목</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              본 서비스는 회원가입 없이 이용 가능하며, 최소한의 정보만을 수집합니다.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>자동 수집 정보:</strong> 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보, 브라우저 유형</li>
              <li><strong>로컬 저장 정보:</strong> 레시피 데이터, 앱 설정 (사용자 기기에만 저장)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. 개인정보의 수집 및 이용 목적</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>서비스 제공 및 운영</li>
              <li>서비스 개선 및 신규 기능 개발</li>
              <li>이용 통계 분석</li>
              <li>광고 게재 및 맞춤형 광고 제공 (Google AdSense)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. 개인정보의 보유 및 이용 기간</h2>
            <p className="text-gray-600 leading-relaxed">
              수집된 개인정보는 서비스 이용 기간 동안 보유되며, 사용자가 브라우저 데이터를 삭제하거나
              서비스 이용을 중단할 경우 즉시 파기됩니다. 로컬 저장소에 저장된 데이터는 사용자가
              직접 삭제할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. 쿠키(Cookie)의 사용</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              본 서비스는 사용자 경험 개선 및 광고 제공을 위해 쿠키를 사용합니다.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>필수 쿠키:</strong> 서비스 이용에 필요한 기본 기능 제공</li>
              <li><strong>분석 쿠키:</strong> 서비스 이용 패턴 분석 (Google Analytics)</li>
              <li><strong>광고 쿠키:</strong> 맞춤형 광고 제공 (Google AdSense)</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              사용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에
              제한이 있을 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. 광고 관련 안내</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              본 서비스는 Google AdSense를 통해 광고를 게재하고 있습니다. Google은 사용자의
              관심사에 기반한 광고를 제공하기 위해 쿠키를 사용할 수 있습니다.
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>
                Google의 광고 쿠키 사용에 대한 자세한 내용은{' '}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bread-600 hover:underline"
                >
                  Google 광고 정책
                </a>
                을 참조하세요.
              </li>
              <li>
                맞춤 광고를 원하지 않는 경우{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-bread-600 hover:underline"
                >
                  Google 광고 설정
                </a>
                에서 비활성화할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. 개인정보의 제3자 제공</h2>
            <p className="text-gray-600 leading-relaxed">
              본 서비스는 사용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 의한 요청이
              있는 경우, 수사기관의 요청이 있는 경우에는 예외로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. 사용자의 권리</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              사용자는 언제든지 다음의 권리를 행사할 수 있습니다:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>로컬에 저장된 데이터 삭제 (브라우저 설정 또는 앱 내 설정)</li>
              <li>쿠키 수집 거부 (브라우저 설정)</li>
              <li>맞춤형 광고 비활성화 (Google 광고 설정)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. 개인정보처리방침 변경</h2>
            <p className="text-gray-600 leading-relaxed">
              본 개인정보처리방침은 법령 또는 서비스 변경에 따라 수정될 수 있으며, 변경 시
              서비스 내 공지를 통해 안내드립니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">10. 문의처</h2>
            <p className="text-gray-600 leading-relaxed">
              개인정보 관련 문의사항이 있으시면 아래로 연락해 주세요.
            </p>
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>서비스명:</strong> 레시피북 - 제과제빵 레시피 변환기
              </p>
              <p className="text-gray-700">
                <strong>이메일:</strong> jmyoon@iljin.co.kr
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
