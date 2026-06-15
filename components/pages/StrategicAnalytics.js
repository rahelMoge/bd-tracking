import { useState, useEffect } from 'react'
import axios from 'axios'
import { PageHeader } from '../UI'

const BAR_COLORS = ['#3b5bdb', '#805ad5', '#2c7a7b', '#276749', '#b7791f', '#c53030', '#2b6cb0', '#744210']

function BarChart({ data }) {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {data.map((d, i) => (
                <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 11, color: '#a0aec0', width: 100, textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.label}</div>
                    <div style={{ flex: 1, background: '#0f1117', borderRadius: 3, height: 16, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((d.value / max) * 100)}%`, height: '100%', background: BAR_COLORS[i % BAR_COLORS.length], borderRadius: 3, transition: 'width 0.4s' }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#718096', width: 20, flexShrink: 0 }}>{d.value}</div>
                </div>
            ))}
        </div>
    )
}

function DonutChart({ data }) {
    if (!data.length || data.every(d => d.value === 0)) return <div style={{ color: '#4a5568', fontSize: 12, marginTop: 16, textAlign: 'center' }}>No data yet</div>
    const total = data.reduce((s, d) => s + d.value, 0)
    let cumulative = 0
    const segments = data.map((d, i) => {
        const pct = d.value / total; const start = cumulative; cumulative += pct
        return { ...d, pct, start, color: BAR_COLORS[i % BAR_COLORS.length] }
    })
    const toXY = pct => { const a = pct * 2 * Math.PI - Math.PI / 2; return [50 + 35 * Math.cos(a), 50 + 35 * Math.sin(a)] }
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
            <svg viewBox="0 0 100 100" style={{ width: 80, height: 80, flexShrink: 0 }}>
                {segments.map((s, i) => {
                    const [x1, y1] = toXY(s.start); const [x2, y2] = toXY(s.start + s.pct)
                    return <path key={i} d={`M50,50 L${x1},${y1} A35,35 0 ${s.pct > 0.5 ? 1 : 0},1 ${x2},${y2} Z`} fill={s.color} />
                })}
                <circle cx="50" cy="50" r="20" fill="#141720" />
                <text x="50" y="54" textAnchor="middle" fontSize="10" fill="#e2e8f0">{total}</text>
            </svg>
            <div style={{ flex: 1 }}>
                {segments.map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#a0aec0', flex: 1 }}>{s.label}</span>
                        <span style={{ fontSize: 11, color: '#718096' }}>{Math.round(s.pct * 100)}%</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function StrategicAnalytics() {
    const [opportunities, setOpportunities] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/opportunities').then(r => { setOpportunities(r.data); setLoading(false) })
    }, [])

    const total = opportunities.length
    const activeBids = opportunities.filter(o => o.bidDecision === 'BID').length
    const submitted = opportunities.filter(o => o.stage === 'Submitted').length
    const won = opportunities.filter(o => o.stage === 'Won').length
    const winRate = submitted + won > 0 ? Math.round((won / (submitted + won)) * 100) : 0

    const tally = key => opportunities.reduce((acc, o) => { if (o[key]) acc[o[key]] = (acc[o[key]] || 0) + 1; return acc }, {})
    const topN = (obj, n = 10) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n).map(([label, value]) => ({ label, value }))

    const sectorData = topN(tally('sector'))
    const geoData = topN(tally('country'))
    const bidData = [
        { label: 'BID', value: opportunities.filter(o => o.bidDecision === 'BID').length },
        { label: 'NO-BID', value: opportunities.filter(o => o.bidDecision === 'NO-BID').length },
        { label: 'Not Decided', value: opportunities.filter(o => o.bidDecision === 'Not Decided').length },
    ].filter(d => d.value > 0)
    const propTypeData = topN(tally('proposalType'))
    const fitData = [
        { label: 'High', value: opportunities.filter(o => o.strategicFit === 'High').length },
        { label: 'Medium', value: opportunities.filter(o => o.strategicFit === 'Med').length },
        { label: 'Low', value: opportunities.filter(o => o.strategicFit === 'Low').length },
    ].filter(d => d.value > 0)

    if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>Loading...</div>

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <PageHeader icon="📊" title="Strategic Analytics" subtitle="Insights into business development performance and positioning">
                <button onClick={() => axios.get('/api/opportunities').then(r => setOpportunities(r.data))} style={{ background: 'none', border: '1px solid #2d3748', borderRadius: 7, padding: '7px 10px', color: '#a0aec0', cursor: 'pointer', fontSize: 13 }}>↻</button>
            </PageHeader>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                    {[{ label: 'Total Opportunities', value: total }, { label: 'Active BIDs', value: activeBids }, { label: 'Submitted', value: submitted }, { label: 'Win Rate', value: `${winRate}%` }].map(s => (
                        <div key={s.label} style={{ background: '#141720', border: '1px solid #2d3748', borderRadius: 10, padding: '18px 16px' }}>
                            <div style={{ fontSize: 26, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{s.value}</div>
                            <div style={{ fontSize: 12, color: '#718096' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                    <ChartCard title="Sector Focus (Top 10)">{sectorData.length ? <BarChart data={sectorData} /> : <Empty />}</ChartCard>
                    <ChartCard title="Geographical Spread (Top 10)">{geoData.length ? <BarChart data={geoData} /> : <Empty />}</ChartCard>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                    <ChartCard title="Bid Decision Split"><DonutChart data={bidData} /></ChartCard>
                    <ChartCard title="Proposal Types">{propTypeData.length ? <BarChart data={propTypeData} /> : <Empty />}</ChartCard>
                    <ChartCard title="Strategic Fit Distribution"><DonutChart data={fitData} /></ChartCard>
                </div>
            </div>
        </div>
    )
}

function ChartCard({ title, children }) {
    return (
        <div style={{ background: '#141720', border: '1px solid #2d3748', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{title}</div>
            {children}
        </div>
    )
}

function Empty() {
    return <div style={{ fontSize: 12, color: '#4a5568', marginTop: 16, textAlign: 'center' }}>No data yet</div>
}