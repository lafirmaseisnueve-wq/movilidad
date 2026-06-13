/* ================================================
   MOVILIDAD Admin Panel - By TheFirm69 Systems
   All functionality, charts, data, interactions
   ================================================ */

// ===== PAGE NAVIGATION =====
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  // Highlight sidebar
  const links = document.querySelectorAll('.nav-link');
  links.forEach(l => { if (l.textContent.toLowerCase().includes(id.substring(0,4))) l.classList.add('active'); });
  // Update title
  const titles = { dashboard:'Dashboard', livemap:'Live Map GPS', users:'Gestión de Usuarios', fleets:'Flotillas', documents:'Aprobación de Documentos', pricing:'Surge Pricing', commissions:'Comisiones y Facturación', 'incentives-admin':'Incentivos y Promociones', soc:'Centro de Seguridad (SOC)', tripcheck:'TripCheck AI — Seguridad Inteligente', tickets:'Tickets de Soporte', charging:'Carga EV — Red de Estaciones', maintenance:'Mantenimiento — Centros Afiliados', financing:'Financiamiento — Soluciones Automotrices', smartcity:'Smart Cities — Infraestructura Urbana', 'traffic-ai':'Traffic AI — Predicción de Tráfico', mapping:'Mapa Propio — Cartografía Independiente', robotaxi:'Robotaxis — Conducción Autónoma', 'hybrid-dispatch':'Dispatch Híbrido — Asignación Dual', 'api-config':'APIs y Servicios', cities:'Ciudades y Geocercas', analytics:'Analytics & BI' };
  document.getElementById('page-title').textContent = titles[id] || 'Admin';
  // Init specific pages
  if (id === 'livemap') setTimeout(initAdminMap, 200);
  if (id === 'dashboard') initDashboardCharts();
  if (id === 'analytics') initAnalyticsCharts();
  if (id === 'users') populateUsers();
  if (id === 'fleets') populateFleets();
  if (id === 'documents') populateDocuments();
  if (id === 'pricing') populateSurgeZones();
  if (id === 'soc') populateSOC();
  if (id === 'tickets') populateTickets();
  if (id === 'cities') populateCities();
  if (id === 'incentives-admin') populateAdminIncentives();
  if (id === 'api-config') initApiConfigPanel();
  if (id === 'tripcheck') { initTripCheck(); setTimeout(loadGeminiTripCheckStatus, 500); }
  if (id === 'charging') initCharging();
  if (id === 'maintenance') initMaintenance();
  if (id === 'financing') initFinancing();
  if (id === 'smartcity') initSmartCity();
  if (id === 'traffic-ai') initTrafficAI();
  if (id === 'mapping') initMapping();
  if (id === 'robotaxi') { initRobotaxi(); setTimeout(initRobotaxiConsole, 200); }
  if (id === 'commissions') setTimeout(initCommissionsPage, 200);
  if (id === 'hybrid-dispatch') initHybridDispatch();
}

