import mongoose, { Schema } from "mongoose";

const =userSchema(
    {
        avatar: {
            type : {
                url: String,
                localPath: String 
            }
            default: {
                url: `https://placehold.co/200x200`,
                localPath: ""
            }
        },

        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName:{
            type: String,
            trim: true
        }


    }
);




export const User= mongoose.model("User",userSchema);