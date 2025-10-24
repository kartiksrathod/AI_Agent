import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  BookOpen, 
  GraduationCap, 
  MessageSquare, 
  Brain,
  Search,
  Star,
  Download,
  Users,
  Shield,
  Zap,
  Target
} from 'lucide-react';

const FeaturesSection = () => {
  const mainFeatures = [
    {
      icon: FileText,
      title: "Question Papers Archive",
      description: "Access thousands of previous year question papers from top engineering colleges across India.",
      features: ["10,000+ Papers", "All Branches Covered", "Semester-wise Organization", "Instant Download"],
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      link: "/papers"
    },
    {
      icon: BookOpen,
      title: "Study Materials Hub",
      description: "Comprehensive study notes, reference materials, and guides created by top students and faculty.",
      features: ["Quality Notes", "Topic-wise Chapters", "Visual Diagrams", "Easy Navigation"],
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      link: "/notes"
    },
    {
      icon: Brain,
      title: "AI Study Assistant",
      description: "Get instant help with your engineering queries through our advanced AI assistant.",
      features: ["24/7 Available", "Subject Expert", "Step-by-step Solutions", "Concept Clarification"],
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
      link: "/"
    },
    {
      icon: Users,
      title: "Student Community",
      description: "Connect with fellow engineering students, share knowledge, and get peer support.",
      features: ["Active Forums", "Study Groups", "Peer Support", "Knowledge Sharing"],
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      link: "/forum"
    }
  ];

  const additionalFeatures = [
    { icon: Search, title: "Smart Search", description: "Find exactly what you need with our intelligent search system" },
    { icon: Download, title: "Offline Access", description: "Download resources for offline study anytime, anywhere" },
    { icon: Star, title: "Quality Assured", description: "All materials are reviewed and verified by subject experts" },
    { icon: Shield, title: "Secure Platform", description: "Your data is safe with enterprise-grade security measures" },
    { icon: Zap, title: "Fast Loading", description: "Lightning-fast performance for seamless user experience" },
    { icon: Target, title: "Exam Focused", description: "Resources specifically curated for exam success and good grades" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className="py-20 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10"
            style={{
              width: 200 + i * 50,
              height: 200 + i * 50,
              left: `${20 + i * 15}%`,
              top: `${10 + i * 10}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            style={{
              background: 'linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #3B82F6)',
              backgroundSize: '200% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            Everything You Need to Excel
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Comprehensive tools and resources designed specifically for engineering students to achieve academic excellence
          </motion.p>
        </motion.div>

        {/* Main Features Grid */}
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 } 
              }}
            >
              <Card className={`h-full ${feature.bgColor} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden`}>
                {/* Animated Background Gradient */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                  initial={false}
                  whileHover={{ opacity: 0.1 }}
                />
                
                <CardHeader className="relative z-10">
                  <div className="flex items-center space-x-4 mb-4">
                    <motion.div
                      className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg`}
                      whileHover={{ 
                        rotate: 360,
                        scale: 1.1
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {feature.features.map((item, idx) => (
                      <motion.div 
                        key={idx}
                        className="flex items-center space-x-2"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + idx * 0.1, duration: 0.5 }}
                      >
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.color}`} />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  <Link to={feature.link}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className={`w-full bg-gradient-to-r ${feature.color} hover:shadow-xl text-white border-0 relative overflow-hidden group/btn`}
                        size="lg"
                      >
                        <motion.span
                          className="absolute inset-0 bg-white/20"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative z-10">Explore Now</span>
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <motion.h3 
            className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Why Students Choose EduResources
          </motion.h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-700/50 transition-all duration-300 group border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.8 }}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;