// ===== DASHBOARD CHARTS =====
let chartsInit = false;
function initDashboardCharts() {
  if (chartsInit) return;
  chartsInit = true;
  const data = MockData.analytics();
  const purple = '#7C3AED', purpleLight = 'rgba(124,58,237,.2)';
  const baseOpts = { responsive:true, plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(0,0,0,.05)'}}} };

  new Chart(document.getElementById('chart-rides'), {
    type:'line', data:{labels:data.hours, datasets:[{data:data.rides, borderColor:purple, backgroundColor:purpleLight, fill:true, tension:.4}]}, options:baseOpts
  });
  new Chart(document.getElementById('chart-drivers'), {
    type:'bar', data:{labels:data.hours, datasets:[{data:data.drivers, backgroundColor:purple, borderRadius:4}]}, options:{...baseOpts, plugins:{legend:{display:false}}}
  });
  new Chart(document.getElementById('chart-revenue'), {
    type:'line', data:{labels:data.hours, datasets:[{data:data.revenue, borderColor:'#10B981', backgroundColor:'rgba(16,185,129,.2)', fill:true, tension:.4}]}, options:baseOpts
  });
  new Chart(document.getElementById('chart-wait'), {
    type:'line', data:{labels:data.hours, datasets:[{data:data.waitTime, borderColor:'#F59E0B', backgroundColor:'rgba(245,158,11,.2)', fill:true, tension:.4}]}, options:baseOpts
  });
}

// ===== ANALYTICS CHARTS =====
let analyticsInit = false;
function initAnalyticsCharts() {
  if (analyticsInit) return;
  analyticsInit = true;
  const data = MockData.analytics();
  const baseOpts = { responsive:true, plugins:{legend:{display:false}}, scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(0,0,0,.05)'}}} };

  new Chart(document.getElementById('chart-accept'), {
    type:'line', data:{labels:data.hours, datasets:[{data:data.acceptRate, borderColor:'#10B981', backgroundColor:'rgba(16,185,129,.2)', fill:true, tension:.4}]}, options:baseOpts
  });
  new Chart(document.getElementById('chart-cancel'), {
    type:'line', data:{labels:data.hours, datasets:[{data:data.cancelRate, borderColor:'#EF4444', backgroundColor:'rgba(239,68,68,.2)', fill:true, tension:.4}]}, options:baseOpts
  });
  const days = Array.from({length:30}, (_,i) => `Día ${i+1}`);
  const revDaily = days.map(() => Math.floor(500000 + Math.random() * 300000));
  new Chart(document.getElementById('chart-rev-daily'), {
    type:'bar', data:{labels:days, datasets:[{data:revDaily, backgroundColor:'#7C3AED', borderRadius:4}]}, options:baseOpts
  });
  new Chart(document.getElementById('chart-categories'), {
    type:'doughnut', data:{labels:['Express','Comfort','Taxi','Moto','Protect','Share'], datasets:[{data:[45,18,12,10,8,7], backgroundColor:['#7C3AED','#A78BFA','#F59E0B','#EC4899','#10B981','#3B82F6']}]}, options:{responsive:true,plugins:{legend:{position:'right'}}}
  });
}

// ===== ADMIN LIVE MAP =====
let adminMap = null;
function initAdminMap() {
  if (adminMap) { adminMap.invalidateSize(); return; }
  adminMap = L.map('admin-map', { zoomControl:true }).setView([19.4326, -99.1332], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution:'© OSM' }).addTo(adminMap);

  // Simulate real-time driver positions
  const drivers = MockData.randomLocations(30);
  const markers = {};
  drivers.forEach(d => {
    const m = L.marker([d.lat, d.lng], {
      icon: L.divIcon({
        className:'', html:`<div style="background:var(--primary);width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3);"></div>`,
        iconSize:[14,14], iconAnchor:[7,7]
      })
    }).addTo(adminMap).bindPopup(`<b>${d.name}</b><br>${d.vehicle}<br>${d.plate}<br>★ ${d.rating.toFixed(1)}`);
    markers[d.id] = m;
  });

  // Surge zones
  const zones = MockData.surgeZones();
  zones.forEach(z => {
    L.circle([z.lat, z.lng], { radius:1500, color:z.color, fillColor:z.color, fillOpacity:.25, weight:2 })
      .addTo(adminMap).bindPopup(`<b>${z.name}</b><br>Surge: ×${z.multiplier}`);
  });

  // Simulate GPS movement every 3 seconds
  setInterval(() => {
    drivers.forEach(d => {
      d.lat += (Math.random() - 0.5) * 0.001;
      d.lng += (Math.random() - 0.5) * 0.001;
      d.geohash = GeospatialService.encodeGeohash(d.lat, d.lng, 8);
      if (markers[d.id]) markers[d.id].setLatLng([d.lat, d.lng]);
    });
  }, 3000);
}

// ===== USERS CRM =====
function populateUsers() {
  const drivers = MockData.randomLocations(10);
  const tbody = document.getElementById('drivers-tbody');
  tbody.innerHTML = drivers.map((d,i) => `
    <tr>
      <td>D${1001+i}</td>
      <td><div style="display:flex;align-items:center;gap:8px;"><div class="avatar-sm" style="width:28px;height:28px;font-size:11px;">${['👨','👩','🧑','👨‍🦱','👩‍🦰'][i%5]}</div>${d.name}</div></td>
      <td>${d.vehicle}</td>
      <td><span style="color:var(--accent);">★</span> ${d.rating.toFixed(1)}</td>
      <td>${Math.floor(50+Math.random()*500)}</td>
      <td><span class="badge badge-success">Activo</span></td>
      <td><button class="btn btn-sm btn-secondary" onclick="viewDriver('D${1001+i}')">Ver</button> <button class="btn btn-sm btn-danger" onclick="banDriver('D${1001+i}')">Ban</button></td>
    </tr>
  `).join('');

  const riders = MockData.riders();
  document.getElementById('riders-tbody').innerHTML = riders.map(r => `
    <tr>
      <td>${r.id.toUpperCase()}</td>
      <td><div style="display:flex;align-items:center;gap:8px;"><div class="avatar-sm" style="width:28px;height:28px;font-size:11px;">${r.avatar}</div>${r.name}</div></td>
      <td>${r.phone}</td>
      <td><span style="color:var(--accent);">★</span> ${r.rating}</td>
      <td>${r.trips}</td>
      <td>${r.verified ? '<span class="badge badge-success">Verificado</span>' : '<span class="badge badge-warning">Pendiente</span>'}</td>
      <td>${r.rating < 3 ? '<button class="btn btn-sm btn-danger" onclick="banRider(\''+r.id+'\')">Ban</button>' : '<button class="btn btn-sm btn-secondary">Ver</button>'}</td>
    </tr>
  `).join('');

  document.getElementById('bans-list').innerHTML = `
    <div class="alert-item warning"><div class="ai-icon" style="background:#FEF3C7;color:#F59E0B;"><i class="fas fa-user-slash"></i></div><div class="ai-body"><h4>Ana Martínez — Suspensión temporal (7 días)</h4><p>Motivo: 3 reportes de mal comportamiento</p><div class="ai-meta"><span>Hace 2 horas</span><span>Resolución: 5 días restantes</span></div></div><button class="btn btn-sm btn-success" onclick="unbanUser('r3')">Reactivar</button></div>
    <div class="alert-item critical"><div class="ai-icon" style="background:#FEE2E2;color:var(--danger);"><i class="fas fa-user-slash"></i></div><div class="ai-body"><h4>Roberto Sánchez — Baneo definitivo</h4><p>Motivo: Calificación consistentemente baja (2.5★) + acoso reportado</p><div class="ai-meta"><span>Hace 1 día</span><span>Permanente</span></div></div></div>
  `;
}

function showUserTab(tab) {
  ['drivers','riders','bans'].forEach(t => {
    document.getElementById('tab-'+t).style.display = t===tab ? 'block' : 'none';
  });
}

function banDriver(id) { if(confirm('¿Suspender al conductor '+id+'?')) alert('Conductor '+id+' suspendido temporalmente.'); }
function banRider(id) { if(confirm('¿Suspender al pasajero?')) alert('Pasajero suspendido.'); }
function unbanUser(id) { if(confirm('¿Reactivar usuario?')) alert('Usuario reactivado exitosamente.'); }
function viewDriver(id) { alert('Perfil del conductor '+id+'\n\nDocumentos: Aprobados\nCalificación: 4.5★\nViajes: 245\nEstado: Activo'); }

// ===== FLEETS =====
function populateFleets() {
  const fleets = [
    { name:'Flotilla del Sur', owner:'Miguel Hernández', cars:8, drivers:12, status:'active' },
    { name:'AutoClub CDMX', owner:'Patricia Ruiz', cars:15, drivers:20, status:'active' },
    { name:'Transportes Unidos', owner:'Fernando Díaz', cars:5, drivers:5, status:'pending' }
  ];
  document.getElementById('fleets-list').innerHTML = fleets.map(f => `
    <div class="card" style="margin-bottom:10px; display:flex; align-items:center; gap:14px;">
      <div style="width:40px;height:40px;border-radius:10px;background:var(--primary-100);display:flex;align-items:center;justify-content:center;color:var(--primary);font-size:18px;"><i class="fas fa-car-side"></i></div>
      <div style="flex:1;"><h4 style="font-size:14px;font-weight:700;">${f.name}</h4><p style="font-size:12px;color:var(--text-secondary);">Socio: ${f.owner} · ${f.cars} autos · ${f.drivers} conductores</p></div>
      <span class="badge ${f.status==='active'?'badge-success':'badge-warning'}">${f.status==='active'?'Activo':'Pendiente'}</span>
      <button class="btn btn-sm btn-secondary">Gestionar</button>
    </div>
  `).join('');
}
function addFleet() { alert('Formulario para registrar nuevo Socio No Conductor\n\n• Nombre del socio\n• RFC\n• Contrato\n• Lista de vehículos\n• Conductores asignados'); }

// ===== DOCUMENTS =====
function populateDocuments() {
  const docs = MockData.driverDocuments();
  document.getElementById('docs-list').innerHTML = docs.map(d => {
    const statusClass = d.status === 'approved' ? 'badge-success' : d.status === 'rejected' ? 'badge-danger' : 'badge-warning';
    const statusLabel = d.status === 'approved' ? 'Aprobado' : d.status === 'rejected' ? 'Rechazado' : 'Pendiente';
    const docNames = { licencia:'Licencia de conducir', antecedentes:'Antecedentes penales', tarjeta_circulacion:'Tarjeta de circulación', seguro:'Póliza de seguro' };
    return `<div class="alert-item ${d.status==='pending'?'warning':'info'}">
      <div class="ai-icon" style="background:${d.status==='approved'?'#D1FAE5':d.status==='rejected'?'#FEE2E2':'#FEF3C7'};color:${d.status==='approved'?'var(--success)':d.status==='rejected'?'var(--danger)':'var(--warning)'};"><i class="fas fa-file-alt"></i></div>
      <div class="ai-body"><h4>${d.name} — ${docNames[d.doc]}</h4><p>Subido: ${d.uploaded}</p></div>
      <span class="badge ${statusClass}">${statusLabel}</span>
      ${d.status==='pending'?`<button class="btn btn-sm btn-success" onclick="approveDoc('${d.id}')">Aprobar</button><button class="btn btn-sm btn-danger" onclick="rejectDoc('${d.id}')">Rechazar</button>`:''}
    </div>`;
  }).join('');
}
function approveDoc(id) { alert('✅ Documento aprobado'); populateDocuments(); }
function rejectDoc(id) { const reason = prompt('Motivo del rechazo:'); if(reason) alert('❌ Documento rechazado: '+reason); }

// ===== SURGE PRICING =====
function populateSurgeZones() {
  const zones = MockData.surgeZones();
  document.getElementById('surge-zones-list').innerHTML = zones.map(z => `
    <div class="surge-zone-card">
      <div class="szc-color" style="background:${z.color};"></div>
      <div class="szc-info"><h4>${z.name}</h4><p>Solicitudes: ${z.requests} · Conductores: ${z.drivers} · Ratio: ${(z.requests/Math.max(z.drivers,1)).toFixed(1)}</p></div>
      <div class="szc-mult">×${z.multiplier}</div>
      <button class="btn btn-sm btn-ghost" onclick="editSurge('${z.id}')">Editar</button>
    </div>
  `).join('');
}
function addSurgeZone() { alert('Nueva zona de surge configurada\n\nSe activará cuando el ratio demanda/oferta supere el umbral.'); }
function editSurge(id) { alert('Editar zona: ' + id + '\n\nModificar multiplicador, horarios, geocerca.'); }

// ===== COMMISSIONS =====
function saveCommissions() { alert('✅ Configuración de comisiones guardada\n\nSe aplicará a los nuevos viajes.'); }
function dispersePayments() {
  if(confirm('¿Ejecutar dispersión bancaria de pagos?\n\nSe transferirán los fondos acumulados a las cuentas de los conductores.')) {
    alert('✅ Dispersión ejecutada\n\n$234,000 MXN transferidos a 891 conductores.\nTiempo estimado: 2-4 horas hábiles.');
  }
}

// ===== INCENTIVES ADMIN =====
function populateAdminIncentives() {
  const incentives = MockData.incentives();
  document.getElementById('admin-incentives-list').innerHTML = incentives.map(i => `
    <div class="card" style="margin-bottom:10px; display:flex; align-items:center; gap:14px;">
      <div style="width:40px;height:40px;border-radius:10px;background:var(--primary-100);display:flex;align-items:center;justify-content:center;font-size:18px;">${i.active?'🔥':'✅'}</div>
      <div style="flex:1;"><h4 style="font-size:13px;font-weight:700;">${i.title}</h4><p style="font-size:11px;color:var(--text-secondary);">Bono: $${i.bonus} · Meta: ${i.target} viajes · Deadline: ${i.deadline}</p></div>
      <span class="badge ${i.active?'badge-primary':'badge-success'}">${i.active?'Activo':'Completado'}</span>
      <button class="btn btn-sm btn-ghost" onclick="editIncentive('${i.id}')">Editar</button>
    </div>
  `).join('');

  const promos = [
    { code:'MOVILIDAD50', discount:'50%', uses:1240, limit:5000, active:true },
    { code:'NUEVO2024', discount:'$30 MXN', uses:8900, limit:10000, active:true },
    { code:'VIP EXPRESS', discount:'20%', uses:500, limit:1000, active:false }
  ];
  document.getElementById('admin-promos-list').innerHTML = promos.map(p => `
    <div class="card" style="margin-bottom:8px; display:flex; align-items:center; gap:12px;">
      <div style="font-size:16px;">🎫</div>
      <div style="flex:1;"><h4 style="font-size:12px;font-weight:700;">${p.code}</h4><p style="font-size:10px;color:var(--text-secondary);">${p.discount} · ${p.uses}/${p.limit} usos</p></div>
      <span class="badge ${p.active?'badge-success':'badge-danger'}">${p.active?'Activo':'Expirado'}</span>
    </div>
  `).join('');
}
function createIncentive() { alert('Crear nuevo incentivo:\n\n• Tipo (viajes, zona, nocturno, semanal)\n• Meta\n• Bono en MXN\n• Fecha/hora inicio y fin\n• Zona aplicable'); }
function createPromo() { alert('Código promocional creado exitosamente'); }
function editIncentive(id) { alert('Editar incentivo: '+id); }

// ===== SOC =====
function populateSOC() {
  // TripCheck alerts
  document.getElementById('tripcheck-alerts').innerHTML = `
    <div class="alert-item critical">
      <div class="ai-icon" style="background:#FEE2E2;color:var(--danger);"><i class="fas fa-route"></i></div>
      <div class="ai-body">
        <h4>⚠️ Desvío inusual detectado — Viaje #4821</h4>
        <p>Conductor: Roberto M. · Desviación: 800m de la ruta planificada · 3 desvíos en 5 min</p>
        <div class="ai-meta"><span>Hace 2 minutos</span><span>Zona: Polanco</span></div>
      </div>
      <div class="ai-actions">
        <button class="btn btn-sm btn-danger" onclick="escalateAlert('4821')">Escalar</button>
        <button class="btn btn-sm btn-secondary" onclick="contactDriver('4821')">Contactar</button>
      </div>
    </div>
    <div class="alert-item warning">
      <div class="ai-icon" style="background:#FEF3C7;color:var(--warning);"><i class="fas fa-pause-circle"></i></div>
      <div class="ai-body">
        <h4>Parada prolongada — Viaje #4815</h4>
        <p>Conductor: Pedro G. · Detenido 4 min sin movimiento · Zona insegura</p>
        <div class="ai-meta"><span>Hace 5 minutos</span><span>Zona: Tepito</span></div>
      </div>
      <div class="ai-actions">
        <button class="btn btn-sm btn-secondary" onclick="contactDriver('4815')">Contactar</button>
      </div>
    </div>
  `;

  // SOS history
  document.getElementById('sos-history').innerHTML = `
    <div class="alert-item critical" style="animation:none;">
      <div class="ai-icon" style="background:#FEE2E2;color:var(--danger);"><i class="fas fa-exclamation-circle"></i></div>
      <div class="ai-body">
        <h4>SOS Viaje #4790 — Resuelto</h4>
        <p>Pasajera presionó botón SOS · Avería del vehículo · Autoridades no necesarias</p>
        <div class="ai-meta"><span>Hace 1 hora</span><span>Resolución: Falsa alarma</span></div>
      </div>
      <span class="badge badge-success">Resuelto</span>
    </div>
  `;

  // Show active SOS panel randomly
  if (Math.random() > 0.5) document.getElementById('sos-active-panel').style.display = 'block';
}

function callPolice() { alert('🚨 Llamada a autoridades locales iniciada\n\n911 CDMX — Enlace con policía de la zona'); }
function listenAudio() { alert('🎙️ Audio en vivo del vehículo activado\n\nEscuchando a través del micrófono del dispositivo del conductor...'); }
function resolveSOS() { if(confirm('¿Marcar alerta SOS como resuelta?')) { document.getElementById('sos-active-panel').style.display='none'; alert('✅ Alerta SOS resuelta'); } }
function escalateAlert(id) { alert('🚨 Alerta escalada a supervisor\n\nViaje #'+id+' — Se contactará al conductor de inmediato.'); }
function contactDriver(id) { alert('📞 Llamada enmascarada al conductor del viaje #'+id); }

// ===== TICKETS =====
function populateTickets() {
  const tickets = MockData.tickets();
  document.getElementById('tickets-list').innerHTML = tickets.map(t => {
    const typeNames = { cargo_incorrecto:'Cargo incorrecto', objeto_olvidado:'Objeto olvidado', accidente:'Accidente', mal_comportamiento:'Mal comportamiento' };
    const priClass = t.priority==='critical'?'danger':t.priority==='high'?'warning':t.priority==='medium'?'info':'primary';
    const statusClass = t.status==='open'?'badge-danger':t.status==='in_progress'?'badge-warning':'badge-success';
    const statusLabel = t.status==='open'?'Abierto':t.status==='in_progress'?'En progreso':'Resuelto';
    return `<div class="ticket-card">
      <div class="tc-header"><h4>Ticket ${t.id.toUpperCase()} — ${typeNames[t.type]}</h4><span class="badge badge-${priClass}">${t.priority}</span></div>
      <p style="font-size:12px; color:var(--text-secondary); margin-bottom:6px;">${t.description}</p>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:10px; color:var(--text-light);">${t.date} · ${t.rider||t.driver||''}</span>
        <div style="display:flex; gap:6px;">
          <span class="badge ${statusClass}">${statusLabel}</span>
          ${t.status!=='resolved'?`<button class="btn btn-sm btn-primary" onclick="updateTicket('${t.id}')">Atender</button>`:''}
        </div>
      </div>
    </div>`;
  }).join('');
}
function updateTicket(id) { alert('Atender ticket '+id+'\n\n• Asignar agente\n• Integrar llamada IP\n• Abrir chat enmascarado\n• Emitir reembolso'); }
function filterTickets(type) { populateTickets(); }

// ===== CITIES =====
function populateCities() {
  const cities = [
    { name:'CDMX', zones:['Polanco','Condesa','Roma Norte','Centro','Santa Fe','Del Valle'], categories:['express','comfort','taxi','moto','protect'], active:true },
    { name:'Guadalajara', zones:['Centro','Tlaquepaque','Zapopan'], categories:['express','comfort','taxi'], active:true },
    { name:'Monterrey', zones:['Centro','San Pedro','Cumbres'], categories:['express','comfort','taxi','moto'], active:true },
    { name:'Puebla', zones:['Centro','Cholula','Angelópolis'], categories:['express','taxi'], active:false },
    { name:'Tijuana', zones:['Centro','Zona Río'], categories:['express','taxi'], active:false }
  ];
  document.getElementById('cities-list').innerHTML = cities.map(c => `
    <div class="geofence-item">
      <div style="width:36px;height:36px;border-radius:10px;background:${c.active?'var(--primary-100)':'#F3F4F6'};display:flex;align-items:center;justify-content:center;font-size:16px;">📍</div>
      <div style="flex:1;">
        <h4 style="font-size:13px;font-weight:700;">${c.name}</h4>
        <p style="font-size:11px;color:var(--text-secondary);">Zonas: ${c.zones.join(', ')} · Categorías: ${c.categories.join(', ')}</p>
      </div>
      <span class="badge ${c.active?'badge-success':'badge-danger'}">${c.active?'Activa':'Inactiva'}</span>
      <div class="gi-toggle">
        <div class="toggle ${c.active?'active':''}" onclick="toggleCity(this, '${c.name}')"></div>
      </div>
    </div>
  `).join('');
}
function toggleCity(el, name) {
  el.classList.toggle('active');
  const isActive = el.classList.contains('active');
  alert(`Ciudad ${name}: ${isActive?'HABILITADA':'DESHABILITADA'}\n\nGeocerca virtual ${isActive?'activada':'desactivada'}`);
}

// ===== TRIPCHECK AI =====
let tripcheckInit = false;
function initTripCheck() {
  if (tripcheckInit) return;
  tripcheckInit = true;
  // TripCheck is mostly static HTML with live-looking data
  // Add real-time simulation: update risk level periodically
  setInterval(() => {
    const riskBar = document.querySelector('#page-tripcheck .sc-value[style*="success"]');
    if (riskBar) {
      const levels = [{text:'Bajo', color:'var(--success)'}, {text:'Medio', color:'var(--warning)'}, {text:'Alto', color:'var(--danger)'}];
      const idx = Math.random() > 0.7 ? (Math.random() > 0.5 ? 2 : 1) : 0;
      riskBar.textContent = levels[idx].text;
      riskBar.style.color = levels[idx].color;
    }
  }, 8000);
}

// ===== CHARGING EV =====
let chargingInit = false;
let chargingMap = null;
function initCharging() {
  if (chargingInit) return;
  chargingInit = true;

  // Chart: Utilization by zone
  const ctx = document.getElementById('chart-charging');
  if (ctx) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Polanco', 'Santa Fe', 'Centro', 'Aeropuerto', 'Interlomas', 'Condesa', 'Roma Norte', 'Del Valle'],
        datasets: [{
          label: 'Uso %',
          data: [87, 92, 65, 78, 45, 73, 68, 55],
          backgroundColor: ['#7C3AED', '#A78BFA', '#6D28D9', '#8B5CF6', '#C4B5FD', '#5B21B6', '#7C3AED', '#A78BFA'],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false } },
          y: { max: 100, grid: { color: 'rgba(0,0,0,.05)' }, ticks: { callback: v => v + '%' } }
        }
      }
    });
  }

  // Map: Charging stations in CDMX
  setTimeout(() => {
    const mapEl = document.getElementById('map-charging');
    if (mapEl && !chargingMap) {
      chargingMap = L.map('map-charging', { zoomControl: true }).setView([19.4326, -99.1332], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(chargingMap);
      const stations = [
        { lat: 19.433, lng: -99.200, name: 'ESC-001 Polanco', type: 'DC 150kW ×4', avail: '1 de 4' },
        { lat: 19.359, lng: -99.268, name: 'ESC-002 Santa Fe', type: 'DC 350kW ×2 + AC ×6', avail: '0 de 8' },
        { lat: 19.428, lng: -99.133, name: 'ESC-003 Centro', type: 'DC 50kW ×3', avail: '2 de 3' },
        { lat: 19.436, lng: -99.072, name: 'ESC-004 Aeropuerto', type: 'DC 150kW ×6', avail: '3 de 6' },
        { lat: 19.421, lng: -99.279, name: 'ESC-005 Interlomas', type: 'DC 350kW ×2', avail: '2 de 2' },
        { lat: 19.413, lng: -99.168, name: 'ESC-006 Condesa', type: 'DC 50kW ×2 + AC ×4', avail: '3 de 6' },
        { lat: 19.418, lng: -99.158, name: 'ESC-007 Roma Norte', type: 'DC 150kW ×3', avail: '1 de 3' },
        { lat: 19.383, lng: -99.158, name: 'ESC-008 Del Valle', type: 'AC ×8', avail: '5 de 8' }
      ];
      stations.forEach(s => {
        const color = s.avail.startsWith('0') ? '#EF4444' : '#10B981';
        L.marker([s.lat, s.lng], {
          icon: L.divIcon({
            className: '',
            html: `<div style="background:${color};width:18px;height:18px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-size:9px;font-weight:900;">⚡</span></div>`,
            iconSize: [18, 18], iconAnchor: [9, 9]
          })
        }).addTo(chargingMap).bindPopup(`<b>${s.name}</b><br>${s.type}<br>Disponible: ${s.avail}`);
      });
    }
  }, 300);
}

// ===== MAINTENANCE =====
let maintenanceInit = false;
function initMaintenance() {
  if (maintenanceInit) return;
  maintenanceInit = true;

  const ctx = document.getElementById('chart-maintenance');
  if (ctx) {
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Cambio de Aceite', 'Frenos', 'Alineación/Balanceo', 'Llantas', 'Diagnóstico EV', 'Filtros', 'Eléctrico', 'Suspensión'],
        datasets: [{
          data: [28, 18, 15, 12, 10, 8, 5, 4],
          backgroundColor: ['#7C3AED', '#A78BFA', '#6D28D9', '#8B5CF6', '#10B981', '#C4B5FD', '#5B21B6', '#F59E0B'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right', labels: { font: { size: 11 }, padding: 8 } }
        },
        cutout: '55%'
      }
    });
  }
}

// ===== FINANCING =====
let financingInit = false;
function initFinancing() {
  if (financingInit) return;
  financingInit = true;

  const ctx = document.getElementById('chart-financing');
  if (ctx) {
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Auto Ejecutivo', 'EV Green Finance', 'Flota Empresarial', 'Moto Financia', 'Refinanciamiento'],
        datasets: [{
          data: [42, 25, 18, 10, 5],
          backgroundColor: ['#7C3AED', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right', labels: { font: { size: 11 }, padding: 8 } }
        },
        cutout: '55%'
      }
    });
  }
}

