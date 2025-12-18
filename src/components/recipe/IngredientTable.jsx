import React from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../common/Button.jsx'
import Input from '../common/Input.jsx'
import { COMMON_INGREDIENTS } from '../../constants/ingredients.js'

function IngredientTable({ ingredients = [], onChange }) {
  const { t } = useTranslation()
  // 재료가 비어있으면 기본 행 추가
  React.useEffect(() => {
    if (ingredients.length === 0) {
      onChange([{ name: '', amount: '', unit: 'g', type: 'flour' }])
    }
  }, [])
  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    }
    onChange(newIngredients)
  }

  const handleKeyDown = (e, rowIndex, field) => {
    const isEnter = e.key === 'Enter'
    const isTab = e.key === 'Tab'
    if (!isEnter && !isTab) return
    e.preventDefault()
    const nextFieldOrder = ['name', 'amount', 'unit', 'type']
    const currentIdx = nextFieldOrder.indexOf(field)
    let nextRow = rowIndex
    let nextField = field
    if (isTab) {
      if (currentIdx < nextFieldOrder.length - 1) {
        nextField = nextFieldOrder[currentIdx + 1]
      } else {
        nextField = nextFieldOrder[0]
        nextRow = rowIndex + 1
      }
    } else if (isEnter) {
      nextField = field
      nextRow = rowIndex + 1
    }
    if (nextRow >= ingredients.length) {
      // 마지막 행 복사하여 새 행 추가
      const last = ingredients[ingredients.length - 1] || { name: '', amount: '', unit: 'g', type: 'flour' }
      const cloned = { ...last, name: '', amount: '' }
      onChange([...ingredients, cloned])
      setTimeout(() => {
        const el = document.querySelector(`[data-cell="${ingredients.length}:${nextField}"]`)
        if (el) el.focus()
      }, 0)
      return
    }
    const el = document.querySelector(`[data-cell="${nextRow}:${nextField}"]`)
    if (el) el.focus()
  }

  const addIngredient = () => {
    onChange([...ingredients, { name: '', amount: '', unit: 'g', type: 'flour' }])
  }

  const removeIngredient = (index) => {
    onChange(ingredients.filter((_, i) => i !== index))
  }

  const calculateBakersPercentage = (amount) => {
    const flourTotal = ingredients
      .filter(ing => ing.type === 'flour')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
    
    if (flourTotal === 0) return 0
    return ((amount / flourTotal) * 100).toFixed(1)
  }

  return (
    <div>
      <datalist id="ingredient-names">
        {Object.values(COMMON_INGREDIENTS).map((ing) => (
          <option key={ing.id} value={ing.name} />
        ))}
      </datalist>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-bread-300">
            <th className="text-left py-1">{t('ingredientTable.ingredientName')}</th>
            <th className="text-left py-1">{t('ingredientTable.amount')}</th>
            <th className="text-left py-1">{t('ingredientTable.unit')}</th>
            <th className="text-left py-1">{t('ingredientTable.type')}</th>
            <th className="text-center py-1">BP%</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ingredient, index) => (
            <tr key={index} className="border-b border-bread-100">
              <td className="py-1 pr-2">
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  className="w-full px-2 py-1 border border-bread-200 rounded text-sm"
                  placeholder={t('ingredientTable.placeholder')}
                  data-cell={`${index}:name`}
                  onKeyDown={(e) => handleKeyDown(e, index, 'name')}
                  list="ingredient-names"
                  aria-label={`${index + 1} ${t('ingredientTable.ingredientName')}`}
                />
              </td>
              <td className="py-1 pr-2">
                <input
                  type="number"
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  className="w-full px-2 py-1 border border-bread-200 rounded text-sm"
                  placeholder="0"
                  data-cell={`${index}:amount`}
                  onKeyDown={(e) => handleKeyDown(e, index, 'amount')}
                  aria-label={`${index + 1} ${t('ingredientTable.amount')}`}
                />
              </td>
              <td className="py-1 pr-2">
                <select
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className="w-full px-2 py-1 border border-bread-200 rounded text-sm"
                  data-cell={`${index}:unit`}
                  onKeyDown={(e) => handleKeyDown(e, index, 'unit')}
                  aria-label={`${index + 1} ${t('ingredientTable.unit')}`}
                >
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                  <option value="개">{t('ingredientTable.piece')}</option>
                  <option value="큰술">{t('ingredientTable.tbsp')}</option>
                  <option value="작은술">{t('ingredientTable.tsp')}</option>
                </select>
              </td>
              <td className="py-1 pr-2">
                <select
                  value={ingredient.type}
                  onChange={(e) => handleIngredientChange(index, 'type', e.target.value)}
                  className="w-full px-2 py-1 border border-bread-200 rounded text-sm"
                  data-cell={`${index}:type`}
                  onKeyDown={(e) => handleKeyDown(e, index, 'type')}
                  aria-label={`${index + 1} ${t('ingredientTable.type')}`}
                >
                  <option value="flour">{t('ingredientCategory.flour')}</option>
                  <option value="liquid">{t('ingredientCategory.liquid')}</option>
                  <option value="fat">{t('ingredientCategory.fat')}</option>
                  <option value="sugar">{t('ingredientCategory.sugar')}</option>
                  <option value="salt">{t('ingredientCategory.salt')}</option>
                  <option value="yeast">{t('ingredientCategory.yeast')}</option>
                  <option value="egg">{t('ingredientCategory.egg')}</option>
                  <option value="other">{t('ingredientCategory.other')}</option>
                </select>
              </td>
              <td className="py-1 text-center text-bread-600 text-sm">
                {calculateBakersPercentage(parseFloat(ingredient.amount) || 0)}%
              </td>
              <td className="py-1">
                <Button
                  variant="danger"
                  size="small"
                  onClick={() => removeIngredient(index)}
                >
                  {t('ingredientTable.delete')}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2">
        <Button variant="secondary" size="small" onClick={addIngredient}>
          {t('ingredientTable.addIngredient')}
        </Button>
      </div>

      <div className="mt-2 p-2 bg-bread-100 rounded">
        <div className="text-xs text-bread-700">
          <p><strong>{t('ingredientTable.totalWeight')}:</strong> {ingredients.reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0).toFixed(1)}g</p>
          <p><strong>{t('ingredientTable.flourTotal')}:</strong> {ingredients.filter(ing => ing.type === 'flour').reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0).toFixed(1)}g</p>
          <p><strong>{t('ingredientTable.hydration')}:</strong> {(() => {
            const flour = ingredients.filter(ing => ing.type === 'flour').reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
            const liquid = ingredients.filter(ing => ing.type === 'liquid').reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
            return flour > 0 ? ((liquid / flour) * 100).toFixed(1) : 0
          })()}%</p>
        </div>
      </div>
    </div>
  )
}

export default IngredientTable