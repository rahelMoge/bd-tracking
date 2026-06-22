import { useState } from 'react'
import axios from 'axios'
import { Btn, Badge, Modal } from './UI'

export default function AIExperienceMatchPanel({ opportunity, torSummary, onClose, onSave }) {
    const [loading, setLoading] = useState(false)
    const [matches, setMatches] = useState([])
    const [idealProfile, setIdealProfile] = useState('')
    const [selectedIds, setSelectedIds] = useState([])
    const [saving, setSaving] = useState(false)

    const findMatches = async () => {
        setLoading(true)
        try {
            const res = await axios.post('/api/match/experiences', {
                opportunityId: opportunity.id,
                torSummary: torSummary
            })
            setMatches(res.data.experiences || [])
            setIdealProfile(res.data.idealProfile || '')
        } catch (err) {
            alert('Failed to find matches: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleSelect = id => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const handleSave = async () => {
        if (!onSave) return
        setSaving(true)
        try {
            await onSave(selectedIds)
            onClose()
        } catch (err) {
            alert('Failed to save selections')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal title={`AI Experience Intelligence: ${opportunity.title}`} onClose={onClose} width={1000}>
            <div className="animate-fade" style={{ marginBottom: 24, padding: 16, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 12, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div style={{ fontSize: 10, color: '#6366f1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Strategic Track Record Context</div>
                <div style={{ fontSize: 13, color: '# cbd5e1', lineHeight: 1.6, fontWeight: 500 }}>
                    {torSummary?.scopeOfWork ? (torSummary.scopeOfWork.length > 300 ? torSummary.scopeOfWork.substring(0, 300) + '...' : torSummary.scopeOfWork) : 'Scope not yet analyzed from document.'}
                </div>
            </div>

            {matches.length === 0 && !loading ? (
                <div style={{ textAlign: 'center', padding: '80px 20px', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 20, background: 'rgba(255,255,255,0.01)' }} className="animate-fade">
                    <div style={{ fontSize: 44, marginBottom: 16 }}>📜</div>
                    <div style={{ fontSize: 16, color: '#f1f5f9', fontWeight: 700, marginBottom: 12 }}>
                        Identify the most relevant past performance?
                    </div>
                    <div style={{ fontSize: 13, color: '#64748b', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                        AI will cross-reference TOR requirements against your firm's entire project history, focusing on sector alignment and geographic relevance.
                    </div>
                    <Btn onClick={findMatches} large>🚀 Initialize Experience Search</Btn>
                </div>
            ) : matches.length === 0 && loading ? (
                <div style={{ textAlign: 'center', padding: '100px 20px' }}>
                    <div style={{ fontSize: 44, marginBottom: 20 }}>🤖</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Mining Track Record Repository...</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>Calculating semantic relevance and contract-tier similarity.</div>
                </div>
            ) : (
                <div className="animate-fade">
                    <div style={{ maxHeight: 420, overflowY: 'auto', marginBottom: 24, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, background: '#0a0c10' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 12 }}>
                            <thead style={{ background: '#0f1218', color: '#475569', position: 'sticky', top: 0, zIndex: 10 }}>
                                <tr>
                                    <th style={{ padding: 16, width: 40, borderBottom: '1px solid rgba(255,255,255,0.06)' }}></th>
                                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>PROJECT REFERENCE</th>
                                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>DETAILS</th>
                                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>SCORE</th>
                                    <th style={{ padding: 16, textAlign: 'left', fontWeight: 700, fontSize: 11, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>MATCH RATIONALE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map((m, i) => (
                                    <tr 
                                        key={m.id} 
                                        style={{ transition: 'all 0.2s', animationDelay: `${i * 0.05}s` }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <input 
                                                type="checkbox" checked={selectedIds.includes(m.id)} 
                                                onChange={() => toggleSelect(m.id)}
                                                style={{ width: 18, height: 18, cursor: 'pointer', accentColor: '#6366f1' }}
                                            />
                                        </td>
                                        <td style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 13 }}>{m.title}</div>
                                            <div style={{ marginTop: 4, fontSize: 11, color: '#64748b' }}>Client: {m.client}</div>
                                        </td>
                                        <td style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{m.value || 'Strategic'}</div>
                                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{m.sector}</div>
                                        </td>
                                        <td style={{ padding: 16, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ 
                                                fontSize: 16, fontWeight: 800, 
                                                color: m.relevanceScore > 80 ? '#10b981' : m.relevanceScore > 60 ? '#f59e0b' : '#64748b' 
                                            }}>
                                                {m.relevanceScore}%
                                            </div>
                                        </td>
                                        <td style={{ padding: 16, fontSize: 11, color: '#94a3b8', lineHeight: 1.5, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            {m.matchReasoning}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {idealProfile && matches.every(m => m.relevanceScore < 50) && (
                        <div style={{ marginBottom: 24, padding: 20, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: '#3b82f6', marginBottom: 8, textTransform: 'uppercase' }}>💡 Recommendation: Capacity Gap Identified</div>
                            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{idealProfile}</div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Btn variant="secondary" onClick={onClose}>Discard</Btn>
                        <Btn onClick={handleSave} disabled={selectedIds.length === 0 || saving}>
                            {saving ? '⏳ Archiving...' : `Commit ${selectedIds.length} Reference Selections`}
                        </Btn>
                    </div>
                </div>
            )}
        </Modal>
    )
}
