import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../components/ui/advanced-toast';

const useUserState = () => {
  const [userPreferences, setUserPreferences] = useState({
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      sound: true,
    },
    layout: {
      sidebar: true,
      density: 'comfortable', // compact, comfortable, spacious
    },
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium', // small, medium, large
    }
  });

  const [userProgress, setUserProgress] = useState({
    resourcesDownloaded: 0,
    testsCompleted: 0,
    studyStreak: 0,
    totalStudyTime: 0,
    lastActivity: null,
    bookmarks: [],
    recentlyViewed: [],
    achievements: [],
    goals: []
  });

  const [sessionState, setSessionState] = useState({
    currentPage: '/',
    timeOnPage: 0,
    searchHistory: [],
    scrollPositions: {},
    formData: {},
    openModals: []
  });

  const { toast } = useToast();

  // Load saved state on mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('userPreferences');
      const savedProgress = localStorage.getItem('userProgress');
      const savedSession = sessionStorage.getItem('sessionState');

      if (savedPreferences) {
        setUserPreferences({ ...userPreferences, ...JSON.parse(savedPreferences) });
      }

      if (savedProgress) {
        setUserProgress({ ...userProgress, ...JSON.parse(savedProgress) });
      }

      if (savedSession) {
        setSessionState({ ...sessionState, ...JSON.parse(savedSession) });
      }
    } catch (error) {
      console.error('Error loading user state:', error);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences) => {
    try {
      const updated = { ...userPreferences, ...newPreferences };
      setUserPreferences(updated);
      localStorage.setItem('userPreferences', JSON.stringify(updated));
      
      toast.success('Preferences saved', {
        description: 'Your settings have been updated',
        duration: 2000
      });
    } catch (error) {
      toast.error('Failed to save preferences', {
        description: 'Please try again'
      });
    }
  }, [userPreferences, toast]);

  // Update user progress
  const updateProgress = useCallback((progressUpdate) => {
    try {
      const updated = { 
        ...userProgress, 
        ...progressUpdate,
        lastActivity: new Date().toISOString()
      };
      setUserProgress(updated);
      localStorage.setItem('userProgress', JSON.stringify(updated));
      
      // Check for achievements
      checkAchievements(updated);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  }, [userProgress]);

  // Track user activity
  const trackActivity = useCallback((activity) => {
    const activities = {
      'resource_downloaded': () => updateProgress({ 
        resourcesDownloaded: userProgress.resourcesDownloaded + 1 
      }),
      'test_completed': () => updateProgress({ 
        testsCompleted: userProgress.testsCompleted + 1 
      }),
      'bookmark_added': (resourceId) => updateProgress({ 
        bookmarks: [...userProgress.bookmarks, { id: resourceId, addedAt: new Date() }] 
      }),
      'page_viewed': (pageUrl) => {
        const recentlyViewed = [
          { url: pageUrl, viewedAt: new Date() },
          ...userProgress.recentlyViewed.slice(0, 19) // Keep last 20
        ];
        updateProgress({ recentlyViewed });
      }
    };

    if (activities[activity.type]) {
      activities[activity.type](activity.data);
    }
  }, [userProgress, updateProgress]);

  // Check and award achievements
  const checkAchievements = useCallback((progress) => {
    const achievementRules = [
      {
        id: 'first_download',
        name: 'First Step',
        description: 'Downloaded your first resource',
        condition: () => progress.resourcesDownloaded >= 1,
        icon: '📥'
      },
      {
        id: 'heavy_downloader',
        name: 'Resource Collector',
        description: 'Downloaded 50+ resources',
        condition: () => progress.resourcesDownloaded >= 50,
        icon: '💪'
      },
      {
        id: 'test_master',
        name: 'Test Master',
        description: 'Completed 10 tests',
        condition: () => progress.testsCompleted >= 10,
        icon: '🏆'
      },
      {
        id: 'study_streak',
        name: 'Consistent Learner',
        description: '7-day study streak',
        condition: () => progress.studyStreak >= 7,
        icon: '🔥'
      }
    ];

    achievementRules.forEach(rule => {
      const hasAchievement = progress.achievements.some(a => a.id === rule.id);
      if (!hasAchievement && rule.condition()) {
        const newAchievement = {
          ...rule,
          unlockedAt: new Date().toISOString()
        };
        
        const updatedProgress = {
          ...progress,
          achievements: [...progress.achievements, newAchievement]
        };
        
        setUserProgress(updatedProgress);
        localStorage.setItem('userProgress', JSON.stringify(updatedProgress));
        
        // Show achievement notification
        toast.success(`Achievement Unlocked! ${rule.icon}`, {
          title: rule.name,
          description: rule.description,
          duration: 5000
        });
      }
    });
  }, [toast]);

  // Save form data for recovery
  const saveFormData = useCallback((formId, data) => {
    const updated = {
      ...sessionState,
      formData: {
        ...sessionState.formData,
        [formId]: data
      }
    };
    setSessionState(updated);
    sessionStorage.setItem('sessionState', JSON.stringify(updated));
  }, [sessionState]);

  // Get form data
  const getFormData = useCallback((formId) => {
    return sessionState.formData[formId] || {};
  }, [sessionState]);

  // Clear form data
  const clearFormData = useCallback((formId) => {
    const updated = {
      ...sessionState,
      formData: {
        ...sessionState.formData,
        [formId]: undefined
      }
    };
    setSessionState(updated);
    sessionStorage.setItem('sessionState', JSON.stringify(updated));
  }, [sessionState]);

  // Save scroll position
  const saveScrollPosition = useCallback((path, position) => {
    const updated = {
      ...sessionState,
      scrollPositions: {
        ...sessionState.scrollPositions,
        [path]: position
      }
    };
    setSessionState(updated);
    sessionStorage.setItem('sessionState', JSON.stringify(updated));
  }, [sessionState]);

  // Get scroll position
  const getScrollPosition = useCallback((path) => {
    return sessionState.scrollPositions[path] || 0;
  }, [sessionState]);

  // Export user data
  const exportUserData = useCallback(() => {
    const data = {
      preferences: userPreferences,
      progress: userProgress,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `eduresources-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully', {
      description: 'Your data has been downloaded'
    });
  }, [userPreferences, userProgress, toast]);

  // Import user data
  const importUserData = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.preferences) {
          savePreferences(data.preferences);
        }
        
        if (data.progress) {
          setUserProgress(data.progress);
          localStorage.setItem('userProgress', JSON.stringify(data.progress));
        }
        
        toast.success('Data imported successfully', {
          description: 'Your settings and progress have been restored'
        });
      } catch (error) {
        toast.error('Failed to import data', {
          description: 'The file format is invalid'
        });
      }
    };
    reader.readAsText(file);
  }, [savePreferences, toast]);

  return {
    // State
    userPreferences,
    userProgress,
    sessionState,
    
    // Actions
    savePreferences,
    updateProgress,
    trackActivity,
    
    // Form state management
    saveFormData,
    getFormData,
    clearFormData,
    
    // Scroll position management
    saveScrollPosition,
    getScrollPosition,
    
    // Data management
    exportUserData,
    importUserData,
    
    // Computed values
    hasAchievements: userProgress.achievements.length > 0,
    isActiveUser: userProgress.resourcesDownloaded > 10 || userProgress.testsCompleted > 5,
    studyLevel: Math.floor(userProgress.resourcesDownloaded / 10) + Math.floor(userProgress.testsCompleted / 5)
  };
};

export default useUserState;