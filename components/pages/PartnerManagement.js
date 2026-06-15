import { useState, useEffect } from 'react'
import axios from 'axios'
import { PageHeader, Btn, Badge, Modal, Field, Input, Select, SearchBar, EmptyState } from '../UI'

const PARTNER_TYPES = ['Implementing Partner', 'Sub-contractor', 'Associate', 'Consortium Member', 'Local Partner']
const COUNTRIES = ['Ethiopia', 'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Nigeria', 'Ghana', 'South Africa', 'Other']
const EMPTY = { name: '', type: 'Implementing Partner', country: '', email: '', contactPerson: '', phone: '', sector: '', status: 'Active', notes: '' }

export default function PartnerManagement() {
    const [partners, setPartners] = useState([])
    const [tab, setTab] = useState('external')
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editId, setEditId] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchData() }, [])
    const fetchData = () => axios.get('/api/partners').then(r => { setPartners(r.data); setLoading(false) })

    const filtered = partners.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()))

    const openAdd = () => { setForm(EMPTY); setEditId(null); setModal(true) }
    const openEdit = p => { setForm({ ...p }); setEditId(p.id); setModal(true) }
    const save = async () => {
        if (!form.name.trim()) return
        if (editId) await axios.put(`/api/partners/${editId}`, form)
        else await axios.post('/api/partners', form)
        setModal(false); fetchData()
    }
    const remove = async id => {
        if (confirm('Delete this partner?')) { await axios.delete(`/api/partners/${id}`); fetchData() }
    }
    const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
    const initials = name => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??'
    const avatarColor = name => { const colors = ['#276749', '#3b5bdb', '#805ad5', '#b7791f', '#2c7a7b']; return colors[(name?.charCodeAt(0) || 0) % colors.length] }

    if (loading) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096' }}>Loading...</div>

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <PageHeader icon="🤝" title="Partner Management" subtitle="Manage external partners and inbound partner requests">
                <Btn onClick={fetchData} variant="secondary">↻</Btn>
            </PageHeader>

            <div style={{ padding: '12px 24px 0', borderBottom: '1px solid #2d3748', display: 'flex', gap: 6, flexShrink: 0 }}>
                {[['external', `External Partners (${partners.length})`], ['requests', 'Partner Requests (0)']].map(([id, label]) => (
                    <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? '#e2e8f0' : 'none', color: tab === id ? '#0f1117' : '#a0aec0', border: 'none', borderRadius: '7px 7px 0 0', padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontWeight: tab === id ? 600 : 400, marginBottom: -1 }}>
                        {label}
                    </button>
                ))}
            </div>

            {tab === 'external' && (
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 24px', display: 'flex', gap: 8, borderBottom: '1px solid #2d3748', flexShrink: 0 }}>
                        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners..." />
                        <Btn onClick={openAdd}>+ Add Partner</Btn>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                        {filtered.length === 0
                            ? <EmptyState icon="🤝" message="No partners yet." />
                            : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                                    {filtered.map(p => (
                                        <div key={p.id} style={{ background: '#141720', border: '1px solid #2d3748', borderRadius: 10, padding: 16 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                                                <div style={{ width: 38, height: 38, borderRadius: '50%', background: avatarColor(p.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{initials(p.name)}</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                                    <div style={{ fontSize: 12, color: '#718096' }}>{p.contactPerson}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <span onClick={() => openEdit(p)} style={{ cursor: 'pointer', fontSize: 14 }}>✏️</span>
                                                    <span onClick={() => remove(p.id)} style={{ cursor: 'pointer', fontSize: 14 }}>🗑️</span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                                                <Badge color="blue">{p.type}</Badge>
                                                <Badge color={p.status === 'Active' ? 'green' : 'gray'}>{p.status}</Badge>
                                            </div>
                                            <div style={{ fontSize: 12, color: '#718096' }}>
                                                {p.country && <div>📍 {p.country}</div>}
                                                {p.email && <div>✉️ {p.email}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        }
                    </div>
                </div>
            )}

            {tab === 'requests' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                    <EmptyState icon="📬" message="No partner requests yet." />
                </div>
            )}

            {modal && (
                <Modal title={editId ? 'Edit Partner' : 'Add Partner'} onClose={() => setModal(false)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Organization Name *"><Input value={form.name} onChange={f('name')} placeholder="Organization name" /></Field>
                        <Field label="Partner Type"><Select value={form.type} onChange={f('type')} style={{ width: '100%' }}>{PARTNER_TYPES.map(t => <option key={t}>{t}</option>)}</Select></Field>
                        <Field label="Contact Person"><Input value={form.contactPerson} onChange={f('contactPerson')} placeholder="Primary contact" /></Field>
                        <Field label="Email"><Input value={form.email} onChange={f('email')} placeholder="email@org.com" /></Field>
                        <Field label="Phone"><Input value={form.phone} onChange={f('phone')} placeholder="+251..." /></Field>
                        <Field label="Country"><Select value={form.country} onChange={f('country')} style={{ width: '100%' }}><option value="">—</option>{COUNTRIES.map(c => <option key={c}>{c}</option>)}</Select></Field>
                        <Field label="Status"><Select value={form.status} onChange={f('status')} style={{ width: '100%' }}><option>Active</option><option>Inactive</option><option>Pending</option></Select></Field>
                        <Field label="Sector"><Input value={form.sector} onChange={f('sector')} placeholder="e.g. Health" /></Field>
                    </div>
                    <Field label="Notes"><textarea value={form.notes} onChange={f('notes')} placeholder="Notes..." style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3748', borderRadius: 7, padding: '8px 10px', color: '#e2e8f0', fontSize: 13, resize: 'vertical', minHeight: 60, outline: 'none', boxSizing: 'border-box' }} /></Field>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Btn variant="secondary" onClick={() => setModal(false)}>Cancel</Btn>
                        <Btn onClick={save}>{editId ? 'Save Changes' : 'Add Partner'}</Btn>
                    </div>
                </Modal>
            )}
        </div>
    )
}