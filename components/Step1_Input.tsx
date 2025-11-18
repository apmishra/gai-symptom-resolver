
import React, { useState, useCallback } from 'react';
import { extractTextFromPdf } from '../services/pdfParser';

interface Step1InputProps {
  onTextSubmit: (text: string) => void;
}

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
)

const Step1Input: React.FC<Step1InputProps> = ({ onTextSubmit }) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file.');
        return;
      }
      setError(null);
      setFileName(file.name);
      try {
        const extractedText = await extractTextFromPdf(file);
        setText(extractedText);
      } catch (err) {
        setError('Failed to process PDF. Please try again or paste the text manually.');
        console.error(err);
      }
    }
  }, []);

  const handleSubmit = () => {
    if (text.trim()) {
      onTextSubmit(text.trim());
    } else {
        setError("Please provide some text or upload a PDF to analyze.")
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-2">Symptom Insight AI</h1>
      <p className="text-text-secondary mb-6">Upload a medical document or paste the text below to begin.</p>
      
      {error && <p className="text-danger mb-4">{error}</p>}

      <div className="mb-4">
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
            <UploadIcon />
            <p className="mt-2 text-sm text-text-secondary">
                {fileName ? `Selected: ${fileName}` : 'Click to upload a PDF'}
            </p>
          </div>
          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" />
        </label>
      </div>

      <div className="relative mb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Or paste your medical text here..."
          className="w-full h-48 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <div className="absolute bottom-2 right-2 text-xs text-text-secondary">{text.length} characters</div>
      </div>
      
      <button
        onClick={handleSubmit}
        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
        disabled={!text.trim()}
      >
        Analyze Text
      </button>

      <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        <p><strong className="font-bold">Disclaimer:</strong> This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.</p>
      </div>
    </div>
  );
};

export default Step1Input;
