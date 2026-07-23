import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { PageHeader, Btn, Badge, Modal, Field, Input, Select, SearchBar } from '../UI'
import AISummaryPanel from '../AISummaryPanel'
import AIExpertMatchPanel from '../AIExpertMatchPanel'
import AIExperienceMatchPanel from '../AIExperienceMatchPanel'
import CompetitiveAnalysisPanel from '../CompetitiveAnalysisPanel'
import AIDetailsPanel from '../AIDetailsPanel'

const STAGES = ['TOR Collection', 'Under Review', 'Qualification Review', 'Decision Pending', 'Bid Preparation', 'Submitted', 'Won', 'Lost']
const PROPOSAL_TYPES = ['Technical Proposal', 'Financial Proposal', 'Expression of Interest', 'Concept Note']
const SERVICE_CATS = ['Advisory', 'Capacity Building', 'Research', 'Monitoring & Evaluation', 'Implementation', 'Consulting']
const SECTORS = ['Health', 'Education', 'Agriculture', 'Governance', 'Finance', 'Infrastructure', 'Environment']
const EMPTY = {
    title: '', client: '', stage: 'TOR Collection', deadline: '',
    proposalType: '', serviceCategory: '', strategicFit: 'High',
    bidDecision: 'Not Decided', sector: '', collectedBy: '',
    country: '', notes: '', fileName: '', fileUrl: '',
    expertIds: [], experienceIds: []
}

const stageColor = s => ({ Won: 'green', Lost: 'red', Submitted: 'blue', 'Bid Preparation': 'purple', 'Decision Pending': 'yellow' }[s] || 'gray')
const fitColor = f => ({ High: 'green', Med: 'yellow', Low: 'red' }[f] || 'gray')
const bidColor = b => ({ BID: 'green', 'NO-BID': 'red' }[b] || 'yellow')

function FileLink({ url, name }) {
    return (
        <a
            href={url} target="_blank" rel="noreferrer" title={name}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 11, color: '#f8fafc', textDecoration: 'none',
                background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)',
                padding: '4px 10px', borderRadius: 8,
                maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
        >
            {'📎 ' + (name || 'Document')}
        </a>
    )
}

