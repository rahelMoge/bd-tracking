import mongoose from 'mongoose'

const OpportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  client: String,
  stage: {
    type: String,
    enum: ['TOR Collection','Under Review','Qualification Review','Decision Pending','Bid Preparation','Submitted','Won','Lost'],
    default: 'TOR Collection'
  },
  deadline: String,
  proposalType: String,
  serviceCategory: String,
  strategicFit: { type: String, enum: ['High','Med','Low'] },
  bidDecision: { type: String, enum: ['BID','NO-BID','Not Decided'], default: 'Not Decided' },
  sector: String,
  country: String,
  collectedBy: String,
  notes: String,
}, { timestamps: true })

export default mongoose.models.Opportunity || mongoose.model('Opportunity', OpportunitySchema)