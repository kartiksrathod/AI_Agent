import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Loader2, Mail, ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL !== undefined 
  ? process.env.REACT_APP_BACKEND_URL 
  : 'http://localhost:8001';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.detail || 
          'Verification failed. The link may be invalid or expired.'
        );
      }
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  // Countdown timer for redirect
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      navigate('/login');
    }
  }, [status, countdown, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-6">
            {status === 'verifying' && (
              <div className="relative">
                <Loader2 className="h-20 w-20 text-blue-600 dark:text-blue-400 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            )}
            {status === 'success' && (
              <div className="relative animate-bounce-once">
                <div className="absolute inset-0 bg-green-400 dark:bg-green-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <CheckCircle className="relative h-20 w-20 text-green-600 dark:text-green-400 animate-scale-in" />
              </div>
            )}
            {status === 'error' && (
              <div className="relative animate-shake">
                <XCircle className="h-20 w-20 text-red-600 dark:text-red-400" />
              </div>
            )}
          </div>
          
          <CardTitle className="text-3xl font-bold dark:text-white mb-2">
            {status === 'verifying' && (
              <span className="animate-pulse">Verifying Your Email...</span>
            )}
            {status === 'success' && (
              <span className="text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6" />
                Verification Successful!
                <Sparkles className="h-6 w-6" />
              </span>
            )}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          
          <CardDescription className="dark:text-gray-400 text-base">
            {status === 'verifying' && 'Please wait while we verify your email address...'}
            {status === 'success' && 'Your email has been successfully verified!'}
            {status === 'error' && message}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4 pt-2">
          {status === 'success' && (
            <div className="space-y-6 animate-fade-in">
              {/* Success Message */}
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-800 dark:text-green-300 font-semibold mb-2">
                  🎉 Welcome to EduResources!
                </p>
                <p className="text-sm text-green-700 dark:text-green-400">
                  You can now login and access all features including:
                </p>
                <ul className="text-sm text-green-600 dark:text-green-400 mt-2 space-y-1">
                  <li>📄 Download papers and notes</li>
                  <li>🤖 AI Study Assistant</li>
                  <li>💬 Community Forum</li>
                  <li>📊 Track your progress</li>
                </ul>
              </div>
              
              {/* Countdown */}
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {countdown}
                  </span>
                </div>
                <span className="text-sm">
                  Redirecting to login page...
                </span>
              </div>
              
              {/* Manual Redirect Button */}
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-700 dark:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                data-testid="goto-login-button"
              >
                Login Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
          
          {status === 'error' && (
            <div className="space-y-4 animate-fade-in">
              {/* Error Message */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-300 font-semibold mb-2">
                  ⚠️ Verification Link Invalid
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  This link may have expired or already been used. Do not worry, you can request a new one!
                </p>
              </div>
              
              {/* Resend Button */}
              <Link to="/resend-verification">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-700 dark:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  data-testid="resend-verification-button"
                >
                  <Mail className="mr-2 h-5 w-5" />
                  Get New Verification Link
                </Button>
              </Link>
              
              {/* Back to Login */}
              <Link to="/login">
                <Button 
                  variant="outline"
                  className="w-full dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 py-6 font-semibold"
                  data-testid="back-to-login-button"
                >
                  Back to Login
                </Button>
              </Link>
            </div>
          )}
          
          {status === 'verifying' && (
            <div className="space-y-3 animate-pulse">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 dark:bg-blue-400 rounded-full animate-progress"></div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This will only take a moment...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
