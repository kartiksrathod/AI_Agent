import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, GraduationCap, Brain, Zap, Target } from 'lucide-react';

const AnimatedIntro = ({ onComplete }) => {
  const [stage, setStage] = useState(0);
  const [particles, setParticles] = useState([]);

  // Generate random particles
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 4 + 2,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 2 + 0.5,
    }));
    setParticles(newParticles);
  }, []);

  // Stage progression
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),   // Logo animation
      setTimeout(() => setStage(2), 1500),  // Text animation
      setTimeout(() => setStage(3), 2500),  // Features animation
      setTimeout(() => setStage(4), 4000),  // Final animation
      setTimeout(() => onComplete(), 5200)  // Complete intro
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const iconVariants = {
    hidden: { scale: 0, rotate: -180, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    })
  };

  const textVariants = {
    hidden: { y: 100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const featureIcons = [
    { icon: GraduationCap, color: "text-blue-400", delay: 0 },
    { icon: Brain, color: "text-purple-400", delay: 0.2 },
    { icon: Target, color: "text-green-400", delay: 0.4 },
    { icon: Zap, color: "text-yellow-400", delay: 0.6 }
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        {/* Animated Background Particles */}
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
                x: particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 50,
                y: particle.y + Math.cos(Date.now() * 0.001 + particle.id) * 30,
                scale: particle.size,
                opacity: particle.opacity
              }}
              transition={{
                duration: particle.speed,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
              style={{
                width: particle.size,
                height: particle.size,
              }}
            />
          ))}
        </div>

        {/* Animated Grid Background */}
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ scale: 0.8, rotate: -5 }}
          animate={{ scale: 1.2, rotate: 5 }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
        >
          <div className="grid grid-cols-12 grid-rows-8 gap-4 h-full w-full">
            {Array.from({ length: 96 }).map((_, i) => (
              <motion.div
                key={i}
                className="border border-white/10 rounded"
                initial={{ opacity: 0 }}
                animate={{ opacity: Math.random() * 0.3 }}
                transition={{ delay: i * 0.01, duration: 2, repeat: Infinity, repeatType: "reverse" }}
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
                initial={{ scale: 0, rotate: -360 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1.2, type: "spring", stiffness: 80, damping: 12 }}
                className="mb-8"
              >
                <motion.div
                  animate={{ 
                    rotateY: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotateY: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, repeatType: "reverse" }
                  }}
                  className="relative inline-block"
                >
                  <BookOpen className="h-20 w-20 mx-auto text-white drop-shadow-2xl" />
                  
                  {/* Glowing effect */}
                  <motion.div
                    className="absolute inset-0 h-20 w-20 mx-auto"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(255, 255, 255, 0.5)",
                        "0 0 40px rgba(255, 255, 255, 0.8)",
                        "0 0 20px rgba(255, 255, 255, 0.5)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ borderRadius: "50%" }}
                  />
                  
                  {/* Sparkles around logo */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        rotate: 360,
                        x: Math.cos((i * 60) * Math.PI / 180) * 60,
                        y: Math.sin((i * 60) * Math.PI / 180) * 60,
                      }}
                      transition={{
                        duration: 3,
                        delay: i * 0.2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: -6,
                        marginTop: -6
                      }}
                    >
                      <Sparkles className="h-3 w-3 text-yellow-300" />
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
                  className="text-6xl font-bold mb-2"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{
                    background: 'linear-gradient(90deg, #ffffff, #a855f7, #3b82f6, #ffffff)',
                    backgroundSize: '200% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  EduResources
                </motion.h1>
                
                <motion.p
                  className="text-xl font-light tracking-wide opacity-90"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
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
                className="flex justify-center space-x-8 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
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
                      whileHover={{ scale: 1.2, rotate: 15 }}
                      className={`p-4 rounded-full bg-white/10 backdrop-blur-sm ${item.color}`}
                    >
                      <item.icon className="h-8 w-8" />
                    </motion.div>
                    
                    {/* Ripple effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white/30"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        delay: item.delay,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 4: Loading Progress */}
          <AnimatePresence>
            {stage >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-64 mx-auto"
              >
                <motion.div
                  className="h-1 bg-white/20 rounded-full overflow-hidden mb-4"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                </motion.div>
                
                <motion.p
                  className="text-sm opacity-75 tracking-widest"
                  animate={{
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  L O A D I N G
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Skip Button */}
        <motion.button
          onClick={onComplete}
          className="absolute top-8 right-8 px-4 py-2 text-white/80 hover:text-white border border-white/30 hover:border-white/60 rounded-full text-sm backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 2, duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Skip Intro →
        </motion.button>

        {/* Corner Elements */}
        <motion.div
          className="absolute top-8 left-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <div className="w-16 h-16 border-l-2 border-t-2 border-white/30"></div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-8 right-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <div className="w-16 h-16 border-r-2 border-b-2 border-white/30"></div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnimatedIntro;