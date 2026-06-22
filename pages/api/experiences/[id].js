import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    const { id } = req.query
    const numId = parseInt(id)

    if (isNaN(numId)) {
        return res.status(400).json({ message: 'Invalid ID' })
    }

    if (req.method === 'PUT') {
        try {
            const { id: _, createdAt, updatedAt, ...safeData } = req.body
            const updated = await prisma.experience.update({
                where: { id: numId },
                data: safeData
            })
            return res.status(200).json(updated)
        } catch (err) {
            return res.status(500).json({ message: 'Update failed', error: err.message })
        }
    }

    if (req.method === 'DELETE') {
        try {
            await prisma.experience.delete({ where: { id: numId } })
            return res.status(200).json({ message: 'Deleted' })
        } catch (err) {
            return res.status(500).json({ message: 'Delete failed', error: err.message })
        }
    }

    res.status(405).json({ message: 'Method not allowed' })
}