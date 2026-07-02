import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button.jsx'

// 번역 로드 실패 시 표시할 기본 한글 콘텐츠
const DEFAULT_CONTENT = {
  title: '도움말',
  gettingStarted: {
    title: '시작하기',
    intro: '레시피북은 제과제빵 전문가와 홈베이커를 위한 무료 레시피 변환 도구입니다.',
    step1: '재료와 분량을 입력하세요',
    step2: '팬 크기나 배수를 설정하세요',
    step3: '자동으로 계산된 레시피를 확인하세요'
  },
  basicUsage: {
    title: '기본 사용법',
    newRecipe: {
      title: '새 레시피 만들기',
      step1: '대시보드에서 "새 레시피" 버튼을 클릭합니다',
      step2: '레시피 이름을 입력합니다',
      step3: '재료를 추가합니다 (이름, 분량, 카테고리)',
      step4: '팬/틀 설정에서 원하는 크기를 선택합니다',
      step5: '필요한 경우 배수를 조정합니다',
      step6: '저장 버튼을 눌러 레시피를 저장합니다'
    },
    methodConversion: {
      title: '제법 변환',
      intro: '직반죽법 레시피를 다양한 제법으로 변환할 수 있습니다:',
      sponge: '스펀지법: 발효종을 미리 만들어 풍미 향상',
      poolish: '풀리시법: 액종 사용으로 촉촉한 식감',
      biga: '비가법: 단단한 사전반죽으로 깊은 맛',
      overnight: '오버나이트법: 냉장 발효로 복합적 풍미',
      notime: '노타임법: 빠른 제조를 위한 직접법',
      warning: '제법 변환은 가이드라인이며, 실제 결과는 다를 수 있습니다.'
    }
  },
  features: {
    title: '주요 기능',
    panScaling: {
      title: '팬 크기 조정',
      desc: '다양한 팬 크기에 맞춰 레시피를 자동으로 조정합니다. 식빵틀, 원형팬, 사각팬 등 여러 팬 형태를 지원합니다.'
    },
    advancedPan: {
      title: '고급 팬 설정',
      desc: '비용적(Specific Volume)을 기반으로 정확한 반죽량을 계산합니다. 제품별로 다른 비용적 값을 적용할 수 있습니다.'
    },
    ddtCalc: {
      title: 'DDT 계산기',
      desc: '목표 반죽 온도(DDT)를 달성하기 위한 물 온도를 계산합니다. 실내 온도, 밀가루 온도, 믹서 마찰열을 고려합니다.'
    },
    envAdjust: {
      title: '환경 보정',
      desc: '온도, 습도, 고도에 따라 레시피를 자동으로 보정합니다. 계절과 지역에 맞는 최적의 결과를 얻을 수 있습니다.'
    }
  },
  advanced: {
    title: '고급 기능',
    magicNumber: {
      title: '매직 넘버 (비용적)',
      formula: '팬 용량(ml) ÷ 비용적 = 반죽 무게(g)',
      bread: '식빵: 3.4~4.2 cm³/g (조밀함~에어리)',
      cake: '케이크: 2.3~3.2 cm³/g (파운드~시폰)',
      muffin: '머핀/컵케이크: 2.0~2.5 cm³/g'
    },
    multiPan: {
      title: '다중 팬 설정',
      desc: '여러 개의 팬을 동시에 설정하여 총 반죽량을 계산할 수 있습니다. 다양한 크기의 팬을 조합하여 사용하세요.'
    },
    iceCalc: {
      title: '얼음물 계산',
      desc: 'DDT가 매우 낮을 때 얼음을 섞어야 하는 경우, 필요한 얼음량을 자동으로 계산합니다.'
    }
  },
  bakersPercent: {
    title: '베이커스 퍼센트란?',
    desc: '베이커스 퍼센트는 밀가루 무게를 100%로 기준삼아 다른 모든 재료를 백분율로 표현하는 방식입니다. 이 방식을 사용하면 레시피 비율을 쉽게 이해하고 어떤 양으로든 확장할 수 있습니다.',
    example: '예: 밀가루 1000g, 물 650g → 수화율 65%'
  },
  notes: {
    title: '참고사항',
    note1: '모든 계산은 표준 조건(실온 25°C, 습도 65%)을 기준으로 합니다.',
    note2: '발효 시간은 환경에 따라 크게 달라질 수 있습니다.',
    note3: '레시피는 브라우저의 로컬 스토리지에 저장되어 기기별로 유지됩니다.',
    note4: '정확한 결과를 위해 디지털 저울 사용을 권장합니다.',
    note5: '오븐 온도와 시간은 기기에 따라 조정이 필요할 수 있습니다.'
  },
  feedback: {
    title: '피드백',
    desc: '서비스 개선을 위한 의견이나 버그 제보는 언제든 환영합니다. 문의하기 페이지를 통해 연락해 주세요.',
    version: '레시피북 v1.0'
  }
}

