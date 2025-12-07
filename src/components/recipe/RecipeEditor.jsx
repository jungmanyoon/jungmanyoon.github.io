import React, { useState, useEffect } from 'react'
import Input from '../common/Input.jsx'
import Button from '../common/Button.jsx'
import IngredientTable from './IngredientTable.jsx'
import { toast } from '@utils/toast'

function RecipeEditor({ recipe, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'bread',
    method: 'straight',
    servings: 1,
    ingredients: [],
    instructions: [],
    notes: ''
  })

  useEffect(() => {
    if (recipe) {
      setFormData(recipe)
    }
  }, [recipe])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleIngredientsChange = (ingredients) => {
    setFormData(prev => ({
      ...prev,
      ingredients
    }))
  }

  const handleSave = () => {
    // 유효성 검사
    if (!formData.name || formData.name.trim() === '') {
      toast.warning('레시피 이름을 입력해주세요.')
      return
    }

    if (!formData.ingredients || formData.ingredients.length === 0) {
      toast.warning('재료를 하나 이상 입력해주세요.')
      return
    }

    // 재료 유효성 검사
    const validIngredients = formData.ingredients.filter(ing =>
      ing.name && ing.name.trim() !== '' &&
      ing.amount && parseFloat(ing.amount) > 0
    )

    if (validIngredients.length === 0) {
      toast.warning('유효한 재료를 입력해주세요.')
      return
    }

    const recipeToSave = {
      ...formData,
      ingredients: validIngredients,
      id: recipe?.id || Date.now().toString(),
      updatedAt: new Date().toISOString()
    }
    onSave(recipeToSave)
    toast.success('레시피가 저장되었습니다')
  }
  
  const handleCancel = () => {
    toast.warning('작성 중인 내용이 사라집니다. 계속하시겠습니까?', {
      duration: 5000,
      action: {
        label: '계속',
        onClick: () => {
          onCancel()
        }
      }
    })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card mb-3">
        <h2 className="text-base font-semibold mb-2">레시피 정보</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="레시피 이름"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="예: 우유 식빵"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
            >
              <option value="bread">빵</option>
              <option value="cake">케이크</option>
              <option value="cookie">쿠키</option>
              <option value="pastry">페이스트리</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제법
          </label>
          <select
            value={formData.method}
            onChange={(e) => handleInputChange('method', e.target.value)}
            className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
          >
            <option value="straight">스트레이트법</option>
            <option value="sponge">중종법</option>
            <option value="poolish">폴리쉬법</option>
            <option value="biga">비가법</option>
            <option value="coldFermentation">저온숙성법</option>
            <option value="noTime">노타임법</option>
          </select>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
            placeholder="레시피에 대한 간단한 설명을 입력하세요"
          />
        </div>
      </div>

      <div className="card mb-3">
        <h3 className="text-base font-semibold mb-2">재료</h3>
        <IngredientTable
          ingredients={formData.ingredients}
          onChange={handleIngredientsChange}
        />
      </div>

      <div className="card mb-3">
        <h3 className="text-base font-semibold mb-2">만드는 방법</h3>
        <div className="space-y-2">
          {formData.instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <span className="text-bread-600 font-medium">{index + 1}.</span>
              <input
                value={instruction}
                onChange={(e) => {
                  const newInstructions = [...formData.instructions]
                  newInstructions[index] = e.target.value
                  handleInputChange('instructions', newInstructions)
                }}
                className="flex-1 px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
              />
              <Button
                variant="danger"
                size="small"
                onClick={() => {
                  const newInstructions = formData.instructions.filter((_, i) => i !== index)
                  handleInputChange('instructions', newInstructions)
                }}
              >
                삭제
              </Button>
            </div>
          ))}
          <Button
            variant="secondary"
            size="small"
            onClick={() => {
              handleInputChange('instructions', [...formData.instructions, ''])
            }}
          >
            + 단계 추가
          </Button>
        </div>
      </div>

      <div className="card mb-3">
        <h3 className="text-base font-semibold mb-2">참고사항</h3>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
          placeholder="특별한 팁이나 주의사항을 입력하세요"
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button size="small" variant="secondary" onClick={handleCancel}>취소</Button>
        <Button size="small" onClick={handleSave}>저장</Button>
      </div>
    </div>
  )
}

export default RecipeEditor