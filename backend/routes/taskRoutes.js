const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getDashboardStats); // Dashboard ke liye
router.get('/', getTasks);
router.post('/', adminOnly, createTask);
router.put('/:id', updateTask);
router.delete('/:id', adminOnly, deleteTask);

module.exports = router;