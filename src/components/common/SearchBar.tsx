import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceMs?: number
  className?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  debounceMs = 300,
  className = ''
}) => {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t('components.searchBar.placeholder')
  const [localValue, setLocalValue] = useState(value)

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, value, onChange, debounceMs])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
  }, [onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }, [])

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bread-600 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={localValue}
          onChange={handleChange}
          placeholder={resolvedPlaceholder}
          aria-label={t('components.searchBar.ariaLabel')}
          className="
            w-full pl-10 pr-10 py-2.5
            border border-bread-200 rounded-lg
            bg-white
            text-bread-900 placeholder-bread-400
            focus:outline-none focus:ring-2 focus:ring-bread-500 focus:border-transparent
            transition-all duration-200
            hover:border-bread-300
          "
        />
        {localValue && (
          <button
            onClick={handleClear}
            aria-label={t('components.searchBar.clearAriaLabel')}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              w-5 h-5
              text-bread-400 hover:text-bread-600
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-bread-500 rounded
            "
          >
            <X className="w-full h-full" />
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchBar
