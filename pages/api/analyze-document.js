import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { geminiGenerate } from "../../lib/gemini";

const require = createRequire(import.meta.url);
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

function parseCleanJson(text) {
    if (!text) throw new Error("Empty response from AI");
    
    let cleaned = text
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // Fix trailing commas before closing braces/brackets
    cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

    try {
        return JSON.parse(cleaned);
    } catch (e1) {
        // Strip control characters and retry
        let repaired = cleaned
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
            .replace(/,\s*([}\]])/g, "$1");

        const opens = (repaired.match(/\{/g) || []).length;
        const closes = (repaired.match(/\}/g) || []).length;
        for (let i = 0; i < opens - closes; i++) {
            repaired += "}";
        }

        const openSq = (repaired.match(/\[/g) || []).length;
        const closeSq = (repaired.match(/\]/g) || []).length;
        for (let i = 0; i < openSq - closeSq; i++) {
            repaired += "]";
        }

        try {
            return JSON.parse(repaired);
        } catch (e2) {
            throw new Error(`JSON parse error: ${e1.message}`);
        }
    }
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { fileUrl } = req.body;

        if (!fileUrl) {
            return res.status(400).json({ error: "fileUrl is required" });
        }

        const safePath = fileUrl.startsWith("/") ? fileUrl.slice(1) : fileUrl;
        const filePath = path.join(process.cwd(), "public", safePath);

        console.log("File path:", filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: "File not found", filePath });
        }

        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const ext = path.extname(fileName).toLowerCase();

        // ✅ Extract text from all supported file types
        let textContent = "";

        if (ext === ".txt" || ext === ".csv") {
            textContent = fileBuffer.toString("utf8");
        } else if (ext === ".docx") {
            const result = await mammoth.extractRawText({ buffer: fileBuffer });
            textContent = result.value;
        } else if (ext === ".pdf") {
            try {
                const pdfData = await pdfParse(fileBuffer);
                textContent = pdfData.text;
                console.log(`PDF extracted: ${textContent.length} characters from ${pdfData.numpages} pages`);
            } catch (pdfErr) {
                console.error("PDF parse error:", pdfErr.message);
                return res.status(422).json({
                    error: "Could not extract text from this PDF. It may be scanned/image-only.",
                    details: pdfErr.message,
                });
            }
        }

        if (!textContent || textContent.trim().length < 50) {
            return res.status(422).json({
                error: "Could not extract readable text from this file. It may be image-based or corrupted.",
            });
        }

        const prompt = `You are a strict JSON generator.

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

DOCUMENT:
${textContent.substring(0, 50000)}`;

        try {
            const responseText = await geminiGenerate(GEMINI_API_KEY, prompt);

            let summary;
            try {
                summary = parseCleanJson(responseText);
            } catch (parseErr) {
                console.error("JSON repair parse error:", parseErr.message, "Raw text:", responseText.substring(0, 300));
                return res.status(500).json({
                    error: "Invalid AI response format. Please retry.",
                    details: parseErr.message,
                });
            }

            return res.status(200).json({ success: true, summary });
        } catch (err) {
            if (err.isRateLimit) {
                return res.status(429).json({ error: err.message });
            }
            console.error("Gemini error:", err.message);
            return res.status(500).json({
                error: "Invalid AI response format",
                details: err.message,
            });
        }
    } catch (error) {
        console.error("Analysis Error:", error);
        return res.status(500).json({ error: error.message });
    }
}