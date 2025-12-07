import React from 'react';
import { Recipe } from '../../types/recipe.types';
import { Clock, Thermometer, AlertTriangle } from 'lucide-react';

interface ConvertedRecipeViewProps {
    recipe: Recipe;
    originalRecipe: Recipe;
}

const ConvertedRecipeView: React.FC<ConvertedRecipeViewProps> = ({ recipe, originalRecipe }) => {
    // Calculate scaling factor for display
    const scaleFactor = recipe.totalWeight && originalRecipe.totalWeight
        ? (recipe.totalWeight / originalRecipe.totalWeight).toFixed(2)
        : '1.00';

    return (
        <div className="space-y-6">
            {/* Summary Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                    <p className="text-sm text-blue-800 font-medium">Scaled by {scaleFactor}x</p>
                    <p className="text-xs text-blue-600">Total Weight: {recipe.totalWeight?.toFixed(0)}g</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-blue-800 font-medium">{recipe.panConfig.name}</p>
                    <p className="text-xs text-blue-600">{recipe.method.method} Method</p>
                </div>
            </div>

            {/* Ingredients List */}
            <div>
                <h3 className="font-semibold text-blue-900 mb-3">Converted Ingredients</h3>
                <div className="bg-white rounded-lg border border-blue-200 overflow-hidden shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-blue-50 text-blue-700">
                            <tr>
                                <th className="px-4 py-2 text-left font-medium">Ingredient</th>
                                <th className="px-4 py-2 text-right font-medium">Weight (g)</th>
                                <th className="px-4 py-2 text-right font-medium">%</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-blue-100">
                            {recipe.ingredients.map((ing) => (
                                <tr key={ing.id} className="hover:bg-blue-50/50">
                                    <td className="px-4 py-2 text-gray-800 font-medium">{ing.name}</td>
                                    <td className="px-4 py-2 text-right text-blue-700 font-bold">{ing.amount.toFixed(1)}g</td>
                                    <td className="px-4 py-2 text-right text-gray-500">
                                        {ing.bakersPercentage ? `${ing.bakersPercentage}%` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Process Adjustments */}
            <div>
                <h3 className="font-semibold text-blue-900 mb-2">Process Adjustments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-md border border-blue-200 text-sm">
                        <div className="flex items-center gap-2 text-blue-800 mb-1">
                            <Clock size={16} />
                            <span className="font-medium">Fermentation</span>
                        </div>
                        <p className="text-gray-600">Bulk: {recipe.method.fermentationTime.bulk.min}-{recipe.method.fermentationTime.bulk.max} min</p>
                        {recipe.method.fermentationTime.preferment && (
                            <p className="text-gray-600">Preferment: {recipe.method.fermentationTime.preferment.min}-{recipe.method.fermentationTime.preferment.max} min</p>
                        )}
                    </div>

                    <div className="p-3 bg-white rounded-md border border-blue-200 text-sm">
                        <div className="flex items-center gap-2 text-blue-800 mb-1">
                            <Thermometer size={16} />
                            <span className="font-medium">Baking</span>
                        </div>
                        <p className="text-gray-600">{recipe.ovenSettings.temperature}°C</p>
                        <p className="text-gray-600">{recipe.bakingTime} min</p>
                    </div>
                </div>
            </div>

            {/* Warnings/Notes */}
            {recipe.method.method !== originalRecipe.method.method && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md flex gap-3">
                    <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                    <div className="text-sm text-yellow-800">
                        <p className="font-medium">Method Changed</p>
                        <p>You are converting from <strong>{originalRecipe.method.method}</strong> to <strong>{recipe.method.method}</strong>. Ensure you follow the specific process steps for the new method.</p>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ConvertedRecipeView;
