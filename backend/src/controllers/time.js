const sinon = require('sinon');

// This will hold our fake clock instance
let clock;

const settime = async (req, res) => {
    try {
        const { timestamp } = req.body; // Expecting a timestamp or date string
        
        // If a clock exists, uninstall it before setting a new one
        if (clock) clock.restore();
        
        // Initialize fake timers with the specified date
        clock = sinon.useFakeTimers({
    now: new Date(timestamp).getTime(),
    shouldClearNativeTimers: true,
    toFake: ["Date"] // Only fake the Date object, not the network timers!
});
        
        res.status(200).json({ message: "Time set successfully", currentTime: new Date() });
    } catch (err) {
        res.status(400).json({ error: "Invalid timestamp provided" });
    }
};

const getcurrenttime = async (req, res) => {
    try {
        // Returns the time according to the fake clock (or system time if not set)
        const currentTime = (new Date()).toDateString();
        
        res.status(200).json({ currentTime });
    } catch (err) {
        res.status(500).json({ error: "Failed to get current time" });
    }
};

const resettime = async (req, res) => {
    try {
        // Restore the real system clock
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