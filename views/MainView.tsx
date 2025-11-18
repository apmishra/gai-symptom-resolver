import React, { useState, useEffect, useCallback } from 'react';
import type { AnalysisSession, AnalysisTab, ConfirmedSymptom, DebugLog } from '../types';
import Step1Input from '../components/Step1_Input';
import Step2SymptomConfirmation from '../components/Step2_SymptomConfirmation';
import Step3Results from '../components/Step3_Results';
import StepIndicator from '../components/StepIndicator';

interface MainViewProps {
  session: AnalysisSession;
  apiKey: string;
  addLog: (log: Omit<DebugLog, 'id' | 'timestamp'>) => void;
  onTextSubmit: (text: string) => void;
  onAnalysisRequest: (symptoms: string[]) => void;
  onStartNew: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const MainView: React.FC<MainViewProps> = ({
  session,
  apiKey,
  addLog,
  onTextSubmit,
  onAnalysisRequest,
  onStartNew,
  isLoading,
  error,
  clearError,
}) => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('input');

  useEffect(() => {
    // Sync active tab with session status
    if (session.status === 'complete') {
        setActiveTab('results');
    } else if (session.status === 'confirmation') {
        setActiveTab('confirmation');
    } else {
        setActiveTab('input');
    }
  }, [session.status]);

  const handleReset = useCallback(() => {
    clearError();
    onStartNew();
  }, [clearError, onStartNew]);


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

    switch (activeTab) {
      case 'input':
        return <Step1Input onTextSubmit={onTextSubmit} initialText={session.inputText} />;
      case 'confirmation':
        return <Step2SymptomConfirmation 
                  symptoms={session.suggestedSymptoms} 
                  onConfirm={onAnalysisRequest}
               />;
      case 'results':
        return <Step3Results 
                  results={session.analysisResults!}
                  apiKey={apiKey}
                  addLog={addLog}
               />;
      default:
        return <div>Invalid step</div>;
    }
  };

  return (
    <div className="p-4">
        <header className="mb-4">
            <h1 className="text-xl font-bold text-text-primary truncate">{session.name}</h1>
            <p className="text-sm text-text-secondary">Session ID: {session.id}</p>
        </header>
        <StepIndicator currentTab={activeTab} setTab={setActiveTab} sessionStatus={session.status} />
        <div className="mt-4">
            {renderContent()}
        </div>
    </div>
  );
};

export default MainView;
