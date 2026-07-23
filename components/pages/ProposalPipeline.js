import { useState, useEffect } from 'react'
import axios from 'axios'
import { Badge, EmptyState } from '../UI'

const TABS = ['All', 'Decision Pending', 'Bid Preparation', 'Submitted', 'Won', 'Lost']
const stageColor = s => ({ Won: 'green', Lost: 'red', Submitted: 'blue', 'Bid Preparation': 'purple', 'Decision Pending': 'yellow' }[s] || 'gray')
const fitColor = f => ({ High: 'green', Med: 'yellow', Low: 'red' }[f] || 'gray')

export default function ProposalPipeline({ navigate }) {
    const [opportunities, setOpportunities] = useState([])
    const [activeTab, setActiveTab] = useState('All')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        axios.get('/api/opportunities')
            .then(r => {
                setOpportunities(r.data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Error fetching opportunities:', err)
                setLoading(false)
            })
    }, [])

    const bids = opportunities.filter(o => o.bidDecision === 'BID')
    const filtered = activeTab === 'All' ? bids : bids.filter(o => o.stage === activeTab)
    const tabCount = tab => tab === 'All' ? bids.length : bids.filter(o => o.stage === tab).length

    if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>Loading...</div>

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #2d3748', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                <div>
                    <div style={{ fontSize: 22, fontWeight: 600, color: '#e2e8f0' }}>Proposal Pipeline</div>
                    <div style={{ fontSize: 12, color: '#718096' }}>{bids.length} active bids in progress</div>
                </div>
                <button onClick={() => axios.get('/api/opportunities').then(r => setOpportunities(r.data)).catch(console.error)} style={{ background: 'none', border: '1px solid #2d3748', borderRadius: 7, padding: '7px 10px', color: '#a0aec0', cursor: 'pointer', fontSize: 14 }}>↻</button>
            </div>

            <div style={{ padding: '12px 24px 0', borderBottom: '1px solid #2d3748', display: 'flex', gap: 6, flexShrink: 0 }}>
                {TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        background: activeTab === tab ? '#3b5bdb' : 'none',
                        color: activeTab === tab ? '#fff' : '#a0aec0',
                        border: activeTab === tab ? 'none' : '1px solid #2d3748',
                        borderBottom: 'none', borderRadius: '7px 7px 0 0',
                        padding: '7px 14px', fontSize: 13, cursor: 'pointer',
                        fontWeight: activeTab === tab ? 600 : 400, marginBottom: -1
                    }}>
                        {tab} ({tabCount(tab)})
                    </button>
                ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                {filtered.length === 0
                    ? <EmptyState icon="💼" message={bids.length === 0 ? "No BID opportunities yet. Go to Opportunity Tracker and set bid decisions." : "No opportunities in this stage."} />
                    : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                            {filtered.map(o => (
                                <div key={o.id} style={{ background: '#141720', border: '1px solid #2d3748', borderRadius: 10, padding: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', flex: 1, marginRight: 8, lineHeight: 1.4 }}>{o.title}</div>
                                        <Badge color={stageColor(o.stage)}>{o.stage}</Badge>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>{o.client || '—'}</div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {o.strategicFit && <Badge color={fitColor(o.strategicFit)}>Fit: {o.strategicFit}</Badge>}
                                        {o.serviceCategory && <Badge color="gray">{o.serviceCategory}</Badge>}
                                        {o.sector && <Badge color="gray">{o.sector}</Badge>}
                                    </div>
                                    {o.deadline && <div style={{ marginTop: 10, fontSize: 11, color: '#fc8181' }}>📅 {o.deadline}</div>}
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
    )
}