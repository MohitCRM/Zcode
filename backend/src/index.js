require("dotenv").config();
const express = require("express");
const main = require("./config/db");
const {redisClient} = require("./config/redis");
const cookieparser = require("cookie-parser");
const authrouter = require("./routes/userauth");
const problemrouter = require("./routes/problemcreate");

const app = express();
app.use(express.json());
app.use(cookieparser());
app.use('/problem', problemrouter);

app.use('/user', authrouter);

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

