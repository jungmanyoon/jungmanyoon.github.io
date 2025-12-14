export type PanType = 'round' | 'square' | 'rectangular' | 'loaf' | 'chiffon'

/**
 * 제품 종류별 팬닝 데이터 (비용적 및 충전율)
 * 비용적(specificVolume): 반죽 1g당 차지하는 부피 (ml/g)
 * 충전율(fillRatio): 팬에 채우는 비율 (0.0~1.0)
 *
 * 출처: 제과제빵 실무 기준
 */
export interface PanningData {
  name: string
  category: 'bread' | 'cake' | 'pastry' | 'other'
  specificVolume: number  // ml/g
  fillRatio: number       // 0.0~1.0
  description?: string
  tips?: string
}

export const PANNING_DATABASE: Record<string, PanningData> = {
  // ===== 식빵류 =====
  pullman: {
    name: '풀먼식빵',
    category: 'bread',
    specificVolume: 3.6,
    fillRatio: 0.85,
    description: '뚜껑을 닫고 굽는 각형 식빵',
    tips: '2차 발효시 팬 높이 90%까지'
  },
  mountain: {
    name: '산형식빵',
    category: 'bread',
    specificVolume: 4.0,
    fillRatio: 0.70,
    description: '뚜껑 없이 굽는 볼록한 식빵',
    tips: '2차 발효시 팬 높이 80%까지'
  },
  milk_bread: {
    name: '우유식빵',
    category: 'bread',
    specificVolume: 3.8,
    fillRatio: 0.80,
    description: '부드러운 우유 식빵'
  },
  brioche: {
    name: '브리오슈',
    category: 'bread',
    specificVolume: 3.5,
    fillRatio: 0.65,
    description: '버터가 많은 리치 도우'
  },

  // ===== 제과류 (케이크) =====
  genoise: {
    name: '제누와즈',
    category: 'cake',
    specificVolume: 5.8,
    fillRatio: 0.60,
    description: '공립법 스펀지케이크',
    tips: '팬 높이 60%까지만 채움'
  },
  chiffon: {
    name: '쉬폰케이크',
    category: 'cake',
    specificVolume: 6.5,
    fillRatio: 0.55,
    description: '가볍고 촉촉한 쉬폰',
    tips: '팬의 55%만 채움, 거꾸로 식히기'
  },
  pound: {
    name: '파운드케이크',
    category: 'cake',
    specificVolume: 2.4,
    fillRatio: 0.70,
    description: '밀도 높은 버터케이크',
    tips: '팬 높이 70%까지'
  },
  butter_cake: {
    name: '버터케이크',
    category: 'cake',
    specificVolume: 3.0,
    fillRatio: 0.65,
    description: '별립법/공립법 버터케이크'
  },
  layer_cake: {
    name: '레이어케이크',
    category: 'cake',
    specificVolume: 4.0,
    fillRatio: 0.60,
    description: '층층이 쌓는 케이크 시트'
  },
  cheesecake: {
    name: '치즈케이크',
    category: 'cake',
    specificVolume: 1.8,
    fillRatio: 0.85,
    description: '밀도 높은 치즈케이크',
    tips: '중탕으로 굽기'
  },
  brownie: {
    name: '브라우니',
    category: 'cake',
    specificVolume: 1.6,
    fillRatio: 0.90,
    description: '밀도 높은 초콜릿 디저트',
    tips: '2cm 두께가 적정'
  },
  financier: {
    name: '피낭시에',
    category: 'cake',
    specificVolume: 2.0,
    fillRatio: 0.85,
    description: '버터향 진한 작은 케이크'
  },
  madeleine: {
    name: '마들렌',
    category: 'cake',
    specificVolume: 2.2,
    fillRatio: 0.80,
    description: '조개 모양 작은 케이크',
    tips: '볼록한 배가 나오도록'
  },
  castella: {
    name: '카스테라',
    category: 'cake',
    specificVolume: 4.5,
    fillRatio: 0.65,
    description: '일본식 스펀지케이크'
  },

  // ===== 페이스트리류 =====
  croissant: {
    name: '크루아상',
    category: 'pastry',
    specificVolume: 5.0,
    fillRatio: 0.50,
    description: '층층이 결이 있는 빵',
    tips: '간격 넓게 배치'
  },
  danish: {
    name: '데니쉬',
    category: 'pastry',
    specificVolume: 4.5,
    fillRatio: 0.55,
    description: '데니쉬 페이스트리'
  },
  puff_pastry: {
    name: '퍼프페이스트리',
    category: 'pastry',
    specificVolume: 5.5,
    fillRatio: 0.45,
    description: '겹겹이 올라가는 페이스트리'
  },

  // ===== 일반 빵류 =====
  baguette: {
    name: '바게트',
    category: 'bread',
    specificVolume: 5.5,
    fillRatio: 1.0,
    description: '프랑스 바게트',
    tips: '성형 무게로 계산'
  },
  sourdough: {
    name: '사워도우',
    category: 'bread',
    specificVolume: 4.0,
    fillRatio: 1.0,
    description: '천연발효빵'
  },
  ciabatta: {
    name: '치아바타',
    category: 'bread',
    specificVolume: 5.0,
    fillRatio: 1.0,
    description: '이탈리아 빵'
  },
  dinner_roll: {
    name: '모닝빵/롤빵',
    category: 'bread',
    specificVolume: 4.0,
    fillRatio: 1.0,
    description: '작은 롤빵',
    tips: '개당 40-50g'
  },
  sweet_bread: {
    name: '단팥빵/소보로',
    category: 'bread',
    specificVolume: 3.5,
    fillRatio: 1.0,
    description: '달콤한 충전물 빵',
    tips: '개당 60-80g'
  },

  // ===== 기타 =====
  cookie: {
    name: '쿠키',
    category: 'other',
    specificVolume: 1.5,
    fillRatio: 1.0,
    description: '구운 과자',
    tips: '두께 0.5-1cm'
  },
  scone: {
    name: '스콘',
    category: 'other',
    specificVolume: 2.5,
    fillRatio: 1.0,
    description: '영국식 스콘',
    tips: '개당 50-60g'
  },
  tart: {
    name: '타르트',
    category: 'other',
    specificVolume: 2.0,
    fillRatio: 0.80,
    description: '타르트 쉘',
    tips: '블라인드 베이킹 필요'
  }
}

