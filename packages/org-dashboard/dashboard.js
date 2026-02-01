// OrcAI Organization Dashboard
const API_BASE = '/api/org';

// State
let orgData = null;
let agents = [];
let scheduledOps = [];
let currentEditAgent = null;
let draggedNode = null;
let nodePositions = {};

// Initialize
async function init() {
  setupTabs();
  await loadOrganization();
  await loadSchedule();
  renderDashboard();
}

// Tab switching
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;

      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(tabName).classList.add('active');

      // Re-render org chart when tab is activated
      if (tabName === 'org-chart') {
        renderVisualOrgChart();
      }
    });
  });
}

// Load organization data
async function loadOrganization() {
  try {
    const response = await fetch(`${API_BASE}/structure`);
    if (!response.ok) throw new Error('Failed to load organization data');

    orgData = await response.json();

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

// Load schedule
async function loadSchedule() {
  try {
    const response = await fetch(`${API_BASE}/schedule`);
    if (response.ok) {
      scheduledOps = await response.json();
    } else {
      scheduledOps = [];
    }
  } catch (error) {
    console.error('Error loading schedule:', error);
    scheduledOps = [];
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
  renderVisualOrgChart();
  renderScheduler();
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

      <div class="action-buttons">
        <button class="btn btn-primary btn-small" onclick='editAgent("${agent.id}")'>Edit</button>
      </div>
    </div>
  `).join('');
}

// Visual org chart with drag-drop
function renderVisualOrgChart() {
  const container = document.getElementById('org-chart-content');
  const svg = document.getElementById('org-connections');

  // Clear existing nodes
  const existingNodes = container.querySelectorAll('.org-node-visual');
  existingNodes.forEach(node => node.remove());

  // Layout agents
  const root = orgData.hierarchy.root;
  const layout = calculateLayout(root);

  // Render nodes
  renderNode(root, layout, container);

  // Draw connections
  drawConnections(svg);
}

function calculateLayout(rootId, x = 700, y = 50, level = 0) {
  const layout = {};
  const structure = orgData.hierarchy.structure[rootId];
  const children = structure?.children || [];

  layout[rootId] = { x, y, level };

  if (children.length > 0) {
    const spacing = 250;
    const totalWidth = (children.length - 1) * spacing;
    const startX = x - totalWidth / 2;

    children.forEach((childId, index) => {
      const childX = startX + index * spacing;
      const childY = y + 150;
      Object.assign(layout, calculateLayout(childId, childX, childY, level + 1));
    });
  }

  return layout;
}

function renderNode(agentId, layout, container) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;

  const pos = layout[agentId];
  nodePositions[agentId] = pos;

  const node = document.createElement('div');
  node.className = `org-node-visual ${agent.type}`;
  node.id = `node-${agentId}`;
  node.style.left = `${pos.x}px`;
  node.style.top = `${pos.y}px`;
  node.draggable = true;

  node.innerHTML = `
    <div style="text-align: center;">
      <div style="font-size: 2rem;">${agent.avatar || '👤'}</div>
      <h4 style="margin: 0.5rem 0; color: #fff;">${agent.name}</h4>
      <div style="color: #888; font-size: 0.9rem;">${agent.role}</div>
      <span class="badge ${agent.type}" style="margin-top: 0.5rem;">${agent.type}</span>
    </div>
  `;

  // Drag events
  node.addEventListener('dragstart', (e) => {
    draggedNode = agentId;
    node.classList.add('dragging');
  });

  node.addEventListener('dragend', (e) => {
    node.classList.remove('dragging');
    draggedNode = null;
  });

  node.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  node.addEventListener('drop', async (e) => {
    e.preventDefault();
    if (draggedNode && draggedNode !== agentId) {
      await updateReportingRelationship(draggedNode, agentId);
    }
  });

  container.appendChild(node);

  // Render children
  const structure = orgData.hierarchy.structure[agentId];
  const children = structure?.children || [];
  children.forEach(childId => renderNode(childId, layout, container));
}

function drawConnections(svg) {
  svg.innerHTML = '';

  Object.keys(orgData.hierarchy.structure).forEach(agentId => {
    const structure = orgData.hierarchy.structure[agentId];
    const children = structure?.children || [];
    const agent = agents.find(a => a.id === agentId);

    if (!nodePositions[agentId]) return;

    const parentPos = nodePositions[agentId];
    const parentX = parentPos.x + 100; // Center of node
    const parentY = parentPos.y + 100;

    // Direct reports
    children.forEach(childId => {
      if (!nodePositions[childId]) return;
      const childPos = nodePositions[childId];
      const childX = childPos.x + 100;
      const childY = childPos.y;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', parentX);
      line.setAttribute('y1', parentY);
      line.setAttribute('x2', childX);
      line.setAttribute('y2', childY);
      svg.appendChild(line);
    });

    // Dotted lines for matrix reporting
    if (agent?.org_structure?.dotted_line) {
      agent.org_structure.dotted_line.forEach(dottedId => {
        if (!nodePositions[dottedId]) return;
        const dottedPos = nodePositions[dottedId];
        const dottedX = dottedPos.x + 100;
        const dottedY = dottedPos.y + 100;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', parentX);
        line.setAttribute('y1', parentY);
        line.setAttribute('x2', dottedX);
        line.setAttribute('y2', dottedY);
        line.classList.add('dotted');
        svg.appendChild(line);
      });
    }
  });
}

async function updateReportingRelationship(childId, newParentId) {
  if (!confirm(`Make ${getAgentName(childId)} report to ${getAgentName(newParentId)}?`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/update-reporting`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ childId, newParentId })
    });

    if (response.ok) {
      await loadOrganization();
      renderVisualOrgChart();
      alert('Reporting relationship updated!');
    } else {
      alert('Failed to update reporting relationship');
    }
  } catch (error) {
    console.error('Error updating relationship:', error);
    alert('Error updating reporting relationship');
  }
}

