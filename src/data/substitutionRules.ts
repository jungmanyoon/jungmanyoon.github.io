/**
 * 제과제빵 재료 대체 규칙 데이터베이스
 * 전문 제과제빵사 기준 대체재료 비율 및 주의사항
 *
 * 출처:
 * - King Arthur Baking (https://www.kingarthurbaking.com/)
 * - Sally's Baking Addiction
 * - The Fresh Loaf
 * - VegNews Vegan Baking Guide
 * - Good Morning America Expert Sources
 */

export interface SubstitutionRule {
  original: string           // 원재료
  substitute: string         // 대체재료
  ratio: number              // 대체 비율 (원재료 대비)
  notes?: string             // 주의사항
  category: 'direct' | 'adjusted' | 'special'  // 대체 유형
  qualityImpact?: 'none' | 'minor' | 'moderate' | 'significant'  // 품질 영향
  bestFor?: string[]         // 추천 용도
  notRecommendedFor?: string[]  // 비추천 용도
}

// 대체재료 규칙 데이터베이스
export const SUBSTITUTION_RULES: SubstitutionRule[] = [
  // ===== 밀가루 대체 =====
  {
    original: '박력분',
    substitute: '중력분',
    ratio: 0.93,
    notes: '중력분 93g + 옥수수전분 7g = 박력분 100g 효과. 글루텐 함량 차이로 옥수수전분 추가',
    category: 'adjusted',
    qualityImpact: 'minor',
    bestFor: ['케이크', '쿠키', '머핀'],
    notRecommendedFor: ['스펀지케이크', '쉬폰케이크']
  },
  {
    original: '강력분',
    substitute: '중력분',
    ratio: 1.0,
    notes: '중력분 100g + 글루텐 1-2g = 강력분 100g 효과. 빵의 쫄깃함 보완',
    category: 'adjusted',
    qualityImpact: 'moderate',
    bestFor: ['간단한 빵', '피자도우'],
    notRecommendedFor: ['바게트', '치아바타', '고급 유럽빵']
  },
  {
    original: '통밀가루',
    substitute: '중력분',
    ratio: 1.0,
    notes: '영양 및 식이섬유 손실. 수분 흡수율 다름',
    category: 'direct',
    qualityImpact: 'moderate',
    bestFor: ['빵', '머핀'],
    notRecommendedFor: ['통밀 특유 풍미 필요한 레시피']
  },

  // ===== 당류 대체 =====
  {
    original: '설탕',
    substitute: '꿀',
    ratio: 0.75,
    notes: '설탕 100g = 꿀 75g. 액체 재료 20ml 감소 필요. 갈변 빨라짐',
    category: 'adjusted',
    qualityImpact: 'moderate',
    bestFor: ['케이크', '쿠키', '빵'],
    notRecommendedFor: ['마카롱', '머랭']
  },
  {
    original: '설탕',
    substitute: '메이플시럽',
    ratio: 0.75,
    notes: '설탕 100g = 메이플시럽 75g. 액체 재료 30ml 감소. 메이플 풍미 추가',
    category: 'adjusted',
    qualityImpact: 'moderate',
    bestFor: ['팬케이크', '와플', '머핀']
  },
  {
    original: '황설탕',
    substitute: '설탕',
    ratio: 1.0,
    notes: '설탕 100g + 몰라세스 2-3큰술 = 황설탕 100g 효과',
    category: 'adjusted',
    qualityImpact: 'minor',
    bestFor: ['쿠키', '케이크']
  },
  {
    original: '흑설탕',
    substitute: '설탕',
    ratio: 1.0,
    notes: '설탕 100g + 몰라세스 3-4큰술 = 흑설탕 100g 효과',
    category: 'adjusted',
    qualityImpact: 'minor',
    bestFor: ['진저브레드', '과일케이크']
  },

  // ===== 유지류 대체 =====
  {
    original: '버터',
    substitute: '식용유',
    ratio: 0.85,
    notes: '버터 100g = 식용유 85g. 버터 풍미 손실, 더 촉촉한 질감',
    category: 'adjusted',
    qualityImpact: 'moderate',
    bestFor: ['머핀', '케이크'],
    notRecommendedFor: ['쿠키', '파이', '크루아상']
  },
  {
    original: '버터',
    substitute: '코코넛오일',
    ratio: 1.0,
    notes: '1:1 대체. 고체 상태에서 사용. 코코넛 풍미 약간 느껴짐',
    category: 'direct',
    qualityImpact: 'minor',
    bestFor: ['비건 베이킹', '쿠키', '케이크']
  },
  {
    original: '버터',
    substitute: '마가린',
    ratio: 1.0,
    notes: '1:1 대체 가능. 풍미 차이 있음',
    category: 'direct',
    qualityImpact: 'minor',
    bestFor: ['쿠키', '케이크', '빵']
  },
  {
    original: '버터',
    substitute: '쇼트닝',
    ratio: 1.0,
    notes: '1:1 대체. 소금 1/2 티스푼 추가 권장',
    category: 'adjusted',
    qualityImpact: 'moderate',
    bestFor: ['파이', '타르트', '쿠키'],
    notRecommendedFor: ['버터크림', '브리오슈']
  },
  {
    original: '라드',
    substitute: '버터',
    ratio: 0.875,
    notes: '라드 100g = 버터 87.5g. 수분 함량 차이 보정',
    category: 'adjusted',
    qualityImpact: 'minor',
    bestFor: ['파이크러스트']
  },

  // ===== 계란 대체 =====
  {
    original: '계란',
    substitute: '아마씨',
    ratio: 1.0,
    notes: '계란 1개 = 아마씨 1큰술 + 물 3큰술 (5분 불림). 바인더 역할',
    category: 'special',
    qualityImpact: 'moderate',
    bestFor: ['쿠키', '머핀', '팬케이크'],
    notRecommendedFor: ['커스터드', '수플레', '마카롱']
  },
  {
    original: '계란',
    substitute: '치아씨드',
    ratio: 1.0,
    notes: '계란 1개 = 치아씨드 1큰술 + 물 3큰술 (5분 불림)',
    category: 'special',
    qualityImpact: 'moderate',
    bestFor: ['쿠키', '머핀', '팬케이크']
  },
  {
    original: '계란',
    substitute: '사과소스',
    ratio: 1.0,
    notes: '계란 1개 = 사과소스 1/3컵 (약 80g). 촉촉함 유지',
    category: 'special',
    qualityImpact: 'moderate',
    bestFor: ['케이크', '머핀', '브라우니']
  },
  {
    original: '계란',
    substitute: '바나나',
    ratio: 1.0,
    notes: '계란 1개 = 으깬 바나나 1/2개 (약 60g). 바나나 향 추가됨',
    category: 'special',
    qualityImpact: 'moderate',
    bestFor: ['케이크', '머핀', '빵']
  },
  {
    original: '계란흰자',
    substitute: '아쿠아파바',
    ratio: 1.0,
    notes: '흰자 1개 = 아쿠아파바 3큰술. 머랭, 마카롱에 적합',
    category: 'special',
    qualityImpact: 'minor',
    bestFor: ['머랭', '마카롱', '무스']
  },

  // ===== 유제품 대체 =====
  {
    original: '우유',
    substitute: '두유',
    ratio: 1.0,
    notes: '1:1 대체. 무가당 사용 권장',
    category: 'direct',
    qualityImpact: 'minor',
    bestFor: ['케이크', '빵', '머핀']
  },
  {
    original: '우유',
    substitute: '아몬드우유',
    ratio: 1.0,
    notes: '1:1 대체. 우유보다 묽음, 약간의 견과향',
    category: 'direct',
    qualityImpact: 'minor',
    bestFor: ['케이크', '머핀', '팬케이크']
  },
  {
    original: '우유',
    substitute: '귀리우유',
    ratio: 1.0,
    notes: '1:1 대체. 크리미한 질감이 우유와 가장 유사',
    category: 'direct',
    qualityImpact: 'none',
    bestFor: ['모든 베이킹']
  },
  {
    original: '버터밀크',
    substitute: '우유',
    ratio: 1.0,
    notes: '우유 1컵 + 레몬즙/식초 1큰술, 5분 방치',
    category: 'adjusted',
    qualityImpact: 'none',
    bestFor: ['팬케이크', '스콘', '케이크']
  },
  {
    original: '생크림',
    substitute: '코코넛크림',
    ratio: 1.0,
    notes: '1:1 대체. 냉장보관한 코코넛밀크 윗층 사용',
    category: 'direct',
    qualityImpact: 'minor',
    bestFor: ['무스', '간나슈', '휘핑']
  },
  {
    original: '사워크림',
    substitute: '그릭요거트',
    ratio: 1.0,
    notes: '1:1 대체. 거의 동일한 효과',
    category: 'direct',
    qualityImpact: 'none',
    bestFor: ['케이크', '머핀', '치즈케이크']
  },
  {
    original: '크림치즈',
    substitute: '마스카포네',
    ratio: 1.0,
    notes: '1:1 대체. 더 부드럽고 풍부한 맛',
    category: 'direct',
    qualityImpact: 'none',
    bestFor: ['치즈케이크', '프로스팅', '티라미수']
  },

  // ===== 팽창제 대체 =====
  {
    original: '베이킹파우더',
    substitute: '베이킹소다',
    ratio: 0.25,
    notes: '베이킹파우더 1ts = 베이킹소다 1/4ts + 크림오브타르타르 1/2ts',
    category: 'adjusted',
    qualityImpact: 'minor',
    bestFor: ['케이크', '쿠키', '머핀']
  },
  {
    original: '인스턴트이스트',
    substitute: '드라이이스트',
    ratio: 1.25,
    notes: '인스턴트 1g = 드라이 1.25g. 드라이는 미지근한 물에 예비발효 필요',
    category: 'adjusted',
    qualityImpact: 'none',
    bestFor: ['모든 빵 종류']
  },
  {
    original: '인스턴트이스트',
    substitute: '생이스트',
    ratio: 3.0,
    notes: '인스턴트 1g = 생이스트 3g. 생이스트는 신선도 중요',
    category: 'adjusted',
    qualityImpact: 'none',
    bestFor: ['모든 빵 종류']
  },
  {
    original: '드라이이스트',
    substitute: '생이스트',
    ratio: 2.5,
    notes: '드라이 1g = 생이스트 2.5g',
    category: 'adjusted',
    qualityImpact: 'none',
    bestFor: ['모든 빵 종류']
  },

  // ===== 전분류 대체 =====
  {
    original: '옥수수전분',
    substitute: '감자전분',
    ratio: 1.0,
    notes: '1:1 대체. 거의 동일한 효과',
    category: 'direct',
    qualityImpact: 'none',
    bestFor: ['소스', '커스터드', '케이크']
  },
  {
    original: '옥수수전분',
    substitute: '타피오카전분',
    ratio: 1.0,
    notes: '1:1 대체. 타피오카가 더 쫄깃한 질감',
    category: 'direct',
    qualityImpact: 'minor',
    bestFor: ['푸딩', '파이필링']
  },

  // ===== 초콜릿 대체 =====
  {
    original: '다크초콜릿',
    substitute: '코코아파우더',
    ratio: 0.33,
    notes: '다크초콜릿 100g = 코코아 33g + 버터 17g + 설탕 50g',
    category: 'adjusted',
    qualityImpact: 'moderate',
    bestFor: ['브라우니', '케이크']
  },
  {
    original: '밀크초콜릿',
    substitute: '다크초콜릿',
    ratio: 1.0,
    notes: '1:1 대체. 설탕 약간 추가 권장',
    category: 'adjusted',
    qualityImpact: 'minor',
    bestFor: ['간나슈', '케이크']
  },

  // ===== 견과류 대체 =====
  {
    original: '아몬드',
    substitute: '호두',
    ratio: 1.0,
    notes: '1:1 대체. 풍미와 식감 차이',
    category: 'direct',
    qualityImpact: 'minor',
    bestFor: ['쿠키', '케이크', '빵']
  },
  {
    original: '아몬드가루',
    substitute: '헤이즐넛가루',
    ratio: 1.0,
    notes: '1:1 대체. 헤이즐넛 특유의 풍미',
    category: 'direct',
    qualityImpact: 'minor',
    bestFor: ['마카롱', '피낭시에', '케이크']
  },

  // ===== 기타 대체 =====
  {
    original: '젤라틴',
    substitute: '한천',
    ratio: 0.5,
    notes: '젤라틴 100g = 한천 50g. 한천이 더 단단한 질감',
    category: 'adjusted',
    qualityImpact: 'moderate',
    bestFor: ['젤리', '무스', '푸딩'],
    notRecommendedFor: ['판나코타 (부드러운 질감 필요)']
  },
  {
    original: '바닐라빈',
    substitute: '바닐라익스트랙',
    ratio: 1.0,
    notes: '바닐라빈 1개 = 바닐라익스트랙 1ts',
    category: 'direct',
    qualityImpact: 'minor',
    bestFor: ['모든 베이킹']
  }
]

