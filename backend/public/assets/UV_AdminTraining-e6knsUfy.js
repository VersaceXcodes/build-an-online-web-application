import { k as useSearchParams, l as useQueryClient, u as useAppStore, r as reactExports, a as useQuery, j as jsxRuntimeExports, q as Plus, a6 as BookOpen, U as Users, a2 as Search, C as Clock, B as CircleCheckBig, y as CircleX, W as Pen, Z as Trash2, b as axios } from "./index-nYaE10KP.js";
import { u as useMutation } from "./useMutation-BdRga-lQ.js";
async function fetchTrainingCourses(params) {
  const queryParams = new URLSearchParams();
  if (params.query) queryParams.append("query", params.query);
  if (params.category) queryParams.append("category", params.category);
  if (params.status) queryParams.append("status", params.status);
  if (params.is_required !== void 0 && params.is_required !== "") {
    queryParams.append("is_required", params.is_required);
  }
  queryParams.append("limit", "20");
  queryParams.append("offset", "0");
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/courses?${queryParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${params.token}`
      }
    }
  );
  return response.data;
}
async function createTrainingCourse(data) {
  const response = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/courses`,
    data.courseData,
    {
      headers: {
        Authorization: `Bearer ${data.token}`
      }
    }
  );
  return response.data;
}
async function updateTrainingCourse(data) {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/courses/${data.course_id}`,
    data.courseData,
    {
      headers: {
        Authorization: `Bearer ${data.token}`
      }
    }
  );
  return response.data;
}
async function fetchStaffProgress(token) {
  const response = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/progress`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
}
async function archiveTrainingCourse(data) {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/courses/${data.course_id}`,
    { status: "archived" },
    {
      headers: {
        Authorization: `Bearer ${data.token}`
      }
    }
  );
  return response.data;
}
async function createLesson(data) {
  const response = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/courses/${data.course_id}/lessons`,
    data.lessonData,
    {
      headers: {
        Authorization: `Bearer ${data.token}`
      }
    }
  );
  return response.data;
}
async function updateLesson(data) {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/lessons/${data.lesson_id}`,
    data.lessonData,
    {
      headers: {
        Authorization: `Bearer ${data.token}`
      }
    }
  );
  return response.data;
}
async function deleteLesson(data) {
  const response = await axios.delete(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/training/lessons/${data.lesson_id}`,
    {
      headers: {
        Authorization: `Bearer ${data.token}`
      }
    }
  );
  return response.data;
}
const UV_AdminTraining = () => {
  var _a;
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const currentUser = useAppStore((state) => state.authentication_state.current_user);
  const authToken = useAppStore((state) => state.authentication_state.auth_token);
  const showToast = useAppStore((state) => state.show_toast);
  const showConfirmation = useAppStore((state) => state.show_confirmation);
  const hideConfirmation = useAppStore((state) => state.hide_confirmation);
  const [activeView, setActiveView] = reactExports.useState("courses");
  const [courseFormModalOpen, setCourseFormModalOpen] = reactExports.useState(false);
  const [formMode, setFormMode] = reactExports.useState("create");
  const [selectedCourse, setSelectedCourse] = reactExports.useState(null);
  const [activeModalTab, setActiveModalTab] = reactExports.useState("details");
  const [lessonFormOpen, setLessonFormOpen] = reactExports.useState(false);
  const [lessonFormMode, setLessonFormMode] = reactExports.useState("create");
  const [selectedLesson, setSelectedLesson] = reactExports.useState(null);
  const [courseFilters, setCourseFilters] = reactExports.useState({
    query: searchParams.get("query") || "",
    category: searchParams.get("category") || "",
    status: searchParams.get("status") || "",
    is_required: searchParams.get("is_required") || ""
  });
  const [courseFormData, setCourseFormData] = reactExports.useState({
    course_title: "",
    short_description: "",
    long_description: null,
    cover_image_url: "",
    category: "safety",
    tags: null,
    status: "draft",
    is_required: false,
    estimated_duration_minutes: null,
    prerequisite_course_ids: null,
    created_by_user_id: ""
  });
  const [lessonFormData, setLessonFormData] = reactExports.useState({
    lesson_title: "",
    lesson_type: "video",
    content_url: null,
    content_text: null,
    duration_minutes: null,
    additional_notes: null,
    lesson_order: 1
  });
  const [formErrors, setFormErrors] = reactExports.useState({});
  const [lessonFormErrors, setLessonFormErrors] = reactExports.useState({});
  reactExports.useEffect(() => {
    setCourseFilters({
      query: searchParams.get("query") || "",
      category: searchParams.get("category") || "",
      status: searchParams.get("status") || "",
      is_required: searchParams.get("is_required") || ""
    });
  }, [searchParams]);
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError
  } = useQuery({
    queryKey: ["training-courses", courseFilters, authToken],
    queryFn: () => fetchTrainingCourses({
      query: courseFilters.query || void 0,
      category: courseFilters.category || void 0,
      status: courseFilters.status || void 0,
      is_required: courseFilters.is_required || void 0,
      token: authToken
    }),
    enabled: !!authToken && activeView === "courses",
    staleTime: 6e4
  });
  const {
    data: staffProgressData,
    isLoading: progressLoading,
    error: progressError
  } = useQuery({
    queryKey: ["staff-progress", authToken],
    queryFn: () => fetchStaffProgress(authToken),
    enabled: !!authToken && activeView === "progress",
    staleTime: 3e4
  });
  const createCourseMutation = useMutation({
    mutationFn: createTrainingCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-courses"] });
      showToast("success", "Course created successfully");
      setCourseFormModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      var _a2, _b;
      showToast("error", ((_b = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.message) || "Failed to create course");
    }
  });
  const updateCourseMutation = useMutation({
    mutationFn: updateTrainingCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-courses"] });
      showToast("success", "Course updated successfully");
      setCourseFormModalOpen(false);
      setSelectedCourse(null);
      resetForm();
    },
    onError: (error) => {
      var _a2, _b;
      showToast("error", ((_b = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.message) || "Failed to update course");
    }
  });
  const archiveCourseMutation = useMutation({
    mutationFn: archiveTrainingCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-courses"] });
      showToast("success", "Course archived successfully");
    },
    onError: (error) => {
      var _a2, _b;
      showToast("error", ((_b = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.message) || "Failed to archive course");
    }
  });
  const createLessonMutation = useMutation({
    mutationFn: createLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-courses"] });
      showToast("success", "Lesson created successfully");
      setLessonFormOpen(false);
      resetLessonForm();
    },
    onError: (error) => {
      var _a2, _b;
      showToast("error", ((_b = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.message) || "Failed to create lesson");
    }
  });
  const updateLessonMutation = useMutation({
    mutationFn: updateLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-courses"] });
      showToast("success", "Lesson updated successfully");
      setLessonFormOpen(false);
      setSelectedLesson(null);
      resetLessonForm();
    },
    onError: (error) => {
      var _a2, _b;
      showToast("error", ((_b = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.message) || "Failed to update lesson");
    }
  });
  const deleteLessonMutation = useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-courses"] });
      showToast("success", "Lesson deleted successfully");
    },
    onError: (error) => {
      var _a2, _b;
      showToast("error", ((_b = (_a2 = error.response) == null ? void 0 : _a2.data) == null ? void 0 : _b.message) || "Failed to delete lesson");
    }
  });
  const handleFilterChange = (key, value) => {
    const newFilters = { ...courseFilters, [key]: value };
    setCourseFilters(newFilters);
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };
  const handleCreateCourse = () => {
    setFormMode("create");
    resetForm();
    setCourseFormModalOpen(true);
  };
  const handleEditCourse = (course) => {
    setFormMode("edit");
    setSelectedCourse(course);
    setActiveModalTab("details");
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
      created_by_user_id: course.created_by_user_id
    });
    setCourseFormModalOpen(true);
  };
  const handleDeleteCourse = (course) => {
    showConfirmation({
      title: "Archive Course",
      message: `Are you sure you want to archive "${course.course_title}"? This will hide it from staff but preserve progress data.`,
      confirm_text: "Archive",
      cancel_text: "Cancel",
      danger_action: true,
      on_confirm: () => {
        archiveCourseMutation.mutate({
          course_id: course.course_id,
          token: authToken
        });
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      }
    });
  };
  const validateForm = () => {
    const errors = {};
    if (!courseFormData.course_title.trim()) {
      errors.course_title = "Course title is required";
    }
    if (!courseFormData.short_description.trim()) {
      errors.short_description = "Short description is required";
    }
    if (!courseFormData.cover_image_url.trim()) {
      errors.cover_image_url = "Cover image URL is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast("error", "Please fix form errors");
      return;
    }
    if (formMode === "create") {
      createCourseMutation.mutate({
        courseData: {
          ...courseFormData,
          created_by_user_id: currentUser.user_id
        },
        token: authToken
      });
    } else if (formMode === "edit" && selectedCourse) {
      updateCourseMutation.mutate({
        course_id: selectedCourse.course_id,
        courseData: courseFormData,
        token: authToken
      });
    }
  };
  const resetForm = () => {
    setCourseFormData({
      course_title: "",
      short_description: "",
      long_description: null,
      cover_image_url: "",
      category: "safety",
      tags: null,
      status: "draft",
      is_required: false,
      estimated_duration_minutes: null,
      prerequisite_course_ids: null,
      created_by_user_id: ""
    });
    setFormErrors({});
    setSelectedCourse(null);
  };
  const closeModal = () => {
    setCourseFormModalOpen(false);
    setActiveModalTab("details");
    resetForm();
  };
  const handleCreateLesson = () => {
    var _a2;
    if (!selectedCourse) return;
    setLessonFormMode("create");
    const nextOrder = (((_a2 = selectedCourse.lessons) == null ? void 0 : _a2.length) || 0) + 1;
    setLessonFormData({
      lesson_title: "",
      lesson_type: "video",
      content_url: null,
      content_text: null,
      duration_minutes: null,
      additional_notes: null,
      lesson_order: nextOrder
    });
    setLessonFormOpen(true);
  };
  const handleEditLesson = (lesson) => {
    setLessonFormMode("edit");
    setSelectedLesson(lesson);
    setLessonFormData({
      lesson_title: lesson.lesson_title,
      lesson_type: lesson.lesson_type,
      content_url: lesson.content_url,
      content_text: lesson.content_text,
      duration_minutes: lesson.duration_minutes,
      additional_notes: lesson.additional_notes,
      lesson_order: lesson.lesson_order
    });
    setLessonFormOpen(true);
  };
  const handleDeleteLesson = (lesson) => {
    showConfirmation({
      title: "Delete Lesson",
      message: `Are you sure you want to delete "${lesson.lesson_title}"? This action cannot be undone.`,
      confirm_text: "Delete",
      cancel_text: "Cancel",
      danger_action: true,
      on_confirm: () => {
        deleteLessonMutation.mutate({
          lesson_id: lesson.lesson_id,
          token: authToken
        });
        hideConfirmation();
      },
      on_cancel: () => {
        hideConfirmation();
      }
    });
  };
  const validateLessonForm = () => {
    const errors = {};
    if (!lessonFormData.lesson_title.trim()) {
      errors.lesson_title = "Lesson title is required";
    }
    setLessonFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmitLessonForm = (e) => {
    e.preventDefault();
    if (!validateLessonForm()) {
      showToast("error", "Please fix form errors");
      return;
    }
    if (!selectedCourse) {
      showToast("error", "No course selected");
      return;
    }
    if (lessonFormMode === "create") {
      createLessonMutation.mutate({
        course_id: selectedCourse.course_id,
        lessonData: lessonFormData,
        token: authToken
      });
    } else if (lessonFormMode === "edit" && selectedLesson) {
      updateLessonMutation.mutate({
        lesson_id: selectedLesson.lesson_id,
        lessonData: lessonFormData,
        token: authToken
      });
    }
  };
  const resetLessonForm = () => {
    setLessonFormData({
      lesson_title: "",
      lesson_type: "video",
      content_url: null,
      content_text: null,
      duration_minutes: null,
      additional_notes: null,
      lesson_order: 1
    });
    setLessonFormErrors({});
    setSelectedLesson(null);
  };
  const closeLessonModal = () => {
    setLessonFormOpen(false);
    resetLessonForm();
  };
  const courses = (coursesData == null ? void 0 : coursesData.data) || [];
  const totalCourses = (coursesData == null ? void 0 : coursesData.total) || 0;
  const staffProgress = staffProgressData || [];
  const statusColors = {
    draft: "bg-gray-100 text-gray-700",
    published: "bg-green-100 text-green-700",
    archived: "bg-red-100 text-red-700"
  };
  const categoryLabels = {
    safety: "Safety",
    customer_service: "Customer Service",
    baking: "Baking",
    equipment: "Equipment",
    management: "Management"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-gray-50", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white shadow-sm border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Training Management" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-gray-600", children: "Manage staff training courses and track progress" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: handleCreateCourse,
            className: "inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 mr-2" }),
              "Create Course"
            ]
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveView("courses"),
            className: `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeView === "courses" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-4 h-4 inline-block mr-2" }),
              "Courses (",
              totalCourses,
              ")"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setActiveView("progress"),
            className: `py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeView === "progress" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-4 h-4 inline-block mr-2" }),
              "Staff Progress"
            ]
          }
        )
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [
        activeView === "courses" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  placeholder: "Search courses...",
                  value: courseFilters.query,
                  onChange: (e) => handleFilterChange("query", e.target.value),
                  className: "w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: courseFilters.category,
                onChange: (e) => handleFilterChange("category", e.target.value),
                className: "px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Categories" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "safety", children: "Safety" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "customer_service", children: "Customer Service" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "baking", children: "Baking" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "equipment", children: "Equipment" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "management", children: "Management" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: courseFilters.status,
                onChange: (e) => handleFilterChange("status", e.target.value),
                className: "px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Statuses" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "draft", children: "Draft" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "published", children: "Published" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "archived", children: "Archived" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: courseFilters.is_required,
                onChange: (e) => handleFilterChange("is_required", e.target.value),
                className: "px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "All Courses" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "true", children: "Required Only" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "false", children: "Optional Only" })
                ]
              }
            )
          ] }) }),
          coursesLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center items-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" }) }) : coursesError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border border-red-200 rounded-xl p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700", children: "Failed to load courses. Please try again." }) }) : courses.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No courses found" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600 mb-6", children: courseFilters.query || courseFilters.category || courseFilters.status ? "Try adjusting your filters" : "Create your first training course to get started" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: handleCreateCourse,
                className: "inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5 mr-2" }),
                  "Create First Course"
                ]
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Course" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Category" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Duration" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Lessons" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Required" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Actions" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: courses.map((course) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "img",
                  {
                    src: course.cover_image_url,
                    alt: course.course_title,
                    className: "w-12 h-12 rounded-lg object-cover mr-4"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-gray-900", children: course.course_title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm text-gray-600 line-clamp-1", children: course.short_description })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-gray-700", children: categoryLabels[course.category] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[course.status]}`,
                  children: course.status
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-700", children: course.estimated_duration_minutes ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-4 h-4 mr-1" }),
                course.estimated_duration_minutes,
                " min"
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: "Not set" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-700", children: [
                course.lessons ? course.lessons.length : 0,
                " lessons"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: course.is_required ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "w-5 h-5 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-5 h-5 text-gray-400" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleEditCourse(course),
                    className: "p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
                    title: "Edit course",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleDeleteCourse(course),
                    className: "p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors",
                    title: "Archive course",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                  }
                )
              ] }) })
            ] }, course.course_id)) })
          ] }) }) })
        ] }),
        activeView === "progress" && /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children: progressLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center items-center py-12", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600" }) }) : progressError ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-50 border border-red-200 rounded-xl p-6 text-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-700", children: "Failed to load progress data. Please try again." }) }) : staffProgress.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-16 h-16 text-gray-400 mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-2", children: "No progress data" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "No staff members have started any courses yet." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-gray-50", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Staff Member" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Course" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Progress" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider", children: "Last Accessed" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: staffProgress.map((progress) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-gray-50 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: progress.user_id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: progress.course_title || progress.course_id }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${progress.status === "completed" ? "bg-green-100 text-green-700" : progress.status === "in_progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`,
                children: progress.status
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full bg-gray-200 rounded-full h-2 mr-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: `h-2 rounded-full transition-all ${progress.status === "completed" ? "bg-green-600" : "bg-blue-600"}`,
                  style: {
                    width: `${Number(progress.progress_percentage || 0)}%`
                  }
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-medium text-gray-700 whitespace-nowrap", children: [
                Number(progress.progress_percentage || 0).toFixed(0),
                "%"
              ] })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-600", children: progress.last_accessed_at ? new Date(progress.last_accessed_at).toLocaleDateString() : "Never" })
          ] }, progress.progress_id)) })
        ] }) }) }) })
      ] })
    ] }),
    courseFormModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-white border-b border-gray-200 px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900", children: formMode === "create" ? "Create Course" : "Edit Course" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: closeModal,
              className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-6 h-6 text-gray-500" })
            }
          )
        ] }),
        formMode === "edit" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setActiveModalTab("details"),
              className: `pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeModalTab === "details" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`,
              children: "Course Details"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setActiveModalTab("lessons"),
              className: `pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeModalTab === "lessons" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`,
              children: [
                "Lessons (",
                ((_a = selectedCourse == null ? void 0 : selectedCourse.lessons) == null ? void 0 : _a.length) || 0,
                ")"
              ]
            }
          )
        ] })
      ] }),
      activeModalTab === "details" && /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmitForm, className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Course Title *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: courseFormData.course_title,
              onChange: (e) => {
                setCourseFormData({ ...courseFormData, course_title: e.target.value });
                if (formErrors.course_title) {
                  setFormErrors({ ...formErrors, course_title: "" });
                }
              },
              className: `w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${formErrors.course_title ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`,
              placeholder: "e.g., Food Safety Level 2"
            }
          ),
          formErrors.course_title && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.course_title })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Short Description *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: courseFormData.short_description,
              onChange: (e) => {
                setCourseFormData({ ...courseFormData, short_description: e.target.value });
                if (formErrors.short_description) {
                  setFormErrors({ ...formErrors, short_description: "" });
                }
              },
              rows: 2,
              className: `w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${formErrors.short_description ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`,
              placeholder: "Brief overview of the course content"
            }
          ),
          formErrors.short_description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.short_description })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Long Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: courseFormData.long_description || "",
              onChange: (e) => setCourseFormData({
                ...courseFormData,
                long_description: e.target.value || null
              }),
              rows: 4,
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
              placeholder: "Detailed course description and learning objectives"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Cover Image URL *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "url",
              value: courseFormData.cover_image_url,
              onChange: (e) => {
                setCourseFormData({ ...courseFormData, cover_image_url: e.target.value });
                if (formErrors.cover_image_url) {
                  setFormErrors({ ...formErrors, cover_image_url: "" });
                }
              },
              className: `w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${formErrors.cover_image_url ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`,
              placeholder: "https://example.com/image.jpg"
            }
          ),
          formErrors.cover_image_url && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: formErrors.cover_image_url })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Category *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: courseFormData.category,
              onChange: (e) => setCourseFormData({
                ...courseFormData,
                category: e.target.value
              }),
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "safety", children: "Safety" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "customer_service", children: "Customer Service" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "baking", children: "Baking" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "equipment", children: "Equipment" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "management", children: "Management" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: courseFormData.status,
                onChange: (e) => setCourseFormData({
                  ...courseFormData,
                  status: e.target.value
                }),
                className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "draft", children: "Draft" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "published", children: "Published" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "archived", children: "Archived" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Duration (minutes)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "1",
                value: courseFormData.estimated_duration_minutes || "",
                onChange: (e) => setCourseFormData({
                  ...courseFormData,
                  estimated_duration_minutes: e.target.value ? parseInt(e.target.value) : null
                }),
                className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
                placeholder: "60"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              id: "is_required",
              checked: courseFormData.is_required,
              onChange: (e) => setCourseFormData({ ...courseFormData, is_required: e.target.checked }),
              className: "w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "is_required", className: "ml-3 text-sm font-medium text-gray-700", children: "Mark as required course for all staff" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Tags (comma-separated)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: courseFormData.tags || "",
              onChange: (e) => setCourseFormData({ ...courseFormData, tags: e.target.value || null }),
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
              placeholder: "e.g., hygiene, compliance, certification"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end space-x-4 pt-4 border-t border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: closeModal,
              className: "px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: createCourseMutation.isPending || updateCourseMutation.isPending,
              className: "px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl",
              children: createCourseMutation.isPending || updateCourseMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "svg",
                  {
                    className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "circle",
                        {
                          className: "opacity-25",
                          cx: "12",
                          cy: "12",
                          r: "10",
                          stroke: "currentColor",
                          strokeWidth: "4"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          className: "opacity-75",
                          fill: "currentColor",
                          d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        }
                      )
                    ]
                  }
                ),
                formMode === "create" ? "Creating..." : "Updating..."
              ] }) : formMode === "create" ? "Create Course" : "Update Course"
            }
          )
        ] })
      ] }),
      activeModalTab === "lessons" && formMode === "edit" && selectedCourse && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Course Lessons" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleCreateLesson,
              className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
                "Add Lesson"
              ]
            }
          )
        ] }),
        selectedCourse.lessons && selectedCourse.lessons.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: selectedCourse.lessons.sort((a, b) => Number(a.lesson_order) - Number(b.lesson_order)).map((lesson) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold", children: lesson.lesson_order }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-900", children: lesson.lesson_title }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-gray-600 capitalize", children: lesson.lesson_type }),
                    lesson.duration_minutes && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-gray-600 flex items-center", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3 mr-1" }),
                      lesson.duration_minutes,
                      " min"
                    ] })
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleEditLesson(lesson),
                    className: "p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors",
                    title: "Edit lesson",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => handleDeleteLesson(lesson),
                    className: "p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors",
                    title: "Delete lesson",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                  }
                )
              ] })
            ]
          },
          lesson.lesson_id
        )) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-12 h-12 text-gray-400 mx-auto mb-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-semibold text-gray-900 mb-1", children: "No lessons yet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-gray-600 mb-4", children: "Add lessons to build your training course" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleCreateLesson,
              className: "inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
                "Add First Lesson"
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    lessonFormOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-bold text-gray-900", children: lessonFormMode === "create" ? "Add Lesson" : "Edit Lesson" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: closeLessonModal,
            className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-6 h-6 text-gray-500" })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmitLessonForm, className: "p-6 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Lesson Title *" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: lessonFormData.lesson_title,
              onChange: (e) => {
                setLessonFormData({ ...lessonFormData, lesson_title: e.target.value });
                if (lessonFormErrors.lesson_title) {
                  setLessonFormErrors({ ...lessonFormErrors, lesson_title: "" });
                }
              },
              className: `w-full px-4 py-3 border-2 rounded-lg outline-none transition-all ${lessonFormErrors.lesson_title ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"}`,
              placeholder: "e.g., Introduction to Food Safety"
            }
          ),
          lessonFormErrors.lesson_title && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-red-600", children: lessonFormErrors.lesson_title })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Lesson Type *" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "select",
              {
                value: lessonFormData.lesson_type,
                onChange: (e) => setLessonFormData({
                  ...lessonFormData,
                  lesson_type: e.target.value
                }),
                className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "video", children: "Video" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "document", children: "Document" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "quiz", children: "Quiz" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "interactive", children: "Interactive" })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Lesson Order" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "1",
                value: lessonFormData.lesson_order,
                onChange: (e) => setLessonFormData({
                  ...lessonFormData,
                  lesson_order: parseInt(e.target.value) || 1
                }),
                className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Content URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "url",
              value: lessonFormData.content_url || "",
              onChange: (e) => setLessonFormData({
                ...lessonFormData,
                content_url: e.target.value || null
              }),
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
              placeholder: "https://example.com/video.mp4"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Content Text" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: lessonFormData.content_text || "",
              onChange: (e) => setLessonFormData({
                ...lessonFormData,
                content_text: e.target.value || null
              }),
              rows: 4,
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
              placeholder: "Lesson description and learning objectives"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Duration (minutes)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              min: "1",
              value: lessonFormData.duration_minutes || "",
              onChange: (e) => setLessonFormData({
                ...lessonFormData,
                duration_minutes: e.target.value ? parseInt(e.target.value) : null
              }),
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
              placeholder: "30"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-semibold text-gray-700 mb-2", children: "Additional Notes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: lessonFormData.additional_notes || "",
              onChange: (e) => setLessonFormData({
                ...lessonFormData,
                additional_notes: e.target.value || null
              }),
              rows: 3,
              className: "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all",
              placeholder: "Any additional instructions or requirements"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end space-x-4 pt-4 border-t border-gray-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: closeLessonModal,
              className: "px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "submit",
              disabled: createLessonMutation.isPending || updateLessonMutation.isPending,
              className: "px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl",
              children: createLessonMutation.isPending || updateLessonMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "svg",
                  {
                    className: "animate-spin -ml-1 mr-2 h-4 w-4 text-white",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "circle",
                        {
                          className: "opacity-25",
                          cx: "12",
                          cy: "12",
                          r: "10",
                          stroke: "currentColor",
                          strokeWidth: "4"
                        }
                      ),
                      /* @__PURE__ */ jsxRuntimeExports.jsx(
                        "path",
                        {
                          className: "opacity-75",
                          fill: "currentColor",
                          d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        }
                      )
                    ]
                  }
                ),
                lessonFormMode === "create" ? "Creating..." : "Updating..."
              ] }) : lessonFormMode === "create" ? "Create Lesson" : "Update Lesson"
            }
          )
        ] })
      ] })
    ] }) })
  ] });
};
export {
  UV_AdminTraining as default
};
