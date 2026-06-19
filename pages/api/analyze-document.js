import fs from "fs";
import path from "path";
import mammoth from "mammoth";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { fileUrl } = req.body;

        if (!fileUrl) {
            return res.status(400).json({
                error: "fileUrl is required",
            });
        }

        const safePath = fileUrl.startsWith("/")
            ? fileUrl.slice(1)
            : fileUrl;

        const filePath = path.join(process.cwd(), "public", safePath);

        console.log("File path:", filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                error: "File not found",
                filePath,
            });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const ext = path.extname(fileName).toLowerCase();

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                error: "Missing GEMINI_API_KEY",
            });
        }

        // ✅ TEXT EXTRACTION (FIXED FOR ALL FILE TYPES)
        let textContent = "";

        if (ext === ".txt" || ext === ".csv") {
            textContent = fileBuffer.toString("utf8");
        }

        if (ext === ".docx") {
            const result = await mammoth.extractRawText({
                buffer: fileBuffer,
            });

            textContent = result.value;
        }

        // PDF is handled as binary (no extraction here)

        const prompt = `
You are a strict JSON generator.

RULES:
- Output ONLY valid JSON
- No markdown
- No backticks
- No explanation
- Never truncate JSON

Return EXACT structure:

{
  "scopeOfWork": "",
  "budget": "",
  "deadlines": {
    "submissionDeadline": "",
    "projectDuration": "",
    "otherDates": ""
  },
  "requiredExperts": [],
  "requiredExperiences": [],
  "keyClientRequirements": []
}
`;

        const parts =
            textContent && textContent.length > 0
                ? [
                    {
                        text: `${prompt}\n\nDOCUMENT:\n${textContent.substring(
                            0,
                            50000
                        )}`,
                    },
                ]
                : [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: "application/pdf",
                            data: fileBuffer.toString("base64"),
                        },
                    },
                ];

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: {
                        temperature: 0.2,
                        maxOutputTokens: 8192,
                    },
                }),
            }
        );

        const data = await response.json();

        console.log("Gemini status:", response.status);

        if (!response.ok) {
            return res.status(500).json({
                error: "Gemini API failed",
                details: data,
            });
        }

        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({
                error: "No response text from Gemini",
                raw: data,
            });
        }

        // ✅ SAFE JSON PARSING
        try {
            const cleaned = text
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            const summary = JSON.parse(cleaned);

            return res.status(200).json({
                success: true,
                summary,
            });
        } catch (err) {
            console.log("RAW GEMINI OUTPUT:", text);

            return res.status(500).json({
                error: "Invalid JSON returned from Gemini",
                raw: text,
            });
        }
    } catch (error) {
        console.error("Analysis Error:", error);

        return res.status(500).json({
            error: error.message,
            stack: error.stack,
        });
    }
}