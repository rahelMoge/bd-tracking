import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { PageHeader, Btn, Badge, Modal, Field, Input, Select, SearchBar, EmptyState } from '../UI'

const EXPERT_TYPES = ['Senior Expert', 'Junior Expert', 'Team Leader', 'Specialist', 'Consultant', 'Professor', 'Researcher', 'Advisor']
const COUNTRIES = ['Ethiopia', 'Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Nigeria', 'Ghana', 'South Africa', 'Other']
const SPECIALIZATIONS = [
    'Agriculture', 'Agronomy', 'Animal Science', 'Anthropometry',
    'Biodiversity', 'Civil Engineering', 'Climate Change', 'Communication',
    'Computer Science', 'Digital Learning', 'Economics', 'Education',
    'Environment', 'Finance', 'Forestry', 'Gender', 'GIS', 'Health',
    'Human Resource', 'Hydraulic Engineering', 'Irrigation', 'Land Governance',
    'Livestock', 'Logistics', 'M&E', 'Natural Resource Management',
    'Nutrition', 'Plant Science', 'Political Science', 'Procurement',
    'Public Health', 'Research', 'Social Development', 'WASH', 'Water Management'
]

// ── All 53 experts from the Ethiopian Key Experts CV document ──
const SEED_EXPERTS = [
    { sn: 1, name: 'Kifle Semu Sima', expertType: 'Senior Expert', specialization: 'Civil Engineering', country: 'Ethiopia', email: 'kiflesemusima@gmail.com', phone: '+251911489050', yearsExp: '30+', priorExperience: 'No', researchInterest: 'Engineer', summary: 'Senior professional in project management, specializing in contract, procurement, and claims. PhD in Project Management, MBA, BSc Civil Engineering. Over 30 years of experience.' },
    { sn: 2, name: 'Belay Simane (PhD)', expertType: 'Professor', specialization: 'Environment', country: 'Ethiopia', email: '', phone: '+251911223044', yearsExp: '25+', priorExperience: 'Yes', researchInterest: 'Environmental Science', summary: 'Associate Professor at Addis Ababa University. PhD from Wageningen Agricultural University. Expert in climate change, natural resources, agronomy, and biodiversity.' },
    { sn: 3, name: 'Azeb Adefrsew', expertType: 'Consultant', specialization: 'Gender', country: 'Ethiopia', email: 'azebad@gmail.com', phone: '', yearsExp: '35+', priorExperience: 'Yes', researchInterest: 'Gender Expert', summary: 'Highly experienced social protection consultant. Over 35 years in participatory evaluation, research, KAP surveys, child protection, and VACW.' },
    { sn: 4, name: 'Chalachew Tiruneh', expertType: 'Specialist', specialization: 'Public Health', country: 'Ethiopia', email: 'chalayehu@gmail.com', phone: '+260960281604', yearsExp: '', priorExperience: 'No', researchInterest: 'Public Health', summary: 'MBA candidate at South Wales University UK. Master of Public Health, BSc Environmental Health. Experience in HIV prevention project leadership.' },
    { sn: 5, name: 'Ephraim Alamerew', expertType: 'Senior Expert', specialization: 'Water Management', country: 'Ethiopia', email: 'bephraima@gmail.com', phone: '+251993487464', yearsExp: '30+', priorExperience: 'No', researchInterest: 'Water and Soil Engineering', summary: 'MSc in Soil and Water Engineering with 30+ years in NRM, WASH, food security, and multilateral agency programs (WB, UNDP, UNICEF, GIZ, EU).' },
    { sn: 6, name: 'Fentaw Abegaz', expertType: 'Senior Expert', specialization: 'Irrigation', country: 'Ethiopia', email: '', phone: '', yearsExp: '', priorExperience: 'Yes', researchInterest: 'Irrigation Expert', summary: 'Freelance consultant in Integrated Water Resource Management. PhD in Water Resource Management. Experience in Ethiopia, Rwanda, and Botswana.' },
    { sn: 7, name: 'Dawit Mekonnen (PhD)', expertType: 'Professor', specialization: 'Education', country: 'Ethiopia', email: 'dawit.mm2@gmail.com', phone: '', yearsExp: '', priorExperience: 'Yes', researchInterest: 'Education Expert', summary: 'Team Leader and Associate Professor at Addis Ababa University. PhD in Education. Experience in Ethiopia, Uganda, South Sudan, and Malawi.' },
    { sn: 8, name: 'Abuhay Takele (PhD)', expertType: 'Senior Expert', specialization: 'Agriculture', country: 'Ethiopia', email: 'kidumet94@gmail.com', phone: '+251911677373', yearsExp: '36+', priorExperience: 'No', researchInterest: 'Agronomy Expert', summary: 'Senior Agronomist with 36+ years in agronomy, soil-plant water relationships, cropping systems. PhD in Botany from University of Cape Town.' },
    { sn: 9, name: 'Emebet Mulugeta', expertType: 'Specialist', specialization: 'Social Development', country: 'Ethiopia', email: '', phone: '+251911203692', yearsExp: '', priorExperience: 'Yes', researchInterest: 'Gender Expert', summary: 'PhD in Social Work and Social Development. Expert in child protection, child justice, social work, and program design. Assistant Professor at AAU.' },
    { sn: 10, name: 'Endale Nigussie', expertType: 'Researcher', specialization: 'Political Science', country: 'Ethiopia', email: 'enigussie272727@gmail.com', phone: '+251911435763', yearsExp: '', priorExperience: 'No', researchInterest: 'Political Science', summary: 'PhD student at Addis Ababa University specializing in human rights. MA in International Relations, BA in Political Science. Lecturer in Diplomacy.' },
    { sn: 11, name: 'Kefyalew Tadesse', expertType: 'Advisor', specialization: 'Economics', country: 'Ethiopia', email: '', phone: '', yearsExp: '10+', priorExperience: 'No', researchInterest: 'Trainer Advisor', summary: 'Assistant Professor of Business Management and Finance at Ambo University. PhD in Business Management (Finance). 10+ years in entrepreneurship training.' },
    { sn: 12, name: 'Mekbeb Eshetu (PhD)', expertType: 'Senior Expert', specialization: 'Natural Resource Management', country: 'Ethiopia', email: 'mekbebt@gmail.com', phone: '+251935346611', yearsExp: '20+', priorExperience: 'Yes', researchInterest: 'Land Governance', summary: '20+ years in wildlife conservation and protected areas management. Experience managing USAID and UNDP projects in South Sudan and Ethiopia.' },
    { sn: 13, name: 'Mellese Damtie (PhD)', expertType: 'Specialist', specialization: 'Biodiversity', country: 'Ethiopia', email: '', phone: '+251911171687', yearsExp: '', priorExperience: 'Yes', researchInterest: 'Biodiversity', summary: 'Environmental Law Expert. PhD in Environmental Law. Instructor at Addis Ababa University. Consultant for GIZ in land use planning and biodiversity directives.' },
    { sn: 14, name: 'Prof. Afework Mulugeta', expertType: 'Professor', specialization: 'Nutrition', country: 'Ethiopia', email: '', phone: '', yearsExp: '', priorExperience: 'Yes', researchInterest: 'Nutrition Expert', summary: 'Professor of Nutrition at Mekelle University. PhD in Nutritional Sciences from Oklahoma State University. Editor-in-Chief, East African Journal of Health Sciences.' },
    { sn: 15, name: 'Tamirat Tefera (PhD)', expertType: 'Senior Expert', specialization: 'Environment', country: 'Ethiopia', email: 'tamirat1995@yahoo.com', phone: '+251911114567', yearsExp: '', priorExperience: 'Yes', researchInterest: 'Environmental Expert', summary: 'PhD holder involved in environmental and social management systems, climate action, agricultural growth programs. Consultant for World Bank, UNICEF, USAID.' },
    { sn: 16, name: 'Zelalem Bayisa (PhD)', expertType: 'Professor', specialization: 'Human Resource', country: 'Ethiopia', email: '', phone: '', yearsExp: '20+', priorExperience: 'Yes', researchInterest: 'Human Resource Management', summary: 'Entrepreneurship Skills Trainer with 20+ years. PhD in HRM from University of KwaZulu-Natal. Assistant Professor at Addis Ababa University School of Commerce.' },
    { sn: 17, name: 'Ambissa Kenea (PhD)', expertType: 'Senior Expert', specialization: 'Education', country: 'Ethiopia', email: 'kenea2004@yahoo.com', phone: '0967453314', yearsExp: '22+', priorExperience: 'No', researchInterest: 'Education Expert', summary: 'Senior Researcher with 22+ years. PhD in Education. MA in Curriculum and Instruction. Member of national Professional Advisory Council.' },
    { sn: 18, name: 'Tamirie Andualem', expertType: 'Professor', specialization: 'Education', country: 'Ethiopia', email: 'tamirieand@yahoo.com', phone: '0911405837', yearsExp: '', priorExperience: 'No', researchInterest: 'Education Expert', summary: 'Associate Professor of Applied Developmental Psychology at Addis Ababa University. PhD in Developmental Psychology. Teaching since 2003.' },
    { sn: 19, name: 'Hailegiorgis Feleke Faris', expertType: 'Senior Expert', specialization: 'Education', country: 'Ethiopia', email: 'hailegiorgisfeleke@yahoo.com', phone: '0911677669', yearsExp: '22+', priorExperience: 'Yes', researchInterest: 'Education Expert', summary: 'Curriculum and Learning Materials Development Unit Head. MA in Educational Planning and Management. Experience at Ministry of Education.' },
    { sn: 20, name: 'Dereje Taye (PhD)', expertType: 'Senior Expert', specialization: 'Education', country: 'Ethiopia', email: 'tefera.tadesse@aau.edu.et', phone: '+251917801007', yearsExp: '', priorExperience: 'Yes', researchInterest: 'Education Expert', summary: 'Team leader with expertise in education and research. PhD in Teacher Development. Dean of Faculty of Educational and Behavioral Sciences, Bahir Dar University.' },
    { sn: 21, name: 'Alemu Yami', expertType: 'Senior Expert', specialization: 'Agriculture', country: 'Ethiopia', email: '', phone: '+251911369274', yearsExp: '30+', priorExperience: 'Yes', researchInterest: 'Animal Nutrition', summary: 'Team Leader with 30+ years of experience. PhD in Animal Nutrition from University of Goettingen, Germany. MSc in Animal Production from AAU.' },
    { sn: 22, name: 'Amin Abedela', expertType: 'Senior Expert', specialization: 'Economics', country: 'Ethiopia', email: '', phone: '+251925763420', yearsExp: '', priorExperience: 'Yes', researchInterest: 'PPP Expert', summary: 'PPP expert and team leader. PhD candidate in Development Studies (UNISA). MSc in Economics from Addis Ababa University.' },
    { sn: 23, name: 'Girma Gebremedhin (PhD)', expertType: 'Senior Expert', specialization: 'Agriculture', country: 'Ethiopia', email: 'ggmedhin@yahoo.com', phone: '', yearsExp: '', priorExperience: 'Yes', researchInterest: 'Agricultural Economist', summary: 'Deputy Team Leader. PhD in Agriculture from Bonn University. Team Leader for KFW/GITEC Baseline Survey for Sustainable Land Management Project.' },
    { sn: 24, name: 'Wassie Berhanu (PhD)', expertType: 'Professor', specialization: 'Economics', country: 'Ethiopia', email: 'wbpresearch@yahoo.co.uk', phone: '+251965130634', yearsExp: '', priorExperience: 'No', researchInterest: 'Economist', summary: 'Associate Professor at AAU Department of Economics. PhD in Economic Studies from University of Manchester. Expert in economic development and agriculture.' },
    { sn: 25, name: 'Tewodros Negash', expertType: 'Specialist', specialization: 'Communication', country: 'Ethiopia', email: 'tewodros.negash@gmail.com', phone: '+251911422991', yearsExp: '', priorExperience: 'No', researchInterest: 'Communication Expert', summary: 'MA in International Cooperation and Humanitarian Aid; MA in Sociology. Expert in humanitarian programming, media development, and conflict analysis.' },
    { sn: 26, name: 'Dereje Kebede', expertType: 'Consultant', specialization: 'Environment', country: 'Ethiopia', email: 'dereje.kebede@gmail.com', phone: '0913442649', yearsExp: '', priorExperience: 'No', researchInterest: 'Environment and Climate Change', summary: 'MSc in Environmental Management (UNISA), MSc in Mechanical Engineering (University of Tennessee). Specialist in renewable energy and gender integration.' },
    { sn: 27, name: 'Dawit Asrat (PhD)', expertType: 'Specialist', specialization: 'Education', country: 'Ethiopia', email: '', phone: '+251918766232', yearsExp: '', priorExperience: 'Yes', researchInterest: 'Education Expert', summary: 'Education Specialist with PhD in Learning Sciences from McGill University. Assistant Professor at Bahir Dar University. Expert in educational program evaluation.' },
    { sn: 28, name: 'Dawit Belew (PhD)', expertType: 'Senior Expert', specialization: 'Public Health', country: 'Ethiopia', email: '', phone: '+251911405559', yearsExp: '', priorExperience: 'Yes', researchInterest: 'Public Health/WASH', summary: 'Evaluation Expert and WaSH Specialist. Medical Doctor with MPH from AAU School of Public Health. Experience in Ethiopia, Uganda, South Sudan, and Malawi.' },
    { sn: 29, name: 'Abebe Wolde-amanuel', expertType: 'Senior Expert', specialization: 'Civil Engineering', country: 'Ethiopia', email: '', phone: '+251910805746', yearsExp: '40+', priorExperience: 'No', researchInterest: 'Civil Engineer', summary: 'Civil engineer with 40+ years of experience in hydraulic structures and irrigation systems. Postgraduate diploma in upland hydraulic engineering.' },
    { sn: 30, name: 'Amsalu Ayana (PhD)', expertType: 'Professor', specialization: 'Agriculture', country: 'Ethiopia', email: 'aga.amsaluayana@gmail.com', phone: '+25191184221', yearsExp: '40+', priorExperience: 'No', researchInterest: 'Plant Science', summary: 'PhD, MSc and BSc in Biology/Agriculture. 40 years of experience in seed systems, crop research, and plant breeding. Guest professor at multiple Ethiopian universities.' },
    { sn: 31, name: 'Aramde Fetene', expertType: 'Specialist', specialization: 'Forestry', country: 'Ethiopia', email: 'aramde74@gmail.com', phone: '+251911429504', yearsExp: '25+', priorExperience: 'No', researchInterest: 'Forestry', summary: 'PhD in Environmental Planning, MSc in Farm Forestry, BSc in Forestry. 25 years in NRM, biodiversity, land use planning, and reforestation programs.' },
    { sn: 32, name: 'Dareskedar Taye (PhD)', expertType: 'Researcher', specialization: 'Political Science', country: 'Ethiopia', email: 'darutaye@gmail.com', phone: '+251940712513', yearsExp: '', priorExperience: 'No', researchInterest: 'Political Science', summary: 'PhD in Political Science from AAU. MA in International Relations. Experience as Director of International Relations and Political Analyst.' },
    { sn: 33, name: 'Gizaw Ebissa', expertType: 'Specialist', specialization: 'Environment', country: 'Ethiopia', email: '', phone: '', yearsExp: '', priorExperience: 'No', researchInterest: 'Environmental Science', summary: 'PhD Candidate in Environmental Sciences at AAU. Environmental Auditor for Rainforest Alliance. Technical Manager at Green Environmental Consultancy Service PLC.' },
    { sn: 34, name: 'Melaku Mengistu (PhD)', expertType: 'Professor', specialization: 'Education', country: 'Ethiopia', email: '', phone: '+251933919932', yearsExp: '', priorExperience: 'No', researchInterest: 'Education', summary: 'PhD in Educational Policy and Leadership from AAU. Associate Professor at Bahir Dar University. Expert in TVET policy and management.' },
    { sn: 35, name: 'Teshome Demissie', expertType: 'Senior Expert', specialization: 'GIS', country: 'Ethiopia', email: 'teshe8700@gmail.com', phone: '0911545278', yearsExp: '', priorExperience: 'Yes', researchInterest: 'GIS Expert', summary: 'GIS and Remote Sensing specialist with expertise in watershed planning, land use, participatory 3D GIS Modeling, and agricultural technology promotion.' },
    { sn: 36, name: 'Getaneh Gobezie', expertType: 'Senior Expert', specialization: 'Economics', country: 'Ethiopia', email: 'getanehg2002@yahoo.com', phone: '+251911092033', yearsExp: '20+', priorExperience: 'Yes', researchInterest: 'Economics Policy Expert', summary: '20+ years in rural development, micro and small enterprise, gender economic empowerment. MSc in Economic Policy Analysis. Worked with CRS, CARE, IFAD, SNV, O×fam.' },
    { sn: 37, name: 'Gizaw Desta', expertType: 'Researcher', specialization: 'Water Management', country: 'Ethiopia', email: 'desta.gizaw@yahoo.com', phone: '+251912860328', yearsExp: '20+', priorExperience: 'No', researchInterest: 'Land/Water/Natural Resource Management', summary: 'Land and water management engineer. 20+ years in soil and water conservation, integrated water management, and landscape restoration. Scientist at ICRISAT.' },
    { sn: 38, name: 'Melkamu Kifetew', expertType: 'Specialist', specialization: 'Environment', country: 'Ethiopia', email: 'melkam1703@gmail.com', phone: '+251966719835', yearsExp: '', priorExperience: 'No', researchInterest: 'Environmentalist', summary: 'PhD candidate in Environmental Engineering. MSc in Environmental Sciences. Environmentalist at Metaferia Consulting Engineers. Expertise in EIA and environmental audits.' },
    { sn: 39, name: 'Tsegaye Gebremedihin', expertType: 'Consultant', specialization: 'Digital Learning', country: 'Ethiopia', email: 'tsegishgm@yahoo.com', phone: '', yearsExp: '', priorExperience: 'No', researchInterest: 'Digital Learning Expert', summary: 'MSc in Information Science from AAU. Knowledge Management Consultant for UNECA Land Policy Initiatives. Develops web-based knowledge management platforms.' },
    { sn: 40, name: 'Wondwosen Mulugeta', expertType: 'Professor', specialization: 'Computer Science', country: 'Ethiopia', email: 'wondwossen.mulugeta@aau.edu.et', phone: '+251911607338', yearsExp: '', priorExperience: 'No', researchInterest: 'Computer Science and Digital Learning', summary: 'PhD in IT from AAU. Assistant Professor and Director for Academic Staff Affairs at AAU. Lead Consultant for Integrated Library and Records Management System.' },
    { sn: 41, name: 'Fitsum Alemayehu', expertType: 'Specialist', specialization: 'Agriculture', country: 'Ethiopia', email: 'fitsumcvm@gmail.com', phone: '+251911646165', yearsExp: '', priorExperience: 'No', researchInterest: 'Veterinary Medicine/Animal Science', summary: 'MVSc in Veterinary Virology (Indian Veterinary Research Institute). Lecturer and researcher at Haramaya University. Consultant for multiple organizations.' },
    { sn: 42, name: 'Tegegnework Mekonnen', expertType: 'Senior Expert', specialization: 'Livestock', country: 'Ethiopia', email: 'teg_ark@yahoo.com', phone: '+251986881609', yearsExp: '20+', priorExperience: 'No', researchInterest: 'Animal Science/Livestock Trade', summary: 'Doctor of Veterinary Medicine from AAU. 20+ years of experience. Director for Quarantine Import-Export Inspection at Ministry of Agriculture.' },
    { sn: 43, name: 'Getachew Gebre', expertType: 'Senior Expert', specialization: 'Finance', country: 'Ethiopia', email: 'getachewgb@gmail.com', phone: '', yearsExp: '', priorExperience: 'Yes', researchInterest: 'Public Finance/Procurement', summary: 'MBA Finance from Open University Business School London. MA Economics from North Eastern University Boston. Former State Minister rank General Manager, Government of Ethiopia.' },
    { sn: 44, name: 'Fasil Woldemichael', expertType: 'Specialist', specialization: 'Communication', country: 'Ethiopia', email: '', phone: '', yearsExp: '', priorExperience: 'No', researchInterest: 'Communication Expert', summary: 'MA in Media and Communication, Bahir Dar University. BSc in Ethiopian Language and Literature. SBCC Technical Working Group member. UNICEF C4D certified.' },
    { sn: 45, name: 'Fasil Mamo', expertType: 'Specialist', specialization: 'Logistics', country: 'Ethiopia', email: 'faasam2002@yahoo.com', phone: '+251966922939', yearsExp: '', priorExperience: 'No', researchInterest: 'Logistics, Procurement and Supply Chain', summary: 'Expert in logistics, procurement, and supply chain management based in Ethiopia.' },
    { sn: 46, name: 'Alemtsehay Beru', expertType: 'Senior Expert', specialization: 'Nutrition', country: 'Ethiopia', email: 'alemtsehaybr@gmail.com', phone: '+251911416246', yearsExp: '', priorExperience: 'No', researchInterest: 'Anthropometry & Nutrition Survey', summary: 'Expert in demographic, health, and emergency nutrition surveys. Extensive experience coordinating national census activities and conducting training on anthropometry.' },
    { sn: 47, name: 'Melkie Kassaw', expertType: 'Specialist', specialization: 'M&E', country: 'Ethiopia', email: 'melkas1@gmail.com', phone: '+251911124630', yearsExp: '25+', priorExperience: 'No', researchInterest: 'Project M&E, EMIS, Data Management', summary: '25+ years in project M&E, education management information systems, data analysis, GIS, and ICT in education.' },
    { sn: 48, name: 'Abebe Ejigu', expertType: 'Senior Expert', specialization: 'GIS', country: 'Ethiopia', email: '', phone: '', yearsExp: '20+', priorExperience: 'Yes', researchInterest: 'GIS Expert', summary: '20 years of expertise in GIS, Remote Sensing, and environmental assessments. Proficient in QGIS, ArcGIS, and ENVI. Experience in EU-funded agricultural projects.' },
    { sn: 49, name: 'Tewodros Zewudu', expertType: 'Consultant', specialization: 'Agriculture', country: 'Ethiopia', email: 'tedyz44jtz@gmail.com', phone: '+251932180099', yearsExp: '', priorExperience: 'No', researchInterest: 'Agriculture/Food Security', summary: 'Deep understanding of Ethiopia\'s agricultural government and institutions. Proven experience in promoting mechanization, developing proposals, and conducting research.' },
    { sn: 50, name: 'Jeylan Wolyie Hussein (PhD)', expertType: 'Professor', specialization: 'Social Development', country: 'Ethiopia', email: 'jeylanw@yahoo.com', phone: '+251930340120', yearsExp: '22+', priorExperience: 'No', researchInterest: 'Peace and Conflict Resolution', summary: 'Professor at Haramaya University. PhD in Peace & Conflict Resolution. Vice President for Administration. 22+ years in teaching, research, and community engagement.' },
    { sn: 51, name: 'Solomon Tesfaye', expertType: 'Specialist', specialization: 'Finance', country: 'Ethiopia', email: 'stesfayeb@gmail.com', phone: '+251911632070', yearsExp: '', priorExperience: 'No', researchInterest: 'Finance, Grant, Procurement', summary: 'Expert in financial planning, budgetary control, and financial systems. Strong skills in accounting, reporting, and compliance with financial regulations.' },
    { sn: 52, name: 'Kibret Mamo', expertType: 'Specialist', specialization: 'Environment', country: 'Ethiopia', email: 'kibretmamobahiru@gmail.com', phone: '+251921779869', yearsExp: '', priorExperience: 'No', researchInterest: 'Environment/Climate Change', summary: 'Expert in EIAs, natural resource management, climate adaptation, watershed management, FMNR, carbon financing, and climate-smart agriculture with World Vision.' },
    { sn: 53, name: 'Ermias Alemu', expertType: 'Specialist', specialization: 'Hydraulic Engineering', country: 'Ethiopia', email: 'ermialem@gmail.com', phone: '+251911479239', yearsExp: '', priorExperience: 'No', researchInterest: 'Hydraulic/Water/Land Management', summary: 'MSc in Hydraulic Engineering (UNESCO-IHE, Netherlands). BSc in Irrigation Engineering (distinction). Expert in land and water development.' },
]

