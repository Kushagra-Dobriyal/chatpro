import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getRecieverSocketId, io } from "../lib/socket.js";
import { AppError } from "../utils/appError.js";

// Mock AI Tone Analysis function (can be integrated with real API later)
const analyzeMessageTone = async (text) => {
  if (!text) return null;
  
  // Simple heuristic for demonstration:
  const lowerText = text.toLowerCase();
  let sentiment = 'neutral';
  let overallTone = 'friendly';
  
  if (lowerText.includes('bad') || lowerText.includes('angry') || lowerText.includes('hate')) {
    sentiment = 'negative';
    overallTone = 'frustrated';
  } else if (lowerText.includes('good') || lowerText.includes('great') || lowerText.includes('love') || lowerText.includes('happy')) {
    sentiment = 'positive';
    overallTone = 'excited';
  }

  return {
    overallTone,
    sentiment,
    confidence: 0.85,
    intensity: 5,
    analyzedAt: new Date()
  };
};

export const getUsersForSidebar = async (loggedInUserId) => {
  const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
  return filteredUsers;
};

export const getMessages = async (myId, userToChatId) => {
  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  });
  return messages;
};

export const sendMessage = async (senderId, receiverId, text, image) => {
  let imageUrl;
  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'chat_images'
    });
    imageUrl = uploadResponse.secure_url;
  }

  // AI Tone Analysis Integration
  const toneAnalysis = await analyzeMessageTone(text);

  const newMessage = await Message.create({
    senderId,
    receiverId,
    text,
    image: imageUrl,
    toneAnalysis
  });

  const receiverSocketId = getRecieverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  return newMessage;
};

export const partialDelete = async (userId, messageId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new AppError("Message not found", 404);

  if (message.senderId.toString() === userId.toString()) {
    message.deleteForSender = true;
  } else if (message.receiverId.toString() === userId.toString()) {
    message.deleteForReciever = true;
  } else {
    throw new AppError("Not authorized to delete this message", 403);
  }

  if (message.deleteForSender && message.deleteForReciever) {
    await Message.findByIdAndDelete(messageId);
    return { deleted: true };
  }

  await message.save();
  return message;
};

export const fullDelete = async (userId, messageId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new AppError("Message not found", 404);

  if (message.senderId.toString() !== userId.toString() && 
      message.receiverId.toString() !== userId.toString()) {
    throw new AppError("Not authorized to delete this message", 403);
  }

  await Message.findByIdAndDelete(messageId);

  const receiverSocketId = getRecieverSocketId(message.receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("messageDeleted", { messageId });
  }

  return { success: true };
};

export const addReaction = async (userId, messageId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) throw new AppError("Message not found", 404);

  // Check if user already reacted with this emoji, if so remove it (toggle)
  const existingReactionIndex = message.reactions.findIndex(
    (r) => r.userId.toString() === userId.toString() && r.emoji === emoji
  );

  if (existingReactionIndex > -1) {
    message.reactions.splice(existingReactionIndex, 1);
  } else {
    message.reactions.push({ userId, emoji });
  }

  await message.save();

  const receiverSocketId = getRecieverSocketId(message.receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("messageUpdated", message);
  }

  return message;
};

export const editMessage = async (userId, messageId, newText) => {
  const message = await Message.findById(messageId);
  if (!message) throw new AppError("Message not found", 404);

  if (message.senderId.toString() !== userId.toString()) {
    throw new AppError("Not authorized to edit this message", 403);
  }

  // Save to history before updating
  message.editHistory.push({
    text: message.text,
    editedAt: new Date()
  });

  message.text = newText;
  message.isEdited = true;

  // Re-run AI analysis for edited text
  const toneAnalysis = await analyzeMessageTone(newText);
  message.toneAnalysis = toneAnalysis;

  await message.save();

  const receiverSocketId = getRecieverSocketId(message.receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("messageUpdated", message);
  }

  return message;
};
