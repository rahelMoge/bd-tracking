import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const opportunities = await prisma.opportunity.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(opportunities)
    }
    if (req.method === 'POST') {
        const opportunity = await prisma.opportunity.create({
            data: req.body
        })
        return res.status(201).json(opportunity)
    }
    res.status(405).json({ message: 'Method not allowed' })
}