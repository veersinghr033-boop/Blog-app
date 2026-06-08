import Groq from "groq-sdk";

console.log("GROQ_API_KEY:", process.env.GROQ_API_KEY);
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  
});

export default groq;
