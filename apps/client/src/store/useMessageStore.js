import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js"
import toast from "react-hot-toast"
import { useAuthStore } from "./useAuthStore.js";
import axios from "axios";

export const useMessageStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isLoadingUsers: true,
    isMessagesLoading: false,
    isSendingImage: false,
    deleteCheck: false,
    typingTimeout: null,
    selectedUserSocketId:null,
    UserSocketId:null,
    recieverTypingStatus:false,
    typingUsers:[],

    

    getUsers: async () => {
        set({ isLoadingUsers: true })
        try {
            const response = await axiosInstance.get("/messages/users");
            set({ users: response.data });
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch users")
        } finally {
            set({ isLoadingUsers: false })
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const response = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: response.data })
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch messages");
        } finally {
            set({ isMessagesLoading: false })
        }
    },

    setSelectedUser: (selectedUser) => {
        const currentSelectedUser = get().selectedUser;
        // Only clear messages if selecting a different user
        if (!currentSelectedUser || currentSelectedUser._id !== selectedUser?._id) {
            set({ selectedUser, messages: [] });
        } else {
            set({ selectedUser });
        }

    },

   

    sentMessages: async (messagesData) => {
        set({ isSendingImage: true })
        const { selectedUser, messages } = get();

        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messagesData);
            set({ messages: [...messages, res.data] });
            return res.data;
        } catch (error) {
            console.error("Error in sentMessages:", error.response?.data || error);
            toast.error(error.response?.data?.message || "Failed to send message");
            throw error;
        } finally {
            set({ isSendingImage: false })
        }
    },

    addReaction: async (messageId, emoji) => {
        try {
            const res = await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
            // The message state will be updated via the socket event "messageUpdated" 
            // but we can also update it locally for immediate feedback
            set((state) => ({
                messages: state.messages.map((m) => m._id === messageId ? res.data : m)
            }));
        } catch (error) {
            toast.error("Failed to add reaction");
        }
    },

    editMessage: async (messageId, text) => {
        try {
            const res = await axiosInstance.patch(`/messages/edit/${messageId}`, { text });
            set((state) => ({
                messages: state.messages.map((m) => m._id === messageId ? res.data : m)
            }));
            toast.success("Message edited");
        } catch (error) {
            toast.error("Failed to edit message");
        }
    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;
        if (!socket?.connected) return;

        socket.off("newMessage");
        socket.off("messageUpdated");
        socket.off("messageDeleted");

        socket.on("newMessage", (newMessage) => {
            const isFromSelectedUser = newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id;
            if (!isFromSelectedUser) return;
            
            set((state) => ({ messages: [...state.messages, newMessage] }));
        });

        socket.on("messageUpdated", (updatedMessage) => {
            set((state) => ({
                messages: state.messages.map((m) => m._id === updatedMessage._id ? updatedMessage : m)
            }));
        });

        socket.on("messageDeleted", ({ messageId }) => {
            set((state) => ({
                messages: state.messages.filter((m) => m._id !== messageId)
            }));
        });
    },

    unsubscribesFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket?.connected) {
            socket.off("newMessage");
            socket.off("messageUpdated");
            socket.off("messageDeleted");
        }
    },

    toggleDeleteCheck: () => {
        set((state) => ({ deleteCheck: !state.deleteCheck }))
    },

    //deleting only one side
    deleteMessageFromMe: async (message) => {
        try {
            const authUser = useAuthStore.getState().authUser;
            if (!authUser) {
                toast.error("User not authenticated");
                return;
            }

            const response = await axiosInstance.put(`/messages/partialDelete/${message._id}`, {
                deleteForSender: message.senderId === authUser._id,
                deleteForReciever: message.receiverId === authUser._id
            });

            if (response.status === 200) {
                // Update messages state to remove the message from users view
                set((state) => ({
                    messages: state.messages.filter(msg => msg._id !== message._id)
                }));
                get().toggleDeleteCheck();
            }
        } catch (error) {
            console.log("Error in DeleteInterFace", error);
            toast.error("Error while deleting");
        }
    },

    // deleteinh from both the sides
    deleteMessageFromAll: async (message) => {
        try {
            const authUser = useAuthStore.getState().authUser;
            if (!authUser) {
                toast.error("User not authenticated");
                return;
            }

            const messId = message._id;
            
            const response = await axiosInstance.delete(`/messages/fullDelete/${messId}`);

            if (response.status === 200) {
                // Update messages state to remove the deleted message
                set((state) => ({
                    messages: state.messages.filter(msg => msg._id !== messId)
                }));
                get().toggleDeleteCheck();
            }
        } catch (error) {
            console.log("Error in DeleteInterFace", error);
            toast.error("Error while deleting");
        }
    },

    setTyping: (status) => {
        const { typingTimeout } = get();
        const socket = useAuthStore.getState().socket;
        const { selectedUser } = get();
        const authUser = useAuthStore.getState().authUser;

        console.log("Typing status changed to:", status);

        if (typingTimeout) {
            clearTimeout(typingTimeout);
            console.log("Cleared previous timeout");
        }

        set({ isTyping: status });
        
        if (status) {
           if(socket?.connected && selectedUser?._id){
            socket.emit("typing", {
                receiverId: selectedUser._id,
                senderId: authUser._id,
                senderSocketId: socket.id
            });
            console.log("Emitted typing event to:", selectedUser._id);
           }

            const timeout = setTimeout(() => {
                set({ isTyping: false });
                if (socket?.connected && selectedUser?._id) {
                    socket.emit("stopTyping", { 
                        receiverId: selectedUser._id,
                        senderId: authUser._id,
                        senderSocketId: socket.id
                    });
                    console.log("Emitted stop typing event to:", selectedUser._id);
                }
            }, 3000);
            set({ typingTimeout: timeout });
            console.log("New timeout set for 3 seconds");
        } else {
            console.log("Typing stopped");
        }
    },

    setRecieverTypingStatus: () => {
        const socket = useAuthStore.getState().socket;
        
        if (!socket) return;

        socket.on("typing", ({ senderSocketId }) => {
            console.log("Receiver received typing event from:", senderSocketId);
            set({ recieverTypingStatus: true });
        });

        socket.on("stopTyping", ({ senderSocketId }) => {
            console.log("Receiver received stop typing event from:", senderSocketId);
            set({ recieverTypingStatus: false });
        });

        // Cleanup function to remove listeners
        return () => {
            socket.off("typing");
            socket.off("stopTyping");
        };
    },
    setTypingUsers: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        console.log("Setting up typing listeners");

        socket.on("typing", ({ senderSocketId, senderId }) => {
            console.log("Received typing event from:", senderId);
            set((state) => {
                if (!state.typingUsers.includes(senderId)) {
                    return {
                        typingUsers: [...state.typingUsers, senderId]
                    };
                }
                return state;
            });
        });

        socket.on("stopTyping", ({ senderSocketId, senderId }) => {
            console.log("Received stop typing event from:", senderId);
            set((state) => ({
                typingUsers: state.typingUsers.filter(user => user !== senderId)
            }));
        });

        return () => {
            console.log("Cleaning up typing listeners");
            socket.off("typing");
            socket.off("stopTyping");
        };
    }


}))