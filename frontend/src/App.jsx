import React, { useState, useEffect, useMemo } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from './services/api';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null); // Editing ke liye
  const [viewTask, setViewTask] = useState(null); // Details view ke liye

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    dueDate: ''
  });
  const [formError, setFormError] = useState('');

  // Debounced Search Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Tasks from Backend API
  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await fetchTasks({ 
        search: debouncedSearch, 
        status: statusFilter, 
        priority: priorityFilter, 
        sortBy 
      });
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [debouncedSearch, statusFilter, priorityFilter, sortBy]);

  // Pagination Logic
  const paginatedTasks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return tasks.slice(start, start + itemsPerPage);
  }, [tasks, currentPage]);

  const totalPages = Math.ceil(tasks.length / itemsPerPage) || 1;

  // Form Submit Handler (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFormError('Title and description are required.');
      return;
    }
    try {
      if (currentTask) {
        await updateTask(currentTask.id, formData);
      } else {
        await createTask(formData);
      }
      setIsFormOpen(false);
      setCurrentTask(null);
      setFormData({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' });
      setFormError('');
      loadTasks();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleEdit = (task) => {
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        loadTasks();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} min-h-screen transition-colors duration-200`}>
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 shadow-md bg-white dark:bg-gray-800">
        <h1 className="text-xl font-bold">Cleanomatics Task Manager</h1>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="px-3 py-1.5 rounded-md text-sm border dark:border-gray-700 bg-gray-100 dark:bg-gray-700 cursor-pointer"
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button 
            onClick={() => {
              setCurrentTask(null);
              setFormData({ title: '', description: '', status: 'pending', priority: 'medium', dueDate: '' });
              setIsFormOpen(true);
            }} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm cursor-pointer"
          >
            + Create Task
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Search by title or description..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 rounded-md border dark:bg-gray-800 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-md border dark:bg-gray-800 dark:border-gray-700 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 rounded-md border dark:bg-gray-800 dark:border-gray-700 text-sm"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-md border dark:bg-gray-800 dark:border-gray-700 text-sm"
          >
            <option value="createdAt">Sort by Created Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="dueDate">Sort by Due Date</option>
          </select>
        </div>

        {/* Loading, Error & Empty States */}
        {loading && <div className="text-center py-12 text-gray-500">Loading tasks...</div>}
        {error && <div className="text-center py-12 text-red-500">{error}</div>}
        
        {!loading && !error && tasks.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700">
            <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No tasks found.</p>
          </div>
        )}

        {/* Task Cards Grid */}
        {!loading && !error && tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedTasks.map(task => (
              <div key={task.id} className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow border dark:border-gray-700 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{task.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium uppercase ${
                      task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">{task.description}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-4">
                    <p>Status: <span className="font-medium capitalize">{task.status.replace('_', ' ')}</span></p>
                    <p>Due: {task.dueDate || 'No due date'}</p>
                    <p>Created: {new Date(task.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t dark:border-gray-700 text-sm">
                  <button onClick={() => setViewTask(task)} className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">View</button>
                  <button onClick={() => handleEdit(task)} className="text-amber-600 dark:text-amber-400 hover:underline cursor-pointer">Edit</button>
                  <button onClick={() => handleDelete(task.id)} className="text-red-600 dark:text-red-400 hover:underline cursor-pointer">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-sm">Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50 dark:border-gray-700 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </main>

      {/* Create / Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-xl">
            <h2 className="text-lg font-bold mb-4">{currentTask ? 'Edit Task' : 'Create New Task'}</h2>
            {formError && <p className="text-red-500 text-sm mb-3">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Title *</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                  placeholder="Task title..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description *</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                  placeholder="Task description..."
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Priority</label>
                  <select 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value})}
                    className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={formData.dueDate} 
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)} 
                  className="px-4 py-2 border rounded text-sm dark:border-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium cursor-pointer"
                >
                  {currentTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewTask && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full shadow-xl space-y-3">
            <h2 className="text-xl font-bold">{viewTask.title}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{viewTask.description}</p>
            <div className="text-xs space-y-1 pt-2 border-t dark:border-gray-700 text-gray-500 dark:text-gray-400">
              <p>Status: <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{viewTask.status.replace('_', ' ')}</span></p>
              <p>Priority: <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">{viewTask.priority}</span></p>
              <p>Due Date: <span className="text-gray-800 dark:text-gray-200">{viewTask.dueDate || 'None'}</span></p>
              <p>Created At: <span className="text-gray-800 dark:text-gray-200">{new Date(viewTask.createdAt).toLocaleString()}</span></p>
              <p>Updated At: <span className="text-gray-800 dark:text-gray-200">{new Date(viewTask.updatedAt).toLocaleString()}</span></p>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setViewTask(null)} 
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded text-sm font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}