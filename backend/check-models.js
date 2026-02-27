
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ Missing GEMINI_API_KEY in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        console.log("📡 Fetching models list...");
        // List models is not directly available in the same way in the standard SDK 
        // using the high-level genAI object easily for listing.
        // We can try to use the fetch API or just test common names.

        const modelsToTest = [
            "gemini-1.5-flash",
            "models/gemini-1.5-flash",
            "gemini-2.0-flash-exp",
            "models/gemini-2.0-flash-exp"
        ];

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("hello");
                console.log(`✅ Model '${modelName}' is AVAILABLE.`);
            } catch (err) {
                console.log(`❌ Model '${modelName}' is NOT available: ${err.message}`);
            }
        }

    } catch (error) {
        console.error("❌ Error listing models:", error);
    }
}

listModels();
