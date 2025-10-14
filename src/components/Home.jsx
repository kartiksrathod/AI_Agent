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
import TestimonialsSection from './TestimonialsSection';
import FeaturesSection from './FeaturesSection';

const Home = () => {
  // Quick access cards for main resources
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
    <div className="relative">
      {/* Background setup */}
      <div className="fixed inset-0 z-0">
        {/* Light mode gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:hidden"></div>
        <div 
          className="absolute inset-0 opacity-30 dark:hidden"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1644088379091-d574269d422f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzU5ODU5MDgwfDA&ixlib=rb-4.1.0&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        
        {/* Dark mode gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-gray-900 to-purple-950 hidden dark:block"></div>
        <div 
          className="absolute inset-0 opacity-20 hidden dark:block"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1579548122080-c35fd6820ecb?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHw0fHxhYnN0cmFjdCUyMHRlY2hub2xvZ3l8ZW58MHx8fHwxNzU5ODU5MDgwfDA&ixlib=rb-4.1.0&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/20 dark:bg-black/30"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10">
        {/* Optimized Background Particles */}
        <div className="fixed inset-0 pointer-events-none z-5">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/15 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${20 + i * 25}%`,
              }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 0.3, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: i * 2
              }}
            />
          ))}
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
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
                <motion.span
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  Your Engineering
                </motion.span>
                <br />
                <motion.span 
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  Success Hub
                </motion.span>
                <motion.div
                  className="inline-block ml-2"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 1.5 }}
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
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/papers">
                <motion.div
                  whileHover={{ 
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  <Button 
                    data-testid="explore-resources-btn"
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-700 dark:to-purple-700 px-8 relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <span className="relative z-10">Explore Resources</span>
                  </Button>
                </motion.div>
              </Link>
              <Link to="/forum">
                <motion.div
                  whileHover={{ 
                    scale: 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    data-testid="join-community-btn"
                    size="lg" 
                    variant="outline" 
                    className="px-8 border-2 border-gray-300 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 relative group overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <span className="relative z-10">Join Community</span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              {[
                { label: "Resources", value: "10K+", color: "text-blue-600" },
                { label: "Students", value: "5K+", color: "text-green-600" },
                { label: "Universities", value: "100+", color: "text-purple-600" },
                { label: "Success Rate", value: "95%", color: "text-orange-600" }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div 
                    className={`text-3xl font-bold ${stat.color} dark:opacity-90`}
                    whileHover={{ 
                      scale: 1.05,
                    }}
                    transition={{ 
                      duration: 0.2 
                    }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <FeaturesSection />

      {/* Quick Access Cards */}
      <div className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quick Access</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Jump straight to what you need</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickAccessCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  y: -8, 
                  transition: { duration: 0.2 } 
                }}
              >
                <Link to={card.path}>
                  <Card className={`h-full transition-all duration-300 hover:shadow-xl ${card.color} group`}>
                    <CardHeader className="text-center">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <card.icon className={`h-12 w-12 mx-auto mb-4 ${card.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                      </motion.div>
                      <CardTitle className="text-xl dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-400">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <motion.div 
                        className="text-2xl font-bold text-gray-900 dark:text-white"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        Available
                      </motion.div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Resources</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <motion.div 
        className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Static Background */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-20"
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h2 
            className="text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to Excel?
          </motion.h2>
          
          <motion.p 
            className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of engineering students who are already using EduResources to boost their academic performance.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/register">
              <Button 
                data-testid="get-started-btn"
                size="lg" 
                variant="secondary" 
                className="px-8 bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-200 dark:hover:bg-gray-300 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
      
      </div> {/* Close Content Container */}
    </div>
  );
};

export default Home;