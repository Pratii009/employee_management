import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const ManagerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [data, setData] = useState({ projects: [], teamMembers: [], stats: {}, manager: {} });
  const [selectedMember, setSelectedMember] = useState(null);
 const [newMember, setNewMember] = useState({
  name: '',
  email: '',
  role: 'employee',
  unit: '',
  departmentId: '',
  projectId: '',
  phone: '',
  progress: 0,
  suggestion: ''
});
  const [kpis, setKpis] = useState({ fileDisposalRate: 0, physicalProgress: 0, suggestion: '' });
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [kpiModalOpen, setKpiModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/manager/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Dashboard error:', err.response?.data || err.message);
      if (err.response?.status === 403) {
        alert('Access denied. Please login as manager.');
        localStorage.clear();
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/manager/add-member', newMember, {
  headers: { Authorization: `Bearer ${token}` }
});
      setRefreshKey((prev) => prev + 1);
      setNewMember({ name: '', email: '', role: 'hq', progress: 0 });
      document.getElementById('add-member-modal').close();
      alert('✅ Member added successfully!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to add member'));
    }
  };

  const handleUpdateKPI = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/manager/teammembers/${selectedMember._id}`,
        {
          ...kpis
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRefreshKey((prev) => prev + 1);
      setKpiModalOpen(false);
      setKpis({ fileDisposalRate: 0, physicalProgress: 0, suggestion: '' });
      alert('✅ KPI updated successfully!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to update KPI'));
    }
  };

  const handleSubmitReport = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/manager/reports',
        {
          kpis,
          date: new Date().toISOString().split('T')[0],
          managerId: data.manager?._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('✅ Report submitted successfully!');
      setKpis({ fileDisposalRate: 0, physicalProgress: 0, suggestion: '' });
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to submit report'));
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const handleProfileOpen = () => {
    setProfileOpen(true);
    setActiveSection('profile');
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const managerProject = data.manager?.projectId;
  const managerDepartment = data.manager?.departmentId;

  

  return (
    <div
      className={`flex min-h-screen transition-all duration-300 ${
        darkMode
          ? 'dark bg-gradient-to-br from-gray-900 to-indigo-900 text-white'
          : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'
      }`}
    >
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 z-50 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border hover:shadow-2xl transition-all"
        title={darkMode ? 'Light Mode' : 'Dark Mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -10 }}
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-2xl backdrop-blur-sm lg:translate-x-0 lg:static lg:w-64 transition-all duration-300 border-r ${
          darkMode
            ? 'bg-gradient-to-b from-purple-900/95 via-indigo-900/90 to-purple-800/95 border-purple-500/30 shadow-purple-500/20'
            : 'bg-gradient-to-b from-indigo-600/90 via-purple-700/90 to-indigo-700/90 border-white/20 shadow-indigo-500/20'
        }`}
      >
        <div
          className={`flex items-center justify-center h-16 border-b ${
            darkMode ? 'bg-white/5 border-purple-500/30' : 'bg-white/20 border-white/20'
          }`}
        >
          <h1
            className={`text-xl font-bold tracking-wide bg-clip-text text-transparent ${
              darkMode
                ? 'bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300'
                : 'bg-gradient-to-r from-white via-purple-100 to-indigo-100'
            }`}
          >
            Manager Portal
          </h1>
        </div>

        <nav className="mt-6 px-4 space-y-6 py-4 flex-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📈' },
            { id: 'projects', label: 'My Projects', icon: '📁' },
            { id: 'team', label: 'Team', icon: '👥' },
            { id: 'reports', label: 'Reports', icon: '📝' },
            { id: 'profile', label: 'Profile', icon: '👤' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (item.id === 'profile') setProfileOpen(true);
                else setProfileOpen(false);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all shadow-sm font-medium text-sm ${
                darkMode
                  ? 'bg-white/5 border border-white/10 text-gray-100 hover:bg-white/15 hover:border-white/30 hover:text-white'
                  : 'bg-white/5 border border-white/10 text-gray-100 hover:bg-white/15 hover:border-white/30 hover:text-white'
              } ${activeSection === item.id ? (darkMode ? 'bg-white/20 ring-2 ring-white/30 scale-105' : 'bg-white/20 ring-2 ring-white/30 scale-105') : ''}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 pb-6 pt-4">
          <button
            onClick={handleLogout}
            className={`w-full px-4 py-3 rounded-2xl font-medium text-sm shadow-sm transition-all ${
              darkMode
                ? 'bg-red-600/20 border border-red-500/30 text-red-200 hover:bg-red-600/30 hover:border-red-500/50 hover:text-red-100'
                : 'bg-red-500/20 border border-red-400/30 text-red-100 hover:bg-red-500/30 hover:border-red-400 hover:text-red-50'
            }`}
          >
            Logout
          </button>
        </div>
      </motion.aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <header
          className={`sticky top-0 z-10 border-b px-2 py-4 ${
            darkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-black/20' : 'bg-white shadow-sm border-b'
          }`}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden p-3 rounded-xl shadow-lg ${
                darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              ☰
            </button>
            <h1 className={`text-2xl font-bold text-center flex-1 lg:text-left ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {activeSection === 'dashboard'
                ? 'Dashboard'
                : activeSection === 'projects'
                ? 'My Projects'
                : activeSection === 'team'
                ? 'Team Management'
                : activeSection === 'reports'
                ? 'KPI Reports'
                : 'Profile'}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-8">
          {activeSection === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl border hover:shadow-2xl ${
                    darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-4xl font-bold text-indigo-400">{data.stats?.projects || 0}</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-1`}>My Projects</p>
                </motion.div>

                <motion.div
                  className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl border hover:shadow-2xl ${
                    darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-4xl font-bold text-green-400">{data.stats?.teamMembers || 0}</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-1`}>Team Members</p>
                </motion.div>

                <motion.div
                  className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl border hover:shadow-2xl ${
                    darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="text-4xl font-bold text-yellow-400">{data.stats?.avgProgress || 0}</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-1`}>Avg Performance</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeSection === 'projects' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
              <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.projects && data.projects.length > 0 ? (
                  data.projects.map((project) => (
                    <motion.div
                      key={project._id}
                      className={`backdrop-blur-sm p-6 rounded-2xl shadow-xl border hover:shadow-2xl ${
                        darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 border'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {project.name}
                      </h3>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                        {project.description || 'No description'}
                      </p>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        Department: {project.department?.name || 'NA'}
                      </p>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        Status: {project.status || 'Planning'}
                      </p>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        Budget: ₹{(project.budget || 0).toLocaleString()}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <div
                    className={`backdrop-blur-sm p-12 rounded-2xl border text-center col-span-full ${
                      darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'
                    }`}
                  >
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No projects assigned yet. Contact admin.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'team' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Team Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className={`px-6 py-3 rounded-xl font-semibold shadow-lg ${
                    darkMode ? 'bg-indigo-600/90 text-white hover:bg-indigo-700/90' : 'bg-indigo-600 text-white'
                  }`}
                  onClick={() => document.getElementById('add-member-modal').showModal()}
                >
                  Add Member
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.teamMembers && data.teamMembers.length > 0 ? (
                  data.teamMembers.map((member) => (
                    <motion.div
                      key={member._id}
                      className={`backdrop-blur-sm p-6 rounded-2xl shadow-xl border hover:shadow-2xl cursor-pointer ${
                        darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedMember(member);
                        setKpiModalOpen(true);
                      }}
                    >
                      <div className="flex items-start space-x-4 mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            darkMode ? 'bg-indigo-600/50 border-2 border-indigo-400/50' : 'bg-indigo-500/20'
                          }`}
                        >
                          <span className={`font-bold text-sm ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>
                            {member.name?.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-bold text-lg truncate ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {member.name}
                          </h3>
                          <p className={`capitalize text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            {member.role?.replace('-', ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${member.progress || 0}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>

                      <p className={`text-sm font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {member.progress || 0}% Progress
                      </p>

                      {member.suggestion && (
                        <div
                          className={`mt-3 p-3 rounded-xl text-xs ${
                            darkMode ? 'bg-yellow-900/50 text-yellow-300 border-yellow-800/50' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}
                        >
                          {member.suggestion}
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div
                    className={`backdrop-blur-sm col-span-full p-12 rounded-2xl border text-center ${
                      darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'
                    }`}
                  >
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No team members yet. Add your first member!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSection === 'reports' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
              <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>KPI Reports</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <div className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'}`}>
                  <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>HQ Staff KPI</h3>
                  <div className="space-y-4">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      File Disposal Rate
                    </label>
                    <input
                      type="number"
                      value={kpis.fileDisposalRate}
                      onChange={(e) => setKpis({ ...kpis, fileDisposalRate: Number(e.target.value) })}
                      className={`w-full p-3 rounded-xl border shadow-sm ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className={`backdrop-blur-sm p-8 rounded-2xl shadow-xl border ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'}`}>
                  <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Field Unit KPI</h3>
                  <div className="space-y-4">
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Physical Progress
                    </label>
                    <input
                      type="number"
                      value={kpis.physicalProgress}
                      onChange={(e) => setKpis({ ...kpis, physicalProgress: Number(e.target.value) })}
                      className={`w-full p-3 rounded-xl border shadow-sm ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <motion.button
                className="mx-auto block px-12 py-4 rounded-2xl text-lg font-bold shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                onClick={handleSubmitReport}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Report
              </motion.button>
            </motion.div>
          )}

          {activeSection === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
              <div className={`backdrop-blur-sm rounded-3xl shadow-2xl border p-8 ${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80'}`}>
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {data.manager?.name?.charAt(0) || 'M'}
                    </span>
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {data.manager?.name || 'Manager'}
                    </h2>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{data.manager?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>Department</p>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {managerDepartment?.name || 'NA'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>Project</p>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {managerProject?.name || 'NA'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>Team Size</p>
                    <p className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {data.stats?.teamMembers || 0}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-700'}>Avg Progress</p>
                    <p className="font-bold text-green-400">{data.stats?.avgProgress || 0}%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      <dialog id="add-member-modal" className={`p-0 ${darkMode ? 'bg-gray-900/90' : 'bg-white/95'} backdrop:bg-black/50`}>
        <div className={`p-8 rounded-3xl shadow-2xl max-w-md mx-auto mt-20 max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Add Team Member</h2>
          <form onSubmit={handleAddMember} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className={`w-full p-3 rounded-xl border shadow-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={newMember.email}
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
              className={`w-full p-3 rounded-xl border shadow-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
            <select
              value={newMember.role}
              onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
              className={`w-full p-3 rounded-xl border shadow-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="hq">HQ Staff</option>
              <option value="supervisor">Supervisor</option>
              <option value="field-engineer">Field Engineer</option>
              <option value="technician">Technician</option>
            </select>
            <input
              type="number"
              placeholder="Initial Progress 0-100"
              value={newMember.progress}
              onChange={(e) => setNewMember({ ...newMember, progress: Number(e.target.value) })}
              className={`w-full p-3 rounded-xl border shadow-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              min="0"
              max="100"
            />
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => document.getElementById('add-member-modal').close()}
                className={`flex-1 py-3 rounded-xl font-medium shadow-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-bold shadow-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      </dialog>

      <dialog open={kpiModalOpen} className={`p-0 ${darkMode ? 'bg-gray-900/90' : 'bg-white/95'} backdrop:bg-black/50`}>
        <div className={`p-8 rounded-3xl shadow-2xl max-w-md mx-auto mt-20 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Update KPI for {selectedMember?.name}
          </h2>
          <form onSubmit={handleUpdateKPI} className="space-y-4">
            <input
              type="number"
              placeholder="File Disposal Rate"
              value={kpis.fileDisposalRate}
              onChange={(e) => setKpis({ ...kpis, fileDisposalRate: Number(e.target.value) })}
              className={`w-full p-3 rounded-xl border shadow-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
            <input
              type="number"
              placeholder="Physical Progress"
              value={kpis.physicalProgress}
              onChange={(e) => setKpis({ ...kpis, physicalProgress: Number(e.target.value) })}
              className={`w-full p-3 rounded-xl border shadow-sm ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              required
            />
            <textarea
              placeholder="Suggestion/Feedback"
              value={kpis.suggestion}
              onChange={(e) => setKpis({ ...kpis, suggestion: e.target.value })}
              className={`w-full p-3 rounded-xl border shadow-sm h-24 resize-none ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setKpiModalOpen(false)}
                className={`flex-1 py-3 rounded-xl font-medium shadow-sm ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-bold shadow-xl bg-gradient-to-r from-emerald-600 to-green-600 text-white"
              >
                Save KPI
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default ManagerDashboard;