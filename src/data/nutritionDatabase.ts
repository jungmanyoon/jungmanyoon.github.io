/**
 * 제과제빵 재료 영양 정보 데이터베이스
 * 100g 기준 영양 성분
 */

export interface NutritionData {
  name: string
  nameKo: string
  calories: number      // kcal
  protein: number       // g
  carbohydrates: number // g
  fat: number          // g
  fiber: number        // g
  sugar: number        // g
  sodium: number       // mg
  cholesterol: number  // mg
  saturatedFat?: number // g
  transFat?: number    // g
  calcium?: number     // mg
  iron?: number        // mg
  vitaminA?: number    // IU
  vitaminC?: number    // mg
}

// 제과제빵 재료 영양 데이터베이스
export const nutritionDatabase: Record<string, NutritionData> = {
  // === 밀가루류 ===
  '강력분': {
    name: 'bread_flour',
    nameKo: '강력분',
    calories: 361,
    protein: 11.7,
    carbohydrates: 75.3,
    fat: 1.2,
    fiber: 2.7,
    sugar: 0.3,
    sodium: 2,
    cholesterol: 0,
    calcium: 15,
    iron: 1.2
  },
  '중력분': {
    name: 'all_purpose_flour',
    nameKo: '중력분',
    calories: 364,
    protein: 10.3,
    carbohydrates: 76.3,
    fat: 1.0,
    fiber: 2.7,
    sugar: 0.3,
    sodium: 2,
    cholesterol: 0
  },
  '박력분': {
    name: 'cake_flour',
    nameKo: '박력분',
    calories: 362,
    protein: 8.3,
    carbohydrates: 78.3,
    fat: 0.9,
    fiber: 2.4,
    sugar: 0.3,
    sodium: 2,
    cholesterol: 0
  },
  '통밀가루': {
    name: 'whole_wheat_flour',
    nameKo: '통밀가루',
    calories: 340,
    protein: 13.2,
    carbohydrates: 71.9,
    fat: 2.5,
    fiber: 10.7,
    sugar: 0.4,
    sodium: 2,
    cholesterol: 0,
    iron: 3.6
  },
  '호밀가루': {
    name: 'rye_flour',
    nameKo: '호밀가루',
    calories: 349,
    protein: 9.8,
    carbohydrates: 75.9,
    fat: 1.3,
    fiber: 11.8,
    sugar: 0.9,
    sodium: 2,
    cholesterol: 0
  },
  '쌀가루': {
    name: 'rice_flour',
    nameKo: '쌀가루',
    calories: 366,
    protein: 5.9,
    carbohydrates: 80.1,
    fat: 1.4,
    fiber: 2.4,
    sugar: 0.1,
    sodium: 0,
    cholesterol: 0
  },
  '찹쌀가루': {
    name: 'glutinous_rice_flour',
    nameKo: '찹쌀가루',
    calories: 370,
    protein: 6.8,
    carbohydrates: 81.7,
    fat: 0.6,
    fiber: 2.8,
    sugar: 0.1,
    sodium: 0,
    cholesterol: 0
  },
  '아몬드가루': {
    name: 'almond_flour',
    nameKo: '아몬드가루',
    calories: 579,
    protein: 21.2,
    carbohydrates: 21.5,
    fat: 49.9,
    fiber: 12.5,
    sugar: 4.4,
    sodium: 1,
    cholesterol: 0
  },
  '코코넛가루': {
    name: 'coconut_flour',
    nameKo: '코코넛가루',
    calories: 443,
    protein: 19.3,
    carbohydrates: 60.0,
    fat: 14.1,
    fiber: 39.0,
    sugar: 8.0,
    sodium: 32,
    cholesterol: 0
  },
  '옥수수전분': {
    name: 'corn_starch',
    nameKo: '옥수수전분',
    calories: 381,
    protein: 0.3,
    carbohydrates: 91.3,
    fat: 0.1,
    fiber: 0.9,
    sugar: 0,
    sodium: 9,
    cholesterol: 0
  },
  '타피오카전분': {
    name: 'tapioca_starch',
    nameKo: '타피오카전분',
    calories: 358,
    protein: 0.2,
    carbohydrates: 88.7,
    fat: 0.0,
    fiber: 0.9,
    sugar: 3.4,
    sodium: 1,
    cholesterol: 0
  },
  '감자전분': {
    name: 'potato_starch',
    nameKo: '감자전분',
    calories: 333,
    protein: 0.1,
    carbohydrates: 83.1,
    fat: 0.0,
    fiber: 0.0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0
  },

  // === 당류 ===
  '설탕': {
    name: 'sugar',
    nameKo: '설탕',
    calories: 387,
    protein: 0,
    carbohydrates: 99.9,
    fat: 0,
    fiber: 0,
    sugar: 99.9,
    sodium: 1,
    cholesterol: 0
  },
  '황설탕': {
    name: 'brown_sugar',
    nameKo: '황설탕',
    calories: 380,
    protein: 0.1,
    carbohydrates: 98.1,
    fat: 0,
    fiber: 0,
    sugar: 97.3,
    sodium: 28,
    cholesterol: 0,
    calcium: 83
  },
  '꿀': {
    name: 'honey',
    nameKo: '꿀',
    calories: 304,
    protein: 0.3,
    carbohydrates: 82.4,
    fat: 0,
    fiber: 0.2,
    sugar: 82.1,
    sodium: 4,
    cholesterol: 0
  },
  '메이플시럽': {
    name: 'maple_syrup',
    nameKo: '메이플시럽',
    calories: 260,
    protein: 0.1,
    carbohydrates: 67.0,
    fat: 0.1,
    fiber: 0,
    sugar: 60.5,
    sodium: 12,
    cholesterol: 0,
    calcium: 102
  },
  '흑설탕': {
    name: 'dark_brown_sugar',
    nameKo: '흑설탕',
    calories: 377,
    protein: 0.1,
    carbohydrates: 97.3,
    fat: 0,
    fiber: 0,
    sugar: 96.2,
    sodium: 39,
    cholesterol: 0,
    calcium: 85
  },
  '슈가파우더': {
    name: 'powdered_sugar',
    nameKo: '슈가파우더',
    calories: 389,
    protein: 0,
    carbohydrates: 99.8,
    fat: 0,
    fiber: 0,
    sugar: 97.8,
    sodium: 1,
    cholesterol: 0
  },
  '물엿': {
    name: 'corn_syrup',
    nameKo: '물엿',
    calories: 286,
    protein: 0,
    carbohydrates: 77.0,
    fat: 0,
    fiber: 0,
    sugar: 35.0,
    sodium: 55,
    cholesterol: 0
  },
  '조청': {
    name: 'rice_syrup',
    nameKo: '조청',
    calories: 316,
    protein: 0.3,
    carbohydrates: 85.5,
    fat: 0,
    fiber: 0,
    sugar: 48.0,
    sodium: 6,
    cholesterol: 0
  },
  '올리고당': {
    name: 'oligosaccharide',
    nameKo: '올리고당',
    calories: 240,
    protein: 0,
    carbohydrates: 80.0,
    fat: 0,
    fiber: 0,
    sugar: 30.0,
    sodium: 0,
    cholesterol: 0
  },
  '트레할로스': {
    name: 'trehalose',
    nameKo: '트레할로스',
    calories: 380,
    protein: 0,
    carbohydrates: 100,
    fat: 0,
    fiber: 0,
    sugar: 100,
    sodium: 0,
    cholesterol: 0
  },

  // === 유지류 ===
  '버터': {
    name: 'butter',
    nameKo: '버터',
    calories: 717,
    protein: 0.9,
    carbohydrates: 0.1,
    fat: 81.1,
    fiber: 0,
    sugar: 0.1,
    sodium: 11,
    cholesterol: 215,
    saturatedFat: 51.4,
    vitaminA: 2499
  },
  '마가린': {
    name: 'margarine',
    nameKo: '마가린',
    calories: 719,
    protein: 0.2,
    carbohydrates: 0.9,
    fat: 80.5,
    fiber: 0,
    sugar: 0,
    sodium: 751,
    cholesterol: 0,
    saturatedFat: 13.0,
    transFat: 14.9
  },
  '쇼트닝': {
    name: 'shortening',
    nameKo: '쇼트닝',
    calories: 884,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    saturatedFat: 25.0
  },
  '올리브오일': {
    name: 'olive_oil',
    nameKo: '올리브오일',
    calories: 884,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 2,
    cholesterol: 0,
    saturatedFat: 13.8
  },
  '올리브유': {
    name: 'olive_oil',
    nameKo: '올리브유',
    calories: 884,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 2,
    cholesterol: 0,
    saturatedFat: 13.8
  },
  '무염버터': {
    name: 'unsalted_butter',
    nameKo: '무염버터',
    calories: 717,
    protein: 0.9,
    carbohydrates: 0.1,
    fat: 81.1,
    fiber: 0,
    sugar: 0.1,
    sodium: 11,
    cholesterol: 215,
    saturatedFat: 51.4
  },
  '가염버터': {
    name: 'salted_butter',
    nameKo: '가염버터',
    calories: 717,
    protein: 0.9,
    carbohydrates: 0.1,
    fat: 81.1,
    fiber: 0,
    sugar: 0.1,
    sodium: 643,
    cholesterol: 215,
    saturatedFat: 51.4
  },
  '식용유': {
    name: 'vegetable_oil',
    nameKo: '식용유',
    calories: 884,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0
  },
  '포도씨유': {
    name: 'grapeseed_oil',
    nameKo: '포도씨유',
    calories: 884,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0
  },
  '코코넛오일': {
    name: 'coconut_oil',
    nameKo: '코코넛오일',
    calories: 862,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    saturatedFat: 82.5
  },
  '라드': {
    name: 'lard',
    nameKo: '라드',
    calories: 902,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 95,
    saturatedFat: 39.2
  },

  // === 유제품 ===
  '우유': {
    name: 'milk',
    nameKo: '우유',
    calories: 61,
    protein: 3.2,
    carbohydrates: 4.8,
    fat: 3.3,
    fiber: 0,
    sugar: 5.1,
    sodium: 43,
    cholesterol: 10,
    calcium: 113
  },
  '생크림': {
    name: 'heavy_cream',
    nameKo: '생크림',
    calories: 345,
    protein: 2.1,
    carbohydrates: 2.8,
    fat: 37.0,
    fiber: 0,
    sugar: 2.9,
    sodium: 38,
    cholesterol: 137,
    saturatedFat: 23.0
  },
  '크림치즈': {
    name: 'cream_cheese',
    nameKo: '크림치즈',
    calories: 342,
    protein: 5.9,
    carbohydrates: 4.1,
    fat: 34.2,
    fiber: 0,
    sugar: 3.2,
    sodium: 321,
    cholesterol: 110,
    saturatedFat: 19.3
  },
  '요거트': {
    name: 'yogurt',
    nameKo: '요거트',
    calories: 59,
    protein: 3.5,
    carbohydrates: 4.7,
    fat: 3.3,
    fiber: 0,
    sugar: 4.7,
    sodium: 46,
    cholesterol: 13,
    calcium: 121
  },
  '그릭요거트': {
    name: 'greek_yogurt',
    nameKo: '그릭요거트',
    calories: 97,
    protein: 9.0,
    carbohydrates: 3.6,
    fat: 5.0,
    fiber: 0,
    sugar: 3.2,
    sodium: 36,
    cholesterol: 14
  },
  '사워크림': {
    name: 'sour_cream',
    nameKo: '사워크림',
    calories: 193,
    protein: 2.4,
    carbohydrates: 4.6,
    fat: 19.4,
    fiber: 0,
    sugar: 3.5,
    sodium: 80,
    cholesterol: 52
  },
  '마스카포네': {
    name: 'mascarpone',
    nameKo: '마스카포네',
    calories: 429,
    protein: 4.8,
    carbohydrates: 3.6,
    fat: 44.6,
    fiber: 0,
    sugar: 3.5,
    sodium: 41,
    cholesterol: 140
  },
  '리코타치즈': {
    name: 'ricotta_cheese',
    nameKo: '리코타치즈',
    calories: 174,
    protein: 11.3,
    carbohydrates: 3.0,
    fat: 13.0,
    fiber: 0,
    sugar: 0.3,
    sodium: 84,
    cholesterol: 51
  },
  '버터밀크': {
    name: 'buttermilk',
    nameKo: '버터밀크',
    calories: 40,
    protein: 3.3,
    carbohydrates: 4.8,
    fat: 0.9,
    fiber: 0,
    sugar: 4.8,
    sodium: 105,
    cholesterol: 4
  },
  '탈지분유': {
    name: 'skim_milk_powder',
    nameKo: '탈지분유',
    calories: 362,
    protein: 36.2,
    carbohydrates: 52.0,
    fat: 0.8,
    fiber: 0,
    sugar: 52.0,
    sodium: 535,
    cholesterol: 18
  },
  '두유': {
    name: 'soy_milk',
    nameKo: '두유',
    calories: 54,
    protein: 3.3,
    carbohydrates: 6.3,
    fat: 1.8,
    fiber: 0.6,
    sugar: 4.0,
    sodium: 51,
    cholesterol: 0
  },
  '아몬드우유': {
    name: 'almond_milk',
    nameKo: '아몬드우유',
    calories: 17,
    protein: 0.6,
    carbohydrates: 2.5,
    fat: 0.6,
    fiber: 0.2,
    sugar: 0,
    sodium: 67,
    cholesterol: 0
  },
  '귀리우유': {
    name: 'oat_milk',
    nameKo: '귀리우유',
    calories: 47,
    protein: 1.0,
    carbohydrates: 9.3,
    fat: 1.5,
    fiber: 0.8,
    sugar: 4.0,
    sodium: 40,
    cholesterol: 0
  },
  '코코넛밀크': {
    name: 'coconut_milk',
    nameKo: '코코넛밀크',
    calories: 230,
    protein: 2.3,
    carbohydrates: 5.5,
    fat: 23.8,
    fiber: 2.2,
    sugar: 3.3,
    sodium: 15,
    cholesterol: 0
  },
  '연유': {
    name: 'condensed_milk',
    nameKo: '연유',
    calories: 321,
    protein: 7.9,
    carbohydrates: 54.4,
    fat: 8.7,
    fiber: 0,
    sugar: 54.4,
    sodium: 127,
    cholesterol: 34
  },

  // === 계란 ===
  '계란': {
    name: 'egg',
    nameKo: '계란',
    calories: 155,
    protein: 13.0,
    carbohydrates: 1.1,
    fat: 10.6,
    fiber: 0,
    sugar: 1.1,
    sodium: 124,
    cholesterol: 373,
    saturatedFat: 3.1,
    iron: 1.8
  },
  '계란흰자': {
    name: 'egg_white',
    nameKo: '계란흰자',
    calories: 52,
    protein: 10.9,
    carbohydrates: 0.7,
    fat: 0.2,
    fiber: 0,
    sugar: 0.7,
    sodium: 166,
    cholesterol: 0
  },
  '계란노른자': {
    name: 'egg_yolk',
    nameKo: '계란노른자',
    calories: 322,
    protein: 15.9,
    carbohydrates: 3.6,
    fat: 26.5,
    fiber: 0,
    sugar: 0.6,
    sodium: 48,
    cholesterol: 1085,
    saturatedFat: 9.6
  },

  // === 견과류 ===
  '아몬드': {
    name: 'almond',
    nameKo: '아몬드',
    calories: 579,
    protein: 21.2,
    carbohydrates: 21.6,
    fat: 49.9,
    fiber: 12.5,
    sugar: 4.4,
    sodium: 1,
    cholesterol: 0,
    calcium: 269,
    iron: 3.7
  },
  '호두': {
    name: 'walnut',
    nameKo: '호두',
    calories: 654,
    protein: 15.2,
    carbohydrates: 13.7,
    fat: 65.2,
    fiber: 6.7,
    sugar: 2.6,
    sodium: 2,
    cholesterol: 0
  },
  '피스타치오': {
    name: 'pistachio',
    nameKo: '피스타치오',
    calories: 560,
    protein: 20.2,
    carbohydrates: 27.2,
    fat: 45.3,
    fiber: 10.6,
    sugar: 7.7,
    sodium: 1,
    cholesterol: 0
  },

  // === 초콜릿 ===
  '다크초콜릿': {
    name: 'dark_chocolate',
    nameKo: '다크초콜릿',
    calories: 546,
    protein: 4.9,
    carbohydrates: 61.2,
    fat: 31.3,
    fiber: 7.0,
    sugar: 47.9,
    sodium: 24,
    cholesterol: 3,
    saturatedFat: 18.5
  },
  '밀크초콜릿': {
    name: 'milk_chocolate',
    nameKo: '밀크초콜릿',
    calories: 535,
    protein: 7.6,
    carbohydrates: 59.4,
    fat: 29.7,
    fiber: 3.4,
    sugar: 51.5,
    sodium: 79,
    cholesterol: 23,
    saturatedFat: 18.5
  },
  '코코아파우더': {
    name: 'cocoa_powder',
    nameKo: '코코아파우더',
    calories: 228,
    protein: 19.6,
    carbohydrates: 57.9,
    fat: 13.7,
    fiber: 33.2,
    sugar: 1.8,
    sodium: 21,
    cholesterol: 0
  },

  // === 팽창제 ===
  '이스트': {
    name: 'yeast',
    nameKo: '이스트',
    calories: 325,
    protein: 40.4,
    carbohydrates: 41.2,
    fat: 7.6,
    fiber: 26.9,
    sugar: 0,
    sodium: 51,
    cholesterol: 0
  },
  '인스턴트이스트': {
    name: 'instant_yeast',
    nameKo: '인스턴트이스트',
    calories: 325,
    protein: 40.4,
    carbohydrates: 41.2,
    fat: 7.6,
    fiber: 26.9,
    sugar: 0,
    sodium: 51,
    cholesterol: 0
  },
  '드라이이스트': {
    name: 'active_dry_yeast',
    nameKo: '드라이이스트',
    calories: 325,
    protein: 40.4,
    carbohydrates: 41.2,
    fat: 7.6,
    fiber: 26.9,
    sugar: 0,
    sodium: 51,
    cholesterol: 0
  },
  '생이스트': {
    name: 'fresh_yeast',
    nameKo: '생이스트',
    calories: 105,
    protein: 8.4,
    carbohydrates: 18.1,
    fat: 1.9,
    fiber: 8.0,
    sugar: 0,
    sodium: 16,
    cholesterol: 0
  },
  '베이킹소다': {
    name: 'baking_soda',
    nameKo: '베이킹소다',
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 27360,
    cholesterol: 0
  },
  '베이킹파우더': {
    name: 'baking_powder',
    nameKo: '베이킹파우더',
    calories: 53,
    protein: 0,
    carbohydrates: 27.7,
    fat: 0,
    fiber: 0.2,
    sugar: 0,
    sodium: 10600,
    cholesterol: 0
  },
  '소금': {
    name: 'salt',
    nameKo: '소금',
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 38758,
    cholesterol: 0
  },
  '바닐라추출물': {
    name: 'vanilla_extract',
    nameKo: '바닐라추출물',
    calories: 288,
    protein: 0.1,
    carbohydrates: 12.7,
    fat: 0.1,
    fiber: 0,
    sugar: 12.7,
    sodium: 9,
    cholesterol: 0
  },
  '바닐라익스트랙': {
    name: 'vanilla_extract',
    nameKo: '바닐라익스트랙',
    calories: 288,
    protein: 0.1,
    carbohydrates: 12.7,
    fat: 0.1,
    fiber: 0,
    sugar: 12.7,
    sodium: 9,
    cholesterol: 0
  },
  '천일염': {
    name: 'sea_salt',
    nameKo: '천일염',
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 37800,
    cholesterol: 0
  },

  // === 과일류 ===
  '건포도': {
    name: 'raisins',
    nameKo: '건포도',
    calories: 299,
    protein: 3.1,
    carbohydrates: 79.2,
    fat: 0.5,
    fiber: 3.7,
    sugar: 59.2,
    sodium: 11,
    cholesterol: 0
  },
  '건크랜베리': {
    name: 'dried_cranberry',
    nameKo: '건크랜베리',
    calories: 308,
    protein: 0.1,
    carbohydrates: 82.4,
    fat: 1.4,
    fiber: 5.7,
    sugar: 65.0,
    sodium: 3,
    cholesterol: 0
  },
  '건블루베리': {
    name: 'dried_blueberry',
    nameKo: '건블루베리',
    calories: 317,
    protein: 2.5,
    carbohydrates: 80.0,
    fat: 1.0,
    fiber: 7.0,
    sugar: 67.0,
    sodium: 2,
    cholesterol: 0
  },
  '사과': {
    name: 'apple',
    nameKo: '사과',
    calories: 52,
    protein: 0.3,
    carbohydrates: 13.8,
    fat: 0.2,
    fiber: 2.4,
    sugar: 10.4,
    sodium: 1,
    cholesterol: 0
  },
  '바나나': {
    name: 'banana',
    nameKo: '바나나',
    calories: 89,
    protein: 1.1,
    carbohydrates: 22.8,
    fat: 0.3,
    fiber: 2.6,
    sugar: 12.2,
    sodium: 1,
    cholesterol: 0
  },
  '딸기': {
    name: 'strawberry',
    nameKo: '딸기',
    calories: 32,
    protein: 0.7,
    carbohydrates: 7.7,
    fat: 0.3,
    fiber: 2.0,
    sugar: 4.9,
    sodium: 1,
    cholesterol: 0
  },
  '블루베리': {
    name: 'blueberry',
    nameKo: '블루베리',
    calories: 57,
    protein: 0.7,
    carbohydrates: 14.5,
    fat: 0.3,
    fiber: 2.4,
    sugar: 10.0,
    sodium: 1,
    cholesterol: 0
  },
  '오렌지필': {
    name: 'candied_orange_peel',
    nameKo: '오렌지필',
    calories: 300,
    protein: 0.5,
    carbohydrates: 75.0,
    fat: 0.2,
    fiber: 2.5,
    sugar: 65.0,
    sodium: 10,
    cholesterol: 0
  },

  // === 추가 견과류 ===
  '피칸': {
    name: 'pecan',
    nameKo: '피칸',
    calories: 691,
    protein: 9.2,
    carbohydrates: 13.9,
    fat: 72.0,
    fiber: 9.6,
    sugar: 4.0,
    sodium: 0,
    cholesterol: 0
  },
  '헤이즐넛': {
    name: 'hazelnut',
    nameKo: '헤이즐넛',
    calories: 628,
    protein: 15.0,
    carbohydrates: 16.7,
    fat: 60.8,
    fiber: 9.7,
    sugar: 4.3,
    sodium: 0,
    cholesterol: 0
  },
  '캐슈넛': {
    name: 'cashew',
    nameKo: '캐슈넛',
    calories: 553,
    protein: 18.2,
    carbohydrates: 30.2,
    fat: 43.8,
    fiber: 3.3,
    sugar: 5.9,
    sodium: 12,
    cholesterol: 0
  },
  '마카다미아': {
    name: 'macadamia',
    nameKo: '마카다미아',
    calories: 718,
    protein: 7.9,
    carbohydrates: 13.8,
    fat: 75.8,
    fiber: 8.6,
    sugar: 4.6,
    sodium: 5,
    cholesterol: 0
  },
  '땅콩': {
    name: 'peanut',
    nameKo: '땅콩',
    calories: 567,
    protein: 25.8,
    carbohydrates: 16.1,
    fat: 49.2,
    fiber: 8.5,
    sugar: 4.7,
    sodium: 18,
    cholesterol: 0
  },

  // === 추가 초콜릿 ===
  '화이트초콜릿': {
    name: 'white_chocolate',
    nameKo: '화이트초콜릿',
    calories: 539,
    protein: 5.9,
    carbohydrates: 59.2,
    fat: 32.1,
    fiber: 0,
    sugar: 59.0,
    sodium: 90,
    cholesterol: 21
  },
  '초코칩': {
    name: 'chocolate_chips',
    nameKo: '초코칩',
    calories: 479,
    protein: 4.5,
    carbohydrates: 62.5,
    fat: 24.5,
    fiber: 6.0,
    sugar: 52.0,
    sodium: 24,
    cholesterol: 3
  },
  '카카오닙스': {
    name: 'cacao_nibs',
    nameKo: '카카오닙스',
    calories: 228,
    protein: 14.3,
    carbohydrates: 34.7,
    fat: 42.6,
    fiber: 33.0,
    sugar: 0,
    sodium: 21,
    cholesterol: 0
  },
  '카카오버터': {
    name: 'cocoa_butter',
    nameKo: '카카오버터',
    calories: 884,
    protein: 0,
    carbohydrates: 0,
    fat: 100,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0
  },

  // === 기타 ===
  '젤라틴': {
    name: 'gelatin',
    nameKo: '젤라틴',
    calories: 335,
    protein: 85.6,
    carbohydrates: 0,
    fat: 0.1,
    fiber: 0,
    sugar: 0,
    sodium: 196,
    cholesterol: 0
  },
  '한천': {
    name: 'agar',
    nameKo: '한천',
    calories: 26,
    protein: 0.5,
    carbohydrates: 6.8,
    fat: 0,
    fiber: 0.5,
    sugar: 0,
    sodium: 9,
    cholesterol: 0
  },
  '펙틴': {
    name: 'pectin',
    nameKo: '펙틴',
    calories: 325,
    protein: 0,
    carbohydrates: 89.0,
    fat: 0,
    fiber: 89.0,
    sugar: 0,
    sodium: 200,
    cholesterol: 0
  },
  '몰트': {
    name: 'malt',
    nameKo: '몰트',
    calories: 318,
    protein: 6.0,
    carbohydrates: 71.0,
    fat: 1.9,
    fiber: 0,
    sugar: 45.0,
    sodium: 35,
    cholesterol: 0
  },
  '시나몬': {
    name: 'cinnamon',
    nameKo: '시나몬',
    calories: 247,
    protein: 4.0,
    carbohydrates: 80.6,
    fat: 1.2,
    fiber: 53.1,
    sugar: 2.2,
    sodium: 10,
    cholesterol: 0
  },
  '녹차가루': {
    name: 'matcha',
    nameKo: '녹차가루',
    calories: 324,
    protein: 29.6,
    carbohydrates: 38.9,
    fat: 5.3,
    fiber: 38.5,
    sugar: 0,
    sodium: 32,
    cholesterol: 0
  },
  '레몬즙': {
    name: 'lemon_juice',
    nameKo: '레몬즙',
    calories: 22,
    protein: 0.4,
    carbohydrates: 6.9,
    fat: 0.2,
    fiber: 0.3,
    sugar: 2.5,
    sodium: 1,
    cholesterol: 0
  }
}

