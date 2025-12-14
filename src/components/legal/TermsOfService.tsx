/**
 * 이용약관 및 면책조항 페이지
 * AdSense 심사 권장 페이지
 */

interface TermsOfServiceProps {
  onBack?: () => void
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">이용약관</h1>
        <p className="text-gray-500 mb-8">최종 업데이트: 2024년 12월</p>

        <div className="prose prose-bread max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제1조 (목적)</h2>
            <p className="text-gray-600 leading-relaxed">
              본 약관은 레시피북 - 제과제빵 레시피 변환기(이하 "서비스")를 이용함에 있어 서비스
              제공자와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제2조 (정의)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>"서비스"란 제과제빵 레시피 변환, 베이커스 퍼센트 계산, DDT 계산 등의 기능을 제공하는 웹 애플리케이션을 말합니다.</li>
              <li>"이용자"란 본 서비스에 접속하여 본 약관에 따라 서비스를 이용하는 자를 말합니다.</li>
              <li>"콘텐츠"란 서비스 내에서 제공되는 레시피, 계산 결과, 정보 등을 말합니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제3조 (서비스의 제공)</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              서비스는 다음의 기능을 무료로 제공합니다:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>레시피 재료 비율 변환 (베이커스 퍼센트)</li>
              <li>반죽 온도 계산 (DDT Calculator)</li>
              <li>팬 크기별 레시피 조정</li>
              <li>환경 조건에 따른 보정 계산</li>
              <li>레시피 저장 및 관리</li>
              <li>원가 계산 기능</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제4조 (서비스 이용)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>서비스는 회원가입 없이 누구나 이용할 수 있습니다.</li>
              <li>이용자는 본 약관 및 관련 법령을 준수하여 서비스를 이용해야 합니다.</li>
              <li>서비스 이용 중 저장되는 데이터는 이용자의 브라우저 로컬 저장소에 보관됩니다.</li>
            </ul>
          </section>

          <section className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <h2 className="text-xl font-semibold text-amber-800 mb-3">제5조 (면책조항) - 중요</h2>
            <div className="text-amber-900 space-y-3">
              <p className="leading-relaxed">
                <strong>1.</strong> 본 서비스는 무료로 제공되며, 서비스 제공자는 서비스의 정확성,
                완전성, 신뢰성에 대해 어떠한 보증도 하지 않습니다.
              </p>
              <p className="leading-relaxed">
                <strong>2.</strong> 서비스에서 제공하는 계산 결과는 참고용으로만 사용해야 하며,
                실제 제과제빵 작업 시에는 이용자가 직접 검증해야 합니다.
              </p>
              <p className="leading-relaxed">
                <strong>3.</strong> 서비스 이용으로 인해 발생하는 직접적, 간접적, 부수적,
                결과적 손해에 대해 서비스 제공자는 책임을 지지 않습니다.
              </p>
              <p className="leading-relaxed">
                <strong>4.</strong> 상업적 목적으로 본 서비스의 계산 결과를 사용하는 경우,
                이용자는 반드시 결과를 독립적으로 검증해야 합니다.
              </p>
              <p className="leading-relaxed">
                <strong>5. 본 서비스는 전문적인 제과제빵 조언을 대체할 수 없습니다.</strong>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제6조 (지적재산권)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>서비스의 저작권 및 지적재산권은 서비스 제공자에게 있습니다.</li>
              <li>이용자가 직접 입력한 레시피 데이터의 권리는 이용자에게 있습니다.</li>
              <li>서비스에서 제공하는 샘플 레시피는 교육 및 참고 목적으로만 사용할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제7조 (금지 행위)</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              이용자는 다음 행위를 해서는 안 됩니다:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>서비스의 정상적인 운영을 방해하는 행위</li>
              <li>타인의 개인정보를 침해하는 행위</li>
              <li>서비스를 이용한 불법적인 활동</li>
              <li>서비스의 소스코드를 무단으로 수정, 배포하는 행위</li>
              <li>악성코드를 유포하거나 해킹을 시도하는 행위</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제8조 (광고)</h2>
            <p className="text-gray-600 leading-relaxed">
              서비스는 운영 비용 충당을 위해 광고를 게재할 수 있습니다. 이용자는 서비스 이용 시
              노출되는 광고에 대해 동의한 것으로 간주됩니다. 광고 관련 상세 내용은
              개인정보처리방침을 참조하시기 바랍니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제9조 (서비스의 변경 및 중단)</h2>
            <ul className="list-decimal list-inside text-gray-600 space-y-2">
              <li>서비스 제공자는 서비스의 내용을 변경하거나 중단할 수 있습니다.</li>
              <li>서비스 중단 시 가능한 범위 내에서 사전 공지합니다.</li>
              <li>서비스 변경 또는 중단으로 인한 손해에 대해 서비스 제공자는 책임을 지지 않습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제10조 (약관의 변경)</h2>
            <p className="text-gray-600 leading-relaxed">
              서비스 제공자는 필요한 경우 본 약관을 변경할 수 있으며, 변경된 약관은 서비스 내
              공지를 통해 효력이 발생합니다. 변경된 약관에 동의하지 않는 이용자는 서비스 이용을
              중단할 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">제11조 (준거법 및 관할)</h2>
            <p className="text-gray-600 leading-relaxed">
              본 약관의 해석 및 분쟁 해결은 대한민국 법률에 따르며, 분쟁 발생 시 서비스
              제공자의 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">부칙</h2>
            <p className="text-gray-600 leading-relaxed">
              본 약관은 2024년 12월 1일부터 시행됩니다.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
