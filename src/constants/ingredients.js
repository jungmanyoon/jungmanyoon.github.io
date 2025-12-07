/**
 * 재료 데이터 상수 정의
 * 제과제빵 재료의 특성과 분류
 */

export const INGREDIENT_TYPES = {
  FLOUR: 'flour',
  LIQUID: 'liquid',
  FAT: 'fat',
  SUGAR: 'sugar',
  SALT: 'salt',
  YEAST: 'yeast',
  EGG: 'egg',
  DAIRY: 'dairy',
  FLAVORING: 'flavoring',
  ADDITIVE: 'additive',
  FRUIT: 'fruit',
  NUT: 'nut',
  CHOCOLATE: 'chocolate'
}

export const COMMON_INGREDIENTS = {
  // 밀가루류
  BREAD_FLOUR: {
    id: 'bread_flour',
    name: '강력분',
    type: INGREDIENT_TYPES.FLOUR,
    protein: 12.5, // %
    moisture: 14,
    density: 0.52, // g/ml
    alternatives: ['all_purpose_flour'],
    conversionRatio: {
      all_purpose_flour: 1.05 // 중력분 사용시 5% 증량
    }
  },

  ALL_PURPOSE_FLOUR: {
    id: 'all_purpose_flour',
    name: '중력분',
    type: INGREDIENT_TYPES.FLOUR,
    protein: 10.5,
    moisture: 14,
    density: 0.52,
    alternatives: ['bread_flour', 'cake_flour'],
    conversionRatio: {
      bread_flour: 0.95,
      cake_flour: 1.1
    }
  },

  CAKE_FLOUR: {
    id: 'cake_flour',
    name: '박력분',
    type: INGREDIENT_TYPES.FLOUR,
    protein: 8.5,
    moisture: 14,
    density: 0.48,
    alternatives: ['all_purpose_flour'],
    conversionRatio: {
      all_purpose_flour: 0.9
    }
  },

  WHOLE_WHEAT_FLOUR: {
    id: 'whole_wheat_flour',
    name: '통밀가루',
    type: INGREDIENT_TYPES.FLOUR,
    protein: 13.5,
    moisture: 14,
    density: 0.48,
    absorption: 1.3, // 일반 밀가루 대비 수분 흡수율
    maxSubstitution: 0.5 // 최대 50%까지 대체 권장
  },

  RYE_FLOUR: {
    id: 'rye_flour',
    name: '호밀가루',
    type: INGREDIENT_TYPES.FLOUR,
    protein: 9.0,
    moisture: 14,
    density: 0.5,
    absorption: 1.2,
    maxSubstitution: 0.4
  },

  // 액체류
  WATER: {
    id: 'water',
    name: '물',
    type: INGREDIENT_TYPES.LIQUID,
    density: 1.0,
    freezingPoint: 0,
    boilingPoint: 100
  },

  MILK: {
    id: 'milk',
    name: '우유',
    type: INGREDIENT_TYPES.LIQUID,
    density: 1.03,
    fat: 3.5, // %
    protein: 3.2,
    alternatives: ['water', 'soy_milk'],
    conversionRatio: {
      water: 0.87, // 우유를 물로 대체시 13% 감량
      soy_milk: 1.0
    }
  },

  // 유지류
  BUTTER: {
    id: 'butter',
    name: '버터',
    type: INGREDIENT_TYPES.FAT,
    fat: 82,
    water: 16,
    meltingPoint: 32,
    alternatives: ['margarine', 'oil'],
    conversionRatio: {
      margarine: 1.0,
      oil: 0.8 // 버터를 오일로 대체시 20% 감량
    }
  },

  OIL: {
    id: 'oil',
    name: '식용유',
    type: INGREDIENT_TYPES.FAT,
    fat: 100,
    density: 0.92,
    alternatives: ['butter', 'margarine'],
    conversionRatio: {
      butter: 1.25,
      margarine: 1.25
    }
  },

  // 당류
  GRANULATED_SUGAR: {
    id: 'granulated_sugar',
    name: '설탕',
    type: INGREDIENT_TYPES.SUGAR,
    sweetness: 100, // 기준
    density: 0.85,
    alternatives: ['brown_sugar', 'honey'],
    conversionRatio: {
      brown_sugar: 1.0,
      honey: 0.75
    }
  },

  BROWN_SUGAR: {
    id: 'brown_sugar',
    name: '황설탕',
    type: INGREDIENT_TYPES.SUGAR,
    sweetness: 97,
    moisture: 3.5,
    density: 0.72,
    alternatives: ['granulated_sugar'],
    conversionRatio: {
      granulated_sugar: 1.0
    }
  },

  HONEY: {
    id: 'honey',
    name: '꿀',
    type: INGREDIENT_TYPES.SUGAR,
    sweetness: 130,
    moisture: 17,
    density: 1.42,
    liquidAdjustment: 0.2 // 꿀 사용시 액체 20% 감소
  },

  // 이스트
  INSTANT_YEAST: {
    id: 'instant_yeast',
    name: '인스턴트 이스트',
    type: INGREDIENT_TYPES.YEAST,
    activity: 100,
    alternatives: ['active_dry_yeast', 'fresh_yeast'],
    conversionRatio: {
      active_dry_yeast: 1.25,
      fresh_yeast: 3.0
    }
  },

  ACTIVE_DRY_YEAST: {
    id: 'active_dry_yeast',
    name: '활성 건조 이스트',
    type: INGREDIENT_TYPES.YEAST,
    activity: 80,
    needsActivation: true,
    alternatives: ['instant_yeast', 'fresh_yeast'],
    conversionRatio: {
      instant_yeast: 0.8,
      fresh_yeast: 2.5
    }
  },

  FRESH_YEAST: {
    id: 'fresh_yeast',
    name: '생이스트',
    type: INGREDIENT_TYPES.YEAST,
    activity: 33,
    moisture: 70,
    shelfLife: 14, // days
    alternatives: ['instant_yeast', 'active_dry_yeast'],
    conversionRatio: {
      instant_yeast: 0.33,
      active_dry_yeast: 0.4
    }
  },

  // 계란
  WHOLE_EGG: {
    id: 'whole_egg',
    name: '전란',
    type: INGREDIENT_TYPES.EGG,
    averageWeight: 50, // g
    components: {
      white: 30,
      yolk: 20
    },
    protein: 12.5,
    fat: 10.5
  },

  EGG_WHITE: {
    id: 'egg_white',
    name: '난백',
    type: INGREDIENT_TYPES.EGG,
    averageWeight: 30,
    protein: 10.5,
    foam: true
  },

  EGG_YOLK: {
    id: 'egg_yolk',
    name: '난황',
    type: INGREDIENT_TYPES.EGG,
    averageWeight: 20,
    fat: 32,
    lecithin: true // 유화제
  },

  // 소금
  SALT: {
    id: 'salt',
    name: '소금',
    type: INGREDIENT_TYPES.SALT,
    density: 1.2,
    iodized: true,
    strengthenGluten: true
  },

  // 유제품
  HEAVY_CREAM: {
    id: 'heavy_cream',
    name: '생크림',
    type: INGREDIENT_TYPES.DAIRY,
    fat: 35,
    whippable: true,
    density: 0.98
  },

  CREAM_CHEESE: {
    id: 'cream_cheese',
    name: '크림치즈',
    type: INGREDIENT_TYPES.DAIRY,
    fat: 33,
    moisture: 55,
    density: 1.1
  }
}

