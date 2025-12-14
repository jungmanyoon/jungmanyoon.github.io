/**
 * 설정 관리 타입 정의
 * 사용자 커스터마이징을 위한 모든 설정 타입
 */

// ===== 팬/틀 설정 =====
export interface UserPan {
  id: string
  name: string              // "우리집 식빵틀"
  category: string          // "식빵팬", "케이크팬" 등
  type: string              // "풀먼식빵팬", "원형팬" 등
  volume: number            // 부피 (ml)
  dimensions?: {
    length?: number         // 길이 (cm)
    width?: number          // 너비 (cm)
    height?: number         // 높이 (cm)
    diameter?: number       // 지름 (cm)
    innerDiameter?: number  // 내경 (쉬폰팬용)
  }
  fillRatio?: number        // 커스텀 충전율 (0.0~1.0)
  notes?: string
  isFavorite: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PanSettings {
  myPans: UserPan[]
  fillRatioOverrides: Record<string, number>  // 제품타입별 충전율 오버라이드
  manufacturerVariance: number                 // 제조사 오차 (기본 3%)
}

// ===== 제품 설정 =====
export interface ProductVolumeSettings {
  // 비용적 오버라이드
  breadVolumes: Record<string, number>
  cakeVolumes: Record<string, number>
  // 커스텀 제품
  customProducts: {
    id: string
    name: string
    specificVolume: number
    category: 'bread' | 'cake' | 'pastry' | 'other'
  }[]
}

export interface ProcessLossRates {
  mixing: number
  fermentation: number
  dividing: number
  shaping: number
  baking: number
  cooling: number
}

export interface YieldLossSettings {
  // 카테고리별 기본 손실률 오버라이드
  categoryOverrides: {
    bread?: Partial<ProcessLossRates>
    cake?: Partial<ProcessLossRates>
    pastry?: Partial<ProcessLossRates>
    cookie?: Partial<ProcessLossRates>
  }
  // 제품별 손실률 오버라이드
  productOverrides: Record<string, Partial<ProcessLossRates>>
  // 환경 조정 활성화
  enableEnvironmentAdjustment: boolean
}

// ===== 제법 설정 =====
export interface MethodConfig {
  id: string
  name: string
  nameKo: string
  flourRatio: number        // 사전반죽 밀가루 비율 (0.0~1.0)
  waterRatio: number        // 사전반죽 수분 비율 (베이커스 %)
  yeastAdjustment: number   // 전체 이스트 조정 계수 (1.0 = 100%)
  prefermentYeastRatio: number  // 사전반죽에 들어가는 이스트 비율 (0.0~1.0)
  prefermentTime: {
    min: number             // 최소 시간 (시간)
    max: number             // 최대 시간 (시간)
  }
  prefermentTemp: {
    min: number             // 최소 온도 (°C)
    max: number             // 최대 온도 (°C)
  }
  mainDoughTime: {
    min: number
    max: number
  }
  description?: string
}

export interface YeastConversion {
  fresh: number             // 생이스트 (기준 1.0)
  activeDry: number         // 활성 건조 이스트
  instant: number           // 인스턴트 이스트
}

export interface MethodSettings {
  methods: Record<string, MethodConfig>
  yeastConversion: YeastConversion
  // 발효 시간 계산용 기준값
  baseTemperature: number   // 기준 온도 (26°C)
  baseSaltPercent: number   // 기준 소금 비율 (1.5%)
}

// ===== 환경 설정 =====
export interface EnvironmentProfile {
  id: string
  name: string
  temperature: number
  humidity: number
  altitude: number
  isDefault?: boolean
}

export interface EnvironmentSettings {
  defaults: {
    temperature: number     // 기준 온도 (°C)
    humidity: number        // 기준 습도 (%)
    altitude: number        // 고도 (m)
  }
  profiles: EnvironmentProfile[]
  activeProfileId: string | null
  autoSeasonDetection: boolean
  enableAltitudeAdjustment: boolean
}

// ===== 재료 설정 =====
export interface CustomIngredient {
  id: string
  name: string
  category: 'flour' | 'liquid' | 'fat' | 'sugar' | 'egg' | 'dairy' | 'leavening' | 'salt' | 'flavoring' | 'nut' | 'fruit' | 'chocolate' | 'other'
  aliases?: string[]
  moisture?: number
  isFlour?: boolean
}

export interface IngredientSubstitution {
  id: string
  original: string
  substitute: string
  ratio: number             // 대체 비율 (예: 버터→오일 = 0.8)
  notes?: string
}

// 원가 오버라이드 (재료별)
export interface CostOverride {
  retailPrice?: number      // 소매가 (원/kg 또는 원/L)
  wholesalePrice?: number   // 도매가
  bulkPrice?: number        // 대량구매가
}

// 영양 오버라이드 (재료별, 100g 기준)
export interface NutritionOverride {
  calories?: number         // kcal
  protein?: number          // g
  carbohydrates?: number    // g
  fat?: number              // g
  sugar?: number            // g
  sodium?: number           // mg
}

export interface IngredientSettings {
  customIngredients: CustomIngredient[]
  moistureOverrides: Record<string, number>
  costOverrides: Record<string, CostOverride>          // 원가 오버라이드
  nutritionOverrides: Record<string, NutritionOverride> // 영양 오버라이드
  substitutions: IngredientSubstitution[]
}

// ===== 고급 설정 =====
export interface MixerFriction {
  hand: number
  stand: number
  spiral: number
  planetary: number
  custom?: number
}

export interface AdvancedSettings {
  mixerFriction: MixerFriction
  units: {
    weight: 'g' | 'oz'
    volume: 'ml' | 'cup'
    temperature: 'C' | 'F'
  }
  precision: 0 | 1 | 2
  expertMode: boolean
}

// ===== 전체 설정 타입 =====
export interface AllSettings {
  pan: PanSettings
  product: ProductVolumeSettings
  yieldLoss: YieldLossSettings
  method: MethodSettings
  environment: EnvironmentSettings
  ingredient: IngredientSettings
  advanced: AdvancedSettings
}
