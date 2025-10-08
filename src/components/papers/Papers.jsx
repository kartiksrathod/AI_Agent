import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { useAuth } from '../../contexts/AuthContext';
import { papersAPI, bookmarksAPI } from '../../api/api';
import { engineeringCourses } from '../../data/mock';
import { Search, Download, Plus, Trash2, FileText, Upload, Eye, Heart } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Papers = () => {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    branch: '',
    description: '',
    tags: '',
    file: null
  });

  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const branches = engineeringCourses.map(course => course.label);

  useEffect(() => {
    fetchPapers();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedBranch, papers]);

  const fetchPapers = async () => {
    try {
      const response = await papersAPI.getAll();
      setPapers(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch papers:', error);
      toast({
        title: "Error",
        description: "Failed to load papers. Please refresh the page.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = papers;

    if (searchQuery.trim()) {
      filtered = filtered.filter(paper =>
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (paper.tags && paper.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    if (selectedBranch !== 'all') {
      filtered = filtered.filter(paper => paper.branch === selectedBranch);
    }

    setFilteredPapers(filtered);
  };

  const handleDownload = (paper) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to download papers.",
        variant: "destructive"
      });
      return;
    }

    // Use id or _id based on what's available
    const paperId = paper.id || paper._id;
    papersAPI.download(paperId);
    toast({
      title: "Download Started",
      description: `Downloading: ${paper.title}`,
    });
  };

  const handleView = (paper) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to view papers.",
        variant: "destructive"
      });
      return;
    }

    // Use id or _id based on what's available
    const paperId = paper.id || paper._id;
    papersAPI.view(paperId);
    toast({
      title: "Opening Preview",
      description: `Opening preview: ${paper.title}`,
    });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.file) {
      toast({
        title: "File Required",
        description: "Please select a PDF file to upload.",
        variant: "destructive"
      });
      return;
    }

    if (!uploadForm.branch) {
      toast({
        title: "Branch Required",
        description: "Please select a branch.",
        variant: "destructive"
      });
      return;
    }

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('branch', uploadForm.branch);
    formData.append('description', uploadForm.description);
    formData.append('tags', uploadForm.tags);
    formData.append('file', uploadForm.file);

    try {
      await papersAPI.create(formData);
      toast({
        title: "Success",
        description: "Paper uploaded successfully!",
      });
      setIsUploadDialogOpen(false);
      setUploadForm({
        title: '',
        branch: '',
        description: '',
        tags: '',
        file: null
      });
      // Reset file input
      document.getElementById('file').value = '';
      fetchPapers();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.response?.data?.detail || "Failed to upload paper. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (paperId) => {
    if (window.confirm('Are you sure you want to delete this paper?')) {
      try {
        await papersAPI.delete(paperId);
        toast({
          title: "Success",
          description: "Paper deleted successfully!",
        });
        fetchPapers();
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete paper. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedPapers.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select papers to delete.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedPapers.length} paper(s)?`)) {
      try {
        await Promise.all(selectedPapers.map(id => papersAPI.delete(id)));
        toast({
          title: "Success",
          description: `${selectedPapers.length} paper(s) deleted successfully!`,
        });
        setSelectedPapers([]);
        fetchPapers();
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete some papers. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const togglePaperSelection = (paperId) => {
    setSelectedPapers(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId)
        : [...prev, paperId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading papers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950 dark:via-gray-900 dark:to-purple-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Previous Year Question Papers</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Access previous year question papers from all engineering branches</p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-6 flex flex-wrap gap-4">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800" data-testid="add-paper-btn">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Paper
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Upload New Paper</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="dark:text-white">Subject Name *</Label>
                    <Input
                      id="title"
                      placeholder="Enter subject name"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      data-testid="paper-title-input"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="branch" className="dark:text-white">Branch *</Label>
                    <Select 
                      value={uploadForm.branch} 
                      onValueChange={(value) => setUploadForm({...uploadForm, branch: value})}
                      required
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" data-testid="paper-branch-select">
                        <SelectValue placeholder="Select Branch" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        {branches.map(branch => (
                          <SelectItem key={branch} value={branch} className="dark:text-white dark:hover:bg-gray-600">
                            {branch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description" className="dark:text-white">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter description (optional)"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      data-testid="paper-description-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags" className="dark:text-white">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., algorithms, data-structures"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      data-testid="paper-tags-input"
                    />
                  </div>

                  <div>
                    <Label htmlFor="file" className="dark:text-white">PDF File *</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      data-testid="paper-file-input"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" data-testid="submit-paper-btn">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Paper
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsUploadDialogOpen(false)}
                      className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {selectedPapers.length > 0 && (
              <Button 
                onClick={handleBulkDelete}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedPapers.length})
              </Button>
            )}
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="Search papers or subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                    data-testid="papers-search-input"
                  />
                </div>
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

        {/* Papers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPapers.map((paper) => {
            const paperId = paper.id || paper._id;
            return (
              <Card key={paperId} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700" data-testid="paper-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isAdmin && (
                        <Checkbox
                          checked={selectedPapers.includes(paperId)}
                          onCheckedChange={() => togglePaperSelection(paperId)}
                          className="mb-2"
                          data-testid={`paper-checkbox-${paperId}`}
                        />
                      )}
                      <CardTitle className="text-lg leading-tight mb-2 dark:text-white">
                        {paper.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                        {paper.branch}
                      </Badge>
                    </div>
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" />
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {paper.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {paper.description}
                    </p>
                  )}

                  {/* Tags */}
                  {paper.tags && paper.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {paper.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                          {tag}
                        </Badge>
                      ))}
                      {paper.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                          +{paper.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleView(paper)}
                      className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                      size="sm"
                      data-testid="view-paper-btn"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    
                    <Button 
                      onClick={() => handleDownload(paper)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                      size="sm"
                      data-testid="download-paper-btn"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    
                    {isAdmin && (
                      <Button 
                        onClick={() => handleDelete(paperId)}
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700"
                        data-testid="delete-paper-btn"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredPapers.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No question papers found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Papers;