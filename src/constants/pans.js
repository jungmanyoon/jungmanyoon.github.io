/**
 * 팬 데이터 상수 정의  
 * 한국 제과제빵 실무 기준 팬 규격 (2025년 기준)
 * 30년 경력 제과제빵 기능장 감수
 */

export const PAN_TYPES = {
  ROUND: 'round',
  MOUSSE: 'mousse',
  SQUARE: 'square',
  RECTANGLE: 'rectangle',
  LOAF: 'loaf',
  PULLMAN: 'pullman',
  POUND: 'pound',
  CHIFFON: 'chiffon',
  BUNDT: 'bundt',
  MUFFIN: 'muffin',
  SHEET: 'sheet',
  BAGUETTE: 'baguette'
}

export const COMMON_PANS = {
  // ========== 원형 케이크팬 (높이 5cm 표준) ==========
  ROUND_1: {
    id: 'round_1',
    type: PAN_TYPES.ROUND,
    name: '1호 원형팬 (15cm)',
    dimensions: { diameter: 15, height: 5 },
    volume: 884,
    servings: '2-4인분',
    suitableFor: ['미니케이크']
  },
  ROUND_2: {
    id: 'round_2',
    type: PAN_TYPES.ROUND,
    name: '2호 원형팬 (18cm)',
    dimensions: { diameter: 18, height: 5 },
    volume: 1272,
    servings: '4-6인분',
    suitableFor: ['케이크', '치즈케이크']
  },
  ROUND_3: {
    id: 'round_3',
    type: PAN_TYPES.ROUND,
    name: '3호 원형팬 (21cm)',
    dimensions: { diameter: 21, height: 5 },
    volume: 1732,
    servings: '6-8인분',
    suitableFor: ['생일케이크']
  },
  ROUND_8: {
    id: 'round_8',
    type: PAN_TYPES.ROUND,
    name: '8인치 원형팬 (20cm)',
    dimensions: { diameter: 20, height: 5 },
    volume: 1571,
    servings: '8-10인분',
    suitableFor: ['케이크']
  },

  // ========== 무스링 ==========
  MOUSSE_15: {
    id: 'mousse_15',
    type: PAN_TYPES.MOUSSE,
    name: '15cm 무스링',
    dimensions: { diameter: 15, height: 6 },
    volume: 1060,
    servings: '4-6인분',
    suitableFor: ['무스케이크']
  },
  MOUSSE_18: {
    id: 'mousse_18',
    type: PAN_TYPES.MOUSSE,
    name: '18cm 무스링',
    dimensions: { diameter: 18, height: 7 },
    volume: 1781,
    servings: '6-8인분',
    suitableFor: ['무스케이크', '티라미수']
  },

  // ========== 식빵틀 ==========
  LOAF_MINI: {
    id: 'loaf_mini',
    type: PAN_TYPES.LOAF,
    name: '미니 식빵틀',
    dimensions: { topLength: 13.5, bottomLength: 11, width: 7, height: 6 },
    volume: 511,
    weight: '250-300g',
    suitableFor: ['미니식빵']
  },
  LOAF_BASIC: {
    id: 'loaf_basic',
    type: PAN_TYPES.LOAF,
    name: '기본 식빵틀 (22.5cm)',
    dimensions: { topLength: 22.5, bottomLength: 19.5, width: 10.5, height: 9.5 },
    volume: 2049,
    weight: '600-700g',
    suitableFor: ['옥수수식빵', '일반식빵']
  },
  LOAF_MEDIUM: {
    id: 'loaf_medium',
    type: PAN_TYPES.LOAF,
    name: '중형 식빵틀 (25cm)',
    dimensions: { topLength: 25, bottomLength: 22, width: 11, height: 10 },
    volume: 2530,
    weight: '900-1000g',
    suitableFor: ['일반식빵']
  },
  LOAF_LARGE: {
    id: 'loaf_large',
    type: PAN_TYPES.LOAF,
    name: '대형 식빵틀 (27cm)',
    dimensions: { topLength: 27, bottomLength: 24, width: 12.5, height: 12.5 },
    volume: 3984,
    weight: '1200-1400g',
    suitableFor: ['대형식빵']
  },

  // ========== 풀먼틀 (뚜껑포함) ==========
  PULLMAN_BASIC: {
    id: 'pullman_basic',
    type: PAN_TYPES.PULLMAN,
    name: '풀먼 식빵틀 (17cm)',
    dimensions: { length: 17, width: 12.5, height: 14.5 },
    volume: 3084,
    weight: '600-700g',
    suitableFor: ['샌드위치식빵', '각식빵']
  },
  PULLMAN_LARGE: {
    id: 'pullman_large',
    type: PAN_TYPES.PULLMAN,
    name: '대형 풀먼틀 (27cm)',
    dimensions: { length: 27, width: 12.5, height: 14.5 },
    volume: 4894,
    weight: '1200-1400g',
    suitableFor: ['샌드위치식빵', '각식빵']
  },

  // ========== 파운드틀 ==========
  POUND_180: {
    id: 'pound_180',
    type: PAN_TYPES.POUND,
    name: '180mm 파운드틀',
    dimensions: { topLength: 18, bottomLength: 16, width: 8, height: 6 },
    volume: 816,
    weight: '300-400g',
    suitableFor: ['파운드케이크']
  },
  POUND_200: {
    id: 'pound_200',
    type: PAN_TYPES.POUND,
    name: '200mm 파운드틀',
    dimensions: { topLength: 20, bottomLength: 17.5, width: 8.5, height: 6.5 },
    volume: 1041,
    weight: '400-500g',
    suitableFor: ['파운드케이크']
  },
  POUND_250: {
    id: 'pound_250',
    type: PAN_TYPES.POUND,
    name: '250mm 파운드틀',
    dimensions: { topLength: 25, bottomLength: 22, width: 10, height: 7.5 },
    volume: 1763,
    weight: '700-800g',
    suitableFor: ['대형파운드케이크']
  },

  // ========== 쉬폰틀 ==========
  CHIFFON_17: {
    id: 'chiffon_17',
    type: PAN_TYPES.CHIFFON,
    name: '17cm 쉬폰틀',
    dimensions: { outerDiameter: 17, innerDiameter: 7, height: 8 },
    volume: 1378,
    servings: '4-6인분',
    suitableFor: ['쉬폰케이크']
  },
  CHIFFON_20: {
    id: 'chiffon_20',
    type: PAN_TYPES.CHIFFON,
    name: '20cm 쉬폰틀',
    dimensions: { outerDiameter: 20, innerDiameter: 8, height: 9 },
    volume: 2262,
    servings: '8-10인분',
    suitableFor: ['쉬폰케이크']
  },

  // ========== 머핀틀 ==========
  MUFFIN_STANDARD: {
    id: 'muffin_std',
    type: PAN_TYPES.MUFFIN,
    name: '표준 머핀틀 (12구)',
    dimensions: { diameter: 7, height: 3.5, count: 12 },
    volumePerCup: 135,
    totalVolume: 1620,
    suitableFor: ['머핀', '컵케이크']
  },

  // ========== 사각/직사각 ==========
  SQUARE_20: {
    id: 'square_20',
    type: PAN_TYPES.SQUARE,
    name: '20cm 정사각팬',
    dimensions: { length: 20, width: 20, height: 5 },
    volume: 2000,
    servings: '9-12인분',
    suitableFor: ['브라우니', '시트케이크']
  },
  RECTANGLE_30X20: {
    id: 'rect_30x20',
    type: PAN_TYPES.RECTANGLE,
    name: '30×20cm 직사각팬',
    dimensions: { length: 30, width: 20, height: 5 },
    volume: 3000,
    servings: '15-20인분',
    suitableFor: ['시트케이크', '롤케이크']
  },

  // ========== 시트팬 ==========
  SHEET_QUARTER: {
    id: 'sheet_quarter',
    type: PAN_TYPES.SHEET,
    name: '1/4 시트팬',
    dimensions: { length: 33, width: 23, height: 2.5 },
    volume: 1898,
    suitableFor: ['쿠키', '마카롱']
  },
  SHEET_HALF: {
    id: 'sheet_half',
    type: PAN_TYPES.SHEET,
    name: '1/2 시트팬',
    dimensions: { length: 60, width: 40, height: 2.5 },
    volume: 6000,
    suitableFor: ['대량쿠키', '롤케이크']
  }
}

