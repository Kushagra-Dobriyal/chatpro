import jwt from "jsonwebtoken";
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        //pick the token

        if (!token) {
            return res.status(400).json({
                message: "Unautherised - Access Denied!!"
            })
        }
        //if no token found


        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //now check is this token was signed by us or not using the jwt-secret

        if (!decoded) {
            return res.status(400).json({
                message: "Unautherised - Invalid Token"
            })
        }
        //if the checking ends to be false

        const user = await User.findById(decoded.userId).select("-password");  //There was a mistake 
        //the -password is very obvious ,but just for clarity ,what it does is return everhting except the password

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            })
        }
        //no user was found

        req.user = user;
        //if any user is found
        //as this is a middle ware we have to do things in behalf of the next endpoint

        next();
        // go to the next middleware or endpoint
    } catch (error) {
        console.log("Error in auth-middleware",error.message);
         res.status(500).json({
            message:"Internal server error"
        })
    }
}
