const Season = require('../models/season');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const showallseasons = async (req,res)=>{
    try{
        const allseasons = await Season.find().sort({ seasonId: -1 });
        if(!allseasons || allseasons.length === 0)
        {
            return res.status(404).json({error:"No seasons found"});
        }
        res.status(200).json({seasons : allseasons});
    }catch(err)
    {
        res.status(400).json({error:err.message});
    }
}

const createseason = async (req, res) => {
    try {
        const { seasonId, isActive, launchDate, round1Start, round1End, r1SolutionStart, r1SolutionEnd, round2Start, round2End, r2SolutionStart, r2SolutionEnd } = req.body;

        if (isActive) {
            await Season.updateMany({ isActive: true }, { isActive: false });
        }

        const newSeason = await Season.create({
            seasonId, isActive, launchDate, round1Start, round1End, r1SolutionStart, r1SolutionEnd, round2Start, round2End, r2SolutionStart, r2SolutionEnd
        });

        res.status(201).json({ message: "Season created successfully", season : newSeason });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const updateseason = async (req, res) => {
    try {
        const { sid } = req.params;
        const updateData = req.body;

        if (updateData.isActive === true) {
            await Season.updateMany({ _id: { $ne: sid } }, { isActive: false });
        }

        const updatedSeason = await Season.findByIdAndUpdate(sid, updateData, { returnDocument: 'after', runValidators: true });
        
        if (!updatedSeason) return res.status(404).json({ error: "Season not found" });

        res.status(200).json({ message: "Season updated", season : updatedSeason });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteseason = async (req, res) => {
    try {
        const { sid } = req.params;
        const deletedSeason = await Season.findByIdAndDelete(sid);
        
        if (!deletedSeason) return res.status(404).json({ error: "Season not found" });
        
        res.status(200).json({ message: "Season deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const getcurrentseason = async (req,res)=>{
    try{
        // Soft check to see if the user is a guest without throwing errors for unauthenticated users
        const { token } = req.cookies;
        if (token) {
            try {
                const payload = jwt.verify(token, process.env.JWT_KEY);
                if (payload._id) {
                    const user = await User.findById(payload._id);
                    if (user && user.role === 'guest') {
                        const guestSeason = await Season.findOne({ seasonId: 7 });
                        if (!guestSeason) return res.status(404).json({error:"Guest season not found"});
                        return res.status(200).json({season: guestSeason});
                    }
                }
            } catch (e) {
                // Ignore token errors and fall back to public active season logic
            }
        }

        const currentseason = await Season.findOne({isActive:true});
        if(!currentseason) return res.status(404).json({error:"No current season found"});
        res.status(200).json({season : currentseason});
    }catch(err)
    {
        res.status(500).json({error:"Internal server error"});
    }
}

const getseasonbyid = async (req, res) => {
    try {
        const { sid } = req.params;

        const season = await Season.findById(sid); 
        
        if (!season)
            return res.status(404).json({ error: "No season found" });
            
        res.status(200).json({ season: season });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = {createseason,updateseason,deleteseason,showallseasons,getcurrentseason,getseasonbyid};