// 번역 함수 래퍼: 번역 실패 시 기본값 반환
const getContent = (t, key, fallback) => {
  const translated = t(key)
  // 번역 키가 그대로 반환되면 (번역 실패) 기본값 사용
  return translated === key ? fallback : translated
}

function Help({ onClose }) {
  const { t } = useTranslation()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-bread-700">
            {getContent(t, 'help.title', DEFAULT_CONTENT.title)}
          </h2>
          <button
            onClick={onClose}
            aria-label={getContent(t, 'help.close', '도움말 닫기')}
            className="text-gray-500 hover:text-gray-700 text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div className="space-y-8 max-h-[70vh] overflow-y-auto pr-4">
          {/* 시작하기 */}
          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">
              {getContent(t, 'help.gettingStarted.title', DEFAULT_CONTENT.gettingStarted.title)}
            </h3>
            <div className="prose text-gray-700">
              <p className="mb-2">
                {getContent(t, 'help.gettingStarted.intro', DEFAULT_CONTENT.gettingStarted.intro)}
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>{getContent(t, 'help.gettingStarted.step1', DEFAULT_CONTENT.gettingStarted.step1)}</li>
                <li>{getContent(t, 'help.gettingStarted.step2', DEFAULT_CONTENT.gettingStarted.step2)}</li>
                <li>{getContent(t, 'help.gettingStarted.step3', DEFAULT_CONTENT.gettingStarted.step3)}</li>
              </ol>
            </div>
          </section>

          {/* 기본 사용법 */}
          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">
              {getContent(t, 'help.basicUsage.title', DEFAULT_CONTENT.basicUsage.title)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-bread-700 mb-2">
                  {getContent(t, 'help.basicUsage.newRecipe.title', DEFAULT_CONTENT.basicUsage.newRecipe.title)}
                </h4>
                <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                  <li>{getContent(t, 'help.basicUsage.newRecipe.step1', DEFAULT_CONTENT.basicUsage.newRecipe.step1)}</li>
                  <li>{getContent(t, 'help.basicUsage.newRecipe.step2', DEFAULT_CONTENT.basicUsage.newRecipe.step2)}</li>
                  <li>{getContent(t, 'help.basicUsage.newRecipe.step3', DEFAULT_CONTENT.basicUsage.newRecipe.step3)}</li>
                  <li>{getContent(t, 'help.basicUsage.newRecipe.step4', DEFAULT_CONTENT.basicUsage.newRecipe.step4)}</li>
                  <li>{getContent(t, 'help.basicUsage.newRecipe.step5', DEFAULT_CONTENT.basicUsage.newRecipe.step5)}</li>
                  <li>{getContent(t, 'help.basicUsage.newRecipe.step6', DEFAULT_CONTENT.basicUsage.newRecipe.step6)}</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium text-bread-700 mb-2">
                  {getContent(t, 'help.basicUsage.methodConversion.title', DEFAULT_CONTENT.basicUsage.methodConversion.title)}
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  {getContent(t, 'help.basicUsage.methodConversion.intro', DEFAULT_CONTENT.basicUsage.methodConversion.intro)}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>{getContent(t, 'help.basicUsage.methodConversion.sponge', DEFAULT_CONTENT.basicUsage.methodConversion.sponge)}</li>
                  <li>{getContent(t, 'help.basicUsage.methodConversion.poolish', DEFAULT_CONTENT.basicUsage.methodConversion.poolish)}</li>
                  <li>{getContent(t, 'help.basicUsage.methodConversion.biga', DEFAULT_CONTENT.basicUsage.methodConversion.biga)}</li>
                  <li>{getContent(t, 'help.basicUsage.methodConversion.overnight', DEFAULT_CONTENT.basicUsage.methodConversion.overnight)}</li>
                  <li>{getContent(t, 'help.basicUsage.methodConversion.notime', DEFAULT_CONTENT.basicUsage.methodConversion.notime)}</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  <span aria-hidden="true">⚠️</span> {getContent(t, 'help.basicUsage.methodConversion.warning', DEFAULT_CONTENT.basicUsage.methodConversion.warning)}
                </p>
              </div>
            </div>
          </section>

          {/* 주요 기능 */}
          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">
              {getContent(t, 'help.features.title', DEFAULT_CONTENT.features.title)}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">
                  <span aria-hidden="true">📏</span> {getContent(t, 'help.features.panScaling.title', DEFAULT_CONTENT.features.panScaling.title)}
                </h4>
                <p className="text-sm text-gray-600">
                  {getContent(t, 'help.features.panScaling.desc', DEFAULT_CONTENT.features.panScaling.desc)}
                </p>
              </div>

              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">
                  <span aria-hidden="true">✨</span> {getContent(t, 'help.features.advancedPan.title', DEFAULT_CONTENT.features.advancedPan.title)}
                </h4>
                <p className="text-sm text-gray-600">
                  {getContent(t, 'help.features.advancedPan.desc', DEFAULT_CONTENT.features.advancedPan.desc)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">
                  <span aria-hidden="true">🌡️</span> {getContent(t, 'help.features.ddtCalc.title', DEFAULT_CONTENT.features.ddtCalc.title)}
                </h4>
                <p className="text-sm text-gray-600">
                  {getContent(t, 'help.features.ddtCalc.desc', DEFAULT_CONTENT.features.ddtCalc.desc)}
                </p>
              </div>

              <div className="p-4 bg-bread-50 rounded-lg">
                <h4 className="font-medium text-bread-700 mb-2">
                  <span aria-hidden="true">🌍</span> {getContent(t, 'help.features.envAdjust.title', DEFAULT_CONTENT.features.envAdjust.title)}
                </h4>
                <p className="text-sm text-gray-600">
                  {getContent(t, 'help.features.envAdjust.desc', DEFAULT_CONTENT.features.envAdjust.desc)}
                </p>
              </div>
            </div>
          </section>

          {/* 고급 기능 */}
          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">
              {getContent(t, 'help.advanced.title', DEFAULT_CONTENT.advanced.title)}
            </h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-bread-700 mb-2">
                  {getContent(t, 'help.advanced.magicNumber.title', DEFAULT_CONTENT.advanced.magicNumber.title)}
                </h4>
                <p className="text-sm text-gray-700 mb-2">
                  {getContent(t, 'help.advanced.magicNumber.formula', DEFAULT_CONTENT.advanced.magicNumber.formula)}
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>{getContent(t, 'help.advanced.magicNumber.bread', DEFAULT_CONTENT.advanced.magicNumber.bread)}</li>
                  <li>{getContent(t, 'help.advanced.magicNumber.cake', DEFAULT_CONTENT.advanced.magicNumber.cake)}</li>
                  <li>{getContent(t, 'help.advanced.magicNumber.muffin', DEFAULT_CONTENT.advanced.magicNumber.muffin)}</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-bread-700 mb-2">
                  {getContent(t, 'help.advanced.multiPan.title', DEFAULT_CONTENT.advanced.multiPan.title)}
                </h4>
                <p className="text-sm text-gray-700">
                  {getContent(t, 'help.advanced.multiPan.desc', DEFAULT_CONTENT.advanced.multiPan.desc)}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-bread-700 mb-2">
                  {getContent(t, 'help.advanced.iceCalc.title', DEFAULT_CONTENT.advanced.iceCalc.title)}
                </h4>
                <p className="text-sm text-gray-700">
                  {getContent(t, 'help.advanced.iceCalc.desc', DEFAULT_CONTENT.advanced.iceCalc.desc)}
                </p>
              </div>
            </div>
          </section>

          {/* 베이커스 퍼센트 */}
          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">
              {getContent(t, 'help.bakersPercent.title', DEFAULT_CONTENT.bakersPercent.title)}
            </h3>
            <div className="p-4 bg-brand-50 rounded-lg">
              <p className="text-sm text-brand-800 mb-2">
                {getContent(t, 'help.bakersPercent.desc', DEFAULT_CONTENT.bakersPercent.desc)}
              </p>
              <p className="text-sm text-brand-800">
                {getContent(t, 'help.bakersPercent.example', DEFAULT_CONTENT.bakersPercent.example)}
              </p>
            </div>
          </section>

          {/* 참고사항 */}
          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">
              {getContent(t, 'help.notes.title', DEFAULT_CONTENT.notes.title)}
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
              <li>{getContent(t, 'help.notes.note1', DEFAULT_CONTENT.notes.note1)}</li>
              <li>{getContent(t, 'help.notes.note2', DEFAULT_CONTENT.notes.note2)}</li>
              <li>{getContent(t, 'help.notes.note3', DEFAULT_CONTENT.notes.note3)}</li>
              <li>{getContent(t, 'help.notes.note4', DEFAULT_CONTENT.notes.note4)}</li>
              <li>{getContent(t, 'help.notes.note5', DEFAULT_CONTENT.notes.note5)}</li>
            </ul>
          </section>

          {/* 피드백 */}
          <section>
            <h3 className="text-lg font-semibold text-bread-600 mb-3">
              {getContent(t, 'help.feedback.title', DEFAULT_CONTENT.feedback.title)}
            </h3>
            <p className="text-sm text-gray-700">
              {getContent(t, 'help.feedback.desc', DEFAULT_CONTENT.feedback.desc)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {getContent(t, 'help.feedback.version', DEFAULT_CONTENT.feedback.version)}
            </p>
          </section>
        </div>

        <div className="mt-6 flex justify-end border-t pt-4">
          <Button onClick={onClose}>{t('common.close') || '닫기'}</Button>
        </div>
      </div>
    </div>
  )
}

export default Help