/**
 * 원재료에 대한 대체 규칙 조회
 */
export function getSubstitutionRules(originalIngredient: string): SubstitutionRule[] {
  const ingredientLower = originalIngredient.toLowerCase()
  return SUBSTITUTION_RULES.filter(
    rule => rule.original.toLowerCase().includes(ingredientLower) ||
            ingredientLower.includes(rule.original.toLowerCase())
  )
}

/**
 * 특정 대체재료로 변환할 수 있는 규칙 조회
 */
export function findSubstituteFor(
  original: string,
  substitute: string
): SubstitutionRule | undefined {
  return SUBSTITUTION_RULES.find(
    rule => rule.original === original && rule.substitute === substitute
  )
}

/**
 * 대체재료 양 계산
 * @param originalAmount - 원재료 양
 * @param rule - 대체 규칙
 * @returns 대체재료 양
 */
export function calculateSubstituteAmount(
  originalAmount: number,
  rule: SubstitutionRule
): number {
  return Math.round(originalAmount * rule.ratio * 10) / 10
}

/**
 * 카테고리별 대체 규칙 조회
 */
export function getRulesByCategory(
  category: SubstitutionRule['category']
): SubstitutionRule[] {
  return SUBSTITUTION_RULES.filter(rule => rule.category === category)
}

/**
 * 품질 영향이 적은 대체 규칙만 조회
 */
export function getSafeSubstitutions(originalIngredient: string): SubstitutionRule[] {
  return getSubstitutionRules(originalIngredient).filter(
    rule => rule.qualityImpact === 'none' || rule.qualityImpact === 'minor'
  )
}

/**
 * 특정 용도에 적합한 대체 규칙 조회
 */
export function getSubstitutionsForUse(
  originalIngredient: string,
  useCase: string
): SubstitutionRule[] {
  return getSubstitutionRules(originalIngredient).filter(
    rule => rule.bestFor?.some(use =>
      use.toLowerCase().includes(useCase.toLowerCase())
    )
  )
}
