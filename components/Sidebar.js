const NAV = [
    {
        section: 'CORE',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
            { id: 'opportunities', label: 'Opportunity Tracker', icon: '◉' },
            { id: 'pipeline', label: 'Proposal Pipeline', icon: '⫶' },
        ]
    },
    {
        section: 'RESOURCE DATABASES',
        items: [
            { id: 'experts', label: 'Expert Database', icon: '👤' },
            { id: 'experiences', label: 'Firm Experiences', icon: '📖' },
        ]
    },
    {
        section: 'MANAGEMENT',
        items: [
            { id: 'partners', label: 'Partner Management', icon: '🤝' },
            { id: 'analytics', label: 'Strategic Analytics', icon: '📊' },
        ]
    },
]

export default function Sidebar({ activePage, setActivePage }) {
    return (
        <div style={{
            width: 230,
            background: '#141720',
            borderRight: '1px solid #2d3748',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            flexShrink: 0
        }}>
            {/* Logo */}
            <div style={{
                padding: '16px 14px',
                borderBottom: '1px solid #2d3748',
                display: 'flex',
                alignItems: 'center',
                gap: 10
            }}>
                <div style={{
                    width: 34, height: 34,
                    background: '#3b5bdb',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18
                }}>💼</div>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
                        Business Development
                    </div>
                    <div style={{ fontSize: 11, color: '#718096' }}>
                        BD Tracking & Proposal
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
                {NAV.map(group => (
                    <div key={group.section}>
                        <div style={{
                            fontSize: 10,
                            color: '#4a5568',
                            letterSpacing: '0.08em',
                            padding: '10px 8px 4px',
                            textTransform: 'uppercase',
                            fontWeight: 600
                        }}>
                            {group.section}
                        </div>
                        {group.items.map(item => (
                            <div
                                key={item.id}
                                onClick={() => setActivePage(item.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '8px 10px',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    marginBottom: 2,
                                    color: activePage === item.id ? '#fff' : '#a0aec0',
                                    background: activePage === item.id ? '#3b5bdb' : 'transparent',
                                }}
                            >
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{
                padding: '12px 14px',
                borderTop: '1px solid #2d3748',
                fontSize: 11,
                color: '#4a5568'
            }}>
                Business Development Management System
            </div>
        </div>
    )
}