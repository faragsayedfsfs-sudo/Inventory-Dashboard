
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon, XIcon } from './icons';

interface ChatbotProps {
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose, messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="fixed bottom-4 right-4 w-full max-w-md h-[70vh] max-h-[600px] bg-white rounded-xl shadow-2xl flex flex-col z-50 transform transition-all duration-300 ease-in-out animate-slide-in">
            <header className="flex items-center justify-between p-4 bg-indigo-600 text-white rounded-t-xl">
                <h3 className="text-lg font-bold">Inventory Assistant</h3>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-indigo-700">
                    <XIcon className="w-5 h-5" />
                </button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                <div className="flex flex-col gap-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="max-w-xs px-4 py-2 rounded-2xl bg-gray-200 text-gray-800">
                                <div className="flex items-center gap-2">
                                     <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce"></span>
                                </div>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            <form onSubmit={handleSend} className="p-4 border-t bg-white rounded-b-xl">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about inventory..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isLoading}
                        aria-label="Chat message input"
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-2.5 bg-indigo-600 text-white rounded-full disabled:bg-indigo-300 hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" aria-label="Send message">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </form>
             <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Chatbot;
