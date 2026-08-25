const API = window.location.origin;

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
  cookie: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M7.5 15.5v.01"></path><path d="M12 12v.01"></path><path d="M11 17v.01"></path><path d="M16 14v.01"></path></svg>`,
  list: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  refreshCw: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>`,
  layers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>`,
  terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
  arrowUp: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="sort-icon"><path d="M18 15l-6-6-6 6"/></svg>`,
  arrowDown: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="sort-icon"><path d="M6 9l6 6 6-6"/></svg>`,
  sortNeutral: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sort-icon sort-icon-neutral"><path d="M8 9l4-4 4 4"/><path d="M16 15l-4 4-4-4"/></svg>`
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

function parseUtcDate(isoStr) {
  if (!isoStr) return null;
  let str = String(isoStr).trim();
  if (!str.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(str)) {
    str += 'Z';
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date(isoStr) : d;
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  const d = parseUtcDate(isoStr);
  if (!d || isNaN(d.getTime())) return isoStr;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatLocalDate(isoStr) {
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

function resetTabScroll() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  const mainContent = document.querySelector('.main-content');
  if (mainContent) mainContent.scrollTop = 0;
  const activeSection = document.querySelector('.section.active');
  if (activeSection) activeSection.scrollTop = 0;
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('mobile-nav-toggle');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (!item.hasAttribute('data-target')) return;
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      
      sections.forEach(s => s.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
      activeSectionId = targetId;

      resetTabScroll();

      if (targetId === 'section-job-history') loadJobHistory();
      if (targetId === 'section-results') { loadJobHistory(); loadResults(); }
      if (targetId === 'section-scheduler') { loadSchedules(); loadGroups(); }
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

function setupUrlSync(urlInput, styleInput, dateFromInput, dateToInput, locationInput, locationSuggestions, langRadiosName, copyBtn, clearBtn, openBtn) {
  if (!urlInput) return;

  function getActiveBaseUrl() {
    const current = urlInput.value.trim();
    if (current) {
      try {
        return new URL(current);
      } catch (e) {}
    }
    const langRadio = document.querySelector(`input[name="${langRadiosName}"]:checked`);
    const lang = langRadio ? langRadio.value : 'en';
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

  // Platform Radio Change -> Toggle Filters
  const platformRadiosName = langRadiosName.replace('_gad_lang', '_platform');
  document.querySelectorAll(`input[name="${platformRadiosName}"]`).forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        const platform = e.target.value;
        const filterContainer = urlInput.id === 'job-url' ? document.getElementById('job-filters-container') : document.getElementById('sched-filters-container');
        const langGroup = urlInput.id === 'job-url' ? document.getElementById('job-gad-lang-group') : document.getElementById('sched-gad-lang-group');
        
        if (platform === 'salsero') {
          if (filterContainer) filterContainer.style.display = 'none';
          if (langGroup) langGroup.style.display = 'none';
          urlInput.value = 'https://salsero.es/bailas';
          urlInput.placeholder = 'https://salsero.es/bailas';
        } else {
          if (filterContainer) filterContainer.style.display = 'grid';
          if (langGroup) langGroup.style.display = 'block';
          const langRadio = document.querySelector(`input[name="${langRadiosName}"]:checked`);
          updateUrlLanguage(urlInput, langRadio ? langRadio.value : 'en');
        }
      }
    });
  });

  // Copy, Clear & Open URL buttons
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

  openBtn?.addEventListener('click', () => {
    const val = urlInput.value.trim();
    if (!val) {
      showToast('Target URL is empty', 'warning');
      return;
    }
    window.open(val, '_blank');
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
const btnOpenUrl = document.getElementById('btn-open-url');

setupUrlSync(urlInput, styleInput, dateFromInput, dateToInput, locationInput, locationSuggestions, 'job_gad_lang', btnCopyUrl, btnClearUrl, btnOpenUrl);

// Bind for Scheduler
const schedUrlInput = document.getElementById('sched-url');
const schedStyleInput = document.getElementById('sched-dance-style');
const schedDateFromInput = document.getElementById('sched-date-from');
const schedDateToInput = document.getElementById('sched-date-to');
const schedLocationInput = document.getElementById('sched-city');
const schedLocationSuggestions = document.getElementById('sched-city-suggestions');
const btnCopySchedUrl = document.getElementById('btn-copy-sched-url');
const btnClearSchedUrl = document.getElementById('btn-clear-sched-url');
const btnOpenSchedUrl = document.getElementById('btn-open-sched-url');

setupUrlSync(schedUrlInput, schedStyleInput, schedDateFromInput, schedDateToInput, schedLocationInput, schedLocationSuggestions, 'sched_gad_lang', btnCopySchedUrl, btnClearSchedUrl, btnOpenSchedUrl);

// ── Smart Job Nicknames ──────────────────────────────────────────────────────

let isNicknameManuallyEdited = false;

function generateDefaultJobNickname() {
  const platformRadio = document.querySelector('input[name="job_platform"]:checked');
  const platform = platformRadio ? (platformRadio.value === 'goandance' ? 'Go&Dance' : (platformRadio.value === 'salsero' ? 'Salsero' : platformRadio.value)) : 'Go&Dance';
  const style = document.getElementById('job-dance-style')?.value?.trim();
  const city = document.getElementById('job-location')?.value?.trim();
  const keyword = document.getElementById('job-keyword')?.value?.trim();
  
  const now = new Date();
  const dateFormatted = now.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

  let mainPart = '';
  if (style && city) {
    mainPart = `${style} in ${city}`;
  } else if (style) {
    mainPart = `${style}`;
  } else if (city) {
    mainPart = `${platform} ${city}`;
  } else if (keyword) {
    mainPart = `${keyword} (${platform})`;
  } else {
    mainPart = `${platform}`;
  }

  return `${mainPart} · ${dateFormatted}`;
}

function syncDefaultNickname() {
  const nickInput = document.getElementById('job-nickname');
  if (!nickInput) return;
  if (!isNicknameManuallyEdited || !nickInput.value.trim()) {
    nickInput.value = generateDefaultJobNickname();
  }
}

function setupNicknameSync() {
  const nickInput = document.getElementById('job-nickname');
  if (!nickInput) return;

  nickInput.addEventListener('input', () => {
    isNicknameManuallyEdited = (nickInput.value.trim().length > 0);
  });

  const inputsToWatch = [
    document.getElementById('job-dance-style'),
    document.getElementById('job-location'),
    document.getElementById('job-keyword')
  ];

  inputsToWatch.forEach(input => {
    if (input) {
      input.addEventListener('input', syncDefaultNickname);
      input.addEventListener('change', syncDefaultNickname);
    }
  });

  document.querySelectorAll('input[name="job_platform"]').forEach(radio => {
    radio.addEventListener('change', syncDefaultNickname);
  });

  if (!nickInput.value) {
    nickInput.value = generateDefaultJobNickname();
  }
}

UI.btnStart.addEventListener('click', async () => {
  const url = document.getElementById('job-url').value;
  if(!url) return showToast('Please enter a target URL', 'error');

  const nickname = document.getElementById('job-nickname')?.value?.trim() || generateDefaultJobNickname();
  const payload = {
    url,
    nickname,
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

const LS_COL_WIDTHS_KEY = 'lmscraper_column_widths';

function loadColumnWidths() {
  try {
    const raw = localStorage.getItem(LS_COL_WIDTHS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch(e) {
    return {};
  }
}

function saveColumnWidths(widths) {
  try {
    localStorage.setItem(LS_COL_WIDTHS_KEY, JSON.stringify(widths));
  } catch(e) {
    console.error('Failed to save column widths', e);
  }
}

let columnWidths = loadColumnWidths();

function getColumnWidth(colId, defaultWidth) {
  return columnWidths[colId] || defaultWidth || '120px';
}

const COLUMNS = [
  { id: 'bulk', sortable: false, defaultWidth: '44px', label: '<input type="checkbox" id="bulk-select-all">', render: (row) => `<input type="checkbox" class="row-checkbox" value="${row.id}">` },
  { id: 'locked', sortKey: 'is_locked', defaultWidth: '40px', label: '🔒', render: (row) => row.is_locked
    ? `<span class="icon-link lock-toggle" data-id="${row.id}" data-locked="1" title="Locked — click to unlock" style="cursor:pointer; color:var(--primary);">${ICONS.lock}</span>`
    : `<span class="icon-link lock-toggle" data-id="${row.id}" data-locked="0" title="Unlocked — click to lock" style="cursor:pointer; opacity:0.25;">${ICONS.lock}</span>` },
  { id: 'title', sortKey: 'title', defaultWidth: '220px', label: 'Title', render: (row) => `<strong>${truncate(row.title || 'Untitled', 40)}</strong>` },
  { id: 'date', sortKey: 'date_start', defaultWidth: '170px', label: 'Date & Time', render: (row) => formatDate(row.date_start || row.start_date) },
  { id: 'city', sortKey: 'city', defaultWidth: '150px', label: 'City/Country', render: (row) => `${row.city || '—'} ${row.country ? `(${row.country})` : ''}` },
  { id: 'category', sortKey: 'category', defaultWidth: '130px', label: 'Event Type', render: (row) => `<span class="tag">${row.category || '—'}</span>` },
  { id: 'dance_style', sortKey: 'dance_style', defaultWidth: '130px', label: 'Dance Style', render: (row) => row.dance_style ? `<span class="tag" style="background:var(--primary);color:#fff">${row.dance_style}</span>` : '—' },
  { id: 'organizer', sortKey: 'organizer_name', defaultWidth: '150px', label: 'Organizer', render: (row) => row.organizer_name || '—' },
  { id: 'platform', sortKey: 'platform', defaultWidth: '110px', label: 'Platform', render: (row) => {
    const p = row.platform || 'goandance';
    const label = p === 'goandance' ? 'Go&Dance' : p.charAt(0).toUpperCase() + p.slice(1);
    return `<span class="tag">${label}</span>`;
  }},
  { id: 'socials', sortKey: 'socials', defaultWidth: '140px', label: 'Contact', render: (row) => renderSocialLinks(row) },
  { id: 'hidden_contact', sortKey: 'contact_hidden', defaultWidth: '85px', label: 'Hidden', render: (row) => row.contact_hidden ? `<span class="icon-link" data-tooltip="Hidden contact form">${ICONS.lock}</span>` : '—' },
  { id: 'source', sortKey: 'source', defaultWidth: '85px', label: 'Source', render: (row) => row.event_url || row.source_url ? `<a href="${row.event_url || row.source_url}" target="_blank" class="icon-link" data-tooltip="Open source">${ICONS.link}</a>` : '—' }
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

let view_updated_for_job = null;

function getActiveFilters() {
  const filters = {
    date_from: document.getElementById('filter-date-from')?.value || '',
    date_to: document.getElementById('filter-date-to')?.value || '',
    city: document.getElementById('filter-city')?.value || '',
    keyword: document.getElementById('filter-keyword')?.value || '',
    job_ids: view_updated_for_job ? '' : Array.from(selectedJobIds).join(','),
    updated_by_job_id: view_updated_for_job || '',
    has_contact: document.getElementById('filter-contact')?.value || '',
    contact_hidden: document.getElementById('filter-hidden-contact')?.value || '',
    show_hidden: document.getElementById('filter-show-hidden')?.value || '',
    show_locked: document.getElementById('filter-show-locked')?.value || '',
  };

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
    th.dataset.colId = col.id;
    th.style.width = getColumnWidth(col.id, col.defaultWidth);

    if (col.id === 'bulk') {
      th.innerHTML = `<div class="th-header-inner" style="justify-content:center;"><span class="th-header-label"><input type="checkbox" id="bulk-select-all"></span></div><div class="col-resizer" data-col-id="${col.id}"></div>`;
    } else {
      const targetSortKey = col.sortKey || col.id;
      const isActiveSort = (sortCol === targetSortKey || sortCol === col.id);
      
      if (isActiveSort) {
        th.classList.add('sort-active');
      }

      const icon = isActiveSort 
        ? (sortDir === 'asc' ? ICONS.arrowUp : ICONS.arrowDown) 
        : ICONS.sortNeutral;

      th.innerHTML = `
        <div class="th-header-inner">
          <span class="th-header-label">${col.label}</span>
          <span class="sort-indicator">${icon}</span>
        </div>
        <div class="col-resizer" data-col-id="${col.id}"></div>
      `;

      th.addEventListener('click', (e) => {
        if (e.target.classList.contains('col-resizer')) return;
        if (isActiveSort) {
          sortDir = sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          sortCol = targetSortKey;
          sortDir = 'asc';
        }
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
  
  initColumnResizing();
}

function initColumnResizing() {
  const resizers = document.querySelectorAll('#results-table .col-resizer');
  resizers.forEach(resizer => {
    resizer.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const colId = resizer.dataset.colId;
      const th = resizer.parentElement;
      const startX = e.pageX;
      const startWidth = th.offsetWidth;
      
      resizer.classList.add('is-resizing');
      document.body.classList.add('is-resizing-col');
      
      const onMouseMove = (moveEvent) => {
        const deltaX = moveEvent.pageX - startX;
        const newWidth = Math.max(45, startWidth + deltaX);
        th.style.width = `${newWidth}px`;
        columnWidths[colId] = `${newWidth}px`;
      };
      
      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        resizer.classList.remove('is-resizing');
        document.body.classList.remove('is-resizing-col');
        saveColumnWidths(columnWidths);
      };
      
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    resizer.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const colId = resizer.dataset.colId;
      const th = resizer.parentElement;
      
      th.style.width = 'auto';
      const colIndex = Array.from(th.parentElement.children).indexOf(th);
      let maxW = th.scrollWidth;
      
      const rows = document.querySelectorAll('#results-tbody tr');
      rows.forEach(r => {
        const cell = r.children[colIndex];
        if (cell) {
          maxW = Math.max(maxW, cell.scrollWidth);
        }
      });
      
      const fitWidth = Math.max(50, Math.min(600, maxW + 24)) + 'px';
      th.style.width = fitWidth;
      columnWidths[colId] = fitWidth;
      saveColumnWidths(columnWidths);
    });
  });
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
  selectedJobIds.clear();
  view_updated_for_job = null;
  updateJobMultiselectLabel();
  renderJobMultiselectList();
  currentPage = 1;
  loadResults();
});

document.querySelectorAll('.filter-bar select').forEach(select => {
  select.addEventListener('change', () => {
    view_updated_for_job = null;
    currentPage = 1;
    loadResults();
  });
});

document.querySelectorAll('.filter-bar input').forEach(input => {
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      view_updated_for_job = null;
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

// ── Bulk Actions (Delete / Lock / Unlock) ────────────────────────────────────

function getCheckedEventIds() {
  return Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => parseInt(cb.value));
}

document.getElementById('btn-bulk-delete').addEventListener('click', async () => {
  const ids = getCheckedEventIds();
  if (!ids.length) return;

  // Check how many are locked
  const lockedSpans = Array.from(document.querySelectorAll('.row-checkbox:checked')).map(cb => {
    const tr = cb.closest('tr');
    return tr ? tr.querySelector('.lock-toggle') : null;
  }).filter(Boolean);
  const lockedCount = lockedSpans.filter(s => s.dataset.locked === '1').length;
  const unlockCount = ids.length - lockedCount;

  if (lockedCount > 0) {
    const proceed = await confirmAction(
      `${ids.length} rows selected: ${lockedCount} are locked and will be skipped, ${unlockCount} will be deleted. Proceed?`
    );
    if (!proceed) return;
  } else {
    const proceed = await confirmAction(`Delete ${ids.length} selected event(s)? This cannot be undone.`);
    if (!proceed) return;
  }

  // The backend already skips locked rows, so we can send all IDs safely
  // But we need job_ids context. For individual IDs we use a different approach:
  // We'll call DELETE /api/events with specific event IDs by sending them as a list.
  // However the current delete_events only supports job_id filtering, so we'll extend it.
  // For now collect unique job_ids from checked rows, filtered to unlocked ones only.
  const unlockedIds = Array.from(document.querySelectorAll('.row-checkbox:checked')).filter(cb => {
    const tr = cb.closest('tr');
    const lockEl = tr ? tr.querySelector('.lock-toggle') : null;
    return lockEl && lockEl.dataset.locked === '0';
  }).map(cb => parseInt(cb.value));

  if (!unlockedIds.length) {
    showToast('All selected rows are locked — nothing to delete.', 'info');
    return;
  }

  await api('/api/events/bulk-delete-by-ids', { method: 'POST', body: JSON.stringify({ event_ids: unlockedIds }), headers: { 'Content-Type': 'application/json' } });
  showToast(
    lockedCount > 0
      ? `Deleted ${unlockedIds.length} event(s). ${lockedCount} locked row(s) were preserved.`
      : `Deleted ${unlockedIds.length} event(s).`,
    'success'
  );
  loadResults();
});

document.getElementById('btn-bulk-lock').addEventListener('click', async () => {
  const ids = getCheckedEventIds();
  if (!ids.length) return showToast('No rows selected', 'error');
  await api('/api/events/bulk-lock', { method: 'POST', body: JSON.stringify({ event_ids: ids, locked: true }), headers: { 'Content-Type': 'application/json' } });
  showToast(`Locked ${ids.length} row(s).`, 'success');
  loadResults();
});

document.getElementById('btn-bulk-unlock').addEventListener('click', async () => {
  const ids = getCheckedEventIds();
  if (!ids.length) return showToast('No rows selected', 'error');
  await api('/api/events/bulk-lock', { method: 'POST', body: JSON.stringify({ event_ids: ids, locked: false }), headers: { 'Content-Type': 'application/json' } });
  showToast(`Unlocked ${ids.length} row(s).`, 'success');
  loadResults();
});

// ── Lock toggle (single row click on padlock icon) ───────────────────────────
document.getElementById('results-tbody').addEventListener('click', async (e) => {
  const toggle = e.target.closest('.lock-toggle');
  if (!toggle) return;
  const eventId = parseInt(toggle.dataset.id);
  const isCurrentlyLocked = toggle.dataset.locked === '1';
  const newLocked = !isCurrentlyLocked;

  await api(`/api/events/${eventId}/lock`, {
    method: 'PATCH',
    body: JSON.stringify({ locked: newLocked }),
    headers: { 'Content-Type': 'application/json' }
  });

  // Update the icon in place without full reload
  if (newLocked) {
    toggle.dataset.locked = '1';
    toggle.title = 'Locked — click to unlock';
    toggle.style.opacity = '1';
    toggle.style.color = 'var(--primary)';
  } else {
    toggle.dataset.locked = '0';
    toggle.title = 'Unlocked — click to lock';
    toggle.style.opacity = '0.25';
    toggle.style.color = '';
  }
  // Update the underlying data so the checkbox knows the state
  const data = lastResultsData.find(r => r.id === eventId);
  if (data) data.is_locked = newLocked ? 1 : 0;
});

// ── Import Modal ─────────────────────────────────────────────────────────────

(function setupImportModal() {
  const overlay    = document.getElementById('import-modal-overlay');
  const fileInput  = document.getElementById('import-file-input');
  const fileChosen = document.getElementById('import-file-chosen');
  const fileName   = document.getElementById('import-file-name');
  const fileClear  = document.getElementById('import-file-clear');
  const dropzone   = document.getElementById('import-dropzone');
  const btnPreview = document.getElementById('import-btn-preview');
  const btnApply   = document.getElementById('import-btn-apply');
  const btnBack    = document.getElementById('import-btn-back');
  const btnDone    = document.getElementById('import-btn-done');
  const previewSpinner = document.getElementById('import-preview-spinner');
  const applySpinner   = document.getElementById('import-apply-spinner');

  let currentFile = null;
  let currentDiff = null;  // last preview response
  let currentDiffTab = null;

  function getMode() {
    return document.querySelector('input[name="import-mode"]:checked')?.value || 'partial';
  }

  function openModal() {
    overlay.classList.remove('hidden');
    goToStep(1);
  }

  function closeModal() {
    overlay.classList.add('hidden');
    resetStep1();
  }

  function resetStep1() {
    currentFile = null;
    currentDiff = null;
    fileInput.value = '';
    fileChosen.classList.add('hidden');
    fileName.textContent = '';
    btnPreview.disabled = true;
    document.querySelector('input[name="import-mode"][value="partial"]').checked = true;
  }

  function goToStep(n) {
    [1, 2, 3].forEach(i => {
      document.getElementById(`import-step-${i}`).classList.toggle('hidden', i !== n);
      const ind = document.getElementById(`import-step-ind-${i}`);
      ind.classList.remove('active', 'done');
      if (i < n)  ind.classList.add('done');
      if (i === n) ind.classList.add('active');
    });
  }

  function setFile(file) {
    if (!file) return;
    currentFile = file;
    fileName.textContent = file.name;
    fileChosen.classList.remove('hidden');
    btnPreview.disabled = false;
  }

  // Open
  document.getElementById('btn-import').addEventListener('click', openModal);
  document.getElementById('import-modal-close').addEventListener('click', closeModal);
  document.getElementById('import-btn-cancel-1').addEventListener('click', closeModal);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeModal(); });

  // File picker
  fileInput.addEventListener('change', () => setFile(fileInput.files[0]));
  fileClear.addEventListener('click', () => {
    currentFile = null;
    fileInput.value = '';
    fileChosen.classList.add('hidden');
    btnPreview.disabled = true;
  });

  // Drag & drop
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  });

  // ── Step 2 helpers ──

  const CHIP_CFG = [
    { key: 'updated',   label: '✏ Updated',   cls: 'import-chip-updated'  },
    { key: 'inserted',  label: '+ Inserted',  cls: 'import-chip-inserted' },
    { key: 'removed',   label: '✕ Removed',   cls: 'import-chip-removed'  },
    { key: 'unchanged', label: '— Unchanged', cls: 'import-chip-unchanged'},
    { key: 'not_found', label: '⚠ Not Found', cls: 'import-chip-warn'     },
  ];

  function renderChips(summary) {
    const container = document.getElementById('import-summary-chips');
    container.innerHTML = '';
    CHIP_CFG.forEach(({ key, label, cls }) => {
      const count = summary[key] ?? 0;
      const chip = document.createElement('span');
      chip.className = `import-chip ${cls}`;
      chip.textContent = `${label}: ${count}`;
      container.appendChild(chip);
    });
  }

  const TAB_CFG = [
    { key: 'updated',   label: 'Updated'   },
    { key: 'inserted',  label: 'Inserted'  },
    { key: 'removed',   label: 'Removed'   },
    { key: 'not_found', label: '⚠ Not Found'},
  ];

  function renderDiffTabs(diff) {
    const tabBar  = document.getElementById('import-diff-tabs');
    tabBar.innerHTML = '';
    let firstTab = null;

    TAB_CFG.forEach(({ key, label }) => {
      const rows = diff.rows[key] || [];
      if (rows.length === 0) return;
      const btn = document.createElement('button');
      btn.className = 'import-diff-tab';
      btn.textContent = `${label} (${rows.length})`;
      btn.dataset.tab = key;
      btn.addEventListener('click', () => activateDiffTab(key, diff));
      tabBar.appendChild(btn);
      if (!firstTab) firstTab = key;
    });

    if (firstTab) activateDiffTab(firstTab, diff);
    else {
      document.getElementById('import-diff-table').innerHTML =
        `<tr><td style="color:var(--text-muted); padding:16px;">No changes — everything is already in sync.</td></tr>`;
    }
  }

  function activateDiffTab(key, diff) {
    currentDiffTab = key;
    document.querySelectorAll('.import-diff-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === key);
    });
    renderDiffTable(key, diff.rows[key] || []);
  }

  function renderDiffTable(key, rows) {
    const table = document.getElementById('import-diff-table');
    table.innerHTML = '';

    if (rows.length === 0) {
      table.innerHTML = `<tr><td style="color:var(--text-muted); padding:16px;">No entries in this category.</td></tr>`;
      return;
    }

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    if (key === 'updated') {
      thead.innerHTML = `<tr><th>#</th><th>Title</th><th>Changes</th></tr>`;
      rows.forEach(r => {
        const changes = Object.entries(r.field_changes || {}).map(([f, [oldV, newV]]) =>
          `<div><span style="color:var(--text-muted);font-weight:600;">${escapeHtml(f)}:</span> ` +
          `<span class="import-diff-change-old">${escapeHtml(oldV)}</span> ` +
          `<span style="color:var(--text-muted); margin:0 4px;">→</span> ` +
          `<span class="import-diff-change-new">${escapeHtml(newV)}</span></div>`
        ).join('');
        const tr = document.createElement('tr');
        tr.innerHTML = `<td style="color:var(--text-muted);">#${r.record_id}</td><td>${escapeHtml(r.title || '—')}</td><td>${changes || '—'}</td>`;
        tbody.appendChild(tr);
      });
    } else if (key === 'inserted') {
      const fields = ['title', 'city', 'date_start', 'organizer_name'];
      thead.innerHTML = `<tr><th>Title</th><th>City</th><th>Date Start</th><th>Organizer</th></tr>`;
      rows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = fields.map(f => `<td>${escapeHtml(r[f] || '—')}</td>`).join('');
        tbody.appendChild(tr);
      });
    } else if (key === 'removed' || key === 'hidden') {
      thead.innerHTML = `<tr><th>#</th><th>Title</th></tr>`;
      rows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td style="color:var(--text-muted);">#${r.record_id}</td><td>${escapeHtml(r.title || '—')}</td>`;
        tbody.appendChild(tr);
      });
    } else if (key === 'not_found') {
      thead.innerHTML = `<tr><th>record_id in file</th><th>Row #</th></tr>`;
      rows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td style="color:var(--error);">${escapeHtml(String(r.record_id))}</td><td>${r.row_number ?? '—'}</td>`;
        tbody.appendChild(tr);
      });
    }

    table.appendChild(thead);
    table.appendChild(tbody);
  }

  // ── Preview ──
  btnPreview.addEventListener('click', async () => {
    if (!currentFile) return;
    btnPreview.disabled = true;
    previewSpinner.classList.remove('hidden');
    const fd = new FormData();
    fd.append('file', currentFile);
    fd.append('mode', getMode());
    try {
      const res = await fetch(`${API}/api/events/import/preview`, { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        showToast(err.detail || 'Preview failed', 'error');
        return;
      }
      currentDiff = await res.json();
      renderChips(currentDiff.summary);
      renderDiffTabs(currentDiff);
      goToStep(2);
    } catch (e) {
      showToast('Preview failed: ' + e.message, 'error');
    } finally {
      btnPreview.disabled = false;
      previewSpinner.classList.add('hidden');
    }
  });

  // ── Back ──
  btnBack.addEventListener('click', () => goToStep(1));

  // ── Apply ──
  btnApply.addEventListener('click', async () => {
    if (!currentFile) return;
    btnApply.disabled = true;
    applySpinner.classList.remove('hidden');
    const fd = new FormData();
    fd.append('file', currentFile);
    fd.append('mode', getMode());
    try {
      const res = await fetch(`${API}/api/events/import/apply`, { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        showToast(err.detail || 'Import failed', 'error');
        return;
      }
      const data = await res.json();
      // Step 3 — Done
      const counts = data.applied || {};
      const lines = [
        counts.updated  ? `✏ <strong>${counts.updated}</strong> records updated`  : null,
        counts.inserted ? `+ <strong>${counts.inserted}</strong> records inserted` : null,
        counts.removed  ? `✕ <strong>${counts.removed}</strong> records hidden`   : null,
      ].filter(Boolean);
      document.getElementById('import-done-counts').innerHTML = lines.length ? lines.join('<br>') : 'No changes were applied.';
      document.getElementById('import-done-backup').innerHTML =
        `🛡 Safety backup saved to:<br><code>${escapeHtml(data.backup_path || '')}</code>`;
      goToStep(3);
    } catch (e) {
      showToast('Import failed: ' + e.message, 'error');
    } finally {
      btnApply.disabled = false;
      applySpinner.classList.add('hidden');
    }
  });

  // ── Done ──
  btnDone.addEventListener('click', () => {
    closeModal();
    loadResults();
  });
})();

// ── Job History ──────────────────────────────────────────────────────────────

let allJobHistory = [];
let selectedJobIds = new Set();

function updateJobMultiselectLabel() {
  const labelEl = document.getElementById('job-multiselect-label');
  if (!labelEl) return;
  
  if (view_updated_for_job) {
    const job = allJobHistory.find(j => j.id === view_updated_for_job);
    if (job) {
      const name = job.nickname ? job.nickname : `${formatDate(job.created_at)} - ${truncate(job.url, 22)}`;
      labelEl.innerHTML = `<span style="color:var(--accent)">Updates by: ${name}</span>`;
    } else {
      labelEl.innerHTML = `<span style="color:var(--accent)">Updates by Job</span>`;
    }
    return;
  }

  if (selectedJobIds.size === 0) {
    labelEl.textContent = 'All Jobs';
  } else if (selectedJobIds.size === 1) {
    const singleId = Array.from(selectedJobIds)[0];
    const job = allJobHistory.find(j => j.id === singleId);
    if (job) {
      const name = job.nickname ? job.nickname : `${formatDate(job.created_at)} - ${truncate(job.url, 22)}`;
      labelEl.textContent = `Job: ${name}`;
    } else {
      labelEl.textContent = '1 Job selected';
    }
  } else {
    labelEl.textContent = `${selectedJobIds.size} Jobs selected`;
  }
}

function renderJobMultiselectList() {
  const listEl = document.getElementById('job-ms-list');
  const countEl = document.getElementById('job-ms-count');
  if (!listEl) return;

  const q = (document.getElementById('job-ms-search')?.value || '').toLowerCase().trim();
  listEl.innerHTML = '';

  let visibleCount = 0;
  allJobHistory.forEach(job => {
    const nickname = (job.nickname || '').trim();
    const f = typeof job.filters === 'string' ? JSON.parse(job.filters || '{}') : (job.filters || {});
    const dateStr = formatDate(job.created_at);
    const searchTarget = `${nickname} ${job.id} ${job.url} ${job.platform || ''} ${job.dance_style || ''} ${f.city || ''} ${f.keyword || ''} ${dateStr}`.toLowerCase();

    if (q && !searchTarget.includes(q)) {
      return;
    }
    visibleCount++;

    let primaryName = nickname;
    if (!primaryName) {
      if (job.dance_style && f.city) {
        primaryName = `${job.dance_style} in ${f.city}`;
      } else if (job.dance_style) {
        primaryName = `${job.dance_style}`;
      } else if (f.city) {
        primaryName = `${job.platform || 'Go&Dance'} ${f.city}`;
      } else {
        primaryName = `${job.platform || 'Go&Dance'}`;
      }
    }

    const isChecked = selectedJobIds.has(job.id);
    const item = document.createElement('label');
    item.className = 'multiselect-item';
    item.style.cssText = 'display: flex !important; flex-direction: row !important; align-items: center !important; gap: 8px !important; padding: 4px 8px !important; border-radius: 4px; cursor: pointer; white-space: nowrap !important; width: max-content !important; min-width: 100% !important; box-sizing: border-box !important; font-size: 0.72rem !important; font-weight: 300 !important; line-height: 1.3 !important; user-select: none;';
    
    item.innerHTML = `
      <input type="checkbox" value="${job.id}" ${isChecked ? 'checked' : ''} class="job-ms-checkbox" style="margin: 0 !important; cursor: pointer; flex-shrink: 0 !important; width: 13px !important; height: 13px !important; display: inline-block !important;">
      <div class="multiselect-item-content" style="display: inline-flex !important; flex-direction: row !important; align-items: center !important; gap: 6px !important; white-space: nowrap !important; flex-shrink: 0 !important;">
        <span class="multiselect-item-name" style="font-weight: 500 !important; color: #38bdf8 !important; font-size: 0.74rem !important; flex-shrink: 0 !important;">${escapeHtml(primaryName)}</span>
        <span class="multiselect-item-sep" style="color: #475569 !important; font-size: 0.65rem !important; flex-shrink: 0 !important;">·</span>
        <span class="multiselect-item-date" style="font-size: 0.68rem !important; color: #94a3b8 !important; font-weight: 300 !important; flex-shrink: 0 !important;">${dateStr}</span>
        ${job.dance_style && !primaryName.includes(job.dance_style) ? `<span class="multiselect-item-tag" style="font-size: 0.65rem !important; color: #cbd5e1 !important; background: rgba(255,255,255,0.06) !important; border: 1px solid var(--border); border-radius: 3px; padding: 1px 4px !important; flex-shrink: 0 !important;">${escapeHtml(job.dance_style)}</span><span class="multiselect-item-sep" style="color: #475569 !important; font-size: 0.65rem !important; flex-shrink: 0 !important;">·</span>` : '<span class="multiselect-item-sep" style="color: #475569 !important; font-size: 0.65rem !important; flex-shrink: 0 !important;">·</span>'}
        <span class="multiselect-item-url" style="font-family: \'JetBrains Mono\', monospace !important; font-size: 0.68rem !important; color: #64748b !important; font-weight: 300 !important; flex-shrink: 0 !important;" title="${escapeHtml(job.url)}">${escapeHtml(job.url)}</span>
      </div>
    `;
    listEl.appendChild(item);
  });

  if (countEl) {
    countEl.textContent = `Displaying ${visibleCount}`;
  }

  if (visibleCount === 0) {
    listEl.innerHTML = '<div style="font-size:0.8rem; color:var(--text-muted); padding:12px; text-align:center;">No matching jobs</div>';
  }
}

function setupJobMultiselectEvents() {
  const triggerBtn = document.getElementById('job-multiselect-btn');
  const dropdown = document.getElementById('job-multiselect-dropdown');
  const searchInput = document.getElementById('job-ms-search');
  const selectAllBtn = document.getElementById('job-ms-select-all');
  const clearBtn = document.getElementById('job-ms-clear');
  const okBtn = document.getElementById('job-ms-btn-ok');
  const cancelBtn = document.getElementById('job-ms-btn-cancel');

  if (triggerBtn && dropdown) {
    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = dropdown.classList.contains('hidden');
      document.querySelectorAll('.custom-multiselect-dropdown, #column-visibility-panel').forEach(p => {
        if (p !== dropdown) p.classList.add('hidden');
      });
      if (isHidden) {
        dropdown.classList.remove('hidden');
        renderJobMultiselectList();
        if (searchInput) {
          searchInput.value = '';
          searchInput.focus();
        }
      } else {
        dropdown.classList.add('hidden');
      }
    });

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('click', () => {
      dropdown.classList.add('hidden');
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderJobMultiselectList();
    });
  }

  if (selectAllBtn) {
    selectAllBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('#job-ms-list .job-ms-checkbox').forEach(cb => {
        cb.checked = true;
      });
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('#job-ms-list .job-ms-checkbox').forEach(cb => {
        cb.checked = false;
      });
    });
  }

  if (okBtn) {
    okBtn.addEventListener('click', () => {
      selectedJobIds.clear();
      document.querySelectorAll('#job-ms-list .job-ms-checkbox:checked').forEach(cb => {
        selectedJobIds.add(cb.value);
      });
      if (dropdown) dropdown.classList.add('hidden');
      updateJobMultiselectLabel();
      currentPage = 1;
      loadResults();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      if (dropdown) dropdown.classList.add('hidden');
      renderJobMultiselectList();
    });
  }
}

async function loadJobHistory(selectedJobId) {
  try {
    const res = await api('/api/jobs?per_page=1000');
    const jobs = Array.isArray(res) ? res : (res.jobs || []);
    allJobHistory = jobs;
    
    if (selectedJobId !== undefined) {
      if (selectedJobId) {
        selectedJobIds = new Set([selectedJobId]);
      } else {
        selectedJobIds.clear();
      }
    }
    
    updateJobMultiselectLabel();
    renderJobMultiselectList();
    renderJobHistory();
  } catch(e) {
    console.error('Failed to load job history', e);
  }
}

function renderJobHistory() {
  const container = document.getElementById('job-history-list');
  if (!container) return;
  container.innerHTML = '';

  // Get filter values
  const qSearch = (document.getElementById('jh-filter-search')?.value || '').toLowerCase();
  const qDateFrom = document.getElementById('jh-filter-date-from')?.value || '';
  const qDateTo = document.getElementById('jh-filter-date-to')?.value || '';
  const qStatus = document.getElementById('jh-filter-status')?.value || '';
  const qSource = document.getElementById('jh-filter-source')?.value || '';
  const qPlatform = (document.getElementById('jh-filter-platform')?.value || '').toLowerCase();
  const qStyle = (document.getElementById('jh-filter-style')?.value || '').toLowerCase();

  const filteredJobs = allJobHistory.filter(job => {
    // Search includes nickname, id, url, schedule label, platform, style, city, keyword
    if (qSearch) {
      const f = typeof job.filters === 'string' ? JSON.parse(job.filters || '{}') : (job.filters || {});
      const searchStr = `${job.nickname || ''} ${job.id} ${job.url} ${job.schedule_label || ''} ${job.platform || ''} ${job.dance_style || ''} ${f.city || ''} ${f.keyword || ''}`.toLowerCase();
      if (!searchStr.includes(qSearch)) return false;
    }
    // Status
    if (qStatus && job.status !== qStatus) return false;
    // Source
    if (qSource === 'scheduled' && !job.schedule_id) return false;
    if (qSource === 'manual' && job.schedule_id) return false;
    // Platform
    if (qPlatform && !(job.platform || '').toLowerCase().includes(qPlatform)) return false;
    // Style
    if (qStyle && !(job.dance_style || '').toLowerCase().includes(qStyle)) return false;
    // Date
    if (qDateFrom || qDateTo) {
      const jobDate = new Date(job.created_at);
      jobDate.setHours(0, 0, 0, 0);
      if (qDateFrom) {
        const fromDate = new Date(qDateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (jobDate < fromDate) return false;
      }
      if (qDateTo) {
        const toDate = new Date(qDateTo);
        toDate.setHours(0, 0, 0, 0);
        if (jobDate > toDate) return false;
      }
    }
    return true;
  });

  const countEl = document.getElementById('jh-results-count');
  if (countEl) {
    if (allJobHistory.length === 0) {
      countEl.textContent = '0 jobs';
    } else if (filteredJobs.length === allJobHistory.length) {
      countEl.textContent = `${filteredJobs.length} jobs`;
    } else {
      countEl.textContent = `${filteredJobs.length} of ${allJobHistory.length} jobs`;
    }
  }

  if(filteredJobs.length === 0) {
    container.innerHTML = `<div class="empty-state" style="grid-column: span 2">
      <div class="empty-state-icon">${ICONS.clock}</div><p>No job history matches your filters</p></div>`;
    return;
  }

  let isRunning = false;
  filteredJobs.forEach(job => {
    if(job.status === 'running' || job.status === 'pending') isRunning = true;

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
      const startDate = parseUtcDate(job.started_at);
      const endDate = job.finished_at ? parseUtcDate(job.finished_at) : new Date();
      if (startDate && endDate) {
        const diffSecs = Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / 1000));
        if (diffSecs < 60) {
          durationStr = `${diffSecs}s`;
        } else {
          const m = Math.floor(diffSecs / 60);
          const s = diffSecs % 60;
          durationStr = `${m}m ${s}s`;
        }
      }
    }

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
        <div>
          ${job.nickname ? `<div style="font-weight:500; font-size:0.875rem; color:#38bdf8; margin-bottom:2px;">${escapeHtml(job.nickname)}</div>` : ''}
          <div style="font-size:0.75rem; color:var(--text-muted);">
            <span>${formatDate(job.created_at)}</span>
          </div>
        </div>
        <span class="badge badge-${job.status}">${job.status}</span>
      </div>

      <div class="jh-url-box">
        <a href="${job.url}" target="_blank" title="${job.url}">
          ${job.url}
        </a>
        <div class="jh-url-actions">
          <button class="icon-btn" onclick="copyJobUrl('${escapeJs(job.url)}')" title="Copy Full Target URL" style="padding:3px; color:var(--text-secondary);">
            ${ICONS.copy}
          </button>
          <a href="${job.url}" target="_blank" class="icon-btn" title="Open Target URL in new tab" style="padding:3px; color:var(--text-secondary); text-decoration:none;">
            ${ICONS.external}
          </a>
        </div>
      </div>

      ${filterHtml}
      <div class="jh-stats" style="display:flex; align-items:center; gap:14px; font-size:0.8rem; color:var(--text-secondary); margin-bottom:14px;">
        <div>Events found: <strong style="color:var(--text-primary)">${job.events_found || 0}</strong></div>
        <div class="jh-stats-sep" style="color:var(--border); font-size:0.7rem;">•</div>
        <div>New: <strong style="color:var(--success)">${job.events_new || 0}</strong></div>
        <div class="jh-stats-sep" style="color:var(--border); font-size:0.7rem;">•</div>
        <div>Updated: ${job.events_updated > 0 ? `<a href="#" onclick="viewJobUpdates('${job.id}'); return false;" style="color:var(--accent); font-weight:bold; text-decoration:none;" title="View updated events for this job">${job.events_updated}</a>` : `<strong style="color:var(--accent)">0</strong>`}</div>
        <div class="jh-stats-sep" style="color:var(--border); font-size:0.7rem;">•</div>
        <div>Duration: <strong style="color:var(--text-primary)">${durationStr}</strong></div>
      </div>
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:nowrap;">
        <button class="btn btn-secondary btn-sm" style="white-space:nowrap;" onclick="viewJobResults('${job.id}')">${ICONS.chart} <span class="jh-btn-label">View Results</span></button>
        ${job.status === 'running' || job.status === 'pending'
          ? `<button class="btn btn-danger btn-sm" style="white-space:nowrap; background-color: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #ef4444;" onclick="cancelJobHistory('${job.id}')">${ICONS.pause} <span class="jh-btn-label">Stop</span></button>`
          : `<button class="btn btn-primary btn-sm" style="white-space:nowrap;" onclick="rerunJob('${job.id}')">${ICONS.repeat} <span class="jh-btn-label">Rerun</span></button>`
        }
        <button class="btn btn-danger btn-sm" style="white-space:nowrap;" onclick="deleteJob('${job.id}')">${ICONS.trash} <span class="jh-btn-label">Delete</span></button>
        <button class="btn btn-secondary btn-sm" style="white-space:nowrap; margin-left:auto;" onclick="viewJobLogs('${job.id}')">${ICONS.terminal} <span class="jh-btn-label">Logs</span></button>
      </div>
    `;
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Event listeners for Job History Filters
  document.getElementById('jh-btn-apply')?.addEventListener('click', () => {
    renderJobHistory();
  });

  document.getElementById('jh-btn-clear')?.addEventListener('click', () => {
    document.querySelectorAll('#job-history-filters input, #job-history-filters select').forEach(el => el.value = '');
    renderJobHistory();
  });

  // Also filter on change / enter key
  document.querySelectorAll('#job-history-filters input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') renderJobHistory();
    });
  });

  document.querySelectorAll('#job-history-filters select, #job-history-filters input[type="date"]').forEach(el => {
    el.addEventListener('change', () => {
      renderJobHistory();
    });
  });
});

