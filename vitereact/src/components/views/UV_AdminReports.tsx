import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Clock,
  FileJson,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Users,
  Package,
  MessageSquare,
  GraduationCap,
  AlertTriangle,
  ChevronDown,
  Plus,
  Settings
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Location {
  location_id: string;
  location_name: string;
  address_line1: string;
  city: string;
  is_collection_enabled: boolean;
  is_delivery_enabled: boolean;
}

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  estimated_duration: string;
}

// interface ScheduledReport {
//   id: string;
//   report_type: string;
//   frequency: string;
//   next_run: string;
//   last_run: string;
//   email_recipients: string[];
// }

interface ReportData {
  [key: string]: any;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminReports: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // ========================================================================
  // ZUSTAND STORE ACCESS (Individual selectors - CRITICAL!)
  // ========================================================================
  
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);
  const showLoading = useAppStore(state => state.show_loading);
  const hideLoading = useAppStore(state => state.hide_loading);
  const globalLocations = useAppStore(state => state.location_state.available_locations);

  // ========================================================================
  // LOCAL STATE
  // ========================================================================
  
  const [selectedReportType, setSelectedReportType] = useState<string>(
    searchParams.get('report_type') || 'daily_sales'
  );
  const [dateRangeStart, setDateRangeStart] = useState<string>(
    searchParams.get('date_from') || ''
  );
  const [dateRangeEnd, setDateRangeEnd] = useState<string>(
    searchParams.get('date_to') || ''
  );
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>(
    searchParams.get('location') || 'all'
  );
  const [selectedFormat, setSelectedFormat] = useState<string>(
    searchParams.get('format') || 'json'
  );
  const [generatedReportData, setGeneratedReportData] = useState<ReportData | null>(null);
  const [generatedReportUrl, setGeneratedReportUrl] = useState<string | null>(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'generate' | 'scheduled'>('generate');

  // Available report types configuration
  const availableReportTypes: ReportType[] = [
    {
      id: 'daily_sales',
      name: 'Daily Sales',
      description: 'Comprehensive daily sales summary with order counts, revenue, and trends',
      icon: <BarChart3 className="w-5 h-5" />,
      estimated_duration: '~5 seconds'
    },
    {
      id: 'weekly_performance',
      name: 'Weekly Performance',
      description: 'Week-over-week performance metrics and comparisons',
      icon: <TrendingUp className="w-5 h-5" />,
      estimated_duration: '~10 seconds'
    },
    {
      id: 'monthly_summary',
      name: 'Monthly Summary',
      description: 'Complete monthly business summary with detailed breakdowns',
      icon: <Calendar className="w-5 h-5" />,
      estimated_duration: '~15 seconds'
    },
    {
      id: 'product_performance',
      name: 'Product Performance',
      description: 'Best sellers, revenue by product, and inventory insights',
      icon: <Package className="w-5 h-5" />,
      estimated_duration: '~10 seconds'
    },
    {
      id: 'feedback_summary',
      name: 'Feedback Summary',
      description: 'Customer satisfaction ratings and feedback analysis',
      icon: <MessageSquare className="w-5 h-5" />,
      estimated_duration: '~8 seconds'
    },
    {
      id: 'training_progress',
      name: 'Training Progress',
      description: 'Staff training completion rates and compliance metrics',
      icon: <GraduationCap className="w-5 h-5" />,
      estimated_duration: '~7 seconds'
    },
    {
      id: 'inventory_alerts',
      name: 'Inventory Alerts',
      description: 'Summary of inventory issues and resolution times',
      icon: <AlertTriangle className="w-5 h-5" />,
      estimated_duration: '~5 seconds'
    }
  ];

  // ========================================================================
  // API INTEGRATION - FETCH LOCATIONS
  // ========================================================================
  
  const { data: availableLocations, isLoading: locationsLoading } = useQuery<Location[]>({
    queryKey: ['locations'],
    queryFn: async () => {
      // Check if we have locations in global state first
      if (globalLocations && globalLocations.length > 0) {
        return globalLocations;
      }
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/locations`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        }
      );
      return response.data.map((location: any) => ({
        location_id: location.location_id,
        location_name: location.location_name,
        address_line1: location.address_line1,
        city: location.city,
        is_collection_enabled: location.is_collection_enabled,
        is_delivery_enabled: location.is_delivery_enabled
      }));
    },
    staleTime: 60000,
    enabled: !!authToken
  });

  // ========================================================================
  // GENERATE REPORT FUNCTION
  // ========================================================================
  
  const generateReport = async () => {
    // Validation
    if (!dateRangeStart || !dateRangeEnd) {
      showToast('error', 'Please select both start and end dates');
      return;
    }

    if (new Date(dateRangeStart) > new Date(dateRangeEnd)) {
      showToast('error', 'Start date must be before end date');
      return;
    }

    setIsGeneratingReport(true);
    setGenerationError(null);
    setGeneratedReportData(null);
    setGeneratedReportUrl(null);
    
    showLoading('Generating report...');

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/analytics/reports`,
        {
          params: {
            report_type: selectedReportType,
            date_from: dateRangeStart,
            date_to: dateRangeEnd,
            location: selectedLocationFilter !== 'all' ? selectedLocationFilter : undefined,
            format: selectedFormat
          },
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          responseType: selectedFormat === 'json' ? 'json' : 'blob'
        }
      );

      if (selectedFormat === 'json') {
        // Display JSON data in preview
        setGeneratedReportData(response.data);
        showToast('success', 'Report generated successfully');
      } else {
        // Handle file download for PDF/CSV
        const blob = new Blob([response.data], {
          type: selectedFormat === 'pdf' ? 'application/pdf' : 'text/csv'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedReportType}_${dateRangeStart}_${dateRangeEnd}.${selectedFormat}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showToast('success', 'Report downloaded successfully');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate report';
      setGenerationError(errorMessage);
      showToast('error', errorMessage);
      console.error('Report generation error:', error);
    } finally {
      setIsGeneratingReport(false);
      hideLoading();
    }
  };

  // ========================================================================
  // UPDATE URL PARAMETERS
  // ========================================================================
  
  const updateUrlParams = () => {
    const params: Record<string, string> = {};
    
    if (selectedReportType) params.report_type = selectedReportType;
    if (dateRangeStart) params.date_from = dateRangeStart;
    if (dateRangeEnd) params.date_to = dateRangeEnd;
    if (selectedLocationFilter !== 'all') params.location = selectedLocationFilter;
    if (selectedFormat !== 'json') params.format = selectedFormat;
    
    setSearchParams(params);
  };

  // Update URL when parameters change
  useEffect(() => {
    updateUrlParams();
  }, [selectedReportType, dateRangeStart, dateRangeEnd, selectedLocationFilter, selectedFormat]);

  // ========================================================================
  // QUICK DATE RANGE PRESET HANDLERS
  // ========================================================================
  
  const setDateRangePreset = (preset: string) => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (preset) {
      case 'today':
        startDate = today;
        endDate = today;
        break;
      case 'yesterday':
        startDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        endDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'last_7_days':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      case 'last_30_days':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      case 'this_month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case 'last_month': {
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        startDate = lastMonth;
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      }
    }

    setDateRangeStart(startDate.toISOString().split('T')[0]);
    setDateRangeEnd(endDate.toISOString().split('T')[0]);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Admin Sidebar Navigation */}
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
              <p className="text-sm text-gray-600 mt-1">Reports & Analytics</p>
            </div>
            
            <nav className="px-4 space-y-2">
              <Link
                to="/admin/dashboard"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              
              <Link
                to="/admin/orders"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Orders</span>
              </Link>
              
              <Link
                to="/admin/products"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Package className="w-5 h-5" />
                <span className="font-medium">Products</span>
              </Link>
              
              <Link
                to="/admin/users"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Users</span>
              </Link>
              
              <div className="pt-2 font-medium text-xs text-gray-500 uppercase tracking-wider px-4">
                Reports
              </div>
              
              <Link
                to="/admin/reports"
                className="flex items-center space-x-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg transition-colors"
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Generate Reports</span>
              </Link>
              
              <Link
                to="/admin/settings"
                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Business Reports</h1>
              <p className="text-gray-600 mt-2">
                Generate comprehensive business reports with customizable parameters and export options
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'generate'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Generate Reports
                </button>
                <button
                  onClick={() => setActiveTab('scheduled')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'scheduled'
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Scheduled Reports
                </button>
              </nav>
            </div>

            {/* Generate Reports Tab */}
            {activeTab === 'generate' && (
              <div className="space-y-6">
                {/* Report Type Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <span>Select Report Type</span>
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableReportTypes.map((reportType) => (
                      <button
                        key={reportType.id}
                        onClick={() => {
                          setSelectedReportType(reportType.id);
                          setGeneratedReportData(null);
                          setGeneratedReportUrl(null);
                          setGenerationError(null);
                        }}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedReportType === reportType.id
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className={`p-2 rounded-lg ${
                            selectedReportType === reportType.id
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {reportType.icon}
                          </div>
                          {selectedReportType === reportType.id && (
                            <div className="w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">{reportType.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{reportType.description}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{reportType.estimated_duration}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Report Configuration */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-purple-600" />
                    <span>Configure Report Parameters</span>
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date Range */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date Range
                        </label>
                        <div className="flex space-x-2 mb-3">
                          <button
                            onClick={() => setDateRangePreset('today')}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Today
                          </button>
                          <button
                            onClick={() => setDateRangePreset('yesterday')}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Yesterday
                          </button>
                          <button
                            onClick={() => setDateRangePreset('last_7_days')}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Last 7 Days
                          </button>
                          <button
                            onClick={() => setDateRangePreset('this_month')}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            This Month
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={dateRangeStart}
                              onChange={(e) => {
                                setDateRangeStart(e.target.value);
                                setGenerationError(null);
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">End Date</label>
                            <input
                              type="date"
                              value={dateRangeEnd}
                              onChange={(e) => {
                                setDateRangeEnd(e.target.value);
                                setGenerationError(null);
                              }}
                              className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location Filter
                        </label>
                        <div className="relative">
                          <select
                            value={selectedLocationFilter}
                            onChange={(e) => {
                              setSelectedLocationFilter(e.target.value);
                              setGenerationError(null);
                            }}
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-100 appearance-none transition-all"
                            disabled={locationsLoading}
                          >
                            <option value="all">All Locations</option>
                            {availableLocations?.map((location) => (
                              <option key={location.location_id} value={location.location_name}>
                                {location.location_name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        {locationsLoading && (
                          <p className="text-xs text-gray-500 mt-1">Loading locations...</p>
                        )}
                      </div>
                    </div>

                    {/* Export Format */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Export Format
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name="format"
                              value="json"
                              checked={selectedFormat === 'json'}
                              onChange={(e) => setSelectedFormat(e.target.value)}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                            />
                            <div className="ml-3 flex items-center space-x-3">
                              <FileJson className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">JSON Preview</p>
                                <p className="text-xs text-gray-500">View report data in-page</p>
                              </div>
                            </div>
                          </label>
                          
                          <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name="format"
                              value="csv"
                              checked={selectedFormat === 'csv'}
                              onChange={(e) => setSelectedFormat(e.target.value)}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                            />
                            <div className="ml-3 flex items-center space-x-3">
                              <FileSpreadsheet className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">CSV Export</p>
                                <p className="text-xs text-gray-500">Download spreadsheet file</p>
                              </div>
                            </div>
                          </label>
                          
                          <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name="format"
                              value="pdf"
                              checked={selectedFormat === 'pdf'}
                              onChange={(e) => setSelectedFormat(e.target.value)}
                              className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                            />
                            <div className="ml-3 flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium text-gray-900">PDF Export</p>
                                <p className="text-xs text-gray-500">Download formatted document</p>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Selected Report Info */}
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-purple-900 mb-2">Selected Report</h3>
                        <p className="text-sm text-purple-700">
                          {availableReportTypes.find(r => r.id === selectedReportType)?.name || 'Daily Sales'}
                        </p>
                        {dateRangeStart && dateRangeEnd && (
                          <p className="text-xs text-purple-600 mt-1">
                            {new Date(dateRangeStart).toLocaleDateString()} - {new Date(dateRangeEnd).toLocaleDateString()}
                          </p>
                        )}
                        {selectedLocationFilter !== 'all' && (
                          <p className="text-xs text-purple-600 mt-1">
                            Location: {selectedLocationFilter}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {generationError && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-700">{generationError}</p>
                    </div>
                  )}

                  {/* Generate Button */}
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setGeneratedReportData(null);
                        setGeneratedReportUrl(null);
                        setGenerationError(null);
                        setDateRangeStart('');
                        setDateRangeEnd('');
                        setSelectedLocationFilter('all');
                        setSelectedFormat('json');
                        setSelectedReportType('daily_sales');
                      }}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
                    >
                      Clear Filters
                    </button>
                    
                    <button
                      onClick={generateReport}
                      disabled={isGeneratingReport || !dateRangeStart || !dateRangeEnd}
                      className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                    >
                      {isGeneratingReport ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Generate Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Report Preview/Download Area */}
                {generatedReportData && selectedFormat === 'json' && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        <span>Report Preview</span>
                      </h2>
                      
                      <button
                        onClick={() => {
                          // Copy JSON to clipboard
                          navigator.clipboard.writeText(JSON.stringify(generatedReportData, null, 2));
                          showToast('success', 'Report data copied to clipboard');
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Copy JSON
                      </button>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                      <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                        {JSON.stringify(generatedReportData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Success Message for File Downloads */}
                {selectedFormat !== 'json' && generatedReportUrl === null && !isGeneratingReport && !generationError && dateRangeStart && dateRangeEnd && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Ready to Generate
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Click "Generate Report" to create and download your {selectedFormat.toUpperCase()} file
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Scheduled Reports Tab */}
            {activeTab === 'scheduled' && (
              <div className="space-y-6">
                {/* Missing Endpoint Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-yellow-900 mb-1">
                        Feature In Development
                      </h3>
                      <p className="text-sm text-yellow-700 mb-3">
                        Scheduled reports functionality requires the following backend endpoints to be implemented:
                      </p>
                      <ul className="text-xs text-yellow-600 space-y-1 list-disc list-inside">
                        <li><code className="bg-yellow-100 px-1 py-0.5 rounded">GET /api/reports/scheduled</code> - Fetch scheduled reports</li>
                        <li><code className="bg-yellow-100 px-1 py-0.5 rounded">POST /api/reports/scheduled</code> - Create scheduled report</li>
                        <li><code className="bg-yellow-100 px-1 py-0.5 rounded">PUT /api/reports/scheduled/:id</code> - Update scheduled report</li>
                        <li><code className="bg-yellow-100 px-1 py-0.5 rounded">DELETE /api/reports/scheduled/:id</code> - Delete scheduled report</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Placeholder UI for Scheduled Reports */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>Scheduled Reports</span>
                    </h2>
                    
                    <button
                      disabled
                      className="px-4 py-2 bg-purple-200 text-purple-400 font-medium rounded-lg cursor-not-allowed flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Schedule New Report</span>
                    </button>
                  </div>

                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Scheduled Reports Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Scheduled reports will appear here once the feature is enabled
                    </p>
                    <p className="text-sm text-gray-500">
                      This feature requires backend API implementation
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default UV_AdminReports;