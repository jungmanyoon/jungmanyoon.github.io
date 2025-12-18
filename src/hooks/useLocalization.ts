/**
 * 국제화 및 단위 변환 통합 훅
 * i18n 번역과 단위 포맷팅을 결합하여 제공
 */

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocaleStore } from '@/stores/useLocaleStore';
import {
  convertTemperature,
  convertWeight,
  convertVolume,
  convertLength,
  formatWithUnit,
  formatNumber,
  celsiusToFahrenheit,
  gramsToOunces,
  mlToCups,
  cmToInches,
  UNIT_SYMBOLS,
  TemperatureUnit,
  WeightUnit,
  VolumeUnit,
  LengthUnit
} from '@/utils/unitConverter';
import {
  findIngredient,
  getIngredientName,
  translateToEnglish,
  translateToKorean
} from '@/data/ingredientTranslations';
import { translateProcessStep as translateProcessStepFn } from '@/data/processStepTranslations';

// ============ 훅 정의 ============

export function useLocalization() {
  const { t, i18n } = useTranslation();

  const {
    language,
    temperature: tempUnit,
    weight: weightUnit,
    volume: volumeUnit,
    length: lengthUnit,
    decimalSeparator,
    decimalPlaces,
    showIngredientTranslation
  } = useLocaleStore();

  // ============ 숫자 포맷팅 ============

  const formatNum = useCallback((value: number, places?: number) => {
    return formatNumber(value, places ?? decimalPlaces, decimalSeparator === ',');
  }, [decimalPlaces, decimalSeparator]);

  // ============ 온도 포맷팅 ============

  /**
   * 섭씨 온도를 현재 설정에 맞게 변환 및 포맷
   */
  const formatTemp = useCallback((celsius: number, places?: number) => {
    const value = tempUnit === 'fahrenheit'
      ? celsiusToFahrenheit(celsius)
      : celsius;
    const symbol = UNIT_SYMBOLS[tempUnit];
    return `${formatNum(value, places ?? 0)}${symbol}`;
  }, [tempUnit, formatNum]);

  /**
   * 섭씨 온도를 현재 설정으로 변환 (값만)
   */
  const convertTemp = useCallback((celsius: number): number => {
    return tempUnit === 'fahrenheit'
      ? celsiusToFahrenheit(celsius)
      : celsius;
  }, [tempUnit]);

  // ============ 무게 포맷팅 ============

  /**
   * 그램을 현재 설정에 맞게 변환 및 포맷
   */
  const formatWeight = useCallback((grams: number, places?: number) => {
    const value = weightUnit === 'gram'
      ? grams
      : weightUnit === 'ounce'
        ? gramsToOunces(grams)
        : convertWeight(grams, 'gram', weightUnit);
    const symbol = UNIT_SYMBOLS[weightUnit];
    return `${formatNum(value, places)}${symbol}`;
  }, [weightUnit, formatNum]);

  /**
   * 그램을 현재 설정으로 변환 (값만)
   */
  const convertWeightValue = useCallback((grams: number): number => {
    return convertWeight(grams, 'gram', weightUnit);
  }, [weightUnit]);

  // ============ 부피 포맷팅 ============

  /**
   * ml를 현재 설정에 맞게 변환 및 포맷
   */
  const formatVol = useCallback((ml: number, places?: number) => {
    const value = volumeUnit === 'milliliter'
      ? ml
      : volumeUnit === 'cup'
        ? mlToCups(ml)
        : convertVolume(ml, 'milliliter', volumeUnit);
    const symbol = UNIT_SYMBOLS[volumeUnit];
    return `${formatNum(value, places)}${symbol}`;
  }, [volumeUnit, formatNum]);

  /**
   * ml를 현재 설정으로 변환 (값만)
   */
  const convertVolumeValue = useCallback((ml: number): number => {
    return convertVolume(ml, 'milliliter', volumeUnit);
  }, [volumeUnit]);

  // ============ 길이 포맷팅 ============

  /**
   * cm를 현재 설정에 맞게 변환 및 포맷
   */
  const formatLen = useCallback((cm: number, places?: number) => {
    const value = lengthUnit === 'inch' ? cmToInches(cm) : cm;
    const symbol = UNIT_SYMBOLS[lengthUnit];
    return `${formatNum(value, places)}${symbol}`;
  }, [lengthUnit, formatNum]);

  /**
   * cm를 현재 설정으로 변환 (값만)
   */
  const convertLengthValue = useCallback((cm: number): number => {
    return convertLength(cm, 'centimeter', lengthUnit);
  }, [lengthUnit]);

  // ============ 재료명 번역 ============

  /**
   * 재료명을 현재 언어로 변환
   */
  const translateIngredient = useCallback((name: string): string => {
    const ingredient = findIngredient(name);
    if (ingredient) {
      return getIngredientName(ingredient, language);
    }
    return name; // 번역 없으면 원본 반환
  }, [language]);

  // ============ 레시피 필드 로컬라이징 ============

  /**
   * 레시피 이름을 현재 언어로 가져오기
   */
  const getLocalizedRecipeName = useCallback((recipe: { name?: string; nameKo?: string; nameEn?: string }): string => {
    // 영어 이름이 명시적으로 있으면 사용
    if (language === 'en' && recipe.nameEn) {
      return recipe.nameEn;
    }

    const koreanName = recipe.nameKo || recipe.name || '';

    // 한글 모드면 한글 이름 반환
    if (language === 'ko') {
      return koreanName;
    }

    // 영어 모드: 한글 레시피 이름 → 영어 번역
    const recipeNameMap: Record<string, string> = {
      // 식빵류
      '식빵': 'White Bread',
      '우유 식빵': 'Milk Bread',
      '우유식빵': 'Milk Bread',
      '탕종 식빵': 'Tangzhong Bread',
      '탕종식빵': 'Tangzhong Bread',
      '버터톱 식빵': 'Butter Top Bread',
      '풀먼 식빵': 'Pullman Loaf',
      '산형 식빵': 'Mountain Loaf',
      '옥수수 식빵': 'Corn Bread',
      // 단빵/조리빵
      '단팥빵': 'Red Bean Bun',
      '크림빵': 'Cream Bun',
      '소보로빵': 'Streusel Bun',
      '소금빵': 'Salt Bread',
      '모닝빵': 'Dinner Roll',
      '버터롤': 'Butter Roll',
      '핫도그빵': 'Hot Dog Bun',
      '햄버거빵': 'Hamburger Bun',
      '고로케': 'Croquette Bun',
      '카레빵': 'Curry Bread',
      '피자빵': 'Pizza Bread',
      // 하드계열
      '바게트': 'Baguette',
      '치아바타': 'Ciabatta',
      '깜빠뉴': 'Campagne',
      '포카치아': 'Focaccia',
      '사워도우': 'Sourdough',
      // 리치도우
      '브리오슈': 'Brioche',
      '베이글': 'Bagel',
      '크루아상': 'Croissant',
      '데니쉬': 'Danish',
      '시나몬롤': 'Cinnamon Roll',
      // 케이크
      '스펀지케이크': 'Sponge Cake',
      '파운드케이크': 'Pound Cake',
      '쉬폰케이크': 'Chiffon Cake',
      '시폰케이크': 'Chiffon Cake',
      '롤케이크': 'Roll Cake',
      '치즈케이크': 'Cheesecake',
      // 과자
      '쿠키': 'Cookie',
      '마카롱': 'Macaron',
      '머핀': 'Muffin',
      '스콘': 'Scone',
      '마들렌': 'Madeleine',
      '휘낭시에': 'Financier',
      // 기타
      '새 레시피': 'New Recipe',
    };

    // 정확한 매칭
    if (recipeNameMap[koreanName]) {
      return recipeNameMap[koreanName];
    }

    // 부분 매칭 (띄어쓰기 무시)
    const noSpaceName = koreanName.replace(/\s+/g, '');
    for (const [ko, en] of Object.entries(recipeNameMap)) {
      if (ko.replace(/\s+/g, '') === noSpaceName) {
        return en;
      }
    }

    // 번역 없으면 원본 반환
    return koreanName;
  }, [language]);

  /**
   * 레시피 설명을 현재 언어로 가져오기
   */
  const getLocalizedDescription = useCallback((recipe: { description?: string; descriptionEn?: string }): string => {
    if (language === 'en' && recipe.descriptionEn) {
      return recipe.descriptionEn;
    }
    return recipe.description || '';
  }, [language]);

  /**
   * 재료명에 번역 추가 (옵션에 따라)
   */
  const formatIngredientName = useCallback((name: string): string => {
    if (!showIngredientTranslation) {
      return translateIngredient(name);
    }

    const ingredient = findIngredient(name);
    if (ingredient) {
      const primary = getIngredientName(ingredient, language);
      const secondary = language === 'ko' ? ingredient.en : ingredient.ko;
      return `${primary} (${secondary})`;
    }
    return name;
  }, [language, showIngredientTranslation, translateIngredient]);

  // ============ 출처 로컬라이징 ============

  /**
   * 출처 이름을 현재 언어로 가져오기
   */
  const getLocalizedSourceName = useCallback((source: { name?: string; nameEn?: string }): string => {
    if (language === 'en' && source.nameEn) {
      return source.nameEn;
    }
    return source.name || '';
  }, [language]);

  /**
   * 출처 작성자를 현재 언어로 가져오기
   */
  const getLocalizedSourceAuthor = useCallback((source: { author?: string; authorEn?: string }): string => {
    if (language === 'en' && source.authorEn) {
      return source.authorEn;
    }
    return source.author || '';
  }, [language]);

  // ============ 공정 단계 번역 ============

  /**
   * 공정 단계 설명을 현재 언어로 변환
   */
  const translateProcessStep = useCallback((description: string): string => {
    if (language === 'ko') return description; // 이미 한글이면 그대로 반환
    return translateProcessStepFn(description, language);
  }, [language]);

  // ============ 팬 이름 로컬라이징 ============

  /**
   * 팬 이름을 현재 언어로 가져오기
   * @param pan - 팬 객체 (id, name, nameKey 등)
   * @returns 로컬라이즈된 팬 이름
   */
  const getLocalizedPanName = useCallback((pan: { id?: string; name?: string; nameKey?: string }): string => {
    // nameKey가 있으면 그것을 사용
    if (pan.nameKey) {
      const translated = t(`settings.pan.panNames.${pan.nameKey}`, { defaultValue: '' });
      if (translated) return translated;
    }

    // id를 키로 변환 시도 (underscore → dash)
    if (pan.id) {
      const key = pan.id.replace(/_/g, '-');
      const translated = t(`settings.pan.panNames.${key}`, { defaultValue: '' });
      if (translated) return translated;
    }

    // 한글 이름을 키로 매핑
    if (pan.name) {
      const panNameKeyMap: Record<string, string> = {
        // 원형팬
        '미니 원형팬 (12cm)': 'round-mini',
        '1호 원형팬 (15cm)': 'round-1',
        '2호 원형팬 (18cm)': 'round-2',
        '3호 원형팬 (21cm)': 'round-3',
        '4호 원형팬 (24cm)': 'round-4',
        '5호 원형팬 (27cm)': 'round-5',
        '6호 원형팬 (30cm)': 'round-6',
        '6인치 원형팬 (15cm)': 'round-6inch',
        '7인치 원형팬 (18cm)': 'round-7inch',
        '8인치 원형팬 (20cm)': 'round-8inch',
        '9인치 원형팬 (23cm)': 'round-9inch',
        '10인치 원형팬 (25cm)': 'round-10inch',
        // 정사각팬
        '1호 정사각팬 (15cm)': 'square-1',
        '2호 정사각팬 (18cm)': 'square-2',
        '3호 정사각팬 (21cm)': 'square-3',
        '4호 정사각팬 (24cm)': 'square-4',
        '5호 정사각팬 (27cm)': 'square-5',
        // 무스링
        '12cm 무스링': 'mousse-12',
        '14cm 무스링': 'mousse-14',
        '15cm 무스링': 'mousse-15',
        '16cm 무스링': 'mousse-16',
        '18cm 무스링': 'mousse-18',
        '20cm 무스링': 'mousse-20',
        '22cm 무스링': 'mousse-22',
        '24cm 무스링': 'mousse-24',
        // 식빵틀
        '미니 식빵틀': 'loaf-mini',
        '옥수수 식빵틀 (22.5cm)': 'loaf-corn',
        '우유 식빵틀 (25cm)': 'loaf-milk',
        '대형 식빵틀 (27cm)': 'loaf-large',
        '450g 식빵틀': 'loaf-450g',
        '900g 식빵틀': 'loaf-900g',
        // 풀먼틀
        '소형 풀먼틀 (17cm)': 'pullman-s',
        '중형 풀먼틀 (22cm)': 'pullman-m',
        '대형 풀먼틀 (27cm)': 'pullman-l',
        // 파운드틀
        '150mm 파운드틀': 'pound-150',
        '180mm 파운드틀': 'pound-180',
        '200mm 파운드틀': 'pound-200',
        '230mm 파운드틀': 'pound-230',
        '250mm 파운드틀': 'pound-250',
        '300mm 파운드틀': 'pound-300',
        // 쉬폰틀
        '15cm 쉬폰틀': 'chiffon-15',
        '17cm 쉬폰틀': 'chiffon-17',
        '20cm 쉬폰틀': 'chiffon-20',
        '23cm 쉬폰틀': 'chiffon-23',
        // 타르트틀
        '6cm 미니타르트틀': 'tart-6',
        '8cm 미니타르트틀': 'tart-8',
        '10cm 타르트틀 (1호)': 'tart-10',
        '15cm 타르트틀 (2호)': 'tart-15',
        '18cm 타르트틀 (3호)': 'tart-18',
        '20cm 타르트틀': 'tart-20',
        '24cm 타르트틀': 'tart-24',
        // 머핀틀
        '6구 머핀틀': 'muffin-6',
        '12구 머핀틀': 'muffin-12',
        '12구 미니머핀틀': 'muffin-mini-12',
        '24구 미니머핀틀': 'muffin-mini-24',
        // 롤케이크팬
        '소형 롤케이크팬 (25×20cm)': 'roll-s',
        '중형 롤케이크팬 (30×25cm)': 'roll-m',
        '대형 롤케이크팬 (39×29cm)': 'roll-l',
        '특대 롤케이크팬 (40×30cm)': 'roll-full',
        // 시트팬
        '1/4 시트팬': 'sheet-quarter',
        '1/2 시트팬 (40×30cm)': 'sheet-half',
        '전판 시트팬 (60×40cm)': 'sheet-full',
        // 특수틀
        '9구 마들렌틀': 'madeleine-9',
        '12구 마들렌틀': 'madeleine-12',
        '8구 휘낭시에틀': 'financier-8',
        '12구 휘낭시에틀': 'financier-12',
        '구겔호프틀 (18cm)': 'gugelhupf-18',
        '번트케이크틀 (22cm)': 'bundt-22',
        '사바랭틀 (18cm)': 'savarin-18',
        '2열 바게트팬': 'baguette-2',
        '3열 바게트팬': 'baguette-3',
        '미니 브리오슈틀 (6cm)': 'brioche-mini',
        '브리오슈틀 (12cm)': 'brioche-12',
      };

      const key = panNameKeyMap[pan.name];
      if (key) {
        const translated = t(`settings.pan.panNames.${key}`, { defaultValue: '' });
        if (translated) return translated;
      }
    }

    // 기본값: 원래 이름 반환
    return pan.name || '';
  }, [t]);

  /**
   * 팬 카테고리를 현재 언어로 가져오기
   * @param category - 팬 카테고리 (한글 또는 키)
   * @returns 로컬라이즈된 카테고리 이름
   */
  const getLocalizedPanCategory = useCallback((category: string): string => {
    // 한글 카테고리를 영어 키로 매핑
    const categoryKeyMap: Record<string, string> = {
      '케이크팬': 'cakePan',
      '무스틀': 'mousseRing',
      '식빵틀': 'breadPan',
      '풀먼틀': 'pullmanPan',
      '파운드틀': 'poundPan',
      '쉬폰틀': 'chiffonPan',
      '타르트틀': 'tartPan',
      '머핀틀': 'muffinPan',
      '롤케이크팬': 'rollCakePan',
      '시트팬': 'sheetPan',
      '특수틀': 'specialPan',
      '빵틀': 'loafPan'
    };

    const key = categoryKeyMap[category] || category;
    const translated = t(`settings.pan.categories.${key}`, { defaultValue: '' });
    return translated || category;
  }, [t]);

  /**
   * 팬 타입을 현재 언어로 가져오기
   * @param type - 팬 타입 (한글 또는 키)
   * @returns 로컬라이즈된 타입 이름
   */
  const getLocalizedPanType = useCallback((type: string): string => {
    // 한글 타입을 영어 키로 매핑
    const typeKeyMap: Record<string, string> = {
      '원형팬': 'round',
      '정사각팬': 'square',
      '분리형팬': 'springform',
      '무스링': 'mousseRing',
      '일반 식빵틀': 'loaf',
      '미니 식빵틀': 'miniLoaf',
      '풀먼 (뚜껑있음)': 'pullman',
      '파운드틀': 'pound',
      '쉬폰틀 (중공)': 'chiffon',
      '원형타르트': 'roundTart',
      '사각타르트': 'squareTart',
      '표준 머핀': 'muffin',
      '미니 머핀': 'miniMuffin',
      '롤케이크팬': 'rollCake',
      '시트팬': 'sheet'
    };

    const key = typeKeyMap[type] || type;
    const translated = t(`settings.pan.types.${key}`, { defaultValue: '' });
    return translated || type;
  }, [t]);

  // ============ 제품 타입 번역 ============

  /**
   * 제품(빵/케이크) 이름을 현재 언어로 가져오기
   * @param productName - 제품 이름 (한글)
   * @returns 로컬라이즈된 제품 이름
   */
  const getLocalizedProductName = useCallback((productName: string): string => {
    // 한글 제품명 → 번역 키 매핑
    const productKeyMap: Record<string, { category: 'breadTypes' | 'cakeTypes'; key: string }> = {
      // 빵 종류
      '풀먼식빵': { category: 'breadTypes', key: 'pullman' },
      '산형식빵': { category: 'breadTypes', key: 'mountain' },
      '버터톱식빵': { category: 'breadTypes', key: 'butterTop' },
      '옥수수식빵': { category: 'breadTypes', key: 'corn' },
      '우유식빵': { category: 'breadTypes', key: 'milk' },
      '모닝빵': { category: 'breadTypes', key: 'morningRoll' },
      '베이글': { category: 'breadTypes', key: 'bagel' },
      '브리오슈': { category: 'breadTypes', key: 'brioche' },
      '치아바타': { category: 'breadTypes', key: 'ciabatta' },
      '바게트': { category: 'breadTypes', key: 'baguette' },
      // 케이크 종류
      '파운드케이크': { category: 'cakeTypes', key: 'pound' },
      '레이어케이크': { category: 'cakeTypes', key: 'layer' },
      '엔젤푸드케이크': { category: 'cakeTypes', key: 'angel' },
      '스펀지케이크': { category: 'cakeTypes', key: 'sponge' },
      '시폰케이크': { category: 'cakeTypes', key: 'chiffon' },
      '쉬폰케이크': { category: 'cakeTypes', key: 'chiffon' },
      '무스케이크': { category: 'cakeTypes', key: 'mousse' },
      '제누와즈': { category: 'cakeTypes', key: 'sponge' },
      // 페이스트리
      '크루아상': { category: 'breadTypes', key: 'croissant' },
      '데니쉬': { category: 'breadTypes', key: 'danish' },
      '쿠키': { category: 'breadTypes', key: 'cookie' },
    };

    const mapping = productKeyMap[productName];
    if (mapping) {
      const translated = t(`${mapping.category}.${mapping.key}`, { defaultValue: '' });
      if (translated) return translated;
    }

    // 번역이 없으면 원본 반환
    return productName;
  }, [t]);

  // ============ 단위 기호 ============

  const tempSymbol = useMemo(() => UNIT_SYMBOLS[tempUnit], [tempUnit]);
  const weightSymbol = useMemo(() => UNIT_SYMBOLS[weightUnit], [weightUnit]);
  const volumeSymbol = useMemo(() => UNIT_SYMBOLS[volumeUnit], [volumeUnit]);
  const lengthSymbol = useMemo(() => UNIT_SYMBOLS[lengthUnit], [lengthUnit]);

  // ============ 반환 ============

  return {
    // i18n
    t,
    i18n,
    language,

    // 숫자 포맷
    formatNum,

    // 온도
    formatTemp,
    convertTemp,
    tempUnit,
    tempSymbol,

    // 무게
    formatWeight,
    convertWeightValue,
    weightUnit,
    weightSymbol,

    // 부피
    formatVol,
    convertVolumeValue,
    volumeUnit,
    volumeSymbol,

    // 길이
    formatLen,
    convertLengthValue,
    lengthUnit,
    lengthSymbol,

    // 재료명
    translateIngredient,
    formatIngredientName,

    // 레시피 필드
    getLocalizedRecipeName,
    getLocalizedDescription,

    // 출처
    getLocalizedSourceName,
    getLocalizedSourceAuthor,

    // 공정 단계
    translateProcessStep,

    // 팬 이름
    getLocalizedPanName,
    getLocalizedPanCategory,
    getLocalizedPanType,

    // 제품 타입
    getLocalizedProductName
  };
}

// ============ 간단한 훅들 ============

/**
 * 온도만 필요할 때
 */
export function useTemperature() {
  const { formatTemp, convertTemp, tempUnit, tempSymbol } = useLocalization();
  return { formatTemp, convertTemp, tempUnit, tempSymbol };
}

/**
 * 무게만 필요할 때
 */
export function useWeight() {
  const { formatWeight, convertWeightValue, weightUnit, weightSymbol } = useLocalization();
  return { formatWeight, convertWeight: convertWeightValue, weightUnit, weightSymbol };
}

/**
 * 부피만 필요할 때
 */
export function useVolume() {
  const { formatVol, convertVolumeValue, volumeUnit, volumeSymbol } = useLocalization();
  return { formatVol, convertVolume: convertVolumeValue, volumeUnit, volumeSymbol };
}

export default useLocalization;
