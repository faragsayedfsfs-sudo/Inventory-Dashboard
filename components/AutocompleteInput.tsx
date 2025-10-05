import React, { useState, useEffect, useRef } from 'react';

interface AutocompleteInputProps {
    value: string;
    onChange: (value: string) => void;
    suggestions: string[];
    placeholder: string;
    id: string;
    label: string;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({ value, onChange, suggestions, placeholder, id, label }) => {
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Hide suggestions when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const userInput = e.currentTarget.value;
        const newFilteredSuggestions = suggestions.filter(
            suggestion => suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        );
        onChange(userInput);
        setFilteredSuggestions(newFilteredSuggestions.slice(0, 7)); // Limit suggestions
        setShowSuggestions(true);
        setActiveSuggestionIndex(0);
    };
    
    const onClick = (suggestion: string) => {
        onChange(suggestion);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (showSuggestions && filteredSuggestions.length > 0) {
            if (e.key === 'Enter') {
                e.preventDefault();
                onClick(filteredSuggestions[activeSuggestionIndex]);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeSuggestionIndex === 0) return;
                setActiveSuggestionIndex(activeSuggestionIndex - 1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (activeSuggestionIndex === filteredSuggestions.length - 1) return;
                setActiveSuggestionIndex(activeSuggestionIndex + 1);
            } else if (e.key === 'Escape') {
                setShowSuggestions(false);
            }
        }
    };

    const renderSuggestions = () => {
        if (showSuggestions && value && filteredSuggestions.length) {
            return (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <li
                            key={suggestion}
                            onClick={() => onClick(suggestion)}
                            onMouseEnter={() => setActiveSuggestionIndex(index)}
                            className={`p-2 cursor-pointer hover:bg-indigo-100 ${index === activeSuggestionIndex ? 'bg-indigo-100' : ''}`}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            );
        }
        return null;
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                id={id}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                onFocus={handleChange}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {renderSuggestions()}
        </div>
    );
};

export default AutocompleteInput;