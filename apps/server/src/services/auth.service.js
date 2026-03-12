import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
import { AppError } from "../utils/appError.js";

export const signup = async (userData, res) => {
  const { fullName, email, password } = userData;

  if (!fullName || !email || !password) {
    throw new AppError("Please enter all fields properly", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password length should be at least 6 characters", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("E-mail already in use", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    fullName,
    email,
    password: hashedPassword,
  });

  generateToken(newUser._id, res);

  return {
    _id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    profilePic: newUser.profilePic,
  };
};

export const login = async (credentials, res) => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid credentials", 401);
  }

  generateToken(user._id, res);

  return {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
  };
};

export const updateProfile = async (userId, profilePic) => {
  if (!profilePic) {
    throw new AppError("Please upload a profile picture", 400);
  }

  const uploadResponse = await cloudinary.uploader.upload(profilePic, {
    folder: "profile_pics",
  });

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { profilePic: uploadResponse.secure_url },
    { new: true, runValidators: true }
  );

  return updatedUser;
};
