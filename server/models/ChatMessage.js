const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
    channel:   { type: String, required: true },
    username:  { type: String, required: true },
    message:   { type: String, required: true },
    timestamp: { type: Date,   default: Date.now },
    tags: {
        color:      String,
        subscriber: Boolean,
        mod:        Boolean,
        vip:        Boolean,
        emotes:     mongoose.Schema.Types.Mixed,
    }
});

chatMessageSchema.index({ channel: 1, timestamp: -1 });
chatMessageSchema.index({ username: 1 });
chatMessageSchema.index({ timestamp: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);