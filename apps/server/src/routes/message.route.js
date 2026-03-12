import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, partialDelete, fullDelete, addReaction, editMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.post("/react/:id", protectRoute, addReaction);
router.patch("/edit/:id", protectRoute, editMessage);
router.delete("/delete-partial/:id", protectRoute, partialDelete);
router.delete("/delete-full/:id", protectRoute, fullDelete);

export default router; 
