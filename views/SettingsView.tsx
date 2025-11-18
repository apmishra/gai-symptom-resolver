
import React, { useState, useEffect } from 'react';
import type { DebugLog } from '../types';

interface SettingsViewProps {
  apiKey: string | null;
  onSave: (key: string) => void;
  addLog: (log: Omit<DebugLog, 'id' | 'timestamp'>) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ apiKey, onSave, addLog }) => {
  const [currentKey, setCurrentKey] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCurrentKey(apiKey || '');
  }, [apiKey]);

  const handleSave = () => {
    onSave(currentKey);
    addLog({ type: 'info', message: 'API Key updated.' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Settings</h1>
      
      <div className="bg-card p-4 rounded-lg shadow-sm">
        <label htmlFor="apiKeyInput" className="block text-sm font-medium text-text-secondary mb-2">
          Gemini API Key
        </label>
        <input
          id="apiKeyInput"
          type="password"
          value={currentKey}
          onChange={(e) => setCurrentKey(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter your API key"
        />
        <button
          onClick={handleSave}
          disabled={currentKey === apiKey}
          className="mt-4 w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saved ? 'Saved!' : 'Save Key'}
        </button>
      </div>

      <div className="mt-8 text-sm text-text-secondary">
        <p className="mb-2">Your API key is stored securely in your browser's local storage and is only used to communicate with the Google Gemini API.</p>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Get or manage your Gemini API Keys here.
        </a>
      </div>
    </div>
  );
};

export default SettingsView;
