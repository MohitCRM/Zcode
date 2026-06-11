const mongoose = require("mongoose");
const { Schema } = mongoose;

const announcementSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    content: {
        type: String,
        required: true 
    },
    category: {
        type: String,
        enum: ["Season Update", "Patch Notes", "Maintenance", "General"],
        default: "General"
    },
    isPinned: {
        type: Boolean,
        default: false 
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    }
}, {
    timestamps: true 
});

announcementSchema.index({ isPinned: -1, createdAt: -1 });

const Announcement = mongoose.model("announcement", announcementSchema);
module.exports = Announcement;