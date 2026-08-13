const API = 'http://localhost:8000';

// ── SVG Outline Icons ────────────────────────────────────────────────────────

const ICONS = {
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
  phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>`,
  instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`,
  tiktok: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>`,
  youtube: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>`,
  twitter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"></path><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"></path></svg>`,
  globe: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  repeat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>`,
  document: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
  external: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>`,
  cookie: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M7.5 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M16 14v.01"></path></svg>`
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function escapeJs(str) {
  if (!str) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"');
}

window.copyJobUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    showToast('Target URL copied to clipboard', 'success');
  } catch(e) {
    showToast('Failed to copy URL', 'error');
  }
};

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
  if (isNaN(d.getTime())) return isoStr;
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

      if (targetId === 'section-job-history') loadJobHistory();
      if (targetId === 'section-results') { loadJobHistory(); loadResults(); }
      if (targetId === 'section-scheduler') loadSchedules();
      if (targetId === 'section-sessions') loadSessions();

      if (window.innerWidth <= 768) sidebar.classList.remove('open');
    });
  });

  toggleBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
}

// ── New Job ──────────────────────────────────────────────────────────────────

let currentJobWs = null;
let currentJobId = null;

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

// ── Form & URL Live Syncing ───────────────────────────────────────────────────

const GAD_BASE_ES = 'https://www.goandance.com/es/eventos';
const GAD_BASE_EN = 'https://www.goandance.com/en/events';

function getGadBaseUrl(lang) {
  return lang === 'en' ? GAD_BASE_EN : GAD_BASE_ES;
}

function updateUrlLanguage(urlInput, newLang) {
  if (!urlInput) return;
  const targetBase = getGadBaseUrl(newLang);
  const currentVal = urlInput.value.trim();
  if (!currentVal) {
    urlInput.value = targetBase;
    urlInput.placeholder = targetBase;
    return;
  }
  try {
    const urlObj = new URL(currentVal);
    if (urlObj.hostname.includes('goandance.com')) {
      const targetObj = new URL(targetBase);
      urlObj.pathname = targetObj.pathname;
      urlInput.value = urlObj.toString();
    } else {
      urlInput.value = targetBase;
    }
  } catch (e) {
    urlInput.value = targetBase;
  }
  urlInput.placeholder = targetBase;
}

function syncUrlToGadLanguage(url, langRadiosName) {
  if (!url) return;
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('goandance.com')) {
      let detectedLang = null;
      if (urlObj.pathname.startsWith('/en/') || urlObj.pathname === '/en' || urlObj.pathname === '/en/events') {
        detectedLang = 'en';
      } else if (urlObj.pathname.startsWith('/es/') || urlObj.pathname === '/es' || urlObj.pathname === '/es/eventos') {
        detectedLang = 'es';
      }
      if (detectedLang) {
        const radio = document.querySelector(`input[name="${langRadiosName}"][value="${detectedLang}"]`);
        if (radio && !radio.checked) {
          radio.checked = true;
        }
      }
    }
  } catch (e) {}
}

function setupUrlSync(urlInput, styleInput, dateFromInput, dateToInput, locationInput, locationSuggestions, langRadiosName, copyBtn, clearBtn) {
  if (!urlInput) return;

  function getActiveBaseUrl() {
    const current = urlInput.value.trim();
    if (current) {
      try {
        return new URL(current);
      } catch (e) {}
    }
    const langRadio = document.querySelector(`input[name="${langRadiosName}"]:checked`);
    const lang = langRadio ? langRadio.value : 'es';
    return new URL(getGadBaseUrl(lang));
  }

  // Sync URL -> Form Inputs & Language Radio
  urlInput.addEventListener('input', () => {
    const url = urlInput.value;
    if (!url) return;
    syncUrlToGadLanguage(url, langRadiosName);
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      // Check for ?styles= or ?styles[]= 
      let styleVal = params.get('styles') || params.get('styles[]');
      if (styleVal && styleInput) {
        styleInput.value = styleVal.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
      // Sync address param back to the location input
      const addressVal = params.get('address');
      if (addressVal && locationInput) {
        locationInput.value = addressVal;
      }
      // Sync date params back to date inputs
      const fromVal = params.get('from');
      if (fromVal && dateFromInput) {
        dateFromInput.value = fromVal;
      }
      const toVal = params.get('to');
      if (toVal && dateToInput) {
        dateToInput.value = toVal;
      }
    } catch (e) {}
  });

  // Language Radio Change -> URL Update
  document.querySelectorAll(`input[name="${langRadiosName}"]`).forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        updateUrlLanguage(urlInput, e.target.value);
      }
    });
  });

  // Copy & Clear URL buttons
  copyBtn?.addEventListener('click', async () => {
    const val = urlInput.value.trim();
    if (!val) {
      showToast('Target URL is empty', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(val);
      showToast('URL copied to clipboard', 'success');
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = val;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('URL copied to clipboard', 'success');
    }
  });

  clearBtn?.addEventListener('click', () => {
    urlInput.value = '';
    urlInput.dispatchEvent(new Event('input'));
    urlInput.focus();
    showToast('Target URL cleared', 'info');
  });

  // Sync Style -> URL
  styleInput?.addEventListener('input', () => {
    const val = styleInput.value.trim();
    try {
      const urlObj = getActiveBaseUrl();
      const params = new URLSearchParams(urlObj.search);
      if (val) {
        const formattedStyle = val.toLowerCase().replace(/\s+/g, '-');
        params.delete('styles[]');
        params.set('styles', formattedStyle);
      } else {
        params.delete('styles');
        params.delete('styles[]');
      }
      urlObj.search = params.toString();
      urlInput.value = urlObj.toString();
    } catch (e) {}
  });

  // Sync Dates -> URL
  function syncDatesToUrl() {
    const fromVal = dateFromInput ? dateFromInput.value : '';
    const toVal = dateToInput ? dateToInput.value : '';
    try {
      const urlObj = getActiveBaseUrl();
      const params = new URLSearchParams(urlObj.search);
      if (fromVal || toVal) {
        params.set('period', 'custom');
        if (fromVal) params.set('from', fromVal);
        else params.delete('from');
        if (toVal) params.set('to', toVal);
        else params.delete('to');
      } else {
        params.delete('period');
        params.delete('from');
        params.delete('to');
      }
      urlObj.search = params.toString();
      urlInput.value = urlObj.toString();
    } catch (e) {}
  }

  dateFromInput?.addEventListener('change', syncDatesToUrl);
  dateFromInput?.addEventListener('input', syncDatesToUrl);
  dateToInput?.addEventListener('change', syncDatesToUrl);
  dateToInput?.addEventListener('input', syncDatesToUrl);

  // ── Location Autocomplete ──────────────────────────────────────────────────────
  const SUGGESTION_ITEM_STYLE = `
    padding: 8px 14px; cursor: pointer; font-size: 0.85rem;
    color: var(--text-primary); border-radius: 6px; margin: 0 4px;
    transition: background 0.15s;
  `;

  function setLocationSuggestionUrl(primary, countryCode, country) {
    try {
      const urlObj = getActiveBaseUrl();
      const params = new URLSearchParams(urlObj.search);
      params.set('address', primary);
      if (countryCode) params.set('country', countryCode);
      params.delete('q');
      urlObj.search = params.toString();
      urlInput.value = urlObj.toString();
    } catch (e) {}
  }

  function hideSuggestions() {
    if (!locationSuggestions) return;
    locationSuggestions.style.display = 'none';
    locationSuggestions.innerHTML = '';
  }

  function showSuggestions(results) {
    if (!locationSuggestions) return;
    locationSuggestions.innerHTML = '';
    if (!results.length) { hideSuggestions(); return; }
    results.forEach(r => {
      const li = document.createElement('li');
      li.style.cssText = SUGGESTION_ITEM_STYLE;
      li.innerHTML = `
        <span style="font-weight:500">${r.primary}</span>
        <span style="color:var(--text-muted); margin-left:6px; font-size:0.78rem">${r.label !== r.primary ? r.label : ''}</span>
        ${r.country_code ? `<span style="float:right; font-size:0.72rem; color:var(--text-muted); background:var(--surface); padding:1px 5px; border-radius:4px;">${r.country_code}</span>` : ''}
      `;
      li.addEventListener('mouseenter', () => li.style.background = 'var(--surface)');
      li.addEventListener('mouseleave', () => li.style.background = 'transparent');
      li.addEventListener('mousedown', (e) => {
        e.preventDefault();
        locationInput.value = r.primary;
        setLocationSuggestionUrl(r.primary, r.country_code, r.country);
        hideSuggestions();
      });
      locationSuggestions.appendChild(li);
    });
    locationSuggestions.style.display = 'block';
  }

  let _locationDebounce = null;
  locationInput?.addEventListener('input', () => {
    clearTimeout(_locationDebounce);
    const q = locationInput.value.trim();
    if (q.length < 2) { hideSuggestions(); return; }
    _locationDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/location-suggest?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        showSuggestions(data);
      } catch (e) { hideSuggestions(); }
    }, 300);
  });

  locationInput?.addEventListener('blur', () => {
    setTimeout(hideSuggestions, 150);
  });

  locationInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideSuggestions();
    if (e.key === 'Enter') {
      const first = locationSuggestions?.querySelector('li');
      if (first) first.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
    }
  });
}

