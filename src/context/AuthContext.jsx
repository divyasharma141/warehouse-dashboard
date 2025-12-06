import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const mockApiCall = async (endpoint, data) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (endpoint === '/login') {
      if (data.email === 'demo@delhivery.com' && data.password === 'Password123') {
        return {
          success: true,
          data: {
            user: {
              id: '123',
              email: data.email,
              firstName: 'John',
              lastName: 'Doe',
              role: 'user'
            },
            token: 'mock-jwt-token-123456'
          }
        };
      } else {
        throw new Error('Invalid credentials');
      }
    }
    
    if (endpoint === '/register') {
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      
      return {
        success: true,
        data: {
          user: {
            id: Date.now().toString(),
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'user'
          },
          token: 'mock-jwt-token-' + Date.now()
        }
      };
    }
    
    throw new Error('Invalid endpoint');
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await mockApiCall('/login', { email, password });
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: error.message };
    }
  };

  // new user
  const register = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await mockApiCall('/register', userData);
      
      setUser(response.data.user);
      setIsAuthenticated(true);
      setIsLoading(false);
      
      return { success: true };
    } catch (error) {
      setError(error.message);
      setIsLoading(false);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};