function fileIcon(name) {
    const ext = name?.split('.').pop()?.toLowerCase()
    if (['pdf'].includes(ext)) return '📄'
    if (['doc', 'docx'].includes(ext)) return '📝'
    if (['xls', 'xlsx'].includes(ext)) return '📊'
    if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return '🖼️'
    return '📎'
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const EMPTY_FORM = { name: '', title: '', expertType: 'Consultant', specialization: '', country: 'Ethiopia', email: '', phone: '', yearsExp: '', notes: '', documents: [], priorExperience: 'No', researchInterest: '', summary: '' }

export default function ExpertDatabase() {
    const [experts, setExperts] = useState([])
    const [search, setSearch] = useState('')
    const [countryFilter, setCountryFilter] = useState('All Countries')
    const [typeFilter, setTypeFilter] = useState('All Types')
    const [specFilter, setSpecFilter] = useState('All Specializations')
    const [priorFilter, setPriorFilter] = useState('All')
    const [modal, setModal] = useState(false)
    const [importModal, setImportModal] = useState(false)
    const [detailExpert, setDetailExpert] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [editId, setEditId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [seeded, setSeeded] = useState(false)
    const [extractedExperts, setExtractedExperts] = useState([])
    const [viewMode, setViewMode] = useState('grid') // 'grid' | 'dashboard'
    const [isDraggingBulk, setIsDraggingBulk] = useState(false)
    const [isDraggingFile, setIsDraggingFile] = useState(false)

    useEffect(() => { fetchData() }, [])

    const fetchData = () => {
        setLoading(true)
        axios.get('/api/experts').then(r => {
            setExperts(r.data)
            setLoading(false)
        }).catch(err => {
            console.error('Error fetching experts:', err)
            setLoading(false)
        })
    }

    const seedExperts = async () => {
        if (!confirm(`This will add all 53 Ethiopian Key Experts from the CV document. Continue?`)) return
        setSeeded(true)
        for (const e of SEED_EXPERTS) {
            try {
                await axios.post('/api/experts', {
                    name: e.name,
                    title: e.researchInterest,
                    expertType: e.expertType,
                    specialization: e.specialization,
                    country: e.country,
                    email: e.email,
                    phone: e.phone,
                    yearsExp: e.yearsExp,
                    notes: `Prior Experience: ${e.priorExperience}\nResearch Interest: ${e.researchInterest}\n${e.summary}`,
                    documents: []
                })
            } catch (err) { }
        }
        fetchData()
        setSeeded(false)
    }

    const filtered = experts.filter(e => {
        const s = search.toLowerCase()
        if (search && ![e.name, e.specialization, e.notes].some(v => v?.toLowerCase().includes(s))) return false
        if (countryFilter !== 'All Countries' && e.country !== countryFilter) return false
        if (typeFilter !== 'All Types' && e.expertType !== typeFilter) return false
        if (specFilter !== 'All Specializations' && e.specialization !== specFilter) return false
        if (priorFilter === 'Yes' && !e.notes?.includes('Prior Experience: Yes')) return false
        if (priorFilter === 'No' && !e.notes?.includes('Prior Experience: No')) return false
        return true
    })

    const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setModal(true) }
    const openEdit = (e, ev) => { ev?.stopPropagation(); setForm({ ...e, documents: e.documents || [] }); setEditId(e.id); setModal(true) }

    const save = async () => {
        if (!form.name.trim()) return
        if (editId) await axios.put(`/api/experts/${editId}`, form)
        else await axios.post('/api/experts', form)
        setModal(false); fetchData()
    }

    const remove = async (id, ev) => {
        ev?.stopPropagation()
        if (confirm('Delete this expert?')) { await axios.delete(`/api/experts/${id}`); fetchData() }
    }

    const handleBulkUpload = async (e) => {
        const file = e.type === 'drop' ? e.dataTransfer.files[0] : e.target.files[0]
        if (!file) return
        setAnalyzing(true)
        setIsDraggingBulk(false)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const uploadRes = await axios.post('/api/upload', formData)
            const analyzeRes = await axios.post('/api/experts/analyze', { fileUrl: uploadRes.data.fileUrl })
            setExtractedExperts(analyzeRes.data.experts)
        } catch (err) {
            console.error("Bulk Upload Error Object:", err)
            const errorData = err.response?.data
            const msg = errorData?.error || errorData?.message || err.message || "Unknown Error"
            const details = errorData?.details ? "\nDetails: " + JSON.stringify(errorData.details) : ""
            alert('Failed to analyze: ' + msg + details)
        } finally {
            setAnalyzing(false)
            if (e.target) e.target.value = ''
        }
    }

    const saveImportedExperts = async () => {
        setAnalyzing(true)
        try {
            for (const exp of extractedExperts) { await axios.post('/api/experts', { ...exp, documents: [] }) }
            setImportModal(false); setExtractedExperts([]); fetchData()
        } catch (err) { alert('Failed to save experts') }
        finally { setAnalyzing(false) }
    }

    const handleFileUpload = (e) => {
        if (e.type === 'drop') e.preventDefault()
        const files = Array.from(e.type === 'drop' ? e.dataTransfer.files : e.target.files)
        if (!files.length) return
        setUploading(true)
        setIsDraggingFile(false)
        Promise.all(files.map(file => new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (ev) => resolve({ name: file.name, size: file.size, type: file.type, data: ev.target.result, uploadedAt: new Date().toISOString() })
            reader.readAsDataURL(file)
        }))).then(newDocs => {
            setForm(p => ({ ...p, documents: [...(p.documents || []), ...newDocs] }))
            setUploading(false)
            if (e.target) e.target.value = ''
        })
    }

    const openDoc = (doc) => {
        const ext = doc.name.split('.').pop().toLowerCase()
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'pdf'].includes(ext)) {
            const win = window.open()
            if (ext === 'pdf') win.document.write(`<iframe src="${doc.data}" style="width:100%;height:100vh;border:none;"></iframe>`)
            else win.document.write(`<img src="${doc.data}" style="max-width:100%;"/>`)
        } else {
            const a = document.createElement('a'); a.href = doc.data; a.download = doc.name; a.click()
        }
    }

    const initials = name => name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '??'
    const avatarColor = name => {
        const colors = ['#3b5bdb', '#805ad5', '#2c7a7b', '#276749', '#b7791f', '#c53030', '#2b6cb0', '#744210', '#553c9a', '#285e61']
        return colors[(name?.charCodeAt(0) || 0) % colors.length]
    }

    if (loading && experts.length === 0) return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#718096', fontSize: 14 }}>Loading...</div>

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid #2d3748', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0f1117' }}>
                <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>Expert Database</div>
                    <div style={{ fontSize: 12, color: '#718096' }}>{filtered.length} of {experts.length} experts</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
                    <button onClick={() => setImportModal(true)} style={{ background: '#276749', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>📂 Bulk Import</button>
                    <button onClick={openAdd} style={{ background: '#3b5bdb', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>+ Add Expert</button>
                </div>
            </div>

            {/* View Toggle */}
            <div style={{ padding: '4px 24px', borderBottom: '1px solid #2d3748', display: 'flex', gap: 20, background: '#0a0d13' }}>
                {['grid', 'dashboard'].map(mode => (
                    <div key={mode} onClick={() => setViewMode(mode)} style={{
                        fontSize: 11, fontWeight: 700, padding: '10px 0', cursor: 'pointer',
                        color: viewMode === mode ? '#3b5bdb' : '#4a5568',
                        borderBottom: `2px solid ${viewMode === mode ? '#3b5bdb' : 'transparent'}`
                    }}>{mode.toUpperCase()} VIEW</div>
                ))}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {viewMode === 'dashboard' ? (
                    <div style={{ padding: 24 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                            {[
                                { label: 'Total Experts', val: experts.length },
                                { label: 'Total Documents', val: experts.reduce((a, b) => a + (b.documents?.length || 0), 0) },
                                { label: 'Specializations', val: new Set(experts.map(e => e.specialization).filter(Boolean)).size }
                            ].map(s => (
                                <div key={s.label} style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 12, padding: 20 }}>
                                    <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{s.label}</div>
                                    <div style={{ fontSize: 28, fontWeight: 700 }}>{s.val}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ background: '#111827', border: '1px solid #2d3748', borderRadius: 12, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead style={{ background: '#1a1f2e', color: '#718096', textAlign: 'left' }}>
                                    <tr>
                                        <th style={{ padding: 12 }}>Name</th>
                                        <th style={{ padding: 12 }}>Field</th>
                                        <th style={{ padding: 12 }}>Documents</th>
                                        <th style={{ padding: 12, textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(e => (
                                        <tr key={e.id} style={{ borderBottom: '1px solid #2d3748' }}>
                                            <td style={{ padding: 12, fontWeight: 600 }}>
                                                {e.name}
                                                {e.summary && <div style={{ fontSize: 11, color: '#718096', fontWeight: 400 }}>{e.summary.slice(0, 100)}...</div>}
                                            </td>
                                            <td style={{ padding: 12 }}><Badge color="blue">{e.specialization}</Badge></td>
                                            <td style={{ padding: 12 }}>
                                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }} onClick={ev => ev.stopPropagation()}>
                                                    {(e.documents || []).length > 0 ? (
                                                        (e.documents || []).map((d, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => openDoc(d)}
                                                                style={{
                                                                    background: 'rgba(59, 130, 246, 0.08)',
                                                                    border: '1px solid rgba(59, 130, 246, 0.15)',
                                                                    borderRadius: 6,
                                                                    padding: '4px 8px',
                                                                    color: '#7b9cff',
                                                                    fontSize: 11,
                                                                    fontWeight: 650,
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 4
                                                                }}
                                                            >
                                                                {fileIcon(d.name)} {d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <span style={{ color: '#4a5568', fontSize: 11 }}>No attached CV</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ padding: 12, textAlign: 'right' }}>
                                                <button onClick={() => setDetailExpert(e)} style={{ background: '#1e2433', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: 11, cursor: 'pointer' }}>View</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                        {filtered.map(e => (
                            <div key={e.id} onClick={() => setDetailExpert(e)} style={{ background: '#141720', border: '1px solid #2d3748', borderRadius: 10, padding: 16, cursor: 'pointer' }}>
                                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: avatarColor(e.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{initials(e.name)}</div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{e.name}</div>
                                        <div style={{ fontSize: 11, color: '#718096' }}>{e.expertType}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                                    {e.specialization && <Badge color="blue">{e.specialization}</Badge>}
                                    <Badge color={e.priorExperience === 'Yes' ? 'green' : 'gray'}>{e.priorExperience === 'Yes' ? 'Prior' : 'New'}</Badge>
                                </div>
                                {e.summary && <div style={{ fontSize: 12, color: '#a0aec0', marginBottom: 10, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{e.summary}</div>}
                                <div style={{ 
                                    borderTop: '1px solid rgba(255,255,255,0.06)', 
                                    paddingTop: 10, 
                                    marginTop: 6,
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: 6 
                                }} onClick={ev => ev.stopPropagation()}>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>ATTACHMENTS / CV LIST</div>
                                    {(e.documents || []).length > 0 ? (
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {(e.documents || []).map((doc, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => openDoc(doc)}
                                                    style={{
                                                        background: 'rgba(59, 130, 246, 0.08)',
                                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                                        borderRadius: 6,
                                                        color: '#7b9cff',
                                                        padding: '4px 8px',
                                                        fontSize: 11,
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        gap: 4,
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseEnter={s => { s.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'; s.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)'; }}
                                                    onMouseLeave={s => { s.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)'; s.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)'; }}
                                                >
                                                    {fileIcon(doc.name)} {doc.name.length > 15 ? doc.name.substring(0, 15) + '...' : doc.name}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setDetailExpert(e)}
                                            style={{
                                                background: 'rgba(255,255,255,0.03)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: 6,
                                                color: '#94a3b8',
                                                padding: '4px 8px',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 4,
                                                width: 'fit-content'
                                            }}
                                            onMouseEnter={s => { s.currentTarget.style.background = 'rgba(255,255,255,0.06)'; s.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={s => { s.currentTarget.style.background = 'rgba(255,255,255,0.03)'; s.currentTarget.style.color = '#94a3b8'; }}
                                        >
                                            📄 View Summary CV bio
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {importModal && (
                <Modal title="Bulk Import" onClose={() => setImportModal(false)}>
                    <label 
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingBulk(true) }}
                        onDragLeave={() => setIsDraggingBulk(false)}
                        onDrop={(e) => { e.preventDefault(); handleBulkUpload(e) }}
                        style={{ 
                            display: 'block', border: `2px dashed ${isDraggingBulk ? '#3b5bdb' : '#2d3748'}`,
                            borderRadius: 12, padding: 60, textAlign: 'center', 
                            cursor: analyzing ? 'wait' : 'pointer',
                            background: isDraggingBulk ? '#3b5bdb11' : (analyzing ? '#1a1f2e' : 'transparent'),
                            transition: 'all 0.2s'
                        }}
                    >
                        <input 
                            type="file" 
                            onChange={handleBulkUpload} 
                            style={{ display: 'none' }} 
                            disabled={analyzing}
                            accept=".pdf,.doc,.docx,.txt"
                        />
                        <div style={{ fontSize: 32, marginBottom: 12 }}>{analyzing ? '⌛' : '📄'}</div>
                        <div style={{ fontWeight: 600, color: analyzing ? '#718096' : '#fff' }}>
                            {analyzing ? 'AI is analyzing your document...' : 'Click to upload CV or Expert List'}
                        </div>
                        <div style={{ fontSize: 12, color: '#4a5568', marginTop: 8 }}>
                            Supports PDF, DOCX, and Text files
                        </div>
                    </label>
                    {extractedExperts.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <div style={{ maxHeight: 200, overflow: 'auto', marginBottom: 12 }}>
                                {extractedExperts.map((ex, i) => <div key={i} style={{ fontSize: 12, padding: 4 }}>{ex.name} - {ex.specialization}</div>)}
                            </div>
                            <Btn onClick={saveImportedExperts}>Import {extractedExperts.length} Experts</Btn>
                        </div>
                    )}
                </Modal>
            )}

            {detailExpert && (
                <Modal title={detailExpert.name} onClose={() => setDetailExpert(null)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                        <div>
                            <div style={{ fontSize: 11, color: '#718096', marginBottom: 2 }}>Type</div>
                            <div style={{ color: '#fff' }}>{detailExpert.expertType}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: '#718096', marginBottom: 2 }}>Prior Experience</div>
                            <Badge color={detailExpert.priorExperience === 'Yes' ? 'green' : 'gray'}>{detailExpert.priorExperience || 'No'}</Badge>
                        </div>
                    </div>
                    {detailExpert.researchInterest && (
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, color: '#718096', marginBottom: 2 }}>Research Interest</div>
                            <div style={{ color: '#fff' }}>{detailExpert.researchInterest}</div>
                        </div>
                    )}
                    <div style={{ fontSize: 13, color: '#a0aec0', whiteSpace: 'pre-wrap' }}>{detailExpert.summary || detailExpert.notes}</div>
                    <div style={{ marginTop: 16, borderTop: '1px solid #2d3748', paddingTop: 12 }}>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Documents</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(detailExpert.documents || []).map((d, i) => (
                                <div key={i} onClick={() => openDoc(d)} style={{ padding: 8, background: '#0f1117', borderRadius: 6, cursor: 'pointer' }}>{d.name}</div>
                            ))}
                        </div>
                    </div>
                </Modal>
            )}

            {modal && (
                <Modal title={editId ? 'Edit Expert' : 'Add Expert'} onClose={() => setModal(false)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxHeight: '60vh', overflowY: 'auto', paddingRight: 10 }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <Field label="Full Name"><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Expert Name" /></Field>
                        </div>
                        <Field label="Expert Type">
                            <Select value={form.expertType} onChange={e => setForm({...form, expertType: e.target.value})}>
                                {EXPERT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                        </Field>
                        <Field label="Specialization"><Input value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="e.g. Irrigation" /></Field>
                        <Field label="Prior Experience">
                            <Select value={form.priorExperience} onChange={e => setForm({...form, priorExperience: e.target.value})}>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </Select>
                        </Field>
                        <Field label="Country">
                            <Select value={form.country} onChange={e => setForm({...form, country: e.target.value})}>
                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </Select>
                        </Field>
                        <div style={{ gridColumn: 'span 2' }}>
                            <Field label="Research Interest"><Input value={form.researchInterest} onChange={e => setForm({...form, researchInterest: e.target.value})} placeholder="Main areas of interest" /></Field>
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <Field label="Summary"><textarea value={form.summary} onChange={e => setForm({...form, summary: e.target.value})} style={{ width: '100%', background: '#0f1117', border: '1px solid #2d3748', borderRadius: 7, padding: 8, color: '#fff', fontSize: 13, minHeight: 80 }} placeholder="Short bio..." /></Field>
                        </div>
                        <div style={{ gridColumn: 'span 2', marginTop: 10 }}>
                            <div style={{ fontSize: 12, color: '#a0aec0', marginBottom: 8, fontWeight: 500 }}>Documents</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                                {(form.documents || []).map((d, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0f1117', border: '1px solid #2d3748', borderRadius: 8, fontSize: 12 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span>{fileIcon(d.name)}</span>
                                            <span style={{ color: '#e2e8f0' }}>{d.name}</span>
                                            <span style={{ color: '#4a5568', fontSize: 11 }}>({formatSize(d.size)})</span>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.preventDefault(); setForm(p => ({ ...p, documents: p.documents.filter((_, idx) => idx !== i) })) }} 
                                            style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}
                                        >✕</button>
                                    </div>
                                ))}
                            </div>
                            <label 
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true) }}
                                onDragLeave={() => setIsDraggingFile(false)}
                                onDrop={(e) => { e.preventDefault(); handleFileUpload(e) }}
                                style={{ 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    padding: '10px', border: `1px dashed ${isDraggingFile ? '#3b5bdb' : '#2d3748'}`,
                                    borderRadius: 8, cursor: uploading ? 'wait' : 'pointer', 
                                    fontSize: 13, color: isDraggingFile ? '#3b5bdb' : '#718096',
                                    background: isDraggingFile ? '#3b5bdb11' : '#111827', 
                                    transition: 'all 0.2s'
                                }}
                            >
                                <input type="file" onChange={handleFileUpload} multiple style={{ display: 'none' }} disabled={uploading} />
                                {uploading ? '⏳ Uploading...' : '➕ Attach Documents (CV, Certificates, etc.)'}
                            </label>
                        </div>
                    </div>
                    <Btn onClick={save} style={{ marginTop: 12, width: '100%' }}>{editId ? 'Update' : 'Create'} Expert</Btn>
                </Modal>
            )}
        </div>
    )
}