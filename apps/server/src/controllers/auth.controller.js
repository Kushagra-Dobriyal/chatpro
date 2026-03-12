import * as authService from "../services/auth.service.js";
import { catchAsync } from "../utils/appError.js";

export const signup = catchAsync(async (req, res) => {
  const user = await authService.signup(req.body, res);
  res.status(201).json(user);
});

export const login = catchAsync(async (req, res) => {
  const user = await authService.login(req.body, res);
  res.status(200).json(user);
});

export const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = catchAsync(async (req, res) => {
  const updatedUser = await authService.updateProfile(req.user._id, req.body.profilePic);
  res.status(200).json(updatedUser);
});

export const checkAuth = (req, res) => {
  res.status(200).json(req.user);
};