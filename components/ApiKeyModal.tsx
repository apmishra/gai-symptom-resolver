
import React, { useState } from 'react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Gemini API Key Required</h2>
        <p className="text-text-secondary mb-6">
          Please enter your Google Gemini API key to use Symptom Insight AI. Your key is stored locally and never sent anywhere else.
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-center bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your API key"
          />
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            disabled={!key.trim()}
          >
            Save and Continue
          </button>
        </form>
         <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-primary mt-4 inline-block">
            Get a Gemini API Key
        </a>
      </div>
    </div>
  );
};

export default ApiKeyModal;
