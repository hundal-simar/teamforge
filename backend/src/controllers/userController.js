import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs/promises';

// PATCH /api/users/me
export const updateProfile = async (req, res) => {
  try {
    const { username } = req.body;

    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const user = await User.findById(req.user._id);
    if (username) user.username = username.trim();
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// POST /api/users/me/avatar  (multipart/form-data, field name: 'file')
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `devsync/avatars/${req.user._id}`,
      resource_type: 'image',
      transformation: [{ width: 200, height: 200, crop: 'fill' }],
    });

    await fs.unlink(req.file.path).catch((err) => console.error('Temp file cleanup failed:', err));

    const user = await User.findById(req.user._id);

    // if replacing an existing avatar, clean up the old Cloudinary asset too
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
    }

    user.avatar = result.secure_url;
    user.avatarPublicId = result.public_id; // needed to delete/replace later — add this field if User.js doesn't have it
    await user.save();

    res.status(200).json(user);
  } catch (err) {
    if (req.file?.path) await fs.unlink(req.file.path).catch(() => {});
    console.error(err);
    res.status(500).json({ message: 'Server error uploading avatar' });
  }
};