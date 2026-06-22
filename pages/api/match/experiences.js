import { PrismaClient } from "@prisma/client"
import { GoogleGenerativeAI } from "@google/generative-ai"

const prisma = new PrismaClient()

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

    try {
        const { opportunityId, torSummary } = req.body

        if (!torSummary) return res.status(400).json({ error: "torSummary is required" })

        // 1. Fetch all experiences from database
        const experiences = await prisma.experience.findMany()

        if (experiences.length === 0) {
            return res.status(200).json({ experiences: [], recommendation: "No firm experiences found in database." })
        }

        // 2. Prepare the prompt for Gemini
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY
        if (!GEMINI_API_KEY) return res.status(500).json({ error: "Missing GEMINI_API_KEY" })

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" })

        const experienceList = experiences.map(e => ({
            id: e.id,
            title: e.title,
            client: e.client,
            sector: e.sector,
            description: e.description || ""
        }))

        const prompt = `
        You are an AI Experience Matcher for a Business Development team.
        Your goal is to compare a Terms of Reference (TOR) requirements against a list of previous firm experiences (projects) and find the most relevant ones.

        TOR REQUIREMENTS:
        ${JSON.stringify(torSummary)}

        PREVIOUS PROJECTS:
        ${JSON.stringify(experienceList)}

        TASK:
        1. Analyze the TOR for scope of work, sectors, and geographic focus.
        2. Compare against each project's title, client, sector, and description.
        3. Assign a Relevance Score (0-100) and provide a Match Reasoning for each project.
        4. If few projects match, provide an "Ideal Experience Profile" description of what type of projects should be searched for.

        RETURN FORMAT (Valid JSON only):
        {
          "matches": [
            {
              "id": 1,
              "relevanceScore": 90,
              "matchReasoning": "Project involved very similar capacity building in the same geographic region..."
            }
          ],
          "idealProfile": "Description of ideal past projects requested for this TOR"
        }

        RULES:
        - Return ONLY JSON.
        - No markdown formatting.
        - Score based on sector similarity, scope complexity, and client similarity.
        `

        let responseText;
        const maxRetries = 5;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await model.generateContent(prompt)
                responseText = result.response.text()
                if (responseText) break
            } catch (err) {
                const isTransient = err.status === 503 || err.status === 429 || 
                                   err.message?.includes("503") || 
                                   err.message?.includes("429") ||
                                   err.message?.includes("high demand");

                if (isTransient && i < maxRetries - 1) {
                    const delay = Math.pow(2, i) * 2000;
                    console.log(`Gemini API busy in experience matcher (attempt ${i + 1}/${maxRetries}). Retrying...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw err;
            }
        }

        if (!responseText) throw new Error("No response from Gemini")

        let cleaned = responseText.trim().replace(/```json/g, "").replace(/```/g, "").trim()
        const matchData = JSON.parse(cleaned)

        // 3. Merge AI scores back with full experience data
        const results = matchData.matches.map(m => {
            const exp = experiences.find(e => e.id === m.id)
            return {
                ...exp,
                relevanceScore: m.relevanceScore,
                matchReasoning: m.matchReasoning
            }
        }).sort((a, b) => b.relevanceScore - a.relevanceScore)

        return res.status(200).json({
            experiences: results,
            idealProfile: matchData.idealProfile
        })

    } catch (error) {
        console.error("Experience Match Error:", error)
        res.status(500).json({ error: "Failed to match experiences", details: error.message })
    }
}
