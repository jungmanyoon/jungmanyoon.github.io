import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { COMMON_PANS, PAN_TYPES } from '../../constants/pans';
import { METHODS } from '../../constants/methods';
import { Box, ChevronDown, Scale, ChefHat, BookOpen } from 'lucide-react';
import { useLocalization } from '@/hooks/useLocalization';

interface TopControlBarProps {
  onOpenReference: () => void;
}

const TopControlBar = ({ onOpenReference }: TopControlBarProps) => {
  const { t } = useTranslation();
  const { getLocalizedPanName } = useLocalization();
  const {
    conversionConfig,
    updatePanConfig,
    updateQuantity,
    updateMethodConfig,
    sourceRecipe
  } = useDashboardStore();

  const [isPanOpen, setIsPanOpen] = useState(false);
  const [isMethodOpen, setIsMethodOpen] = useState(false);

  // Helper to get current pan name
  const currentPanName = conversionConfig.targetPan ? getLocalizedPanName(conversionConfig.targetPan) : t('common.selectPan', '팬 선택');
  const currentMethodName = conversionConfig.targetMethod ? METHODS[conversionConfig.targetMethod]?.name : t('common.selectMethod', '제법 선택');

  const handlePanSelect = (panId: string) => {
    const pan = COMMON_PANS[panId];
    if (pan) {
      updatePanConfig(pan);
      setIsPanOpen(false);
    }
  };

  const handleMethodSelect = (methodId: string) => {
    updateMethodConfig(methodId as any);
    setIsMethodOpen(false);
  };

  const handleMultiplierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      updateQuantity(val);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4 shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-6">

        <div className="flex items-center gap-6">
          {/* Pan Selector */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Target Pan</label>
            <button
              onClick={() => setIsPanOpen(!isPanOpen)}
              className="flex items-center justify-between w-48 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Box size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-900 truncate">{currentPanName}</span>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {isPanOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                <div className="p-2">
                  {Object.entries(COMMON_PANS).map(([id, pan]) => (
                    <button
                      key={id}
                      onClick={() => handlePanSelect(id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded-md flex flex-col"
                    >
                      <span className="font-medium text-gray-900">{getLocalizedPanName(pan)}</span>
                      <span className="text-xs text-gray-500">{pan.dimensions.diameter ? `Ø${pan.dimensions.diameter}cm` : `${pan.dimensions.width}x${pan.dimensions.length}cm`}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Scale / Multiplier */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Scale / Multiplier</label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Scale size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={conversionConfig.batchMultiplier}
                  onChange={handleMultiplierChange}
                  className="pl-10 pr-3 py-2 w-32 border border-gray-300 rounded-md text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <span className="text-sm text-gray-600">x (배)</span>
            </div>
          </div>

          {/* Method Selector */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Baking Method</label>
            <button
              onClick={() => setIsMethodOpen(!isMethodOpen)}
              className="flex items-center justify-between w-48 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChefHat size={18} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-900 truncate">{currentMethodName}</span>
              </div>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {isMethodOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <div className="p-2">
                  {Object.values(METHODS).map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handleMethodSelect(method.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded-md"
                    >
                      <div className="font-medium text-gray-900">{method.name}</div>
                      <div className="text-xs text-gray-500 truncate">{method.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reference Button */}
        <button
          onClick={onOpenReference}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        >
          <BookOpen size={18} />
          Reference
        </button>

      </div>
    </div>
  );
};

export default TopControlBar;
