import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

export default function MemberDashboard() {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [taskStatus, setTaskStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  const [evidence, setEvidence] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('memberTheme') || 'light');
  const [data, setData] = useState({
    member: {},
    tasks: [],
    evidences: [],
    stats: { totalTasks: 0, completedTasks: 0, pendingTasks: 0, avgProgress: 0 }
  });
  const [evidenceForm, setEvidenceForm] = useState({
    taskId: '',
    title: '',
    notes: '',
    fileUrl: '',
    fileName: '',
    fileType: ''
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    localStorage.setItem('memberTheme', theme);
  }, [theme]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/member/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load member dashboard');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/member/login';
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/tasks/member', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchTasks();
  }, [refreshKey]);

  const handleTaskUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tasks/${selectedTaskId}/status`,
        { status: taskStatus, progress, evidence },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedTaskId('');
      setTaskStatus('pending');
      setProgress(0);
      setEvidence('');
      setRefreshKey((prev) => prev + 1);
      alert('✅ Task updated!');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || 'Failed to update task'));
    }
  };

  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/member/evidence',
        evidenceForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEvidenceForm({
        taskId: '',
        title: '',
        notes: '',
        fileUrl: '',
        fileName: '',
        fileType: ''
      });
      setRefreshKey((prev) => prev + 1);
      alert('✅ Evidence submitted!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save evidence');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/member/login';
  };

  const member = data.member || {};

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status?.toLowerCase() === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status?.toLowerCase() === 'pending').length;
  const avgProgress = totalTasks
    ? Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / totalTasks)
    : 0;

  const isDark = theme === 'dark';

  const pageClass = isDark
    ? 'flex min-h-screen bg-slate-950 text-slate-100'
    : 'flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900';

  const cardClass = isDark
    ? 'bg-slate-900 border border-slate-800 text-slate-100'
    : 'bg-white text-gray-900';

  const mutedText = isDark ? 'text-slate-400' : 'text-gray-500';

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className={pageClass}>
      <aside className={isDark ? 'w-64 bg-slate-900 text-white border-r border-slate-800' : 'w-64 bg-gradient-to-b from-indigo-700 via-purple-800 to-indigo-900 text-white'}>
        <div className="h-16 flex items-center justify-center border-b border-white/20 font-bold">
          Member Portal
        </div>

        <div className="p-4 space-y-3">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition"
          >
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </button>

          {['dashboard', 'tasks', 'evidence', 'profile'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveSection(item)}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                activeSection === item ? 'bg-white/20' : 'hover:bg-white/10'
              }`}
            >
              {item}
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full mt-4 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 space-y-6">
        {activeSection === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 shadow-xl">
              <div className="absolute inset-0 bg-white/10 blur-3xl opacity-40" />
              <div className="relative">
                <p className="text-sm uppercase tracking-widest text-white/70">Total Tasks</p>
                <div className="mt-3 text-4xl font-bold">{totalTasks}</div>
                <div className="mt-4 h-2 rounded-full bg-white/20">
                  <div className="h-2 rounded-full bg-white" style={{ width: '100%' }} />
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 shadow-xl">
              <div className="relative">
                <p className="text-sm uppercase tracking-widest text-white/70">Completed</p>
                <div className="mt-3 text-4xl font-bold">{completedTasks}</div>
                <p className="mt-3 text-white/80">Tasks finished successfully</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 shadow-xl">
              <div className="relative">
                <p className="text-sm uppercase tracking-widest text-white/70">Pending</p>
                <div className="mt-3 text-4xl font-bold">{pendingTasks}</div>
                <p className="mt-3 text-white/80">Waiting for update</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 text-white p-6 shadow-xl">
              <div className="relative">
                <p className="text-sm uppercase tracking-widest text-white/70">Avg Progress</p>
                <div className="mt-3 text-4xl font-bold">{avgProgress}%</div>
                <p className="mt-3 text-white/80">Overall completion</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'tasks' && (
          <div className="space-y-6">
            <div className={`${cardClass} rounded-2xl p-6 shadow`}>
              <h2 className="text-2xl font-bold mb-4">Update Task Status</h2>
              <form onSubmit={handleTaskUpdate} className="space-y-4">
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-transparent"
                  required
                >
                  <option value="">Select Task</option>
                  {tasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title} ({task.status})
                    </option>
                  ))}
                </select>

                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                  className="w-full p-3 border rounded-xl bg-transparent"
                  placeholder="Progress %"
                />

                <textarea
                  value={evidence}
                  onChange={(e) => setEvidence(e.target.value)}
                  className="w-full p-3 border rounded-xl bg-transparent"
                  placeholder="Evidence / remarks"
                />

                <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl">
                  Save Task Update
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div key={task._id} className={`${cardClass} rounded-2xl p-6 shadow`}>
                    <h4 className="text-xl font-semibold">{task.title}</h4>
                    <p className={mutedText}>{task.description}</p>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5">
                        <p className={mutedText}>Project</p>
                        <p className="font-semibold">{task.projectId?.name || 'NA'}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5">
                        <p className={mutedText}>Department</p>
                        <p className="font-semibold">{task.departmentId?.name || 'NA'}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm">
                      <p className="font-medium">Status: {task.status}</p>
                      <p>{task.progress || 0}% complete</p>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 my-3">
                      <div
                        className="bg-indigo-600 h-3 rounded-full"
                        style={{ width: `${task.progress || 0}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className={`${cardClass} rounded-2xl p-6 shadow col-span-full`}>
                  No tasks assigned yet.
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'evidence' && (
          <div className={`${cardClass} rounded-2xl p-6 shadow`}>
            <h2 className="text-2xl font-bold mb-4">Evidence</h2>

            <form onSubmit={handleEvidenceSubmit} className="space-y-4">
              <select
                value={evidenceForm.taskId}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, taskId: e.target.value })}
                className="w-full p-3 border rounded-xl bg-transparent"
                required
              >
                <option value="">Select Task</option>
                {tasks.map((task) => (
                  <option key={task._id} value={task._id}>
                    {task.title}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Evidence Title"
                value={evidenceForm.title}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, title: e.target.value })}
                className="w-full p-3 border rounded-xl bg-transparent"
              />

              <textarea
                placeholder="Notes"
                value={evidenceForm.notes}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, notes: e.target.value })}
                className="w-full p-3 border rounded-xl bg-transparent"
              />

              <input
                type="text"
                placeholder="File URL"
                value={evidenceForm.fileUrl}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, fileUrl: e.target.value })}
                className="w-full p-3 border rounded-xl bg-transparent"
              />

              <input
                type="text"
                placeholder="File Name"
                value={evidenceForm.fileName}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, fileName: e.target.value })}
                className="w-full p-3 border rounded-xl bg-transparent"
              />

              <input
                type="text"
                placeholder="File Type"
                value={evidenceForm.fileType}
                onChange={(e) => setEvidenceForm({ ...evidenceForm, fileType: e.target.value })}
                className="w-full p-3 border rounded-xl bg-transparent"
              />

              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl">
                Submit Evidence
              </button>
            </form>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className={`${cardClass} rounded-3xl p-8 shadow-2xl max-w-5xl`}>
            <h3 className="text-2xl font-bold mb-6">Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Name</p>
                <p className="font-semibold">{member.name || 'NA'}</p>
              </div>
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Email</p>
                <p className="font-semibold">{member.email || 'NA'}</p>
              </div>
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Department</p>
                <p className="font-semibold">{member.departmentId?.name || 'NA'}</p>
              </div>
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Project</p>
                <p className="font-semibold">{member.projectId?.name || 'NA'}</p>
              </div>
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Role</p>
                <p className="font-semibold">{member.role || 'NA'}</p>
              </div>
              <div className="p-4 rounded-xl border border-black/10 dark:border-white/10">
                <p className={mutedText}>Current Progress</p>
                <p className="font-semibold">{avgProgress}%</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}