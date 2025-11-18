import React, { useState, useCallback, useEffect } from 'react';
import { useApiKey } from './hooks/useApiKey';
import { useSessions } from './hooks/useSessions';
import ApiKeyModal from './components/ApiKeyModal';
import MainView from './views/MainView';
import SettingsView from './views/SettingsView';
import DebugView from './views/DebugView';
import HistoryView from './views/HistoryView';
import BottomNav from './components/BottomNav';
import type { AppView, DebugLog } from './types';
import { extractSymptomsFromText, getAnalysis } from './services/geminiService';

function App() {
  const [apiKey, setApiKey] = useApiKey();
  const [currentView, setCurrentView] = useState<AppView>('main');
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    sessions,
    activeSession,
    setActiveSessionId,
    createNewSession,
    updateSession,
    deleteSession,
  } = useSessions();

  useEffect(() => {
    // If there are no sessions, create one on startup.
    if (sessions.length === 0 && apiKey) {
      createNewSession();
    }
    if(!activeSession && sessions.length > 0){
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, apiKey, createNewSession, activeSession, setActiveSessionId]);

  const addLog = useCallback((log: Omit<DebugLog, 'id' | 'timestamp'>) => {
    setDebugLogs(prevLogs => [
      {
        ...log,
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
      },
      ...prevLogs,
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);
  
  const handleGoToMainView = useCallback((sessionId: string) => {
      setActiveSessionId(sessionId);
      setCurrentView('main');
  }, [setActiveSessionId]);
  
  const handleCreateNewSession = useCallback(() => {
      createNewSession();
      setCurrentView('main');
  },[createNewSession]);


  const handleTextSubmit = useCallback(async (text: string) => {
    if (!activeSession) return;
    setIsLoading(true);
    setError(null);
    updateSession(activeSession.id, { inputText: text, analysisResults: null }); // Clear old results
    try {
      const symptoms = await extractSymptomsFromText(apiKey!, text, addLog);
      updateSession(activeSession.id, { 
          suggestedSymptoms: symptoms.map(s => ({ ...s, confirmed: true })),
          status: 'confirmation'
      });
    } catch (e) {
      setError('Failed to extract symptoms. Please check the debug log for more details.');
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, addLog, activeSession, updateSession]);

  const handleAnalysisRequest = useCallback(async (finalSymptoms: string[]) => {
    if (!activeSession) return;
    setIsLoading(true);
    setError(null);
    try {
        const results = await getAnalysis(apiKey!, finalSymptoms, addLog);
        updateSession(activeSession.id, {
            analysisResults: results,
            status: 'complete'
        });
    } catch(e) {
        setError('Failed to get analysis. Please check the debug log for more details.');
    } finally {
        setIsLoading(false);
    }
  }, [apiKey, addLog, activeSession, updateSession]);

  const renderView = () => {
    switch (currentView) {
      case 'main':
        return activeSession ? (
          <MainView 
            key={activeSession.id} // Re-mount component when session changes
            session={activeSession} 
            apiKey={apiKey!} 
            addLog={addLog}
            onTextSubmit={handleTextSubmit}
            onAnalysisRequest={handleAnalysisRequest}
            onStartNew={() => setCurrentView('history')}
            isLoading={isLoading}
            error={error}
            clearError={() => setError(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <button onClick={handleCreateNewSession} className="bg-primary text-white font-bold py-3 px-6 rounded-lg">
                Start New Analysis
            </button>
          </div>
        );
      case 'settings':
        return <SettingsView apiKey={apiKey} onSave={setApiKey} addLog={addLog} />;
      case 'debug':
        return <DebugView logs={debugLogs} onClear={clearLogs} />;
       case 'history':
        return <HistoryView 
                  sessions={sessions} 
                  onSelectSession={handleGoToMainView}
                  onNewSession={handleCreateNewSession}
                  onDeleteSession={deleteSession}
               />
      default:
        return <div>No active session.</div>;
    }
  };

  if (!apiKey) {
    return <ApiKeyModal onSave={setApiKey} />;
  }

  return (
    <div className="h-screen w-screen max-w-md mx-auto flex flex-col font-sans bg-background text-text-primary">
        <main className="flex-grow overflow-y-auto pb-24">
            {renderView()}
        </main>
        <BottomNav currentView={currentView} setView={setCurrentView} />
    </div>
  );
}

export default App;
