import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Search, X, FileText, BookOpen, GraduationCap } from 'lucide-react';
import { papersAPI, notesAPI, syllabusAPI } from '../api/api';
import { useToast } from '../hooks/use-toast';

const SearchBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);

    try {
      const [papersRes, notesRes, syllabusRes] = await Promise.all([
        papersAPI.getAll(),
        notesAPI.getAll(),
        syllabusAPI.getAll()
      ]);

      let allResources = [
        ...papersRes.data.map(p => ({ ...p, type: 'paper', icon: FileText })),
        ...notesRes.data.map(n => ({ ...n, type: 'note', icon: BookOpen })),
        ...syllabusRes.data.map(s => ({ ...s, type: 'syllabus', icon: GraduationCap }))
      ];

      // Search in title, description, tags, and branch
      const query = searchQuery.toLowerCase();
      const results = allResources.filter(item => 
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.branch.toLowerCase().includes(query) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );

      // Sort by relevance (title matches first)
      results.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(query);
        const bTitle = b.title.toLowerCase().includes(query);
        if (aTitle && !bTitle) return -1;
        if (bTitle && !aTitle) return 1;
        return 0;
      });

      setSearchResults(results.slice(0, 6)); // Show only top 6 results
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: "Search Failed",
        description: "Failed to perform search. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleResultClick = (item) => {
    // Navigate to appropriate page based on type
    switch (item.type) {
      case 'paper':
        navigate('/papers');
        break;
      case 'note':
        navigate('/notes');
        break;
      case 'syllabus':
        navigate('/syllabus');
        break;
      default:
        navigate('/search');
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'paper': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'note': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'syllabus': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'paper': return 'Paper';
      case 'note': return 'Notes';
      case 'syllabus': return 'Syllabus';
      default: return type;
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      {/* Search Icon Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
        data-testid="search-icon-btn"
      >
        <Search className="h-5 w-5 text-gray-600 dark:text-gray-400" />
      </Button>

      {/* Search Overlay */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  ref={inputRef}
                  placeholder="Search papers, notes, syllabus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                  data-testid="search-bar-input"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 p-1 h-auto"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </Button>
                )}
              </div>
            </form>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Searching...</p>
              </div>
            )}

            {/* Search Results */}
            {!loading && searchResults.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Quick Results
                </h3>
                {searchResults.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={item.id || item._id}
                      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => handleResultClick(item)}
                      data-testid="search-result-item"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {item.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {item.branch}
                              </Badge>
                              <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                                {getTypeLabel(item.type)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {!loading && searchQuery && searchResults.length === 0 && (
              <div className="text-center py-4">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No results found</p>
              </div>
            )}

            {/* View All Results Link */}
            {searchResults.length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <Button
                  onClick={handleSearchSubmit}
                  variant="ghost"
                  size="sm"
                  className="w-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950"
                  data-testid="view-all-results-btn"
                >
                  View all results for "{searchQuery}"
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;