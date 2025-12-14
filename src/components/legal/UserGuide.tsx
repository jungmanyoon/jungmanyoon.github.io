/**
 * 사용 가이드 페이지
 * AdSense 심사 권장 - 콘텐츠 충실도 향상
 */

interface UserGuideProps {
  onBack?: () => void
  onNavigate?: (tab: string) => void
}

export default function UserGuide({ onBack, onNavigate }: UserGuideProps) {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">사용 가이드</h1>
        <p className="text-gray-500 mb-8">레시피북 - 제과제빵 레시피 변환기 완벽 활용법</p>

        <div className="prose prose-bread max-w-none space-y-10">
          {/* 소개 섹션 */}
          <section className="bg-gradient-to-r from-bread-50 to-amber-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-bread-800 mb-3">서비스 소개</h2>
            <p className="text-gray-700 leading-relaxed">
              <strong>레시피북</strong>은 제과제빵 전문가와 홈베이커를 위한 무료 레시피 변환 도구입니다.
              베이커스 퍼센트 계산, 반죽 온도(DDT) 계산, 팬 크기별 레시피 조정 등
              복잡한 계산을 자동으로 처리하여 더 정확하고 일관된 베이킹을 도와드립니다.
            </p>
          </section>

          {/* 핵심 기능 1: 베이커스 퍼센트 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-bread-100 text-bread-700 px-3 py-1 rounded-full text-sm">1</span>
              베이커스 퍼센트 (Baker's Percentage)
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-600 mb-3">
                <strong>베이커스 퍼센트란?</strong> 모든 재료의 양을 밀가루 무게 대비 백분율로 표현하는 방식입니다.
                전문 제빵사들이 전 세계적으로 사용하는 표준 표기법입니다.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-500 mb-2">예시: 기본 식빵 레시피</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>밀가루: 100%</li>
                    <li>물: 65%</li>
                    <li>소금: 2%</li>
                    <li>이스트: 1%</li>
                  </ul>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm text-gray-500 mb-2">장점</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ 레시피 스케일링이 쉬움</li>
                    <li>✓ 재료 비율을 한눈에 파악</li>
                    <li>✓ 수화율 즉시 확인</li>
                  </ul>
                </div>
              </div>
            </div>
            <h3 className="font-medium text-gray-700 mb-2">사용 방법</h3>
            <ol className="list-decimal list-inside text-gray-600 space-y-2">
              <li><strong>대시보드</strong>에서 레시피를 선택하거나 새로 입력합니다.</li>
              <li>밀가루 무게를 기준으로 다른 재료들의 퍼센트가 자동 계산됩니다.</li>
              <li>목표 총량을 입력하면 모든 재료가 비례 조정됩니다.</li>
            </ol>
          </section>

          {/* 핵심 기능 2: DDT 계산기 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-bread-100 text-bread-700 px-3 py-1 rounded-full text-sm">2</span>
              DDT 계산기 (반죽 온도 계산)
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-gray-600 mb-3">
                <strong>DDT(Desired Dough Temperature)</strong>는 반죽의 목표 온도입니다.
                일관된 발효를 위해 매우 중요하며, 이 계산기는 물 온도를 자동으로 계산해줍니다.
              </p>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm font-medium text-gray-700 mb-2">DDT 공식</p>
                <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded">
                  물 온도 = (DDT × 계수) - 실온 - 밀가루온도 - 마찰계수
                </p>
              </div>
            </div>
            <h3 className="font-medium text-gray-700 mb-2">입력 항목</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>목표 반죽 온도:</strong> 일반적으로 24-27°C (식빵), 23-25°C (바게트)</li>
              <li><strong>실내 온도:</strong> 작업장 현재 온도</li>
              <li><strong>밀가루 온도:</strong> 보관 중인 밀가루 온도</li>
              <li><strong>믹서 종류:</strong> 손반죽, 스탠드믹서, 스파이럴믹서 등</li>
            </ul>
          </section>

          {/* 핵심 기능 3: 팬 크기 조정 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-bread-100 text-bread-700 px-3 py-1 rounded-full text-sm">3</span>
              팬 크기별 레시피 조정
            </h2>
            <p className="text-gray-600 mb-4">
              가지고 있는 팬 크기에 맞게 레시피를 자동 조정합니다. 원형, 사각형, 식빵 팬 등
              다양한 팬 형태를 지원합니다.
            </p>
            <div className="grid md:grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 p-3 rounded text-center">
                <div className="text-2xl mb-1">⭕</div>
                <p className="text-sm font-medium">원형 팬</p>
                <p className="text-xs text-gray-500">케이크, 파이</p>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center">
                <div className="text-2xl mb-1">⬜</div>
                <p className="text-sm font-medium">사각 팬</p>
                <p className="text-xs text-gray-500">브라우니, 시트케이크</p>
              </div>
              <div className="bg-gray-50 p-3 rounded text-center">
                <div className="text-2xl mb-1">📦</div>
                <p className="text-sm font-medium">식빵 팬</p>
                <p className="text-xs text-gray-500">식빵, 파운드케이크</p>
              </div>
            </div>
            <h3 className="font-medium text-gray-700 mb-2">조정 원리</h3>
            <p className="text-gray-600">
              팬 부피를 계산하여 원래 레시피의 재료 양을 비례 조정합니다.
              제품별 적정 비용적(specific volume)을 고려하여 과충전/과소충전을 방지합니다.
            </p>
          </section>

          {/* 핵심 기능 4: 환경 보정 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-bread-100 text-bread-700 px-3 py-1 rounded-full text-sm">4</span>
              환경 조건 보정
            </h2>
            <p className="text-gray-600 mb-4">
              온도, 습도, 고도에 따라 레시피를 자동 보정합니다. 계절이나 지역에 관계없이
              일관된 결과물을 얻을 수 있습니다.
            </p>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="border p-3 rounded">
                <h4 className="font-medium text-gray-700 mb-1">🌡️ 온도</h4>
                <p className="text-sm text-gray-500">발효 속도, 버터 상태에 영향</p>
              </div>
              <div className="border p-3 rounded">
                <h4 className="font-medium text-gray-700 mb-1">💧 습도</h4>
                <p className="text-sm text-gray-500">수분량 조정 필요</p>
              </div>
              <div className="border p-3 rounded">
                <h4 className="font-medium text-gray-700 mb-1">⛰️ 고도</h4>
                <p className="text-sm text-gray-500">팽창제, 온도 조정</p>
              </div>
            </div>
          </section>

          {/* 레시피 관리 */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-bread-100 text-bread-700 px-3 py-1 rounded-full text-sm">5</span>
              레시피 저장 및 관리
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>자동 저장:</strong> 레시피가 브라우저에 자동 저장됩니다.</li>
              <li><strong>내보내기:</strong> JSON 형식으로 레시피를 백업할 수 있습니다.</li>
              <li><strong>가져오기:</strong> 백업한 레시피를 불러올 수 있습니다.</li>
              <li><strong>분류:</strong> 카테고리, 태그로 레시피를 정리할 수 있습니다.</li>
            </ul>
          </section>

          {/* 팁 */}
          <section className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-green-800 mb-4">💡 베이킹 팁</h2>
            <ul className="text-green-900 space-y-3">
              <li>
                <strong>재료 계량:</strong> 정확한 계량을 위해 항상 저울을 사용하세요.
                특히 밀가루는 컵 계량 시 오차가 크게 발생합니다.
              </li>
              <li>
                <strong>실온 재료:</strong> 버터, 달걀 등은 레시피에 명시되지 않는 한
                실온 상태로 사용하세요.
              </li>
              <li>
                <strong>오븐 예열:</strong> 오븐은 최소 15-20분 전에 예열을 시작하세요.
              </li>
              <li>
                <strong>기록 습관:</strong> 매번 결과를 기록하면 레시피 개선에 도움이 됩니다.
              </li>
            </ul>
          </section>

          {/* 시작하기 */}
          <section className="text-center py-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">지금 바로 시작하세요!</h2>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => onNavigate?.('dashboard')}
                className="px-6 py-2 bg-bread-600 text-white rounded-lg hover:bg-bread-700 transition-colors"
              >
                대시보드로 이동
              </button>
              <button
                onClick={() => onNavigate?.('recipes')}
                className="px-6 py-2 border border-bread-600 text-bread-600 rounded-lg hover:bg-bread-50 transition-colors"
              >
                레시피 둘러보기
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
