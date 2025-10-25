import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, profileAPI } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // ✅ SECURITY FIX #2: Check authentication via API call instead of localStorage
    // Cookies are sent automatically with the request
    const checkAuth = async () => {
      try {
        // Try to get profile - if cookie is valid, this will succeed
        const res = await profileAPI.get();
        const user = res.data;
        setCurrentUser(user);
        setIsAdmin(user.is_admin === true);
      } catch (error) {
        // No valid session - user needs to login
        setCurrentUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user } = res.data;
    
    // ✅ SECURITY FIX #2: Don't store token - it's in httpOnly cookie now
    setCurrentUser(user);
    setIsAdmin(user.is_admin === true);
    
    return user;
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    const { user } = res.data;
    
    // ✅ SECURITY FIX #2: Don't store token - it's in httpOnly cookie now
    setCurrentUser(user);
    setIsAdmin(user.is_admin === true);
    
    return user;
  };

  const logout = async () => {
    // ✅ SECURITY FIX #2: Call logout endpoint to clear cookie
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const updateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  const value = {
    currentUser,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
