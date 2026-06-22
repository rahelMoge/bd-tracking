import { useState, useEffect } from 'react'
import axios from 'axios'
import { Btn, Modal, Field, Input } from './UI'

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
                        <input 
                            type="range" min="0" max="100" 
                            value={form.competitiveScore} 
                            onChange={e => setForm({...form, competitiveScore: parseInt(e.target.value)})}
                            style={{ width: '100%' }}
                        />
                    </Field>
                    <Field label={`Win Probability (${form.winProbability}%)`}>
                        <input 
                            type="range" min="0" max="100" 
                            value={form.winProbability} 
                            onChange={e => setForm({...form, winProbability: parseInt(e.target.value)})}
                            style={{ width: '100%' }}
                        />
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
