
import React, { useState, useCallback } from 'react';
import { useApiKey } from './hooks/useApiKey';
import ApiKeyModal from './components/ApiKeyModal';
import MainView from './views/MainView';
import SettingsView from './views/SettingsView';
import DebugView from './views/DebugView';
import BottomNav from './components/BottomNav';
import type { AppView, DebugLog } from './types';

function App() {
  const [apiKey, setApiKey] = useApiKey();
  const [currentView, setCurrentView] = useState<AppView>('main');
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);

  const addLog = useCallback((log: Omit<DebugLog, 'id' | 'timestamp'>) => {
    setDebugLogs(prevLogs => [
      ...prevLogs,
      {
        ...log,
        id: Date.now() + Math.random(),
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const clearLogs = useCallback(() => {
    setDebugLogs([]);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'main':
        return <MainView apiKey={apiKey!} addLog={addLog} />;
      case 'settings':
        return <SettingsView apiKey={apiKey} onSave={setApiKey} addLog={addLog} />;
      case 'debug':
        return <DebugView logs={debugLogs} onClear={clearLogs} />;
      default:
        return <MainView apiKey={apiKey!} addLog={addLog} />;
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
