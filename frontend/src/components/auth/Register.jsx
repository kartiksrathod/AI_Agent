import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { engineeringCourses } from '../../data/mock';
import { BookOpen, Mail, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL !== undefined 
  ? process.env.REACT_APP_BACKEND_URL 
  : 'http://localhost:8001';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    usn: '',
    course: '',
    semester: ''
  });
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }

    // Validate USN (alphanumeric)
    const usnRegex = /^[a-zA-Z0-9]+$/;
    if (!usnRegex.test(formData.usn)) {
      toast({
        title: "Invalid USN",
        description: "USN must be alphanumeric (letters and numbers only).",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        usn: formData.usn,
        course: formData.course,
        semester: formData.semester
      });
      
      setUserEmail(formData.email);
      setRegistrationSuccess(true);
      
      toast({
        title: "Registration Successful! 🎉",
        description: "Please check your email to verify your account.",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.response?.data?.detail || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Success view after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-6">
              <div className="relative animate-bounce-once">
                <div className="absolute inset-0 bg-green-400 dark:bg-green-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <CheckCircle className="relative h-20 w-20 text-green-600 dark:text-green-400 animate-scale-in" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              Registration Successful! 🎉
            </CardTitle>
            <CardDescription className="dark:text-gray-400 text-base">
              One last step - verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 animate-fade-in">
            {/* Main Message */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-300 dark:border-blue-700 rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    📬 Check your inbox!
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                    We&apos;ve sent a verification email to:
                  </p>
                  <p className="text-base font-bold text-blue-700 dark:text-blue-300 bg-white dark:bg-gray-800/50 px-3 py-2 rounded-lg mb-3 break-all">
                    {userEmail}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Click the verification link in the email to activate your account and start learning!
                  </p>
                </div>
              </div>
            </div>

            {/* What's Next Section */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-2">
                🎯 What&apos;s Next?
              </p>
              <ol className="text-xs text-purple-800 dark:text-purple-300 space-y-1 ml-4 list-decimal">
                <li>Open the email we just sent you</li>
                <li>Click the &quot;Verify Email&quot; button</li>
                <li>You&apos;ll be redirected to login</li>
                <li>Start exploring study materials!</li>
              </ol>
            </div>

            {/* Tip Section */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                💡 <strong>Pro Tip:</strong> Check your spam/junk folder if you don&apos;t see the email within 2-3 minutes.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <Button 
                onClick={() => navigate('/resend-verification')}
                variant="outline"
                className="w-full dark:border-gray-600 dark:text-white dark:hover:bg-gray-700 py-6 font-semibold border-2 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                data-testid="resend-email-button"
              >
                <Mail className="mr-2 h-5 w-5" />
                Didn&apos;t receive the email?
              </Button>
              
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-700 dark:to-purple-700 dark:hover:from-blue-800 dark:hover:to-purple-800 py-6 font-semibold shadow-lg hover:shadow-xl transition-all"
                data-testid="back-to-login-button"
              >
                Go to Login Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold dark:text-white">Create Account</CardTitle>
          <CardDescription className="dark:text-gray-400">
            Join EduResources to access study materials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="dark:text-white">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="email" className="dark:text-white">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="usn" className="dark:text-white">USN (University Serial Number)</Label>
              <Input
                id="usn"
                name="usn"
                type="text"
                required
                placeholder="e.g., 1AB21CS001"
                value={formData.usn}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <Label htmlFor="course" className="dark:text-white">Engineering Branch</Label>
              <Select value={formData.course} onValueChange={(value) => setFormData({...formData, course: value})}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select your branch" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {engineeringCourses.map(course => (
                    <SelectItem key={course.value} value={course.label} className="dark:text-white dark:hover:bg-gray-600">
                      {course.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="semester" className="dark:text-white">Current Semester</Label>
              <Select value={formData.semester} onValueChange={(value) => setFormData({...formData, semester: value})}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  {semesters.map(semester => (
                    <SelectItem key={semester} value={semester} className="dark:text-white dark:hover:bg-gray-600">
                      {semester} Semester
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="password" className="dark:text-white">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="dark:text-white">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Note: Admin registration removed for security */}
            
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;