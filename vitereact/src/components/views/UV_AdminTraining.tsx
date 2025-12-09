import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Search, Plus, Edit2, Trash2, BookOpen, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TrainingCourse {
  course_id: string;
  course_title: string;
  short_description: string;
  long_description: string | null;
  cover_image_url: string;
  category: 'safety' | 'customer_service' | 'baking' | 'equipment' | 'management';
  tags: string | null;
  status: 'draft' | 'published' | 'archived';
  is_required: boolean;
  estimated_duration_minutes: number | null;
  prerequisite_course_ids: string | null;
  created_by_user_id: string;
  lessons?: TrainingLesson[];
  created_at: string;
  updated_at: string;
}

interface TrainingLesson {
  lesson_id: string;
  course_id: string;
  lesson_title: string;
  lesson_type: 'video' | 'document' | 'quiz' | 'interactive';
  content_url: string | null;
  content_text: string | null;
  duration_minutes: number | null;
  additional_notes: string | null;
  lesson_order: number;
  created_at: string;
  updated_at: string;
}

interface StaffCourseProgress {
  progress_id: string;
  user_id: string;
  course_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
  course_title?: string;
}

interface CourseFormData {
  course_title: string;
  short_description: string;
  long_description: string | null;
  cover_image_url: string;
  category: 'safety' | 'customer_service' | 'baking' | 'equipment' | 'management';
  tags: string | null;
  status: 'draft' | 'published' | 'archived';
  is_required: boolean;
  estimated_duration_minutes: number | null;
  prerequisite_course_ids: string | null;
  created_by_user_id: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

async function fetchTrainingCourses(params: {
  query?: string;
  category?: string;
  status?: string;
  is_required?: string;
  token: string;
}) {
  const queryParams = new URLSearchParams();
  if (params.query) queryParams.append('query', params.query);
  if (params.category) queryParams.append('category', params.category);
  if (params.status) queryParams.append('status', params.status);
  if (params.is_required !== undefined && params.is_required !== '') {
    queryParams.append('is_required', params.is_required);
  }
  queryParams.append('limit', '20');
  queryParams.append('offset', '0');

  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/training/courses?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${params.token}`,
      },
    }
  );
  return response.data;
}

async function createTrainingCourse(data: {
  courseData: CourseFormData;
  token: string;
}) {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/training/courses`,
    data.courseData,
    {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    }
  );
  return response.data;
}

async function updateTrainingCourse(data: {
  course_id: string;
  courseData: Partial<CourseFormData>;
  token: string;
}) {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/training/courses/${data.course_id}`,
    data.courseData,
    {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    }
  );
  return response.data;
}

async function fetchStaffProgress(token: string) {
  const response = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/training/progress`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

async function archiveTrainingCourse(data: { course_id: string; token: string }) {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/training/courses/${data.course_id}`,
    { status: 'archived' },
    {
      headers: {
        Authorization: `Bearer ${data.token}`,
      },
    }
  );
  return response.data;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminTraining: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();

  // Global state - INDIVIDUAL SELECTORS ONLY
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const showToast = useAppStore(state => state.show_toast);
  const showConfirmation = useAppStore(state => state.show_confirmation);
  const hideConfirmation = useAppStore(state => state.hide_confirmation);

  // Local state
  const [activeView, setActiveView] = useState<'courses' | 'progress'>('courses');
  const [courseFormModalOpen, setCourseFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedCourse, setSelectedCourse] = useState<TrainingCourse | null>(null);
  
  // Course filters from URL params
  const [courseFilters, setCourseFilters] = useState({
    query: searchParams.get('query') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    is_required: searchParams.get('is_required') || '',
  });

  // Course form data
  const [courseFormData, setCourseFormData] = useState<CourseFormData>({
    course_title: '',
    short_description: '',
    long_description: null,
    cover_image_url: '',
    category: 'safety',
    tags: null,
    status: 'draft',
    is_required: false,
    estimated_duration_minutes: null,
    prerequisite_course_ids: null,
    created_by_user_id: '',
  });

  // Form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Sync URL params with local state
  useEffect(() => {
    setCourseFilters({
      query: searchParams.get('query') || '',
      category: searchParams.get('category') || '',
      status: searchParams.get('status') || '',
      is_required: searchParams.get('is_required') || '',
    });
  }, [searchParams]);

  // ============================================================================
  // REACT QUERY HOOKS
  // ============================================================================

  // Fetch courses
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ['training-courses', courseFilters, authToken],
    queryFn: () =>
      fetchTrainingCourses({
        query: courseFilters.query || undefined,
        category: courseFilters.category || undefined,
        status: courseFilters.status || undefined,
        is_required: courseFilters.is_required || undefined,
        token: authToken!,
      }),
    enabled: !!authToken && activeView === 'courses',
    staleTime: 60000,
  });

  // Fetch staff progress
  const {
    data: staffProgressData,
    isLoading: progressLoading,
    error: progressError,
  } = useQuery({
    queryKey: ['staff-progress', authToken],
    queryFn: () => fetchStaffProgress(authToken!),
    enabled: !!authToken && activeView === 'progress',
    staleTime: 30000,
  });

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: createTrainingCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-courses'] });
      showToast('success', 'Course created successfully');
      setCourseFormModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to create course');
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: updateTrainingCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-courses'] });
      showToast('success', 'Course updated successfully');
      setCourseFormModalOpen(false);
      setSelectedCourse(null);
      resetForm();
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to update course');
    },
  });

  // Archive course mutation
  const archiveCourseMutation = useMutation({
    mutationFn: archiveTrainingCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-courses'] });
      showToast('success', 'Course archived successfully');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to archive course');
    },
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...courseFilters, [key]: value };
    setCourseFilters(newFilters);

    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleCreateCourse = () => {
    setFormMode('create');
    resetForm();
    setCourseFormModalOpen(true);
  };

  const handleEditCourse = (course: TrainingCourse) => {
    setFormMode('edit');
    setSelectedCourse(course);
    setCourseFormData({
      course_title: course.course_title,
      short_description: course.short_description,
      long_description: course.long_description,
      cover_image_url: course.cover_image_url,
      category: course.category,
      tags: course.tags,
      status: course.status,
      is_required: course.is_required,
      estimated_duration_minutes: course.estimated_duration_minutes,
      prerequisite_course_ids: course.prerequisite_course_ids,
      created_by_user_id: course.created_by_user_id,
    });
    setCourseFormModalOpen(true);
  };

  const handleDeleteCourse = (course: TrainingCourse) => {
    showConfirmation({
      title: 'Archive Course',
      message: `Are you sure you want to archive "${course.course_title}"? This will hide it from staff but preserve progress data.`,
      confirm_text: 'Archive',
      cancel_text: 'Cancel',
      danger_action: true,
      on_confirm: () => {
        archiveCourseMutation.mutate({
          course_id: course.course_id,
          token: authToken!,
        });
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      },
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!courseFormData.course_title.trim()) {
      errors.course_title = 'Course title is required';
    }
    if (!courseFormData.short_description.trim()) {
      errors.short_description = 'Short description is required';
    }
    if (!courseFormData.cover_image_url.trim()) {
      errors.cover_image_url = 'Cover image URL is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('error', 'Please fix form errors');
      return;
    }

    if (formMode === 'create') {
      createCourseMutation.mutate({
        courseData: {
          ...courseFormData,
          created_by_user_id: currentUser!.user_id,
        },
        token: authToken!,
      });
    } else if (formMode === 'edit' && selectedCourse) {
      updateCourseMutation.mutate({
        course_id: selectedCourse.course_id,
        courseData: courseFormData,
        token: authToken!,
      });
    }
  };

  const resetForm = () => {
    setCourseFormData({
      course_title: '',
      short_description: '',
      long_description: null,
      cover_image_url: '',
      category: 'safety',
      tags: null,
      status: 'draft',
      is_required: false,
      estimated_duration_minutes: null,
      prerequisite_course_ids: null,
      created_by_user_id: '',
    });
    setFormErrors({});
    setSelectedCourse(null);
  };

  const closeModal = () => {
    setCourseFormModalOpen(false);
    resetForm();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const courses = coursesData?.data || [];
  const totalCourses = coursesData?.total || 0;
  const staffProgress = staffProgressData || [];

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-red-100 text-red-700',
  };

  const categoryLabels: Record<string, string> = {
    safety: 'Safety',
    customer_service: 'Customer Service',
    baking: 'Baking',
    equipment: 'Equipment',
    management: 'Management',
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Training Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage staff training courses and track progress
                </p>
              </div>
              <button
                onClick={handleCreateCourse}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Course
              </button>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveView('courses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'courses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="w-4 h-4 inline-block mr-2" />
                Courses ({totalCourses})
              </button>
              <button
                onClick={() => setActiveView('progress')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeView === 'progress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="w-4 h-4 inline-block mr-2" />
                Staff Progress
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeView === 'courses' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search courses..."
                      value={courseFilters.query}
                      onChange={(e) => handleFilterChange('query', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={courseFilters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="">All Categories</option>
                    <option value="safety">Safety</option>
                    <option value="customer_service">Customer Service</option>
                    <option value="baking">Baking</option>
                    <option value="equipment">Equipment</option>
                    <option value="management">Management</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={courseFilters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>

                  {/* Required Filter */}
                  <select
                    value={courseFilters.is_required}
                    onChange={(e) => handleFilterChange('is_required', e.target.value)}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="">All Courses</option>
                    <option value="true">Required Only</option>
                    <option value="false">Optional Only</option>
                  </select>
                </div>
              </div>

              {/* Courses List */}
              {coursesLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                </div>
              ) : coursesError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <p className="text-red-700">Failed to load courses. Please try again.</p>
                </div>
              ) : courses.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
                  <p className="text-gray-600 mb-6">
                    {courseFilters.query || courseFilters.category || courseFilters.status
                      ? 'Try adjusting your filters'
                      : 'Create your first training course to get started'}
                  </p>
                  <button
                    onClick={handleCreateCourse}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create First Course
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Duration
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Lessons
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Required
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {courses.map((course: TrainingCourse) => (
                          <tr key={course.course_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <img
                                  src={course.cover_image_url}
                                  alt={course.course_title}
                                  className="w-12 h-12 rounded-lg object-cover mr-4"
                                />
                                <div>
                                  <div className="text-sm font-semibold text-gray-900">
                                    {course.course_title}
                                  </div>
                                  <div className="text-sm text-gray-600 line-clamp-1">
                                    {course.short_description}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-700">
                                {categoryLabels[course.category]}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  statusColors[course.status]
                                }`}
                              >
                                {course.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {course.estimated_duration_minutes ? (
                                <span className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {course.estimated_duration_minutes} min
                                </span>
                              ) : (
                                <span className="text-gray-400">Not set</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {course.lessons ? course.lessons.length : 0} lessons
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {course.is_required ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <XCircle className="w-5 h-5 text-gray-400" />
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => handleEditCourse(course)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit course"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(course)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Archive course"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {activeView === 'progress' && (
            <>
              {progressLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                </div>
              ) : progressError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <p className="text-red-700">Failed to load progress data. Please try again.</p>
                </div>
              ) : staffProgress.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No progress data</h3>
                  <p className="text-gray-600">No staff members have started any courses yet.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Staff Member
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Course
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Progress
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Last Accessed
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {staffProgress.map((progress: StaffCourseProgress) => (
                          <tr key={progress.progress_id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {progress.user_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {progress.course_title || progress.course_id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  progress.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : progress.status === 'in_progress'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {progress.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      progress.status === 'completed'
                                        ? 'bg-green-600'
                                        : 'bg-blue-600'
                                    }`}
                                    style={{
                                      width: `${Number(progress.progress_percentage || 0)}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                                  {Number(progress.progress_percentage || 0).toFixed(0)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {progress.last_accessed_at
                                ? new Date(progress.last_accessed_at).toLocaleDateString()
                                : 'Never'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Course Form Modal */}
      {courseFormModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {formMode === 'create' ? 'Create Course' : 'Edit Course'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
              {/* Course Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={courseFormData.course_title}
                  onChange={(e) => {
                    setCourseFormData({ ...courseFormData, course_title: e.target.value });
                    if (formErrors.course_title) {
                      setFormErrors({ ...formErrors, course_title: '' });
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${
                    formErrors.course_title
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  }`}
                  placeholder="e.g., Food Safety Level 2"
                />
                {formErrors.course_title && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.course_title}</p>
                )}
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Short Description *
                </label>
                <textarea
                  value={courseFormData.short_description}
                  onChange={(e) => {
                    setCourseFormData({ ...courseFormData, short_description: e.target.value });
                    if (formErrors.short_description) {
                      setFormErrors({ ...formErrors, short_description: '' });
                    }
                  }}
                  rows={2}
                  className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${
                    formErrors.short_description
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  }`}
                  placeholder="Brief overview of the course content"
                />
                {formErrors.short_description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.short_description}</p>
                )}
              </div>

              {/* Long Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Long Description
                </label>
                <textarea
                  value={courseFormData.long_description || ''}
                  onChange={(e) =>
                    setCourseFormData({
                      ...courseFormData,
                      long_description: e.target.value || null,
                    })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="Detailed course description and learning objectives"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cover Image URL *
                </label>
                <input
                  type="url"
                  value={courseFormData.cover_image_url}
                  onChange={(e) => {
                    setCourseFormData({ ...courseFormData, cover_image_url: e.target.value });
                    if (formErrors.cover_image_url) {
                      setFormErrors({ ...formErrors, cover_image_url: '' });
                    }
                  }}
                  className={`w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${
                    formErrors.cover_image_url
                      ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                      : 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {formErrors.cover_image_url && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.cover_image_url}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={courseFormData.category}
                  onChange={(e) =>
                    setCourseFormData({
                      ...courseFormData,
                      category: e.target.value as CourseFormData['category'],
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="safety">Safety</option>
                  <option value="customer_service">Customer Service</option>
                  <option value="baking">Baking</option>
                  <option value="equipment">Equipment</option>
                  <option value="management">Management</option>
                </select>
              </div>

              {/* Status and Required Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={courseFormData.status}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        status: e.target.value as CourseFormData['status'],
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={courseFormData.estimated_duration_minutes || ''}
                    onChange={(e) =>
                      setCourseFormData({
                        ...courseFormData,
                        estimated_duration_minutes: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                    placeholder="60"
                  />
                </div>
              </div>

              {/* Is Required Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_required"
                  checked={courseFormData.is_required}
                  onChange={(e) =>
                    setCourseFormData({ ...courseFormData, is_required: e.target.checked })
                  }
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_required" className="ml-3 text-sm font-medium text-gray-700">
                  Mark as required course for all staff
                </label>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={courseFormData.tags || ''}
                  onChange={(e) =>
                    setCourseFormData({ ...courseFormData, tags: e.target.value || null })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                  placeholder="e.g., hygiene, compliance, certification"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCourseMutation.isPending || updateCourseMutation.isPending}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {createCourseMutation.isPending || updateCourseMutation.isPending ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      {formMode === 'create' ? 'Creating...' : 'Updating...'}
                    </span>
                  ) : formMode === 'create' ? (
                    'Create Course'
                  ) : (
                    'Update Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UV_AdminTraining;