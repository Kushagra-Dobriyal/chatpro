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

    // Tone Analysis Fields
    toneAnalysis: {
        overallTone: {
            type: String,
            enum: ['positive', 'negative', 'neutral', 'excited', 'calm', 'frustrated', 'friendly', 'formal', 'casual'],
            default: 'neutral'
        },
        confidence: { type: Number, min: 0, max: 1, default: 0 },
        sentiment: {
            type: String,
            enum: ['positive', 'negative', 'neutral'],
            default: 'neutral'
        },
        intensity: { type: Number, min: 1, max: 10, default: 5 }
    },

    // New Features: Reactions and Edit History
    reactions: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String
    }],
    editHistory: [{
        text: String,
        editedAt: { type: Date, default: Date.now }
    }],
    isEdited: { type: Boolean, default: false }

}, {
    timestamps: true //so that we can show time in chat that which message was sent when...
});

const Message = mongoose.model("Message", messageSchema);

export default Message;