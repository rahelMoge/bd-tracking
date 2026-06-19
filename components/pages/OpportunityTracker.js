import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { PageHeader, Btn, Badge, Modal, Field, Input, Select, SearchBar, EmptyState } from '../UI'
import AISummaryPanel from '../AISummaryPanel'

const STAGES = ['TOR Collection', 'Under Review', 'Qualification Review', 'Decision Pending', 'Bid Preparation', 'Submitted', 'Won', 'Lost']
const PROPOSAL_TYPES = ['Technical Proposal', 'Financial Proposal', 'Expression of Interest', 'Concept Note']
const SERVICE_CATS = ['Advisory', 'Capacity Building', 'Research', 'Monitoring & Evaluation', 'Implementation', 'Consulting']
const SECTORS = ['Health', 'Education', 'Agriculture', 'Governance', 'Finance', 'Infrastructure', 'Environment']
const EMPTY = {
    title: '', client: '', stage: 'TOR Collection', deadline: '',
    proposalType: '', serviceCategory: '', strategicFit: 'High',
    bidDecision: 'Not Decided', sector: '', collectedBy: '',
    country: '', notes: '', fileName: '', fileUrl: ''
}

const stageColor = s => ({ Won: 'green', Lost: 'red', Submitted: 'blue', 'Bid Preparation': 'purple', 'Decision Pending': 'yellow' }[s] || 'gray')
const fitColor = f => ({ High: 'green', Med: 'yellow', Low: 'red' }[f] || 'gray')
const bidColor = b => ({ BID: 'green', 'NO-BID': 'red' }[b] || 'yellow')

function FileLink({ url, name }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            title={name}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                fontSize: 11, color: '#7b9cff', textDecoration: 'none',
                background: '#3b5bdb22', padding: '3px 8px', borderRadius: 4,
                maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }
            }
        >
            {'📎 ' + (name || 'File')}
        </a >
    )
}

