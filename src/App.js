import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "./components/ui/toaster";

// Import all the components we need
import AnimatedIntro from "./components/AnimatedIntro";
import InteractiveBackground from "./components/InteractiveBackground";
import PageTransition from "./components/PageTransition";
import { ToastProvider } from "./components/ui/advanced-toast";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgotPassword";
import Papers from "./components/papers/Papers";
import Notes from "./components/notes/Notes";
import Syllabus from "./components/syllabus/Syllabus";
import Forum from "./components/forum/Forum";
import AIAssistant from "./components/ai/AIAssistant";
import ProfileDashboard from "./components/dashboard/ProfileDashboard";
import KeyboardShortcutsModal from "./components/KeyboardShortcutsModal";
import useKeyboardShortcuts from "./hooks/useKeyboardShortcuts";
import useUserState from "./hooks/useUserState";

// Wrapper for protected routes - redirects to login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  // Show loader while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

// Main app content with router
const AppContent = () => {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  
  // Setup user tracking and keyboard shortcuts
  const { trackActivity, saveScrollPosition, getScrollPosition } = useUserState();
  useKeyboardShortcuts();

  // Listen for the keyboard shortcuts modal trigger
  useEffect(() => {
    const handleShowShortcuts = () => {
      setShowShortcutsModal(true);
    };
    
    window.addEventListener('showKeyboardShortcuts', handleShowShortcuts);
    return () => window.removeEventListener('showKeyboardShortcuts', handleShowShortcuts);
  }, []);

  // Track page views (debounced to avoid spam)
  useEffect(() => {
    let timeout = null;
    const handleLocationChange = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        trackActivity({ 
          type: 'page_viewed', 
          data: window.location.pathname 
        });
      }, 100);
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      if (timeout) clearTimeout(timeout);
    };
  }, [trackActivity]);

  return (
    <>
      <ThemeProvider>
        <AuthProvider>
            <div className="min-h-screen relative">
            {/* Background images for light/dark mode */}
            <div className="fixed inset-0 z-0">
              {/* Light mode */}
              <div className="absolute inset-0 bg-background dark:hidden"></div>
              <div 
                className="absolute inset-0 opacity-10 dark:hidden"
                style={{
                  backgroundImage: 'url(https://images.pexels.com/photos/3653997/pexels-photo-3653997.jpeg)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              ></div>
              
              {/* Dark mode */}
              <div className="absolute inset-0 bg-background hidden dark:block"></div>
              <div 
                className="absolute inset-0 opacity-15 hidden dark:block"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxhYnN0cmFjdCUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzU5ODU5MDgwfDA&ixlib=rb-4.1.0&q=85)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                }}
              ></div>
            </div>
            
            {/* Cool interactive background effect */}
            <InteractiveBackground />
            
            {/* Main content wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen text-foreground transition-colors duration-300">
              <Navbar />
              
              {/* All routes */}
              <main className="flex-1">
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/papers" element={<Papers />} />
                    <Route path="/notes" element={<Notes />} />
                    <Route path="/syllabus" element={<Syllabus />} />
                    <Route path="/forum" element={<Forum />} />
                    <Route 
                      path="/profile" 
                      element={
                        <ProtectedRoute>
                          <ProfileDashboard />
                        </ProtectedRoute>
                      } 
                    />
                  </Routes>
                </PageTransition>
              </main>
              
              <AIAssistant />
              <Toaster />
              <KeyboardShortcutsModal 
                isOpen={showShortcutsModal} 
                onClose={() => setShowShortcutsModal(false)} 
              />
              
              {/* Professional Footer */}
              <footer className="relative z-10 bg-gray-900 dark:bg-gray-950 text-white mt-auto">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="flex flex-col items-center text-center space-y-6">
                    
                    {/* Made by section - Centered */}
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-100">
                        Made with ❤️ by <span className="text-blue-400 font-bold">Kartik S Rathod</span>
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Full Stack Developer & Engineering Student
                      </p>
                    </div>
                    
                    {/* Social Links - Below the made by text */}
                    <div className="flex items-center justify-center space-x-8">
                      {/* GitHub */}
                      <a 
                        href="https://github.com/kartiksrathod" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-300"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span className="hidden sm:block font-medium">GitHub</span>
                      </a>
                      
                      {/* LinkedIn */}
                      <a 
                        href="https://www.linkedin.com/in/kartik-s-rathod-a98364389" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-300"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        <span className="hidden sm:block font-medium">LinkedIn</span>
                      </a>
                      
                      {/* Email */}
                      <a 
                        href="mailto:kartiksrathod07@gmail.com" 
                        className="group flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors duration-300"
                      >
                        <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                        <span className="hidden sm:block font-medium">Email</span>
                      </a>
                    </div>
                  </div>
                  
                  {/* Copyright and additional info */}
                  <div className="border-t border-gray-700 mt-6 pt-6 text-center">
                    <p className="text-sm text-gray-400">
                      © 2024 EduResources - Academic Resources Platform. Built with React, FastAPI & MongoDB.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Helping engineering students excel in their academic journey.
                    </p>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
};

// Main App wrapper that provides ToastProvider at the top level
const AppWithProviders = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [introComplete, setIntroComplete] = useState(false);

  // Handle intro completion
  const handleIntroComplete = () => {
    setShowIntro(false);
    setTimeout(() => setIntroComplete(true), 500);
  };

  // Show intro every time - it's beautiful!
  // useEffect(() => {
  //   const hasSeenIntro = localStorage.getItem('hasSeenIntro');
  //   if (hasSeenIntro) {
  //     setShowIntro(false);
  //     setIntroComplete(true);
  //   }
  // }, []);

  // Mark intro as seen after delay so it shows each time for now
  useEffect(() => {
    if (!showIntro && introComplete) {
      // Commented out to show intro every time
      // localStorage.setItem('hasSeenIntro', 'true');
    }
  }, [showIntro, introComplete]);

  if (showIntro) {
    return <AnimatedIntro onComplete={handleIntroComplete} />;
  }

  return (
    <div className="App">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AppWithProviders />
    </ToastProvider>
  );
}

export default App;