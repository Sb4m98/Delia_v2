import React, { useContext, useState, useCallback, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { UploadIcon } from '../ui/Icons';

const UploadPage: React.FC = () => {
  const { uploadAndProcessFiles, isProcessing, filesProcessed, analyses, resetState, setActivePage } = useContext(AppContext);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleAnalyzeClick = useCallback(async () => {
    if (selectedFiles.length > 0) {
      await uploadAndProcessFiles(selectedFiles);
      setSelectedFiles([]);
      setActivePage('Chat'); // Navigate to chat page after processing
    }
  }, [selectedFiles, uploadAndProcessFiles, setActivePage]);

  const analyzedFileNames = useMemo(() => Object.keys(analyses), [analyses]);
  
  return (
    <div>
        <div className='text-center bg-gradient-to-r from-brand-purple to-brand-purple-dark text-white p-8 rounded-2xl mb-8'>
            <h1 className='text-4xl font-bold'>Analisi Documenti</h1>
            <p className='mt-2 opacity-90'>Carica i tuoi PDF per iniziare l'analisi</p>
        </div>

        <div className="max-w-2xl mx-auto">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-10 h-10 text-gray-400 mb-3" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clicca per caricare</span> o trascina i file</p>
                            <p className="text-xs text-gray-500">Solo file PDF</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" accept=".pdf" multiple onChange={handleFileChange} />
                    </label>
                </div> 

                {selectedFiles.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600">
                        <p className="font-semibold">File selezionati:</p>
                        <ul className="list-disc pl-5 mt-1">
                            {selectedFiles.map(f => <li key={f.name}>{f.name}</li>)}
                        </ul>
                    </div>
                )}

                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleAnalyzeClick}
                        disabled={isProcessing || selectedFiles.length === 0}
                        className="px-8 py-3 bg-brand-purple text-white font-bold rounded-lg shadow-md hover:bg-brand-purple-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? 'Analisi in corso...' : '🚀 Avvia Analisi'}
                    </button>
                </div>
            </div>
        </div>

        {filesProcessed && analyzedFileNames.length > 0 && (
            <div className="mt-10 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-brand-purple-dark">File Analizzati</h2>
                    <button onClick={resetState} className="text-sm font-semibold text-gray-600 hover:text-brand-purple">Reset</button>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    {analyzedFileNames.map(name => (
                        <div key={name} className="p-4 mb-2 bg-purple-50 rounded-lg">
                           <h3 className="font-semibold text-brand-purple-dark">📄 {name}</h3>
                           <div className="grid grid-cols-3 gap-4 mt-2 text-center">
                               <div>
                                   <div className="text-xs text-gray-500">Conteggio Parole</div>
                                   <div className="text-lg font-bold text-brand-purple-dark">{analyses[name].wordCount}</div>
                               </div>
                               <div>
                                   <div className="text-xs text-gray-500">Parole Uniche</div>
                                   <div className="text-lg font-bold text-brand-purple-dark">{analyses[name].uniqueWords}</div>
                               </div>
                               <div>
                                   <div className="text-xs text-gray-500">Parola più usata</div>
                                   <div className="text-lg font-bold text-brand-purple-dark">{analyses[name].wordFreq[0]?.[0] || 'N/D'}</div>
                               </div>
                           </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default UploadPage;