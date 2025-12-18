/**
 * 단위 변환 유틸리티
 * 온도, 무게, 부피 단위 간 변환 및 표시
 */

// ============ 타입 정의 ============

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WeightUnit = 'gram' | 'ounce' | 'pound' | 'kilogram';
export type VolumeUnit = 'milliliter' | 'liter' | 'cup' | 'tablespoon' | 'teaspoon' | 'fluidOunce';
export type LengthUnit = 'centimeter' | 'inch';

export interface UnitPreferences {
  temperature: TemperatureUnit;
  weight: WeightUnit;
  volume: VolumeUnit;
  length: LengthUnit;
  decimalPlaces: number;
}

// ============ 변환 상수 ============

const WEIGHT_TO_GRAM: Record<WeightUnit, number> = {
  gram: 1,
  kilogram: 1000,
  ounce: 28.3495,
  pound: 453.592
};

const VOLUME_TO_ML: Record<VolumeUnit, number> = {
  milliliter: 1,
  liter: 1000,
  cup: 236.588,        // US cup
  tablespoon: 14.787,  // US tablespoon
  teaspoon: 4.929,     // US teaspoon
  fluidOunce: 29.5735  // US fluid ounce
};

const LENGTH_TO_CM: Record<LengthUnit, number> = {
  centimeter: 1,
  inch: 2.54
};

// ============ 단위 기호 ============

export const UNIT_SYMBOLS: Record<string, string> = {
  // 온도
  celsius: '°C',
  fahrenheit: '°F',
  // 무게
  gram: 'g',
  kilogram: 'kg',
  ounce: 'oz',
  pound: 'lb',
  // 부피
  milliliter: 'ml',
  liter: 'L',
  cup: 'cup',
  tablespoon: 'tbsp',
  teaspoon: 'tsp',
  fluidOunce: 'fl oz',
  // 길이
  centimeter: 'cm',
  inch: 'in'
};

// ============ 온도 변환 ============

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9;
}

export function convertTemperature(
  value: number,
  from: TemperatureUnit,
  to: TemperatureUnit
): number {
  if (from === to) return value;

  if (from === 'celsius' && to === 'fahrenheit') {
    return celsiusToFahrenheit(value);
  }
  return fahrenheitToCelsius(value);
}

// ============ 무게 변환 ============

export function gramsToOunces(grams: number): number {
  return grams / WEIGHT_TO_GRAM.ounce;
}

export function ouncesToGrams(ounces: number): number {
  return ounces * WEIGHT_TO_GRAM.ounce;
}

export function gramsToPounds(grams: number): number {
  return grams / WEIGHT_TO_GRAM.pound;
}

export function poundsToGrams(pounds: number): number {
  return pounds * WEIGHT_TO_GRAM.pound;
}

export function convertWeight(
  value: number,
  from: WeightUnit,
  to: WeightUnit
): number {
  if (from === to) return value;

  // 먼저 그램으로 변환
  const grams = value * WEIGHT_TO_GRAM[from];
  // 목표 단위로 변환
  return grams / WEIGHT_TO_GRAM[to];
}

// ============ 부피 변환 ============

export function mlToCups(ml: number): number {
  return ml / VOLUME_TO_ML.cup;
}

export function cupsToMl(cups: number): number {
  return cups * VOLUME_TO_ML.cup;
}

export function mlToFluidOunces(ml: number): number {
  return ml / VOLUME_TO_ML.fluidOunce;
}

export function fluidOuncesToMl(flOz: number): number {
  return flOz * VOLUME_TO_ML.fluidOunce;
}

export function convertVolume(
  value: number,
  from: VolumeUnit,
  to: VolumeUnit
): number {
  if (from === to) return value;

  // 먼저 ml로 변환
  const ml = value * VOLUME_TO_ML[from];
  // 목표 단위로 변환
  return ml / VOLUME_TO_ML[to];
}

// ============ 길이 변환 ============

export function cmToInches(cm: number): number {
  return cm / LENGTH_TO_CM.inch;
}

export function inchesToCm(inches: number): number {
  return inches * LENGTH_TO_CM.inch;
}

export function convertLength(
  value: number,
  from: LengthUnit,
  to: LengthUnit
): number {
  if (from === to) return value;

  const cm = value * LENGTH_TO_CM[from];
  return cm / LENGTH_TO_CM[to];
}

// ============ 포맷팅 ============

