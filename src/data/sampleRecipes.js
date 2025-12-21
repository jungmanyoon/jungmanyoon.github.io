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
    nameEn: 'Milk Bread',
    description: '부드럽고 촉촉한 기본 우유 식빵. 명장의 손맛이 담긴 레시피',
    descriptionEn: 'Soft and moist basic milk bread. A recipe with master baker\'s touch',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['식빵', '우유', '버터', '기본'],
    totalTime: 180,
    source: {
      name: '빵준서',
      nameEn: 'BbangJunseo',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장',
      authorEn: 'Master Baker Park Jun-seo'
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
    nameEn: 'Salt Bread (Shio Pan)',
    description: '바삭한 겉면과 버터 풍미가 특징인 소금빵',
    descriptionEn: 'Salt bread with crispy exterior and rich butter flavor',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['소금빵', '시오빵', '버터', '바삭'],
    totalTime: 150,
    source: {
      name: '빵준서',
      nameEn: 'BbangJunseo',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장',
      authorEn: 'Master Baker Park Jun-seo'
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
    nameEn: 'Baguette',
    description: '겉은 바삭하고 속은 쫄깃한 정통 프랑스 바게트',
    descriptionEn: 'Authentic French baguette with crispy crust and chewy interior',
    category: 'bread',
    difficulty: 'advanced',
    tags: ['바게트', '프랑스빵', '하드롤', '리틀'],
    totalTime: 240,
    source: {
      name: '빵준서',
      nameEn: 'BbangJunseo',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장',
      authorEn: 'Master Baker Park Jun-seo'
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
    nameEn: 'Tangzhong Bread',
    description: '탕종법으로 만든 촉촉하고 부드러운 식빵',
    descriptionEn: 'Soft and moist bread made with tangzhong (water roux) method',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['탕종', '식빵', '촉촉', '부드러움'],
    totalTime: 200,
    source: {
      name: '빵준서',
      nameEn: 'BbangJunseo',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장',
      authorEn: 'Master Baker Park Jun-seo'
    },
    method: {
      method: 'tangzhong',  // 탕종법으로 변경
      prefermentRatio: 0.067,  // 20g / 300g = 6.7% (탕종용 밀가루 비율)
      fermentationTime: {
        preferment: { min: 30, max: 60, unit: 'min' },  // 탕종 식히는 시간
        bulk: { min: 60, max: 90, unit: 'min' },
        final: { min: 50, max: 70, unit: 'min' }
      },
      temperature: {
        preferment: { min: 65, max: 68, unit: 'C' },  // 탕종 호화 온도
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
    // 새로운 phases 구조
    phases: [
      {
        id: 'phase-tangzhong',
        name: '탕종',
        nameKo: '탕종',
        type: 'tangzhong',
        order: 0,
        ingredients: [
          { id: 'ing-t1', name: '강력분', amount: 20, unit: 'g', category: 'flour', isFlour: true },
          { id: 'ing-t2', name: '물', amount: 100, unit: 'g', category: 'liquid' }
        ],
        steps: [
          { id: 'step-t1', order: 1, instruction: '밀가루와 물을 냄비에 넣고 잘 섞기' },
          { id: 'step-t2', order: 2, instruction: '약불에서 저어가며 65-68°C까지 가열 (주걱에 선이 남을 정도)' },
          { id: 'step-t3', order: 3, instruction: '랩씌워 냉장 보관 (최소 2시간, 하룻밤 권장)' }
        ],
        fermentationTime: { min: 120, max: 720, unit: 'min' },
        notes: '탕종은 반드시 식혀서 사용 (뜨거우면 이스트 사멸)'
      },
      {
        id: 'phase-main',
        name: '본반죽',
        nameKo: '본반죽',
        type: 'main',
        order: 1,
        ingredients: [
          { id: 'ing-m1', name: '강력분', amount: 280, unit: 'g', category: 'flour', isFlour: true },
          { id: 'ing-m2', name: '우유', amount: 130, unit: 'g', category: 'liquid' },
          { id: 'ing-m3', name: '설탕', amount: 30, unit: 'g', category: 'sugar' },
          { id: 'ing-m4', name: '소금', amount: 6, unit: 'g', category: 'salt' },
          { id: 'ing-m5', name: '인스턴트 드라이이스트', amount: 5, unit: 'g', category: 'leavening' },
          { id: 'ing-m6', name: '버터', amount: 25, unit: 'g', category: 'fat' }
        ],
        steps: [
          { id: 'step-m1', order: 1, instruction: '버터 제외 재료 + 탕종 믹싱' },
          { id: 'step-m2', order: 2, instruction: '버터 투입 후 최종단계까지 반죽' },
          { id: 'step-m3', order: 3, instruction: '1차 발효 60-90분' },
          { id: 'step-m4', order: 4, instruction: '분할, 둥글리기, 벤치타임 15분' },
          { id: 'step-m5', order: 5, instruction: '성형하여 식빵틀에 넣기' },
          { id: 'step-m6', order: 6, instruction: '2차 발효 50-70분 (틀의 80%)' },
          { id: 'step-m7', order: 7, instruction: '175°C에서 35-40분 굽기' }
        ]
      }
    ],
    // 기존 호환용 (평탄화된 재료)
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
    // 기존 호환용 (평탄화된 공정)
    steps: [
      { id: 'step-1', order: 1, instruction: '【탕종】 밀가루 20g + 물 100g을 약불에서 65-68°C까지 저어가며 가열' },
      { id: 'step-2', order: 2, instruction: '【탕종】 랩씌워 냉장 보관 (최소 2시간, 하룻밤 권장)' },
      { id: 'step-3', order: 3, instruction: '【본반죽】 탕종과 버터 제외 재료 믹싱' },
      { id: 'step-4', order: 4, instruction: '【본반죽】 탕종과 버터를 넣고 최종단계까지 반죽' },
      { id: 'step-5', order: 5, instruction: '1차 발효 60-90분' },
      { id: 'step-6', order: 6, instruction: '분할, 둥글리기, 중간발효 15분' },
      { id: 'step-7', order: 7, instruction: '성형하여 식빵틀에 넣기' },
      { id: 'step-8', order: 8, instruction: '2차 발효 50-70분 (틀의 80%까지)' },
      { id: 'step-9', order: 9, instruction: '175°C에서 35-40분 굽기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bbangjunseo-brioche',
    name: '브리오슈',
    nameKo: '브리오슈',
    nameEn: 'Brioche',
    description: '버터가 듬뿍 들어간 고급스러운 프랑스 빵',
    descriptionEn: 'Rich French bread loaded with butter',
    category: 'bread',
    difficulty: 'advanced',
    tags: ['브리오슈', '버터', '프랑스', '고급'],
    totalTime: 300,
    source: {
      name: '빵준서',
      nameEn: 'BbangJunseo',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장',
      authorEn: 'Master Baker Park Jun-seo'
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
    nameEn: 'Morning Roll',
    description: '부드럽고 폭신한 기본 모닝빵',
    descriptionEn: 'Soft and fluffy basic morning rolls',
    category: 'bread',
    difficulty: 'beginner',
    tags: ['모닝빵', '부드러움', '기본', '초보'],
    totalTime: 150,
    source: {
      name: '호야TV',
      nameEn: 'HoyaTV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야',
      authorEn: 'Hoya'
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
    nameEn: 'Cream Bread',
    description: '부드러운 반죽과 달콤한 커스터드 크림이 조화로운 빵',
    descriptionEn: 'Soft bread filled with sweet custard cream',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['크림빵', '커스터드', '달콤', '부드러움'],
    totalTime: 180,
    source: {
      name: '호야TV',
      nameEn: 'HoyaTV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야',
      authorEn: 'Hoya'
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
    nameEn: 'Soboro Bread (Streusel Bread)',
    description: '바삭한 소보로 토핑이 올라간 달콤한 빵',
    descriptionEn: 'Sweet bread with crispy streusel topping',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['소보로', '토핑', '달콤', '바삭'],
    totalTime: 160,
    source: {
      name: '호야TV',
      nameEn: 'HoyaTV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야',
      authorEn: 'Hoya'
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
    nameEn: 'Red Bean Bread (Anpan)',
    description: '달콤한 팥앙금이 들어간 클래식 단팥빵',
    descriptionEn: 'Classic bread filled with sweet red bean paste',
    category: 'bread',
    difficulty: 'intermediate',
    tags: ['단팥빵', '팥앙금', '달콤', '클래식'],
    totalTime: 160,
    source: {
      name: '호야TV',
      nameEn: 'HoyaTV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야',
      authorEn: 'Hoya'
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
    nameEn: 'Hot Dog Bread',
    description: '소시지를 감싼 부드러운 핫도그빵',
    descriptionEn: 'Soft bread wrapped around sausage',
    category: 'bread',
    difficulty: 'beginner',
    tags: ['핫도그', '소시지', '간식', '부드러움'],
    totalTime: 150,
    source: {
      name: '호야TV',
      nameEn: 'HoyaTV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야',
      authorEn: 'Hoya'
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
  },

  // ===== 제과 레시피 (10개) =====
  // 자도르 (J'adore) 레시피 3개
  {
    id: 'jadore-strawberry-cream-cake',
    name: '딸기생크림 케이크',
    nameKo: '딸기생크림 케이크',
    nameEn: 'Strawberry Cream Cake',
    productType: 'pastry',
    description: '부드러운 제누와즈 스펀지와 생크림, 신선한 딸기의 완벽한 조화',
    descriptionEn: 'Perfect harmony of soft genoise sponge, whipped cream and fresh strawberries',
    category: 'cake',
    difficulty: 'intermediate',
    tags: ['케이크', '딸기', '생크림', '제누와즈', '스펀지'],
    totalTime: 150,
    source: {
      name: '자도르',
      nameEn: 'J\'adore',
      type: 'youtube',
      url: 'https://www.youtube.com/@jadore',
      author: '자도르',
      authorEn: 'J\'adore'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: null
    },
    ovenSettings: {
      temperature: 170,
      mode: 'conventional',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'pan',
        category: '원형틀',
        type: '1호 (지름 15cm)',
        quantity: 1,
        panWeight: 400,
        divisionCount: 1,
        divisionWeight: 400,
        unitCount: 1,
        unitWeight: 400
      },
      pans: [{
        mode: 'pan',
        category: '원형틀',
        type: '1호 (지름 15cm)',
        quantity: 1,
        panWeight: 400,
        divisionCount: 1,
        divisionWeight: 400,
        unitCount: 1,
        unitWeight: 400
      }]
    },
    yield: { quantity: 1, unit: '호' },
    ingredients: [
      // 제누와즈 스펀지
      { id: 'ing-1', name: '계란', amount: 150, unit: 'g', category: 'egg', phase: 'main' },
      { id: 'ing-2', name: '설탕', amount: 100, unit: 'g', category: 'sugar', phase: 'main' },
      { id: 'ing-3', name: '박력분', amount: 100, unit: 'g', category: 'flour', isFlour: true, phase: 'main' },
      { id: 'ing-4', name: '우유', amount: 30, unit: 'g', category: 'liquid', phase: 'main' },
      { id: 'ing-5', name: '버터', amount: 20, unit: 'g', category: 'fat', phase: 'main' },
      // 생크림
      { id: 'ing-6', name: '생크림', amount: 300, unit: 'g', category: 'liquid', phase: 'frosting' },
      { id: 'ing-7', name: '설탕 (생크림용)', amount: 30, unit: 'g', category: 'sugar', phase: 'frosting' },
      // 시럽
      { id: 'ing-8', name: '물', amount: 50, unit: 'g', category: 'liquid', phase: 'other' },
      { id: 'ing-9', name: '설탕 (시럽용)', amount: 25, unit: 'g', category: 'sugar', phase: 'other' },
      // 토핑
      { id: 'ing-10', name: '딸기', amount: 200, unit: 'g', category: 'fruit', phase: 'topping' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '계란과 설탕을 중탕으로 40도까지 데운 후 핸드믹서로 흰색 거품이 날 때까지 휘핑' },
      { id: 'step-2', order: 2, instruction: '박력분을 체에 쳐서 넣고 주걱으로 가볍게 섞기' },
      { id: 'step-3', order: 3, instruction: '녹인 버터와 우유를 섞어 반죽에 넣고 골고루 섞기' },
      { id: 'step-4', order: 4, instruction: '틀에 부어 170도 오븐에서 30분 굽기' },
      { id: 'step-5', order: 5, instruction: '시럽 재료를 끓여 식히기' },
      { id: 'step-6', order: 6, instruction: '생크림과 설탕을 8-9할 정도로 휘핑' },
      { id: 'step-7', order: 7, instruction: '식은 시트를 3등분하여 시럽 바르고 크림과 딸기로 샌딩' },
      { id: 'step-8', order: 8, instruction: '크림으로 표면 마무리하고 딸기 장식' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'jadore-basque-cheesecake',
    name: '바스크 치즈케이크',
    nameKo: '바스크 치즈케이크',
    nameEn: 'Basque Cheesecake',
    productType: 'pastry',
    description: '겉은 바삭 속은 촉촉한 스페인 바스크 지방의 대표 디저트',
    descriptionEn: 'Crispy outside, creamy inside - signature dessert from Basque region of Spain',
    category: 'cake',
    difficulty: 'beginner',
    tags: ['치즈케이크', '바스크', '간단', '4가지재료'],
    totalTime: 90,
    source: {
      name: '자도르',
      nameEn: 'J\'adore',
      type: 'youtube',
      url: 'https://www.youtube.com/@jadore',
      author: '자도르',
      authorEn: 'J\'adore'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: null
    },
    ovenSettings: {
      temperature: 230,
      mode: 'conventional',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'pan',
        category: '원형틀',
        type: '2호 (지름 18cm)',
        quantity: 1,
        panWeight: 600,
        divisionCount: 1,
        divisionWeight: 600,
        unitCount: 1,
        unitWeight: 600
      },
      pans: [{
        mode: 'pan',
        category: '원형틀',
        type: '2호 (지름 18cm)',
        quantity: 1,
        panWeight: 600,
        divisionCount: 1,
        divisionWeight: 600,
        unitCount: 1,
        unitWeight: 600
      }]
    },
    yield: { quantity: 1, unit: '호' },
    ingredients: [
      { id: 'ing-1', name: '크림치즈', amount: 400, unit: 'g', category: 'dairy' },
      { id: 'ing-2', name: '설탕', amount: 130, unit: 'g', category: 'sugar' },
      { id: 'ing-3', name: '계란', amount: 200, unit: 'g', category: 'egg' },
      { id: 'ing-4', name: '생크림', amount: 200, unit: 'g', category: 'liquid' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '크림치즈를 부드럽게 풀어주기' },
      { id: 'step-2', order: 2, instruction: '설탕을 넣고 잘 섞기' },
      { id: 'step-3', order: 3, instruction: '계란을 조금씩 나눠 넣으며 섞기' },
      { id: 'step-4', order: 4, instruction: '생크림을 넣고 골고루 섞기' },
      { id: 'step-5', order: 5, instruction: '유산지를 깐 틀에 붓기' },
      { id: 'step-6', order: 6, instruction: '230도 오븐에서 25-30분 윗면이 갈색이 될 때까지 굽기' },
      { id: 'step-7', order: 7, instruction: '완전히 식힌 후 냉장고에서 하루 숙성' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'jadore-yogurt-roll-cake',
    name: '요거트 롤케이크',
    nameKo: '요거트 롤케이크',
    nameEn: 'Yogurt Roll Cake',
    productType: 'pastry',
    description: '상큼한 요거트 크림과 부드러운 시트의 조화로운 롤케이크',
    descriptionEn: 'Refreshing yogurt cream and soft sponge roll cake',
    category: 'cake',
    difficulty: 'intermediate',
    tags: ['롤케이크', '요거트', '상큼', '과일'],
    totalTime: 120,
    source: {
      name: '자도르',
      nameEn: 'J\'adore',
      type: 'youtube',
      url: 'https://www.youtube.com/@jadore',
      author: '자도르',
      authorEn: 'J\'adore'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: null
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
        category: '사각틀',
        type: '롤케이크틀 (30×40cm)',
        quantity: 1,
        panWeight: 500,
        divisionCount: 1,
        divisionWeight: 500,
        unitCount: 1,
        unitWeight: 500
      },
      pans: [{
        mode: 'pan',
        category: '사각틀',
        type: '롤케이크틀 (30×40cm)',
        quantity: 1,
        panWeight: 500,
        divisionCount: 1,
        divisionWeight: 500,
        unitCount: 1,
        unitWeight: 500
      }]
    },
    yield: { quantity: 1, unit: '개' },
    ingredients: [
      // 시트
      { id: 'ing-1', name: '계란', amount: 120, unit: 'g', category: 'egg', phase: 'main' },
      { id: 'ing-2', name: '설탕', amount: 70, unit: 'g', category: 'sugar', phase: 'main' },
      { id: 'ing-3', name: '박력분', amount: 70, unit: 'g', category: 'flour', isFlour: true, phase: 'main' },
      { id: 'ing-4', name: '우유', amount: 20, unit: 'g', category: 'liquid', phase: 'main' },
      { id: 'ing-5', name: '식용유', amount: 20, unit: 'g', category: 'fat', phase: 'main' },
      // 요거트 크림
      { id: 'ing-6', name: '생크림', amount: 200, unit: 'g', category: 'liquid', phase: 'filling' },
      { id: 'ing-7', name: '플레인 요거트', amount: 100, unit: 'g', category: 'dairy', phase: 'filling' },
      { id: 'ing-8', name: '설탕 (크림용)', amount: 20, unit: 'g', category: 'sugar', phase: 'filling' },
      { id: 'ing-9', name: '딸기', amount: 150, unit: 'g', category: 'fruit', phase: 'filling' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '계란과 설탕을 휘핑하여 리본 상태로 만들기' },
      { id: 'step-2', order: 2, instruction: '박력분 체쳐 넣고 가볍게 섞기' },
      { id: 'step-3', order: 3, instruction: '우유와 식용유 섞어 반죽에 넣기' },
      { id: 'step-4', order: 4, instruction: '팬에 부어 180도에서 12-15분 굽기' },
      { id: 'step-5', order: 5, instruction: '생크림, 요거트, 설탕을 함께 휘핑' },
      { id: 'step-6', order: 6, instruction: '식은 시트에 요거트 크림 바르고 딸기 올리기' },
      { id: 'step-7', order: 7, instruction: '돌돌 말아서 냉장고에서 30분 굳히기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 쿠킹트리 (Cooking Tree) 레시피 2개
  {
    id: 'cookingtree-lemon-meringue-pie',
    name: '레몬 머랭 파이',
    nameKo: '레몬 머랭 파이',
    nameEn: 'Lemon Meringue Pie',
    productType: 'pastry',
    description: '상큼한 레몬 커드와 달콤한 머랭의 완벽한 조화',
    descriptionEn: 'Perfect balance of tangy lemon curd and sweet meringue',
    category: 'pie',
    difficulty: 'advanced',
    tags: ['파이', '레몬', '머랭', '타르트'],
    totalTime: 180,
    source: {
      name: '쿠킹트리',
      nameEn: 'Cooking Tree',
      type: 'youtube',
      url: 'https://www.youtube.com/@cookingtree',
      author: '쿠킹트리',
      authorEn: 'Cooking Tree'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: null
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
        category: '타르트틀',
        type: '타르트링 (지름 18cm)',
        quantity: 1,
        panWeight: 450,
        divisionCount: 1,
        divisionWeight: 450,
        unitCount: 1,
        unitWeight: 450
      },
      pans: [{
        mode: 'pan',
        category: '타르트틀',
        type: '타르트링 (지름 18cm)',
        quantity: 1,
        panWeight: 450,
        divisionCount: 1,
        divisionWeight: 450,
        unitCount: 1,
        unitWeight: 450
      }]
    },
    yield: { quantity: 1, unit: '개' },
    ingredients: [
      // 파이 크러스트
      { id: 'ing-1', name: '박력분', amount: 150, unit: 'g', category: 'flour', isFlour: true, phase: 'main' },
      { id: 'ing-2', name: '버터', amount: 100, unit: 'g', category: 'fat', phase: 'main' },
      { id: 'ing-3', name: '설탕', amount: 30, unit: 'g', category: 'sugar', phase: 'main' },
      { id: 'ing-4', name: '계란노른자', amount: 20, unit: 'g', category: 'egg', phase: 'main' },
      { id: 'ing-5', name: '소금', amount: 1, unit: 'g', category: 'salt', phase: 'main' },
      // 레몬 커드
      { id: 'ing-6', name: '레몬즙', amount: 100, unit: 'g', category: 'liquid', phase: 'filling' },
      { id: 'ing-7', name: '설탕 (커드용)', amount: 100, unit: 'g', category: 'sugar', phase: 'filling' },
      { id: 'ing-8', name: '계란', amount: 100, unit: 'g', category: 'egg', phase: 'filling' },
      { id: 'ing-9', name: '버터 (커드용)', amount: 50, unit: 'g', category: 'fat', phase: 'filling' },
      // 머랭
      { id: 'ing-10', name: '계란흰자', amount: 60, unit: 'g', category: 'egg', phase: 'topping' },
      { id: 'ing-11', name: '설탕 (머랭용)', amount: 60, unit: 'g', category: 'sugar', phase: 'topping' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '차가운 버터와 박력분을 모래알 크기로 비비기' },
      { id: 'step-2', order: 2, instruction: '설탕, 노른자, 소금 넣고 반죽하여 냉장 휴지' },
      { id: 'step-3', order: 3, instruction: '밀어서 타르트 틀에 깔고 180도에서 20분 굽기' },
      { id: 'step-4', order: 4, instruction: '레몬즙, 설탕, 계란 섞어 중탕으로 걸쭉하게 만들기' },
      { id: 'step-5', order: 5, instruction: '버터 넣고 섞어 레몬 커드 완성' },
      { id: 'step-6', order: 6, instruction: '구운 타르트에 레몬 커드 채우기' },
      { id: 'step-7', order: 7, instruction: '흰자와 설탕으로 머랭 만들어 올리기' },
      { id: 'step-8', order: 8, instruction: '토치로 표면 갈색내거나 200도 오븐에서 5분' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'cookingtree-brownie-cake',
    name: '브라우니 케이크',
    nameKo: '브라우니 케이크',
    nameEn: 'Brownie Cake',
    productType: 'pastry',
    description: '진한 초콜릿 맛과 촉촉한 식감의 클래식 브라우니',
    descriptionEn: 'Classic brownie with rich chocolate flavor and moist texture',
    category: 'cake',
    difficulty: 'beginner',
    tags: ['브라우니', '초콜릿', '간단', '촉촉'],
    totalTime: 60,
    source: {
      name: '쿠킹트리',
      nameEn: 'Cooking Tree',
      type: 'youtube',
      url: 'https://www.youtube.com/@cookingtree',
      author: '쿠킹트리',
      authorEn: 'Cooking Tree'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: null
    },
    ovenSettings: {
      temperature: 170,
      mode: 'conventional',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'pan',
        category: '사각틀',
        type: '사각틀 (18×18cm)',
        quantity: 1,
        panWeight: 400,
        divisionCount: 1,
        divisionWeight: 400,
        unitCount: 1,
        unitWeight: 400
      },
      pans: [{
        mode: 'pan',
        category: '사각틀',
        type: '사각틀 (18×18cm)',
        quantity: 1,
        panWeight: 400,
        divisionCount: 1,
        divisionWeight: 400,
        unitCount: 1,
        unitWeight: 400
      }]
    },
    yield: { quantity: 1, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '다크초콜릿', amount: 150, unit: 'g', category: 'chocolate' },
      { id: 'ing-2', name: '버터', amount: 100, unit: 'g', category: 'fat' },
      { id: 'ing-3', name: '계란', amount: 100, unit: 'g', category: 'egg' },
      { id: 'ing-4', name: '설탕', amount: 100, unit: 'g', category: 'sugar' },
      { id: 'ing-5', name: '박력분', amount: 60, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-6', name: '코코아가루', amount: 20, unit: 'g', category: 'chocolate' },
      { id: 'ing-7', name: '호두', amount: 50, unit: 'g', category: 'nuts' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '초콜릿과 버터를 중탕으로 녹이기' },
      { id: 'step-2', order: 2, instruction: '계란과 설탕을 잘 섞기' },
      { id: 'step-3', order: 3, instruction: '초콜릿 버터 혼합물에 계란 섞기' },
      { id: 'step-4', order: 4, instruction: '박력분과 코코아가루 체쳐 넣기' },
      { id: 'step-5', order: 5, instruction: '호두 넣고 가볍게 섞기' },
      { id: 'step-6', order: 6, instruction: '틀에 부어 170도에서 25-30분 굽기' },
      { id: 'step-7', order: 7, instruction: '완전히 식힌 후 자르기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 빵준서 스타일 레시피 2개
  {
    id: 'bbangjunseo-pound-cake',
    name: '클래식 파운드 케이크',
    nameKo: '클래식 파운드 케이크',
    nameEn: 'Classic Pound Cake',
    productType: 'pastry',
    description: '버터 향이 진하고 촉촉한 기본 파운드 케이크',
    descriptionEn: 'Rich butter flavor and moist classic pound cake',
    category: 'cake',
    difficulty: 'beginner',
    tags: ['파운드케이크', '버터', '기본', '클래식'],
    totalTime: 90,
    source: {
      name: '빵준서',
      nameEn: 'BbangJunseo',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장',
      authorEn: 'Master Baker Park Jun-seo'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: null
    },
    ovenSettings: {
      temperature: 170,
      mode: 'conventional',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'pan',
        category: '파운드틀',
        type: '파운드케이크틀 (18×8×7cm)',
        quantity: 1,
        panWeight: 450,
        divisionCount: 1,
        divisionWeight: 450,
        unitCount: 1,
        unitWeight: 450
      },
      pans: [{
        mode: 'pan',
        category: '파운드틀',
        type: '파운드케이크틀 (18×8×7cm)',
        quantity: 1,
        panWeight: 450,
        divisionCount: 1,
        divisionWeight: 450,
        unitCount: 1,
        unitWeight: 450
      }]
    },
    yield: { quantity: 1, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '버터', amount: 125, unit: 'g', category: 'fat' },
      { id: 'ing-2', name: '설탕', amount: 125, unit: 'g', category: 'sugar' },
      { id: 'ing-3', name: '계란', amount: 125, unit: 'g', category: 'egg' },
      { id: 'ing-4', name: '박력분', amount: 125, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-5', name: '베이킹파우더', amount: 3, unit: 'g', category: 'leavening' },
      { id: 'ing-6', name: '바닐라 익스트랙', amount: 3, unit: 'g', category: 'flavor' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '실온 버터를 크림화하기' },
      { id: 'step-2', order: 2, instruction: '설탕을 3번 나눠 넣으며 부드럽게 섞기' },
      { id: 'step-3', order: 3, instruction: '계란을 조금씩 넣으며 분리되지 않게 섞기' },
      { id: 'step-4', order: 4, instruction: '박력분과 베이킹파우더 체쳐 넣고 가볍게 섞기' },
      { id: 'step-5', order: 5, instruction: '바닐라 익스트랙 넣기' },
      { id: 'step-6', order: 6, instruction: '틀에 부어 170도에서 40-45분 굽기' },
      { id: 'step-7', order: 7, instruction: '완전히 식힌 후 슬라이스' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'bbangjunseo-madeleine',
    name: '마들렌',
    nameKo: '마들렌',
    nameEn: 'Madeleine',
    productType: 'pastry',
    description: '조개 모양의 프랑스 전통 작은 케이크',
    descriptionEn: 'Shell-shaped traditional French small cakes',
    category: 'cookie',
    difficulty: 'intermediate',
    tags: ['마들렌', '프랑스', '버터', '레몬'],
    totalTime: 150,
    source: {
      name: '빵준서',
      nameEn: 'BbangJunseo',
      type: 'youtube',
      url: 'https://www.youtube.com/@bbangjunseo',
      author: '박준서 명장',
      authorEn: 'Master Baker Park Jun-seo'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: null
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
        category: '마들렌틀',
        type: '마들렌 몰드',
        quantity: 12,
        panWeight: 25,
        divisionCount: 1,
        divisionWeight: 25,
        unitCount: 12,
        unitWeight: 25
      },
      pans: [{
        mode: 'count',
        category: '마들렌틀',
        type: '마들렌 몰드',
        quantity: 12,
        panWeight: 25,
        divisionCount: 1,
        divisionWeight: 25,
        unitCount: 12,
        unitWeight: 25
      }]
    },
    yield: { quantity: 12, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '계란', amount: 100, unit: 'g', category: 'egg' },
      { id: 'ing-2', name: '설탕', amount: 80, unit: 'g', category: 'sugar' },
      { id: 'ing-3', name: '꿀', amount: 10, unit: 'g', category: 'sweetener' },
      { id: 'ing-4', name: '박력분', amount: 100, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-5', name: '베이킹파우더', amount: 2, unit: 'g', category: 'leavening' },
      { id: 'ing-6', name: '버터', amount: 100, unit: 'g', category: 'fat' },
      { id: 'ing-7', name: '레몬 제스트', amount: 3, unit: 'g', category: 'flavor' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '계란, 설탕, 꿀을 섞어 거품내기' },
      { id: 'step-2', order: 2, instruction: '박력분과 베이킹파우더 체쳐 넣고 섞기' },
      { id: 'step-3', order: 3, instruction: '녹인 버터와 레몬 제스트 넣고 섞기' },
      { id: 'step-4', order: 4, instruction: '냉장고에서 1-2시간 휴지' },
      { id: 'step-5', order: 5, instruction: '마들렌 틀에 80% 채우기' },
      { id: 'step-6', order: 6, instruction: '180도에서 10-12분 굽기' },
      { id: 'step-7', order: 7, instruction: '완전히 식혀서 밀폐 보관' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // 호야TV 스타일 레시피 3개
  {
    id: 'hoyatv-vanilla-chiffon-cake',
    name: '바닐라 시폰 케이크',
    nameKo: '바닐라 시폰 케이크',
    nameEn: 'Vanilla Chiffon Cake',
    productType: 'pastry',
    description: '구름처럼 가볍고 부드러운 시폰 케이크',
    descriptionEn: 'Cloud-like light and fluffy chiffon cake',
    category: 'cake',
    difficulty: 'intermediate',
    tags: ['시폰케이크', '바닐라', '부드러운', '가벼운'],
    totalTime: 90,
    source: {
      name: '호야TV',
      nameEn: 'Hoya TV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야',
      authorEn: 'Hoya'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: null
    },
    ovenSettings: {
      temperature: 170,
      mode: 'conventional',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'pan',
        category: '시폰틀',
        type: '시폰 케이크틀 (지름 17cm)',
        quantity: 1,
        panWeight: 350,
        divisionCount: 1,
        divisionWeight: 350,
        unitCount: 1,
        unitWeight: 350
      },
      pans: [{
        mode: 'pan',
        category: '시폰틀',
        type: '시폰 케이크틀 (지름 17cm)',
        quantity: 1,
        panWeight: 350,
        divisionCount: 1,
        divisionWeight: 350,
        unitCount: 1,
        unitWeight: 350
      }]
    },
    yield: { quantity: 1, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '계란노른자', amount: 60, unit: 'g', category: 'egg' },
      { id: 'ing-2', name: '설탕 (노른자용)', amount: 20, unit: 'g', category: 'sugar' },
      { id: 'ing-3', name: '식용유', amount: 40, unit: 'g', category: 'fat' },
      { id: 'ing-4', name: '물', amount: 50, unit: 'g', category: 'liquid' },
      { id: 'ing-5', name: '박력분', amount: 80, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-6', name: '바닐라 익스트랙', amount: 3, unit: 'g', category: 'flavor' },
      { id: 'ing-7', name: '계란흰자', amount: 120, unit: 'g', category: 'egg' },
      { id: 'ing-8', name: '설탕 (흰자용)', amount: 60, unit: 'g', category: 'sugar' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '노른자와 설탕 섞고 식용유, 물 넣기' },
      { id: 'step-2', order: 2, instruction: '박력분 체쳐 넣고 바닐라 넣어 반죽' },
      { id: 'step-3', order: 3, instruction: '흰자를 단단한 머랭으로 만들기' },
      { id: 'step-4', order: 4, instruction: '머랭을 3번 나눠 반죽에 섞기' },
      { id: 'step-5', order: 5, instruction: '시폰 틀에 부어 바닥을 쳐서 기포 제거' },
      { id: 'step-6', order: 6, instruction: '170도에서 35-40분 굽기' },
      { id: 'step-7', order: 7, instruction: '거꾸로 뒤집어 완전히 식히기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hoyatv-greentea-roll-cake',
    name: '녹차 롤케이크',
    nameKo: '녹차 롤케이크',
    nameEn: 'Green Tea Roll Cake',
    productType: 'pastry',
    description: '은은한 녹차 향과 부드러운 크림의 롤케이크',
    descriptionEn: 'Subtle green tea flavor with soft cream roll cake',
    category: 'cake',
    difficulty: 'intermediate',
    tags: ['롤케이크', '녹차', '크림', '말차'],
    totalTime: 100,
    source: {
      name: '호야TV',
      nameEn: 'Hoya TV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야',
      authorEn: 'Hoya'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: null
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
        category: '사각틀',
        type: '롤케이크틀 (30×40cm)',
        quantity: 1,
        panWeight: 500,
        divisionCount: 1,
        divisionWeight: 500,
        unitCount: 1,
        unitWeight: 500
      },
      pans: [{
        mode: 'pan',
        category: '사각틀',
        type: '롤케이크틀 (30×40cm)',
        quantity: 1,
        panWeight: 500,
        divisionCount: 1,
        divisionWeight: 500,
        unitCount: 1,
        unitWeight: 500
      }]
    },
    yield: { quantity: 1, unit: '개' },
    ingredients: [
      // 시트
      { id: 'ing-1', name: '계란', amount: 120, unit: 'g', category: 'egg', phase: 'main' },
      { id: 'ing-2', name: '설탕', amount: 70, unit: 'g', category: 'sugar', phase: 'main' },
      { id: 'ing-3', name: '박력분', amount: 65, unit: 'g', category: 'flour', isFlour: true, phase: 'main' },
      { id: 'ing-4', name: '녹차가루', amount: 8, unit: 'g', category: 'flavor', phase: 'main' },
      { id: 'ing-5', name: '우유', amount: 20, unit: 'g', category: 'liquid', phase: 'main' },
      { id: 'ing-6', name: '식용유', amount: 20, unit: 'g', category: 'fat', phase: 'main' },
      // 크림
      { id: 'ing-7', name: '생크림', amount: 200, unit: 'g', category: 'liquid', phase: 'filling' },
      { id: 'ing-8', name: '설탕 (크림용)', amount: 20, unit: 'g', category: 'sugar', phase: 'filling' },
      { id: 'ing-9', name: '녹차가루 (크림용)', amount: 3, unit: 'g', category: 'flavor', phase: 'filling' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '계란과 설탕 휘핑하여 리본 상태로' },
      { id: 'step-2', order: 2, instruction: '박력분과 녹차가루 체쳐 섞기' },
      { id: 'step-3', order: 3, instruction: '우유와 식용유 섞어 반죽에 넣기' },
      { id: 'step-4', order: 4, instruction: '팬에 부어 180도에서 12-15분 굽기' },
      { id: 'step-5', order: 5, instruction: '생크림, 설탕, 녹차가루로 크림 휘핑' },
      { id: 'step-6', order: 6, instruction: '식은 시트에 크림 바르고 말기' },
      { id: 'step-7', order: 7, instruction: '냉장고에서 30분 굳히기' }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'hoyatv-butter-cookies',
    name: '버터쿠키',
    nameKo: '버터쿠키',
    nameEn: 'Butter Cookies',
    productType: 'pastry',
    description: '바삭하고 고소한 클래식 버터쿠키',
    descriptionEn: 'Crispy and savory classic butter cookies',
    category: 'cookie',
    difficulty: 'beginner',
    tags: ['쿠키', '버터', '간단', '바삭'],
    totalTime: 60,
    source: {
      name: '호야TV',
      nameEn: 'Hoya TV',
      type: 'youtube',
      url: 'https://www.youtube.com/@hoyatv',
      author: '호야',
      authorEn: 'Hoya'
    },
    method: {
      method: 'straight',
      prefermentRatio: 0,
      fermentationTime: null
    },
    ovenSettings: {
      temperature: 170,
      mode: 'conventional',
      preheating: true,
      deck: 'middle'
    },
    panConfig: {
      originalPan: {
        mode: 'count',
        category: '쿠키팬',
        type: '베이킹 팬',
        quantity: 30,
        panWeight: 15,
        divisionCount: 1,
        divisionWeight: 15,
        unitCount: 30,
        unitWeight: 15
      },
      pans: [{
        mode: 'count',
        category: '쿠키팬',
        type: '베이킹 팬',
        quantity: 30,
        panWeight: 15,
        divisionCount: 1,
        divisionWeight: 15,
        unitCount: 30,
        unitWeight: 15
      }]
    },
    yield: { quantity: 30, unit: '개' },
    ingredients: [
      { id: 'ing-1', name: '버터', amount: 150, unit: 'g', category: 'fat' },
      { id: 'ing-2', name: '슈가파우더', amount: 70, unit: 'g', category: 'sugar' },
      { id: 'ing-3', name: '소금', amount: 1, unit: 'g', category: 'salt' },
      { id: 'ing-4', name: '계란노른자', amount: 20, unit: 'g', category: 'egg' },
      { id: 'ing-5', name: '박력분', amount: 200, unit: 'g', category: 'flour', isFlour: true },
      { id: 'ing-6', name: '바닐라 익스트랙', amount: 3, unit: 'g', category: 'flavor' }
    ],
    steps: [
      { id: 'step-1', order: 1, instruction: '실온 버터를 크림화하기' },
      { id: 'step-2', order: 2, instruction: '슈가파우더와 소금 넣고 섞기' },
      { id: 'step-3', order: 3, instruction: '노른자와 바닐라 넣고 섞기' },
      { id: 'step-4', order: 4, instruction: '박력분 체쳐 넣고 가볍게 섞기' },
      { id: 'step-5', order: 5, instruction: '짤주머니에 넣어 원하는 모양으로 짜기' },
      { id: 'step-6', order: 6, instruction: '170도에서 12-15분 굽기' },
      { id: 'step-7', order: 7, instruction: '완전히 식혀서 밀폐 보관' }
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
