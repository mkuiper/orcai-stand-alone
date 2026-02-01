// Free-form org chart canvas functionality
let connectionMode = false;
let selectedAgent = null;
let agentPositions = {};
let connections = [];
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

// Toggle connection mode
function toggleConnectionMode() {
  connectionMode = !connectionMode;
  const label = document.getElementById('connection-mode-label');
  const canvas = document.getElementById('org-chart-content');

  if (connectionMode) {
    label.textContent = '🔗 Connect Mode: ON';
    canvas.classList.add('connection-mode');
    selectedAgent = null;
  } else {
    label.textContent = '🔗 Connect Mode: OFF';
    canvas.classList.remove('connection-mode');
    if (selectedAgent) {
      const node = document.getElementById(`node-${selectedAgent}`);
      if (node) node.classList.remove('selected');
      selectedAgent = null;
    }
  }
}

// Render free-form org chart
function renderVisualOrgChart() {
  const container = document.getElementById('org-chart-content');
  const svg = document.getElementById('org-connections');

  // Clear existing nodes (but keep SVG)
  const existingNodes = container.querySelectorAll('.org-node-visual');
  existingNodes.forEach(node => node.remove());

  // Load positions from storage or initialize
  loadAgentPositions();

  // Render all agents
  agents.forEach((agent, index) => {
    renderAgentNode(agent, container, index);
  });

  // Load and render connections
  loadConnections();
  drawAllConnections(svg);
}

function loadAgentPositions() {
  // Try to load from localStorage first
  const saved = localStorage.getItem('orcai-agent-positions');
  if (saved) {
    try {
      agentPositions = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load positions:', e);
      initializePositions();
    }
  } else {
    initializePositions();
  }
}

function initializePositions() {
  // Initialize positions in a grid if not set
  const gridCols = 4;
  const spacing = 280;
  const startX = 50;
  const startY = 50;

  agents.forEach((agent, index) => {
    if (!agentPositions[agent.id]) {
      const col = index % gridCols;
      const row = Math.floor(index / gridCols);
      agentPositions[agent.id] = {
        x: startX + col * spacing,
        y: startY + row * spacing
      };
    }
  });

  saveAgentPositions();
}

function saveAgentPositions() {
  localStorage.setItem('orcai-agent-positions', JSON.stringify(agentPositions));
}

function loadConnections() {
  // Build connections from org structure
  connections = [];

  if (orgData && orgData.hierarchy && orgData.hierarchy.structure) {
    Object.keys(orgData.hierarchy.structure).forEach(agentId => {
      const structure = orgData.hierarchy.structure[agentId];
      const agent = agents.find(a => a.id === agentId);

      if (structure.children) {
        structure.children.forEach(childId => {
          connections.push({
            from: agentId,
            to: childId,
            type: 'direct'
          });
        });
      }

      // Dotted line connections
      if (agent && agent.org_structure && agent.org_structure.dotted_line) {
        agent.org_structure.dotted_line.forEach(dottedId => {
          connections.push({
            from: agentId,
            to: dottedId,
            type: 'dotted'
          });
        });
      }
    });
  }
}

