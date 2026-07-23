import { useState, useEffect } from 'react'
import axios from 'axios'
import { PageHeader, Badge } from '../UI'

function StatCard({ label, value, sub, color = '#3b82f6', i }) {
    return (
        <div className="glass-card animate-fade" style={{ 
            borderRadius: 20, padding: '24px', 
            display: 'flex', flexDirection: 'column', gap: 6,
            animationDelay: `${i * 0.1}s`,
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{ 
                position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`
            }} />
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#f8fafc', letterSpacing: '-1px' }}>{value}</div>
            {sub && <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{sub}</div>}
        </div>
    )
}

function SimpleBarChart({ data, title, color = '#3b82f6' }) {
    const max = Math.max(...Object.values(data), 1)
    return (
        <div className="glass-card" style={{ borderRadius: 24, padding: 28 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 4, height: 16, background: color, borderRadius: 2 }} />
                {title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {Object.entries(data).map(([label, val]) => (
                    <div key={label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 600 }}>
                            <span>{label}</span>
                            <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{val}</span>
                        </div>
                        <div style={{ height: 10, background: 'rgba(255,255,255,0.04)', borderRadius: 5, overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: color, width: `${(val / max) * 100}%`, borderRadius: 5, transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
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
        axios.get('/api/analytics')
            .then(r => {
                setData(r.data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching analytics:', err)
                setLoading(false)
            })
    }, [])

    if (loading) return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="animate-fade" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>🔮</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>Generating Market Insights...</div>
            </div>
        </div>
    )

    const { metrics, charts } = data

    return (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="animate-fade">
            <PageHeader icon="📊" title="Strategic Intelligence" subtitle="Performance analytics and firm positioning" />
            
            <div style={{ padding: '0 24px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Top Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                    <StatCard i={0} label="Market Volume" value={metrics.total} sub="Filtered opportunities" color="#3b82f6" />
                    <StatCard i={1} label="Bid Capacity" value={metrics.submitted} sub="Active bid attempts" color="#6366f1" />
                    <StatCard i={2} label="Conversion" value={metrics.won} sub="Contracts won" color="#10b981" />
                    <StatCard i={3} label="Global Win Rate" value={metrics.winRate} sub="Efficiency ratio" color="#f59e0b" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <SimpleBarChart title="Primary Sectors" data={charts.sectors} color="#10b981" />
                    <SimpleBarChart title="Geographic Presence" data={charts.countries} color="#6366f1" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                    <SimpleBarChart title="Competitive Advantages" data={charts.strengths} color="#3b82f6" />
                    <SimpleBarChart title="Capability Gaps" data={charts.weaknesses} color="#ef4444" />
                </div>

                {/* Resource Utilization */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                    <div className="glass-card" style={{ borderRadius: 24, padding: 28 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>Human Resource Alignment</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {charts.experts.map(e => (
                                <div key={e.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 18px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{e.name}</span>
                                    <Badge color="blue">{e.count} Bids</Badge>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card" style={{ borderRadius: 24, padding: 28, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>Track Record Utilization</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                            {charts.experiences.map(e => (
                                <div key={e.title} style={{ paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{e.title}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: 11, color: '#64748b' }}>Reference Frequency</div>
                                        <Badge color="purple">{e.count} Hits</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}