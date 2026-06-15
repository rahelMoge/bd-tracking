import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Dashboard from '../components/pages/Dashboard'
import OpportunityTracker from '../components/pages/OpportunityTracker'
import ProposalPipeline from '../components/pages/ProposalPipeline'
import ExpertDatabase from '../components/pages/ExpertDatabase'
import FirmExperiences from '../components/pages/FirmExperiences'
import PartnerManagement from '../components/pages/PartnerManagement'
import StrategicAnalytics from '../components/pages/StrategicAnalytics'

const PAGES = {
  dashboard: Dashboard,
  opportunities: OpportunityTracker,
  pipeline: ProposalPipeline,
  experts: ExpertDatabase,
  experiences: FirmExperiences,
  partners: PartnerManagement,
  analytics: StrategicAnalytics,
}

export default function Home() {
  const [activePage, setActivePage] = useState('dashboard')
  const PageComponent = PAGES[activePage]

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#0f1117',
      overflow: 'hidden'
    }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageComponent navigate={setActivePage} />
      </div>
    </div>
  )
}