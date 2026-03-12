import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, partialDelete,fullDelete } from "../controllers/message.controller.js";

const router = express.Router();

//this route is being defined here for the side bar that will show the users and this route can only be call if the user is logged in and is authenticated......

router.get("/users", protectRoute, getUsersForSidebar);

router.get("/:id", protectRoute, getMessages);

router.post("/send/:id", protectRoute, sendMessage);

router.put("/partialDelete/:id", protectRoute,partialDelete);

router.delete("/fullDelete/:id",protectRoute, fullDelete);

export default router; 
