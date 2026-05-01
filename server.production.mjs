import http from 'node:http'
import { createServer } from 'node:http'

// Import the built TanStack Start server handler
const { default: serverEntry } = await import('./dist/server/server.js')

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'

async function nodeHandler(req, res) {
  try {
    // Build full URL
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`
    const url = `${protocol}://${host}${req.url}`

    // Collect body
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = Buffer.concat(chunks)

    // Build Request
    const request = new Request(url, {
      method: req.method,
      headers: new Headers(
        Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : String(v)])
      ),
      body: body.length > 0 ? body : undefined,
    })

    // Call the TanStack Start handler
    const response = await serverEntry.fetch(request)

    // Write response
    res.statusCode = response.status
    res.statusMessage = response.statusText
    for (const [key, value] of response.headers) {
      res.setHeader(key, value)
    }

    if (response.body) {
      const reader = response.body.getReader()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        res.write(value)
      }
    }
    res.end()
  } catch (err) {
    console.error('Server error:', err)
    if (!res.headersSent) {
      res.statusCode = 500
      res.end('Internal Server Error')
    }
  }
}

const server = createServer(nodeHandler)

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`)
})
