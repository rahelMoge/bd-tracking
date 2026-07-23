import { PrismaClient } from "@prisma/client";
import { geminiGenerate } from "../../../lib/gemini";

// ✅ Prevent multiple Prisma instances in dev
const globalForPrisma = global;
const prisma =
    globalForPrisma.prisma ||
    new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        let { opportunityId, torSummary, opportunity } = req.body;

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
                return res.status(400).json({ error: "torSummary or opportunity details are required" });
            }
        }

        // 1. Fetch experts
        const experts = await prisma.expert.findMany();

        if (!experts.length) {
            return res.status(200).json({
                experts: [],
                recommendation: "No experts found in database. Please import experts first."
            });
        }

        // 2. Gemini setup
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
        }

        const expertsList = experts.map(e => ({
            id: e.id,
            name: e.name,
            specialization: e.specialization,
            yearsExp: e.yearsExp,
            summary: e.summary || e.notes || ""
        }));

        const prompt = `
You are an AI Expert Matcher.

TOR REQUIREMENTS:
${JSON.stringify(torSummary)}

EXPERTS:
${JSON.stringify(expertsList)}

Return ONLY valid JSON:
{
  "matches": [
    {
      "id": 1,
      "relevanceScore": 85,
      "matchReasoning": "reason..."
    }
  ],
  "idealProfile": "string"
}
`;

        let responseText = "";
        try {
            responseText = await geminiGenerate(GEMINI_API_KEY, prompt);
        } catch (err) {
            console.error("Expert Match Gemini API Error:", err);
            return res.status(500).json({
                error: "Failed to match experts via Gemini",
                details: err.message
            });
        }

        if (!responseText) {
            return res.status(503).json({
                error: "AI temporarily unavailable. Please try again."
            });
        }

        // 4. Clean response safely
        let cleaned = responseText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        let matchData;
        try {
            matchData = JSON.parse(cleaned);
        } catch (e) {
            console.error("Invalid JSON from Gemini:", cleaned);
            return res.status(500).json({
                error: "Invalid AI response format"
            });
        }

        // 5. Merge results
        const results = (matchData.matches || [])
            .map(m => {
                const expert = experts.find(e => e.id === m.id);
                if (!expert) return null;

                return {
                    ...expert,
                    relevanceScore: m.relevanceScore,
                    matchReasoning: m.matchReasoning
                };
            })
            .filter(Boolean)
            .sort((a, b) => b.relevanceScore - a.relevanceScore);

        return res.status(200).json({
            experts: results,
            idealProfile: matchData.idealProfile || ""
        });

    } catch (error) {
        console.error("Expert Match Error:", error);

        return res.status(500).json({
            error: "Failed to match experts",
            details: error.message
        });
    }
}