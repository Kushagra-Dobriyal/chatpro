import { Server } from "socket.io"
import http from 'http'
import express from 'express'

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://chattyfy-frontend:80", "http://chattyfy-frontend"]
    }
})

//userid-socketid
const userSocketMap = {}

export function getRecieverSocketId(userId){
    return userSocketMap[userId];
}

io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    if (!userId) return;

    console.log("A user connected", userId);
    userSocketMap[userId] = socket.id;

    try {
        await User.findByIdAndUpdate(userId, { isOnline: true });
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
        io.emit("userPresenceUpdate", { userId, isOnline: true });
    } catch (error) {
        console.error("Error updating connection presence:", error.message);
    }

    // Handle new messages
    socket.on("sendMessage", (message) => {
        const receiverSocketId = getRecieverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message);
        }
    });

    socket.on("disconnect", async () => {
        console.log("A user disconnected", userId);
        delete userSocketMap[userId];
        
        try {
            await User.findByIdAndUpdate(userId, { 
                isOnline: false, 
                lastSeen: new Date() 
            });
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
            io.emit("userPresenceUpdate", { userId, isOnline: false, lastSeen: new Date() });
        } catch (error) {
            console.error("Error updating disconnection presence:", error.message);
        }
    })

    socket.on("typing" ,({receiverId,senderId})=>{
        const receiverSocketId=getRecieverSocketId(receiverId);
        const senderSocketId=getRecieverSocketId(senderId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("typing",{senderSocketId});
        }
    })
    

    socket.on("stopTyping", ({receiverId,senderId}) => {
        const receiverSocketId = getRecieverSocketId(receiverId);
        const senderSocketId=getRecieverSocketId(senderId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("stopTyping", { senderSocketId,senderId});
        }
    });
})

export { io, app, server };