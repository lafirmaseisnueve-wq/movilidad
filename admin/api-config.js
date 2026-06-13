/* ================================================================
   MOVILIDAD API Configuration Panel - By TheFirm69 Systems
   Full dashboard for managing all 15+ API integrations
   Connects to backend server.js on port 3001
   ================================================================ */

const API_BASE = (() => {
  // Auto-detect backend URL
  const h = window.location.hostname;
  if (h.includes('super.myninja.ai')) {
    return 'https://' + h.replace(/-\d+\./, '-01cbe.') + '/api';
  }
  return 'http://localhost:3001/api';
})();
let apiConfigs = [];
let apiLogs = [];
let apiCategories = [];
let jwtToken = null;
let selectedApiId = null;
let healthInterval = null;

// ===== AUTH =====
async function apiLogin() {
  const user = document.getElementById('api-login-user').value;
  const pass = document.getElementById('api-login-pass').value;
  try {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();
    if (data.token) {
      jwtToken = data.token;
      localStorage.setItem('movilidad_jwt', jwtToken);
      document.getElementById('api-login-overlay').style.display = 'none';
      loadApiDashboard();
    } else {
      showApiToast('Credenciales incorrectas', 'error');
    }
  } catch (e) {
    showApiToast('Error conectando al servidor backend', 'error');
    console.error(e);
  }
}

function checkApiAuth() {
  const saved = localStorage.getItem('movilidad_jwt');
  if (saved) { jwtToken = saved; }
  if (!jwtToken) {
    document.getElementById('api-login-overlay').style.display = 'flex';
  } else {
    document.getElementById('api-login-overlay').style.display = 'none';
    loadApiDashboard();
  }
}

async function apiFetch(url, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (jwtToken) headers['Authorization'] = 'Bearer ' + jwtToken;
  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      jwtToken = null;
      localStorage.removeItem('movilidad_jwt');
      document.getElementById('api-login-overlay').style.display = 'flex';
      return null;
    }
    return await res.json();
  } catch (e) {
    console.error('API fetch error:', e);
    return null;
  }
}

// ===== LOAD DASHBOARD =====
async function loadApiDashboard() {
  const [configs, health, categories, logs] = await Promise.all([
    apiFetch(API_BASE + '/configs'),
    apiFetch(API_BASE + '/health'),
    apiFetch(API_BASE + '/categories'),
    apiFetch(API_BASE + '/logs?limit=20')
  ]);
  if (configs) apiConfigs = configs;
  if (health) renderHealthSummary(health);
  if (categories) apiCategories = categories;
  if (logs) { apiLogs = logs; renderApiLogs(); }
  renderApiCards();
  renderCategoryFilters();
  startHealthPolling();
}

function startHealthPolling() {
  if (healthInterval) clearInterval(healthInterval);
  healthInterval = setInterval(async () => {
    const health = await apiFetch(API_BASE + '/health');
    if (health) renderHealthSummary(health);
  }, 30000);
}

// ===== HEALTH SUMMARY =====
function renderHealthSummary(health) {
  const el = document.getElementById('api-health-summary');
  if (!el) return;
  const totalPct = health.total > 0 ? Math.round(((health.healthy + health.enabled) / (health.total * 2)) * 100) : 0;
  el.innerHTML = `
    <div class="ahs-grid">
      <div class="ahs-item"><div class="ahs-num" style="color:var(--primary);">${health.total}</div><div class="ahs-label">Total APIs</div></div>
      <div class="ahs-item"><div class="ahs-num" style="color:var(--success);">${health.enabled}</div><div class="ahs-label">Activas</div></div>
      <div class="ahs-item"><div class="ahs-num" style="color:#10B981;">${health.healthy}</div><div class="ahs-label">Saludables</div></div>
      <div class="ahs-item"><div class="ahs-num" style="color:var(--danger);">${health.error}</div><div class="ahs-label">Con Error</div></div>
      <div class="ahs-item"><div class="ahs-num" style="color:var(--text-light);">${health.unknown}</div><div class="ahs-label">Sin Probar</div></div>
      <div class="ahs-item"><div class="ahs-num" style="color:${totalPct>70?'var(--success)':totalPct>40?'var(--warning)':'var(--danger)'};">${totalPct}%</div><div class="ahs-label">Salud General</div></div>
    </div>
  `;
}

