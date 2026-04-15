import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState({ departments: 0, projects: 0, managers: 0 });
  const [departments, setDepartments] = useState([]);
  const [allManagers, setAllManagers] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptProjects, setDeptProjects] = useState([]);
  const [deptManagers, setDeptManagers] = useState([]);
  const [showAddManager, setShowAddManager] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [newManager, setNewManager] = useState({ name: '', email: '' });
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    budget: '',
    status: 'Planning'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchDepartments();
    fetchAllManagers();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      fetchDeptProjects();
      fetchDeptManagers();
    }
  }, [selectedDept]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/departments');
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllManagers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/managers');
      setAllManagers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDeptProjects = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/departments/${selectedDept}/projects`);
      setDeptProjects(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const fetchDeptManagers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/departments/${selectedDept}/managers`);
      setDeptManagers(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  const handleDeptClick = (dept) => {
    setSelectedDept(dept._id);
    setSelectedProject(null);
    setActiveSection('department-detail');
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowAddManager(true);
  };

  const handleAddManager = async (e) => {
    e.preventDefault();
    if (!selectedDept || !selectedProject?._id) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/admin/managers', {
        ...newManager,
        department: selectedDept,
        project: selectedProject._id
      });

      setShowAddManager(false);
      setNewManager({ name: '', email: '' });
      setSelectedProject(null);
      await Promise.all([fetchDeptProjects(), fetchDeptManagers(), fetchAllManagers(), fetchStats()]);
      alert('✅ Manager Added!');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.error || '❌ Error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/admin/projects', {
        ...newProject,
        department: selectedDept
      });

      setShowAddProject(false);
      setNewProject({ name: '', description: '', budget: '', status: 'Planning' });
      await Promise.all([fetchDeptProjects(), fetchStats(), fetchDepartments()]);
      alert('✅ Project Added!');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.error || '❌ Error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.aside
        initial={{ x: 0 }}
        animate={{ x: sidebarOpen ? 0 : 0 }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-indigo-700 via-purple-800 to-indigo-900 shadow-2xl backdrop-blur-sm lg:static lg:translate-x-0 transition-all duration-300 border-r border-white/10"
      >
        <div className="flex items-center justify-center h-16 bg-white/20 backdrop-blur-md border-b border-white/30 shadow-sm">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent drop-shadow-lg">
            Govt Admin
          </h1>
        </div>

        <nav className="mt-6 px-4 space-y-2 py-4">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📈' },
            { id: 'departments', label: '🏛️ Departments', icon: '🏢' },
            { id: 'projects', label: '🚀 Projects', icon: '📋' },
            { id: 'managers', label: '👥 Managers', icon: '👨‍💼' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setSidebarOpen(false);
              }}
              className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 hover:bg-white/15 hover:shadow-xl hover:shadow-purple-500/25 text-gray-100 hover:text-white font-medium text-sm shadow-sm ${
                activeSection === item.id ? 'bg-white/20 ring-2 ring-white/30' : ''
              }`}
            >
              <span className="text-lg flex-shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4 space-y-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
            <p className="text-xs text-gray-300 text-center">v2.0</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-2xl font-medium text-sm bg-red-500/20 text-red-100 border border-red-300/20 hover:bg-red-500/30 hover:text-white transition-all"
          >
            🚪 Logout
          </button>
        </div>
      </motion.aside>

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {activeSection === 'department-detail' ? 'Department Details' : activeSection.replace('-', ' ')}
            </h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            >
              ☰
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {activeSection === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <motion.div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl" whileHover={{ scale: 1.02 }}>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{stats.departments}</h3>
                  <p className="text-gray-600 mt-2 text-lg">Departments</p>
                </motion.div>
                <motion.div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl" whileHover={{ scale: 1.02 }}>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.projects}</h3>
                  <p className="text-gray-600 mt-2 text-lg">Projects</p>
                </motion.div>
                <motion.div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl hover:shadow-2xl" whileHover={{ scale: 1.02 }}>
                  <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{stats.managers}</h3>
                  <p className="text-gray-600 mt-2 text-lg">Managers</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeSection === 'departments' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.map((dept) => (
                  <motion.div
                    key={dept._id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl cursor-pointer border-2 border-transparent hover:border-indigo-300 transition-all duration-300 hover:-translate-y-2"
                    onClick={() => handleDeptClick(dept)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{dept.name}</h3>
                    <p className="text-gray-600 mb-4">{dept.description}</p>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                      {dept.projects?.length || 0} Projects
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'department-detail' && selectedDept && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-3xl font-bold text-gray-900">Department Projects</h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowAddProject(true)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-xl font-semibold"
                  >
                    ➕ New Project
                  </button>
                </div>
              </div>

              {deptManagers.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Managers in this Department</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {deptManagers.map((manager) => (
                      <div key={manager._id} className="p-4 rounded-xl bg-gray-50 border">
                        <p className="font-semibold text-gray-900">{manager.name}</p>
                        <p className="text-sm text-gray-600">{manager.email}</p>
                        <p className="text-sm text-gray-600">
                          Department: {manager.departmentId?.name || 'NA'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Project: {manager.projectId?.name || 'NA'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deptProjects.map((project) => (
                  <motion.div
                    key={project._id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl"
                    whileHover={{ scale: 1.02 }}
                  >
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{project.name || 'Unnamed'}</h4>
                    <p className="text-gray-600 mb-4">{project.description || 'No description'}</p>
                    <div className="space-y-2 mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'Completed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {project.status || 'Planning'}
                      </span>
                      <span className="text-sm text-gray-600">₹{(project.budget || 0).toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => handleProjectClick(project)}
                      className="w-full px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    >
                      Assign Manager
                    </button>

                    {project.managerId?.name && (
                      <div className="mt-3 text-sm bg-blue-50 p-2 rounded-lg">
                        Manager: {project.managerId.name}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeSection === 'managers' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">All Managers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {allManagers.map((manager) => (
                  <div key={manager._id} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-gray-900">{manager.name}</h3>
                    <p className="text-gray-600">{manager.email}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Department: {manager.departmentId?.name || 'NA'}
                      
                    </p>
                    <p className="text-sm text-gray-600">
                      Project: {manager.projectId?.name || 'NA'}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {showAddManager && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-center mb-6">👤 Assign Manager</h2>
                <form onSubmit={handleAddManager} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Manager Name"
                    value={newManager.name}
                    onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newManager.email}
                    onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-500"
                    required
                  />

                  <div className="p-3 rounded-xl bg-gray-50 text-sm text-gray-700">
                    <p><b>Department:</b> {selectedDept || 'NA'}</p>
                    <p><b>Project:</b> {selectedProject?.name || 'NA'}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Add Manager'}
                  </button>
                </form>
                <button
                  onClick={() => setShowAddManager(false)}
                  className="mt-4 w-full text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          )}

          {showAddProject && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-bold text-center mb-6">➕ Add Project</h2>
                <form onSubmit={handleAddProject} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Project Name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                    required
                  />
                  <textarea
                    placeholder="Description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500 h-24"
                  />
                  <input
                    type="number"
                    placeholder="Budget (₹)"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                  />
                  <select
                    value={newProject.status}
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                  >
                    <option>Planning</option>
                    <option>Active</option>
                    <option>Completed</option>
                  </select>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Add Project'}
                  </button>
                </form>
                <button
                  onClick={() => setShowAddProject(false)}
                  className="mt-4 w-full text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;