// ===== SMART CITIES =====
let smartcityInit = false;
function initSmartCity() {
  if (smartcityInit) return;
  smartcityInit = true;

  const ctx = document.getElementById('chart-smartcity');
  if (ctx) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Metro', 'Metrobús', 'Ecobici', 'Tren Ligero', 'RTP', 'Trolebús', 'Cablebús'],
        datasets: [
          {
            label: 'Conexiones/día',
            data: [42000, 28000, 15000, 8500, 6200, 4100, 3200],
            backgroundColor: '#7C3AED',
            borderRadius: 4
          },
          {
            label: 'Conversión a app',
            data: [18000, 12000, 11000, 4300, 2800, 1900, 2100],
            backgroundColor: '#A78BFA',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { callback: v => (v/1000) + 'K' } }
        }
      }
    });
  }
}

// ===== TRAFFIC AI =====
let trafficAIInit = false;
function initTrafficAI() {
  if (trafficAIInit) return;
  trafficAIInit = true;

  const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
  const flow = [12,8,5,3,4,15,45,78,82,65,48,42,50,55,48,52,68,85,72,45,30,22,18,14];
  const predicted = flow.map(v => v + Math.floor((Math.random() - 0.3) * 8));

  const ctx = document.getElementById('chart-traffic');
  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: hours,
        datasets: [
          {
            label: 'Flujo Real',
            data: flow,
            borderColor: '#7C3AED',
            backgroundColor: 'rgba(124,58,237,.15)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Predicción IA',
            data: predicted,
            borderColor: '#10B981',
            backgroundColor: 'rgba(16,185,129,.1)',
            fill: true,
            tension: 0.4,
            borderDash: [5, 5]
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(0,0,0,.05)' }, ticks: { callback: v => v + 'K veh/h' } }
        }
      }
    });
  }
}

