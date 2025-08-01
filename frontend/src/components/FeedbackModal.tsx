import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { submitFeedback } from '../utils/api';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  newsContent: string;
  predictionToken: string
  onSuccess: () => void;
  onError: (message: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  newsContent,
  predictionToken,
  onSuccess,
  onError,
}) => {
  const [label, setLabel] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitFeedback(newsContent, label, predictionToken);
      onSuccess();
      onClose();
    } catch (error: any) {
      onError(error?.message || "Something Went Wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Submit Feedback</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Help us improve by providing your feedback on this news prediction.
            </p>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="label"
                  value="fake"
                  checked={label === false}
                  onChange={() => setLabel(false)}
                  className="w-4 h-4 text-red-600 focus:ring-red-500"
                />
                <span className="font-medium text-red-600">Fake</span>
                <span className="text-sm text-gray-500">This news is false or misleading</span>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="label"
                  value="real"
                  checked={label}
                  onChange={() => setLabel(true)}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="font-medium text-green-600">Real</span>
                <span className="text-sm text-gray-500">This news is accurate and trustworthy</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;