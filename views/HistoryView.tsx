import React from 'react';
import type { AnalysisSession } from '../types';

interface HistoryViewProps {
  sessions: AnalysisSession[];
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ sessions, onSelectSession, onNewSession, onDeleteSession }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Session History</h1>
        <button
          onClick={onNewSession}
          className="bg-primary text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          New Analysis
        </button>
      </div>
      
      {sessions.length === 0 ? (
        <div className="text-center p-8 bg-card rounded-lg">
            <p className="text-text-secondary">No sessions found.</p>
            <p className="text-text-secondary mt-2">Click "New Analysis" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className="bg-card p-3 rounded-lg shadow-sm flex items-center justify-between">
              <button onClick={() => onSelectSession(session.id)} className="flex-grow text-left">
                <p className="font-semibold text-text-primary truncate">{session.name}</p>
                <p className="text-xs text-text-secondary">
                  {new Date(session.createdAt).toLocaleString()} - Status: <span className="capitalize font-medium">{session.status === 'complete' ? 'Completed' : session.status}</span>
                </p>
              </button>
              <button
                onClick={(e) => {
                    e.stopPropagation();
                    if(window.confirm("Are you sure you want to delete this session?")) {
                       onDeleteSession(session.id);
                    }
                }}
                className="ml-4 text-danger hover:bg-danger/10 p-2 rounded-full"
                aria-label="Delete session"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
