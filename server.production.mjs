import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Import the built TanStack Start server handler
const { default: serverEntry } = await import('./dist/server/server.js')

const PORT = process.env.PORT || 3000
const HOST = process.env.HOST || '0.0.0.0'
const CLIENT_DIR = path.join(__dirname, 'dist', 'client')

const mimeTypes = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
}

function serveStatic(req, res) {
  return new Promise((resolve) => {
    const url = new URL(req.url, `http://${req.headers.host}`)
    let filePath = path.join(CLIENT_DIR, url.pathname)

    // Security: prevent directory traversal
    if (!filePath.startsWith(CLIENT_DIR)) {
      resolve(false)
      return
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        resolve(false)
        return
      }

      const ext = path.extname(filePath).toLowerCase()
      const contentType = mimeTypes[ext] || 'application/octet-stream'

      res.statusCode = 200
      res.setHeader('Content-Type', contentType)
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')

      const stream = fs.createReadStream(filePath)
      stream.pipe(res)
      stream.on('error', () => {
        res.statusCode = 500
        res.end()
      })
      res.on('finish', () => resolve(true))
    })
  })
}

async function ssrHandler(req, res) {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const host = req.headers['x-forwarded-host'] || req.headers.host || `localhost:${PORT}`
    const url = `${protocol}://${host}${req.url}`

    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = Buffer.concat(chunks)

    const request = new Request(url, {
      method: req.method,
      headers: new Headers(
        Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : String(v)])
      ),
      body: body.length > 0 ? body : undefined,
    })

    const response = await serverEntry.fetch(request)

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
    console.error('SSR error:', err)
    if (!res.headersSent) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'text/plain')
      res.end('Internal Server Error')
    }
  }
}

const server = http.createServer(async (req, res) => {
  // Try static files first (assets + root-level files like images, favicon, etc.)
  if (req.url && !req.url.startsWith('/api/')) {
    const served = await serveStatic(req, res)
    if (served) return
  }

  // Fallback to SSR
  await ssrHandler(req, res)
})

server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running at http://${HOST}:${PORT}`)
})
