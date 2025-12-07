/**
 * 샘플 레시피 데이터
 * 유튜브 채널 빵준서, 호야TV 기반 레시피
 * 스토어 구조에 맞춘 형식
 */

export const sampleRecipes = [
  // ===== 빵준서 레시피 (5개) =====
  {
    id: 'bbangjunseo-milk-bread',
    name: '우유 식빵',
    nameKo: '우유 식빵',
    description: '부드럽고 촉촉한 기본 우유 식빵. 명장의 손맛이 담긴 레시피',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['식빵', '우유', '버터', '기본'],
    totalTime: 180,
    source: {
      name: '빵준서',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장'
    },
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
      originalPan: {
        mode: 'pan',
        category: '식빵틀',
        type: '중형 식빵틀 (18×9×8cm)',
        quantity: 1,
        panWeight: 570,
        divisionCount: 1,
        divisionWeight: 570,
        unitCount: 1,
        unitWeight: 570
      },
      pans: [{
        mode: 'pan',
        category: '식빵틀',
        type: '중형 식빵틀 (18×9×8cm)',
        quantity: 1,
        panWeight: 570,
        divisionCount: 1,
        divisionWeight: 570,
        unitCount: 1,
        unitWeight: 570
      }]
    },
    yield: { quantity: 1, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 300, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '우유', amount: 210, unit: 'g', category: 'liquid' },
      { id: 'ing-3', name: '설탕', amount: 30, unit: 'g', category: 'sugar' },
      { id: 'ing-4', name: '소금', amount: 5, unit: 'g', category: 'salt' },
      { id: 'ing-5', name: '인스턴트 드라이이스트', amount: 4, unit: 'g', category: 'leavening' },
      { id: 'ing-6', name: '버터', amount: 20, unit: 'g', category: 'fat' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '버터를 제외한 모든 재료를 믹싱합니다.' },
      { id: 'step-2', order: 2, instruction: '글루텐이 80% 형성되면 버터를 넣고 최종단계까지 믹싱합니다.' },
      { id: 'step-3', order: 3, instruction: '1차 발효 60-90분 (27-28℃)' },
      { id: 'step-4', order: 4, instruction: '분할 및 둥글리기' },
      { id: 'step-5', order: 5, instruction: '중간 발효 15분' },
      { id: 'step-6', order: 6, instruction: '성형하여 식빵틀에 넣기' },
      { id: 'step-7', order: 7, instruction: '2차 발효 40-60분 (30-32℃)' },
      { id: 'step-8', order: 8, instruction: '180도에서 30-35분 굽기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bbangjunseo-salt-bread',
    name: '소금빵',
    nameKo: '소금빵',
    description: '바삭한 겉면과 버터 풍미가 특징인 소금빵',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['소금빵', '시오빵', '버터', '바삭'],
    totalTime: 150,
    source: {
      name: '빵준서',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: {
        bulk: { min: 60, max: 60, unit: 'min' },
        final: { min: 40, max: 50, unit: 'min' }
      },
      temperature: {
        bulk: { min: 27, max: 28, unit: 'C' },
        final: { min: 30, max: 32, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 200,
      mode: 'convection',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 372,
        divisionCount: 8,
        divisionWeight: 46,
        unitCount: 8,
        unitWeight: 46
      },
      pans: [{
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 372,
        divisionCount: 8,
        divisionWeight: 46,
        unitCount: 8,
        unitWeight: 46
      }]
    },
    yield: { quantity: 8, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 200, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '우유', amount: 130, unit: 'g', category: 'liquid' },
      { id: 'ing-3', name: '설탕', amount: 20, unit: 'g', category: 'sugar' },
      { id: 'ing-4', name: '소금', amount: 4, unit: 'g', category: 'salt' },
      { id: 'ing-5', name: '인스턴트 드라이이스트', amount: 3, unit: 'g', category: 'leavening' },
      { id: 'ing-6', name: '버터(반죽용)', amount: 15, unit: 'g', category: 'fat' },
      { id: 'ing-7', name: '가염버터(필링)', amount: 80, unit: 'g', category: 'fat' },
      { id: 'ing-8', name: '굵은소금(토핑)', amount: 2, unit: 'g', category: 'salt' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '버터를 제외한 재료를 믹싱합니다.' },
      { id: 'step-2', order: 2, instruction: '버터를 넣고 최종단계까지 반죽합니다.' },
      { id: 'step-3', order: 3, instruction: '1차 발효 60분' },
      { id: 'step-4', order: 4, instruction: '8등분하여 둥글리기 후 15분 휴지' },
      { id: 'step-5', order: 5, instruction: '삼각형으로 밀어 가염버터를 넣고 말기' },
      { id: 'step-6', order: 6, instruction: '2차 발효 40-50분' },
      { id: 'step-7', order: 7, instruction: '굵은 소금을 뿌리고 200도에서 12-15분 굽기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bbangjunseo-baguette',
    name: '바게트',
    nameKo: '바게트',
    description: '겉은 바삭하고 속은 쫄깃한 정통 프랑스 바게트',
    category: 'bread',
    difficulty: 'advanced',
    tags: ['바게트', '프랑스빵', '하드롤', '리틀'],
    totalTime: 240,
    source: {
      name: '빵준서',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장'
    },
    method: {
      method: 'poolish',
      prefermentRatio: 30,
      fermentationTime: {
        preferment: { min: 720, max: 960, unit: 'min' },
        bulk: { min: 120, max: 150, unit: 'min' },
        final: { min: 45, max: 60, unit: 'min' }
      },
      temperature: {
        preferment: { min: 20, max: 22, unit: 'C' },
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
    panConfig: {
      originalPan: {
        mode: 'count',
        category: '바게트팬',
        type: '바게트팬 3구 (38cm)',
        quantity: 1,
        panWeight: 604,
        divisionCount: 3,
        divisionWeight: 201,
        unitCount: 3,
        unitWeight: 201
      },
      pans: [{
        mode: 'count',
        category: '바게트팬',
        type: '바게트팬 3구 (38cm)',
        quantity: 1,
        panWeight: 604,
        divisionCount: 3,
        divisionWeight: 201,
        unitCount: 3,
        unitWeight: 201
      }]
    },
    yield: { quantity: 3, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 350, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '물', amount: 245, unit: 'g', category: 'liquid' },
      { id: 'ing-3', name: '소금', amount: 7, unit: 'g', category: 'salt' },
      { id: 'ing-4', name: '인스턴트 드라이이스트', amount: 2, unit: 'g', category: 'leavening' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '폴리쉬: 밀가루 100g + 물 100g + 이스트 0.5g, 상온에서 12-16시간' },
      { id: 'step-2', order: 2, instruction: '오토리즈: 나머지 밀가루와 물을 섞어 30분 휴지' },
      { id: 'step-3', order: 3, instruction: '폴리쉬, 소금, 이스트를 넣고 믹싱' },
      { id: 'step-4', order: 4, instruction: '1차 발효 2-2.5시간 (30분마다 폴딩 3회)' },
      { id: 'step-5', order: 5, instruction: '분할하여 예비성형 후 20분 휴지' },
      { id: 'step-6', order: 6, instruction: '바게트 모양으로 성형' },
      { id: 'step-7', order: 7, instruction: '2차 발효 45-60분' },
      { id: 'step-8', order: 8, instruction: '쿠프 넣고 230도에서 23-25분 굽기 (스팀 필수)' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bbangjunseo-tangzhong-bread',
    name: '탕종 식빵',
    nameKo: '탕종 식빵',
    description: '탕종법으로 만든 촉촉하고 부드러운 식빵',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['탕종', '식빵', '촉촉', '부드러움'],
    totalTime: 200,
    source: {
      name: '빵준서',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: {
        bulk: { min: 60, max: 90, unit: 'min' },
        final: { min: 50, max: 70, unit: 'min' }
      },
      temperature: {
        bulk: { min: 27, max: 28, unit: 'C' },
        final: { min: 30, max: 32, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 175,
      mode: 'conventional',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'pan',
        category: '풀먼틀',
        type: '풀먼 식빵틀 (21.5×11.5×11cm)',
        quantity: 1,
        panWeight: 596,
        divisionCount: 1,
        divisionWeight: 596,
        unitCount: 1,
        unitWeight: 596
      },
      pans: [{
        mode: 'pan',
        category: '풀먼틀',
        type: '풀먼 식빵틀 (21.5×11.5×11cm)',
        quantity: 1,
        panWeight: 596,
        divisionCount: 1,
        divisionWeight: 596,
        unitCount: 1,
        unitWeight: 596
      }]
    },
    yield: { quantity: 1, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 280, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '강력분(탕종용)', amount: 20, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-3', name: '물(탕종용)', amount: 100, unit: 'g', category: 'liquid' },
      { id: 'ing-4', name: '우유', amount: 130, unit: 'g', category: 'liquid' },
      { id: 'ing-5', name: '설탕', amount: 30, unit: 'g', category: 'sugar' },
      { id: 'ing-6', name: '소금', amount: 6, unit: 'g', category: 'salt' },
      { id: 'ing-7', name: '인스턴트 드라이이스트', amount: 5, unit: 'g', category: 'leavening' },
      { id: 'ing-8', name: '버터', amount: 25, unit: 'g', category: 'fat' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '탕종: 밀가루 20g + 물 100g을 약불에서 65-68도까지 저어가며 가열' },
      { id: 'step-2', order: 2, instruction: '탕종을 랩씌워 냉장 보관 (최소 2시간, 하룻밤 권장)' },
      { id: 'step-3', order: 3, instruction: '탕종과 버터 제외 재료 믹싱' },
      { id: 'step-4', order: 4, instruction: '탕종과 버터를 넣고 최종단계까지 반죽' },
      { id: 'step-5', order: 5, instruction: '1차 발효 60-90분' },
      { id: 'step-6', order: 6, instruction: '분할, 둥글리기, 중간발효 15분' },
      { id: 'step-7', order: 7, instruction: '성형하여 식빵틀에 넣기' },
      { id: 'step-8', order: 8, instruction: '2차 발효 50-70분 (틀의 80%까지)' },
      { id: 'step-9', order: 9, instruction: '175도에서 35-40분 굽기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bbangjunseo-brioche',
    name: '브리오슈',
    nameKo: '브리오슈',
    description: '버터가 듬뿍 들어간 고급스러운 프랑스 빵',
    category: 'bread',
    difficulty: 'advanced',
    tags: ['브리오슈', '버터', '프랑스', '고급'],
    totalTime: 300,
    source: {
      name: '빵준서',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: {
        bulk: { min: 60, max: 90, unit: 'min' },
        final: { min: 90, max: 120, unit: 'min' }
      },
      temperature: {
        bulk: { min: 25, max: 27, unit: 'C' },
        final: { min: 28, max: 30, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 180,
      mode: 'conventional',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'count',
        category: '브리오슈틀',
        type: '브리오슈 틀 (지름 10cm)',
        quantity: 8,
        panWeight: 604,
        divisionCount: 8,
        divisionWeight: 75,
        unitCount: 8,
        unitWeight: 75
      },
      pans: [{
        mode: 'count',
        category: '브리오슈틀',
        type: '브리오슈 틀 (지름 10cm)',
        quantity: 8,
        panWeight: 604,
        divisionCount: 8,
        divisionWeight: 75,
        unitCount: 8,
        unitWeight: 75
      }]
    },
    yield: { quantity: 8, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 250, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '달걀', amount: 150, unit: 'g', category: 'egg' },
      { id: 'ing-3', name: '우유', amount: 40, unit: 'g', category: 'liquid' },
      { id: 'ing-4', name: '설탕', amount: 30, unit: 'g', category: 'sugar' },
      { id: 'ing-5', name: '소금', amount: 5, unit: 'g', category: 'salt' },
      { id: 'ing-6', name: '인스턴트 드라이이스트', amount: 4, unit: 'g', category: 'leavening' },
      { id: 'ing-7', name: '버터', amount: 125, unit: 'g', category: 'fat' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '버터를 제외한 재료를 믹싱하여 글루텐 형성' },
      { id: 'step-2', order: 2, instruction: '상온 버터를 조금씩 넣으며 완전히 흡수시키기' },
      { id: 'step-3', order: 3, instruction: '최종단계까지 반죽 (매끈하고 광택나는 상태)' },
      { id: 'step-4', order: 4, instruction: '1차 발효 60-90분 (또는 냉장에서 12시간)' },
      { id: 'step-5', order: 5, instruction: '분할하여 둥글리기' },
      { id: 'step-6', order: 6, instruction: '브리오슈 모양으로 성형' },
      { id: 'step-7', order: 7, instruction: '2차 발효 90-120분' },
      { id: 'step-8', order: 8, instruction: '달걀물 바르고 180도에서 15-18분 굽기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // ===== 호야TV 레시피 (5개) =====
  {
    id: 'hoyatv-morning-roll',
    name: '모닝빵',
    nameKo: '모닝빵',
    description: '부드럽고 폭신한 기본 모닝빵',
    category: 'bread',
    difficulty: 'beginner',
    tags: ['모닝빵', '부드러움', '기본', '초보'],
    totalTime: 150,
    source: {
      name: '호야TV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: {
        bulk: { min: 60, max: 60, unit: 'min' },
        final: { min: 40, max: 50, unit: 'min' }
      },
      temperature: {
        bulk: { min: 27, max: 28, unit: 'C' },
        final: { min: 32, max: 35, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 180,
      mode: 'convection',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 605,
        divisionCount: 12,
        divisionWeight: 50,
        unitCount: 12,
        unitWeight: 50
      },
      pans: [{
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 605,
        divisionCount: 12,
        divisionWeight: 50,
        unitCount: 12,
        unitWeight: 50
      }]
    },
    yield: { quantity: 12, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 310, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '우유', amount: 160, unit: 'g', category: 'liquid' },
      { id: 'ing-3', name: '달걀', amount: 50, unit: 'g', category: 'egg' },
      { id: 'ing-4', name: '설탕', amount: 40, unit: 'g', category: 'sugar' },
      { id: 'ing-5', name: '소금', amount: 5, unit: 'g', category: 'salt' },
      { id: 'ing-6', name: '인스턴트 드라이이스트', amount: 5, unit: 'g', category: 'leavening' },
      { id: 'ing-7', name: '버터', amount: 35, unit: 'g', category: 'fat' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '버터 제외 모든 재료 믹싱' },
      { id: 'step-2', order: 2, instruction: '버터 넣고 최종단계까지 반죽' },
      { id: 'step-3', order: 3, instruction: '1차 발효 60분' },
      { id: 'step-4', order: 4, instruction: '12등분하여 둥글리기' },
      { id: 'step-5', order: 5, instruction: '15분 휴지 후 다시 둥글리기' },
      { id: 'step-6', order: 6, instruction: '2차 발효 40-50분' },
      { id: 'step-7', order: 7, instruction: '달걀물 바르고 180도에서 12-15분 굽기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hoyatv-cream-bread',
    name: '크림빵',
    nameKo: '크림빵',
    description: '부드러운 반죽과 달콤한 커스터드 크림이 조화로운 빵',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['크림빵', '커스터드', '달콤', '부드러움'],
    totalTime: 180,
    source: {
      name: '호야TV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: {
        bulk: { min: 60, max: 60, unit: 'min' },
        final: { min: 40, max: 50, unit: 'min' }
      },
      temperature: {
        bulk: { min: 27, max: 28, unit: 'C' },
        final: { min: 32, max: 35, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 180,
      mode: 'convection',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 570,
        divisionCount: 10,
        divisionWeight: 57,
        unitCount: 10,
        unitWeight: 57
      },
      pans: [{
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 570,
        divisionCount: 10,
        divisionWeight: 57,
        unitCount: 10,
        unitWeight: 57
      }]
    },
    yield: { quantity: 10, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 280, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '우유', amount: 150, unit: 'g', category: 'liquid' },
      { id: 'ing-3', name: '달걀', amount: 50, unit: 'g', category: 'egg' },
      { id: 'ing-4', name: '설탕', amount: 45, unit: 'g', category: 'sugar' },
      { id: 'ing-5', name: '소금', amount: 5, unit: 'g', category: 'salt' },
      { id: 'ing-6', name: '인스턴트 드라이이스트', amount: 5, unit: 'g', category: 'leavening' },
      { id: 'ing-7', name: '버터', amount: 35, unit: 'g', category: 'fat' },
      { id: 'ing-8', name: '커스터드 크림', amount: 400, unit: 'g', category: 'other' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '커스터드 크림을 미리 만들어 냉장 보관' },
      { id: 'step-2', order: 2, instruction: '버터 제외 재료 믹싱 후 버터 넣고 최종단계 반죽' },
      { id: 'step-3', order: 3, instruction: '1차 발효 60분' },
      { id: 'step-4', order: 4, instruction: '10등분하여 둥글리기, 15분 휴지' },
      { id: 'step-5', order: 5, instruction: '넓게 펴서 크림 40g씩 넣고 오므려 성형' },
      { id: 'step-6', order: 6, instruction: '2차 발효 40-50분' },
      { id: 'step-7', order: 7, instruction: '달걀물 바르고 180도에서 12-14분 굽기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hoyatv-soboro-bread',
    name: '소보로빵',
    nameKo: '소보로빵',
    description: '바삭한 소보로 토핑이 올라간 달콤한 빵',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['소보로', '토핑', '달콤', '바삭'],
    totalTime: 160,
    source: {
      name: '호야TV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: {
        bulk: { min: 60, max: 60, unit: 'min' },
        final: { min: 40, max: 50, unit: 'min' }
      },
      temperature: {
        bulk: { min: 27, max: 28, unit: 'C' },
        final: { min: 32, max: 35, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 175,
      mode: 'convection',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 555,
        divisionCount: 10,
        divisionWeight: 55,
        unitCount: 10,
        unitWeight: 55
      },
      pans: [{
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 555,
        divisionCount: 10,
        divisionWeight: 55,
        unitCount: 10,
        unitWeight: 55
      }]
    },
    yield: { quantity: 10, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 280, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '우유', amount: 150, unit: 'g', category: 'liquid' },
      { id: 'ing-3', name: '달걀', amount: 45, unit: 'g', category: 'egg' },
      { id: 'ing-4', name: '설탕', amount: 40, unit: 'g', category: 'sugar' },
      { id: 'ing-5', name: '소금', amount: 5, unit: 'g', category: 'salt' },
      { id: 'ing-6', name: '인스턴트 드라이이스트', amount: 5, unit: 'g', category: 'leavening' },
      { id: 'ing-7', name: '버터', amount: 30, unit: 'g', category: 'fat' },
      { id: 'ing-8', name: '박력분(소보로)', amount: 100, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-9', name: '버터(소보로)', amount: 50, unit: 'g', category: 'fat' },
      { id: 'ing-10', name: '설탕(소보로)', amount: 50, unit: 'g', category: 'sugar' },
      { id: 'ing-11', name: '달걀(소보로)', amount: 25, unit: 'g', category: 'egg' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '소보로: 버터+설탕 크림화, 달걀 넣고, 박력분 섞어 냉장 보관' },
      { id: 'step-2', order: 2, instruction: '반죽: 버터 제외 재료 믹싱 후 버터 넣고 최종단계 반죽' },
      { id: 'step-3', order: 3, instruction: '1차 발효 60분' },
      { id: 'step-4', order: 4, instruction: '10등분하여 둥글리기, 15분 휴지' },
      { id: 'step-5', order: 5, instruction: '다시 둥글리기 후 소보로 토핑 올리기' },
      { id: 'step-6', order: 6, instruction: '2차 발효 40-50분' },
      { id: 'step-7', order: 7, instruction: '175도에서 14-16분 굽기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hoyatv-red-bean-bread',
    name: '단팥빵',
    nameKo: '단팥빵',
    description: '달콤한 팥앙금이 들어간 클래식 단팥빵',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['단팥빵', '팥앙금', '달콤', '클래식'],
    totalTime: 160,
    source: {
      name: '호야TV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: {
        bulk: { min: 60, max: 60, unit: 'min' },
        final: { min: 40, max: 50, unit: 'min' }
      },
      temperature: {
        bulk: { min: 27, max: 28, unit: 'C' },
        final: { min: 32, max: 35, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 180,
      mode: 'convection',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 550,
        divisionCount: 10,
        divisionWeight: 55,
        unitCount: 10,
        unitWeight: 55
      },
      pans: [{
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 550,
        divisionCount: 10,
        divisionWeight: 55,
        unitCount: 10,
        unitWeight: 55
      }]
    },
    yield: { quantity: 10, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 280, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '우유', amount: 150, unit: 'g', category: 'liquid' },
      { id: 'ing-3', name: '달걀', amount: 45, unit: 'g', category: 'egg' },
      { id: 'ing-4', name: '설탕', amount: 35, unit: 'g', category: 'sugar' },
      { id: 'ing-5', name: '소금', amount: 5, unit: 'g', category: 'salt' },
      { id: 'ing-6', name: '인스턴트 드라이이스트', amount: 5, unit: 'g', category: 'leavening' },
      { id: 'ing-7', name: '버터', amount: 30, unit: 'g', category: 'fat' },
      { id: 'ing-8', name: '팥앙금', amount: 400, unit: 'g', category: 'other' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '팥앙금을 40g씩 둥글게 만들어 준비' },
      { id: 'step-2', order: 2, instruction: '버터 제외 재료 믹싱 후 버터 넣고 최종단계 반죽' },
      { id: 'step-3', order: 3, instruction: '1차 발효 60분' },
      { id: 'step-4', order: 4, instruction: '10등분하여 둥글리기, 15분 휴지' },
      { id: 'step-5', order: 5, instruction: '넓게 펴서 팥앙금 넣고 오므려 성형' },
      { id: 'step-6', order: 6, instruction: '이음매가 아래로 가게 놓고 2차 발효 40-50분' },
      { id: 'step-7', order: 7, instruction: '달걀물 바르고 검은깨 뿌려 180도에서 12-14분 굽기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hoyatv-hotdog-bread',
    name: '핫도그빵',
    nameKo: '핫도그빵',
    description: '소시지를 감싼 부드러운 핫도그빵',
    category: 'bread',
    difficulty: 'beginner',
    tags: ['핫도그', '소시지', '간식', '부드러움'],
    totalTime: 150,
    source: {
      name: '호야TV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: {
        bulk: { min: 60, max: 60, unit: 'min' },
        final: { min: 40, max: 50, unit: 'min' }
      },
      temperature: {
        bulk: { min: 27, max: 28, unit: 'C' },
        final: { min: 32, max: 35, unit: 'C' }
      }
    },
    ovenSettings: {
      temperature: 180,
      mode: 'convection',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 493,
        divisionCount: 8,
        divisionWeight: 61,
        unitCount: 8,
        unitWeight: 61
      },
      pans: [{
        mode: 'count',
        category: '철판',
        type: '오븐 철판 (40×30cm)',
        quantity: 1,
        panWeight: 493,
        divisionCount: 8,
        divisionWeight: 61,
        unitCount: 8,
        unitWeight: 61
      }]
    },
    yield: { quantity: 8, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '강력분', amount: 250, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-2', name: '우유', amount: 140, unit: 'g', category: 'liquid' },
      { id: 'ing-3', name: '달걀', amount: 40, unit: 'g', category: 'egg' },
      { id: 'ing-4', name: '설탕', amount: 30, unit: 'g', category: 'sugar' },
      { id: 'ing-5', name: '소금', amount: 4, unit: 'g', category: 'salt' },
      { id: 'ing-6', name: '인스턴트 드라이이스트', amount: 4, unit: 'g', category: 'leavening' },
      { id: 'ing-7', name: '버터', amount: 25, unit: 'g', category: 'fat' },
      { id: 'ing-8', name: '소시지', amount: 8, unit: '개', category: 'other' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '버터 제외 재료 믹싱 후 버터 넣고 최종단계 반죽' },
      { id: 'step-2', order: 2, instruction: '1차 발효 60분' },
      { id: 'step-3', order: 3, instruction: '8등분하여 둥글리기, 15분 휴지' },
      { id: 'step-4', order: 4, instruction: '길쭉하게 밀어서 소시지에 감아 성형' },
      { id: 'step-5', order: 5, instruction: '2차 발효 40-50분' },
      { id: 'step-6', order: 6, instruction: '달걀물 바르고 180도에서 12-14분 굽기' },
      { id: 'step-7', order: 7, instruction: '케첩, 머스타드 뿌려 마무리' }
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
