/**
 * 제과제빵 레시피 타입 정의
 * 베이커리 도메인 전문 용어와 실무 계산 로직을 반영한 타입 시스템
 */

// ===== 기본 단위 타입 =====
export type WeightUnit = 'g' | 'kg' | 'oz' | 'lb';
export type VolumeUnit = 'ml' | 'L' | 'cup' | 'tbsp' | 'tsp';
export type TemperatureUnit = 'C' | 'F';
export type TimeUnit = 'min' | 'hour' | 'day';

// ===== 재료 관련 타입 =====
export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  amount: number;
  unit: WeightUnit | VolumeUnit;
  bakersPercentage?: number; // 베이커스 퍼센트
  hydration?: number; // 수분함량 (%)
  protein?: number; // 단백질 함량 (%) - 글루텐 형성 예측용
  temperature?: number; // 재료 온도 (DDT 계산용)
  isFlour?: boolean; // 밀가루 여부 (베이커스 퍼센트 기준)
  alternatives?: AlternativeIngredient[]; // 대체 재료
}

export interface AlternativeIngredient {
  name: string;
  ratio: number; // 대체 비율
  notes?: string; // 대체시 주의사항
}

export type IngredientCategory = 
  | 'flour' // 밀가루류
  | 'liquid' // 액체류
  | 'fat' // 유지류
  | 'sugar' // 당류
  | 'egg' // 계란류
  | 'dairy' // 유제품류
  | 'leavening' // 팽창제
  | 'salt' // 소금
  | 'flavoring' // 향료/첨가물
  | 'other'; // 기타

// ===== 제법 관련 타입 =====
export type BreadMethod =
  | 'straight'    // 스트레이트법
  | 'sponge'      // 중종법
  | 'poolish'     // 폴리쉬법
  | 'biga'        // 비가법
  | 'tangzhong'   // 탕종법 (Water Roux)
  | 'autolyse'    // 오토리즈 (자가분해법)
  | 'overnight'   // 저온숙성법
  | 'no-time'     // 노타임법
  | 'sourdough';  // 사워도우/르방

// ===== 재료 단계(Phase) 관련 타입 =====
export type PhaseType =
  | 'preferment'  // 사전반죽 (폴리쉬, 비가, 르방 등)
  | 'tangzhong'   // 탕종 (별도 분리 - 호화 과정 필요)
  | 'autolyse'    // 오토리즈 (밀가루+물만)
  | 'main'        // 본반죽
  | 'topping'     // 토핑 (크럼블, 견과류 등)
  | 'filling'     // 충전물 (크림, 앙금 등)
  | 'frosting'    // 프로스팅/아이싱
  | 'glaze'       // 글레이즈
  | 'other';      // 기타

export interface IngredientPhase {
  id: string;
  name: string;           // "탕종", "폴리쉬", "본반죽", "크림치즈 필링"
  nameKo?: string;        // 한글명
  type: PhaseType;
  ingredients: Ingredient[];
  steps?: ProcessStep[];  // 해당 단계의 공정
  order: number;          // 단계 순서 (0: 가장 먼저)
  // 단계별 특수 설정
  fermentationTime?: TimeRange;
  fermentationTemp?: TemperatureRange;
  notes?: string;
}

export interface MethodConfig {
  method: BreadMethod;
  prefermentRatio: number; // 전체 밀가루 대비 종법 비율 (%)
  fermentationTime: {
    preferment?: TimeRange; // 종법 발효 시간
    bulk: TimeRange; // 1차 발효
    final: TimeRange; // 2차 발효
  };
  temperature: {
    preferment?: TemperatureRange;
    bulk: TemperatureRange;
    final: TemperatureRange;
  };
}

// ===== 팬/틀 관련 타입 =====
export interface PanConfig {
  id: string;
  name: string;
  type: PanType;
  dimensions: PanDimensions;
  volume: number; // ml
  material: PanMaterial;
  coating?: string; // 코팅 종류
  fillRatio: number; // 권장 충전율 (0.6-0.8)
}

export type PanType = 
  | 'round' | 'square' | 'rectangular' | 'loaf'
  | 'muffin' | 'bundt' | 'springform' | 'sheet'
  | 'baguette' | 'pullman' | 'tube' | 'tart';

export type PanMaterial = 
  | 'aluminum' | 'steel' | 'silicone' | 'glass' | 'ceramic';

export interface PanDimensions {
  length?: number; // mm
  width?: number; // mm
  diameter?: number; // mm
  height: number; // mm
  angle?: number; // 경사각 (도)
}

// ===== 레시피 관련 타입 =====
export interface Recipe {
  id: string;
  name: string;
  nameKo?: string; // 한글명
  productType: 'bread' | 'pastry'; // 🆕 제품 타입 (제빵/제과 구분)
  category: RecipeCategory;
  type: RecipeType;
  difficulty: DifficultyLevel;
  
  // 기본 정보
  yield: RecipeYield;
  servings: number;
  prepTime: number; // 분
  bakingTime: number; // 분
  totalTime: number; // 분
  
  // 재료 (단계별 구조)
  phases?: IngredientPhase[];      // 단계별 재료 그룹 (탕종, 본반죽, 토핑 등)
  ingredients: Ingredient[];       // 평탄화된 전체 재료 (기존 호환용)
  totalWeight?: number;            // 총 반죽 중량 (g)
  totalHydration?: number;         // 총 수분율 (%)
  
  // 제법
  method: MethodConfig;
  originalMethod?: BreadMethod;     // 원본 레시피 제법 (변환 시 원본 추적용)
  
  // 오븐 설정
  ovenSettings: OvenSettings;
  
