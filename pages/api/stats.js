import prisma from '../../lib/prisma'

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        const [counts, recentOpportunities, recentExperts, stageStats] = await Promise.all([
            prisma.$queryRaw`
                SELECT 
                    (SELECT COUNT(*)::int FROM opportunities) as "opportunities",
                    (SELECT COUNT(*)::int FROM experts) as "experts",
                    (SELECT COUNT(*)::int FROM experiences) as "experiences",
                    (SELECT COUNT(*)::int FROM partners) as "partners"
            `,
            prisma.opportunity.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.expert.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            prisma.opportunity.groupBy({
                by: ['stage'],
                _count: { id: true }
            })
        ])

        const statsCounts = Array.isArray(counts) && counts.length > 0 ? counts[0] : { opportunities: 0, experts: 0, experiences: 0, partners: 0 }

        return res.status(200).json({
            stats: {
                opportunities: Number(statsCounts.opportunities || 0),
                experts: Number(statsCounts.experts || 0),
                experiences: Number(statsCounts.experiences || 0),
                partners: Number(statsCounts.partners || 0)
            },
            recent: {
                opportunities: recentOpportunities || [],
                experts: recentExperts || []
            },
            stages: stageStats || []
        })
    } catch (error) {
        console.error('Stats API Error:', error)
        return res.status(500).json({ error: 'Failed to fetch dashboard stats' })
    }
}

