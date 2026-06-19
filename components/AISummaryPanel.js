import { useState } from 'react'
import { Btn, Badge } from './UI'

const sectionStyle = {
    background: '#0f1117', border: '1px solid #2d3748',
    borderRadius: 8, padding: '12px 14px', marginBottom: 10
}
const labelStyle = {
    fontSize: 11, color: '#7b9cff', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6
}
const textStyle = { fontSize: 13, color: '#e2e8f0', lineHeight: 1.6 }
const subTextStyle = { fontSize: 12, color: '#a0aec0', lineHeight: 1.5 }

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

    // No file uploaded yet
    if (!fileUrl) return null

    // Document is analyzing
    if (isAnalyzing) {
        return (
            <div style={{ ...sectionStyle, textAlign: 'center', padding: 25, border: '1px dashed #3b5bdb', background: '#11141d' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
                <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600, marginBottom: 6 }}>
                    🤖 AI is analyzing the document...
                </div>
                <div style={{ fontSize: 11, color: '#a0aec0' }}>
                    Extracting scope, deadlines, budget, experts, experiences, and requirements.
                </div>
            </div>
        )
    }

    // File uploaded but no summary yet (e.g. if auto-analysis failed or was skipped)
    if (!summary) {
        return (
            <div style={{ ...sectionStyle, textAlign: 'center', padding: 20, border: '1px dashed #3b5bdb' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
                <div style={{ fontSize: 13, color: '#a0aec0', marginBottom: 12 }}>
                    AI can analyze this document and extract key information
                </div>
                {error && (
                    <div style={{ fontSize: 12, color: '#fc8181', marginBottom: 10, padding: '6px 10px', background: '#e53e3e15', borderRadius: 6 }}>
                        ⚠️ {error}
                    </div>
                )}
                <Btn onClick={analyze} disabled={isAnalyzing}>
                    🔍 Analyze with AI
                </Btn>
            </div>
        )
    }

    // Summary exists — render it
    const s = summary
    return (
        <div style={{ border: '1px solid #3b5bdb44', borderRadius: 10, padding: 14, background: '#141720' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#7b9cff' }}>🤖 AI Document Summary</div>
                <Btn small onClick={onSaveSummary} disabled={saving}>
                    {saving ? '⏳ Saving…' : '💾 Save Summary'}
                </Btn>
            </div>

            {/* Scope of Work */}
            <div style={sectionStyle}>
                <div style={labelStyle}>📋 Scope of Work</div>
                <div style={textStyle}>{s.scopeOfWork || 'Not identified'}</div>
            </div>

            {/* Budget */}
            <div style={sectionStyle}>
                <div style={labelStyle}>💰 Budget</div>
                <div style={textStyle}>{s.budget || 'Not specified in document'}</div>
            </div>

            {/* Deadlines */}
            <div style={sectionStyle}>
                <div style={labelStyle}>📅 Deadlines</div>
                {s.deadlines ? (
                    <div style={subTextStyle}>
                        {s.deadlines.submissionDeadline && <div><strong style={{ color: '#fc8181' }}>Submission:</strong> {s.deadlines.submissionDeadline}</div>}
                        {s.deadlines.projectDuration && <div><strong style={{ color: '#f6e05e' }}>Duration:</strong> {s.deadlines.projectDuration}</div>}
                        {s.deadlines.otherDates && <div><strong style={{ color: '#a0aec0' }}>Other:</strong> {s.deadlines.otherDates}</div>}
                    </div>
                ) : <div style={subTextStyle}>Not identified</div>}
            </div>

            {/* Required Experts */}
            <div style={sectionStyle}>
                <div style={labelStyle}>👤 Required Experts</div>
                {s.requiredExperts?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {s.requiredExperts.map((exp, i) => (
                            <div key={i} style={{ background: '#141720', borderRadius: 6, padding: '8px 10px', border: '1px solid #2d374866' }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{exp.position}</div>
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {exp.qualifications && <Badge color="blue">{exp.qualifications}</Badge>}
                                    {exp.yearsOfExperience && <Badge color="purple">{exp.yearsOfExperience} exp</Badge>}
                                </div>
                                {exp.keySkills && <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 4 }}>{exp.keySkills}</div>}
                            </div>
                        ))}
                    </div>
                ) : <div style={subTextStyle}>Not specified</div>}
            </div>

            {/* Required Experiences */}
            <div style={sectionStyle}>
                <div style={labelStyle}>📖 Required Experiences</div>
                {s.requiredExperiences?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {s.requiredExperiences.map((exp, i) => (
                            <div key={i} style={{ fontSize: 12, color: '#a0aec0', padding: '4px 0', borderBottom: '1px solid #2d374844' }}>
                                <strong style={{ color: '#e2e8f0' }}>{exp.type}</strong>
                                {exp.sector && <span> · {exp.sector}</span>}
                                {exp.geography && <span> · 📍 {exp.geography}</span>}
                                {exp.details && <div style={{ marginTop: 2 }}>{exp.details}</div>}
                            </div>
                        ))}
                    </div>
                ) : <div style={subTextStyle}>Not specified</div>}
            </div>

            {/* Key Client Requirements */}
            <div style={sectionStyle}>
                <div style={labelStyle}>🎯 Key Client Requirements</div>
                {s.keyClientRequirements?.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {s.keyClientRequirements.map((req, i) => (
                            <li key={i} style={{ fontSize: 12, color: '#a0aec0', lineHeight: 1.7 }}>{req}</li>
                        ))}
                    </ul>
                ) : <div style={subTextStyle}>Not specified</div>}
            </div>
        </div>
    )
}
