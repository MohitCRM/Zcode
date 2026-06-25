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

        //generating digital signature , so i must also send uploadparams to verify
        const signature = cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.CLOUDINARY_API_KEY
        );

        res.json(
            {
                signature,
                timestamp,
                public_id : publicId,
                api_key : process.env.CLOUDINARY_API_KEY,
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                upload_url : `https://api.cloudinary.com//${process.env.CLOUDINARY_CLOUD_NAME}/video/upload`
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

        //verifying the upload
        const cloudinaryresource = await cloudinary.api.resource(
            cloudinaryPublicId,
            {resource_type:'video'}
        );

        if(!cloudinaryresource)
            return res.status(400).json({error : 'Video not found on Cloudinary'});

        //checking if video already exists for this problem and user
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

        //creating video solution record
        const videoSolution = new SolutionVideo({
            problemId,
            userId,
            cloudinaryPublicId,
            secureUrl,
            duration : cloudinaryresource.duration || duration,
            thumbnailUrl
        })

        await SolutionVideo.save();

        res.status(201).json({
            message : 'Video solution saved successfully',
            id: videoSolution._id,
            thumbnailUrl : videoSolution.thumbnailUrl,
            duration : videoSolution.duration,
            uploadedAt : videoSolution.createdAt
        });
    }catch(err)
    {   
        res.status(500).json({error : 'Failed to save video metadata'});
    }
}

const deletevideo = async (req,res)=>{
    try{
        const {videoId} = req.params;

        const video = await SolutionVideo.findByIdAndDelete(videoId);

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