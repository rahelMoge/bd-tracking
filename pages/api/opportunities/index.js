import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    try {
        // GET all opportunities
        if (req.method === 'GET') {
            const data = await prisma.opportunity.findMany({
                orderBy: { createdAt: 'desc' }
            })
            return res.status(200).json(data)
        }

        // CREATE new opportunity
        if (req.method === 'POST') {
            const body = req.body

            // EXTRACT ONLY VALID FIELDS - ignore extra stuff like fileName/fileUrl if sent by mistake
            const cleanData = {
                title: body.title || '',
                client: body.client?.trim() || null,
                stage: body.stage || 'TOR Collection',
                deadline: body.deadline || null,
                proposalType: body.proposalType || null,
                serviceCategory: body.serviceCategory || null,
                strategicFit: body.strategicFit || null,
                bidDecision: body.bidDecision || null,
                sector: body.sector || null,
                collectedBy: body.collectedBy?.trim() || null,
                country: body.country?.trim() || null,
                notes: body.notes?.trim() || null,
                // Map fileUrl/fileName to documentUrl - THIS IS THE FIX
                documentUrl: body.documentUrl || body.fileUrl || null,
                aiSummary: body.aiSummary || null
            }

            // Validation
            if (!cleanData.title.trim()) {
                return res.status(400).json({
                    error: 'Title is required',
                    receivedFields: Object.keys(body) // Debug help
                })
            }

            const item = await prisma.opportunity.create({
                data: cleanData
            })

            console.log('✅ Created ID:', item.id)
            return res.status(201).json(item)
        }

        return res.status(405).json({ error: 'Method Not Allowed' })

    } catch (error) {
        console.error('🔥 Error:', error.message)
        console.error('Full:', error)
        return res.status(500).json({ error: error.message })
    }
}