// ===== CATEGORY FILTERS =====
function renderCategoryFilters() {
  const el = document.getElementById('api-category-filters');
  if (!el) return;
  const cats = {};
  apiConfigs.forEach(a => { if (!cats[a.category]) cats[a.category] = 0; cats[a.category]++; });
  const catNames = { mapping:'🗺️ Mapas', realtime:'⚡ Tiempo Real', payments:'💳 Pagos', communications:'📞 Comunicaciones', authentication:'🔥 Autenticación', storage:'☁️ Almacenamiento', notifications:'🔔 Notificaciones', streaming:'📊 Streaming', geospatial:'🌐 Geoespacial', infrastructure:'🔧 Infraestructura', database:'🐘 Base de Datos', 'artificial-intelligence':'🧠 IA / Gemini' };
  el.innerHTML = `<button class="btn btn-sm btn-primary api-cat-btn active" onclick="filterByCategory('all')">Todas (${apiConfigs.length})</button>` +
    Object.keys(cats).map(c => `<button class="btn btn-sm btn-secondary api-cat-btn" onclick="filterByCategory('${c}')">${catNames[c]||c} (${cats[c]})</button>`).join('');
}

let currentCategoryFilter = 'all';
function filterByCategory(cat) {
  currentCategoryFilter = cat;
  document.querySelectorAll('.api-cat-btn').forEach(b => b.classList.remove('active','btn-primary'));
  document.querySelectorAll('.api-cat-btn').forEach(b => { if (b.textContent.includes(cat==='all'?'Todas':cat)) { b.classList.add('active','btn-primary'); b.classList.remove('btn-secondary'); } else { b.classList.remove('active','btn-primary'); b.classList.add('btn-secondary'); } });
  renderApiCards();
}

// ===== API CARDS =====
function renderApiCards() {
  const el = document.getElementById('api-cards-grid');
  if (!el) return;
  let filtered = currentCategoryFilter === 'all' ? apiConfigs : apiConfigs.filter(a => a.category === currentCategoryFilter);
  el.innerHTML = filtered.map(api => {
    const hIcon = api.health==='healthy'?'🟢':api.health==='error'?'🔴':api.health==='active'?'🟢':'⚪';
    const hClass = api.health==='healthy'?'healthy':api.health==='error'?'error':api.health==='active'?'healthy':'unknown';
    const enabledClass = api.enabled ? 'enabled' : 'disabled';
    return `<div class="api-card ${enabledClass}" onclick="openApiDetail('${api.id}')">
      <div class="ac-header">
        <div class="ac-icon">${api.icon}</div>
        <div class="ac-title"><h4>${api.name}</h4><span class="ac-version">${api.version}</span></div>
        <div class="ac-health ${hClass}">${hIcon}</div>
      </div>
      <p class="ac-desc">${api.description}</p>
      <div class="ac-footer">
        <span class="ac-category">${getCategoryLabel(api.category)}</span>
        <div class="ac-toggle" onclick="event.stopPropagation(); toggleApi('${api.id}', this)">
          <div class="toggle ${api.enabled?'active':''}"></div>
        </div>
      </div>
      ${api.lastTested ? `<div class="ac-tested">Probado: ${timeAgo(api.lastTested)}</div>` : ''}
    </div>`;
  }).join('');
}

function getCategoryLabel(cat) {
  const m = { mapping:'Mapas', realtime:'Realtime', payments:'Pagos', communications:'Coms', authentication:'Auth', storage:'Storage', notifications:'Push', streaming:'Stream', geospatial:'Geo', infrastructure:'Infra', database:'DB', 'artificial-intelligence':'IA/Gemini' };
  return m[cat] || cat;
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Nunca';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff/60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return mins + ' min';
  const hrs = Math.floor(mins/60);
  if (hrs < 24) return hrs + ' hrs';
  return Math.floor(hrs/24) + ' días';
}

// ===== TOGGLE API =====
async function toggleApi(id, el) {
  const res = await apiFetch(API_BASE + '/configs/' + id + '/toggle', { method: 'PATCH' });
  if (res && res.success !== undefined) {
    const api = apiConfigs.find(a => a.id === id);
    if (api) api.enabled = res.enabled;
    const toggle = el.querySelector('.toggle') || el;
    toggle.classList.toggle('active');
    showApiToast(res.enabled ? 'API habilitada' : 'API deshabilitada', res.enabled ? 'success' : 'warning');
    renderApiCards();
  }
}