  // 팬 정보
  panConfig: PanConfig;
  
  // 공정
  steps: ProcessStep[];
  
  // 메타데이터
  tags: string[];
  notes?: string;
  tips?: string[];
  troubleshooting?: TroubleshootingGuide[];

  // 출처 정보
  source?: RecipeSource;
  
  // 영양 정보 (optional)
  nutrition?: NutritionInfo;
  
  // 원가 정보 (optional)
  costing?: CostingInfo;
  
  createdAt: Date;
  updatedAt: Date;
}

export type RecipeCategory = 
  | 'bread' | 'pastry' | 'cake' | 'cookie' 
  | 'dessert' | 'confectionery' | 'savory';

export type RecipeType = 
  | 'yeast' | 'quick-bread' | 'laminated' | 'choux' 
  | 'sponge-cake' | 'butter-cake' | 'meringue';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional';

export interface RecipeYield {
  quantity: number;
  unit: string; // '개', 'g', 'kg', '조각' 등
  pieceWeight?: number; // 개당 중량 (g)
}

// ===== 공정 관련 타입 =====
export interface ProcessStep {
  id: string;
  order: number;
  action?: ProcessAction;
  instruction?: string; // 간단한 텍스트 설명
  instructionEn?: string; // English instruction
  description?: string; // 상세 설명
  descriptionEn?: string; // English description
  duration?: TimeRange;
  temperature?: TemperatureRange;
  targetState?: TargetState;
  checkpoints?: QualityCheckpoint[];
  tips?: string;
  tipsEn?: string;
  warnings?: string[];
}

export type ProcessAction = 
  | 'mix' | 'knead' | 'rest' | 'ferment' | 'punch-down'
  | 'divide' | 'shape' | 'proof' | 'score' | 'bake'
  | 'cool' | 'glaze' | 'decorate';

export interface TargetState {
  description: string;
  visualCue?: string; // 시각적 판단 기준
  tactileCue?: string; // 촉각적 판단 기준
  windowPane?: boolean; // 글루텐 막 테스트
  fingerTest?: boolean; // 손가락 테스트
}

export interface QualityCheckpoint {
  criteria: string;
  expectedValue: string | number;
  tolerance?: number; // 허용 오차 (%)
}

// ===== 오븐 설정 타입 =====
export interface OvenSettings {
  temperature: number; // 도씨
  mode: OvenMode;
  steamDuration?: number; // 스팀 시간 (분)
  ventOpen?: number; // 댐퍼 오픈 시간 (분)
  rotateTime?: number; // 회전 시간 (분)
  preheating: boolean;
  deck?: 'top' | 'middle' | 'bottom';
}

export type OvenMode = 
  | 'convection' // 컨벡션
  | 'conventional' // 일반
  | 'steam' // 스팀
  | 'combination'; // 콤비

// ===== 계산 관련 타입 =====
export interface DDTCalculation {
  targetTemp: number; // 목표 반죽 온도
  flourTemp: number; // 밀가루 온도
  roomTemp: number; // 실온
  waterTemp?: number; // 계산된 물 온도
  frictionFactor: number; // 마찰계수
}

export interface BakersPercentageCalculation {
  totalFlour: number; // 총 밀가루량 (g)
  ingredients: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  totalPercentage: number;
  hydration: number; // 수분율
}

// ===== 영양 정보 타입 =====
export interface NutritionInfo {
  servingSize: number; // g
  calories: number;
  protein: number; // g
  carbohydrates: number; // g
  fat: number; // g
  fiber: number; // g
  sugar: number; // g
  sodium: number; // mg
  cholesterol: number; // mg
}

// ===== 원가 관련 타입 =====
export interface CostingInfo {
  ingredientCost: number; // 재료비
  laborCost?: number; // 인건비
  overheadCost?: number; // 간접비
  totalCost: number; // 총 원가
  sellingPrice?: number; // 판매가
  margin?: number; // 마진율 (%)
  currency: 'KRW' | 'USD' | 'EUR';
}

// ===== 문제 해결 가이드 타입 =====
export interface TroubleshootingGuide {
  problem: string;
  possibleCauses: string[];
  solutions: string[];
  prevention?: string;
}

// ===== 유틸리티 타입 =====
export interface TimeRange {
  min: number;
  max: number;
  unit: TimeUnit;
}

export interface TemperatureRange {
  min: number;
  max: number;
  unit: TemperatureUnit;
}

// ===== 변환 관련 타입 =====
export interface ConversionRequest {
  recipe: Recipe;
  targetYield?: number; // 목표 생산량
  targetPan?: PanConfig; // 목표 팬
  targetMethod?: BreadMethod; // 목표 제법
  scaleFactor?: number; // 스케일 팩터
}

export interface ConversionResult {
  original: Recipe;
  converted: Recipe;
  changes: ConversionChange[];
  warnings?: string[];
  suggestions?: string[];
}

export interface ConversionChange {
  field: string;
  from: any;
  to: any;
  reason?: string;
}

// ===== 출처 정보 타입 =====
export interface RecipeSource {
  name: string;           // 출처 이름 (유튜버명, 책 이름 등)
  type: SourceType;       // 출처 유형
  url?: string;           // 출처 URL (유튜브, 블로그 등)
  author?: string;        // 원작자 이름
  publishedAt?: Date;     // 원본 게시일
}

export type SourceType =
  | 'youtube'     // 유튜브
  | 'blog'        // 블로그
  | 'book'        // 책/서적
  | 'website'     // 웹사이트
  | 'personal'    // 개인 레시피
  | 'school'      // 제과제빵 학교/학원
  | 'other';      // 기타