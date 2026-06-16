require("dotenv").config();
const express = require("express");
const main = require("./config/db");
const {redisClient} = require("./config/redis");
const cookieparser = require("cookie-parser");
const authrouter = require("./routes/userauth");
const problemrouter = require("./routes/problemcreate");
const submitrouter = require("./routes/submit");
const leaderboardrouter = require('./routes/leaderboard');
const announcementrouter = require("./routes/announcement");
const solutionrouter = require("./routes/solution");
const seasonsrouter = require('./routes/seasons');
const cors = require('cors');

const app = express();

app.use(cors({
    origin :'http://localhost:5173',
    credentials : true
}))
app.use(express.json());
app.use(cookieparser());
app.use('/seasons',seasonsrouter);
app.use('/leaderboard',leaderboardrouter);
app.use('/announcement',announcementrouter); 
app.use('/problem', problemrouter);
app.use('/submit', submitrouter);
app.use('/user', authrouter);
app.use('/solution', solutionrouter);

const initialiseconnection = async ()=>{
    try{
        await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected");
        app.listen(process.env.PORT,()=>{
            console.log("Listening at port number : "+process.env.PORT);
        })
    }
    catch(err){
        console.log("ERROR : " + err.message);
    }
}

initialiseconnection();

