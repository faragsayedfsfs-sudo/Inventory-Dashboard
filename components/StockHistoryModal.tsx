
import React from 'react';
import type { InventoryItem, Branch, BranchKey } from '../types';
import { XIcon } from './icons';

interface StockHistoryModalProps {
    item: InventoryItem;
    branches: Branch[];
    onClose: () => void;
}

const StockHistoryModal: React.FC<StockHistoryModalProps> = ({ item, branches, onClose }) => {
    const history = item.stockHistory || [];
    // Fix: Explicitly type the Map to ensure correct type inference for `branch`.
    const branchMap = new Map<BranchKey, Branch>(branches.map(b => [b.key, b]));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Stock History</h2>
                <p className="text-gray-600 mb-4">Changes for <span className="font-semibold text-indigo-600">{item.name}</span></p>
                
                <div className="overflow-y-auto flex-grow border-t pt-4">
                    {history.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-center text-gray-500 py-8">No stock history recorded for this item yet.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {history.map((entry, index) => {
                                const branch = branchMap.get(entry.branchKey);
                                const isIncrease = entry.change > 0;
                                return (
                                    <li key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-700">{branch?.name || entry.branchKey}</p>
                                            <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-lg ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                                                {isIncrease ? '+' : ''}{entry.change}
                                            </p>
                                            <p className="text-sm text-gray-500">{entry.oldValue} &rarr; {entry.newValue}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="flex justify-end mt-6 border-t pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockHistoryModal;
