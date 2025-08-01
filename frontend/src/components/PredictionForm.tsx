import React, { useState } from 'react';
import { Loader2, Brain, Newspaper } from 'lucide-react';

interface PredictionFormProps {
  onSubmit: (newsText: string) => Promise<void>;
  isLoading: boolean;
}

const PredictionForm: React.FC<PredictionFormProps> = ({ onSubmit, isLoading }) => {
  const [newsText, setNewsText] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newsText.trim()) {
      setError('News content is required.');
      return;
    }

    try {
      await onSubmit(newsText.trim());
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Newspaper className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">News Article</h3>
                <p className="text-sm text-gray-600">Paste your news content below for analysis</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <textarea
              value={newsText}
              onChange={(e) => {
                setNewsText(e.target.value);
                if (error) setError('');
              }}
              placeholder="Paste your news article content here..."
              className={`w-full h-48 p-4 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                {error}
              </p>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                {newsText.length} characters
              </p>
              <p className="text-xs text-gray-400">
                Maximum recommended: 10,000 characters
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !newsText.trim()}
            className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[200px]"
          >
            <div className="flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Check News</span>
                </>
              )}
            </div>
            
            {!isLoading && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PredictionForm;