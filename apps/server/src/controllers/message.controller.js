import * as messageService from "../services/message.service.js";
import { catchAsync } from "../utils/appError.js";

export const getUsersForSidebar = catchAsync(async (req, res) => {
  const users = await messageService.getUsersForSidebar(req.user._id);
  res.status(200).json(users);
});

export const getMessages = catchAsync(async (req, res) => {
  const messages = await messageService.getMessages(req.user._id, req.params.id);
  res.status(200).json(messages);
});

export const sendMessage = catchAsync(async (req, res) => {
  const { text, image } = req.body;
  const newMessage = await messageService.sendMessage(req.user._id, req.params.id, text, image);
  res.status(201).json(newMessage);
});

export const partialDelete = catchAsync(async (req, res) => {
  const result = await messageService.partialDelete(req.user._id, req.params.id);
  res.status(200).json(result);
});

export const fullDelete = catchAsync(async (req, res) => {
  const result = await messageService.fullDelete(req.user._id, req.params.id);
  res.status(200).json(result);
});

export const addReaction = catchAsync(async (req, res) => {
  const { emoji } = req.body;
  const message = await messageService.addReaction(req.user._id, req.params.id, emoji);
  res.status(200).json(message);
});

export const editMessage = catchAsync(async (req, res) => {
  const { text } = req.body;
  const message = await messageService.editMessage(req.user._id, req.params.id, text);
  res.status(200).json(message);
});