function renderAgentNode(agent, container, index) {
  const pos = agentPositions[agent.id] || { x: 50, y: 50 };

  const node = document.createElement('div');
  node.className = `org-node-visual ${agent.type}`;
  node.id = `node-${agent.id}`;
  node.style.left = `${pos.x}px`;
  node.style.top = `${pos.y}px`;
  node.setAttribute('data-agent-id', agent.id);

  node.innerHTML = `
    <button class="delete-btn" onclick="deleteAgent('${agent.id}', event)" title="Delete agent">&times;</button>
    <div style="text-align: center; pointer-events: none;">
      <div style="font-size: 2rem;">${agent.avatar || '👤'}</div>
      <h4 style="margin: 0.5rem 0; color: #fff; font-size: 0.95rem;">${agent.name}</h4>
      <div style="color: #888; font-size: 0.8rem;">${agent.role}</div>
      <span class="badge ${agent.type}" style="margin-top: 0.5rem; font-size: 0.7rem;">${agent.type}</span>
    </div>
  `;

  // Mouse down to start drag
  node.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('delete-btn')) return;

    if (connectionMode) {
      handleConnectionClick(agent.id);
      e.preventDefault();
      return;
    }

    isDragging = true;
    const rect = node.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;

    node.classList.add('dragging');
    node.style.zIndex = '1000';

    const onMouseMove = (e) => {
      if (!isDragging) return;

      const containerRect = container.getBoundingClientRect();
      let newX = e.clientX - containerRect.left - dragOffset.x;
      let newY = e.clientY - containerRect.top - dragOffset.y;

      // Keep within bounds
      newX = Math.max(0, Math.min(newX, containerRect.width - rect.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - rect.height));

      node.style.left = `${newX}px`;
      node.style.top = `${newY}px`;

      agentPositions[agent.id] = { x: newX, y: newY };

      // Redraw connections while dragging
      drawAllConnections(document.getElementById('org-connections'));
    };

    const onMouseUp = () => {
      isDragging = false;
      node.classList.remove('dragging');
      node.style.zIndex = '';
      saveAgentPositions();

      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    e.preventDefault();
  });

  container.appendChild(node);
}

function handleConnectionClick(agentId) {
  if (!selectedAgent) {
    // First agent selected
    selectedAgent = agentId;
    const node = document.getElementById(`node-${agentId}`);
    if (node) node.classList.add('selected');
  } else if (selectedAgent === agentId) {
    // Clicked same agent, deselect
    const node = document.getElementById(`node-${agentId}`);
    if (node) node.classList.remove('selected');
    selectedAgent = null;
  } else {
    // Second agent selected, create connection
    createConnection(selectedAgent, agentId);

    const firstNode = document.getElementById(`node-${selectedAgent}`);
    if (firstNode) firstNode.classList.remove('selected');
    selectedAgent = null;
  }
}

async function createConnection(fromId, toId) {
  // Check if connection already exists
  const exists = connections.some(c =>
    (c.from === fromId && c.to === toId) ||
    (c.from === toId && c.to === fromId)
  );

  if (exists) {
    alert('Connection already exists!');
    return;
  }

  const type = confirm('Direct report? (OK = Yes, Cancel = Dotted line)') ? 'direct' : 'dotted';

  connections.push({ from: fromId, to: toId, type });
  drawAllConnections(document.getElementById('org-connections'));

  // Save to backend
  await updateConnectionsToBackend(fromId, toId, type);
}

