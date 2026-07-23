import { useState } from 'react'
import { Badge } from './UI'

export default function AIDetailsPanel({ opportunity, experts, experiences, onClose }) {
    const [activeTab, setActiveTab] = useState('briefing')
    const [isMaximized, setIsMaximized] = useState(false)
    const [expandedExpertId, setExpandedExpertId] = useState(null)
    const [expandedExperienceId, setExpandedExperienceId] = useState(null)

    const aiSummary = opportunity.aiSummary ? JSON.parse(opportunity.aiSummary) : null

    // Filter to only display saved experts and experiences
    const savedExpertsList = experts.filter(e => {
        const ids = opportunity.expertIds || []
        return ids.includes(e.id)
    })

    const savedExperiencesList = experiences.filter(e => {
        const ids = opportunity.experienceIds || []
        return ids.includes(e.id)
    })

    const toggleExpert = (id) => {
        setExpandedExpertId(prev => prev === id ? null : id)
    }

    const toggleExperience = (id) => {
        setExpandedExperienceId(prev => prev === id ? null : id)
    }

    // Modern color themes
    const theme = {
        bg: '#090d16',
        cardBg: 'rgba(255, 255, 255, 0.02)',
        cardBorder: '1px solid rgba(255, 255, 255, 0.06)',
        blueGlow: '0 0 20px rgba(59, 130, 246, 0.15)',
        textMuted: '#64748b',
        textWhite: '#f8fafc',
        textPrimary: '#3b82f6',
        textSuccess: '#10b981',
        textWarning: '#fbbf24'
    }

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(5, 7, 12, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMaximized ? '12px' : '24px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
            <div style={{
                background: theme.bg,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                width: isMaximized ? '98%' : '780px',
                height: isMaximized ? '95vh' : 'auto',
                maxHeight: isMaximized ? '95vh' : '82vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(59,130,246,0.05)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Header Block with Maximize / Minimize controls */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.01)',
                    flexShrink: 0
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>PROJECT INTEL</span>
                            <span style={{ color: theme.textMuted, fontSize: 12 }}>· {opportunity.client || 'General'}</span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: theme.textWhite, marginTop: 4 }}>{opportunity.title}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {/* Maximize / Demaximize Toggle */}
                        <button 
                            onClick={() => setIsMaximized(!isMaximized)} 
                            title={isMaximized ? 'Minimize' : 'Maximize'}
                            style={{
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.06)',
                                borderRadius: '8px',
                                color: '#94a3b8',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 14,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.color = '#94a3b8'; }}
                        >
                            {isMaximized ? '❐' : '▢'}
                        </button>

                        {/* Close button */}
                        <button 
                            onClick={onClose} 
                            title="Close"
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '8px',
                                color: '#ef4444',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 16,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Sub Menu / Tab bar */}
                <div style={{
                    padding: '8px 24px 0',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    display: 'flex',
                    gap: 12,
                    background: 'rgba(255, 255, 255, 0.005)',
                    flexShrink: 0
                }}>
                    {[
                        { id: 'briefing', label: '🤖 AI Summary Briefing', color: '#3b82f6', count: aiSummary ? 1 : 0 },
                        { id: 'experts', label: '👤 Assigned Expert Team', color: '#6366f1', count: savedExpertsList.length },
                        { id: 'experiences', label: '📖 Reference Portfolio', color: '#10b981', count: savedExperiencesList.length },
                    ].map(t => {
                        const active = activeTab === t.id
                        return (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                style={{
                                    padding: '12px 6px',
                                    background: 'none',
                                    border: 'none',
                                    color: active ? t.color : '#64748b',
                                    fontSize: 13,
                                    fontWeight: active ? 700 : 500,
                                    cursor: 'pointer',
                                    borderBottom: active ? `2.5px solid ${t.color}` : '2.5px solid transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t.label} 
                                <span style={{
                                    fontSize: 10,
                                    background: active ? `${t.color}22` : 'rgba(255,255,255,0.03)',
                                    color: active ? t.color : '#475569',
                                    padding: '2px 7px',
                                    borderRadius: '10px',
                                    fontWeight: 800,
                                    transition: 'all 0.2s'
                                }}>{t.count}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Modal Main scrolled body */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }}>
                    
                    {/* tab 1: AI Summary Briefing */}
                    {activeTab === 'briefing' && (
                        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {aiSummary ? (
                                <div style={{ display: 'grid', gridTemplateColumns: isMaximized ? '1.2fr 1fr' : '1fr', gap: 16 }}>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{
                                            background: theme.cardBg,
                                            border: theme.cardBorder,
                                            borderRadius: 12,
                                            padding: 20
                                        }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', letterSpacing: '0.1em', marginBottom: 8, svg: 'none' }}>🎯 STRATEGIC OBJECTIVES</div>
                                            <div style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                                {aiSummary.scopeOfWork || 'Not specified in document analysis summary'}
                                            </div>
                                        </div>

                                        <div style={{
                                            background: 'rgba(239, 68, 68, 0.02)',
                                            border: '1px solid rgba(239, 68, 68, 0.08)',
                                            borderRadius: 12,
                                            padding: 20
                                        }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: '#f87171', letterSpacing: '0.1em', marginBottom: 12 }}>📅 DEADLINES & MILESTONES</div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {aiSummary.deadlines?.submissionDeadline && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <span style={{ fontSize: 13, color: '#94a3b8' }}>Submission Deadline</span>
                                                        <span style={{ fontSize: 13, color: '#f87171', fontWeight: 700 }}>{aiSummary.deadlines.submissionDeadline}</span>
                                                    </div>
                                                )}
                                                {aiSummary.deadlines?.projectDuration && (
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: 13, color: '#94a3b8' }}>Implementation Period</span>
                                                        <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 650 }}>{aiSummary.deadlines.projectDuration}</span>
                                                    </div>
                                                )}
                                                {aiSummary.deadlines?.otherDates && (
                                                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, lineGap: 1.4 }}>
                                                        <strong>Additional Targets:</strong> {aiSummary.deadlines.otherDates}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{
                                            background: 'rgba(16, 185, 129, 0.02)',
                                            border: '1px solid rgba(16, 185, 129, 0.08)',
                                            borderRadius: 12,
                                            padding: 20
                                        }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: '#10b981', letterSpacing: '0.1em', marginBottom: 6 }}>💰 ESTIMATED VALUE / CAPITAL</div>
                                            <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981' }}>
                                                {aiSummary.budget || 'Not specified'}
                                            </div>
                                        </div>

                                        <div style={{
                                            background: theme.cardBg,
                                            border: theme.cardBorder,
                                            borderRadius: 12,
                                            padding: 20
                                        }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: theme.textWarning, letterSpacing: '0.1em', marginBottom: 12 }}>🎯 STATED COMPLIANCE AUDITS & CRITERIA</div>
                                            {aiSummary.keyClientRequirements?.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                    {aiSummary.keyClientRequirements.map((r, i) => (
                                                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                                            <span style={{ color: '#fbbf24', fontSize: 12, marginTop: 1 }}>✔</span>
                                                            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{r}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ color: '#475569', fontSize: 12 }}>No strict terms specified in documents.</div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                    <div style={{ fontSize: 44, marginBottom: 12 }}>🤖</div>
                                    <div style={{ fontSize: 15, color: '#f1f5f9', fontWeight: 700 }}>No Strategic AI Summary briefings Found</div>
                                    <div style={{ fontSize: 12, marginTop: 8 }}>Please edit the opportunity and use the neural document analyzer on a document.</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* tab 2: Assigned Expert Team */}
                    {activeTab === 'experts' && (
                        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {savedExpertsList.length > 0 ? (
                                savedExpertsList.map(expert => {
                                    const expanded = expandedExpertId === expert.id
                                    return (
                                        <div 
                                            key={expert.id} 
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.01)',
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                                borderRadius: 12,
                                                padding: '16px 20px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: expanded ? '0 10px 20px rgba(0,0,0,0.3)' : 'none'
                                            }}
                                            onClick={() => toggleExpert(expert.id)}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)'; }}
                                        >
                                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                                <div style={{
                                                    width: 40, height: 40,
                                                    borderRadius: 10,
                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                    color: '#3b82f6',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 800,
                                                    fontSize: 18,
                                                    flexShrink: 0
                                                }}>👤</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontSize: 14, fontWeight: 800, color: theme.textWhite }}>{expert.name}</div>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            {expert.yearsExp && <Badge color="blue">{expert.yearsExp}y Exp</Badge>}
                                                            {expert.country && <Badge color="gray">📍 {expert.country}</Badge>}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600, marginTop: 2 }}>
                                                        {expert.title || 'Technical Specialist'} {expert.specialization && `• ${expert.specialization}`}
                                                    </div>
                                                </div>
                                                <div style={{ color: '#475569', fontSize: 13, userSelect: 'none' }}>
                                                    {expanded ? '▲ Hide Profile' : '▼ View Profile'}
                                                </div>
                                            </div>

                                            {/* Expandable summary portion */}
                                            {expanded && (
                                                <div style={{
                                                    marginTop: 16,
                                                    paddingTop: 16,
                                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                                    lineHeight: 1.6,
                                                    color: '#94a3b8',
                                                    fontSize: 13,
                                                    animation: 'fadeIn 0.2s'
                                                }}
                                                onClick={e => e.stopPropagation()} // Click profile text holds modal
                                                >
                                                    <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', marginBottom: 6 }}>PROFESSIONAL RESUME / COMPETENCE STATEMENT</div>
                                                    <div style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8 }}>
                                                        {expert.summary || expert.notes || 'No biography text available for this expert profile.'}
                                                    </div>

                                                    {(expert.email || expert.phone) && (
                                                        <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 12, color: '#64748b' }}>
                                                            {expert.email && <span>✉ <strong style={{ color: '#e2e8f0' }}>{expert.email}</strong></span>}
                                                            {expert.phone && <span>📞 <strong style={{ color: '#e2e8f0' }}>{expert.phone}</strong></span>}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
                                    <div style={{ fontSize: 15, color: theme.textWhite, fontWeight: 700 }}>No Experts Assigned to Team</div>
                                    <div style={{ fontSize: 12, marginTop: 8 }}>Click Edit &rarr; Match Expert Team in the Opportunity Panel.</div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* tab 3: Reference Portfolio */}
                    {activeTab === 'experiences' && (
                        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {savedExperiencesList.length > 0 ? (
                                savedExperiencesList.map(exp => {
                                    const expanded = expandedExperienceId === exp.id
                                    return (
                                        <div 
                                            key={exp.id} 
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.01)',
                                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                                borderRadius: 12,
                                                padding: '16px 20px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                boxShadow: expanded ? '0 10px 20px rgba(0,0,0,0.3)' : 'none'
                                            }}
                                            onClick={() => toggleExperience(exp.id)}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.2)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)'; }}
                                        >
                                            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                                <div style={{
                                                    width: 40, height: 40,
                                                    borderRadius: 10,
                                                    background: 'rgba(16, 185, 129, 0.1)',
                                                    color: '#10b981',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 800,
                                                    fontSize: 18,
                                                    flexShrink: 0
                                                }}>📖</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ fontSize: 14, fontWeight: 800, color: theme.textWhite }}>{exp.title}</div>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            {exp.value && <Badge color="green">{exp.value}</Badge>}
                                                            {exp.country && <Badge color="gray">📍 {exp.country}</Badge>}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                                                        Client: <strong style={{ color: '#e2e8f0' }}>{exp.client || 'Government Client'}</strong> {exp.sector && `• Sector: ${exp.sector}`}
                                                    </div>
                                                </div>
                                                <div style={{ color: '#475569', fontSize: 13, userSelect: 'none' }}>
                                                    {expanded ? '▲ Hide Details' : '▼ View Details'}
                                                </div>
                                            </div>

                                            {/* Expandable Project details */}
                                            {expanded && (
                                                <div style={{
                                                    marginTop: 16,
                                                    paddingTop: 16,
                                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                                    lineHeight: 1.6,
                                                    color: '#94a3b8',
                                                    fontSize: 13,
                                                    animation: 'fadeIn 0.2s'
                                                }}
                                                onClick={e => e.stopPropagation()} // Click description holds modal
                                                >
                                                    <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', marginBottom: 6 }}>PROJECT METHODOLOGY & SCOPE OF EXPERTISE</div>
                                                    <div style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8 }}>
                                                        {exp.description || 'No detailed reference materials available for this experience portfolio block.'}
                                                    </div>

                                                    {(exp.startDate || exp.endDate || exp.services) && (
                                                        <div style={{ display: 'flex', gap: 20, marginTop: 14, fontSize: 12, color: '#64748b' }}>
                                                            {exp.startDate && <span>Timeline: <strong style={{ color: '#e2e8f0' }}>{exp.startDate} - {exp.endDate || 'Present'}</strong></span>}
                                                            {exp.services && <span>Services: <strong style={{ color: '#e2e8f0' }}>{exp.services}</strong></span>}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                    <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
                                    <div style={{ fontSize: 15, color: theme.textWhite, fontWeight: 700 }}>No Reference Experiences Linked</div>
                                    <div style={{ fontSize: 12, marginTop: 8 }}>Click Edit &rarr; Match Firm Experience in the Opportunity Panel.</div>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer buttons */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    background: 'rgba(255, 255, 255, 0.01)',
                    flexShrink: 0
                }}>
                    <button 
                        onClick={onClose}
                        style={{
                            padding: '8px 16px',
                            background: '#1a1f2e',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = '#22283a'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = '#1a1f2e'; }}
                    >
                        Close Briefing
                    </button>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    )
}
