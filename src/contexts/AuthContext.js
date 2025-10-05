import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/api';

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
    // Check for stored user and admin status
    const storedUser = localStorage.getItem('currentUser');
    const storedToken = localStorage.getItem('token');
    const storedAdminStatus = localStorage.getItem('isAdmin') === 'true';
    
    if (storedUser && storedToken) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAdmin(user.is_admin === true || storedAdminStatus);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { access_token, user } = response.data;
      
      setCurrentUser(user);
      setIsAdmin(user.is_admin || false);
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', access_token);
      localStorage.setItem('isAdmin', user.is_admin || false);
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { access_token, user } = response.data;
      
      setCurrentUser(user);
      setIsAdmin(user.is_admin || false);
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', access_token);
      localStorage.setItem('isAdmin', user.is_admin || false);
      
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
  };

  const toggleAdminMode = () => {
    const newAdminStatus = !isAdmin;
    setIsAdmin(newAdminStatus);
    localStorage.setItem('isAdmin', newAdminStatus);
  };

  const value = {
    currentUser,
    isAdmin,
    login,
    register,
    logout,
    toggleAdminMode,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};