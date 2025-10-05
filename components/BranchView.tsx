
import React from 'react';
import type { InventoryItem, Branch, View, SortConfig, SortKey } from '../types';
import { DownloadIcon, EditIcon, SaveIcon, XIcon, BuildingIcon, DashboardIcon, ImageIcon, HistoryIcon, ChevronUpIcon, ChevronDownIcon } from './icons';
import AutocompleteInput from './AutocompleteInput';

interface BranchViewProps {
    inventory: InventoryItem[];
    totalItemCount: number;
    branch: Branch;
    allBranches: Branch[];
    editId: number | null;
    editData: Partial<InventoryItem>;
    onEdit: (item: InventoryItem) => void;
    onSave: () => void;
    onCancel: () => void;
    onEditDataChange: (key: keyof InventoryItem, value: string | number) => void;
    onExport: () => void;
    setView: (view: View) => void;
    filters: { name: string; brand: string; cat: string };
    onFilterChange: (filterName: 'name' | 'brand' | 'cat', value: string) => void;
    onClearFilters: () => void;
    onGenerateImageClick: (item: InventoryItem) => void;
    onViewHistory: (item: InventoryItem) => void;
    sortConfig: SortConfig | null;
    onSort: (key: SortKey) => void;
    suggestions: { names: string[], brands: string[], cats: string[] };
}

