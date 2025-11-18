
import React, { useState, useCallback } from 'react';
import type { AppStep, ConfirmedSymptom, DebugLog, AnalysisResults } from '../types';
import { extractSymptomsFromText, getAnalysis } from '../services/geminiService';
import Step1Input from '../components/Step1_Input';
import Step2SymptomConfirmation from '../components/Step2_SymptomConfirmation';
import Step3Results from '../components/Step3_Results';

interface MainViewProps {
  apiKey: string;
  addLog: (log: Omit<DebugLog, 'id' | 'timestamp'>) => void;
}

const MainView: React.FC<MainViewProps> = ({ apiKey, addLog }) => {
  const [step, setStep] = useState<AppStep>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [extractedText, setExtractedText] = useState<string>('');
  const [suggestedSymptoms, setSuggestedSymptoms] = useState<ConfirmedSymptom[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);

  const handleReset = useCallback(() => {
    setStep('input');
    setIsLoading(false);
    setError(null);
    setExtractedText('');
    setSuggestedSymptoms([]);
    setAnalysisResults(null);
    addLog({type:'info', message:'Workflow reset by user.'})
  }, [addLog]);

  const handleTextSubmit = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    setExtractedText(text);
    try {
      const symptoms = await extractSymptomsFromText(apiKey, text, addLog);
      setSuggestedSymptoms(symptoms.map(s => ({ ...s, confirmed: true })));
      setStep('confirmation');
    } catch (e) {
      setError('Failed to extract symptoms. Please check the debug log for more details.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, addLog]);

  const handleAnalysisRequest = useCallback(async (finalSymptoms: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
        const results = await getAnalysis(apiKey, finalSymptoms, addLog);
        setAnalysisResults(results);
        setStep('results');
    } catch(e) {
        setError('Failed to get analysis. Please check the debug log for more details.');
    } finally {
        setIsLoading(false);
    }
  }, [apiKey, addLog]);


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-medium text-text-secondary">AI is thinking...</p>
            <p className="text-sm text-text-secondary">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
        return (
            <div className="p-4 m-4 bg-red-100 border border-danger text-danger rounded-lg">
                <p className="font-bold">An Error Occurred</p>
                <p>{error}</p>
                 <button onClick={handleReset} className="mt-4 bg-danger text-white font-bold py-2 px-4 rounded-lg">
                    Start Over
                </button>
            </div>
        )
    }

    switch (step) {
      case 'input':
        return <Step1Input onTextSubmit={handleTextSubmit} />;
      case 'confirmation':
        return <Step2SymptomConfirmation 
                  symptoms={suggestedSymptoms} 
                  onConfirm={handleAnalysisRequest}
                  onBack={handleReset}
               />;
      case 'results':
        return <Step3Results 
                  results={analysisResults!}
                  apiKey={apiKey}
                  addLog={addLog}
                  onReset={handleReset}
               />;
      default:
        return <div>Invalid step</div>;
    }
  };

  return <div className="p-4">{renderContent()}</div>;
};

export default MainView;
