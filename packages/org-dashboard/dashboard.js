// OrcAI Organization Dashboard
const API_BASE = '/api/org';

// State
let orgData = null;
let agents = [];

// Initialize
async function init() {
  setupTabs();
  await loadOrganization();
  renderDashboard();
}

// Tab switching
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;

      // Update active tab
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update active content
      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(tabName).classList.add('active');
    });
  });
}

// Load organization data
async function loadOrganization() {
  try {
    const response = await fetch(`${API_BASE}/structure`);
    if (!response.ok) throw new Error('Failed to load organization data');

    orgData = await response.json();

    // Load all agents
    const agentIds = Object.keys(orgData.hierarchy.structure);
    agents = await Promise.all(
      agentIds.map(async id => {
        try {
          const res = await fetch(`${API_BASE}/agents/${id}`);
          return await res.json();
        } catch (err) {
          console.error(`Failed to load agent ${id}:`, err);
          return null;
        }
      })
    );

    agents = agents.filter(a => a !== null);
  } catch (error) {
    console.error('Error loading organization:', error);
    showError('Failed to load organization data. Make sure the API server is running.');
  }
}

// Render dashboard
function renderDashboard() {
  if (!orgData || agents.length === 0) {
    showError('No organization data available');
    return;
  }

  renderStats();
  renderAgentsGrid();
  renderOrgChart();
  renderActivity();
  renderMemory();
}

// Render stats
function renderStats() {
  const stats = document.getElementById('stats');
  const aiAgents = agents.filter(a => a.type === 'ai').length;
  const humanAgents = agents.filter(a => a.type === 'human').length;
  const activeAgents = agents.filter(a => a.status === 'active').length;

  stats.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${agents.length}</div>
      <div class="stat-label">Total Agents</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${aiAgents}</div>
      <div class="stat-label">AI Agents</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${humanAgents}</div>
      <div class="stat-label">Human Agents</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${activeAgents}</div>
      <div class="stat-label">Active</div>
    </div>
  `;
}

// Render agents grid
function renderAgentsGrid() {
  const grid = document.getElementById('agents-grid');

  grid.innerHTML = agents.map(agent => `
    <div class="card">
      <div class="card-header">
        <div class="avatar">${agent.avatar || '👤'}</div>
        <div class="card-title">
          <h3>${agent.name}</h3>
          <div class="role">${agent.role}</div>
        </div>
      </div>

      <div style="margin-bottom: 1rem;">
        <span class="badge ${agent.type}">${agent.type}</span>
        <span class="badge ${agent.status}">${agent.status}</span>
      </div>

      ${agent.llm ? `
        <div class="info-row">
          <span class="info-label">Model</span>
          <span class="info-value">${agent.llm.model}</span>
        </div>
      ` : ''}

      <div class="info-row">
        <span class="info-label">Team</span>
        <span class="info-value">${agent.org_structure.team}</span>
      </div>

      ${agent.org_structure.reports_to ? `
        <div class="info-row">
          <span class="info-label">Reports To</span>
          <span class="info-value">${getAgentName(agent.org_structure.reports_to)}</span>
        </div>
      ` : ''}

      ${agent.org_structure.manages && agent.org_structure.manages.length > 0 ? `
        <div class="info-row">
          <span class="info-label">Manages</span>
          <span class="info-value">${agent.org_structure.manages.length} agent(s)</span>
        </div>
      ` : ''}

      ${agent.contact ? `
        <div class="info-row">
          <span class="info-label">Contact</span>
          <span class="info-value">${agent.contact.email || agent.contact.slack || 'N/A'}</span>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// Render org chart
function renderOrgChart() {
  const container = document.getElementById('org-chart-content');
  const root = orgData.hierarchy.root;

  container.innerHTML = renderOrgNode(root);
}

function renderOrgNode(agentId, level = 0) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return '';

  const structure = orgData.hierarchy.structure[agentId];
  const children = structure?.children || [];

  return `
    <div class="org-node ${agent.type}" style="margin-left: ${level * 2}rem;">
      <div class="avatar" style="font-size: 2rem;">${agent.avatar || '👤'}</div>
      <h3 style="margin: 0.5rem 0;">${agent.name}</h3>
      <div style="color: #888; font-size: 0.9rem;">${agent.role}</div>
      <div style="margin-top: 0.5rem;">
        <span class="badge ${agent.type}">${agent.type}</span>
      </div>
    </div>
    ${children.length > 0 ? `
      <div class="org-children">
        ${children.map(childId => renderOrgNode(childId, level + 1)).join('')}
      </div>
    ` : ''}
  `;
}

// Render activity
function renderActivity() {
  const container = document.getElementById('activity');

  container.innerHTML = `
    <div class="card">
      <h3 style="margin-bottom: 1rem;">Recent Learnings</h3>
      <p style="color: #888;">Loading learning outcomes...</p>
    </div>
    <div class="card" style="margin-top: 1rem;">
      <h3 style="margin-bottom: 1rem;">Recent Decisions</h3>
      <p style="color: #888;">Loading decisions...</p>
    </div>
  `;
}

// Render memory
function renderMemory() {
  const container = document.getElementById('memory-content');

  container.innerHTML = `
    <div class="grid">
      <div class="card">
        <h3>Corporate Memory</h3>
        <p style="color: #888; margin-top: 0.5rem;">Principles, decisions, and knowledge base</p>
        <div style="margin-top: 1rem;">
          <a href="#" style="color: #4a9eff;">View Principles →</a>
        </div>
      </div>
      <div class="card">
        <h3>Team Memory</h3>
        <p style="color: #888; margin-top: 0.5rem;">Team-specific knowledge and processes</p>
        <div style="margin-top: 1rem;">
          <a href="#" style="color: #4a9eff;">Browse Teams →</a>
        </div>
      </div>
      <div class="card">
        <h3>Agent Memory</h3>
        <p style="color: #888; margin-top: 0.5rem;">Personal context and notes</p>
        <div style="margin-top: 1rem;">
          <a href="#" style="color: #4a9eff;">View Agents →</a>
        </div>
      </div>
    </div>
  `;
}

// Helper functions
function getAgentName(agentId) {
  const agent = agents.find(a => a.id === agentId);
  return agent ? agent.name : agentId;
}

function showError(message) {
  document.querySelector('.container').innerHTML += `
    <div class="error" style="margin-top: 2rem;">
      <h3>Error</h3>
      <p>${message}</p>
    </div>
  `;
}

// Start the app
init();
