import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from "express";
import User from "../models/UsersModel";
import { getPrimaryRole, normalizeRoles } from "../utils/roles";

dotenv.config();

export const registerUser = async (
  req: Request,
  res: Response,
) => {
  try {
    const { userName, email, password, role, roles } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({
        message: "User already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRoles = normalizeRoles(roles ?? role);
    const primaryRole = getPrimaryRole(normalizedRoles);

    const newUser = new User({
      userName,
      email,
      password: hashedPassword,
      role: primaryRole,
      roles: normalizedRoles,
    });

    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        role: newUser.role,
        roles: newUser.roles,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        userName: newUser.userName,
        fullName: newUser.fullName || "",
        bio: newUser.bio || "",
        email: newUser.email,
        role: newUser.role,
        roles: newUser.roles,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({
        message: "Invalid credentials",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(400).json({
        message: "Invalid credentials",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        roles: user.roles,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        userName: user.userName,
        fullName: user.fullName || "",
        bio: user.bio || "",
        email: user.email,
        role: user.role,
        roles: user.roles,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};