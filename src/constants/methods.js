/**
 * 제빵 제법 상수 정의 (가정용 베이킹 전용)
 * 전문가 자료 기반으로 검증됨
 */

export const METHODS = {
  STRAIGHT: {
    id: 'straight',
    name: '스트레이트법',
    description: '모든 재료를 한번에 혼합하는 기본 제법',
    fermentationTime: {
      primary: 120,
      secondary: 60
    },
    advantages: [
      '간단하고 빠른 제조',
      '일정한 품질 유지',
      '초보자도 쉽게 따라할 수 있음'
    ],
    disadvantages: [
      '풍미가 단순함',
      '노화가 빨리 진행됨'
    ],
    suitableFor: ['식빵', '롤빵', '머핀']
  },

  SPONGE: {
    id: 'sponge',
    name: '중종법',
    description: '밀가루의 일부로 먼저 중종을 만든 후 본반죽하는 제법',
    prefermentRatio: 0.7,
    fermentationTime: {
      sponge: '2-8시간',
      mainDough: '1-2시간'
    },
    advantages: [
      '부드러운 조직감',
      '향상된 풍미',
      '긴 유통기한',
      '좋은 부피'
    ],
    disadvantages: [
      '긴 제조 시간',
      '복잡한 공정'
    ],
    suitableFor: ['식빵', '브리오슈', '도넛', '스위트롤']
  },

  POOLISH: {
    id: 'poolish',
    name: '폴리쉬법',
    description: '동량의 밀가루와 물로 만든 묽은 전발효종을 사용하는 제법',
    prefermentRatio: 0.5,
    hydration: 1.0,
    fermentationTime: {
      poolish: '12-16시간',
      mainDough: '1-2시간'
    },
    advantages: [
      '복잡하고 깊은 풍미',
      '긴 유통기한',
      '좋은 크러스트 색상',
      '개방된 크럼 구조'
    ],
    disadvantages: [
      '긴 발효 시간',
      '온도 관리 중요'
    ],
    suitableFor: ['바게트', '치아바타', '포카치아']
  },

  BIGA: {
    id: 'biga',
    name: '비가법',
    description: '이탈리아식 된 전발효종을 사용하는 제법',
    prefermentRatio: 0.6,
    hydration: 0.5,
    fermentationTime: {
      biga: '16-24시간',
      mainDough: '1-2시간'
    },
    advantages: [
      '매우 복잡한 풍미',
      '우수한 보존성',
      '쫄깃한 식감'
    ],
    disadvantages: [
      '매우 긴 발효 시간',
      '다루기 어려운 반죽'
    ],
    suitableFor: ['치아바타', '포카치아', '이탈리안 브레드']
  },

  COLD_FERMENTATION: {
    id: 'coldFermentation',
    name: '저온숙성법',
    description: '냉장고에서 천천히 발효시키는 제법',
    fermentationTime: {
      cold: '12-24시간',
      room: '30-60분',
      final: '40-60분'
    },
    temperature: 4,
    advantages: [
      '깊고 복잡한 풍미',
      '작업 시간 유연성',
      '우수한 조직감',
      '긴 유통기한'
    ],
    disadvantages: [
      '긴 제조 시간',
      '냉장 공간 필요'
    ],
    suitableFor: ['피자도우', '바게트', '크루아상', '데니쉬']
  },

  TANGZHONG: {
    id: 'tangzhong',
    name: '탕종법',
    description: '밀가루 일부를 뜨거운 물로 호화시켜 사용 - 부드럽고 촉촉한 식빵',
    tangzhongRatio: 0.1,
    fermentationTime: {
      tangzhong: '식힐 때까지 (30-60분)',
      mainDough: '1-2시간',
      final: '40-60분'
    },
    advantages: [
      '엄청 부드럽고 촉촉함 (3-4일 지나도 부드러움)',
      '노화 방지 효과 탁월',
      '우유식빵, 생크림빵에 최적',
      '한국, 일본, 대만에서 가장 인기'
    ],
    disadvantages: [
      '탕종 만들기 단계 추가',
      '반드시 식혀서 사용해야 함'
    ],
    suitableFor: ['우유식빵', '생크림빵', '단팥빵', '소보로빵']
  },

  AUTOLYSE: {
    id: 'autolyse',
    name: '자가제분법',
    description: '밀가루와 물을 먼저 섞어 휴지 - 반죽이 쉽고 식감 좋음',
    autolyseTime: 30,
    fermentationTime: {
      autolyse: '30분 (실온 휴지)',
      mainDough: '1-2시간',
      final: '40-60분'
    },
    advantages: [
      '반죽이 엄청 쉬워짐 (글루텐 자연 형성)',
      '손반죽할 때 최고! (믹서 없어도 OK)',
      '반죽 시간 30% 단축',
      '식감이 쫄깃하고 부드러움'
    ],
    disadvantages: [
      '자가제분 휴지 시간 필요',
      '소금은 나중에 넣어야 함'
    ],
    suitableFor: ['바게트', '하드롤', '캄파뉴', '치아바타']
  },

  SOURDOUGH: {
    id: 'sourdough',
    name: '사워도우',
    description: '천연 발효종을 사용하는 전통 제법 - 풍미 최고, 건강에 좋음',
    starterRatio: 0.2,
    fermentationTime: {
      bulkFermentation: '4-6시간 (스트레치 앤 폴드 3-4회)',
      coldRetard: '12-48시간 (냉장, 선택사항)',
      final: '2-4시간'
    },
    advantages: [
      '풍미가 최고! 복합적이고 깊은 맛',
      '건강에 좋음 (소화 잘됨, GI 지수 낮음)',
      '천연 발효로 영양가 높음',
      '노화가 느림 (5-7일 보관 가능)'
    ],
    disadvantages: [
      '시간이 오래 걸림 (1-2일)',
      '스타터 관리 필요',
      '초보자에게는 어려울 수 있음'
    ],
    suitableFor: ['사워도우브레드', '캄파뉴', '컨트리 브레드', '호밀빵']
  }
}

/**
 * 제법 선택 가이드 (가정용 베이킹 기준)
 */
export const METHOD_SELECTION_GUIDE = {
  timeAvailable: {
    short: ['straight'],
    medium: ['sponge', 'tangzhong', 'autolyse'],
    long: ['poolish', 'biga', 'coldFermentation', 'sourdough']
  },

  texturePreference: {
    soft: ['tangzhong', 'coldFermentation', 'sponge'],
    chewy: ['autolyse', 'poolish', 'biga'],
    crispy: ['poolish', 'biga', 'sourdough']
  },

  flavorPreference: {
    mild: ['straight', 'tangzhong'],
    moderate: ['sponge', 'autolyse'],
    complex: ['poolish', 'biga', 'coldFermentation', 'sourdough']
  },

  skillLevel: {
    beginner: ['straight', 'tangzhong', 'autolyse'],
    intermediate: ['sponge', 'coldFermentation', 'poolish'],
    advanced: ['biga', 'sourdough']
  },

  purpose: {
    softBread: ['tangzhong', 'sponge', 'coldFermentation'],
    crustBread: ['autolyse', 'poolish', 'biga', 'sourdough'],
    easyKneading: ['autolyse', 'tangzhong'],
    bestFlavor: ['sourdough', 'biga', 'poolish'],
    scheduling: ['coldFermentation']
  }
}

export default METHODS
