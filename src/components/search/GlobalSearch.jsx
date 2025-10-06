import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { papersAPI, notesAPI, syllabusAPI } from '../api/api';
import { engineeringCourses } from '../../data/mock';
import { Search, Download, FileText, BookOpen, GraduationCap, Filter, Zap } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { useAuth } from '../../contexts/AuthContext';

const GlobalSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const branches = engineeringCourses.map(course => course.label);

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [searchQuery, selectedType, selectedBranch]);

  const loadRecommendations = async () => {
    try {
      const [papersRes, notesRes, syllabusRes] = await Promise.all([
        papersAPI.getAll(),
        notesAPI.getAll(),
        syllabusAPI.getAll()
      ]);

      const allResources = [
        ...papersRes.data.map(p => ({ ...p, type: 'paper', icon: FileText })),
        ...notesRes.data.map(n => ({ ...n, type: 'note', icon: BookOpen })),
        ...syllabusRes.data.map(s => ({ ...s, type: 'syllabus', icon: GraduationCap }))
      ];

      // Get random recommendations
      const shuffled = allResources.sort(() => 0.5 - Math.random());
      setRecommendations(shuffled.slice(0, 6));
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setHasSearched(true);

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

      // Filter by type
      if (selectedType !== 'all') {
        allResources = allResources.filter(item => item.type === selectedType);
      }

      // Filter by branch
      if (selectedBranch !== 'all') {
        allResources = allResources.filter(item => item.branch === selectedBranch);
      }

      // Search in title, description, tags, and branch
      const query = searchQuery.toLowerCase();
      const results = allResources.filter(item => 
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        item.branch.toLowerCase().includes(query) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
      );

      // Sort by relevance (title matches first, then description, then tags)
      results.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(query);
        const bTitle = b.title.toLowerCase().includes(query);
        if (aTitle && !bTitle) return -1;
        if (bTitle && !aTitle) return 1;
        return 0;
      });

      setSearchResults(results);
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

  const handleDownload = (item) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to download resources.",
        variant: "destructive"
      });
      return;
    }

    const itemId = item.id || item._id;
    
    // Call the appropriate download API
    switch (item.type) {
      case 'paper':
        papersAPI.download(itemId);
        break;
      case 'note':
        notesAPI.download(itemId);
        break;
      case 'syllabus':
        syllabusAPI.download(itemId);
        break;
    }

    toast({
      title: "Download Started",
      description: `Downloading: ${item.title}`,
    });
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
      case 'paper': return 'Question Paper';
      case 'note': return 'Study Notes';
      case 'syllabus': return 'Syllabus';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-indigo-950 dark:via-gray-900 dark:to-cyan-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Global Search</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Search across papers, notes, and syllabus with smart recommendations
          </p>
        </div>

        {/* Search Bar */}
        <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Main Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search papers, notes, syllabus..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    data-testid="global-search-input"
                  />
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-600">All Types</SelectItem>
                    <SelectItem value="paper" className="dark:text-white dark:hover:bg-gray-600">Question Papers</SelectItem>
                    <SelectItem value="note" className="dark:text-white dark:hover:bg-gray-600">Study Notes</SelectItem>
                    <SelectItem value="syllabus" className="dark:text-white dark:hover:bg-gray-600">Syllabus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Branch Filter */}
              <div>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="all" className="dark:text-white dark:hover:bg-gray-600">All Branches</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch} value={branch} className="dark:text-white dark:hover:bg-gray-600">
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Searching...</p>
          </div>
        )}

        {hasSearched && !loading && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Search Results ({searchResults.length})
            </h2>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {searchResults.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.id || item._id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700" data-testid="search-result-card">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg leading-tight mb-2 dark:text-white">
                              {item.title}
                            </CardTitle>
                            <div className="flex gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                {item.branch}
                              </Badge>
                              <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                                {getTypeLabel(item.type)}
                              </Badge>
                            </div>
                          </div>
                          <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {item.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {item.description}
                          </p>
                        )}

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {item.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                                {tag}
                              </Badge>
                            ))}
                            {item.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                                +{item.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Download Button */}
                        <Button 
                          onClick={() => handleDownload(item)}
                          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                          size="sm"
                          data-testid="download-search-result-btn"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No results found</h3>
                <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {!hasSearched && recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Recommended for You
              </h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendations.map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.id || item._id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700" data-testid="recommendation-card">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight mb-2 dark:text-white">
                            {item.title}
                          </CardTitle>
                          <div className="flex gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                              {item.branch}
                            </Badge>
                            <Badge className={`text-xs ${getTypeColor(item.type)}`}>
                              {getTypeLabel(item.type)}
                            </Badge>
                          </div>
                        </div>
                        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Download Button */}
                      <Button 
                        onClick={() => handleDownload(item)}
                        className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;