// Agent editing
function editAgent(agentId) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;

  currentEditAgent = agent;

  document.getElementById('edit-agent-id').value = agent.id;
  document.getElementById('edit-name').value = agent.name;
  document.getElementById('edit-role').value = agent.role;
  document.getElementById('edit-avatar').value = agent.avatar || '';
  document.getElementById('edit-type').value = agent.type;
  document.getElementById('edit-status').value = agent.status;
  document.getElementById('edit-team').value = agent.org_structure.team;
  document.getElementById('edit-reports-to').value = agent.org_structure.reports_to || '';

  if (agent.type === 'ai' && agent.llm) {
    document.getElementById('edit-llm-provider').value = agent.llm.provider;
    document.getElementById('edit-llm-model').value = agent.llm.model;
    document.getElementById('edit-llm-temperature').value = agent.llm.temperature || 0.7;
    document.getElementById('edit-llm-max-tokens').value = agent.llm.max_tokens || 8192;
  }

  if (agent.type === 'human' && agent.contact) {
    document.getElementById('edit-contact-email').value = agent.contact.email || '';
    document.getElementById('edit-contact-slack').value = agent.contact.slack || '';
  }

  if (agent.responsibilities) {
    document.getElementById('edit-responsibilities').value = agent.responsibilities.join('\n');
  }

  toggleLLMFields();
  document.getElementById('edit-agent-modal').classList.add('active');
}

function toggleLLMFields() {
  const type = document.getElementById('edit-type').value;
  document.getElementById('llm-fields').style.display = type === 'ai' ? 'block' : 'none';
  document.getElementById('human-fields').style.display = type === 'human' ? 'block' : 'none';
}

function closeEditModal() {
  document.getElementById('edit-agent-modal').classList.remove('active');
  currentEditAgent = null;
}

