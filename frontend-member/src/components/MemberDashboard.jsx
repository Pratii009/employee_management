import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function MemberDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    member: {},
    tasks: [],
    evidences: [],
    stats: { totalTasks: 0, completedTasks: 0, pendingTasks: 0, avgProgress: 0 }
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [progressForm, setProgressForm] = useState({ progress: 0, status: 'In Progress' });
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
    fetchDashboard();
  }, [refreshKey]);

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

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/member/tasks/${selectedTask._id}/progress`,
        progressForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefreshKey((prev) => prev + 1);
      setSelectedTask(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update progress');
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
      setRefreshKey((prev) => prev + 1);
      setEvidenceForm({
        taskId: '',
        title: '',
        notes: '',
        fileUrl: '',
        fileName: '',
        fileType: ''
      });
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
  const tasks = data.tasks || [];
  const evidences = data.evidences || [];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
      <aside className="w-64 bg-gradient-to-b from-indigo-700 via-purple-800 to-indigo-900 text-white">
        <div className="h-16 flex items-center justify-center border-b border-white/20 font-bold">
          Member Portal
        </div>
        <div className="p-4 space-y-2">
          {['dashboard', 'tasks', 'evidence', 'profile'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveSection(item)}
              className={`w-full text-left px-4 py-3 rounded-xl ${activeSection === item ? 'bg-white/20' : 'hover:bg-white/10'}`}
            >
              {item}
            </button>
          ))}
          <button onClick={handleLogout} className="w-full mt-4 px-4 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 space-y-6">
        {activeSection === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-6 shadow">Total Tasks: {data.stats.totalTasks}</div>
            <div className="bg-white rounded-2xl p-6 shadow">Completed: {data.stats.completedTasks}</div>
            <div className="bg-white rounded-2xl p-6 shadow">Pending: {data.stats.pendingTasks}</div>
            <div className="bg-white rounded-2xl p-6 shadow">Avg Progress: {data.stats.avgProgress}%</div>
          </div>
        )}

        {activeSection === 'tasks' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.length > 0 ? tasks.map((task) => (
              <div key={task._id} className="bg-white rounded-2xl p-6 shadow">
                <h4 className="text-xl font-semibold">{task.title}</h4>
                <p>{task.description}</p>
                <p className="text-sm mt-2">Project: {task.projectId?.name || 'NA'}</p>
                <p className="text-sm">Department: {task.departmentId?.name || 'NA'}</p>
                <p className="text-sm">Status: {task.status}</p>
                <div className="w-full bg-gray-200 rounded-full h-3 my-3">
                  <div className="bg-indigo-600 h-3 rounded-full" style={{ width: `${task.progress || 0}%` }} />
                </div>
                <p className="text-sm">{task.progress || 0}% complete</p>
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setProgressForm({ progress: task.progress || 0, status: task.status });
                  }}
                  className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white"
                >
                  Update Progress
                </button>
              </div>
            )) : (
              <div className="bg-white rounded-2xl p-6 shadow col-span-full">No tasks assigned yet.</div>
            )}
          </div>
        )}

        {activeSection === 'evidence' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow">
              <h3 className="text-2xl font-bold mb-4">Add Evidence</h3>
              <form onSubmit={handleEvidenceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  className="p-3 rounded-xl border"
                  value={evidenceForm.taskId}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, taskId: e.target.value })}
                  required
                >
                  <option value="">Select Task</option>
                  {tasks.map((task) => (
                    <option key={task._id} value={task._id}>{task.title}</option>
                  ))}
                </select>
                <input
                  className="p-3 rounded-xl border"
                  placeholder="Evidence Title"
                  value={evidenceForm.title}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, title: e.target.value })}
                  required
                />
                <input
                  className="p-3 rounded-xl border md:col-span-2"
                  placeholder="File URL"
                  value={evidenceForm.fileUrl}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, fileUrl: e.target.value })}
                />
                <input
                  className="p-3 rounded-xl border"
                  placeholder="File Name"
                  value={evidenceForm.fileName}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, fileName: e.target.value })}
                />
                <input
                  className="p-3 rounded-xl border"
                  placeholder="File Type"
                  value={evidenceForm.fileType}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, fileType: e.target.value })}
                />
                <textarea
                  className="p-3 rounded-xl border md:col-span-2"
                  placeholder="Notes"
                  value={evidenceForm.notes}
                  onChange={(e) => setEvidenceForm({ ...evidenceForm, notes: e.target.value })}
                />
                <button type="submit" className="md:col-span-2 px-4 py-3 rounded-xl bg-green-600 text-white">
                  Save Evidence
                </button>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evidences.map((ev) => (
                <div key={ev._id} className="bg-white rounded-2xl p-6 shadow">
                  <h4 className="font-semibold">{ev.title}</h4>
                  <p className="text-sm text-gray-600">{ev.notes}</p>
                  <p className="text-sm">Task: {ev.taskId?.title || 'NA'}</p>
                  {ev.fileUrl ? (
                    <a className="text-indigo-600 text-sm underline" href={ev.fileUrl} target="_blank" rel="noreferrer">
                      View File
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-4xl">
            <h3 className="text-2xl font-bold mb-6">Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border"><p className="text-gray-500">Name</p><p className="font-semibold">{member.name || 'NA'}</p></div>
              <div className="p-4 rounded-xl border"><p className="text-gray-500">Email</p><p className="font-semibold">{member.email || 'NA'}</p></div>
              <div className="p-4 rounded-xl border"><p className="text-gray-500">Department</p><p className="font-semibold">{member.departmentId?.name || 'NA'}</p></div>
              <div className="p-4 rounded-xl border"><p className="text-gray-500">Project</p><p className="font-semibold">{member.projectId?.name || 'NA'}</p></div>
              <div className="p-4 rounded-xl border"><p className="text-gray-500">Role</p><p className="font-semibold">{member.role || 'NA'}</p></div>
              <div className="p-4 rounded-xl border"><p className="text-gray-500">Current Progress</p><p className="font-semibold">{data.stats.avgProgress || 0}%</p></div>
            </div>
          </div>
        )}
      </main>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Update Progress</h3>
            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <input
                type="number"
                min="0"
                max="100"
                className="w-full p-3 rounded-xl border"
                value={progressForm.progress}
                onChange={(e) => setProgressForm({ ...progressForm, progress: Number(e.target.value) })}
              />
              <select
                className="w-full p-3 rounded-xl border"
                value={progressForm.status}
                onChange={(e) => setProgressForm({ ...progressForm, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedTask(null)} className="flex-1 py-3 rounded-xl bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}