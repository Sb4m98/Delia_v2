import React, { createContext, useState, useCallback } from 'react';
import type { Page, ProcessedDocument, DocumentAnalysis, ChatMessage, GraphData } from '../types';
import { extractTextFromPdf } from '../services/pdfProcessor';
import { analyzeText } from '../services/textProcessor';

interface AppContextType {
  activePage: Page;
  setActivePage: (page: Page) => void;
  
  documents: ProcessedDocument[];
  analyses: Record<string, DocumentAnalysis>;
  isProcessing: boolean;
  filesProcessed: boolean;
  uploadAndProcessFiles: (files: File[]) => Promise<void>;
  resetState: () => void;
  getCombinedTextContent: () => string;

  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  resetDocumentChat: () => void;
  
  processChatHistory: ChatMessage[];
  setProcessChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  resetProcessChat: () => void;

  graphData: GraphData | null;
  setGraphData: React.Dispatch<React.SetStateAction<GraphData | null>>;

  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;

  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

const initialDocumentChat: ChatMessage[] = [
    { role: 'assistant', content: "Ciao! Chiedimi qualsiasi cosa sui documenti che hai caricato." }
];

const initialProcessChat: ChatMessage[] = [
    { role: 'assistant', content: "Ciao! Descrivi un processo presente nei tuoi documenti e io lo visualizzerò per te." }
];

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<Page>('Home');
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, DocumentAnalysis>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [filesProcessed, setFilesProcessed] = useState<boolean>(false);

  // State for ChatPage
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initialDocumentChat);

  // State for ProcessPage
  const [processChatHistory, setProcessChatHistory] = useState<ChatMessage[]>(initialProcessChat);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  // State for UI
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);


  const uploadAndProcessFiles = useCallback(async (files: File[]) => {
    setIsProcessing(true);
    // Reset previous session data on new upload
    setDocuments([]);
    setAnalyses({});
    
    const newDocs: ProcessedDocument[] = [];
    const newAnalyses: Record<string, DocumentAnalysis> = {};

    for (const file of files) {
      try {
        const textContent = await extractTextFromPdf(file);
        newDocs.push({ name: file.name, textContent });
        newAnalyses[file.name] = analyzeText(textContent);
      } catch (error)
      {
        console.error(`Impossibile elaborare ${file.name}:`, error);
      }
    }
    
    setDocuments(newDocs);
    setAnalyses(newAnalyses);
    
    setFilesProcessed(true);
    setIsProcessing(false);
  }, []);

  const resetState = useCallback(() => {
    setActivePage('Home');
    setDocuments([]);
    setAnalyses({});
    setFilesProcessed(false);
    setIsProcessing(false);
    setChatHistory(initialDocumentChat);
    setProcessChatHistory(initialProcessChat);
    setGraphData(null);
  }, []);
  
  const resetDocumentChat = useCallback(() => {
    setChatHistory(initialDocumentChat);
  }, []);

  const resetProcessChat = useCallback(() => {
    setProcessChatHistory(initialProcessChat);
    setGraphData(null);
  }, []);
  
  const getCombinedTextContent = useCallback((): string => {
    return documents.map(doc => `--- Documento: ${doc.name} ---\n\n${doc.textContent}`).join('\n\n');
  }, [documents]);

  const value = {
    activePage,
    setActivePage,
    documents,
    analyses,
    isProcessing,
    filesProcessed,
    uploadAndProcessFiles,
    resetState,
    getCombinedTextContent,
    chatHistory,
    setChatHistory,
    resetDocumentChat,
    processChatHistory,
    setProcessChatHistory,
    resetProcessChat,
    graphData,
    setGraphData,
    isSidebarCollapsed,
    toggleSidebar,
    isMobileMenuOpen,
    toggleMobileMenu,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};