import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { Mail, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL !== undefined 
  ? process.env.REACT_APP_BACKEND_URL 
  : 'http://localhost:8001';

const ResendVerification = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/resend-verification`, { email });
      setSent(true);
      toast({
        title: "Email Sent!",
        description: response.data.message || "Please check your inbox for the verification link.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to send verification email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {sent ? (
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            ) : (
              <Mail className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold dark:text-white">
            {sent ? 'Check Your Email' : 'Resend Verification'}
          </CardTitle>
          <CardDescription className="dark:text-gray-400">
            {sent 
              ? 'We\'ve sent a new verification link to your email address' 
              : 'Enter your email to receive a new verification link'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="dark:text-white">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Verification Email'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-200">
                  📧 A new verification link has been sent to <strong>{email}</strong>
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-2">
                  Please check your inbox (and spam folder) for the email.
                </p>
              </div>
              
              <Button 
                onClick={() => {
                  setSent(false);
                  setEmail('');
                }}
                variant="outline"
                className="w-full dark:border-gray-600 dark:text-white dark:hover:bg-gray-700"
              >
                Send to Different Email
              </Button>
            </div>
          )}
          
          <div className="mt-6 text-center space-y-2">
            <Link to="/login" className="text-sm text-blue-600 dark:text-blue-400 hover:underline block">
              Back to Login
            </Link>
            <Link to="/register" className="text-sm text-gray-600 dark:text-gray-400 hover:underline block">
              Don't have an account? Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResendVerification;