const BranchView: React.FC<BranchViewProps> = ({
    inventory,
    totalItemCount,
    branch,
    allBranches,
    editId,
    editData,
    onEdit,
    onSave,
    onCancel,
    onEditDataChange,
    onExport,
    setView,
    filters,
    onFilterChange,
    onClearFilters,
    onGenerateImageClick,
    onViewHistory,
    sortConfig,
    onSort,
    suggestions,
}) => {
    const getBranchTotal = () => inventory.reduce((sum, item) => sum + Number(item[branch.key]), 0);

    const renderSortArrow = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        if (sortConfig.direction === 'asc') return <ChevronUpIcon className="w-4 h-4 inline-block ml-1" />;
        return <ChevronDownIcon className="w-4 h-4 inline-block ml-1" />;
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <header className="mb-6">
                    <h1 className={`text-4xl font-bold ${branch.text} tracking-tight`}>{branch.name} Branch Inventory</h1>
                    <p className="text-gray-500 mt-1">
                        Showing {inventory.length} of {totalItemCount} items. Total stock in branch: {getBranchTotal().toLocaleString()}
                    </p>
                </header>

                <nav className="flex flex-wrap gap-2 mb-6 pb-4 border-b">
                    <button onClick={() => setView('dashboard')} className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg flex items-center gap-2 transition-colors">
                        <DashboardIcon className="w-4 h-4" />
                        Dashboard
                    </button>
                    {allBranches.map(b => (
                        <button key={b.key} onClick={() => setView(b.key)} className={`px-4 py-2 text-white rounded-lg flex items-center gap-2 shadow-sm transition-colors ${b.key === branch.key ? b.bg : 'bg-gray-400 hover:bg-gray-500'}`}>
                            <BuildingIcon className="w-4 h-4" />
                            {b.name}
                        </button>
                    ))}
                </nav>

                <section className="mb-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                       <AutocompleteInput
                            id="name-filter-branch"
                            label="Item Name"
                            placeholder="Fuzzy search by name..."
                            value={filters.name}
                            onChange={(value) => onFilterChange('name', value)}
                            suggestions={suggestions.names}
                        />
                        <AutocompleteInput
                            id="brand-filter-branch"
                            label="Brand"
                            placeholder="Fuzzy search by brand..."
                            value={filters.brand}
                            onChange={(value) => onFilterChange('brand', value)}
                            suggestions={suggestions.brands}
                        />
                         <AutocompleteInput
                            id="cat-filter-branch"
                            label="Category"
                            placeholder="Filter by category..."
                            value={filters.cat}
                            onChange={(value) => onFilterChange('cat', value)}
                            suggestions={suggestions.cats}
                        />
                        <button 
                            onClick={onClearFilters}
                            className="bg-gray-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-gray-700 transition-colors h-fit"
                        >
                            Clear Filters
                        </button>
                    </div>
                </section>
                
                <div className="flex justify-end mb-4">
                    <button onClick={onExport} className={`flex items-center gap-2 ${branch.bg} text-white px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity`}>
                        <DownloadIcon className="w-4 h-4" />
                        Export Branch Data
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className={`${branch.bg} text-white`}>
                            <tr>
                                <th className="p-3 text-left font-semibold">
                                    <button onClick={() => onSort('id')} className="flex items-center gap-1 hover:opacity-80 transition-opacity">ID {renderSortArrow('id')}</button>
                                </th>
                                <th className="p-3 text-left font-semibold">Image</th>
                                <th className="p-3 text-left font-semibold">
                                    <button onClick={() => onSort('name')} className="flex items-center gap-1 hover:opacity-80 transition-opacity">Item {renderSortArrow('name')}</button>
                                </th>
                                <th className="p-3 text-left font-semibold">
                                    <button onClick={() => onSort('brand')} className="flex items-center gap-1 hover:opacity-80 transition-opacity">Brand {renderSortArrow('brand')}</button>
                                </th>
                                <th className="p-3 text-left font-semibold">
                                    <button onClick={() => onSort('cat')} className="flex items-center gap-1 hover:opacity-80 transition-opacity">Category {renderSortArrow('cat')}</button>
                                </th>
                                <th className="p-3 text-center font-semibold">
                                    <button onClick={() => onSort(branch.key)} className="w-full flex justify-center items-center gap-1 hover:opacity-80 transition-opacity">Quantity {renderSortArrow(branch.key)}</button>
                                </th>
                                <th className="p-3 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((item, i) => (
                                <tr key={item.id} className={`border-b ${i % 2 === 0 ? 'bg-white' : branch.light}`}>
                                    {editId === item.id ? (
                                        <>
                                            <td className="p-3 text-gray-500">{item.id}</td>
                                            <td className="p-2"></td>
                                            <td className="p-3 font-medium text-gray-800">{item.name}</td>
                                            <td className="p-3 text-gray-600">{item.brand}</td>
                                            <td className="p-3 text-gray-600">{item.cat}</td>
                                            <td className="p-3 text-center">
                                                <input
                                                    type="number"
                                                    value={editData[branch.key] || 0}
                                                    onChange={(e) => onEditDataChange(branch.key, parseInt(e.target.value) || 0)}
                                                    className={`w-24 px-3 py-2 border-2 ${branch.border} rounded text-center font-bold text-lg focus:ring-2 focus:${branch.text}/50`}
                                                    autoFocus
                                                />
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2 justify-center">
                                                    <button onClick={onSave} className="text-green-600 hover:text-green-800"><SaveIcon className="w-5 h-5" /></button>
                                                    <button onClick={onCancel} className="text-gray-600 hover:text-gray-800"><XIcon className="w-5 h-5" /></button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="p-3 text-gray-500">{item.id}</td>
                                            <td className="p-2 align-middle">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md shadow-sm" />
                                                ) : (
                                                    <button onClick={() => onGenerateImageClick(item)} className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-md transition-colors" title="Generate Image">
                                                        <ImageIcon className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </td>
                                            <td className="p-3 font-medium text-gray-800">
                                                <div className="flex items-center gap-2">
                                                    <span>{item.name}</span>
                                                    <button 
                                                        onClick={() => onViewHistory(item)} 
                                                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                                                        title="View stock history"
                                                    >
                                                        <HistoryIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="p-3 text-gray-600">{item.brand}</td>
                                            <td className="p-3 text-gray-600">{item.cat}</td>
                                            <td className="p-3 text-center">
                                                <span className={`font-bold text-2xl ${branch.text}`}>{item[branch.key]}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800">
                                                    <EditIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BranchView;