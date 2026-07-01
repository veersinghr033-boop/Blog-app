import groq from "../config/openai.ts";
import { Request, Response } from "express";


export const generateBlog = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional SEO blog writer.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      model: "llama-3.3-70b-versatile",
    });

    return res.status(200).json({
      success: true,
      content: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({ message: "Failed to AI", error: errorMessage });;
  }
};
