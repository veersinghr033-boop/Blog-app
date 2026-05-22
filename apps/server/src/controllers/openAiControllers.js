import groq from "../config/openai.js";

export const generateBlog = async (req, res) => {
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
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
