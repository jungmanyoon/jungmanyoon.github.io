/**
 * ActionBar.tsx
 * 하단 액션 바 - 저장, 실행취소, 내보내기 등
 */

import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Undo2,
  Redo2,
  Save,
  RotateCcw,
  Download,
  Printer,
  Copy,
  Share2,
} from 'lucide-react'
import type { ActionBarProps } from '@/types/dashboard.types'

const ActionBar: React.FC<ActionBarProps> = ({
  canUndo,
  canRedo,
  hasChanges,
  onUndo,
  onRedo,
  onSave,
  onReset,
  onExport,
}) => {
  const { t } = useTranslation()

  // 클립보드에 복사
  const handleCopy = async () => {
    try {
      // TODO: 변환된 레시피를 클립보드에 복사
      console.log('Copy to clipboard')
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  // 인쇄
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Left Section - Undo/Redo */}
        <div className="flex items-center gap-2">
          <ActionButton
            icon={Undo2}
            label={t('actionBar.undo')}
            shortcut="Ctrl+Z"
            onClick={onUndo}
            disabled={!canUndo}
          />
          <ActionButton
            icon={Redo2}
            label={t('actionBar.redo')}
            shortcut="Ctrl+Shift+Z"
            onClick={onRedo}
            disabled={!canRedo}
          />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
          <ActionButton
            icon={RotateCcw}
            label={t('actionBar.reset')}
            onClick={onReset}
            disabled={!hasChanges}
            variant="secondary"
          />
        </div>

        {/* Center Section - Status */}
        <div className="hidden md:flex items-center gap-2">
          {hasChanges ? (
            <span className="flex items-center gap-1.5 text-sm text-amber-600 dark:text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              {t('actionBar.hasChanges')}
            </span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('actionBar.noChanges')}
            </span>
          )}
        </div>

        {/* Right Section - Save/Export */}
        <div className="flex items-center gap-2">
          <ActionButton
            icon={Copy}
            label={t('actionBar.copy')}
            onClick={handleCopy}
            disabled={!hasChanges}
            variant="secondary"
          />
          <ActionButton
            icon={Printer}
            label={t('actionBar.print')}
            onClick={handlePrint}
            variant="secondary"
          />
          <ActionButton
            icon={Download}
            label={t('actionBar.export')}
            onClick={onExport}
            disabled={!hasChanges}
            variant="secondary"
          />
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2" />
          <button
            onClick={onSave}
            disabled={!hasChanges}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors
              ${
                hasChanges
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{t('actionBar.saveAsNew')}</span>
            <span className="sm:hidden">{t('actionBar.save')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// 액션 버튼 컴포넌트
interface ActionButtonProps {
  icon: React.FC<{ className?: string }>
  label: string
  shortcut?: string
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  shortcut,
  onClick,
  disabled = false,
  variant = 'primary',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      className={`
        group relative p-2 rounded-lg transition-colors
        ${
          disabled
            ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            : variant === 'secondary'
            ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }
      `}
    >
      <Icon className="w-5 h-5" />

      {/* Tooltip */}
      <span
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium
                   bg-gray-900 dark:bg-gray-700 text-white rounded whitespace-nowrap
                   opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        {label}
        {shortcut && (
          <span className="ml-1 text-gray-400">({shortcut})</span>
        )}
      </span>
    </button>
  )
}

export default ActionBar
