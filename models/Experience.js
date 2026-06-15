import mongoose from 'mongoose'

const ExperienceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    client: String,
    country: String,
    sector: String,
    services: String,
    startDate: String,
    endDate: String,
    value: String,
    teamSize: String,
    description: String,
}, { timestamps: true })

export default mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema)