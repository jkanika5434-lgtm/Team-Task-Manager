const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // Ye User ka ID store karega
      ref: 'User', // User model se linked hai
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Array of user IDs
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', projectSchema);