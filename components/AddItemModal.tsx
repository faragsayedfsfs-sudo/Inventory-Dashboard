
import React, { useState } from 'react';

interface AddItemModalProps {
    onClose: () => void;
    onAddItem: (newItem: { name: string; brand: string; cat: string }) => void;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onAddItem }) => {
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [cat, setCat] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !brand || !cat) {
            setError('All fields are required.');
            return;
        }
        setError('');
        onAddItem({ name, brand, cat });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Inventory Item</h2>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input
                            type="text"
                            id="itemName"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., A4 Paper, Blue"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="itemBrand" className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                        <input
                            type="text"
                            id="itemBrand"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., Generic, Pilot"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="itemCategory" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <input
                            type="text"
                            id="itemCategory"
                            value={cat}
                            onChange={(e) => setCat(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., Paper, Writing"
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                            Add Item
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemModal;