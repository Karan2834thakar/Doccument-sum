
const https = require('https');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("❌ Missing GEMINI_API_KEY");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
                console.error("❌ API Error:", parsed.error.message);
            } else if (parsed.models) {
                console.log("✅ Available Model Names:");
                parsed.models.forEach(m => {
                    console.log(m.name);
                });
            } else {
                console.log("❓ Unexpected response:", parsed);
            }
        } catch (e) {
            console.error("❌ Failed to parse response:", data.slice(0, 100));
        }
    });
}).on('error', (err) => {
    console.error("❌ Request Error:", err.message);
});
