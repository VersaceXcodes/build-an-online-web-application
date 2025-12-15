import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { FileText, AlertCircle } from 'lucide-react';

interface LegalDocument {
  slug: string;
  title: string;
  content: string;
}

const fetchTerms = async (): Promise<LegalDocument> => {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/legal/terms`
  );
  return response.data;
};

const UV_Terms: React.FC = () => {
  const {
    data: document,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['legal-terms'],
    queryFn: fetchTerms,
    staleTime: 300000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-cream py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-cream shadow-caramel-lg rounded-2xl p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen gradient-cream py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-cream shadow-caramel-lg rounded-2xl p-8">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h2 className="font-serif text-2xl font-bold text-kake-chocolate-500 mb-2">
                  Content Not Available
                </h2>
                <p className="font-sans text-kake-chocolate-500/80">
                  We're unable to load the terms and conditions at this time. Please check back later or contact us for more information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-cream shadow-caramel-lg rounded-2xl p-8 md:p-12">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-kake-caramel-200">
            <div className="p-3 gradient-caramel rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-serif text-4xl font-bold text-kake-chocolate-500">
              {document.title}
            </h1>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none
              prose-headings:font-serif prose-headings:text-kake-chocolate-500
              prose-p:font-sans prose-p:text-kake-chocolate-500/90 prose-p:leading-relaxed
              prose-a:text-kake-caramel-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-kake-chocolate-500 prose-strong:font-semibold
              prose-ul:font-sans prose-ul:text-kake-chocolate-500/90
              prose-ol:font-sans prose-ol:text-kake-chocolate-500/90
              prose-li:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: document.content }}
          />
        </div>
      </div>
    </div>
  );
};

export default UV_Terms;
