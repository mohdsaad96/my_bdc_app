const express = require('express');
const router = express.Router();
const StatusUpdate = require('../models/StatusUpdate');

// Create a new status update
router.post('/', async (req, res) => {
  const { text, image } = req.body;
  const statusUpdate = new StatusUpdate({
    user: req.user._id,
    text,
    image,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  });
  try {
    await statusUpdate.save();
    res.status(201).send(statusUpdate);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;