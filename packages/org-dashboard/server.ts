#!/usr/bin/env bun
/**
 * OrcAI Organization Dashboard Server
 * Simple HTTP server to serve the dashboard and organization data
 */

import { readdir, readFile } from "fs/promises"
import { join } from "path"

const PORT = process.env.ORG_DASHBOARD_PORT || 3030
const ORCAI_ROOT = process.env.ORCAI_ROOT || join(process.cwd(), "../..")
const ORCAI_DIR = join(ORCAI_ROOT, ".orcai")

// CORS headers for remote access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url)

    // Handle CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders })
    }

    // Serve static files
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const html = await Bun.file(join(import.meta.dir, "index.html")).text()
      return new Response(html, {
        headers: { "Content-Type": "text/html", ...corsHeaders },
      })
    }

    if (url.pathname === "/dashboard.js") {
      const js = await Bun.file(join(import.meta.dir, "dashboard.js")).text()
      return new Response(js, {
        headers: { "Content-Type": "application/javascript", ...corsHeaders },
      })
    }

    // API endpoints
    if (url.pathname.startsWith("/api/org")) {
      try {
        const response = await handleOrgAPI(url.pathname)
        return new Response(JSON.stringify(response, null, 2), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        })
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders })
  },
})

async function handleOrgAPI(pathname: string) {
  // GET /api/org/structure - Get org.json
  if (pathname === "/api/org/structure") {
    const orgFile = join(ORCAI_DIR, "organization/org.json")
    const content = await readFile(orgFile, "utf-8")
    return JSON.parse(content)
  }

  // GET /api/org/agents - List all agents
  if (pathname === "/api/org/agents") {
    const agentsDir = join(ORCAI_DIR, "organization/agents")
    const files = await readdir(agentsDir)
    const agentFiles = files.filter(f => f.endsWith(".json") && !f.startsWith("_"))

    const agents = await Promise.all(
      agentFiles.map(async (file) => {
        const content = await readFile(join(agentsDir, file), "utf-8")
        return JSON.parse(content)
      })
    )

    return agents
  }

  // GET /api/org/agents/:id - Get specific agent
  const agentMatch = pathname.match(/^\/api\/org\/agents\/([a-z0-9-]+)$/)
  if (agentMatch) {
    const agentId = agentMatch[1]
    const agentFile = join(ORCAI_DIR, `organization/agents/${agentId}.json`)
    const content = await readFile(agentFile, "utf-8")
    return JSON.parse(content)
  }

  // GET /api/org/learning/wins - Get learning outcomes
  if (pathname === "/api/org/learning/wins") {
    const winsDir = join(ORCAI_DIR, "learning/outcomes/wins")
    const files = await readdir(winsDir)
    const mdFiles = files.filter(f => f.endsWith(".md"))

    return mdFiles.map(f => ({
      filename: f,
      path: `/learning/outcomes/wins/${f}`,
    }))
  }

  // GET /api/org/memory/corporate - Get corporate memory
  if (pathname === "/api/org/memory/corporate") {
    const corpDir = join(ORCAI_DIR, "memory/corporate")

    const [principles, decisions, knowledge] = await Promise.all([
      readdir(join(corpDir, "principles")).catch(() => []),
      readdir(join(corpDir, "decisions")).catch(() => []),
      readdir(join(corpDir, "knowledge-base")).catch(() => []),
    ])

    return {
      principles,
      decisions,
      knowledge,
    }
  }

  throw new Error(`Unknown API endpoint: ${pathname}`)
}

console.log(`\n🚀 OrcAI Organization Dashboard`)
console.log(`📊 Dashboard: http://localhost:${PORT}`)
console.log(`🔌 API: http://localhost:${PORT}/api/org`)
console.log(`📁 Data: ${ORCAI_DIR}`)
console.log(`\n💡 Access remotely: Use ngrok or similar to expose port ${PORT}`)
console.log(`   Example: ngrok http ${PORT}\n`)