/**
 * 재료 특성별 분류
 */
export const INGREDIENT_PROPERTIES = {
  // 글루텐 형성 영향
  glutenAffecting: {
    strengthen: ['salt', 'ascorbic_acid'],
    weaken: ['sugar', 'fat', 'milk_powder'],
    neutral: ['water', 'yeast']
  },

  // 발효 영향
  fermentationAffecting: {
    accelerate: ['sugar', 'malt', 'honey'],
    inhibit: ['salt', 'cinnamon', 'excess_sugar'],
    neutral: ['flour', 'water']
  },

  // 보존성 영향
  preservationAffecting: {
    extend: ['sugar', 'salt', 'honey', 'vinegar'],
    reduce: ['milk', 'egg', 'fresh_fruit'],
    neutral: ['flour', 'water']
  }
}

/**
 * 재료 대체 규칙
 */
export const SUBSTITUTION_RULES = {
  // 알레르기 대체
  allergyFree: {
    gluten: {
      wheat_flour: ['rice_flour', 'almond_flour', 'corn_flour']
    },
    dairy: {
      milk: ['soy_milk', 'almond_milk', 'oat_milk'],
      butter: ['coconut_oil', 'vegetable_oil']
    },
    egg: {
      whole_egg: ['flax_egg', 'chia_egg', 'applesauce']
    }
  },

  // 비건 대체
  vegan: {
    milk: 'plant_milk',
    butter: 'vegan_butter',
    egg: 'egg_replacer',
    honey: 'maple_syrup'
  },

  // 저당 대체
  lowSugar: {
    sugar: ['stevia', 'erythritol', 'monk_fruit'],
    honey: 'sugar_free_syrup'
  }
}

/**
 * 재료별 측정 단위 변환
 */
export const UNIT_CONVERSIONS = {
  volume_to_weight: {
    flour: {
      cup: 120, // g
      tablespoon: 8,
      teaspoon: 3
    },
    sugar: {
      cup: 200,
      tablespoon: 12.5,
      teaspoon: 4
    },
    butter: {
      cup: 227,
      tablespoon: 14,
      teaspoon: 5
    }
  },

  metric_to_imperial: {
    gram_to_ounce: 0.035274,
    ml_to_floz: 0.033814,
    celsius_to_fahrenheit: (c) => (c * 9/5) + 32
  }
}

export default COMMON_INGREDIENTS