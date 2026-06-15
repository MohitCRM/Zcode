const { redisClient } = require('../config/redis');
const User = require('../models/user');
const Submission = require("../models/submission");
const Leaderboard = require("../models/leaderboard");
const validate = require('../utils/validate');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


const register = async (req,res)=>{
    try{
        //validating the message sent by user
        validate(req.body);
        const {firstName, emailId, password} = req.body;
        req.body.role = 'user';
        //checking if emailId alredy exists
        const isExisting = await User.exists({ emailId });
        if (isExisting) {
            throw new Error("Email Id already exists");
        }

        //Bcrypting hash
        req.body.password = await bcrypt.hash(password,10);

        const newUser = await User.create(req.body);

        const reply = {
            firstName: newUser.firstName,
            emailId : newUser.emailId,
            _id : newUser._id,
            role : newUser.role
        }
        //Creating a JWT when a user is registered at the time , also can do later when login in if not here
        const token = jwt.sign(
            { _id: newUser._id, emailId: newUser.emailId, role: 'user' },
            process.env.JWT_KEY,
            { expiresIn: "24h" }
        );

        res.cookie('token', token, { 
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 
        });

        res.status(201).json({
            user : reply,
            message : "Registered Succesfully"
        });
    }
    catch(err){
        res.status(400).send("Error: " + err.message);
    }
}

const login = async (req,res)=>{
    try{
        const {emailId,password} = req.body;

        //validating details given by user
        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const usr = await User.findOne({emailId});
        if(!usr)
            throw new Error("Invalid Credentials");

        //Checking password given by user and database password
        const match = await bcrypt.compare(password,usr.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: usr.firstName,
            emailId : usr.emailId,
            _id : usr._id,
            role : usr.role
        }

        //generating a jwt token to relogin later
        const token = jwt.sign({_id:usr._id , emailId:emailId, role : usr.role},process.env.JWT_KEY, {expiresIn : 60*60*24});
        res.cookie('token', token , {maxAge : 60 * 60 * 1000 * 24});
        res.status(200).json({
            user: reply,
            message : "Logged in Successfully"
        });
    }
    catch(err){
        res.status(400).send("Error: " + err.message);
    }
}

const logout = async (req,res)=>{
    try{
        //validate the token->already done in user auth middleware
        const {token} = req.cookies;

        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,`Blocked`);
        await redisClient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null,{expires : new Date(Date.now())});
        res.status(200).send("Logged out Succesfully");

    }
    catch(err){
        res.status(503).send("Error: " + err.message);
    }
}

const adminregister = async(req,res)=>{
    try{
        //validating the message sent by user
        validate(req.body);
        const {firstName, emailId, password} = req.body;
        req.body.role = 'admin';
        //checking if emailId alredy exists
        const isExisting = await User.exists({ emailId });
        if (isExisting) {
            throw new Error("Email Id already exists");
        }

        //Bcrypting hash
        req.body.password = await bcrypt.hash(password,10);

        const newUser = await User.create(req.body);

        //Creating a JWT when a user is registered at the time , also can do later when login in if not here
        const token = jwt.sign(
            { _id: newUser._id, emailId: newUser.emailId, role: 'admin' },
            process.env.JWT_KEY,
            { expiresIn: "24h" }
        );

        res.cookie('token', token, { 
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 
        });

        res.status(201).send("User Registered Successfully");
    }
    catch(err){
        res.status(400).send("Error: " + err.message);
    }
}

const deleteprofile = async (req,res)=>{
    
    try{
        const userid = req.result._id;

        await User.findByIdAndDelete(userid);

        await Submission.deleteMany({ userId: userid });

        res.status(200).send("Profile Deleted Successfully");
    }
    catch(err)
    {
        res.status(500).send("Error: " + err.message);
    }
}

const checkauth = async (req, res) => {
    try {
        const userId = req.result._id;

        // Fetch all seasonal records for this user
        const participationHistory = await Leaderboard.find({ userId: userId })
            .select("seasonId elo rank acceptedSubmissionsCount")
            .sort({ seasonId: -1 }); // Latest seasons first

        const reply = {
            firstName: req.result.firstName,
            emailId: req.result.emailId,
            _id: userId,
            role : req.result.role,
            participationHistory: participationHistory
        };

        res.status(200).json({
            user: reply,
            message: "Valid User"
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user context", details: err.message });
    }
}
module.exports = {register,login,logout,adminregister,deleteprofile,checkauth};
