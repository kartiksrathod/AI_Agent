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
import { notesAPI } from '../../api/api';
import { engineeringCourses } from '../../data/mock';
import { Search, Download, Plus, Trash2, BookOpen, Upload, FileText, Eye } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedNotes, setSelectedNotes] = useState([]);
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
    fetchNotes();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, selectedBranch, notes]);

  const fetchNotes = async () => {
    try {
      const response = await notesAPI.getAll();
      setNotes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let filtered = notes;

    if (searchQuery.trim()) {
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.tags && note.tags.some(tag => 
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
      );
    }

    if (selectedBranch !== 'all') {
      filtered = filtered.filter(note => note.branch === selectedBranch);
    }

    setFilteredNotes(filtered);
  };

  const handleDownload = (note) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to download notes.",
        variant: "destructive"
      });
      return;
    }

    const noteId = note.id || note._id;
    notesAPI.download(noteId);
    toast({
      title: "Download Started",
      description: `Downloading: ${note.title}`,
    });
  };

  const handleView = (note) => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to view notes.",
        variant: "destructive"
      });
      return;
    }

    const noteId = note.id || note._id;
    notesAPI.view(noteId);
    toast({
      title: "Opening Preview",
      description: `Opening preview: ${note.title}`,
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
    formData.append('description', uploadForm.description);
    formData.append('tags', uploadForm.tags);
    formData.append('file', uploadForm.file);

    try {
      await notesAPI.create(formData);
      toast({
        title: "Success",
        description: "Notes uploaded successfully!",
      });
      setIsUploadDialogOpen(false);
      setUploadForm({
        title: '',
        branch: '',
        description: '',
        tags: '',
        file: null
      });
      fetchNotes();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload notes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (noteId) => {
    if (window.confirm('Are you sure you want to delete these notes?')) {
      try {
        await notesAPI.delete(noteId);
        toast({
          title: "Success",
          description: "Notes deleted successfully!",
        });
        fetchNotes();
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete notes. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotes.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select notes to delete.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedNotes.length} note(s)?`)) {
      try {
        await Promise.all(selectedNotes.map(id => notesAPI.delete(id)));
        toast({
          title: "Success",
          description: `${selectedNotes.length} note(s) deleted successfully!`,
        });
        setSelectedNotes([]);
        fetchNotes();
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete some notes. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const toggleNoteSelection = (noteId) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-950 dark:via-gray-900 dark:to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-950 dark:via-gray-900 dark:to-blue-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Study Notes</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Quality notes shared by engineering students for students</p>
        </div>

        {/* Admin Controls */}
        {isAdmin && (
          <div className="mb-6 flex flex-wrap gap-4">
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Notes
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Upload New Notes</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="dark:text-white">Subject Name</Label>
                    <Input
                      id="title"
                      placeholder="Enter subject name"
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
                      placeholder="e.g., programming, theory"
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
                      Upload Notes
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

            {selectedNotes.length > 0 && (
              <Button 
                onClick={handleBulkDelete}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedNotes.length})
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
                    placeholder="Search notes or subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
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

        {/* Notes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const noteId = note.id || note._id;
            return (
            <Card key={noteId} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {isAdmin && (
                      <Checkbox
                        checked={selectedNotes.includes(noteId)}
                        onCheckedChange={() => toggleNoteSelection(noteId)}
                        className="mb-2"
                        data-testid={`note-checkbox-${noteId}`}
                      />
                    )}
                    <CardTitle className="text-lg leading-tight mb-2 dark:text-white">
                      {note.title}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                      {note.branch}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <FileText className="h-4 w-4 text-red-500" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {note.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {note.description}
                  </p>
                )}

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                        {tag}
                      </Badge>
                    ))}
                    {note.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-400">
                        +{note.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleView(note)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    size="sm"
                    data-testid="view-note-btn"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  
                  <Button 
                    onClick={() => handleDownload(note)}
                    className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                    size="sm"
                    data-testid="download-note-btn"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  
                  {isAdmin && (
                    <Button 
                      onClick={() => handleDelete(noteId)}
                      variant="destructive"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="delete-note-btn"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notes found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;