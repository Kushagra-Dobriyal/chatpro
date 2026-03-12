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

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;

    if (userId) { userSocketMap[userId] = socket.id }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle new messages
    socket.on("sendMessage", (message) => {
        const receiverSocketId = getRecieverSocketId(message.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", message);
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id)
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
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