const Announcement = require('../models/announcement');

const getallannouncements = async (req,res)=>{
    try{
        const announcements = await Announcement.find({})
        .populate({
            path: "author",
            select : "firstName lastName"
        })
        .sort({
            isPinned : -1,
            createdAt : -1
        });

        return res.status(200).json(announcements);
    }catch(err)
    {
        return res.status(500).json({error : "Failed to load announcements",details : err.message});
    }
};

const createannouncement = async (req,res)=>{
    try{
        const { title,content,category,isPinned } = req.body;

        if (!title || !content) {
            return res.status(400).json({ error: "Title and content fields are required." });
        }

        const newAnnouncement = new Announcement({
            title,
            content,
            category,
            isPinned,
            author: req.user._id 
        });

        await newAnnouncement.save();
        return res.status(201).json({ message: "Announcement published!", announcement: newAnnouncement });
    }catch(err)
    {
        return res.status(500).json({ error: "Creation failed", details: err.message });
    }
};

const updateannouncement = async (req,res)=>{
    try{
        const { id } = req.params;
        
        const updatedAnnouncement = await Announcement.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true } 
        );

        if (!updatedAnnouncement) {
            return res.status(404).json({ error: "Announcement not found." });
        }

        return res.status(200).json({ message: "Announcement updated successfully", announcement: updatedAnnouncement });
    }
    catch(err)
    {
        return res.status(500).json({ error: "Update failed", details: err.message });
    }
}; 

const deleteannouncement = async (req,res)=>{
    try{
        const {id} = req.params;

        const deletedAnnouncement = await Announcement.findByIdAndDelete(id);
        if (!deletedAnnouncement) {
            return res.status(404).json({ error: "Announcement not found." });
        }

        return res.status(200).json({ message: "Announcement deleted successfully." });
    }catch(err)
    {
        return res.status(500).json({ error: "Deletion failed", details: err.message });
    }
};

module.exports = {getallannouncements,createannouncement,updateannouncement,deleteannouncement};