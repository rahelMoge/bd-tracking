import { PrismaClient } from '@prisma/client'

const globalForPrisma = global

const prisma = globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
})

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

/**
 * Auto-retry helper for Prisma queries.
 * Automatically retries when Neon Serverless Postgres is waking up from compute sleep (P1001 / P1002).
 */
export async function withDbRetry(fn, retries = 2, delayMs = 1000) {
    let attempt = 0
    while (attempt <= retries) {
        try {
            return await fn(prisma)
        } catch (err) {
            attempt++
            const isConnErr = err?.code === 'P1001' || err?.code === 'P1002' || err?.message?.includes("Can't reach database server")
            if (isConnErr && attempt <= retries) {
                console.warn(`⚠️ Neon DB waking up (attempt ${attempt}/${retries}). Retrying...`)
                await new Promise(res => setTimeout(res, delayMs))
            } else {
                throw err
            }
        }
    }
}

export default prisma