export const PAN_CONVERSION_GUIDE = {
  equivalents: [
    ['ROUND_2', 'MOUSSE_15', 'LOAF_MINI'],
    ['ROUND_8', 'LOAF_1', 'PULLMAN_1'],
    ['LOAF_1_5', 'CHIFFON_20', 'SQUARE_20']
  ],
  substitutions: {
    ROUND_8: ['SQUARE_20', 'MOUSSE_18', 'LOAF_1'],
    LOAF_1: ['ROUND_8', 'PULLMAN_1', 'POUND_250'],
    CHIFFON_20: ['ROUND_8', 'LOAF_1_5']
  }
}

export const PAN_FILL_RATIOS = {
  [PAN_TYPES.ROUND]: 0.60,
  [PAN_TYPES.MOUSSE]: 0.90,
  [PAN_TYPES.SQUARE]: 0.65,
  [PAN_TYPES.RECTANGLE]: 0.65,
  [PAN_TYPES.LOAF]: 0.50,
  [PAN_TYPES.PULLMAN]: 0.38,
  [PAN_TYPES.POUND]: 0.70,
  [PAN_TYPES.CHIFFON]: 0.75,
  [PAN_TYPES.BUNDT]: 0.70,
  [PAN_TYPES.MUFFIN]: 0.75,
  [PAN_TYPES.SHEET]: 0.40,
  [PAN_TYPES.BAGUETTE]: 0.60
}

export const MANUFACTURER_VARIATIONS = {
  korean: { variance: 0.03, brands: ['삼광글라스', '코멕스', '락앤락'] },
  japanese: { variance: 0.02, brands: ['카이', '타이거'] },
  american: { variance: 0.08, brands: ['윌튼', '노르딕웨어'] }
}

export default COMMON_PANS
