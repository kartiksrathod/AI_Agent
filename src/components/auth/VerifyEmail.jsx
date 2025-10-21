import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL !== undefined 
  ? process.env.REACT_APP_BACKEND_URL 
  : 'http://localhost:8001';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
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
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'verifying' && (
              <Loader2 className="h-16 w-16 text-blue-600 dark:text-blue-400 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-600 dark:text-red-400" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold dark:text-white">
            {status === 'verifying' && 'Verifying Email'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
          </CardTitle>
          <CardDescription className="dark:text-gray-400 mt-2">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'success' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your email has been successfully verified. You can now login to access all features.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Redirecting to login page in 3 seconds...
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Go to Login
              </Button>
            </>
          )}
          
          {status === 'error' && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t worry! You can request a new verification link.
              </p>
              <Link to="/resend-verification">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  variant="outline"
                  className="w-full dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
                >
                  Back to Login
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
