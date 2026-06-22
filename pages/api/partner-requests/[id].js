import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    const { id } = req.query
    const numId = parseInt(id)

    if (req.method === 'PUT') {
        try {
            const updated = await prisma.partnerRequest.update({
                where: { id: numId },
                data: req.body
            })
            return res.status(200).json(updated)
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }
    if (req.method === 'DELETE') {
        try {
            await prisma.partnerRequest.delete({ where: { id: numId } })
            return res.status(200).json({ success: true })
        } catch (err) {
            return res.status(500).json({ error: err.message })
        }
    }
    res.status(405).json({ message: 'Method not allowed' })
}
