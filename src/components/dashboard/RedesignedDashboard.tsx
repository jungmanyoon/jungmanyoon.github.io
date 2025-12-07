import { useEffect, useState } from 'react';
import { useDashboardStore } from '../../stores/useDashboardStore';
import { useRecipeStore } from '../../stores/useRecipeStore';
import TopControlBar from './TopControlBar';
import OriginalRecipeView from './OriginalRecipeView';
import ConvertedRecipeView from './ConvertedRecipeView';

import ReferenceDataPanel from './ReferenceDataPanel';

const RedesignedDashboard = () => {
    const {
        sourceRecipe,
        convertedRecipe,
        selectSourceRecipe,
        recalculate
    } = useDashboardStore();

    const { recipes } = useRecipeStore();

    const [isReferenceOpen, setIsReferenceOpen] = useState(false);

    // Load initial recipe if none selected (for dev/demo)
    useEffect(() => {
        if (!sourceRecipe && recipes.length > 0) {
            selectSourceRecipe(recipes[0]);
        }
    }, [recipes, sourceRecipe, selectSourceRecipe]);

    // Recalculate whenever source or config changes (handled by store usually, but ensuring here)
    useEffect(() => {
        if (sourceRecipe) {
            recalculate();
        }
    }, [sourceRecipe, recalculate]);

    if (!sourceRecipe) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700">레시피를 선택해주세요</h2>
                    <p className="text-gray-500 mt-2">좌측 메뉴에서 레시피를 선택하거나 새로운 레시피를 만들어보세요.</p>
                </div>
            </div>
        );
    }



    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Top Control Bar */}
            <TopControlBar onOpenReference={() => setIsReferenceOpen(true)} />

            {/* Reference Data Panel */}
            <ReferenceDataPanel isOpen={isReferenceOpen} onClose={() => setIsReferenceOpen(false)} />

            {/* Main Content - Split View */}
            <div className="flex-1 max-w-7xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left: Original Recipe */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-gray-800">Original Recipe</h2>
                        <span className="text-xs font-medium px-2 py-1 bg-gray-200 text-gray-600 rounded-full">
                            {sourceRecipe.yield.quantity} {sourceRecipe.yield.unit}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <OriginalRecipeView recipe={sourceRecipe} />
                    </div>
                </div>

                {/* Right: Converted Recipe */}
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden flex flex-col h-[calc(100vh-140px)] ring-1 ring-blue-100">
                    <div className="p-4 border-b border-blue-100 bg-blue-50 flex justify-between items-center">
                        <h2 className="font-bold text-lg text-blue-900">Converted Recipe</h2>
                        {convertedRecipe && (
                            <span className="text-xs font-medium px-2 py-1 bg-blue-200 text-blue-800 rounded-full">
                                {convertedRecipe.yield.quantity} {convertedRecipe.yield.unit}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        {convertedRecipe ? (
                            <ConvertedRecipeView recipe={convertedRecipe} originalRecipe={sourceRecipe} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                                Calculating...
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RedesignedDashboard;
