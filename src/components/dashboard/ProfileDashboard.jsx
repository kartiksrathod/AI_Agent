import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { profileAPI, bookmarksAPI, achievementsAPI, learningGoalsAPI, papersAPI, notesAPI, syllabusAPI, statsAPI } from '../../api/api';
import { useToast } from '../../hooks/use-toast';
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
  Sparkles,
  Camera,
  Lock,
  Heart,
  Target,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  Bookmark,
  Trophy,
  CheckCircle
} from 'lucide-react';

const ProfileDashboard = () => {
  const { currentUser, isAdmin, updateUser } = useAuth();
  const { toast } = useToast();
  
  // State for tabs
  const [activeTab, setActiveTab] = useState('overview');
  
  // Profile states
  const [profileForm, setProfileForm] = useState({ name: currentUser?.name || '' });
  const [passwordForm, setPasswordForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Bookmarks states
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoadingBookmarks, setIsLoadingBookmarks] = useState(false);
  
  // Achievements states
  const [achievements, setAchievements] = useState([]);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(false);
  
  // Learning Goals states
  const [learningGoals, setLearningGoals] = useState([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', description: '', target_date: '' });
  const [editingGoal, setEditingGoal] = useState(null);
  
  // Dashboard stats
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState({ totalDownloads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'bookmarks' && bookmarks.length === 0) {
      fetchBookmarks();
    } else if (activeTab === 'achievements' && achievements.length === 0) {
      fetchAchievements();
    } else if (activeTab === 'goals' && learningGoals.length === 0) {
      fetchLearningGoals();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const statsResponse = await statsAPI.get();
      setStats(statsResponse.data);
      
      // Mock user stats
      const mockUserStats = { totalDownloads: Math.floor(Math.random() * 50) + 10 };
      setUserStats(mockUserStats);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    setIsLoadingBookmarks(true);
    try {
      const response = await bookmarksAPI.getAll();
      setBookmarks(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load bookmarks",
        variant: "destructive"
      });
    } finally {
      setIsLoadingBookmarks(false);
    }
  };

  const fetchAchievements = async () => {
    setIsLoadingAchievements(true);
    try {
      const response = await achievementsAPI.getAll();
      setAchievements(response.data);
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to load achievements",
        variant: "destructive"
      });
    } finally {
      setIsLoadingAchievements(false);
    }
  };

  const fetchLearningGoals = async () => {
    setIsLoadingGoals(true);
    try {
      const response = await learningGoalsAPI.getAll();
      setLearningGoals(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load learning goals", 
        variant: "destructive"
      });
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    
    try {
      await profileAPI.update(profileForm);
      updateUser({ ...currentUser, name: profileForm.name });
      toast({
        title: "Success",
        description: "Profile updated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await profileAPI.uploadPhoto(file);
      toast({
        title: "Success",
        description: "Profile photo updated successfully!"
      });
      // Force re-render by updating user context
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to upload photo",
        variant: "destructive"
      });
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive"
      });
      return;
    }

    try {
      await profileAPI.updatePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      toast({
        title: "Success", 
        description: "Password updated successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update password",
        variant: "destructive"
      });
    }
  };

  const handleRemoveBookmark = async (resourceType, resourceId) => {
    try {
      await bookmarksAPI.remove(resourceType, resourceId);
      setBookmarks(bookmarks.filter(b => !(b.resource_type === resourceType && b.resource_id === resourceId)));
      toast({
        title: "Success",
        description: "Bookmark removed"
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to remove bookmark",
        variant: "destructive"
      });
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    
    try {
      await learningGoalsAPI.create({
        ...goalForm,
        target_date: new Date(goalForm.target_date).toISOString()
      });
      setGoalForm({ title: '', description: '', target_date: '' });
      setIsGoalDialogOpen(false);
      fetchLearningGoals();
      toast({
        title: "Success",
        description: "Learning goal created successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive"
      });
    }
  };

  const handleUpdateGoalProgress = async (goalId, progress) => {
    try {
      await learningGoalsAPI.update(goalId, { progress });
      fetchLearningGoals();
      if (progress === 100) {
        toast({
          title: "Congratulations! 🎉",
          description: "Goal completed!"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await learningGoalsAPI.delete(goalId);
      fetchLearningGoals();
      toast({
        title: "Success",
        description: "Goal deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal",
        variant: "destructive"
      });
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center gap-6 mb-6">
            <div className="relative">
              <Avatar className="w-20 h-20" data-testid="profile-avatar">
                <AvatarImage 
                  src={currentUser?.profile_photo ? profileAPI.getPhoto(currentUser.id) : ''} 
                  alt={currentUser?.name} 
                />
                <AvatarFallback className="bg-blue-600 text-white text-2xl">
                  {currentUser?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {getGreeting()}, {currentUser?.name}!
                <Sparkles className="h-6 w-6 text-yellow-400" />
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Welcome to your learning dashboard
              </p>
              {isAdmin && (
                <Badge variant="destructive" className="mt-2">
                  <Award className="h-3 w-3 mr-1" />
                  Administrator
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4" data-testid="profile-tabs">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarks
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Goals & Achievements
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="dark:bg-gray-800 dark:border-gray-700" data-testid="downloads-stat-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-white">Total Downloads</CardTitle>
                  <Download className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dark:text-white">{userStats.totalDownloads}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Across all resources</p>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-white">Bookmarks</CardTitle>
                  <Heart className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dark:text-white">{bookmarks.length}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Saved resources</p>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-white">Achievements</CardTitle>
                  <Trophy className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dark:text-white">{achievements.length}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Badges earned</p>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium dark:text-white">Learning Goals</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dark:text-white">{learningGoals.filter(g => g.completed).length}/{learningGoals.length}</div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Goals completed</p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Stats */}
            {stats && (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <GraduationCap className="h-5 w-5" />
                    Platform Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_papers}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Papers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.total_notes}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Notes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.total_syllabus}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Syllabus</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.total_users}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Users</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Profile Settings */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage 
                        src={currentUser?.profile_photo ? profileAPI.getPhoto(currentUser.id) : ''} 
                        alt={currentUser?.name} 
                      />
                      <AvatarFallback className="bg-blue-600 text-white text-xl">
                        {currentUser?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Label htmlFor="photo-upload" className="cursor-pointer">
                        <Button variant="outline" size="sm" className="gap-2" data-testid="upload-photo-btn">
                          <Camera className="h-4 w-4" />
                          Change Photo
                        </Button>
                      </Label>
                      <Input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="dark:text-white">Name</Label>
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        data-testid="profile-name-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="dark:text-white">Email</Label>
                      <Input
                        id="email"
                        value={currentUser?.email}
                        disabled
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400"
                      />
                    </div>
                    <Button type="submit" disabled={isUpdatingProfile} data-testid="update-profile-btn">
                      {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Password Settings */}
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Lock className="h-5 w-5" />
                    Change Password
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="current-password" className="dark:text-white">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        data-testid="current-password-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="new-password" className="dark:text-white">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        data-testid="new-password-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password" className="dark:text-white">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        data-testid="confirm-password-input"
                      />
                    </div>
                    <Button type="submit" data-testid="update-password-btn">Update Password</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Heart className="h-5 w-5" />
                  My Bookmarks ({bookmarks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingBookmarks ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : bookmarks.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No bookmarks yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Start exploring and bookmark your favorite resources!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookmarks.map((bookmark) => (
                      <Card key={bookmark.id} className="hover:shadow-md transition-shadow dark:bg-gray-700 dark:border-gray-600" data-testid="bookmark-card">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium dark:text-white line-clamp-1">{bookmark.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{bookmark.branch}</p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {bookmark.resource_type}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveBookmark(bookmark.resource_type, bookmark.resource_id)}
                              className="text-red-600 hover:text-red-700"
                              data-testid="remove-bookmark-btn"
                            >
                              <Heart className="h-4 w-4 fill-current" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals & Achievements Tab */}
          <TabsContent value="goals" className="space-y-6">
            {/* Achievements Section */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 dark:text-white">
                  <Trophy className="h-5 w-5" />
                  Achievements ({achievements.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAchievements ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No achievements yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Complete activities to earn your first badge!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievements.map((achievement) => (
                      <Card key={achievement.id} className="text-center p-4 dark:bg-gray-700 dark:border-gray-600" data-testid="achievement-card">
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <h4 className="font-bold dark:text-white">{achievement.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{achievement.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Goals Section */}
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 dark:text-white">
                    <Target className="h-5 w-5" />
                    Learning Goals ({learningGoals.length})
                  </CardTitle>
                  <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="gap-2" data-testid="add-goal-btn">
                        <Plus className="h-4 w-4" />
                        Add Goal
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="dark:text-white">Create Learning Goal</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateGoal} className="space-y-4">
                        <div>
                          <Label htmlFor="goal-title" className="dark:text-white">Goal Title</Label>
                          <Input
                            id="goal-title"
                            value={goalForm.title}
                            onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                            placeholder="e.g., Master Data Structures"
                            required
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            data-testid="goal-title-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="goal-description" className="dark:text-white">Description</Label>
                          <Textarea
                            id="goal-description"
                            value={goalForm.description}
                            onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                            placeholder="Describe your learning goal..."
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            data-testid="goal-description-input"
                          />
                        </div>
                        <div>
                          <Label htmlFor="goal-date" className="dark:text-white">Target Date</Label>
                          <Input
                            id="goal-date"
                            type="date"
                            value={goalForm.target_date}
                            onChange={(e) => setGoalForm({...goalForm, target_date: e.target.value})}
                            required
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            data-testid="goal-date-input"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1" data-testid="create-goal-btn">
                            Create Goal
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsGoalDialogOpen(false)}
                            className="dark:border-gray-600 dark:text-gray-300"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingGoals ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : learningGoals.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No learning goals yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">Set your first goal to start tracking progress!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {learningGoals.map((goal) => (
                      <Card key={goal.id} className="p-4 dark:bg-gray-700 dark:border-gray-600" data-testid="learning-goal-card">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium dark:text-white">{goal.title}</h4>
                              {goal.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{goal.description}</p>
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="dark:text-gray-300">Progress</span>
                                <span className="dark:text-gray-300">{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              Target: {new Date(goal.target_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateGoalProgress(goal.id, Math.min(100, goal.progress + 25))}
                              disabled={goal.completed}
                              data-testid="update-progress-btn"
                            >
                              +25%
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteGoal(goal.id)}
                              className="text-red-600"
                              data-testid="delete-goal-btn"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileDashboard;