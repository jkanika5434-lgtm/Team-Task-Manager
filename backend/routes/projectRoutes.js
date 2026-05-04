const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  addMember,
  removeMember,
  getAllUsers,
} = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect); // Sab routes protected hain

router.get('/', getProjects);
router.post('/', adminOnly, createProject); // Sirf admin
router.get('/users', getAllUsers); // Users list for dropdown
router.put('/:id/members', adminOnly, addMember);
router.delete('/:id/members/:userId', adminOnly, removeMember);

module.exports = router;