window.viewJobResults = async (jobId) => {
  view_updated_for_job = null;
  // Navigate to Results section
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(n => n.classList.remove('active'));
  const resultsNav = document.querySelector('.nav-item[data-target="section-results"]');
  if (resultsNav) resultsNav.classList.add('active');

  const sections = document.querySelectorAll('.section');
  sections.forEach(s => s.classList.remove('active'));
  const resultsSection = document.getElementById('section-results');
  if (resultsSection) resultsSection.classList.add('active');
  activeSectionId = 'section-results';

  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('open');

  resetTabScroll();

  // Clear all other filter inputs so we only filter by this job
  document.querySelectorAll('.filter-bar input, .filter-bar select').forEach(el => {
    el.value = '';
  });

  // Select this jobId in multiselect
  selectedJobIds = new Set([jobId]);
  updateJobMultiselectLabel();
  renderJobMultiselectList();

  currentPage = 1;
  await loadResults();
};

window.viewJobUpdates = async (jobId) => {
  view_updated_for_job = jobId;
  
  // Navigate to Results section
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(n => n.classList.remove('active'));
  const resultsNav = document.querySelector('.nav-item[data-target="section-results"]');
  if (resultsNav) resultsNav.classList.add('active');

  const sections = document.querySelectorAll('.section');
  sections.forEach(s => s.classList.remove('active'));
  const resultsSection = document.getElementById('section-results');
  if (resultsSection) resultsSection.classList.add('active');
  activeSectionId = 'section-results';

  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 768 && sidebar) sidebar.classList.remove('open');

  resetTabScroll();

  // Clear all other filter inputs so we only filter by this job
  document.querySelectorAll('.filter-bar input, .filter-bar select').forEach(el => {
    el.value = '';
  });

  // Clear standard job selection since we are using view_updated_for_job
  selectedJobIds.clear();
  updateJobMultiselectLabel();
  renderJobMultiselectList();

  currentPage = 1;
  await loadResults();
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

    // Populate Nickname
    const nicknameInput = document.getElementById('job-nickname');
    if (nicknameInput) nicknameInput.value = job.nickname || '';

    // Populate URL
    const urlInput = document.getElementById('job-url');
    if (urlInput) {
      urlInput.value = job.url || GAD_BASE_EN;
      syncUrlToGadLanguage(job.url || GAD_BASE_EN, 'job_gad_lang');
    }

    // Populate Platform radio
    const p = job.platform || 'goandance';
    const platformLabel = p === 'goandance' ? 'Go&Dance' : p.charAt(0).toUpperCase() + p.slice(1);
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
  
  const defaultLang = document.querySelector('input[name="sched_gad_lang"][value="en"]');
  if (defaultLang) defaultLang.checked = true;

  const schedUrl = document.getElementById('sched-url');
  if (schedUrl) {
    schedUrl.value = GAD_BASE_EN;
    schedUrl.placeholder = GAD_BASE_EN;
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
    
    const p = sched.platform || 'goandance';
    const platformLabel = p === 'goandance' ? 'Go&Dance' : p.charAt(0).toUpperCase() + p.slice(1);
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
    const checkedIds = Array.from(document.querySelectorAll('.sched-row-checkbox:checked')).map(cb => cb.dataset.id);
    const selectAllChecked = document.getElementById('sched-select-all')?.checked || false;

    const res = await api('/api/schedule');
    const schedules = Array.isArray(res) ? res : (res.schedules || []);
    const tbody = document.getElementById('schedules-tbody');
    tbody.innerHTML = '';
    
    if(schedules.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state"><div class="empty-state-icon">${ICONS.calendar}</div><p>No schedules found</p></td></tr>`;
      return;
    }
    
    schedules.forEach(item => {
      const tr = document.createElement('tr');
      tr.dataset.schedId = item.id;
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
      const toggleStyle = isActive ? 'color: var(--warning);' : 'color: var(--success);';

      const groupBadge = (item.group_ids && item.group_ids.length > 0)
        ? `<span class="badge badge-active" style="font-size:0.72rem;" title="Assigned to ${item.group_ids.length} group(s)">${ICONS.layers} ${item.group_ids.length} Group${item.group_ids.length > 1 ? 's' : ''}</span>`
        : `<span style="color:var(--text-muted); font-size:0.8rem;">—</span>`;

      tr.innerHTML = `
        <td><input type="checkbox" class="sched-row-checkbox" data-id="${item.id}" title="Select"></td>
        <td><strong>${item.label || '—'}</strong></td>
        <td><a href="${item.url}" target="_blank" style="color:inherit">${truncate(item.url, 30)}</a></td>
        <td><code style="background:var(--surface-elevated); padding:2px 6px; border-radius:4px" title="${humanizeCron(item.cron_expression)}">${item.cron_expression}</code></td>
        <td>${formatDate(item.next_run_at || item.next_run)}</td>
        <td>${formatDate(item.last_run_at || item.last_run)}</td>
        <td>${groupBadge}</td>
        <td><span class="badge ${badgeClass}">${statusText}</span></td>
        <td>
          <div style="display:inline-flex; gap:6px; align-items:center;">
            <button class="btn btn-secondary btn-sm" onclick="toggleSchedule('${item.id}', ${item.active})" title="${toggleTitle}" style="${toggleStyle}">${toggleIcon}</button>
            <button class="btn btn-secondary btn-sm" onclick="editSchedule('${item.id}')" title="Edit Schedule">${ICONS.edit}</button>
            <button class="btn btn-danger btn-sm" onclick="deleteSchedule('${item.id}')" title="Delete">${ICONS.trash}</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Restore checked state
    checkedIds.forEach(id => {
      const cb = document.querySelector(`.sched-row-checkbox[data-id="${id}"]`);
      if (cb) cb.checked = true;
    });
    const selectAll = document.getElementById('sched-select-all');
    if (selectAll) selectAll.checked = selectAllChecked;

    // Update bulk-assign group dropdown
    _updateBulkAssignDropdown();
    // Hook checkboxes
    _hookScheduleCheckboxes();
  } catch(e) {
    console.error('Failed to load schedules', e);
  }
}

function _updateBulkAssignDropdown() {
  const sel = document.getElementById('bulk-assign-group-select');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">Assign selected to group…</option>';
  (_groupsCache || []).forEach(g => {
    const opt = document.createElement('option');
    opt.value = g.id;
    opt.textContent = g.name;
    sel.appendChild(opt);
  });
  sel.value = current;
}

function _hookScheduleCheckboxes() {
  const allChk = document.getElementById('sched-select-all');
  const rowChks = document.querySelectorAll('.sched-row-checkbox');

  rowChks.forEach(chk => {
    chk.addEventListener('change', _updateBulkUi);
  });

  if (allChk) {
    allChk.onclick = () => {
      const liveRowChks = document.querySelectorAll('.sched-row-checkbox');
      liveRowChks.forEach(c => c.checked = allChk.checked);
      _updateBulkUi();
    };
  }
  _updateBulkUi();
}

function _updateBulkUi() {
  const allChk = document.getElementById('sched-select-all');
  const rowChks = document.querySelectorAll('.sched-row-checkbox');
  const countEl = document.getElementById('sched-selected-count');
  const bulkSel = document.getElementById('bulk-assign-group-select');
  const bulkBtn = document.getElementById('btn-bulk-assign-confirm');

  const checked = document.querySelectorAll('.sched-row-checkbox:checked');
  const n = checked.length;
  if (countEl) countEl.textContent = n > 0 ? `${n} selected` : '';
  if (bulkSel) bulkSel.style.display = n > 0 ? '' : 'none';
  if (bulkBtn) bulkBtn.classList.toggle('hidden', n === 0);
  if (allChk) {
    allChk.indeterminate = n > 0 && n < rowChks.length;
    if (n === rowChks.length && rowChks.length > 0) {
      allChk.checked = true;
    } else if (n === 0) {
      allChk.checked = false;
    }
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

// ── Schedule Groups ───────────────────────────────────────────────────────────

let _groupsCache = [];
let _editingGroupId = null;

async function loadGroups() {
  try {
    const res = await api('/api/schedule-groups');
    _groupsCache = res.groups || [];
    renderGroups(_groupsCache);
    _updateBulkAssignDropdown();
  } catch(e) {
    console.error('Failed to load groups', e);
  }
}

function _groupIntervalLabel(g) {
  const mins = g.interval_minutes != null ? g.interval_minutes : 5;
  if (mins === 0) return `Sequential`;
  if (mins >= 60 && mins % 60 === 0) return `every ${mins / 60}h`;
  return `every ${mins}m`;
}

function renderGroups(groups) {
  const container = document.getElementById('groups-list');
  if (!container) return;
  if (!groups || groups.length === 0) {
    container.innerHTML = `<div class="empty-state" style="padding:24px 0; font-size:0.875rem; color:var(--text-muted);"><div class="empty-state-icon"><i data-lucide="layers" style="width:32px;height:32px;"></i></div><p>No schedule groups yet. Click "New Group" to create one.</p></div>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = '';
  groups.forEach(g => {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.dataset.status = g.status || 'paused';

    const total = g.total_schedules || 0;
    const idx = g.current_index || 0;
    const displayIdx = total > 0 ? (idx % total) + 1 : 0;
    const loopLabel = g.loop_mode === 'once' ? 'One-time' : 'Loop';
    const intervalLabel = _groupIntervalLabel(g);

    let statusClass = 'badge-disabled';
    let statusText = g.status?.toUpperCase() || 'PAUSED';
    if (g.status === 'active') statusClass = 'badge-running';
    else if (g.status === 'completed') statusClass = 'badge-done';

    const playPauseBtn = g.status === 'active'
      ? `<button class="btn btn-secondary btn-sm" onclick="pauseGroup('${g.id}')" title="Pause group" style="color:var(--warning); gap:5px;">${ICONS.pause} Pause</button>`
      : `<button class="btn btn-secondary btn-sm" onclick="resumeGroup('${g.id}')" title="Start / Resume group" style="color:var(--success); gap:5px;">${ICONS.play} Start</button>`;

    card.innerHTML = `
      <div class="group-card-header">
        <span class="group-card-name" title="${escapeHtml(g.name)}">${escapeHtml(g.name)}</span>
        <span class="badge ${statusClass}">${statusText}</span>
      </div>
      <div class="group-card-meta">
        <span class="group-card-meta-pill">${total} schedule${total !== 1 ? 's' : ''}</span>
        ${total > 0 ? `<span class="group-card-meta-pill accent">Step ${displayIdx}/${total}</span>` : ''}
        <span class="group-card-meta-pill">${loopLabel}</span>
        <span class="group-card-meta-pill">${intervalLabel}</span>
        ${g.current_schedule_label ? `<span class="group-card-next">&#9654; ${escapeHtml(g.current_schedule_label)}</span>` : ''}
      </div>
      ${(g.last_triggered_at || g.start_time) ? `<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:0.75rem;color:var(--text-muted);margin-bottom:10px;">
        ${g.last_triggered_at ? `<span>Last fired: <strong style="color:var(--text-secondary);">${formatDate(g.last_triggered_at)}</strong></span>` : ''}
        ${g.start_time ? `<span>Starts: <strong style="color:var(--text-secondary);">${formatLocalDate(g.start_time)}</strong></span>` : ''}
      </div>` : ''}
      <div class="group-card-actions">
        ${playPauseBtn}
        <button class="btn btn-secondary btn-sm" onclick="openGroupMembersModal('${g.id}')" title="View &amp; Reorder members" style="gap:5px;">${ICONS.list} Members</button>
        <button class="btn btn-secondary btn-sm" onclick="openAssignModal('${g.id}', '${g.name.replace(/'/g, "\'")}')" title="Assign schedules" style="gap:5px;">${ICONS.plus} Assign</button>
        <div style="margin-left:auto;display:flex;gap:6px;">
          <button class="icon-btn" onclick="resetGroup('${g.id}')" title="Reset progress to step 1">${ICONS.refreshCw}</button>
          <button class="icon-btn" onclick="editGroup('${g.id}')" title="Edit group">${ICONS.edit}</button>
          <button class="icon-btn" style="color:var(--error);" onclick="deleteGroup('${g.id}')" title="Delete group">${ICONS.trash}</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  if (window.lucide) lucide.createIcons();
}

// Group create / edit form
document.getElementById('btn-open-create-group')?.addEventListener('click', () => {
  _editingGroupId = null;
  resetGroupForm();
  document.getElementById('group-form-wrapper')?.classList.remove('hidden');
  document.getElementById('group-name')?.focus();
});

document.getElementById('btn-cancel-group')?.addEventListener('click', () => {
  document.getElementById('group-form-wrapper')?.classList.add('hidden');
  resetGroupForm();
});

function resetGroupForm() {
  _editingGroupId = null;
  const nameEl = document.getElementById('group-name');
  if (nameEl) nameEl.value = '';
  const valEl = document.getElementById('group-interval-value');
  if (valEl) valEl.value = 5;
  const unitEl = document.getElementById('group-interval-unit');
  if (unitEl) unitEl.value = 'mins';
  const modeEl = document.getElementById('group-loop-mode');
  if (modeEl) modeEl.value = 'once';
  const startEl = document.getElementById('group-start-time');
  if (startEl) startEl.value = '';
  const saveBtn = document.getElementById('btn-save-group');
  if (saveBtn) saveBtn.textContent = 'Create Group';
  const badge = document.getElementById('group-edit-badge');
  if (badge) badge.classList.add('hidden');
}

window.editGroup = async (groupId) => {
  const g = _groupsCache.find(x => x.id === groupId);
  if (!g) return;
  _editingGroupId = groupId;
  const nameEl = document.getElementById('group-name');
  if (nameEl) nameEl.value = g.name;
  const mins = g.interval_minutes != null ? g.interval_minutes : 5;
  const valEl = document.getElementById('group-interval-value');
  const unitEl = document.getElementById('group-interval-unit');
  if (mins >= 60 && mins % 60 === 0) {
    if (valEl) valEl.value = mins / 60;
    if (unitEl) unitEl.value = 'hours';
  } else {
    if (valEl) valEl.value = mins;
    if (unitEl) unitEl.value = 'mins';
  }
  const modeEl = document.getElementById('group-loop-mode');
  if (modeEl) modeEl.value = g.loop_mode || 'once';
  const startEl = document.getElementById('group-start-time');
  if (startEl) startEl.value = g.start_time ? g.start_time.slice(0, 16) : '';
  const saveBtn = document.getElementById('btn-save-group');
  if (saveBtn) saveBtn.textContent = 'Update Group';
  const badge = document.getElementById('group-edit-badge');
  if (badge) { badge.textContent = `Editing: ${g.name}`; badge.classList.remove('hidden'); }
  document.getElementById('group-form-wrapper')?.classList.remove('hidden');
  document.getElementById('group-name')?.focus();
};

document.getElementById('btn-save-group')?.addEventListener('click', async () => {
  const name = document.getElementById('group-name')?.value?.trim();
  if (!name) return showToast('Group name is required', 'error');
  const val = parseInt(document.getElementById('group-interval-value')?.value || '5', 10);
  const unit = document.getElementById('group-interval-unit')?.value || 'mins';
  const intervalMins = unit === 'hours' ? val * 60 : val;
  if (isNaN(intervalMins) || intervalMins < 0) return showToast('Interval must be at least 0 minutes', 'error');
  const loopMode = document.getElementById('group-loop-mode')?.value || 'once';
  const startTime = document.getElementById('group-start-time')?.value || null;
  const payload = { name, interval_minutes: intervalMins, loop_mode: loopMode, start_time: startTime };

  try {
    if (_editingGroupId) {
      await api(`/api/schedule-groups/${_editingGroupId}`, { method: 'PUT', body: JSON.stringify(payload) });
      showToast('Group updated', 'success');
    } else {
      await api('/api/schedule-groups', { method: 'POST', body: JSON.stringify(payload) });
      showToast('Group created', 'success');
    }
    document.getElementById('group-form-wrapper')?.classList.add('hidden');
    resetGroupForm();
    loadGroups();
  } catch(e) {
    showToast('Failed to save group: ' + e.message, 'error');
  }
});

window.deleteGroup = async (groupId) => {
  if (await confirmAction('Delete this group? Schedules inside will be unlinked (not deleted).')) {
    await api(`/api/schedule-groups/${groupId}`, { method: 'DELETE' });
    showToast('Group deleted', 'success');
    loadGroups();
    loadSchedules();
  }
};

window.pauseGroup = async (groupId) => {
  await api(`/api/schedule-groups/${groupId}/pause`, { method: 'POST' });
  showToast('Group paused', 'success');
  loadGroups();
};

window.resumeGroup = async (groupId) => {
  await api(`/api/schedule-groups/${groupId}/resume`, { method: 'POST' });
  showToast('Group started', 'success');
  loadGroups();
};

window.resetGroup = async (groupId) => {
  if (await confirmAction('Reset this group to step 1?')) {
    await api(`/api/schedule-groups/${groupId}/reset`, { method: 'POST' });
    showToast('Group reset to step 1', 'success');
    loadGroups();
  }
};

// Bulk-assign from individual schedule checkboxes
document.getElementById('btn-bulk-assign-confirm')?.addEventListener('click', async () => {
  const groupId = document.getElementById('bulk-assign-group-select')?.value;
  if (!groupId) return showToast('Please select a group', 'error');
  const checked = Array.from(document.querySelectorAll('.sched-row-checkbox:checked')).map(c => c.dataset.id);
  if (checked.length === 0) return showToast('No schedules selected', 'error');
  try {
    await api(`/api/schedule-groups/${groupId}/bulk-assign`, {
      method: 'POST',
      body: JSON.stringify({ schedule_ids: checked })
    });
    showToast(`${checked.length} schedule${checked.length > 1 ? 's' : ''} assigned to group`, 'success');
    // Deselect all
    document.querySelectorAll('.sched-row-checkbox').forEach(c => c.checked = false);
    const allChk = document.getElementById('sched-select-all');
    if (allChk) allChk.checked = false;
    document.getElementById('sched-selected-count').textContent = '';
    document.getElementById('bulk-assign-group-select').style.display = 'none';
    document.getElementById('btn-bulk-assign-confirm')?.classList.add('hidden');
    loadGroups();
    loadSchedules();
  } catch(e) {
    showToast('Failed to assign: ' + e.message, 'error');
  }
});

// ── Assign-to-group modal ────────────────────────────────────────────────────

let _assignGroupId = null;
let _allSchedulesForAssign = [];

window.openAssignModal = async (groupId, groupName) => {
  _assignGroupId = groupId;
  document.getElementById('assign-group-name-label').textContent = groupName;
  // Fetch fresh schedules
  try {
    const res = await api('/api/schedule');
    _allSchedulesForAssign = (Array.isArray(res) ? res : (res.schedules || [])).filter(s => !(s.group_ids && s.group_ids.includes(_assignGroupId)));
  } catch(e) {
    _allSchedulesForAssign = [];
  }
  _renderAssignList('');
  document.getElementById('assign-search').value = '';
  openModal('modal-assign-group');
};

document.getElementById('assign-search')?.addEventListener('input', (e) => {
  _renderAssignList(e.target.value.toLowerCase());
});

function _renderAssignList(query) {
  const container = document.getElementById('assign-schedule-list');
  if (!container) return;
  const filtered = _allSchedulesForAssign.filter(s => {
    const label = (s.label || s.url || '').toLowerCase();
    return !query || label.includes(query);
  });
  if (filtered.length === 0) {
    container.innerHTML = '<div style="padding:12px; color:var(--text-muted); font-size:0.85rem; text-align:center;">No available schedules found</div>';
    return;
  }
  container.innerHTML = filtered.map(s => `
    <label style="display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:6px; cursor:pointer; transition:background 0.15s;" class="multiselect-option">
      <input type="checkbox" class="assign-sched-chk" value="${s.id}">
      <span style="flex:1; font-size:0.85rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${s.label || s.url}</span>
      ${s.cron_expression ? `<code style="font-size:0.72rem; background:var(--surface); padding:2px 5px; border-radius:4px; flex-shrink:0;">${s.cron_expression}</code>` : ''}
    </label>
  `).join('');
}

document.getElementById('btn-confirm-assign')?.addEventListener('click', async () => {
  const checked = Array.from(document.querySelectorAll('.assign-sched-chk:checked')).map(c => c.value);
  if (checked.length === 0) return showToast('No schedules selected', 'error');
  try {
    await api(`/api/schedule-groups/${_assignGroupId}/bulk-assign`, {
      method: 'POST',
      body: JSON.stringify({ schedule_ids: checked })
    });
    showToast(`${checked.length} schedule${checked.length > 1 ? 's' : ''} assigned`, 'success');
    closeModal('modal-assign-group');
    loadGroups();
    loadSchedules();
  } catch(e) {
    showToast('Failed: ' + e.message, 'error');
  }
});

document.getElementById('btn-close-assign-modal')?.addEventListener('click', () => closeModal('modal-assign-group'));
document.getElementById('btn-cancel-assign-modal')?.addEventListener('click', () => closeModal('modal-assign-group'));

// ── Group Members / Reorder Modal ────────────────────────────────────────────

let _membersGroupId = null;
let _memberDragSrcEl = null;

window.openGroupMembersModal = async (groupId) => {
  _membersGroupId = groupId;
  try {
    const g = await api(`/api/schedule-groups/${groupId}`);
    document.getElementById('group-members-title').textContent = `Members: ${g.name}`;
    _renderMembersList(g.schedules || [], groupId);
    openModal('modal-group-members');
  } catch(e) {
    showToast('Failed to load group members', 'error');
  }
};

function _renderMembersList(schedules, groupId) {
  const container = document.getElementById('group-members-list');
  if (!container) return;
  if (schedules.length === 0) {
    container.innerHTML = '<div style="padding:16px; text-align:center; color:var(--text-muted); font-size:0.85rem;">No schedules in this group yet. Use "Assign Schedules" to add some.</div>';
    return;
  }
  container.innerHTML = '';
  schedules.forEach((s, i) => {
    const row = document.createElement('div');
    row.draggable = true;
    row.dataset.schedId = s.id;
    row.style.cssText = 'display:flex; align-items:center; gap:10px; padding:8px 12px; border-bottom:1px solid var(--border); cursor:grab; background:var(--surface-elevated); transition:background 0.15s; user-select:none;';
    row.innerHTML = `
      <span style="color:var(--text-muted); font-size:0.8rem; cursor:grab;">⠿</span>
      <span style="flex:1; font-size:0.85rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${i + 1}. ${s.label || s.url}</span>
      ${s.cron_expression ? `<code style="font-size:0.72rem; background:var(--surface); padding:2px 5px; border-radius:4px; flex-shrink:0; color:var(--text-muted);">${s.cron_expression}</code>` : ''}
      <button class="icon-btn" onclick="removeFromGroupUI('${groupId}','${s.id}', this)" title="Remove from group" style="color:var(--error);">
        <i data-lucide="x-circle" style="width:14px;height:14px;"></i>
      </button>
    `;

    // HTML5 drag-and-drop
    row.addEventListener('dragstart', (e) => {
      _memberDragSrcEl = row;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', s.id);
      row.style.opacity = '0.4';
    });
    row.addEventListener('dragend', () => {
      row.style.opacity = '';
      container.querySelectorAll('[data-drag-over]').forEach(el => {
        el.removeAttribute('data-drag-over');
        el.style.background = '';
      });
    });
    row.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (row !== _memberDragSrcEl) {
        row.style.background = 'var(--primary-dim, rgba(99,102,241,0.15))';
        row.setAttribute('data-drag-over', '1');
      }
    });
    row.addEventListener('dragleave', () => {
      row.style.background = '';
      row.removeAttribute('data-drag-over');
    });
    row.addEventListener('drop', async (e) => {
      e.preventDefault();
      row.style.background = '';
      row.removeAttribute('data-drag-over');
      if (_memberDragSrcEl && _memberDragSrcEl !== row) {
        // Reorder in DOM
        const parent = container;
        const rows = Array.from(parent.children);
        const srcIdx = rows.indexOf(_memberDragSrcEl);
        const tgtIdx = rows.indexOf(row);
        if (srcIdx < tgtIdx) {
          parent.insertBefore(_memberDragSrcEl, row.nextSibling);
        } else {
          parent.insertBefore(_memberDragSrcEl, row);
        }
        // Renumber labels
        Array.from(parent.children).forEach((r, idx) => {
          const span = r.querySelector('span:nth-child(2)');
          if (span) {
            const text = span.textContent.replace(/^\d+\. /, '');
            span.textContent = `${idx + 1}. ${text}`;
          }
        });
        // Persist order to backend
        const orderedIds = Array.from(parent.children).map(r => r.dataset.schedId).filter(Boolean);
        try {
          await api(`/api/schedule-groups/${_membersGroupId}/reorder`, {
            method: 'POST',
            body: JSON.stringify({ ordered_ids: orderedIds })
          });
          showToast('Order saved', 'success');
          loadGroups();
        } catch(err) {
          showToast('Failed to save order', 'error');
        }
      }
    });

    container.appendChild(row);
  });
  if (window.lucide) lucide.createIcons();
}

window.removeFromGroupUI = async (groupId, schedId, btn) => {
  try {
    await api(`/api/schedule-groups/${groupId}/remove-schedule`, {
      method: 'POST',
      body: JSON.stringify({ schedule_id: schedId })
    });
    // Remove the row from the DOM
    btn.closest('[data-sched-id]')?.remove();
    showToast('Removed from group', 'success');
    loadGroups();
    loadSchedules();
  } catch(e) {
    showToast('Failed to remove: ' + e.message, 'error');
  }
};

document.getElementById('btn-close-members-modal')?.addEventListener('click', () => closeModal('modal-group-members'));
document.getElementById('btn-close-members-ok')?.addEventListener('click', () => closeModal('modal-group-members'));

document.getElementById('btn-reverse-members-order')?.addEventListener('click', async () => {
  const container = document.getElementById('group-members-list');
  if (!container || !_membersGroupId) return;
  const rows = Array.from(container.children).filter(r => r.dataset.schedId);
  if (rows.length < 2) return;

  // Reverse DOM order
  rows.reverse().forEach(row => container.appendChild(row));

  // Renumber text labels
  Array.from(container.children).forEach((r, idx) => {
    const span = r.querySelector('span:nth-child(2)');
    if (span) {
      const text = span.textContent.replace(/^\d+\. /, '');
      span.textContent = `${idx + 1}. ${text}`;
    }
  });

  // Save new order to backend
  const orderedIds = Array.from(container.children).map(r => r.dataset.schedId).filter(Boolean);
  try {
    await api(`/api/schedule-groups/${_membersGroupId}/reorder`, {
      method: 'POST',
      body: JSON.stringify({ ordered_ids: orderedIds })
    });
    showToast('Order reversed and saved', 'success');
    loadGroups();
  } catch(err) {
    showToast('Failed to save order', 'error');
  }
});

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

document.getElementById('btn-clean-backup').addEventListener('click', async () => {
  const target = document.getElementById('backup-restore-target').value;
  let targetName = target === 'full' ? 'Full System' : (target === 'results' ? 'Results & Cache Only' : 'Schedules & Groups Only');
  
  if (await confirmAction(`This will create a backup of: ${targetName}. Do you want to proceed?`)) {
    const btn = document.getElementById('btn-clean-backup');
    const spinner = document.getElementById('backup-spinner');
    try {
      btn.disabled = true;
      if (spinner) spinner.classList.remove('hidden');
      showToast('Creating backup, please wait...', 'info');
      const res = await api(`/api/monitor/backup?target=${target}`);
      showToast(`Backup successfully saved to backups/${target}/ !`, 'success');
    } catch(e) {
      showToast('Failed to create backup', 'error');
    } finally {
      btn.disabled = false;
      if (spinner) spinner.classList.add('hidden');
    }
  }
});

document.getElementById('restore-backup-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const target = document.getElementById('backup-restore-target').value;
  let targetName = target === 'full' ? 'Full System' : (target === 'results' ? 'Results & Cache Only' : 'Schedules & Groups Only');
  
  if (await confirmAction(`Are you sure you want to restore ${targetName} from ${file.name}? This will overwrite the current selected data and you will lose any new data in those tables.`)) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target', target);
    try {
      showToast('Restoring backup, please wait...', 'info');
      const res = await fetch('/api/monitor/restore', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to restore backup');
      showToast('Backup restored successfully. Reloading...', 'success');
      setTimeout(() => location.reload(), 1500);
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
  e.target.value = '';
});

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


purgeBtn.addEventListener('click', async () => {
  if(purgeConfirm.value === 'DELETE') {
    const target = document.getElementById('purge-target').value;
    const lockedMode = document.querySelector('input[name="purge-locked-mode"]:checked')?.value || 'skip';
    const skipLocked = lockedMode === 'skip';
    let targetName = target === 'full' ? 'EVERYTHING (Jobs, Events, HTML Caches, Schedules, Groups)' : (target === 'results' ? 'Results & HTML Caches' : 'Schedules & Groups');
    const lockedNote = skipLocked ? ' Locked rows will be preserved.' : ' ⚠️ ALL rows including locked ones will be deleted.';
    
    if (await confirmAction(`WARNING: This will purge ${targetName}.${lockedNote} Are you absolutely sure?`)) {
      runCleanup('/api/monitor/cleanup/purge', { target, skip_locked: skipLocked });
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

let activeLogModalInterval = null;

function closeLogModalInterval() {
  if (activeLogModalInterval) {
    clearInterval(activeLogModalInterval);
    activeLogModalInterval = null;
  }
}

window.viewJobLogs = async (jobId) => {
  closeLogModalInterval();

  const body = document.getElementById('job-log-modal-body');
  if (!body) return;

  body.innerHTML = '<div style="color:var(--text-secondary); padding:10px;">Loading job logs...</div>';
  openModal('modal-job-log');

  const fetchAndRenderLogs = async () => {
    try {
      const res = await api(`/api/jobs/${jobId}/logs`);
      const logs = res.logs || [];
      if (logs.length === 0) {
        body.innerHTML = '<div style="color:var(--text-muted); font-style:italic; padding:10px;">No execution logs found for this job.</div>';
        return;
      }

      // Check if user is scrolled near the bottom before updating
      const isAtBottom = (body.scrollHeight - body.scrollTop - body.clientHeight) < 40;

      body.innerHTML = '';
      logs.forEach(log => {
        const el = document.createElement('div');
        const level = log.level || 'info';
        el.className = `log-${level}`;
        const timeStr = log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '';
        el.textContent = timeStr ? `[${timeStr}] ${log.message}` : log.message;
        body.appendChild(el);
      });

      if (isAtBottom) {
        body.scrollTop = body.scrollHeight;
      }
    } catch (e) {
      body.innerHTML = `<div class="log-error" style="padding:10px;">Failed to load logs: ${escapeHtml(e.message)}</div>`;
    }
  };

  await fetchAndRenderLogs();

  // Auto-refresh every 2 seconds as long as the modal remains open
  activeLogModalInterval = setInterval(async () => {
    const modal = document.getElementById('modal-job-log');
    if (!modal || modal.classList.contains('hidden')) {
      closeLogModalInterval();
      return;
    }
    await fetchAndRenderLogs();
  }, 2000);
};

document.getElementById('btn-close-job-log-modal')?.addEventListener('click', () => {
  closeLogModalInterval();
  closeModal('modal-job-log');
});
document.getElementById('btn-close-job-log-footer')?.addEventListener('click', () => {
  closeLogModalInterval();
  closeModal('modal-job-log');
});

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

    // 2. Fetch recent jobs to sync history / table data only if something is running or just finished
    if (activeJobIds.length > 0 || prevRunningJobIds.size > 0) {
      const res = await api('/api/jobs?page=1&per_page=1000');
      const jobs = Array.isArray(res) ? res : (res.jobs || []);

      // Detect if a job just finished
      const currentRunningIds = new Set(activeJobIds.length > 0 ? activeJobIds : jobs.filter(j => j.status === 'running' || j.status === 'pending').map(j => j.id));
      for (const prevId of prevRunningJobIds) {
        if (!currentRunningIds.has(prevId)) {
          const finishedJob = jobs.find(j => j.id === prevId);
          if (finishedJob) {
            const title = finishedJob.schedule_label ? `Scheduled job "${finishedJob.schedule_label}"` : 'Scraping job';
            if (finishedJob.status === 'done') {
              showToast(`${title} finished (${finishedJob.events_found || 0} events, ${finishedJob.events_new || 0} new, ${finishedJob.events_updated || 0} updated)`, 'success');
            } else if (finishedJob.status === 'failed') {
              showToast(`${title} failed`, 'error');
            }
          }
          if (activeSectionId === 'section-scheduler') { loadSchedules(); loadGroups(); }
          if (activeSectionId === 'section-results') loadResults();
        }
      }
      prevRunningJobIds = currentRunningIds;

      // Live update currently viewed section only when jobs are actively running or just finished
      if (activeSectionId === 'section-job-history') {
        loadJobHistory();
      } else if (activeSectionId === 'section-scheduler') {
        loadSchedules();
        loadGroups();
      }
    }
  } catch (e) {
    // Ignore polling errors
  } finally {
    isPolling = false;
  }
}

// ── Mobile Tunnel Module ──────────────────────────────────────────────────

async function checkMobileTunnelStatus() {
  try {
    const res = await fetch('/api/tunnel/status');
    if (!res.ok) return;
    const data = await res.json();
    updateTunnelUI(data);
  } catch (e) {
    // Ignore fetch error
  }
}

function updateTunnelUI(data) {
  const sidebarDot = document.getElementById('mobile-tunnel-dot');
  const modalDot = document.getElementById('tunnel-modal-status-dot');
  const modalStatusText = document.getElementById('tunnel-modal-status-text');
  const btnToggle = document.getElementById('btn-toggle-tunnel');
  const btnText = document.getElementById('tunnel-btn-text');
  const btnSpinner = document.getElementById('tunnel-btn-spinner');
  const activeInfo = document.getElementById('tunnel-active-info');
  const errorInfo = document.getElementById('tunnel-error-info');
  const errorText = document.getElementById('tunnel-error-text');
  const urlInput = document.getElementById('tunnel-url-input');
  const openUrlLink = document.getElementById('btn-open-tunnel-url');
  const qrImage = document.getElementById('tunnel-qr-code');

  if (data.status === 'active' && data.url) {
    if (sidebarDot) sidebarDot.style.background = '#4ade80';
    if (modalDot) modalDot.style.background = '#4ade80';
    if (modalStatusText) modalStatusText.textContent = 'Tunnel is Active';
    if (btnText) btnText.textContent = 'Stop Tunnel';
    if (btnToggle) {
      btnToggle.className = 'btn btn-danger btn-sm';
      btnToggle.disabled = false;
    }
    if (btnSpinner) btnSpinner.classList.add('hidden');
    if (activeInfo) activeInfo.classList.remove('hidden');
    if (errorInfo) errorInfo.classList.add('hidden');

    if (urlInput) urlInput.value = data.url;
    if (openUrlLink) openUrlLink.href = data.url;
    if (qrImage) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.url)}`;
      if (qrImage.src !== qrUrl) qrImage.src = qrUrl;
    }
  } else if (data.status === 'starting') {
    if (sidebarDot) sidebarDot.style.background = '#f59e0b';
    if (modalDot) modalDot.style.background = '#f59e0b';
    if (modalStatusText) modalStatusText.textContent = 'Starting Tunnel...';
    if (btnText) btnText.textContent = 'Connecting...';
    if (btnToggle) {
      btnToggle.className = 'btn btn-secondary btn-sm';
      btnToggle.disabled = true;
    }
    if (btnSpinner) btnSpinner.classList.remove('hidden');
    if (activeInfo) activeInfo.classList.add('hidden');
    if (errorInfo) errorInfo.classList.add('hidden');
  } else {
    if (sidebarDot) sidebarDot.style.background = '#64748b';
    if (modalDot) modalDot.style.background = '#64748b';
    if (modalStatusText) modalStatusText.textContent = 'Tunnel is Stopped';
    if (btnText) btnText.textContent = 'Start Tunnel';
    if (btnToggle) {
      btnToggle.className = 'btn btn-primary btn-sm';
      btnToggle.disabled = false;
    }
    if (btnSpinner) btnSpinner.classList.add('hidden');
    if (activeInfo) activeInfo.classList.add('hidden');

    if (data.error) {
      if (errorInfo) errorInfo.classList.remove('hidden');
      if (errorText) errorText.textContent = data.error;
    } else {
      if (errorInfo) errorInfo.classList.add('hidden');
    }
  }
}

function setupMobileTunnelEvents() {
  const btnSidebar = document.getElementById('btn-mobile-tunnel');
  const modal = document.getElementById('mobile-tunnel-modal');
  const btnCloseHeader = document.getElementById('btn-close-tunnel-modal');
  const btnCloseFooter = document.getElementById('btn-close-tunnel-footer');
  const btnToggle = document.getElementById('btn-toggle-tunnel');
  const btnCopy = document.getElementById('btn-copy-tunnel-url');

  if (btnSidebar) {
    btnSidebar.addEventListener('click', () => {
      if (modal) modal.classList.remove('hidden');
      checkMobileTunnelStatus();
    });
  }

  const closeModal = () => {
    if (modal) modal.classList.add('hidden');
  };

  if (btnCloseHeader) btnCloseHeader.addEventListener('click', closeModal);
  if (btnCloseFooter) btnCloseFooter.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  if (btnToggle) {
    btnToggle.addEventListener('click', async () => {
      const btnText = document.getElementById('tunnel-btn-text');
      const isCurrentlyActive = btnText && btnText.textContent.includes('Stop');
      const btnSpinner = document.getElementById('tunnel-btn-spinner');

      btnToggle.disabled = true;
      if (btnSpinner) btnSpinner.classList.remove('hidden');

      try {
        const endpoint = isCurrentlyActive ? '/api/tunnel/stop' : '/api/tunnel/start';
        const res = await fetch(endpoint, { method: 'POST' });
        const data = await res.json();
        updateTunnelUI(data);

        if (!isCurrentlyActive && data.status === 'starting') {
          let attempts = 0;
          const pollStart = setInterval(async () => {
            attempts++;
            const statusRes = await fetch('/api/tunnel/status');
            const statusData = await statusRes.json();
            updateTunnelUI(statusData);
            if (statusData.status !== 'starting' || attempts > 15) {
              clearInterval(pollStart);
            }
          }, 1000);
        }
      } catch (e) {
        showToast('Error toggling mobile tunnel', 'error');
      } finally {
        btnToggle.disabled = false;
        if (btnSpinner) btnSpinner.classList.add('hidden');
      }
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const urlInput = document.getElementById('tunnel-url-input');
      if (urlInput && urlInput.value) {
        navigator.clipboard.writeText(urlInput.value);
        showToast('Mobile URL copied to clipboard!', 'success');
      }
    });
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
  setupJobMultiselectEvents();
  setupNicknameSync();
  setupMobileTunnelEvents();
  
  Promise.allSettled([
    loadVersionInfo(),
    loadSessions(),
    loadMonitorStats(),
    loadJobHistory(),
    loadResults(),
    loadSchedules(),
    loadGroups(),
    checkMobileTunnelStatus(),
    pollLiveState()
  ]);
  
  // Real-time status sync every 5 seconds
  setInterval(pollLiveState, 5000);
  // Monitor stats every 60 seconds
  setInterval(loadMonitorStats, 60000);
  // Check mobile tunnel status every 15 seconds
  setInterval(checkMobileTunnelStatus, 15000);
});


