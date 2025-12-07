/**
 * Dashboard Components Export
 */

// Main Layouts
export { default as DashboardCompact } from './DashboardCompact' // 새로운 컴팩트 버전 (추천)
export { default as DashboardLayout } from './DashboardLayout'   // 기존 3패널 버전

// Panels
export { default as RecipeSelectorPanel } from './panels/RecipeSelectorPanel'
export { default as ComparisonWorkspace } from './panels/ComparisonWorkspace'
export { default as ConversionToolbar } from './panels/ConversionToolbar'

// Actions
export { default as ActionBar } from './actions/ActionBar'

// Re-export types
export type {
  DashboardLayoutProps,
  RecipeSelectorPanelProps,
  ComparisonWorkspaceProps,
  ConversionToolbarProps,
  ActionBarProps,
} from '@/types/dashboard.types'
