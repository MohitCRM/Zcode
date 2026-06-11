const mongoose = require("mongoose");
const { Schema } = mongoose;

const seasonalStatsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true
    },
    seasonId: {
        type: Number,
        required: true,
        index: true
    },
    elo: {
        type: Number,
        required: true,
        default: 1200 
    },
    rank: {
        type: String,
        enum: ['Newbie', 'Adept', 'Expert', 'Honoured One', 'Monarch', 'God'],
        default: 'Newbie'
    },
    acceptedSubmissionsCount: {
        type: Number,
        default: 0
    },
    wrongSubmissionsCount: {
        type: Number,
        default: 0
    },
    // Array of unique calendar strings (e.g., ["2026-06-11", "2026-06-12"])
    checkInDays: [String],
    problemsSolved: [
        {
            type: Schema.Types.ObjectId,
            ref: "problem"
        }
    ]
}, { _id: false }); // Disable sub-document IDs to save space

const Seasonalstats = mongoose.model('seasonalstats',seasonalStatsSchema);
module.exports = Seasonalstats;