import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  message: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },

  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
  },

  isRead: {
    type: Boolean,
    default: false,
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

messageSchema.index({ chatId: 1, timestamp: -1 });

export default mongoose.model("Message", messageSchema);
