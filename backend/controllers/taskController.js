const Task = require('../models/Task');

// GET tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { projectId, status, search, page = 1, limit = 10 } = req.query;

    let query = {};

    // Role based filtering
    if (req.user.role !== 'admin') {
      query.assignedTo = req.user._id; // Member sirf apne tasks dekhega
    }

    if (projectId) query.project = projectId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } }, // Case insensitive search
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit; // Pagination calculation
    const total = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 }) // Naye pehle
      .skip(skip)
      .limit(Number(limit));

    res.json({
      tasks,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST create task (Admin only)
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, deadline, assignedTo, projectId, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      deadline,
      assignedTo,
      project: projectId,
      priority,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'name');

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// PUT update task status
exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Member sirf apna assigned task update kar sakta hai
    if (
      req.user.role !== 'admin' &&
      task.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Updated document return karo
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// DELETE task (Admin only)
exports.deleteTask = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET dashboard stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    let matchQuery = {};
    if (req.user.role !== 'admin') {
      matchQuery.assignedTo = req.user._id;
    }

    const now = new Date();

    const [total, completed, pending, inProgress, overdue] = await Promise.all([
      Task.countDocuments(matchQuery),
      Task.countDocuments({ ...matchQuery, status: 'completed' }),
      Task.countDocuments({ ...matchQuery, status: 'pending' }),
      Task.countDocuments({ ...matchQuery, status: 'in-progress' }),
      Task.countDocuments({
        ...matchQuery,
        status: { $ne: 'completed' },
        deadline: { $lt: now }, // Deadline past ho gayi
      }),
    ]);

    res.json({ total, completed, pending, inProgress, overdue });
  } catch (error) {
    next(error);
  }
};