import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    });
    
    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
        httpOnly: true,
        sameSite: "lax",
        secure: false, // Set to false for local development
        path: "/",
        domain: process.env.NODE_ENV === 'production' ? undefined : "localhost"
    });

    return token;
};