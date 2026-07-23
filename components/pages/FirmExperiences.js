import { useState, useEffect } from 'react'
import axios from 'axios'
import { PageHeader, Btn, Badge, Modal, Field, Input, Select, SearchBar, EmptyState } from '../UI'

const COUNTRIES = ['Ethiopia', 'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Nigeria', 'Ghana', 'South Africa', 'Other']
const SECTORS = ['Health', 'Education', 'Agriculture', 'Governance', 'Finance', 'Infrastructure', 'Environment', 'M&E']
const SERVICES = ['Advisory', 'Capacity Building', 'Research', 'Monitoring & Evaluation', 'Implementation', 'Consulting', 'Training']
const EMPTY = { title: '', client: '', country: '', sector: '', services: '', startDate: '', endDate: '', value: '', teamSize: '', description: '' }

export default function FirmExperiences() {
    const [experiences, setExperiences] = useState([])
    const [search, setSearch] = useState('')
    const [countryFilter, setCountryFilter] = useState('All Countries')
    const [sectorFilter, setSectorFilter] = useState('All Sectors')
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])
    const fetchData = () => axios.get('/api/experiences').then(r => { setExperiences(r.data); setLoading(false) }).catch(err => { console.error('Error fetching experiences:', err); setLoading(false) })

    const filtered = experiences.filter(e => {
        if (search && !e.title?.toLowerCase().includes(search.toLowerCase()) && !e.client?.toLowerCase().includes(search.toLowerCase())) return false
        if (countryFilter !== 'All Countries' && e.country !== countryFilter) return false
        if (sectorFilter !== 'All Sectors' && e.sector !== sectorFilter) return false
        return true
    })

    const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
    const openEdit = e => { setForm({ ...e }); setEditId(e.id); setModal(true) }
    const save = async () => {
        if (!form.title.trim()) return
        if (editId) await axios.put(`/api/experiences/${editId}`, form)
        else await axios.post('/api/experiences', form)
        setModal(false); fetchData()
    }
    const remove = async id => {
        if (confirm('Delete this experience?')) { await axios.delete(`/api/experiences/${id}`); fetchData() }
    }
    const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))

    if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>Loading...</div>

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <PageHeader icon="📖" title="Firm Experiences" subtitle={`${filtered.length} of ${experiences.length} projects`}>
                <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, client..." />
                <Select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
                    <option>All Countries</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </Select>
                <Select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}>
                    <option>All Sectors</option>
                    {SECTORS.map(s => <option key={s}>{s}</option>)}
                </Select>
                <Btn onClick={fetchData} variant="secondary">↻</Btn>
                <Btn onClick={openAdd}>+ Add Experience</Btn>
            </PageHeader>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {filtered.length === 0
                    ? <EmptyState icon="📖" message="No experiences found" />
                    : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                            {filtered.map(e => (
                                <div key={e.id} style={{ background: '#141720', border: '1px solid #2d3748', borderRadius: 10, padding: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', flex: 1, marginRight: 8, lineHeight: 1.4 }}>{e.title}</div>
                                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                                            <span onClick={() => openEdit(e)} style={{ cursor: 'pointer', fontSize: 14 }}>✏️</span>
                                            <span onClick={() => remove(e.id)} style={{ cursor: 'pointer', fontSize: 14 }}>🗑️</span>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#718096', marginBottom: 10 }}>{e.client}</div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                        {e.sector && <Badge color="blue">{e.sector}</Badge>}
                                        {e.country && <Badge color="gray">{e.country}</Badge>}
                                        {e.services && <Badge color="purple">{e.services}</Badge>}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#718096' }}>
                                        {(e.startDate || e.endDate) && <div>📅 {e.startDate} {e.endDate ? `→ ${e.endDate}` : ''}</div>}
                                        {e.value && <div>💰 {e.value}</div>}
                                        {e.teamSize && <div>👥 Team: {e.teamSize}</div>}
                                    </div>
                                    {e.description && <div style={{ marginTop: 8, fontSize: 12, color: '#a0aec0', lineHeight: 1.5, borderTop: '1px solid #2d3748', paddingTop: 8 }}>{e.description.slice(0, 120)}{e.description.length > 120 ? '...' : ''}</div>}
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>

            {modal && (
                <Modal title={editId ? 'Edit Experience' : 'Add Experience'} onClose={() => setModal(false)}>
                    <Field label="Project Title *"><Input value={form.title} onChange={f('title')} placeholder="Project title" /></Field>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Client"><Input value={form.client} onChange={f('client')} placeholder="Client / Donor" /></Field>
                        <Field label="Country"><Select value={form.country} onChange={f('country')} style={{ width: '100%' }}><option value="">—</option>{COUNTRIES.map(c => <option key={c}>{c}</option>)}</Select></Field>
                        <Field label="Sector"><Select value={form.sector} onChange={f('sector')} style={{ width: '100%' }}><option value="">—</option>{SECTORS.map(s => <option key={s}>{s}</option>)}</Select></Field>
                        <Field label="Services"><Select value={form.services} onChange={f('services')} style={{ width: '100%' }}><option value="">—</option>{SERVICES.map(s => <option key={s}>{s}</option>)}</Select></Field>
                        <Field label="Start Date"><Input type="date" value={form.startDate} onChange={f('startDate')} /></Field>
                        <Field label="End Date"><Input type="date" value={form.endDate} onChange={f('endDate')} /></Field>
                        <Field label="Contract Value"><Input value={form.value} onChange={f('value')} placeholder="e.g. $500,000" /></Field>
                        <Field label="Team Size"><Input value={form.teamSize} onChange={f('teamSize')} placeholder="e.g. 5" /></Field>
                    </div>
                    <Field label="Description"><textarea value={form.description} onChange={f('description')} placeholder="Project description..." style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3748', borderRadius: 7, padding: '8px 10px', color: '#e2e8f0', fontSize: 13, resize: 'vertical', minHeight: 80, outline: 'none', boxSizing: 'border-box' }} /></Field>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
                        <Btn onClick={save}>{editId ? 'Save Changes' : 'Add Experience'}</Btn>
                    </div>
                </Modal>
            )}
        </div>
    )
}