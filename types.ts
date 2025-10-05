
export type BranchKey = 'agouza' | 'heliopolis' | 'oct' | 'alex' | 'cityStars';

export interface StockHistoryEntry {
    date: string;
    branchKey: BranchKey;
    change: number;
    oldValue: number;
    newValue: number;
}

export interface InventoryItem {
    id: number;
    name: string;
    brand: string;
    cat: string;
    agouza: number;
    heliopolis: number;
    oct: number;
    alex: number;
    cityStars: number;
    imageUrl?: string;
    stockHistory?: StockHistoryEntry[];
    [key: string]: string | number | undefined | StockHistoryEntry[];
}

export interface Branch {
    key: BranchKey;
    name: string;
    bg: string;
    light: string;
    border: string;
    dark: string;
    text: string;
    abbreviation: string;
}

export type View = 'dashboard' | BranchKey;

export type SortKey = keyof InventoryItem | 'total';

export interface SortConfig {
    key: SortKey;
    direction: 'asc' | 'desc';
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}
