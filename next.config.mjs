import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Copy pdfjs worker to /public so it can be served as a static file.
// This runs once at startup — cross-platform (no shell cp/xcopy needed).
const workerSrc = path.join(__dirname, 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs')
const workerDest = path.join(__dirname, 'public/pdf.worker.min.mjs')
if (fs.existsSync(workerSrc)) {
  fs.mkdirSync(path.dirname(workerDest), { recursive: true })
  fs.copyFileSync(workerSrc, workerDest)
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // pdfjs-dist tries to require 'canvas' for server-side rendering.
      // We only use it in the browser, so stub it out to prevent webpack errors.
      config.resolve.alias.canvas = false
    }
    return config
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Increase function timeout for AI note generation
  // Note: This only applies to Vercel deployments
  // Local development has no timeout
  async headers() {
    return [
      {
        source: '/api/generate-notes',
        headers: [
          {
            key: 'x-vercel-functions-timeout',
            value: '30',
          },
        ],
      },
    ]
  },
}

export default nextConfig
