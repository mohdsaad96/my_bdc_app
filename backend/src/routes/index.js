import express from 'express';
import authRoutes from './auth.route.js';
import messageRoutes from './message.route.js';
import userRoutes from './user.route.js';
import groupRoutes from './group.route.js';
import statusRoutes from './status.route.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/messages', messageRoutes);
router.use('/users', userRoutes);
router.use('/groups', groupRoutes);
router.use('/status', statusRoutes);

export default router;

