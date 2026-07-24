import prisma, { withDbRetry } from '../../../lib/prisma'

export default async function handler(req, res) {
    try {
        // GET all opportunities
        if (req.method === 'GET') {
            const data = await withDbRetry(p => p.opportunity.findMany({
                orderBy: { createdAt: 'desc' }
            }))
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
            return res.status(200).json(data)
        }

        // CREATE new opportunity
        if (req.method === 'POST') {
            const body = req.body

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
                documentUrl: body.documentUrl || body.fileUrl || null,
                aiSummary: body.aiSummary || null
            }

            if (!cleanData.title.trim()) {
                return res.status(400).json({
                    error: 'Title is required',
                    receivedFields: Object.keys(body)
                })
            }

            const item = await withDbRetry(p => p.opportunity.create({
                data: cleanData
            }))

            console.log('✅ Created ID:', item.id)
            return res.status(201).json(item)
        }

        return res.status(405).json({ error: 'Method Not Allowed' })

    } catch (error) {
        console.error('🔥 Error:', error.message)
        return res.status(500).json({ error: error.message })
    }
}