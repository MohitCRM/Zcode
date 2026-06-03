const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName : {
        type : String,
        required : true,
        minLenght : 3,
        maxLenght : 20
    },
    lastName : {
        type : String,
        required : true,
        minLenght : 2,
        maxLenght : 20
    },
    emailId : {
        type : String ,
        required : true,
        trim : true,
        lowercase : true,
        immutable : true,
        unique : true
    },
    age : {
        type : Number,
        minLenght : 5,
        maxLenght : 80
    },
    role : {
        type : String,
        enum : ['user','admin'],
        default : 'user'
    },
    problemsolved : {
        type : [String]
    },
    password : {
        type : String,
        required : true

    }
},{
    timestamps : true
});

const user = mongoose.model("user", userSchema);

model.exports = user;