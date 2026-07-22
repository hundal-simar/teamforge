import crypto from 'crypto';
import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import { sendInviteEmail } from '../utils/mailer.js';

const INVITE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// POST /api/workspaces/:id/invite
export const inviteTeammate = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role = 'member' } = req.body;

    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const workspace = await Workspace.findById(id);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    const requester = workspace.members.find(
      (m) => m.user.toString() === req.user._id.toString()
    );
    const isOwner = workspace.owner.toString() === req.user._id.toString();
    if (!isOwner && !(requester && requester.role === 'admin')) {
      return res.status(403).json({ message: 'Not authorized to invite' });
    }

    // Prevent duplicate active invite for same email
    workspace.inviteTokens = workspace.inviteTokens.filter(
      (t) => !(t.email === email && t.expiresAt > new Date())
    );

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_MS);

    // role now stored on the token itself
    workspace.inviteTokens.push({ email, token, role, expiresAt });
    await workspace.save();

    const inviteLink = `${process.env.CLIENT_URL}/join/${token}`;
    await sendInviteEmail(email, workspace.name, inviteLink);

    res.status(200).json({ message: 'Invite sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error sending invite' });
  }
};

// POST /api/workspaces/join/:token
export const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;

    const workspace = await Workspace.findOne({ 'inviteTokens.token': token });
    if (!workspace) {
      return res.status(400).json({ message: 'Invalid or expired invite link' });
    }

    const inviteEntry = workspace.inviteTokens.find((t) => t.token === token);
    if (!inviteEntry || inviteEntry.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invite link has expired' });
    }

    const invitedUser = await User.findOne({ email: inviteEntry.email });
    if (!invitedUser) {
      return res.status(200).json({
        needsRegistration: true,
        email: inviteEntry.email,
        token,
      });
    }

    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === invitedUser._id.toString()
    );

    if (!alreadyMember) {
      // use the role stored on the invite token, not a hardcoded default
      workspace.members.push({ user: invitedUser._id, role: inviteEntry.role });
    }

    workspace.inviteTokens = workspace.inviteTokens.filter((t) => t.token !== token);
    await workspace.save();

    res.status(200).json({
      message: 'Successfully joined workspace',
      workspaceId: workspace._id,
      workspaceSlug: workspace.slug,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error accepting invite' });
  }
};