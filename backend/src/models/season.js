const mongoose = require('mongoose');
const { Schema } = mongoose;

const seasonSchema = new Schema({
    seasonId: {
        type: Number,
        required: true,
        unique: true, 
        index: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    launchDate: { type: Date, required: true },
    
    round1Start: { type: Date, required: true },
    round1End: { type: Date, required: true },
    
    r1SolutionStart: { type: Date, required: true },
    r1SolutionEnd: { type: Date, required: true },

    round2Start: { type: Date, required: true },
    round2End: { type: Date, required: true },
    
    r2SolutionStart: { type: Date, required: true },
    r2SolutionEnd: { type: Date, required: true }
}, { timestamps: true });


seasonSchema.methods.getActiveSeasonDay = function() {
    const now = new Date();
    const msDifference = now - this.launchDate;
    const daysDifference = Math.floor(msDifference / (1000 * 60 * 60 * 24));
    return Math.max(1, daysDifference + 1);
};


seasonSchema.methods.getCurrentPhase = function() {
    const now = new Date();

    if (now >= this.round1Start && now <= this.round1End) return "Round1";
    if (now >= this.r1SolutionStart && now <= this.r1SolutionEnd) return "Round1Solution";
    if (now >= this.round2Start && now <= this.round2End) return "Round2";
    if (now >= this.r2SolutionStart && now <= this.r2SolutionEnd) return "Round2Solution";
    
    return "OffSeason";
};

const Season = mongoose.model('season', seasonSchema);
module.exports = Season;