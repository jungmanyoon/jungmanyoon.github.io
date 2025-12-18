import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '../common/Input.jsx'
import Button from '../common/Button.jsx'
import IngredientTable from './IngredientTable.jsx'
import { toast } from '@utils/toast'

function RecipeEditor({ recipe, onSave, onCancel }) {
  const { t } = useTranslation()
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
      toast.warning(t('components.recipeEditor.toast.nameRequired'))
      return
    }

    if (!formData.ingredients || formData.ingredients.length === 0) {
      toast.warning(t('components.recipeEditor.toast.ingredientRequired'))
      return
    }

    // 재료 유효성 검사
    const validIngredients = formData.ingredients.filter(ing =>
      ing.name && ing.name.trim() !== '' &&
      ing.amount && parseFloat(ing.amount) > 0
    )

    if (validIngredients.length === 0) {
      toast.warning(t('components.recipeEditor.toast.validIngredientRequired'))
      return
    }

    const recipeToSave = {
      ...formData,
      ingredients: validIngredients,
      id: recipe?.id || Date.now().toString(),
      updatedAt: new Date().toISOString()
    }
    onSave(recipeToSave)
    toast.success(t('components.recipeEditor.toast.saved'))
  }
  
  const handleCancel = () => {
    toast.warning(t('components.recipeEditor.toast.unsavedWarning'), {
      duration: 5000,
      action: {
        label: t('components.recipeEditor.toast.continue'),
        onClick: () => {
          onCancel()
        }
      }
    })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="card mb-3">
        <h2 className="text-base font-semibold mb-2">{t('components.recipeEditor.recipeInfo')}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label={t('components.recipeEditor.recipeName')}
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder={t('components.recipeEditor.recipeNamePlaceholder')}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('components.recipeEditor.category')}
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
            >
              <option value="bread">{t('components.recipeEditor.categories.bread')}</option>
              <option value="cake">{t('components.recipeEditor.categories.cake')}</option>
              <option value="cookie">{t('components.recipeEditor.categories.cookie')}</option>
              <option value="pastry">{t('components.recipeEditor.categories.pastry')}</option>
            </select>
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('components.recipeEditor.method')}
          </label>
          <select
            value={formData.method}
            onChange={(e) => handleInputChange('method', e.target.value)}
            className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
          >
            <option value="straight">{t('components.recipeEditor.methods.straight')}</option>
            <option value="sponge">{t('components.recipeEditor.methods.sponge')}</option>
            <option value="poolish">{t('components.recipeEditor.methods.poolish')}</option>
            <option value="biga">{t('components.recipeEditor.methods.biga')}</option>
            <option value="coldFermentation">{t('components.recipeEditor.methods.coldFermentation')}</option>
            <option value="noTime">{t('components.recipeEditor.methods.noTime')}</option>
          </select>
        </div>

        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('components.recipeEditor.description')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
            placeholder={t('components.recipeEditor.descriptionPlaceholder')}
          />
        </div>
      </div>

      <div className="card mb-3">
        <h3 className="text-base font-semibold mb-2">{t('components.recipeEditor.ingredients')}</h3>
        <IngredientTable
          ingredients={formData.ingredients}
          onChange={handleIngredientsChange}
        />
      </div>

      <div className="card mb-3">
        <h3 className="text-base font-semibold mb-2">{t('components.recipeEditor.instructions')}</h3>
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
                {t('common.delete')}
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
            {t('components.recipeEditor.addStep')}
          </Button>
        </div>
      </div>

      <div className="card mb-3">
        <h3 className="text-base font-semibold mb-2">{t('components.recipeEditor.notes')}</h3>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-bread-300 rounded-md focus:outline-none focus:ring-2 focus:ring-bread-400"
          placeholder={t('components.recipeEditor.notesPlaceholder')}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button size="small" variant="secondary" onClick={handleCancel}>{t('common.cancel')}</Button>
        <Button size="small" onClick={handleSave}>{t('common.save')}</Button>
      </div>
    </div>
  )
}

export default RecipeEditor