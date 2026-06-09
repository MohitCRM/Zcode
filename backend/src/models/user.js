const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
    firstName : {
        type : String,
        required : true,
        minLength : 3,
        maxLength : 20
    },
    lastName : {
        type : String,
        minLength : 2,
        maxLength : 20
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
        type : [
            {
                type : Schema.Types.ObjectId,
                ref : "problem"
            }
        ]
    },
    password : {
        type : String,
        required : true

    }
},{
    timestamps : true
});

const User = mongoose.model("user", userSchema);

module.exports = User;