// ===== PROPRIETARY MAPPING =====
let mappingInit = false;
let proprietaryMap = null;
function initMapping() {
  if (mappingInit) return;
  mappingInit = true;

  setTimeout(() => {
    const mapEl = document.getElementById('map-proprietary');
    if (mapEl && !proprietaryMap) {
      proprietaryMap = L.map('map-proprietary', { zoomControl: true }).setView([19.4326, -99.1332], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© Movilidad Maps + OSM' }).addTo(proprietaryMap);

      // Show coverage polygons (simulated zones)
      const zones = [
        { lat: 19.4326, lng: -99.1332, name: 'Centro Histórico', km: 12, accuracy: '0.3m', updates: '8.2K/día' },
        { lat: 19.433, lng: -99.200, name: 'Polanco', km: 8, accuracy: '0.5m', updates: '5.4K/día' },
        { lat: 19.413, lng: -99.168, name: 'Condesa/Roma', km: 6, accuracy: '0.4m', updates: '4.1K/día' },
        { lat: 19.359, lng: -99.268, name: 'Santa Fe', km: 10, accuracy: '0.8m', updates: '2.8K/día' },
        { lat: 19.436, lng: -99.072, name: 'Aeropuerto', km: 5, accuracy: '0.2m', updates: '6.9K/día' }
      ];

      zones.forEach(z => {
        L.circle([z.lat, z.lng], {
          radius: z.km * 500,
          color: '#7C3AED',
          fillColor: '#7C3AED',
          fillOpacity: 0.15,
          weight: 2
        }).addTo(proprietaryMap).bindPopup(
          `<b>🗺️ ${z.name}</b><br>Área: ${z.km} km²<br>Precisión: ${z.accuracy}<br>Actualizaciones: ${z.updates}<br><em style="color:#7C3AED;">Mapa Propietario Movilidad</em>`
        );
      });

      // Add "mapped road" polylines to show proprietary data
      const roads = [
        [[19.435, -99.140], [19.432, -99.135], [19.430, -99.130]],
        [[19.440, -99.145], [19.435, -99.145], [19.430, -99.145]],
        [[19.420, -99.160], [19.418, -99.155], [19.416, -99.150]],
        [[19.438, -99.120], [19.436, -99.110], [19.434, -99.100]]
      ];
      roads.forEach(r => {
        L.polyline(r, { color: '#7C3AED', weight: 3, opacity: 0.6 }).addTo(proprietaryMap);
      });
    }
  }, 300);
}

// ===== ROBOTAXI =====
let robotaxiInit = false;
function initRobotaxi() {
  if (robotaxiInit) return;
  robotaxiInit = true;

  const days = Array.from({length: 30}, (_, i) => `Día ${i+1}`);
  const autonomousTrips = days.map(() => Math.floor(200 + Math.random() * 150));
  const humanInterventions = days.map(() => Math.floor(Math.random() * 5));

  const ctx = document.getElementById('chart-robotaxi');
  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Viajes Autónomos',
            data: autonomousTrips,
            borderColor: '#7C3AED',
            backgroundColor: 'rgba(124,58,237,.15)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Intervenciones Humanas',
            data: humanInterventions,
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239,68,68,.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
        scales: {
          x: { grid: { display: false } },
          y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(0,0,0,.05)' }, title: { display: true, text: 'Viajes' } },
          y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Intervenciones' }, min: 0, max: 10 }
        }
      }
    });
  }
}

// ===== HYBRID DISPATCH =====
let hybridDispatchInit = false;
function initHybridDispatch() {
  if (hybridDispatchInit) return;
  hybridDispatchInit = true;

  const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
  const humanAssigned = [15,8,5,3,5,20,55,85,90,70,52,48,55,58,50,55,72,90,78,50,35,25,20,18];
  const autoAssigned = [2,1,1,0,1,3,8,15,18,12,9,8,10,11,9,10,15,20,16,8,5,4,3,3];

  const ctx = document.getElementById('chart-dispatch');
  if (ctx) {
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: hours,
        datasets: [
          {
            label: 'Chofer Humano',
            data: humanAssigned,
            backgroundColor: '#7C3AED',
            borderRadius: 4
          },
          {
            label: 'Robotaxi',
            data: autoAssigned,
            backgroundColor: '#10B981',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, grid: { color: 'rgba(0,0,0,.05)' }, ticks: { callback: v => v + ' viajes' } }
        }
      }
    });
  }
}

// ===== PHASE 8: REAL-TIME DASHBOARD UPDATES =====
function initRealTimeUpdates() {
  // Simulate WebSocket-style real-time stat updates every 5 seconds
  setInterval(() => {
    // Update dashboard stat values with slight random changes
    const statValues = document.querySelectorAll('#page-dashboard .sc-value');
    if (statValues.length >= 4) {
      // Drivers online: fluctuate around 1247
      const drivers = 1240 + Math.floor(Math.random() * 20);
      statValues[0].textContent = drivers.toLocaleString();
      // Active rides: fluctuate around 3891
      const rides = 3880 + Math.floor(Math.random() * 30);
      statValues[1].textContent = rides.toLocaleString();
      // Revenue: increment slowly
      const revBase = 847000 + Math.floor(Math.random() * 5000);
      statValues[2].textContent = '$' + Math.floor(revBase / 1000) + 'K';
      // SOS alerts: keep at 1-3
      const sos = 1 + Math.floor(Math.random() * 3);
      statValues[3].textContent = sos;
    }
    // Add live activity pulse effect to the page title area
    const pageTitle = document.getElementById('page-title');
    if (pageTitle && pageTitle.textContent === 'Dashboard') {
      const existing = document.getElementById('live-pulse');
      if (!existing) {
        const pulse = document.createElement('span');
        pulse.id = 'live-pulse';
        pulse.innerHTML = ' <span class="live-dot" style="display:inline-block;"></span> <span style="font-size:11px;color:var(--success);font-weight:500;">LIVE</span>';
        pageTitle.appendChild(pulse);
      }
    }
  }, 5000);
}

