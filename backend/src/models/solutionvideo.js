const mongoose = require('mongoose');
const {Schema} = mongoose;

const solutionvideoSchema = new Schema({
    problemId : {
        type : Schema.Types.ObjectId,
        ref : 'Problem',
        required : true
    },
    userId : {
        type : Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    videotitle: {
        type : String,
        required : true,
        trim : true,
        maxlength : 200
    },
    cloudinaryPublicId: {
        type : String,
        required : true,
        unique : true
    },
    secureUrl : {
        type : String,
        required : true
    },
    thumbnailUrl :{
        type : String
    },
    duration: {
        type : Number,
        required : true
    },
},{timestamps: true});

const SolutionVideo = mongoose.model('solutionvideo',solutionvideoSchema);
module.exports = SolutionVideo;