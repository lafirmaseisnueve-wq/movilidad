const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = 'movilidad-thefirm69-secret-key-2024';

// CORS
app.use(cors());

// Parse JSON
app.use(express.json({ limit: '10mb' }));

// Serve static files from movilidad/ directory
const STATIC_DIR = path.join(__dirname, '..');
app.use(express.static(STATIC_DIR));

// Load API configs
let apiConfigs = {};
function loadConfigs() {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'api_configs.json'), 'utf8'));
    apiConfigs = data;
  } catch (e) { console.error('Error loading configs:', e.message); }
}
loadConfigs();

function saveConfigs() {
  fs.writeFileSync(path.join(__dirname, 'data', 'api_configs.json'), JSON.stringify(apiConfigs, null, 2));
}

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ===== AUTH ROUTES =====
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin@movilidad.app' && password === 'TheFirm69!Admin') {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token, username, role: 'admin' });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ===== CONFIG ROUTES =====
app.get('/api/configs', authMiddleware, (req, res) => {
  res.json(apiConfigs.apis || []);
});

app.get('/api/configs/:id', authMiddleware, (req, res) => {
  const api = (apiConfigs.apis || []).find(a => a.id === req.params.id);
  if (!api) return res.status(404).json({ error: 'API not found' });
  res.json(api);
});

app.put('/api/configs/:id', authMiddleware, (req, res) => {
  const idx = (apiConfigs.apis || []).findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'API not found' });
  const api = apiConfigs.apis[idx];
  if (req.body.credentials) {
    Object.keys(req.body.credentials).forEach(key => {
      if (api.credentials[key]) api.credentials[key].value = req.body.credentials[key];
    });
  }
  if (req.body.enabled !== undefined) api.enabled = req.body.enabled;
  if (req.body.health !== undefined) api.health = req.body.health;
  saveConfigs();
  res.json(api);
});

app.patch('/api/configs/:id/toggle', authMiddleware, (req, res) => {
  const api = (apiConfigs.apis || []).find(a => a.id === req.params.id);
  if (!api) return res.status(404).json({ error: 'API not found' });
  api.enabled = !api.enabled;
  api.health = api.enabled ? 'active' : 'inactive';
  saveConfigs();
  res.json(api);
});

app.post('/api/configs/:id/test', authMiddleware, async (req, res) => {
  const api = (apiConfigs.apis || []).find(a => a.id === req.params.id);
  if (!api) return res.status(404).json({ error: 'API not found' });
  // Simulate test
  const hasValue = Object.values(api.credentials || {}).some(c => c.value && c.value.trim());
  res.json({
    apiId: api.id,
    status: hasValue ? 'healthy' : 'error',
    message: hasValue ? 'Conexión exitosa' : 'Sin credenciales configuradas',
    timestamp: new Date().toISOString(),
    responseTime: Math.floor(Math.random() * 200 + 50) + 'ms'
  });
});

app.post('/api/configs/:id/reset', authMiddleware, (req, res) => {
  const api = (apiConfigs.apis || []).find(a => a.id === req.params.id);
  if (!api) return res.status(404).json({ error: 'API not found' });
  Object.values(api.credentials || {}).forEach(c => { c.value = ''; });
  api.health = 'unknown';
  saveConfigs();
  res.json(api);
});

// ===== HEALTH & LOGS =====
app.get('/api/health', authMiddleware, (req, res) => {
  const apis = apiConfigs.apis || [];
  const total = apis.length;
  const enabled = apis.filter(a => a.enabled).length;
  const healthy = apis.filter(a => a.health === 'healthy').length;
  const error = apis.filter(a => a.health === 'error').length;
  const unknown = apis.filter(a => a.health === 'unknown').length;
  const active = apis.filter(a => a.health === 'active').length;
  const generalHealth = total > 0 ? Math.round(((healthy + active) / total) * 100) + '%' : '0%';
  res.json({ total, enabled, healthy, error, unknown, active, generalHealth });
});

app.get('/api/logs', authMiddleware, (req, res) => {
  res.json([]);
});

app.get('/api/categories', authMiddleware, (req, res) => {
  const cats = [...new Set((apiConfigs.apis || []).map(a => a.category))];
  res.json(cats);
});