// ===== RIDE DETAIL MODAL =====
function showRideDetail(rideId) {
  // Generate mock ride detail
  const ride = {
    id: rideId || 'RIDE-' + Math.floor(Math.random() * 90000 + 10000),
    passenger: 'María García',
    driver: 'Roberto Martínez',
    vehicle: 'Nissan Versa Blanco · M-456 ABC',
    pickup: 'Av. Presidente Masaryk 123, Polanco',
    dropoff: 'Av. Michoacán 45, Condesa',
    status: 'Completado',
    fare: '$92.00',
    distance: '5.2 km',
    duration: '12 min',
    surge: '×1.5',
    payment: 'Visa •••• 4242',
    commission: '-$13.80 (15%)',
    driverEarning: '$78.20',
    category: 'Express',
    rating: '4.8 ★',
    timeline: [
      { time: '14:30:15', event: 'Viaje solicitado', icon: 'fa-mobile-alt', color: 'var(--primary)' },
      { time: '14:30:45', event: 'Conductor asignado — Roberto M.', icon: 'fa-user-check', color: 'var(--success)' },
      { time: '14:33:20', event: 'Conductor llegó al punto de recogida', icon: 'fa-map-marker-alt', color: '#3B82F6' },
      { time: '14:34:05', event: 'Pasajero abordó — Viaje iniciado', icon: 'fa-car', color: 'var(--primary)' },
      { time: '14:36:12', event: 'TripCheck: Velocidad normal (42 km/h)', icon: 'fa-brain', color: '#10B981' },
      { time: '14:40:30', event: 'TripCheck: Desvío leve — Tráfico verificado', icon: 'fa-brain', color: '#F59E0B' },
      { time: '14:44:18', event: 'Llegada al destino', icon: 'fa-flag-checkered', color: 'var(--success)' },
      { time: '14:44:35', event: 'Pago procesado — Visa 4242', icon: 'fa-credit-card', color: 'var(--success)' },
      { time: '14:45:00', event: 'Calificación: 4.8 ★', icon: 'fa-star', color: '#F59E0B' }
    ]
  };

  const overlay = document.createElement('div');
  overlay.id = 'ride-detail-overlay';
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;';
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

  overlay.innerHTML = `
    <div style="background:var(--surface);border-radius:16px;width:90%;max-width:600px;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3);">
      <div style="padding:20px 24px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:12px;">
        <h3 style="font-size:16px;font-weight:800;flex:1;">🚗 ${ride.id}</h3>
        <span style="background:var(--success);color:#fff;padding:4px 10px;border-radius:8px;font-size:10px;font-weight:700;">${ride.status}</span>
        <i class="fas fa-times" style="cursor:pointer;font-size:16px;opacity:.5;" onclick="document.getElementById('ride-detail-overlay').remove()"></i>
      </div>
      <div style="padding:20px 24px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
          <div style="background:var(--primary-50);border-radius:10px;padding:12px;">
            <div style="font-size:10px;color:var(--text-light);">Pasajero</div>
            <div style="font-size:13px;font-weight:700;">${ride.passenger}</div>
          </div>
          <div style="background:var(--primary-50);border-radius:10px;padding:12px;">
            <div style="font-size:10px;color:var(--text-light);">Conductor</div>
            <div style="font-size:13px;font-weight:700;">${ride.driver}</div>
          </div>
        </div>
        <div style="background:#F5F3FF;border-radius:10px;padding:12px;margin-bottom:16px;font-size:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <div style="width:10px;height:10px;border-radius:50%;background:var(--success);"></div>
            <span>${ride.pickup}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:10px;height:10px;border-radius:50%;background:var(--danger);"></div>
            <span>${ride.dropoff}</span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;text-align:center;">
          <div><div style="font-size:18px;font-weight:800;color:var(--primary);">${ride.fare}</div><div style="font-size:9px;color:var(--text-light);">Tarifa</div></div>
          <div><div style="font-size:18px;font-weight:800;">${ride.distance}</div><div style="font-size:9px;color:var(--text-light);">Distancia</div></div>
          <div><div style="font-size:18px;font-weight:800;">${ride.duration}</div><div style="font-size:9px;color:var(--text-light);">Duración</div></div>
          <div><div style="font-size:18px;font-weight:800;color:var(--danger);">${ride.surge}</div><div style="font-size:9px;color:var(--text-light);">Surge</div></div>
        </div>
        <div style="background:#FEF3C7;border-radius:10px;padding:12px;margin-bottom:16px;font-size:11px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Pago pasajero</span><span style="font-weight:700;">${ride.fare}</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Comisión (15%)</span><span style="font-weight:700;color:var(--danger);">${ride.commission}</span></div>
          <div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:4px;"><span>Ganancia conductor</span><span style="font-weight:800;color:var(--success);">${ride.driverEarning}</span></div>
        </div>
        <h4 style="font-size:13px;font-weight:700;margin-bottom:10px;">📋 Timeline del Viaje</h4>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${ride.timeline.map(t => `
            <div style="display:flex;align-items:flex-start;gap:10px;font-size:11px;">
              <div style="min-width:24px;height:24px;background:${t.color}15;border-radius:50%;display:flex;align-items:center;justify-content:center;"><i class="fas ${t.icon}" style="color:${t.color};font-size:10px;"></i></div>
              <div style="flex:1;"><div style="font-weight:600;">${t.event}</div><div style="color:var(--text-light);font-size:9px;">${t.time}</div></div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
}

// ===== BULK OPERATIONS =====
function bulkApproveDrivers() {
  const checkboxes = document.querySelectorAll('#drivers-tbody input[type="checkbox"]:checked');
  if (checkboxes.length === 0) { alert('Selecciona al menos un conductor'); return; }
  const count = checkboxes.length;
  if (confirm(`¿Aprobar masivamente ${count} conductores?`)) {
    checkboxes.forEach(cb => {
      const row = cb.closest('tr');
      if (row) {
        const statusCell = row.querySelector('td:nth-child(6)');
        if (statusCell) statusCell.innerHTML = '<span class="badge badge-success">Activo</span>';
      }
    });
    alert(`✅ ${count} conductores aprobados exitosamente`);
  }
}

function bulkVerifyDocuments() {
  const checkboxes = document.querySelectorAll('#docs-list input[type="checkbox"]:checked');
  if (checkboxes.length === 0) { alert('Selecciona al menos un documento'); return; }
  const count = checkboxes.length;
  if (confirm(`¿Verificar masivamente ${count} documentos?`)) {
    checkboxes.forEach(cb => {
      const card = cb.closest('.doc-card, [class*="card"]');
      if (card) {
        const badge = card.querySelector('.badge');
        if (badge) { badge.textContent = 'Verificado'; badge.className = 'badge badge-success'; }
      }
    });
    alert(`✅ ${count} documentos verificados exitosamente`);
  }
}