// ===== API DETAIL MODAL =====
async function openApiDetail(id) {
  selectedApiId = id;
  const api = await apiFetch(API_BASE + '/configs/' + id);
  if (!api) return;
  const modal = document.getElementById('api-detail-modal');
  modal.classList.add('active');

  // Header
  document.getElementById('modal-api-icon').textContent = api.icon;
  document.getElementById('modal-api-name').textContent = api.name;
  document.getElementById('modal-api-version').textContent = api.version;
  document.getElementById('modal-api-desc').textContent = api.description;
  document.getElementById('modal-api-docs').href = api.docsUrl;
  document.getElementById('modal-api-docs').textContent = '📖 Documentación';

  // Health badge
  const hBadge = document.getElementById('modal-health-badge');
  const hMap = { healthy:{text:'Saludable',cls:'badge-success'}, error:{text:'Error',cls:'badge-danger'}, active:{text:'Activo',cls:'badge-success'}, unknown:{text:'Sin Probar',cls:'badge-warning'} };
  const hInfo = hMap[api.health] || hMap.unknown;
  hBadge.textContent = hInfo.text;
  hBadge.className = 'badge ' + hInfo.cls;

  // Status badge
  const sBadge = document.getElementById('modal-status-badge');
  sBadge.textContent = api.enabled ? 'Habilitada' : 'Deshabilitada';
  sBadge.className = 'badge ' + (api.enabled ? 'badge-success' : 'badge-danger');

  // Credentials form
  const credsDiv = document.getElementById('modal-credentials');
  credsDiv.innerHTML = Object.keys(api.credentials).map(key => {
    const c = api.credentials[key];
    const isPassword = c.type === 'password';
    const isTextarea = c.type === 'textarea';
    const isNumber = c.type === 'number';
    const isSelect = c.type === 'select';
    const reqMark = c.required ? '<span style="color:var(--danger);">*</span>' : '';
    let inputHtml;
    if (isTextarea) {
      inputHtml = `<textarea id="cred-${key}" placeholder="${c.placeholder||''}" rows="3" style="width:100%;padding:10px 14px;border:2px solid var(--border);border-radius:var(--radius);font-size:13px;font-family:monospace;resize:vertical;">${c.value||''}</textarea>`;
    } else if (isSelect) {
      inputHtml = `<select id="cred-${key}" style="width:100%;padding:10px 14px;border:2px solid var(--border);border-radius:var(--radius);font-size:13px;">${(c.options||[]).map(o=>`<option value="${o}" ${o===c.value?'selected':''}>${o}</option>`).join('')}</select>`;
    } else {
      inputHtml = `<input type="${isPassword?'password':'text'}" id="cred-${key}" value="${c.value||''}" placeholder="${c.placeholder||''}" style="width:100%;padding:10px 14px;border:2px solid var(--border);border-radius:var(--radius);font-size:13px;" ${isNumber?'inputmode="numeric"':''} />`;
    }
    return `<div class="cred-field">
      <label>${c.label} ${reqMark}</label>
      <div class="cred-input-wrap">
        ${inputHtml}
        ${isPassword?`<button class="cred-toggle-vis" onclick="toggleCredVis('cred-${key}')">👁️</button>`:''}
      </div>
    </div>`;
  }).join('');

  // Endpoints
  const epDiv = document.getElementById('modal-endpoints');
  epDiv.innerHTML = api.endpoints.map(ep => {
    const sIcon = ep.status==='active'?'🟢':ep.status==='error'?'🔴':'⚪';
    return `<div class="ep-row"><span class="ep-status">${sIcon}</span><span class="ep-name">${ep.name}</span><span class="ep-path">${ep.path}</span></div>`;
  }).join('');

  // Quotas & Pricing
  document.getElementById('modal-quotas').innerHTML = `
    <div class="qp-item"><span class="qp-label">Cuota diaria</span><span class="qp-value">${api.quotas.daily || 'Ilimitada'}</span></div>
    <div class="qp-item"><span class="qp-label">Usado hoy</span><span class="qp-value">${api.quotas.used}</span></div>
    <div class="qp-item"><span class="qp-label">Unidad</span><span class="qp-value">${api.quotas.unit}</span></div>
  `;
  document.getElementById('modal-pricing').innerHTML = `
    <div class="qp-item"><span class="qp-label">Modelo</span><span class="qp-value">${api.pricing.model}</span></div>
    <div class="qp-item"><span class="qp-label">Nivel gratis</span><span class="qp-value">${api.pricing.free}</span></div>
    <div class="qp-item"><span class="qp-label">Costo por 1K</span><span class="qp-value">${api.pricing.per1000}</span></div>
  `;

  // Webhook
  document.getElementById('modal-webhook-url').value = api.webhook?.url || '';
  document.getElementById('modal-webhook-events').value = (api.webhook?.events || []).join(', ');

  // Last tested
  document.getElementById('modal-last-tested').textContent = api.lastTested ? new Date(api.lastTested).toLocaleString('es') : 'Nunca probado';
}

function closeApiDetail() {
  document.getElementById('api-detail-modal').classList.remove('active');
  selectedApiId = null;
}

