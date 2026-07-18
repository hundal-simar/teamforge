import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  refreshToken: {
    type: String,
    select: false
  }
}, { timestamps: true });


userSchema.index({email:1}, {unique:true});
const User = mongoose.model('User', userSchema);
export default User;