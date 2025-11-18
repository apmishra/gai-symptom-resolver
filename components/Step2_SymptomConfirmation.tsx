
import React, { useState, useMemo } from 'react';
import type { ConfirmedSymptom } from '../types';

interface Step2SymptomConfirmationProps {
  symptoms: ConfirmedSymptom[];
  onConfirm: (symptoms: string[]) => void;
  onBack: () => void;
}

const SymptomCard: React.FC<{ symptom: ConfirmedSymptom, onToggle: (name: string) => void }> = ({ symptom, onToggle }) => (
    <div className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${symptom.confirmed ? 'bg-primary/10 border-primary' : 'bg-card border-gray-200'} border`}>
        <label htmlFor={`symptom-${symptom.name}`} className="flex items-start cursor-pointer">
            <input
                id={`symptom-${symptom.name}`}
                type="checkbox"
                checked={symptom.confirmed}
                onChange={() => onToggle(symptom.name)}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary mt-1"
            />
            <div className="ml-3">
                <p className="font-semibold text-text-primary">{symptom.name}</p>
                <p className="text-sm text-text-secondary">{symptom.explanation}</p>
            </div>
        </label>
    </div>
);

const Step2SymptomConfirmation: React.FC<Step2SymptomConfirmationProps> = ({ symptoms: initialSymptoms, onConfirm, onBack }) => {
  const [symptoms, setSymptoms] = useState<ConfirmedSymptom[]>(initialSymptoms);
  const [additionalSymptoms, setAdditionalSymptoms] = useState('');

  const handleToggle = (name: string) => {
    setSymptoms(prev =>
      prev.map(s => (s.name === name ? { ...s, confirmed: !s.confirmed } : s))
    );
  };

  const confirmedSymptomNames = useMemo(() => {
    return symptoms.filter(s => s.confirmed).map(s => s.name);
  }, [symptoms]);

  const additionalSymptomNames = useMemo(() => {
    return additionalSymptoms.split(/,|\n/).map(s => s.trim()).filter(Boolean);
  }, [additionalSymptoms]);

  const totalSymptomCount = confirmedSymptomNames.length + additionalSymptomNames.length;

  const handleSubmit = () => {
    const allSymptoms = [...confirmedSymptomNames, ...additionalSymptomNames];
    if (allSymptoms.length > 0) {
      onConfirm(allSymptoms);
    }
  };

  return (
    <div>
        <button onClick={onBack} className="text-primary mb-4 text-sm">&larr; Back to Input</button>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Confirm Symptoms</h1>
        <p className="text-text-secondary mb-6">
            The AI found the following potential symptoms. Please review and confirm them. You can also add any other symptoms you're experiencing.
        </p>

        <div className="space-y-3 mb-6">
            {symptoms.map(symptom => (
                <SymptomCard key={symptom.name} symptom={symptom} onToggle={handleToggle} />
            ))}
        </div>

        <div>
            <label htmlFor="additional-symptoms" className="block text-lg font-semibold text-text-primary mb-2">Other Symptoms</label>
            <textarea
                id="additional-symptoms"
                value={additionalSymptoms}
                onChange={(e) => setAdditionalSymptoms(e.target.value)}
                placeholder="e.g., Headache, Fatigue, etc. (separate with commas or new lines)"
                className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            />
        </div>

        <div className="mt-6 sticky bottom-24 p-2 bg-background/80 backdrop-blur-sm rounded-lg">
             <button
                onClick={handleSubmit}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
                disabled={totalSymptomCount === 0}
            >
                Find Potential Reasons ({totalSymptomCount} selected)
            </button>
        </div>
    </div>
  );
};

export default Step2SymptomConfirmation;
