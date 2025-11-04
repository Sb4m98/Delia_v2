import { GoogleGenAI, Type } from "@google/genai";
import type { GraphData } from '../types';

if (!process.env.API_KEY) {
    throw new Error("La variabile d'ambiente API_KEY non è impostata");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const graphResponseSchema = {
  type: Type.OBJECT,
  properties: {
    nodes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          type: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["id", "label", "type", "description"],
      },
    },
    edges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING },
          target: { type: Type.STRING },
          label: { type: Type.STRING },
        },
        required: ["source", "target"],
      },
    },
  },
  required: ["nodes", "edges"],
};

export const generateProcessGraphFromContext = async (prompt: string, context: string): Promise<GraphData> => {
  const fullPrompt = `
    Analizza il contesto del documento fornito per generare un grafo di processo diretto basato sulla richiesta dell'utente.
    Il grafo deve rappresentare il flusso del processo descritto.
    Assicurati che ogni nodo abbia un ID univoco, un'etichetta chiara, un tipo e una descrizione concisa.
    I tipi di nodo devono essere uno tra: 'mainProcess' per i passaggi standard, 'decision' per i punti di diramazione, 'beginEnd' per i punti di inizio/fine, e 'criticalNode' per i passaggi cruciali.
    Assicurati che gli archi colleghino i nodi in modo logico. Se c'è una decisione, usa etichette per gli archi come 'Sì' o 'No'.
    Il primo passaggio dovrebbe solitamente essere di tipo 'beginEnd'.

    CONTESTO DEL DOCUMENTO:
    ---
    ${context}
    ---

    RICHIESTA UTENTE: "${prompt}"
    
    Restituisci SOLO l'oggetto JSON che corrisponde allo schema fornito. Se nel contesto non viene trovato alcun processo pertinente alla richiesta dell'utente, restituisci un oggetto JSON vuoto: {"nodes": [], "edges": []}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: graphResponseSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText) as GraphData;
    
    if (!parsedData.nodes || !parsedData.edges) {
        return { nodes: [], edges: [] };
    }

    return parsedData;
  } catch (error) {
    console.error("Errore durante la chiamata all'API Gemini per la generazione del grafo:", error);
    throw new Error("Impossibile generare il grafo di processo dall'API Gemini.");
  }
};


export const answerFromDocuments = async (question: string, context: string): Promise<string> => {
    const fullPrompt = `
      Sei un assistente intelligente. Rispondi alla domanda dell'utente basandoti ESCLUSIVAMENTE sul contesto del documento fornito.
      La tua risposta deve essere in italiano.
      Se la risposta non può essere trovata nel contesto, dichiara di non riuscire a trovare l'informazione nei documenti forniti.
      Sii specifico e cita parti del contesto quando possibile. Formatta la tua risposta usando Markdown (ad esempio, usa **testo** per il grassetto e '*' per gli elenchi puntati).

      CONTESTO:
      ---
      ${context}
      ---
      
      DOMANDA: "${question}"

      RISPOSTA:
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        });
        return response.text;
    } catch (error) {
        console.error("Errore durante la chiamata all'API Gemini per la chat sui documenti:", error);
        throw new Error("Impossibile ottenere una risposta dall'API Gemini.");
    }
};

const analysisResponseSchema = {
    type: Type.OBJECT,
    properties: {
        analysisText: {
            type: Type.STRING,
            description: "La risposta testuale alla richiesta dell'utente, formattata in Markdown.",
        },
        updatedGraph: {
            ...graphResponseSchema,
            description: "Il grafo di processo aggiornato in formato JSON. Se non sono state richieste modifiche al grafo, restituisci il grafo originale fornito nell'input.",
        }
    },
    required: ["analysisText", "updatedGraph"],
};

export const analyzeGraphWithContext = async (prompt: string, context: string, graphData: GraphData): Promise<{ analysisText: string; updatedGraph: GraphData; }> => {
    const fullPrompt = `
      Sei un analista di processi esperto. Il tuo compito è analizzare e MODIFICARE un grafo di processo fornito in formato JSON, utilizzando anche il contesto di un documento originale.
      - Analizza la richiesta dell'utente.
      - Se la richiesta implica una modifica al grafo (es. "aggiungi un nodo", "rinomina il nodo X", "cambia la connessione"), modifica la struttura JSON del grafo di conseguenza. Assicurati che il nuovo grafo sia valido (ID univoci, archi corretti).
      - Se la richiesta è solo una domanda sul grafo (es. "qual è il collo di bottiglia?"), non modificare il grafo.
      - Fornisci una risposta testuale concisa in 'analysisText' che spieghi cosa hai fatto o che risponda alla domanda.
      - Restituisci SEMPRE la struttura del grafo (modificata o originale) nel campo 'updatedGraph'.

      CONTESTO DEL DOCUMENTO ORIGINALE:
      ---
      ${context}
      ---

      GRAFO DI PROCESSO ATTUALE (JSON):
      ---
      ${JSON.stringify(graphData, null, 2)}
      ---

      RICHIESTA DELL'UTENTE: "${prompt}"

      Restituisci SOLO l'oggetto JSON che corrisponde allo schema fornito.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisResponseSchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText) as { analysisText: string; updatedGraph: GraphData; };

        if (!parsedData.analysisText || !parsedData.updatedGraph) {
            throw new Error("Risposta JSON non valida dall'API.");
        }

        return parsedData;

    } catch (error) {
        console.error("Errore durante la chiamata all'API Gemini per l'analisi del grafo:", error);
        return {
            analysisText: "Si è verificato un errore durante l'aggiornamento del grafo. L'analisi potrebbe non essere completa.",
            updatedGraph: graphData 
        };
    }
};