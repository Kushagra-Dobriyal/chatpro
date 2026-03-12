import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        //in mongoDB id are treated /defined as ObjectId....
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
    },

    image: {
        type: String,
    },
   
    deleteForSender:{
        type: Boolean,
        default: false
    },
    deleteForReciever:{
        type: Boolean,
        default: false
    },

}, {
    timestamps: true //so that we can show time in chat that which message was sent when...
});

const Message = mongoose.model("Message", messageSchema);

export default Message;