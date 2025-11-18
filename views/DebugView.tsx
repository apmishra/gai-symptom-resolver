
import React from 'react';
import type { DebugLog } from '../types';

interface DebugViewProps {
  logs: DebugLog[];
  onClear: () => void;
}

const getTypeColor = (type: DebugLog['type']) => {
  switch (type) {
    case 'info': return 'bg-blue-100 text-blue-800';
    case 'success': return 'bg-green-100 text-green-800';
    case 'error': return 'bg-red-100 text-red-800';
    case 'api-request': return 'bg-yellow-100 text-yellow-800';
    case 'api-response': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

const DebugView: React.FC<DebugViewProps> = ({ logs, onClear }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-text-primary">Debug Log</h1>
        <button
          onClick={onClear}
          className="bg-danger text-white text-sm font-bold py-2 px-3 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          Clear Logs
        </button>
      </div>
      <div className="bg-card rounded-lg shadow-sm p-2 font-mono text-xs overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-text-secondary text-center p-4">No logs yet. Start an analysis to see debug info.</p>
        ) : (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {logs.slice().reverse().map(log => (
              <div key={log.id} className="p-2 bg-background rounded">
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getTypeColor(log.type)}`}>{log.type}</span>
                    <span className="text-text-secondary">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="mt-1 text-text-primary whitespace-pre-wrap">{log.message}</p>
                {log.data && (
                   <details className="mt-1">
                     <summary className="cursor-pointer text-text-secondary">View Data</summary>
                     <pre className="mt-1 p-2 bg-gray-800 text-white rounded overflow-auto text-[10px]">{JSON.stringify(log.data, null, 2)}</pre>
                   </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugView;
