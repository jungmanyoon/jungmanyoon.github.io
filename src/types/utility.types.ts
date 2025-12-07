/**
 * 유틸리티 타입 정의
 * 공통으로 사용되는 헬퍼 타입과 유틸리티 함수 타입
 */

// ===== 기본 유틸리티 타입 =====
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// 깊은 부분 타입
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 읽기 전용 깊은 타입
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 키 제외 타입
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 필수 키 지정 타입
export type RequireKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// ===== API 관련 타입 =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  stack?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: any;
}

// ===== 이벤트 관련 타입 =====
export type EventHandler<T = void> = (event: T) => void;
export type AsyncEventHandler<T = void> = (event: T) => Promise<void>;

export interface CustomEvent<T = any> {
  type: string;
  payload?: T;
  timestamp: Date;
  source?: string;
}

// ===== 유효성 검사 타입 =====
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  severity?: 'error' | 'critical';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code?: string;
}

export type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
  code?: string;
};

export type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
}

// ===== 변환 관련 타입 =====
export interface UnitConversion {
  from: {
    value: number;
    unit: string;
  };
  to: {
    value: number;
    unit: string;
  };
  factor: number;
  formula?: string;
}

export interface ConversionTable {
  [fromUnit: string]: {
    [toUnit: string]: number; // 변환 계수
  };
}

// ===== 파일 관련 타입 =====
export interface FileData {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  content?: string | ArrayBuffer;
}

export interface FileUploadOptions {
  accept?: string[];
  maxSize?: number; // bytes
  multiple?: boolean;
  onProgress?: (progress: number) => void;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'excel';
  filename?: string;
  includeMetadata?: boolean;
  compress?: boolean;
}

// ===== 로컬 스토리지 타입 =====
export interface StorageItem<T> {
  key: string;
  value: T;
  expires?: Date;
  version?: string;
}

export interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // Time to live in seconds
}

// ===== 날짜/시간 관련 타입 =====
export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
  available?: boolean;
}

export interface Duration {
  value: number;
  unit: 'seconds' | 'minutes' | 'hours' | 'days';
}

// ===== 포맷팅 관련 타입 =====
export interface FormatOptions {
  locale?: string;
  precision?: number;
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
  useGrouping?: boolean;
}

export interface NumberFormatOptions extends FormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
}

export interface DateFormatOptions {
  locale?: string;
  format?: string; // e.g., 'YYYY-MM-DD'
  timezone?: string;
}

// ===== 검색/필터 타입 =====
export interface SearchOptions {
  query: string;
  fields?: string[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
  limit?: number;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  highlights?: Record<string, string[]>;
}

// ===== 상태 머신 타입 =====
export interface StateMachine<S, E> {
  currentState: S;
  transitions: StateTransition<S, E>[];
  onTransition?: (from: S, to: S, event: E) => void;
}

export interface StateTransition<S, E> {
  from: S;
  to: S;
  event: E;
  guard?: () => boolean;
  action?: () => void;
}

// ===== 성능 관련 타입 =====
export interface PerformanceMetrics {
  responseTime: number; // ms
  throughput: number; // requests per second
  errorRate: number; // percentage
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
}

export interface CacheOptions {
  ttl?: number; // seconds
  maxSize?: number; // items
  strategy?: 'lru' | 'lfu' | 'fifo';
  persistent?: boolean;
}

// ===== 다국어 지원 타입 =====
export interface Translation {
  key: string;
  value: string;
  locale: string;
  context?: string;
}

export interface LocaleConfig {
  locale: string;
  fallback?: string;
  messages: Record<string, string>;
  dateFormat?: string;
  numberFormat?: NumberFormatOptions;
}

// ===== 테마 관련 타입 =====
export interface Theme {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  breakpoints: ThemeBreakpoints;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  error: string;
  warning: string;
  info: string;
  success: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeBreakpoints {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}