/**
 * 수율 손실 예측 유틸리티
 * 제과제빵 공정별 수율 손실을 예측하고 최종 생산량을 계산
 *
 * 출처: 제과제빵 실무 데이터 기반
 */

export type ProductCategory = 'bread' | 'cake' | 'pastry' | 'cookie' | 'other'

/**
 * 공정별 손실률 데이터
 * 각 수치는 해당 공정에서 손실되는 비율 (%)
 */
export interface ProcessLossRates {
  mixing: number      // 믹싱 손실 (반죽기/볼에 붙는 양)
  fermentation: number // 발효 손실 (가스 방출)
  dividing: number    // 분할 손실 (분할 시 붙는 양)
  shaping: number     // 성형 손실 (성형대에 붙는 양)
  baking: number      // 굽기 손실 (수분 증발)
  cooling: number     // 냉각 손실 (추가 수분 증발)
}

/**
 * 제품 종류별 기본 손실률
 */
export const DEFAULT_LOSS_RATES: Record<ProductCategory, ProcessLossRates> = {
  bread: {
    mixing: 2.0,       // 반죽이 끈적여서 붙음
    fermentation: 1.0, // 발효 중 가스 일부 방출
    dividing: 1.5,     // 분할대/스크래퍼에 붙음
    shaping: 1.0,      // 성형 시 붙음
    baking: 12.0,      // 수분 증발 (식빵 기준)
    cooling: 2.0       // 냉각 중 추가 수분 손실
  },
  cake: {
    mixing: 3.0,       // 반죽이 묽어서 더 붙음
    fermentation: 0,   // 발효 없음
    dividing: 0,       // 분할 없음 (팬에 바로 투입)
    shaping: 0,        // 성형 없음
    baking: 15.0,      // 수분 증발 (스펀지 기준)
    cooling: 1.5       // 냉각 중 수분 손실
  },
  pastry: {
    mixing: 1.5,       // 비교적 덜 끈적임
    fermentation: 0.5, // 약간의 발효
    dividing: 2.0,     // 층이 많아 분할 손실 높음
    shaping: 2.0,      // 층 성형 시 손실
    baking: 18.0,      // 수분 증발 + 버터 용출
    cooling: 1.0       // 냉각 손실
  },
  cookie: {
    mixing: 2.5,       // 버터 반죽 붙음
    fermentation: 0,   // 발효 없음
    dividing: 1.0,     // 분할 손실
    shaping: 1.5,      // 성형 손실
    baking: 8.0,       // 수분 증발 (낮은 수분 반죽)
    cooling: 0.5       // 냉각 손실 적음
  },
  other: {
    mixing: 2.0,
    fermentation: 0.5,
    dividing: 1.0,
    shaping: 1.0,
    baking: 12.0,
    cooling: 1.5
  }
}

/**
 * 세부 제품별 손실률 조정
 */
export const PRODUCT_LOSS_ADJUSTMENTS: Record<string, Partial<ProcessLossRates>> = {
  // 식빵류
  pullman: { baking: 10.0 },      // 뚜껑 덮어서 손실 적음
  mountain: { baking: 13.0 },     // 열린 상태로 굽기
  brioche: { baking: 11.0, mixing: 3.0 }, // 버터 많아 믹싱 손실 높음

  // 케이크류
  genoise: { baking: 14.0, mixing: 4.0 },
  chiffon: { baking: 13.0, mixing: 3.5 },
  pound: { baking: 10.0, mixing: 3.0 },
  brownie: { baking: 8.0 },       // 촉촉하게 굽기
  cheesecake: { baking: 5.0 },    // 수분 손실 적음

  // 페이스트리
  croissant: { baking: 20.0, shaping: 3.0 },
  danish: { baking: 18.0, shaping: 2.5 },
  puff_pastry: { baking: 22.0 },  // 높은 수분 증발

  // 기타 빵
  baguette: { baking: 18.0, shaping: 1.5 },
  ciabatta: { baking: 16.0, mixing: 3.0 }, // 고수분 반죽
  sourdough: { baking: 15.0, fermentation: 2.0 },

  // 쿠키/기타
  cookie: { baking: 8.0 },
  scone: { baking: 12.0 },
  tart: { baking: 10.0, shaping: 2.0 }
}

