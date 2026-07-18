import mongoose from 'mongoose';
import Task from './Task.js';
import User from './User.js';

const commentSchema = new mongoose.Schema({
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    mentions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });


commentSchema.index({task: 1, author: 1, text: 1}, {unique: false});
const Comment = mongoose.model('Comment', commentSchema);
export default Comment;