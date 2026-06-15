import mongoose from 'mongoose'

const ExpertSchema = new mongoose.Schema({
    name: { type: String, required: true },
    title: String,
    expertType: String,
    specialization: String,
    country: String,
    email: String,
    phone: String,
    yearsExp: String,
    notes: String,
}, { timestamps: true })

export default mongoose.models.Expert || mongoose.model('Expert', ExpertSchema)