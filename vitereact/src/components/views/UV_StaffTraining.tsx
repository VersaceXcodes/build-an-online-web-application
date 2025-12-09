import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Book, CheckCircle2, Circle, Clock, FileText, Play, ArrowLeft, ArrowRight, BookOpen, Search, AlertCircle, Award, Star } from 'lucide-react';

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

interface CourseProgress {
  progress_id: string;
  user_id: string;
  course_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress_percentage: number;
  started_at: string | null;
  completed_at: string | null;
  last_accessed_at: string | null;
}

// interface LessonCompletion {
//   completion_id: string;
//   user_id: string;
//   lesson_id: string;
//   is_completed: boolean;
//   personal_notes: string | null;
//   completed_at: string | null;
// }

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_StaffTraining: React.FC = () => {
  const { course_id, lesson_id } = useParams<{ course_id?: string; lesson_id?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Global state access - CRITICAL: Individual selectors only
  const currentUser = useAppStore(state => state.authentication_state.current_user);
  const showToast = useAppStore(state => state.show_toast);

  // URL Parameters
  const category_filter = searchParams.get('category') || null;
  const completion_filter = searchParams.get('status') || null;
  const show_required_only = searchParams.get('required_only') === 'true';

  // Local state for lesson notes
  const [personal_notes, setPersonalNotes] = useState('');
  const [notes_saved_indicator, setNotesSavedIndicator] = useState(false);
  const [search_query, setSearchQuery] = useState('');

  // ============================================================================
  // API FUNCTIONS
  // ============================================================================

  const fetchTrainingCourses = async () => {
    const params: any = {
      status: 'published',
      limit: 100,
    };
    if (category_filter) params.category = category_filter;
    if (show_required_only) params.is_required = true;

    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/training/courses`, {
      params,
      headers: {
        Authorization: `Bearer ${currentUser?.user_id}`, // Using simple auth pattern from backend
      },
    });
    return response.data.data || [];
  };

  const fetchCourseDetails = async (courseId: string) => {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/training/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${currentUser?.user_id}`,
      },
    });
    return response.data;
  };

  const fetchCourseProgress = async (courseId: string) => {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/training/courses/${courseId}/progress`, {
      headers: {
        Authorization: `Bearer ${currentUser?.user_id}`,
      },
    });
    return response.data;
  };

  const fetchAllProgress = async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/training/progress`, {
      headers: {
        Authorization: `Bearer ${currentUser?.user_id}`,
      },
    });
    return response.data;
  };

  const markLessonCompleteMutation = async (data: { lesson_id: string; personal_notes: string }) => {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/training/lessons/${data.lesson_id}/complete`,
      { personal_notes: data.personal_notes },
      {
        headers: {
          Authorization: `Bearer ${currentUser?.user_id}`,
        },
      }
    );
    return response.data;
  };

  // ============================================================================
  // REACT QUERY HOOKS
  // ============================================================================

  // Fetch course catalog (only when no course_id slug)
  const { data: courses_catalog = [], isLoading: courses_loading, error: courses_error } = useQuery({
    queryKey: ['training_courses', category_filter, show_required_only],
    queryFn: fetchTrainingCourses,
    enabled: !course_id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch all progress for catalog view
  const { data: all_progress = [] } = useQuery({
    queryKey: ['training_progress'],
    queryFn: fetchAllProgress,
    enabled: !course_id,
    staleTime: 2 * 60 * 1000,
  });

  // Fetch course details (when course_id exists)
  const { data: current_course, isLoading: course_loading, error: course_error } = useQuery({
    queryKey: ['training_course', course_id],
    queryFn: () => fetchCourseDetails(course_id!),
    enabled: !!course_id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch course progress (when course_id exists)
  const { data: course_progress } = useQuery({
    queryKey: ['course_progress', course_id],
    queryFn: () => fetchCourseProgress(course_id!),
    enabled: !!course_id,
    staleTime: 1 * 60 * 1000,
  });

  // Mark lesson complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: markLessonCompleteMutation,
    onSuccess: (data) => {
      // Invalidate queries to refresh progress
      queryClient.invalidateQueries({ queryKey: ['course_progress', course_id] });
      queryClient.invalidateQueries({ queryKey: ['training_progress'] });
      queryClient.invalidateQueries({ queryKey: ['training_course', course_id] });
      
      showToast('success', 'Lesson marked as complete!');
      
      // Check if course is now complete
      if (data.progress_percentage === 100) {
        showToast('success', '🎉 Course completed! Congratulations!', 5000);
      }
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Failed to mark lesson complete');
    },
  });

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  const course_lessons = current_course?.lessons || [];
  const current_lesson = course_lessons.find(l => l.lesson_id === lesson_id) || null;
  
  // Find current lesson index for navigation
  const current_lesson_index = current_lesson 
    ? course_lessons.findIndex(l => l.lesson_id === lesson_id)
    : -1;

  const has_previous_lesson = current_lesson_index > 0;
  const has_next_lesson = current_lesson_index >= 0 && current_lesson_index < course_lessons.length - 1;
  const previous_lesson = has_previous_lesson ? course_lessons[current_lesson_index - 1] : null;
  const next_lesson = has_next_lesson ? course_lessons[current_lesson_index + 1] : null;

  // Get progress for a specific course in catalog
  const getCourseProgressData = useCallback((courseId: string) => {
    return all_progress.find((p: CourseProgress) => p.course_id === courseId) || {
      progress_id: null,
      status: 'not_started',
      progress_percentage: 0,
      started_at: null,
      completed_at: null,
    };
  }, [all_progress]);

  // Filter courses based on search and completion filter
  const filtered_courses = courses_catalog.filter((course: TrainingCourse) => {
    // Search filter
    if (search_query) {
      const query_lower = search_query.toLowerCase();
      const title_match = course.course_title.toLowerCase().includes(query_lower);
      const desc_match = course.short_description.toLowerCase().includes(query_lower);
      if (!title_match && !desc_match) return false;
    }

    // Completion filter
    if (completion_filter) {
      const progress = getCourseProgressData(course.course_id);
      if (progress.status !== completion_filter) return false;
    }

    return true;
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFilterChange = (key: string, value: string | boolean | null) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (value && value !== '') {
      newParams.set(key, String(value));
    } else {
      newParams.delete(key);
    }
    
    setSearchParams(newParams);
  };

  const handleMarkComplete = () => {
    if (!lesson_id) return;

    markCompleteMutation.mutate({
      lesson_id: lesson_id,
      personal_notes: personal_notes,
    });
  };

  const handleNavigateToPrevious = () => {
    if (previous_lesson && course_id) {
      navigate(`/staff/courses/${course_id}/lesson/${previous_lesson.lesson_id}`);
    }
  };

  const handleNavigateToNext = () => {
    if (next_lesson && course_id) {
      navigate(`/staff/courses/${course_id}/lesson/${next_lesson.lesson_id}`);
    }
  };

  // Debounced notes auto-save effect
  useEffect(() => {
    if (!lesson_id || !personal_notes) return;

    const timeout = setTimeout(() => {
      // Show indicator
      setNotesSavedIndicator(true);
      
      // Hide indicator after 2 seconds
      setTimeout(() => setNotesSavedIndicator(false), 2000);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [personal_notes, lesson_id]);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'Duration not set';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      safety: 'bg-red-100 text-red-800',
      customer_service: 'bg-blue-100 text-blue-800',
      baking: 'bg-amber-100 text-amber-800',
      equipment: 'bg-gray-100 text-gray-800',
      management: 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage < 100) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* ================================================================== */}
        {/* CATALOG VIEW - No course selected */}
        {/* ================================================================== */}
        {!course_id && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Training</h1>
                  <p className="text-gray-600">Develop your skills and stay compliant with our training courses</p>
                </div>
                <Link
                  to="/staff/dashboard"
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Back to Dashboard</span>
                </Link>
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search courses..."
                        value={search_query}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <select
                      value={category_filter || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Categories</option>
                      <option value="safety">Safety</option>
                      <option value="customer_service">Customer Service</option>
                      <option value="baking">Baking</option>
                      <option value="equipment">Equipment</option>
                      <option value="management">Management</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <select
                      value={completion_filter || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value || null)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Courses</option>
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Required Only Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="required_only"
                    checked={show_required_only}
                    onChange={(e) => handleFilterChange('required_only', e.target.checked || null)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="required_only" className="text-sm font-medium text-gray-700">
                    Show required courses only
                  </label>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {courses_loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Error State */}
            {courses_error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Failed to load courses</h3>
                  <p className="text-red-700 text-sm">Please refresh the page or contact support if the issue persists.</p>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!courses_loading && !courses_error && filtered_courses.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Courses Grid */}
            {!courses_loading && !courses_error && filtered_courses.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered_courses.map((course: TrainingCourse) => {
                  const progress = getCourseProgressData(course.course_id);
                  const progress_percentage = Number(progress.progress_percentage || 0);

                  return (
                    <Link
                      key={course.course_id}
                      to={`/staff/courses/${course.course_id}`}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 group"
                    >
                      {/* Course Image */}
                      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden">
                        <img
                          src={course.cover_image_url}
                          alt={course.course_title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500';
                          }}
                        />
                        
                        {/* Required Badge */}
                        {course.is_required && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Required
                          </div>
                        )}
                        
                        {/* Completion Badge */}
                        {progress_percentage === 100 && (
                          <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Completed
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="p-6">
                        {/* Category Badge */}
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getCategoryColor(course.category)}`}>
                          {course.category.replace('_', ' ')}
                        </span>

                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {course.course_title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.short_description}
                        </p>

                        {/* Duration */}
                        {course.estimated_duration_minutes && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                            <Clock className="w-4 h-4" />
                            <span>{formatDuration(course.estimated_duration_minutes)}</span>
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-gray-700">
                              {progress_percentage === 0 ? 'Not Started' : `${progress_percentage}% Complete`}
                            </span>
                            {progress_percentage > 0 && progress_percentage < 100 && (
                              <span className="text-xs text-gray-500">In Progress</span>
                            )}
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressColor(progress_percentage)} transition-all duration-300`}
                              style={{ width: `${progress_percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="pt-2">
                          <span className="text-blue-600 font-medium text-sm group-hover:underline">
                            {progress_percentage === 0 ? 'Start Course →' : progress_percentage === 100 ? 'Review Course →' : 'Continue Learning →'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* COURSE DETAIL VIEW - Course selected, no lesson */}
        {/* ================================================================== */}
        {course_id && !lesson_id && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <div className="mb-6">
              <Link
                to="/staff/training"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">Back to Courses</span>
              </Link>
            </div>

            {course_loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {course_error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-red-900 mb-1">Course not found</h3>
                <p className="text-red-700 text-sm">The course you're looking for doesn't exist or has been removed.</p>
              </div>
            )}

            {current_course && (
              <>
                {/* Course Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                  <div className="relative h-64 bg-gradient-to-br from-blue-50 to-indigo-100">
                    <img
                      src={current_course.cover_image_url}
                      alt={current_course.course_title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
                      }}
                    />
                    {current_course.is_required && (
                      <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                        <Star className="w-4 h-4 fill-current" />
                        Required Course
                      </div>
                    )}
                  </div>

                  <div className="p-8">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getCategoryColor(current_course.category)}`}>
                          {current_course.category.replace('_', ' ')}
                        </span>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {current_course.course_title}
                        </h1>
                        {current_course.estimated_duration_minutes && (
                          <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <Clock className="w-5 h-5" />
                            <span>{formatDuration(current_course.estimated_duration_minutes)}</span>
                          </div>
                        )}
                      </div>

                      {course_progress && (
                        <div className="ml-6">
                          <div className="bg-blue-50 rounded-lg p-4 text-center min-w-[120px]">
                            <div className="text-3xl font-bold text-blue-600 mb-1">
                              {Number(course_progress.progress_percentage || 0)}%
                            </div>
                            <div className="text-xs text-gray-600">Complete</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {current_course.long_description && (
                      <p className="text-gray-700 leading-relaxed mb-6">
                        {current_course.long_description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    {course_progress && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Your Progress</span>
                          <span className="text-sm text-gray-500">
                            {course_lessons.filter(() => {
                              // Check completion - this is simplified, in real app would query completion status
                              return false;
                            }).length} of {course_lessons.length} lessons completed
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getProgressColor(Number(course_progress.progress_percentage || 0))} transition-all duration-300`}
                            style={{ width: `${course_progress.progress_percentage || 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {Number(course_progress?.progress_percentage || 0) === 100 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3">
                        <Award className="w-6 h-6 text-green-600" />
                        <div>
                          <h4 className="font-semibold text-green-900">Course Completed!</h4>
                          <p className="text-green-700 text-sm">You've successfully completed all lessons in this course.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Lessons List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Book className="w-6 h-6" />
                    Course Lessons
                  </h2>

                  {course_lessons.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No lessons available yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {course_lessons
                        .sort((a, b) => a.lesson_order - b.lesson_order)
                        .map((lesson) => {
                          // Check if completed (simplified - would need actual query in production)
                          const is_completed = false;

                          return (
                            <Link
                              key={lesson.lesson_id}
                              to={`/staff/courses/${course_id}/lesson/${lesson.lesson_id}`}
                              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                            >
                              {/* Lesson Number */}
                              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                                {lesson.lesson_order}
                              </div>

                              {/* Lesson Info */}
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {lesson.lesson_title}
                                </h4>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs text-gray-500 capitalize flex items-center gap-1">
                                    {lesson.lesson_type === 'video' && <Play className="w-3 h-3" />}
                                    {lesson.lesson_type === 'document' && <FileText className="w-3 h-3" />}
                                    {lesson.lesson_type}
                                  </span>
                                  {lesson.duration_minutes && (
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {lesson.duration_minutes} min
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Completion Status */}
                              <div className="flex-shrink-0">
                                {is_completed ? (
                                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                                ) : (
                                  <Circle className="w-6 h-6 text-gray-300" />
                                )}
                              </div>
                            </Link>
                          );
                        })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* LESSON VIEW - Course and lesson selected */}
        {/* ================================================================== */}
        {course_id && lesson_id && (
          <div className="min-h-screen bg-gray-50">
            {course_loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {course_error && (
              <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="font-semibold text-red-900 mb-1">Lesson not found</h3>
                  <p className="text-red-700 text-sm">The lesson you're looking for doesn't exist.</p>
                </div>
              </div>
            )}

            {current_course && current_lesson && (
              <>
                {/* Sticky Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/staff/courses/${course_id}`}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span className="font-medium">Back to Course</span>
                        </Link>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <div>
                          <p className="text-sm text-gray-500">{current_course.course_title}</p>
                          <p className="text-sm font-semibold text-gray-900">
                            Lesson {current_lesson.lesson_order}: {current_lesson.lesson_title}
                          </p>
                        </div>
                      </div>

                      {/* Progress Indicator */}
                      {course_progress && (
                        <div className="text-sm text-gray-600">
                          Course Progress: <span className="font-semibold text-blue-600">{Number(course_progress.progress_percentage || 0)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lesson Content - Main Column */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* Lesson Header */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-blue-100 text-blue-800 capitalize">
                              {current_lesson.lesson_type}
                            </span>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                              {current_lesson.lesson_title}
                            </h1>
                            {current_lesson.duration_minutes && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{current_lesson.duration_minutes} minutes</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {current_lesson.additional_notes && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-sm text-blue-900">
                              <strong>Note:</strong> {current_lesson.additional_notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Lesson Content */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        {/* Video Content */}
                        {current_lesson.lesson_type === 'video' && current_lesson.content_url && (
                          <div className="aspect-video bg-black">
                            <iframe
                              src={current_lesson.content_url}
                              title={current_lesson.lesson_title}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {/* Document Content */}
                        {current_lesson.lesson_type === 'document' && current_lesson.content_url && (
                          <div className="p-6">
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                              <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">Training Document</h3>
                              <p className="text-gray-600 mb-4">View or download the course materials</p>
                              <a
                                href={current_lesson.content_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                              >
                                Open Document
                              </a>
                            </div>
                          </div>
                        )}

                        {/* Text Content */}
                        {current_lesson.content_text && (
                          <div className="p-6">
                            <div className="prose max-w-none">
                              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {current_lesson.content_text}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* No Content Warning */}
                        {!current_lesson.content_url && !current_lesson.content_text && (
                          <div className="p-6">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <p className="text-yellow-800 text-sm">Content for this lesson is not yet available.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Personal Notes */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Personal Notes</h3>
                          {notes_saved_indicator && (
                            <span className="text-xs text-green-600 flex items-center gap-1 animate-fade-in">
                              <CheckCircle2 className="w-3 h-3" />
                              Saved
                            </span>
                          )}
                        </div>
                        <textarea
                          value={personal_notes}
                          onChange={(e) => setPersonalNotes(e.target.value)}
                          placeholder="Take notes as you learn... Your notes are automatically saved."
                          className="w-full h-40 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Mark Complete */}
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            id="mark_complete"
                            checked={markCompleteMutation.isSuccess}
                            onChange={handleMarkComplete}
                            disabled={markCompleteMutation.isPending}
                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                          />
                          <div className="flex-1">
                            <label htmlFor="mark_complete" className="font-semibold text-gray-900 cursor-pointer">
                              I have completed this lesson
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                              Mark this lesson as complete to update your progress and unlock the next lesson.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex items-center justify-between gap-4">
                        {has_previous_lesson ? (
                          <button
                            onClick={handleNavigateToPrevious}
                            className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Previous Lesson
                          </button>
                        ) : (
                          <div></div>
                        )}

                        {has_next_lesson && (
                          <button
                            onClick={handleNavigateToNext}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ml-auto"
                          >
                            Next Lesson
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}

                        {!has_next_lesson && Number(course_progress?.progress_percentage || 0) === 100 && (
                          <Link
                            to="/staff/training"
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium ml-auto"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            Back to Courses
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Sidebar - Lesson List */}
                    <div className="lg:col-span-1">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Outline</h3>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                          {course_lessons
                            .sort((a, b) => a.lesson_order - b.lesson_order)
                            .map((lesson) => {
                              const is_current = lesson.lesson_id === lesson_id;
                              const is_completed = false; // Simplified

                              return (
                                <Link
                                  key={lesson.lesson_id}
                                  to={`/staff/courses/${course_id}/lesson/${lesson.lesson_id}`}
                                  className={`block p-3 rounded-lg transition-colors ${
                                    is_current
                                      ? 'bg-blue-100 border-2 border-blue-500'
                                      : 'border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                  }`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                      {is_completed ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                      ) : (
                                        <Circle className={`w-5 h-5 ${is_current ? 'text-blue-600' : 'text-gray-300'}`} />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium ${is_current ? 'text-blue-900' : 'text-gray-900'}`}>
                                        {lesson.lesson_order}. {lesson.lesson_title}
                                      </p>
                                      {lesson.duration_minutes && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {lesson.duration_minutes} min
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default UV_StaffTraining;