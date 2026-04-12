import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const ManagerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [data, setData] = useState({ projects: [], teamMembers: [], stats: {}, manager: {} });
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'hq', progress: 0 });
  const [memberKpis, setMemberKpis] = useState({ fileDisposalRate: 0, physicalProgress: 0 });
  const [suggestion, setSuggestion] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      await axios.post('http://localhost:5000/api/manager/teammembers', newMember, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
      setNewMember({ name: '', email: '', role: 'hq', progress: 0 });
      setMemberModalOpen(false);
      alert('✅ Member added successfully!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to add member'));
    }
  };

  const handleUpdateMember = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/manager/teammembers/${selectedMember._id}`, {
        progress: selectedMember.progress || 0,
        kpis: memberKpis,
        suggestion
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchDashboardData();
      setMemberModalOpen(false);
      alert('✅ Member updated successfully!');
    } catch (err) {
      alert('Error updating member');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'dark bg-gradient-to-br from-gray-900 to-indigo-900 text-white' : 'bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900'}`}>
      {/* THEME TOGGLE */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 z-50 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border hover:shadow-2xl transition-all"
        title={darkMode ? "Light Mode" : "Dark Mode"}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR - FIXED */}
      <motion.aside 
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-y-0 left-0 z-50 w-64 shadow-2xl backdrop-blur-sm lg:translate-x-0 lg:static transition-all duration-300 border-r bg-gradient-to-b from-indigo-700 via-purple-800 to-indigo-900 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700/50"
      >
        <div className="flex items-center justify-center h-16 bg-white/20 border-b border-white/30 dark:bg-white/10 dark:border-gray-600/50 shadow-sm">
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent drop-shadow-lg dark:text-gray-200">
            Manager Portal
          </h1>
        </div>

        <nav className="mt-6 px-4 space-y-2 flex-1">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📈' },
            { id: 'projects', label: '🚀 My Projects', icon: '📋' },
            { id: 'team', label: '👥 Team', icon: '👨‍💼' },
            { id: 'reports', label: '📋 Reports', icon: '📊' },
            { id: 'profile', label: '👤 Profile', icon: '👨' }
          ].map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveSection(item.id);
                if (item.id === 'profile') setProfileOpen(true);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all shadow-sm font-medium text-sm border
                bg-white/5 border-white/10 text-gray-100 hover:bg-white/15 hover:border-white/30 hover:text-white
                dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-200 dark:hover:bg-gray-600/50 dark:hover:border-gray-500/50
                ${activeSection === item.id ? 'bg-white/20 ring-2 ring-white/30 dark:bg-gray-600/50 dark:ring-blue-500/50 !scale-105' : ''}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>

        {/* LOGOUT BUTTON */}
        <div className="absolute bottom-6 left-4 right-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full px-4 py-3 rounded-2xl font-medium text-sm shadow-sm transition-all bg-red-500/20 border border-red-400/30 text-red-100 hover:bg-red-500/30 hover:border-red-400 hover:text-red-50 dark:bg-red-600/20 dark:border-red-500/30 dark:text-red-200"
          >
            🚪 Logout
          </motion.button>
        </div>
      </motion.aside>

      {/* RIGHT PROFILE DRAWER */}
      {profileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setProfileOpen(false)} />
          <motion.aside 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 right-0 z-50 w-80 shadow-2xl backdrop-blur-sm border-l bg-gradient-to-t from-indigo-900 via-purple-900 to-indigo-800 dark:from-gray-900 dark:via-indigo-900 dark:border-gray-700/50"
          >
            <div className="p-6 border-b border-white/20 dark:border-gray-700/50 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">👤 Profile</h2>
              <button onClick={() => setProfileOpen(false)} className="text-white/70 hover:text-white text-2xl">×</button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto h-full">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{data.manager.name?.charAt(0) || 'M'}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{data.manager.name}</h3>
                  <p className="text-gray-300">{data.manager.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 dark:bg-gray-800/50 dark:border-gray-700/50">
                  <p className="text-gray-400">Department</p>
                  <p className="font-bold text-white">{data.manager.departmentId?.name || 'N/A'}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 dark:bg-gray-800/50 dark:border-gray-700/50">
                  <p className="text-gray-400">Projects</p>
                  <p className="font-bold text-white">{data.stats?.projects || 0}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 dark:bg-gray-800/50 dark:border-gray-700/50">
                  <p className="text-gray-400">Team Size</p>
                  <p className="font-bold text-white">{data.stats?.teamMembers || 0}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-xl border border-white/20 dark:bg-gray-800/50 dark:border-gray-700/50">
                  <p className="text-gray-400">Avg Progress</p>
                  <p className="font-bold text-green-400">{data.stats?.avgProgress || 0}%</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}

      {/* MAIN CONTENT - FIXED LAYOUT */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-gray-700/50 px-6 py-4 sticky top-0 z-20">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className="lg:hidden p-2 rounded-xl shadow-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center flex-1 lg:text-left">
              {activeSection === 'dashboard' ? '📊 Dashboard' :
               activeSection === 'projects' ? '🚀 My Projects' :
               activeSection === 'team' ? '👥 Team Management' :
               activeSection === 'reports' ? '📋 KPI Reports' : '👤 Profile'}
            </h1>
            <div className="w-10"></div>
          </div>
        </header>

        <main className="p-6 max-w-7xl mx-auto">
          {/* DASHBOARD */}
          {activeSection === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl" whileHover={{ scale: 1.02 }}>
                  <h3 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{data.stats.projects || 0}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mt-2 font-medium">My Projects</p>
                </motion.div>
                <motion.div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl" whileHover={{ scale: 1.02 }}>
                  <h3 className="text-4xl font-bold text-green-600 dark:text-green-400">{data.stats.teamMembers || 0}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mt-2 font-medium">Team Members</p>
                </motion.div>
                <motion.div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl" whileHover={{ scale: 1.02 }}>
                  <h3 className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{data.stats.avgProgress || 0}%</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mt-2 font-medium">Avg Performance</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* PROJECTS */}
          {activeSection === 'projects' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">🚀 My Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.projects?.length > 0 ? (
                  data.projects.map((project) => (
                    <motion.div key={project._id} className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl" whileHover={{ scale: 1.02 }}>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{project.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">{project.departmentId?.name || 'No Department'}</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full shadow-lg" style={{ width: '65%' }}></div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">65% Complete</p>
                    </motion.div>
                  ))
                ) : (
                  <motion.div className="col-span-full bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-16 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-2xl" whileHover={{ scale: 1.02 }}>
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">📋</span>
                    </div>
                    <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">No projects assigned yet</p>
                    <p className="text-gray-500 dark:text-gray-500 mt-2">Contact admin to assign projects</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* TEAM - WITH KPI/SUGGESTION MODAL */}
          {activeSection === 'team' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">👥 Team Management</h2>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl lg:self-start"
                  onClick={() => {
                    setNewMember({ name: '', email: '', role: 'hq', progress: 0 });
                    setMemberModalOpen(true);
                  }}
                >
                  ➕ Add Member
                </motion.button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.teamMembers?.length > 0 ? (
                  data.teamMembers.map((member) => (
                    <motion.div 
                      key={member._id}
                      className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl cursor-pointer group"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => {
                        setSelectedMember(member);
                        setMemberKpis(member.kpis || { fileDisposalRate: 0, physicalProgress: 0 });
                        setSuggestion(member.suggestion || '');
                        setMemberModalOpen(true);
                      }}
                    >
                      <div className="flex items-start space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <span className="text-white font-bold text-sm">{member.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{member.name}</h3>
                          <p className="capitalize text-sm font-medium text-indigo-600 dark:text-indigo-400">{member.role.replace('-', ' ')}</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3 overflow-hidden">
                        <motion.div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full shadow-lg"
                          initial={{ width: 0 }}
                          animate={{ width: `${member.progress || 0}%` }}
                          transition={{ duration: 1.5 }}
                        />
                      </div>
                      
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        {member.progress || 0}% Progress
                      </p>
                      
                      {member.suggestion && (
                        <div className="mt-3 p-3 rounded-xl text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50">
                          💡 {member.suggestion}
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <motion.div className="col-span-full bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-16 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 text-center hover:shadow-2xl" whileHover={{ scale: 1.02 }}>
                    <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <span className="text-3xl">👥</span>
                    </div>
                    <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">No team members yet</p>
                    <p className="text-gray-500 dark:text-gray-500 mt-2">Add your first team member above!</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* REPORTS */}
          {activeSection === 'reports' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">📊 KPI Reports</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">🏢 HQ Staff KPIs</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">File Disposal Rate (%)</label>
                      <input type="number" className="w-full p-4 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Turnaround Time (days)</label>
                      <input type="number" className="w-full p-4 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">🌾 Field Unit KPIs</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Survey Accuracy (%)</label>
                      <input type="number" className="w-full p-4 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Physical Progress (%)</label>
                      <input type="number" className="w-full p-4 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                </div>
              </div>
              <motion.button 
                className="mt-12 block mx-auto px-12 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl text-lg font-bold shadow-xl hover:shadow-2xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                📤 Submit Report
              </motion.button>
            </motion.div>
          )}
        </main>
      </div>

      {/* ADD/EDIT MEMBER MODAL */}
      {memberModalOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setMemberModalOpen(false)}>
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
              <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedMember ? `👤 ${selectedMember.name}` : '➕ Add Team Member'}
                  </h2>
                  <button onClick={() => setMemberModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl">×</button>
                </div>

                <form onSubmit={selectedMember ? handleUpdateMember : handleAddMember} className="space-y-6">
                  {!selectedMember && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                        <input 
                          placeholder="Enter full name" 
                          value={newMember.name} 
                          onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                          className="w-full p-4 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                        <input 
                          placeholder="team@company.com" 
                          value={newMember.email} 
                          onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                          className="w-full p-4 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                          type="email"
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                        <select 
                          value={newMember.role} 
                          onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                          className="w-full p-4 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="hq">HQ Staff</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="field-engineer">Field Engineer</option>
                          <option value="technician">Technician</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Initial Progress (0-100)</label>
                        <input 
                          type="number" 
                          placeholder="0" 
                          value={newMember.progress} 
                          onChange={(e) => setNewMember({...newMember, progress: Number(e.target.value)})}
                          className="w-full p-4 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                          min="0" max="100"
                        />
                      </div>
                    </>
                  )}

                  {selectedMember && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Progress (0-100)</label>
                      <input 
                        type="number" 
                        value={selectedMember.progress || 0} 
                        onChange={(e) => setSelectedMember({...selectedMember, progress: Number(e.target.value)})}
                        className="w-full p-4 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                        min="0" max="100"
                      />
                    </div>
                  )}

                  {/* KPI FIELDS */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-4">📊 KPIs</label>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">File Disposal Rate (%)</label>
                        <input 
                          type="number" 
                          value={memberKpis.fileDisposalRate} 
                          onChange={(e) => setMemberKpis({...memberKpis, fileDisposalRate: Number(e.target.value)})}
                          className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-sm"
                          min="0" max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Physical Progress (%)</label>
                        <input 
                          type="number" 
                          value={memberKpis.physicalProgress} 
                          onChange={(e) => setMemberKpis({...memberKpis, physicalProgress: Number(e.target.value)})}
                          className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-sm"
                          min="0" max="100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SUGGESTION */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">💡 Suggestion</label>
                    <textarea 
                      value={suggestion} 
                      onChange={(e) => setSuggestion(e.target.value)}
                      rows={3}
                      placeholder="Enter suggestion/feedback for this member..."
                      className="w-full p-4 rounded-2xl border border-gray-300 dark:border-gray-600 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <motion.button 
                      type="button"
                      onClick={() => setMemberModalOpen(false)}
                      className="flex-1 py-3 px-6 rounded-2xl font-medium shadow-sm border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
                      whileHover={{ scale: 1.02 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button 
                      type={selectedMember ? "button" : "submit"} 
                      onClick={selectedMember ? handleUpdateMember : undefined}
                      className="flex-1 py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {selectedMember ? '💾 Update Member' : '➕ Add Member'}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManagerDashboard;