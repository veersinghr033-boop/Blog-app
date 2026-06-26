import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat"
    }

}, { timestamps: true }, );

const Group = mongoose.model("Group", groupSchema);

export default Group;