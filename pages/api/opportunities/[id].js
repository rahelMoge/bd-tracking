import prisma from "../../../lib/prisma";

export default async function handler(req, res) {
    const { id } = req.query;

    try {
        const numId = Number(id);

        if (!Number.isInteger(numId) || numId <= 0) {
            return res.status(400).json({
                error: "Invalid ID format"
            });
        }

        // =========================
        // GET SINGLE OPPORTUNITY
        // =========================
        if (req.method === "GET") {
            const item = await prisma.opportunity.findUnique({
                where: { id: numId }
            });

            if (!item) {
                return res.status(404).json({
                    error: "Opportunity not found"
                });
            }

            return res.status(200).json(item);
        }

        // =========================
        // UPDATE OPPORTUNITY
        // =========================
        if (req.method === "PUT") {
            const body = req.body || {};

            const existing = await prisma.opportunity.findUnique({
                where: { id: numId }
            });

            if (!existing) {
                return res.status(404).json({
                    error: "Opportunity not found"
                });
            }

            const updates = {};

            if (body.title !== undefined)
                updates.title = body.title?.trim() || "";

            if (body.client !== undefined)
                updates.client = body.client?.trim() || null;

            if (body.stage !== undefined)
                updates.stage = body.stage;

            if (body.deadline !== undefined)
                updates.deadline = body.deadline || null;

            if (body.proposalType !== undefined)
                updates.proposalType = body.proposalType || null;

            if (body.serviceCategory !== undefined)
                updates.serviceCategory = body.serviceCategory || null;

            if (body.strategicFit !== undefined)
                updates.strategicFit = body.strategicFit;

            if (body.bidDecision !== undefined)
                updates.bidDecision = body.bidDecision;

            if (body.sector !== undefined)
                updates.sector = body.sector;

            if (body.collectedBy !== undefined)
                updates.collectedBy = body.collectedBy?.trim() || null;

            if (body.country !== undefined)
                updates.country = body.country?.trim() || null;

            if (body.notes !== undefined)
                updates.notes = body.notes?.trim() || null;

            if (
                body.documentUrl !== undefined ||
                body.fileUrl !== undefined
            ) {
                updates.documentUrl =
                    body.documentUrl ||
                    body.fileUrl ||
                    null;
            }

            if (body.aiSummary !== undefined)
                updates.aiSummary = body.aiSummary || null;

            if (body.expertIds !== undefined)
                updates.expertIds = Array.isArray(body.expertIds)
                    ? body.expertIds
                    : [];

            if (body.experienceIds !== undefined)
                updates.experienceIds = Array.isArray(body.experienceIds)
                    ? body.experienceIds
                    : [];

            // Checklist fields
            if (body.expertIdentified !== undefined)
                updates.expertIdentified = Boolean(body.expertIdentified);

            if (body.experienceSelected !== undefined)
                updates.experienceSelected = Boolean(body.experienceSelected);

            if (body.techDrafted !== undefined)
                updates.techDrafted = Boolean(body.techDrafted);

            if (body.financialPrepared !== undefined)
                updates.financialPrepared = Boolean(body.financialPrepared);

            if (body.docsCompiled !== undefined)
                updates.docsCompiled = Boolean(body.docsCompiled);

            if (body.submitted !== undefined)
                updates.submitted = Boolean(body.submitted);

            // Asana
            if (body.asanaTaskId !== undefined)
                updates.asanaTaskId = body.asanaTaskId || null;

            if (body.asanaTaskUrl !== undefined)
                updates.asanaTaskUrl = body.asanaTaskUrl || null;

            // Competitive Analysis
            if (body.competitiveScore !== undefined)
                updates.competitiveScore = body.competitiveScore;

            if (body.winProbability !== undefined)
                updates.winProbability = body.winProbability;

            if (body.knownCompetitors !== undefined)
                updates.knownCompetitors =
                    body.knownCompetitors || null;

            if (body.strengths !== undefined)
                updates.strengths = Array.isArray(body.strengths)
                    ? body.strengths
                    : [];

            if (body.weaknesses !== undefined)
                updates.weaknesses = Array.isArray(body.weaknesses)
                    ? body.weaknesses
                    : [];

            if (body.whyBid !== undefined)
                updates.whyBid = body.whyBid || null;

            if (body.whyNotBid !== undefined)
                updates.whyNotBid = body.whyNotBid || null;

            updates.updatedAt = new Date();

            const updated = await prisma.opportunity.update({
                where: {
                    id: numId
                },
                data: updates
            });

            console.log("✅ Updated Opportunity:", numId);

            return res.status(200).json(updated);
        }

        // =========================
        // DELETE OPPORTUNITY
        // =========================
        if (req.method === "DELETE") {
            const existing = await prisma.opportunity.findUnique({
                where: {
                    id: numId
                }
            });

            if (!existing) {
                return res.status(404).json({
                    error: "Opportunity not found"
                });
            }

            await prisma.opportunity.delete({
                where: {
                    id: numId
                }
            });

            console.log("🗑️ Deleted Opportunity:", numId);

            return res.status(200).json({
                success: true,
                deletedId: numId
            });
        }

        return res.status(405).json({
            error: "Method Not Allowed"
        });

    } catch (error) {
        console.error("❌ Full Error:", error);
        console.error("❌ Message:", error.message);

        if (error.code === "P2025") {
            return res.status(404).json({
                error: "Record not found"
            });
        }

        if (error.code === "P2002") {
            return res.status(400).json({
                error: "Unique constraint violation"
            });
        }

        return res.status(500).json({
            error: error.message || "Internal Server Error"
        });
    }
}