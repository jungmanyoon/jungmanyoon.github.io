/**
 * Footer 컴포넌트
 * 개인정보처리방침, 이용약관, 가이드, 문의 링크 포함
 */

import { useAppStore } from '@stores/useAppStore'

export default function Footer() {
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
              레시피북
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              제과제빵 전문가와 홈베이커를 위한 무료 레시피 변환 도구입니다.
              베이커스 퍼센트, DDT 계산, 팬 크기 조정 등 복잡한 계산을 쉽게 처리하세요.
            </p>
            <p className="text-xs text-gray-500">
              © 2024 레시피북. All rights reserved.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h4 className="text-white font-semibold mb-3">바로가기</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNavigation('dashboard')}
                  className="hover:text-white transition-colors"
                >
                  대시보드
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('recipes')}
                  className="hover:text-white transition-colors"
                >
                  레시피 목록
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('calculator')}
                  className="hover:text-white transition-colors"
                >
                  DDT 계산기
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('guide')}
                  className="hover:text-white transition-colors"
                >
                  사용 가이드
                </button>
              </li>
            </ul>
          </div>

          {/* 법적 정보 */}
          <div>
            <h4 className="text-white font-semibold mb-3">정보</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => handleNavigation('privacy')}
                  className="hover:text-white transition-colors"
                >
                  개인정보처리방침
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('terms')}
                  className="hover:text-white transition-colors"
                >
                  이용약관
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('contact')}
                  className="hover:text-white transition-colors"
                >
                  문의하기
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
            ⚠️ 본 서비스는 무료로 제공되며, 계산 결과의 정확성을 보장하지 않습니다.
            상업적 용도로 사용 시 직접 검증하시기 바랍니다.
          </p>
        </div>
      </div>
    </footer>
  )
}
