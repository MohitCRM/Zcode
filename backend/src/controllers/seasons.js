const Season = require('../models/season');

const createseason = async (req, res) => {
    try {
        const { seasonId, isActive, launchDate, round1Start, round1End, r1SolutionStart, r1SolutionEnd, round2Start, round2End, r2SolutionStart, r2SolutionEnd } = req.body;

        if (isActive) {
            await Season.updateMany({ isActive: true }, { isActive: false });
        }

        const newSeason = await Season.create({
            seasonId, isActive, launchDate, round1Start, round1End, r1SolutionStart, r1SolutionEnd, round2Start, round2End, r2SolutionStart, r2SolutionEnd
        });

        res.status(201).json({ message: "Season created successfully", newSeason });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const updateseason = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.isActive === true) {
            await Season.updateMany({ _id: { $ne: id } }, { isActive: false });
        }

        const updatedSeason = await Season.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        
        if (!updatedSeason) return res.status(404).json({ error: "Season not found" });

        res.status(200).json({ message: "Season updated", updatedSeason });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const deleteseason = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSeason = await Season.findByIdAndDelete(id);
        
        if (!deletedSeason) return res.status(404).json({ error: "Season not found" });
        
        res.status(200).json({ message: "Season deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = {createseason,updateseason,deleteseason};
