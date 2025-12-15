import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Shield, FileText, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface LegalDocument {
  id: string;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
  created_at: string;
}

type LegalTab = 'privacy-policy' | 'terms-and-conditions';

const fetchLegalDocument = async (token: string, slug: string): Promise<LegalDocument> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/legal/${slug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const updateLegalDocument = async (
  token: string,
  slug: string,
  data: { title: string; content: string }
): Promise<LegalDocument> => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/legal/${slug}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const UV_AdminLegal: React.FC = () => {
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<LegalTab>('privacy-policy');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch current document
  const {
    data: document,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-legal', activeTab],
    queryFn: () => fetchLegalDocument(authToken!, activeTab),
    enabled: !!authToken,
    staleTime: 30000,
  });

  // Update form when document loads or tab changes
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setContent(document.content);
      setHasUnsavedChanges(false);
    }
  }, [document]);

  // Track changes
  useEffect(() => {
    if (document) {
      const changed = title !== document.title || content !== document.content;
      setHasUnsavedChanges(changed);
    }
  }, [title, content, document]);

  // Mutation for updating document
  const updateMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      updateLegalDocument(authToken!, activeTab, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-legal', activeTab] });
      queryClient.invalidateQueries({ queryKey: ['legal-privacy'] });
      queryClient.invalidateQueries({ queryKey: ['legal-terms'] });
      showToast('Legal document updated successfully', 'success');
      setHasUnsavedChanges(false);
    },
    onError: (error: any) => {
      showToast(
        error.response?.data?.message || 'Failed to update legal document',
        'error'
      );
    },
  });

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      showToast('Title and content are required', 'error');
      return;
    }

    updateMutation.mutate({ title, content });
  };

  const handleTabChange = (tab: LegalTab) => {
    if (hasUnsavedChanges) {
      if (
        !confirm(
          'You have unsaved changes. Are you sure you want to switch tabs? Your changes will be lost.'
        )
      ) {
        return;
      }
    }
    setActiveTab(tab);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal Pages Editor</h1>
          <p className="text-gray-600">
            Manage your Privacy Policy and Terms & Conditions content
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => handleTabChange('privacy-policy')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                activeTab === 'privacy-policy'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy Policy</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('terms-and-conditions')}
              className={`flex-1 px-6 py-4 text-center font-medium transition-all ${
                activeTab === 'terms-and-conditions'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Terms & Conditions</span>
              </div>
            </button>
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          ) : error ? (
            <div className="flex items-start space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error Loading Document</h3>
                <p className="text-red-700">
                  Failed to load the legal document. Please try again later.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Last Updated Info */}
              {document && (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-gray-700">
                      Last updated: <strong>{formatDate(document.updated_at)}</strong>
                    </span>
                  </div>
                  {hasUnsavedChanges && (
                    <span className="text-sm font-medium text-amber-600">Unsaved changes</span>
                  )}
                </div>
              )}

              {/* Title Input */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter page title..."
                />
              </div>

              {/* Content Textarea */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content (HTML supported)
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter HTML content..."
                />
                <p className="mt-2 text-sm text-gray-500">
                  You can use HTML tags to format the content. Changes will be reflected on the
                  public pages immediately after saving.
                </p>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending || !hasUnsavedChanges}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                    updateMutation.isPending || !hasUnsavedChanges
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Save className="h-5 w-5" />
                  <span>{updateMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview Link */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Preview:</strong> View the public{' '}
            {activeTab === 'privacy-policy' ? (
              <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-700">
                Privacy Policy
              </a>
            ) : (
              <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline font-semibold hover:text-blue-700">
                Terms & Conditions
              </a>
            )}{' '}
            page to see your changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UV_AdminLegal;
