require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
    try {
        console.log("Listing available Gemini models...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // The SDK doesn't have a direct listModels but we can try common alternatives

        const modelsToTest = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.5-flash-latest", "gemini-2.0-flash-exp"];

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                await model.generateContent("test");
                console.log(`✅ Model ${modelName} is available.`);
            } catch (err) {
                console.log(`❌ Model ${modelName} returned error: ${err.message}`);
            }
        }
    } catch (error) {
        console.error("Diagnostic failed:", error.message);
    }
}

listModels();
