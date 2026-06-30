import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
    const { id } = req.query
    const numId = parseInt(id)

    // Validate ID
    if (isNaN(numId)) {
        return res.status(400).json({ message: 'Invalid ID' })
    }

    // ===================== PUT (UPDATE) =====================
    if (req.method === 'PUT') {
        try {
            const { id: _, createdAt, updatedAt, ...safeData } = req.body

            const updated = await prisma.experience.update({
                where: { id: numId },
                data: safeData
            })

            return res.status(200).json(updated)

        } catch (err) {
            console.error(err)

            // Prisma "record not found"
            if (err.code === 'P2025') {
                return res.status(404).json({
                    message: 'Experience not found'
                })
            }

            return res.status(500).json({
                message: 'Update failed',
                error: err.message
            })
        }
    }

    // ===================== DELETE =====================
    if (req.method === 'DELETE') {
        try {
            await prisma.experience.delete({
                where: { id: numId }
            })

            return res.status(200).json({
                message: 'Deleted successfully'
            })

        } catch (err) {
            console.error(err)

            if (err.code === 'P2025') {
                return res.status(404).json({
                    message: 'Experience not found'
                })
            }

            return res.status(500).json({
                message: 'Delete failed',
                error: err.message
            })
        }
    }

    // ===================== METHOD NOT ALLOWED =====================
    return res.status(405).json({
        message: 'Method not allowed'
    })
}