function FilePreviewLink({ url, name }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{
                flex: 1, color: '#7b9cff', fontSize: 13,
                textDecoration: 'none', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }
            }
        >
            {name}
        </a >
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
    const fileRef = useRef()

    useEffect(() => { fetchData() }, [])

    const fetchData = () => {
        axios.get('/api/opportunities').then(r => {
            setOpportunities(r.data)
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
            setForm(p => ({ ...p, fileName: data.fileName, fileUrl: data.fileUrl }))

            // Automatically analyze the document after upload completes
            setAnalyzingSummary(true)
            try {
                const analyzeRes = await fetch('/api/analyze-document', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileUrl: data.fileUrl })
                })
                const analyzeData = await analyzeRes.json()
                if (analyzeRes.ok) {
                    setAiSummary(analyzeData.summary)
                } else {
                    console.error('Auto-analysis failed:', analyzeData.error)
                }
            } catch (err) {
                console.error('Auto-analysis error:', err)
            } finally {
                setAnalyzingSummary(false)
            }
        } catch {
            alert('Upload failed. Please try again.')
        }
        setUploading(false)
    }

    const removeFile = () => {
        setForm(p => ({ ...p, fileName: '', fileUrl: '' }))
        setAiSummary(null)
        if (fileRef.current) fileRef.current.value = ''
    }

    const openAdd = () => { setForm(EMPTY); setEditId(null); setAiSummary(null); setModal(true) }
    const openEdit = o => {
        setForm({ ...o }); setEditId(o.id)
        setAiSummary(o.aiSummary ? JSON.parse(o.aiSummary) : null)
        setModal(true)
    }

    const handleSaveSummary = async () => {
        if (!aiSummary) return
        if (!editId) {
            alert('Summary is staged! It will be permanently saved to the database when you click "Add Opportunity" at the bottom of the form.')
            return
        }
        setSavingSummary(true)
        try {
            await axios.put(`/api/opportunities/${editId}`, { aiSummary: JSON.stringify(aiSummary) })
            fetchData()
            alert('AI Summary successfully saved to this opportunity record!')
        } catch { alert('Failed to save summary') }
        setSavingSummary(false)
    }

    const save = async () => {
        if (!form.title.trim()) return
        const payload = {
            ...form,
            aiSummary: aiSummary ? JSON.stringify(aiSummary) : null
        }
        if (editId) await axios.put(`/api/opportunities/${editId}`, payload)
        else await axios.post('/api/opportunities', payload)
        setModal(false)
        fetchData()
    }

    const remove = async id => {
        if (confirm('Delete this opportunity?')) {
            await axios.delete(`/api/opportunities/${id}`)
            fetchData()
        }
    }

    const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

    if (loading) return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>
            Loading...
        </div>
    )

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <PageHeader icon="◉" title="Opportunity Tracker" subtitle={`${filtered.length} of ${opportunities.length} entries`}>
                <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or client..." />
                <Btn onClick={fetchData} variant="secondary">↻</Btn>
                <Btn onClick={openAdd}>+ Add</Btn>
            </PageHeader>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

                {/* Filters */}
                <div style={{ width: 190, background: '#0f1117', borderRight: '1px solid #2d3748', padding: '16px 12px', overflowY: 'auto', flexShrink: 0 }}>
                    {[
                        { label: 'Status', key: 'status', options: ['All', ...STAGES] },
                        { label: 'Type of Proposal', key: 'proposalType', options: ['All', ...PROPOSAL_TYPES] },
                        { label: 'Service Category', key: 'serviceCategory', options: ['All', ...SERVICE_CATS] },
                        { label: 'Strategic Fit', key: 'strategicFit', options: ['All', 'High', 'Med', 'Low'] },
                        { label: 'Sector', key: 'sector', options: ['All', ...SECTORS] },
                    ].map(({ label, key, options }) => (
                        <div key={key} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 12, color: '#a0aec0', marginBottom: 6, fontWeight: 500 }}>{label}</div>
                            <Select value={filters[key]} onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))} style={{ width: '100%' }}>
                                {options.map(o => <option key={o}>{o}</option>)}
                            </Select>
                        </div>
                    ))}
                    <div style={{ marginBottom: 16 }}>
                        <div style={{ fontSize: 12, color: '#a0aec0', marginBottom: 6, fontWeight: 500 }}>Collected By</div>
                        <input
                            value={filters.collectedBy}
                            onChange={e => setFilters(p => ({ ...p, collectedBy: e.target.value }))}
                            placeholder="Type to filter..."
                            style={{ width: '100%', background: '#141720', border: '1px solid #2d3748', borderRadius: 7, padding: '7px 10px', color: '#e2e8f0', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                        />
                    </div>
                </div>

                {/* Table */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {filtered.length === 0
                        ? <EmptyState icon="🔍" message="No opportunities match your criteria." />
                        : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                    <tr style={{ background: '#141720', borderBottom: '1px solid #2d3748' }}>
                                        {['Title', 'Client', 'Stage', 'Deadline', 'Type', 'Service', 'Fit', 'Bid', 'Sector', 'File', ''].map(h => (
                                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, fontSize: 11, color: '#718096', whiteSpace: 'nowrap' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(o => (
                                        <tr
                                            key={o.id}
                                            style={{ borderBottom: '1px solid #2d374844' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#141720'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '10px 12px', color: '#e2e8f0', fontWeight: 500, maxWidth: 160 }}>{o.title}</td>
                                            <td style={{ padding: '10px 12px', color: '#a0aec0' }}>{o.client}</td>
                                            <td style={{ padding: '10px 12px' }}><Badge color={stageColor(o.stage)}>{o.stage}</Badge></td>
                                            <td style={{ padding: '10px 12px', color: o.deadline ? '#fc8181' : '#4a5568' }}>{o.deadline || '—'}</td>
                                            <td style={{ padding: '10px 12px', color: '#a0aec0' }}>{o.proposalType || '—'}</td>
                                            <td style={{ padding: '10px 12px', color: '#a0aec0' }}>{o.serviceCategory || '—'}</td>
                                            <td style={{ padding: '10px 12px' }}>{o.strategicFit && <Badge color={fitColor(o.strategicFit)}>{o.strategicFit}</Badge>}</td>
                                            <td style={{ padding: '10px 12px' }}>{o.bidDecision && <Badge color={bidColor(o.bidDecision)}>{o.bidDecision}</Badge>}</td>
                                            <td style={{ padding: '10px 12px', color: '#a0aec0' }}>{o.sector || '—'}</td>

                                            {/* File cell */}
                                            <td style={{ padding: '10px 12px' }}>
                                                {o.fileUrl
                                                    ? <FileLink url={o.fileUrl} name={o.fileName} />
                                                    : <span style={{ color: '#4a5568', fontSize: 11 }}>—</span>
                                                }
                                            </td>

                                            <td style={{ padding: '10px 12px' }}>
                                                <span onClick={() => openEdit(o)} style={{ cursor: 'pointer', marginRight: 8 }}>✏️</span>
                                                <span onClick={() => remove(o.id)} style={{ cursor: 'pointer' }}>🗑️</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    }
                </div>
            </div>

            {/* Modal */}
            {modal && (
                <Modal title={editId ? 'Edit Opportunity' : 'Add Opportunity'} onClose={() => setModal(false)}>

                    <Field label="Title *"><Input value={form.title} onChange={f('title')} placeholder="Opportunity title" /></Field>
                    <Field label="Client"><Input value={form.client} onChange={f('client')} placeholder="Client / Donor" /></Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Stage">
                            <Select value={form.stage} onChange={f('stage')} style={{ width: '100%' }}>
                                {STAGES.map(s => <option key={s}>{s}</option>)}
                            </Select>
                        </Field>
                        <Field label="Deadline"><Input type="date" value={form.deadline} onChange={f('deadline')} /></Field>
                        <Field label="Proposal Type">
                            <Select value={form.proposalType} onChange={f('proposalType')} style={{ width: '100%' }}>
                                <option value="">—</option>{PROPOSAL_TYPES.map(s => <option key={s}>{s}</option>)}
                            </Select>
                        </Field>
                        <Field label="Service Category">
                            <Select value={form.serviceCategory} onChange={f('serviceCategory')} style={{ width: '100%' }}>
                                <option value="">—</option>{SERVICE_CATS.map(s => <option key={s}>{s}</option>)}
                            </Select>
                        </Field>
                        <Field label="Strategic Fit">
                            <Select value={form.strategicFit} onChange={f('strategicFit')} style={{ width: '100%' }}>
                                <option>High</option><option>Med</option><option>Low</option>
                            </Select>
                        </Field>
                        <Field label="Bid Decision">
                            <Select value={form.bidDecision} onChange={f('bidDecision')} style={{ width: '100%' }}>
                                <option>Not Decided</option><option>BID</option><option>NO-BID</option>
                            </Select>
                        </Field>
                        <Field label="Sector">
                            <Select value={form.sector} onChange={f('sector')} style={{ width: '100%' }}>
                                <option value="">—</option>{SECTORS.map(s => <option key={s}>{s}</option>)}
                            </Select>
                        </Field>
                        <Field label="Country"><Input value={form.country} onChange={f('country')} placeholder="Country" /></Field>
                    </div>

                    <Field label="Collected By"><Input value={form.collectedBy} onChange={f('collectedBy')} placeholder="Team member" /></Field>

                    {/* File Upload */}
                    <Field label="Attach File (PDF, Word, Excel, etc.)">
                        <input
                            ref={fileRef}
                            type="file"
                            onChange={handleFileUpload}
                            style={{ display: 'none' }}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
                        />
                        {form.fileUrl ? (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                background: '#0f1117', border: '1px solid #2d3748',
                                borderRadius: 7, padding: '8px 12px'
                            }}>
                                <span style={{ fontSize: 20 }}>📎</span>
                                <FilePreviewLink url={form.fileUrl} name={form.fileName} />
                                <button
                                    onClick={removeFile}
                                    style={{ background: 'none', border: 'none', color: '#fc8181', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}
                                >✕</button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    width: '100%', padding: '10px 16px',
                                    background: '#0f1117', border: '1px dashed #4a5568', borderRadius: 7,
                                    color: uploading ? '#4a5568' : '#a0aec0',
                                    cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13
                                }}
                            >
                                {uploading ? '⏳ Uploading…' : '📁 Click to upload file'}
                            </button>
                        )}
                        <div style={{ fontSize: 11, color: '#4a5568', marginTop: 4 }}>
                            Supported: PDF, Word, Excel, PPT, CSV, TXT
                        </div>
                    </Field>

                    {/* AI Summary Panel */}
                    <AISummaryPanel
                        fileUrl={form.fileUrl}
                        summary={aiSummary}
                        onSummaryGenerated={setAiSummary}
                        onSaveSummary={handleSaveSummary}
                        saving={savingSummary}
                        analyzing={analyzingSummary}
                    />

                    <Field label="Notes">
                        <textarea
                            value={form.notes} onChange={f('notes')} placeholder="Notes..."
                            style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3748', borderRadius: 7, padding: '8px 10px', color: '#e2e8f0', fontSize: 13, resize: 'vertical', minHeight: 70, outline: 'none', boxSizing: 'border-box' }}
                        />
                    </Field>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
                        <Btn onClick={save}>{editId ? 'Save Changes' : 'Add Opportunity'}</Btn>
                    </div>
                </Modal>
            )}
        </div>
    )
}