import { u as useAppStore, l as useQueryClient, r as reactExports, a as useQuery, j as jsxRuntimeExports, d as CircleAlert, F as FileText, D as Calendar, A as Award, U as Users, aI as SquarePen, aN as Save, X, q as Plus, Z as Trash2, v as Eye, E as EyeOff, b as axios } from "./index-nYaE10KP.js";
import { u as useMutation } from "./useMutation-BdRga-lQ.js";
const fetchAboutPageContent = async (token) => {
  const { data } = await axios.get(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/about-page`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};
const updateMainContent = async (token, content_id, data) => {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/about-page/${content_id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const createMilestone = async (token, data) => {
  const response = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/about-page/milestones`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const updateMilestone = async (token, milestone_id, data) => {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/about-page/milestones/${milestone_id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const deleteMilestone = async (token, milestone_id) => {
  const response = await axios.delete(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/about-page/milestones/${milestone_id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const createValue = async (token, data) => {
  const response = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/about-page/values`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const updateValue = async (token, value_id, data) => {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/about-page/values/${value_id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const deleteValue = async (token, value_id) => {
  const response = await axios.delete(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/about-page/values/${value_id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const createTeamMember = async (token, data) => {
  const response = await axios.post(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/about-page/team`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const updateTeamMember = async (token, member_id, data) => {
  const response = await axios.put(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/about-page/team/${member_id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const deleteTeamMember = async (token, member_id) => {
  const response = await axios.delete(
    `${"https://123build-an-online-web-application.launchpulse.ai"}/api/admin/about-page/team/${member_id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};
const UV_AdminAboutPage = () => {
  const token = useAppStore((state) => state.authentication_state.auth_token);
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = reactExports.useState("main");
  const [editingMain, setEditingMain] = reactExports.useState(false);
  const [editingItem, setEditingItem] = reactExports.useState(null);
  const [showAddModal, setShowAddModal] = reactExports.useState(false);
  const [mainForm, setMainForm] = reactExports.useState({
    hero_image_url: "",
    page_title: "",
    story_content: ""
  });
  const [milestoneForm, setMilestoneForm] = reactExports.useState({
    year: "",
    title: "",
    description: "",
    display_order: 0
  });
  const [valueForm, setValueForm] = reactExports.useState({
    icon_name: "quality",
    value_name: "",
    description: "",
    display_order: 0
  });
  const [teamForm, setTeamForm] = reactExports.useState({
    photo_url: "",
    name: "",
    role: "",
    bio: "",
    display_order: 0,
    is_active: true
  });
  const { data: content, isLoading, error } = useQuery({
    queryKey: ["admin-about-page"],
    queryFn: () => fetchAboutPageContent(token || ""),
    enabled: !!token,
    onSuccess: (data) => {
      setMainForm({
        hero_image_url: data.hero_image_url,
        page_title: data.page_title,
        story_content: data.story_content
      });
    }
  });
  const updateMainMutation = useMutation({
    mutationFn: (data) => updateMainContent(token || "", (content == null ? void 0 : content.content_id) || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about-page"] });
      queryClient.invalidateQueries({ queryKey: ["about-page-content"] });
      setEditingMain(false);
    }
  });
  const createMilestoneMutation = useMutation({
    mutationFn: (data) => createMilestone(token || "", { ...data, content_id: (content == null ? void 0 : content.content_id) || "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about-page"] });
      queryClient.invalidateQueries({ queryKey: ["about-page-content"] });
      setShowAddModal(false);
      setMilestoneForm({ year: "", title: "", description: "", display_order: 0 });
    }
  });
  useMutation({
    mutationFn: ({ id, data }) => updateMilestone(token || "", id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about-page"] });
      queryClient.invalidateQueries({ queryKey: ["about-page-content"] });
      setEditingItem(null);
    }
  });
  const deleteMilestoneMutation = useMutation({
    mutationFn: (id) => deleteMilestone(token || "", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about-page"] });
      queryClient.invalidateQueries({ queryKey: ["about-page-content"] });
    }
  });
  const createValueMutation = useMutation({
    mutationFn: (data) => createValue(token || "", { ...data, content_id: (content == null ? void 0 : content.content_id) || "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about-page"] });
      queryClient.invalidateQueries({ queryKey: ["about-page-content"] });
      setShowAddModal(false);
      setValueForm({ icon_name: "quality", value_name: "", description: "", display_order: 0 });
    }
  });
  useMutation({
    mutationFn: ({ id, data }) => updateValue(token || "", id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about-page"] });
      queryClient.invalidateQueries({ queryKey: ["about-page-content"] });
      setEditingItem(null);
    }
  });
  const deleteValueMutation = useMutation({
    mutationFn: (id) => deleteValue(token || "", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about-page"] });
      queryClient.invalidateQueries({ queryKey: ["about-page-content"] });
    }
  });
  const createTeamMutation = useMutation({
    mutationFn: (data) => createTeamMember(token || "", { ...data, content_id: (content == null ? void 0 : content.content_id) || "" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about-page"] });
      queryClient.invalidateQueries({ queryKey: ["about-page-content"] });
      setShowAddModal(false);
      setTeamForm({ photo_url: "", name: "", role: "", bio: "", display_order: 0, is_active: true });
    }
  });
  useMutation({
    mutationFn: ({ id, data }) => updateTeamMember(token || "", id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about-page"] });
      queryClient.invalidateQueries({ queryKey: ["about-page-content"] });
      setEditingItem(null);
    }
  });
  const deleteTeamMutation = useMutation({
    mutationFn: (id) => deleteTeamMember(token || "", id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about-page"] });
      queryClient.invalidateQueries({ queryKey: ["about-page-content"] });
    }
  });
  const handleSaveMain = () => {
    updateMainMutation.mutate(mainForm);
  };
  const handleAddItem = () => {
    if (activeSection === "milestones") {
      createMilestoneMutation.mutate(milestoneForm);
    } else if (activeSection === "values") {
      createValueMutation.mutate(valueForm);
    } else if (activeSection === "team") {
      createTeamMutation.mutate(teamForm);
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600" }) });
  }
  if (error || !content) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "w-16 h-16 text-red-500 mx-auto mb-4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-red-600", children: "Failed to load about page content" })
    ] }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-gray-50 p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-2", children: "About Page Editor" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: "Manage your about page content, milestones, values, and team members" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex border-b border-gray-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveSection("main"),
          className: `flex items-center px-6 py-4 font-medium transition-colors ${activeSection === "main" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600 hover:text-gray-900"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-5 h-5 mr-2" }),
            "Main Content"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveSection("milestones"),
          className: `flex items-center px-6 py-4 font-medium transition-colors ${activeSection === "milestones" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600 hover:text-gray-900"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-5 h-5 mr-2" }),
            "Milestones (",
            content.milestones.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveSection("values"),
          className: `flex items-center px-6 py-4 font-medium transition-colors ${activeSection === "values" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600 hover:text-gray-900"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "w-5 h-5 mr-2" }),
            "Values (",
            content.values.length,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setActiveSection("team"),
          className: `flex items-center px-6 py-4 font-medium transition-colors ${activeSection === "team" ? "border-b-2 border-purple-600 text-purple-600" : "text-gray-600 hover:text-gray-900"}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "w-5 h-5 mr-2" }),
            "Team (",
            content.team_members.length,
            ")"
          ]
        }
      )
    ] }) }),
    activeSection === "main" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg shadow-sm p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold text-gray-900", children: "Hero & Story Content" }),
        !editingMain ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setEditingMain(true),
            className: "flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "w-4 h-4 mr-2" }),
              "Edit"
            ]
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleSaveMain,
              disabled: updateMainMutation.isPending,
              className: "flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
                updateMainMutation.isPending ? "Saving..." : "Save"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => {
                setEditingMain(false);
                setMainForm({
                  hero_image_url: content.hero_image_url,
                  page_title: content.page_title,
                  story_content: content.story_content
                });
              },
              className: "flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 mr-2" }),
                "Cancel"
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Hero Image URL" }),
          editingMain ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: mainForm.hero_image_url,
              onChange: (e) => setMainForm({ ...mainForm, hero_image_url: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: content.hero_image_url, alt: "Hero", className: "w-32 h-20 object-cover rounded" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-600 text-sm truncate", children: content.hero_image_url })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Page Title" }),
          editingMain ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: mainForm.page_title,
              onChange: (e) => setMainForm({ ...mainForm, page_title: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-900", children: content.page_title })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Story Content (HTML)" }),
          editingMain ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: mainForm.story_content,
              onChange: (e) => setMainForm({ ...mainForm, story_content: e.target.value }),
              rows: 10,
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "prose max-w-none",
              dangerouslySetInnerHTML: { __html: content.story_content }
            }
          )
        ] })
      ] })
    ] }),
    activeSection === "milestones" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setShowAddModal(true),
          className: "flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
            "Add Milestone"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: content.milestones.map((milestone) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-3 py-1 bg-purple-600 text-white font-bold rounded", children: milestone.year }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900", children: milestone.title })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: milestone.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500 mt-2", children: [
            "Display Order: ",
            milestone.display_order
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                if (milestone.milestone_id) {
                  setEditingItem(milestone.milestone_id);
                  setMilestoneForm(milestone);
                }
              },
              className: "p-2 text-blue-600 hover:bg-blue-50 rounded",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                if (milestone.milestone_id && confirm("Delete this milestone?")) {
                  deleteMilestoneMutation.mutate(milestone.milestone_id);
                }
              },
              className: "p-2 text-red-600 hover:bg-red-50 rounded",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-5 h-5" })
            }
          )
        ] })
      ] }) }, milestone.milestone_id)) })
    ] }),
    activeSection === "values" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setShowAddModal(true),
          className: "flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
            "Add Value"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: content.values.map((value) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4 mb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded", children: value.icon_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900", children: value.value_name })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: value.description }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500 mt-2", children: [
            "Display Order: ",
            value.display_order
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                if (value.value_id) {
                  setEditingItem(value.value_id);
                  setValueForm(value);
                }
              },
              className: "p-2 text-blue-600 hover:bg-blue-50 rounded",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                if (value.value_id && confirm("Delete this value?")) {
                  deleteValueMutation.mutate(value.value_id);
                }
              },
              className: "p-2 text-red-600 hover:bg-red-50 rounded",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-5 h-5" })
            }
          )
        ] })
      ] }) }, value.value_id)) })
    ] }),
    activeSection === "team" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => setShowAddModal(true),
          className: "flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
            "Add Team Member"
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-4", children: content.team_members.map((member) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-lg shadow-sm p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: member.photo_url, alt: member.name, className: "w-20 h-20 rounded-full object-cover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-gray-900", children: member.name }),
              member.is_active ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4 text-green-600" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4 text-gray-400" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-purple-600 font-medium mb-2", children: member.role }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-gray-600", children: member.bio }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-gray-500 mt-2", children: [
              "Display Order: ",
              member.display_order
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex space-x-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                if (member.member_id) {
                  setEditingItem(member.member_id);
                  setTeamForm(member);
                }
              },
              className: "p-2 text-blue-600 hover:bg-blue-50 rounded",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(SquarePen, { className: "w-5 h-5" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                if (member.member_id && confirm("Delete this team member?")) {
                  deleteTeamMutation.mutate(member.member_id);
                }
              },
              className: "p-2 text-red-600 hover:bg-red-50 rounded",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-5 h-5" })
            }
          )
        ] })
      ] }) }, member.member_id)) })
    ] }),
    showAddModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-2xl font-bold text-gray-900", children: [
          "Add ",
          activeSection === "milestones" ? "Milestone" : activeSection === "values" ? "Value" : "Team Member"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAddModal(false), className: "p-2 hover:bg-gray-100 rounded", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" }) })
      ] }),
      activeSection === "milestones" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Year" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: milestoneForm.year,
              onChange: (e) => setMilestoneForm({ ...milestoneForm, year: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Title" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: milestoneForm.title,
              onChange: (e) => setMilestoneForm({ ...milestoneForm, title: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: milestoneForm.description,
              onChange: (e) => setMilestoneForm({ ...milestoneForm, description: e.target.value }),
              rows: 3,
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Display Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: milestoneForm.display_order,
              onChange: (e) => setMilestoneForm({ ...milestoneForm, display_order: parseInt(e.target.value) }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] })
      ] }),
      activeSection === "values" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Icon Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: valueForm.icon_name,
              onChange: (e) => setValueForm({ ...valueForm, icon_name: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "quality", children: "Quality" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "community", children: "Community" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "innovation", children: "Innovation" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "sustainability", children: "Sustainability" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Value Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: valueForm.value_name,
              onChange: (e) => setValueForm({ ...valueForm, value_name: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: valueForm.description,
              onChange: (e) => setValueForm({ ...valueForm, description: e.target.value }),
              rows: 3,
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Display Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: valueForm.display_order,
              onChange: (e) => setValueForm({ ...valueForm, display_order: parseInt(e.target.value) }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] })
      ] }),
      activeSection === "team" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Photo URL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: teamForm.photo_url,
              onChange: (e) => setTeamForm({ ...teamForm, photo_url: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: teamForm.name,
              onChange: (e) => setTeamForm({ ...teamForm, name: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              value: teamForm.role,
              onChange: (e) => setTeamForm({ ...teamForm, role: e.target.value }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Bio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: teamForm.bio,
              onChange: (e) => setTeamForm({ ...teamForm, bio: e.target.value }),
              rows: 3,
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Display Order" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "number",
              value: teamForm.display_order,
              onChange: (e) => setTeamForm({ ...teamForm, display_order: parseInt(e.target.value) }),
              className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              checked: teamForm.is_active,
              onChange: (e) => setTeamForm({ ...teamForm, is_active: e.target.checked }),
              className: "w-4 h-4 text-purple-600 rounded"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "ml-2 text-sm text-gray-700", children: "Active" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end space-x-2 mt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setShowAddModal(false),
            className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300",
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handleAddItem,
            disabled: createMilestoneMutation.isPending || createValueMutation.isPending || createTeamMutation.isPending,
            className: "px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50",
            children: createMilestoneMutation.isPending || createValueMutation.isPending || createTeamMutation.isPending ? "Adding..." : "Add"
          }
        )
      ] })
    ] }) })
  ] }) });
};
export {
  UV_AdminAboutPage as default
};