// Bind for New Job
const urlInput = document.getElementById('job-url');
const styleInput = document.getElementById('job-dance-style');
const dateFromInput = document.getElementById('job-date-from');
const dateToInput = document.getElementById('job-date-to');
const locationInput = document.getElementById('job-location');
const locationSuggestions = document.getElementById('job-location-suggestions');
const btnCopyUrl = document.getElementById('btn-copy-url');
const btnClearUrl = document.getElementById('btn-clear-url');

setupUrlSync(urlInput, styleInput, dateFromInput, dateToInput, locationInput, locationSuggestions, 'job_gad_lang', btnCopyUrl, btnClearUrl);

// Bind for Scheduler
const schedUrlInput = document.getElementById('sched-url');
const schedStyleInput = document.getElementById('sched-dance-style');
const schedDateFromInput = document.getElementById('sched-date-from');
const schedDateToInput = document.getElementById('sched-date-to');
const schedLocationInput = document.getElementById('sched-city');
const schedLocationSuggestions = document.getElementById('sched-city-suggestions');
const btnCopySchedUrl = document.getElementById('btn-copy-sched-url');
const btnClearSchedUrl = document.getElementById('btn-clear-sched-url');

setupUrlSync(schedUrlInput, schedStyleInput, schedDateFromInput, schedDateToInput, schedLocationInput, schedLocationSuggestions, 'sched_gad_lang', btnCopySchedUrl, btnClearSchedUrl);

UI.btnStart.addEventListener('click', async () => {
  const url = document.getElementById('job-url').value;
  if(!url) return showToast('Please enter a target URL', 'error');

  const payload = {
    url,
    platform: document.querySelector('input[name="job_platform"]:checked')?.value || 'goandance',
    dance_style: document.getElementById('job-dance-style').value || null,
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
    
    currentJobId = job.id;
    UI.btnStart.classList.add('hidden');
    UI.btnPause.classList.remove('hidden');
    UI.btnStop.classList.remove('hidden');
    UI.progressSection.classList.remove('hidden');
    UI.logPanel.innerHTML = '';
    
    connectJobWs(job.id);
  } catch (err) {}
});

UI.btnPause.addEventListener('click', async () => {
  if(!currentJobId) return;
  await api(`/api/jobs/${currentJobId}/pause`, { method: 'POST' });
  UI.btnPause.classList.add('hidden');
  UI.btnResume.classList.remove('hidden');
  appendLog('Pausing job...', 'warning');
});

UI.btnResume.addEventListener('click', async () => {
  if(!currentJobId) return;
  await api(`/api/jobs/${currentJobId}/resume`, { method: 'POST' });
  UI.btnResume.classList.add('hidden');
  UI.btnPause.classList.remove('hidden');
  appendLog('Resuming job...', 'info');
});

UI.btnStop.addEventListener('click', async () => {
  if(!currentJobId) return;
  await api(`/api/jobs/${currentJobId}/cancel`, { method: 'POST' });
  appendLog('Cancelling job...', 'warning');
  resetJobControls();
});

function connectJobWs(jobId) {
  if (currentJobWs) currentJobWs.close();
  
  const wsUrl = API.replace('http', 'ws') + `/ws/jobs/${jobId}`;
  currentJobWs = new WebSocket(wsUrl);
  let jobEndedCleanly = false;
  
  currentJobWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'phase') {
        UI.progPhase.textContent = data.label || 'Scanning...';
      } else if (data.type === 'log') {
        appendLog(data.message, data.level || 'info');
      } else if (data.type === 'progress') {
        updateProgress(data);
      } else if (data.type === 'heartbeat') {
        // keep-alive, ignore
      } else if (data.type === 'init') {
        // initial state message, ignore
      } else if (data.type === 'done' || data.type === 'error' || data.type === 'cancelled') {
        jobEndedCleanly = true;
        if (data.message) appendLog(data.message, data.type === 'error' ? 'error' : 'info');
        appendLog(`Job ended with status: ${data.type}`, data.type === 'error' ? 'error' : 'success');
        resetJobControls();
        loadJobHistory();
        loadResults();
      }
    } catch(e) {}
  };
  
  currentJobWs.onclose = (event) => {
    // Only show an unexpected closure if the job never sent a clean end message
    // and the stop button is still visible (i.e. user didn't cancel manually)
    if (!jobEndedCleanly && !UI.btnStop.classList.contains('hidden')) {
      appendLog(`Connection lost (code ${event.code}). The job may still be running in the background.`, 'warning');
      resetJobControls();
    }
  };

  currentJobWs.onerror = () => {
    if (!jobEndedCleanly) {
      appendLog('WebSocket error. Check the backend server.', 'error');
    }
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
  if (data.phase) UI.progPhase.textContent = `Phase ${data.phase}`;
  UI.progProcessed.textContent = data.processed || 0;
  UI.progTotal.textContent = data.total || 0;
  UI.progNew.textContent = data.new !== undefined ? data.new : (data.new_events || 0);
  UI.progSkipped.textContent = data.skipped !== undefined ? data.skipped : (data.skipped_events || 0);
  
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
  { id: 'bulk', label: '<input type="checkbox" id="bulk-select-all">', width: '40px', render: (row) => `<input type="checkbox" class="row-checkbox" value="${row.id}">` },
  { id: 'title', label: 'Title', render: (row) => `<strong>${truncate(row.title || 'Untitled', 40)}</strong>` },
  { id: 'date', label: 'Date & Time', render: (row) => formatDate(row.date_start || row.start_date) },
  { id: 'city', label: 'City/Country', render: (row) => `${row.city || '—'} ${row.country ? `(${row.country})` : ''}` },
  { id: 'category', label: 'Event Type', render: (row) => `<span class="tag">${row.category || '—'}</span>` },
  { id: 'dance_style', label: 'Dance Style', render: (row) => row.dance_style ? `<span class="tag" style="background:var(--primary);color:#fff">${row.dance_style}</span>` : '—' },
  { id: 'organizer', label: 'Organizer', render: (row) => row.organizer_name || '—' },
  { id: 'platform', label: 'Platform', render: (row) => `<span class="tag">${row.platform || 'goandance'}</span>` },
  { id: 'socials', label: 'Contact', render: (row) => renderSocialLinks(row) },
  { id: 'hidden_contact', label: 'Hidden', render: (row) => row.contact_hidden ? `<span class="icon-link" data-tooltip="Hidden contact form">${ICONS.lock}</span>` : '—' },
  { id: 'source', label: 'Source', render: (row) => row.event_url || row.source_url ? `<a href="${row.event_url || row.source_url}" target="_blank" class="icon-link" data-tooltip="Open source">${ICONS.link}</a>` : '—' }
];

