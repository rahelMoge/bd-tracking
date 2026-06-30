import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    // ================= GET =================
    if (req.method === 'GET') {
        try {
            const experiences = await prisma.experience.findMany({
                orderBy: { createdAt: 'desc' }
            })

            return res.status(200).json(experiences)

        } catch (err) {
            console.error(err)
            return res.status(500).json({
                message: 'Failed to fetch experiences',
                error: err.message
            })
        }
    }

    // ================= POST =================
    if (req.method === 'POST') {
        try {
            const experience = await prisma.experience.create({
                data: req.body
            })

            return res.status(201).json(experience)

        } catch (err) {
            console.error(err)
            return res.status(500).json({
                message: 'Failed to create experience',
                error: err.message
            })
        }
    }

    // ================= METHOD NOT ALLOWED =================
    return res.status(405).json({
        message: 'Method not allowed'
    })
}