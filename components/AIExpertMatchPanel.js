import { useState } from 'react'
import axios from 'axios'
import { Btn, Badge, Modal } from './UI'

export default function AIExpertMatchPanel({ opportunity, torSummary, onClose, onSave }) {
    const [loading, setLoading] = useState(false)
    const [matches, setMatches] = useState([])
    const [idealProfile, setIdealProfile] = useState('')
    const [selectedIds, setSelectedIds] = useState([])
    const [saving, setSaving] = useState(false)

    const findMatches = async () => {
        setLoading(true)
        try {
            const res = await axios.post('/api/match/experts', {
                opportunityId: opportunity.id,
                torSummary: torSummary
            })
            setMatches(res.data.experts || [])
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
        <Modal title={`AI Expert Matching: ${opportunity.title}`} onClose={onClose} width={900}>
            <div style={{ marginBottom: 20, padding: 12, background: '#1a1f2e', borderRadius: 8, border: '1px solid #3b5bdb44' }}>
                <div style={{ fontSize: 11, color: '#7b9cff', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>TOR Requirements Summary</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <div style={{ fontSize: 12, color: '#a0aec0', marginBottom: 4 }}>Required Positions:</div>
                        <div style={{ fontSize: 13, color: '#e2e8f0' }}>
                            {torSummary?.requiredExperts?.map(e => e.position).join(', ') || 'Not identified'}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#a0aec0', marginBottom: 4 }}>Key Skills:</div>
                        <div style={{ fontSize: 13, color: '#e2e8f0' }}>
                            {torSummary?.requiredExperts?.map(e => e.keySkills).filter(Boolean).join(', ') || 'Not identified'}
                        </div>
                    </div>
                </div>
            </div>

            {matches.length === 0 && !loading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', border: '1px dashed #2d3748', borderRadius: 12 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>👤</div>
                    <div style={{ fontSize: 15, color: '#e2e8f0', marginBottom: 12 }}>
                        No suitable experts found in database
                    </div>
                    {idealProfile && (
                        <div style={{ maxWidth: 500, margin: '0 auto 20px', padding: 14, background: '#2c1d1a', border: '1px solid #e53e3e44', borderRadius: 8, fontSize: 13, color: '#e2e8f0' }}>
                            <strong style={{ color: '#fc8181', display: 'block', marginBottom: 4 }}>Ideal Expert Profile:</strong>
                            {idealProfile}
                        </div>
                    )}
                    <Btn onClick={findMatches}>🔍 Scan Database Again</Btn>
                </div>
            ) : matches.length === 0 && loading ? (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
                    <div style={{ fontSize: 15, color: '#e2e8f0' }}>AI is analyzing expert CVs...</div>
                </div>
            ) : (
                <>
                    <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 20, border: '1px solid #2d3748', borderRadius: 8 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead style={{ background: '#0f1117', color: '#718096', textAlign: 'left', position: 'sticky', top: 0 }}>
                                <tr>
                                    <th style={{ padding: 12, width: 40 }}></th>
                                    <th style={{ padding: 12 }}>Expert Name</th>
                                    <th style={{ padding: 12 }}>Specialization</th>
                                    <th style={{ padding: 12 }}>Score</th>
                                    <th style={{ padding: 12 }}>Match Reasoning</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map(m => (
                                    <tr key={m.id} style={{ borderBottom: '1px solid #2d3748' }}>
                                        <td style={{ padding: 12 }}>
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(m.id)} 
                                                onChange={() => toggleSelect(m.id)}
                                                style={{ width: 16, height: 16 }}
                                            />
                                        </td>
                                        <td style={{ padding: 12, fontWeight: 600 }}>{m.name}</td>
                                        <td style={{ padding: 12 }}><Badge color="blue">{m.specialization}</Badge></td>
                                        <td style={{ padding: 12 }}>
                                            <div style={{ 
                                                fontWeight: 800, 
                                                color: m.relevanceScore > 80 ? '#48bb78' : m.relevanceScore > 60 ? '#ecc94b' : '#a0aec0' 
                                            }}>
                                                {m.relevanceScore}%
                                            </div>
                                        </td>
                                        <td style={{ padding: 12, fontSize: 12, color: '#a0aec0', lineHeight: 1.4 }}>{m.matchReasoning}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {idealProfile && matches.every(m => m.relevanceScore < 50) && (
                        <div style={{ marginBottom: 20, padding: 14, background: '#2c1d1a', border: '1px solid #e53e3e44', borderRadius: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#fc8181', marginBottom: 6, textTransform: 'uppercase' }}>💡 AI Recommendation: What to search for</div>
                            <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5 }}>{idealProfile}</div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
                        <Btn onClick={handleSave} disabled={selectedIds.length === 0 || saving}>
                            {saving ? '⏳ Saving...' : `Save ${selectedIds.length} Selected Experts`}
                        </Btn>
                    </div>
                </>
            )}
        </Modal>
    )
}