async function saveAgent(event) {
  event.preventDefault();

  const agentId = document.getElementById('edit-agent-id').value;
  const type = document.getElementById('edit-type').value;

  const updatedAgent = {
    ...currentEditAgent,
    name: document.getElementById('edit-name').value,
    role: document.getElementById('edit-role').value,
    avatar: document.getElementById('edit-avatar').value,
    type: type,
    status: document.getElementById('edit-status').value,
    org_structure: {
      ...currentEditAgent.org_structure,
      team: document.getElementById('edit-team').value,
      reports_to: document.getElementById('edit-reports-to').value || null
    },
    responsibilities: document.getElementById('edit-responsibilities').value.split('\n').filter(r => r.trim())
  };

  if (type === 'ai') {
    updatedAgent.llm = {
      provider: document.getElementById('edit-llm-provider').value,
      model: document.getElementById('edit-llm-model').value,
      temperature: parseFloat(document.getElementById('edit-llm-temperature').value),
      max_tokens: parseInt(document.getElementById('edit-llm-max-tokens').value),
      reasoning: currentEditAgent.llm?.reasoning || ''
    };
  } else {
    updatedAgent.contact = {
      email: document.getElementById('edit-contact-email').value,
      slack: document.getElementById('edit-contact-slack').value
    };
  }

  try {
    const response = await fetch(`${API_BASE}/agents/${agentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedAgent)
    });

    if (response.ok) {
      closeEditModal();
      await loadOrganization();
      renderDashboard();
      alert('Agent updated successfully!');
    } else {
      alert('Failed to update agent');
    }
  } catch (error) {
    console.error('Error saving agent:', error);
    alert('Error saving agent');
  }
}

// Scheduler
function renderScheduler() {
  const container = document.getElementById('scheduler-content');

  if (scheduledOps.length === 0) {
    container.innerHTML = `
      <div class="card">
        <p style="color: #888;">No scheduled operations yet. Create your first meeting or automated task!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="grid">
      ${scheduledOps.map(op => `
        <div class="card">
          <h3>${op.name}</h3>
          <div style="margin: 0.5rem 0;">
            <span class="badge ${op.type === 'meeting' ? 'ai' : 'human'}">${op.type}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Schedule</span>
            <span class="info-value">${op.cron}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Agents</span>
            <span class="info-value">${op.agents.join(', ')}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration</span>
            <span class="info-value">${op.duration_minutes}min</span>
          </div>
          ${op.description ? `
            <p style="color: #888; margin-top: 0.5rem; font-size: 0.9rem;">${op.description}</p>
          ` : ''}
          <div class="action-buttons">
            <button class="btn btn-primary btn-small" onclick='editScheduledOp("${op.id}")'>Edit</button>
            <button class="btn btn-danger btn-small" onclick='deleteScheduledOp("${op.id}")'>Delete</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function createScheduledOperation() {
  document.getElementById('scheduler-modal-title').textContent = 'New Scheduled Operation';
  document.getElementById('scheduler-form').reset();
  document.getElementById('sched-id').value = '';
  document.getElementById('scheduler-modal').classList.add('active');
}

function createMeeting() {
  document.getElementById('scheduler-modal-title').textContent = 'New Meeting';
  document.getElementById('scheduler-form').reset();
  document.getElementById('sched-type').value = 'meeting';
  document.getElementById('sched-id').value = '';
  document.getElementById('scheduler-modal').classList.add('active');
}

function closeSchedulerModal() {
  document.getElementById('scheduler-modal').classList.remove('active');
}

async function saveScheduledOperation(event) {
  event.preventDefault();

  const operation = {
    id: document.getElementById('sched-id').value || `op-${Date.now()}`,
    name: document.getElementById('sched-name').value,
    type: document.getElementById('sched-type').value,
    cron: document.getElementById('sched-cron').value,
    agents: document.getElementById('sched-agents').value.split(',').map(a => a.trim()),
    description: document.getElementById('sched-description').value,
    duration_minutes: parseInt(document.getElementById('sched-duration').value),
    output_path: document.getElementById('sched-output').value
  };

  try {
    const response = await fetch(`${API_BASE}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(operation)
    });

    if (response.ok) {
      closeSchedulerModal();
      await loadSchedule();
      renderScheduler();
      alert('Operation scheduled successfully!');
    } else {
      alert('Failed to save operation');
    }
  } catch (error) {
    console.error('Error saving operation:', error);
    alert('Error saving operation');
  }
}

async function deleteScheduledOp(opId) {
  if (!confirm('Delete this scheduled operation?')) return;

  try {
    const response = await fetch(`${API_BASE}/schedule/${opId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await loadSchedule();
      renderScheduler();
      alert('Operation deleted');
    }
  } catch (error) {
    console.error('Error deleting operation:', error);
  }
}

// Activity
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

// Memory
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

// Helpers
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

// Start
init();
