import mongoose from 'mongoose'

const PartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: String,
    country: String,
    email: String,
    contactPerson: String,
    phone: String,
    sector: String,
    status: { type: String, default: 'Active' },
    notes: String,
}, { timestamps: true })

export default mongoose.models.Partner || mongoose.model('Partner', PartnerSchema)