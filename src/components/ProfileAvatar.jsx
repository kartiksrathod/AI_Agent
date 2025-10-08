import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, User, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { useToast } from './ui/advanced-toast';

const ProfileAvatar = ({ user, size = "lg", editable = false, showStatus = false }) => {
  const [isHovering, setIsHovering] = useState(false);
  const { toast } = useToast();

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
    "2xl": "h-32 w-32"
  };

  const generateGradientAvatar = (name) => {
    const colors = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-pink-400 to-pink-600',
      'from-green-400 to-green-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600',
    ];
    
    const charCode = name ? name.charCodeAt(0) : 0;
    const colorIndex = charCode % colors.length;
    return colors[colorIndex];
  };

  const handleAvatarUpload = () => {
    // In a real app, this would open file picker
    toast.loading('Uploading avatar...', { duration: 2000 });
    
    setTimeout(() => {
      toast.success('Avatar updated successfully!', {
        description: 'Your new profile picture looks great!'
      });
    }, 2000);
  };

  const userInitials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="relative inline-block">
      <motion.div
        className="relative"
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        whileHover={{ scale: editable ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <Avatar className={`${sizeClasses[size]} ring-2 ring-white dark:ring-gray-800 shadow-lg relative`}>
          <AvatarImage 
            src={user?.profile_photo} 
            alt={user?.name || 'User avatar'} 
            className="object-cover"
          />
          <AvatarFallback className={`bg-gradient-to-br ${generateGradientAvatar(user?.name)} text-white font-bold text-lg relative overflow-hidden`}>
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "linear"
              }}
            />
            <span className="relative z-10">{userInitials}</span>
          </AvatarFallback>
        </Avatar>

        {/* Online Status Indicator */}
        {showStatus && (
          <motion.div
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              boxShadow: [
                '0 0 0 0 rgba(34, 197, 94, 0.7)',
                '0 0 0 6px rgba(34, 197, 94, 0)',
                '0 0 0 0 rgba(34, 197, 94, 0)'
              ]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}

        {/* Premium Badge */}
        {user?.is_premium && (
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </motion.div>
        )}

        {/* Editable Overlay */}
        {editable && (
          <AnimatePresence>
            {isHovering && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer"
                onClick={handleAvatarUpload}
              >
                <Camera className="h-6 w-6 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* User Info Tooltip on Hover */}
      {!editable && (
        <AnimatePresence>
          {isHovering && user && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 px-3 py-2 min-w-max"
            >
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
                {user.is_admin && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 mt-1">
                    Admin
                  </span>
                )}
              </div>
              
              {/* Tooltip Arrow */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default ProfileAvatar;