import { useState, useEffect } from 'react'
import axios from 'axios'
import { Btn, Modal, Field, Input, Badge } from './UI'

const STRENGTHS_LIST = ['Strong geographic presence', 'Relevant past work', 'Technical expertise', 'Local networks', 'Cost competitiveness', 'Sector experience']
const WEAKNESSES_LIST = ['Limited experience', 'No local presence', 'Resource constraints', 'Budget limitations', 'Timeline constraints']

export default function CompetitiveAnalysisPanel({ opportunity, onClose, onSave }) {
    const [form, setForm] = useState({
        competitiveScore: 50,
        winProbability: 50,
        knownCompetitors: '',
        whyBid: '',
        whyNotBid: '',
        strengths: [],
        weaknesses: []
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (opportunity) {
            // Try to parse existing notes or a special field if we had one
            // For now, we'll use the existing fields we added to the schema if any
            setForm({
                competitiveScore: opportunity.competitiveScore || 50,
                winProbability: opportunity.winProbability || 50,
                knownCompetitors: opportunity.knownCompetitors || '',
                whyBid: opportunity.whyBid || '',
                whyNotBid: opportunity.whyNotBid || '',
                strengths: Array.isArray(opportunity.strengths) ? opportunity.strengths : [],
                weaknesses: Array.isArray(opportunity.weaknesses) ? opportunity.weaknesses : []
            })
        }
    }, [opportunity])

    const toggleTag = (list, item) => {
        setForm(prev => {
            const current = prev[list]
            const next = current.includes(item) ? current.filter(x => x !== item) : [...current, item]
            return { ...prev, [list]: next }
        })
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await onSave(form)
            onClose()
        } catch (err) {
            alert('Failed to save competitive analysis')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Modal title={`Competitive Analysis: ${opportunity.title}`} onClose={onClose} width={700}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                
                {/* 📊 Visual Strategic Dashboard */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.2fr',
                    gap: 16,
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: 16,
                    padding: 20,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
                }}>
                    {/* Left: Win Probability Radial Meter */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.06)', paddingRight: 16 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Win Probability Meter</div>
                        <div style={{ position: 'relative', width: 110, height: 110 }}>
                            <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="55" cy="55" r="46" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="8"/>
                                <circle cx="55" cy="55" r="46" fill="transparent" 
                                    stroke={form.winProbability > 70 ? '#10b981' : form.winProbability > 40 ? '#f59e0b' : '#ef4444'} 
                                    strokeWidth="8"
                                    strokeDasharray={`${2 * Math.PI * 46}`}
                                    strokeDashoffset={`${2 * Math.PI * 46 * (1 - form.winProbability / 100)}`}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
                                />
                            </svg>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{form.winProbability}%</div>
                                <div style={{ fontSize: 9, color: '#64748b', fontWeight: 600 }}>PROBABILITY</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Strengths vs Weaknesses Capability Balance */}
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 8 }}>
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#e2e8f0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Strategic Capability Balance</div>
                        
                        {/* Strengths Bar */}
                        <div style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                                <span>Strengths ({form.strengths.length})</span>
                                <span style={{ color: '#10b981', fontWeight: 700 }}>{Math.round((form.strengths.length / (STRENGTHS_LIST.length || 1)) * 100)}%</span>
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ 
                                    width: `${(form.strengths.length / STRENGTHS_LIST.length) * 100}%`, 
                                    height: '100%', 
                                    background: 'linear-gradient(90deg, #059669, #10b981)',
                                    borderRadius: 3,
                                    transition: 'width 0.3s ease'
                                }}/>
                            </div>
                        </div>

                        {/* Weaknesses Bar */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                                <span>Weaknesses ({form.weaknesses.length})</span>
                                <span style={{ color: '#ef4444', fontWeight: 700 }}>{Math.round((form.weaknesses.length / (WEAKNESSES_LIST.length || 1)) * 100)}%</span>
                            </div>
                            <div style={{ height: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ 
                                    width: `${(form.weaknesses.length / WEAKNESSES_LIST.length) * 100}%`, 
                                    height: '100%', 
                                    background: 'linear-gradient(90deg, #dc2626, #ef4444)',
                                    borderRadius: 3,
                                    transition: 'width 0.3s ease'
                                }}/>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 10 }}>Our Strengths</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {STRENGTHS_LIST.map(s => (
                            <div 
                                key={s} 
                                onClick={() => toggleTag('strengths', s)}
                                style={{ 
                                    padding: '6px 12px', 
                                    borderRadius: 20, 
                                    fontSize: 12, 
                                    cursor: 'pointer',
                                    background: form.strengths.includes(s) ? '#276749' : '#1a1f2e',
                                    border: `1px solid ${form.strengths.includes(s) ? '#48bb78' : '#2d3748'}`,
                                    color: form.strengths.includes(s) ? '#fff' : '#a0aec0'
                                }}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 10 }}>Our Weaknesses</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {WEAKNESSES_LIST.map(w => (
                            <div 
                                key={w} 
                                onClick={() => toggleTag('weaknesses', w)}
                                style={{ 
                                    padding: '6px 12px', 
                                    borderRadius: 20, 
                                    fontSize: 12, 
                                    cursor: 'pointer',
                                    background: form.weaknesses.includes(w) ? '#742a2a' : '#1a1f2e',
                                    border: `1px solid ${form.weaknesses.includes(w) ? '#e53e3e' : '#2d3748'}`,
                                    color: form.weaknesses.includes(w) ? '#fff' : '#a0aec0'
                                }}
                            >
                                {w}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Field label={`Competitive Score (${form.competitiveScore})`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <input 
                                type="range" min="0" max="100" 
                                value={form.competitiveScore} 
                                onChange={e => setForm({...form, competitiveScore: parseInt(e.target.value)})}
                                style={{ 
                                    flex: 1, 
                                    height: 6, 
                                    background: 'rgba(255,255,255,0.08)',
                                    borderRadius: 3,
                                    outline: 'none',
                                    accentColor: '#3b82f6'
                                }}
                            />
                            <Badge color={form.competitiveScore > 75 ? 'green' : form.competitiveScore > 40 ? 'yellow' : 'red'}>
                                {form.competitiveScore > 75 ? 'High' : form.competitiveScore > 40 ? 'Medium' : 'Low'}
                            </Badge>
                        </div>
                    </Field>
                    <Field label={`Win Probability (${form.winProbability}%)`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <input 
                                type="range" min="0" max="100" 
                                value={form.winProbability} 
                                onChange={e => setForm({...form, winProbability: parseInt(e.target.value)})}
                                style={{ 
                                    flex: 1, 
                                    height: 6, 
                                    background: 'rgba(255,255,255,0.08)',
                                    borderRadius: 3,
                                    outline: 'none',
                                    accentColor: '#6366f1'
                                }}
                            />
                            <Badge color={form.winProbability > 75 ? 'green' : form.winProbability > 40 ? 'yellow' : 'red'}>
                                {form.winProbability > 75 ? 'Strong' : form.winProbability > 40 ? 'Fair' : 'Weak'}
                            </Badge>
                        </div>
                    </Field>
                </div>

                <Field label="Known Competitors">
                    <textarea 
                        value={form.knownCompetitors} 
                        onChange={e => setForm({...form, knownCompetitors: e.target.value})}
                        style={{ width: '100%', minHeight: 60, background: '#0a0d13', border: '1px solid #2d3748', borderRadius: 8, color: '#fff', padding: 10 }}
                        placeholder="List firms likely to bid..."
                    />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <Field label="Why We Should Bid">
                        <textarea 
                            value={form.whyBid} 
                            onChange={e => setForm({...form, whyBid: e.target.value})}
                            style={{ width: '100%', minHeight: 80, background: '#0a0d13', border: '1px solid #2d3748', borderRadius: 8, color: '#fff', padding: 10 }}
                        />
                    </Field>
                    <Field label="Why We Should NOT Bid">
                        <textarea 
                            value={form.whyNotBid} 
                            onChange={e => setForm({...form, whyNotBid: e.target.value})}
                            style={{ width: '100%', minHeight: 80, background: '#0a0d13', border: '1px solid #2d3748', borderRadius: 8, color: '#fff', padding: 10 }}
                        />
                    </Field>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10 }}>
                    <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
                    <Btn onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save Analysis'}
                    </Btn>
                </div>
            </div>
        </Modal>
    )
}
