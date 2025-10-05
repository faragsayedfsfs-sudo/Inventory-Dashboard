
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import Fuse from 'fuse.js';
import { INITIAL_INVENTORY, BRANCHES } from './constants';
import type { InventoryItem, Branch, View, BranchKey, StockHistoryEntry, SortConfig, SortKey, ChatMessage } from './types';
import DashboardView from './components/DashboardView';
import BranchView from './components/BranchView';
import AddItemModal from './components/AddItemModal';
import ImageGenerationModal from './components/ImageGenerationModal';
import StockHistoryModal from './components/StockHistoryModal';
import Chatbot from './components/Chatbot';
import { ChatIcon } from './components/icons';

const App: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [view, setView] = useState<View>('dashboard');
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<InventoryItem>>({});
  const [filters, setFilters] = useState({ name: '', brand: '', cat: '' });
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'id', direction: 'asc' });

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isImageGenModalOpen, setIsImageGenModalOpen] = useState(false);
  const [currentItemForImageGen, setCurrentItemForImageGen] = useState<InventoryItem | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [currentItemForHistory, setCurrentItemForHistory] = useState<InventoryItem | null>(null);

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! How can I help you with the inventory today?' }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);


  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const handleFilterChange = (filterName: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({ name: '', brand: '', cat: '' });
  };

  const filteredInventory = useMemo(() => {
    const { name, brand, cat } = filters;
    let results: InventoryItem[] = inventory;

    const fuseOptions = {
        // threshold: A value of 0.0 requires a perfect match, 1.0 would match anything.
        // 0.4 provides a good balance of flexibility and relevance.
        threshold: 0.4,
        // distance: Determines how close the match must be to the fuzzy location.
        // A lower value requires a more precise match location. 100 is a reasonable default.
        distance: 100,
        // minMatchCharLength: The minimum number of characters a match must have.
        // Setting to 2 avoids trivial and often irrelevant single-character matches.
        minMatchCharLength: 2,
        // ignoreLocation: When false, the location of the match in the string is important,
        // giving higher relevance to matches found earlier in the string. This helps with word proximity.
        ignoreLocation: false,
    };

    // Advanced fuzzy search for name
    if (name) {
        const fuse = new Fuse(results, {
            ...fuseOptions,
            keys: ['name'],
        });
        results = fuse.search(name).map(result => result.item);
    }

    // Advanced fuzzy search for brand
    if (brand) {
        const fuse = new Fuse(results, {
            ...fuseOptions,
            keys: ['brand'],
        });
        results = fuse.search(brand).map(result => result.item);
    }
    
    // Standard substring search for category
    if (cat) {
        results = results.filter(item =>
            item.cat.toLowerCase().includes(cat.toLowerCase())
        );
    }

    return results;
  }, [inventory, filters]);

  const uniqueSuggestions = useMemo(() => {
    const names = new Set<string>();
    const brands = new Set<string>();
    const cats = new Set<string>();

    inventory.forEach(item => {
        names.add(item.name);
        brands.add(item.brand);
        cats.add(item.cat);
    });

    return {
        names: Array.from(names),
        brands: Array.from(brands),
        cats: Array.from(cats),
    };
  }, [inventory]);

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
        direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredInventory = useMemo(() => {
    let sortableItems = [...filteredInventory];
    if (sortConfig) {
        sortableItems.sort((a, b) => {
            const getTotal = (item: InventoryItem) => BRANCHES.reduce((sum, b) => sum + Number(item[b.key]), 0);
            let aValue: string | number;
            let bValue: string | number;

            if (sortConfig.key === 'total') {
                aValue = getTotal(a);
                bValue = getTotal(b);
            } else {
                aValue = a[sortConfig.key] as string | number;
                bValue = b[sortConfig.key] as string | number;
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                if (aValue.toLowerCase() < bValue.toLowerCase()) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue.toLowerCase() > bValue.toLowerCase()) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            }
            
            return 0;
        });
    }
    return sortableItems;
  }, [filteredInventory, sortConfig]);

  const handleEdit = (item: InventoryItem) => {
    setEditId(item.id);
    setEditData({ ...item });
  };

  const handleSave = () => {
    if (!editId) return;

    const originalItem = inventory.find(item => item.id === editId);
    if (!originalItem) return;

    const newHistory: StockHistoryEntry[] = originalItem.stockHistory ? [...originalItem.stockHistory] : [];
    const updatedItemData = { ...originalItem, ...editData };

    BRANCHES.forEach(branch => {
        const branchKey = branch.key;
        const oldValue = Number(originalItem[branchKey]) || 0;
        const newValue = Number(updatedItemData[branchKey]) || 0;
        
        if (oldValue !== newValue) {
            newHistory.unshift({ // Add to the beginning for chronological order (newest first)
                date: new Date().toISOString(),
                branchKey: branchKey,
                change: newValue - oldValue,
                oldValue: oldValue,
                newValue: newValue,
            });
        }
    });

    setInventory(inventory.map(item => 
        item.id === editId 
            ? { ...updatedItemData, stockHistory: newHistory } 
            : item
    ));

    setEditId(null);
    setEditData({});
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditData({});
  };
  
  const handleEditDataChange = (key: keyof InventoryItem, value: string | number) => {
    setEditData(prev => ({...prev, [key]: value}));
  };

  const handleAddItem = (newItemData: { name: string; brand: string; cat: string }) => {
      const newItem: InventoryItem = {
          id: inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1,
          ...newItemData,
          agouza: 0,
          heliopolis: 0,
          oct: 0,
          alex: 0,
          cityStars: 0,
          stockHistory: [],
      };
      setInventory(prev => [newItem, ...prev]);
      setIsAddItemModalOpen(false);
      openImageGenModal(newItem);
  };

  const openImageGenModal = (item: InventoryItem) => {
      setCurrentItemForImageGen(item);
      setIsImageGenModalOpen(true);
  };

  const handleGenerateImage = async (prompt: string) => {
      if (!currentItemForImageGen) return;
      setIsGeneratingImage(true);
      try {
          const response = await ai.models.generateImages({
              model: 'imagen-4.0-generate-001',
              prompt: prompt,
              config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
              },
          });

          if (response.generatedImages && response.generatedImages.length > 0) {
              const base64ImageBytes = response.generatedImages[0].image.imageBytes;
              const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

              setInventory(prev => prev.map(item =>
                  item.id === currentItemForImageGen.id
                      ? { ...item, imageUrl }
                      : item
              ));
              setIsImageGenModalOpen(false);
              setCurrentItemForImageGen(null);
          }
      } catch (error) {
          console.error("Error generating image:", error);
          alert("Failed to generate image. Please check the console for details.");
      } finally {
          setIsGeneratingImage(false);
      }
  };

  const exportCSV = (branchKey: BranchKey | null = null) => {
    let csv = '';
    let filename = 'all_inventory.csv';
    const inventoryToExport = sortedAndFilteredInventory; // Export sorted and filtered data
  
    if (branchKey) {
      const branch = BRANCHES.find(b => b.key === branchKey);
      filename = `${branch?.name}_inventory.csv`;
      csv = 'Item,Brand,Category,Quantity\n';
      inventoryToExport.forEach(item => {
        csv += `"${item.name}","${item.brand}","${item.cat}",${item[branchKey]}\n`;
      });
    } else {
      const branchHeaders = BRANCHES.map(b => b.name).join(',');
      csv = `Item,Brand,Category,${branchHeaders},Total\n`;
      inventoryToExport.forEach(item => {
        const rowValues = BRANCHES.map(b => item[b.key]).join(',');
        const total = BRANCHES.reduce((sum, b) => sum + Number(item[b.key]), 0);
        csv += `"${item.name}","${item.brand}","${item.cat}",${rowValues},${total}\n`;
      });
    }
  
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const currentBranch = useMemo(() => {
    if (view === 'dashboard') return null;
    return BRANCHES.find(b => b.key === view) as Branch;
  }, [view]);
  
  const handleViewHistory = (item: InventoryItem) => {
      setCurrentItemForHistory(item);
      setIsHistoryModalOpen(true);
  };

  const handleSendMessage = async (message: string) => {
    const newMessages: ChatMessage[] = [...chatMessages, { role: 'user', text: message }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    // Provide the AI with a clean, structured version of the current inventory
    const inventoryData = JSON.stringify(sortedAndFilteredInventory.map(({ id, name, brand, cat, agouza, heliopolis, oct, alex, cityStars }) => ({
        id,
        name,
        brand,
        category: cat,
        stock_agouza: agouza,
        stock_heliopolis: heliopolis,
        stock_6th_of_oct: oct,
        stock_alex: alex,
        stock_city_stars: cityStars,
        total_stock: agouza + heliopolis + oct + alex + cityStars,
    })));

    const systemInstruction = `You are a helpful and friendly inventory management assistant.
Your goal is to answer user questions based on the provided inventory data.
The inventory data is a JSON array of objects. Each object represents an item. The data reflects the current filters and sorting on the user's screen.
The branches are: Agouza, Heliopolis, 6th of Oct, Alex, and City Stars.
When calculating totals, sum the stock from all branches unless specified otherwise.
Keep your answers concise and clear.

Here is the current inventory data:
${inventoryData}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        
        const aiResponse = response.text;
        setChatMessages([...newMessages, { role: 'model', text: aiResponse }]);

    } catch (error) {
        console.error("Error communicating with AI:", error);
        setChatMessages([...newMessages, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
        setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 font-sans">
      {view === 'dashboard' ? (
        <DashboardView
          inventory={sortedAndFilteredInventory}
          totalItemCount={inventory.length}
          branches={BRANCHES}
          editId={editId}
          editData={editData}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancelEdit}
          onEditDataChange={handleEditDataChange}
          onExport={exportCSV}
          setView={setView}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onAddItemClick={() => setIsAddItemModalOpen(true)}
          onGenerateImageClick={openImageGenModal}
          onViewHistory={handleViewHistory}
          sortConfig={sortConfig}
          onSort={handleSort}
          suggestions={uniqueSuggestions}
        />
      ) : currentBranch ? (
        <BranchView
          inventory={sortedAndFilteredInventory}
          totalItemCount={inventory.length}
          branch={currentBranch}
          editId={editId}
          editData={editData}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancelEdit}
          onEditDataChange={handleEditDataChange}
          onExport={() => exportCSV(currentBranch.key)}
          setView={setView}
          allBranches={BRANCHES}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          onGenerateImageClick={openImageGenModal}
          onViewHistory={handleViewHistory}
          sortConfig={sortConfig}
          onSort={handleSort}
          suggestions={uniqueSuggestions}
        />
      ) : null}
      
      {isAddItemModalOpen && (
        <AddItemModal
          onClose={() => setIsAddItemModalOpen(false)}
          onAddItem={handleAddItem}
        />
      )}

      {isImageGenModalOpen && currentItemForImageGen && (
        <ImageGenerationModal
          item={currentItemForImageGen}
          isGenerating={isGeneratingImage}
          onClose={() => {
              setIsImageGenModalOpen(false);
              setCurrentItemForImageGen(null);
          }}
          onGenerate={handleGenerateImage}
        />
      )}

      {isHistoryModalOpen && currentItemForHistory && (
        <StockHistoryModal
          item={currentItemForHistory}
          branches={BRANCHES}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}

      {!isChatOpen && (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 z-40"
            aria-label="Open chat assistant"
        >
            <ChatIcon className="w-6 h-6" />
        </button>
      )}

      {isChatOpen && (
        <Chatbot 
            onClose={() => setIsChatOpen(false)}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
        />
      )}

    </div>
  );
};

export default App;
