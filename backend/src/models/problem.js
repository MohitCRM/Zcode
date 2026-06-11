const mongoose = require('mongoose');
const { Schema } = mongoose;

const leetcodeTags = [
  // ... (Keep your tag array exactly as you have it)
];

const problemSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        required: true
    },
    tags: [{
        type: String,
        enum: leetcodeTags,
        required: true
    }],

    baseEloReward: {
        type: Number,
        required: true,
        default: 100 
    },
    penaltyWrongAnswer: { type: Number, default: 10 },
    penaltyTimeLimitExceeded: { type: Number, default: 10 },
    penaltyRuntimeError: { type: Number, default: 10 },
    penaltyCompilationError: { type: Number, default: 0 }, 

    seasonId: {
        type: Number,
        required: true,
        index: true 
    },
    releaseDay: {
        type: Number,
        required: true, 
        min: 1,
        max: 25
    },
    unlocksAt: {
        type: Date,
        required: true
    },

    visibleTestCases: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true },
            explanation: { type: String } 
        }
    ],
    hiddenTestCases: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true }
        }
    ],

    startcode: [
        {
            language: { type: String, required: true },
            initialcode: { type: String, required: true }
        }
    ],
    referencesolution: [
        {
            language: { type: String, required: true },
            code: { type: String, required: true } 
        }
    ],
    problemcreator: {
        type: Schema.Types.ObjectId,
        ref: 'user', 
        required: true
    }
}, {
    timestamps: true
});

const Problem = mongoose.model('problem', problemSchema);
module.exports = Problem;