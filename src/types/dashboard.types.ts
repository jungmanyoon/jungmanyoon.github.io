/**
 * 통합 대시보드 타입 정의
 * 레시피 변환 워크플로우를 위한 타입 시스템
 */

import type {
  Recipe,
  Ingredient,
  PanConfig,
  BreadMethod,
  RecipeYield
} from './recipe.types'

// ===== 패널 상태 =====
export type PanelPosition = 'left' | 'center' | 'right'
export type PanelState = 'expanded' | 'collapsed' | 'hidden'

export interface PanelConfig {
  position: PanelPosition
  state: PanelState
  width: number | string
}

// ===== 변환 설정 =====
export interface ConversionConfig {
  // 팬 스케일링
  targetPan: PanConfig | null
  panScaleFactor: number

  // 제법 변환
  targetMethod: BreadMethod | null
  methodOptions: MethodConversionOptions

  // 수량/생산량
  batchMultiplier: number
  targetYield: TargetYield | null

  // DDT (반죽 목표 온도)
  ddtSettings: DDTSettings | null

  // 환경 조정
  environment: EnvironmentSettings | null
}

export interface MethodConversionOptions {
  prefermentRatio?: number // 0-1 (종법 비율)
  fermentationTime?: number // hours
  hydrationAdjustment?: number // % 조정
}

export interface TargetYield {
  mode: 'quantity' | 'weight' | 'servings'
  value: number
  pieceWeight?: number
}

export interface DDTSettings {
  targetTemp: number
  flourTemp: number
  roomTemp: number
  prefermentTemp?: number
  frictionFactor: number
  includePreferment: boolean
}

export interface EnvironmentSettings {
  temperature: number // Celsius
  humidity: number // %
  altitude: number // meters
}

// ===== 변환 결과 =====
export interface ConversionDiff {
  ingredientId: string
  ingredientName: string
  originalAmount: number
  convertedAmount: number
  percentChange: number
  changeType: 'increase' | 'decrease' | 'unchanged' | 'new' | 'removed'
  unit: string
}

export interface ConversionSummary {
  totalOriginalWeight: number
  totalConvertedWeight: number
  scaleFactor: number
  hydrationOriginal: number
  hydrationConverted: number
  activeConversions: ActiveConversion[]
  warnings: ConversionWarning[]
}

export interface ActiveConversion {
  type: 'pan' | 'method' | 'quantity' | 'ddt' | 'environment'
  label: string
  labelKo: string
  impact: string
  icon: string
}

export interface ConversionWarning {
  severity: 'info' | 'warning' | 'error'
  message: string
  messageKo: string
  field?: string
}

// ===== 히스토리 (Undo/Redo) =====
export interface ConversionHistoryEntry {
  id: string
  timestamp: Date
  config: ConversionConfig
  label: string
  labelKo: string
}

// ===== 대시보드 스토어 상태 =====
export interface DashboardState {
  // 원본 레시피
  sourceRecipeId: string | null
  sourceRecipe: Recipe | null

  // 변환 설정
  conversionConfig: ConversionConfig

  // 실시간 변환 결과
  convertedRecipe: Recipe | null
  conversionDiffs: ConversionDiff[]
  conversionSummary: ConversionSummary | null

  // 패널 상태
  selectorPanelState: PanelState
  toolsPanelState: PanelState

  // 히스토리
  history: ConversionHistoryEntry[]
  historyIndex: number

  // 미리보기 설정
  isPreviewEnabled: boolean
  previewDebounceMs: number

  // UI 상태
  isCalculating: boolean
  lastCalculatedAt: Date | null
  activeToolTab: 'pan' | 'method' | 'quantity' | 'ddt' | 'environment'
}

// ===== 대시보드 액션 =====
export interface DashboardActions {
  // 레시피 선택
  selectSourceRecipe: (recipe: Recipe | null) => void
  clearSourceRecipe: () => void

  // 변환 설정 업데이트
  updatePanConfig: (pan: PanConfig) => void
  updateMethodConfig: (method: BreadMethod, options?: MethodConversionOptions) => void
  updateQuantity: (multiplier: number) => void
  updateTargetYield: (yield_: TargetYield) => void
  updateDDT: (settings: DDTSettings) => void
  updateEnvironment: (config: EnvironmentSettings) => void

  // 복합 업데이트
  applyConversionConfig: (config: Partial<ConversionConfig>) => void

  // 히스토리
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  // 결과 저장
  saveAsNewRecipe: (name?: string) => Promise<string>

  // 패널 관리
  toggleSelectorPanel: () => void
  toggleToolsPanel: () => void
  setActiveToolTab: (tab: DashboardState['activeToolTab']) => void

  // 초기화
  resetConversion: () => void

  // 실시간 계산
  recalculate: () => void
}

// ===== 컴포넌트 Props =====
export interface DashboardLayoutProps {
  initialRecipeId?: string
}

export interface RecipeSelectorPanelProps {
  isCollapsed: boolean
  onToggle: () => void
  onSelectRecipe: (recipe: Recipe) => void
  selectedRecipeId: string | null
}

export interface ComparisonWorkspaceProps {
  sourceRecipe: Recipe | null
  convertedRecipe: Recipe | null
  diffs: ConversionDiff[]
  summary: ConversionSummary | null
  isCalculating: boolean
}

export interface ConversionToolbarProps {
  isCollapsed: boolean
  onToggle: () => void
  config: ConversionConfig
  sourceRecipe: Recipe | null
  activeTab: DashboardState['activeToolTab']
  onTabChange: (tab: DashboardState['activeToolTab']) => void
}

export interface QuickToolCardProps {
  title: string
  titleKo: string
  icon: string
  isActive: boolean
  children: React.ReactNode
}

export interface ActionBarProps {
  canUndo: boolean
  canRedo: boolean
  hasChanges: boolean
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onReset: () => void
  onExport: () => void
}

// ===== 기본값 =====
export const DEFAULT_CONVERSION_CONFIG: ConversionConfig = {
  targetPan: null,
  panScaleFactor: 1,
  targetMethod: null,
  methodOptions: {},
  batchMultiplier: 1,
  targetYield: null,
  ddtSettings: null,
  environment: null,
}

export const DEFAULT_PANEL_CONFIG = {
  selector: { position: 'left' as const, state: 'expanded' as const, width: 280 },
  tools: { position: 'right' as const, state: 'expanded' as const, width: 320 },
}
