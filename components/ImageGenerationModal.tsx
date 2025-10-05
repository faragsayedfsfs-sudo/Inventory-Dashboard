
import React, { useState } from 'react';
import type { InventoryItem } from '../types';
import { XIcon } from './icons';

interface ImageGenerationModalProps {
    item: InventoryItem;
    isGenerating: boolean;
    onClose: () => void;
    onGenerate: (prompt: string) => void;
}

const ImageGenerationModal: React.FC<ImageGenerationModalProps> = ({ item, isGenerating, onClose, onGenerate }) => {
    const [prompt, setPrompt] = useState(item.name);

    const handleGenerateClick = () => {
        if (!prompt.trim() || isGenerating) return;
        onGenerate(prompt);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <XIcon className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Generate Image</h2>
                <p className="text-gray-600 mb-4">Create a visual for <span className="font-semibold text-indigo-600">{item.name}</span>.</p>
                
                <div className="mb-4">
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., A pack of high-quality blue A4 paper"
                    />
                     <p className="text-xs text-gray-500 mt-1">Describe the image you want to generate.</p>
                </div>

                <div className="flex justify-end mt-6">
                    <button 
                        onClick={handleGenerateClick} 
                        disabled={isGenerating || !prompt.trim()}
                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : 'Generate Image'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageGenerationModal;