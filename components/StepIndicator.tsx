import React from 'react';
import type { AnalysisTab, SessionStatus } from '../types';

interface StepIndicatorProps {
  currentTab: AnalysisTab;
  setTab: (tab: AnalysisTab) => void;
  sessionStatus: SessionStatus;
}

const steps: { id: AnalysisTab; name: string }[] = [
  { id: 'input', name: 'Input' },
  { id: 'confirmation', name: 'Confirmation' },
  { id: 'results', name: 'Results' },
];

const statusOrder: Record<SessionStatus, number> = {
    input: 0,
    confirmation: 1,
    complete: 2,
};

const tabOrder: Record<AnalysisTab, number> = {
    input: 0,
    confirmation: 1,
    results: 2,
};


const StepIndicator: React.FC<StepIndicatorProps> = ({ currentTab, setTab, sessionStatus }) => {

  const maxAllowedStep = statusOrder[sessionStatus];

  return (
    <nav className="flex items-center justify-center p-1 bg-gray-200 rounded-lg">
      {steps.map((step, index) => {
        const isCompleted = maxAllowedStep >= index;
        const isActive = step.id === currentTab;

        return (
          <button
            key={step.id}
            onClick={() => setTab(step.id)}
            disabled={!isCompleted}
            className={`flex-1 text-center text-sm font-semibold py-2 px-3 rounded-md transition-colors duration-200
              ${isActive ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'}
              ${!isCompleted ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-300/50'}
            `}
          >
            {index + 1}. {step.name}
          </button>
        );
      })}
    </nav>
  );
};

export default StepIndicator;
