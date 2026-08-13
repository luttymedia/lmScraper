const API = 'http://localhost:8000';

// ── Utilities ────────────────────────────────────────────────────────────────

async function api(path, options = {}) {
  try {
    const res = await fetch(`${API}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!res.ok) {
      let errStr = res.statusText;
      try {
        const errJson = await res.json();
        if (errJson.detail) errStr = errJson.detail;
      } catch (e) {}
      throw new Error(errStr);
    }
    // Return text if not json
    const text = await res.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch (e) {
      return text;
    }
  } catch (err) {
    showToast(err.message, 'error');
    throw err;
  }
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.substr(0, n - 1) + '…' : str;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  
  if (container.children.length > 3) {
    container.removeChild(container.firstChild);
  }
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => { if(toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
  }, 4000);
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

let confirmResolver = null;
function confirmAction(message) {
  return new Promise((resolve) => {
    document.getElementById('confirm-message').textContent = message;
    openModal('modal-confirm');
    confirmResolver = resolve;
  });
}
document.getElementById('btn-confirm-cancel').addEventListener('click', () => { closeModal('modal-confirm'); if(confirmResolver) confirmResolver(false); });
document.getElementById('btn-confirm-ok').addEventListener('click', () => { closeModal('modal-confirm'); if(confirmResolver) confirmResolver(true); });

// ── Navigation ──────────────────────────────────────────────────────────────

let activeSectionId = 'section-new-job';

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('mobile-nav-toggle');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
      activeSectionId = targetId;

      if (window.innerWidth <= 768) sidebar.classList.remove('open');
    });
  });

  toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// ── New Job ──────────────────────────────────────────────────────────────────

let currentJobWs = null;

const UI = {
  advancedToggle: document.getElementById('toggle-advanced'),
  advancedSettings: document.getElementById('advanced-settings'),
  concurrencySlider: document.getElementById('job-concurrency'),
  concurrencyVal: document.getElementById('concurrency-val'),
  btnStart: document.getElementById('btn-start-job'),
  btnPause: document.getElementById('btn-pause-job'),
  btnResume: document.getElementById('btn-resume-job'),
  btnStop: document.getElementById('btn-stop-job'),
  progressSection: document.getElementById('job-progress-section'),
  logPanel: document.getElementById('log-panel'),
  progPhase: document.getElementById('progress-phase'),
  progProcessed: document.getElementById('progress-processed'),
  progTotal: document.getElementById('progress-total'),
  progNew: document.getElementById('progress-new'),
  progSkipped: document.getElementById('progress-skipped'),
  progBar: document.getElementById('progress-bar')
};

UI.advancedToggle.addEventListener('change', (e) => {
  if(e.target.checked) UI.advancedSettings.classList.remove('hidden');
  else UI.advancedSettings.classList.add('hidden');
});

UI.concurrencySlider.addEventListener('input', (e) => {
  UI.concurrencyVal.textContent = e.target.value;
});

UI.btnStart.addEventListener('click', async () => {
  const url = document.getElementById('job-url').value;
  if(!url) return showToast('Please enter a target URL', 'error');

  const payload = {
    url,
    filters: {
      date_from: document.getElementById('job-date-from').value || null,
      date_to: document.getElementById('job-date-to').value || null,
      city: document.getElementById('job-location').value || null,
      keyword: document.getElementById('job-keyword').value || null
    },
    settings: {
      proxy: document.getElementById('job-proxy').value || null,
      session_id: document.getElementById('select-session').value || null,
      delay_min_ms: parseInt(document.getElementById('job-delay-min').value),
      delay_max_ms: parseInt(document.getElementById('job-delay-max').value),
      concurrency: parseInt(UI.concurrencySlider.value)
    }
  };

  try {
    const job = await api('/api/jobs', { method: 'POST', body: JSON.stringify(payload) });
    showToast('Job started successfully', 'success');
    
    UI.btnStart.classList.add('hidden');
    UI.btnPause.classList.remove('hidden');
    UI.btnStop.classList.remove('hidden');
    UI.progressSection.classList.remove('hidden');
    UI.logPanel.innerHTML = '';
    
    connectJobWs(job.id);
  } catch (err) {}
});

function connectJobWs(jobId) {
  if (currentJobWs) currentJobWs.close();
  
  const wsUrl = API.replace('http', 'ws') + `/ws/jobs/${jobId}`;
  currentJobWs = new WebSocket(wsUrl);
  
  currentJobWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'log') {
        appendLog(data.message, data.level);
      } else if (data.type === 'progress') {
        updateProgress(data);
      } else if (data.type === 'done' || data.type === 'error' || data.type === 'cancelled') {
        appendLog(`Job ended with status: ${data.type}`, data.type === 'error' ? 'error' : 'success');
        resetJobControls();
        loadJobHistory();
        loadResults();
      }
    } catch(e) {}
  };
}

function appendLog(msg, level='info') {
  const el = document.createElement('div');
  el.className = `log-${level}`;
  el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  UI.logPanel.appendChild(el);
  UI.logPanel.scrollTop = UI.logPanel.scrollHeight;
}

function updateProgress(data) {
  UI.progPhase.textContent = data.phase || 'Running...';
  UI.progProcessed.textContent = data.processed || 0;
  UI.progTotal.textContent = data.total || 0;
  UI.progNew.textContent = data.new_events || 0;
  UI.progSkipped.textContent = data.skipped_events || 0;
  
  if(data.total > 0) {
    const pct = Math.min(100, Math.round(((data.processed || 0) / data.total) * 100));
    UI.progBar.style.width = `${pct}%`;
  }
}

function resetJobControls() {
  UI.btnStart.classList.remove('hidden');
  UI.btnPause.classList.add('hidden');
  UI.btnResume.classList.add('hidden');
  UI.btnStop.classList.add('hidden');
}

// ── Results Table ────────────────────────────────────────────────────────────

const COLUMNS = [
  { id: 'bulk', label: '☐', width: '40px', render: (row) => `<input type="checkbox" class="row-checkbox" value="${row.id}">` },
  { id: 'title', label: 'Title', render: (row) => `<strong>${truncate(row.title, 40)}</strong>` },
  { id: 'date', label: 'Date & Time', render: (row) => formatDate(row.start_date) },
  { id: 'city', label: 'City/Country', render: (row) => `${row.city || ''} ${row.country ? `(${row.country})` : ''}` },
  { id: 'category', label: 'Category', render: (row) => `<span class="tag">${row.category || '—'}</span>` },
  { id: 'organizer', label: 'Organizer', render: (row) => row.organizer_name || '—' },
  { id: 'socials', label: 'Contact', render: (row) => renderSocialLinks(row) },
  { id: 'hidden_contact', label: 'Hidden', render: (row) => row.contact_hidden ? '<span data-tooltip="Hidden contact form">🔒</span>' : '—' },
  { id: 'source', label: 'Source', render: (row) => `<a href="${row.source_url}" target="_blank" class="icon-link" data-tooltip="Open source">🔗</a>` }
];

let visibleCols = new Set(COLUMNS.map(c => c.id));
let currentFilters = {};
let currentPage = 1;
let perPage = 25;
let sortCol = 'start_date';
let sortDir = 'desc';

function renderSocialLinks(row) {
  let html = '';
  if(row.email) html += `<a href="mailto:${row.email}" class="icon-link" title="${row.email}">📧</a>`;
  if(row.phone) html += `<a href="tel:${row.phone}" class="icon-link" title="${row.phone}">📞</a>`;
  if(row.instagram) html += `<a href="${row.instagram}" target="_blank" class="icon-link" title="Instagram">📸</a>`;
  if(row.facebook) html += `<a href="${row.facebook}" target="_blank" class="icon-link" title="Facebook">📘</a>`;
  if(row.website) html += `<a href="${row.website}" target="_blank" class="icon-link" title="Website">🌐</a>`;
  return html || '—';
}

function setupResultsColumns() {
  const panel = document.getElementById('column-visibility-panel');
  panel.innerHTML = '';
  COLUMNS.forEach(col => {
    if(col.id === 'bulk') return;
    const label = document.createElement('label');
    label.style.display = 'flex'; label.style.gap = '8px'; label.style.cursor = 'pointer';
    label.innerHTML = `<input type="checkbox" value="${col.id}" ${visibleCols.has(col.id)?'checked':''}> ${col.label}`;
    label.querySelector('input').addEventListener('change', (e) => {
      if(e.target.checked) visibleCols.add(col.id); else visibleCols.delete(col.id);
      renderResultsTable(lastResultsData);
    });
    panel.appendChild(label);
  });
  
  document.getElementById('btn-toggle-columns').addEventListener('click', () => {
    panel.classList.toggle('hidden');
  });
}

let lastResultsData = [];
async function loadResults() {
  const query = new URLSearchParams({
    page: currentPage, limit: perPage, sort_by: sortCol, sort_order: sortDir, ...currentFilters
  });
  
  try {
    const res = await api(`/api/events?${query.toString()}`);
    lastResultsData = res.items || [];
    renderResultsTable(lastResultsData);
    renderPagination(res.total, res.page, res.pages);
    document.getElementById('results-count').textContent = `Showing ${(currentPage-1)*perPage + 1}–${Math.min(currentPage*perPage, res.total)} of ${res.total} events`;
  } catch(e) {}
}

function renderResultsTable(data) {
  const thead = document.getElementById('results-thead-tr');
  const tbody = document.getElementById('results-tbody');
  
  thead.innerHTML = '';
  COLUMNS.forEach(col => {
    if(!visibleCols.has(col.id)) return;
    const th = document.createElement('th');
    if (col.id === 'bulk') {
      th.innerHTML = `<input type="checkbox" id="bulk-select-all">`;
    } else {
      th.textContent = col.label;
      th.addEventListener('click', () => {
        if(sortCol === col.id) sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        else { sortCol = col.id; sortDir = 'asc'; }
        loadResults();
      });
    }
    thead.appendChild(th);
  });

  tbody.innerHTML = '';
  if(data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${visibleCols.size}" class="empty-state">
      <div class="empty-state-icon">📄</div>
      <p>No results found</p>
    </td></tr>`;
    return;
  }

  data.forEach(row => {
    const tr = document.createElement('tr');
    COLUMNS.forEach(col => {
      if(!visibleCols.has(col.id)) return;
      const td = document.createElement('td');
      td.innerHTML = col.render(row);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  const selectAll = document.getElementById('bulk-select-all');
  if(selectAll) selectAll.addEventListener('change', (e) => {
    document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = e.target.checked);
    toggleBulkActions();
  });
  
  document.querySelectorAll('.row-checkbox').forEach(cb => cb.addEventListener('change', toggleBulkActions));
}

function toggleBulkActions() {
  const checked = document.querySelectorAll('.row-checkbox:checked');
  if(checked.length > 0) document.getElementById('bulk-actions').classList.remove('hidden');
  else document.getElementById('bulk-actions').classList.add('hidden');
}

function renderPagination(total, page, pages) {
  const container = document.getElementById('pagination-results');
  container.innerHTML = '';
  
  const prev = document.createElement('button');
  prev.className = 'btn btn-secondary btn-sm';
  prev.textContent = 'Prev';
  prev.disabled = page <= 1;
  prev.addEventListener('click', () => { currentPage--; loadResults(); });
  container.appendChild(prev);

  const span = document.createElement('span');
  span.style.padding = '6px 12px'; span.style.fontSize = '0.875rem';
  span.textContent = `Page ${page} of ${pages}`;
  container.appendChild(span);

  const next = document.createElement('button');
  next.className = 'btn btn-secondary btn-sm';
  next.textContent = 'Next';
  next.disabled = page >= pages;
  next.addEventListener('click', () => { currentPage++; loadResults(); });
  container.appendChild(next);
}

document.getElementById('btn-apply-filters').addEventListener('click', () => {
  currentFilters = {
    date_from: document.getElementById('filter-date-from').value,
    date_to: document.getElementById('filter-date-to').value,
    city: document.getElementById('filter-city').value,
    keyword: document.getElementById('filter-keyword').value,
    job_id: document.getElementById('filter-job').value,
    has_contact: document.getElementById('filter-contact').value,
    hidden_contact: document.getElementById('filter-hidden-contact').value
  };
  // cleanup empty
  Object.keys(currentFilters).forEach(k => { if(!currentFilters[k]) delete currentFilters[k]; });
  currentPage = 1;
  loadResults();
});

document.getElementById('btn-reset-filters').addEventListener('click', () => {
  document.querySelectorAll('.filter-bar input, .filter-bar select').forEach(el => el.value = '');
  currentFilters = {};
  currentPage = 1;
  loadResults();
});

document.getElementById('results-per-page').addEventListener('change', (e) => {
  perPage = parseInt(e.target.value);
  currentPage = 1;
  loadResults();
});

document.getElementById('btn-export-csv').addEventListener('click', () => {
  const query = new URLSearchParams(currentFilters).toString();
  window.open(`${API}/api/events/export/csv?${query}`, '_blank');
});
document.getElementById('btn-export-xlsx').addEventListener('click', () => {
  const query = new URLSearchParams(currentFilters).toString();
  window.open(`${API}/api/events/export/xlsx?${query}`, '_blank');
});

// ── Job History ──────────────────────────────────────────────────────────────

async function loadJobHistory() {
  try {
    const res = await api('/api/jobs');
    const container = document.getElementById('job-history-list');
    container.innerHTML = '';
    
    // populate job filter dropdown
    const jobFilter = document.getElementById('filter-job');
    jobFilter.innerHTML = '<option value="">All Jobs</option>';
    
    if(res.length === 0) {
      container.innerHTML = `<div class="empty-state" style="grid-column: span 2">
        <div class="empty-state-icon">⏱</div><p>No job history</p></div>`;
      return;
    }

    let isRunning = false;
    res.forEach(job => {
      if(job.status === 'running' || job.status === 'pending') isRunning = true;
      
      const opt = document.createElement('option');
      opt.value = job.id; opt.textContent = `${formatDate(job.created_at)} - ${truncate(job.url, 30)}`;
      jobFilter.appendChild(opt);

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px;">
          <div>
            <div style="font-weight:600; margin-bottom:4px;" title="${job.url}">${truncate(job.url, 40)}</div>
            <div style="font-size:0.75rem; color:var(--text-secondary)">${formatDate(job.created_at)}</div>
          </div>
          <span class="badge badge-${job.status}">${job.status}</span>
        </div>
        <div class="grid grid-cols-2" style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:16px;">
          <div>Events found: <strong style="color:var(--text-primary)">${job.events_found || 0}</strong></div>
          <div>New: <strong style="color:var(--success)">${job.events_new || 0}</strong></div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="btn btn-secondary btn-sm" onclick="viewJobResults('${job.id}')">📊 View Results</button>
          <button class="btn btn-danger btn-sm" onclick="deleteJob('${job.id}')">🗑 Delete</button>
        </div>
      `;
      container.appendChild(card);
    });

    if(isRunning && activeSectionId === 'section-job-history') {
      setTimeout(loadJobHistory, 5000);
    }
  } catch(e) {}
}

window.viewJobResults = (jobId) => {
  document.querySelector('.nav-item[data-target="section-results"]').click();
  document.getElementById('filter-job').value = jobId;
  document.getElementById('btn-apply-filters').click();
};

window.deleteJob = async (jobId) => {
  if(await confirmAction('Delete this job and all its unlinked data?')) {
    await api(`/api/jobs/${jobId}`, { method: 'DELETE' });
    showToast('Job deleted', 'success');
    loadJobHistory();
  }
};
document.getElementById('btn-refresh-jobs').addEventListener('click', loadJobHistory);

// ── Scheduler ────────────────────────────────────────────────────────────────

document.querySelectorAll('input[name="sched_preset"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const cronGroup = document.getElementById('sched-cron-group');
    const cronInput = document.getElementById('sched-cron');
    if(e.target.value === 'custom') {
      cronGroup.classList.remove('hidden');
    } else {
      cronGroup.classList.add('hidden');
      cronInput.value = e.target.value;
    }
  });
});

document.getElementById('btn-create-schedule').addEventListener('click', async () => {
  const payload = {
    label: document.getElementById('sched-label').value,
    url: document.getElementById('sched-url').value,
    cron_expression: document.getElementById('sched-cron').value,
    filters: {
      date_from: document.getElementById('sched-date-from').value || null,
      date_to: document.getElementById('sched-date-to').value || null,
      city: document.getElementById('sched-city').value || null,
      keyword: document.getElementById('sched-keyword').value || null
    }
  };
  
  if(!payload.url || !payload.cron_expression) return showToast('URL and schedule are required', 'error');

  try {
    await api('/api/schedule', { method: 'POST', body: JSON.stringify(payload) });
    showToast('Schedule created', 'success');
    loadSchedules();
  } catch(e) {}
});

async function loadSchedules() {
  try {
    const res = await api('/api/schedule');
    const tbody = document.getElementById('schedules-tbody');
    tbody.innerHTML = '';
    
    if(res.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><div class="empty-state-icon">📅</div><p>No schedules found</p></td></tr>`;
      return;
    }
    
    res.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.label || '—'}</strong></td>
        <td><a href="${item.url}" target="_blank" style="color:inherit">${truncate(item.url, 30)}</a></td>
        <td><code style="background:var(--surface-elevated); padding:2px 6px; border-radius:4px">${item.cron_expression}</code></td>
        <td>${formatDate(item.next_run)}</td>
        <td>${formatDate(item.last_run)}</td>
        <td><span class="badge badge-${item.status === 'active' ? 'done' : 'paused'}">${item.status}</span></td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="deleteSchedule('${item.id}')">🗑</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch(e) {}
}

window.deleteSchedule = async (id) => {
  if(await confirmAction('Delete schedule?')) {
    await api(`/api/schedule/${id}`, { method: 'DELETE' });
    loadSchedules();
  }
};

// ── Saved Sessions ───────────────────────────────────────────────────────────

document.getElementById('btn-save-session').addEventListener('click', async () => {
  const label = document.getElementById('session-label').value;
  const domain = document.getElementById('session-domain').value;
  const cookiesStr = document.getElementById('session-cookies').value;
  
  if(!label || !domain || !cookiesStr) return showToast('All fields required', 'error');
  
  let cookiesJson;
  try {
    cookiesJson = JSON.parse(cookiesStr);
  } catch(e) { return showToast('Invalid JSON in cookies', 'error'); }
  
  try {
    await api('/api/sessions', { method: 'POST', body: JSON.stringify({ label, domain, cookies_json: cookiesJson }) });
    showToast('Session saved', 'success');
    document.getElementById('session-label').value = '';
    document.getElementById('session-domain').value = '';
    document.getElementById('session-cookies').value = '';
    loadSessions();
  } catch(e) {}
});

async function loadSessions() {
  try {
    const res = await api('/api/sessions');
    const tbody = document.getElementById('sessions-tbody');
    const select = document.getElementById('select-session');
    
    tbody.innerHTML = '';
    select.innerHTML = '<option value="">None</option>';
    
    if(res.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-state"><div class="empty-state-icon">🍪</div><p>No saved sessions</p></td></tr>`;
      return;
    }
    
    res.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id; opt.textContent = item.label;
      select.appendChild(opt);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.label}</strong></td>
        <td>${item.domain}</td>
        <td>${formatDate(item.created_at)}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteSession('${item.id}')">🗑</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch(e) {}
}

window.deleteSession = async (id) => {
  if(await confirmAction('Delete session?')) {
    await api(`/api/sessions/${id}`, { method: 'DELETE' });
    loadSessions();
  }
};

// ── Data Monitor & Cleanup ───────────────────────────────────────────────────

async function loadMonitorStats() {
  try {
    const res = await api('/api/monitor');
    document.getElementById('monitor-events').textContent = res.event_count || 0;
    document.getElementById('monitor-db-size').textContent = formatBytes(res.db_size_bytes);
    document.getElementById('monitor-cache-size').textContent = formatBytes(res.cache_size_bytes);
    
    const footer = document.getElementById('footer-monitor');
    const dbMb = res.db_size_bytes / (1024*1024);
    
    footer.classList.remove('warning', 'error');
    if (dbMb > 800 || (res.event_count || 0) > 80000) footer.classList.add('error');
    else if (dbMb > 400 || (res.event_count || 0) > 40000) footer.classList.add('warning');

    if(res.has_alerts && res.alerts && res.alerts.length > 0) {
      document.getElementById('alert-banner').classList.remove('hidden');
      document.getElementById('alert-banner-text').textContent = res.alerts[0];
    }
  } catch(e) {}
}

document.getElementById('btn-close-alert').addEventListener('click', () => {
  document.getElementById('alert-banner').classList.add('hidden');
});

document.getElementById('btn-open-cleanup').addEventListener('click', () => openModal('modal-cleanup'));
document.getElementById('btn-close-cleanup').addEventListener('click', () => closeModal('modal-cleanup'));

const purgeConfirm = document.getElementById('cleanup-purge-confirm');
const purgeBtn = document.getElementById('btn-clean-purge');
purgeConfirm.addEventListener('input', (e) => {
  purgeBtn.disabled = e.target.value !== 'DELETE';
});

async function runCleanup(endpoint, payload = {}) {
  try {
    const res = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
    showToast(res.message || 'Cleanup complete', 'success');
    loadMonitorStats();
  } catch(e) {}
}

document.getElementById('btn-clean-cache-age').addEventListener('click', () => runCleanup('/api/monitor/cleanup/cache-older-than', { days: parseInt(document.getElementById('cleanup-cache-days').value) }));
document.getElementById('btn-clean-cache-size').addEventListener('click', () => runCleanup('/api/monitor/cleanup/cache-larger-than', { size_mb: parseInt(document.getElementById('cleanup-cache-mb').value) }));
document.getElementById('btn-clean-events').addEventListener('click', () => runCleanup('/api/monitor/cleanup/events-older-than', { days: parseInt(document.getElementById('cleanup-events-days').value) }));
document.getElementById('btn-clean-compress').addEventListener('click', () => runCleanup('/api/monitor/cleanup/compress'));

document.getElementById('btn-clean-backup').addEventListener('click', async () => {
  try {
    const res = await api('/api/monitor/backup');
    const link = document.getElementById('backup-download-link');
    link.href = API + res.download_url;
    link.classList.remove('hidden');
    showToast('Backup created', 'success');
  } catch(e) {}
});

purgeBtn.addEventListener('click', () => {
  if(purgeConfirm.value === 'DELETE') {
    runCleanup('/api/monitor/cleanup/purge-all');
    purgeConfirm.value = '';
    purgeBtn.disabled = true;
  }
});

// ── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupResultsColumns();
  
  await loadSessions();
  await loadMonitorStats();
  await loadJobHistory();
  await loadResults();
  await loadSchedules();
  
  setInterval(loadMonitorStats, 60000);
});
