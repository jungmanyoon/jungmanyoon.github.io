/**
 * React 컴포넌트 Props 타입 정의
 * 컴포넌트 간 통신을 위한 인터페이스
 */

import { 
  Recipe, 
  Ingredient, 
  PanConfig, 
  BreadMethod, 
  ProcessStep,
  ConversionResult,
  DDTCalculation,
  BakersPercentageCalculation
} from './recipe.types';

// ===== 공통 Props 타입 =====
export interface BaseComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface WithLoadingProps {
  isLoading?: boolean;
  loadingText?: string;
}

export interface WithErrorProps {
  error?: string | null;
  onError?: (error: Error) => void;
}

// ===== 레이아웃 컴포넌트 Props =====
export interface HeaderProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
}

export interface TabsProps extends BaseComponentProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
}

// ===== 입력 컴포넌트 Props =====
export interface InputProps extends BaseComponentProps {
  label?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type?: 'text' | 'number' | 'email' | 'password';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  min?: number;
  max?: number;
  step?: number;
}

export interface SelectProps extends BaseComponentProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  multiple?: boolean;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

// ===== 레시피 관련 컴포넌트 Props =====
export interface RecipeCardProps extends BaseComponentProps {
  recipe: Recipe;
  onSelect?: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
  onFavorite?: (recipe: Recipe) => void;
  isFavorite?: boolean;
  isSelected?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export interface RecipeFormProps extends BaseComponentProps, WithLoadingProps, WithErrorProps {
  recipe?: Recipe;
  onSubmit: (recipe: Recipe) => Promise<void>;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

export interface RecipeViewerProps extends BaseComponentProps {
  recipe: Recipe;
  showNutrition?: boolean;
  showCosting?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

export interface IngredientListProps extends BaseComponentProps {
  ingredients: Ingredient[];
  onChange?: (ingredients: Ingredient[]) => void;
  editable?: boolean;
  showBakersPercentage?: boolean;
  showAlternatives?: boolean;
  totalFlour?: number;
  onAddIngredient?: () => void;
  onRemoveIngredient?: (id: string) => void;
}

export interface IngredientInputProps extends BaseComponentProps {
  ingredient: Partial<Ingredient>;
  onChange: (ingredient: Partial<Ingredient>) => void;
  onRemove?: () => void;
  showAdvanced?: boolean;
  categories?: string[];
  units?: string[];
}

// ===== 계산기 컴포넌트 Props =====
export interface BakersPercentageCalculatorProps extends BaseComponentProps, WithLoadingProps {
  initialFlourAmount?: number;
  initialIngredients?: Ingredient[];
  onCalculate?: (result: BakersPercentageCalculation) => void;
  showHistory?: boolean;
  allowSave?: boolean;
}

export interface DDTCalculatorProps extends BaseComponentProps, WithLoadingProps {
  initialValues?: Partial<DDTCalculation>;
  onCalculate?: (result: DDTCalculation) => void;
  showAdvanced?: boolean;
  showTips?: boolean;
}

export interface YieldCalculatorProps extends BaseComponentProps, WithLoadingProps {
  recipe?: Recipe;
  onCalculate?: (scaledRecipe: Recipe) => void;
  minYield?: number;
  maxYield?: number;
  step?: number;
}

export interface PanConverterProps extends BaseComponentProps, WithLoadingProps {
  recipe?: Recipe;
  availablePans?: PanConfig[];
  onConvert?: (result: ConversionResult) => void;
  showComparison?: boolean;
  showRecommendations?: boolean;
}

export interface MethodConverterProps extends BaseComponentProps, WithLoadingProps {
  recipe?: Recipe;
  availableMethods?: BreadMethod[];
  onConvert?: (result: ConversionResult) => void;
  showTimeline?: boolean;
  showTips?: boolean;
}

// ===== 팬 관련 컴포넌트 Props =====
export interface PanSelectorProps extends BaseComponentProps {
  value: PanConfig | null;
  onChange: (pan: PanConfig | null) => void;
  pans: PanConfig[];
  showDimensions?: boolean;
  showVolume?: boolean;
  allowCustom?: boolean;
  onAddCustomPan?: () => void;
}

export interface PanVisualizerProps extends BaseComponentProps {
  pan: PanConfig;
  fillLevel?: number; // 0-1
  showDimensions?: boolean;
  showGrid?: boolean;
  interactive?: boolean;
  onFillLevelChange?: (level: number) => void;
}

// ===== 공정 관련 컴포넌트 Props =====
export interface ProcessStepsProps extends BaseComponentProps {
  steps: ProcessStep[];
  onChange?: (steps: ProcessStep[]) => void;
  editable?: boolean;
  currentStep?: number;
  onStepComplete?: (stepId: string) => void;
  showTimer?: boolean;
  showCheckpoints?: boolean;
}

export interface StepCardProps extends BaseComponentProps {
  step: ProcessStep;
  index: number;
  isActive?: boolean;
  isCompleted?: boolean;
  onEdit?: (step: ProcessStep) => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  showDetails?: boolean;
}

export interface TimerProps extends BaseComponentProps {
  duration: number; // seconds
  onComplete?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  autoStart?: boolean;
  showControls?: boolean;
  compact?: boolean;
}

// ===== 결과 표시 컴포넌트 Props =====
export interface ComparisonViewProps extends BaseComponentProps {
  original: Recipe;
  converted: Recipe;
  changes?: Array<{
    field: string;
    from: any;
    to: any;
  }>;
  showHighlights?: boolean;
  sideBySide?: boolean;
}

export interface ResultCardProps extends BaseComponentProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string | number;
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export interface ChartProps extends BaseComponentProps {
  data: any[];
  type?: 'bar' | 'line' | 'pie' | 'doughnut';
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  height?: number;
  responsive?: boolean;
}

// ===== 유틸리티 컴포넌트 Props =====
export interface TooltipProps extends BaseComponentProps {
  content: React.ReactNode;
  trigger?: 'hover' | 'click' | 'focus';
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  arrow?: boolean;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'fullscreen';
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  showCloseButton?: boolean;
}

export interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface AlertProps extends BaseComponentProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  closable?: boolean;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}