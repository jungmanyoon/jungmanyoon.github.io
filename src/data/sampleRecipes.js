/**
 * 샘플 레시피 데이터
 * 스토어 구조에 맞춘 형식
 */

export const sampleRecipes = [
  {
    id: 'sample-milk-bread',
    name: '우유 식빵',
    nameKo: '우유 식빵',
    description: '부드럽고 촉촉한 우유 식빵',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['식빵', '우유', '버터'],
    totalTime: 180,
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: {
        bulk: { min: 60, max: 90, unit: 'min' },
        final: { min: 40, max: 60, unit: 'min' }
      },
      temperature: {
        bulk: { min: 27, max: 28, unit: 'C' },
        final: { min: 30, max: 32, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 180,
      mode: 'conventional',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      id: 'loaf-medium',
      name: '중형 (18×9×8cm, 1100ml)',
      type: 'loaf',
      volume: 1100,
      dimensions: { length: 18, width: 9, height: 8 },
      material: 'aluminum',
      fillRatio: 0.7
    },
    yield: { quantity: 1, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 500, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '우유', amount: 350, unit: 'g', category: 'liquid' },
      { id: 'ing-3', name: '설탕', amount: 50, unit: 'g', category: 'sugar' },
      { id: 'ing-4', name: '소금', amount: 10, unit: 'g', category: 'salt' },
      { id: 'ing-5', name: '이스트', amount: 10, unit: 'g', category: 'leavening' },
      { id: 'ing-6', name: '버터', amount: 50, unit: 'g', category: 'fat' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '모든 재료를 한번에 믹싱합니다.' },
      { id: 'step-2', order: 2, instruction: '글루텐이 충분히 형성될 때까지 반죽합니다.' },
      { id: 'step-3', order: 3, instruction: '1차 발효 60-90분' },
      { id: 'step-4', order: 4, instruction: '분할 및 둥글리기' },
      { id: 'step-5', order: 5, instruction: '중간 발효 15분' },
      { id: 'step-6', order: 6, instruction: '성형하여 식빵틀에 넣기' },
      { id: 'step-7', order: 7, instruction: '2차 발효 40-60분' },
      { id: 'step-8', order: 8, instruction: '180도에서 30-35분 굽기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sample-baguette',
    name: '바게트',
    nameKo: '바게트',
    description: '겉은 바삭하고 속은 쫄깃한 프랑스 빵',
    category: 'bread',
    difficulty: 'advanced',
    tags: ['프랑스빵', '리틀', '하드롤'],
    totalTime: 240,
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: {
        bulk: { min: 120, max: 180, unit: 'min' },
        final: { min: 45, max: 45, unit: 'min' }
      },
      temperature: {
        bulk: { min: 24, max: 25, unit: 'C' },
        final: { min: 24, max: 25, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 230,
      mode: 'steam',
      steamDuration: 3,
      preheating: true,
      deck: 'bottom'
    },
    panConfig: null,
    yield: { quantity: 4, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 500, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '물', amount: 350, unit: 'g', category: 'liquid' },
      { id: 'ing-3', name: '소금', amount: 10, unit: 'g', category: 'salt' },
      { id: 'ing-4', name: '이스트', amount: 5, unit: 'g', category: 'leavening' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '오토리즈: 밀가루와 물만 섞어 30분 휴지' },
      { id: 'step-2', order: 2, instruction: '소금과 이스트를 넣고 반죽' },
      { id: 'step-3', order: 3, instruction: '1차 발효 2-3시간 (30분마다 폴딩)' },
      { id: 'step-4', order: 4, instruction: '분할하여 바게트 모양으로 성형' },
      { id: 'step-5', order: 5, instruction: '2차 발효 45분' },
      { id: 'step-6', order: 6, instruction: '230도에서 25분 굽기 (스팀 필수)' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sample-croissant',
    name: '크루아상',
    nameKo: '크루아상',
    description: '버터 향이 풍부한 프랑스 페이스트리',
    category: 'pastry',
    difficulty: 'professional',
    tags: ['페이스트리', '버터', '프랑스'],
    totalTime: 360,
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: {
        bulk: { min: 60, max: 60, unit: 'min' },
        final: { min: 120, max: 120, unit: 'min' }
      },
      temperature: {
        bulk: { min: 4, max: 4, unit: 'C' },
        final: { min: 27, max: 28, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 200,
      mode: 'convection',
      preheating: true,
      deck: 'middle'
    },
    panConfig: null,
    yield: { quantity: 12, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 250, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '중력분', amount: 250, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-3', name: '우유', amount: 260, unit: 'g', category: 'liquid' },
      { id: 'ing-4', name: '설탕', amount: 50, unit: 'g', category: 'sugar' },
      { id: 'ing-5', name: '소금', amount: 10, unit: 'g', category: 'salt' },
      { id: 'ing-6', name: '이스트', amount: 10, unit: 'g', category: 'leavening' },
      { id: 'ing-7', name: '버터(반죽용)', amount: 60, unit: 'g', category: 'fat' },
      { id: 'ing-8', name: '버터(접기용)', amount: 250, unit: 'g', category: 'fat' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '반죽용 재료로 반죽하여 냉장 휴지' },
      { id: 'step-2', order: 2, instruction: '접기용 버터를 평평하게 만들기' },
      { id: 'step-3', order: 3, instruction: '반죽에 버터를 넣고 3회 접기 (3-3-3)' },
      { id: 'step-4', order: 4, instruction: '냉장 휴지 후 성형' },
      { id: 'step-5', order: 5, instruction: '최종 발효 2시간' },
      { id: 'step-6', order: 6, instruction: '200도에서 15-18분 굽기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'sample-sourdough',
    name: '사워도우 빵',
    nameKo: '사워도우 빵',
    description: '천연발효종으로 만든 깊은 풍미의 빵',
    category: 'bread',
    difficulty: 'advanced',
    tags: ['사워도우', '천연발효', '무이스트'],
    totalTime: 1440,
    method: {
      method: 'sourdough',
      prefermentRatio: 20,
      fermentationTime: {
        preferment: { min: 240, max: 360, unit: 'min' },
        bulk: { min: 240, max: 360, unit: 'min' },
        final: { min: 720, max: 960, unit: 'min' }
      },
      temperature: {
        preferment: { min: 24, max: 26, unit: 'C' },
        bulk: { min: 24, max: 26, unit: 'C' },
        final: { min: 4, max: 6, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 250,
      mode: 'steam',
      steamDuration: 20,
      preheating: true,
      deck: 'bottom'
    },
    panConfig: null,
    yield: { quantity: 1, unit: '덩어리' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 400, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '통밀가루', amount: 100, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-3', name: '물', amount: 350, unit: 'g', category: 'liquid' },
      { id: 'ing-4', name: '르방', amount: 100, unit: 'g', category: 'leavening' },
      { id: 'ing-5', name: '소금', amount: 10, unit: 'g', category: 'salt' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '오토리즈: 밀가루와 물 섞어 1시간 휴지' },
      { id: 'step-2', order: 2, instruction: '르방과 소금 추가하여 반죽' },
      { id: 'step-3', order: 3, instruction: '상온에서 4-6시간 벌크발효 (1시간마다 폴딩)' },
      { id: 'step-4', order: 4, instruction: '예비성형 후 20분 휴지' },
      { id: 'step-5', order: 5, instruction: '최종 성형하여 발효바구니에 넣기' },
      { id: 'step-6', order: 6, instruction: '냉장고에서 12-16시간 저온발효' },
      { id: 'step-7', order: 7, instruction: '더치오븐에 넣고 250도 20분, 뚜껑 열고 230도 25분' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

/**
 * 레시피 스토어에 샘플 레시피 추가
 */
export function loadSampleRecipes(addRecipe) {
  sampleRecipes.forEach(recipe => {
    addRecipe(recipe)
  })
}

export default sampleRecipes
