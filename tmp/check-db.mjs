import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
try {
  const data = await p.opportunity.findMany({ select: { id: true, title: true } })
  console.log('All opportunities:', JSON.stringify(data, null, 2))
  const opp7 = await p.opportunity.findUnique({ where: { id: 7 } })
  console.log('\nOpportunity #7:', opp7 ? JSON.stringify(opp7, null, 2) : 'NOT FOUND')
} catch (e) {
  console.error('Error:', e.message)
} finally {
  await p.$disconnect()
}
