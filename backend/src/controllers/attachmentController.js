import fs from 'fs/promises';
import cloudinary from '../config/cloudinary.js';
import { emitToProject } from '../socket/socketServer.js';

// POST /api/tasks/:id/attachments  (multipart/form-data, field name: 'file')
export const addAttachment = async (req, res) => {
  try {
    const task = req.task; // attached by isTaskMember
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `devsync/tasks/${task._id}`,
      resource_type: 'auto',
    });

    
    await fs.unlink(req.file.path).catch((err) => console.error('Temp file cleanup failed:', err));

    task.attachments.push({
      url: result.secure_url,
      publicId: result.public_id,
      name: req.file.originalname,
    });
    await task.save();

    emitToProject(task.project.toString(), 'task:updated', task);
    res.status(201).json(task);
  } catch (err) {
    
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    console.error(err);
    res.status(500).json({ message: 'Server error uploading attachment' });
  }
};

// DELETE /api/tasks/:id/attachments/:attachmentId
export const deleteAttachment = async (req, res) => {
  try {
    const task = req.task;
    const { attachmentId } = req.params;

    const attachment = task.attachments.id(attachmentId);
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    await cloudinary.uploader.destroy(attachment.publicId);

    attachment.deleteOne();
    await task.save();

    emitToProject(task.project.toString(), 'task:updated', task);
    res.status(200).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting attachment' });
  }
};