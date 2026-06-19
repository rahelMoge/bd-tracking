import fs from 'fs'
import path from 'path'

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
    }

    const chunks = []
    for await (const chunk of req) {
        chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    const boundary = req.headers['content-type'].split('boundary=')[1]
    const bodyStr = buffer.toString('binary')

    const filenameMatch = bodyStr.match(/filename="([^"]+)"/)
    const filename = filenameMatch ? filenameMatch[1] : 'upload'
    const safeName = Date.now() + '_' + filename.replace(/[^a-zA-Z0-9._-]/g, '_')

    const start = bodyStr.indexOf('\r\n\r\n') + 4
    const end = bodyStr.lastIndexOf(`\r\n--${boundary}`)
    const fileBuffer = buffer.slice(start, end)

    fs.writeFileSync(path.join(uploadDir, safeName), fileBuffer)

    res.status(200).json({
        fileName: filename,
        fileUrl: `/uploads/${safeName}`
    })
}