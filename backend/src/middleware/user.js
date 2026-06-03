const User = require("../models/user");
const jwt = require("jsonwebtoken");
const {redisClient} = require("../config/redis");

const userauth = async (req,res,next)=>{
    try{
    const {token} = req.cookies;

    if(!token)
        throw new Error("Token doesn't exist");

    const payload = jwt.verify(token,process.env.JWT_KEY);

    const {_id} = payload;

    if(!_id)
        throw new Error("ID is Missing");

    const result = await User.findById(_id);

    if(!result)
        throw new Error("User doesn't exist");

    const isblocked = await redisClient.exists(`token:${token}`);

    if(isblocked)
        throw new Error("invalid Token");

    req.result = result;

    next();
}
catch(err){
    res.status(401).send("ERROR: " + err.message);
}
}

module.exports= {userauth};