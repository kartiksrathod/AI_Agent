import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, StarOff, Save, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

const CMSAdmin = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    content_type: 'announcement',
    featured: false,
    category: '',
    tags: ''
  });

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/cms/content`);
      setContents(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
      alert('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login as admin first');
        return;
      }

      const contentData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
      };

      if (editingId) {
        // Update
        await axios.put(
          `${BACKEND_URL}/api/cms/content/${editingId}`,
          contentData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Content updated successfully!');
      } else {
        // Create
        await axios.post(
          `${BACKEND_URL}/api/cms/content`,
          contentData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Content created successfully!');
      }

      resetForm();
      fetchContents();
    } catch (error) {
      console.error('Error saving content:', error);
      alert(error.response?.data?.detail || 'Failed to save content');
    }
  };

  const handleEdit = (content) => {
    setFormData({
      title: content.title,
      description: content.description || '',
      content: content.content,
      content_type: content.content_type,
      featured: content.featured,
      category: content.category || '',
      tags: content.tags.join(', ')
    });
    setEditingId(content.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BACKEND_URL}/api/cms/content/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Content deleted successfully!');
      fetchContents();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      content_type: 'announcement',
      featured: false,
      category: '',
      tags: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Content Management System
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage announcements, news, and updates for all users
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            {showForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {showForm ? 'Cancel' : 'Add New Content'}
          </button>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingId ? 'Edit Content' : 'Create New Content'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content Type *
                  </label>
                  <select
                    value={formData.content_type}
                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="news">News</option>
                    <option value="update">Update</option>
                    <option value="info">Information</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Brief description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white h-32"
                  required
                  placeholder="Write your content here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Academic, Events"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="important, urgent, event"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mark as Featured (will appear on homepage)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  {editingId ? 'Update Content' : 'Create Content'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all dark:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            All Content ({contents.length})
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading content...</p>
            </div>
          ) : contents.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <p className="text-gray-600 dark:text-gray-400">No content yet. Create your first one!</p>
            </div>
          ) : (
            contents.map((content) => (
              <div
                key={content.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {content.title}
                      </h3>
                      {content.featured && (
                        <span className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-semibold">
                          <Star className="w-3 h-3" /> Featured
                        </span>
                      )}
                      <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full text-xs font-semibold">
                        {content.content_type}
                      </span>
                    </div>
                    {content.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-3">{content.description}</p>
                    )}
                    <p className="text-gray-700 dark:text-gray-300 mb-3">{content.content}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {content.category && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs">
                          {content.category}
                        </span>
                      )}
                      {content.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      By {content.author_name} • {new Date(content.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(content)}
                      className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(content.id)}
                      className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CMSAdmin;