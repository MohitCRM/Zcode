const moongoose = require("mongoose");
const {Schema} = moongoose;

const submissionSchema = new Schema({
    userId: {
        type :String,
        ref : "user",
        required : true
    },
    problemId : {
        type: String,
        ref : "problem",
        required : true
    },
    language : {
        type : String,
        required : true,
        enum : ["C++","Java","Python","Javascript","Ruby","Go","C#","PHP","Swift","Kotlin","C"]
    },
    code : {
        type : String,
        required : true
    },
    status : {
        type : String,
        enum : ["Accepted","Wrong Answer","Time Limit Exceeded","Compilation Error","Runtime Error","Pending"],
        default : "Pending"
    },
    memory : {
        type :Number,
        default : 0
    },
    runtime : {
        type : Number,
        default : 0
    },
    testcases : {
        type : Number,
    },
    passedtestcases : {
        type : Number,
    },
    errormessage : {
        type : String,
        default : ""
    }
},{timestamps : true});

const Submission = moongoose.model("submission",submissionSchema);
module.exports = Submission;

