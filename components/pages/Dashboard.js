import { useState, useEffect } from 'react'
import axios from 'axios'
import { PageHeader, Badge, Btn } from '../UI'

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
        { label: 'Pipeline Ops', value: stats.opportunities, color: 'blue', icon: '💼', trend: '+12% this month' },
        { label: 'Expert Network', value: stats.experts, color: 'green', icon: '👤', trend: 'Global database' },
        { label: 'Track Record', value: stats.experiences, color: 'purple', icon: '📜', trend: 'Proven success' },
        { label: 'Global Partners', value: stats.partners, color: 'yellow', icon: '🤝', trend: 'Active outreach' }
    ]

    const getStageColor = (stage) => {
        const colors = {
            'TOR Collection': 'blue',
            'Under Review': 'yellow',
            'Decision Pending': 'purple',
            'Bid Preparation': 'blue',
            'Submitted': 'green',
            'Won': 'green',
            'Lost': 'red'
        }
        return colors[stage] || 'gray'
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 12 }} className="animate-fade">🛰️</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>Initializing Command Center...</div>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            color: '#f8fafc'
        }}>
            <PageHeader
                icon="📊"
                title="Business Development Command Center"
                subtitle="Real-time monitoring of your strategic pipeline"
            >
                <div style={{ display: 'flex', gap: 12 }}>
                    <Btn onClick={fetchStats} variant="secondary" small>🔄 Sync Data</Btn>
                    <Btn onClick={() => navigate('opportunities')}>Open Tracker</Btn>
                </div>
            </PageHeader>

            <div style={{ padding: '0 24px 24px', overflowY: 'auto', flex: 1 }}>
                
                {/* Metric Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }} className="animate-fade">
                    {metrics.map((m, i) => (
                        <div key={m.label} className="glass-card" style={{
                            padding: 24,
                            borderRadius: 20,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 12,
                            animationDelay: `${i * 0.1}s`
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start' 
                            }}>
                                <div style={{ 
                                    width: 44, height: 44, 
                                    background: `rgba(255,255,255,0.03)`,
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 22
                                }}>{m.icon}</div>
                                <div style={{ fontSize: 11, color: '#48bb78', fontWeight: 700 }}>{m.trend}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600, marginBottom: 2 }}>{m.label}</div>
                                <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-1px' }}>{m.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 24 }} className="animate-fade">
                    
                    {/* Left Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* Pipeline Distribution */}
                        <div className="glass-card" style={{ padding: 28, borderRadius: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ color: '#3b82f6' }}>🎯</span> Pipeline Distribution
                                </div>
                                <Badge color="blue">Global Views</Badge>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    {stages.map(s => {
                                        const percentage = (s._count.id / stats.opportunities) * 100
                                        return (
                                            <div key={s.stage}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>{s.stage}</span>
                                                    <span style={{ fontWeight: 700 }}>{s._count.id}</span>
                                                </div>
                                                <div style={{ height: 8, background: 'rgba(255,255,255,0.04)', borderRadius: 4, overflow: 'hidden' }}>
                                                    <div style={{ 
                                                        height: '100%', 
                                                        width: `${percentage}%`, 
                                                        background: `linear-gradient(90deg, #3b82f6, #6366f1)`,
                                                        borderRadius: 4
                                                    }} />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{stats.opportunities}</div>
                                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Active Bids</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="glass-card" style={{ padding: 28, borderRadius: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ color: '#f59e0b' }}>🕒</span> Recent Activity
                                </div>
                                <Btn variant="secondary" small onClick={() => navigate('opportunities')}>View History</Btn>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {recent.opportunities.map((opp, i) => (
                                    <div key={opp.id} style={{ 
                                        padding: '14px 20px', 
                                        background: 'rgba(255,255,255,0.02)', 
                                        borderRadius: 14, 
                                        border: '1px solid rgba(255,255,255,0.04)',
                                        display: 'flex', 
                                        justifyContent: 'space-between', 
                                        alignItems: 'center',
                                        transition: 'all 0.2s ease',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                            <div style={{ fontSize: 20 }}>📁</div>
                                            <div>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{opp.title}</div>
                                                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{opp.client || 'Strategic Lead'}</div>
                                            </div>
                                        </div>
                                        <Badge color={getStageColor(opp.stage)}>{opp.stage}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        
                        {/* New Experts */}
                        <div className="glass-card" style={{ padding: 28, borderRadius: 24 }}>
                            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>New Talent Added</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                {recent.experts.map(exp => (
                                    <div key={exp.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        <div style={{ 
                                            width: 44, height: 44, borderRadius: 14, 
                                            background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))',
                                            border: '1px solid rgba(59, 130, 246, 0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                            fontSize: 20 
                                        }}>👤</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9' }}>{exp.name}</div>
                                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{exp.specialization}</div>
                                        </div>
                                        <Btn variant="secondary" small onClick={() => navigate('experts')}>Profile</Btn>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Direct Access */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 24,
                            padding: 28,
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ 
                                position: 'absolute', top: -40, right: -40, width: 120, height: 120,
                                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)',
                                borderRadius: '50%'
                            }} />
                            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Launch Modules</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                {[
                                    { id: 'pipeline', label: 'Pipeline', icon: '⚡' },
                                    { id: 'partners', label: 'Partners', icon: '🤝' },
                                    { id: 'analytics', label: 'Analytics', icon: '📊' },
                                    { id: 'experiences', label: 'Reference', icon: '📜' }
                                ].map(btn => (
                                    <button 
                                        key={btn.id}
                                        onClick={() => navigate(btn.id)}
                                        style={{ 
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid rgba(255,255,255,0.05)',
                                            color: '#f1f5f9',
                                            padding: '16px',
                                            borderRadius: 16,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 8,
                                            transition: 'all 0.2s'
                                        }}
                                        className="module-button"
                                    >
                                        <span style={{ fontSize: 20 }}>{btn.icon}</span>
                                        {btn.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx>{`
                .module-button:hover {
                    background: rgba(255,255,255,0.08) !important;
                    border-color: rgba(59, 130, 246, 0.3) !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </div>
    )
}