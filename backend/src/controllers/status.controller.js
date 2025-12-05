import StatusUpdate from '../models/StatusUpdate.js';
import { getReceiverSocketId, io } from '../lib/socket.js';

export const createStatus = async (req, res) => {
  try {
    const { text, image, expiresInHours = 24 } = req.body;
    const userId = req.user._id;
    const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

    const status = new StatusUpdate({ user: userId, text, image, expiresAt, viewers: [] });
    await status.save();

    const populated = await StatusUpdate.findById(status._id).populate('user', '-password').populate('viewers', '-password');

    // emit to all online users that a new status exists
    try {
      io.emit('statusCreated', populated);
    } catch (e) {
      console.warn('Failed to emit statusCreated', e.message || e);
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error('createStatus error', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listStatuses = async (req, res) => {
  try {
    // return non-expired statuses, sorted by createdAt desc
    const now = new Date();
    const statuses = await StatusUpdate.find({ expiresAt: { $gt: now } }).populate('user', '-password').populate('viewers', '-password').sort({ createdAt: -1 });
    res.json(statuses);
  } catch (error) {
    console.error('listStatuses error', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const markViewed = async (req, res) => {
  try {
    const { id } = req.params; // status id
    const viewerId = req.user._id;
    const status = await StatusUpdate.findById(id);
    if (!status) return res.status(404).json({ message: 'Status not found' });
    if (!status.viewers.some((v) => String(v) === String(viewerId))) {
      status.viewers.push(viewerId);
      await status.save();
    }

    const populated = await StatusUpdate.findById(id).populate('user', '-password').populate('viewers', '-password');

    // notify owner that someone viewed
    try {
      const ownerSocket = getReceiverSocketId(String(status.user));
      if (ownerSocket) io.to(ownerSocket).emit('statusViewed', { statusId: id, viewerId });
    } catch (e) {
      console.warn('Failed to emit statusViewed', e.message || e);
    }

    res.json(populated);
  } catch (error) {
    console.error('markViewed error', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = await StatusUpdate.findById(id);
    if (!status) return res.status(404).json({ message: 'Status not found' });
    // only owner can delete
    if (String(status.user) !== String(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    await status.deleteOne();
    io.emit('statusDeleted', { statusId: id });
    res.json({ success: true });
  } catch (error) {
    console.error('deleteStatus error', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
