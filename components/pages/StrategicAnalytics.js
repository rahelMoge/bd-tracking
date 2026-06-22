import { useState, useEffect } from 'react'
import axios from 'axios'
import { PageHeader, Btn, Badge, EmptyState } from '../UI'

function StatCard({ label, value, sub }) {
    return (
        <div style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 12, padding: '20px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 12, color: '#718096', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#fff' }}>{value}</div>
            {sub && <div style={{ fontSize: 12, color: '#48bb78' }}>{sub}</div>}
        </div>
    )
}

function SimpleBarChart({ data, title, color = '#3b5bdb' }) {
    const max = Math.max(...Object.values(data), 1)
    return (
        <div style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>{title}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {Object.entries(data).map(([label, val]) => (
                    <div key={label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a0aec0', marginBottom: 4 }}>
                            <span>{label}</span>
                            <span>{val}</span>
                        </div>
                        <div style={{ height: 8, background: '#1a1f2e', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: color, width: `${(val / max) * 100}%`, borderRadius: 4 }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function StrategicAnalytics() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/analytics').then(r => {
            setData(r.data)
            setLoading(false)
        })
    }, [])

    if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#718096' }}>Analyzing strategic portfolio...</div>

    const { metrics, charts } = data

    return (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <PageHeader icon="📊" title="Strategic Analytics" subtitle="Portfolio performance and market positioning" />
            
            <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Top Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <StatCard label="Total Portfolio" value={metrics.total} sub="Opportunities tracked" />
                    <StatCard label="Bids Submitted" value={metrics.submitted} sub="From BID decision" />
                    <StatCard label="Wins" value={metrics.won} sub="Contracts secured" />
                    <StatCard label="Win Rate" value={metrics.winRate} sub="Based on submissions" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <SimpleBarChart title="Sector Distribution" data={charts.sectors} color="#48bb78" />
                    <SimpleBarChart title="Geographical Spread" data={charts.countries} color="#805ad5" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <SimpleBarChart title="Proposal Type Distribution" data={charts.types} color="#ecc94b" />
                    <SimpleBarChart title="Top Sources (By Volume)" data={Object.fromEntries(Object.entries(charts.sources).map(([k,v]) => [k, v.count]))} color="#3182ce" />
                </div>

                {/* Resource Utilization */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <div style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 12, padding: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Top Experts (Matched to Bids)</div>
                        {charts.experts.map(e => (
                            <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2d3748' }}>
                                <span style={{ fontSize: 13, color: '#e2e8f0' }}>{e.name}</span>
                                <Badge color="blue">{e.count} matches</Badge>
                            </div>
                        ))}
                    </div>

                    <div style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 12, padding: 20 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Top Experiences (Matched to Bids)</div>
                        {charts.experiences.map(e => (
                            <div key={e.title} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2d3748' }}>
                                <span style={{ fontSize: 12, color: '#e2e8f0', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.title}</span>
                                <Badge color="purple">{e.count} uses</Badge>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}