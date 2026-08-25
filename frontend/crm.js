// --- LMScraper CRM JavaScript Engine ---

const ICONS = {
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  twitter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`
};

// Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  if (container.children.length > 4) {
    container.removeChild(container.firstChild);
  }

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 300ms ease';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4500);
}

// Custom Modal Confirmation (No native browser alerts/confirms)
let confirmResolver = null;
function confirmAction(message) {
  return new Promise((resolve) => {
    document.getElementById('crm-confirm-message').textContent = message;
    crm.openModal('crm-confirm-modal');
    confirmResolver = resolve;
  });
}

async function apiCall(path, method = 'GET', body = null) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(path, options);
  if (!res.ok) {
    let errStr = res.statusText;
    try {
      const errJson = await res.json();
      if (errJson.detail) errStr = errJson.detail;
    } catch (e) {}
    throw new Error(errStr);
  }
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch (e) {
    return text;
  }
}

const crm = {
  organizers: [],
  currentOrganizer: null,
  templates: [],
  selectedIds: new Set(),
  activeFilters: {
    overdue: false,
    has_email: false,
    has_ig: false,
    has_wa: false
  },

  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('hidden');
  },

  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  },

  confirmAction(message) {
    return confirmAction(message);
  },

  async init() {
    this.bindEvents();
    await this.loadTemplates();
    await this.loadOrganizers();
    await this.loadAlertsCount();
    lucide.createIcons();
  },

  bindEvents() {
    // Custom Confirm Modal handlers
    document.getElementById('btn-crm-confirm-cancel').addEventListener('click', () => {
      this.closeModal('crm-confirm-modal');
      if (confirmResolver) confirmResolver(false);
    });
    document.getElementById('btn-crm-confirm-ok').addEventListener('click', () => {
      this.closeModal('crm-confirm-modal');
      if (confirmResolver) confirmResolver(true);
    });

    // Tabs switcher
    document.querySelectorAll('.tab-switch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-switch-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
        
        btn.classList.add('active');
        const targetId = `tab-${btn.dataset.tab}`;
        const targetView = document.getElementById(targetId);
        if (targetView) targetView.classList.add('active');
        
        if (btn.dataset.tab === 'crm-alerts') {
          this.loadAlerts();
        }
      });
    });

    // Search and filters
    document.getElementById('crm-search').addEventListener('input', () => this.renderList());
    document.getElementById('crm-filter-stage').addEventListener('change', () => this.renderList());
    document.getElementById('crm-filter-contact').addEventListener('change', () => this.renderList());
    document.getElementById('crm-sort').addEventListener('change', () => this.renderList());
    document.getElementById('crm-filter-status').addEventListener('change', () => this.renderList());

    // Reset filters
    document.getElementById('btn-clear-filters').addEventListener('click', () => {
      document.getElementById('crm-search').value = '';
      document.getElementById('crm-filter-stage').value = '';
      document.getElementById('crm-filter-contact').value = '';
      document.getElementById('crm-sort').value = 'alpha_asc';
      document.getElementById('crm-filter-status').value = '';
      this.renderList();
    });

    // Sync button
    const btnSync = document.getElementById('btn-crm-sync');
    btnSync.addEventListener('click', async () => {
      btnSync.disabled = true;
      btnSync.innerHTML = '<i data-lucide="refresh-cw" class="spin"></i> Syncing...';
      lucide.createIcons();
      try {
        const res = await apiCall('/api/crm/sync', 'POST');
        await this.loadOrganizers();
        await this.loadAlertsCount();
        showToast(`Sync completed: ${res.new || 0} new organizers added, ${res.updated || 0} existing contacts enriched from ${res.total_events || 0} scraped events.`, 'success');
      } catch (err) {
        showToast('Sync error: ' + err.message, 'error');
      } finally {
        btnSync.disabled = false;
        btnSync.innerHTML = '<i data-lucide="refresh-cw"></i> Sync Organizers';
        lucide.createIcons();
      }
    });

    // Organizer Stage Change
    document.getElementById('crm-detail-stage').addEventListener('change', async (e) => {
      if (!this.currentOrganizer) return;
      const newStage = e.target.value;
      try {
        await apiCall(`/api/crm/organizers/${this.currentOrganizer.id}`, 'PATCH', { pipeline_stage: newStage });
        this.currentOrganizer.pipeline_stage = newStage;
        
        // Update in list array
        const found = this.organizers.find(o => o.id === this.currentOrganizer.id);
        if (found) found.pipeline_stage = newStage;
        
        this.renderList();
        await this.loadTimeline(this.currentOrganizer.id);
        showToast(`Stage updated to "${newStage}"`, 'success');
      } catch (err) {
        showToast('Failed to update stage: ' + err.message, 'error');
      }
    });

    // Notes auto-save on blur
    const notesEl = document.getElementById('crm-detail-notes');
    notesEl.addEventListener('blur', async () => {
      if (!this.currentOrganizer) return;
      if (this.currentOrganizer.notes === notesEl.value) return;
      try {
        await apiCall(`/api/crm/organizers/${this.currentOrganizer.id}`, 'PATCH', { notes: notesEl.value });
        this.currentOrganizer.notes = notesEl.value;
        showToast('Notes saved', 'info');
      } catch (err) {
        showToast('Failed to save notes: ' + err.message, 'error');
      }
    });

    // Archive / Unarchive / Hard Delete
    document.getElementById('btn-crm-archive').addEventListener('click', async () => {
      if (!this.currentOrganizer) return;
      const confirmed = await confirmAction(`Archive "${this.currentOrganizer.name || 'this organizer'}"? It will be hidden unless you filter by 'Archived'.`);
      if (!confirmed) return;
      try {
        await apiCall(`/api/crm/organizers/${this.currentOrganizer.id}/archive`, 'POST');
        this.currentOrganizer.is_archived = 1;
        this.renderList();
        this.renderDetail(this.currentOrganizer);
        showToast('Organizer archived', 'info');
      } catch (err) {
        showToast('Failed to archive: ' + err.message, 'error');
      }
    });

    document.getElementById('btn-crm-unarchive')?.addEventListener('click', async () => {
      if (!this.currentOrganizer) return;
      try {
        await apiCall(`/api/crm/organizers/${this.currentOrganizer.id}/unarchive`, 'POST');
        this.currentOrganizer.is_archived = 0;
        this.renderList();
        this.renderDetail(this.currentOrganizer);
        showToast('Organizer unarchived', 'success');
      } catch (err) {
        showToast('Failed to unarchive: ' + err.message, 'error');
      }
    });

    document.getElementById('btn-crm-hard-delete')?.addEventListener('click', async () => {
      if (!this.currentOrganizer) return;
      const confirmed = await confirmAction(`PERMANENTLY DELETE "${this.currentOrganizer.name || 'this organizer'}"? This cannot be undone.`);
      if (!confirmed) return;
      try {
        await apiCall(`/api/crm/organizers/${this.currentOrganizer.id}`, 'DELETE');
        this.organizers = this.organizers.filter(o => o.id !== this.currentOrganizer.id);
        this.currentOrganizer = null;
        document.getElementById('crm-detail-content').classList.remove('active');
        document.getElementById('crm-empty-state').style.display = 'flex';
        this.renderList();
        showToast('Organizer deleted forever', 'success');
      } catch (err) {
        showToast('Failed to delete: ' + err.message, 'error');
      }
    });

    // Settings Modal
    document.getElementById('btn-crm-settings').addEventListener('click', async () => {
      try {
        const res = await apiCall('/api/crm/settings/crm_your_name');
        document.getElementById('crm-setting-your-name').value = res.value || '';
      } catch (e) {}
      this.openModal('crm-settings-modal');
    });

    document.getElementById('btn-save-crm-settings').addEventListener('click', async () => {
      const val = document.getElementById('crm-setting-your-name').value.trim();
      await apiCall('/api/crm/settings/crm_your_name', 'PUT', { value: val });
      this.closeModal('crm-settings-modal');
      showToast('Settings saved successfully', 'success');
    });

    // AI Assist Modal
    document.getElementById('btn-crm-ai-assist').addEventListener('click', () => {
      if (!this.currentOrganizer) return;
      this.populateTemplateDropdown();
      this.openModal('crm-ai-modal');
      lucide.createIcons();
    });

    document.getElementById('crm-ai-lang').addEventListener('change', () => {
      this.populateTemplateDropdown();
    });

    document.getElementById('crm-ai-template').addEventListener('change', () => {
      this.generateDraft();
    });

    document.getElementById('btn-crm-ai-copy').addEventListener('click', () => {
      const body = document.getElementById('crm-ai-body').value;
      navigator.clipboard.writeText(body);
      
      // Auto-log contact attempt
      if (this.currentOrganizer) {
        const tmplId = document.getElementById('crm-ai-template').value;
        const tmpl = this.templates.find(t => t.id == tmplId);
        apiCall(`/api/crm/interactions/${this.currentOrganizer.id}`, 'POST', {
          type: 'contact_attempt',
          channel: tmpl ? tmpl.channel : 'email',
          body: `Outreach draft copied: "${document.getElementById('crm-ai-subject').value || tmpl?.name}"`
        }).then(() => this.loadTimeline(this.currentOrganizer.id));
      }
      
      showToast('Message body copied to clipboard!', 'success');
      this.closeModal('crm-ai-modal');
    });

    document.getElementById('btn-crm-ai-open').addEventListener('click', () => {
      if (!this.currentOrganizer) return;
      const body = document.getElementById('crm-ai-body').value;
      const subject = document.getElementById('crm-ai-subject').value;
      const tmplId = document.getElementById('crm-ai-template').value;
      const tmpl = this.templates.find(t => t.id == tmplId);
      const channel = tmpl ? tmpl.channel : 'email';

      let opened = false;
      if (channel === 'email' && this.currentOrganizer.email) {
        window.open(`mailto:${this.currentOrganizer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
        opened = true;
      } else if (channel === 'instagram' && this.currentOrganizer.instagram) {
        navigator.clipboard.writeText(body);
        showToast('Message copied to clipboard! Opening Instagram profile...', 'info');
        window.open(this.currentOrganizer.instagram, '_blank');
        opened = true;
      } else if (channel === 'whatsapp' && this.currentOrganizer.whatsapp) {
        const cleanPhone = this.currentOrganizer.whatsapp.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(body)}`, '_blank');
        opened = true;
      }

      if (opened) {
        apiCall(`/api/crm/interactions/${this.currentOrganizer.id}`, 'POST', {
          type: 'contact_attempt',
          channel: channel,
          body: `Opened direct channel (${channel}) to send draft: "${subject || tmpl?.name}"`
        }).then(() => this.loadTimeline(this.currentOrganizer.id));
        this.closeModal('crm-ai-modal');
      } else {
        showToast(`No valid ${channel} contact details found for this organizer.`, 'error');
      }
    });

    // Log Interaction Modal
    document.getElementById('btn-crm-add-log').addEventListener('click', () => {
      if (!this.currentOrganizer) return;
      document.getElementById('crm-log-body').value = '';
      this.openModal('crm-log-modal');
    });

    document.getElementById('btn-crm-submit-log').addEventListener('click', async () => {
      if (!this.currentOrganizer) return;
      const type = document.getElementById('crm-log-type').value;
      const channel = document.getElementById('crm-log-channel').value;
      const body = document.getElementById('crm-log-body').value.trim();

      if (!body) {
        showToast('Please enter a note for this interaction.', 'error');
        return;
      }

      try {
        await apiCall(`/api/crm/interactions/${this.currentOrganizer.id}`, 'POST', {
          type,
          channel: type === 'contact_attempt' ? channel : null,
          body
        });
        this.closeModal('crm-log-modal');
        await this.loadTimeline(this.currentOrganizer.id);
        await this.loadOrganizers();
        showToast('Interaction logged successfully', 'success');
      } catch (err) {
        showToast('Failed to save interaction: ' + err.message, 'error');
      }
    });

    // Edit Interaction Submit
    document.getElementById('btn-crm-submit-edit-log').addEventListener('click', async () => {
      const logId = document.getElementById('crm-edit-log-id').value;
      const body = document.getElementById('crm-edit-log-body').value.trim();

      if (!logId) return;

      try {
        await apiCall(`/api/crm/interactions/${logId}`, 'PATCH', { body });
        this.closeModal('crm-edit-log-modal');
        if (this.currentOrganizer) {
          await this.loadTimeline(this.currentOrganizer.id);
        }
        showToast('Interaction updated successfully', 'success');
      } catch (err) {
        showToast('Failed to update interaction: ' + err.message, 'error');
      }
    });

    // Edit Organizer Profile Modals
    const btnEditProfile = document.getElementById('btn-crm-edit-profile');
    if (btnEditProfile) {
      btnEditProfile.addEventListener('click', () => {
        if (!this.currentOrganizer) return;
        document.getElementById('edit-org-name').value = this.currentOrganizer.name || '';
        document.getElementById('edit-org-email').value = this.currentOrganizer.email || '';
        document.getElementById('edit-org-phone').value = this.currentOrganizer.phone || '';
        document.getElementById('edit-org-instagram').value = this.currentOrganizer.instagram || '';
        document.getElementById('edit-org-whatsapp').value = this.currentOrganizer.whatsapp || '';
        document.getElementById('edit-org-website').value = this.currentOrganizer.website || '';
        document.getElementById('edit-org-city').value = this.currentOrganizer.city || '';
        document.getElementById('edit-org-country').value = this.currentOrganizer.country || '';
        
        this.openModal('crm-edit-org-modal');
      });
    }

    const btnSubmitEditOrg = document.getElementById('btn-crm-submit-edit-org');
    if (btnSubmitEditOrg) {
      btnSubmitEditOrg.addEventListener('click', async () => {
        if (!this.currentOrganizer) return;
        
        const payload = {
          name: document.getElementById('edit-org-name').value.trim() || null,
          email: document.getElementById('edit-org-email').value.trim() || null,
          phone: document.getElementById('edit-org-phone').value.trim() || null,
          instagram: document.getElementById('edit-org-instagram').value.trim() || null,
          whatsapp: document.getElementById('edit-org-whatsapp').value.trim() || null,
          website: document.getElementById('edit-org-website').value.trim() || null,
          city: document.getElementById('edit-org-city').value.trim() || null,
          country: document.getElementById('edit-org-country').value.trim() || null,
        };

        try {
          await apiCall(`/api/crm/organizers/${this.currentOrganizer.id}`, 'PATCH', payload);
          showToast('Profile updated successfully', 'success');
          this.closeModal('crm-edit-org-modal');
          await this.loadOrganizers();
          await this.selectOrganizer(this.currentOrganizer.id);
        } catch (err) {
          showToast('Failed to update profile: ' + err.message, 'error');
        }
      });
    }

    // Refresh Alerts
    document.getElementById('btn-refresh-alerts').addEventListener('click', () => {
      this.loadAlerts();
      showToast('Checked for duplicate alerts', 'info');
    });

    // Bulk Actions
    const selectAllCheckbox = document.getElementById('crm-select-all');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const visibleCheckboxes = document.querySelectorAll('.org-bulk-check');
        if (e.target.checked) {
          visibleCheckboxes.forEach(cb => { cb.checked = true; this.selectedIds.add(cb.value); });
        } else {
          visibleCheckboxes.forEach(cb => { cb.checked = false; this.selectedIds.delete(cb.value); });
        }
        this.updateBulkActionsBar();
      });
    }

    const bulkStageSelect = document.getElementById('bulk-stage-select');
    if (bulkStageSelect) {
      bulkStageSelect.addEventListener('change', async (e) => {
        const newStage = e.target.value;
        if (!newStage) return;
        if (this.selectedIds.size === 0) return;
        
        const confirmed = await confirmAction(`Move ${this.selectedIds.size} organizers to "${newStage}"?`);
        if (confirmed) {
          try {
            await apiCall('/api/crm/organizers/bulk-action', 'POST', {
              action: 'update_stage',
              ids: Array.from(this.selectedIds),
              value: newStage
            });
            showToast(`Updated ${this.selectedIds.size} organizers`, 'success');
            this.selectedIds.clear();
            await this.loadOrganizers();
          } catch (err) {
            showToast('Bulk update failed: ' + err.message, 'error');
          }
        }
        e.target.value = ''; // Reset select
      });
    }

    const btnBulkMerge = document.getElementById('btn-bulk-merge');
    if (btnBulkMerge) {
      btnBulkMerge.addEventListener('click', async () => {
        if (this.selectedIds.size !== 2) return;
        const [id1, id2] = Array.from(this.selectedIds);
        const org1 = this.organizers.find(o => o.id === id1);
        const org2 = this.organizers.find(o => o.id === id2);
        
        // Merge org2 into org1
        const confirmed = await confirmAction(`Merge "${org2.name || 'Organizer 2'}" into "${org1.name || 'Organizer 1'}"?\n\nThe second contact will be archived and its data/events transferred to the first.`);
        if (confirmed) {
          try {
            await apiCall('/api/crm/merge', 'POST', { primary_id: id1, secondary_id: id2 });
            showToast('Organizers merged successfully!', 'success');
            this.selectedIds.clear();
            await this.loadOrganizers();
          } catch (err) {
            showToast('Merge failed: ' + err.message, 'error');
          }
        }
      });
    }

    const btnBulkArchive = document.getElementById('btn-bulk-archive');
    if (btnBulkArchive) {
      btnBulkArchive.addEventListener('click', async () => {
        if (this.selectedIds.size === 0) return;
        const confirmed = await confirmAction(`Archive ${this.selectedIds.size} selected organizers? They will be hidden unless you filter by 'Archived'.`);
        if (confirmed) {
          try {
            await apiCall('/api/crm/organizers/bulk-action', 'POST', {
              action: 'archive',
              ids: Array.from(this.selectedIds)
            });
            showToast(`Archived ${this.selectedIds.size} organizers`, 'info');
            this.selectedIds.clear();
            await this.loadOrganizers();
          } catch (err) {
            showToast('Bulk archive failed: ' + err.message, 'error');
          }
        }
      });
    }

    const btnBulkUnarchive = document.getElementById('btn-bulk-unarchive');
    if (btnBulkUnarchive) {
      btnBulkUnarchive.addEventListener('click', async () => {
        if (this.selectedIds.size === 0) return;
        try {
          await apiCall('/api/crm/organizers/bulk-action', 'POST', {
            action: 'unarchive',
            ids: Array.from(this.selectedIds)
          });
          showToast(`Unarchived ${this.selectedIds.size} organizers`, 'success');
          this.selectedIds.clear();
          await this.loadOrganizers();
        } catch (err) {
          showToast('Bulk unarchive failed: ' + err.message, 'error');
        }
      });
    }

    const btnBulkHardDelete = document.getElementById('btn-bulk-hard-delete');
    if (btnBulkHardDelete) {
      btnBulkHardDelete.addEventListener('click', async () => {
        if (this.selectedIds.size === 0) return;
        const confirmed = await confirmAction(`PERMANENTLY DELETE ${this.selectedIds.size} selected organizers? This cannot be undone.`);
        if (confirmed) {
          try {
            await apiCall('/api/crm/organizers/bulk-action', 'POST', {
              action: 'delete',
              ids: Array.from(this.selectedIds)
            });
            showToast(`Permanently deleted ${this.selectedIds.size} organizers`, 'success');
            this.selectedIds.clear();
            await this.loadOrganizers();
          } catch (err) {
            showToast('Bulk delete failed: ' + err.message, 'error');
          }
        }
      });
    }

    // ESC to close any modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
        if (confirmResolver) confirmResolver(false);
      }
    });
  },

  async loadOrganizers() {
    try {
      this.organizers = await apiCall('/api/crm/organizers');
      this.renderList();
      if (this.currentOrganizer) {
        const stillExists = this.organizers.find(o => o.id === this.currentOrganizer.id);
        if (stillExists) {
          this.selectOrganizer(stillExists.id);
        } else {
          document.getElementById('crm-detail-content').classList.remove('active');
          document.getElementById('crm-empty-state').style.display = 'flex';
        }
      }
    } catch (e) {
      console.error('Failed to load organizers:', e);
    }
  },

  renderList() {
    const listContainer = document.getElementById('crm-organizers-list');
    listContainer.innerHTML = '';

    const search = document.getElementById('crm-search').value.toLowerCase().trim();
    const stage = document.getElementById('crm-filter-stage').value;
    const contactFilter = document.getElementById('crm-filter-contact').value;
    const sortMode = document.getElementById('crm-sort').value;
    const statusFilter = document.getElementById('crm-filter-status').value;
    const now = new Date();

    let filtered = this.organizers.filter(org => {
      // Search
      if (search) {
        const nameMatch = (org.name || '').toLowerCase().includes(search);
        const emailMatch = (org.email || '').toLowerCase().includes(search);
        const cityMatch = (org.city || '').toLowerCase().includes(search);
        const countryMatch = (org.country || '').toLowerCase().includes(search);
        const phoneMatch = (org.phone || '').toLowerCase().includes(search);
        const igMatch = (org.instagram || '').toLowerCase().includes(search);
        const eventMatch = (Array.isArray(org.event_names) && org.event_names.some(t => (t || '').toLowerCase().includes(search))) ||
                           (Array.isArray(org.events) && org.events.some(e => (e.title || '').toLowerCase().includes(search)));
        if (!nameMatch && !emailMatch && !cityMatch && !countryMatch && !phoneMatch && !igMatch && !eventMatch) return false;
      }

      // Stage
      if (stage && org.pipeline_stage !== stage) return false;

      // Contact Filter
      if (contactFilter === 'any') {
        if (!org.email && !org.instagram && !org.whatsapp && !org.phone && !org.facebook && !org.tiktok && !org.website) return false;
      } else if (contactFilter === 'none') {
        if (org.email || org.instagram || org.whatsapp || org.phone || org.facebook || org.tiktok || org.website) return false;
      } else if (contactFilter) {
        if (!org[contactFilter]) return false;
      }

      // Status & Archived
      if (statusFilter === 'archived') {
        if (org.is_archived !== 1) return false;
      } else {
        if (org.is_archived === 1) return false; // Hide archived by default
        
        if (statusFilter === 'uncontacted') {
          if (org.last_contact_date) return false;
        } else if (statusFilter === 'overdue') {
          if (!org.last_contact_date) return false; // Never contacted isn't technically "overdue" on follow up
          const days = (now - new Date(org.last_contact_date)) / (1000 * 60 * 60 * 24);
          if (days < 7) return false;
        }
      }

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase();
      const nameB = (b.name || '').toLowerCase();
      
      switch (sortMode) {
        case 'alpha_asc':
          return nameA.localeCompare(nameB);
        case 'alpha_desc':
          return nameB.localeCompare(nameA);
        case 'events_desc':
          return (b.event_count || 1) - (a.event_count || 1);
        case 'contact_recent': {
          const dateA = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0;
          const dateB = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0;
          return dateB - dateA; // Newest first
        }
        case 'contact_oldest': {
          // Put people with NO contact first, then oldest contact
          if (!a.last_contact_date && b.last_contact_date) return -1;
          if (a.last_contact_date && !b.last_contact_date) return 1;
          const dateA = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0;
          const dateB = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0;
          return dateA - dateB; // Oldest first
        }
        default:
          return 0;
      }
    });

    // Intersect selectedIds with filtered to drop hidden ones
    const filteredIds = new Set(filtered.map(o => o.id));
    for (const sid of this.selectedIds) {
      if (!filteredIds.has(sid)) this.selectedIds.delete(sid);
    }
    
    document.getElementById('crm-list-count').textContent = filtered.length;
    this.updateBulkActionsBar();

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div style="padding: 24px 14px; text-align: center; color: var(--text-muted); font-size: 0.75rem;">
          No organizers match your filters.
        </div>
      `;
      return;
    }

    const stageMeta = {
      'identified': { label: 'Identified', color: '#71717a', bg: 'rgba(113,113,122,0.15)' },
      'contacted': { label: 'Contacted', color: '#38bdf8', bg: 'rgba(56,189,248,0.15)' },
      'awaiting_reply': { label: 'Awaiting Reply', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
      'follow_up_sent': { label: 'Follow-up Sent', color: '#fb923c', bg: 'rgba(251,146,60,0.15)' },
      'response_received': { label: 'Response Received', color: '#c084fc', bg: 'rgba(192,132,252,0.15)' },
      'converted': { label: 'Converted', color: '#34d399', bg: 'rgba(52,211,153,0.15)' },
      'rejected': { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
      'cold': { label: 'Cold', color: '#64748b', bg: 'rgba(100,116,139,0.15)' }
    };

    filtered.forEach(org => {
      const card = document.createElement('div');
      card.className = 'org-card';
      if (this.currentOrganizer && this.currentOrganizer.id === org.id) {
        card.classList.add('active');
      }

      const stageInfo = stageMeta[org.pipeline_stage] || stageMeta['identified'];
      const locationText = [org.city, org.country].filter(Boolean).join(', ') || 'No location';
      
      // Relative date
      let contactTimeText = 'Never contacted';
      if (org.last_contact_date) {
        const daysAgo = Math.floor((now - new Date(org.last_contact_date)) / (1000 * 60 * 60 * 24));
        contactTimeText = daysAgo === 0 ? 'Today' : `${daysAgo}d ago`;
        if (org.last_contact_channel) contactTimeText += ` via ${org.last_contact_channel}`;
      }

      // Available channel icons using SVG map
      let iconsHtml = '';
      if (org.email) iconsHtml += ICONS.mail;
      if (org.instagram) iconsHtml += ICONS.instagram;
      if (org.whatsapp) iconsHtml += ICONS.whatsapp;
      if (org.phone) iconsHtml += ICONS.phone;

      let nameHtml = `<span class="org-name" title="${org.name || 'Unnamed'}">${org.name || 'Unnamed Organizer'}</span>`;
      if (org.is_archived === 1) {
        nameHtml = `<span class="org-name" title="${org.name || 'Unnamed'}" style="text-decoration:line-through; opacity:0.7;">${org.name || 'Unnamed Organizer'}</span>`;
      }

      card.innerHTML = `
        <div style="display:flex; gap: 8px;">
          <input type="checkbox" class="org-bulk-check" value="${org.id}" style="margin-top: 2px; cursor: pointer;" ${this.selectedIds.has(org.id) ? 'checked' : ''}>
          <div style="flex: 1; min-width: 0;">
            <div class="org-card-header">
              ${nameHtml}
              <span class="org-stage-badge" style="color:${stageInfo.color}; background:${stageInfo.bg}; border: 1px solid ${stageInfo.color}33;">
                <span class="org-stage-dot" style="background:${stageInfo.color};"></span>
                ${stageInfo.label}
              </span>
            </div>
            <div class="org-card-meta">
              <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:180px;">${locationText}</span>
              <span style="display:flex; align-items:center; gap:4px;">
                <span style="background:var(--surface-elevated); padding:1px 5px; border-radius:var(--radius-badge); font-size:0.65rem; font-weight:600; color:var(--text-secondary);">
                  ${org.event_count || 1} event${(org.event_count || 1) > 1 ? 's' : ''}
                </span>
              </span>
            </div>
            <div class="org-card-meta" style="font-size:0.65rem; padding-top:1px;">
              <span>${contactTimeText}</span>
              <div class="org-card-icons">${iconsHtml}</div>
            </div>
          </div>
        </div>
      `;

      // Checkbox event
      const chk = card.querySelector('.org-bulk-check');
      chk.addEventListener('click', (e) => {
        e.stopPropagation();
        if (e.target.checked) {
          this.selectedIds.add(org.id);
        } else {
          this.selectedIds.delete(org.id);
        }
        this.updateBulkActionsBar();
      });

      card.addEventListener('click', () => this.selectOrganizer(org.id));
      listContainer.appendChild(card);
    });

    lucide.createIcons();
  },

  async selectOrganizer(id) {
    try {
      this.currentOrganizer = await apiCall(`/api/crm/organizers/${id}`);
      
      // Update view
      document.getElementById('crm-empty-state').style.display = 'none';
      const detailView = document.getElementById('crm-detail-content');
      detailView.classList.add('active');

      document.getElementById('crm-detail-name').textContent = this.currentOrganizer.name || 'Unnamed Organizer';
      document.getElementById('crm-detail-location').textContent = [this.currentOrganizer.city, this.currentOrganizer.country].filter(Boolean).join(', ') || 'Unknown Location';
      document.getElementById('crm-detail-events').textContent = `${this.currentOrganizer.event_count || 1} events scraped`;
      document.getElementById('crm-detail-stage').value = this.currentOrganizer.pipeline_stage || 'identified';
      document.getElementById('crm-detail-notes').value = this.currentOrganizer.notes || '';

      const isArchived = this.currentOrganizer.is_archived === 1;
      document.getElementById('btn-crm-archive').style.display = isArchived ? 'none' : 'flex';
      document.getElementById('btn-crm-unarchive').style.display = isArchived ? 'flex' : 'none';

      // Direct Contact Badges using SVG icons
      const linksBar = document.getElementById('crm-detail-links');
      linksBar.innerHTML = '';

      const addBadge = (svgIcon, label, url) => {
        if (!url) return;
        const a = document.createElement('a');
        a.className = 'channel-btn';
        a.href = url;
        a.target = '_blank';
        a.innerHTML = `${svgIcon} <span>${label}</span>`;
        linksBar.appendChild(a);
      };

      if (this.currentOrganizer.email) {
        this.currentOrganizer.email.split(',').forEach(e => {
          const val = e.trim();
          if (val) addBadge(ICONS.mail, val, `mailto:${val}`);
        });
      }
      if (this.currentOrganizer.instagram) {
        this.currentOrganizer.instagram.split(',').forEach(i => {
          const val = i.trim();
          if (val) addBadge(ICONS.instagram, 'Instagram', val.startsWith('http') ? val : `https://instagram.com/${val}`);
        });
      }
      if (this.currentOrganizer.whatsapp) {
        this.currentOrganizer.whatsapp.split(',').forEach(w => {
          const val = w.trim();
          if (val) {
            const cleanPhone = val.replace(/[^0-9]/g, '');
            addBadge(ICONS.whatsapp, 'WhatsApp', `https://wa.me/${cleanPhone}`);
          }
        });
      }
      if (this.currentOrganizer.phone) {
        this.currentOrganizer.phone.split(',').forEach(p => {
          const val = p.trim();
          if (val) addBadge(ICONS.phone, val, `tel:${val}`);
        });
      }
      if (this.currentOrganizer.facebook) {
        this.currentOrganizer.facebook.split(',').forEach(fb => {
          const val = fb.trim();
          if (val) addBadge(ICONS.facebook, 'Facebook', val);
        });
      }
      if (this.currentOrganizer.website) {
        this.currentOrganizer.website.split(',').forEach(w => {
          const val = w.trim();
          if (val) addBadge(ICONS.globe, 'Website', val);
        });
      }

      // Associated Events
      const eventsContainer = document.getElementById('crm-events-list');
      eventsContainer.innerHTML = '';
      const events = this.currentOrganizer.events || [];
      document.getElementById('crm-events-count').textContent = `${events.length} event${events.length === 1 ? '' : 's'}`;

      if (events.length === 0) {
        eventsContainer.innerHTML = '<div style="font-size:0.72rem; color:var(--text-muted);">No event records linked.</div>';
      } else {
        events.forEach(ev => {
          const a = document.createElement('a');
          a.className = 'event-mini-card';
          a.href = ev.event_url || '#';
          a.target = ev.event_url ? '_blank' : '_self';
          a.innerHTML = `
            <div class="event-mini-title">${ev.title || 'Untitled Event'}</div>
            <div class="event-mini-meta">
              <span><i data-lucide="calendar" style="width:10px; height:10px;"></i> ${ev.date_start ? ev.date_start.split('T')[0] : 'Date TBA'}</span>
              <span><i data-lucide="map-pin" style="width:10px; height:10px;"></i> ${ev.venue || ev.city || 'Venue TBA'}</span>
            </div>
          `;
          eventsContainer.appendChild(a);
        });
      }

      await this.loadTimeline(id);
      this.renderList();
      lucide.createIcons();
    } catch (e) {
      console.error('Error selecting organizer:', e);
    }
  },

  async loadTimeline(id) {
    try {
      const logs = await apiCall(`/api/crm/interactions/${id}`);
      const container = document.getElementById('crm-timeline');
      container.innerHTML = '';
      document.getElementById('crm-timeline-count').textContent = `${logs.length} log${logs.length === 1 ? '' : 's'}`;

      if (logs.length === 0) {
        container.innerHTML = '<div style="padding:14px 0; text-align:center; color:var(--text-muted); font-size:0.72rem;">No activity logged yet. Click "Log Interaction" or change stage above.</div>';
        return;
      }

      logs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        const dateStr = new Date(log.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

        let iconSvg = ICONS.mail;
        let badgeColor = 'var(--text-muted)';
        let titleText = log.type;

        if (log.type === 'stage_change') {
          iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px;"><circle cx="12" cy="12" r="3"></circle><line x1="6" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="18" y2="12"></line></svg>`;
          titleText = `Stage changed to "${log.to_stage}"`;
          badgeColor = 'var(--info)';
        } else if (log.type === 'contact_attempt') {
          const ch = (log.channel || 'email').toLowerCase();
          iconSvg = ICONS[ch] || ICONS.mail;
          titleText = `Contacted via ${log.channel || 'channel'}`;
          badgeColor = 'var(--primary)';
        } else if (log.type === 'note') {
          iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:11px;height:11px;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;
          titleText = 'Manual Note';
          badgeColor = 'var(--warning)';
        }

        item.innerHTML = `
          <div class="timeline-actions">
            <button class="timeline-action-btn edit" data-id="${log.id}" title="Edit"><i data-lucide="edit-2" style="width:10px;height:10px;"></i></button>
            <button class="timeline-action-btn delete" data-id="${log.id}" title="Delete"><i data-lucide="trash-2" style="width:10px;height:10px;"></i></button>
          </div>
          <div class="timeline-top">
            <span class="timeline-title" style="color:${badgeColor};">
              <span style="display:inline-flex; width:11px; height:11px;">${iconSvg}</span>
              ${titleText}
            </span>
            <span>${dateStr}</span>
          </div>
          ${log.body ? `<div class="timeline-body" id="timeline-body-${log.id}">${log.body}</div>` : ''}
        `;
        
        // Attach action listeners
        const btnEdit = item.querySelector('.timeline-action-btn.edit');
        if (btnEdit) {
          btnEdit.addEventListener('click', () => {
            document.getElementById('crm-edit-log-id').value = log.id;
            document.getElementById('crm-edit-log-body').value = log.body || '';
            this.openModal('crm-edit-log-modal');
            lucide.createIcons();
          });
        }
        
        const btnDel = item.querySelector('.timeline-action-btn.delete');
        if (btnDel) {
          btnDel.addEventListener('click', async () => {
            const confirmed = await confirmAction('Are you sure you want to delete this interaction log?');
            if (confirmed) {
              try {
                await apiCall(`/api/crm/interactions/${log.id}`, 'DELETE');
                showToast('Interaction deleted', 'info');
                await this.loadTimeline(id);
              } catch (err) {
                showToast('Failed to delete: ' + err.message, 'error');
              }
            }
          });
        }

        container.appendChild(item);
      });

      lucide.createIcons();
    } catch (e) {
      console.error('Error loading timeline:', e);
    }
  },

  async loadTemplates() {
    try {
      this.templates = await apiCall('/api/crm/templates');
    } catch (e) {
      console.error('Failed to load templates:', e);
    }
  },

  populateTemplateDropdown() {
    const sel = document.getElementById('crm-ai-template');
    const selectedLang = document.getElementById('crm-ai-lang').value;
    sel.innerHTML = '';

    const available = this.templates.filter(t => {
      if (selectedLang === 'ALL') return true;
      return (t.language || 'EN') === selectedLang;
    });

    if (available.length === 0) {
      sel.innerHTML = '<option value="">No templates found</option>';
      document.getElementById('crm-ai-subject').value = '';
      document.getElementById('crm-ai-body').value = '';
      return;
    }

    available.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.name} [${t.channel.toUpperCase()}]`;
      sel.appendChild(opt);
    });

    this.generateDraft();
  },

  async generateDraft() {
    const tmplId = document.getElementById('crm-ai-template').value;
    if (!tmplId || !this.currentOrganizer) return;

    try {
      const res = await apiCall('/api/crm/render-template', 'POST', {
        template_id: parseInt(tmplId),
        org_id: this.currentOrganizer.id
      });

      document.getElementById('crm-ai-subject').value = res.subject || '';
      document.getElementById('crm-ai-body').value = res.body || '';

      const subjectGroup = document.getElementById('crm-ai-subject-group');
      const tmpl = this.templates.find(t => t.id == tmplId);
      if (tmpl && tmpl.channel !== 'email') {
        subjectGroup.style.display = 'none';
      } else {
        subjectGroup.style.display = 'flex';
      }
    } catch (e) {
      console.error('Draft error:', e);
    }
  },

  async loadAlertsCount() {
    try {
      const alerts = await apiCall('/api/crm/alerts');
      const badge = document.getElementById('crm-alerts-badge');
      if (alerts && alerts.length > 0) {
        badge.style.display = 'inline-block';
        badge.textContent = alerts.length;
      } else {
        badge.style.display = 'none';
      }
    } catch (e) {}
  },

  async loadAlerts() {
    const container = document.getElementById('crm-alerts-list');
    container.innerHTML = '<div style="color:var(--text-muted); font-size:0.75rem;">Loading alerts...</div>';

    try {
      const alerts = await apiCall('/api/crm/alerts');
      this.loadAlertsCount();
      container.innerHTML = '';

      if (alerts.length === 0) {
        container.innerHTML = `
          <div style="background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-card); padding:30px; text-align:center; color:var(--text-muted);">
            <i data-lucide="check-circle" style="width:32px; height:32px; color:var(--success); margin-bottom:8px;"></i>
            <h3 style="color:var(--text-primary); font-size:0.95rem; margin-bottom:3px;">No Pending Alerts</h3>
            <p style="font-size:0.72rem;">All organizers are clean and deduplicated.</p>
          </div>
        `;
        lucide.createIcons();
        return;
      }

      alerts.forEach(alertItem => {
        const card = document.createElement('div');
        card.className = 'alert-card';
        const d = alertItem.data;

        card.innerHTML = `
          <div class="alert-header">
            <div>
              <span style="font-weight:600; font-size:0.82rem; color:var(--warning); display:flex; align-items:center; gap:6px;">
                <i data-lucide="alert-circle" style="width:13px; height:13px;"></i>
                ${alertItem.title}
              </span>
              <span style="font-size:0.7rem; color:var(--text-muted);">${alertItem.details}</span>
            </div>
          </div>
          <div class="alert-compare-grid">
            <div class="alert-candidate">
              <span class="alert-candidate-title">Contact A: ${d.name1 || 'Unnamed'}</span>
              <span class="alert-candidate-detail">Email: ${d.email1 || 'None'}</span>
              <span class="alert-candidate-detail">ID: ${d.id1.slice(0, 8)}...</span>
              <button class="btn btn-primary btn-sm" style="margin-top:6px;" onclick="crm.mergeOrganizers('${d.id1}', '${d.id2}')">
                Keep Contact A (Merge B into A)
              </button>
            </div>
            <div class="alert-candidate">
              <span class="alert-candidate-title">Contact B: ${d.name2 || 'Unnamed'}</span>
              <span class="alert-candidate-detail">Email: ${d.email2 || 'None'}</span>
              <span class="alert-candidate-detail">ID: ${d.id2.slice(0, 8)}...</span>
              <button class="btn btn-primary btn-sm" style="margin-top:6px;" onclick="crm.mergeOrganizers('${d.id2}', '${d.id1}')">
                Keep Contact B (Merge A into B)
              </button>
            </div>
          </div>
          <div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border); text-align:right;">
            <button class="btn btn-ghost btn-sm" onclick="crm.dismissAlert('${d.id1}', '${d.id2}')">
              Keep Separate (Dismiss Alert)
            </button>
          </div>
        `;
        container.appendChild(card);
      });

      lucide.createIcons();
    } catch (e) {
      container.innerHTML = `<div style="color:var(--error); font-size:0.75rem;">Failed to load alerts: ${e.message}</div>`;
    }
  },

  async mergeOrganizers(primaryId, secondaryId) {
    const confirmed = await confirmAction('Merge these two organizer records into one contact? Contact details, interaction history, and associated events will be combined.');
    if (!confirmed) return;
    try {
      await apiCall('/api/crm/merge', 'POST', { primary_id: primaryId, secondary_id: secondaryId });
      showToast('Organizers merged successfully!', 'success');
      await this.loadAlerts();
      await this.loadOrganizers();
    } catch (err) {
      showToast('Merge failed: ' + err.message, 'error');
    }
  },

  async dismissAlert(id1, id2) {
    try {
      await apiCall('/api/crm/alerts/dismiss', 'POST', { id1, id2 });
      showToast('Alert dismissed. They will be kept separate.', 'info');
      await this.loadAlerts();
    } catch (err) {
      showToast('Failed to dismiss alert: ' + err.message, 'error');
    }
  },

  updateBulkActionsBar() {
    const bar = document.getElementById('bulk-actions-bar');
    const countEl = document.getElementById('bulk-selected-count');
    const btnMerge = document.getElementById('btn-bulk-merge');
    if (!bar) return;

    if (this.selectedIds.size > 0) {
      bar.classList.remove('hidden');
      countEl.textContent = this.selectedIds.size;
    } else {
      bar.classList.add('hidden');
    }

    if (btnMerge) {
      btnMerge.style.display = (this.selectedIds.size === 2) ? 'flex' : 'none';
    }

    // Check if all currently visible are selected
    const allVisibleCheckboxes = document.querySelectorAll('.org-bulk-check');
    const allChecked = Array.from(allVisibleCheckboxes).every(cb => cb.checked);
    const someChecked = Array.from(allVisibleCheckboxes).some(cb => cb.checked);
    const selectAllCheckbox = document.getElementById('crm-select-all');
    
    if (selectAllCheckbox) {
      selectAllCheckbox.checked = allVisibleCheckboxes.length > 0 && allChecked;
      selectAllCheckbox.indeterminate = !allChecked && someChecked;
    }
  }
};

window.addEventListener('DOMContentLoaded', () => {
  crm.init();
});
