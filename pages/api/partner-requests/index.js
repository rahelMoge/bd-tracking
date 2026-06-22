import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const requests = await prisma.partnerRequest.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(requests)
    }
    if (req.method === 'POST') {
        try {
            const request = await prisma.partnerRequest.create({
                data: req.body
            })
            return res.status(201).json(request)
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }
    res.status(405).json({ message: 'Method not allowed' })
}
