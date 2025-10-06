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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { syllabusAPI } from '../../api/api';
import { engineeringCourses } from '../../data/mock';
import { Search, Download, Plus, Trash2, GraduationCap, Upload, FileText, Eye } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Syllabus = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [filteredSyllabus, setFilteredSyllabus] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedSyllabus, setSelectedSyllabus] = useState([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    branch: '',
    year: '1st Year',
    description: '',
    tags: '',
    file: null
  });

  const { currentUser, isAdmin } = useAuth();
  const { toast } = useToast();
  const branches = engineeringCourses.map(course => course.label);
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  useEffect(() => {
    fetchSyllabus();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedBranch, activeTab, syllabus]);

  const fetchSyllabus = async () => {
    try {
      const response = await syllabusAPI.getAll();
      setSyllabus(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch syllabus:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = syllabus;

    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.tags && item.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    if (activeTab !== 'all') {
      filtered = filtered.filter(item => item.branch === activeTab);
    }

    if (selectedBranch !== 'all' && activeTab === 'all') {
      filtered = filtered.filter(item => item.branch === selectedBranch);
    }

    setFilteredSyllabus(filtered);
  };

  const handleDownload = (item) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to download syllabus.",
        variant: "destructive"
      });
      return;
    }

    syllabusAPI.download(item._id);
    toast({
      title: "Download Started",
      description: `Downloading: ${item.title}`,
    });
  };

  const handleView = (item) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to view syllabus.",
        variant: "destructive"
      });
      return;
    }

    syllabusAPI.view(item._id);
    toast({
      title: "Opening Preview",
      description: `Opening preview: ${item.title}`,
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

    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('branch', uploadForm.branch);
    formData.append('year', uploadForm.year);
    formData.append('description', uploadForm.description);
    formData.append('tags', uploadForm.tags);
    formData.append('file', uploadForm.file);

    try {
      await syllabusAPI.create(formData);
      toast({
        title: "Success",
        description: "Syllabus uploaded successfully!",
      });
      setIsUploadDialogOpen(false);
      setUploadForm({
        title: '',
        branch: '',
        year: '1st Year',
        description: '',
        tags: '',
        file: null
      });
      fetchSyllabus();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload syllabus. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (syllabusId) => {
    if (window.confirm('Are you sure you want to delete this syllabus?')) {
      try {
        await syllabusAPI.delete(syllabusId);
        toast({
          title: "Success",
          description: "Syllabus deleted successfully!",
        });
        fetchSyllabus();
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete syllabus. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSyllabus.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select syllabus to delete.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedSyllabus.length} syllabus?`)) {
      try {
        await Promise.all(selectedSyllabus.map(id => syllabusAPI.delete(id)));
        toast({
          title: "Success",
          description: `${selectedSyllabus.length} syllabus deleted successfully!`,
        });
        setSelectedSyllabus([]);
        fetchSyllabus();
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete some syllabus. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const toggleSyllabusSelection = (syllabusId) => {
    setSelectedSyllabus(prev => 
      prev.includes(syllabusId) 
        ? prev.filter(id => id !== syllabusId)
        : [...prev, syllabusId]
    );
  };

  const getSyllabusByBranch = (branch) => {
    return filteredSyllabus.filter(item => item.branch === branch);
  };

  const getSyllabusByYear = (branchSyllabus, year) => {
    return branchSyllabus.filter(item => item.year === year);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950 dark:via-gray-900 dark:to-pink-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading syllabus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950 dark:via-gray-900 dark:to-pink-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Engineering Syllabus</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Complete course curriculum and syllabus organized by branches</p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-6 flex flex-wrap gap-4">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Syllabus
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Upload New Syllabus</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="dark:text-white">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter syllabus title"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="branch" className="dark:text-white">Branch</Label>
                    <Select 
                      value={uploadForm.branch} 
                      onValueChange={(value) => setUploadForm({...uploadForm, branch: value})}
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
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
                    <Label htmlFor="year" className="dark:text-white">Year</Label>
                    <Select 
                      value={uploadForm.year} 
                      onValueChange={(value) => setUploadForm({...uploadForm, year: value})}
                    >
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <SelectValue placeholder="Select Year" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                        {years.map(year => (
                          <SelectItem key={year} value={year} className="dark:text-white dark:hover:bg-gray-600">
                            {year}
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags" className="dark:text-white">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., syllabus, official"
                      value={uploadForm.tags}
                      onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="file" className="dark:text-white">PDF File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setUploadForm({...uploadForm, file: e.target.files[0]})}
                      required
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Syllabus
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

            {selectedSyllabus.length > 0 && (
              <Button 
                onClick={handleBulkDelete}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedSyllabus.length})
              </Button>
            )}
          </div>
        )}

        {/* Search */}
        <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder="Search syllabus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Branch-wise Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-7 mb-8 dark:bg-gray-800">
            <TabsTrigger value="all" className="dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">All</TabsTrigger>
            {branches.map(branch => (
              <TabsTrigger 
                key={branch} 
                value={branch}
                className="text-xs lg:text-sm dark:text-gray-300 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white"
              >
                {branch.split(' ')[0]} {/* Show abbreviated name */}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredSyllabus.map((item) => (
                <Card key={item._id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {isAdmin && (
                          <Checkbox
                            checked={selectedSyllabus.includes(item._id)}
                            onCheckedChange={() => toggleSyllabusSelection(item._id)}
                            className="mb-2"
                          />
                        )}
                        <CardTitle className="text-lg leading-tight mb-2 dark:text-white">
                          {item.title}
                        </CardTitle>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                            {item.branch}
                          </Badge>
                          <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                            {item.year}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        <FileText className="h-4 w-4 text-red-500" />
                      </div>
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

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleDownload(item)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      
                      {isAdmin && (
                        <Button 
                          onClick={() => handleDelete(item._id)}
                          variant="destructive"
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Branch-specific tabs */}
          {branches.map(branch => (
            <TabsContent key={branch} value={branch} className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{branch}</h2>
                <p className="text-gray-600 dark:text-gray-300">Syllabus organized by academic year</p>
              </div>

              {years.map(year => {
                const yearSyllabus = getSyllabusByYear(getSyllabusByBranch(branch), year);
                
                if (yearSyllabus.length === 0) return null;

                return (
                  <div key={year} className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
                      {year}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {yearSyllabus.map((item) => (
                        <Card key={item._id} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {isAdmin && (
                                  <Checkbox
                                    checked={selectedSyllabus.includes(item._id)}
                                    onCheckedChange={() => toggleSyllabusSelection(item._id)}
                                    className="mb-2"
                                  />
                                )}
                                <CardTitle className="text-lg leading-tight mb-2 dark:text-white">
                                  {item.title}
                                </CardTitle>
                              </div>
                              <div className="flex items-center gap-1">
                                <GraduationCap className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                                <FileText className="h-4 w-4 text-red-500" />
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            {item.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => handleDownload(item)}
                                className="flex-1 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                                size="sm"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              
                              {isAdmin && (
                                <Button 
                                  onClick={() => handleDelete(item._id)}
                                  variant="destructive"
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>

        {/* No Results */}
        {filteredSyllabus.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No syllabus found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Syllabus;