import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    roles: {
      type: [String],
      enum: ["admin","user"],
      default: ["user"],
    },
    fcmToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
