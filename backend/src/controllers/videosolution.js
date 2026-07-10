const cloudinary  = require('cloudinary').v2;
const Problem = require('../models/problem');
const User = require('../models/user');
const SolutionVideo = require('../models/solutionvideo');

cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const generateuploadsignature = async (req,res)=>{
    try{
        const {problemId} = req.params;
        const userId = req.result._id;

        const problem = await Problem.findById(problemId);
        if(!problem)
            return res.status(404).json({error : "Problem not found"});

        const timestamp = Math.round(new Date().getTime()/1000);
        const publicId = `zcode-solutions/${problemId}/${userId}_${timestamp}`;

        const uploadParams = {
            timestamp: timestamp,
            public_id: publicId
        };

        const signature = cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.CLOUDINARY_API_SECRET
        );

        res.json(
            {
                signature,
                timestamp,
                public_id : publicId,
                api_key : process.env.CLOUDINARY_API_KEY,
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                upload_url : `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
            }
        );

    }catch(err)
    {
        res.status(500).json({error : 'Failed to generate uplaod credentials'});
    }
}

const savevideometadata = async (req,res)=>{
    try{
        const {
            problemId,
            cloudinaryPublicId,
            secureUrl,
            duration,
        } = req.body;

        const userId = req.result._id;

        const cloudinaryresource = await cloudinary.api.resource(
            cloudinaryPublicId,
            {resource_type:'video'}
        );

        if(!cloudinaryresource)
            return res.status(400).json({error : 'Video not found on Cloudinary'});

        const existingvideo = await SolutionVideo.findOne({
            problemId,
            userId,
            cloudinaryPublicId
        })

        if(existingvideo)
            return res.status(409).json({error : 'Video already exists'});

        const thumbnailUrl = cloudinary.url(cloudinaryresource.public_id,{
            resource_type: 'image',
            transformation: [
                {width :400, height: 225, crop: 'fill'},
                {quality: 'auto'},
                {start_offset: 'auto'}
            ],
            format: 'jpg'
        });

        const problem = await Problem.findById(problemId);
        const videotitle = problem ? `${problem.title} Solution` : 'Solution Video';

        const videoSolution = new SolutionVideo({
            problemId,
            userId,
            videotitle,
            cloudinaryPublicId,
            secureUrl,
            duration : cloudinaryresource.duration || duration,
            thumbnailUrl
        })

        await videoSolution.save();

        res.status(201).json({
            message : 'Video solution saved successfully',
            id: videoSolution._id,
            thumbnailUrl : videoSolution.thumbnailUrl,
            duration : videoSolution.duration,
            uploadedAt : videoSolution.createdAt
        });
    }catch(err)
    {   
        console.error("Save video metadata error:", err);
        res.status(500).json({error : 'Failed to save video metadata', details: err.message});
    }
}

const deletevideo = async (req,res)=>{
    try{
        const {problemId} = req.params;

        const video = await SolutionVideo.findOneAndDelete({ problemId: problemId });

        if(!video)
            return res.status(404).json({error : 'Video not found'});

        await cloudinary.uploader.destroy(video.cloudinaryPublicId,{resource_type:'video', invalidate: true
        })

        res.json({message : 'Video deleted Successfully'});
    }catch(err)
    {
        res.status(500).json({error : 'Failed to delete video'});
    }
}

module.exports = {generateuploadsignature,savevideometadata,deletevideo};