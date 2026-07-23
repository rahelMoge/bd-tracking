import { PrismaClient } from "@prisma/client"
import { geminiGenerate } from "../../../lib/gemini"

const prisma = new PrismaClient()

function parseCleanJson(text) {
    if (!text) throw new Error("Empty response from AI");
    let cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");
    try {
        return JSON.parse(cleaned);
    } catch (e1) {
        let repaired = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ").replace(/,\s*([}\]])/g, "$1");
        const opens = (repaired.match(/\{/g) || []).length;
        const closes = (repaired.match(/\}/g) || []).length;
        for (let i = 0; i < opens - closes; i++) repaired += "}";
        const openSq = (repaired.match(/\[/g) || []).length;
        const closeSq = (repaired.match(/\]/g) || []).length;
        for (let i = 0; i < openSq - closeSq; i++) repaired += "]";
        try {
            return JSON.parse(repaired);
        } catch (e2) {
            throw new Error(`JSON parse error: ${e1.message}`);
        }
    }
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" })

    try {
        let { opportunityId, torSummary, opportunity } = req.body

        if (!torSummary || Object.keys(torSummary).length === 0) {
            const opp = opportunity || (opportunityId ? await prisma.opportunity.findUnique({ where: { id: Number(opportunityId) } }) : null);
            if (opp) {
                torSummary = {
                    scopeOfWork: opp.notes || opp.title || "Consulting Services",
                    requiredExperts: [{ 
                        position: opp.title || "Expert", 
                        keySkills: opp.sector || opp.serviceCategory || "Specialist" 
                    }],
                    requiredExperiences: [{ 
                        sector: opp.sector || "General", 
                        description: opp.notes || opp.title || "" 
                    }]
                };
            } else {
                return res.status(400).json({ error: "torSummary or opportunity details are required" })
            }
        }

        // 1. Fetch all experiences from database
        const experiences = await prisma.experience.findMany()

        if (experiences.length === 0) {
            return res.status(200).json({ experiences: [], recommendation: "No firm experiences found in database." })
        }

        // 2. Prepare the prompt for Gemini
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY
        if (!GEMINI_API_KEY) return res.status(500).json({ error: "Missing GEMINI_API_KEY" })


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
        try {
            responseText = await geminiGenerate(GEMINI_API_KEY, prompt)
        } catch (err) {
            console.error("Experience Match Gemini API Error:", err);
            return res.status(500).json({
                error: "Failed to match experiences via Gemini",
                details: err.message
            });
        }

        if (!responseText) throw new Error("No response from Gemini")

        let matchData = parseCleanJson(responseText)

        // 3. Merge AI scores back with full experience data
        const results = (matchData.matches || []).map(m => {
            const exp = experiences.find(e => e.id === m.id)
            if (!exp) return null
            return {
                ...exp,
                relevanceScore: m.relevanceScore,
                matchReasoning: m.matchReasoning
            }
        }).filter(Boolean).sort((a, b) => b.relevanceScore - a.relevanceScore)

        return res.status(200).json({
            experiences: results,
            idealProfile: matchData.idealProfile
        })

    } catch (error) {
        console.error("Experience Match Error:", error)
        res.status(500).json({ error: "Failed to match experiences", details: error.message })
    }
}