/**
 * 재료명으로 영양 정보 조회
 */
export function getNutritionData(ingredientName: string): NutritionData | null {
  // 정확한 매칭 먼저 시도
  if (nutritionDatabase[ingredientName]) {
    return nutritionDatabase[ingredientName]
  }
  
  // 부분 매칭 시도
  for (const [key, value] of Object.entries(nutritionDatabase)) {
    if (ingredientName.includes(key) || key.includes(ingredientName)) {
      return value
    }
  }
  
  return null
}

/**
 * 영양 정보 계산 (주어진 양에 대해)
 */
export function calculateNutrition(
  ingredientName: string, 
  amount: number, 
  unit: 'g' | 'kg' | 'ml' | 'L' = 'g'
): NutritionData | null {
  const baseData = getNutritionData(ingredientName)
  if (!baseData) return null
  
  // 단위 변환
  let amountInGrams = amount
  if (unit === 'kg') amountInGrams = amount * 1000
  if (unit === 'L') amountInGrams = amount * 1000
  if (unit === 'ml') amountInGrams = amount
  
  // 100g 기준으로 계산
  const ratio = amountInGrams / 100
  
  return {
    ...baseData,
    calories: Math.round(baseData.calories * ratio),
    protein: Math.round(baseData.protein * ratio * 10) / 10,
    carbohydrates: Math.round(baseData.carbohydrates * ratio * 10) / 10,
    fat: Math.round(baseData.fat * ratio * 10) / 10,
    fiber: Math.round(baseData.fiber * ratio * 10) / 10,
    sugar: Math.round(baseData.sugar * ratio * 10) / 10,
    sodium: Math.round(baseData.sodium * ratio),
    cholesterol: Math.round(baseData.cholesterol * ratio),
    saturatedFat: baseData.saturatedFat ? Math.round(baseData.saturatedFat * ratio * 10) / 10 : undefined,
    transFat: baseData.transFat ? Math.round(baseData.transFat * ratio * 10) / 10 : undefined,
    calcium: baseData.calcium ? Math.round(baseData.calcium * ratio) : undefined,
    iron: baseData.iron ? Math.round(baseData.iron * ratio * 10) / 10 : undefined
  }
}