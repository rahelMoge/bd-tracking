import fs from "fs";
import path from "path";
import mammoth from "mammoth";
import { geminiGenerate } from "../../../lib/gemini";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { fileUrl } = req.body;

        if (!fileUrl) {
            return res.status(400).json({
                error: "fileUrl is required"
            });
        }

        const safePath = fileUrl.startsWith("/")
            ? fileUrl.slice(1)
            : fileUrl;

        const filePath = path.join(
            process.cwd(),
            "public",
            safePath
        );

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: "File not found"
            });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const ext = path.extname(fileName).toLowerCase();

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                error: "Missing GEMINI_API_KEY"
            });
        }

        let textContent = "";

        if (ext === ".txt" || ext === ".csv") {
            textContent = fileBuffer.toString("utf8");
        } else if (ext === ".docx") {
            const result = await mammoth.extractRawText({
                buffer: fileBuffer
            });

            textContent = result.value;
        }

        const prompt = `
You are a strict JSON generator.

Extract a list of experts from the following document.

For each expert identify:

- name
- title
- expertType (Senior Expert, Junior Expert, Team Leader, Specialist, Consultant, Professor, Researcher, Advisor)
- specialization
- country
- email
- phone
- yearsExp
- summary

Rules:
1. Return ONLY valid JSON.
2. No markdown.
3. No explanation.
4. Return an array.
5. Use null when data is unavailable.

Example:

[
  {
    "name": "John Doe",
    "title": "Senior Water Engineer",
    "expertType": "Senior Expert",
    "specialization": "Water Engineering",
    "country": "Ethiopia",
    "email": "john@example.com",
    "phone": "+251900000000",
    "yearsExp": "15",
    "summary": "Experienced engineer."
  }
]
`;

        let fullPrompt = prompt;

        if (textContent) {
            fullPrompt += `

DOCUMENT CONTENT:

${textContent.substring(0, 50000)}
`;
        }

        console.log(`Analyzing fileUrl: ${fileUrl}`);
        console.log(
            `Analyzing file: ${fileName} (${ext})`
        );

        let responseText;
        try {
            responseText = await geminiGenerate(GEMINI_API_KEY, fullPrompt);
        } catch (err) {
            console.error("Gemini API Error:", err);
            return res.status(500).json({
                error: "Gemini API failure",
                details: err?.message || "Unknown Gemini error"
            });
        }

        if (!responseText) {
            return res.status(500).json({
                error: "No response text from Gemini"
            });
        }

        console.log("Gemini Response Received");

        let cleaned = responseText.trim();

        cleaned = cleaned
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const jsonMatch = cleaned.match(
            /\[\s*\{[\s\S]*\}\s*\]/
        );

        if (!jsonMatch) {
            console.error(
                "AI did not return JSON:",
                cleaned
            );

            return res.status(500).json({
                error:
                    "AI did not return a valid JSON array",
                raw: cleaned
            });
        }

        let experts;

        try {
            experts = JSON.parse(
                jsonMatch[0]
            );
        } catch (parseError) {
            console.error(
                "JSON Parse Error:",
                parseError
            );

            return res.status(500).json({
                error:
                    "Failed to parse AI response",
                details: parseError.message
            });
        }

        return res.status(200).json({
            success: true,
            experts
        });
    } catch (error) {
        console.error(
            "Expert Analysis Error:",
            error
        );

        return res.status(500).json({
            error: "Internal Server Error",
            message: error.message
        });
    }
}