export function formatNumber(
  value: number,
  decimalPlaces: number = 1,
  useCommaDecimal: boolean = false
): string {
  const rounded = Math.round(value * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
  const formatted = rounded.toFixed(decimalPlaces);

  if (useCommaDecimal) {
    return formatted.replace('.', ',');
  }
  return formatted;
}

export function formatWithUnit(
  value: number,
  unit: string,
  decimalPlaces: number = 1,
  useCommaDecimal: boolean = false
): string {
  const symbol = UNIT_SYMBOLS[unit] || unit;
  const formatted = formatNumber(value, decimalPlaces, useCommaDecimal);
  return `${formatted}${symbol}`;
}

// ============ 스마트 포맷팅 ============

/**
 * 무게를 가장 적절한 단위로 표시
 * 미터법: g 또는 kg
 * 미국식: oz 또는 lb
 */
export function formatWeightSmart(
  grams: number,
  system: 'metric' | 'imperial',
  decimalPlaces: number = 1
): string {
  if (system === 'metric') {
    if (grams >= 1000) {
      return formatWithUnit(grams / 1000, 'kilogram', decimalPlaces);
    }
    return formatWithUnit(grams, 'gram', decimalPlaces);
  } else {
    const ounces = gramsToOunces(grams);
    if (ounces >= 16) {
      return formatWithUnit(ounces / 16, 'pound', decimalPlaces);
    }
    return formatWithUnit(ounces, 'ounce', decimalPlaces);
  }
}

/**
 * 부피를 가장 적절한 단위로 표시
 */
export function formatVolumeSmart(
  ml: number,
  system: 'metric' | 'imperial',
  decimalPlaces: number = 1
): string {
  if (system === 'metric') {
    if (ml >= 1000) {
      return formatWithUnit(ml / 1000, 'liter', decimalPlaces);
    }
    return formatWithUnit(ml, 'milliliter', decimalPlaces);
  } else {
    const cups = mlToCups(ml);
    if (cups >= 0.25) {
      return formatWithUnit(cups, 'cup', decimalPlaces);
    }
    const tbsp = ml / VOLUME_TO_ML.tablespoon;
    if (tbsp >= 1) {
      return formatWithUnit(tbsp, 'tablespoon', decimalPlaces);
    }
    return formatWithUnit(ml / VOLUME_TO_ML.teaspoon, 'teaspoon', decimalPlaces);
  }
}

/**
 * 온도 포맷팅
 */
export function formatTemperature(
  celsius: number,
  unit: TemperatureUnit,
  decimalPlaces: number = 0
): string {
  const value = unit === 'fahrenheit'
    ? celsiusToFahrenheit(celsius)
    : celsius;
  return formatWithUnit(value, unit, decimalPlaces);
}

/**
 * 길이 포맷팅
 */
export function formatLength(
  cm: number,
  unit: LengthUnit,
  decimalPlaces: number = 1
): string {
  const value = unit === 'inch' ? cmToInches(cm) : cm;
  return formatWithUnit(value, unit, decimalPlaces);
}

// ============ 일괄 변환 ============

export interface ConvertedRecipeValues {
  weights: Map<string, { value: number; formatted: string }>;
  volumes: Map<string, { value: number; formatted: string }>;
  temperatures: Map<string, { value: number; formatted: string }>;
  lengths: Map<string, { value: number; formatted: string }>;
}

/**
 * 기본 단위 설정 (미터법)
 */
export const DEFAULT_UNIT_PREFERENCES: UnitPreferences = {
  temperature: 'celsius',
  weight: 'gram',
  volume: 'milliliter',
  length: 'centimeter',
  decimalPlaces: 1
};

/**
 * 미국식 단위 설정
 */
export const IMPERIAL_UNIT_PREFERENCES: UnitPreferences = {
  temperature: 'fahrenheit',
  weight: 'ounce',
  volume: 'cup',
  length: 'inch',
  decimalPlaces: 1
};

// ============ 컵 변환 참조표 (일반적인 재료) ============

/**
 * 재료별 그램-컵 변환 참조
 * 컵당 그램 수 (US cup = 236.588ml 기준)
 */
export const INGREDIENT_CUP_WEIGHTS: Record<string, number> = {
  // 밀가루류
  'all-purpose flour': 125,
  'bread flour': 127,
  'cake flour': 114,
  'whole wheat flour': 120,
  'almond flour': 96,
  'rice flour': 158,

  // 당류
  'granulated sugar': 200,
  'brown sugar': 220,
  'powdered sugar': 120,
  'honey': 340,

  // 유지류
  'butter': 227,
  'vegetable oil': 218,
  'olive oil': 216,

  // 유제품
  'milk': 244,
  'heavy cream': 238,
  'sour cream': 242,
  'yogurt': 245,

  // 기타
  'water': 237,
  'salt': 288,
  'cocoa powder': 86,
  'oats': 90
};

/**
 * 재료별 컵 변환 (그램 → 컵)
 */
export function gramsToIngredientCups(
  grams: number,
  ingredientKey: string
): number | null {
  const cupWeight = INGREDIENT_CUP_WEIGHTS[ingredientKey.toLowerCase()];
  if (!cupWeight) return null;
  return grams / cupWeight;
}

export default {
  // 온도
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  convertTemperature,
  formatTemperature,

  // 무게
  gramsToOunces,
  ouncesToGrams,
  gramsToPounds,
  poundsToGrams,
  convertWeight,
  formatWeightSmart,

  // 부피
  mlToCups,
  cupsToMl,
  mlToFluidOunces,
  fluidOuncesToMl,
  convertVolume,
  formatVolumeSmart,

  // 길이
  cmToInches,
  inchesToCm,
  convertLength,
  formatLength,

  // 포맷팅
  formatNumber,
  formatWithUnit,

  // 상수
  UNIT_SYMBOLS,
  DEFAULT_UNIT_PREFERENCES,
  IMPERIAL_UNIT_PREFERENCES,
  INGREDIENT_CUP_WEIGHTS
};
