import { put } from '@vercel/blob'

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        const chunks = []
        for await (const chunk of req) {
            chunks.push(chunk)
        }
        const buffer = Buffer.concat(chunks)

        const boundary = req.headers['content-type']?.split('boundary=')[1]
        if (!boundary) {
            return res.status(400).json({ message: 'Invalid multipart request: missing boundary' })
        }

        const bodyStr = buffer.toString('binary')

        const filenameMatch = bodyStr.match(/filename="([^"]+)"/)
        const filename = filenameMatch ? filenameMatch[1] : 'upload'
        const safeName = Date.now() + '_' + filename.replace(/[^a-zA-Z0-9._-]/g, '_')

        const start = bodyStr.indexOf('\r\n\r\n') + 4
        const end = bodyStr.lastIndexOf(`\r\n--${boundary}`)
        const fileBuffer = buffer.slice(start, end)

        const blob = await put(safeName, fileBuffer, {
            access: 'public',
            addRandomSuffix: false,
        })

        res.status(200).json({
            fileName: filename,
            fileUrl: blob.url,
        })
    } catch (error) {
        console.error('Upload error:', error)
        res.status(500).json({ message: 'Upload failed', details: error.message })
    }
}