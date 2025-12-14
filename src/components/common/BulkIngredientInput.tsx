/**
 * BulkIngredientInput - 배합표 일괄 입력 컴포넌트
 * 복사/붙여넣기로 여러 재료를 한번에 입력
 *
 * 지원 형식:
 * - 강력분 500g
 * - 강력분	500
 * - 강력분, 500g
 * - 강력분 500
 */

import React, { useState, useCallback } from 'react'
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { findIngredientInfo } from '@/data/ingredientDatabase'

interface ParsedIngredient {
  name: string
  amount: number
  category: string
  isValid: boolean
  error?: string
}

interface BulkIngredientInputProps {
  isOpen: boolean
  onClose: () => void
  onImport: (ingredients: Array<{ name: string; amount: number; category: string }>) => void
}

// 카테고리 매핑
const CATEGORY_MAP: Record<string, string> = {
  flour: 'flour',
  liquid: 'liquid',
  fat: 'wetOther',
  sugar: 'other',
  egg: 'wetOther',
  dairy: 'liquid',
  leavening: 'other',
  salt: 'other',
  flavoring: 'other',
  nut: 'other',
  fruit: 'other',
  chocolate: 'other',
  other: 'other'
}

/**
 * 한 줄 텍스트에서 재료명과 양 파싱
 */
function parseIngredientLine(line: string): ParsedIngredient | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
    return null // 빈 줄이나 주석 무시
  }

  // 다양한 구분자 시도: 탭, 쉼표, 공백+숫자
  let name = ''
  let amountStr = ''

  // 패턴 1: 탭 구분 (강력분\t500)
  if (trimmed.includes('\t')) {
    const parts = trimmed.split('\t').map(p => p.trim()).filter(Boolean)
    if (parts.length >= 2) {
      name = parts[0]
      amountStr = parts[1]
    }
  }
  // 패턴 2: 쉼표 구분 (강력분, 500g)
  else if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(p => p.trim()).filter(Boolean)
    if (parts.length >= 2) {
      name = parts[0]
      amountStr = parts[1]
    }
  }
  // 패턴 3: 공백 + 숫자 (강력분 500g 또는 강력분 500)
  else {
    const match = trimmed.match(/^(.+?)\s+(\d+\.?\d*)\s*(g|kg|ml|L|개)?$/i)
    if (match) {
      name = match[1].trim()
      amountStr = match[2]
      // kg, L 단위 변환
      const unit = match[3]?.toLowerCase()
      if (unit === 'kg') {
        amountStr = String(parseFloat(match[2]) * 1000)
      } else if (unit === 'l') {
        amountStr = String(parseFloat(match[2]) * 1000)
      }
    }
  }

  // 파싱 실패
  if (!name) {
    return {
      name: trimmed,
      amount: 0,
      category: 'other',
      isValid: false,
      error: '형식을 인식할 수 없습니다'
    }
  }

  // 숫자에서 g, ml 등 단위 제거
  const cleanAmount = amountStr.replace(/[^\d.]/g, '')
  const amount = parseFloat(cleanAmount)

  if (isNaN(amount) || amount <= 0) {
    return {
      name,
      amount: 0,
      category: 'other',
      isValid: false,
      error: `양을 인식할 수 없습니다: "${amountStr}"`
    }
  }

  // 재료 정보 조회
  const info = findIngredientInfo(name)
  const category = info ? CATEGORY_MAP[info.category] || 'other' : 'other'

  return {
    name,
    amount,
    category,
    isValid: true
  }
}

export default function BulkIngredientInput({
  isOpen,
  onClose,
  onImport
}: BulkIngredientInputProps) {
  const [inputText, setInputText] = useState('')
  const [parsedIngredients, setParsedIngredients] = useState<ParsedIngredient[]>([])
  const [isParsed, setIsParsed] = useState(false)

  // 텍스트 파싱
  const handleParse = useCallback(() => {
    const lines = inputText.split('\n')
    const parsed = lines
      .map(parseIngredientLine)
      .filter((item): item is ParsedIngredient => item !== null)

    setParsedIngredients(parsed)
    setIsParsed(true)
  }, [inputText])

  // 가져오기 확정
  const handleImport = useCallback(() => {
    const validIngredients = parsedIngredients
      .filter(ing => ing.isValid)
      .map(ing => ({
        name: ing.name,
        amount: ing.amount,
        category: ing.category
      }))

    if (validIngredients.length > 0) {
      onImport(validIngredients)
      setInputText('')
      setParsedIngredients([])
      setIsParsed(false)
      onClose()
    }
  }, [parsedIngredients, onImport, onClose])

  // 초기화
  const handleReset = useCallback(() => {
    setInputText('')
    setParsedIngredients([])
    setIsParsed(false)
  }, [])

  // 클립보드에서 붙여넣기
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setInputText(text)
      setIsParsed(false)
    } catch (err) {
      console.error('클립보드 읽기 실패:', err)
    }
  }, [])

  if (!isOpen) return null

  const validCount = parsedIngredients.filter(i => i.isValid).length
  const invalidCount = parsedIngredients.filter(i => !i.isValid).length

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-600" />
            배합표 일괄 입력
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {/* 입력 안내 */}
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            <p className="font-medium mb-1">지원 형식:</p>
            <ul className="text-xs space-y-0.5 text-gray-500">
              <li>• 강력분 500g</li>
              <li>• 강력분, 500</li>
              <li>• 강력분{'\t'}500 (탭 구분)</li>
            </ul>
          </div>

          {/* 텍스트 입력 영역 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">재료 목록</label>
              <button
                onClick={handlePaste}
                className="text-xs flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                <Upload className="w-3 h-3" />
                클립보드에서 붙여넣기
              </button>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value)
                setIsParsed(false)
              }}
              placeholder="강력분 500g
물 350g
설탕 50g
소금 10g
이스트 5g"
              className="w-full h-40 p-3 border rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* 파싱 결과 미리보기 */}
          {isParsed && parsedIngredients.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-medium">파싱 결과</span>
                <div className="flex gap-2 text-xs">
                  {validCount > 0 && (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {validCount}개 성공
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span className="text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {invalidCount}개 실패
                    </span>
                  )}
                </div>
              </div>
              <div className="max-h-48 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-1.5 font-medium">상태</th>
                      <th className="text-left px-3 py-1.5 font-medium">재료명</th>
                      <th className="text-right px-3 py-1.5 font-medium">양(g)</th>
                      <th className="text-left px-3 py-1.5 font-medium">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedIngredients.map((ing, idx) => (
                      <tr key={idx} className={`border-t ${ing.isValid ? '' : 'bg-red-50'}`}>
                        <td className="px-3 py-1.5">
                          {ing.isValid ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-500" />
                          )}
                        </td>
                        <td className="px-3 py-1.5">{ing.name}</td>
                        <td className="px-3 py-1.5 text-right font-mono">
                          {ing.isValid ? ing.amount : '-'}
                        </td>
                        <td className="px-3 py-1.5 text-xs text-gray-500">
                          {ing.error || (findIngredientInfo(ing.name) ? '✓ 재료 DB 매칭' : '')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded"
          >
            초기화
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-sm border rounded hover:bg-gray-100"
            >
              취소
            </button>
            {!isParsed ? (
              <button
                onClick={handleParse}
                disabled={!inputText.trim()}
                className="px-4 py-1.5 text-sm bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                파싱하기
              </button>
            ) : (
              <button
                onClick={handleImport}
                disabled={validCount === 0}
                className="px-4 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {validCount}개 재료 가져오기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
