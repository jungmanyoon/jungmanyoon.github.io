import React from 'react'
import { METHODS } from '../../constants/methods'

function MethodSelector({ currentMethod, selectedMethod, onMethodChange }) {
  const availableMethods = Object.values(METHODS).filter(
    method => method.id !== currentMethod
  )

  return (
    <div>
      <h3 className="mb-4">제법 선택</h3>
      
      <div className="mb-4 p-4 bg-bread-100 rounded-lg">
        <p className="text-sm text-bread-700">
          현재 제법: <strong>{METHODS[currentMethod]?.name || currentMethod}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableMethods.map(method => (
          <div
            key={method.id}
            onClick={() => onMethodChange(method.id)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedMethod === method.id
                ? 'border-bread-500 bg-bread-50'
                : 'border-bread-200 hover:border-bread-300'
            }`}
          >
            <h4 className="font-medium text-bread-700 mb-2">{method.name}</h4>
            <p className="text-sm text-gray-600 mb-3">{method.description}</p>
            
            <div className="text-xs text-gray-500">
              <p className="mb-1">
                <strong>발효 시간:</strong>{' '}
                {method.fermentationTime.sponge && `전발효 ${method.fermentationTime.sponge}분, `}
                {method.fermentationTime.poolish && `폴리쉬 ${method.fermentationTime.poolish}분, `}
                {method.fermentationTime.biga && `비가 ${method.fermentationTime.biga}분, `}
                {method.fermentationTime.mainDough && `본반죽 ${method.fermentationTime.mainDough}분`}
                {method.fermentationTime.total && `총 ${method.fermentationTime.total}분`}
              </p>
              
              <div className="mt-2">
                <p className="text-green-600">
                  장점: {method.advantages.slice(0, 2).join(', ')}
                </p>
                <p className="text-red-600">
                  단점: {method.disadvantages.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">💡 제법 선택 가이드 (가정용 베이킹)</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>부드러운 식빵:</strong> 탕종법 ⭐</li>
          <li>• <strong>손반죽할 때:</strong> 자가제분법 ⭐</li>
          <li>• <strong>최고 풍미:</strong> 사워도우, 비가법</li>
          <li>• <strong>작업 유연성:</strong> 저온숙성법</li>
          <li>• <strong>기본 제법:</strong> 중종법, 폴리쉬법</li>
        </ul>
      </div>
    </div>
  )
}

export default MethodSelector