/**
 * 제품 종류에 따른 추천 팬닝 양 계산
 * @param panVolume 팬 부피 (ml)
 * @param productType 제품 종류 키
 * @returns 추천 반죽 양 (g)
 */
export function calculateRecommendedPanningWeight(
  panVolume: number,
  productType: keyof typeof PANNING_DATABASE
): { weight: number; tips?: string } {
  const data = PANNING_DATABASE[productType]
  if (!data) {
    // 기본값 사용
    return { weight: Math.round(panVolume / 3.5) }
  }

  const usableVolume = panVolume * data.fillRatio
  const weight = Math.round(usableVolume / data.specificVolume)

  return {
    weight,
    tips: data.tips
  }
}

/**
 * 반죽 양에 따른 추천 팬 크기 계산
 * @param doughWeight 반죽 양 (g)
 * @param productType 제품 종류 키
 * @returns 추천 팬 부피 (ml)
 */
export function calculateRecommendedPanVolume(
  doughWeight: number,
  productType: keyof typeof PANNING_DATABASE
): { volume: number; tips?: string } {
  const data = PANNING_DATABASE[productType]
  if (!data) {
    return { volume: Math.round(doughWeight * 3.5) }
  }

  const requiredVolume = (doughWeight * data.specificVolume) / data.fillRatio

  return {
    volume: Math.round(requiredVolume),
    tips: data.tips
  }
}

/**
 * 팬닝 상태 검증 (과충전/과소충전 경고)
 */
export function validatePanning(
  panVolume: number,
  doughWeight: number,
  productType: keyof typeof PANNING_DATABASE
): {
  status: 'ok' | 'overfill' | 'underfill'
  message: string
  recommendedWeight: number
} {
  const { weight: recommended } = calculateRecommendedPanningWeight(panVolume, productType)
  const ratio = doughWeight / recommended

  if (ratio > 1.15) {
    return {
      status: 'overfill',
      message: `과충전 (${Math.round(ratio * 100)}%) - 넘칠 수 있음`,
      recommendedWeight: recommended
    }
  } else if (ratio < 0.85) {
    return {
      status: 'underfill',
      message: `과소충전 (${Math.round(ratio * 100)}%) - 팬이 클 수 있음`,
      recommendedWeight: recommended
    }
  }

  return {
    status: 'ok',
    message: '적정 팬닝량',
    recommendedWeight: recommended
  }
}

export interface PanDimensions {
  diameter?: number
  height?: number
  length?: number
  width?: number
  topLength?: number
  bottomLength?: number
  outerDiameter?: number
  innerDiameter?: number
}

export interface PanConfigTS {
  type: PanType
  dimensions: PanDimensions
}

export class PanScalingTS {
  static calculateRoundPanVolume(diameter: number, height: number): number {
    const radius = diameter / 2
    return Math.PI * radius * radius * height
  }

  static calculateSquarePanVolume(length: number, width: number, height: number): number {
    return length * width * height
  }

  static calculateLoafPanVolume(topLength: number, bottomLength: number, width: number, height: number): number {
    const avgLength = (topLength + bottomLength) / 2
    return avgLength * width * height
  }

  static calculateChiffonPanVolume(outerDiameter: number, innerDiameter: number, height: number): number {
    const outerVolume = this.calculateRoundPanVolume(outerDiameter, height)
    const innerVolume = this.calculateRoundPanVolume(innerDiameter, height)
    return outerVolume - innerVolume
  }

  static calculatePanVolume(pan: PanConfigTS): number {
    const { type, dimensions } = pan
    switch (type) {
      case 'round':
        return this.calculateRoundPanVolume(dimensions.diameter!, dimensions.height!)
      case 'square':
      case 'rectangular':
        return this.calculateSquarePanVolume(dimensions.length!, dimensions.width!, dimensions.height!)
      case 'loaf':
        return this.calculateLoafPanVolume(dimensions.topLength!, dimensions.bottomLength!, dimensions.width!, dimensions.height!)
      case 'chiffon':
        return this.calculateChiffonPanVolume(dimensions.outerDiameter!, dimensions.innerDiameter!, dimensions.height!)
      default:
        throw new Error(`알 수 없는 팬 타입: ${type}`)
    }
  }

  static weightToVolume(weight: number, density: number = 0.55): number {
    return weight / density
  }

  static volumeToWeight(volume: number, density: number = 0.55): number {
    return volume * density
  }
}

export default PanScalingTS

