import React from 'react'
import Button from '../common/Button.jsx'
import RecommendationPanel from '../recommendation/RecommendationPanel.jsx'

function RecipeView({ recipe, onEdit, onDelete, onConvert, onBack }) {
  if (!recipe) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">레시피가 선택되지 않았습니다.</p>
      </div>
    )
  }

  const calculateBakersPercentage = (amount, ingredients = recipe.ingredients) => {
    const flourTotal = ingredients
      .filter(ing => ing.type === 'flour')
      .reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)

    if (flourTotal === 0) return 0
    return ((amount / flourTotal) * 100).toFixed(1)
  }

  // method가 객체일 수 있으므로 안전하게 표시
  const getMethodName = (method) => {
    const METHOD_NAMES = {
      straight: '스트레이트법',
      sponge: '중종법',
      poolish: '폴리쉬법',
      biga: '비가법',
      coldFermentation: '저온숙성법',
      noTime: '노타임법'
    }

    if (typeof method === 'object' && method !== null) {
      const methodType = method.method || method.type
      return METHOD_NAMES[methodType] || methodType || '스트레이트법'
    }
    return METHOD_NAMES[method] || method || '스트레이트법'
  }

  // 재료 테이블 렌더링 함수
  const renderIngredientTable = (ingredients, title) => {
    const flourTotal = ingredients.filter(ing => ing.type === 'flour').reduce((sum, ing) => sum + parseFloat(ing.amount || 0), 0)
    
    return (
      <div>
        {title && <h4 className="font-medium text-bread-600 mb-1 text-sm">{title}</h4>}
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bread-300">
              <th className="text-left py-1">재료명</th>
              <th className="text-right py-1">양</th>
              <th className="text-center py-1">BP%</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.map((ingredient, idx) => (
              <tr key={idx} className="border-b border-bread-100">
                <td className="py-1">{ingredient.name}</td>
                <td className="py-1 text-right">
                  {parseFloat(ingredient.amount).toFixed(1)}{ingredient.unit || 'g'}
                </td>
                <td className="py-1 text-center text-bread-600">
                  {flourTotal > 0 ? ((parseFloat(ingredient.amount) / flourTotal) * 100).toFixed(1) : '-'}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-medium">
              <td className="pt-1">총 무게</td>
              <td className="pt-1 text-right">
                {ingredients.reduce((sum, ing) => sum + parseFloat(ing.amount || 0), 0).toFixed(1)}g
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    )
  }

  // 변환된 레시피가 있는지 확인
  const hasConversion = recipe.conversionDetails || recipe.convertedFrom

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-2">
        <Button size="small" variant="secondary" onClick={onBack}>← 뒤로</Button>
      </div>
      
      <div className="card mb-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2 flex-wrap">
            <Button size="small" onClick={onConvert}>레시피 변환</Button>
            <Button size="small" variant="secondary" onClick={onEdit}>편집</Button>
            <Button size="small" variant="secondary" onClick={() => window.print()}>인쇄</Button>
            <Button variant="secondary" onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: recipe.name,
                  text: recipe.description,
                  url: window.location.href
                })
              } else {
                alert('공유 기능은 추후 업데이트 예정입니다.')
              }
            }}>공유</Button>
            <Button size="small" variant="danger" onClick={onDelete}>삭제</Button>
          </div>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-bread-700 mb-1">{recipe.name}</h1>
            {recipe.description && (
              <p className="text-gray-600">{recipe.description}</p>
            )}
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-bread-200 text-bread-700 rounded-full text-sm">
              {recipe.category}
            </span>
            <p className="text-sm text-gray-500 mt-2">
              {recipe.method === 'straight' && '스트레이트법'}
              {recipe.method === 'sponge' && '중종법'}
              {recipe.method === 'poolish' && '폴리쉬법'}
              {recipe.method === 'biga' && '비가법'}
            </p>
          </div>
        </div>
      </div>

      {/* 변환된 레시피가 있으면 좌우로 표시, 없으면 기존 레이아웃 */}
      {hasConversion ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* 원본 레시피 */}
          <div className="card border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">📋</span>
              <h2 className="text-base font-semibold">원본 레시피</h2>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              제법: {recipe.convertedFrom === 'straight' && '스트레이트법'}
              {recipe.convertedFrom === 'sponge' && '중종법'}
              {recipe.convertedFrom === 'poolish' && '폴리쉬법'}
              {recipe.convertedFrom === 'biga' && '비가법'}
              {!recipe.convertedFrom && '스트레이트법'}
            </p>
            {/* 원본 재료 찾기 - conversionDetails가 있으면 그것을, 없으면 현재 ingredients 사용 */}
            {recipe.conversionDetails && recipe.conversionDetails.originalIngredients 
              ? renderIngredientTable(recipe.conversionDetails.originalIngredients)
              : renderIngredientTable(recipe.ingredients)
            }
          </div>

          {/* 변환된 레시피 */}
          <div className="card border-2 border-bread-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">🔄</span>
              <h2 className="text-base font-semibold">변환된 레시피</h2>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              제법: {recipe.method === 'straight' && '스트레이트법'}
              {recipe.method === 'sponge' && '중종법'}
              {recipe.method === 'poolish' && '폴리쉬법'}
              {recipe.method === 'biga' && '비가법'}
              {recipe.method === 'coldFermentation' && '저온숙성법'}
              {recipe.method === 'noTime' && '노타임법'}
            </p>
            {recipe.conversionDetails ? (
              <div className="space-y-2">
                {recipe.conversionDetails.sponge && renderIngredientTable(recipe.conversionDetails.sponge, '중종')}
                {recipe.conversionDetails.poolish && renderIngredientTable(recipe.conversionDetails.poolish, '폴리쉬')}
                {recipe.conversionDetails.biga && renderIngredientTable(recipe.conversionDetails.biga, '비가')}
                {recipe.conversionDetails.mainDough && renderIngredientTable(recipe.conversionDetails.mainDough, '본반죽')}
              </div>
            ) : (
              renderIngredientTable(recipe.ingredients)
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="card">
            <h2 className="text-base font-semibold mb-2">재료</h2>
            {renderIngredientTable(recipe.ingredients)}
          </div>

          <div className="card">
            <h2 className="text-base font-semibold mb-2">영양 정보</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-bread-100">
                <span>수화율</span>
                <span className="font-medium">
                  {(() => {
                    const flour = recipe.ingredients.filter(ing => ing.type === 'flour').reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
                    const liquid = recipe.ingredients.filter(ing => ing.type === 'liquid').reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
                    return flour > 0 ? ((liquid / flour) * 100).toFixed(1) : 0
                  })()}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-bread-100">
                <span>반죽 수율</span>
                <span className="font-medium">
                  {(() => {
                    const flour = recipe.ingredients.filter(ing => ing.type === 'flour').reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
                    const total = recipe.ingredients.reduce((sum, ing) => sum + (parseFloat(ing.amount) || 0), 0)
                    return flour > 0 ? ((total / flour) * 100).toFixed(1) : 0
                  })()}%
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-bread-100">
                <span>제법</span>
                <span className="font-medium">{getMethodName(recipe.method)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 변환 상세 정보 */}
      {hasConversion && recipe.conversionDetails && (
        <div className="card mt-3">
          <h3 className="text-base font-medium mb-2">변환 상세 정보</h3>
          
          {/* 발효 시간 정보 */}
          {recipe.conversionDetails.fermentationTime && (
            <div className="mb-2 p-2 bg-yellow-50 rounded">
              <p className="font-medium mb-1 text-sm">발효 시간:</p>
              {Object.entries(recipe.conversionDetails.fermentationTime).map(([key, value]) => (
                <p key={key} className="text-xs">
                  {key === 'sponge' && '중종 발효: '}
                  {key === 'poolish' && '폴리쉬 발효: '}
                  {key === 'biga' && '비가 발효: '}
                  {key === 'mainDough' && '본반죽 발효: '}
                  {key === 'cold' && '저온 발효: '}
                  {key === 'room' && '실온 적응: '}
                  {key === 'total' && '전체 발효: '}
                  {value}
                </p>
              ))}
            </div>
          )}

          {/* 만드는 방법 */}
          {recipe.conversionDetails.instructions && (
            <div className="mb-2">
              <p className="font-medium mb-1 text-sm">만드는 방법:</p>
              <ol className="list-decimal list-inside">
                {recipe.conversionDetails.instructions.map((instruction, idx) => (
                  <li key={idx} className="text-xs">{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          {/* 참고사항 */}
          {recipe.conversionDetails.notes && (
            <div className="p-2 bg-amber-50 border border-amber-200 rounded">
              <p className="text-xs text-amber-800">
                <strong>참고:</strong> {recipe.conversionDetails.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {recipe.instructions && recipe.instructions.length > 0 && (
        <div className="card mt-3">
          <h2 className="text-base font-semibold mb-2">만드는 방법</h2>
          <ol className="space-y-2 text-sm">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex">
                <span className="font-medium text-bread-600 mr-3">{index + 1}.</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {recipe.notes && (
        <div className="card mt-3">
          <h2 className="text-base font-semibold mb-2">참고사항</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{recipe.notes}</p>
        </div>
      )}

      {/* 추천 패널 */}
      <div className="mt-6">
        <RecommendationPanel recipes={[recipe]} currentRecipe={recipe} onRecipeSelect={() => {}} />
      </div>

    </div>
  )
}

export default RecipeView