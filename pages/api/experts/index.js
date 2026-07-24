import prisma, { withDbRetry } from '../../../lib/prisma'

export default async function handler(req, res) {
    try {
        if (req.method === 'GET') {
            const experts = await withDbRetry(p => p.expert.findMany({
                orderBy: { createdAt: 'desc' }
            }))
            return res.status(200).json(experts)
        }
        if (req.method === 'POST') {
            const expert = await withDbRetry(p => p.expert.create({
                data: req.body
            }))
            return res.status(201).json(expert)
        }
        res.status(405).json({ message: 'Method not allowed' })
    } catch (err) {
        console.error('API Experts Error:', err)
        res.status(500).json({ error: 'Database operation failed', details: err.message })
    }
}