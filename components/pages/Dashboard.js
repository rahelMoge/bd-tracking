import { useState, useEffect } from 'react'
import axios from 'axios'
import { PageHeader, Badge, SearchBar, Btn } from '../UI'

export default function Dashboard({ navigate }) {
    const [stats, setStats] = useState({
        opportunities: 0,
        experts: 0,
        experiences: 0,
        partners: 0
    })
    const [recent, setRecent] = useState({
        opportunities: [],
        experts: []
    })
    const [stages, setStages] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const res = await axios.get('/api/stats')
            setStats(res.data.stats)
            setRecent(res.data.recent)
            setStages(res.data.stages)
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const metrics = [
        { label: 'Total Opportunities', value: stats.opportunities, color: 'blue', icon: '💼' },
        { label: 'Expert Database', value: stats.experts, color: 'green', icon: '👤' },
        { label: 'Firm Experiences', value: stats.experiences, color: 'purple', icon: '📜' },
        { label: 'Global Partners', value: stats.partners, color: 'yellow', icon: '🤝' }
    ]

    const getStageColor = (stage) => {
        const colors = {
            'TOR Collection': 'blue',
            'Bid Decision': 'yellow',
            'Proposal Preparation': 'purple',
            'Submission': 'green',
            'Win': 'green',
            'Loss': 'red'
        }
        return colors[stage] || 'gray'
    }

    if (loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#718096' }}>Loading dashboard...</div>
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            color: '#e2e8f0'
        }}>
            <PageHeader
                icon="📊"
                title="Business Development Command Center"
                subtitle="Real-time monitoring of your strategic pipeline"
            >
                <div style={{ display: 'flex', gap: 8 }}>
                    <Btn onClick={fetchStats} variant="secondary" small>🔄 Refresh</Btn>
                    <Btn onClick={() => navigate('opportunities')}>Tracker</Btn>
                </div>
            </PageHeader>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                {/* Metric Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
                    {metrics.map(m => (
                        <div key={m.label} style={{
                            background: 'linear-gradient(145deg, #1a1f2e, #111827)',
                            border: '1px solid #2d3748',
                            borderRadius: 18,
                            padding: 24,
                            position: 'relative',
                            overflow: 'hidden',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ fontSize: 24, marginBottom: 16 }}>{m.icon}</div>
                            <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4, fontWeight: 500 }}>{m.label}</div>
                            <div style={{ fontSize: 40, fontWeight: 700, color: '#fff', letterSpacing: '-1px' }}>{m.value}</div>
                            <div style={{ marginTop: 12 }}>
                                <Badge color={m.color}>Active Track</Badge>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24, marginBottom: 24 }}>
                    {/* Pipeline & Recent Activity */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Pipeline Stage Distribution */}
                        <div style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 20, padding: 24 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span>🎯</span> Pipeline Stage Distribution
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {stages.length > 0 ? (
                                    stages.map(s => {
                                        const percentage = (s._count.id / stats.opportunities) * 100
                                        return (
                                            <div key={s.stage}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                                                    <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{s.stage}</span>
                                                    <span style={{ color: '#718096' }}>{s._count.id} ({Math.round(percentage)}%)</span>
                                                </div>
                                                <div style={{ height: 8, background: '#1a1f2e', borderRadius: 4, overflow: 'hidden' }}>
                                                    <div style={{ 
                                                        height: '100%', 
                                                        width: `${percentage}%`, 
                                                        background: `var(--badge-${getStageColor(s.stage)})`,
                                                        backgroundColor: getStageColor(s.stage) === 'blue' ? '#3b5bdb' : 
                                                                        getStageColor(s.stage) === 'purple' ? '#805ad5' :
                                                                        getStageColor(s.stage) === 'yellow' ? '#ecc94b' :
                                                                        getStageColor(s.stage) === 'green' ? '#48bb78' : '#718096',
                                                        borderRadius: 4,
                                                        transition: 'width 1s ease-out'
                                                    }} />
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div style={{ color: '#4a5568', fontSize: 13, textAlign: 'center', padding: 20 }}>No opportunity data available</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Opportunities */}
                        <div style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 20, padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div style={{ fontSize: 16, fontWeight: 600 }}>Recent Opportunities</div>
                                <Btn onClick={() => navigate('opportunities')} variant="secondary" small>View All</Btn>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {recent.opportunities.map(opp => (
                                    <div key={opp.id} style={{ 
                                        padding: 16, background: '#0f172a', borderRadius: 14, border: '1px solid #1f2937',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{opp.title}</div>
                                            <div style={{ fontSize: 12, color: '#718096' }}>{opp.client || 'Unknown Client'}</div>
                                        </div>
                                        <Badge color={getStageColor(opp.stage)}>{opp.stage}</Badge>
                                    </div>
                                ))}
                                {recent.opportunities.length === 0 && <div style={{ color: '#4a5568', fontSize: 13 }}>No recent opportunities.</div>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Recent Experts & Quick Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {/* Recent Experts */}
                        <div style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 20, padding: 24 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 18 }}>New Experts</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                {recent.experts.map(exp => (
                                    <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{ 
                                            width: 36, height: 36, borderRadius: '50%', background: '#3b5bdb22', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 
                                        }}>👤</div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 600 }}>{exp.name}</div>
                                            <div style={{ fontSize: 11, color: '#718096' }}>{exp.specialization}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Btn onClick={() => navigate('experts')} variant="secondary" small style={{ marginTop: 18, width: '100%' }}>Database</Btn>
                        </div>

                        {/* Quick Actions */}
                        <div style={{ background: 'linear-gradient(180deg, #1a1f2e, #111827)', border: '1px solid #2d3748', borderRadius: 20, padding: 24 }}>
                            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Quick Nav</div>
                            <div style={{ display: 'grid', gap: 10 }}>
                                <button 
                                    onClick={() => navigate('pipeline')} 
                                    style={{ 
                                        background: '#1e2433', border: '1px solid #2d3748', color: '#e2e8f0', 
                                        padding: '12px', borderRadius: 12, textAlign: 'left', fontSize: 13, cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#2d3748'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#1e2433'}
                                >
                                    🚀 Proposal Pipeline
                                </button>
                                <button 
                                    onClick={() => navigate('partners')} 
                                    style={{ 
                                        background: '#1e2433', border: '1px solid #2d3748', color: '#e2e8f0', 
                                        padding: '12px', borderRadius: 12, textAlign: 'left', fontSize: 13, cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#2d3748'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#1e2433'}
                                >
                                    🤝 Partner Intel
                                </button>
                                <button 
                                    onClick={() => navigate('experiences')} 
                                    style={{ 
                                        background: '#1e2433', border: '1px solid #2d3748', color: '#e2e8f0', 
                                        padding: '12px', borderRadius: 12, textAlign: 'left', fontSize: 13, cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#2d3748'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#1e2433'}
                                >
                                    📜 Track Record
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}