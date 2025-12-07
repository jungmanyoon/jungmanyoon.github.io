import React from 'react'
import Button from '../common/Button.jsx'

function Help({ onClose }) {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-bread-700">도움말</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4">
          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">시작하기</h3>
            <div className="prose text-gray-700">
              <p className="mb-2">레시피북은 제과제빵 레시피를 쉽게 관리하고 변환할 수 있는 무료 웹 애플리케이션입니다.</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>"내 레시피" 탭에서 레시피를 관리합니다.</li>
                <li>재료를 입력하면 베이커스 퍼센트가 자동으로 계산됩니다.</li>
                <li>저장된 레시피는 다양한 제법으로 변환하거나 팬 크기에 맞게 조정할 수 있습니다.</li>
              </ol>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">기본 사용법</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-bread-700 mb-2">새 레시피 만들기</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  <li>"내 레시피" 탭에서 "새 레시피" 버튼 클릭</li>
                  <li>레시피 이름과 설명 입력</li>
                  <li>재료 추가 버튼을 클릭하여 재료 입력</li>
                  <li>재료 종류(밀가루, 액체 등) 선택 - 정확한 계산을 위해 중요!</li>
                  <li>제법 선택 (스트레이트법, 중종법 등)</li>
                  <li>"저장" 버튼 클릭</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-bread-700 mb-2">제법 변환</h4>
                <p className="text-sm text-gray-700 mb-2">
                  스트레이트법을 다른 제법으로 변환할 수 있습니다:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>중종법: 30% 전발효</li>
                  <li>폴리쉬법: 50% 전발효, 100% 수화율</li>
                  <li>비가법: 60% 전발효, 50% 수화율</li>
                  <li>저온숙성법: 이스트 30% 감소</li>
                  <li>노타임법: 이스트 50% 증가</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  ⚠️ 변환 시 액체 재료는 비율에 따라 자동 분배됩니다
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">주요 기능</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">📏 팬 크기 조정</h4>
                <p className="text-sm text-gray-600">
                  다른 크기의 팬으로 레시피를 조정할 수 있습니다.
                  원형, 사각형, 식빵틀, 쉬폰틀 등 다양한 팬을 지원합니다.
                </p>
              </div>
              
              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">✨ 고급 팬 선택기</h4>
                <p className="text-sm text-gray-600">
                  매직넘버 시스템을 사용하여 팬 크기에 따른 최적 반죽량을 계산합니다.
                  팬 재질과 고도까지 고려한 정밀한 계산이 가능합니다.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">🌡️ DDT 계산기</h4>
                <p className="text-sm text-gray-600">
                  원하는 반죽 온도를 달성하기 위한 물 온도를 계산합니다.
                  믹서 종류별 마찰계수를 고려하며, 얼음 필요량도 계산합니다.
                </p>
              </div>
              
              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">🌍 환경 보정</h4>
                <p className="text-sm text-gray-600">
                  온도, 습도, 고도에 따른 레시피 자동 보정 기능을 제공합니다.
                  계절별/지역별 프리셋으로 빠른 설정이 가능합니다.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">고급 기능</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-bread-700 mb-2">매직넘버 시스템</h4>
                <p className="text-sm text-gray-700 mb-2">
                  팬 부피 ÷ 매직넘버 = 권장 반죽량
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>식빵: 1.75 ~ 1.85</li>
                  <li>케이크: 1.25 ~ 1.55</li>
                  <li>머핀: 1.35 ~ 1.45</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-bread-700 mb-2">다중 팬 분배</h4>
                <p className="text-sm text-gray-700">
                  여러 개의 팬에 반죽을 나누어 굽기 위한 자동 계산 기능
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-bread-700 mb-2">얼음 계산</h4>
                <p className="text-sm text-gray-700">
                  DDT 계산 시 필요한 물 온도가 낮을 경우 얼음량 자동 계산
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">베이커스 퍼센트란?</h3>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                베이커스 퍼센트는 밀가루의 무게를 100%로 기준으로 하여 다른 재료들의 비율을 표현하는 방법입니다.
              </p>
              <p className="text-sm text-blue-800">
                예: 밀가루 1000g, 물 650g인 경우 → 수화율 65%
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">주의사항</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>모든 데이터는 브라우저에 저장됩니다 (LocalStorage)</li>
              <li>브라우저 데이터를 삭제하면 레시피가 사라집니다</li>
              <li>계산 결과는 참고용이며, 실제 결과는 다를 수 있습니다</li>
              <li>고도가 높은 지역에서는 추가 조정이 필요할 수 있습니다</li>
              <li>재료 타입을 정확히 선택해야 제법 변환이 올바르게 작동합니다</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">문의 및 피드백</h3>
            <p className="text-sm text-gray-700">
              버그 신고나 기능 제안은 GitHub Issues를 통해 남겨주세요.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              버전: 1.0.0 | 마지막 업데이트: 2025년 7월
            </p>
          </section>
        </div>

        <div className="mt-6 flex justify-end border-t pt-4">
          <Button onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  )
}

export default Help