let visibleCols = new Set(COLUMNS.map(c => c.id));
let currentFilters = {};
let currentPage = 1;
let perPage = 25;
let sortCol = 'date_start';
let sortDir = 'desc';

function renderSocialLinks(row) {
  let html = '';
  const email = row.organizer_email || row.email;
  const phone = row.organizer_phone || row.phone;
  const insta = row.organizer_instagram || row.instagram;
  const fb = row.organizer_facebook || row.facebook;
  const web = row.organizer_website || row.website;
  const wa = row.organizer_whatsapp || row.whatsapp;
  const tt = row.organizer_tiktok || row.tiktok;
  const yt = row.organizer_youtube || row.youtube;
  const tw = row.organizer_twitter || row.twitter;

  if(email) html += `<a href="mailto:${email}" class="icon-link" data-tooltip="Email: ${email}" target="_blank">${ICONS.mail}</a>`;
  if(phone) html += `<a href="tel:${phone}" class="icon-link" data-tooltip="Phone: ${phone}">${ICONS.phone}</a>`;
  if(wa) html += `<a href="${wa.startsWith('http') ? wa : 'https://wa.me/' + wa.replace(/[^0-9]/g, '')}" target="_blank" class="icon-link" data-tooltip="WhatsApp">${ICONS.whatsapp}</a>`;
  if(insta) html += `<a href="${insta}" target="_blank" class="icon-link" data-tooltip="Instagram">${ICONS.instagram}</a>`;
  if(fb) html += `<a href="${fb}" target="_blank" class="icon-link" data-tooltip="Facebook">${ICONS.facebook}</a>`;
  if(tt) html += `<a href="${tt}" target="_blank" class="icon-link" data-tooltip="TikTok">${ICONS.tiktok}</a>`;
  if(yt) html += `<a href="${yt}" target="_blank" class="icon-link" data-tooltip="YouTube">${ICONS.youtube}</a>`;
  if(tw) html += `<a href="${tw}" target="_blank" class="icon-link" data-tooltip="Twitter/X">${ICONS.twitter}</a>`;
  if(web) html += `<a href="${web}" target="_blank" class="icon-link" data-tooltip="Website">${ICONS.globe}</a>`;
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

function getActiveFilters() {
  const filters = {
    date_from: document.getElementById('filter-date-from')?.value || '',
    date_to: document.getElementById('filter-date-to')?.value || '',
    city: document.getElementById('filter-city')?.value || '',
    keyword: document.getElementById('filter-keyword')?.value || '',
    job_id: document.getElementById('filter-job')?.value || '',
    has_contact: document.getElementById('filter-contact')?.value || '',
    contact_hidden: document.getElementById('filter-hidden-contact')?.value || ''
  };
  if (filters.has_contact === 'true') filters.has_email = 'true';
  if (filters.has_contact === 'false') filters.has_email = 'false';
  delete filters.has_contact;

  Object.keys(filters).forEach(k => {
    if (filters[k] === '' || filters[k] === null || filters[k] === undefined) {
      delete filters[k];
    }
  });
  return filters;
}

let lastResultsData = [];
async function loadResults() {
  const filters = getActiveFilters();
  const query = new URLSearchParams({
    page: currentPage, per_page: perPage, sort_by: sortCol, sort_dir: sortDir, ...filters
  });
  
  try {
    const res = await api(`/api/events?${query.toString()}`);
    lastResultsData = res.events || res.items || [];
    renderResultsTable(lastResultsData);
    const total = res.total || 0;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    renderPagination(total, res.page || currentPage, totalPages);
    const countEl = document.getElementById('results-count');
    if (countEl) {
      if (total === 0) {
        countEl.textContent = 'Showing 0 results';
      } else {
        const start = (currentPage - 1) * perPage + 1;
        const end = Math.min(currentPage * perPage, total);
        countEl.textContent = `Showing ${start}–${end} of ${total} events`;
      }
    }
  } catch(e) {
    console.error('Failed to load results', e);
  }
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
      <div class="empty-state-icon">${ICONS.document}</div>
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
  currentPage = 1;
  loadResults();
});

document.getElementById('btn-reset-filters').addEventListener('click', () => {
  document.querySelectorAll('.filter-bar input, .filter-bar select').forEach(el => el.value = '');
  currentPage = 1;
  loadResults();
});

document.querySelectorAll('.filter-bar select').forEach(select => {
  select.addEventListener('change', () => {
    currentPage = 1;
    loadResults();
  });
});

document.querySelectorAll('.filter-bar input').forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      currentPage = 1;
      loadResults();
    }
  });
});

document.getElementById('results-per-page').addEventListener('change', (e) => {
  perPage = parseInt(e.target.value);
  currentPage = 1;
  loadResults();
});

document.getElementById('btn-export-csv').addEventListener('click', () => {
  const query = new URLSearchParams(getActiveFilters()).toString();
  window.open(`${API}/api/events/export/csv?${query}`, '_blank');
});
document.getElementById('btn-export-xlsx').addEventListener('click', () => {
  const query = new URLSearchParams(getActiveFilters()).toString();
  window.open(`${API}/api/events/export/xlsx?${query}`, '_blank');
});

// ── Job History ──────────────────────────────────────────────────────────────

