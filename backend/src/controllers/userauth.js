const { redisClient } = require('../config/redis');
const User = require('../models/user');
const Submission = require("../models/submission");
const Leaderboard = require("../models/leaderboard");
const validate = require('../utils/validate');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");


const register = async (req,res)=>{
    try{
        validate(req.body);
        const {firstName, emailId, password} = req.body;
        req.body.role = 'user';

        const isExisting = await User.exists({ emailId });
        if (isExisting) {
            throw new Error("Email Id already exists");
        }

        req.body.password = await bcrypt.hash(password,10);

        const newUser = await User.create(req.body);

        const reply = {
            firstName: newUser.firstName,
            emailId : newUser.emailId,
            _id : newUser._id,
            role : newUser.role
        }
        const token = jwt.sign(
            { _id: newUser._id, emailId: newUser.emailId, role: 'user', jti: Date.now() },
            process.env.JWT_KEY,
            { expiresIn: "24h" }
        );

        res.cookie('token', token, { 
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            user : reply,
            message : "Registered Succesfully"
        });
    }
    catch(err){
        if (err.code === 11000 && err.keyPattern && err.keyPattern.firstName) {
            return res.status(400).json({ error: "That name is already taken. Please choose a different name." });
        }
        res.status(400).json({error : err.message});
    }
}

const login = async (req,res)=>{
    try{
        const {emailId,password} = req.body;

        if(!emailId)
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error("Invalid Credentials");

        const usr = await User.findOne({emailId});
        if(!usr)
            throw new Error("Invalid Credentials");

        const match = await bcrypt.compare(password,usr.password);

        if(!match)
            throw new Error("Invalid Credentials");

        const reply = {
            firstName: usr.firstName,
            emailId : usr.emailId,
            _id : usr._id,
            role : usr.role
        }

        const token = jwt.sign({_id:usr._id , emailId:emailId, role : usr.role, jti: Date.now()},process.env.JWT_KEY, {expiresIn : "24h"});
        res.cookie('token', token , {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge : 24*60*60*1000
        });
        res.status(200).json({
            user: reply,
            message : "Logged in Successfully"
        });
    }
    catch(err){
        res.status(400).json({error : err.message});
    }
}

const logout = async (req,res)=>{
    try{
        const {token} = req.cookies;

        const payload = jwt.decode(token);

        await redisClient.set(`token:${token}`,`Blocked`);
        await redisClient.expireAt(`token:${token}`,payload.exp);

        res.cookie("token",null,{
            expires : new Date(Date.now()),
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
        res.status(200).json({message : "Logged out Succesfully"});

    }
    catch(err){
        res.status(503).json({error : err.message});
    }
}

const guestregister = async (req, res) => {
    try {
        const { firstName } = req.body;

        if (!firstName || firstName.trim().length < 3 || firstName.trim().length > 20) {
            return res.status(400).json({ error: "First name must be between 3 and 20 characters." });
        }

        const guestData = {
            firstName: firstName.trim(),
            role: 'guest'
        };

        const newUser = await User.create(guestData);

        const token = jwt.sign(
            { _id: newUser._id, role: 'guest', jti: Date.now() },
            process.env.JWT_KEY,
            { expiresIn: "24h" }
        );

        res.cookie('token', token, { 
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: "User Registered Successfully as Guest",
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                role: newUser.role
            }
        });
    }
    catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.firstName) {
            return res.status(400).json({ error: "That name is already taken. Please choose a different name." });
        }
        res.status(400).json({ error: err.message });
    }
}

const deleteprofile = async (req,res)=>{
    
    try{
        const userid = req.result._id;

        await User.findByIdAndDelete(userid);

        await Submission.deleteMany({ userId: userid });

        res.status(200).json({message : "Profile Deleted Successfully"});
    }
    catch(err)
    {
        res.status(500).json({error : err.message});
    }
}

const exitguestmode = async (req, res) => {
    try {
        const userid = req.result._id;

        if (req.result.role !== 'guest') {
            return res.status(403).json({ error: "Only guest users can exit guest mode" });
        }

        await User.findByIdAndDelete(userid);
        await Submission.deleteMany({ userId: userid });
        await Leaderboard.deleteMany({ userId: userid });

        const { token } = req.cookies;
        if (token) {
            const payload = jwt.decode(token);
            await redisClient.set(`token:${token}`, `Blocked`);
            await redisClient.expireAt(`token:${token}`, payload.exp);
            
            res.cookie("token", null, {
                expires: new Date(Date.now()),
                httpOnly: true,
                secure: true,
                sameSite: 'none'
            });
        }

        res.status(200).json({ message: "Guest mode exited successfully. All data erased." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const checkauth = async (req, res) => {
    try {
        const userId = req.result._id;

        const participationHistory = await Leaderboard.find({ userId: userId })
            .select("seasonId elo rank acceptedSubmissionsCount")
            .sort({ seasonId: -1 }); 

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
const getallusers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;

        const totalUsers = await User.countDocuments();
        const users = await User.find({})
            .select("-password -updatedAt -__v")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.status(200).json({
            pagination: {
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
                currentPage: page,
                limit
            },
            users
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users", details: err.message });
    }
}

const makeadmin = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        
        if (!targetUserId) {
            return res.status(400).json({ error: "targetUserId is required" });
        }

        const userToUpdate = await User.findByIdAndUpdate(
            targetUserId, 
            { role: 'admin' }, 
            { new: true }
        ).select("-password -createdAt -updatedAt -__v");

        if (!userToUpdate) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ 
            message: "User successfully promoted to admin", 
            user: userToUpdate 
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to promote user to admin", details: err.message });
    }
}

const removeadmin = async (req, res) => {
    try {
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ error: "targetUserId is required" });
        }

        const userToUpdate = await User.findByIdAndUpdate(
            targetUserId,
            { role: 'user' },
            { new: true }
        ).select("-password -createdAt -updatedAt -__v");

        if (!userToUpdate) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({
            message: "User successfully demoted from admin",
            user: userToUpdate
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to demote user from admin", details: err.message });
    }
}




const admindeleteuser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        await Submission.deleteMany({ userId: id });
        await Leaderboard.deleteMany({ userId: id });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {register,login,logout,guestregister,deleteprofile,checkauth,exitguestmode,getallusers,makeadmin,removeadmin,admindeleteuser};
