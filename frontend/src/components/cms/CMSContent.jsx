import React, { useState, useEffect } from 'react';
import { Calendar, User, Tag, Star } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL !== undefined 
  ? process.env.REACT_APP_BACKEND_URL 
  : 'http://localhost:8001';

const CMSContent = () => {
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // all, announcement, news, update, info

  useEffect(() => {
    fetchContents();
  }, [filter]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const url = filter === 'all' 
        ? `${BACKEND_URL}/api/cms/content`
        : `${BACKEND_URL}/api/cms/content?content_type=${filter}`;
      
      const response = await axios.get(url);
      setContents(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      announcement: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      news: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      update: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      info: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    };
    return colors[type] || colors.info;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            📢 Announcements & Updates
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Stay updated with the latest news, announcements, and important information
          </p>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {['all', 'announcement', 'news', 'update', 'info'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  filter === type
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading content...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
            <p className="text-xl text-gray-600 dark:text-gray-400">
              No {filter === 'all' ? '' : filter} content available yet.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {contents.map((content) => (
              <div
                key={content.id}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all transform hover:-translate-y-1 ${
                  content.featured ? 'ring-4 ring-yellow-400 dark:ring-yellow-600' : ''
                }`}
              >
                {/* Featured Badge */}
                {content.featured && (
                  <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full w-fit mb-4">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold text-sm">Featured</span>
                  </div>
                )}

                {/* Header */}
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getTypeColor(content.content_type)}`}>
                    {content.content_type.toUpperCase()}
                  </span>
                  {content.category && (
                    <span className="px-4 py-1 rounded-full text-sm font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                      {content.category}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  {content.title}
                </h2>

                {/* Description */}
                {content.description && (
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4 italic">
                    {content.description}
                  </p>
                )}

                {/* Content */}
                <div className="prose dark:prose-invert max-w-none mb-6">
                  <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                    {content.content}
                  </p>
                </div>

                {/* Tags */}
                {content.tags && content.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {content.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{content.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(content.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  {content.updated_at !== content.created_at && (
                    <span className="text-xs italic">
                      (Updated: {new Date(content.updated_at).toLocaleDateString()})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSContent;