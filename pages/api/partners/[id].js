import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    const { id } = req.query
    if (req.method === 'PUT') {
        const updated = await prisma.partner.update({
            where: { id },
            data: req.body
        })
        return res.status(200).json(updated)
    }
    if (req.method === 'DELETE') {
        await prisma.partner.delete({ where: { id } })
        return res.status(200).json({ message: 'Deleted' })
    }
    res.status(405).json({ message: 'Method not allowed' })
}