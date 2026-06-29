const mongoose = require("mongoose");
const { Schema } = mongoose;
const tierdata = require('../utils/tiersystem');

const leaderboardSchema = new Schema({
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
        default: 100 
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
    checkInDays: [String],
    problemsSolved: [
        {
            type: Schema.Types.ObjectId,
            ref: "problem"
        }
    ]
}, { 
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

leaderboardSchema.index({ userId: 1, seasonId: 1 }, { unique: true });

leaderboardSchema.virtual("tierDetails").get(function() {
    const totalSubmissions = this.acceptedSubmissionsCount + this.wrongSubmissionsCount;
    const accuracy = totalSubmissions > 0 ? (this.acceptedSubmissionsCount / totalSubmissions) * 100 : 0;
    const problemsSolvedCount = this.problemsSolved ? this.problemsSolved.length : 0;
    return tierdata(this.elo, accuracy, problemsSolvedCount);
});

leaderboardSchema.pre('save', function(next) {
    if (this.isModified('elo')) {
        const totalSubmissions = this.acceptedSubmissionsCount + this.wrongSubmissionsCount;
        const accuracy = totalSubmissions > 0 ? (this.acceptedSubmissionsCount / totalSubmissions) * 100 : 0;
        const problemsSolvedCount = this.problemsSolved ? this.problemsSolved.length : 0;
        const details = tierdata(this.elo, accuracy, problemsSolvedCount);
        if (details && details.currentRank) {
            this.rank = details.currentRank.name; 
        }
    }
    next();
});

const Leaderboard = mongoose.model('seasonalstats', leaderboardSchema);
module.exports = Leaderboard;