// ===== GEMINI ROUTES =====
app.get('/api/gemini/status', authMiddleware, (req, res) => {
  const gemini = (apiConfigs.apis || []).find(a => a.id === 'gemini-ai');
  if (!gemini) return res.status(404).json({ error: 'Gemini API not found' });
  const hasKey = !!(gemini.credentials.apiKey && gemini.credentials.apiKey.value);
  res.json({
    configured: hasKey,
    model: gemini.credentials.model?.value || 'gemini-pro',
    hasApiKey: hasKey,
    enabled: gemini.enabled,
    health: gemini.health,
    quotas: { daily: 1500, used: 0, unit: 'requests' },
    analysisTypes: ['route-deviation', 'speed-anomaly', 'incident-detection', 'safety-score', 'ride-safety-check']
  });
});

app.post('/api/gemini/test', authMiddleware, async (req, res) => {
  const gemini = (apiConfigs.apis || []).find(a => a.id === 'gemini-ai');
  if (!gemini) return res.status(404).json({ error: 'Gemini not found' });
  const hasKey = !!(gemini.credentials.apiKey && gemini.credentials.apiKey.value);
  if (!hasKey) {
    return res.json({ success: false, message: 'Sin API Key configurada', status: 'not_configured' });
  }
  // If key is set, try to call Gemini
  try {
    const apiKey = gemini.credentials.apiKey.value;
    const model = gemini.credentials.model?.value || 'gemini-pro';
    // Using native fetch in Node 20
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Responde solo: OK' }] }] })
    });
    const data = await response.json();
    if (data.candidates) {
      res.json({ success: true, message: 'Gemini conectado exitosamente', status: 'healthy', model });
    } else {
      res.json({ success: false, message: data.error?.message || 'Error de API', status: 'error' });
    }
  } catch (e) {
    res.json({ success: false, message: e.message, status: 'error' });
  }
});

app.post('/api/gemini/analyze', authMiddleware, async (req, res) => {
  const { type, data: tripData } = req.body;
  const gemini = (apiConfigs.apis || []).find(a => a.id === 'gemini-ai');
  if (!gemini || !gemini.credentials.apiKey?.value) {
    return res.status(400).json({ error: 'Gemini no configurado' });
  }
  try {
    const apiKey = gemini.credentials.apiKey.value;
    const model = gemini.credentials.model?.value || 'gemini-pro';
    // Using native fetch in Node 20
    const prompts = {
      'route-deviation': `Analiza si esta ruta tiene desviación: ${JSON.stringify(tripData)}`,
      'speed-anomaly': `Analiza anomalías de velocidad: ${JSON.stringify(tripData)}`,
      'incident-detection': `Detecta incidentes: ${JSON.stringify(tripData)}`,
      'safety-score': `Calcula score de seguridad: ${JSON.stringify(tripData)}`,
      'ride-safety-check': `Verifica seguridad del viaje: ${JSON.stringify(tripData)}`
    };
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompts[type] || prompts['safety-score'] }] }] })
    });
    const result = await response.json();
    res.json({ type, analysis: result.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin resultado', timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===== RIDES (stub) =====
app.get('/api/rides', authMiddleware, (req, res) => {
  res.json([]);
});

// ===== TRIPCHECK (stub) =====
app.get('/api/tripcheck', authMiddleware, (req, res) => {
  res.json({ active: false, events: [] });
});

app.post('/api/tripcheck', authMiddleware, (req, res) => {
  res.json({ status: 'ok' });
});

// ===== EXPORT =====
app.get('/api/export', authMiddleware, (req, res) => {
  res.json({ apis: apiConfigs.apis, exportedAt: new Date().toISOString() });
});

// SPA fallback - serve index.html for any non-API, non-file route
app.get('/{*path}', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  // Try to serve the exact file first
  const filePath = path.join(STATIC_DIR, req.path);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  // Fallback
  res.sendFile(path.join(STATIC_DIR, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚗 Movilidad Unified Server — By TheFirm69 Systems`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Static files: ${STATIC_DIR}`);
  console.log(`   API endpoints: /api/*`);
});
