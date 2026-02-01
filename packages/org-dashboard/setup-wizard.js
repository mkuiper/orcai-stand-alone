// Setup wizard for first-time users

function checkFirstTimeSetup() {
  const hasSetup = localStorage.getItem('orcai-setup-complete');

  // Show wizard if first time and has default data
  if (!hasSetup && agents.length <= 6) {
    setTimeout(() => showSetupWizard(), 1000);
  }
}

function showSetupWizard() {
  // Check if human agent needs customization
  const humanAgent = agents.find(a => a.type === 'human');
  if (!humanAgent || humanAgent.name !== 'Your Name') {
    return; // Already customized
  }

  const modal = document.createElement('div');
  modal.className = 'modal active';
  modal.id = 'setup-wizard';
  modal.innerHTML = `
    <div class="modal-content" style="max-width: 700px;">
      <div class="modal-header">
        <h2>🎯 Welcome to OrcAI Organization Dashboard</h2>
      </div>

      <div style="margin: 2rem 0;">
        <h3 style="color: #fff; margin-bottom: 1rem;">Let's set up your organization</h3>

        <p style="color: #e0e0e0; margin-bottom: 1.5rem;">
          Every organization needs a human leader at the top. Let's start by customizing your profile.
        </p>

        <div class="form-group">
          <label>Your Name *</label>
          <input type="text" id="wizard-name" placeholder="e.g., Sarah Chen" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Your Role *</label>
            <input type="text" id="wizard-role" value="Chief Executive Officer" required>
          </div>
          <div class="form-group">
            <label>Avatar (emoji)</label>
            <input type="text" id="wizard-avatar" value="👔" maxlength="2">
          </div>
        </div>

        <div class="form-group">
          <label>Email (optional)</label>
          <input type="email" id="wizard-email" placeholder="you@example.com">
        </div>

        <div class="form-group">
          <label>Organization Name *</label>
          <input type="text" id="wizard-org-name" value="OrcAI Research Lab" required>
        </div>

        <div style="background: #1a3a5a; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0;">
          <h4 style="color: #4a9eff; margin: 0 0 0.5rem 0;">💡 Quick Tips</h4>
          <ul style="color: #e0e0e0; margin: 0; padding-left: 1.5rem; line-height: 1.8;">
            <li><strong>You (human)</strong> will be at the top of the organization</li>
            <li><strong>AI agents</strong> report to humans or other AI agents</li>
            <li><strong>Drag agents</strong> anywhere to organize your layout</li>
            <li><strong>Connect Mode</strong> - click two agents to create relationships</li>
            <li><strong>Snap to Grid</strong> - enable for clean alignment</li>
          </ul>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="skipSetup()">Skip for now</button>
        <button type="button" class="btn btn-primary" onclick="completeSetup()">Get Started →</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

async function completeSetup() {
  const name = document.getElementById('wizard-name').value;
  const role = document.getElementById('wizard-role').value;
  const avatar = document.getElementById('wizard-avatar').value;
  const email = document.getElementById('wizard-email').value;
  const orgName = document.getElementById('wizard-org-name').value;

  if (!name || !role || !orgName) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    // Update the human agent with user's details
    const humanAgent = agents.find(a => a.type === 'human');
    if (humanAgent) {
      humanAgent.name = name;
      humanAgent.role = role;
      humanAgent.avatar = avatar || '👔';
      if (!humanAgent.contact) {
        humanAgent.contact = {};
      }
      if (email) {
        humanAgent.contact.email = email;
      }

      const response = await fetch(`${API_BASE}/agents/${humanAgent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(humanAgent)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
    }

    // Update org name
    if (orgData) {
      orgData.name = orgName;
      const orgResponse = await fetch(`${API_BASE}/structure`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData)
      });
    }

    // Mark setup as complete
    localStorage.setItem('orcai-setup-complete', 'true');

    // Close wizard and reload
    const wizardEl = document.getElementById('setup-wizard');
    if (wizardEl) wizardEl.remove();

    await loadOrganization();
    renderDashboard();

    // Show success message
    alert(`✨ Welcome ${name}! Your organization "${orgName}" is ready. Start by dragging agents to organize your team!`);
  } catch (error) {
    console.error('Setup error:', error);
    alert('Error during setup. Please try again.');
  }
}

function skipSetup() {
  localStorage.setItem('orcai-setup-complete', 'true');
  const wizardEl = document.getElementById('setup-wizard');
  if (wizardEl) wizardEl.remove();
}
