import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const partners = await prisma.partner.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(partners)
    }
    if (req.method === 'POST') {
        const partner = await prisma.partner.create({
            data: req.body
        })
        return res.status(201).json(partner)
    }
    res.status(405).json({ message: 'Method not allowed' })
}