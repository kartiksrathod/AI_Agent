import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { engineeringCourses } from '../../data/mock';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/api';
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
  Sparkles,
  Users,
  Trash2,
  Edit,
  Send,
  X
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyContent, setReplyContent] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  // New post form state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory !== 'all' ? `?category=${encodeURIComponent(selectedCategory)}` : '';
      const response = await api.get(`/api/forum/posts${categoryParam}`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to load forum posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to create a post",
        variant: "destructive"
      });
      return;
    }

    if (!newPost.title || !newPost.content || !newPost.category) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const tagsArray = newPost.tags ? newPost.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      
      await api.post('/api/forum/posts', {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        tags: tagsArray
      });

      toast({
        title: "Success",
        description: "Post created successfully!"
      });

      setShowCreateModal(false);
      setNewPost({ title: '', content: '', category: '', tags: '' });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create post",
        variant: "destructive"
      });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/api/forum/posts/${postId}`);
      toast({
        title: "Success",
        description: "Post deleted successfully"
      });
      if (showPostModal) setShowPostModal(false);
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  const handlePostClick = async (post) => {
    setSelectedPost(post);
    setShowPostModal(true);
    
    try {
      // Fetch full post details and replies
      const [postResponse, repliesResponse] = await Promise.all([
        api.get(`/api/forum/posts/${post.id}`),
        api.get(`/api/forum/posts/${post.id}/replies`)
      ]);
      
      setSelectedPost(postResponse.data);
      setReplies(repliesResponse.data);
    } catch (error) {
      console.error('Error fetching post details:', error);
    }
  };

  const handleCreateReply = async () => {
    if (!currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please login to reply",
        variant: "destructive"
      });
      return;
    }

    if (!replyContent.trim()) {
      toast({
        title: "Validation Error",
        description: "Reply content cannot be empty",
        variant: "destructive"
      });
      return;
    }

    try {
      await api.post(`/api/forum/posts/${selectedPost.id}/replies`, {
        content: replyContent
      });

      toast({
        title: "Success",
        description: "Reply posted successfully!"
      });

      setReplyContent('');
      
      // Refresh replies
      const repliesResponse = await api.get(`/api/forum/posts/${selectedPost.id}/replies`);
      setReplies(repliesResponse.data);
      
      // Update post reply count
      const postResponse = await api.get(`/api/forum/posts/${selectedPost.id}`);
      setSelectedPost(postResponse.data);
      
    } catch (error) {
      console.error('Error creating reply:', error);
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) return;

    try {
      await api.delete(`/api/forum/replies/${replyId}`);
      toast({
        title: "Success",
        description: "Reply deleted successfully"
      });
      
      // Refresh replies
      const repliesResponse = await api.get(`/api/forum/posts/${selectedPost.id}/replies`);
      setReplies(repliesResponse.data);
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast({
        title: "Error",
        description: "Failed to delete reply",
        variant: "destructive"
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.author_name.toLowerCase().includes(query) ||
      post.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
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
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{posts.length}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Total Posts</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <Reply className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {posts.reduce((sum, post) => sum + post.replies_count, 0)}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">Total Replies</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <Eye className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {posts.reduce((sum, post) => sum + post.views, 0)}
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-300">Total Views</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30">
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">Active</p>
                <p className="text-sm text-orange-700 dark:text-orange-300">Community</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search posts, authors, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="forum-search-input"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-64" data-testid="forum-category-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {engineeringCourses.map(course => (
                    <SelectItem key={course.value} value={course.label}>
                      {course.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentUser && (
                <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                  <DialogTrigger asChild>
                    <Button className="bg-orange-600 hover:bg-orange-700" data-testid="create-post-btn">
                      <Plus className="h-4 w-4 mr-2" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Post</DialogTitle>
                      <DialogDescription>
                        Share your question or start a discussion with the community
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          placeholder="What's your question or topic?"
                          value={newPost.title}
                          onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                          data-testid="post-title-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select 
                          value={newPost.category} 
                          onValueChange={(value) => setNewPost({...newPost, category: value})}
                        >
                          <SelectTrigger data-testid="post-category-select">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {engineeringCourses.map(course => (
                              <SelectItem key={course.value} value={course.label}>
                                {course.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="content">Content *</Label>
                        <Textarea
                          id="content"
                          placeholder="Describe your question or topic in detail..."
                          value={newPost.content}
                          onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                          rows={6}
                          data-testid="post-content-input"
                        />
                      </div>

                      <div>
                        <Label htmlFor="tags">Tags (comma-separated)</Label>
                        <Input
                          id="tags"
                          placeholder="e.g., data-structures, python, help"
                          value={newPost.tags}
                          onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                          data-testid="post-tags-input"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreatePost} data-testid="submit-post-btn">
                          Create Post
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Posts Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Be the first to start a discussion!
              </p>
              {currentUser && (
                <Button onClick={() => setShowCreateModal(true)} data-testid="create-first-post-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <Card 
                key={post.id} 
                className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handlePostClick(post)}
                data-testid={`forum-post-${post.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-lg">
                        {post.author_name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 hover:text-orange-600 transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <User className="h-3 w-3" />
                            <span>{post.author_name}</span>
                            <span>•</span>
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(post.last_activity)}</span>
                          </div>
                        </div>
                        
                        {currentUser && (currentUser.is_admin || currentUser.id === post.author_id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePost(post.id);
                            }}
                            data-testid={`delete-post-${post.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">
                        {post.content}
                      </p>

                      <div className="flex items-center gap-4 flex-wrap">
                        <Badge className={getCategoryColor(post.category)}>
                          {post.category}
                        </Badge>

                        {post.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}

                        <div className="flex items-center gap-4 ml-auto text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.replies_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Post Detail Modal */}
        <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedPost && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <DialogTitle className="text-2xl">{selectedPost.title}</DialogTitle>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4" />
                        <span>{selectedPost.author_name}</span>
                        <span>•</span>
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(selectedPost.created_at)}</span>
                        <span>•</span>
                        <Eye className="h-4 w-4" />
                        <span>{selectedPost.views} views</span>
                      </div>
                    </div>
                    
                    {currentUser && (currentUser.is_admin || currentUser.id === selectedPost.author_id) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePost(selectedPost.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </DialogHeader>

                <div className="py-4">
                  <div className="mb-4">
                    <Badge className={getCategoryColor(selectedPost.category)}>
                      {selectedPost.category}
                    </Badge>
                    {selectedPost.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="ml-2">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="prose dark:prose-invert max-w-none mb-6">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedPost.content}
                    </p>
                  </div>

                  {/* Replies Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Replies ({replies.length})
                    </h3>

                    {currentUser && (
                      <div className="mb-6">
                        <Textarea
                          placeholder="Write your reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          rows={3}
                          data-testid="reply-content-input"
                        />
                        <div className="flex justify-end mt-2">
                          <Button onClick={handleCreateReply} data-testid="submit-reply-btn">
                            <Send className="h-4 w-4 mr-2" />
                            Post Reply
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {replies.map((reply) => (
                        <Card key={reply.id} data-testid={`reply-${reply.id}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                                {reply.author_name.charAt(0).toUpperCase()}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900 dark:text-white">
                                      {reply.author_name}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                      {formatDate(reply.created_at)}
                                    </span>
                                  </div>
                                  
                                  {currentUser && (currentUser.is_admin || currentUser.id === reply.author_id) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteReply(reply.id)}
                                      data-testid={`delete-reply-${reply.id}`}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  )}
                                </div>
                                
                                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                  {reply.content}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Forum;
