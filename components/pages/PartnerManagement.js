import { useState, useEffect } from 'react'
import axios from 'axios'
import { PageHeader, Btn, Badge, Modal, Field, Input, Select, SearchBar, EmptyState } from '../UI'

const ENGAGEMENT_REASONS = ['Lacks experience', 'Physical presence required', 'Specific expertise', 'Other']
const PARTNER_STATUSES = ['Contacted', 'Agreed', 'Declined', 'Active', 'Completed']
const REQUEST_DECISIONS = ['Under Review', 'Accepted', 'Declined']

const statusColor = s => ({ Active: 'green', Agreed: 'blue', Contacted: 'yellow', Declined: 'red', Completed: 'gray' }[s] || 'gray')
const decisionColor = d => ({ Accepted: 'green', Declined: 'red', 'Under Review': 'yellow' }[d] || 'gray')

export default function PartnerManagement() {
    const [tab, setTab] = useState('external') // 'external', 'requests', 'pipeline'
    const [partners, setPartners] = useState([])
    const [requests, setRequests] = useState([])
    const [opportunities, setOpportunities] = useState([])
    const [loading, setLoading] = useState(true)
    
    // Search/Filter states
    const [search, setSearch] = useState('')
    const [filters, setFilters] = useState({ country: 'All', status: 'All', reason: 'All', decision: 'All' })

    // Modal states
    const [modal, setModal] = useState(null) // 'addPartner', 'editPartner', 'addRequest', 'editRequest'
    const [selectedItem, setSelectedItem] = useState(null)
    const [form, setForm] = useState({})

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [p, r, o] = await Promise.all([
                axios.get('/api/partners'),
                axios.get('/api/partner-requests'),
                axios.get('/api/opportunities')
            ])
            setPartners(p.data)
            setRequests(r.data)
            setOpportunities(o.data)
        } catch (err) {
            console.error('Fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSavePartner = async () => {
        try {
            if (selectedItem) await axios.put(`/api/partners/${selectedItem.id}`, form)
            else await axios.post('/api/partners', form)
            setModal(null)
            fetchData()
        } catch (err) { alert('Save failed') }
    }

    const handleSaveRequest = async () => {
        try {
            if (selectedItem) await axios.put(`/api/partner-requests/${selectedItem.id}`, form)
            else await axios.post('/api/partner-requests', form)
            setModal(null)
            fetchData()
        } catch (err) { alert('Save failed') }
    }

    const handleDeletePartner = async (id) => {
        if (confirm('Delete partner?')) {
            await axios.delete(`/api/partners/${id}`)
            fetchData()
        }
    }

    const handleDeleteRequest = async (id) => {
        if (confirm('Delete request?')) {
            await axios.delete(`/api/partner-requests/${id}`)
            fetchData()
        }
    }

    const updateChecklist = async (opp, field, val) => {
        try {
            await axios.put(`/api/opportunities/${opp.id}`, { [field]: val })
            fetchData()
        } catch (err) { alert('Checklist update failed') }
    }

    const filteredPartners = partners.filter(p => {
        if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false
        if (filters.country !== 'All' && p.country !== filters.country) return false
        if (filters.status !== 'All' && p.status !== filters.status) return false
        if (filters.reason !== 'All' && p.engagementReason !== filters.reason) return false
        return true
    })

    const filteredRequests = requests.filter(r => {
        if (search && !r.firmName?.toLowerCase().includes(search.toLowerCase())) return false
        if (filters.country !== 'All' && r.country !== filters.country) return false
        if (filters.decision !== 'All' && r.decision !== filters.decision) return false
        return true
    })

    const pushToAsana = async (opp) => {
        if (!confirm('Push to Asana?')) return
        try {
            await axios.put(`/api/opportunities/${opp.id}`, {
                asanaTaskId: `asana_${Date.now()}`,
                asanaTaskUrl: `https://app.asana.com/0/123/${Date.now()}`
            })
            fetchData()
        } catch (err) { alert('Asana push failed') }
    }

    const pipelineOpps = opportunities.filter(o => o.bidDecision === 'BID')

    if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>Loading...</div>

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <PageHeader icon="🤝" title="Partnership Management" subtitle="External engagements & proposal pipeline">
                <div style={{ display: 'flex', gap: 8, background: '#111827', padding: 4, borderRadius: 8 }}>
                    <button onClick={() => {setTab('external'); setSearch('')}} style={{ background: tab === 'external' ? '#3b5bdb' : 'transparent', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Partners</button>
                    <button onClick={() => {setTab('requests'); setSearch('')}} style={{ background: tab === 'requests' ? '#3b5bdb' : 'transparent', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Requests</button>
                    <button onClick={() => {setTab('pipeline'); setSearch('')}} style={{ background: tab === 'pipeline' ? '#3b5bdb' : 'transparent', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Proposal Pipeline</button>
                </div>
            </PageHeader>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
                
                {tab === 'external' && (
                    <>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                            <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners..." />
                            <Btn onClick={() => { setForm({ status: 'Contacted', engagementReason: 'Specific expertise' }); setSelectedItem(null); setModal('addPartner') }}>+ Add Partner</Btn>
                        </div>
                        <div style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 12, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead style={{ background: '#1a1f2e', color: '#718096', textAlign: 'left' }}>
                                    <tr>
                                        <th style={{ padding: 14 }}>Partner Name</th>
                                        <th style={{ padding: 14 }}>Country</th>
                                        <th style={{ padding: 14 }}>Expertise</th>
                                        <th style={{ padding: 14 }}>Reason</th>
                                        <th style={{ padding: 14 }}>Opportunity</th>
                                        <th style={{ padding: 14 }}>Status</th>
                                        <th style={{ padding: 14 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPartners.map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #2d3748' }}>
                                            <td style={{ padding: 14, fontWeight: 600 }}>{p.name}</td>
                                            <td style={{ padding: 14 }}>{p.country}</td>
                                            <td style={{ padding: 14 }}><Badge color="blue">{p.expertise || p.sector || 'General'}</Badge></td>
                                            <td style={{ padding: 14, color: '#a0aec0' }}>{p.engagementReason}</td>
                                            <td style={{ padding: 14, fontSize: 11, color: '#718096' }}>
                                                {opportunities.find(o => o.id === p.opportunityId)?.title || '—'}
                                            </td>
                                            <td style={{ padding: 14 }}><Badge color={statusColor(p.status)}>{p.status}</Badge></td>
                                            <td style={{ padding: 14, textAlign: 'right' }}>
                                                <button onClick={() => { setForm(p); setSelectedItem(p); setModal('editPartner') }} style={{ background: 'none', border: 'none', color: '#3b5bdb', cursor: 'pointer', marginRight: 12 }}>Edit</button>
                                                <button onClick={() => handleDeletePartner(p.id)} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {tab === 'requests' && (
                    <>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
                            <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search firms..." />
                            <Btn onClick={() => { setForm({ decision: 'Under Review' }); setSelectedItem(null); setModal('addRequest') }}>+ Add Request</Btn>
                        </div>
                        <div style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 12, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead style={{ background: '#1a1f2e', color: '#718096', textAlign: 'left' }}>
                                    <tr>
                                        <th style={{ padding: 14 }}>Requesting Firm</th>
                                        <th style={{ padding: 14 }}>Country</th>
                                        <th style={{ padding: 14 }}>Opportunity Description</th>
                                        <th style={{ padding: 14 }}>Decision</th>
                                        <th style={{ padding: 14 }}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRequests.map(r => (
                                        <tr key={r.id} style={{ borderBottom: '1px solid #2d3748' }}>
                                            <td style={{ padding: 14, fontWeight: 600 }}>{r.firmName}</td>
                                            <td style={{ padding: 14 }}>{r.country}</td>
                                            <td style={{ padding: 14, color: '#e2e8f0' }}>{r.description}</td>
                                            <td style={{ padding: 14 }}><Badge color={decisionColor(r.decision)}>{r.decision}</Badge></td>
                                            <td style={{ padding: 14, textAlign: 'right' }}>
                                                <button onClick={() => { setForm(r); setSelectedItem(r); setModal('editRequest') }} style={{ background: 'none', border: 'none', color: '#3b5bdb', cursor: 'pointer', marginRight: 12 }}>Edit</button>
                                                <button onClick={() => handleDeleteRequest(r.id)} style={{ background: 'none', border: 'none', color: '#e53e3e', cursor: 'pointer' }}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {tab === 'pipeline' && (
                    pipelineOpps.length === 0 ? (
                        <div style={{ padding: 60, textAlign: 'center', background: '#111827', borderRadius: 12, border: '1px dashed #2d3748' }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                            <div style={{ fontSize: 16, color: '#e2e8f0', fontWeight: 600 }}>No active proposals</div>
                            <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>Opportunities with "Bid Decision = BID" will appear here in the pipeline.</div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
                            {['Decision Pending', 'Bid Preparation', 'Submitted'].map(stage => (
                                <div key={stage} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: '#718096', textTransform: 'uppercase', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                                        {stage}
                                        <span style={{ background: '#1a1f2e', padding: '2px 8px', borderRadius: 10 }}>{pipelineOpps.filter(o => o.stage === stage).length}</span>
                                    </div>
                                    {pipelineOpps.filter(o => o.stage === stage).map(opp => (
                                        <div key={opp.id} style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                            <div>
                                                <div style={{ fontWeight: 700, marginBottom: 4 }}>{opp.title}</div>
                                                <div style={{ fontSize: 12, color: '#a0aec0' }}>Client: {opp.client}</div>
                                                {opp.deadline && <div style={{ fontSize: 11, color: '#fc8181', marginTop: 4 }}>📅 Deadline: {opp.deadline}</div>}
                                            </div>
                                            <div style={{ borderTop: '1px solid #2d3748', paddingTop: 12 }}>
                                                {[
                                                    { label: 'Expert identified', key: 'expertIdentified' },
                                                    { label: 'Experience selected', key: 'experienceSelected' },
                                                    { label: 'Methodology drafted', key: 'techDrafted' },
                                                    { label: 'Financials prepared', key: 'financialPrepared' },
                                                    { label: 'Docs compiled', key: 'docsCompiled' },
                                                    { label: 'Submitted', key: 'submitted' }
                                                ].map(item => (
                                                    <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }} onClick={() => updateChecklist(opp, item.key, !opp[item.key])}>
                                                        <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${opp[item.key] ? '#3b5bdb' : '#4a5568'}`, background: opp[item.key] ? '#3b5bdb' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {opp[item.key] && <span style={{ fontSize: 10, color: '#fff' }}>✓</span>}
                                                        </div>
                                                        <span style={{ fontSize: 12, color: opp[item.key] ? '#e2e8f0' : '#718096' }}>{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', gap: 8, borderTop: '1px solid #2d3748', paddingTop: 12 }}>
                                                <Btn variant="secondary" small style={{ flex: 1, fontSize: 10 }}>Summary</Btn>
                                                {opp.asanaTaskUrl ? (
                                                    <a href={opp.asanaTaskUrl} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none' }}>
                                                        <Btn variant="secondary" small style={{ width: '100%', fontSize: 10, color: '#ff4d4d' }}>Asana</Btn>
                                                    </a>
                                                ) : (
                                                    <Btn variant="secondary" small style={{ flex: 1, fontSize: 10 }} onClick={() => pushToAsana(opp)}>Push Asana</Btn>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* Modals */}
            {(modal === 'addPartner' || modal === 'editPartner') && (
                <Modal title={selectedItem ? 'Edit Partner' : 'Add Partner'} onClose={() => setModal(null)}>
                    <Field label="Partner Name"><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Country"><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} /></Field>
                        <Field label="Expertise"><Input value={form.expertise} onChange={e => setForm({...form, expertise: e.target.value})} /></Field>
                    </div>
                    <Field label="Reason for Engagement">
                        <Select value={form.engagementReason} onChange={e => setForm({...form, engagementReason: e.target.value})}>
                            {ENGAGEMENT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </Select>
                    </Field>
                    <Field label="Status">
                        <Select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                            {PARTNER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </Field>
                    <Btn onClick={handleSavePartner} style={{ width: '100%', marginTop: 12 }}>Save Partner</Btn>
                </Modal>
            )}

            {(modal === 'addRequest' || modal === 'editRequest') && (
                <Modal title={selectedItem ? 'Edit Request' : 'Add Request'} onClose={() => setModal(null)}>
                    <Field label="Firm Name"><Input value={form.firmName} onChange={e => setForm({...form, firmName: e.target.value})} /></Field>
                    <Field label="Country"><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} /></Field>
                    <Field label="Description"><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ width: '100%', minHeight: 80, background: '#0a0d13', border: '1px solid #2d3748', borderRadius: 8, color: '#fff', padding: 8 }} /></Field>
                    <Field label="Decision">
                        <Select value={form.decision} onChange={e => setForm({...form, decision: e.target.value})}>
                            {REQUEST_DECISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </Select>
                    </Field>
                    <Btn onClick={handleSaveRequest} style={{ width: '100%', marginTop: 12 }}>Save Request</Btn>
                </Modal>
            )}
        </div>
    )
}