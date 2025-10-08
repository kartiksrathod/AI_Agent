import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, BookOpen, GraduationCap, MessageSquare, Clock, TrendingUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { useToast } from './ui/advanced-toast';

const SmartSearchBar = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingSearches] = useState([
    'Computer Science Papers', 'Data Structures Notes', 'Mechanical Engineering',
    'Circuit Analysis', 'Software Engineering', 'Database Management'
  ]);
  const inputRef = useRef();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sample data for autocomplete (in real app, this would come from API)
  const searchData = [
    { title: 'Computer Science Papers', type: 'papers', icon: FileText, category: 'Question Papers' },
    { title: 'Data Structures and Algorithms', type: 'notes', icon: BookOpen, category: 'Study Notes' },
    { title: 'Engineering Mathematics', type: 'syllabus', icon: GraduationCap, category: 'Syllabus' },
    { title: 'Circuit Analysis Notes', type: 'notes', icon: BookOpen, category: 'Study Notes' },
    { title: 'Software Engineering Papers', type: 'papers', icon: FileText, category: 'Question Papers' },
    { title: 'Database Management System', type: 'notes', icon: BookOpen, category: 'Study Notes' },
    { title: 'Mechanical Engineering Syllabus', type: 'syllabus', icon: GraduationCap, category: 'Syllabus' },
    { title: 'Help with Programming', type: 'forum', icon: MessageSquare, category: 'Community' },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Generate suggestions based on query
  useEffect(() => {
    if (query.length > 0) {
      const filtered = searchData.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Handle search submission
  const handleSearch = useCallback((searchTerm, item = null) => {
    if (!searchTerm.trim()) return;

    // Add to recent searches
    const newRecentSearches = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    // Navigate or show results
    if (item) {
      const routes = {
        papers: '/papers',
        notes: '/notes',
        syllabus: '/syllabus',
        forum: '/forum'
      };
      
      if (routes[item.type]) {
        navigate(routes[item.type]);
        toast.success(`Searching ${item.category} for "${searchTerm}"`, {
          description: 'Redirecting to the relevant section...'
        });
      }
    } else {
      // Generic search - could implement global search results
      toast.info(`Searching for "${searchTerm}"`, {
        description: 'Search functionality coming soon!'
      });
    }

    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  }, [recentSearches, navigate, toast]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.closest('.search-container')?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    toast.success('Recent searches cleared');
  };

  return (
    <div className="relative search-container" ref={inputRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search resources... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
          }}
          className="pl-10 pr-20 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        
        {/* Keyboard Shortcut Hint */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 hidden sm:block">
          <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm z-50 overflow-hidden"
          >
            <div className="max-h-96 overflow-y-auto">
              
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wide">
                    Suggestions
                  </div>
                  {suggestions.map((item, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearch(item.title, item)}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="flex-shrink-0">
                        <item.icon className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.category}
                        </div>
                      </div>
                      <Search className="h-3 w-3 text-gray-400" />
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && query.length === 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Recent
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearch(search)}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                        {search}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              {query.length === 0 && (
                <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2 uppercase tracking-wide">
                    Trending
                  </div>
                  {trendingSearches.slice(0, 4).map((search, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSearch(search)}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <TrendingUp className="h-4 w-4 text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                        {search}
                      </span>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {query.length > 0 && suggestions.length === 0 && (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No results found for "{query}"</p>
                  <button
                    onClick={() => handleSearch(query)}
                    className="text-blue-500 hover:text-blue-600 text-sm mt-2"
                  >
                    Search anyway →
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSearchBar;