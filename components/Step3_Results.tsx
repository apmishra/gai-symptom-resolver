import React, { useState } from 'react';
import type { AnalysisResults, DebugLog, Solution } from '../types';
import { querySource } from '../services/geminiService';

interface SolutionCardProps {
    solution: Solution;
    apiKey: string;
    addLog: (log: Omit<DebugLog, 'id' | 'timestamp'>) => void;
}

const SolutionCard: React.FC<SolutionCardProps> = ({ solution, apiKey, addLog }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [question, setQuestion] = useState('');
    // Fix: Corrected the type for `chatHistory` state. The `parts` property should be an array of objects.
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
    const [isQuerying, setIsQuerying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim()) return;
        
        setError(null);
        setIsQuerying(true);
        const userMessage = { role: 'user' as const, parts: [{ text: question }] };
        setChatHistory(prev => [...prev, userMessage]);
        
        try {
            const answer = await querySource(apiKey, solution, question, chatHistory, addLog);
            const modelMessage = { role: 'model' as const, parts: [{ text: answer }] };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (err) {
            setError("Sorry, I couldn't get an answer. Please try again.");
            setChatHistory(prev => prev.slice(0, -1)); // remove user message on error
        } finally {
            setIsQuerying(false);
            setQuestion('');
        }
    };
    
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-4 flex justify-between items-center">
                <h4 className="font-semibold text-primary">{solution.name}</h4>
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200">
                    <p className="text-text-secondary mb-4 whitespace-pre-wrap">{solution.description}</p>
                    <div className="mb-4">
                        <h5 className="font-semibold text-sm mb-1">Sources:</h5>
                        <ul className="list-disc list-inside space-y-1">
                            {solution.sources.map(source => (
                                <li key={source.url}>
                                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">{source.title}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-semibold text-sm mb-2 text-text-primary">Ask about this solution</h5>
                        <div className="space-y-2 mb-2 max-h-48 overflow-y-auto">
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`p-2 rounded-lg text-sm ${msg.role === 'user' ? 'bg-primary/10 text-right' : 'bg-gray-200'}`}>
                                    <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
                                </div>
                            ))}
                        </div>
                         {error && <p className="text-sm text-danger mb-2">{error}</p>}
                        <form onSubmit={handleQuery} className="flex gap-2">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="e.g., What are the side effects?"
                                className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                disabled={isQuerying}
                            />
                            <button type="submit" className="bg-primary text-white p-2 rounded-lg disabled:opacity-50" disabled={isQuerying || !question.trim()}>
                                {isQuerying ? '...' : 'Ask'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

interface SolutionCategoryProps {
    title: string;
    solutions: Solution[];
    apiKey: string;
    addLog: (log: Omit<DebugLog, 'id' | 'timestamp'>) => void;
}

const SolutionCategory: React.FC<SolutionCategoryProps> = ({ title, solutions, apiKey, addLog }) => {
    if (solutions.length === 0) return null;
    return (
        <div className="mb-6">
            <h3 className="text-xl font-bold text-text-primary mb-3 capitalize">{title.replace(/([A-Z])/g, ' $1').trim()}</h3>
            <div className="space-y-3">
                {solutions.map(sol => <SolutionCard key={sol.name} solution={sol} apiKey={apiKey} addLog={addLog}/>)}
            </div>
        </div>
    );
}

interface Step3ResultsProps {
    results: AnalysisResults;
    apiKey: string;
    addLog: (log: Omit<DebugLog, 'id' | 'timestamp'>) => void;
}

const Step3Results: React.FC<Step3ResultsProps> = ({ results, apiKey, addLog }) => {
  if (!results) {
    return (
        <div className="text-center p-8">
            <h2 className="text-xl font-semibold text-text-secondary">No Results Yet</h2>
            <p className="text-text-secondary mt-2">Complete the previous steps to see your analysis.</p>
        </div>
    )
  }
  return (
    <div>
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text-primary mb-2">Analysis Complete</h2>
            <p className="text-text-secondary">Here's a summary of potential reasons and solutions based on your symptoms.</p>
        </div>

        <div className="mb-8">
            <h3 className="text-2xl font-bold text-text-primary mb-4 border-b pb-2">Potential Reasons</h3>
            <div className="space-y-4">
                {results.potentialReasons.map(reason => (
                    <div key={reason.name} className="bg-card p-4 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-lg text-text-primary">{reason.name}</h4>
                        <p className="text-text-secondary mt-1 whitespace-pre-wrap">{reason.description}</p>
                    </div>
                ))}
            </div>
        </div>

        <div>
            <h3 className="text-2xl font-bold text-text-primary mb-4 border-b pb-2">Suggested Solutions</h3>
             <div className="mt-2 mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                <p><strong className="font-bold">Important:</strong> Always consult a healthcare professional before trying any new treatment or remedy. This information is for educational purposes only.</p>
            </div>
            {Object.entries(results.solutions).map(([category, solutions]) => (
                <SolutionCategory key={category} title={category} solutions={solutions} apiKey={apiKey} addLog={addLog} />
            ))}
        </div>
    </div>
  );
};

export default Step3Results;
