export interface PredictionResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    cleaned_news: string;
    prediction: boolean;
    token: string;
  }
}

export interface FeedbackResponse {
  success: boolean;
  code: number;
  message: string;
  data: null
}

export interface PredictionResult {
  cleaned_news: string;
  prediction: boolean;
  token: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface AuthResponse {
  success: boolean;
  code: number;
  message: string;
  data?: {
    mail_sent?: boolean;
    token?: string;
    user: {
      id: string;
      email: string;
      verified: boolean;
    };
  };
  error?: {

  };
}

export interface User {
  id: string;
  email: string;
}