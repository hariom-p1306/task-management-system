const taskService = require('../services/task.service');

class TaskController {
  getTasks = (req, res, next) => {
    try {
      const tasks = taskService.getAllTasks(req.query);
      res.status(200).json({ success: true, count: tasks.length, data: tasks });
    } catch (error) {
      next(error);
    }
  };

  getTaskById = (req, res, next) => {
    try {
      const task = taskService.getTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  };

  createTask = (req, res, next) => {
    try {
      const { title, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required' });
      }
      const newTask = taskService.createTask(req.body);
      res.status(201).json({ success: true, data: newTask });
    } catch (error) {
      next(error);
    }
  };

  updateTask = (req, res, next) => {
    try {
      const updated = taskService.updateTask(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteTask = (req, res, next) => {
    try {
      const deleted = taskService.deleteTask(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Task not found' });
      }
      res.status(200).json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new TaskController();