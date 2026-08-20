import Groq from "groq-sdk";
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,

});
console.log(groq , "nerkjtkldfjgtkd" , process.env.GROQ_API_KEY)
export default groq;