const NAV = [
    {
        section: 'CORE',
        items: [
            { id: 'dashboard', label: 'Dashboard', icon: '⌘' },
            { id: 'opportunities', label: 'Opportunity Tracker', icon: '🎯' },
            { id: 'pipeline', label: 'Proposal Pipeline', icon: '⚡' },
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
            width: 250,
            background: '#0f1218',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            flexShrink: 0
        }}>
            {/* Logo */}
            <div style={{
                padding: '24px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12
            }}>
                <div style={{
                    width: 38, height: 38,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                }}>💼</div>
                <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        Frontieri BD
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                        Project Management
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div style={{ flex: 1, padding: '12px 12px', overflowY: 'auto' }}>
                {NAV.map(group => (
                    <div key={group.section} style={{ marginBottom: 20 }}>
                        <div style={{
                            fontSize: 10,
                            color: '#475569',
                            letterSpacing: '0.1em',
                            padding: '0 12px 8px',
                            textTransform: 'uppercase',
                            fontWeight: 700
                        }}>
                            {group.section}
                        </div>
                        {group.items.map(item => {
                            const isActive = activePage === item.id;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setActivePage(item.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12,
                                        padding: '10px 12px',
                                        borderRadius: 10,
                                        cursor: 'pointer',
                                        fontSize: 13,
                                        fontWeight: isActive ? 600 : 500,
                                        marginBottom: 4,
                                        color: isActive ? '#fff' : '#94a3b8',
                                        background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                        transition: 'all 0.2s ease',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute',
                                            left: 0,
                                            height: '60%',
                                            width: 3,
                                            background: '#3b82f6',
                                            borderRadius: '0 4px 4px 0'
                                        }} />
                                    )}
                                    <span style={{ 
                                        fontSize: 16,
                                        filter: isActive ? 'none' : 'grayscale(1)',
                                        opacity: isActive ? 1 : 0.7
                                    }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* User Profile / Status */}
            <div style={{
                margin: '12px',
                padding: '16px',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.04)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>System Live</div>
                </div>
            </div>
        </div>
    )
}