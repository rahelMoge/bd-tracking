// ✅ CORRECT IMPORT PATH for [id] route
import prisma from '../../../lib/prisma' // ← Fixed: only 3 dots, not 4!

export default async function handler(req, res) {
    try {
        const { id } = req.query

        // Validate ID is number
        const numId = parseInt(id)
        if (!numId || isNaN(numId)) {
            return res.status(400).json({ error: 'Invalid ID format' })
        }

        // UPDATE operation (PUT)
        if (req.method === 'PUT') {
            const body = req.body

            // Check existence first
            const exists = await prisma.opportunity.findUnique({ where: { id: numId } })
            if (!exists) return res.status(404).json({ error: 'Opportunity not found' })

            // Build update data (only include fields present in body)
            const updates = {}

            if (body.title !== undefined) updates.title = body.title.trim()
            if (body.client !== undefined) updates.client = body.client?.trim() || null
            if (body.stage !== undefined) updates.stage = body.stage
            if (body.deadline !== undefined) updates.deadline = body.deadline || null
            if (body.proposalType !== undefined) updates.proposalType = body.proposalType || null
            if (body.serviceCategory !== undefined) updates.serviceCategory = body.serviceCategory || null
            if (body.strategicFit !== undefined) updates.strategicFit = body.strategicFit
            if (body.bidDecision !== undefined) updates.bidDecision = body.bidDecision
            if (body.sector !== undefined) updates.sector = body.sector
            if (body.collectedBy !== undefined) updates.collectedBy = body.collectedBy?.trim() || null
            if (body.country !== undefined) updates.country = body.country?.trim() || null
            if (body.notes !== undefined) updates.notes = body.notes?.trim() || null
            // Map file URL fields
            if (body.documentUrl !== undefined || body.fileUrl !== undefined) {
                updates.documentUrl = body.documentUrl || body.fileUrl || null
            }
            if (body.aiSummary !== undefined) updates.aiSummary = body.aiSummary || null

            // Perform update
            const updated = await prisma.opportunity.update({
                where: { id: numId },
                data: { ...updates, updatedAt: new Date() }
            })

            console.log('✅ Updated ID:', numId)
            return res.status(200).json(updated)
        }

        // DELETE operation (DELETE)
        if (req.method === 'DELETE') {
            // Verify exists before deleting
            const exists = await prisma.opportunity.findUnique({ where: { id: numId } })
            if (!exists) return res.status(404).json({ error: 'Not found' })

            await prisma.opportunity.delete({ where: { id: numId } })

            console.log('🗑️ Deleted ID:', numId)
            return res.status(200).json({ success: true, deletedId: numId })
        }

        // Optional: GET single item
        if (req.method === 'GET') {
            const item = await prisma.opportunity.findUnique({
                where: { id: numId }
            })
            if (!item) return res.status(404).json({ error: 'Not found' })
            return res.status(200).json(item)
        }

        return res.status(405).json({ error: 'Method Not Allowed' })

    } catch (error) {
        console.error('❌ Operation Error:', error.message)

        // Handle Prisma-specific errors
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Record not found in database' })
        }
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Unique constraint violation' })
        }

        return res.status(500).json({ error: error.message || 'Internal server error' })
    }
}