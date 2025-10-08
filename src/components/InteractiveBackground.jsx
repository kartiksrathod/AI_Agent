import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

const InteractiveBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Throttled mouse position update for better performance
  const updateMousePosition = useCallback((e) => {
    // Only update every few pixels to reduce computations
    const newX = Math.round(e.clientX / 10) * 10;
    const newY = Math.round(e.clientY / 10) * 10;
    
    setMousePosition(prev => {
      if (Math.abs(prev.x - newX) > 10 || Math.abs(prev.y - newY) > 10) {
        return { x: newX, y: newY };
      }
      return prev;
    });
  }, []);

  // Update window size
  const updateWindowSize = useCallback(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    updateWindowSize();
    
    // Throttle mouse move events
    let throttleTimer = null;
    const throttledMouseMove = (e) => {
      if (throttleTimer === null) {
        throttleTimer = setTimeout(() => {
          updateMousePosition(e);
          throttleTimer = null;
        }, 16); // ~60fps
      }
    };

    window.addEventListener('mousemove', throttledMouseMove, { passive: true });
    window.addEventListener('resize', updateWindowSize);

    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
      window.removeEventListener('resize', updateWindowSize);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [updateMousePosition, updateWindowSize]);

  // Reduced floating elements for better performance
  const generateFloatingElements = () => {
    const elements = [];
    for (let i = 0; i < 8; i++) {
      elements.push(
        <motion.div
          key={`floating-${i}`}
          className="absolute pointer-events-none"
          style={{
            left: windowSize.width * Math.random(),
            top: windowSize.height * Math.random(),
          }}
          animate={{
            x: mousePosition.x * (0.01 + i * 0.002),
            y: mousePosition.y * (0.01 + i * 0.002),
          }}
          transition={{
            type: "spring",
            stiffness: 10 + i,
            damping: 25,
            mass: 0.8
          }}
        >
          <div
            className={`rounded-full ${
              i % 3 === 0 
                ? 'bg-blue-400/10' 
                : i % 3 === 1 
                ? 'bg-purple-400/10' 
                : 'bg-pink-400/10'
            } backdrop-blur-sm`}
            style={{
              width: 6 + (i % 3) * 2,
              height: 6 + (i % 3) * 2,
            }}
          />
        </motion.div>
      );
    }
    return elements;
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[1]">
      {/* Optimized mouse following gradient */}
      <motion.div
        className="absolute w-72 h-72 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(147,51,234,0.08) 50%, transparent 100%)',
        }}
        animate={{
          x: mousePosition.x - 144,
          y: mousePosition.y - 144,
        }}
        transition={{
          type: "spring",
          stiffness: 30,
          damping: 25,
        }}
      />

      {/* Secondary following element */}
      <motion.div
        className="absolute w-48 h-48 rounded-full opacity-15 blur-2xl"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.2) 0%, rgba(59,130,246,0.08) 70%, transparent 100%)',
        }}
        animate={{
          x: mousePosition.x - 96,
          y: mousePosition.y - 96,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 30,
        }}
      />

      {/* Floating elements */}
      {generateFloatingElements()}

      {/* Simplified grid animation */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <pattern 
              id="grid" 
              width="80" 
              height="80" 
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="text-blue-400/20"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Simplified corner decorative elements */}
      <motion.div
        className="absolute top-8 left-8 w-16 h-16 border border-blue-400/20 rounded-full"
        animate={{
          rotate: mousePosition.x * 0.05,
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: { type: "spring", stiffness: 50, damping: 15 },
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
      />
      
      <motion.div
        className="absolute bottom-8 right-8 w-12 h-12 border border-purple-400/20 rounded-lg"
        animate={{
          rotate: -mousePosition.y * 0.05,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { type: "spring", stiffness: 50, damping: 15 },
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }
        }}
      />
    </div>
  );
};

export default InteractiveBackground;