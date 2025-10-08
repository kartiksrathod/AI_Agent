import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const InteractiveBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Update mouse position
  const updateMousePosition = useCallback((e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Update window size
  const updateWindowSize = useCallback(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    updateWindowSize();
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('resize', updateWindowSize);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('resize', updateWindowSize);
    };
  }, [updateMousePosition, updateWindowSize]);

  // Generate floating elements that follow mouse
  const generateFloatingElements = () => {
    const elements = [];
    for (let i = 0; i < 15; i++) {
      elements.push(
        <motion.div
          key={`floating-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: windowSize.width * Math.random(),
            top: windowSize.height * Math.random(),
          }}
          animate={{
            x: mousePosition.x * (0.02 + i * 0.001),
            y: mousePosition.y * (0.02 + i * 0.001),
            rotate: mousePosition.x * 0.01,
          }}
          transition={{
            type: "spring",
            stiffness: 20 + i * 2,
            damping: 30,
            mass: 1
          }}
        >
          <div
            className={`rounded-full bg-gradient-to-r ${
              i % 3 === 0 
                ? 'from-blue-400/20 to-purple-400/20' 
                : i % 3 === 1 
                ? 'from-purple-400/20 to-pink-400/20' 
                : 'from-pink-400/20 to-blue-400/20'
            } backdrop-blur-sm`}
            style={{
              width: 8 + (i % 5) * 3,
              height: 8 + (i % 5) * 3,
            }}
          />
        </motion.div>
      );
    }
    return elements;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {/* Mouse following gradient */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(147,51,234,0.1) 50%, transparent 100%)',
        }}
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 30,
        }}
      />

      {/* Secondary following element */}
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-20 blur-2xl"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(59,130,246,0.1) 70%, transparent 100%)',
        }}
        animate={{
          x: mousePosition.x - 128,
          y: mousePosition.y - 128,
        }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 40,
        }}
      />

      {/* Floating elements */}
      {generateFloatingElements()}

      {/* Grid animation that responds to mouse */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern 
              id="grid" 
              width="60" 
              height="60" 
              patternUnits="userSpaceOnUse"
            >
              <motion.path
                d="M 60 0 L 0 0 0 60"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="1"
                animate={{
                  strokeOpacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </pattern>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Corner decorative elements */}
      <motion.div
        className="absolute top-10 left-10 w-20 h-20 border-2 border-blue-400/30 rounded-full"
        animate={{
          rotate: mousePosition.x * 0.1,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { type: "spring", stiffness: 100, damping: 10 },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      
      <motion.div
        className="absolute bottom-10 right-10 w-16 h-16 border-2 border-purple-400/30 rounded-lg"
        animate={{
          rotate: -mousePosition.y * 0.1,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { type: "spring", stiffness: 100, damping: 10 },
          scale: { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
        }}
      />

      <motion.div
        className="absolute top-1/2 right-10 w-12 h-12 border-2 border-pink-400/30 rounded-full"
        animate={{
          x: mousePosition.x * 0.02,
          y: mousePosition.y * 0.02,
          rotate: 360,
        }}
        transition={{
          x: { type: "spring", stiffness: 50, damping: 20 },
          y: { type: "spring", stiffness: 50, damping: 20 },
          rotate: { duration: 20, repeat: Infinity, ease: "linear" }
        }}
      />
    </div>
  );
};

export default InteractiveBackground;