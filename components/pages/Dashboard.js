import { useState } from 'react'
import { PageHeader, Badge, SearchBar, Btn } from '../UI'

const METRICS = [
    { label: 'Open opportunities', value: 34, color: 'blue' },
    { label: 'Active proposals', value: 12, color: 'purple' },
    { label: 'Pending reviews', value: 7, color: 'yellow' },
    { label: 'Clients engaged', value: 18, color: 'green' }
]

const HIGHLIGHTS = [
    'Proposal win rate is holding at 68%',
    'Next bid deadline is in 4 days',
    '3 experts need CV refresh before submission',
    'Review the new opportunity intake form' 
]

export default function Dashboard({ navigate }) {
    const [search, setSearch] = useState('')

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
                title="Dashboard"
                subtitle="High-level view of your BD pipeline"
            >
                <Btn onClick={() => navigate('opportunities')}>Go to Opportunities</Btn>
            </PageHeader>

            <div style={{ padding: 20, overflowY: 'auto' }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
                    {METRICS.map(metric => (
                        <div key={metric.label} style={{
                            flex: '1 1 220px',
                            minWidth: 220,
                            background: '#111827',
                            border: '1px solid #2d3748',
                            borderRadius: 16,
                            padding: 20
                        }}>
                            <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>{metric.label}</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{metric.value}</div>
                            <Badge color={metric.color} style={{ marginTop: 12 }}>{metric.color}</Badge>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
                    <div style={{
                        background: '#111827',
                        border: '1px solid #2d3748',
                        borderRadius: 16,
                        padding: 20,
                        minHeight: 320
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                            <div style={{ fontSize: 16, fontWeight: 600 }}>Opportunity Insights</div>
                            <SearchBar
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search opportunities"
                            />
                        </div>
                        <div style={{ display: 'grid', gap: 14 }}>
                            {HIGHLIGHTS.filter(item => item.toLowerCase().includes(search.toLowerCase())).map(item => (
                                <div key={item} style={{
                                    padding: 14,
                                    background: '#0f172a',
                                    borderRadius: 12,
                                    border: '1px solid #1f2937'
                                }}>
                                    {item}
                                </div>
                            ))}
                            {!HIGHLIGHTS.some(item => item.toLowerCase().includes(search.toLowerCase())) && (
                                <div style={{ color: '#94a3b8' }}>No highlights match your search.</div>
                            )}
                        </div>
                    </div>

                    <div style={{
                        background: '#111827',
                        border: '1px solid #2d3748',
                        borderRadius: 16,
                        padding: 20,
                        minHeight: 320,
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Quick Actions</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                            <Btn onClick={() => navigate('experts')} variant="secondary">Review Expert Database</Btn>
                            <Btn onClick={() => navigate('pipeline')} variant="secondary">View Proposal Pipeline</Btn>
                            <Btn onClick={() => navigate('partners')} variant="secondary">Exchange Partner Notes</Btn>
                            <Btn onClick={() => navigate('analytics')} variant="secondary">Open Strategic Analytics</Btn>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}