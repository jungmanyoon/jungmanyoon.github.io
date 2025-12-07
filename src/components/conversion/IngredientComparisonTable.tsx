import React, { useMemo } from 'react'
import { ArrowUp, ArrowDown, AlertTriangle, Minus } from 'lucide-react'
import { BakersPercentage } from '@utils/calculations/bakersPercentage'

interface Ingredient {
  name: string
  amount: number | string
  unit?: string
  type?: string
  isFlour?: boolean
  category?: string
}

interface IngredientComparisonTableProps {
  original: Ingredient[]
  converted: Ingredient[]
  title?: string
  showDifferences?: boolean
}

export function IngredientComparisonTable({
  original,
  converted,
  title,
  showDifferences = false
}: IngredientComparisonTableProps) {
  const calculateHydration = (ingredients: Ingredient[]) => {
    const flour = ingredients
      .filter(ing => ing.type === 'flour')
      .reduce((sum, ing) => sum + parseFloat(String(ing.amount) || '0'), 0)
    const liquid = ingredients
      .filter(ing => ing.type === 'liquid' || ing.type === 'egg')
      .reduce((sum, ing) => sum + parseFloat(String(ing.amount) || '0'), 0)
    return flour > 0 ? ((liquid / flour) * 100).toFixed(1) : '0'
  }

  const calculateTotal = (ingredients: Ingredient[]) => {
    return ingredients
      .reduce((sum, ing) => sum + parseFloat(String(ing.amount) || '0'), 0)
      .toFixed(1)
  }

  const calculateBP = (amount: number, flourTotal: number) => {
    return flourTotal > 0 ? ((amount / flourTotal) * 100).toFixed(1) : '-'
  }

  const flourTotal = original
    .filter(ing => ing.type === 'flour')
    .reduce((sum, ing) => sum + parseFloat(String(ing.amount) || '0'), 0)

  const getDifference = (ingName: string) => {
    const orig = original.find(o => o.name === ingName)
    const conv = converted.find(c => c.name === ingName)
    if (!orig || !conv) return null

    const delta = parseFloat(String(conv.amount) || '0') - parseFloat(String(orig.amount) || '0')
    if (Math.abs(delta) < 0.01) return null

    return {
      delta,
      isIncrease: delta > 0,
      unit: conv.unit || 'g'
    }
  }

  // Baker's Percentage validation warnings
  const validationWarnings = useMemo(() => {
    // Convert ingredients to format expected by BakersPercentage.validateRatios
    const bakersIngredients = converted.map(ing => {
      const amount = parseFloat(String(ing.amount) || '0')
      return {
        name: ing.name,
        amount,
        category: ing.type || ing.category || 'other',
        isFlour: ing.type === 'flour' || ing.isFlour,
        percentage: flourTotal > 0 ? (amount / flourTotal) * 100 : 0,
        isBakersPercentage: true
      }
    })

    return BakersPercentage.validateRatios(bakersIngredients)
  }, [converted, flourTotal])

  return (
    <div className="mb-2">
      {title && <h4 className="font-medium text-bread-600 mb-1 text-sm">{title}</h4>}

      {/* Validation Warnings */}
      {validationWarnings.warnings.length > 0 && (
        <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900 mb-1">배합 비율 주의사항</p>
              <ul className="text-xs text-amber-800 space-y-1">
                {validationWarnings.warnings.map((warning, idx) => (
                  <li key={idx}>• {warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-bread-300">
            <th className="text-left py-1">재료명</th>
            <th className="text-right py-1">양</th>
            <th className="text-center py-1">BP%</th>
            {showDifferences && <th className="text-center py-1">변화</th>}
          </tr>
        </thead>
        <tbody>
          {converted.map((ingredient, idx) => {
            const amount = parseFloat(String(ingredient.amount) || '0')
            const diff = showDifferences ? getDifference(ingredient.name) : null

            return (
              <tr key={idx} className="border-b border-bread-100">
                <td className="py-1">{ingredient.name}</td>
                <td className="py-1 text-right">
                  {amount.toFixed(1)}{ingredient.unit || 'g'}
                </td>
                <td className="py-1 text-center text-bread-600">
                  {calculateBP(amount, flourTotal)}%
                </td>
                {showDifferences && (
                  <td className="py-1 text-center">
                    {diff ? (
                      <span className={`flex items-center justify-center gap-1 ${
                        diff.isIncrease ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {diff.isIncrease ? (
                          <ArrowUp className="w-3 h-3" aria-label="증가" />
                        ) : (
                          <ArrowDown className="w-3 h-3" aria-label="감소" />
                        )}
                        <span className="text-xs">
                          {Math.abs(diff.delta).toFixed(1)}{diff.unit}
                        </span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-gray-500">
                        <Minus className="w-3 h-3" aria-label="변화 없음" />
                      </span>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr className="font-medium">
            <td className="pt-1">총 무게</td>
            <td className="pt-1 text-right">{calculateTotal(converted)}g</td>
            <td></td>
            {showDifferences && <td></td>}
          </tr>
          <tr className="text-xs text-gray-600">
            <td>수화율</td>
            <td className="text-right">{calculateHydration(converted)}%</td>
            <td></td>
            {showDifferences && <td></td>}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default IngredientComparisonTable
