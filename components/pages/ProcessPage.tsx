import React, { useState, useContext, useCallback, useRef, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { generateProcessGraphFromContext, analyzeGraphWithContext } from '../../services/geminiService';
import ProcessGraph from '../graph/ProcessGraph';
import type { ProcessGraphRef } from '../graph/ProcessGraph';
import ChatMessageUI from '../ui/ChatMessageUI';
import { ProcessIcon, XIcon, TrashIcon, AnalyzeIcon, ZoomInIcon, ZoomOutIcon, FitScreenIcon, ExportIcon, JsonIcon, SvgIcon } from '../ui/Icons';
import type { GraphData, GraphNodeData } from '../../types';

// ================== GraphLegend Component ==================
const GraphLegend: React.FC = () => {
    const legendItems = [
        { label: 'Processo Principale', color: 'bg-node-header-main' },
        { label: 'Decisione', color: 'bg-node-header-decision' },
        { label: 'Inizio/Fine', color: 'bg-node-header-beginend' },
        { label: 'Nodo Critico', color: 'bg-node-header-critical' },
    ];

    return (
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-gray-200">
            <h4 className="font-bold text-sm text-gray-700 mb-2">Legenda</h4>
            <div className="space-y-2">
                {legendItems.map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                        <span className="text-xs text-gray-600">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ================== GraphControls Component ==================
interface GraphControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onCenter: () => void;
    onExport: (format: 'json' | 'svg') => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({ onZoomIn, onZoomOut, onCenter, onExport }) => {
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    return (
        <div className="absolute top-4 right-4 flex items-center gap-2">
            <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200">
                <button onClick={onZoomIn} title="Zoom In" className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"><ZoomInIcon className="h-5 w-5" /></button>
                <button onClick={onZoomOut} title="Zoom Out" className="p-2 text-gray-600 hover:bg-gray-100 border-l border-r"><ZoomOutIcon className="h-5 w-5" /></button>
                <button onClick={onCenter} title="Centra Grafo" className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"><FitScreenIcon className="h-5 w-5" /></button>
            </div>
             <div className="relative">
                <button 
                    onClick={() => setIsExportMenuOpen(prev => !prev)}
                    title="Esporta Grafo" 
                    className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-gray-200 text-gray-600 hover:bg-gray-100"
                >
                    <ExportIcon className="h-5 w-5" />
                </button>
                {isExportMenuOpen && (
                     <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsExportMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
                )}
                {isExportMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border z-20">
                        <button onClick={() => { onExport('json'); setIsExportMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <JsonIcon className="h-4 w-4" />
                            <span>Esporta JSON</span>
                        </button>
                         <button onClick={() => { onExport('svg'); setIsExportMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <SvgIcon className="h-4 w-4" />
                            <span>Esporta SVG</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


// ================== NodeDetailPanel Component ==================
interface NodeDetailPanelProps {
  node: GraphNodeData;
  onClose: () => void;
}

const typeTranslation: Record<string, string> = {
    mainProcess: 'Processo Principale',
    decision: 'Decisione',
    beginEnd: 'Inizio/Fine',
    criticalNode: 'Nodo Critico',
};

const typeColorMap = {
    mainProcess: 'bg-node-header-main',
    decision: 'bg-node-header-decision',
    beginEnd: 'bg-node-header-beginend',
    criticalNode: 'bg-node-header-critical',
};

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ node, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => {
            setIsVisible(true);
        });
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Match transition duration
    };

    const nodeTypeClass = typeColorMap[node.type] || 'bg-gray-500';
    const translatedType = typeTranslation[node.type] || node.type;

    return (
        <div 
            className={`absolute top-0 right-0 h-full w-full max-w-sm bg-white/90 backdrop-blur-sm border-l border-gray-200 shadow-xl flex flex-col transition-transform duration-300 ease-in-out transform z-30 ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="node-details-title"
        >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 flex-shrink-0">
                <h3 id="node-details-title" className="text-lg font-bold text-brand-purple-dark">Dettagli Nodo</h3>
                <button 
                    onClick={handleClose} 
                    className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors"
                    aria-label="Chiudi dettagli"
                >
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
                <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Etichetta</span>
                    <p className="mt-1 text-2xl font-bold text-gray-800">{node.label}</p>
                </div>
                <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</span>
                    <div className="mt-1 flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${nodeTypeClass}`}></span>
                        <p className="text-md text-gray-700 font-medium">{translatedType}</p>
                    </div>
                </div>
                <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrizione</span>
                    <p className="mt-1 text-base text-gray-700 leading-relaxed">{node.description}</p>
                </div>
            </div>
        </div>
    );
};
// ==============================================================


const ProcessPage: React.FC = () => {
  const { 
    filesProcessed, 
    getCombinedTextContent, 
    setActivePage, 
    processChatHistory, 
    setProcessChatHistory,
    resetProcessChat,
    graphData,
    setGraphData
  } = useContext(AppContext);
  
  const [userInput, setUserInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNodeData | null>(null);
  const [isAnalyzingGraph, setIsAnalyzingGraph] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<ProcessGraphRef>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [processChatHistory]);

  useEffect(() => {
    if (!graphData) {
        setIsAnalyzingGraph(false);
    }
  }, [graphData]);
  
  const handleSendMessage = useCallback(async () => {
    const trimmedInput = userInput.trim();
    if (!trimmedInput || isLoading) return;

    setIsLoading(true);
    setError(null);
    const newHistory = [...processChatHistory, { role: 'user' as const, content: trimmedInput }];
    setProcessChatHistory(newHistory);
    setUserInput('');

    try {
      const context = getCombinedTextContent();
      
      if (isAnalyzingGraph && graphData) {
        const { analysisText, updatedGraph } = await analyzeGraphWithContext(trimmedInput, context, graphData);
        setProcessChatHistory([...newHistory, { role: 'assistant' as const, content: analysisText }]);
        if (updatedGraph && updatedGraph.nodes) {
            setGraphData(updatedGraph);
        }
      } else {
        setIsAnalyzingGraph(false);
        setSelectedNode(null);
        const data = await generateProcessGraphFromContext(trimmedInput, context);
        if (data.nodes.length === 0) {
          const errorMessage = "Non sono riuscito a generare un grafo. Potresti essere più specifico su un processo nei tuoi documenti?";
          setError(errorMessage);
          setProcessChatHistory([...newHistory, { role: 'assistant' as const, content: errorMessage }]);
          setGraphData(null);
        } else {
          setGraphData(data);
          setProcessChatHistory([...newHistory, { role: 'assistant' as const, content: `Ho creato un grafo di processo per te. Clicca su un nodo per vederne i dettagli o avvia l'analisi.` }]);
        }
      }
    } catch (e) {
      console.error(e);
      const errorMessage = 'Si è verificato un errore inaspettato. Per favore, riprova.';
      setError(errorMessage);
       setProcessChatHistory([...newHistory, { role: 'assistant' as const, content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading, processChatHistory, getCombinedTextContent, setProcessChatHistory, setGraphData, isAnalyzingGraph, graphData]);
  
  const handleNodeClick = useCallback((node: GraphNodeData) => {
    setSelectedNode(node);
  }, []);

  const handleStartAnalysis = () => {
    setIsAnalyzingGraph(true);
    setProcessChatHistory(prev => [...prev, { role: 'assistant', content: "Modalità analisi attivata. Ora puoi farmi domande specifiche su questo grafo." }]);
  };

  const handleExport = (format: 'json' | 'svg') => {
    if (!graphData) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `process-graph-${timestamp}`;

    if (format === 'json') {
        const jsonStr = JSON.stringify(graphData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } else if (format === 'svg') {
        const svgContent = graphRef.current?.exportToSvg();
        if (svgContent) {
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.svg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
  };

  if (!filesProcessed) {
    return (
      <div className="text-center p-10 bg-white rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-brand-purple-dark">Nessun Documento Trovato</h2>
        <p className="text-gray-600 mt-2">Per favore, carica dei documenti prima di visualizzare i processi.</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Colonna Sinistra: Chat */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-[70vh] lg:h-full min-h-0">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                 <h2 className="text-xl font-bold text-gray-700">
                    {isAnalyzingGraph ? 'Analisi Grafo' : 'Chat Processo'}
                </h2>
                <button
                    onClick={resetProcessChat}
                    title="Pulisci chat e grafo"
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                {processChatHistory.map((msg, index) => (
                    <ChatMessageUI key={index} message={msg} />
                ))}
                 {isLoading && <ChatMessageUI isLoading />}
            </div>

            {graphData && !isAnalyzingGraph && (
                <div className="p-4 border-t border-gray-200">
                    <button 
                        onClick={handleStartAnalysis}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-brand-purple-dark font-semibold rounded-lg hover:bg-purple-200 transition-colors"
                    >
                        <AnalyzeIcon className="h-5 w-5" />
                        Analizza Grafo
                    </button>
                </div>
            )}

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={isAnalyzingGraph ? "Fai una domanda sul grafo..." : "Descrivi un processo..."}
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

        {/* Colonna Destra: Grafo */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center relative overflow-hidden">
          {!graphData && error && (
              <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg">
                <h3 className="font-bold text-lg">Oops!</h3>
                <p>{error}</p>
              </div>
          )}
          {graphData && (
            <>
              <ProcessGraph ref={graphRef} data={graphData} onNodeClick={handleNodeClick} />
              <GraphLegend />
              <GraphControls 
                onZoomIn={() => graphRef.current?.zoomIn()}
                onZoomOut={() => graphRef.current?.zoomOut()}
                onCenter={() => graphRef.current?.centerGraph()}
                onExport={handleExport}
              />
            </>
          )}
          {!graphData && !isLoading && !error && (
            <div className="text-center text-gray-400 p-8">
                <ProcessIcon className="mx-auto h-16 w-16" />
                <h3 className="mt-4 text-xl font-semibold">Il Tuo Grafo di Processo Apparirà Qui</h3>
                <p className="mt-1">Usa la chat per generare un diagramma di processo.</p>
            </div>
          )}
          {selectedNode && (
            <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
          )}
        </div>
    </div>
  );
};

export default ProcessPage;