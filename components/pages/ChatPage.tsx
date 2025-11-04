import React, { useState, useContext, useCallback, useRef, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { answerFromDocuments } from '../../services/geminiService';
import ChatMessageUI from '../ui/ChatMessageUI';
import { TrashIcon } from '../ui/Icons';

const ChatPage: React.FC = () => {
  const { filesProcessed, getCombinedTextContent, setActivePage, chatHistory, setChatHistory, resetDocumentChat } = useContext(AppContext);
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSendMessage = useCallback(async () => {
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading) return;

    setIsLoading(true);
    const newHistory = [...chatHistory, { role: 'user' as const, content: trimmedInput }];
    setChatHistory(newHistory);
    setUserInput('');

    try {
      const context = getCombinedTextContent();
      const response = await answerFromDocuments(trimmedInput, context);
      setChatHistory([...newHistory, { role: 'assistant' as const, content: response }]);
    } catch (error) {
      console.error(error);
      setChatHistory([...newHistory, { role: 'assistant' as const, content: 'Spiacente, si è verificato un errore. Per favore, riprova.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, chatHistory, getCombinedTextContent, setChatHistory]);

  if (!filesProcessed) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-brand-purple-dark">Nessun Documento Trovato</h2>
        <p className="text-gray-600 mt-2">Per favore, carica e analizza prima alcuni documenti.</p>
        <button
          onClick={() => setActivePage('Upload')}
          className="mt-4 px-6 py-2 bg-brand-purple text-white font-semibold rounded-lg shadow-md hover:bg-brand-purple-dark"
        >
          Vai alla Pagina di Caricamento
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-full">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-700">
                Chat con i Documenti
            </h2>
            <button
                onClick={resetDocumentChat}
                title="Pulisci chat"
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
                <TrashIcon className="h-5 w-5" />
            </button>
        </div>
        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
            {chatHistory.map((msg, index) => (
                <ChatMessageUI key={index} message={msg} />
            ))}
            {isLoading && <ChatMessageUI isLoading />}
        </div>
        <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
            <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Fai una domanda sui documenti..."
                className="w-full text-base p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-purple transition"
                disabled={isLoading}
            />
            <button
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim()}
                className="w-12 h-12 flex-shrink-0 bg-brand-purple text-white font-semibold rounded-lg shadow-md hover:bg-brand-purple-dark transition disabled:bg-gray-400 flex items-center justify-center"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
            </div>
        </div>
    </div>
  );
};

export default ChatPage;