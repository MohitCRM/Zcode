const sinon = require('sinon');

let clock;

const settime = async (req, res) => {
    try {
        const { timestamp } = req.body;
        
        if (clock) clock.restore();
        
        clock = sinon.useFakeTimers({
    now: new Date(timestamp).getTime(),
    shouldClearNativeTimers: true,
    toFake: ["Date"]
});
        
        res.status(200).json({ message: "Time set successfully", currentTime: new Date() });
    } catch (err) {
        res.status(400).json({ error: "Invalid timestamp provided" });
    }
};

const getcurrenttime = async (req, res) => {
    try {
        const currentTime = (new Date()).toDateString();
        
        res.status(200).json({ currentTime });
    } catch (err) {
        res.status(500).json({ error: "Failed to get current time" });
    }
};

const resettime = async (req, res) => {
    try {
        if (clock) {
            clock.restore();
            clock = null;
        }
        res.status(200).json({ message: "Time reset to system clock" });
    } catch (err) {
        res.status(500).json({ error: "Failed to reset time" });
    }
};

module.exports = { settime, getcurrenttime, resettime };