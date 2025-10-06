import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockForumPosts, engineeringCourses } from '../../data/mock';
import { 
  Search, 
  MessageSquare, 
  Eye, 
  Clock, 
  Filter, 
  Plus,
  TrendingUp,
  User,
  Reply,
  ThumbsUp,
  Sparkles,
  Users
} from 'lucide-react';

const Forum = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPosts, setFilteredPosts] = useState(mockForumPosts);

  const categories = engineeringCourses.map(course => course.label);

  const handleSearch = () => {
    let filtered = mockForumPosts;

    if (searchQuery.trim()) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  };

  React.useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedCategory]);

  const handleNewPost = () => {
    alert('New post feature would open a modal or navigate to create post page');
  };

  const handlePostClick = (post) => {
    console.log('Opening post:', post.title);
    alert(`Opening post: ${post.title}`);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Computer Science Engineering': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Electronics & Communication Engineering': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Information Science & Technology': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'Mechanical Engineering': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Civil Engineering': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Electrical Engineering': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-orange-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Users className="h-64 w-64 text-orange-600" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 mb-4 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full">
              <Sparkles className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Community Driven Learning</span>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Engineering Community Forum
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Connect with fellow engineering students, ask questions, share knowledge, and grow together
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{mockForumPosts.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Discussions</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {mockForumPosts.reduce((sum, post) => sum + post.replies, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Replies</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {mockForumPosts.reduce((sum, post) => sum + post.views, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{categories.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search, Filters and New Post */}
        <Card className="mb-8 border-0 shadow-lg dark:bg-gray-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search discussions, topics, or users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 border-2 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    data-testid="forum-search-input"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11 border-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="all" className="dark:text-white">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="dark:text-white dark:hover:bg-gray-600">{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* New Post Button */}
              <div>
                <Button 
                  onClick={handleNewPost}
                  className="w-full h-11 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-md"
                  data-testid="new-post-btn"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Discussion
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count & Sort */}
        <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <p className="font-medium text-gray-900 dark:text-white">
              {filteredPosts.length} of {mockForumPosts.length} discussions
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Filter className="h-4 w-4" />
            <span>Sorted by recent activity</span>
          </div>
        </div>

        {/* Forum Posts */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card 
              key={post.id} 
              className="hover:shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => handlePostClick(post)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg leading-tight mb-2 hover:text-orange-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mb-3">
                      {post.content}
                    </CardDescription>
                  </div>
                  <MessageSquare className="h-5 w-5 text-orange-600 flex-shrink-0 ml-4" />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                {/* Post Meta */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Reply className="h-4 w-4" />
                      {post.replies}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.lastActivity}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={handleNewPost} className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Start a new discussion
            </Button>
          </div>
        )}

        {/* Popular Topics Sidebar */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                Trending Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['data-structures', 'algorithms', 'digital-electronics', 'thermodynamics', 'software-engineering', 'computer-networks'].map((topic, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-orange-100">
                    #{topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Forum;