const Project = require('../models/Project');
const User = require('../models/User');

// GET all projects
exports.getProjects = async (req, res, next) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      // Admin sab dekh sakta hai
      projects = await Project.find().populate('members', 'name email').populate('createdBy', 'name');
    } else {
      // Member sirf apne projects dekhega
      projects = await Project.find({ members: req.user._id })
        .populate('members', 'name email')
        .populate('createdBy', 'name');
    }
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// POST create project (Admin only)
exports.createProject = async (req, res, next) => {
  try {
    const { name, description, memberIds } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user._id,
      members: memberIds || [],
    });

    await project.populate('members', 'name email');
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// PUT add member to project
exports.addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Already member hai toh duplicate mat karo
    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User already a member' });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email');

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// DELETE remove member
exports.removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.members = project.members.filter(
      (member) => member.toString() !== req.params.userId
    );
    await project.save();
    res.json({ message: 'Member removed', project });
  } catch (error) {
    next(error);
  }
};

// GET all users (for adding to project)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role');
    res.json(users);
  } catch (error) {
    next(error);
  }
};