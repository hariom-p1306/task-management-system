let tasks = [
  {
    id: "1",
    title: "Complete assignment",
    description: "Build the full-stack task manager for Cleanomatics",
    status: "in_progress",
    priority: "high",
    dueDate: "2026-10-08",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

class TaskService {
  getAllTasks(query) {
    let result = [...tasks];

    // Search filter
    if (query.search) {
      const searchStr = query.search.toLowerCase();
      result = result.filter(
        t => t.title.toLowerCase().includes(searchStr) || 
             t.description.toLowerCase().includes(searchStr)
      );
    }

    // Status filter
    if (query.status) {
      result = result.filter(t => t.status === query.status);
    }

    // Priority filter
    if (query.priority) {
      result = result.filter(t => t.priority === query.priority);
    }

    // Sorting
    if (query.sortBy) {
      result.sort((a, b) => {
        if (query.sortBy === 'priority') {
          const weights = { high: 3, medium: 2, low: 1 };
          return weights[b.priority] - weights[a.priority];
        }
        if (query.sortBy === 'dueDate') {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    return result;
  }

  getTaskById(id) {
    return tasks.find(t => t.id === id);
  }

  createTask(data) {
    const newTask = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      status: data.status || 'pending',
      priority: data.priority || 'medium',
      dueDate: data.dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    tasks.push(newTask);
    return newTask;
  }

  updateTask(id, data) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...data,
      updatedAt: new Date().toISOString()
    };
    return tasks[index];
  }

  deleteTask(id) {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    return true;
  }
}

module.exports = new TaskService();