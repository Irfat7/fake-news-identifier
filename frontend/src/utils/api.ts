import { PredictionResponse, FeedbackResponse } from '../types';
import { AuthResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL;

// Get JWT token from localStorage or cookie
const getAuthToken = (): string | null => {
  // Try localStorage first
  const token = localStorage.getItem('auth_token');
  if (token) return token;

  // Try cookie as fallback
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth_token='));
  if (authCookie) {
    return authCookie.split('=')[1];
  }

  return null;
};

// Set JWT token in localStorage
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

// Remove JWT token
export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
  // Also remove from cookie if exists
  document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
};

export const predictNews = async (newsText: string): Promise<PredictionResponse> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}/model/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ news: newsText }),
  });

  const data = await response.json();

  return data;
};

export const submitFeedback = async (news: string, label: boolean, predictionToken: string): Promise<FeedbackResponse> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_BASE}/model/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ news, label, token: predictionToken }),
  });

  const data = await response.json();

  return data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.ok && data.data?.token) {
    setAuthToken(data.data.token);
  }

  return data;
};

export const signup = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();

  if (response.ok && data.data?.token) {
    setAuthToken(data.data.token);
  }

  return data;
};

export const verifyToken = async (): Promise<{ valid: boolean; user?: any }> => {
  const token = getAuthToken();

  if (!token) {
    return { valid: false };
  }

  try {
    const response = await fetch(`${API_BASE}/auth/verify-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.data?.user) {
      return { valid: true, user: data.data.user };
    } else {
      removeAuthToken();
      return { valid: false };
    }
  } catch (error) {
    removeAuthToken();
    return { valid: false };
  }
};