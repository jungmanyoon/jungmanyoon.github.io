import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Filter, X, ChevronDown } from 'lucide-react'
import { RecipeFilters, RecipeSortOption } from '@types/store.types'
import { DifficultyLevel } from '@types/recipe.types'

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
    <div className={`bg-white border border-bread-200 rounded-lg p-4 ${className}`}>
      <div className="flex flex-wrap items-center gap-4">
        {/* Filter Icon and Title */}
        <div className="flex items-center gap-2 text-bread-700 font-medium">
          <Filter className="w-5 h-5" />
          <span>{t('filter.title')}</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-bread-600 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-wrap items-center gap-3">
          {/* Difficulty Filter */}
          <div className="relative group">
            <button
              className="
                px-3 py-2
                border border-bread-200 rounded-lg
                bg-white hover:bg-bread-50
                text-bread-700 text-sm
                transition-colors duration-200
                flex items-center gap-2
              "
            >
              {t('filter.difficulty')}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="
              absolute top-full left-0 mt-1
              w-48
              bg-white border border-bread-200 rounded-lg shadow-lg
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200
              z-10
            ">
              <div className="p-2 space-y-1">
                {difficultyOptions.map(({ value, labelKey }) => (
                  <label
                    key={value}
                    className="
                      flex items-center gap-2 px-3 py-2
                      hover:bg-bread-50 rounded cursor-pointer
                      transition-colors duration-150
                    "
                  >
                    <input
                      type="checkbox"
                      checked={filters.difficulty?.includes(value) || false}
                      onChange={() => handleDifficultyChange(value)}
                      className="w-4 h-4 text-bread-600 border-bread-300 rounded focus:ring-bread-500"
                    />
                    <span className="text-sm text-bread-700">{t(labelKey)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Time Range Filter */}
          <div className="relative group">
            <button
              className="
                px-3 py-2
                border border-bread-200 rounded-lg
                bg-white hover:bg-bread-50
                text-bread-700 text-sm
                transition-colors duration-200
                flex items-center gap-2
              "
            >
              {t('filter.time')}
              <ChevronDown className="w-4 h-4" />
            </button>
            <div className="
              absolute top-full left-0 mt-1
              w-48
              bg-white border border-bread-200 rounded-lg shadow-lg
              opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200
              z-10
            ">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => handleTimeRangeChange(null)}
                  className={`
                    w-full text-left px-3 py-2
                    hover:bg-bread-50 rounded
                    transition-colors duration-150
                    text-sm text-bread-700
                    ${!filters.timeRange ? 'bg-bread-100 font-medium' : ''}
                  `}
                >
                  {t('common.all')}
                </button>
                {timeRangeOptions.map(({ value, labelKey }) => (
                  <button
                    key={labelKey}
                    onClick={() => handleTimeRangeChange(value)}
                    className={`
                      w-full text-left px-3 py-2
                      hover:bg-bread-50 rounded
                      transition-colors duration-150
                      text-sm text-bread-700
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
            <div className="relative group">
              <button
                className="
                  px-3 py-2
                  border border-bread-200 rounded-lg
                  bg-white hover:bg-bread-50
                  text-bread-700 text-sm
                  transition-colors duration-200
                  flex items-center gap-2
                "
              >
                {t('filter.tags')}
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="
                absolute top-full left-0 mt-1
                w-56
                bg-white border border-bread-200 rounded-lg shadow-lg
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200
                z-10
                max-h-64 overflow-y-auto
              ">
                <div className="p-2 space-y-1">
                  {availableTags.map(tag => (
                    <label
                      key={tag}
                      className="
                        flex items-center gap-2 px-3 py-2
                        hover:bg-bread-50 rounded cursor-pointer
                        transition-colors duration-150
                      "
                    >
                      <input
                        type="checkbox"
                        checked={filters.tags?.includes(tag) || false}
                        onChange={() => handleTagToggle(tag)}
                        className="w-4 h-4 text-bread-600 border-bread-300 rounded focus:ring-bread-500"
                      />
                      <span className="text-sm text-bread-700">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sort Control */}
          <div className="ml-auto flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-bread-600">
              {t('filter.sortBy')}:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as RecipeSortOption)}
              className="
                px-3 py-2
                border border-bread-200 rounded-lg
                bg-white hover:bg-bread-50
                text-bread-700 text-sm
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-bread-500
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

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <button
              onClick={onClearFilters}
              className="
                px-3 py-2
                border border-bread-300 rounded-lg
                bg-white hover:bg-bread-50
                text-bread-600 hover:text-bread-700 text-sm
                transition-colors duration-200
                flex items-center gap-2
              "
            >
              <X className="w-4 h-4" />
              {t('filter.resetFilter')}
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="mt-3 pt-3 border-t border-bread-100">
          <div className="flex flex-wrap gap-2">
            {filters.difficulty && filters.difficulty.length > 0 && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-bread-100 text-bread-700 text-xs rounded">
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
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-bread-100 text-bread-700 text-xs rounded">
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
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-bread-100 text-bread-700 text-xs rounded">
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
