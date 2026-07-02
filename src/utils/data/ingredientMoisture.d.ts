/**
 * ingredientMoisture.js(순수 JS 데이터 모듈)에 대한 타입 선언.
 * 런타임 구현은 .js 파일에 있으며, 여기서는 공개 API의 타입만 기술한다.
 */

export interface IngredientMoistureInfo {
  moisture: number;
  category: string;
}

export const ingredientMoisture: Record<string, IngredientMoistureInfo>;

/** 재료의 실제 수분량 계산 */
export function calculateMoisture(ingredientName: string, amount: number): number;

/** 재료가 액체인지 판별 */
export function isLiquidIngredient(ingredientName: string, ingredientType?: string): boolean;

declare const _default: typeof ingredientMoisture;
export default _default;
