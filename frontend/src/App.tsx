import React, { useState, useCallback, useEffect } from 'react';
import { Github, Globe } from 'lucide-react';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import PredictionForm from './components/PredictionForm';
import PredictionResult from './components/PredictionResult';
import FeedbackModal from './components/FeedbackModal';
import ErrorModal from './components/ErrorModal';
import EmailVerificationModal from './components/EmailVerificationModal';
import { ToastContainer } from './components/Toast';
import { predictNews, verifyToken } from './utils/api';
import { PredictionResult as PredictionResultType, Toast, User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PredictionResultType | null>(null);
  const [currentNewsText, setCurrentNewsText] = useState('');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isEmailVerificationModalOpen, setIsEmailVerificationModalOpen] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '' });
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { valid, user: userData } = await verifyToken();
        if (valid && userData) {
          setUser(userData);
        }
      } catch (error) {
        // Token is invalid or expired
      } finally {
        setIsAuthenticating(false);
      }
    };

    checkAuth();
  }, []);

  // Toast management
  const addToast = useCallback((message: string, type: Toast['type'], duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Handle prediction submission
  const handlePrediction = async (newsText: string) => {
    setIsLoading(true);
    setResult(null);
    setCurrentNewsText(newsText);

    try {
      const response = await predictNews(newsText);

      if (response.data) {
        setResult(response.data);
      } else {
        addToast((response.message || 'Failed to get prediction'), 'error');
      }
    } catch (error: any) {
      addToast(error?.message || "Something went wrong", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle feedback success
  const handleFeedbackSuccess = () => {
    addToast('Feedback submitted successfully', 'success');
  };

  // Handle feedback error
  const handleFeedbackError = (message: string) => {
    addToast(message, 'error');
  };

  // Handle authentication success
  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    console.log(userData)
    addToast('Successfully signed in!', 'success');
  };

  // Handle authentication error
  const handleAuthError = (message: string) => {
    addToast(message, 'error');
  };

  // Handle email verification needed
  const handleEmailVerificationNeeded = () => {
    setIsEmailVerificationModalOpen(true);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setResult(null);
    setCurrentNewsText('');
    addToast('Successfully signed out', 'info');
  };

  // Show loading screen while checking authentication
  if (isAuthenticating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!user) {
    return (
      <>
        <AuthForm
          onSuccess={handleAuthSuccess}
          onError={handleAuthError}
          onEmailVerificationNeeded={handleEmailVerificationNeeded}
        />

        <EmailVerificationModal
          isOpen={isEmailVerificationModalOpen}
          onClose={() => setIsEmailVerificationModalOpen(false)}
        />

        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <Header user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Prediction Form */}
          <PredictionForm onSubmit={handlePrediction} isLoading={isLoading} />

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center">
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="font-semibold text-gray-900">Analyzing content...</p>
                    <p className="text-sm text-gray-600">Our AI is processing your news article</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {result && !isLoading && (
            <PredictionResult
              result={result}
              onFeedback={() => setIsFeedbackModalOpen(true)}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <span>Built with</span>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span className="font-medium">Express.js</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-green-500 rounded"></div>
              <span className="font-medium">Flask</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Github className="w-4 h-4" />
              <span className="font-medium">Bolt</span>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-2">
            Empowering users to make informed decisions about news content
          </p>
        </div>
      </footer>

      {/* Modals */}
      {result && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          newsContent={result.cleaned_news}
          predictionToken={result.token}
          onSuccess={handleFeedbackSuccess}
          onError={handleFeedbackError}
        />
      )}

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}

export default App;