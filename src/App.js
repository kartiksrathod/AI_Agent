import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "./components/ui/toaster";

// Components
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
import GlobalSearch from "./components/search/GlobalSearch";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/papers" element={<Papers />} />
                <Route path="/notes" element={<Notes />} />
                <Route path="/syllabus" element={<Syllabus />} />
                <Route path="/forum" element={<Forum />} />
                <Route path="/search" element={<GlobalSearch />} />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfileDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
              <AIAssistant />
              <Toaster />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;