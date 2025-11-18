
export interface Symptom {
  name: string;
  explanation: string;
}

export interface ConfirmedSymptom extends Symptom {
  confirmed: boolean;
}

export interface Reason {
  name: string;
  description: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface Solution {
  name:string;
  description: string;
  sources: Source[];
}

export interface AnalysisResults {
  potentialReasons: Reason[];
  solutions: {
    commonSense: Solution[];
    ayurvedic: Solution[];
    homeopathic: Solution[];
    allopathic: Solution[];
    naturopathic: Solution[];
  };
}

export type DebugLogType = 'info' | 'error' | 'success' | 'api-request' | 'api-response';

export interface DebugLog {
  id: number;
  timestamp: string;
  type: DebugLogType;
  message: string;
  data?: any;
}

export type AppView = 'main' | 'settings' | 'debug';

export type AppStep = 'input' | 'confirmation' | 'results';
