import prisma from '../../lib/prisma'

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

    try {
        const [opportunities, experts, experiences, partners] = await Promise.all([
            prisma.opportunity.findMany(),
            prisma.expert.findMany(),
            prisma.experience.findMany(),
            prisma.partner.findMany()
        ])

        // 1. Win Rate Metrics
        const submitted = opportunities.filter(o => o.submitted || o.stage === 'Submitted' || o.stage === 'Won' || o.stage === 'Lost').length
        const won = opportunities.filter(o => o.stage === 'Won').length
        const winRate = submitted > 0 ? (won / submitted * 100).toFixed(1) : 0

        // 2. Sector Focus
        const sectors = {}
        opportunities.forEach(o => {
            if (o.sector) sectors[o.sector] = (sectors[o.sector] || 0) + 1
        })

        // 3. Geographical Spread
        const countries = {}
        opportunities.forEach(o => {
            if (o.country) countries[o.country] = (countries[o.country] || 0) + 1
        })

        // 4. Type Distribution
        const types = {}
        opportunities.forEach(o => {
            if (o.proposalType) types[o.proposalType] = (types[o.proposalType] || 0) + 1
        })

        // 5. Expert Utilization
        // count occurrences in expertIds JSON arrays
        const expertUsage = {}
        opportunities.forEach(o => {
            const ids = Array.isArray(o.expertIds) ? o.expertIds : []
            ids.forEach(id => {
                expertUsage[id] = (expertUsage[id] || 0) + 1
            })
        })
        const expertStats = experts.map(e => ({
            name: e.name,
            count: expertUsage[e.id] || 0
        })).sort((a, b) => b.count - a.count).slice(0, 10)

        // 6. Experience Utilization
        const expUsage = {}
        opportunities.forEach(o => {
            const ids = Array.isArray(o.experienceIds) ? o.experienceIds : []
            ids.forEach(id => {
                expUsage[id] = (expUsage[id] || 0) + 1
            })
        })
        const experienceStats = experiences.map(e => ({
            title: e.title,
            count: expUsage[e.id] || 0
        })).sort((a, b) => b.count - a.count).slice(0, 10)

        // 7. Source Analysis (assuming 'collectedBy' or similar represents source for now, 
        // or just grouping by client as a proxy if source field isn't explicit)
        const sources = {}
        opportunities.forEach(o => {
            const src = o.collectedBy || 'Other'
            if (!sources[src]) sources[src] = { count: 0, won: 0 }
            sources[src].count++
            if (o.stage === 'Won') sources[src].won++
        })

        return res.status(200).json({
            metrics: {
                total: opportunities.length,
                submitted,
                won,
                winRate: `${winRate}%`
            },
            charts: {
                sectors,
                countries,
                types,
                experts: expertStats,
                experiences: experienceStats,
                sources
            }
        })
    } catch (err) {
        console.error('Analytics error:', err)
        res.status(500).json({ error: 'Failed to fetch analytics' })
    }
}
