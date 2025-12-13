import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { 
  FileText, 
  Image as ImageIcon, 
  Calendar, 
  Award, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Milestone {
  milestone_id?: string;
  year: string;
  title: string;
  description: string;
  display_order: number;
}

interface Value {
  value_id?: string;
  icon_name: string;
  value_name: string;
  description: string;
  display_order: number;
}

interface TeamMember {
  member_id?: string;
  photo_url: string;
  name: string;
  role: string;
  bio: string;
  display_order: number;
  is_active: boolean;
}

interface AboutPageContent {
  content_id: string;
  hero_image_url: string;
  page_title: string;
  story_content: string;
  milestones: Milestone[];
  values: Value[];
  team_members: TeamMember[];
}

type SectionType = 'main' | 'milestones' | 'values' | 'team';

// ============================================================================
// API FUNCTIONS
// ============================================================================

const fetchAboutPageContent = async (token: string): Promise<AboutPageContent> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/about-page`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return data;
};

const updateMainContent = async (token: string, content_id: string, data: Partial<AboutPageContent>) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/about-page/${content_id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

const createMilestone = async (token: string, data: Milestone & { content_id: string }) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/about-page/milestones`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

const updateMilestone = async (token: string, milestone_id: string, data: Partial<Milestone>) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/about-page/milestones/${milestone_id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

const deleteMilestone = async (token: string, milestone_id: string) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/about-page/milestones/${milestone_id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

const createValue = async (token: string, data: Value & { content_id: string }) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/about-page/values`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

const updateValue = async (token: string, value_id: string, data: Partial<Value>) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/about-page/values/${value_id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

const deleteValue = async (token: string, value_id: string) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/about-page/values/${value_id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

const createTeamMember = async (token: string, data: TeamMember & { content_id: string }) => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/about-page/team`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

const updateTeamMember = async (token: string, member_id: string, data: Partial<TeamMember>) => {
  const response = await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/about-page/team/${member_id}`,
    data,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

const deleteTeamMember = async (token: string, member_id: string) => {
  const response = await axios.delete(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/admin/about-page/team/${member_id}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UV_AdminAboutPage: React.FC = () => {
  const token = useAppStore(state => state.auth_state.token);
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState<SectionType>('main');
  const [editingMain, setEditingMain] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [mainForm, setMainForm] = useState({
    hero_image_url: '',
    page_title: '',
    story_content: ''
  });

  const [milestoneForm, setMilestoneForm] = useState<Milestone>({
    year: '',
    title: '',
    description: '',
    display_order: 0
  });

  const [valueForm, setValueForm] = useState<Value>({
    icon_name: 'quality',
    value_name: '',
    description: '',
    display_order: 0
  });

  const [teamForm, setTeamForm] = useState<TeamMember>({
    photo_url: '',
    name: '',
    role: '',
    bio: '',
    display_order: 0,
    is_active: true
  });

  // Fetch content
  const { data: content, isLoading, error } = useQuery<AboutPageContent, Error>({
    queryKey: ['admin-about-page'],
    queryFn: () => fetchAboutPageContent(token || ''),
    enabled: !!token,
    onSuccess: (data) => {
      setMainForm({
        hero_image_url: data.hero_image_url,
        page_title: data.page_title,
        story_content: data.story_content
      });
    }
  });

  // Mutations
  const updateMainMutation = useMutation({
    mutationFn: (data: Partial<AboutPageContent>) => 
      updateMainContent(token || '', content?.content_id || '', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-page'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-content'] });
      setEditingMain(false);
    }
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (data: Milestone) => 
      createMilestone(token || '', { ...data, content_id: content?.content_id || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-page'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-content'] });
      setShowAddModal(false);
      setMilestoneForm({ year: '', title: '', description: '', display_order: 0 });
    }
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Milestone> }) =>
      updateMilestone(token || '', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-page'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-content'] });
      setEditingItem(null);
    }
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: (id: string) => deleteMilestone(token || '', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-page'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-content'] });
    }
  });

  const createValueMutation = useMutation({
    mutationFn: (data: Value) => 
      createValue(token || '', { ...data, content_id: content?.content_id || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-page'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-content'] });
      setShowAddModal(false);
      setValueForm({ icon_name: 'quality', value_name: '', description: '', display_order: 0 });
    }
  });

  const updateValueMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Value> }) =>
      updateValue(token || '', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-page'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-content'] });
      setEditingItem(null);
    }
  });

  const deleteValueMutation = useMutation({
    mutationFn: (id: string) => deleteValue(token || '', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-page'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-content'] });
    }
  });

  const createTeamMutation = useMutation({
    mutationFn: (data: TeamMember) => 
      createTeamMember(token || '', { ...data, content_id: content?.content_id || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-page'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-content'] });
      setShowAddModal(false);
      setTeamForm({ photo_url: '', name: '', role: '', bio: '', display_order: 0, is_active: true });
    }
  });

  const updateTeamMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeamMember> }) =>
      updateTeamMember(token || '', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-page'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-content'] });
      setEditingItem(null);
    }
  });

  const deleteTeamMutation = useMutation({
    mutationFn: (id: string) => deleteTeamMember(token || '', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-page'] });
      queryClient.invalidateQueries({ queryKey: ['about-page-content'] });
    }
  });

  // Handlers
  const handleSaveMain = () => {
    updateMainMutation.mutate(mainForm);
  };

  const handleAddItem = () => {
    if (activeSection === 'milestones') {
      createMilestoneMutation.mutate(milestoneForm);
    } else if (activeSection === 'values') {
      createValueMutation.mutate(valueForm);
    } else if (activeSection === 'team') {
      createTeamMutation.mutate(teamForm);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Failed to load about page content</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">About Page Editor</h1>
          <p className="text-gray-600">Manage your about page content, milestones, values, and team members</p>
        </div>

        {/* Section Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveSection('main')}
              className={`flex items-center px-6 py-4 font-medium transition-colors ${
                activeSection === 'main'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5 mr-2" />
              Main Content
            </button>
            <button
              onClick={() => setActiveSection('milestones')}
              className={`flex items-center px-6 py-4 font-medium transition-colors ${
                activeSection === 'milestones'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Milestones ({content.milestones.length})
            </button>
            <button
              onClick={() => setActiveSection('values')}
              className={`flex items-center px-6 py-4 font-medium transition-colors ${
                activeSection === 'values'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Award className="w-5 h-5 mr-2" />
              Values ({content.values.length})
            </button>
            <button
              onClick={() => setActiveSection('team')}
              className={`flex items-center px-6 py-4 font-medium transition-colors ${
                activeSection === 'team'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-5 h-5 mr-2" />
              Team ({content.team_members.length})
            </button>
          </div>
        </div>

        {/* Main Content Section */}
        {activeSection === 'main' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Hero & Story Content</h2>
              {!editingMain ? (
                <button
                  onClick={() => setEditingMain(true)}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveMain}
                    disabled={updateMainMutation.isPending}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateMainMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingMain(false);
                      setMainForm({
                        hero_image_url: content.hero_image_url,
                        page_title: content.page_title,
                        story_content: content.story_content
                      });
                    }}
                    className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Image URL
                </label>
                {editingMain ? (
                  <input
                    type="text"
                    value={mainForm.hero_image_url}
                    onChange={(e) => setMainForm({ ...mainForm, hero_image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="flex items-center space-x-4">
                    <img src={content.hero_image_url} alt="Hero" className="w-32 h-20 object-cover rounded" />
                    <span className="text-gray-600 text-sm truncate">{content.hero_image_url}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title
                </label>
                {editingMain ? (
                  <input
                    type="text"
                    value={mainForm.page_title}
                    onChange={(e) => setMainForm({ ...mainForm, page_title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <p className="text-gray-900">{content.page_title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Story Content (HTML)
                </label>
                {editingMain ? (
                  <textarea
                    value={mainForm.story_content}
                    onChange={(e) => setMainForm({ ...mainForm, story_content: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  />
                ) : (
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: content.story_content }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Milestones Section */}
        {activeSection === 'milestones' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Milestone
              </button>
            </div>

            <div className="grid gap-4">
              {content.milestones.map((milestone) => (
                <div key={milestone.milestone_id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="inline-block px-3 py-1 bg-purple-600 text-white font-bold rounded">
                          {milestone.year}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">{milestone.title}</h3>
                      </div>
                      <p className="text-gray-600">{milestone.description}</p>
                      <p className="text-sm text-gray-500 mt-2">Display Order: {milestone.display_order}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (milestone.milestone_id) {
                            setEditingItem(milestone.milestone_id);
                            setMilestoneForm(milestone);
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (milestone.milestone_id && confirm('Delete this milestone?')) {
                            deleteMilestoneMutation.mutate(milestone.milestone_id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Values Section */}
        {activeSection === 'values' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Value
              </button>
            </div>

            <div className="grid gap-4">
              {content.values.map((value) => (
                <div key={value.value_id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded">
                          {value.icon_name}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">{value.value_name}</h3>
                      </div>
                      <p className="text-gray-600">{value.description}</p>
                      <p className="text-sm text-gray-500 mt-2">Display Order: {value.display_order}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (value.value_id) {
                            setEditingItem(value.value_id);
                            setValueForm(value);
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (value.value_id && confirm('Delete this value?')) {
                            deleteValueMutation.mutate(value.value_id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Section */}
        {activeSection === 'team' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </button>
            </div>

            <div className="grid gap-4">
              {content.team_members.map((member) => (
                <div key={member.member_id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex space-x-4">
                      <img src={member.photo_url} alt={member.name} className="w-20 h-20 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                          {member.is_active ? (
                            <Eye className="w-4 h-4 text-green-600" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-purple-600 font-medium mb-2">{member.role}</p>
                        <p className="text-gray-600">{member.bio}</p>
                        <p className="text-sm text-gray-500 mt-2">Display Order: {member.display_order}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (member.member_id) {
                            setEditingItem(member.member_id);
                            setTeamForm(member);
                          }
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (member.member_id && confirm('Delete this team member?')) {
                            deleteTeamMutation.mutate(member.member_id);
                          }
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Modal - Simple implementation */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add {activeSection === 'milestones' ? 'Milestone' : activeSection === 'values' ? 'Value' : 'Team Member'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {activeSection === 'milestones' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <input
                      type="text"
                      value={milestoneForm.year}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, year: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      value={milestoneForm.title}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={milestoneForm.description}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={milestoneForm.display_order}
                      onChange={(e) => setMilestoneForm({ ...milestoneForm, display_order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'values' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Icon Name</label>
                    <select
                      value={valueForm.icon_name}
                      onChange={(e) => setValueForm({ ...valueForm, icon_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="quality">Quality</option>
                      <option value="community">Community</option>
                      <option value="innovation">Innovation</option>
                      <option value="sustainability">Sustainability</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Value Name</label>
                    <input
                      type="text"
                      value={valueForm.value_name}
                      onChange={(e) => setValueForm({ ...valueForm, value_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={valueForm.description}
                      onChange={(e) => setValueForm({ ...valueForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={valueForm.display_order}
                      onChange={(e) => setValueForm({ ...valueForm, display_order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'team' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Photo URL</label>
                    <input
                      type="text"
                      value={teamForm.photo_url}
                      onChange={(e) => setTeamForm({ ...teamForm, photo_url: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={teamForm.name}
                      onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <input
                      type="text"
                      value={teamForm.role}
                      onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                    <textarea
                      value={teamForm.bio}
                      onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                    <input
                      type="number"
                      value={teamForm.display_order}
                      onChange={(e) => setTeamForm({ ...teamForm, display_order: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={teamForm.is_active}
                      onChange={(e) => setTeamForm({ ...teamForm, is_active: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Active</label>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  disabled={createMilestoneMutation.isPending || createValueMutation.isPending || createTeamMutation.isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {(createMilestoneMutation.isPending || createValueMutation.isPending || createTeamMutation.isPending) ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UV_AdminAboutPage;