function toggleCredVis(inputId) {
  const inp = document.getElementById(inputId);
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ===== SAVE CREDENTIALS =====
async function saveApiConfig() {
  if (!selectedApiId) return;
  const api = apiConfigs.find(a => a.id === selectedApiId);
  if (!api) return;
  const updatedCreds = {};
  Object.keys(api.credentials).forEach(key => {
    const el = document.getElementById('cred-' + key);
    if (el) updatedCreds[key] = { ...api.credentials[key], value: el.value };
  });
  const webhookUrl = document.getElementById('modal-webhook-url').value;
  const webhookEvents = document.getElementById('modal-webhook-events').value.split(',').map(s=>s.trim()).filter(Boolean);

  const res = await apiFetch(API_BASE + '/configs/' + selectedApiId, {
    method: 'PUT',
    body: JSON.stringify({ credentials: updatedCreds, webhook: { url: webhookUrl, events: webhookEvents } })
  });
  if (res && res.id) {
    const idx = apiConfigs.findIndex(a => a.id === selectedApiId);
    if (idx > -1) apiConfigs[idx] = res;
    showApiToast('✅ Configuración guardada exitosamente', 'success');
    renderApiCards();
  } else {
    showApiToast('❌ Error guardando configuración', 'error');
  }
}

// ===== TEST CONNECTION =====
async function testApiConnection() {
  if (!selectedApiId) return;
  const btn = document.getElementById('btn-test-api');
  const resultDiv = document.getElementById('modal-test-result');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Probando...';
  resultDiv.innerHTML = '';
  resultDiv.style.display = 'block';

  // Save first
  await saveApiConfig();

  const startTime = Date.now();
  const res = await apiFetch(API_BASE + '/configs/' + selectedApiId + '/test', { method: 'POST' });
  const elapsed = Date.now() - startTime;

  if (res) {
    const success = res.success;
    const latency = res.latency || elapsed;
    resultDiv.className = 'test-result ' + (success ? 'test-success' : 'test-error');
    resultDiv.innerHTML = `
      <div class="tr-header">
        <span class="tr-icon">${success ? '✅' : '❌'}</span>
        <span class="tr-status">${success ? 'Conexión exitosa' : 'Conexión fallida'}</span>
        <span class="tr-latency">${latency}ms</span>
      </div>
      <p class="tr-message">${res.message || 'Sin mensaje'}</p>
      <span class="tr-time">${new Date().toLocaleString('es')}</span>
    `;
    // Update health
    const api = apiConfigs.find(a => a.id === selectedApiId);
    if (api) {
      api.health = success ? 'healthy' : 'error';
      api.lastTested = new Date().toISOString();
      api.lastStatus = success ? 'active' : 'error';
    }
    // Update health badge in modal
    const hBadge = document.getElementById('modal-health-badge');
    if (success) { hBadge.textContent = 'Saludable'; hBadge.className = 'badge badge-success'; }
    else { hBadge.textContent = 'Error'; hBadge.className = 'badge badge-danger'; }
    document.getElementById('modal-last-tested').textContent = new Date().toLocaleString('es');
    renderApiCards();
    loadApiLogs();
  } else {
    resultDiv.className = 'test-result test-error';
    resultDiv.innerHTML = `<div class="tr-header"><span class="tr-icon">❌</span><span class="tr-status">Sin respuesta del servidor</span></div>`;
  }

  btn.disabled = false;
  btn.innerHTML = '🧪 Probar Conexión';
}

// ===== RESET API =====
async function resetApiConfig() {
  if (!selectedApiId) return;
  if (!confirm('¿Resetear esta API a sus valores por defecto? Se perderán todas las credenciales configuradas.')) return;
  const res = await apiFetch(API_BASE + '/configs/' + selectedApiId + '/reset', { method: 'POST' });
  if (res && res.success) {
    showApiToast('🔄 API reseteada a valores por defecto', 'warning');
    openApiDetail(selectedApiId);
    loadApiDashboard();
  }
}

// ===== EXPORT CONFIGS =====
async function exportApiConfigs() {
  const res = await apiFetch(API_BASE + '/export');
  if (res) {
    const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'movilidad-api-configs.json'; a.click();
    URL.revokeObjectURL(url);
    showApiToast('📦 Configuraciones exportadas', 'success');
  }
}

// ===== TEST ALL APIs =====
async function testAllApis() {
  const btn = document.getElementById('btn-test-all');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:18px;height:18px;border-width:2px;"></span> Probando todas...';
  
  for (const api of apiConfigs) {
    if (api.enabled) {
      await apiFetch(API_BASE + '/configs/' + api.id + '/test', { method: 'POST' });
    }
  }
  
  loadApiDashboard();
  btn.disabled = false;
  btn.innerHTML = '🧪 Probar Todas';
  showApiToast('✅ Pruebas completadas', 'success');
}

// ===== LOGS =====
function renderApiLogs() {
  const el = document.getElementById('api-logs-list');
  if (!el) return;
  el.innerHTML = apiLogs.slice(0, 30).map(log => {
    const aIcon = log.action==='test'?'🧪':log.action==='toggle'?'🔀':log.action==='update'?'💾':log.action==='reset'?'🔄':'📋';
    const sClass = log.success || log.enabled!==undefined ? (log.success!==false?'log-success':'log-error') : 'log-info';
    return `<div class="log-row ${sClass}">
      <span class="log-action">${aIcon}</span>
      <span class="log-api">${log.apiId || log.apiName || '-'}</span>
      <span class="log-msg">${log.message || (log.enabled!==undefined ? (log.enabled?'Habilitada':'Deshabilitada') : log.action)}</span>
      <span class="log-time">${log.timestamp ? timeAgo(log.timestamp) : '-'}</span>
      <span class="log-latency">${log.latency ? log.latency+'ms' : ''}</span>
    </div>`;
  }).join('');
}

// ===== TOAST =====
function showApiToast(msg, type) {
  const container = document.getElementById('api-toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'api-toast toast-' + type;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ===== TAB SWITCHING =====
function showApiTab(tabName) {
  document.querySelectorAll('.amc-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.amc-tab-content').forEach(t => t.classList.remove('active'));
  const tab = document.querySelector(`.amc-tab[onclick*="${tabName}"]`);
  if (tab) tab.classList.add('active');
  const content = document.getElementById('tab-' + tabName);
  if (content) content.classList.add('active');
}

// ===== LOAD LOGS =====
async function loadApiLogs() {
  const logs = await apiFetch(API_BASE + '/logs?limit=30');
  if (logs) { apiLogs = logs; renderApiLogs(); }
}

// ===== GEMINI AI FUNCTIONS =====
async function loadGeminiStatus() {
  const status = await apiFetch(API_BASE + '/gemini/status');
  const el = document.getElementById('gemini-status-info');
  if (!el || !status) return;
  
  const statusColor = status.configured ? (status.hasApiKey ? '#10B981' : '#F59E0B') : '#EF4444';
  const statusText = status.configured ? (status.hasApiKey ? '✅ Configurado & Conectado' : '⚠️ Falta API Key') : '❌ No Configurado';
  const healthColor = status.health === 'healthy' ? '#10B981' : status.health === 'active' ? '#10B981' : status.health === 'error' ? '#EF4444' : '#F59E0B';
  
  el.innerHTML = `
    <span style="color:${statusColor};font-size:11px;font-weight:700;">${statusText}</span>
    <span style="color:rgba(255,255,255,.5);font-size:11px;">🤖 Modelo: <strong style="color:#fff;">${status.model}</strong></span>
    <span style="color:${healthColor};font-size:11px;">${status.health === 'healthy' ? '🟢 Saludable' : status.health === 'active' ? '🟢 Activo' : status.health === 'error' ? '🔴 Error' : '🟡 Sin Probar'}</span>
    <span style="color:rgba(255,255,255,.5);font-size:11px;">📊 Cuota: <strong style="color:#fff;">${status.quotas?.used || 0}/${status.quotas?.daily || '∞'}</strong></span>
    <span style="color:rgba(255,255,255,.5);font-size:11px;">🔍 Análisis: <strong style="color:#fff;">${(status.analysisTypes || []).join(', ')}</strong></span>
  `;
}

async function testGeminiConnection() {
  const btn = event.target;
  btn.disabled = true;
  const origText = btn.innerHTML;
  btn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;"></span> Probando...';
  
  const res = await apiFetch(API_BASE + '/gemini/test', { method: 'POST' });
  
  if (res && res.connected) {
    showApiToast('🧠 Gemini AI conectado exitosamente — TripCheck listo', 'success');
  } else if (res && res.configured && !res.connected) {
    showApiToast('⚠️ Gemini configurado pero sin conexión — Verifica tu API Key', 'warning');
  } else {
    showApiToast('❌ Gemini no configurado — Agrega tu API Key', 'error');
  }
  
  loadGeminiStatus();
  btn.disabled = false;
  btn.innerHTML = origText;
}

// ===== INIT =====
function initApiConfigPanel() {
  checkApiAuth();
  // Load Gemini status after auth
  setTimeout(loadGeminiStatus, 2000);
}
