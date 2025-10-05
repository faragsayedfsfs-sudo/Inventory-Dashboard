
import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import type { InventoryItem, Branch, View, SortConfig, SortKey, BranchKey } from '../types';
import { DownloadIcon, EditIcon, SaveIcon, XIcon, BuildingIcon, DashboardIcon, PlusIcon, ImageIcon, HistoryIcon, ChevronUpIcon, ChevronDownIcon } from './icons';
import AutocompleteInput from './AutocompleteInput';

interface InventoryChartsProps {
    inventory: InventoryItem[];
    branches: Branch[];
}

const InventoryCharts: React.FC<InventoryChartsProps> = ({ inventory, branches }) => {
    const branchData = useMemo(() => {
        return branches.map(branch => ({
            name: branch.name,
            value: inventory.reduce((sum, item) => sum + Number(item[branch.key]), 0),
        }));
    }, [inventory, branches]);

    const branchColors = useMemo(() => {
        const colorMap: { [key: string]: string } = {
            'purple-600': '#7C3AED',
            'green-600': '#16A34A',
            'blue-600': '#2563EB',
            'orange-600': '#EA580C',
            'red-600': '#DC2626'
        };
        return branches.map(b => {
            const colorKey = b.bg.substring(3);
            return colorMap[colorKey] || '#8884d8';
        });
    }, [branches]);

    const categoryData = useMemo(() => {
        const categoryMap = new Map<string, number>();
        inventory.forEach(item => {
            const total = branches.reduce((sum, b) => sum + Number(item[b.key]), 0);
            const currentTotal = categoryMap.get(item.cat) || 0;
            categoryMap.set(item.cat, currentTotal + total);
        });

        return Array.from(categoryMap.entries())
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    }, [inventory, branches]);

    const CATEGORY_CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#d0ed57', '#ff7300'];

    return (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6 p-6 bg-gray-50 rounded-lg border">
            <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Stock Distribution by Branch</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie
                            data={branchData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                            {branchData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={branchColors[index % branchColors.length]} className={`focus:outline-none ring-2 ring-offset-2 ring-white`} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number, name: string) => [`${value.toLocaleString()} items`, name]} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Top Categories by Stock</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={categoryData} margin={{ top: 5, right: 20, left: 10, bottom: 75 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
                        <Tooltip formatter={(value: number) => [`${value.toLocaleString()} items`, "Total Stock"]} />
                        <Bar dataKey="total" name="Total Stock">
                             {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </section>
    );
};


interface DashboardViewProps {
    inventory: InventoryItem[];
    totalItemCount: number;
    branches: Branch[];
    editId: number | null;
    editData: Partial<InventoryItem>;
    onEdit: (item: InventoryItem) => void;
    onSave: () => void;
    onCancel: () => void;
    onEditDataChange: (key: keyof InventoryItem, value: string | number) => void;
    onExport: (branchKey?: BranchKey | null) => void;
    setView: (view: View) => void;
    filters: { name: string; brand: string; cat: string };
    onFilterChange: (filterName: 'name' | 'brand' | 'cat', value: string) => void;
    onClearFilters: () => void;
    onAddItemClick: () => void;
    onGenerateImageClick: (item: InventoryItem) => void;
    onViewHistory: (item: InventoryItem) => void;
    sortConfig: SortConfig | null;
    onSort: (key: SortKey) => void;
    suggestions: { names: string[], brands: string[], cats: string[] };
}

const DashboardView: React.FC<DashboardViewProps> = ({
    inventory,
    totalItemCount,
    branches,
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
    onAddItemClick,
    onGenerateImageClick,
    onViewHistory,
    sortConfig,
    onSort,
    suggestions,
}) => {
    const getTotal = (item: Partial<InventoryItem>) => branches.reduce((sum, b) => sum + (Number(item[b.key]) || 0), 0);
    const getBranchTotal = (branchKey: string) => inventory.reduce((sum, item) => sum + (Number(item[branchKey]) || 0), 0);
    const getGrandTotal = () => inventory.reduce((sum, item) => sum + getTotal(item), 0);

    const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
    const exportDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target as Node)) {
                setIsExportDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [exportDropdownRef]);

    const handleBranchExport = (branchKey: BranchKey) => {
        onExport(branchKey);
        setIsExportDropdownOpen(false);
    };

    const renderSortArrow = (key: SortKey) => {
        if (!sortConfig || sortConfig.key !== key) return null;
        if (sortConfig.direction === 'asc') return <ChevronUpIcon className="w-4 h-4 inline-block ml-1 text-gray-400" />;
        return <ChevronDownIcon className="w-4 h-4 inline-block ml-1 text-gray-400" />;
    };
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg p-6">
                <header className="mb-6">
                    <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Inventory Dashboard</h1>
                    <p className="text-gray-500 mt-1">Showing {inventory.length} of {totalItemCount} Unique Items</p>
                </header>

                <nav className="flex flex-wrap gap-2 mb-6 pb-4 border-b">
                    <button onClick={() => setView('dashboard')} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 shadow-sm hover:bg-indigo-700 transition-colors">
                        <DashboardIcon className="w-4 h-4" />
                        Dashboard
                    </button>
                    {branches.map(b => (
                        <button key={b.key} onClick={() => setView(b.key)} className={`px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg flex items-center gap-2 transition-colors`}>
                            <BuildingIcon className="w-4 h-4" />
                            {b.name}
                        </button>
                    ))}
                </nav>

                <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    {branches.map(b => (
                        <div key={b.key} className={`${b.light} p-4 rounded-lg border-l-4 ${b.border}`}>
                            <p className={`text-sm font-medium ${b.text}`}>{b.name}</p>
                            <p className="text-3xl font-bold text-gray-800">{getBranchTotal(b.key).toLocaleString()}</p>
                        </div>
                    ))}
                    <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600">
                        <p className="text-sm font-medium text-indigo-600">Grand Total</p>
                        <p className="text-3xl font-bold text-gray-800">{getGrandTotal().toLocaleString()}</p>
                    </div>
                </section>

                <InventoryCharts inventory={inventory} branches={branches} />

                <section className="mb-4 p-4 bg-gray-50 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <AutocompleteInput
                            id="name-filter"
                            label="Item Name"
                            placeholder="Fuzzy search by name..."
                            value={filters.name}
                            onChange={(value) => onFilterChange('name', value)}
                            suggestions={suggestions.names}
                        />
                        <AutocompleteInput
                            id="brand-filter"
                            label="Brand"
                            placeholder="Fuzzy search by brand..."
                            value={filters.brand}
                            onChange={(value) => onFilterChange('brand', value)}
                            suggestions={suggestions.brands}
                        />
                         <AutocompleteInput
                            id="cat-filter"
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

                <div className="flex justify-between items-center mb-4">
                    <button onClick={onAddItemClick} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-green-700 transition-colors">
                        <PlusIcon className="w-4 h-4" />
                        Add New Item
                    </button>
                    <div className="relative inline-block text-left" ref={exportDropdownRef}>
                        <div className="flex rounded-lg shadow-sm">
                            <button
                                onClick={() => onExport()}
                                type="button"
                                className="flex items-center gap-2 bg-indigo-600 text-white pl-4 pr-3 py-2 rounded-l-lg hover:bg-indigo-700 transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                Export All
                            </button>
                            <button
                                onClick={() => setIsExportDropdownOpen(prev => !prev)}
                                type="button"
                                className="flex items-center p-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-colors border-l border-indigo-500 focus:z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                aria-haspopup="true"
                                aria-expanded={isExportDropdownOpen}
                            >
                                <ChevronDownIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {isExportDropdownOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                    <p className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wider">Export by Branch</p>
                                    {branches.map(b => (
                                        <a
                                            href="#"
                                            key={b.key}
                                            onClick={(e) => { e.preventDefault(); handleBranchExport(b.key); }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem"
                                        >
                                            {b.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="p-3 text-left font-semibold">
                                    <button onClick={() => onSort('id')} className="flex items-center gap-1 hover:text-gray-300 transition-colors">ID {renderSortArrow('id')}</button>
                                </th>
                                <th className="p-3 text-left font-semibold">Image</th>
                                <th className="p-3 text-left font-semibold">
                                    <button onClick={() => onSort('name')} className="flex items-center gap-1 hover:text-gray-300 transition-colors">Item {renderSortArrow('name')}</button>
                                </th>
                                <th className="p-3 text-left font-semibold">
                                    <button onClick={() => onSort('brand')} className="flex items-center gap-1 hover:text-gray-300 transition-colors">Brand {renderSortArrow('brand')}</button>
                                </th>
                                <th className="p-3 text-left font-semibold">
                                    <button onClick={() => onSort('cat')} className="flex items-center gap-1 hover:text-gray-300 transition-colors">Category {renderSortArrow('cat')}</button>
                                </th>
                                {branches.map(b => (
                                    <th key={b.key} className={`p-3 text-center font-semibold ${b.bg}`}>
                                        <button onClick={() => onSort(b.key)} className="w-full flex justify-center items-center gap-1 hover:opacity-80 transition-opacity">{b.abbreviation} {renderSortArrow(b.key)}</button>
                                    </th>
                                ))}
                                <th className="p-3 text-center font-semibold bg-indigo-700">
                                    <button onClick={() => onSort('total')} className="w-full flex justify-center items-center gap-1 hover:opacity-80 transition-opacity">Total {renderSortArrow('total')}</button>
                                </th>
                                <th className="p-3 text-center font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventory.map((item, i) => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    {editId === item.id ? (
                                        <>
                                            <td className="p-3 text-gray-500">{item.id}</td>
                                            <td className="p-2"></td>
                                            <td className="p-3 font-medium text-gray-800">{item.name}</td>
                                            <td className="p-3 text-gray-600">{item.brand}</td>
                                            <td className="p-3 text-gray-600">{item.cat}</td>
                                            {branches.map(b => (
                                                <td key={b.key} className="p-2"><input type="number" value={editData[b.key] || 0} onChange={(e) => onEditDataChange(b.key, parseInt(e.target.value) || 0)} className="w-20 px-1 py-1 border rounded text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" /></td>
                                            ))}
                                            <td className="p-3 text-center font-bold">{getTotal(editData)}</td>
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
                                            {branches.map(b => (
                                                <td key={b.key} className="p-3 text-center font-semibold text-gray-700">{item[b.key]}</td>
                                            ))}
                                            <td className="p-3 text-center font-bold text-indigo-600">{getTotal(item)}</td>
                                            <td className="p-3 text-center">
                                                <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-800"><EditIcon className="w-5 h-5" /></button>
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

export default DashboardView;