import { useState, useEffect, useCallback } from 'react';
import type { AnalysisSession, ConfirmedSymptom, AnalysisResults } from '../types';

const SESSIONS_STORAGE_KEY = 'analysis-sessions';

export const useSessions = () => {
  const [sessions, setSessions] = useState<AnalysisSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (storedSessions) {
        const parsedSessions = JSON.parse(storedSessions);
        setSessions(parsedSessions);
        if (parsedSessions.length > 0) {
           // Get the most recent session
          setActiveSessionId(parsedSessions[0].id);
        }
      }
    } catch (error) {
        console.error("Failed to load sessions from storage", error);
        setSessions([]);
    }
  }, []);

  const saveSessionsToStorage = useCallback((updatedSessions: AnalysisSession[]) => {
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updatedSessions));
  }, []);

  const createNewSession = useCallback(() => {
    const newSession: AnalysisSession = {
      id: `session_${Date.now()}`,
      name: `Analysis - ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      status: 'input',
      inputText: '',
      suggestedSymptoms: [],
      analysisResults: null,
    };

    setSessions(prev => {
        const newSessions = [newSession, ...prev];
        saveSessionsToStorage(newSessions);
        return newSessions;
    });
    setActiveSessionId(newSession.id);
    return newSession.id;
  }, [saveSessionsToStorage]);

  const updateSession = useCallback((sessionId: string, updates: Partial<Omit<AnalysisSession, 'id'>>) => {
    setSessions(prev => {
        const newSessions = prev.map(session =>
            session.id === sessionId ? { ...session, ...updates } : session
        );
        saveSessionsToStorage(newSessions);
        return newSessions;
    });
  }, [saveSessionsToStorage]);
  
  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => {
        const newSessions = prev.filter(s => s.id !== sessionId);
        saveSessionsToStorage(newSessions);
        if(activeSessionId === sessionId) {
            setActiveSessionId(newSessions.length > 0 ? newSessions[0].id : null);
        }
        return newSessions;
    });
  }, [activeSessionId, saveSessionsToStorage]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;

  return {
    sessions,
    activeSession,
    setActiveSessionId,
    createNewSession,
    updateSession,
    deleteSession,
  };
};
