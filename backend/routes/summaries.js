const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Summary = require('../models/Summary');

// Save new summary (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { fileName, fileType, summary, keyPoints } = req.body;

        const newSummary = new Summary({
            userId: req.userId,
            fileName,
            fileType,
            summary,
            keyPoints: keyPoints || []
        });

        await newSummary.save();

        res.status(201).json({
            message: 'Summary saved successfully',
            summary: newSummary
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's summary history (protected)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const summaries = await Summary.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({
            count: summaries.length,
            summaries
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete summary (protected)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const summary = await Summary.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!summary) {
            return res.status(404).json({ error: 'Summary not found' });
        }

        await summary.deleteOne();

        res.json({ message: 'Summary deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
