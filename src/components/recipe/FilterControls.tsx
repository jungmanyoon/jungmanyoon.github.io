import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Filter, X, ChevronDown } from 'lucide-react'
import { RecipeFilters, RecipeSortOption } from '@/types/store.types'
import { DifficultyLevel } from '@/types/recipe.types'

interface FilterControlsProps {
  filters: RecipeFilters
  sortBy: RecipeSortOption
  onFilterChange: (filters: RecipeFilters) => void
  onSortChange: (sortBy: RecipeSortOption) => void
  onClearFilters: () => void
  availableTags?: string[]
  className?: string
}

const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  sortBy,
  onFilterChange,
  onSortChange,
  onClearFilters,
  availableTags = [],
  className = ''
}) => {
  const { t } = useTranslation()

  // 접근성: 어떤 드롭다운이 열려 있는지 관리 (hover 전용 -> 상태 기반 토글로 전환)
  type DropdownKey = 'difficulty' | 'timeRange' | 'tags'
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null)
  // 상세 필터 패널 접힘/펼침 (기본 접힘). 제품/카테고리는 RecipeList 카테고리칩이 단일 소스.
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const toggleDropdown = useCallback((key: DropdownKey) => {
    setOpenDropdown(prev => (prev === key ? null : key))
  }, [])

  const closeDropdown = useCallback(() => {
    setOpenDropdown(null)
  }, [])

  // 외부 클릭 시 열린 드롭다운 닫기
  useEffect(() => {
    if (!openDropdown) return
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeDropdown()
      }
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [openDropdown, closeDropdown])

  // Escape 키로 열린 드롭다운 닫기
  const handleDropdownKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeDropdown()
      }
    },
    [closeDropdown]
  )

  const difficultyOptions: { value: DifficultyLevel; labelKey: string }[] = [
    { value: 'beginner', labelKey: 'filter.beginner' },
    { value: 'intermediate', labelKey: 'filter.intermediate' },
    { value: 'advanced', labelKey: 'filter.advanced' },
    { value: 'professional', labelKey: 'filter.expert' }
  ]

  const timeRangeOptions = [
    { value: { min: 0, max: 30 }, labelKey: 'filter.under30min' },
    { value: { min: 30, max: 60 }, labelKey: 'filter.30to60min' },
    { value: { min: 60, max: 120 }, labelKey: 'filter.1to2hours' },
    { value: { min: 120, max: 9999 }, labelKey: 'filter.over2hours' }
  ]

  const sortOptions: { value: RecipeSortOption; labelKey: string }[] = [
    { value: 'name', labelKey: 'filter.sortName' },
    { value: 'createdAt', labelKey: 'filter.sortCreated' },
    { value: 'updatedAt', labelKey: 'filter.sortModified' },
    { value: 'difficulty', labelKey: 'filter.sortDifficulty' },
    { value: 'totalTime', labelKey: 'filter.sortTime' }
  ]

  // 숨겨진 상세 필터만 카운트(난이도/시간/태그). 카테고리칩 선택은 배지에 미포함.
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.difficulty && filters.difficulty.length > 0) count++
    if (filters.timeRange) count++
    if (filters.tags && filters.tags.length > 0) count++
    return count
  }, [filters])

  const handleDifficultyChange = (difficulty: DifficultyLevel) => {
    const currentDifficulties = filters.difficulty || []
    const newDifficulties = currentDifficulties.includes(difficulty)
      ? currentDifficulties.filter(d => d !== difficulty)
      : [...currentDifficulties, difficulty]

    onFilterChange({ ...filters, difficulty: newDifficulties })
  }

  const handleTimeRangeChange = (timeRange: { min: number; max: number } | null) => {
    onFilterChange({ ...filters, timeRange: timeRange || undefined })
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]

    onFilterChange({ ...filters, tags: newTags })
  }

  return (
    <div
      ref={containerRef}
      onKeyDown={handleDropdownKeyDown}
      className={`bg-surface-paper border border-line rounded-lg p-3 sm:p-4 ${className}`}
    >
      {/* 상단 행: 필터 토글(항상 접힘) + 정렬(항상 표시) + 초기화 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 필터 토글 버튼 - 숨겨진 상세 필터 개수 배지 */}
        <button
          type="button"
          onClick={() => setIsFilterOpen(v => !v)}
          aria-expanded={isFilterOpen}
          aria-controls="filter-panel"
          className="
            px-3 py-2 min-h-[44px]
            border border-line rounded-lg
            bg-surface-paper hover:bg-surface-muted
            text-ink font-medium text-sm
            transition-colors duration-200
            flex items-center gap-2
            focus:outline-none focus-visible:ring-2 focus-visible:ring-bread-500
          "
        >
          <Filter className="w-4 h-4" />
          <span>{t('filter.title')}</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-bread-600 rounded-full">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Sort Control (항상 표시) */}
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-ink-muted flex-none">
            {t('filter.sortBy')}:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as RecipeSortOption)}
            className="
              px-3 py-2 min-h-[44px]
              border border-line rounded-lg
              bg-surface-paper hover:bg-surface-muted
              text-ink text-sm
              transition-colors duration-200
              focus:outline-none focus-visible:ring-2 focus-visible:ring-bread-500
              cursor-pointer
            "
          >
            {sortOptions.map(({ value, labelKey }) => (
              <option key={value} value={value}>
                {t(labelKey)}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button (활성 시) */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="
              px-3 py-2 min-h-[44px]
              border border-line rounded-lg
              bg-surface-paper hover:bg-surface-muted
              text-ink-muted hover:text-ink text-sm
              transition-colors duration-200
              flex items-center gap-2
              focus:outline-none focus-visible:ring-2 focus-visible:ring-bread-500
            "
          >
            <X className="w-4 h-4" />
            {t('filter.resetFilter')}
          </button>
        )}
      </div>

      {/* 접히는 상세 필터 패널 (기본 접힘) */}
      {isFilterOpen && (
        <div id="filter-panel" className="mt-3 pt-3 border-t border-line-soft flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Difficulty Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('difficulty')}
              aria-haspopup="listbox"
              aria-expanded={openDropdown === 'difficulty'}
              aria-controls="filter-dropdown-difficulty"
              className="
                px-3 py-2 min-h-[44px]
                border border-line rounded-lg
                bg-surface-paper hover:bg-surface-muted
                text-ink text-sm
                transition-colors duration-200
                flex items-center gap-2
                focus:outline-none focus-visible:ring-2 focus-visible:ring-bread-500
              "
            >
              {t('filter.difficulty')}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div
              id="filter-dropdown-difficulty"
              role="listbox"
              aria-label={t('filter.difficulty')}
              className={`
              absolute top-full left-0 mt-1
              w-48 max-w-[calc(100vw-1.5rem)]
              bg-surface-paper border border-line rounded-lg shadow-lg
              ${openDropdown === 'difficulty' ? 'opacity-100 visible' : 'opacity-0 invisible'}
              transition-all duration-200
              z-10
            `}>
              <div className="p-2 space-y-1">
                {difficultyOptions.map(({ value, labelKey }) => (
                  <label
                    key={value}
                    className="
                      flex items-center gap-2 px-3 py-2 min-h-[44px]
                      hover:bg-surface-muted rounded cursor-pointer
                      transition-colors duration-150
                    "
                  >
                    <input
                      type="checkbox"
                      checked={filters.difficulty?.includes(value) || false}
                      onChange={() => handleDifficultyChange(value)}
                      className="w-4 h-4 text-bread-600 border-line rounded focus:ring-bread-500"
                    />
                    <span className="text-sm text-ink">{t(labelKey)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('timeRange')}
              aria-haspopup="menu"
              aria-expanded={openDropdown === 'timeRange'}
              aria-controls="filter-dropdown-timeRange"
              className="
                px-3 py-2 min-h-[44px]
                border border-line rounded-lg
                bg-surface-paper hover:bg-surface-muted
                text-ink text-sm
                transition-colors duration-200
                flex items-center gap-2
                focus:outline-none focus-visible:ring-2 focus-visible:ring-bread-500
              "
            >
              {t('filter.time')}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div
              id="filter-dropdown-timeRange"
              role="menu"
              aria-label={t('filter.time')}
              className={`
              absolute top-full left-0 mt-1
              w-48 max-w-[calc(100vw-1.5rem)]
              bg-surface-paper border border-line rounded-lg shadow-lg
              ${openDropdown === 'timeRange' ? 'opacity-100 visible' : 'opacity-0 invisible'}
              transition-all duration-200
              z-10
            `}>
              <div className="p-2 space-y-1">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={!filters.timeRange}
                  onClick={() => handleTimeRangeChange(null)}
                  className={`
                    w-full text-left px-3 py-2 min-h-[44px]
                    hover:bg-surface-muted rounded
                    transition-colors duration-150
                    text-sm text-ink
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-bread-500
                    ${!filters.timeRange ? 'bg-bread-100 font-medium' : ''}
                  `}
                >
                  {t('common.all')}
                </button>
                {timeRangeOptions.map(({ value, labelKey }) => (
                  <button
                    key={labelKey}
                    type="button"
                    role="menuitemradio"
                    aria-checked={
                      filters.timeRange?.min === value.min &&
                      filters.timeRange?.max === value.max
                    }
                    onClick={() => handleTimeRangeChange(value)}
                    className={`
                      w-full text-left px-3 py-2 min-h-[44px]
                      hover:bg-surface-muted rounded
                      transition-colors duration-150
                      text-sm text-ink
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-bread-500
                      ${
                        filters.timeRange?.min === value.min &&
                        filters.timeRange?.max === value.max
                          ? 'bg-bread-100 font-medium'
                          : ''
                      }
                    `}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('tags')}
                aria-haspopup="listbox"
                aria-expanded={openDropdown === 'tags'}
                aria-controls="filter-dropdown-tags"
                className="
                  px-3 py-2
                  border border-line rounded-lg
                  bg-surface-paper hover:bg-surface-muted
                  text-ink text-sm
                  transition-colors duration-200
                  flex items-center gap-2
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-bread-500
                "
              >
                {t('filter.tags')}
                <ChevronDown className="w-4 h-4" />
              </button>
              <div
                id="filter-dropdown-tags"
                role="listbox"
                aria-label={t('filter.tags')}
                className={`
                absolute top-full left-0 mt-1
                w-56 max-w-[calc(100vw-1.5rem)]
                bg-surface-paper border border-line rounded-lg shadow-lg
                ${openDropdown === 'tags' ? 'opacity-100 visible' : 'opacity-0 invisible'}
                transition-all duration-200
                z-10
                max-h-64 overflow-y-auto
              `}>
                <div className="p-2 space-y-1">
                  {availableTags.map(tag => (
                    <label
                      key={tag}
                      className="
                        flex items-center gap-2 px-3 py-2 min-h-[44px]
                        hover:bg-surface-muted rounded cursor-pointer
                        transition-colors duration-150
                      "
                    >
                      <input
                        type="checkbox"
                        checked={filters.tags?.includes(tag) || false}
                        onChange={() => handleTagToggle(tag)}
                        className="w-4 h-4 text-bread-600 border-line rounded focus:ring-bread-500"
                      />
                      <span className="text-sm text-ink">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-3 pt-3 border-t border-line-soft">
          <div className="flex flex-wrap gap-2">
            {filters.difficulty && filters.difficulty.length > 0 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-surface-muted text-ink-muted text-xs rounded">
                <span className="font-medium">{t('filter.difficulty')}:</span>
                <span>
                  {filters.difficulty
                    .map(d => {
                      const opt = difficultyOptions.find(opt => opt.value === d)
                      return opt ? t(opt.labelKey) : d
                    })
                    .join(', ')}
                </span>
              </div>
            )}
            {filters.timeRange && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-surface-muted text-ink-muted text-xs rounded">
                <span className="font-medium">{t('filter.time')}:</span>
                <span>
                  {(() => {
                    const opt = timeRangeOptions.find(
                      opt => opt.value.min === filters.timeRange!.min && opt.value.max === filters.timeRange!.max
                    )
                    return opt ? t(opt.labelKey) : ''
                  })()}
                </span>
              </div>
            )}
            {filters.tags && filters.tags.length > 0 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-surface-muted text-ink-muted text-xs rounded">
                <span className="font-medium">{t('filter.tags')}:</span>
                <span>{filters.tags.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterControls
