import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ExcelRow {
    id: string;
    name: string;
    percentage: number; // Baker's Percentage
    weight: number; // Grams
    isFlour: boolean;
    note: string;
}

import { useRecipeStore } from '@stores/useRecipeStore';
import { useAppStore } from '@stores/useAppStore';

export default function RecipeExcelView() {
    const { t } = useTranslation();
    const { addRecipe, setCurrentRecipe } = useRecipeStore();
    const { setActiveTab } = useAppStore();

    const [recipeName, setRecipeName] = useState(t('components.recipeExcelView.defaults.recipeName'));
    const [totalDoughWeight, setTotalDoughWeight] = useState<number>(1000);
    const [baseFlourWeight, setBaseFlourWeight] = useState<number>(0);

    // Initial rows
    const [rows, setRows] = useState<ExcelRow[]>([
        { id: '1', name: t('components.recipeExcelView.defaults.breadFlour'), percentage: 100, weight: 0, isFlour: true, note: '' },
        { id: '2', name: t('components.recipeExcelView.defaults.water'), percentage: 70, weight: 0, isFlour: false, note: '' },
        { id: '3', name: t('components.recipeExcelView.defaults.salt'), percentage: 2, weight: 0, isFlour: false, note: '' },
        { id: '4', name: t('components.recipeExcelView.defaults.yeast'), percentage: 1, weight: 0, isFlour: false, note: '' },
    ]);

    // Effect to update weights when Base Flour Weight changes
    useEffect(() => {
        setRows(prev => prev.map(row => ({
            ...row,
            weight: Number((baseFlourWeight * (row.percentage / 100)).toFixed(1))
        })));
    }, [baseFlourWeight]);

    // Initialize base flour weight from total dough weight on mount
    useEffect(() => {
        const totalPct = rows.reduce((sum, row) => sum + row.percentage, 0);
        if (totalPct > 0) {
            setBaseFlourWeight(totalDoughWeight / (totalPct / 100));
        }
    }, []); // Run once

    const handleTotalWeightChange = (newTotal: number) => {
        setTotalDoughWeight(newTotal);
        const totalPct = rows.reduce((sum, row) => sum + row.percentage, 0);
        setBaseFlourWeight(newTotal / (totalPct / 100));
    };

    const handlePercentageChange = (id: string, newPct: number) => {
        setRows(prev => {
            // Update the percentage of the target row
            const newRows = prev.map(row => row.id === id ? { ...row, percentage: newPct } : row);

            // Recalculate weights based on the current base flour weight
            // Note: We do this here to ensure immediate UI update without waiting for effect if possible,
            // but since we rely on baseFlourWeight state, let's just update the rows with new percentage
            // and let the effect or a direct map handle the weight update.
            // Actually, if we just update percentage, the effect on [baseFlourWeight] won't trigger unless baseFlourWeight changes.
            // So we must recalculate weights here.
            return newRows.map(row => ({
                ...row,
                weight: Number((baseFlourWeight * (row.percentage / 100)).toFixed(1))
            }));
        });
    };

    const handleWeightChange = (id: string, newWeight: number) => {
        const row = rows.find(r => r.id === id);
        if (!row) return;

        if (row.isFlour) {
            // If flour weight changes, that IS the new Base Flour Weight
            setBaseFlourWeight(newWeight);
            // We don't update percentage here, we update the base weight.
            // The effect on [baseFlourWeight] will trigger and update ALL weights (including this one, effectively confirming it)
            // and keep percentages constant.
        } else {
            // Non-flour ingredient: changing weight implies changing percentage
            // Weight = Base * (Pct / 100)  ->  Pct = (Weight / Base) * 100
            if (baseFlourWeight > 0) {
                const newPct = (newWeight / baseFlourWeight) * 100;
                setRows(prev => prev.map(r => r.id === id ? {
                    ...r,
                    percentage: Number(newPct.toFixed(1)),
                    weight: newWeight
                } : r));
            }
        }
    };

    const totalPercentage = rows.reduce((sum, row) => sum + row.percentage, 0);
    const currentTotalWeight = rows.reduce((sum, row) => sum + row.weight, 0);

    const addRow = () => {
        const newId = (Math.max(...rows.map(r => parseInt(r.id))) + 1).toString();
        setRows([...rows, { id: newId, name: '', percentage: 0, weight: 0, isFlour: false, note: '' }]);
    };

    const deleteRow = (id: string) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const handleSave = () => {
        if (!recipeName.trim()) {
            alert(t('components.recipeExcelView.alerts.nameRequired'));
            return;
        }

        const newRecipe = {
            id: `recipe-${Date.now()}`,
            name: recipeName,
            category: 'bread', // Default
            type: 'yeast', // Default
            difficulty: 'intermediate',
            yield: { quantity: 1, unit: 'pcs' },
            servings: 1,
            prepTime: 60,
            bakingTime: 30,
            totalTime: 90,
            ingredients: rows.map(row => ({
                id: row.id,
                name: row.name,
                amount: row.weight,
                unit: 'g',
                bakersPercentage: row.percentage,
                category: row.isFlour ? 'flour' : 'other',
                isFlour: row.isFlour
            })),
            method: {
                method: 'straight',
                prefermentRatio: 0,
                fermentationTime: { bulk: { min: 60, max: 90, unit: 'min' }, final: { min: 45, max: 60, unit: 'min' } },
                temperature: { bulk: { min: 27, max: 27, unit: 'C' }, final: { min: 27, max: 27, unit: 'C' } }
            },
            ovenSettings: { temperature: 180, mode: 'convection', preheating: true },
            panConfig: { id: 'default', name: t('components.recipeExcelView.defaults.defaultPan'), type: 'loaf', dimensions: { height: 0 }, volume: 0, material: 'aluminum', fillRatio: 0.7 },
            steps: [],
            tags: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // @ts-ignore
        addRecipe(newRecipe);
        // @ts-ignore
        setCurrentRecipe(newRecipe);
        setActiveTab('recipes');
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">📊 {t('components.recipeExcelView.title')}</h1>
                    <p className="text-gray-500 text-sm">{t('components.recipeExcelView.description')}</p>
                </div>
                <div className="flex gap-4 items-center">
                    <input
                        type="text"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        className="border-b border-gray-300 focus:border-blue-500 px-2 py-1 outline-none text-gray-700"
                        placeholder={t('components.recipeExcelView.recipeName')}
                    />
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        💾 {t('components.recipeExcelView.saveAsRecipe')}
                    </button>
                </div>
            </div>

            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">{t('components.recipeExcelView.totalDoughWeight')}:</span>
                    <input
                        type="number"
                        value={Math.round(currentTotalWeight)}
                        onChange={(e) => handleTotalWeightChange(Number(e.target.value))}
                        className="w-24 text-right font-bold text-blue-700 bg-transparent border-b border-blue-300 focus:outline-none"
                    />
                    <span className="text-sm text-blue-700">g</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                        <tr>
                            <th className="py-3 px-4 w-12 text-center">{t('components.recipeExcelView.table.number')}</th>
                            <th className="py-3 px-4">{t('components.recipeExcelView.table.ingredient')}</th>
                            <th className="py-3 px-4 w-32 text-right">{t('components.recipeExcelView.table.percentage')}</th>
                            <th className="py-3 px-4 w-32 text-right">{t('components.recipeExcelView.table.weight')}</th>
                            <th className="py-3 px-4 w-24 text-center">{t('components.recipeExcelView.table.isFlour')}</th>
                            <th className="py-3 px-4">{t('components.recipeExcelView.table.note')}</th>
                            <th className="py-3 px-4 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {rows.map((row, index) => (
                            <tr key={row.id} className={`hover:bg-gray-50 group ${row.isFlour ? 'bg-yellow-50/30' : ''}`}>
                                <td className="py-2 px-4 text-center text-gray-400">{index + 1}</td>
                                <td className="py-2 px-4">
                                    <input
                                        type="text"
                                        value={row.name}
                                        onChange={(e) => setRows(rows.map(r => r.id === row.id ? { ...r, name: e.target.value } : r))}
                                        className="w-full bg-transparent focus:outline-none font-medium text-gray-800"
                                        placeholder={t('components.recipeExcelView.placeholders.ingredientName')}
                                    />
                                </td>
                                <td className="py-2 px-4 text-right">
                                    <input
                                        type="number"
                                        value={row.percentage}
                                        onChange={(e) => handlePercentageChange(row.id, Number(e.target.value))}
                                        className={`w-full text-right focus:outline-none ${row.isFlour ? 'font-bold text-gray-900' : 'text-gray-600'}`}
                                        step="0.1"
                                    />
                                </td>
                                <td className="py-2 px-4 text-right">
                                    <input
                                        type="number"
                                        value={row.weight}
                                        onChange={(e) => handleWeightChange(row.id, Number(e.target.value))}
                                        className="w-full text-right focus:outline-none font-medium text-gray-800"
                                        step="0.1"
                                    />
                                </td>
                                <td className="py-2 px-4 text-center">
                                    <input
                                        type="checkbox"
                                        checked={row.isFlour}
                                        onChange={(e) => {
                                            setRows(rows.map(r => r.id === row.id ? { ...r, isFlour: e.target.checked } : r));
                                        }}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="py-2 px-4">
                                    <input
                                        type="text"
                                        value={row.note}
                                        onChange={(e) => setRows(rows.map(r => r.id === row.id ? { ...r, note: e.target.value } : r))}
                                        className="w-full bg-transparent focus:outline-none text-gray-500"
                                        placeholder={t('components.recipeExcelView.placeholders.memo')}
                                    />
                                </td>
                                <td className="py-2 px-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => deleteRow(row.id)}
                                        className="text-red-400 hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {/* Total Row */}
                        <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
                            <td colSpan={2} className="py-3 px-4 text-right text-gray-600">{t('components.recipeExcelView.table.total')}</td>
                            <td className="py-3 px-4 text-right text-blue-600">{totalPercentage.toFixed(1)}%</td>
                            <td className="py-3 px-4 text-right text-blue-600">{currentTotalWeight.toFixed(1)}g</td>
                            <td colSpan={3}></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    onClick={addRow}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                    + {t('components.recipeExcelView.addIngredient')}
                </button>
            </div>
        </div>
    );
}
