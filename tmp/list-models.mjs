import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const envContent = fs.readFileSync(".env", "utf8");
const match = envContent.match(/GEMINI_API_KEY=(.*)/);
const apiKey = match ? match[1].replace(/['"]/g, "").trim() : null;

if (!apiKey) {
  console.error("API Key not found in .env");
  process.exit(1);
}

let output = `Using API key: ${apiKey.substring(0, 10)}...\n\n`;

const genAI = new GoogleGenerativeAI(apiKey);

async function main() {
  try {
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-2.0-pro"
    ];

    for (const modelName of modelsToTry) {
      try {
        console.log(`Checking ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Respond with 'OK' only.");
        const text = result.response.text().trim();
        output += `✅ ${modelName}: SUCCESS - ${text}\n`;
      } catch (err) {
        output += `❌ ${modelName}: FAILED - ${err.message}\n`;
      }
    }
  } catch (e) {
    output += `Global error: ${e.message}\n`;
  }
  
  fs.writeFileSync("tmp/list-models-ut8.txt", output, "utf8");
  console.log("Results written to tmp/list-models-ut8.txt");
}

main();
