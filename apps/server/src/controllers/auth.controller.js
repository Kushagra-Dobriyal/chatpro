import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import cloudinary from "../lib/cloudinary.js";




export const signup = async (req, res) => {
    const { fullName, email, password } = req.body
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: "Please enter all the fields properly"
            })
        }


        if (password.length < 6) {
            return res.status(400).json({ message: "Password length should be greater then or equal to 6" })
        }

        const user = await User.findOne({ email }) //findOne is the query use to find a row having one filed that we are looking for ,here {email}

        if (user) return res.status(400).json({ message: "E-mail already in use" });


        const salt = await bcrypt.genSalt(10);//creating the salt 
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName: fullName,
            email: email,
            password: hashedPassword
        });
        // This line creates a new instance of the User model using the provided data (in this case, fullName, email, and password).

        if (newUser) {
            //generate jwt token
            generateToken(newUser._id, res);//it will also send the token to the user symultanously...

            await newUser.save();
            // This line actually saves the newUser instance to the database.


            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });

        } else {
            res.status(400).json({ message: "Invalid user data" });
        }

    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal server Error" });
    }

}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter all the fields properly"
            })
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const matchPass = await bcrypt.compare(password, user.password);

        if (!matchPass) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        generateToken(user._id, res);

        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: "Internal Server Error" })
    }
}




export const logout = (req, res) => {
    try {
        //making the cookie expire immediately
        res.cookie("jwt", "", { maxAge: 0 })
        //Syntax-
        //res.cookie("jwt","value of the cookie",{time in mx that the cookie will live})
        res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
        console.log("Error message from logout", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


export const updateProfile = async (req, res) => {
    try {
        const { profilePic } = req.body; // this one we take from the body 
        // OR
        // const profilePic=req.body.profilePic

        const userId = req.user._id; // this is comming from the middle-ware protected

        if (!profilePic) {
            return res.status(400).json({
                message: "Please upload a Profile-Picture"
            })
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic,
            //     {
            //     folder:'profilePic',
            //     type:'image'
            //    }  we can do this for better storage structure in cloudinary
        );

        const updatedUser = await User.findByIdAndUpdate(
            userId,                                    // 1st argument: ID to find
            { profilePic: uploadResponse.secure_url },   // 2nd argument: what to update the secure url is the optimised url that we get from cloudinary
            { new: true }                               // 3rd argument: options
            //         new: true means "return the updated document after the update"
            // If you set new: false, it would return the document before the update
        );

        res.status(200).json(updatedUser)

    } catch (error) {
        console.log("Error mess form profilePicture", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}



export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user); // here also we use the req.user throught the middelware (protected)
    } catch (error) {
        console.log("Error in checkAuth controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}