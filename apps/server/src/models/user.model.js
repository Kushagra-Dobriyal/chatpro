import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    fullName:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    profilePic:{type:String,default:""},
},
{timestamps:true} //will be use for member since property
);


const User=mongoose.model("User",userSchema);

export default User;


