import mongoose from 'mongoose';
import Project from './Project.js';
import User from './User.js';

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    project: {  
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    columnId: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        default: null
    },
    labels: [{
        type: String
    }],
    attachments: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        }
    }],
    subtasks: [{
        title: {
            type: String,
            required: true
        },
        isDone: {
            type: Boolean,
            default: false
        }
    }]
}, { timestamps: true });

taskSchema.index({ project: 1 });
const Task = mongoose.model('Task', taskSchema);
export default Task;