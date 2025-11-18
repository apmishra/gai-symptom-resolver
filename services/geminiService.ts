import { GoogleGenAI, Type } from "@google/genai";
import { PROMPT_PREFIX } from '../constants';
import type { AnalysisResults, DebugLog, Reason, Solution, Symptom } from '../types';

type AddLogFunction = (log: Omit<DebugLog, 'id' | 'timestamp'>) => void;

const getAiClient = (apiKey: string) => new GoogleGenAI({ apiKey });

const symptomSchema = {
    type: Type.OBJECT,
    properties: {
        symptoms: {
            type: Type.ARRAY,
            description: "A list of potential symptoms found in the text.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the symptom." },
                    explanation: { type: Type.STRING, description: "A brief explanation of why this symptom was identified from the text provided." }
                },
                required: ["name", "explanation"]
            }
        }
    },
    required: ["symptoms"]
};

// Define solution schema once to avoid repetition and $ref, which may not be supported.
const solutionSchema = {
    type: Type.OBJECT,
    properties: {
        name: { type: Type.STRING, description: "The name of the solution or remedy." },
        description: { type: Type.STRING, description: "A detailed description of the solution." },
        sources: {
            type: Type.ARRAY,
            description: "A list of web sources for this information.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the source webpage." },
                    url: { type: Type.STRING, description: "The full URL to the source." }
                },
                required: ["title", "url"]
            }
        }
    },
    required: ["name", "description", "sources"]
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        potentialReasons: {
            type: Type.ARRAY,
            description: "A list of potential underlying reasons or conditions for the given symptoms.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "The name of the potential reason/condition." },
                    description: { type: Type.STRING, description: "A detailed explanation of the reason and its connection to the symptoms." }
                },
                required: ["name", "description"]
            }
        },
        solutions: {
            type: Type.OBJECT,
            description: "A categorized list of potential management solutions or remedies.",
            properties: {
                commonSense: { type: Type.ARRAY, items: solutionSchema },
                ayurvedic: { type: Type.ARRAY, items: solutionSchema },
                homeopathic: { type: Type.ARRAY, items: solutionSchema },
                allopathic: { type: Type.ARRAY, items: solutionSchema },
                naturopathic: { type: Type.ARRAY, items: solutionSchema },
            },
            required: ["commonSense", "ayurvedic", "homeopathic", "allopathic", "naturopathic"]
        }
    },
    required: ["potentialReasons", "solutions"],
};


export const extractSymptomsFromText = async (apiKey: string, text: string, addLog: AddLogFunction): Promise<Symptom[]> => {
    const prompt = `Analyze the following medical text and extract potential symptoms. Provide a brief explanation for each identified symptom based on the text.

Medical Text:
---
${text}
---
`;
    addLog({ type: 'api-request', message: 'Extracting symptoms...', data: { prompt } });
    try {
        const ai = getAiClient(apiKey);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${PROMPT_PREFIX}\n${prompt}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: symptomSchema,
            }
        });

        const jsonText = response.text;
        const result = JSON.parse(jsonText);
        addLog({ type: 'api-response', message: 'Symptoms extracted successfully.', data: result });
        return result.symptoms || [];
    } catch (e) {
        console.error(e);
        addLog({ type: 'error', message: 'Failed to extract symptoms.', data: e });
        throw e;
    }
};

export const getAnalysis = async (apiKey: string, symptoms: string[], addLog: AddLogFunction): Promise<AnalysisResults> => {
    const prompt = `Based on the following list of confirmed symptoms, provide potential reasons and a categorized list of solutions (Common Sense, Ayurvedic, Homeopathic, Allopathic, Naturopathic). For each solution, provide a name, a detailed description, and at least one verifiable source URL.

Confirmed Symptoms:
---
- ${symptoms.join('\n- ')}
---
`;
    addLog({ type: 'api-request', message: 'Getting analysis...', data: { prompt } });
    try {
        const ai = getAiClient(apiKey);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${PROMPT_PREFIX}\n${prompt}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            }
        });
        
        const jsonText = response.text;
        const result = JSON.parse(jsonText);
        addLog({ type: 'api-response', message: 'Analysis received successfully.', data: result });
        return result as AnalysisResults;

    } catch (e) {
        console.error(e);
        addLog({ type: 'error', message: 'Failed to get analysis.', data: e });
        throw e;
    }
};

// Fix: Corrected the type for `chatHistory` parameter. The `parts` property should be an array of objects.
export const querySource = async (apiKey: string, source: Solution, question: string, chatHistory: { role: 'user' | 'model', parts: { text: string }[] }[], addLog: AddLogFunction): Promise<string> => {
    const systemInstruction = `${PROMPT_PREFIX}
You are an expert Q&A agent for a specific health topic. Your knowledge is strictly limited to the provided source material. Answer the user's question based *only* on the text below. If the answer isn't in the text, say "I cannot answer that based on the provided source." Do not use outside knowledge.

Source Name: ${source.name}
Source Description:
---
${source.description}
${source.sources.map(s => `URL: ${s.url}`).join('\n')}
---
`;
    addLog({ type: 'api-request', message: 'Querying source...', data: { systemInstruction, question, chatHistory } });
    
    try {
      const ai = getAiClient(apiKey);
      const chat = ai.chats.create({ 
          model: 'gemini-2.5-flash', 
          history: chatHistory,
          config: {
            systemInstruction,
          }
      });

      const response = await chat.sendMessage({ message: question });

      const text = response.text;
      addLog({ type: 'api-response', message: 'Source query successful.', data: { text } });
      return text;
    } catch (e) {
      console.error(e);
      addLog({ type: 'error', message: 'Failed to query source.', data: e });
      throw e;
    }
}