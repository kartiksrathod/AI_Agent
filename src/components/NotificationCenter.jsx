import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from './ui/advanced-toast';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  // Load notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notifications');
    if (saved) {
      const parsedNotifications = JSON.parse(saved);
      setNotifications(parsedNotifications);
      setUnreadCount(parsedNotifications.filter(n => !n.read).length);
    } else {
      // Demo notifications for first time users
      const demoNotifications = [
        {
          id: 1,
          type: 'success',
          title: 'Welcome to EduResources! 🎉',
          message: 'Explore study materials, papers, and connect with fellow students.',
          timestamp: new Date().toISOString(),
          read: false
        },
        {
          id: 2,
          type: 'info',
          title: 'Keyboard Shortcuts Available',
          message: 'Press "?" to view all keyboard shortcuts for faster navigation.',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          read: false
        }
      ];
      setNotifications(demoNotifications);
      setUnreadCount(2);
      localStorage.setItem('notifications', JSON.stringify(demoNotifications));
    }
  }, []);

  // Add a notification
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    setUnreadCount(unreadCount + 1);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  // Mark notification as read
  const markAsRead = (id) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(updated.filter(n => !n.read).length);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  // Mark all as read
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem('notifications', JSON.stringify(updated));
    toast.success('All notifications marked as read');
  };

  // Delete notification
  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    if (!notification.read) {
      setUnreadCount(unreadCount - 1);
    }
    localStorage.setItem('notifications', JSON.stringify(updated));
    toast.success('Notification deleted');
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('notifications');
    toast.success('All notifications cleared');
    setIsOpen(false);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" data-testid="notification-center">
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 rounded-full"
        data-testid="notification-bell-button"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge 
              variant="destructive" 
              className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              data-testid="unread-count-badge"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          </motion.div>
        )}
      </Button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            
            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
              data-testid="notification-panel"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {notifications.length > 0 && unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                      data-testid="mark-all-read-button"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>

              {/* Notifications List */}
              <ScrollArea className="h-96">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <Bell className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      No notifications yet
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      We'll notify you when something important happens
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                          !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                        data-testid={`notification-item-${notification.id}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <p className={`text-sm font-medium ${
                                !notification.read 
                                  ? 'text-gray-900 dark:text-white' 
                                  : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="ml-2 flex-shrink-0">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-500 dark:text-gray-500">
                                {formatTimestamp(notification.timestamp)}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                data-testid={`delete-notification-${notification.id}`}
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="w-full text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                    data-testid="clear-all-button"
                  >
                    Clear all notifications
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
