import { useState, useRef } from 'react'
import axios from 'axios'
import { Badge } from './UI'
import AIExpertMatchPanel from './AIExpertMatchPanel'
import AIExperienceMatchPanel from './AIExperienceMatchPanel'

export default function AIDetailsPanel({ opportunity, experts = [], experiences = [], onClose, onUpdate }) {
    const parseSummary = (raw) => {
        if (!raw) return null
        if (typeof raw === 'object') return raw
        try {
            return JSON.parse(raw)
        } catch (e) {
            console.error('Failed to parse aiSummary:', e)
            return null
        }
    }

    const initialFileUrl = opportunity?.documentUrl || opportunity?.fileUrl || ''
    const initialFileName = opportunity?.fileName || (initialFileUrl ? (initialFileUrl.split('/').pop() || 'Attached TOR Document') : '')

    const [activeTab, setActiveTab] = useState('briefing')
    const [isMaximized, setIsMaximized] = useState(false)
    const [expandedExpertId, setExpandedExpertId] = useState(null)
    const [expandedExperienceId, setExpandedExperienceId] = useState(null)

    const [aiSummary, setAiSummary] = useState(() => parseSummary(opportunity?.aiSummary))
    const [fileUrl, setFileUrl] = useState(initialFileUrl)
    const [fileName, setFileName] = useState(initialFileName)
    const [analyzing, setAnalyzing] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const [successMsg, setSuccessMsg] = useState(null)

    const [matchingExperts, setMatchingExperts] = useState(false)
    const [matchingExperiences, setMatchingExperiences] = useState(false)
    const [currentExpertIds, setCurrentExpertIds] = useState(opportunity?.expertIds || [])
    const [currentExperienceIds, setCurrentExperienceIds] = useState(opportunity?.experienceIds || [])

    const fileInputRef = useRef(null)

    // Saved experts and experiences lists
    const savedExpertsList = experts.filter(e => currentExpertIds.includes(e.id))
    const savedExperiencesList = experiences.filter(e => currentExperienceIds.includes(e.id))

    const toggleExpert = (id) => setExpandedExpertId(prev => prev === id ? null : id)
    const toggleExperience = (id) => setExpandedExperienceId(prev => prev === id ? null : id)

    const runAnalysis = async (targetFileUrl = fileUrl) => {
        if (!targetFileUrl) {
            setError('Please attach or upload a TOR document first.')
            return
        }
        setAnalyzing(true)
        setError(null)
        setSuccessMsg(null)
        try {
            const res = await fetch('/api/analyze-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileUrl: targetFileUrl })
            })
            const data = await res.json()
            if (res.status === 429) {
                throw new Error('⏳ Gemini API rate limit reached. Please wait 30–60 seconds and try again.')
            }
            if (!res.ok) throw new Error(data.error || 'AI Document Analysis failed')

            const newSummary = data.summary
            setAiSummary(newSummary)

            // Auto save summary to opportunity record in DB
            if (opportunity?.id) {
                try {
                    await axios.put(`/api/opportunities/${opportunity.id}`, {
                        aiSummary: JSON.stringify(newSummary),
                        documentUrl: targetFileUrl
                    })
                } catch (putErr) {
                    if (putErr.response?.status === 404) {
                        setError('Opportunity record no longer exists in database (it may have been deleted).')
                        return
                    }
                    throw putErr
                }
            }

            setSuccessMsg('AI Briefing successfully generated & saved!')
            if (onUpdate) onUpdate()
        } catch (err) {
            setError(err.response?.data?.error || err.message)
        } finally {
            setAnalyzing(false)
        }
    }

    const handleFileUpload = async (e) => {
        const file = e.target?.files?.[0] || e
        if (!file || !(file instanceof File)) return
        setUploading(true)
        setError(null)
        setSuccessMsg(null)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
            const uploadData = await uploadRes.json()
            if (!uploadRes.ok) throw new Error(uploadData.error || 'File upload failed')

            const newFileUrl = uploadData.fileUrl
            const newFileName = uploadData.fileName || file.name
            setFileUrl(newFileUrl)
            setFileName(newFileName)
            setUploading(false)

            if (opportunity?.id) {
                await axios.put(`/api/opportunities/${opportunity.id}`, { documentUrl: newFileUrl })
            }
            if (onUpdate) onUpdate()

            // Automatically analyze newly uploaded document
            await runAnalysis(newFileUrl)
        } catch (err) {
            setUploading(false)
            setError(err.message || 'Upload failed')
        }
    }

    const handleSaveMatchedExperts = async (selectedIds) => {
        try {
            setCurrentExpertIds(selectedIds)
            if (opportunity?.id) {
                await axios.put(`/api/opportunities/${opportunity.id}`, { expertIds: selectedIds })
            }
            setSuccessMsg('Assigned expert team updated successfully!')
            if (onUpdate) onUpdate()
        } catch (err) {
            setError('Failed to update experts: ' + err.message)
        }
    }

    const handleSaveMatchedExperiences = async (selectedIds) => {
        try {
            setCurrentExperienceIds(selectedIds)
            if (opportunity?.id) {
                await axios.put(`/api/opportunities/${opportunity.id}`, { experienceIds: selectedIds })
            }
            setSuccessMsg('Assigned reference portfolio updated successfully!')
            if (onUpdate) onUpdate()
        } catch (err) {
            setError('Failed to update references: ' + err.message)
        }
    }

    const removeExpert = async (id) => {
        const updated = currentExpertIds.filter(x => x !== id)
        await handleSaveMatchedExperts(updated)
    }

    const removeExperience = async (id) => {
        const updated = currentExperienceIds.filter(x => x !== id)
        await handleSaveMatchedExperiences(updated)
    }

    const theme = {
        bg: '#090d16',
        cardBg: 'rgba(255, 255, 255, 0.02)',
        cardBorder: '1px solid rgba(255, 255, 255, 0.06)',
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
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.txt"
                style={{ display: 'none' }}
            />

            <div style={{
                background: theme.bg,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                width: isMaximized ? '98%' : '880px',
                height: isMaximized ? '95vh' : '85vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8), 0 0 30px rgba(59,130,246,0.05)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* Header */}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 11, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '2px 8px', borderRadius: 6, fontWeight: 800 }}>AI BRIEFING & INTEL</span>
                            <span style={{ color: theme.textMuted, fontSize: 12 }}>· {opportunity?.client || 'Client Lead'}</span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 17, color: theme.textWhite, marginTop: 4 }}>{opportunity?.title}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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

                {/* Navigation Tabs */}
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
                                    padding: '12px 8px',
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

                {/* Notifications */}
                {error && (
                    <div style={{ margin: '12px 24px 0', padding: '10px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 10, fontSize: 13, color: '#f87171', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>⚠️ {error}</span>
                        <button onClick={() => setError(null)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                    </div>
                )}
                {successMsg && (
                    <div style={{ margin: '12px 24px 0', padding: '10px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 10, fontSize: 13, color: '#34d399', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{successMsg}</span>
                        <button onClick={() => setSuccessMsg(null)} style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                    </div>
                )}

                {/* Main Scrollable Content */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16
                }}>
                    {/* TAB 1: AI SUMMARY BRIEFING */}
                    {activeTab === 'briefing' && (
                        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            
                            {/* Document Controller Banner */}
                            <div style={{
                                padding: '14px 18px',
                                background: fileUrl ? 'rgba(59, 130, 246, 0.04)' : 'rgba(255, 255, 255, 0.015)',
                                border: fileUrl ? '1px solid rgba(59, 130, 246, 0.18)' : '1px dashed rgba(255, 255, 255, 0.1)',
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 16,
                                flexWrap: 'wrap'
                            }}>
                                {fileUrl ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#3b82f6', flexShrink: 0 }}>📎</div>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{fileName || 'Attached TOR Document'}</div>
                                            <a href={fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>View / Download File ↗</a>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
                                        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#94a3b8', flexShrink: 0 }}>📥</div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#f8fafc' }}>No TOR document attached yet</div>
                                            <div style={{ fontSize: 11, color: '#64748b' }}>Upload a PDF, DOCX, or TXT file to analyze</div>
                                        </div>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    {fileUrl && (
                                        <button
                                            onClick={() => runAnalysis(fileUrl)}
                                            disabled={analyzing || uploading}
                                            style={{
                                                padding: '8px 14px',
                                                background: '#3b82f6',
                                                border: 'none',
                                                borderRadius: 8,
                                                color: '#fff',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                cursor: (analyzing || uploading) ? 'not-allowed' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                                                opacity: (analyzing || uploading) ? 0.6 : 1
                                            }}
                                        >
                                            {analyzing ? '⏳ Analyzing TOR...' : aiSummary ? '🔄 Re-generate Briefing' : '🚀 Generate AI Briefing'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading || analyzing}
                                        style={{
                                            padding: '8px 14px',
                                            background: fileUrl ? 'rgba(255, 255, 255, 0.04)' : '#3b82f6',
                                            border: fileUrl ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                            borderRadius: 8,
                                            color: '#fff',
                                            fontSize: 12,
                                            fontWeight: 600,
                                            cursor: (uploading || analyzing) ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            opacity: (uploading || analyzing) ? 0.6 : 1
                                        }}
                                    >
                                        {uploading ? '⏳ Uploading...' : fileUrl ? '✏️ Replace File' : '📤 Upload TOR Document'}
                                    </button>
                                </div>
                            </div>

                            {/* Analysis Loading State */}
                            {analyzing && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    background: 'rgba(59, 130, 246, 0.03)',
                                    border: '1px dashed rgba(59, 130, 246, 0.3)',
                                    borderRadius: 14
                                }}>
                                    <div style={{ fontSize: 36, marginBottom: 12, animation: 'pulse 1.5s infinite' }}>🤖</div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
                                        Neural Document Analysis in Progress...
                                    </div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', maxWidth: 460, margin: '0 auto', lineHeight: 1.5 }}>
                                        Gemini is parsing technical scope, submission milestones, financial criteria, compliance constraints, and expert team requirements from your document.
                                    </div>
                                </div>
                            )}

                            {/* Main Briefing Output Display */}
                            {aiSummary && !analyzing && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    
                                    <div style={{ display: 'grid', gridTemplateColumns: isMaximized ? '1.2fr 1fr' : '1.1fr 0.9fr', gap: 16 }}>
                                        {/* Left Column */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            
                                            {/* Scope of work */}
                                            <div style={{ background: theme.cardBg, border: theme.cardBorder, borderRadius: 12, padding: 20 }}>
                                                <div style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', letterSpacing: '0.1em', marginBottom: 8 }}>🎯 STRATEGIC OBJECTIVES & SCOPE OF WORK</div>
                                                <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                                    {aiSummary.scopeOfWork || 'Not specified in TOR document analysis.'}
                                                </div>
                                            </div>

                                            {/* Deadlines */}
                                            <div style={{ background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: 12, padding: 20 }}>
                                                <div style={{ fontSize: 10, fontWeight: 800, color: '#f87171', letterSpacing: '0.1em', marginBottom: 12 }}>📅 DEADLINES & MILESTONES</div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                    {aiSummary.deadlines?.submissionDeadline && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                            <span style={{ fontSize: 13, color: '#94a3b8' }}>Submission Deadline</span>
                                                            <span style={{ fontSize: 13, color: '#f87171', fontWeight: 700 }}>{aiSummary.deadlines.submissionDeadline}</span>
                                                        </div>
                                                    )}
                                                    {aiSummary.deadlines?.projectDuration && (
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                            <span style={{ fontSize: 13, color: '#94a3b8' }}>Implementation Period</span>
                                                            <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 650 }}>{aiSummary.deadlines.projectDuration}</span>
                                                        </div>
                                                    )}
                                                    {aiSummary.deadlines?.otherDates && (
                                                        <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                                                            <strong style={{ color: '#94a3b8' }}>Critical Milestones:</strong> {aiSummary.deadlines.otherDates}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            
                                            {/* Capital / Budget */}
                                            <div style={{ background: 'rgba(16, 185, 129, 0.02)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: 12, padding: 20 }}>
                                                <div style={{ fontSize: 10, fontWeight: 800, color: '#10b981', letterSpacing: '0.1em', marginBottom: 6 }}>💰 ESTIMATED VALUE / CAPITAL</div>
                                                <div style={{ fontSize: 22, fontWeight: 900, color: '#10b981' }}>
                                                    {aiSummary.budget || 'Not specified in TOR'}
                                                </div>
                                            </div>

                                            {/* Key Client Requirements */}
                                            <div style={{ background: theme.cardBg, border: theme.cardBorder, borderRadius: 12, padding: 20 }}>
                                                <div style={{ fontSize: 10, fontWeight: 800, color: theme.textWarning, letterSpacing: '0.1em', marginBottom: 12 }}>🎯 STATED COMPLIANCE & CLIENT CRITERIA</div>
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

                                    {/* Additional Extracted Requirements Grid: Experts & Experiences */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        {/* Required Expert Roles */}
                                        <div style={{ background: 'rgba(59, 130, 246, 0.02)', border: '1px solid rgba(59, 130, 246, 0.08)', borderRadius: 12, padding: 18 }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>👤 REQUIRED TEAM SPECIFICATIONS</span>
                                                <span style={{ fontSize: 11, color: '#64748b' }}>{aiSummary.requiredExperts?.length || 0} roles identified</span>
                                            </div>
                                            {aiSummary.requiredExperts?.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                    {aiSummary.requiredExperts.map((exp, i) => (
                                                        <div key={i} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{exp.position}</div>
                                                            <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                                                                {exp.yearsOfExperience && <Badge color="blue">{exp.yearsOfExperience}y Exp</Badge>}
                                                            </div>
                                                            {exp.keySkills && <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{exp.keySkills}</div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ color: '#64748b', fontSize: 12 }}>Standard team qualifications specified.</div>
                                            )}
                                        </div>

                                        {/* Required Firm Experiences */}
                                        <div style={{ background: 'rgba(99, 102, 241, 0.02)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: 12, padding: 18 }}>
                                            <div style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', letterSpacing: '0.1em', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>📖 REQUIRED REFERENCE BENCHMARKS</span>
                                                <span style={{ fontSize: 11, color: '#64748b' }}>{aiSummary.requiredExperiences?.length || 0} specs identified</span>
                                            </div>
                                            {aiSummary.requiredExperiences?.length > 0 ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                    {aiSummary.requiredExperiences.map((exp, i) => (
                                                        <div key={i} style={{ fontSize: 12, color: '#94a3b8', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                                                            <div style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: 2 }}>{exp.type}</div>
                                                            <div style={{ fontSize: 11, color: '#6366f1' }}>{exp.sector} {exp.geography && `· 📍 ${exp.geography}`}</div>
                                                            {exp.details && <div style={{ marginTop: 4, color: '#94a3b8', fontSize: 11 }}>{exp.details}</div>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{ color: '#64748b', fontSize: 12 }}>Standard project reference requirements.</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action buttons at bottom of Briefing */}
                                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                        <button
                                            onClick={() => setMatchingExperts(true)}
                                            style={{
                                                padding: '10px 18px',
                                                background: 'rgba(59, 130, 246, 0.1)',
                                                border: '1px solid rgba(59, 130, 246, 0.25)',
                                                borderRadius: 10,
                                                color: '#3b82f6',
                                                fontWeight: 700,
                                                fontSize: 13,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            👤 Match Expert Team ({currentExpertIds.length} Assigned)
                                        </button>
                                        <button
                                            onClick={() => setMatchingExperiences(true)}
                                            style={{
                                                padding: '10px 18px',
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                border: '1px solid rgba(99, 102, 241, 0.25)',
                                                borderRadius: 10,
                                                color: '#6366f1',
                                                fontWeight: 700,
                                                fontSize: 13,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            📖 Match Firm References ({currentExperienceIds.length} Assigned)
                                        </button>
                                    </div>

                                </div>
                            )}

                            {/* No summary & not analyzing fallback prompt */}
                            {!aiSummary && !analyzing && (
                                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                    <div style={{ fontSize: 44, marginBottom: 12 }}>🤖</div>
                                    <div style={{ fontSize: 16, color: '#f1f5f9', fontWeight: 700, marginBottom: 6 }}>
                                        {fileUrl ? 'TOR Document Attached — Ready for Analysis' : 'No AI Summary Briefing Generated Yet'}
                                    </div>
                                    <div style={{ fontSize: 13, marginBottom: 20, maxWidth: 440, margin: '0 auto 20px' }}>
                                        {fileUrl 
                                            ? 'Click below to run neural document analysis and extract objectives, budget, deadlines, and requirements.' 
                                            : 'Upload a TOR document or attach a proposal document to trigger automatic AI intelligence extraction.'}
                                    </div>
                                    {fileUrl ? (
                                        <button
                                            onClick={() => runAnalysis(fileUrl)}
                                            disabled={analyzing}
                                            style={{
                                                padding: '12px 24px',
                                                background: '#3b82f6',
                                                border: 'none',
                                                borderRadius: 10,
                                                color: '#fff',
                                                fontSize: 14,
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                                boxShadow: '0 4px 16px rgba(59,130,246,0.4)'
                                            }}
                                        >
                                            🚀 Trigger AI Intelligence Briefing
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            style={{
                                                padding: '12px 24px',
                                                background: '#3b82f6',
                                                border: 'none',
                                                borderRadius: 10,
                                                color: '#fff',
                                                fontSize: 14,
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            📤 Upload TOR Document
                                        </button>
                                    )}
                                </div>
                            )}

                        </div>
                    )}

                    {/* TAB 2: ASSIGNED EXPERT TEAM */}
                    {activeTab === 'experts' && (
                        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>
                                    Assigned Expert Team ({savedExpertsList.length})
                                </div>
                                <button
                                    onClick={() => setMatchingExperts(true)}
                                    style={{
                                        padding: '8px 14px',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        border: '1px solid rgba(59, 130, 246, 0.25)',
                                        borderRadius: 8,
                                        color: '#3b82f6',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}
                                >
                                    👤 Match / Add Experts with AI
                                </button>
                            </div>

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
                                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                            {expert.yearsExp && <Badge color="blue">{expert.yearsExp}y Exp</Badge>}
                                                            {expert.country && <Badge color="gray">📍 {expert.country}</Badge>}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeExpert(expert.id) }}
                                                                title="Remove Expert"
                                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, padding: '2px 6px', marginLeft: 6 }}
                                                            >✕</button>
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

                                            {expanded && (
                                                <div style={{
                                                    marginTop: 16,
                                                    paddingTop: 16,
                                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                                    lineHeight: 1.6,
                                                    color: '#94a3b8',
                                                    fontSize: 13
                                                }}
                                                onClick={e => e.stopPropagation()}
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
                                    <div style={{ fontSize: 12, marginTop: 8, marginBottom: 16 }}>Scan your expert database to select and assign team members for this opportunity.</div>
                                    <button
                                        onClick={() => setMatchingExperts(true)}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#3b82f6',
                                            border: 'none',
                                            borderRadius: 8,
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: 13,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🚀 Launch Expert Matcher
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: REFERENCE PORTFOLIO */}
                    {activeTab === 'experiences' && (
                        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>
                                    Assigned Reference Projects ({savedExperiencesList.length})
                                </div>
                                <button
                                    onClick={() => setMatchingExperiences(true)}
                                    style={{
                                        padding: '8px 14px',
                                        background: 'rgba(99, 102, 241, 0.1)',
                                        border: '1px solid rgba(99, 102, 241, 0.25)',
                                        borderRadius: 8,
                                        color: '#6366f1',
                                        fontSize: 12,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6
                                    }}
                                >
                                    📖 Match / Add References with AI
                                </button>
                            </div>

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
                                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                            {exp.value && <Badge color="green">{exp.value}</Badge>}
                                                            {exp.country && <Badge color="gray">📍 {exp.country}</Badge>}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeExperience(exp.id) }}
                                                                title="Remove Reference"
                                                                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, padding: '2px 6px', marginLeft: 6 }}
                                                            >✕</button>
                                                        </div>
                                                    </div>
                                                    <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 2 }}>
                                                        Client: <strong style={{ color: '#e2e8f0' }}>{exp.client || 'Client'}</strong> {exp.sector && `• Sector: ${exp.sector}`}
                                                    </div>
                                                </div>
                                                <div style={{ color: '#475569', fontSize: 13, userSelect: 'none' }}>
                                                    {expanded ? '▲ Hide Details' : '▼ View Details'}
                                                </div>
                                            </div>

                                            {expanded && (
                                                <div style={{
                                                    marginTop: 16,
                                                    paddingTop: 16,
                                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                                    lineHeight: 1.6,
                                                    color: '#94a3b8',
                                                    fontSize: 13
                                                }}
                                                onClick={e => e.stopPropagation()}
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
                                    <div style={{ fontSize: 12, marginTop: 8, marginBottom: 16 }}>Select past project references to prove organizational capacity for this lead.</div>
                                    <button
                                        onClick={() => setMatchingExperiences(true)}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#6366f1',
                                            border: 'none',
                                            borderRadius: 8,
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: 13,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        🚀 Launch Experience Matcher
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.01)',
                    flexShrink: 0
                }}>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                        {aiSummary ? '✅ AI Intelligence Briefing Ready' : '⚠️ Briefing pending analysis'}
                    </div>
                    <button 
                        onClick={onClose}
                        style={{
                            padding: '8px 18px',
                            background: '#1a1f2e',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            color: '#e2e8f0',
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = '#22283a'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = '#1a1f2e'; }}
                    >
                        Close Briefing
                    </button>
                </div>
            </div>

            {/* Embedded Matching Modals */}
            {matchingExperts && (
                <AIExpertMatchPanel 
                    opportunity={opportunity}
                    torSummary={aiSummary}
                    onClose={() => setMatchingExperts(false)}
                    onSave={(ids) => handleSaveMatchedExperts(ids)}
                />
            )}
            {matchingExperiences && (
                <AIExperienceMatchPanel 
                    opportunity={opportunity}
                    torSummary={aiSummary}
                    onClose={() => setMatchingExperiences(false)}
                    onSave={(ids) => handleSaveMatchedExperiences(ids)}
                />
            )}

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.08); opacity: 0.8; }
                }
            `}</style>
        </div>
    )
}
