import prisma from '../../lib/prisma'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        const [
            opportunityCount,
            expertCount,
            experienceCount,
            partnerCount,
            recentOpportunities,
            recentExperts
        ] = await Promise.all([
            prisma.opportunity.count(),
            prisma.expert.count(),
            prisma.experience.count(),
            prisma.partner.count(),
            prisma.opportunity.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.expert.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5
            })
        ])

        // Stage-wise breakdown for opportunities
        const stageStats = await prisma.opportunity.groupBy({
            by: ['stage'],
            _count: {
                id: true
            }
        })

        return res.status(200).json({
            stats: {
                opportunities: opportunityCount,
                experts: expertCount,
                experiences: experienceCount,
                partners: partnerCount
            },
            recent: {
                opportunities: recentOpportunities,
                experts: recentExperts
            },
            stages: stageStats
        })
    } catch (error) {
        console.error('Stats API Error:', error)
        return res.status(500).json({ error: 'Failed to fetch dashboard stats' })
    }
}
