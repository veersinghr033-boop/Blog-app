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
  readBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: [],
    },
  ],

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Message", messageSchema);
