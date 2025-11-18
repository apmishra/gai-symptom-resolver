
import { useState, useEffect, useCallback } from 'react';

const API_KEY_STORAGE_KEY = 'gemini-api-key';

export const useApiKey = (): [string | null, (key: string) => void] => {
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
      // @ts-ignore
      process.env.API_KEY = storedKey;
    }
  }, []);

  const saveApiKey = useCallback((key: string) => {
    if (key && key.trim().length > 0) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
      setApiKey(key);
      // @ts-ignore
      process.env.API_KEY = key;
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      setApiKey(null);
       // @ts-ignore
      process.env.API_KEY = undefined;
    }
  }, []);

  return [apiKey, saveApiKey];
};
