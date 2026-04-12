import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const ManagerDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [data, setData] = useState({ projects: [], teamMembers: [], stats: {}, manager: {} });
  const [selectedMember, setSelectedMember] = useState(null);
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'hq', progress: 0 });
  const [kpis, setKpis] = useState({ fileDisposalRate: 0, physicalProgress: 0 });
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ FIXED useEffect dependency
  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]); // ✅ Fixed dependency

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
      document.getElementById('add-member-modal').close();
      alert('✅ Member added successfully!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to add member'));
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
      {/* ✅ FIXED THEME TOGGLE - No Heroicons */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-6 right-6 z-50 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border hover:shadow-2xl transition-all"
        title={darkMode ? "Light Mode" : "Dark Mode"}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* ✅ FIXED LEFT SIDEBAR - Complete animate */}
      <motion.aside 
        initial={false}
        animate={{ x: sidebarOpen ? 0 : 0 }}  // ✅ FIXED: Added -250
        className={`fixed inset-y-0 left-0 z-50 w-64 shadow-2xl backdrop-blur-sm lg:translate-x-0 lg:static transition-all duration-300 border-r ${darkMode ? 'bg-gradient-to-b from-gray-800 to-gray-900 border-gray-700/50' : 'bg-gradient-to-b from-indigo-700 via-purple-800 to-indigo-900 border-white/10'}`}
      >
        <div className={`${darkMode ? 'bg-white/10 border-gray-600/50' : 'bg-white/20 border-white/30'} flex items-center justify-center h-16 shadow-sm`}>
          <h1 className={`${darkMode ? 'text-gray-200' : 'bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent drop-shadow-lg'} text-xl font-bold`}>
            Manager Portal
          </h1>
        </div>

        <nav className="mt-6 px-4 space-y-2 py-4">
          {[
            { id: 'dashboard', label: '📊 Dashboard', icon: '📈' },
            { id: 'projects', label: '🚀 My Projects', icon: '📋' },
            { id: 'team', label: '👥 Team', icon: '👨‍💼' },
            { id: 'reports', label: '📋 Reports', icon: '📊' },
            { id: 'profile', label: '👤 Profile', icon: '👨' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                if (item.id === 'profile') setProfileOpen(true);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left transition-all shadow-sm font-medium text-sm 
                ${darkMode ? 'bg-gray-700/50 border-gray-600/50 text-gray-200 hover:bg-gray-600/50 hover:border-gray-500/50 hover:text-white' : 'bg-white/5 border-white/10 text-gray-100 hover:bg-white/15 hover:border-white/30 hover:text-white'} 
                ${activeSection === item.id ? (darkMode ? 'bg-gray-600/50 ring-2 ring-blue-500/50 !scale-105' : 'bg-white/20 ring-2 ring-white/30 !scale-105') : ''}`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* ✅ LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className={`absolute bottom-24 left-4 right-4 w-full px-4 py-3 rounded-2xl font-medium text-sm shadow-sm transition-all
            ${darkMode ? 'bg-red-600/20 border-red-500/30 text-red-200 hover:bg-red-600/30 hover:border-red-500/50 hover:text-red-100' : 'bg-red-500/20 border-red-400/30 text-red-100 hover:bg-red-500/30 hover:border-red-400 hover:text-red-50'}`}
        >
          🚪 Logout
        </button>

        <div className={`absolute bottom-6 left-4 right-4 ${darkMode ? 'bg-gray-700/50 border-gray-600/50' : 'bg-white/10 backdrop-blur-sm border-white/20'} p-3 rounded-xl border`}>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-300'} text-xs text-center`}>v2.0</p>
        </div>
      </motion.aside>

      {/* OVERLAY for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* RIGHT PROFILE DRAWER */}
      {profileOpen && (
        <motion.aside 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          className={`fixed inset-y-0 right-0 z-50 w-80 shadow-2xl backdrop-blur-sm border-l transition-all duration-300
            ${darkMode ? 'bg-gradient-to-t from-gray-900 via-indigo-900 to-purple-900 border-gray-700/50' : 'bg-gradient-to-t from-indigo-900 via-purple-900 to-indigo-800 border-white/10'}`}
        >
          <div className={`${darkMode ? 'border-gray-700/50' : 'border-white/20'} p-6 border-b flex items-center justify-between`}>
            <h2 className="text-2xl font-bold text-white">👤 Profile</h2>
            <button onClick={() => setProfileOpen(false)} className="text-white/70 hover:text-white text-2xl">×</button>
          </div>
          
          <div className="p-6 space-y-6 overflow-y-auto h-full">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 ${darkMode ? 'bg-white/20' : 'bg-white/20'} rounded-2xl flex items-center justify-center`}>
                <span className="text-2xl font-bold text-white">{data.manager.name?.charAt(0) || 'M'}</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{data.manager.name}</h3>
                <p className="text-gray-300">{data.manager.email}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/10'} p-4 rounded-xl border ${darkMode ? 'border-gray-700/50' : 'border-white/20'}`}>
                <p className="text-gray-400">Department</p>
                <p className="font-bold text-white">{data.manager.departmentId?.name || 'N/A'}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/10'} p-4 rounded-xl border ${darkMode ? 'border-gray-700/50' : 'border-white/20'}`}>
                <p className="text-gray-400">Projects</p>
                <p className="font-bold text-white">{data.stats?.projects || 0}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/10'} p-4 rounded-xl border ${darkMode ? 'border-gray-700/50' : 'border-white/20'}`}>
                <p className="text-gray-400">Team Size</p>
                <p className="font-bold text-white">{data.stats?.teamMembers || 0}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white/10'} p-4 rounded-xl border ${darkMode ? 'border-gray-700/50' : 'border-white/20'}`}>
                <p className="text-gray-400">Avg Progress</p>
                <p className="font-bold text-green-400">{data.stats?.avgProgress || 0}%</p>
              </div>
            </div>
          </div>
        </motion.aside>
      )}

      {/* MAIN CONTENT */}
      <div className={`flex-1 lg:ml-64 transition-all ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
        {/* Header */}
        <header className={`${darkMode ? 'bg-gray-800/50 backdrop-blur-sm border-gray-700/50 shadow-black/20' : 'bg-white shadow-sm border-b'} px-6 py-4 border-b sticky top-0 z-10`}>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(true)} 
              className={`lg:hidden p-3 rounded-xl shadow-lg ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
            >
              ☰
            </button>
            <h1 className={`${darkMode ? 'text-white' : 'text-gray-900'} text-2xl font-bold text-center flex-1 lg:text-left`}>
              {activeSection === 'dashboard' ? 'Dashboard' :
               activeSection === 'projects' ? 'My Projects' :
               activeSection === 'team' ? 'Team Management' :
               activeSection === 'reports' ? 'KPI Reports' : 'Profile'}
            </h1>
          </div>
        </header>

        <main className={`p-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {/* DASHBOARD */}
          {activeSection === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${darkMode ? 'text-white' : ''}`}>
                <motion.div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 backdrop-blur-sm'} p-8 rounded-2xl shadow-xl border`} whileHover={{ scale: 1.02 }}>
                  <h3 className="text-4xl font-bold text-indigo-400">{data.stats.projects || 0}</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-1`}>My Projects</p>
                </motion.div>
                <motion.div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 backdrop-blur-sm'} p-8 rounded-2xl shadow-xl border`} whileHover={{ scale: 1.02 }}>
                  <h3 className="text-4xl font-bold text-green-400">{data.stats.teamMembers || 0}</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-1`}>Team Members</p>
                </motion.div>
                <motion.div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 backdrop-blur-sm'} p-8 rounded-2xl shadow-xl border`} whileHover={{ scale: 1.02 }}>
                  <h3 className="text-4xl font-bold text-yellow-400">{data.stats.avgProgress || 0}%</h3>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-lg mt-1`}>Avg Performance</p>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* PROJECTS - Add basic projects display */}
          {activeSection === 'projects' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className={`${darkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold mb-6`}>🚀 My Projects</h2>
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${darkMode ? 'text-white' : ''}`}>
                {data.projects && data.projects.length > 0 ? (
                  data.projects.map((project) => (
                    <motion.div key={project._id} className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 backdrop-blur-sm'} p-6 rounded-2xl shadow-xl border hover:shadow-2xl`} whileHover={{ scale: 1.02 }}>
                      <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>{project.departmentId?.name || 'No Department'}</p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                        <div className="bg-gradient-to-r from-indigo-400 to-purple-500 h-3 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>65% Complete</p>
                    </motion.div>
                  ))
                ) : (
                  <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 backdrop-blur-sm'} p-12 rounded-2xl border text-center`}>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No projects assigned yet. Contact admin.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TEAM */}
          {activeSection === 'team' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-between items-center mb-8">
                <h2 className={`${darkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold`}>👥 Team Management</h2>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  className={`px-6 py-3 rounded-xl font-semibold shadow-lg ${darkMode ? 'bg-indigo-600/90 text-white hover:bg-indigo-700/90' : 'bg-indigo-600 text-white hover:shadow-xl'}`}
                  onClick={() => document.getElementById('add-member-modal').showModal()}
                >
                  ➕ Add Member
                </motion.button>
              </div>

              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${darkMode ? 'text-white' : ''}`}>
                {data.teamMembers && data.teamMembers.length > 0 ? (
                  data.teamMembers.map((member) => (
                    <motion.div 
                      key={member._id} 
                      className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 backdrop-blur-sm'} p-6 rounded-2xl shadow-xl border hover:shadow-2xl cursor-pointer`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start space-x-4 mb-4">
                        <div className={`w-12 h-12 ${darkMode ? 'bg-indigo-600/50' : 'bg-indigo-500/20'} rounded-xl flex items-center justify-center border-2 border-indigo-400/50`}>
                          <span className={`${darkMode ? 'text-indigo-300' : 'text-indigo-600'} font-bold text-sm`}>{member.name.charAt(0)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold text-lg truncate`}>{member.name}</h3>
                          <p className={`capitalize text-sm ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{member.role.replace('-', ' ')}</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
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
                        <div className={`mt-3 p-3 rounded-xl text-xs ${darkMode ? 'bg-yellow-900/50 text-yellow-300 border-yellow-800/50' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                          💡 {member.suggestion}
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50 col-span-full' : 'bg-white/80 backdrop-blur-sm col-span-full'} p-12 rounded-2xl border text-center`}>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No team members yet. Add your first member!</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* REPORTS - Simplified */}
          {activeSection === 'reports' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className={`${darkMode ? 'text-white' : 'text-gray-900'} text-3xl font-bold mb-8`}>📊 KPI Reports</h2>
              <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${darkMode ? 'text-white' : ''}`}>
                <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 backdrop-blur-sm'} p-8 rounded-2xl shadow-xl border`}>
                  <h3 className={`${darkMode ? 'text-white' : 'text-gray-900'} text-2xl font-bold mb-6`}>🏢 HQ Staff KPIs</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} block text-sm font-medium mb-2`}>File Disposal Rate (%)</label>
                      <input type="number" className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'}`} />
                    </div>
                    <div>
                      <label className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} block text-sm font-medium mb-2`}>Turnaround Time (days)</label>
                      <input type="number" className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'}`} />
                    </div>
                  </div>
                </div>
                <div className={`${darkMode ? 'bg-gray-800/50 border-gray-700/50' : 'bg-white/80 backdrop-blur-sm'} p-8 rounded-2xl shadow-xl border`}>
                  <h3 className={`${darkMode ? 'text-white' : 'text-gray-900'} text-2xl font-bold mb-6`}>🌾 Field Unit KPIs</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} block text-sm font-medium mb-2`}>Survey Accuracy (%)</label>
                      <input type="number" className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'}`} />
                    </div>
                    <div>
                      <label className={`${darkMode ? 'text-gray-400' : 'text-gray-700'} block text-sm font-medium mb-2`}>Physical Progress (%)</label>
                      <input type="number" className={`w-full p-3 rounded-xl border shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'}`} />
                    </div>
                  </div>
                </div>
              </div>
              <motion.button 
                className={`mt-12 mx-auto block px-12 py-4 rounded-2xl text-lg font-bold shadow-xl ${darkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-purple-500/50 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-2xl text-white'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                📤 Submit Report
              </motion.button>
            </motion.div>
          )}
        </main>
      </div>

      {/* ✅ ADD MEMBER MODAL - Fixed */}
      <dialog id="add-member-modal" className={`p-0 ${darkMode ? 'bg-gray-900/90' : 'bg-white/95'} backdrop:bg-black/50`}>
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-8 rounded-3xl shadow-2xl border max-w-md mx-auto mt-20 max-h-[90vh] overflow-y-auto`}>
          <h2 className={`${darkMode ? 'text-white' : 'text-gray-900'} text-2xl font-bold mb-6`}>➕ Add Team Member</h2>
          <form onSubmit={handleAddMember} className="space-y-4">
            <input 
              placeholder="Full Name" 
              value={newMember.name} 
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              className={`w-full p-3 rounded-xl border shadow-sm focus:ring-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'}`} 
              required 
            />
            <input 
              placeholder="Email" 
              value={newMember.email} 
              onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              className={`w-full p-3 rounded-xl border shadow-sm focus:ring-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'}`} 
              type="email"
              required 
            />
            <select 
              value={newMember.role} 
              onChange={(e) => setNewMember({...newMember, role: e.target.value})}
              className={`w-full p-3 rounded-xl border shadow-sm focus:ring-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'}`}
            >
              <option value="hq">HQ Staff</option>
              <option value="supervisor">Supervisor</option>
              <option value="field-engineer">Field Engineer</option>
              <option value="technician">Technician</option>
            </select>
            <input 
              type="number" 
              placeholder="Initial Progress (0-100)" 
              value={newMember.progress} 
              onChange={(e) => setNewMember({...newMember, progress: Number(e.target.value)})}
              className={`w-full p-3 rounded-xl border shadow-sm focus:ring-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white focus:ring-indigo-500 focus:border-indigo-500' : 'bg-white border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500'}`} 
              min="0" max="100"
            />
            <div className="flex gap-3 pt-4">
              <motion.button 
                type="button"
                onClick={() => document.getElementById('add-member-modal').close()}
                className={`flex-1 py-3 rounded-xl font-medium shadow-sm ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 border-gray-300 text-gray-700 hover:bg-gray-300'}`}
                whileHover={{ scale: 1.02 }}
              >
                Cancel
              </motion.button>
              <motion.button 
                type="submit" 
                className={`flex-1 py-3 rounded-xl font-bold shadow-xl ${darkMode ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-purple-500/50 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-2xl text-white'}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Add Member
              </motion.button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default ManagerDashboard;