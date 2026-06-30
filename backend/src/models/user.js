const mongoose = require("mongoose");
const {Schema} = mongoose;
const Seasonalstats = require('./leaderboard');

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 20,
        required : true
    },

    emailId: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        immutable: true,
        sparse : true,
        unique: true
    },
    age: {
        type: Number,
        min: 5,   
        max: 80   
    },
    role: {
        type: String,
        enum: ['user', 'admin','guest'],
        default: 'user'
    },
    password: {
        type: String,
    },
    problemsolved: [{
        type: Schema.Types.ObjectId,
        ref: 'problem'
    }],
}, {
    timestamps: true
});

const User = mongoose.model("user", userSchema);

module.exports = User;