/**
 * 환경 요인에 따른 손실률 조정
 */
export interface EnvironmentFactors {
  humidity?: number      // 습도 (%, 기본 60)
  temperature?: number   // 실온 (°C, 기본 25)
  altitude?: number      // 고도 (m, 기본 0) - 참고용
}

/**
 * 환경에 따른 굽기 손실 조정 계수 계산
 */
export function calculateEnvironmentAdjustment(env: EnvironmentFactors): number {
  let adjustment = 1.0

  // 습도 영향 (60%를 기준으로)
  // 습도 낮으면 수분 증발 증가, 높으면 감소
  if (env.humidity !== undefined) {
    const humidityDiff = 60 - env.humidity
    adjustment *= 1 + (humidityDiff * 0.005) // 10% 차이당 5% 조정
  }

  // 온도 영향 (25°C를 기준으로)
  // 온도 높으면 발효 빨라지고 수분 증발 증가
  if (env.temperature !== undefined) {
    const tempDiff = env.temperature - 25
    adjustment *= 1 + (tempDiff * 0.01) // 5°C 차이당 5% 조정
  }

  return Math.max(0.8, Math.min(1.3, adjustment)) // 80%~130% 범위 제한
}

/**
 * 수율 손실 계산 결과
 */
export interface YieldLossResult {
  inputWeight: number           // 투입 중량 (g)
  outputWeight: number          // 예상 산출 중량 (g)
  totalLossPercent: number      // 총 손실률 (%)
  totalLossWeight: number       // 총 손실 중량 (g)
  yieldPercent: number          // 수율 (%)

  // 공정별 상세
  processLosses: {
    stage: string
    lossPercent: number
    lossWeight: number
    remainingWeight: number
  }[]

  // 조언
  tips: string[]
}

/**
 * 공정 선택 상태 타입
 */
export type ProcessStageSelection = {
  mixing: boolean
  fermentation: boolean
  dividing: boolean
  shaping: boolean
  baking: boolean
  cooling: boolean
}

/**
 * 기본 공정 선택 (모두 선택)
 */
export const DEFAULT_STAGE_SELECTION: ProcessStageSelection = {
  mixing: true,
  fermentation: true,
  dividing: true,
  shaping: true,
  baking: true,
  cooling: true
}

/**
 * 수율 손실 계산
 * @param inputWeight 투입 중량 (g)
 * @param category 제품 카테고리
 * @param productType 세부 제품 타입 (선택)
 * @param environment 환경 요인 (선택)
 * @param enabledStages 활성화된 공정 (선택)
 * @returns 수율 손실 계산 결과
 */
export function calculateYieldLoss(
  inputWeight: number,
  category: ProductCategory,
  productType?: string,
  environment?: EnvironmentFactors,
  enabledStages?: ProcessStageSelection
): YieldLossResult {
  // 기본 손실률 가져오기
  const baseLossRates = { ...DEFAULT_LOSS_RATES[category] }

  // 세부 제품별 조정 적용
  if (productType && PRODUCT_LOSS_ADJUSTMENTS[productType]) {
    Object.assign(baseLossRates, PRODUCT_LOSS_ADJUSTMENTS[productType])
  }

  // 환경 조정 계수
  const envAdjustment = environment
    ? calculateEnvironmentAdjustment(environment)
    : 1.0

  // 공정별 손실 계산
  const processLosses: YieldLossResult['processLosses'] = []
  let remainingWeight = inputWeight

  const stages: { key: keyof ProcessLossRates; name: string }[] = [
    { key: 'mixing', name: '믹싱' },
    { key: 'fermentation', name: '발효' },
    { key: 'dividing', name: '분할' },
    { key: 'shaping', name: '성형' },
    { key: 'baking', name: '굽기' },
    { key: 'cooling', name: '냉각' }
  ]

  // 기본 공정 선택 상태 (모두 활성화)
  const stageSelection = enabledStages || DEFAULT_STAGE_SELECTION

  for (const stage of stages) {
    // 비활성화된 공정은 건너뛰기
    if (!stageSelection[stage.key]) continue

    let lossPercent = baseLossRates[stage.key]

    // 굽기 단계에 환경 조정 적용
    if (stage.key === 'baking') {
      lossPercent *= envAdjustment
    }

    // 손실이 0이면 건너뛰기
    if (lossPercent <= 0) continue

    const lossWeight = Math.round(remainingWeight * (lossPercent / 100))
    remainingWeight -= lossWeight

    processLosses.push({
      stage: stage.name,
      lossPercent: Math.round(lossPercent * 10) / 10,
      lossWeight,
      remainingWeight
    })
  }

  // 총계 계산
  const outputWeight = remainingWeight
  const totalLossWeight = inputWeight - outputWeight
  const totalLossPercent = Math.round((totalLossWeight / inputWeight) * 1000) / 10
  const yieldPercent = Math.round((outputWeight / inputWeight) * 1000) / 10

  // 조언 생성
  const tips = generateYieldTips(category, productType, totalLossPercent, environment)

  return {
    inputWeight,
    outputWeight,
    totalLossPercent,
    totalLossWeight,
    yieldPercent,
    processLosses,
    tips
  }
}

