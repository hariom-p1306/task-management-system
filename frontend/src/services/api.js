const API_URL = import.meta.env.VITE_API_URL || 'https://task-management-system1-i7zm.onrender.com/api';
export const fetchTasks = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/tasks?${query}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const createTask = async (taskData) => {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const updateTask = async (id, taskData) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};

export const deleteTask = async (id) => {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE'
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};