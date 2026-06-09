import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    message: {
        type: String,
        required: true,
    },

    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
    },

    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const Message = mongoose.model("Message", messageSchema);

export default Message;