import React from 'react';
import { CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { PredictionResult as PredictionResultType } from '../types';

interface PredictionResultProps {
  result: PredictionResultType;
  onFeedback: () => void;
}

const PredictionResult: React.FC<PredictionResultProps> = ({ result, onFeedback }) => {
  const { prediction, cleaned_news } = result;

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom duration-500">
      {/* Prediction Card */}
      <div className={`p-6 rounded-xl border-2 ${prediction
        ? 'bg-green-50 border-green-200'
        : 'bg-red-50 border-red-200'
        }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${prediction ? 'bg-green-100' : 'bg-red-100'
            }`}>
            {prediction ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-red-600" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`text-xl font-bold ${prediction ? 'text-green-800' : 'text-red-800'
                }`}>
                {prediction ? '✅ This news appears to be real.' : '⚠️ This news appears to be fake.'}
              </h3>
            </div>

            <p className={`text-sm ${prediction ? 'text-green-700' : 'text-red-700'
              }`}>
              {prediction
                ? 'Our AI model indicates this content appears to be legitimate news.'
                : 'Please verify from trusted sources before sharing this information.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Cleaned News Content */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Processed Content
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            This is the cleaned version of your news content used for analysis.
          </p>
        </div>
        <div className="p-4 max-h-64 overflow-y-auto">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {cleaned_news}
          </p>
        </div>
      </div>

      {/* Feedback Button */}
      <div className="flex justify-center">
        <button
          onClick={onFeedback}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Submit Feedback
        </button>
      </div>
    </div>
  );
};

export default PredictionResult;