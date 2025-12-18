import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Recipe, ProcessStep } from '../../types/recipe.types';
import { Clock, Thermometer, Users } from 'lucide-react';
import { translateProcessStep } from '@/data/processStepTranslations';

interface OriginalRecipeViewProps {
    recipe: Recipe;
}

const OriginalRecipeView: React.FC<OriginalRecipeViewProps> = ({ recipe }) => {
    const { i18n } = useTranslation();
    const currentLang = i18n.language === 'en' ? 'en' : 'ko';

    // 공정 단계 번역 헬퍼
    const getLocalizedInstruction = useCallback((step: ProcessStep): string => {
        if (currentLang === 'en') {
            if (step.instructionEn) return step.instructionEn;
            const instruction = step.instruction || step.description || '';
            return translateProcessStep(instruction, 'en');
        }
        return step.instruction || step.description || `Step ${step.order}`;
    }, [currentLang]);
    return (
        <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} />
                    <span>{recipe.totalTime} min</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Thermometer size={16} />
                    <span>{recipe.ovenSettings.temperature}°C</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} />
                    <span>{recipe.servings} servings</span>
                </div>
            </div>

            {/* Ingredients List */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-3">Ingredients</h3>
                <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-100 text-gray-500">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Ingredient</th>
                                <th className="px-4 py-2 text-right font-medium">Weight (g)</th>
                                <th className="px-4 py-2 text-right font-medium">%</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {recipe.ingredients.map((ing) => (
                                <tr key={ing.id}>
                                    <td className="px-4 py-2 text-gray-800">{ing.name}</td>
                                    <td className="px-4 py-2 text-right text-gray-600">{ing.amount}g</td>
                                    <td className="px-4 py-2 text-right text-gray-500">
                                        {ing.bakersPercentage ? `${ing.bakersPercentage}%` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Method Info */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-2">Method</h3>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-700">
                    <p><span className="font-medium">Type:</span> {recipe.method.method}</p>
                    <p><span className="font-medium">Fermentation:</span> Bulk {recipe.method.fermentationTime.bulk.min}-{recipe.method.fermentationTime.bulk.max} min</p>
                </div>
            </div>

            {/* Steps Preview (Simplified) */}
            <div>
                <h3 className="font-semibold text-gray-800 mb-2">Instructions</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    {recipe.steps.map((step) => (
                        <li key={step.id} className="pl-1">
                            {getLocalizedInstruction(step)}
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
};

export default OriginalRecipeView;