/**
 * 수율 관련 조언 생성
 */
function generateYieldTips(
  category: ProductCategory,
  productType?: string,
  totalLoss?: number,
  environment?: EnvironmentFactors
): string[] {
  const tips: string[] = []

  // 카테고리별 기본 조언
  if (category === 'bread') {
    tips.push('반죽기 내부에 오일 스프레이로 반죽 붙음 방지')
    tips.push('분할 시 스크래퍼에 밀가루 사용')
  } else if (category === 'cake') {
    tips.push('볼/휘퍼에 붙은 반죽을 깨끗이 긁어 사용')
    tips.push('팬에 유산지 깔아 손실 최소화')
  } else if (category === 'pastry') {
    tips.push('작업대에 밀가루 적절히 뿌려 붙음 방지')
    tips.push('차가운 상태로 작업해 버터 용출 방지')
  }

  // 제품별 특수 조언
  if (productType === 'croissant') {
    tips.push('굽기 후 바로 선반에 올려 바닥 눅눅함 방지')
  } else if (productType === 'baguette') {
    tips.push('스팀 굽기로 껍질 형성 후 수분 증발 조절')
  } else if (productType === 'chiffon') {
    tips.push('팬에 기름 바르지 않아야 높이 유지')
  }

  // 환경 관련 조언
  if (environment?.humidity !== undefined) {
    if (environment.humidity < 50) {
      tips.push('건조한 환경: 반죽 덮개로 표면 건조 방지')
    } else if (environment.humidity > 70) {
      tips.push('습한 환경: 굽기 시간 약간 연장 고려')
    }
  }

  if (environment?.temperature !== undefined) {
    if (environment.temperature > 30) {
      tips.push('고온 환경: 반죽 온도 관리에 주의')
    }
  }

  return tips
}

/**
 * 목표 산출량에 필요한 투입량 역산
 * @param targetOutput 목표 산출량 (g)
 * @param category 제품 카테고리
 * @param productType 세부 제품 타입 (선택)
 * @param environment 환경 요인 (선택)
 * @param enabledStages 활성화된 공정 (선택)
 * @returns 필요한 투입량 (g)
 */
export function calculateRequiredInput(
  targetOutput: number,
  category: ProductCategory,
  productType?: string,
  environment?: EnvironmentFactors,
  enabledStages?: ProcessStageSelection
): number {
  // 먼저 예상 수율 계산 (1000g 기준)
  const sampleResult = calculateYieldLoss(1000, category, productType, environment, enabledStages)
  const yieldRate = sampleResult.yieldPercent / 100

  // 필요 투입량 계산
  return Math.ceil(targetOutput / yieldRate)
}

/**
 * 수율 손실 요약 텍스트 생성
 */
export function getYieldSummary(result: YieldLossResult): string {
  return `투입 ${result.inputWeight}g → 예상 산출 ${result.outputWeight}g (수율 ${result.yieldPercent}%, 손실 ${result.totalLossPercent}%)`
}

export default {
  calculateYieldLoss,
  calculateRequiredInput,
  getYieldSummary,
  DEFAULT_LOSS_RATES,
  PRODUCT_LOSS_ADJUSTMENTS
}