function addBulkCheckboxes() {
  // Add checkboxes to drivers table header
  const th = document.querySelector('#drivers-table thead tr th:first-child');
  if (th && !th.querySelector('input')) {
    th.innerHTML = '<input type="checkbox" onclick="toggleAllDrivers(this)"> ID';
  }
  // Add checkboxes to each row
  document.querySelectorAll('#drivers-tbody tr').forEach(row => {
    const firstTd = row.querySelector('td:first-child');
    if (firstTd && !firstTd.querySelector('input')) {
      const id = firstTd.textContent.trim();
      firstTd.innerHTML = `<input type="checkbox" value="${id}"> ${id}`;
    }
  });
  // Add bulk action button if not exists
  const header = document.querySelector('#page-users .ut-header');
  if (header && !document.getElementById('bulk-approve-btn')) {
    const btn = document.createElement('button');
    btn.id = 'bulk-approve-btn';
    btn.className = 'btn btn-success btn-sm';
    btn.style.marginLeft = '8px';
    btn.innerHTML = '<i class="fas fa-check-double"></i> Aprobar seleccionados';
    btn.onclick = bulkApproveDrivers;
    header.appendChild(btn);
  }
}

function toggleAllDrivers(master) {
  document.querySelectorAll('#drivers-tbody input[type="checkbox"]').forEach(cb => {
    cb.checked = master.checked;
  });
}

