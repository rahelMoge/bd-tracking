import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const experiences = await prisma.experience.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return res.status(200).json(experiences)
    }
    if (req.method === 'POST') {
        const experience = await prisma.experience.create({
            data: req.body
        })
        return res.status(201).json(experience)
    }
    res.status(405).json({ message: 'Method not allowed' })
}