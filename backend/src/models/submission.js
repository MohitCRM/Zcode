const moongoose = require("mongoose");
const {Schema} = moongoose;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
        index: true 
    },
    problemId: {
        type: Schema.Types.ObjectId,
        ref: "problem",
        required: true,
        index: true 
    },
    seasonId: {
        type: Number,
        required: true,
        index: true
    },
    language: {
        type: String,
        required: true,
        enum: ["C++", "Java", "Python", "Javascript", "Ruby", "Go", "C#", "PHP", "Swift", "Kotlin", "C"]
    },
    code: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Accepted", "Wrong Answer", "Time Limit Exceeded", "Compilation Error", "Runtime Error", "Pending"],
        default: "Pending"
    },
    eloChange: {
        type: Number,
        default: 0
    },
    wasSameDaySolve: {
        type: Boolean,
        default: false
    },
    memory: {
        type: Number, // Judge0 returns memory in KB
        default: 0
    },
    runtime: {
        type: Number, // Judge0 returns time in seconds (float) or milliseconds
        default: 0
    },
    totalTestCases: {
        type: Number,
        default: 0
    },
    passedTestCases: {
        type: Number,
        default: 0
    },
    errorMessage: {
        type: String,
        default: ""
    }
},{timestamps : true});

const Submission = moongoose.model("submission",submissionSchema);
module.exports = Submission;

