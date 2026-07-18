import mongoose from 'mongoose';
import User from './User.js';

const workspaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',    
        },
        role: {
            type: String,
            enum: ['admin','owner',  'member'],
            default: 'member'
        }
    }
],
    inviteTokens: [{
        email: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        },
        expiresAt: {
            type: Date,
            required: true
        }
    }]
},
    { timestamps: true }); 

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;