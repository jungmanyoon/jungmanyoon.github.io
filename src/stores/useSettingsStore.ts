/**
 * 설정 관리 스토어
 * 사용자 커스터마이징 설정을 저장하고 관리
 *
 * 적용: --persona-backend (상태 관리) + --persona-architect (구조 설계)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  PanSettings,
  UserPan,
  ProductVolumeSettings,
  YieldLossSettings,
  ProcessLossRates,
  MethodSettings,
  MethodConfig,
  EnvironmentSettings,
  EnvironmentProfile,
  IngredientSettings,
  CustomIngredient,
  IngredientSubstitution,
  CostOverride,
  NutritionOverride,
  AdvancedSettings,
  AllSettings
} from '@/types/settings.types'
import { PRIMARY_INGREDIENT_NAMES } from '@/data/ingredientDatabase'

// ===== 기본값 정의 =====

// 기본 팬 데이터베이스 (한국 제과제빵 실무 기준)
const DEFAULT_USER_PANS: UserPan[] = [
  // ========== 원형 케이크팬 (호수별) ==========
  { id: 'round-mini', name: '미니 원형팬 (12cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 12, height: 4.5 }, volume: 509, notes: '1~2인분, 미니케이크', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'round-1', name: '1호 원형팬 (15cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 15, height: 4.5 }, volume: 795, notes: '2~4인분', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'round-2', name: '2호 원형팬 (18cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 18, height: 4.5 }, volume: 1145, notes: '4~6인분', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'round-3', name: '3호 원형팬 (21cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 21, height: 4.5 }, volume: 1559, notes: '6~8인분, 생일케이크', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'round-4', name: '4호 원형팬 (24cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 24, height: 4.5 }, volume: 2036, notes: '10~12인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'round-5', name: '5호 원형팬 (27cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 27, height: 4.5 }, volume: 2578, notes: '12~15인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'round-6', name: '6호 원형팬 (30cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 30, height: 4.5 }, volume: 3181, notes: '15~20인분, 웨딩케이크', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 원형 케이크팬 (인치별) ==========
  { id: 'round-6inch', name: '6인치 원형팬 (15cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 15, height: 5 }, volume: 884, notes: '6인치 = 약 15cm', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'round-7inch', name: '7인치 원형팬 (18cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 18, height: 5 }, volume: 1272, notes: '7인치 = 약 18cm', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'round-8inch', name: '8인치 원형팬 (20cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 20, height: 5 }, volume: 1571, notes: '8인치 = 약 20cm', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'round-9inch', name: '9인치 원형팬 (23cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 23, height: 5 }, volume: 2078, notes: '9인치 = 약 23cm', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'round-10inch', name: '10인치 원형팬 (25cm)', category: '케이크팬', type: 'round', dimensions: { diameter: 25, height: 5 }, volume: 2454, notes: '10인치 = 약 25cm', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 무스링 ==========
  { id: 'mousse-12', name: '12cm 무스링', category: '무스틀', type: 'round', dimensions: { diameter: 12, height: 5 }, volume: 565, notes: '1~2인분 무스케이크', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mousse-14', name: '14cm 무스링', category: '무스틀', type: 'round', dimensions: { diameter: 14, height: 5 }, volume: 770, notes: '2~3인분 무스케이크', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mousse-15', name: '15cm 무스링', category: '무스틀', type: 'round', dimensions: { diameter: 15, height: 6 }, volume: 1060, notes: '4~6인분 무스케이크', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mousse-16', name: '16cm 무스링', category: '무스틀', type: 'round', dimensions: { diameter: 16, height: 6 }, volume: 1206, notes: '5~7인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mousse-18', name: '18cm 무스링', category: '무스틀', type: 'round', dimensions: { diameter: 18, height: 7 }, volume: 1781, notes: '6~8인분, 티라미수', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mousse-20', name: '20cm 무스링', category: '무스틀', type: 'round', dimensions: { diameter: 20, height: 7 }, volume: 2199, notes: '8~10인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mousse-22', name: '22cm 무스링', category: '무스틀', type: 'round', dimensions: { diameter: 22, height: 7 }, volume: 2661, notes: '10~12인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mousse-24', name: '24cm 무스링', category: '무스틀', type: 'round', dimensions: { diameter: 24, height: 7 }, volume: 3166, notes: '12~15인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 식빵틀 ==========
  { id: 'loaf-mini', name: '미니 식빵틀', category: '식빵틀', type: 'loaf', dimensions: { length: 13.5, width: 7, height: 6 }, volume: 511, notes: '250~300g 반죽', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'loaf-corn', name: '옥수수 식빵틀 (22.5cm)', category: '식빵틀', type: 'loaf', dimensions: { length: 22.5, width: 10.5, height: 9.5 }, volume: 2049, notes: '600~700g 반죽, 강력분 300g 기준', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'loaf-milk', name: '우유 식빵틀 (25cm)', category: '식빵틀', type: 'loaf', dimensions: { length: 25, width: 11, height: 10 }, volume: 2530, notes: '900~1000g 반죽', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'loaf-large', name: '대형 식빵틀 (27cm)', category: '식빵틀', type: 'loaf', dimensions: { length: 27, width: 12.5, height: 12.5 }, volume: 3984, notes: '1200~1400g 반죽', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'loaf-450g', name: '450g 식빵틀', category: '식빵틀', type: 'loaf', dimensions: { length: 20, width: 9.5, height: 8 }, volume: 1394, notes: '450g 반죽용', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'loaf-900g', name: '900g 식빵틀', category: '식빵틀', type: 'loaf', dimensions: { length: 24, width: 11, height: 10 }, volume: 2475, notes: '900g 반죽용', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 풀먼틀 (뚜껑 포함) ==========
  { id: 'pullman-s', name: '소형 풀먼틀 (17cm)', category: '풀먼틀', type: 'square', dimensions: { length: 17, width: 12.5, height: 14.5 }, volume: 3084, notes: '600~700g, 샌드위치식빵', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'pullman-m', name: '중형 풀먼틀 (22cm)', category: '풀먼틀', type: 'square', dimensions: { length: 22, width: 12.5, height: 14.5 }, volume: 3988, notes: '900~1000g', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'pullman-l', name: '대형 풀먼틀 (27cm)', category: '풀먼틀', type: 'square', dimensions: { length: 27, width: 12.5, height: 14.5 }, volume: 4894, notes: '1200~1400g', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 파운드틀 ==========
  { id: 'pound-150', name: '150mm 파운드틀', category: '파운드틀', type: 'loaf', dimensions: { length: 15, width: 7, height: 5.5 }, volume: 539, notes: '200~250g', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'pound-180', name: '180mm 파운드틀', category: '파운드틀', type: 'loaf', dimensions: { length: 18, width: 8, height: 6 }, volume: 816, notes: '300~400g', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'pound-200', name: '200mm 파운드틀', category: '파운드틀', type: 'loaf', dimensions: { length: 20, width: 8.5, height: 6.5 }, volume: 1041, notes: '400~500g', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'pound-230', name: '230mm 파운드틀', category: '파운드틀', type: 'loaf', dimensions: { length: 23, width: 9, height: 7 }, volume: 1350, notes: '550~650g', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'pound-250', name: '250mm 파운드틀', category: '파운드틀', type: 'loaf', dimensions: { length: 25, width: 10, height: 7.5 }, volume: 1763, notes: '700~800g', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'pound-300', name: '300mm 파운드틀', category: '파운드틀', type: 'loaf', dimensions: { length: 30, width: 11, height: 8 }, volume: 2508, notes: '1000~1100g', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 쉬폰틀 ==========
  { id: 'chiffon-15', name: '15cm 쉬폰틀', category: '쉬폰틀', type: 'chiffon', dimensions: { diameter: 15, innerDiameter: 6, height: 7 }, volume: 1040, notes: '3~4인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'chiffon-17', name: '17cm 쉬폰틀', category: '쉬폰틀', type: 'chiffon', dimensions: { diameter: 17, innerDiameter: 7, height: 8 }, volume: 1378, notes: '4~6인분', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'chiffon-20', name: '20cm 쉬폰틀', category: '쉬폰틀', type: 'chiffon', dimensions: { diameter: 20, innerDiameter: 8, height: 9 }, volume: 2262, notes: '8~10인분', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'chiffon-23', name: '23cm 쉬폰틀', category: '쉬폰틀', type: 'chiffon', dimensions: { diameter: 23, innerDiameter: 9, height: 10 }, volume: 3158, notes: '12~15인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 타르트틀 ==========
  { id: 'tart-6', name: '6cm 미니타르트틀', category: '타르트틀', type: 'round', dimensions: { diameter: 6, height: 1.5 }, volume: 42, notes: '한입 타르트', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tart-8', name: '8cm 미니타르트틀', category: '타르트틀', type: 'round', dimensions: { diameter: 8, height: 2 }, volume: 100, notes: '개인용 미니타르트', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tart-10', name: '10cm 타르트틀 (1호)', category: '타르트틀', type: 'round', dimensions: { diameter: 10, height: 2 }, volume: 157, notes: '1호 타르트', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tart-15', name: '15cm 타르트틀 (2호)', category: '타르트틀', type: 'round', dimensions: { diameter: 15, height: 2.5 }, volume: 442, notes: '2~3인분', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tart-18', name: '18cm 타르트틀 (3호)', category: '타르트틀', type: 'round', dimensions: { diameter: 18, height: 2.5 }, volume: 636, notes: '4~6인분', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tart-20', name: '20cm 타르트틀', category: '타르트틀', type: 'round', dimensions: { diameter: 20, height: 3 }, volume: 942, notes: '6~8인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tart-24', name: '24cm 타르트틀', category: '타르트틀', type: 'round', dimensions: { diameter: 24, height: 3 }, volume: 1357, notes: '10~12인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 머핀틀 ==========
  { id: 'muffin-6', name: '머핀틀 6구', category: '머핀틀', type: 'round', dimensions: { diameter: 7, height: 3.5 }, volume: 810, notes: '1컵당 약 135ml', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'muffin-12', name: '머핀틀 12구', category: '머핀틀', type: 'round', dimensions: { diameter: 7, height: 3.5 }, volume: 1620, notes: '표준 머핀틀', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'muffin-mini-12', name: '미니머핀틀 12구', category: '머핀틀', type: 'round', dimensions: { diameter: 4.5, height: 2.5 }, volume: 477, notes: '미니 컵케이크용', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'muffin-mini-24', name: '미니머핀틀 24구', category: '머핀틀', type: 'round', dimensions: { diameter: 4.5, height: 2.5 }, volume: 954, notes: '미니 컵케이크용', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 정사각 케이크팬 ==========
  { id: 'square-1', name: '1호 정사각팬 (15cm)', category: '케이크팬', type: 'square', dimensions: { length: 15, width: 15, height: 5 }, volume: 1125, notes: '4~6인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'square-2', name: '2호 정사각팬 (18cm)', category: '케이크팬', type: 'square', dimensions: { length: 18, width: 18, height: 5 }, volume: 1620, notes: '6~8인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'square-3', name: '3호 정사각팬 (21cm)', category: '케이크팬', type: 'square', dimensions: { length: 21, width: 21, height: 5 }, volume: 2205, notes: '9~12인분, 브라우니', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'square-4', name: '4호 정사각팬 (24cm)', category: '케이크팬', type: 'square', dimensions: { length: 24, width: 24, height: 5 }, volume: 2880, notes: '12~15인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'square-5', name: '5호 정사각팬 (27cm)', category: '케이크팬', type: 'square', dimensions: { length: 27, width: 27, height: 5 }, volume: 3645, notes: '15~20인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 롤케이크팬 ==========
  { id: 'roll-s', name: '소형 롤케이크팬 (25×20cm)', category: '롤케이크팬', type: 'square', dimensions: { length: 25, width: 20, height: 2 }, volume: 1000, notes: '2인분 롤케이크', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'roll-m', name: '중형 롤케이크팬 (30×25cm)', category: '롤케이크팬', type: 'square', dimensions: { length: 30, width: 25, height: 2.5 }, volume: 1875, notes: '4~5인분', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'roll-l', name: '대형 롤케이크팬 (39×29cm)', category: '롤케이크팬', type: 'square', dimensions: { length: 39, width: 29, height: 2.5 }, volume: 2828, notes: '6~8인분', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'roll-full', name: '풀사이즈 롤케이크팬 (40×30cm)', category: '롤케이크팬', type: 'square', dimensions: { length: 40, width: 30, height: 3 }, volume: 3600, notes: '업소용', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 시트팬 ==========
  { id: 'sheet-quarter', name: '1/4 시트팬', category: '시트팬', type: 'square', dimensions: { length: 33, width: 23, height: 2.5 }, volume: 1898, notes: '쿠키, 마카롱', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sheet-half', name: '1/2 시트팬 (40×30cm)', category: '시트팬', type: 'square', dimensions: { length: 40, width: 30, height: 2.5 }, volume: 3000, notes: '대량 쿠키용', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'sheet-full', name: '풀 시트팬 (60×40cm)', category: '시트팬', type: 'square', dimensions: { length: 60, width: 40, height: 2.5 }, volume: 6000, notes: '업소용', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 마들렌/피낭시에/특수틀 ==========
  { id: 'madeleine-9', name: '마들렌틀 9구', category: '특수틀', type: 'round', dimensions: { diameter: 7, height: 2 }, volume: 693, notes: '조개 모양', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'madeleine-12', name: '마들렌틀 12구', category: '특수틀', type: 'round', dimensions: { diameter: 7, height: 2 }, volume: 924, notes: '조개 모양', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'financier-8', name: '피낭시에틀 8구', category: '특수틀', type: 'square', dimensions: { length: 8, width: 3.5, height: 2 }, volume: 448, notes: '금괴 모양', isFavorite: true, createdAt: new Date(), updatedAt: new Date() },
  { id: 'financier-12', name: '피낭시에틀 12구', category: '특수틀', type: 'square', dimensions: { length: 8, width: 3.5, height: 2 }, volume: 672, notes: '금괴 모양', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'gugelhupf-18', name: '구겔호프틀 (18cm)', category: '특수틀', type: 'round', dimensions: { diameter: 18, height: 9 }, volume: 2290, notes: '독일 전통 케이크', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'bundt-22', name: '번트케이크틀 (22cm)', category: '특수틀', type: 'round', dimensions: { diameter: 22, height: 10 }, volume: 3801, notes: '구멍 있는 링 케이크', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'savarin-18', name: '사바랭틀 (18cm)', category: '특수틀', type: 'round', dimensions: { diameter: 18, height: 5 }, volume: 1272, notes: '럼 시럽 케이크용', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },

  // ========== 바게트/특수 빵틀 ==========
  { id: 'baguette-2', name: '바게트틀 2열', category: '빵틀', type: 'loaf', dimensions: { length: 38, width: 16, height: 3 }, volume: 1824, notes: '2개 바게트', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'baguette-3', name: '바게트틀 3열', category: '빵틀', type: 'loaf', dimensions: { length: 38, width: 24, height: 3 }, volume: 2736, notes: '3개 바게트', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'brioche-mini', name: '미니 브리오슈틀 (6cm)', category: '빵틀', type: 'round', dimensions: { diameter: 6, height: 4 }, volume: 113, notes: '개인 브리오슈', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
  { id: 'brioche-12', name: '브리오슈틀 (12cm)', category: '빵틀', type: 'round', dimensions: { diameter: 12, height: 6 }, volume: 679, notes: '브리오슈 아 테트', isFavorite: false, createdAt: new Date(), updatedAt: new Date() },
]

const DEFAULT_PAN_SETTINGS: PanSettings = {
  myPans: DEFAULT_USER_PANS,
  fillRatioOverrides: {},
  manufacturerVariance: 0.03  // 3%
}

const DEFAULT_PRODUCT_SETTINGS: ProductVolumeSettings = {
  breadVolumes: {},   // 오버라이드만 저장 (기본값은 panScaling.ts 사용)
  cakeVolumes: {},
  customProducts: []
}

const DEFAULT_YIELD_LOSS_SETTINGS: YieldLossSettings = {
  categoryOverrides: {},
  productOverrides: {},
  enableEnvironmentAdjustment: true
}

const DEFAULT_METHOD_CONFIGS: Record<string, MethodConfig> = {
  straight: {
    id: 'straight',
    name: 'Straight Dough',
    nameKo: '스트레이트법',
    flourRatio: 0,
    waterRatio: 0,
    yeastAdjustment: 1.0,
    prefermentYeastRatio: 0,    // 사전반죽 없음
    prefermentTime: { min: 0, max: 0 },
    prefermentTemp: { min: 0, max: 0 },
    mainDoughTime: { min: 1, max: 2 },
    description: '모든 재료를 한 번에 믹싱'
  },
  sponge: {
    id: 'sponge',
    name: 'Sponge Method',
    nameKo: '중종법',
    flourRatio: 0.6,      // 60%
    waterRatio: 0.65,     // 65%
    yeastAdjustment: 0.75, // 전체 이스트 75%
    prefermentYeastRatio: 1.0,  // 전량 사전반죽에 (100%)
    prefermentTime: { min: 3, max: 5 },
    prefermentTemp: { min: 24, max: 26 },
    mainDoughTime: { min: 0.5, max: 1 },
    description: '밀가루 60%, 수분 65%로 중종 만들기'
  },
  poolish: {
    id: 'poolish',
    name: 'Poolish',
    nameKo: '폴리쉬법',
    flourRatio: 0.3,      // 30%
    waterRatio: 1.0,      // 100% (1:1)
    yeastAdjustment: 0.66, // 전체 이스트 66% (SFBI 권장)
    prefermentYeastRatio: 0.15, // 폴리쉬에 15% (극소량)
    prefermentTime: { min: 12, max: 16 },
    prefermentTemp: { min: 18, max: 21 },
    mainDoughTime: { min: 1, max: 2 },
    description: '밀가루와 물 1:1 비율의 액종'
  },
  biga: {
    id: 'biga',
    name: 'Biga',
    nameKo: '비가법',
    flourRatio: 0.4,      // 40%
    waterRatio: 0.55,     // 55%
    yeastAdjustment: 0.50, // 전체 이스트 50% (SFBI 권장)
    prefermentYeastRatio: 0.1,  // 비가에 10% (극소량)
    prefermentTime: { min: 12, max: 18 },
    prefermentTemp: { min: 16, max: 18 },
    mainDoughTime: { min: 1.5, max: 2.5 },
    description: '단단한 사전반죽 (이탈리아식)'
  },
  tangzhong: {
    id: 'tangzhong',
    name: 'Tangzhong (Water Roux)',
    nameKo: '탕종법',
    flourRatio: 0.1,      // 10% (전체 밀가루의 8-10%)
    waterRatio: 5.0,      // 500% (밀가루:물 = 1:5)
    yeastAdjustment: 1.0, // 이스트량 동일
    prefermentYeastRatio: 0,    // 탕종에 이스트 없음
    prefermentTime: { min: 0.5, max: 1 },  // 30분~1시간 (식히는 시간)
    prefermentTemp: { min: 65, max: 68 },  // 호화 온도
    mainDoughTime: { min: 1, max: 1.5 },
    description: '밀가루+물 1:5 비율로 65°C까지 호화'
  },
  levain: {
    id: 'levain',
    name: 'Levain/Sourdough',
    nameKo: '르방법',
    flourRatio: 0.2,      // 20%
    waterRatio: 1.0,      // 100%
    yeastAdjustment: 0,   // 상업 이스트 사용 안 함
    prefermentYeastRatio: 0,    // 상업 이스트 없음
    prefermentTime: { min: 4, max: 8 },
    prefermentTemp: { min: 24, max: 26 },
    mainDoughTime: { min: 3, max: 6 },
    description: '자연 발효종 사용'
  },
  coldFerment: {
    id: 'coldFerment',
    name: 'Cold Fermentation',
    nameKo: '저온발효',
    flourRatio: 0,
    waterRatio: 0,
    yeastAdjustment: 0.4,  // 40% (시간이 길어서 감량)
    prefermentYeastRatio: 0,    // 사전반죽 없음
    prefermentTime: { min: 12, max: 72 },
    prefermentTemp: { min: 2, max: 6 },
    mainDoughTime: { min: 1, max: 2 },
    description: '냉장고에서 장시간 발효'
  },
  retard: {
    id: 'retard',
    name: 'Retarding',
    nameKo: '저온숙성',
    flourRatio: 0,
    waterRatio: 0,
    yeastAdjustment: 1.0,  // 성형 후 숙성이라 동일
    prefermentYeastRatio: 0,    // 사전반죽 없음
    prefermentTime: { min: 8, max: 18 },
    prefermentTemp: { min: 2, max: 6 },
    mainDoughTime: { min: 0.5, max: 1 },
    description: '성형 후 냉장 숙성'
  },
  autolyse: {
    id: 'autolyse',
    name: 'Autolyse',
    nameKo: '오토리즈',
    flourRatio: 1.0,      // 100% (밀가루+물만)
    waterRatio: 1.0,      // 레시피 수분량
    yeastAdjustment: 1.0,
    prefermentYeastRatio: 0,    // 오토리즈에 이스트 없음
    prefermentTime: { min: 0.33, max: 1 },  // 20분~1시간
    prefermentTemp: { min: 20, max: 24 },
    mainDoughTime: { min: 1, max: 2 },
    description: '밀가루+물 휴지 후 나머지 재료 투입'
  }
}

const DEFAULT_METHOD_SETTINGS: MethodSettings = {
  methods: DEFAULT_METHOD_CONFIGS,
  yeastConversion: {
    fresh: 1.0,
    activeDry: 0.4,
    instant: 0.33
  },
  baseTemperature: 26,
  baseSaltPercent: 1.5
}

const DEFAULT_ENVIRONMENT_SETTINGS: EnvironmentSettings = {
  defaults: {
    temperature: 25,
    humidity: 60,
    altitude: 0
  },
  profiles: [
    { id: 'spring', name: '봄/가을', temperature: 20, humidity: 55, altitude: 0 },
    { id: 'summer', name: '여름', temperature: 28, humidity: 70, altitude: 0 },
    { id: 'winter', name: '겨울', temperature: 18, humidity: 45, altitude: 0 }
  ],
  activeProfileId: null,
  autoSeasonDetection: false,
  enableAltitudeAdjustment: true
}

const DEFAULT_INGREDIENT_SETTINGS: IngredientSettings = {
  customIngredients: [],
  moistureOverrides: {},
  costOverrides: {},        // 원가 오버라이드 (기본 데이터베이스 값 사용)
  nutritionOverrides: {},   // 영양 오버라이드 (기본 데이터베이스 값 사용)
  substitutions: [
    // 기본 대체 재료 관계
    { id: 'butter-oil', original: '버터', substitute: '식용유', ratio: 0.8, notes: '수분 16% 감안' },
    { id: 'milk-water', original: '우유', substitute: '물', ratio: 0.87, notes: '고형분 13% 감안' },
    { id: 'fresh-instant', original: '생이스트', substitute: '인스턴트이스트', ratio: 0.33, notes: '활성도 차이' },
    { id: 'sugar-honey', original: '설탕', substitute: '꿀', ratio: 0.77, notes: '단맛 지수 차이' }
  ]
}

const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  mixerFriction: {
    hand: 0,
    stand: 24,
    spiral: 22,
    planetary: 26
  },
  units: {
    weight: 'g',
    volume: 'ml',
    temperature: 'C'
  },
  precision: 1,
  expertMode: false
}

// 저장소 설정
export interface StorageSettings {
  type: 'browser' | 'filesystem'  // 브라우저 저장소 or 로컬 폴더
  directoryName: string | null    // 선택된 폴더 이름 (표시용)
  autoSave: boolean               // 자동 저장 활성화
  lastSavedAt: string | null      // 마지막 저장 시간
}

const DEFAULT_STORAGE_SETTINGS: StorageSettings = {
  type: 'browser',
  directoryName: null,
  autoSave: true,
  lastSavedAt: null
}

// ===== 스토어 인터페이스 =====

interface SettingsStore {
  // 상태
  pan: PanSettings
  product: ProductVolumeSettings
  yieldLoss: YieldLossSettings
  method: MethodSettings
  environment: EnvironmentSettings
  ingredient: IngredientSettings
  advanced: AdvancedSettings
  storage: StorageSettings

  // 팬 관리 액션
  addPan: (pan: Omit<UserPan, 'id' | 'createdAt' | 'updatedAt'>) => void
  updatePan: (id: string, updates: Partial<UserPan>) => void
  deletePan: (id: string) => void
  togglePanFavorite: (id: string) => void
  setFillRatioOverride: (productType: string, ratio: number) => void

  // 제품 설정 액션
  setVolumeOverride: (category: 'bread' | 'cake', product: string, volume: number) => void
  addCustomProduct: (product: ProductVolumeSettings['customProducts'][0]) => void
  deleteCustomProduct: (id: string) => void

  // 수율 손실 설정 액션
  setCategoryLossOverride: (category: string, rates: Partial<ProcessLossRates>) => void
  setProductLossOverride: (product: string, rates: Partial<ProcessLossRates>) => void
  setEnvironmentAdjustment: (enabled: boolean) => void

  // 제법 설정 액션
  updateMethod: (id: string, updates: Partial<MethodConfig>) => void
  setYeastConversion: (type: 'fresh' | 'activeDry' | 'instant', value: number) => void
  setBaseTemperature: (temp: number) => void
  setBaseSaltPercent: (percent: number) => void

  // 환경 설정 액션
  setEnvironmentDefaults: (defaults: Partial<EnvironmentSettings['defaults']>) => void
  addEnvironmentProfile: (profile: Omit<EnvironmentProfile, 'id'>) => void
  updateEnvironmentProfile: (id: string, updates: Partial<EnvironmentProfile>) => void
  deleteEnvironmentProfile: (id: string) => void
  setActiveProfile: (id: string | null) => void

  // 재료 설정 액션
  addCustomIngredient: (ingredient: Omit<CustomIngredient, 'id'>) => void
  deleteCustomIngredient: (id: string) => void
  setMoistureOverride: (ingredient: string, moisture: number) => void
  setCostOverride: (ingredient: string, cost: CostOverride) => void          // 원가 오버라이드
  setNutritionOverride: (ingredient: string, nutrition: NutritionOverride) => void  // 영양 오버라이드
  deleteCostOverride: (ingredient: string) => void
  deleteNutritionOverride: (ingredient: string) => void
  addSubstitution: (sub: Omit<IngredientSubstitution, 'id'>) => void
  deleteSubstitution: (id: string) => void
  // 재료 통합 조회 (기본 재료 + 커스텀 재료)
  getAllIngredientNames: () => string[]

  // 고급 설정 액션
  setMixerFriction: (type: keyof AdvancedSettings['mixerFriction'], value: number) => void
  setUnits: (units: Partial<AdvancedSettings['units']>) => void
  setPrecision: (precision: 0 | 1 | 2) => void
  setExpertMode: (enabled: boolean) => void

  // 저장소 설정 액션
  setStorageType: (type: 'browser' | 'filesystem') => void
  setStorageDirectory: (name: string | null) => void
  setAutoSave: (enabled: boolean) => void
  updateLastSaved: () => void

  // 유틸리티 액션
  exportSettings: () => string
  importSettings: (data: string) => boolean
  resetToDefaults: (section?: keyof AllSettings) => void
  resetAllSettings: () => void
}

// ===== 스토어 생성 =====

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // 초기 상태
      pan: DEFAULT_PAN_SETTINGS,
      product: DEFAULT_PRODUCT_SETTINGS,
      yieldLoss: DEFAULT_YIELD_LOSS_SETTINGS,
      method: DEFAULT_METHOD_SETTINGS,
      environment: DEFAULT_ENVIRONMENT_SETTINGS,
      ingredient: DEFAULT_INGREDIENT_SETTINGS,
      advanced: DEFAULT_ADVANCED_SETTINGS,
      storage: DEFAULT_STORAGE_SETTINGS,

      // ===== 팬 관리 액션 =====
      addPan: (panData) => {
        const newPan: UserPan = {
          ...panData,
          id: `pan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          isFavorite: panData.isFavorite ?? false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set(state => ({
          pan: { ...state.pan, myPans: [newPan, ...state.pan.myPans] }
        }))
      },

      updatePan: (id, updates) => {
        set(state => ({
          pan: {
            ...state.pan,
            myPans: state.pan.myPans.map(p =>
              p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
            )
          }
        }))
      },

      deletePan: (id) => {
        set(state => ({
          pan: { ...state.pan, myPans: state.pan.myPans.filter(p => p.id !== id) }
        }))
      },

      togglePanFavorite: (id) => {
        set(state => ({
          pan: {
            ...state.pan,
            myPans: state.pan.myPans.map(p =>
              p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
            )
          }
        }))
      },

      setFillRatioOverride: (productType, ratio) => {
        set(state => ({
          pan: {
            ...state.pan,
            fillRatioOverrides: { ...state.pan.fillRatioOverrides, [productType]: ratio }
          }
        }))
      },

      // ===== 제품 설정 액션 =====
      setVolumeOverride: (category, product, volume) => {
        set(state => ({
          product: {
            ...state.product,
            [category === 'bread' ? 'breadVolumes' : 'cakeVolumes']: {
              ...state.product[category === 'bread' ? 'breadVolumes' : 'cakeVolumes'],
              [product]: volume
            }
          }
        }))
      },

      addCustomProduct: (productData) => {
        const newProduct = {
          ...productData,
          id: `product-${Date.now()}`
        }
        set(state => ({
          product: {
            ...state.product,
            customProducts: [...state.product.customProducts, newProduct]
          }
        }))
      },

      deleteCustomProduct: (id) => {
        set(state => ({
          product: {
            ...state.product,
            customProducts: state.product.customProducts.filter(p => p.id !== id)
          }
        }))
      },

      // ===== 수율 손실 설정 액션 =====
      setCategoryLossOverride: (category, rates) => {
        set(state => ({
          yieldLoss: {
            ...state.yieldLoss,
            categoryOverrides: {
              ...state.yieldLoss.categoryOverrides,
              [category]: { ...state.yieldLoss.categoryOverrides[category as keyof typeof state.yieldLoss.categoryOverrides], ...rates }
            }
          }
        }))
      },

      setProductLossOverride: (product, rates) => {
        set(state => ({
          yieldLoss: {
            ...state.yieldLoss,
            productOverrides: { ...state.yieldLoss.productOverrides, [product]: rates }
          }
        }))
      },

      setEnvironmentAdjustment: (enabled) => {
        set(state => ({
          yieldLoss: { ...state.yieldLoss, enableEnvironmentAdjustment: enabled }
        }))
      },

      // ===== 제법 설정 액션 =====
      updateMethod: (id, updates) => {
        set(state => ({
          method: {
            ...state.method,
            methods: {
              ...state.method.methods,
              [id]: { ...state.method.methods[id], ...updates }
            }
          }
        }))
      },

      setYeastConversion: (type, value) => {
        set(state => ({
          method: {
            ...state.method,
            yeastConversion: { ...state.method.yeastConversion, [type]: value }
          }
        }))
      },

      setBaseTemperature: (temp) => {
        set(state => ({
          method: { ...state.method, baseTemperature: temp }
        }))
      },

      setBaseSaltPercent: (percent) => {
        set(state => ({
          method: { ...state.method, baseSaltPercent: percent }
        }))
      },

      // ===== 환경 설정 액션 =====
      setEnvironmentDefaults: (defaults) => {
        set(state => ({
          environment: {
            ...state.environment,
            defaults: { ...state.environment.defaults, ...defaults }
          }
        }))
      },

      addEnvironmentProfile: (profileData) => {
        const newProfile: EnvironmentProfile = {
          ...profileData,
          id: `profile-${Date.now()}`
        }
        set(state => ({
          environment: {
            ...state.environment,
            profiles: [...state.environment.profiles, newProfile]
          }
        }))
      },

      updateEnvironmentProfile: (id, updates) => {
        set(state => ({
          environment: {
            ...state.environment,
            profiles: state.environment.profiles.map(p =>
              p.id === id ? { ...p, ...updates } : p
            )
          }
        }))
      },

      deleteEnvironmentProfile: (id) => {
        set(state => ({
          environment: {
            ...state.environment,
            profiles: state.environment.profiles.filter(p => p.id !== id),
            activeProfileId: state.environment.activeProfileId === id ? null : state.environment.activeProfileId
          }
        }))
      },

      setActiveProfile: (id) => {
        set(state => ({
          environment: { ...state.environment, activeProfileId: id }
        }))
      },

      // ===== 재료 설정 액션 =====
      addCustomIngredient: (ingredientData) => {
        const newIngredient: CustomIngredient = {
          ...ingredientData,
          id: `ingredient-${Date.now()}`
        }
        set(state => ({
          ingredient: {
            ...state.ingredient,
            customIngredients: [...state.ingredient.customIngredients, newIngredient]
          }
        }))
      },

      deleteCustomIngredient: (id) => {
        set(state => ({
          ingredient: {
            ...state.ingredient,
            customIngredients: state.ingredient.customIngredients.filter(i => i.id !== id)
          }
        }))
      },

      setMoistureOverride: (ingredientName, moisture) => {
        set(state => ({
          ingredient: {
            ...state.ingredient,
            moistureOverrides: { ...state.ingredient.moistureOverrides, [ingredientName]: moisture }
          }
        }))
      },

      // 원가 오버라이드 설정
      setCostOverride: (ingredientName, cost) => {
        set(state => ({
          ingredient: {
            ...state.ingredient,
            costOverrides: { ...state.ingredient.costOverrides, [ingredientName]: cost }
          }
        }))
      },

      // 영양 오버라이드 설정
      setNutritionOverride: (ingredientName, nutrition) => {
        set(state => ({
          ingredient: {
            ...state.ingredient,
            nutritionOverrides: { ...state.ingredient.nutritionOverrides, [ingredientName]: nutrition }
          }
        }))
      },

      // 원가 오버라이드 삭제
      deleteCostOverride: (ingredientName) => {
        set(state => {
          const { [ingredientName]: _, ...rest } = state.ingredient.costOverrides
          return {
            ingredient: {
              ...state.ingredient,
              costOverrides: rest
            }
          }
        })
      },

      // 영양 오버라이드 삭제
      deleteNutritionOverride: (ingredientName) => {
        set(state => {
          const { [ingredientName]: _, ...rest } = state.ingredient.nutritionOverrides
          return {
            ingredient: {
              ...state.ingredient,
              nutritionOverrides: rest
            }
          }
        })
      },

      addSubstitution: (subData) => {
        const newSub: IngredientSubstitution = {
          ...subData,
          id: `sub-${Date.now()}`
        }
        set(state => ({
          ingredient: {
            ...state.ingredient,
            substitutions: [...state.ingredient.substitutions, newSub]
          }
        }))
      },

      deleteSubstitution: (id) => {
        set(state => ({
          ingredient: {
            ...state.ingredient,
            substitutions: state.ingredient.substitutions.filter(s => s.id !== id)
          }
        }))
      },

      // 재료 통합 조회: 기본 재료 + 커스텀 재료 (중복 제거)
      getAllIngredientNames: () => {
        const state = get()
        const customNames = state.ingredient.customIngredients.map(i => i.name)
        const customAliases = state.ingredient.customIngredients.flatMap(i => i.aliases || [])
        // 기본 재료 + 커스텀 재료 이름 + 커스텀 별칭 (중복 제거)
        const allNames = [...PRIMARY_INGREDIENT_NAMES, ...customNames, ...customAliases]
        return [...new Set(allNames)]
      },

      // ===== 고급 설정 액션 =====
      setMixerFriction: (type, value) => {
        set(state => ({
          advanced: {
            ...state.advanced,
            mixerFriction: { ...state.advanced.mixerFriction, [type]: value }
          }
        }))
      },

      setUnits: (units) => {
        set(state => ({
          advanced: {
            ...state.advanced,
            units: { ...state.advanced.units, ...units }
          }
        }))
      },

      setPrecision: (precision) => {
        set(state => ({
          advanced: { ...state.advanced, precision }
        }))
      },

      setExpertMode: (enabled) => {
        set(state => ({
          advanced: { ...state.advanced, expertMode: enabled }
        }))
      },

      // ===== 저장소 설정 액션 =====
      setStorageType: (type) => {
        set(state => ({
          storage: { ...state.storage, type }
        }))
      },

      setStorageDirectory: (name) => {
        set(state => ({
          storage: {
            ...state.storage,
            directoryName: name,
            type: name ? 'filesystem' : 'browser'
          }
        }))
      },

      setAutoSave: (enabled) => {
        set(state => ({
          storage: { ...state.storage, autoSave: enabled }
        }))
      },

      updateLastSaved: () => {
        set(state => ({
          storage: { ...state.storage, lastSavedAt: new Date().toISOString() }
        }))
      },

      // ===== 유틸리티 액션 =====
      exportSettings: () => {
        const { pan, product, yieldLoss, method, environment, ingredient, advanced } = get()
        return JSON.stringify({
          pan, product, yieldLoss, method, environment, ingredient, advanced,
          exportedAt: new Date().toISOString(),
          version: '1.0'
        }, null, 2)
      },

      importSettings: (data) => {
        try {
          const parsed = JSON.parse(data)
          set({
            pan: { ...DEFAULT_PAN_SETTINGS, ...parsed.pan },
            product: { ...DEFAULT_PRODUCT_SETTINGS, ...parsed.product },
            yieldLoss: { ...DEFAULT_YIELD_LOSS_SETTINGS, ...parsed.yieldLoss },
            method: { ...DEFAULT_METHOD_SETTINGS, ...parsed.method },
            environment: { ...DEFAULT_ENVIRONMENT_SETTINGS, ...parsed.environment },
            ingredient: { ...DEFAULT_INGREDIENT_SETTINGS, ...parsed.ingredient },
            advanced: { ...DEFAULT_ADVANCED_SETTINGS, ...parsed.advanced }
          })
          return true
        } catch {
          return false
        }
      },

      resetToDefaults: (section) => {
        if (!section) return
        const defaults: Record<string, any> = {
          pan: DEFAULT_PAN_SETTINGS,
          product: DEFAULT_PRODUCT_SETTINGS,
          yieldLoss: DEFAULT_YIELD_LOSS_SETTINGS,
          method: DEFAULT_METHOD_SETTINGS,
          environment: DEFAULT_ENVIRONMENT_SETTINGS,
          ingredient: DEFAULT_INGREDIENT_SETTINGS,
          advanced: DEFAULT_ADVANCED_SETTINGS
        }
        set({ [section]: defaults[section] })
      },

      resetAllSettings: () => {
        set({
          pan: DEFAULT_PAN_SETTINGS,
          product: DEFAULT_PRODUCT_SETTINGS,
          yieldLoss: DEFAULT_YIELD_LOSS_SETTINGS,
          method: DEFAULT_METHOD_SETTINGS,
          environment: DEFAULT_ENVIRONMENT_SETTINGS,
          ingredient: DEFAULT_INGREDIENT_SETTINGS,
          advanced: DEFAULT_ADVANCED_SETTINGS
        })
      }
    }),
    {
      name: 'recipe-settings-storage',
      version: 5,  // v1→v2: 기본 팬, v2→v3: 원가/영양, v3→v4: 저장소 설정, v4→v5: prefermentYeastRatio
      migrate: (persistedState: any, version: number) => {
        let state = persistedState

        if (version < 2) {
          // v1에서 v2로 마이그레이션: 팬이 없으면 기본 팬 추가
          if (!state.pan?.myPans || state.pan.myPans.length === 0) {
            state = {
              ...state,
              pan: {
                ...DEFAULT_PAN_SETTINGS,
                ...state.pan,
                myPans: DEFAULT_USER_PANS
              }
            }
          }
        }

        if (version < 3) {
          // v2에서 v3로 마이그레이션: 원가/영양 오버라이드 필드 추가
          state = {
            ...state,
            ingredient: {
              ...DEFAULT_INGREDIENT_SETTINGS,
              ...state.ingredient,
              costOverrides: state.ingredient?.costOverrides || {},
              nutritionOverrides: state.ingredient?.nutritionOverrides || {}
            }
          }
        }

        if (version < 4) {
          // v3에서 v4로 마이그레이션: 저장소 설정 추가
          state = {
            ...state,
            storage: DEFAULT_STORAGE_SETTINGS
          }
        }

        if (version < 5) {
          // v4에서 v5로 마이그레이션: method.methods에 prefermentYeastRatio 추가
          // 기존 사용자의 method 설정에 새 필드 추가
          const existingMethods = state.method?.methods || {}
          const updatedMethods: Record<string, any> = {}

          // DEFAULT_METHOD_CONFIGS의 모든 제법에 대해 prefermentYeastRatio 보장
          Object.keys(DEFAULT_METHOD_CONFIGS).forEach(key => {
            updatedMethods[key] = {
              ...DEFAULT_METHOD_CONFIGS[key],
              ...existingMethods[key],
              // prefermentYeastRatio가 없으면 기본값 사용
              prefermentYeastRatio: existingMethods[key]?.prefermentYeastRatio
                ?? DEFAULT_METHOD_CONFIGS[key].prefermentYeastRatio
            }
          })

          state = {
            ...state,
            method: {
              ...DEFAULT_METHOD_SETTINGS,
              ...state.method,
              methods: updatedMethods
            }
          }
        }

        return state
      }
    }
  )
)

// ===== 유틸리티 함수 =====

/**
 * 온도에 따른 발효 시간 계수 계산
 */
