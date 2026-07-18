import Workspace from "./Workspace";
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    workspace: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    columns: [{
        id: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        order: {
            type: Number,
            required: true
        }
    }],
},    { timestamps: true });

projectSchema.index({workspace: 1, name: 1}, {unique: true});
const Project = mongoose.model('Project', projectSchema);
export default Project;