async function loadJobHistory() {
  try {
    const res = await api('/api/jobs');
    const jobs = Array.isArray(res) ? res : (res.jobs || []);
    const container = document.getElementById('job-history-list');
    container.innerHTML = '';
    
    // populate job filter dropdown
    const jobFilter = document.getElementById('filter-job');
    const currentSelectedJob = jobFilter ? jobFilter.value : '';
    if (jobFilter) {
      jobFilter.innerHTML = '<option value="">All Jobs</option>';
    }
    
    if(jobs.length === 0) {
      container.innerHTML = `<div class="empty-state" style="grid-column: span 2">
        <div class="empty-state-icon">${ICONS.clock}</div><p>No job history</p></div>`;
      return;
    }

    let isRunning = false;
    jobs.forEach(job => {
      if(job.status === 'running' || job.status === 'pending') isRunning = true;
      
      if (jobFilter) {
        const opt = document.createElement('option');
        opt.value = job.id;
        opt.textContent = `${formatDate(job.created_at)} - ${truncate(job.url, 30)}`;
        if (job.id === currentSelectedJob) opt.selected = true;
        jobFilter.appendChild(opt);
      }

      // Extract filter tags
      let filterTags = [];
      if (job.schedule_id || job.schedule_label) {
        const schedLabel = job.schedule_label || 'Scheduled Job';
        filterTags.push(`<span class="tag" style="background:rgba(52, 211, 153, 0.15); color:#4ade80; border:1px solid rgba(52, 211, 153, 0.35); font-weight:600;" title="Created by Schedule: ${schedLabel}">⏱️ ${escapeHtml(schedLabel)}</span>`);
      }
      if (job.platform) filterTags.push(`<span class="tag" style="background:var(--surface-elevated)">🏢 ${job.platform}</span>`);
      if (job.dance_style) filterTags.push(`<span class="tag" style="background:var(--primary);color:#fff">💃 ${job.dance_style}</span>`);
      
      const f = typeof job.filters === 'string' ? JSON.parse(job.filters || '{}') : (job.filters || {});
      if (f.city) filterTags.push(`<span class="tag">📍 ${escapeHtml(f.city)}</span>`);
      if (f.keyword) filterTags.push(`<span class="tag">🔍 ${escapeHtml(f.keyword)}</span>`);
      if (f.date_from || f.date_to) filterTags.push(`<span class="tag">📅 ${escapeHtml(f.date_from || 'Any')} → ${escapeHtml(f.date_to || 'Any')}</span>`);
      
      const filterHtml = filterTags.length > 0 
        ? `<div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;">${filterTags.join('')}</div>`
        : `<div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:12px;">No filter parameters</div>`;

      let durationStr = 'N/A';
      if (job.started_at) {
        const start = new Date(job.started_at).getTime();
        const end = job.finished_at ? new Date(job.finished_at).getTime() : Date.now();
        const diffSecs = Math.floor((end - start) / 1000);
        if (diffSecs < 60) {
          durationStr = `${diffSecs}s`;
        } else {
          const m = Math.floor(diffSecs / 60);
          const s = diffSecs % 60;
          durationStr = `${m}m ${s}s`;
        }
      }

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <div style="font-size:0.8rem; color:var(--text-secondary); display:flex; align-items:center; gap:6px;">
            <span>${formatDate(job.created_at)}</span>
          </div>
          <span class="badge badge-${job.status}">${job.status}</span>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; background:var(--surface-elevated); border:1px solid var(--border); border-radius:8px; padding:7px 10px; margin-bottom:12px; font-family:'JetBrains Mono', monospace; font-size:0.8rem;">
          <a href="${job.url}" target="_blank" style="color:var(--text-primary); text-decoration:none; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;" title="${job.url}">
            ${job.url}
          </a>
          <div style="display:inline-flex; gap:4px; flex-shrink:0; align-items:center;">
            <button class="icon-btn" onclick="copyJobUrl('${escapeJs(job.url)}')" title="Copy Full Target URL" style="padding:3px; color:var(--text-secondary);">
              ${ICONS.copy}
            </button>
            <a href="${job.url}" target="_blank" class="icon-btn" title="Open Target URL in new tab" style="padding:3px; color:var(--text-secondary); text-decoration:none;">
              ${ICONS.external}
            </a>
          </div>
        </div>

        ${filterHtml}
        <div class="grid grid-cols-2" style="font-size:0.875rem; color:var(--text-secondary); margin-bottom:16px; gap:8px;">
          <div>Events found: <strong style="color:var(--text-primary)">${job.events_found || 0}</strong></div>
          <div>New: <strong style="color:var(--success)">${job.events_new || 0}</strong></div>
          <div>Duration: <strong style="color:var(--text-primary)">${durationStr}</strong></div>
        </div>
        <div style="display:flex; gap:8px; align-items:center; flex-wrap:nowrap;">
          <button class="btn btn-secondary btn-sm" style="white-space:nowrap;" onclick="viewJobResults('${job.id}')">${ICONS.chart} View Results</button>
          ${job.status === 'running' || job.status === 'pending'
            ? `<button class="btn btn-danger btn-sm" style="white-space:nowrap; background-color: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #ef4444;" onclick="cancelJobHistory('${job.id}')">${ICONS.pause} Stop</button>`
            : `<button class="btn btn-primary btn-sm" style="white-space:nowrap;" onclick="rerunJob('${job.id}')">${ICONS.repeat} Rerun</button>`
          }
          <button class="btn btn-danger btn-sm" style="white-space:nowrap;" onclick="deleteJob('${job.id}')">${ICONS.trash} Delete</button>
        </div>
      `;
      container.appendChild(card);
    });
  } catch(e) {
    console.error('Failed to load job history', e);
  }
}

window.viewJobResults = (jobId) => {
  document.querySelector('.nav-item[data-target="section-results"]').click();
  const jobFilter = document.getElementById('filter-job');
  if (jobFilter) jobFilter.value = jobId;
  currentPage = 1;
  loadResults();
};

window.rerunJob = async (jobId) => {
  const confirmed = await confirmAction('Re-run this scraping job with the same URL and filter parameters?');
  if (!confirmed) return;

  try {
    const job = await api(`/api/jobs/${jobId}`);
    if (!job) {
      showToast('Job not found', 'error');
      return;
    }

    // Switch to New Job tab
    const newJobNav = document.querySelector('.nav-item[data-target="section-new-job"]');
    if (newJobNav) newJobNav.click();

    // Populate URL
    const urlInput = document.getElementById('job-url');
    if (urlInput) {
      urlInput.value = job.url || GAD_BASE_ES;
      syncUrlToGadLanguage(job.url || GAD_BASE_ES, 'job_gad_lang');
    }

    // Populate Platform radio
    const platform = job.platform || 'goandance';
    document.querySelectorAll('input[name="job_platform"]').forEach(r => {
      r.checked = (r.value === platform);
    });

    // Populate Dance Style
    const styleInput = document.getElementById('job-dance-style');
    if (styleInput) styleInput.value = job.dance_style || '';

    // Parse filters
    const f = typeof job.filters === 'string' ? JSON.parse(job.filters || '{}') : (job.filters || {});
    const dateFrom = document.getElementById('job-date-from');
    if (dateFrom) dateFrom.value = f.date_from || '';

    const dateTo = document.getElementById('job-date-to');
    if (dateTo) dateTo.value = f.date_to || '';

    const locationInput = document.getElementById('job-location');
    if (locationInput) locationInput.value = f.city || '';

    const keywordInput = document.getElementById('job-keyword');
    if (keywordInput) keywordInput.value = f.keyword || '';

    // Populate Concurrency
    if (job.concurrency && UI.concurrencySlider) {
      UI.concurrencySlider.value = job.concurrency;
      if (UI.concurrencyVal) UI.concurrencyVal.textContent = job.concurrency;
    }

    // Automatically trigger scraping
    showToast('Starting re-run with original settings...', 'info');
    setTimeout(() => {
      UI.btnStart.click();
    }, 300);
  } catch (e) {
    showToast('Failed to prepare rerun job', 'error');
  }
};

window.cancelJobHistory = async (jobId) => {
  const confirmed = await confirmAction('Are you sure you want to stop this running job?');
  if (!confirmed) return;

  try {
    const res = await api(`/api/jobs/${jobId}/cancel`, { method: 'POST' });
    if (res.status === 'cancelled' || res.status === 'failed') {
      showToast('Job cancelled successfully', 'success');
      loadJobHistory();
    }
  } catch (e) {
    showToast('Failed to cancel job', 'error');
  }
};

window.deleteJob = async (jobId) => {
  if(await confirmAction('Are you sure you want to delete this job and its scraped event results from the database?')) {
    await api(`/api/jobs/${jobId}`, { method: 'DELETE' });
    showToast('Job and associated events deleted', 'success');
    loadJobHistory();
  }
};
document.getElementById('btn-refresh-jobs').addEventListener('click', loadJobHistory);

// ── Scheduler & Cron Builder ──────────────────────────────────────────────────

function getOffsetISODate(minutes) {
  const d = new Date(Date.now() + minutes * 60000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${mins}`,
    iso: `${year}-${month}-${day}T${hours}:${mins}:00`
  };
}

function humanizeCron(expr) {
  if (!expr) return 'No schedule set';
  const clean = expr.replace('once:', '').replace('at:', '').trim();

  // Check if ISO Date (one-time execution)
  if (clean.includes('T') || clean.includes('-')) {
    try {
      const dt = new Date(clean);
      if (!isNaN(dt.getTime())) {
        const dateStr = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = dt.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        return `Runs once on ${dateStr} at ${timeStr}`;
      }
    } catch(e) {}
  }

  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return 'Custom schedule';
  const [min, hour, dom, mon, dow] = parts;

  // Every N minutes
  if (min.startsWith('*/') && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    return `Runs every ${min.slice(2)} mins`;
  }
  // Every hour
  if (min === '0' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    return 'Runs every hour on the hour';
  }
  // Every N hours
  if (hour.startsWith('*/') && dom === '*' && mon === '*' && dow === '*') {
    return `Runs every ${hour.slice(2)} hrs at :${min.padStart(2, '0')}`;
  }
  // Daily at specific time
  if (dom === '*' && mon === '*' && dow === '*') {
    return `Runs daily at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
  }
  // Specific days of week
  if (dom === '*' && mon === '*' && dow !== '*') {
    const dayNames = { '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat', '7': 'Sun' };
    const days = dow.split(',').map(d => dayNames[d] || d).join(', ');
    return `Runs every ${days} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
  }
  // Monthly
  if (mon === '*' && dow === '*' && dom !== '*') {
    return `Runs monthly on day ${dom} at ${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
  }

  return `Custom: ${expr}`;
}

function initOncePanelInputs() {
  const onceDate = document.getElementById('cron-once-date');
  const onceTime = document.getElementById('cron-once-time');
  if (onceDate && !onceDate.value) {
    const offset = getOffsetISODate(5);
    onceDate.value = offset.date;
    if (onceTime) onceTime.value = offset.time;
  }
}

function generateBuilderCron() {
  const activeBtn = document.querySelector('.cron-freq-btn.active');
  const freq = activeBtn?.dataset.freq || 'once';
  let cron = '0 9 * * *';
  let human = 'Runs daily at 09:00';

  if (freq === 'once') {
    initOncePanelInputs();
    const dateVal = document.getElementById('cron-once-date')?.value;
    const timeVal = document.getElementById('cron-once-time')?.value || '09:00';
    if (dateVal && timeVal) {
      cron = `${dateVal}T${timeVal}:00`;
      human = humanizeCron(cron);
    }
  } else if (freq === 'interval') {
    const val = document.getElementById('cron-interval-value')?.value || '1h';
    const startMin = document.getElementById('cron-interval-minute')?.value || '0';
    if (val.endsWith('m')) {
      const mins = val.replace('m', '');
      cron = `*/${mins} * * * *`;
      human = `Runs every ${mins} minutes`;
    } else {
      const hrs = val.replace('h', '');
      if (hrs === '1') {
        cron = `${startMin} * * * *`;
        human = `Runs every hour at :${startMin.padStart(2, '0')} minutes`;
      } else {
        cron = `${startMin} */${hrs} * * *`;
        human = `Runs every ${hrs} hours at :${startMin.padStart(2, '0')} minutes`;
      }
    }
  } else if (freq === 'daily') {
    const timeVal = document.getElementById('cron-daily-time')?.value || '09:00';
    const [h, m] = timeVal.split(':');
    cron = `${parseInt(m, 10)} ${parseInt(h, 10)} * * *`;
    human = `Runs every day at ${h}:${m}`;
  } else if (freq === 'weekly') {
    const timeVal = document.getElementById('cron-weekly-time')?.value || '09:00';
    const [h, m] = timeVal.split(':');
    const checkedDays = Array.from(document.querySelectorAll('.cron-day-chk:checked')).map(c => c.value);
    const dowStr = checkedDays.length > 0 ? checkedDays.join(',') : '*';
    cron = `${parseInt(m, 10)} ${parseInt(h, 10)} * * ${dowStr}`;
    const dayLabels = { '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed', '4': 'Thu', '5': 'Fri', '6': 'Sat' };
    const dayList = checkedDays.map(d => dayLabels[d] || d).join(', ');
    human = checkedDays.length > 0 ? `Runs every ${dayList} at ${h}:${m}` : `Runs every day at ${h}:${m}`;
  } else if (freq === 'monthly') {
    const day = document.getElementById('cron-monthly-day')?.value || '1';
    const timeVal = document.getElementById('cron-monthly-time')?.value || '09:00';
    const [h, m] = timeVal.split(':');
    cron = `${parseInt(m, 10)} ${parseInt(h, 10)} ${day} * *`;
    human = `Runs on day ${day} of every month at ${h}:${m}`;
  } else if (freq === 'raw') {
    cron = document.getElementById('cron-raw-input')?.value.trim() || '0 9 * * *';
    human = humanizeCron(cron);
  }

  const codeEl = document.getElementById('cron-preview-code');
  const humanEl = document.getElementById('cron-preview-human');
  if (codeEl) codeEl.textContent = cron;
  if (humanEl) humanEl.textContent = human;

  return { cron, human };
}

// Preset Radio Buttons
document.querySelectorAll('input[name="sched_preset"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const cronInput = document.getElementById('sched-cron');
    const summaryEl = document.getElementById('sched-cron-summary');
    if (cronInput) {
      if (e.target.value === 'in_5_mins') {
        const offset = getOffsetISODate(5);
        cronInput.value = offset.iso;
        if (summaryEl) summaryEl.textContent = `Runs once at ${offset.time} (in 5 mins)`;
      } else if (e.target.value) {
        cronInput.value = e.target.value;
        if (summaryEl) summaryEl.textContent = humanizeCron(e.target.value);
      }
    }
  });
});

// Live typing in cron input
const schedCronInput = document.getElementById('sched-cron');
schedCronInput?.addEventListener('input', () => {
  const summaryEl = document.getElementById('sched-cron-summary');
  if (summaryEl) summaryEl.textContent = humanizeCron(schedCronInput.value);
});

// Open / Close Cron Builder Modal
const btnOpenCronBuilder = document.getElementById('btn-open-cron-builder');
btnOpenCronBuilder?.addEventListener('click', () => {
  initOncePanelInputs();
  generateBuilderCron();
  openModal('modal-cron-builder');
});

document.getElementById('btn-close-cron-builder')?.addEventListener('click', () => {
  closeModal('modal-cron-builder');
});
document.getElementById('btn-cancel-cron-builder')?.addEventListener('click', () => {
  closeModal('modal-cron-builder');
});

// One-time quick offset buttons inside modal
document.querySelectorAll('.cron-once-preset').forEach(btn => {
  btn.addEventListener('click', () => {
    const mins = parseInt(btn.dataset.offset || '5', 10);
    const offset = getOffsetISODate(mins);
    const onceDate = document.getElementById('cron-once-date');
    const onceTime = document.getElementById('cron-once-time');
    if (onceDate) onceDate.value = offset.date;
    if (onceTime) onceTime.value = offset.time;
    generateBuilderCron();
  });
});

// Apply Builder result
document.getElementById('btn-apply-cron-builder')?.addEventListener('click', () => {
  const { cron, human } = generateBuilderCron();
  const cronInput = document.getElementById('sched-cron');
  const summaryEl = document.getElementById('sched-cron-summary');
  if (cronInput) cronInput.value = cron;
  if (summaryEl) summaryEl.textContent = human;
  
  // Uncheck presets
  document.querySelectorAll('input[name="sched_preset"]').forEach(r => r.checked = false);
  
  closeModal('modal-cron-builder');
  showToast(`Schedule set to: ${human}`, 'success');
});

// Frequency tab buttons in modal
document.querySelectorAll('.cron-freq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cron-freq-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    const freq = btn.dataset.freq;
    document.querySelectorAll('.cron-panel').forEach(p => p.classList.add('hidden'));
    const targetPanel = document.getElementById(`cron-panel-${freq}`);
    if (targetPanel) targetPanel.classList.remove('hidden');
    
    generateBuilderCron();
  });
});

// Weekly Day checkbox chips
document.querySelectorAll('.cron-day-label').forEach(label => {
  const chk = label.querySelector('.cron-day-chk');
  chk?.addEventListener('change', () => {
    if (chk.checked) {
      label.classList.add('active');
    } else {
      label.classList.remove('active');
    }
    generateBuilderCron();
  });
});

// Input change listeners in modal
['cron-once-date', 'cron-once-time', 'cron-interval-value', 'cron-interval-minute', 'cron-daily-time', 'cron-weekly-time', 'cron-monthly-day', 'cron-monthly-time', 'cron-raw-input'].forEach(id => {
  const el = document.getElementById(id);
  el?.addEventListener('input', generateBuilderCron);
  el?.addEventListener('change', generateBuilderCron);
});

let currentEditingScheduleId = null;

function resetScheduleForm() {
  currentEditingScheduleId = null;
  document.getElementById('sched-label').value = '';
  
  const defaultLang = document.querySelector('input[name="sched_gad_lang"][value="es"]');
  if (defaultLang) defaultLang.checked = true;

  const schedUrl = document.getElementById('sched-url');
  if (schedUrl) {
    schedUrl.value = GAD_BASE_ES;
    schedUrl.placeholder = GAD_BASE_ES;
  }

  document.getElementById('sched-date-from').value = '';
  document.getElementById('sched-date-to').value = '';
  document.getElementById('sched-city').value = '';
  document.getElementById('sched-keyword').value = '';
  const schedDanceStyle = document.getElementById('sched-dance-style');
  if (schedDanceStyle) schedDanceStyle.value = '';
  document.getElementById('sched-cron').value = '0 9 * * *';
  
  const summaryEl = document.getElementById('sched-cron-summary');
  if (summaryEl) summaryEl.textContent = 'Runs daily at 09:00';
  
  const defaultPlatform = document.querySelector('input[name="sched_platform"][value="goandance"]');
  if (defaultPlatform) defaultPlatform.checked = true;
  
  const btnCreate = document.getElementById('btn-create-schedule');
  if (btnCreate) btnCreate.textContent = 'Create Schedule';
  
  const btnCancel = document.getElementById('btn-cancel-edit-schedule');
  if (btnCancel) btnCancel.classList.add('hidden');
  
  const editBadge = document.getElementById('sched-edit-mode-badge');
  if (editBadge) editBadge.classList.add('hidden');
}

window.editSchedule = async (id) => {
  try {
    const sched = await api(`/api/schedule/${id}`);
    if (!sched) return;
    
    currentEditingScheduleId = id;
    
    document.getElementById('sched-label').value = sched.label || '';
    const schedUrl = document.getElementById('sched-url');
    if (schedUrl) {
      schedUrl.value = sched.url || '';
      syncUrlToGadLanguage(sched.url, 'sched_gad_lang');
    }
    
    const platform = sched.platform || 'goandance';
    const radio = document.querySelector(`input[name="sched_platform"][value="${platform}"]`);
    if (radio) radio.checked = true;
    
    const filters = typeof sched.filters === 'string' ? JSON.parse(sched.filters || '{}') : (sched.filters || {});
    document.getElementById('sched-date-from').value = filters.date_from || '';
    document.getElementById('sched-date-to').value = filters.date_to || '';
    document.getElementById('sched-city').value = filters.city || '';
    document.getElementById('sched-keyword').value = filters.keyword || '';
    const schedDanceStyle = document.getElementById('sched-dance-style');
    if (schedDanceStyle) schedDanceStyle.value = sched.dance_style || filters.dance_style || '';
    
    document.getElementById('sched-cron').value = sched.cron_expression || '0 9 * * *';
    const summaryEl = document.getElementById('sched-cron-summary');
    if (summaryEl) summaryEl.textContent = humanizeCron(sched.cron_expression);
    
    const btnCreate = document.getElementById('btn-create-schedule');
    if (btnCreate) btnCreate.textContent = 'Update Schedule';
    
    const btnCancel = document.getElementById('btn-cancel-edit-schedule');
    if (btnCancel) btnCancel.classList.remove('hidden');
    
    const editBadge = document.getElementById('sched-edit-mode-badge');
    if (editBadge) {
      editBadge.textContent = `Editing: ${sched.label || 'Schedule'}`;
      editBadge.classList.remove('hidden');
    }
    
    // Focus and scroll to schedule form
    document.getElementById('sched-label').focus();
    document.getElementById('section-scheduler')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    
    showToast(`Loaded "${sched.label || 'Schedule'}" for editing`, 'info');
  } catch(e) {
    showToast('Failed to load schedule for editing: ' + e.message, 'error');
  }
};

document.getElementById('btn-cancel-edit-schedule')?.addEventListener('click', () => {
  resetScheduleForm();
  showToast('Schedule editing cancelled', 'info');
});

document.getElementById('btn-create-schedule').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  if (btn.disabled) return;

  const payload = {
    label: document.getElementById('sched-label').value,
    url: document.getElementById('sched-url').value,
    platform: document.querySelector('input[name="sched_platform"]:checked')?.value || 'goandance',
    dance_style: document.getElementById('sched-dance-style')?.value || null,
    cron_expression: document.getElementById('sched-cron').value,
    filters: {
      date_from: document.getElementById('sched-date-from').value || null,
      date_to: document.getElementById('sched-date-to').value || null,
      city: document.getElementById('sched-city').value || null,
      keyword: document.getElementById('sched-keyword').value || null
    }
  };
  
  if(!payload.url || !payload.cron_expression) return showToast('URL and schedule are required', 'error');

  btn.disabled = true;
  try {
    if (currentEditingScheduleId) {
      await api(`/api/schedule/${currentEditingScheduleId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Schedule updated successfully', 'success');
      resetScheduleForm();
    } else {
      await api('/api/schedule', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Schedule created', 'success');
      resetScheduleForm();
    }
    loadSchedules();
  } catch(e) {
    showToast('Failed to save schedule: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

async function loadSchedules() {
  try {
    const res = await api('/api/schedule');
    const schedules = Array.isArray(res) ? res : (res.schedules || []);
    const tbody = document.getElementById('schedules-tbody');
    tbody.innerHTML = '';
    
    if(schedules.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-state"><div class="empty-state-icon">${ICONS.calendar}</div><p>No schedules found</p></td></tr>`;
      return;
    }
    
    schedules.forEach(item => {
      const tr = document.createElement('tr');
      const status = item.computed_status || (item.active ? 'active' : (item.last_run_at && !item.next_run_at ? 'completed' : 'disabled'));
      
      let badgeClass = 'badge-pending';
      let statusText = status.toUpperCase();
      if (status === 'running') {
        badgeClass = 'badge-running';
      } else if (status === 'active') {
        badgeClass = 'badge-active';
      } else if (status === 'completed') {
        badgeClass = 'badge-done';
      } else if (status === 'disabled') {
        badgeClass = 'badge-disabled';
      }

      const isActive = (item.active === 1 || item.active === true);
      const toggleTitle = isActive ? 'Disable Schedule' : 'Enable Schedule';
      const toggleIcon = isActive ? ICONS.pause : ICONS.play;
      const toggleBtnClass = isActive ? 'btn-secondary' : 'btn-secondary';
      const toggleStyle = isActive ? 'color: var(--warning);' : 'color: var(--success);';

      tr.innerHTML = `
        <td><strong>${item.label || '—'}</strong></td>
        <td><a href="${item.url}" target="_blank" style="color:inherit">${truncate(item.url, 30)}</a></td>
        <td><code style="background:var(--surface-elevated); padding:2px 6px; border-radius:4px" title="${humanizeCron(item.cron_expression)}">${item.cron_expression}</code></td>
        <td>${formatDate(item.next_run_at || item.next_run)}</td>
        <td>${formatDate(item.last_run_at || item.last_run)}</td>
        <td><span class="badge ${badgeClass}">${statusText}</span></td>
        <td>
          <div style="display:inline-flex; gap:6px; align-items:center;">
            <button class="btn ${toggleBtnClass} btn-sm" onclick="toggleSchedule('${item.id}', ${item.active})" title="${toggleTitle}" style="${toggleStyle}">${toggleIcon}</button>
            <button class="btn btn-secondary btn-sm" onclick="editSchedule('${item.id}')" title="Edit Schedule">${ICONS.edit}</button>
            <button class="btn btn-danger btn-sm" onclick="deleteSchedule('${item.id}')" title="Delete">${ICONS.trash}</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch(e) {
    console.error('Failed to load schedules', e);
  }
}

window.toggleSchedule = async (id, currentActive) => {
  try {
    const action = (currentActive === 1 || currentActive === true) ? 'pause' : 'resume';
    await api(`/api/schedule/${id}/${action}`, { method: 'POST' });
    showToast(action === 'pause' ? 'Schedule disabled' : 'Schedule enabled', 'success');
    loadSchedules();
  } catch(e) {
    showToast('Failed to toggle schedule: ' + e.message, 'error');
  }
};

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
    await api('/api/sessions', { method: 'POST', body: JSON.stringify({ label, site_domain: domain, cookies_json: cookiesJson }) });
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
    const sessions = Array.isArray(res) ? res : (res.sessions || []);
    const tbody = document.getElementById('sessions-tbody');
    const select = document.getElementById('select-session');
    
    tbody.innerHTML = '';
    select.innerHTML = '<option value="">None</option>';
    
    if(sessions.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-state"><div class="empty-state-icon">${ICONS.cookie}</div><p>No saved sessions</p></td></tr>`;
      return;
    }
    
    sessions.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id; opt.textContent = item.label;
      select.appendChild(opt);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.label}</strong></td>
        <td>${item.site_domain || item.domain || '—'}</td>
        <td>${formatDate(item.created_at)}</td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteSession('${item.id}')" title="Delete">${ICONS.trash}</button></td>
      `;
      tbody.appendChild(tr);
    });
  } catch(e) {
    console.error('Failed to load sessions', e);
  }
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
    loadResults();
    loadJobHistory();
  } catch(e) {}
}

document.getElementById('btn-clean-cache-age').addEventListener('click', async () => {
  const days = parseInt(document.getElementById('cleanup-cache-days').value);
  if (await confirmAction(`Are you sure you want to delete HTML cache older than ${days} days?`)) {
    runCleanup('/api/monitor/cleanup/cache-older-than', { days });
  }
});

document.getElementById('btn-clean-cache-size').addEventListener('click', async () => {
  const size_mb = parseInt(document.getElementById('cleanup-cache-mb').value);
  if (await confirmAction(`Are you sure you want to delete HTML cache folders larger than ${size_mb} MB?`)) {
    runCleanup('/api/monitor/cleanup/cache-larger-than', { size_mb });
  }
});

document.getElementById('btn-clean-events').addEventListener('click', async () => {
  const days = parseInt(document.getElementById('cleanup-events-days').value);
  if (await confirmAction(`Are you sure you want to delete unlinked events older than ${days} days?`)) {
    runCleanup('/api/monitor/cleanup/events-older-than', { days });
  }
});

document.getElementById('btn-clean-compress').addEventListener('click', async () => {
  if (await confirmAction(`This will compress all HTML caches into ZIP files and free up space using SQLite VACUUM. It may take some time. Do you want to proceed?`)) {
    runCleanup('/api/monitor/cleanup/compress');
  }
});

document.getElementById('btn-clean-backup').addEventListener('click', async () => {
  if (await confirmAction(`This will create a full backup of your database and HTML caches into a downloadable ZIP file. Do you want to proceed?`)) {
    try {
      const res = await api('/api/monitor/backup');
      const link = document.getElementById('backup-download-link');
      link.href = API + res.download_url;
      link.classList.remove('hidden');
      showToast('Backup created', 'success');
    } catch(e) {}
  }
});

purgeBtn.addEventListener('click', async () => {
  if(purgeConfirm.value === 'DELETE') {
    if (await confirmAction(`WARNING: This will purge EVERYTHING. All jobs, events, sessions, and HTML caches will be wiped. Are you absolutely sure?`)) {
      runCleanup('/api/monitor/cleanup/purge-all');
      purgeConfirm.value = '';
      purgeBtn.disabled = true;
    }
  }
});

// ── Version & Changelog ──────────────────────────────────────────────────────

async function loadVersionInfo() {
  try {
    const data = await api('/api/version');
    const badge = document.getElementById('btn-version');
    const tag = document.getElementById('version-modal-tag');
    const container = document.getElementById('changelog-list-container');

    if (badge) badge.innerHTML = `v${data.version}`;
    if (tag) tag.textContent = `v${data.version}`;

    if (container && data.changelog) {
      container.innerHTML = data.changelog.map(entry => `
        <div class="changelog-entry" style="margin-bottom: 24px;">
          <div class="changelog-entry-header" style="display: flex; justify-content: space-between; align-items: baseline; width: 100%; margin-bottom: 8px;">
            <span class="changelog-entry-version" style="font-family: var(--font-mono); font-size: 0.9rem; font-weight: 600; color: #4ade80;">v${entry.version}</span>
            <span class="changelog-entry-date" style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); text-align: right;">${entry.date}</span>
          </div>
          <ul class="changelog-entry-ul" style="list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px;">
            ${entry.changes.map(c => `
              <li class="changelog-entry-li" style="display: flex; align-items: baseline; gap: 8px; font-size: 0.875rem; line-height: 1.5; color: var(--text-secondary);">
                <span class="changelog-bullet" style="color: var(--text-muted); font-size: 0.9rem; flex-shrink: 0;">&bull;</span>
                <span class="changelog-text" style="flex: 1;">${c}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('Failed to load version info', e);
  }
}

const btnVersion = document.getElementById('btn-version');
const modalVersion = document.getElementById('modal-version');
const btnCloseVersion = document.getElementById('btn-close-version');

if (btnVersion) {
  btnVersion.addEventListener('click', () => {
    openModal('modal-version');
  });
}

if (btnCloseVersion) {
  btnCloseVersion.addEventListener('click', () => {
    closeModal('modal-version');
  });
}

// ── Live Background Polling & Status Sync ─────────────────────────────────────

let prevRunningJobIds = new Set();
let isPolling = false;

async function pollLiveState() {
  if (isPolling) return;
  isPolling = true;
  try {
    // 1. Instant in-memory active jobs check — use raw fetch to avoid toast errors
    let hasRunningJob = false;
    let hasRunningScheduledJob = false;
    let activeJobIds = [];
    try {
      const activeRes = await fetch(`${API}/api/jobs/active`);
      if (activeRes.ok) {
        const activeData = await activeRes.json();
        hasRunningJob = activeData.has_active_jobs || false;
        hasRunningScheduledJob = (activeData.active_schedule_ids?.length || 0) > 0;
        activeJobIds = activeData.active_job_ids || [];
      }
    } catch (_) {}
    
    const jobHistoryDot = document.getElementById('job-history-pulse') || (function() {
      const parent = document.querySelector('[data-target="section-job-history"]');
      if (!parent) return null;
      const dot = document.createElement('span');
      dot.id = 'job-history-pulse';
      dot.className = 'nav-pulse-dot';
      parent.appendChild(dot);
      return dot;
    })();
    
    if (jobHistoryDot) {
      jobHistoryDot.style.display = hasRunningJob ? 'inline-block' : 'none';
    }
    
    // Update Scheduler sidebar pulse dot
    const schedDot = document.getElementById('scheduler-pulse') || (function() {
      const parent = document.querySelector('[data-target="section-scheduler"]');
      if (!parent) return null;
      const dot = document.createElement('span');
      dot.id = 'scheduler-pulse';
      dot.className = 'nav-pulse-dot';
      parent.appendChild(dot);
      return dot;
    })();
    
    if (schedDot) {
      schedDot.style.display = hasRunningScheduledJob ? 'inline-block' : 'none';
    }

    // 2. Fetch recent jobs to sync history / table data
    const res = await api('/api/jobs?page=1&per_page=20');
    const jobs = Array.isArray(res) ? res : (res.jobs || []);

    // Detect if a job just finished
    const currentRunningIds = new Set(activeJobIds.length > 0 ? activeJobIds : jobs.filter(j => j.status === 'running' || j.status === 'pending').map(j => j.id));
    for (const prevId of prevRunningJobIds) {
      if (!currentRunningIds.has(prevId)) {
        const finishedJob = jobs.find(j => j.id === prevId);
        if (finishedJob) {
          const title = finishedJob.schedule_label ? `Scheduled job "${finishedJob.schedule_label}"` : 'Scraping job';
          if (finishedJob.status === 'done') {
            showToast(`${title} finished (${finishedJob.events_found || 0} events, ${finishedJob.events_new || 0} new)`, 'success');
          } else if (finishedJob.status === 'failed') {
            showToast(`${title} failed`, 'error');
          }
        }
        if (activeSectionId === 'section-scheduler') loadSchedules();
        if (activeSectionId === 'section-results') loadResults();
      }
    }
    prevRunningJobIds = currentRunningIds;

    // Live update currently viewed section
    if (activeSectionId === 'section-job-history') {
      loadJobHistory();
    } else if (activeSectionId === 'section-scheduler') {
      loadSchedules();
    }
  } catch (e) {
    // Ignore polling errors
  } finally {
    isPolling = false;
  }
}

// ── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Inject CSS dynamically to bypass any browser cache issues for the new dot
  if (!document.getElementById('pulse-dot-styles')) {
    const style = document.createElement('style');
    style.id = 'pulse-dot-styles';
    style.textContent = `
      .nav-pulse-dot {
        display: none;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: #34d399;
        margin-left: 8px;
        box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7);
        animation: navPulse 2s infinite;
      }
      @keyframes navPulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
      }
    `;
    document.head.appendChild(style);
  }

  setupNavigation();
  setupResultsColumns();
  
  Promise.allSettled([
    loadVersionInfo(),
    loadSessions(),
    loadMonitorStats(),
    loadJobHistory(),
    loadResults(),
    loadSchedules(),
    pollLiveState()
  ]);
  
  // Real-time status sync every 2.5 seconds
  setInterval(pollLiveState, 2500);
  // Monitor stats every 60 seconds
  setInterval(loadMonitorStats, 60000);
});