export function calculateFermentationTimeCoefficient(
  actualTemp: number,
  baseTemp: number = 26
): number {
  return Math.pow(2, (actualTemp - baseTemp) / 10)
}

/**
 * 소금 농도에 따른 발효 시간 계수 계산
 */
export function calculateSaltTimeCoefficient(
  saltPercent: number,
  baseSaltPercent: number = 1.5
): number {
  const diff = saltPercent - baseSaltPercent
  return 1 / (1 - diff * 0.15)
}

/**
 * 수화율에 따른 이스트 조정 계수 계산
 */
export function calculateHydrationYeastCoefficient(
  hydration: number,
  baseHydration: number = 65
): number {
  return 1 + (hydration - baseHydration) * 0.002
}

/**
 * 종합 발효 시간 계산
 */
export function calculateAdjustedFermentationTime(
  baseTime: number,
  options: {
    actualTemp?: number
    baseTemp?: number
    saltPercent?: number
    baseSaltPercent?: number
    hydration?: number
  }
): number {
  const {
    actualTemp = 26,
    baseTemp = 26,
    saltPercent = 1.5,
    baseSaltPercent = 1.5,
    hydration = 65
  } = options

  const tempCoef = calculateFermentationTimeCoefficient(actualTemp, baseTemp)
  const saltCoef = calculateSaltTimeCoefficient(saltPercent, baseSaltPercent)
  const hydrationCoef = calculateHydrationYeastCoefficient(hydration)

  return baseTime / tempCoef * saltCoef / hydrationCoef
}