// ===== EXPORT / REPORT GENERATION =====
function exportToCSV(dataType) {
  let csv = '';
  let filename = '';

  if (dataType === 'rides') {
    csv = 'ID,Pasajero,Conductor,Origen,Destino,Tarifa,Distancia,Duración,Categoría,Surge,Estado,Fecha\n';
    for (let i = 0; i < 50; i++) {
      const cats = ['Express','Comfort','Premier','Moto','Intercity'];
      const statuses = ['Completado','En curso','Cancelado','Solicitado'];
      csv += `RIDE-${10000+i},Pasajero ${i+1},Conductor ${i+1},"Dir ${i} Polanco","Dir ${i} Condesa",$${(50+Math.floor(Math.random()*200)).toFixed(2)},${(2+Math.random()*15).toFixed(1)}km,${(5+Math.floor(Math.random()*30))}min,${cats[i%5]},×${(1+Math.random()*2).toFixed(1)},${statuses[i%4]},2024-06-${String(13).padStart(2,'0')}\n`;
    }
    filename = 'viajes_export.csv';
  } else if (dataType === 'drivers') {
    csv = 'ID,Nombre,Vehículo,Placa,Calificación,Viajes,Estado\n';
    for (let i = 0; i < 30; i++) {
      const statuses = ['Activo','Inactivo','Suspendido','Verificación'];
      csv += `DRV-${1000+i},Conductor ${i+1},Vehicle ${i},ABC-${100+i},${(3.5+Math.random()*1.5).toFixed(1)},${Math.floor(Math.random()*500)},${statuses[i%4]}\n`;
    }
    filename = 'conductores_export.csv';
  } else if (dataType === 'revenue') {
    csv = 'Fecha,Viajes,Ingresos,Comisiones,Ganancia Neta\n';
    for (let i = 1; i <= 30; i++) {
      const rides = Math.floor(2000 + Math.random() * 3000);
      const rev = rides * 85;
      const comm = rev * 0.15;
      csv += `2024-06-${String(i).padStart(2,'0')},${rides},$${rev},$${Math.floor(comm)},$${Math.floor(rev-comm)}\n`;
    }
    filename = 'ingresos_export.csv';
  }

  // Download
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function exportDashboardReport() {
  const report = `
MOVILIDAD — Reporte de Dashboard
Generado: ${new Date().toLocaleString('es-MX')}
========================================

CONDUCTORES EN LÍNEA: 1,247 (+12% vs ayer)
VIAJES ACTIVOS: 3,891 (+8% vs ayer)
INGRESOS HOY: $847K (+15%)
ALERTAS SOS: 2

VIAJES POR HORA (últimas 24h):
00:00 - 89 | 01:00 - 45 | 02:00 - 23 | 03:00 - 15
04:00 - 28 | 05:00 - 67 | 06:00 - 234 | 07:00 - 567
08:00 - 890 | 09:00 - 1200 | 10:00 - 1450 | 11:00 - 1380
12:00 - 1100 | 13:00 - 980 | 14:00 - 1050 | 15:00 - 1230
16:00 - 1450 | 17:00 - 1680 | 18:00 - 1890 | 19:00 - 1560
20:00 - 1230 | 21:00 - 890 | 22:00 - 560 | 23:00 - 230

CATEGORÍAS:
Express: 45% | Comfort: 18% | Taxi: 12% | Moto: 10% | Protect: 8% | Share: 7%

SURGE PRICING ACTIVO:
Polanco ×2.5 | Santa Fe ×2.0 | Condesa ×1.8 | Centro ×1.5

========================================
By TheFirm69 Systems — Movilidad Platform
  `.trim();

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'dashboard_report.txt'; a.click();
  URL.revokeObjectURL(url);
}

// ===== COMMISSION CONFIGURATION PER CATEGORY =====
const commissionConfig = {
  Express: { rate: 15, minFare: 30, maxCap: 50 },
  Comfort: { rate: 18, minFare: 45, maxCap: 80 },
  Premier: { rate: 20, minFare: 80, maxCap: 150 },
  Moto: { rate: 12, minFare: 20, maxCap: 35 },
  Intercity: { rate: 10, minFare: 200, maxCap: 500 },
  Taxi: { rate: 8, minFare: 25, maxCap: 40 }
};

function initCommissionsPage() {
  const container = document.getElementById('commissions-list');
  if (!container) return;
  container.innerHTML = '';

  Object.entries(commissionConfig).forEach(([cat, config]) => {
    const catColors = { Express: '#7C3AED', Comfort: '#EC4899', Premier: '#F59E0B', Moto: '#10B981', Intercity: '#3B82F6', Taxi: '#6B7280' };
    const color = catColors[cat] || '#7C3AED';

    const card = document.createElement('div');
    card.style.cssText = 'background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:10px;';
    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
        <div style="width:12px;height:12px;border-radius:50%;background:${color};"></div>
        <h4 style="font-size:14px;font-weight:700;flex:1;">${cat}</h4>
        <span style="font-size:20px;font-weight:900;color:${color};">${config.rate}%</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
        <div>
          <label style="font-size:10px;color:var(--text-light);display:block;margin-bottom:2px;">Comisión %</label>
          <input type="number" value="${config.rate}" min="0" max="40" step="1"
            style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;"
            onchange="commissionConfig['${cat}'].rate=Number(this.value)">
        </div>
        <div>
          <label style="font-size:10px;color:var(--text-light);display:block;margin-bottom:2px;">Tarifa mínima</label>
          <input type="number" value="${config.minFare}" min="0"
            style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;"
            onchange="commissionConfig['${cat}'].minFare=Number(this.value)">
        </div>
        <div>
          <label style="font-size:10px;color:var(--text-light);display:block;margin-bottom:2px;">Cap máximo</label>
          <input type="number" value="${config.maxCap}" min="0"
            style="width:100%;padding:6px 8px;border:1px solid var(--border);border-radius:6px;font-size:12px;"
            onchange="commissionConfig['${cat}'].maxCap=Number(this.value)">
        </div>
      </div>
      <button class="btn btn-sm btn-primary" style="margin-top:8px;width:100%;" onclick="saveCommissionConfig('${cat}')">
        <i class="fas fa-save"></i> Guardar ${cat}
      </button>
    `;
    container.appendChild(card);
  });
}

function saveCommissionConfig(category) {
  const config = commissionConfig[category];
  alert(`✅ Configuración guardada para ${category}\n\nComisión: ${config.rate}%\nTarifa mínima: $${config.minFare}\nCap máximo: $${config.maxCap}`);
}

// ===== ROBOTAXI REMOTE MONITORING CONSOLE =====
let robotaxiConsoleInit = false;

function initRobotaxiConsole() {
  if (robotaxiConsoleInit) return;
  robotaxiConsoleInit = true;

  const container = document.getElementById('robotaxi-console');
  if (!container) return;

  const fleet = [
    { id: 'RT-001', model: 'BYD Dolphin Auto', battery: 82, status: 'En viaje', passenger: 'Ana R.', location: 'Polanco', speed: 38 },
    { id: 'RT-002', model: 'JAC E10X Auto', battery: 56, status: 'Disponible', passenger: '-', location: 'Santa Fe', speed: 0 },
    { id: 'RT-003', model: 'MG4 Auto', battery: 91, status: 'Cargando', passenger: '-', location: 'ESC-001', speed: 0 },
    { id: 'RT-004', model: 'BYD Dolphin Auto', battery: 34, status: 'En viaje', passenger: 'Carlos M.', location: 'Condesa', speed: 42 },
    { id: 'RT-005', model: 'JAC E10X Auto', battery: 15, status: 'Batería baja', passenger: '-', location: 'Centro', speed: 12 },
    { id: 'RT-006', model: 'MG4 Auto', battery: 67, status: 'En viaje', passenger: 'Luis P.', location: 'Roma Norte', speed: 35 }
  ];

  container.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <h3 style="font-size:14px;font-weight:700;">🤖 Consola de Monitoreo Robotaxi</h3>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-sm btn-primary" onclick="refreshRobotaxiConsole()"><i class="fas fa-sync-alt"></i> Refresh</button>
        <button class="btn btn-sm btn-danger" onclick="emergencyStopAllRobotaxis()"><i class="fas fa-stop-circle"></i> Emergency Stop</button>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px;">
      <div style="background:var(--primary-50);border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:24px;font-weight:900;color:var(--primary);">${fleet.length}</div>
        <div style="font-size:10px;color:var(--text-light);">Total Fleet</div>
      </div>
      <div style="background:#D1FAE5;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:24px;font-weight:900;color:var(--success);">${fleet.filter(f => f.status === 'En viaje').length}</div>
        <div style="font-size:10px;color:var(--text-light);">En Viaje</div>
      </div>
      <div style="background:#FEF3C7;border-radius:10px;padding:12px;text-align:center;">
        <div style="font-size:24px;font-weight:900;color:#B45309;">${fleet.filter(f => f.status === 'Cargando' || f.status === 'Batería baja').length}</div>
        <div style="font-size:10px;color:var(--text-light);">Atención</div>
      </div>
    </div>
    <table class="data-table" style="font-size:11px;">
      <thead><tr><th>ID</th><th>Modelo</th><th>Batería</th><th>Estado</th><th>Pasajero</th><th>Ubicación</th><th>Velocidad</th><th>Acciones</th></tr></thead>
      <tbody>
        ${fleet.map(f => {
          const batColor = f.battery > 60 ? 'var(--success)' : f.battery > 30 ? '#F59E0B' : 'var(--danger)';
          const statusBadge = f.status === 'En viaje' ? 'badge-primary' : f.status === 'Disponible' ? 'badge-success' : f.status === 'Cargando' ? 'badge-warning' : 'badge-danger';
          return `<tr>
            <td style="font-weight:700;">${f.id}</td>
            <td>${f.model}</td>
            <td><span style="color:${batColor};font-weight:700;">${f.battery}%</span></td>
            <td><span class="badge ${statusBadge}">${f.status}</span></td>
            <td>${f.passenger}</td>
            <td>${f.location}</td>
            <td>${f.speed} km/h</td>
            <td>
              <button class="btn btn-sm btn-secondary" onclick="remoteControlRobotaxi('${f.id}')" style="padding:2px 6px;font-size:9px;">Control</button>
              <button class="btn btn-sm btn-danger" onclick="emergencyStopRobotaxi('${f.id}')" style="padding:2px 6px;font-size:9px;">STOP</button>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  `;
}

function remoteControlRobotaxi(id) {
  alert(`🎮 Control remoto iniciado para ${id}\n\n• Cámara frontal activada\n• Velocidad limitada a 25 km/h\n• Intervención humana habilitada\n• Telemetría en tiempo real`);
}

function emergencyStopRobotaxi(id) {
  if (confirm(`🚨 ¿Detener emergencia ${id}?`)) {
    alert(`✅ ${id} detenido exitosamente\n• Vehículo detenido en posición segura\n• Pasajero notificado\n• Equipo de recuperación despachado`);
  }
}

function emergencyStopAllRobotaxis() {
  if (confirm('🚨 ¿DETENER TODOS los robotaxis? Esto es una emergencia global.')) {
    alert('✅ Protocolo de emergencia ejecutado\n\n• 6 robotaxis detenidos\n• Todos los pasajeros notificados\n• Equipos de recuperación despachados\n• SOC alertado');
  }
}

function refreshRobotaxiConsole() {
  robotaxiConsoleInit = false;
  initRobotaxiConsole();
}

// ===== GEMINI AI TRIPCHECK =====
async function testGeminiFromTripCheck() {
  const statusEl = document.getElementById('gemini-page-status');
  if (statusEl) statusEl.innerHTML = '<span class="spinner" style="width:12px;height:12px;border-width:2px;display:inline-block;vertical-align:middle;"></span> Probando...';
  
  // Client-side Gemini check using localStorage configs
  try {
    const saved = localStorage.getItem('movilidad_api_configs');
    const configs = saved ? JSON.parse(saved) : null;
    const gemini = configs ? configs.apis.find(a => a.id === 'gemini-ai') : null;
    const hasKey = gemini && gemini.credentials.apiKey && gemini.credentials.apiKey.value;
    
    setTimeout(() => {
      if (hasKey) {
        if (statusEl) { statusEl.style.background = 'rgba(16,185,129,.2)'; statusEl.style.color = '#10B981'; statusEl.textContent = '✅ GEMINI CONECTADO'; }
        alert('🧠 Gemini AI configurado!\n\nModelo: ' + (gemini.credentials.model?.value || 'gemini-pro') + '\nTripCheck IA listo para supervisar viajes.\n\nNota: Para probar la conexión real, necesitas el servidor backend.');
      } else {
        if (statusEl) { statusEl.style.background = 'rgba(245,158,11,.2)'; statusEl.style.color = '#F59E0B'; statusEl.textContent = '⚠️ FALTA API KEY'; }
        alert('⚠️ Gemini AI no tiene API Key configurada.\n\nVe a API Config → Gemini AI y agrega tu API Key de Google AI Studio.');
      }
    }, 1000);
  } catch (e) {
    if (statusEl) { statusEl.style.background = 'rgba(239,68,68,.2)'; statusEl.style.color = '#EF4444'; statusEl.textContent = '❌ ERROR'; }
  }
}

async function loadGeminiTripCheckStatus() {
  const statusEl = document.getElementById('gemini-page-status');
  if (!statusEl) return;
  // Client-side check
  try {
    const saved = localStorage.getItem('movilidad_api_configs');
    const configs = saved ? JSON.parse(saved) : null;
    const gemini = configs ? configs.apis.find(a => a.id === 'gemini-ai') : null;
    const hasKey = gemini && gemini.credentials.apiKey && gemini.credentials.apiKey.value;
    if (hasKey) {
      statusEl.style.background = 'rgba(16,185,129,.2)'; statusEl.style.color = '#10B981'; statusEl.textContent = '✅ API KEY CONFIGURADA';
    } else {
      statusEl.style.background = 'rgba(245,158,11,.2)'; statusEl.style.color = '#F59E0B'; statusEl.textContent = '⚠️ FALTA API KEY';
    }
  } catch(e) { /* silently fail */ }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initDashboardCharts();
  initRealTimeUpdates();
});
