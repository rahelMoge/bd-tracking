import { PrismaClient } from "@prisma/client"
import { GoogleGenerativeAI } from "@google/generative-ai"

const prisma = new PrismaClient()

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

    try {
        const { opportunityId, torSummary } = req.body

        if (!torSummary) return res.status(400).json({ error: "torSummary is required" })

        // 1. Fetch all experts from database
        const experts = await prisma.expert.findMany()

        if (experts.length === 0) {
            return res.status(200).json({ experts: [], recommendation: "No experts found in database. Please import experts first." })
        }

        // 2. Prepare the prompt for Gemini
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY
        if (!GEMINI_API_KEY) return res.status(500).json({ error: "Missing GEMINI_API_KEY" })

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" })

        const expertsList = experts.map(e => ({
            id: e.id,
            name: e.name,
            specialization: e.specialization,
            yearsExp: e.yearsExp,
            summary: e.summary || e.notes || ""
        }))

        const prompt = `
        You are an AI Expert Matcher for a Business Development team.
        Your goal is to compare a Terms of Reference (TOR) requirements against a list of available experts and find the best matches.

        TOR REQUIREMENTS:
        ${JSON.stringify(torSummary)}

        AVAILABLE EXPERTS:
        ${JSON.stringify(expertsList)}

        TASK:
        1. Analyze the TOR for required positions, education, and years of experience.
        2. Compare against each expert's specialization and summary.
        3. Assign a Relevance Score (0-100) and provide a Match Reasoning for each expert.
        4. If no experts score above 40, provide an "Ideal Expert Profile" description.

        RETURN FORMAT (Valid JSON only):
        {
          "matches": [
            {
              "id": 1,
              "relevanceScore": 85,
              "matchReasoning": "Highly experienced in water management which is the core requirement..."
            }
          ],
          "idealProfile": "String description of the ideal expert if few matches are found"
        }

        RULES:
        - Return ONLY JSON.
        - No markdown formatting.
        - Score based on direct relevance to the TOR.
        `

        let responseText;
        let lastError;
        const maxRetries = 5;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await model.generateContent(prompt)
                responseText = result.response.text()
                if (responseText) break
            } catch (err) {
                lastError = err;
                const isTransient = err.status === 503 || err.status === 429 || 
                                   err.message?.includes("503") || 
                                   err.message?.includes("429") ||
                                   err.message?.includes("high demand") ||
                                   err.message?.includes("Service Unavailable");

                if (isTransient && i < maxRetries - 1) {
                    const delay = Math.pow(2, i) * 2000;
                    console.log(`Gemini API busy in matcher (attempt ${i + 1}/${maxRetries}). Retrying...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw err;
            }
        }

        if (!responseText) throw new Error("No response from Gemini")

        let cleaned = responseText.trim().replace(/```json/g, "").replace(/```/g, "").trim()
        const matchData = JSON.parse(cleaned)

        // 3. Merge AI scores back with full expert data
        const results = matchData.matches.map(m => {
            const expert = experts.find(e => e.id === m.id)
            return {
                ...expert,
                relevanceScore: m.relevanceScore,
                matchReasoning: m.matchReasoning
            }
        }).sort((a, b) => b.relevanceScore - a.relevanceScore)

        return res.status(200).json({
            experts: results,
            idealProfile: matchData.idealProfile
        })

    } catch (error) {
        console.error("Expert Match Error:", error)
        res.status(500).json({ error: "Failed to match experts", details: error.message })
    }
}