async function updateConnectionsToBackend(fromId, toId, type) {
  try {
    const response = await fetch(`${API_BASE}/create-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromId, to: toId, type })
    });

    if (!response.ok) {
      console.error('Failed to save connection');
    }
  } catch (error) {
    console.error('Error saving connection:', error);
  }
}

function drawAllConnections(svg) {
  svg.innerHTML = '';

  // Add arrowhead marker
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  marker.setAttribute('id', 'arrowhead');
  marker.setAttribute('markerWidth', '10');
  marker.setAttribute('markerHeight', '10');
  marker.setAttribute('refX', '9');
  marker.setAttribute('refY', '3');
  marker.setAttribute('orient', 'auto');

  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', '0 0, 10 3, 0 6');
  polygon.setAttribute('fill', '#4a9eff');

  marker.appendChild(polygon);
  defs.appendChild(marker);
  svg.appendChild(defs);

  connections.forEach((conn, index) => {
    const fromPos = agentPositions[conn.from];
    const toPos = agentPositions[conn.to];

    if (!fromPos || !toPos) return;

    // Center of nodes (nodes are 200px wide)
    const x1 = fromPos.x + 100;
    const y1 = fromPos.y + 80;
    const x2 = toPos.x + 100;
    const y2 = toPos.y + 20;

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('marker-end', 'url(#arrowhead)');

    if (conn.type === 'dotted') {
      line.classList.add('dotted');
    }

    // Right-click to delete connection
    line.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (confirm(`Delete connection from ${getAgentName(conn.from)} to ${getAgentName(conn.to)}?`)) {
        deleteConnection(index);
      }
    });

    svg.appendChild(line);
  });
}

function deleteConnection(index) {
  connections.splice(index, 1);
  drawAllConnections(document.getElementById('org-connections'));
  // TODO: Save to backend
}

async function deleteAgent(agentId, event) {
  event.stopPropagation();

  const agent = agents.find(a => a.id === agentId);
  if (!agent) return;

  if (!confirm(`Delete ${agent.name}? This cannot be undone.`)) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/agents/${agentId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      await loadOrganization();
      renderDashboard();
      alert('Agent deleted successfully');
    } else {
      alert('Failed to delete agent');
    }
  } catch (error) {
    console.error('Error deleting agent:', error);
    alert('Error deleting agent');
  }
}

// Create new agent
function createNewAgent() {
  document.getElementById('create-agent-form').reset();
  document.getElementById('create-agent-modal').classList.add('active');
}

function closeCreateModal() {
  document.getElementById('create-agent-modal').classList.remove('active');
}

function toggleCreateLLMFields() {
  const type = document.getElementById('create-type').value;
  document.getElementById('create-llm-fields').style.display = type === 'ai' ? 'block' : 'none';
  document.getElementById('create-human-fields').style.display = type === 'human' ? 'block' : 'none';
}

async function saveNewAgent(event) {
  event.preventDefault();

  const name = document.getElementById('create-name').value;
  const type = document.getElementById('create-type').value;

  // Generate ID from name
  const agentId = name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 30);

  // Check if ID already exists
  if (agents.some(a => a.id === agentId)) {
    alert('An agent with a similar name already exists. Please choose a different name.');
    return;
  }

  const newAgent = {
    id: agentId,
    name: name,
    role: document.getElementById('create-role').value,
    avatar: document.getElementById('create-avatar').value || '👤',
    type: type,
    status: 'active',
    org_structure: {
      reports_to: document.getElementById('create-reports-to').value || null,
      manages: [],
      team: document.getElementById('create-team').value,
      dotted_line: []
    },
    responsibilities: [],
    created_at: new Date().toISOString(),
    last_active: new Date().toISOString()
  };

  if (type === 'ai') {
    newAgent.llm = {
      provider: document.getElementById('create-llm-provider').value,
      model: document.getElementById('create-llm-model').value || 'claude-sonnet-4-5',
      temperature: 0.7,
      max_tokens: 8192,
      reasoning: 'Default configuration'
    };
    newAgent.personality = {
      traits: [],
      communication_style: '',
      decision_making: '',
      focus_areas: []
    };
    newAgent.memory = {
      path: `memory/agents/${agentId}`,
      retention_days: 180,
      context_window: '20k tokens',
      retrieval_strategy: 'semantic + recency'
    };
    newAgent.metrics = {
      decisions_made: 0,
      meetings_attended: 0,
      learnings_contributed: 0,
      hours_active: 0
    };
  } else {
    newAgent.contact = {
      email: document.getElementById('create-contact-email').value || ''
    };
    newAgent.metrics = {
      decisions_made: 0,
      meetings_attended: 0
    };
  }

  try {
    const response = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAgent)
    });

    if (response.ok) {
      closeCreateModal();

      // Position new agent in a free spot
      agentPositions[agentId] = {
        x: 50 + (agents.length % 4) * 280,
        y: 50 + Math.floor(agents.length / 4) * 200
      };
      saveAgentPositions();

      await loadOrganization();
      renderDashboard();
      alert('Agent created successfully!');
    } else {
      const error = await response.json();
      alert(`Failed to create agent: ${error.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error creating agent:', error);
    alert('Error creating agent');
  }
}

// Snap to grid toggle
let snapToGrid = false;
const GRID_SIZE = 40;

function toggleSnapToGrid() {
  snapToGrid = document.getElementById('snap-to-grid').checked;
}

// Improved drag with snap-to-grid (integrated into existing drag logic)
// The snap logic should be added to the onMouseMove handler

// Call setup wizard after initial render
if (typeof checkFirstTimeSetup === 'function') {
  setTimeout(() => checkFirstTimeSetup(), 500);
}
