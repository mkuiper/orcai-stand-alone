#!/usr/bin/env bun
/**
 * OrcAI Organization Dashboard Server
 * HTTP server with full CRUD operations for organization management
 */

import { readdir, readFile, writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { exists } from "fs"

const PORT = process.env.ORG_DASHBOARD_PORT || 3030
const ORCAI_ROOT = process.env.ORCAI_ROOT || join(process.cwd(), "../..")
const ORCAI_DIR = join(ORCAI_ROOT, ".orcai")

// CORS headers for remote access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

    if (url.pathname === "/canvas-chart.js") {
      const js = await Bun.file(join(import.meta.dir, "canvas-chart.js")).text()
      return new Response(js, {
        headers: { "Content-Type": "application/javascript", ...corsHeaders },
      })
    }

    // API endpoints
    if (url.pathname.startsWith("/api/org")) {
      try {
        const response = await handleOrgAPI(req, url.pathname)
        return new Response(JSON.stringify(response, null, 2), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        })
      } catch (error) {
        console.error("API Error:", error)
        return new Response(JSON.stringify({ error: String(error) }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        })
      }
    }

    return new Response("Not Found", { status: 404, headers: corsHeaders })
  },
})

async function handleOrgAPI(req: Request, pathname: string) {
  const method = req.method

  // GET /api/org/structure
  if (pathname === "/api/org/structure" && method === "GET") {
    const orgFile = join(ORCAI_DIR, "organization/org.json")
    const content = await readFile(orgFile, "utf-8")
    return JSON.parse(content)
  }

  // GET /api/org/agents
  if (pathname === "/api/org/agents" && method === "GET") {
    const agentsDir = join(ORCAI_DIR, "organization/agents")
    const files = await readdir(agentsDir)
    const agentFiles = files.filter(f => f.endsWith(".json") && !f.startsWith("_") && f !== "human-example.json")

    const agents = await Promise.all(
      agentFiles.map(async (file) => {
        const content = await readFile(join(agentsDir, file), "utf-8")
        return JSON.parse(content)
      })
    )

    return agents
  }

  // GET /api/org/agents/:id
  const getAgentMatch = pathname.match(/^\/api\/org\/agents\/([a-z0-9-]+)$/)
  if (getAgentMatch && method === "GET") {
    const agentId = getAgentMatch[1]
    const agentFile = join(ORCAI_DIR, `organization/agents/${agentId}.json`)
    const content = await readFile(agentFile, "utf-8")
    return JSON.parse(content)
  }

  // POST /api/org/agents - Create new agent
  if (pathname === "/api/org/agents" && method === "POST") {
    const newAgent = await req.json()
    const agentFile = join(ORCAI_DIR, `organization/agents/${newAgent.id}.json`)

    // Check if agent already exists
    try {
      await readFile(agentFile)
      throw new Error("Agent with this ID already exists")
    } catch (error) {
      // Agent doesn't exist, continue
    }

    // Save agent file
    await writeFile(agentFile, JSON.stringify(newAgent, null, 2))

    // Update org.json hierarchy
    const orgFile = join(ORCAI_DIR, "organization/org.json")
    const orgData = JSON.parse(await readFile(orgFile, "utf-8"))

    // Add to hierarchy
    orgData.hierarchy.structure[newAgent.id] = {
      children: [],
      team: newAgent.org_structure.team
    }

    // If has a manager, add to their children
    if (newAgent.org_structure.reports_to) {
      if (!orgData.hierarchy.structure[newAgent.org_structure.reports_to].children) {
        orgData.hierarchy.structure[newAgent.org_structure.reports_to].children = []
      }
      orgData.hierarchy.structure[newAgent.org_structure.reports_to].children.push(newAgent.id)
    }

    // Update metadata
    orgData.metadata.total_agents = (orgData.metadata.total_agents || 0) + 1
    orgData.metadata.last_updated = new Date().toISOString()

    await writeFile(orgFile, JSON.stringify(orgData, null, 2))

    return { success: true, agent: newAgent }
  }

  // PUT /api/org/agents/:id
  const putAgentMatch = pathname.match(/^\/api\/org\/agents\/([a-z0-9-]+)$/)
  if (putAgentMatch && method === "PUT") {
    const agentId = putAgentMatch[1]
    const agentFile = join(ORCAI_DIR, `organization/agents/${agentId}.json`)
    const updatedAgent = await req.json()

    // Update timestamp
    updatedAgent.last_active = new Date().toISOString()

    await writeFile(agentFile, JSON.stringify(updatedAgent, null, 2))
    return { success: true, agent: updatedAgent }
  }

  // DELETE /api/org/agents/:id
  const deleteAgentMatch = pathname.match(/^\/api\/org\/agents\/([a-z0-9-]+)$/)
  if (deleteAgentMatch && method === "DELETE") {
    const agentId = deleteAgentMatch[1]
    const agentFile = join(ORCAI_DIR, `organization/agents/${agentId}.json`)

    // Remove from org.json
    const orgFile = join(ORCAI_DIR, "organization/org.json")
    const orgData = JSON.parse(await readFile(orgFile, "utf-8"))

    // Remove from hierarchy
    delete orgData.hierarchy.structure[agentId]

    // Remove from any parent's children array
    for (const [id, data] of Object.entries(orgData.hierarchy.structure)) {
      const structure = data as any
      if (structure.children) {
        structure.children = structure.children.filter((c: string) => c !== agentId)
      }
    }

    await writeFile(orgFile, JSON.stringify(orgData, null, 2))

    // Delete agent file
    await Bun.write(agentFile, "")
    // Note: Bun doesn't have fs.unlink in promises, using write empty for now

    return { success: true }
  }

  // POST /api/org/create-connection
  if (pathname === "/api/org/create-connection" && method === "POST") {
    const { from, to, type } = await req.json()

    const orgFile = join(ORCAI_DIR, "organization/org.json")
    const orgData = JSON.parse(await readFile(orgFile, "utf-8"))

    if (type === 'direct') {
      // Add as direct report
      if (!orgData.hierarchy.structure[from].children) {
        orgData.hierarchy.structure[from].children = []
      }
      if (!orgData.hierarchy.structure[from].children.includes(to)) {
        orgData.hierarchy.structure[from].children.push(to)
      }

      // Update child's reports_to
      const childFile = join(ORCAI_DIR, `organization/agents/${to}.json`)
      const childAgent = JSON.parse(await readFile(childFile, "utf-8"))
      childAgent.org_structure.reports_to = from
      await writeFile(childFile, JSON.stringify(childAgent, null, 2))
    } else {
      // Add as dotted line
      const fromFile = join(ORCAI_DIR, `organization/agents/${from}.json`)
      const fromAgent = JSON.parse(await readFile(fromFile, "utf-8"))

      if (!fromAgent.org_structure.dotted_line) {
        fromAgent.org_structure.dotted_line = []
      }
      if (!fromAgent.org_structure.dotted_line.includes(to)) {
        fromAgent.org_structure.dotted_line.push(to)
      }

      await writeFile(fromFile, JSON.stringify(fromAgent, null, 2))
    }

    await writeFile(orgFile, JSON.stringify(orgData, null, 2))
    return { success: true }
  }

  // POST /api/org/update-reporting
  if (pathname === "/api/org/update-reporting" && method === "POST") {
    const { childId, newParentId } = await req.json()

    // Update org.json hierarchy
    const orgFile = join(ORCAI_DIR, "organization/org.json")
    const orgData = JSON.parse(await readFile(orgFile, "utf-8"))

    // Remove child from old parent
    for (const [agentId, data] of Object.entries(orgData.hierarchy.structure)) {
      const structure = data as any
      if (structure.children?.includes(childId)) {
        structure.children = structure.children.filter((c: string) => c !== childId)
      }
    }

    // Add to new parent
    if (!orgData.hierarchy.structure[newParentId].children) {
      orgData.hierarchy.structure[newParentId].children = []
    }
    orgData.hierarchy.structure[newParentId].children.push(childId)

    // Update child agent's reports_to
    const childAgentFile = join(ORCAI_DIR, `organization/agents/${childId}.json`)
    const childAgent = JSON.parse(await readFile(childAgentFile, "utf-8"))
    childAgent.org_structure.reports_to = newParentId
    childAgent.last_active = new Date().toISOString()

    await writeFile(orgFile, JSON.stringify(orgData, null, 2))
    await writeFile(childAgentFile, JSON.stringify(childAgent, null, 2))

    return { success: true }
  }

  // GET /api/org/schedule
  if (pathname === "/api/org/schedule" && method === "GET") {
    const scheduleFile = join(ORCAI_DIR, "meetings/schedule.json")

    try {
      const content = await readFile(scheduleFile, "utf-8")
      const scheduleData = JSON.parse(content)

      // Convert to array format
      const operations = []
      if (scheduleData.recurring) {
        for (const [id, op] of Object.entries(scheduleData.recurring)) {
          operations.push({ id, ...op })
        }
      }
      return operations
    } catch (error) {
      return []
    }
  }

  // POST /api/org/schedule
  if (pathname === "/api/org/schedule" && method === "POST") {
    const operation = await req.json()
    const scheduleFile = join(ORCAI_DIR, "meetings/schedule.json")

    // Ensure meetings directory exists
    await mkdir(join(ORCAI_DIR, "meetings"), { recursive: true })

    let scheduleData
    try {
      const content = await readFile(scheduleFile, "utf-8")
      scheduleData = JSON.parse(content)
    } catch (error) {
      scheduleData = { recurring: {}, scheduled_tasks: {} }
    }

    if (!scheduleData.recurring) scheduleData.recurring = {}

    // Store operation
    const { id, ...opData } = operation
    scheduleData.recurring[id] = {
      name: opData.name,
      facilitator: opData.agents[0],
      participants: opData.agents,
      schedule: {
        cron: opData.cron,
        duration_minutes: opData.duration_minutes
      },
      agenda_template: opData.description,
      outputs: [{
        type: "notes",
        path: opData.output_path
      }]
    }

    await writeFile(scheduleFile, JSON.stringify(scheduleData, null, 2))
    return { success: true, operation }
  }

  // DELETE /api/org/schedule/:id
  const deleteScheduleMatch = pathname.match(/^\/api\/org\/schedule\/([a-z0-9-]+)$/)
  if (deleteScheduleMatch && method === "DELETE") {
    const opId = deleteScheduleMatch[1]
    const scheduleFile = join(ORCAI_DIR, "meetings/schedule.json")

    const content = await readFile(scheduleFile, "utf-8")
    const scheduleData = JSON.parse(content)

    if (scheduleData.recurring && scheduleData.recurring[opId]) {
      delete scheduleData.recurring[opId]
      await writeFile(scheduleFile, JSON.stringify(scheduleData, null, 2))
    }

    return { success: true }
  }

  // GET /api/org/learning/wins
  if (pathname === "/api/org/learning/wins" && method === "GET") {
    const winsDir = join(ORCAI_DIR, "learning/outcomes/wins")
    const files = await readdir(winsDir)
    const mdFiles = files.filter(f => f.endsWith(".md"))

    return mdFiles.map(f => ({
      filename: f,
      path: `/learning/outcomes/wins/${f}`,
    }))
  }

  // GET /api/org/memory/corporate
  if (pathname === "/api/org/memory/corporate" && method === "GET") {
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

  throw new Error(`Unknown API endpoint: ${method} ${pathname}`)
}

console.log(`\n🚀 OrcAI Organization Dashboard`)
console.log(`📊 Dashboard: http://localhost:${PORT}`)
console.log(`🔌 API: http://localhost:${PORT}/api/org`)
console.log(`📁 Data: ${ORCAI_DIR}`)
console.log(`\n✨ Features:`)
console.log(`   • Edit agents via UI`)
console.log(`   • Drag-and-drop org chart`)
console.log(`   • Schedule operations & meetings`)
console.log(`   • Visual reporting relationships`)
console.log(`\n💡 Access remotely: Use ngrok or similar to expose port ${PORT}`)
console.log(`   Example: ngrok http ${PORT}\n`)
