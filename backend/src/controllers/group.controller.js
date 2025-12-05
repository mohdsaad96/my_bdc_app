import Group from '../models/group.model.js';
import User from '../models/user.model.js';
import { getReceiverSocketId, io } from '../lib/socket.js';

export const createGroup = async (req, res) => {
  try {
    const { name, members = [], profilePic, description } = req.body;

    if (!name) return res.status(400).json({ message: 'Group name is required' });

    // ensure creator is a member
    const creatorId = req.user && req.user._id;
    const uniqueMembers = Array.from(new Set([...(members || []), String(creatorId)]));

    const group = new Group({
      name,
      profilePic,
      members: uniqueMembers,
      createdBy: creatorId,
      description,
    });

    await group.save();

    const populated = await Group.findById(group._id).populate('members', '-password');

    // emit groupCreated to all members (if connected)
    try {
      const memberIds = populated.members.map((m) => String(m._id));
      memberIds.forEach((mid) => {
        const sid = getReceiverSocketId(mid);
        if (sid) io.to(sid).emit('groupCreated', populated);
      });
    } catch (e) {
      console.warn('Failed to emit groupCreated:', e.message || e);
    }

    res.status(201).json(populated);
  } catch (error) {
    console.error('createGroup error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const group = await Group.findById(id).populate('members', '-password');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    console.error('getGroup error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listGroupsForUser = async (req, res) => {
  try {
    const userId = req.user && req.user._id;
    const groups = await Group.find({ members: userId }).populate('members', '-password');
    res.json(groups);
  } catch (error) {
    console.error('listGroupsForUser error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addMember = async (req, res) => {
  try {
    const { id } = req.params; // group id
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ message: 'memberId is required' });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const exists = group.members.some((m) => String(m) === String(memberId));
    if (exists) return res.status(400).json({ message: 'User already a member' });

    group.members.push(memberId);
    await group.save();

    const populated = await Group.findById(id).populate('members', '-password');

    // emit groupUpdated/memberAdded to all members
    try {
      const memberIds = populated.members.map((m) => String(m._id));
      memberIds.forEach((mid) => {
        const sid = getReceiverSocketId(mid);
        if (sid) io.to(sid).emit('groupUpdated', populated);
      });
    } catch (e) {
      console.warn('Failed to emit groupUpdated after addMember:', e.message || e);
    }

    res.json(populated);
  } catch (error) {
    console.error('addMember error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { id } = req.params; // group id
    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ message: 'memberId is required' });

    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.members = group.members.filter((m) => String(m) !== String(memberId));
    await group.save();

    const populated = await Group.findById(id).populate('members', '-password');

    // emit groupUpdated to remaining members and notify removed member if connected
    try {
      const memberIds = populated.members.map((m) => String(m._id));
      memberIds.forEach((mid) => {
        const sid = getReceiverSocketId(mid);
        if (sid) io.to(sid).emit('groupUpdated', populated);
      });
      // notify removed member (if connected) that they were removed
      const removedSid = getReceiverSocketId(memberId);
      if (removedSid) io.to(removedSid).emit('removedFromGroup', { groupId: id });
    } catch (e) {
      console.warn('Failed to emit groupUpdated after removeMember:', e.message || e);
    }

    res.json(populated);
  } catch (error) {
    console.error('removeMember error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const group = await Group.findByIdAndUpdate(id, updates, { new: true }).populate('members', '-password');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // emit groupUpdated to members
    try {
      const memberIds = group.members.map((m) => String(m._id));
      memberIds.forEach((mid) => {
        const sid = getReceiverSocketId(mid);
        if (sid) io.to(sid).emit('groupUpdated', group);
      });
    } catch (e) {
      console.warn('Failed to emit groupUpdated after updateGroup:', e.message || e);
    }

    res.json(group);
  } catch (error) {
    console.error('updateGroup error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
