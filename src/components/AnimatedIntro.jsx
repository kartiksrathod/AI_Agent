import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, GraduationCap, Brain, Zap, Target } from 'lucide-react';

const AnimatedIntro = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [particles, setParticles] = useState([]);

  // Reduced particles for better performance
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.4 + 0.1,
      speed: Math.random() * 1 + 0.3,
    }));
    setParticles(newParticles);
  }, []);

  // Optimized timing for great visual impact
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),   // Logo animation
      setTimeout(() => setStage(2), 1200),  // Text animation
      setTimeout(() => setStage(3), 2000),  // Features animation
      setTimeout(() => setStage(4), 3200),  // Final animation
      setTimeout(() => onComplete(), 4500)  // Complete intro
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const iconVariants = {
    hidden: { scale: 0, rotate: -90, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: "spring",
        stiffness: 150,
        damping: 15
      }
    })
  };

  const textVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const featureIcons = [
    { icon: GraduationCap, color: "text-blue-400", delay: 0 },
    { icon: Brain, color: "text-purple-400", delay: 0.1 },
    { icon: Target, color: "text-green-400", delay: 0.2 },
    { icon: Zap, color: "text-yellow-400", delay: 0.3 }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Optimized Background Particles */}
        <div className="absolute inset-0">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full bg-white"
              initial={{
                x: particle.x,
                y: particle.y,
                scale: 0,
                opacity: 0
              }}
              animate={{
                x: particle.x + Math.sin(particle.id * 0.5) * 20,
                y: particle.y + Math.cos(particle.id * 0.5) * 15,
                scale: particle.size,
                opacity: particle.opacity
              }}
              transition={{
                duration: particle.speed * 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              style={{
                width: particle.size + 'px',
                height: particle.size + 'px',
              }}
            />
          ))}
        </div>

        {/* Simplified Grid Background */}
        <motion.div
          className="absolute inset-0 opacity-5"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        >
          <div className="grid grid-cols-8 grid-rows-6 gap-6 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <motion.div
                key={i}
                className="border border-white/5 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.2 }}
                transition={{ delay: i * 0.02, duration: 1 }}
              />
            ))}
          </div>
        </motion.div>

        {/* Main Content Container */}
        <div className="relative z-10 text-center text-white">
          
          {/* Stage 1: Logo Animation */}
          <AnimatePresence>
            {stage >= 1 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, type: "spring", stiffness: 100, damping: 15 }}
                className="mb-8"
              >
                <motion.div
                  animate={{ 
                    rotateY: [0, 360],
                  }}
                  transition={{ 
                    rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
                  }}
                  className="relative inline-block"
                >
                  <BookOpen className="h-16 w-16 mx-auto text-white drop-shadow-2xl" />
                  
                  {/* Simplified glowing effect */}
                  <motion.div
                    className="absolute inset-0 h-16 w-16 mx-auto rounded-full"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(255, 255, 255, 0.3)",
                        "0 0 30px rgba(255, 255, 255, 0.5)",
                        "0 0 20px rgba(255, 255, 255, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  
                  {/* Reduced sparkles */}
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        rotate: 180,
                        x: Math.cos((i * 90) * Math.PI / 180) * 40,
                        y: Math.sin((i * 90) * Math.PI / 180) * 40,
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.15,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: -4,
                        marginTop: -4
                      }}
                    >
                      <Sparkles className="h-2 w-2 text-yellow-300" />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 2: Title Animation */}
          <AnimatePresence>
            {stage >= 2 && (
              <motion.div
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="mb-6"
              >
                <motion.h1 
                  className="text-5xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent"
                >
                  EduResources
                </motion.h1>
                
                <motion.p
                  className="text-lg font-light tracking-wide opacity-90"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  Your Engineering Success Hub
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 3: Feature Icons */}
          <AnimatePresence>
            {stage >= 3 && (
              <motion.div
                className="flex justify-center space-x-6 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                {featureIcons.map((item, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={iconVariants}
                    initial="hidden"
                    animate="visible"
                    className="relative"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`p-3 rounded-full bg-white/10 backdrop-blur-sm ${item.color}`}
                    >
                      <item.icon className="h-6 w-6" />
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 4: Loading Progress */}
          <AnimatePresence>
            {stage >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-48 mx-auto"
              >
                <motion.div
                  className="h-1 bg-white/20 rounded-full overflow-hidden mb-3"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-400"
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </motion.div>
                
                <motion.p
                  className="text-sm opacity-75 tracking-wider"
                  animate={{
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  LOADING
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Skip Button */}
        <motion.button
          onClick={onComplete}
          className="absolute top-6 right-6 px-3 py-2 text-white/80 hover:text-white border border-white/30 hover:border-white/60 rounded-full text-sm backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Skip →
        </motion.button>

        {/* Corner Elements */}
        <motion.div
          className="absolute top-6 left-6"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="w-12 h-12 border-l-2 border-t-2 border-white/30"></div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-6 right-6"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="w-12 h-12 border-r-2 border-b-2 border-white/30"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedIntro;