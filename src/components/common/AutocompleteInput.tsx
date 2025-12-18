/**
 * AutocompleteInput - 한글 초성 검색 지원 자동완성 입력
 * "박ㄹ" → "박력분" 같은 초성 검색 가능
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { searchIngredients, sortByRelevance } from '@/utils/hangul'
import { findIngredientInfo } from '@/data/ingredientDatabase'
import { useSettingsStore } from '@/stores/useSettingsStore'

interface AutocompleteInputProps {
  value: string
  displayValue?: string  // 편집 중이 아닐 때 표시할 값 (번역된 이름 등)
  onChange: (value: string) => void
  onSelect?: (value: string) => void
  placeholder?: string
  className?: string
  suggestions?: string[]  // 커스텀 추천 목록 (기본: 재료 목록)
  maxSuggestions?: number
  disabled?: boolean
  autoFocus?: boolean
}

export default function AutocompleteInput({
  value,
  displayValue,
  onChange,
  onSelect,
  placeholder,
  className = '',
  suggestions: customSuggestions,  // 커스텀 목록이 주어지면 그것을 사용
  maxSuggestions = 8,
  disabled = false,
  autoFocus = false
}: AutocompleteInputProps) {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t('components.autocomplete.placeholder')
  // 설정 스토어에서 통합 재료 목록 가져오기 (커스텀 목록이 없을 때만)
  const getAllIngredientNames = useSettingsStore(state => state.getAllIngredientNames)
  const suggestions = customSuggestions ?? getAllIngredientNames()
  const [isOpen, setIsOpen] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [recentIngredients, setRecentIngredients] = useState<string[]>([])

  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // 최근 사용 재료 로드
  useEffect(() => {
    const saved = localStorage.getItem('recentIngredients')
    if (saved) {
      try {
        setRecentIngredients(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
  }, [])

  // 최근 사용 재료 저장
  const saveRecentIngredient = useCallback((ingredient: string) => {
    setRecentIngredients(prev => {
      const filtered = prev.filter(i => i !== ingredient)
      const updated = [ingredient, ...filtered].slice(0, 10)
      localStorage.setItem('recentIngredients', JSON.stringify(updated))
      return updated
    })
  }, [])

  // 필터링된 추천 목록
  const filteredSuggestions = useMemo(() => {
    if (!value.trim()) {
      // 입력이 없으면 최근 사용 재료 표시
      return recentIngredients.slice(0, maxSuggestions)
    }

    // 검색 및 정렬
    const searched = searchIngredients(suggestions, value)
    const sorted = sortByRelevance(searched, value)
    return sorted.slice(0, maxSuggestions)
  }, [value, suggestions, recentIngredients, maxSuggestions])

  // 선택 처리
  const handleSelect = useCallback((selected: string) => {
    onChange(selected)
    onSelect?.(selected)
    saveRecentIngredient(selected)
    setIsOpen(false)
    setHighlightedIndex(-1)
  }, [onChange, onSelect, saveRecentIngredient])

  // 키보드 네비게이션
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true)
        return
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
          handleSelect(filteredSuggestions[highlightedIndex])
        } else if (filteredSuggestions.length > 0) {
          handleSelect(filteredSuggestions[0])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setHighlightedIndex(-1)
        break
      case 'Tab':
        if (isOpen && highlightedIndex >= 0) {
          e.preventDefault()
          handleSelect(filteredSuggestions[highlightedIndex])
        }
        break
    }
  }, [isOpen, highlightedIndex, filteredSuggestions, handleSelect])

  // 입력 변경
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setIsOpen(true)
    setHighlightedIndex(-1)
  }, [onChange])

  // 포커스 처리
  const handleFocus = useCallback(() => {
    setIsOpen(true)
    setIsFocused(true)
  }, [])

  // 블러 처리 (딜레이로 클릭 이벤트 처리)
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      setIsOpen(false)
      setIsFocused(false)
      setHighlightedIndex(-1)
    }, 200)
  }, [])

  // 하이라이트된 항목 스크롤
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement
      if (item) {
        item.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex])

  // 카테고리 이모지 매핑
  const getCategoryEmoji = (name: string): string => {
    const info = findIngredientInfo(name)
    if (!info) return ''

    const emojiMap: Record<string, string> = {
      flour: '🌾',
      liquid: '💧',
      fat: '🧈',
      sugar: '🍯',
      egg: '🥚',
      dairy: '🥛',
      leavening: '🫧',
      salt: '🧂',
      flavoring: '🌿',
      nut: '🥜',
      fruit: '🍎',
      chocolate: '🍫',
      other: '📦'
    }
    return emojiMap[info.category] || ''
  }

  // 표시할 값: 포커스 중에는 원본값(검색용), 아니면 displayValue 또는 원본값
  const shownValue = isFocused ? value : (displayValue ?? value)

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={shownValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={resolvedPlaceholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg
          focus:ring-2 focus:ring-amber-500 focus:border-amber-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}`}
        autoComplete="off"
      />

      {/* 추천 목록 드롭다운 */}
      {isOpen && filteredSuggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200
            rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {!value.trim() && recentIngredients.length > 0 && (
            <li className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border-b">
              {t('components.autocomplete.recentlyUsed')}
            </li>
          )}
          {filteredSuggestions.map((item, index) => (
            <li
              key={item}
              onClick={() => handleSelect(item)}
              className={`px-3 py-2 cursor-pointer flex items-center gap-2
                ${index === highlightedIndex
                  ? 'bg-amber-100 text-amber-900'
                  : 'hover:bg-gray-100'
                }`}
            >
              <span className="text-sm">{getCategoryEmoji(item)}</span>
              <span className="flex-1">{item}</span>
              {index === highlightedIndex && (
                <span className="text-xs text-gray-400">Enter</span>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* 입력 힌트 */}
      {isOpen && value.trim() && filteredSuggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 px-3 py-2 bg-gray-50
          border border-gray-200 rounded-lg text-sm text-gray-500">
          {t('components.autocomplete.noMatch', { value })}
        </div>
      )}
    </div>
  )
}
