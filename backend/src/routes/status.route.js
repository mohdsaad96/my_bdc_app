import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { createStatus, listStatuses, markViewed, deleteStatus } from '../controllers/status.controller.js';

const router = express.Router();

router.post('/', protectRoute, createStatus);
router.get('/', protectRoute, listStatuses);
router.post('/:id/view', protectRoute, markViewed);
router.delete('/:id', protectRoute, deleteStatus);

export default router;
