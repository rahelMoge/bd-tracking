import { useState } from 'react'
import { Btn, Badge } from './UI'

const sectionStyle = {
    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
    borderRadius: 12, padding: '16px', marginBottom: 12
}
const labelStyle = {
    fontSize: 10, color: '#3b82f6', fontWeight: 800,
    textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8
}
const textStyle = { fontSize: 13, color: '#f1f5f9', lineHeight: 1.6 }
const subTextStyle = { fontSize: 12, color: '#94a3b8', lineHeight: 1.5 }

export default function AISummaryPanel({ fileUrl, summary, onSummaryGenerated, onSaveSummary, saving, analyzing }) {
    const [localAnalyzing, setLocalAnalyzing] = useState(false)
    const [error, setError] = useState(null)

    const isAnalyzing = analyzing || localAnalyzing

    const analyze = async () => {
        setLocalAnalyzing(true)
        setError(null)
        try {
            const res = await fetch('/api/analyze-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileUrl })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Analysis failed')
            onSummaryGenerated(data.summary)
        } catch (err) {
            setError(err.message)
        }
        setLocalAnalyzing(false)
    }

    if (!fileUrl) return null

    if (isAnalyzing) {
        return (
            <div className="animate-fade" style={{ ...sectionStyle, textAlign: 'center', padding: 40, border: '1px dashed rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.02)' }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>🤖</div>
                <div style={{ fontSize: 15, color: '#f1f5f9', fontWeight: 700, marginBottom: 8 }}>
                    Neural Analysis in Progress...
                </div>
                <div style={{ fontSize: 12, color: '#64748b', maxWidth: 400, margin: '0 auto' }}>
                    Gemini is extracting strategic objectives, specialized requirements, and mission-critical deadlines from your TOR.
                </div>
            </div>
        )
    }

    if (!summary) {
        return (
            <div className="animate-fade" style={{ ...sectionStyle, textAlign: 'center', padding: 32, border: '1px dashed rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🧠</div>
                <div style={{ fontSize: 14, color: '#94a3b8', marginBottom: 20 }}>
                    AI Intelligence can accelerate your review of this document
                </div>
                {error && (
                    <div style={{ fontSize: 12, color: '#f87171', marginBottom: 16, padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        ⚠️ Review error: {error}
                    </div>
                )}
                <Btn onClick={analyze} disabled={isAnalyzing}>🚀 Trigger AI Insights</Btn>
            </div>
        )
    }

    const s = summary
    return (
        <div className="animate-fade" style={{ border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 16, padding: 20, background: 'rgba(59, 130, 246, 0.02)', marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>🤖</span> Intelligence Briefing
                </div>
                {onSaveSummary && (
                    <Btn small variant="secondary" onClick={onSaveSummary} disabled={saving}>
                        {saving ? '⏳ Archiving...' : '💾 Save Insights'}
                    </Btn>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
                <div>
                    <div style={sectionStyle}>
                        <div style={labelStyle}>📋 Strategic Objectives</div>
                        <div style={textStyle}>{s.scopeOfWork || 'Not identified'}</div>
                    </div>
                    <div style={sectionStyle}>
                        <div style={labelStyle}>📅 Deadlines & Milestones</div>
                        {s.deadlines ? (
                            <div style={subTextStyle}>
                                {s.deadlines.submissionDeadline && <div style={{ marginBottom: 4 }}><strong style={{ color: '#f87171' }}>Final Submission:</strong> {s.deadlines.submissionDeadline}</div>}
                                {s.deadlines.projectDuration && <div style={{ marginBottom: 4 }}><strong style={{ color: '#fbbf24' }}>Engagement Period:</strong> {s.deadlines.projectDuration}</div>}
                                {s.deadlines.otherDates && <div><strong style={{ color: '#94a3b8' }}>Critical Dates:</strong> {s.deadlines.otherDates}</div>}
                            </div>
                        ) : <div style={subTextStyle}>Not identified</div>}
                    </div>
                </div>
                <div>
                    <div style={sectionStyle}>
                        <div style={labelStyle}>💰 Estimated Capital</div>
                        <div style={textStyle}>{s.budget || 'Not specified in TOR'}</div>
                    </div>
                    <div style={sectionStyle}>
                        <div style={labelStyle}>🎯 Core Compliance</div>
                        {s.keyClientRequirements?.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {s.keyClientRequirements.map((req, i) => (
                                    <li key={i} style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.7 }}>{req}</li>
                                ))}
                            </ul>
                        ) : <div style={subTextStyle}>General requirements only</div>}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={sectionStyle}>
                    <div style={labelStyle}>👤 Team Specifications</div>
                    {s.requiredExperts?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {s.requiredExperts.map((exp, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{exp.position}</div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        {exp.yearsOfExperience && <Badge color="blue">{exp.yearsOfExperience}y Exp</Badge>}
                                    </div>
                                    {exp.keySkills && <div style={{ fontSize: 11, color: '#64748b', marginTop: 6, lineHeight: 1.4 }}>{exp.keySkills}</div>}
                                </div>
                            ))}
                        </div>
                    ) : <div style={subTextStyle}>Standard team structure</div>}
                </div>
                <div style={sectionStyle}>
                    <div style={labelStyle}>📖 Reference Benchmarks</div>
                    {s.requiredExperiences?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {s.requiredExperiences.map((exp, i) => (
                                <div key={i} style={{ fontSize: 12, color: '#94a3b8', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 2 }}>{exp.type}</div>
                                    <div style={{ fontSize: 11 }}>{exp.sector} {exp.geography && `· 📍 ${exp.geography}`}</div>
                                    {exp.details && <div style={{ marginTop: 4, opacity: 0.8 }}>{exp.details}</div>}
                                </div>
                            ))}
                        </div>
                    ) : <div style={subTextStyle}>General experience requested</div>}
                </div>
            </div>
        </div>
    )
}
