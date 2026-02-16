const mongoose = require('mongoose');

const summarySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    keyPoints: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
summarySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Summary', summarySchema);
