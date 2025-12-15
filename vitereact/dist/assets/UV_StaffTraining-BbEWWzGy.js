import { g as useParams, l as useSearchParams, h as useNavigate, n as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, L as Link, a0 as ArrowLeft, a3 as Search, d as CircleAlert, a7 as BookOpen, O as Star, A as Award, C as Clock, a8 as Book, F as FileText, a9 as Play, y as CircleCheck, aa as Circle, K as ArrowRight, b as axios } from "./index-1l1MB-L0.js";
import { u as useMutation } from "./useMutation-9MRSSmm2.js";
const UV_StaffTraining = () => {
  const { course_id, lesson_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const category_filter = searchParams.get("category") || null;
  const completion_filter = searchParams.get("status") || null;
  const show_required_only = searchParams.get("required_only") === "true";
  const [personal_notes, setPersonalNotes] = reactExports.useState("");
  const [notes_saved_indicator, setNotesSavedIndicator] = reactExports.useState(false);
  const [search_query, setSearchQuery] = reactExports.useState("");
  const fetchTrainingCourses = async () => {
    const params = {
      status: "published",
      limit: 100
    };
    if (category_filter) params.category = category_filter;
    if (show_required_only) params.is_required = true;
    const response = await axios.get(`${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/courses`, {
      params,
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data.data || [];
  };
  const fetchCourseDetails = async (courseId) => {
    const response = await axios.get(`${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data;
  };
  const fetchCourseProgress = async (courseId) => {
    const response = await axios.get(`${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/courses/${courseId}/progress`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data;
  };
  const fetchLessonCompletions = async (courseId) => {
    const response = await axios.get(`${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/courses/${courseId}/lessons/completions`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data;
  };
  const fetchAllProgress = async () => {
    const response = await axios.get(`${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/progress`, {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    return response.data;
  };
  const markLessonCompleteMutation = async (data) => {
    const response = await axios.post(
      `${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/lessons/${data.lesson_id}/complete`,
      { personal_notes: data.personal_notes },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    return response.data;
  };
  const { data: courses_catalog = [], isLoading: courses_loading, error: courses_error } = useQuery({
    queryKey: ["training_courses", category_filter, show_required_only],
    queryFn: fetchTrainingCourses,
    enabled: !course_id,
    staleTime: 5 * 60 * 1e3
  });
  const { data: all_progress = [] } = useQuery({
    queryKey: ["training_progress"],
    queryFn: fetchAllProgress,
    enabled: !course_id,
    staleTime: 2 * 60 * 1e3
  });
  const { data: current_course, isLoading: course_loading, error: course_error } = useQuery({
    queryKey: ["training_course", course_id],
    queryFn: () => fetchCourseDetails(course_id),
    enabled: !!course_id,
    staleTime: 5 * 60 * 1e3
  });
  const { data: course_progress } = useQuery({
    queryKey: ["course_progress", course_id],
    queryFn: () => fetchCourseProgress(course_id),
    enabled: !!course_id,
    staleTime: 1 * 60 * 1e3
  });
  const { data: lesson_completions = [] } = useQuery({
    queryKey: ["lesson_completions", course_id],
    queryFn: () => fetchLessonCompletions(course_id),
    enabled: !!course_id,
    staleTime: 1 * 60 * 1e3
  });
  const markCompleteMutation = useMutation({
    mutationFn: markLessonCompleteMutation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["course_progress", course_id] });
      queryClient.invalidateQueries({ queryKey: ["lesson_completions", course_id] });
      queryClient.invalidateQueries({ queryKey: ["training_progress"] });
      queryClient.invalidateQueries({ queryKey: ["training_course", course_id] });
      showToast("success", "Lesson marked as complete!");
      if (data.progress_percentage === 100) {
        showToast("success", "🎉 Course completed! Congratulations!", 5e3);
      }
    },
    onError: (error) => {
      var _a, _b;
      showToast("error", ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) || "Failed to mark lesson complete");
    }
  });
  const course_lessons = (current_course == null ? void 0 : current_course.lessons) || [];
  const current_lesson = course_lessons.find((l) => l.lesson_id === lesson_id) || null;
  const current_lesson_index = current_lesson ? course_lessons.findIndex((l) => l.lesson_id === lesson_id) : -1;
  const has_previous_lesson = current_lesson_index > 0;
  const has_next_lesson = current_lesson_index >= 0 && current_lesson_index < course_lessons.length - 1;
  const previous_lesson = has_previous_lesson ? course_lessons[current_lesson_index - 1] : null;
  const next_lesson = has_next_lesson ? course_lessons[current_lesson_index + 1] : null;
  const getCourseProgressData = reactExports.useCallback((courseId) => {
    return all_progress.find((p) => p.course_id === courseId) || {
      progress_id: null,
      status: "not_started",
      progress_percentage: 0,
      started_at: null,
      completed_at: null
    };
  }, [all_progress]);
  const isLessonCompleted = reactExports.useCallback((lessonId) => {
    return lesson_completions.some((lc) => lc.lesson_id === lessonId && lc.is_completed);
  }, [lesson_completions]);
  const completed_lessons_count = lesson_completions.filter((lc) => lc.is_completed).length;
  const filtered_courses = courses_catalog.filter((course) => {
    if (search_query) {
      const query_lower = search_query.toLowerCase();
      const title_match = course.course_title.toLowerCase().includes(query_lower);
      const desc_match = course.short_description.toLowerCase().includes(query_lower);
      if (!title_match && !desc_match) return false;
    }
    if (completion_filter) {
      const progress = getCourseProgressData(course.course_id);
      if (progress.status !== completion_filter) return false;
    }
    return true;
  });
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== "") {
      newParams.set(key, String(value));
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };
  const handleMarkComplete = () => {
    if (!lesson_id) return;
    markCompleteMutation.mutate({
      lesson_id,
      personal_notes
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
  reactExports.useEffect(() => {
    if (!lesson_id || !personal_notes) return;
    const timeout = setTimeout(() => {
      setNotesSavedIndicator(true);
      setTimeout(() => setNotesSavedIndicator(false), 2e3);
    }, 2e3);
    return () => clearTimeout(timeout);
  }, [personal_notes, lesson_id]);
  const formatDuration = (minutes) => {
    if (!minutes) return "Duration not set";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };
  const getCategoryColor = (category) => {
    const colors = {
      safety: "bg-red-100 text-red-800",
      customer_service: "bg-blue-100 text-blue-800",
      baking: "bg-amber-100 text-amber-800",
      equipment: "bg-gray-100 text-gray-800",
      management: "bg-purple-100 text-purple-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };
  const getProgressColor = (percentage) => {
    if (percentage === 0) return "bg-gray-200";
    if (percentage < 100) return "bg-blue-500";
    return "bg-green-500";
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
    !course_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "Staff Training" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Develop your skills and stay compliant with our training courses" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: "/staff/dashboard",
              className: "flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Back to Dashboard" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Search courses...",
                  value: search_query,
                  onChange: (e) => setSearchQuery(e.target.value),
                  className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }
              )
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: category_filter || "",
                onChange: (e) => handleFilterChange("category", e.target.value || null),
                className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Categories" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "safety", children: "Safety" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "customer_service", children: "Customer Service" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "baking", children: "Baking" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "equipment", children: "Equipment" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "management", children: "Management" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: completion_filter || "",
                onChange: (e) => handleFilterChange("status", e.target.value || null),
                className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Courses" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "not_started", children: "Not Started" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "in_progress", children: "In Progress" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "completed", children: "Completed" })
                ]
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                id: "required_only",
                checked: show_required_only,
                onChange: (e) => handleFilterChange("required_only", e.target.checked || null),
                className: "w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "required_only", className: "text-sm font-medium text-gray-700", children: "Show required courses only" })
          ] })
        ] })
      ] }),
      courses_loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }),
      courses_error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-red-900 mb-1", children: "Failed to load courses" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: "Please refresh the page or contact support if the issue persists." })
        ] })
      ] }),
      !courses_loading && !courses_error && filtered_courses.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-semibold text-gray-900 mb-2", children: "No courses found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "Try adjusting your filters or search query" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              setSearchQuery("");
              setSearchParams({});
            },
            className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors",
            children: "Clear Filters"
          }
        )
      ] }),
      !courses_loading && !courses_error && filtered_courses.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filtered_courses.map((course) => {
        const progress = getCourseProgressData(course.course_id);
        const progress_percentage = Number(progress.progress_percentage || 0);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: `/staff/courses/${course.course_id}`,
            className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg hover:border-blue-300 transition-all duration-200 group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: course.cover_image_url,
                    alt: course.course_title,
                    className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-200",
                    onError: (e) => {
                      e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500";
                    }
                  }
                ),
                course.is_required && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3 h-3 fill-current" }),
                  "Required"
                ] }),
                progress_percentage === 100 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-3 h-3" }),
                  "Completed"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getCategoryColor(course.category)}`, children: course.category.replace("_", " ") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors", children: course.course_title }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 text-sm mb-4 line-clamp-2", children: course.short_description }),
                course.estimated_duration_minutes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-500 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDuration(course.estimated_duration_minutes) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-medium text-gray-700", children: progress_percentage === 0 ? "Not Started" : `${progress_percentage}% Complete` }),
                    progress_percentage > 0 && progress_percentage < 100 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-500", children: "In Progress" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-2 bg-gray-200 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `h-full ${getProgressColor(progress_percentage)} transition-all duration-300`,
                      style: { width: `${progress_percentage}%` }
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-blue-600 font-medium text-sm group-hover:underline", children: progress_percentage === 0 ? "Start Course →" : progress_percentage === 100 ? "Review Course →" : "Continue Learning →" }) })
              ] })
            ]
          },
          course.course_id
        );
      }) })
    ] }),
    course_id && !lesson_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/staff/training",
          className: "flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Back to Courses" })
          ]
        }
      ) }),
      course_loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }),
      course_error && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-red-900 mb-1", children: "Course not found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: "The course you're looking for doesn't exist or has been removed." })
      ] }),
      current_course && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-64 bg-gradient-to-br from-blue-50 to-indigo-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: current_course.cover_image_url,
                alt: current_course.course_title,
                className: "w-full h-full object-cover",
                onError: (e) => {
                  e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";
                }
              }
            ),
            current_course.is_required && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-4 h-4 fill-current" }),
              "Required Course"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getCategoryColor(current_course.category)}`, children: current_course.category.replace("_", " ") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: current_course.course_title }),
                current_course.estimated_duration_minutes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-gray-600 mb-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-5 h-5" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: formatDuration(current_course.estimated_duration_minutes) })
                ] })
              ] }),
              course_progress && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "ml-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-blue-50 rounded-lg p-4 text-center min-w-[120px]", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-3xl font-bold text-blue-600 mb-1", children: [
                  Number(course_progress.progress_percentage || 0),
                  "%"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-gray-600", children: "Complete" })
              ] }) })
            ] }),
            current_course.long_description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-700 leading-relaxed mb-6", children: current_course.long_description }),
            course_progress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-gray-700", children: "Your Progress" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm text-gray-500", children: [
                  completed_lessons_count,
                  " of ",
                  course_lessons.length,
                  " lessons completed"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-3 bg-gray-200 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-full ${getProgressColor(Number(course_progress.progress_percentage || 0))} transition-all duration-300`,
                  style: { width: `${course_progress.progress_percentage || 0}%` }
                }
              ) })
            ] }),
            Number((course_progress == null ? void 0 : course_progress.progress_percentage) || 0) === 100 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-6 h-6 text-green-600" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-green-900", children: "Course Completed!" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-green-700 text-sm", children: "You've successfully completed all lessons in this course." })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xl font-bold text-gray-900 mb-6 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Book, { className: "w-6 h-6" }),
            "Course Lessons"
          ] }),
          course_lessons.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 text-gray-500", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-12 h-12 mx-auto mb-3 text-gray-400" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No lessons available yet" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: course_lessons.sort((a, b) => a.lesson_order - b.lesson_order).map((lesson) => {
            const is_completed = isLessonCompleted(lesson.lesson_id);
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: `/staff/courses/${course_id}/lesson/${lesson.lesson_id}`,
                className: "flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold", children: lesson.lesson_order }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-semibold text-gray-900 group-hover:text-blue-600 transition-colors", children: lesson.lesson_title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 mt-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 capitalize flex items-center gap-1", children: [
                        lesson.lesson_type === "video" && /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-3 h-3" }),
                        lesson.lesson_type === "document" && /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-3 h-3" }),
                        lesson.lesson_type
                      ] }),
                      lesson.duration_minutes && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-500 flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
                        lesson.duration_minutes,
                        " min"
                      ] })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0", children: is_completed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-6 h-6 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "w-6 h-6 text-gray-300" }) })
                ]
              },
              lesson.lesson_id
            );
          }) })
        ] })
      ] })
    ] }),
    course_id && lesson_id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
      course_loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" }) }),
      course_error && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-4xl mx-auto px-4 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-red-900 mb-1", children: "Lesson not found" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700 text-sm", children: "The lesson you're looking for doesn't exist." })
      ] }) }),
      current_course && current_lesson && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Link,
              {
                to: `/staff/courses/${course_id}`,
                className: "flex items-center gap-2 text-gray-600 hover:text-gray-900",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: "Back to Course" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-6 w-px bg-gray-300" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-500", children: current_course.course_title }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-semibold text-gray-900", children: [
                "Lesson ",
                current_lesson.lesson_order,
                ": ",
                current_lesson.lesson_title
              ] })
            ] })
          ] }),
          course_progress && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-600", children: [
            "Course Progress: ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-semibold text-blue-600", children: [
              Number(course_progress.progress_percentage || 0),
              "%"
            ] })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-2 space-y-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-start justify-between mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-blue-100 text-blue-800 capitalize", children: current_lesson.lesson_type }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gray-900 mb-2", children: current_lesson.lesson_title }),
                current_lesson.duration_minutes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-gray-600", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm", children: [
                    current_lesson.duration_minutes,
                    " minutes"
                  ] })
                ] })
              ] }) }),
              current_lesson.additional_notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-blue-900", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Note:" }),
                " ",
                current_lesson.additional_notes
              ] }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: [
              current_lesson.lesson_type === "video" && current_lesson.content_url && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video bg-black", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "iframe",
                {
                  src: current_lesson.content_url,
                  title: current_lesson.lesson_title,
                  className: "w-full h-full",
                  allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
                  allowFullScreen: true
                }
              ) }),
              current_lesson.lesson_type === "document" && current_lesson.content_url && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-lg p-8 text-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-16 h-16 text-blue-600 mx-auto mb-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Training Document" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-4", children: "View or download the course materials" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "a",
                  {
                    href: current_lesson.content_url,
                    target: "_blank",
                    rel: "noopener noreferrer",
                    className: "inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium",
                    children: "Open Document"
                  }
                )
              ] }) }),
              current_lesson.content_text && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "prose max-w-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-gray-700 leading-relaxed whitespace-pre-wrap", children: current_lesson.content_text }) }) }),
              !current_lesson.content_url && !current_lesson.content_text && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-yellow-800 text-sm", children: "Content for this lesson is not yet available." }) }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Personal Notes" }),
                notes_saved_indicator && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-green-600 flex items-center gap-1 animate-fade-in", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-3 h-3" }),
                  "Saved"
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  value: personal_notes,
                  onChange: (e) => setPersonalNotes(e.target.value),
                  placeholder: "Take notes as you learn... Your notes are automatically saved.",
                  className: "w-full h-40 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "checkbox",
                  id: "mark_complete",
                  checked: markCompleteMutation.isSuccess,
                  onChange: handleMarkComplete,
                  disabled: markCompleteMutation.isPending,
                  className: "w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "mark_complete", className: "font-semibold text-gray-900 cursor-pointer", children: "I have completed this lesson" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Mark this lesson as complete to update your progress and unlock the next lesson." })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-4", children: [
              has_previous_lesson ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: handleNavigateToPrevious,
                  className: "flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "w-4 h-4" }),
                    "Previous Lesson"
                  ]
                }
              ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", {}),
              has_next_lesson && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: handleNavigateToNext,
                  className: "flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ml-auto",
                  children: [
                    "Next Lesson",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-4 h-4" })
                  ]
                }
              ),
              !has_next_lesson && Number((course_progress == null ? void 0 : course_progress.progress_percentage) || 0) === 100 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: "/staff/training",
                  className: "flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium ml-auto",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5" }),
                    "Back to Courses"
                  ]
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "Course Outline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-[600px] overflow-y-auto", children: course_lessons.sort((a, b) => a.lesson_order - b.lesson_order).map((lesson) => {
              const is_current = lesson.lesson_id === lesson_id;
              const is_completed = isLessonCompleted(lesson.lesson_id);
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: `/staff/courses/${course_id}/lesson/${lesson.lesson_id}`,
                  className: `block p-3 rounded-lg transition-colors ${is_current ? "bg-blue-100 border-2 border-blue-500" : "border border-gray-200 hover:border-blue-300 hover:bg-blue-50"}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 mt-0.5", children: is_completed ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "w-5 h-5 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: `w-5 h-5 ${is_current ? "text-blue-600" : "text-gray-300"}` }) }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: `text-sm font-medium ${is_current ? "text-blue-900" : "text-gray-900"}`, children: [
                        lesson.lesson_order,
                        ". ",
                        lesson.lesson_title
                      ] }),
                      lesson.duration_minutes && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [
                        lesson.duration_minutes,
                        " min"
                      ] })
                    ] })
                  ] })
                },
                lesson.lesson_id
              );
            }) })
          ] }) })
        ] }) })
      ] })
    ] })
  ] }) });
};
export {
  UV_StaffTraining as default
};
