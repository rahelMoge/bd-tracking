import { useState, useEffect } from 'react'
import axios from 'axios'

const STAGES = ['TOR Collection', 'Under Review', 'Qualification Review', 'Decision Pending', 'Bid Preparation', 'Submitted', 'Won', 'Lost']

export default function Dashboard({ navigate }) {
    const [opportunities, setOpportunities] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/opportunities').then(r => {
            setOpportunities(r.data)
            setLoading(false)
        })
    }, [])

    const now = new Date()
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const upcoming = opportunities.filter(o =>
        o.deadline && new Date(o.deadline) <= in30 && new Date(o.deadline) >= now
    )

    const stageCounts = STAGES.reduce((acc, s) => {
        acc[s] = opportunities.filter(o => o.stage === s).length
        return acc
    }, {})

    const serviceMix = opportunities.reduce((acc, o) => {
        if (o.serviceCategory) acc[o.serviceCategory] = (acc[o.serviceCategory] || 0) + 1
        return acc
    }, {})

    const bidCounts = {
        BID: opportunities.filter(o => o.bidDecision === 'BID').length,
        'NO-BID': opportunities.filter(o => o.bidDecision === 'NO-BID').length,
        'Not Decided': opportunities.filter(o => o.bidDecision === 'Not Decided').length,
    }

    const fitCounts = {
        High: opportunities.filter(o => o.strategicFit === 'High').length,
        Med: opportunities.filter(o => o.strategicFit === 'Med').length,
        Low: opportunities.filter(o => o.strategicFit === 'Low').length,
    }

    if (loading) return <LoadingScreen />

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{
                padding: '18px 24px 14px',
                borderBottom: '1px solid #2d3748',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0
            }}>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: '#e2e8f0' }}>Dashboard</div>
                    <div style={{ fontSize: 12, color: '#718096' }}>Business Development Overview</div>
                </div>
                <button
                    onClick={() => navigate('opportunities')}
                    style={{
                        background: '#3b5bdb', color: '#fff',
                        border: 'none', borderRadius: 8,
                        padding: '8px 16px', fontSize: 13,
                        cursor: 'pointer', fontWeight: 500
                    }}
                >
                    View All Opportunities →
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                {/* Upcoming Deadlines */}
                <SectionLabel>📅 UPCOMING SUBMISSION DEADLINES (next 30 days)</SectionLabel>
                <div style={{
                    background: '#141720', border: '1px solid #2d3748',
                    borderRadius: 8, padding: '12px 16px', marginBottom: 20
                }}>
                    {upcoming.length === 0
                        ? <span style={{ color: '#4a5568', fontSize: 13 }}>No deadlines in the next 30 days.</span>
                        : upcoming.map(o => (
                            <div key={o.id} style={{
                                display: 'flex', justifyContent: 'space-between',
                                fontSize: 13, color: '#e2e8f0', padding: '4px 0',
                                borderBottom: '1px solid #2d374844'
                            }}>
                                <span>{o.title}</span>
                                <span style={{ color: '#fc8181' }}>{o.deadline}</span>
                            </div>
                        ))
                    }
                </div>

                {/* Pipeline Stages */}
                <SectionLabel>PIPELINE STAGES</SectionLabel>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 10, marginBottom: 20
                }}>
                    {STAGES.map(s => (
                        <div key={s} style={{
                            background: '#141720', border: '1px solid #2d3748',
                            borderRadius: 8, padding: 14
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 600, color: '#e2e8f0' }}>
                                {stageCounts[s] || 0}
                            </div>
                            <div style={{ fontSize: 11, color: '#718096', marginTop: 4 }}>{s}</div>
                        </div>
                    ))}
                </div>

                {/* Service Category Mix */}
                <SectionLabel>🏷️ SERVICE CATEGORY MIX</SectionLabel>
                <div style={{
                    background: '#141720', border: '1px solid #2d3748',
                    borderRadius: 8, padding: '12px 16px', marginBottom: 20
                }}>
                    {Object.keys(serviceMix).length === 0
                        ? <span style={{ color: '#4a5568', fontSize: 13 }}>No data yet. Add opportunities with service categories.</span>
                        : Object.entries(serviceMix).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                            <div key={k} style={{
                                display: 'flex', justifyContent: 'space-between',
                                fontSize: 13, color: '#a0aec0', padding: '4px 0'
                            }}>
                                <span>{k}</span>
                                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{v}</span>
                            </div>
                        ))
                    }
                </div>

                {/* Bottom Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    <StatCard title="🎯 Bid Decisions" rows={[
                        { icon: '✅', label: 'BID', val: bidCounts.BID, color: '#68d391' },
                        { icon: '❌', label: 'NO-BID', val: bidCounts['NO-BID'], color: '#fc8181' },
                        { icon: '⏳', label: 'Not Decided', val: bidCounts['Not Decided'], color: '#f6e05e' },
                    ]} />
                    <StatCard title="📈 Strategic Fit" rows={[
                        { icon: '↗', label: 'High', val: fitCounts.High, color: '#68d391' },
                        { icon: '📊', label: 'Med', val: fitCounts.Med, color: '#f6ad55' },
                        { icon: '↘', label: 'Low', val: fitCounts.Low, color: '#fc8181' },
                    ]} />
                    <StatCard title="🗂️ Outcomes" rows={[
                        { label: 'Total Opportunities', val: opportunities.length },
                        { label: 'Submitted', val: stageCounts['Submitted'] || 0, color: '#7b9cff' },
                        { label: 'Won', val: stageCounts['Won'] || 0, color: '#68d391' },
                    ]} />
                </div>
            </div>
        </div>
    )
}

function SectionLabel({ children }) {
    return (
        <div style={{
            fontSize: 11, color: '#718096',
            letterSpacing: '0.06em', textTransform: 'uppercase',
            fontWeight: 600, marginBottom: 10
        }}>
            {children}
        </div>
    )
}

function StatCard({ title, rows }) {
    return (
        <div style={{
            background: '#141720', border: '1px solid #2d3748',
            borderRadius: 8, padding: 14
        }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 10 }}>{title}</div>
            {rows.map((r, i) => (
                <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    fontSize: 12, color: '#a0aec0', padding: '3px 0'
                }}>
                    <span>{r.icon} {r.label}</span>
                    <span style={{ color: r.color || '#e2e8f0', fontWeight: 500 }}>{r.val}</span>
                </div>
            ))}
        </div>
    )
}

function LoadingScreen() {
    return (
        <div style={{
            flex: 1, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color: '#718096', fontSize: 14
        }}>
            Loading...
        </div>
    )
}