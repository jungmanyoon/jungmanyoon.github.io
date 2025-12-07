import React, { useState } from 'react';
import { COMMON_PANS } from '../../constants/pans';
import { METHODS } from '../../constants/methods';
import { Ruler, BookOpen, X } from 'lucide-react';

interface ReferenceDataPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

type Tab = 'pans' | 'methods';

const ReferenceDataPanel: React.FC<ReferenceDataPanelProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('pans');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen size={20} className="text-blue-600" />
                        Reference Data
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('pans')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'pans'
                                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Ruler size={16} />
                            Pan Sizes
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('methods')}
                        className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'methods'
                                ? 'border-blue-500 text-blue-600 bg-blue-50/50'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <BookOpen size={16} />
                            Baking Methods
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                    {activeTab === 'pans' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {Object.values(COMMON_PANS).map((pan) => (
                                    <div key={pan.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-blue-300 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-gray-800">{pan.name}</h3>
                                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">{pan.type}</span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            <p>Volume: <span className="font-medium text-gray-900">{pan.volume}ml</span></p>
                                            <p>Dimensions:
                                                <span className="text-gray-500 ml-1">
                                                    {pan.dimensions.diameter
                                                        ? `Ø${pan.dimensions.diameter} x H${pan.dimensions.height} cm`
                                                        : `${pan.dimensions.length} x ${pan.dimensions.width} x H${pan.dimensions.height} cm`
                                                    }
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'methods' && (
                        <div className="space-y-4">
                            {Object.values(METHODS).map((method) => (
                                <div key={method.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-bold text-gray-800 text-lg">{method.name}</h3>
                                        <span className="text-xs text-gray-500">({method.id})</span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{method.description}</p>

                                    <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded-md border border-gray-100">
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Fermentation</span>
                                            <div className="space-y-1">
                                                {method.fermentationTime.preferment && (
                                                    <p><span className="text-gray-600">Preferment:</span> {method.fermentationTime.preferment.min}-{method.fermentationTime.preferment.max} min</p>
                                                )}
                                                <p><span className="text-gray-600">Bulk:</span> {method.fermentationTime.bulk.min}-{method.fermentationTime.bulk.max} min</p>
                                                <p><span className="text-gray-600">Final:</span> {method.fermentationTime.final.min}-{method.fermentationTime.final.max} min</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="block text-xs font-semibold text-gray-500 uppercase mb-1">Temperature</span>
                                            <div className="space-y-1">
                                                {method.temperature.preferment && (
                                                    <p><span className="text-gray-600">Preferment:</span> {method.temperature.preferment.min}-{method.temperature.preferment.max}°C</p>
                                                )}
                                                <p><span className="text-gray-600">Bulk:</span> {method.temperature.bulk.min}-{method.temperature.bulk.max}°C</p>
                                                <p><span className="text-gray-600">Final:</span> {method.temperature.final.min}-{method.temperature.final.max}°C</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReferenceDataPanel;
