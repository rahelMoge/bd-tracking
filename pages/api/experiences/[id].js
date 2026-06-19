import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    const { id } = req.query
    const numId = parseInt(id)

    if (req.method === 'PUT') {
        const updated = await prisma.experience.update({
            where: { id: numId },
            data: req.body
        })
        return res.status(200).json(updated)
    }
    if (req.method === 'DELETE') {
        await prisma.experience.delete({ where: { id: numId } })
        return res.status(200).json({ message: 'Deleted' })
    }
    res.status(405).json({ message: 'Method not allowed' })
}