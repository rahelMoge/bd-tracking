import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const experts = await prisma.expert.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(experts)
    }
    if (req.method === 'POST') {
        const expert = await prisma.expert.create({
            data: req.body
        })
        return res.status(201).json(expert)
    }
    res.status(405).json({ message: 'Method not allowed' })
}