import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { papersAPI, notesAPI, syllabusAPI, statsAPI } from '../../api/api';
import { 
  User, 
  FileText, 
  BookOpen, 
  GraduationCap, 
  Download, 
  Calendar,
  Award,
  Activity,
  TrendingUp,
  Sparkles
} from 'lucide-react';

const ProfileDashboard = () => {
  const { currentUser, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentDownloads, setRecentDownloads] = useState([]);
  const [userStats, setUserStats] = useState({
    papersDownloaded: 0,
    notesDownloaded: 0,
    syllabusDownloaded: 0,
    totalDownloads: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch platform stats
      const statsResponse = await statsAPI.get();
      setStats(statsResponse.data);
      
      // Simulate user activity stats (in real app, this would come from user activity tracking)
      const mockUserStats = {
        papersDownloaded: Math.floor(Math.random() * 15) + 5,
        notesDownloaded: Math.floor(Math.random() * 10) + 3,
        syllabusDownloaded: Math.floor(Math.random() * 8) + 2,
        totalDownloads: 0
      };
      mockUserStats.totalDownloads = mockUserStats.papersDownloaded + mockUserStats.notesDownloaded + mockUserStats.syllabusDownloaded;
      setUserStats(mockUserStats);

      // Fetch recent papers and notes for "recent downloads" simulation
      const [papersRes, notesRes] = await Promise.all([
        papersAPI.getAll(),
        notesAPI.getAll()
      ]);
      
      const allResources = [
        ...papersRes.data.map(p => ({...p, type: 'paper'})),
        ...notesRes.data.map(n => ({...n, type: 'note'}))
      ];
      
      // Simulate recent downloads (random selection)
      const shuffled = allResources.sort(() => 0.5 - Math.random());
      setRecentDownloads(shuffled.slice(0, 5));
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          ></motion.div>
          <motion.p 
            className="text-gray-600 dark:text-gray-300"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-blue-400/10 rounded-full"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              scale: 0 
            }}
            animate={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              scale: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 8 + 12, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center gap-4 mb-4">
            <motion.div 
              className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <User className="h-8 w-8" />
            </motion.div>
            <div>
              <motion.h1 
                className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {getGreeting()}, {currentUser?.name}!
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </motion.div>
              </motion.h1>
              <motion.p 
                className="text-lg text-gray-600 dark:text-gray-300"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Welcome to your learning dashboard
              </motion.p>
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Badge variant="destructive" className="mt-1">
                    <Award className="h-3 w-3 mr-1" />
                    Administrator
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Personal Downloads */}
          <Card className="dark:bg-gray-800 dark:border-gray-700" data-testid="downloads-stat-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Total Downloads</CardTitle>
              <Download className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{userStats.totalDownloads}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Across all resources
              </p>
            </CardContent>
          </Card>

          {/* Papers Downloaded */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Papers Downloaded</CardTitle>
              <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{userStats.papersDownloaded}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Question papers
              </p>
            </CardContent>
          </Card>

          {/* Notes Downloaded */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Notes Downloaded</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{userStats.notesDownloaded}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Study materials
              </p>
            </CardContent>
          </Card>

          {/* Platform Activity */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">Platform Engagement</CardTitle>
              <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">Active</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Regular user
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <TrendingUp className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDownloads.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900">
                      {item.type === 'paper' ? (
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium dark:text-white">{item.title}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{item.branch}</p>
                    </div>
                    <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                      {item.type === 'paper' ? 'Paper' : 'Notes'}
                    </Badge>
                  </div>
                ))}
                {recentDownloads.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Platform Stats & Quick Actions */}
          <div className="space-y-6">
            {/* Platform Stats */}
            {stats && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <GraduationCap className="h-5 w-5" />
                    Platform Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Papers</span>
                    <span className="text-sm font-medium dark:text-white">{stats.total_papers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Notes</span>
                    <span className="text-sm font-medium dark:text-white">{stats.total_notes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Syllabus</span>
                    <span className="text-sm font-medium dark:text-white">{stats.total_syllabus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
                    <span className="text-sm font-medium dark:text-white">{stats.total_users}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/papers'}
                  data-testid="quick-action-papers"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Browse Papers
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/notes'}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse Notes
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = '/syllabus'}
                >
                  <GraduationCap className="h-4 w-4 mr-2" />
                  View Syllabus
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;