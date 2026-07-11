const cron = require('node-cron');
const User = require('../models/user');
const Submission = require('../models/submission');
const Leaderboard = require('../models/leaderboard');

const initializeCronJobs = () => {
    cron.schedule('0 * * * *', async () => { //Will run every hour 
        console.log("Running hourly guest cleanup sweep...");
        
        try {
            const expiredGuests = await User.find({
                role: 'guest',
                expiresAt: { $lt: new Date() }
            });

            if (expiredGuests.length > 0) {
                console.log(`Found ${expiredGuests.length} expired guest users. Cleaning up...`);
            }

            for (const guest of expiredGuests) {
                await Submission.deleteMany({ userId: guest._id });
                await Leaderboard.deleteMany({ userId: guest._id });
                
                await User.findByIdAndDelete(guest._id);
                
                console.log(`Successfully deleted expired guest and their data: ${guest._id}`);
            }
        } catch (error) {
            console.error("Error during hourly guest cleanup sweep:", error);
        }
    });
    
    console.log("Cron jobs initialized.");
};

module.exports = { initializeCronJobs };
