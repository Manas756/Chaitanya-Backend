const mongoose =require('mongoose');
const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    teamName:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user',
    },
    isVerified:{
        type:Boolean,
        default:false,
    }
});

const User = mongoose.model('User',userSchema);
module.exports = User;
   