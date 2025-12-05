import express from 'express';
import {
  createGroup,
  getGroup,
  listGroupsForUser,
  addMember,
  removeMember,
  updateGroup,
} from '../controllers/group.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Create a group
router.post('/', protectRoute, createGroup);

// Get group by id
router.get('/:id', protectRoute, getGroup);

// Update group
router.put('/:id', protectRoute, updateGroup);

// Add member
router.post('/:id/add-member', protectRoute, addMember);

// Remove member
router.post('/:id/remove-member', protectRoute, removeMember);

// List groups for current user
router.get('/', protectRoute, listGroupsForUser);

export default router;
