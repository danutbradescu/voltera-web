const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    ...options,
    credentials: 'include', // CRITICAL: Trimite cookie-ul automat la server
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, defaultOptions);

  if (response.status === 401) {
    // Dacă backend-ul zice că nu suntem logați, trimitem userul la login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return response;
};