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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Engineering Community Forum</h1>
          <p className="text-lg text-gray-600">Connect with fellow engineering students, ask questions, and share knowledge</p>
        </div>

        {/* Search, Filters and New Post */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search discussions, topics, or users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* New Post Button */}
              <div>
                <Button 
                  onClick={handleNewPost}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing {filteredPosts.length} of {mockForumPosts.length} discussions
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
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