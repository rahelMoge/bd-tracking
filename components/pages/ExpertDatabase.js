import { useState, useEffect } from 'react'
import axios from 'axios'
import { PageHeader, Btn, Badge, Modal, Field, Input, Select, SearchBar, EmptyState } from '../UI'

const EXPERT_TYPES = ['Senior Expert', 'Junior Expert', 'Team Leader', 'Specialist', 'Consultant']
const COUNTRIES = ['Ethiopia', 'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Nigeria', 'Ghana', 'South Africa', 'Other']
const SPECIALIZATIONS = ['Health', 'Education', 'Agriculture', 'Governance', 'Finance', 'M&E', 'Research', 'Capacity Building']
const EMPTY = { name: '', title: '', expertType: 'Consultant', specialization: '', country: '', email: '', phone: '', yearsExp: '', notes: '' }

export default function ExpertDatabase() {
    const [experts, setExperts] = useState([])
    const [search, setSearch] = useState('')
    const [countryFilter, setCountryFilter] = useState('All Countries')
    const [typeFilter, setTypeFilter] = useState('All Experts')
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])

    const fetchData = () => axios.get('/api/experts').then(r => { setExperts(r.data); setLoading(false) })

    const filtered = experts.filter(e => {
        if (search && !e.name?.toLowerCase().includes(search.toLowerCase()) && !e.specialization?.toLowerCase().includes(search.toLowerCase())) return false
        if (countryFilter !== 'All Countries' && e.country !== countryFilter) return false
        if (typeFilter !== 'All Experts' && e.expertType !== typeFilter) return false
        return true
    })

    const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
    const openEdit = e => { setForm({ ...e }); setEditId(e.id); setModal(true) }
    const save = async () => {
        if (!form.name.trim()) return
        if (editId) await axios.put(`/api/experts/${editId}`, form)
        else await axios.post('/api/experts', form)
        setModal(false); fetchData()
    }
    const remove = async id => {
        if (confirm('Delete this expert?')) { await axios.delete(`/api/experts/${id}`); fetchData() }
    }
    const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
    const initials = name => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??'
    const avatarColor = name => { const colors = ['#3b5bdb', '#805ad5', '#2c7a7b', '#276749', '#b7791f']; return colors[(name?.charCodeAt(0) || 0) % colors.length] }

    if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>Loading...</div>

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <PageHeader icon="👤" title="Expert Database" subtitle={`${filtered.length} of ${experts.length} experts`}>
                <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, specialization..." />
                <Select value={countryFilter} onChange={e => setCountryFilter(e.target.value)}>
                    <option>All Countries</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                </Select>
                <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                    <option>All Experts</option>
                    {EXPERT_TYPES.map(t => <option key={t}>{t}</option>)}
                </Select>
                <Btn onClick={fetchData} variant="secondary">↻</Btn>
                <Btn onClick={openAdd}>+ Add Expert</Btn>
            </PageHeader>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                {filtered.length === 0
                    ? <EmptyState icon="👤" message="No experts found" />
                    : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                            {filtered.map(e => (
                                <div key={e.id} style={{ background: '#141720', border: '1px solid #2d3748', borderRadius: 10, padding: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarColor(e.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{initials(e.name)}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
                                            <div style={{ fontSize: 12, color: '#718096' }}>{e.title || e.expertType}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <span onClick={() => openEdit(e)} style={{ cursor: 'pointer', fontSize: 14 }}>✏️</span>
                                            <span onClick={() => remove(e.id)} style={{ cursor: 'pointer', fontSize: 14 }}>🗑️</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                        {e.specialization && <Badge color="blue">{e.specialization}</Badge>}
                                        {e.expertType && <Badge color="purple">{e.expertType}</Badge>}
                                    </div>
                                    <div style={{ fontSize: 12, color: '#718096' }}>
                                        {e.country && <div>📍 {e.country}</div>}
                                        {e.email && <div>✉️ {e.email}</div>}
                                        {e.yearsExp && <div>⏱ {e.yearsExp} yrs exp</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>

            {modal && (
                <Modal title={editId ? 'Edit Expert' : 'Add Expert'} onClose={() => setModal(false)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Full Name *"><Input value={form.name} onChange={f('name')} placeholder="Full name" /></Field>
                        <Field label="Title"><Input value={form.title} onChange={f('title')} placeholder="e.g. Senior Consultant" /></Field>
                        <Field label="Expert Type"><Select value={form.expertType} onChange={f('expertType')} style={{ width: '100%' }}>{EXPERT_TYPES.map(t => <option key={t}>{t}</option>)}</Select></Field>
                        <Field label="Specialization"><Select value={form.specialization} onChange={f('specialization')} style={{ width: '100%' }}><option value="">—</option>{SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}</Select></Field>
                        <Field label="Country"><Select value={form.country} onChange={f('country')} style={{ width: '100%' }}><option value="">—</option>{COUNTRIES.map(c => <option key={c}>{c}</option>)}</Select></Field>
                        <Field label="Years of Experience"><Input value={form.yearsExp} onChange={f('yearsExp')} placeholder="e.g. 10" /></Field>
                        <Field label="Email"><Input value={form.email} onChange={f('email')} placeholder="email@example.com" /></Field>
                        <Field label="Phone"><Input value={form.phone} onChange={f('phone')} placeholder="+251..." /></Field>
                    </div>
                    <Field label="Notes"><textarea value={form.notes} onChange={f('notes')} placeholder="Skills, availability..." style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3748', borderRadius: 7, padding: '8px 10px', color: '#e2e8f0', fontSize: 13, resize: 'vertical', minHeight: 60, outline: 'none', boxSizing: 'border-box' }} /></Field>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
                        <Btn onClick={save}>{editId ? 'Save Changes' : 'Add Expert'}</Btn>
                    </div>
                </Modal>
            )}
        </div>
    )
}