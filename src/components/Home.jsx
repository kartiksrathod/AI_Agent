import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'framer-motion';
import { 
  FileText, 
  BookOpen, 
  GraduationCap, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

const Home = () => {
  const quickAccessCards = [
    {
      title: 'Question Papers',
      description: 'Previous year question papers',
      icon: FileText,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:border-blue-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      path: '/papers'
    },
    {
      title: 'Study Notes',
      description: 'Engineering notes and materials',
      icon: BookOpen,
      color: 'bg-green-50 hover:bg-green-100 border-green-200 dark:bg-green-950 dark:hover:bg-green-900 dark:border-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      path: '/notes'
    },
    {
      title: 'Syllabus',
      description: 'Engineering branch syllabus',
      icon: GraduationCap,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 dark:border-purple-800',
      iconColor: 'text-purple-600 dark:text-purple-400',
      path: '/syllabus'
    },
    {
      title: 'Forum',
      description: 'Engineering community help',
      icon: MessageSquare,
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 dark:bg-orange-950 dark:hover:bg-orange-900 dark:border-orange-800',
      iconColor: 'text-orange-600 dark:text-orange-400',
      path: '/forum'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: 0 
            }}
            animate={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              scale: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.h1 
                className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                Your Engineering
                <motion.span 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                > Success Hub</motion.span>
                <motion.div
                  className="inline-block ml-2"
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <Sparkles className="h-8 w-8 text-yellow-400 inline" />
                </motion.div>
              </motion.h1>
            </motion.div>
            
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Access thousands of previous year question papers, study notes, syllabus, and connect with fellow engineering students. 
              Everything you need to excel in your engineering journey, all in one place.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/papers">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 px-8">
                    Explore Resources
                  </Button>
                </motion.div>
              </Link>
              <Link to="/forum">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" variant="outline" className="px-8 border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
                    Join Community
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quick Access</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Jump straight to what you need</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickAccessCards.map((card, index) => (
              <Link key={index} to={card.path}>
                <Card className={`h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${card.color}`}>
                  <CardHeader className="text-center">
                    <card.icon className={`h-12 w-12 mx-auto mb-4 ${card.iconColor}`} />
                    <CardTitle className="text-xl dark:text-white">{card.title}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      Available
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Resources</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Excel?</h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto">
            Join thousands of engineering students who are already using EduResources to boost their academic performance.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="px-8 bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-300">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;