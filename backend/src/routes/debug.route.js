import express from 'express';

const router = express.Router();

// Debug route disabled - returns 404 in all environments
router.get('/online-sockets', (req, res) => {
  return res.status(404).json({ error: 'Not available' });
});

export default router;