export default function OpportunityTracker() {
    const [opportunities, setOpportunities] = useState([])
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({
        status: 'All', proposalType: 'All', serviceCategory: 'All',
        strategicFit: 'All', sector: 'All', collectedBy: ''
    })
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [aiSummary, setAiSummary] = useState(null)
    const [savingSummary, setSavingSummary] = useState(false)
    const [analyzingSummary, setAnalyzingSummary] = useState(false)
    const [matchingExperts, setMatchingExperts] = useState(false)
    const [matchingExperiences, setMatchingExperiences] = useState(false)
    const [competitiveAnalysisId, setCompetitiveAnalysisId] = useState(null)
    const [matchedExpertsData, setMatchedExpertsData] = useState([])
    const [matchedExperiencesData, setMatchedExperiencesData] = useState([])
    const [allExperts, setAllExperts] = useState([])
    const [allExperiences, setAllExperiences] = useState([])
    const [briefingOpportunityId, setBriefingOpportunityId] = useState(null)
    const fileRef = useRef()

    useEffect(() => { fetchData() }, [])

    const fetchData = () => {
        setLoading(true)
        Promise.all([
            axios.get('/api/opportunities', { params: { _t: Date.now() } }),
            axios.get('/api/experts', { params: { _t: Date.now() } }),
            axios.get('/api/experiences', { params: { _t: Date.now() } })
        ]).then(([oppRes, expRes, expeRes]) => {
            setOpportunities(oppRes.data || [])
            setAllExperts(expRes.data || [])
            setAllExperiences(expeRes.data || [])
            setLoading(false)
        }).catch((err) => {
            console.error('FetchData Error:', err)
            setLoading(false)
        })
    }

    const filtered = opportunities.filter(o => {
        if (search && !o.title?.toLowerCase().includes(search.toLowerCase()) && !o.client?.toLowerCase().includes(search.toLowerCase())) return false
        if (filters.status !== 'All' && o.stage !== filters.status) return false
        if (filters.proposalType !== 'All' && o.proposalType !== filters.proposalType) return false
        if (filters.serviceCategory !== 'All' && o.serviceCategory !== filters.serviceCategory) return false
        if (filters.strategicFit !== 'All' && o.strategicFit !== filters.strategicFit) return false
        if (filters.sector !== 'All' && o.sector !== filters.sector) return false
        if (filters.collectedBy && !o.collectedBy?.toLowerCase().includes(filters.collectedBy.toLowerCase())) return false
        return true
    })

    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploading(true)
        setAiSummary(null)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (!res.ok) throw new Error('Upload failed')
            setForm(p => ({ ...p, fileName: data.fileName, fileUrl: data.fileUrl }))
            setUploading(false)
            setAnalyzingSummary(true)
            try {
                const analyzeRes = await fetch('/api/analyze-document', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileUrl: data.fileUrl })
                })
                const analyzeData = await analyzeRes.json()
                if (analyzeRes.ok) setAiSummary(analyzeData.summary)
            } catch (err) { console.error('AI Error:', err) }
            finally { setAnalyzingSummary(false) }
        } catch (err) {
            setUploading(false)
            alert('Upload failed')
        }
    }

    const openAdd = () => {
        setForm(EMPTY); setEditId(null); setAiSummary(null)
        setMatchedExpertsData([]); setMatchedExperiencesData([])
        setModal(true)
    }
    const openEdit = o => {
        setForm({
            ...EMPTY,
            ...o,
            // Map DB field to form field
            fileUrl: o.documentUrl || '',
            fileName: o.documentUrl ? 'Attached Document' : '',
            // Coerce nulls to empty strings for controlled inputs
            title: o.title || '',
            client: o.client || '',
            deadline: o.deadline || '',
            proposalType: o.proposalType || '',
            serviceCategory: o.serviceCategory || '',
            strategicFit: o.strategicFit || 'High',
            bidDecision: o.bidDecision || 'Not Decided',
            sector: o.sector || '',
            collectedBy: o.collectedBy || '',
            country: o.country || '',
            notes: o.notes || '',
            expertIds: o.expertIds || [],
            experienceIds: o.experienceIds || [],
        })
        setEditId(o.id)
        setAiSummary(o.aiSummary ? JSON.parse(o.aiSummary) : null)
        // Load existing matched expert/experience names
        loadMatchedData(o.expertIds || [], o.experienceIds || [])
        setModal(true)
    }

    const loadMatchedData = (expertIds, experienceIds) => {
        setMatchedExpertsData(allExperts.filter(e => expertIds.includes(e.id)))
        setMatchedExperiencesData(allExperiences.filter(e => experienceIds.includes(e.id)))
    }

    const getExpertNames = (ids) => {
        if (!Array.isArray(ids)) return []
        return allExperts.filter(e => ids.includes(e.id)).map(e => e.name)
    }

    const getExperienceTitles = (ids) => {
        if (!Array.isArray(ids)) return []
        return allExperiences.filter(e => ids.includes(e.id)).map(e => e.title)
    }

    const removeExpert = (id) => {
        setForm(p => ({ ...p, expertIds: (p.expertIds || []).filter(x => x !== id) }))
        setMatchedExpertsData(prev => prev.filter(e => e.id !== id))
    }

    const removeExperience = (id) => {
        setForm(p => ({ ...p, experienceIds: (p.experienceIds || []).filter(x => x !== id) }))
        setMatchedExperiencesData(prev => prev.filter(e => e.id !== id))
    }

    const save = async () => {
        if (!form.title.trim()) { alert('Title is required'); return }
        const payload = {
            ...form,
            aiSummary: aiSummary ? JSON.stringify(aiSummary) : null,
            expertIds: form.expertIds || [],
            experienceIds: form.experienceIds || []
        }
        try {
            if (editId) await axios.put(`/api/opportunities/${editId}`, payload)
            else await axios.post('/api/opportunities', payload)
            setModal(false)
            fetchData()
        } catch (err) {
            if (err.response?.status === 404) {
                alert('This opportunity no longer exists. It may have been deleted. Refreshing data...')
                setModal(false)
                fetchData()
            } else {
                alert('Save failed: ' + (err.response?.data?.error || err.message))
            }
        }
    }

    const remove = async id => {
        if (confirm('Delete this opportunity?')) {
            try {
                await axios.delete(`/api/opportunities/${id}`)
            } catch (err) {
                if (err.response?.status === 404) {
                    alert('This opportunity was already deleted.')
                } else {
                    alert('Delete failed: ' + (err.response?.data?.error || err.message))
                }
            }
            fetchData()
        }
    }

    const handleSaveCompetitive = async (data) => {
        try {
            await axios.put(`/api/opportunities/${competitiveAnalysisId}`, data)
            setCompetitiveAnalysisId(null)
            fetchData()
        } catch (err) { alert('Failed to save competitive analysis') }
    }

    const handleSaveSummary = async () => {
        if (!editId) {
            alert('Insights staged. Click "Initialize Record" at the bottom to save.')
            return
        }
        setSavingSummary(true)
        try {
            const payload = {
                ...form,
                aiSummary: aiSummary ? JSON.stringify(aiSummary) : null,
                expertIds: form.expertIds || [],
                experienceIds: form.experienceIds || []
            }
            await axios.put(`/api/opportunities/${editId}`, payload)
            alert('AI Intelligence Briefing saved successfully to database!')
            fetchData()
        } catch (err) {
            alert('Failed to save intelligence Briefing: ' + err.message)
        } finally {
            setSavingSummary(false)
        }
    }

    const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

    if (loading) return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div className="animate-fade" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>📡</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>Syncing Ledger...</div>
            </div>
        </div>
    )

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }} className="animate-fade">
            <PageHeader icon="🎯" title="Opportunity Tracker" subtitle={`${filtered.length} active leads tracked`}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or client..." />
                    <Btn onClick={openAdd}>+ New Opportunity</Btn>
                </div>
            </PageHeader>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }} className="tracker-layout">

                {/* Filters */}
                <div style={{ 
                    width: 220, 
                    background: '#0f1218', 
                    borderRight: '1px solid rgba(255,255,255,0.06)', 
                    padding: '24px 16px', 
                    overflowY: 'auto', 
                    flexShrink: 0 
                }} className="filters-sidebar">
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.1em', marginBottom: 20 }}>FILTER INTELLIGENCE</div>
                    <div className="filters-grid">
                        {[
                            { label: 'Pipeline Stage', key: 'status', options: ['All', ...STAGES] },
                            { label: 'Proposal Type', key: 'proposalType', options: ['All', ...PROPOSAL_TYPES] },
                            { label: 'Strategic Fit', key: 'strategicFit', options: ['All', 'High', 'Med', 'Low'] },
                            { label: 'Sector Focus', key: 'sector', options: ['All', ...SECTORS] },
                        ].map(({ label, key, options }) => (
                            <div key={key} style={{ marginBottom: 20 }} className="filter-item">
                                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8, fontWeight: 600 }}>{label}</div>
                                <Select value={filters[key]} onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%' }}>
                                    {options.map(o => <option key={o}>{o}</option>)}
                                </Select>
                            </div>
                        ))}
                    </div>
                    <div className="reset-wrapper">
                        <Btn variant="secondary" small style={{ width: '100%', marginTop: 12, justifyContent: 'center' }} onClick={() => setFilters({ status: 'All', proposalType: 'All', strategicFit: 'All', sector: 'All', collectedBy: '' })}>Reset Filters</Btn>
                    </div>
                </div>

                {/* Table */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 40px 0' }} className="table-container">
                    {filtered.length === 0 ? (
                        <div style={{ padding: 100, textAlign: 'center' }}>
                            <div style={{ fontSize: 44, marginBottom: 16 }}>🔍</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#f8fafc' }}>No matches found</div>
                            <div style={{ fontSize: 14, color: '#64748b', marginTop: 8 }}>Try adjusting your filters or search terms.</div>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: 13 }}>
                            <thead>
                                <tr style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                    <th style={{ padding: '16px 20px', background: '#0a0c10', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>TITLE</th>
                                    <th style={{ padding: '16px 20px', background: '#0a0c10', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>CLIENT</th>
                                    <th style={{ padding: '16px 20px', background: '#0a0c10', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>STAGE</th>
                                    <th style={{ padding: '16px 20px', background: '#0a0c10', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>DEADLINE</th>
                                    <th style={{ padding: '16px 20px', background: '#0a0c10', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>FIT</th>
                                    <th style={{ padding: '16px 20px', background: '#0a0c10', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>BID</th>
                                    <th style={{ padding: '16px 20px', background: '#0a0c10', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>DOCUMENT</th>
                                    <th style={{ padding: '16px 20px', background: '#0a0c10', textAlign: 'left', fontWeight: 700, fontSize: 11, color: '#475569', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>MATCHED INTEL (TEAM / REFS)</th>
                                    <th style={{ padding: '16px 20px', background: '#0a0c10', borderBottom: '1px solid rgba(255,255,255,0.06)' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((o, i) => (
                                    <tr 
                                        key={o.id} 
                                        style={{ transition: 'all 0.2s', animationDelay: `${i * 0.02}s` }}
                                        className="table-row animate-fade"
                                    >
                                        <td style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{o.title}</div>
                                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{o.sector || 'Uncategorized'}</div>
                                        </td>
                                        <td style={{ padding: '16px 20px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{o.client}</td>
                                        <td style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}><Badge color={stageColor(o.stage)}>{o.stage}</Badge></td>
                                        <td style={{ padding: '16px 20px', color: o.deadline ? '#f87171' : '#475569', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{o.deadline || '—'}</td>
                                        <td style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}><Badge color={fitColor(o.strategicFit)}>{o.strategicFit}</Badge></td>
                                        <td style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}><Badge color={bidColor(o.bidDecision)}>{o.bidDecision}</Badge></td>
                                        <td style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            {o.fileUrl ? <FileLink url={o.fileUrl} name={o.fileName} /> : <span style={{ color: '#334155' }}>None</span>}
                                        </td>
                                        <td style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                {getExpertNames(o.expertIds).length > 0 && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: 10, color: '#3b82f6', opacity: 0.8 }} title="Matched Expert Team">👤</span>
                                                        {getExpertNames(o.expertIds).map(name => (
                                                            <Badge key={name} color="blue">{name}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                {getExperienceTitles(o.experienceIds).length > 0 && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: 10, color: '#6366f1', opacity: 0.8 }} title="Matched Experiences">📖</span>
                                                        {getExperienceTitles(o.experienceIds).map(title => (
                                                            <Badge key={title} color="purple">{title.length > 25 ? title.substring(0, 25) + '...' : title}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                {getExpertNames(o.expertIds).length === 0 && getExperienceTitles(o.experienceIds).length === 0 && (
                                                    <span style={{ color: '#334155', fontSize: 12 }}>—</span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                                                <button onClick={() => setBriefingOpportunityId(o.id)} style={{ background: 'none', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Briefing</button>
                                                <button onClick={() => openEdit(o)} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Edit</button>
                                                <button onClick={() => setCompetitiveAnalysisId(o.id)} style={{ background: 'none', border: 'none', color: '#f59e0b', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Intel</button>
                                                <button onClick={() => remove(o.id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal & Overlays */}
            {modal && (
                <Modal title={editId ? 'Refine Strategy' : 'Initialize Opportunity'} onClose={() => setModal(false)} width={800}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Field label="Title / Objective *"><Input value={form.title} onChange={f('title')} placeholder="Enter proposal title..." /></Field>
                            <Field label="Target Client"><Input value={form.client} onChange={f('client')} placeholder="e.g. World Bank, UNDP" /></Field>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <Field label="Current Pipeline Stage">
                                    <Select value={form.stage} onChange={f('stage')}>
                                        {STAGES.map(s => <option key={s}>{s}</option>)}
                                    </Select>
                                </Field>
                                <Field label="Strategic Decision">
                                    <Select value={form.bidDecision} onChange={f('bidDecision')}>
                                        <option>Not Decided</option><option>BID</option><option>NO-BID</option>
                                    </Select>
                                </Field>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <Field label="Submission Deadline"><Input type="date" value={form.deadline} onChange={f('deadline')} /></Field>
                                <Field label="Strategic Fit">
                                    <Select value={form.strategicFit} onChange={f('strategicFit')}>
                                        <option>High</option><option>Med</option><option>Low</option>
                                    </Select>
                                </Field>
                             </div>
                             <Field label="Sector Primary Focus">
                                <Select value={form.sector} onChange={f('sector')}>
                                    <option value="">Select Sector...</option>
                                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                                </Select>
                             </Field>
                             <Field label="Responsible Lead"><Input value={form.collectedBy} onChange={f('collectedBy')} placeholder="BD Lead Name" /></Field>
                        </div>
                    </div>

                    <div style={{ margin: '24px 0', padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 16, letterSpacing: '0.05em' }}>INTELLIGENT RESOURCE MATCHING</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <button onClick={() => setMatchingExperts(true)} style={{ padding: 16, background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 12, color: '#3b82f6', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                👤 {(form.expertIds || []).length > 0 ? `${(form.expertIds || []).length} Experts Selected` : 'Match Expert Team'}
                            </button>
                            <button onClick={() => setMatchingExperiences(true)} style={{ padding: 16, background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 12, color: '#6366f1', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                📖 {(form.experienceIds || []).length > 0 ? `${(form.experienceIds || []).length} References Selected` : 'Match Firm Experience'}
                            </button>
                        </div>

                        {/* Selected Experts Preview */}
                        {matchedExpertsData.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>👤 Selected Expert Team ({matchedExpertsData.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {matchedExpertsData.map(expert => (
                                        <div key={expert.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '10px 14px', background: 'rgba(59, 130, 246, 0.04)',
                                            border: '1px solid rgba(59, 130, 246, 0.12)', borderRadius: 10,
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>👤</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{expert.name}</div>
                                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                    {expert.specialization && <span>{expert.specialization}</span>}
                                                    {expert.country && <span>• {expert.country}</span>}
                                                    {expert.yearsExp && <span>• {expert.yearsExp} yrs</span>}
                                                </div>
                                            </div>
                                            <button onClick={() => removeExpert(expert.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, padding: 4, opacity: 0.6, transition: 'opacity 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selected Experiences Preview */}
                        {matchedExperiencesData.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontSize: 10, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>📖 Selected Firm Experiences ({matchedExperiencesData.length})</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {matchedExperiencesData.map(exp => (
                                        <div key={exp.id} style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            padding: '10px 14px', background: 'rgba(99, 102, 241, 0.04)',
                                            border: '1px solid rgba(99, 102, 241, 0.12)', borderRadius: 10,
                                            transition: 'all 0.2s'
                                        }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📖</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{exp.title}</div>
                                                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                                    {exp.client && <span>{exp.client}</span>}
                                                    {exp.sector && <span>• {exp.sector}</span>}
                                                    {exp.country && <span>• {exp.country}</span>}
                                                    {exp.value && <span>• {exp.value}</span>}
                                                </div>
                                            </div>
                                            <button onClick={() => removeExperience(exp.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 14, padding: 4, opacity: 0.6, transition: 'opacity 0.2s' }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ margin: '24px 0' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 12, letterSpacing: '0.05em' }}>DOCUMENT INTELLIGENCE</div>
                        <div 
                            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = 'rgba(59, 130, 246, 0.03)'; }}
                            onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                            onDrop={(e) => { 
                                e.preventDefault(); 
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                const file = e.dataTransfer.files[0];
                                if (file && !uploading) {
                                    const event = { target: { files: [file] } };
                                    handleFileUpload(event);
                                }
                            }}
                            style={{ position: 'relative', border: '2px dashed rgba(255,255,255,0.08)', borderRadius: 16, background: 'rgba(255,255,255,0.01)', transition: 'all 0.2s' }}
                        >
                            <input
                                id="file-upload-input" type="file" onChange={handleFileUpload}
                                style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}
                                accept=".pdf,.doc,.docx,.txt"
                            />
                            {form.fileUrl ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px' }}>
                                    <div style={{ width: 44, height: 44, background: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📎</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{form.fileName}</div>
                                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>TOR Document Attached</div>
                                    </div>
                                    <button onClick={() => setForm(p => ({ ...p, fileName: '', fileUrl: '' }))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 18 }}>✕</button>
                                </div>
                            ) : (
                                <label htmlFor="file-upload-input" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '40px 20px', cursor: uploading ? 'not-allowed' : 'pointer', textAlign: 'center' }}>
                                    <div style={{ fontSize: 32 }}>{uploading ? '⏳' : '📥'}</div>
                                    <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{uploading ? 'Processing Document...' : 'Drop TOR here or click to browse'}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>AI will analyze scope, requirements, and deadlines</div>
                                </label>
                            )}
                        </div>
                    </div>

                    <AISummaryPanel
                        fileUrl={form.fileUrl}
                        summary={aiSummary}
                        onSummaryGenerated={setAiSummary}
                        onSaveSummary={handleSaveSummary}
                        saving={savingSummary}
                        analyzing={analyzingSummary}
                    />

                    <div style={{ marginBottom: 24 }}>
                        <Field label="Strategic Notes"><textarea value={form.notes} onChange={f('notes')} style={{ width: '100%', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#f1f5f9', padding: 12, fontSize: 13, minHeight: 80, outline: 'none' }} placeholder="Add context, remarks or specific instructions..." /></Field>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                        <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
                        <Btn onClick={save}>{editId ? 'Commit Changes' : 'Initialize Record'}</Btn>
                    </div>

                    {matchingExperts && (
                        <AIExpertMatchPanel 
                            opportunity={form} torSummary={aiSummary} 
                            onClose={() => setMatchingExperts(false)}
                            onSave={(ids, fullData) => {
                                setForm(p => ({ ...p, expertIds: ids }))
                                if (fullData) setMatchedExpertsData(fullData)
                            }}
                        />
                    )}
                    {matchingExperiences && (
                        <AIExperienceMatchPanel 
                            opportunity={form} torSummary={aiSummary} 
                            onClose={() => setMatchingExperiences(false)}
                            onSave={(ids, fullData) => {
                                setForm(p => ({ ...p, experienceIds: ids }))
                                if (fullData) setMatchedExperiencesData(fullData)
                            }}
                        />
                    )}
                    {competitiveAnalysisId && (
                        <CompetitiveAnalysisPanel 
                            opportunity={opportunities.find(o => o.id === competitiveAnalysisId)}
                            onClose={() => setCompetitiveAnalysisId(null)}
                            onSave={handleSaveCompetitive}
                        />
                    )}
                </Modal>
            )}

            {briefingOpportunityId && (
                <AIDetailsPanel 
                    opportunity={opportunities.find(o => o.id === briefingOpportunityId)}
                    experts={allExperts}
                    experiences={allExperiences}
                    onClose={() => setBriefingOpportunityId(null)}
                    onUpdate={fetchData}
                />
            )}

            <style jsx>{`
                .table-row:hover {
                    background: rgba(255,255,255,0.02) !important;
                }
                @media (max-width: 1024px) {
                    .tracker-layout {
                        flex-direction: column !important;
                        overflow-y: auto !important;
                    }
                    .filters-sidebar {
                        width: 100% !important;
                        border-right: none !important;
                        border-bottom: 1px solid rgba(255,255,255,0.06) !important;
                        display: flex !important;
                        flex-direction: column !important;
                        padding: 16px !important;
                    }
                    .filters-grid {
                        display: grid !important;
                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
                        gap: 16px !important;
                        width: 100% !important;
                    }
                    .filter-item {
                        margin-bottom: 0 !important;
                    }
                    .reset-wrapper {
                        display: flex;
                        justify-content: flex-end;
                        margin-top: 12px;
                    }
                    .reset-wrapper :global(button) {
                        width: auto !important;
                    }
                    .table-container {
                        overflow-x: auto !important;
                    }
                }
            `}</style>
        </div>
    )
}