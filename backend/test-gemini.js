require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGemini() {
    try {
        console.log("Testing Gemini API...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello, are you there?");
        console.log("Gemini Response:", result.response.text());
        console.log("✅ API Key is valid and working!");
    } catch (error) {
        console.error("❌ Gemini API Test Failed:", error.message);
    }
}

testGemini();
