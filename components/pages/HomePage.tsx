import React from 'react';
import { DeliaLogo } from '../ui/Icons';

const FeatureCard: React.FC<{ title: string; description: string }> = ({ title, description }) => (
    <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-200'>
        <h3 className='text-lg font-bold text-brand-purple-dark'>{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
);


const HomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto text-center py-10">
        <div className="flex justify-center items-center mb-4">
            <DeliaLogo className="h-20" />
        </div>
        <p className='text-xl text-gray-500 mb-12'>Document Enhanced Learning Intelligent Assistant</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <FeatureCard 
                title="📄 Analisi Documenti"
                description="Carica i tuoi PDF per ottenere analisi dettagliate, incluse statistiche su parole chiave e densità del vocabolario."
            />
            <FeatureCard 
                title="💬 Chat Intelligente"
                description="Interagisci con i tuoi documenti tramite una chat AI avanzata che comprende il contesto e fornisce risposte precise."
            />
            <FeatureCard 
                title="🔄 Grafi di Processo"
                description="Estrai automaticamente grafi di processo dai tuoi documenti, completi di fasi, relazioni e condizioni."
            />
        </div>
    </div>
  );
};

export default HomePage;