import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import dotenv from 'dotenv';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';

dotenv.config();

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  user.refreshToken = refreshToken;
  await user.save();
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 15 * 60 * 1000, // 15 minutes
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust sameSite based on environment
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust sameSite based on environment
  });
  res.json({ message: 'Login successful' });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
    if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email and password' });
  }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = await User.create({ name, email, password });
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    await user.save();
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust sameSite based on environment
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust sameSite based on environment
    });
    const { inviteToken } = req.body;
    let joinedWorkspace = null;

    if (inviteToken) {
      const workspace = await Workspace.findOne({ 'inviteTokens.token': inviteToken });
      const inviteEntry = workspace?.inviteTokens.find((t) => t.token === inviteToken);

      if (workspace && inviteEntry && inviteEntry.expiresAt > new Date()) {
        const alreadyMember = workspace.members.some(
          (m) => m.user.toString() === newUser._id.toString()
        );
        if (!alreadyMember) {
          workspace.members.push({ user: newUser._id, role: inviteEntry.role });
        }
        workspace.inviteTokens = workspace.inviteTokens.filter((t) => t.token !== inviteToken);
        await workspace.save();
        joinedWorkspace = { id: workspace._id, slug: workspace.slug };
      }
    }
    res.status(201).json({ message: 'User created successfully', joinedWorkspace });
};

const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust sameSite based on environment
  });
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust sameSite based on environment
  });
  res.json({ message: 'Logout successful' });
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decoded.id).select('+refreshToken');
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);
        user.refreshToken = newRefreshToken;
        await user.save();
        res.cookie('token', newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
            maxAge: 15 * 60 * 1000, // 15 minutes
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust sameSite based on environment
        });
        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust sameSite based on environment
        });
        res.json({ message: 'Token refreshed successfully' });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }   
}

const getme = async (req, res) => {
  const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
}

export { login, register, logout, refreshToken, getme };
