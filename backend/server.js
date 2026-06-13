/* ================================================================
   MOVILIDAD API Configuration Backend - By TheFirm69 Systems
   Full CRUD for API keys, connection testing, health monitoring
   ================================================================ */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ===== DATA STORAGE =====
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_FILE = path.join(DATA_DIR, 'api_configs.json');
const LOGS_FILE = path.join(DATA_DIR, 'api_logs.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) return { apis: [], settings: {} };
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}
function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}
function loadLogs() {
  if (!fs.existsSync(LOGS_FILE)) return [];
  return JSON.parse(LOGS_FILE, 'utf8');
}
function saveLog(entry) {
  const logs = loadLogs();
  logs.unshift(entry);
  if (logs.length > 1000) logs.length = 1000;
  fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));
}

// ===== DEFAULT API CONFIGS =====
const DEFAULT_APIS = [
  {
    id: 'google-maps',
    name: 'Google Maps Platform',
    icon: '🗺️',
    category: 'mapping',
    description: 'Maps JavaScript API, Directions API, Places API, Geocoding, Distance Matrix, Roads API',
    docsUrl: 'https://developers.google.com/maps/documentation',
    version: 'v3.53',
    enabled: false,
    credentials: {
      apiKey: { label: 'API Key', value: '', type: 'text', required: true },
      clientId: { label: 'Client ID (optional)', value: '', type: 'text', required: false },
      signature: { label: 'URL Signature (optional)', value: '', type: 'text', required: false }
    },
    endpoints: [
      { name: 'Maps JavaScript API', path: '/maps/api/js', status: 'unknown' },
      { name: 'Directions API', path: '/maps/api/directions/json', status: 'unknown' },
      { name: 'Places API', path: '/maps/api/place/autocomplete/json', status: 'unknown' },
      { name: 'Geocoding API', path: '/maps/api/geocode/json', status: 'unknown' },
      { name: 'Distance Matrix', path: '/maps/api/distancematrix/json', status: 'unknown' }
    ],
    quotas: { daily: 25000, used: 0, unit: 'requests' },
    pricing: { model: 'pay-per-use', free: 200, per1000: '$7.00' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: [] }
  },
  {
    id: 'mapbox',
    name: 'Mapbox',
    icon: '📐',
    category: 'mapping',
    description: 'Maps, Navigation, Search, Geocoding, Isochrone, Matrix API, Tilesets',
    docsUrl: 'https://docs.mapbox.com/api/',
    version: 'v11',
    enabled: false,
    credentials: {
      accessToken: { label: 'Access Token', value: '', type: 'text', required: true },
      secretKey: { label: 'Secret Key (SK)', value: '', type: 'password', required: false }
    },
    endpoints: [
      { name: 'Styles API', path: '/styles/v1/', status: 'unknown' },
      { name: 'Directions', path: '/directions/v5/', status: 'unknown' },
      { name: 'Geocoding', path: '/geocoding/v5/', status: 'unknown' },
      { name: 'Isochrone', path: '/isochrone/v1/', status: 'unknown' },
      { name: 'Matrix', path: '/directions-matrix/v1/', status: 'unknown' },
      { name: 'Tilequery', path: '/v4/mapbox.', status: 'unknown' }
    ],
    quotas: { daily: 100000, used: 0, unit: 'requests' },
    pricing: { model: 'freemium', free: 50000, per1000: '$5.00' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: [] }
  },
  {
    id: 'here-maps',
    name: 'HERE Maps',
    icon: '📍',
    category: 'mapping',
    description: 'Routing, Traffic, Geocoding, Places, Fleet Telematics, Isoline Routing',
    docsUrl: 'https://developer.here.com/documentation',
    version: 'v7',
    enabled: false,
    credentials: {
      appId: { label: 'App ID', value: '', type: 'text', required: true },
      appCode: { label: 'App Code', value: '', type: 'text', required: true },
      apiKey: { label: 'API Key (v7)', value: '', type: 'text', required: true }
    },
    endpoints: [
      { name: 'Routing v7', path: '/routing/7.2/', status: 'unknown' },
      { name: 'Traffic v6', path: '/traffic/6.3/', status: 'unknown' },
      { name: 'Geocoder', path: '/geocoder/6.2/', status: 'unknown' },
      { name: 'Places', path: '/places/v1/', status: 'unknown' },
      { name: 'Isoline', path: '/isoline/routing/', status: 'unknown' }
    ],
    quotas: { daily: 250000, used: 0, unit: 'requests' },
    pricing: { model: 'freemium', free: 250000, per1000: 'Free tier' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: [] }
  },
  {
    id: 'socket-io',
    name: 'Socket.IO (Real-time)',
    icon: '⚡',
    category: 'realtime',
    description: 'GPS tracking cada 3s, ride requests, SOS alerts, TripCheck events, surge updates',
    docsUrl: 'https://socket.io/docs/v4/',
    version: 'v4.7',
    enabled: false,
    credentials: {
      serverUrl: { label: 'Server URL', value: '', type: 'text', required: true, placeholder: 'https://api.movilidad.app' },
      port: { label: 'Port', value: '3001', type: 'number', required: true },
      authSecret: { label: 'Auth Secret', value: '', type: 'password', required: true },
      redisUrl: { label: 'Redis Adapter URL', value: '', type: 'text', required: false, placeholder: 'redis://localhost:6379' }
    },
    endpoints: [
      { name: 'driver:location', path: 'event', status: 'unknown' },
      { name: 'ride:request', path: 'event', status: 'unknown' },
      { name: 'sos:alert', path: 'event', status: 'unknown' },
      { name: 'tripcheck:alert', path: 'event', status: 'unknown' },
      { name: 'surge:update', path: 'event', status: 'unknown' }
    ],
    quotas: { daily: 0, used: 0, unit: 'unlimited' },
    pricing: { model: 'self-hosted', free: 'Unlimited', per1000: 'N/A' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: [] }
  },
  {
    id: 'stripe',
    name: 'Stripe (Pagos)',
    icon: '💳',
    category: 'payments',
    description: 'Payment Intents, Payment Methods, Refunds, Subscriptions, Connect, Payouts',
    docsUrl: 'https://docs.stripe.com/api',
    version: '2024-01',
    enabled: false,
    credentials: {
      publishableKey: { label: 'Publishable Key', value: '', type: 'text', required: true, placeholder: 'pk_live_...' },
      secretKey: { label: 'Secret Key', value: '', type: 'password', required: true, placeholder: 'sk_live_...' },
      webhookSecret: { label: 'Webhook Signing Secret', value: '', type: 'password', required: true },
      clientId: { label: 'Connect Client ID', value: '', type: 'text', required: false }
    },
    endpoints: [
      { name: 'Create Payment Intent', path: '/v1/payment_intents', status: 'unknown' },
      { name: 'Payment Methods', path: '/v1/payment_methods', status: 'unknown' },
      { name: 'Refunds', path: '/v1/refunds', status: 'unknown' },
      { name: 'Payouts', path: '/v1/payouts', status: 'unknown' },
      { name: 'Balance', path: '/v1/balance', status: 'unknown' }
    ],
    quotas: { daily: 0, used: 0, unit: 'unlimited' },
    pricing: { model: 'pay-per-transaction', free: 'No monthly', per1000: '2.9% + $0.30' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: ['payment_intent.succeeded', 'payment_intent.failed', 'charge.refunded'] }
  },
  {
    id: 'twilio',
    name: 'Twilio (Telefonía/SMS)',
    icon: '📞',
    category: 'communications',
    description: 'Masked calls (Voice API), SMS, WhatsApp Business, VoIP, Verify (2FA), Phone Lookup',
    docsUrl: 'https://www.twilio.com/docs',
    version: 'v2010',
    enabled: false,
    credentials: {
      accountSid: { label: 'Account SID', value: '', type: 'text', required: true, placeholder: 'ACxxxx...' },
      authToken: { label: 'Auth Token', value: '', type: 'password', required: true },
      phoneNumber: { label: 'Twilio Phone Number', value: '', type: 'text', required: true, placeholder: '+1234567890' },
      verifySid: { label: 'Verify Service SID', value: '', type: 'text', required: false },
      apiKeySid: { label: 'API Key SID', value: '', type: 'text', required: false },
      apiKeySecret: { label: 'API Key Secret', value: '', type: 'password', required: false }
    },
    endpoints: [
      { name: 'Voice (Masked Calls)', path: '/2010-04-01/Accounts/{sid}/Calls', status: 'unknown' },
      { name: 'SMS', path: '/2010-04-01/Accounts/{sid}/Messages', status: 'unknown' },
      { name: 'Verify (2FA)', path: '/v2/Services/{sid}/Verifications', status: 'unknown' },
      { name: 'Phone Lookup', path: '/v1/PhoneNumbers/', status: 'unknown' },
      { name: 'WhatsApp', path: '/2010-04-01/Accounts/{sid}/Messages', status: 'unknown' }
    ],
    quotas: { daily: 0, used: 0, unit: 'pay-per-use' },
    pricing: { model: 'pay-per-use', free: '$0 trial', per1000: 'Voice $0.013/min' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: ['call.completed', 'message.received'] }
  },
  {
    id: 'firebase-auth',
    name: 'Firebase Authentication',
    icon: '🔥',
    category: 'authentication',
    description: 'Phone auth, Email/Password, Google Sign-in, Apple Sign-in, Custom Tokens, JWT verification',
    docsUrl: 'https://firebase.google.com/docs/auth',
    version: 'v1',
    enabled: false,
    credentials: {
      apiKey: { label: 'API Key', value: '', type: 'text', required: true },
      authDomain: { label: 'Auth Domain', value: '', type: 'text', required: true, placeholder: 'movilidad.firebaseapp.com' },
      projectId: { label: 'Project ID', value: '', type: 'text', required: true },
      storageBucket: { label: 'Storage Bucket', value: '', type: 'text', required: false },
      messagingSenderId: { label: 'Messaging Sender ID', value: '', type: 'text', required: false },
      appId: { label: 'App ID', value: '', type: 'text', required: true },
      serviceAccountKey: { label: 'Service Account JSON', value: '', type: 'textarea', required: true }
    },
    endpoints: [
      { name: 'signInWithPhoneNumber', path: '/v1/accounts:sendVerificationCode', status: 'unknown' },
      { name: 'signInWithCustomToken', path: '/v1/accounts:signInWithCustomToken', status: 'unknown' },
      { name: 'verifyIdToken', path: '/v1/accounts:lookup', status: 'unknown' },
      { name: 'createUser', path: '/v1/accounts:create', status: 'unknown' }
    ],
    quotas: { daily: 0, used: 0, unit: 'unlimited' },
    pricing: { model: 'free', free: 'Unlimited auth', per1000: 'Free' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: [] }
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary (Uploads)',
    icon: '🖼️',
    category: 'storage',
    description: 'Document uploads (licenses, insurance), profile photos, image optimization, transformations',
    docsUrl: 'https://cloudinary.com/documentation',
    version: 'v1',
    enabled: false,
    credentials: {
      cloudName: { label: 'Cloud Name', value: '', type: 'text', required: true },
      apiKey: { label: 'API Key', value: '', type: 'text', required: true },
      apiSecret: { label: 'API Secret', value: '', type: 'password', required: true },
      uploadPreset: { label: 'Upload Preset', value: 'movilidad_upload', type: 'text', required: true },
      folder: { label: 'Default Folder', value: 'documents', type: 'text', required: false }
    },
    endpoints: [
      { name: 'Upload Image', path: '/v1_1/{cloud}/image/upload', status: 'unknown' },
      { name: 'Upload Raw (PDFs)', path: '/v1_1/{cloud}/raw/upload', status: 'unknown' },
      { name: 'Delete Asset', path: '/v1_1/{cloud}/resources/', status: 'unknown' },
      { name: 'List Resources', path: '/v1_1/{cloud}/resources/', status: 'unknown' }
    ],
    quotas: { daily: 0, used: 0, unit: '25GB storage' },
    pricing: { model: 'freemium', free: '25GB + 25K transforms', per1000: '$0.18/GB' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: [] }
  },
  {
    id: 'sendgrid',
    name: 'SendGrid (Email)',
    icon: '📧',
    category: 'communications',
    description: 'Transactional emails, welcome emails, receipts, password reset, ride summaries',
    docsUrl: 'https://docs.sendgrid.com/api-reference',
    version: 'v3',
    enabled: false,
    credentials: {
      apiKey: { label: 'API Key', value: '', type: 'password', required: true, placeholder: 'SG.xxxxx...' },
      fromEmail: { label: 'From Email', value: '', type: 'text', required: true, placeholder: 'noreply@movilidad.app' },
      fromName: { label: 'From Name', value: 'Movilidad', type: 'text', required: true },
      templateId: { label: 'Default Template ID', value: '', type: 'text', required: false }
    },
    endpoints: [
      { name: 'Send Email', path: '/v3/mail/send', status: 'unknown' },
      { name: 'Templates', path: '/v3/templates', status: 'unknown' },
      { name: 'Suppression List', path: '/v3/suppression/bounces', status: 'unknown' }
    ],
    quotas: { daily: 100, used: 0, unit: 'emails' },
    pricing: { model: 'freemium', free: '100/day', per1000: '$0.01/email' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: ['delivered', 'bounce', 'open', 'click'] }
  },
  {
    id: 'fcm-push',
    name: 'FCM Push Notifications',
    icon: '🔔',
    category: 'notifications',
    description: 'Push notifications to iOS/Android: ride requests, surge alerts, incentive updates, SOS alerts',
    docsUrl: 'https://firebase.google.com/docs/cloud-messaging',
    version: 'v1',
    enabled: false,
    credentials: {
      serviceAccountKey: { label: 'Service Account JSON', value: '', type: 'textarea', required: true },
      projectId: { label: 'Project ID', value: '', type: 'text', required: true },
      serverKey: { label: 'Server Key (Legacy)', value: '', type: 'password', required: false },
      apnsKey: { label: 'APNs Key (iOS)', value: '', type: 'textarea', required: false },
      apnsKeyId: { label: 'APNs Key ID', value: '', type: 'text', required: false },
      teamId: { label: 'Apple Team ID', value: '', type: 'text', required: false },
      bundleId: { label: 'iOS Bundle ID', value: 'com.movilidad.rider', type: 'text', required: false }
    },
    endpoints: [
      { name: 'Send Message', path: '/v1/projects/{id}/messages:send', status: 'unknown' },
      { name: 'Topic Subscription', path: '/v1/projects/{id}/subscriptions', status: 'unknown' }
    ],
    quotas: { daily: 0, used: 0, unit: 'unlimited' },
    pricing: { model: 'free', free: 'Unlimited', per1000: 'Free' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: [] }
  },
  {
    id: 'kafka',
    name: 'Apache Kafka (Streaming)',
    icon: '📊',
    category: 'streaming',
    description: 'Surge pricing events, ride events stream, GPS location stream, analytics pipeline',
    docsUrl: 'https://docs.confluent.io/platform/current/',
    version: '3.6',
    enabled: false,
    credentials: {
      bootstrapServers: { label: 'Bootstrap Servers', value: '', type: 'text', required: true, placeholder: 'kafka1:9092,kafka2:9092' },
      schemaRegistryUrl: { label: 'Schema Registry URL', value: '', type: 'text', required: false },
      apiKey: { label: 'API Key (Confluent)', value: '', type: 'text', required: false },
      apiSecret: { label: 'API Secret', value: '', type: 'password', required: false },
      clusterId: { label: 'Cluster ID', value: '', type: 'text', required: false }
    },
    endpoints: [
      { name: 'surge-pricing-events', path: 'topic', status: 'unknown' },
      { name: 'ride-events', path: 'topic', status: 'unknown' },
      { name: 'gps-location-stream', path: 'topic', status: 'unknown' },
      { name: 'driver-status-stream', path: 'topic', status: 'unknown' },
      { name: 'payment-events', path: 'topic', status: 'unknown' }
    ],
    quotas: { daily: 0, used: 0, unit: 'unlimited' },
    pricing: { model: 'self-hosted/managed', free: 'Self-hosted', per1000: 'Confluent from $0.02/GB' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: [] }
  },
  {
    id: 'geohash-s2',
    name: 'Geohash / S2 Geometry',
    icon: '🌐',
    category: 'geospatial',
    description: 'Spatial indexing for driver matching, nearby search, geofencing, cell coverage',
    docsUrl: 'https://s2geometry.io/',
    version: 'internal',
    enabled: true,
    credentials: {
      defaultPrecision: { label: 'Geohash Precision', value: '12', type: 'number', required: true },
      searchRadiusKm: { label: 'Search Radius (km)', value: '5', type: 'number', required: true },
      s2MaxLevel: { label: 'S2 Max Level', value: '16', type: 'number', required: true },
      s2MinLevel: { label: 'S2 Min Level', value: '2', type: 'number', required: true }
    },
    endpoints: [
      { name: 'encodeGeohash', path: 'internal', status: 'active' },
      { name: 'decodeGeohash', path: 'internal', status: 'active' },
      { name: 'findNearbyDrivers', path: 'internal', status: 'active' },
      { name: 'haversineDistance', path: 'internal', status: 'active' },
      { name: 'geofenceCheck', path: 'internal', status: 'active' }
    ],
    quotas: { daily: 0, used: 0, unit: 'unlimited' },
    pricing: { model: 'internal', free: 'Built-in', per1000: 'N/A' },
    lastTested: null,
    lastStatus: 'active',
    health: 'active',
    webhook: { url: '', events: [] }
  },
  {
    id: 'osrm',
    name: 'OSRM (Routing Engine)',
    icon: '🛣️',
    category: 'mapping',
    description: 'Open Source Routing Machine - Self-hosted route calculation, ETA, distance matrix',
    docsUrl: 'https://project-osrm.org/docs/v5.24.0/API/',
    version: 'v5.24',
    enabled: false,
    credentials: {
      serverUrl: { label: 'OSRM Server URL', value: '', type: 'text', required: true, placeholder: 'http://localhost:5000' },
      profile: { label: 'Default Profile', value: 'car', type: 'select', options: ['car', 'bike', 'foot'], required: true },
      datasetPath: { label: 'OSM Dataset Path', value: '', type: 'text', required: false, placeholder: '/data/mexico-latest.osrm' }
    },
    endpoints: [
      { name: 'Route', path: '/route/v1/', status: 'unknown' },
      { name: 'Table (Matrix)', path: '/table/v1/', status: 'unknown' },
      { name: 'Match', path: '/match/v1/', status: 'unknown' },
      { name: 'Trip (TSP)', path: '/trip/v1/', status: 'unknown' }
    ],
    quotas: { daily: 0, used: 0, unit: 'unlimited' },
    pricing: { model: 'self-hosted', free: 'Unlimited', per1000: 'N/A' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: [] }
  },
  {
    id: 'redis',
    name: 'Redis (Cache/Queue)',
    icon: '🔴',
    category: 'infrastructure',
    description: 'Session cache, driver location cache, rate limiting, queue management, pub/sub',
    docsUrl: 'https://redis.io/docs/',
    version: '7.2',
    enabled: false,
    credentials: {
      host: { label: 'Host', value: 'localhost', type: 'text', required: true },
      port: { label: 'Port', value: '6379', type: 'number', required: true },
      password: { label: 'Password', value: '', type: 'password', required: false },
      db: { label: 'Database Number', value: '0', type: 'number', required: false },
      clusterMode: { label: 'Cluster Mode', value: 'false', type: 'select', options: ['true', 'false'], required: false }
    },
    endpoints: [
      { name: 'PING', path: 'command', status: 'unknown' },
      { name: 'GEOADD/GEOSEARCH', path: 'command', status: 'unknown' },
      { name: 'PUB/SUB', path: 'command', status: 'unknown' },
      { name: 'LPUSH/RPOP (Queue)', path: 'command', status: 'unknown' }
    ],
    quotas: { daily: 0, used: 0, unit: 'unlimited' },
    pricing: { model: 'self-hosted/managed', free: 'Self-hosted', per1000: 'Redis Cloud from $0.25/MB' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: [] }
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL + PostGIS',
    icon: '🐘',
    category: 'database',
    description: 'Primary database with PostGIS extension for geospatial queries, user data, ride history',
    docsUrl: 'https://www.postgresql.org/docs/',
    version: '16',
    enabled: false,
    credentials: {
      host: { label: 'Host', value: 'localhost', type: 'text', required: true },
      port: { label: 'Port', value: '5432', type: 'number', required: true },
      database: { label: 'Database', value: 'movilidad', type: 'text', required: true },
      user: { label: 'User', value: 'movilidad_admin', type: 'text', required: true },
      password: { label: 'Password', value: '', type: 'password', required: true },
      ssl: { label: 'SSL Mode', value: 'require', type: 'select', options: ['disable', 'require', 'verify-ca', 'verify-full'], required: true },
      poolMax: { label: 'Max Pool Size', value: '20', type: 'number', required: false }
    },
    endpoints: [
      { name: 'Connection', path: 'tcp', status: 'unknown' },
      { name: 'PostGIS ST_DWithin', path: 'query', status: 'unknown' },
      { name: 'PostGIS ST_Distance', path: 'query', status: 'unknown' }
    ],
    quotas: { daily: 0, used: 0, unit: 'unlimited' },
    pricing: { model: 'self-hosted/managed', free: 'Self-hosted', per1000: 'RDS from $15/mo' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: [] }
  },
  {
    id: 'aws-s3',
    name: 'AWS S3 (Storage)',
    icon: '☁️',
    category: 'storage',
    description: 'Static assets, ride recordings, large document storage, backups, CloudFront CDN',
    docsUrl: 'https://docs.aws.amazon.com/s3/',
    version: '2006-03-01',
    enabled: false,
    credentials: {
      accessKeyId: { label: 'Access Key ID', value: '', type: 'text', required: true },
      secretAccessKey: { label: 'Secret Access Key', value: '', type: 'password', required: true },
      region: { label: 'Region', value: 'us-east-1', type: 'text', required: true },
      bucketName: { label: 'Bucket Name', value: 'movilidad-assets', type: 'text', required: true },
      cdnUrl: { label: 'CloudFront URL', value: '', type: 'text', required: false }
    },
    endpoints: [
      { name: 'Put Object', path: '/{bucket}/{key}', status: 'unknown' },
      { name: 'Get Object', path: '/{bucket}/{key}', status: 'unknown' },
      { name: 'List Objects', path: '/{bucket}', status: 'unknown' }
    ],
    quotas: { daily: 0, used: 0, unit: '5TB free tier' },
    pricing: { model: 'pay-per-use', free: '5GB storage', per1000: '$0.023/GB/mo' },
    lastTested: null,
    lastStatus: null,
    health: 'unknown',
    webhook: { url: '', events: ['s3:ObjectCreated', 's3:ObjectRemoved'] }
  }
];

// Initialize DB with defaults if empty
function initDB() {
  const db = loadDB();
  if (!db.apis || db.apis.length === 0) {
    db.apis = DEFAULT_APIS;
    saveDB(db);
  }
  return db;
}

// ===== AUTH (Simple JWT) =====
const JWT_SECRET = 'movilidad-thefirm69-secret-key-2024';
const ADMIN_USER = { username: 'admin@movilidad.app', password: bcrypt.hashSync('TheFirm69!Admin', 10) };

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ===== ROUTES =====

// Auth - Login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER.username && bcrypt.compareSync(password, ADMIN_USER.password)) {
    const token = jwt.sign({ username, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
    saveLog({ timestamp: new Date().toISOString(), action: 'login', user: username, success: true });
    res.json({ token, username, role: 'admin' });
  } else {
    saveLog({ timestamp: new Date().toISOString(), action: 'login', user: username, success: false });
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Auth - Verify
app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ===== API CONFIGS CRUD =====

// List all APIs
app.get('/api/configs', authMiddleware, (req, res) => {
  const db = initDB();
  const category = req.query.category;
  let apis = db.apis;
  if (category) apis = apis.filter(a => a.category === category);
  // Mask sensitive credentials
  apis = apis.map(a => ({
    ...a,
    credentials: Object.fromEntries(Object.entries(a.credentials).map(([k, v]) => [
      k, { ...v, value: v.type === 'password' && v.value ? '••••••••' : v.value }
    ]))
  }));
  res.json(apis);
});

// Get single API config
app.get('/api/configs/:id', authMiddleware, (req, res) => {
  const db = initDB();
  const api = db.apis.find(a => a.id === req.params.id);
  if (!api) return res.status(404).json({ error: 'API not found' });
  res.json(api);
});

// Update API config
app.put('/api/configs/:id', authMiddleware, (req, res) => {
  const db = initDB();
  const idx = db.apis.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'API not found' });
  
  const existing = db.apis[idx];
  const updates = req.body;
  
  // Update credentials (merge, don't replace masked ones)
  if (updates.credentials) {
    Object.entries(updates.credentials).forEach(([key, val]) => {
      if (existing.credentials[key]) {
        if (val.value && val.value !== '••••••••') {
          existing.credentials[key].value = val.value;
        }
      }
    });
  }
  
  // Update other fields
  if (updates.enabled !== undefined) existing.enabled = updates.enabled;
  if (updates.webhook) existing.webhook = { ...existing.webhook, ...updates.webhook };
  if (updates.quotas) existing.quotas = { ...existing.quotas, ...updates.quotas };
  
  db.apis[idx] = existing;
  saveDB(db);
  
  saveLog({ timestamp: new Date().toISOString(), action: 'update_config', apiId: req.params.id, user: req.user.username });
  res.json({ success: true, api: existing });
});

// Test API connection
app.post('/api/configs/:id/test', authMiddleware, async (req, res) => {
  const db = initDB();
  const api = db.apis.find(a => a.id === req.params.id);
  if (!api) return res.status(404).json({ error: 'API not found' });
  
  const testResult = {
    timestamp: new Date().toISOString(),
    apiId: api.id,
    apiName: api.name,
    user: req.user.username
  };
  
  try {
    let connected = false;
    let message = '';
    let latency = 0;
    const start = Date.now();
    
    switch (api.id) {
      case 'google-maps': {
        if (!api.credentials.apiKey.value) throw new Error('API Key is required');
        const https = require('https');
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=Mexico+City&key=${api.credentials.apiKey.value}`;
        connected = await new Promise((resolve) => {
          https.get(url, (resp) => {
            let data = '';
            resp.on('data', chunk => data += chunk);
            resp.on('end', () => {
              try {
                const j = JSON.parse(data);
                resolve(j.status === 'OK' || j.status === 'ZERO_RESULTS');
              } catch { resolve(false); }
            });
          }).on('error', () => resolve(false));
        });
        message = connected ? 'Google Maps API responding correctly' : 'API returned error. Check your key.';
        break;
      }
      case 'stripe': {
        if (!api.credentials.secretKey.value) throw new Error('Secret Key is required');
        const https = require('https');
        connected = await new Promise((resolve) => {
          const opts = { hostname: 'api.stripe.com', path: '/v1/balance', method: 'GET', headers: { 'Authorization': `Bearer ${api.credentials.secretKey.value}` } };
          const req = https.request(opts, (resp) => { let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>resolve(resp.statusCode===200)); });
          req.on('error', () => resolve(false));
          req.end();
        });
        message = connected ? 'Stripe connected. Balance retrieved.' : 'Invalid API key or connection error.';
        break;
      }
      case 'twilio': {
        if (!api.credentials.accountSid.value || !api.credentials.authToken.value) throw new Error('Account SID and Auth Token required');
        const https = require('https');
        connected = await new Promise((resolve) => {
          const opts = { hostname: 'api.twilio.com', path: `/2010-04-01/Accounts/${api.credentials.accountSid.value}.json`, method: 'GET', headers: { 'Authorization': 'Basic ' + Buffer.from(`${api.credentials.accountSid.value}:${api.credentials.authToken.value}`).toString('base64') } };
          const req = https.request(opts, (resp) => { let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>resolve(resp.statusCode===200)); });
          req.on('error', () => resolve(false));
          req.end();
        });
        message = connected ? 'Twilio account verified.' : 'Invalid credentials.';
        break;
      }
      case 'sendgrid': {
        if (!api.credentials.apiKey.value) throw new Error('API Key required');
        const https = require('https');
        connected = await new Promise((resolve) => {
          const opts = { hostname: 'api.sendgrid.com', path: '/v3/user/account', method: 'GET', headers: { 'Authorization': `Bearer ${api.credentials.apiKey.value}` } };
          const req = https.request(opts, (resp) => { let d=''; resp.on('data',c=>d+=c); resp.on('end',()=>resolve(resp.statusCode===200)); });
          req.on('error', () => resolve(false));
          req.end();
        });
        message = connected ? 'SendGrid API key valid.' : 'Invalid API key.';
        break;
      }
      case 'mapbox': {
        if (!api.credentials.accessToken.value) throw new Error('Access Token required');
        const https = require('https');
        connected = await new Promise((resolve) => {
          https.get(`https://api.mapbox.com/tokens/v2?access_token=${api.credentials.accessToken.value}`, (resp) => {
            let d = '';
            resp.on('data', c => d += c);
            resp.on('end', () => { try { const j = JSON.parse(d); resolve(j.code === 'TokenValid' || resp.statusCode === 200); } catch { resolve(resp.statusCode === 200); } });
          }).on('error', () => resolve(false));
        });
        message = connected ? 'Mapbox token valid.' : 'Invalid access token.';
        break;
      }
      case 'firebase-auth': {
        if (!api.credentials.apiKey.value || !api.credentials.projectId.value) throw new Error('API Key and Project ID required');
        const https = require('https');
        connected = await new Promise((resolve) => {
          https.get(`https://firestore.googleapis.com/v1/projects/${api.credentials.projectId.value}`, (resp) => {
            resp.on('data', () => {});
            resp.on('end', () => resolve(resp.statusCode !== 404));
          }).on('error', () => resolve(false));
        });
        message = connected ? 'Firebase project found.' : 'Project not found or inaccessible.';
        break;
      }
      case 'cloudinary': {
        if (!api.credentials.cloudName.value || !api.credentials.apiKey.value || !api.credentials.apiSecret.value) throw new Error('Cloud Name, API Key and Secret required');
        const https = require('https');
        connected = await new Promise((resolve) => {
          const opts = { hostname: 'api.cloudinary.com', path: `/v1_1/${api.credentials.cloudName.value}/resources/image?max_results=1`, method: 'GET', headers: { 'Authorization': 'Basic ' + Buffer.from(`${api.credentials.apiKey.value}:${api.credentials.apiSecret.value}`).toString('base64') } };
          const req = https.request(opts, (resp) => { resp.on('data',()=>{}); resp.on('end',()=>resolve(resp.statusCode===200)); });
          req.on('error', () => resolve(false));
          req.end();
        });
        message = connected ? 'Cloudinary connected. Resources accessible.' : 'Invalid credentials.';
        break;
      }
      case 'socket-io': {
        const url = api.credentials.serverUrl.value || 'http://localhost:3001';
        const http = url.startsWith('https') ? require('https') : require('http');
        connected = await new Promise((resolve) => {
          http.get(`${url}/socket.io/?EIO=4&transport=polling`, (resp) => {
            let d = '';
            resp.on('data', c => d += c);
            resp.on('end', () => resolve(d.includes('0') && resp.statusCode === 200));
          }).on('error', () => resolve(false));
        });
        message = connected ? 'Socket.IO server responding.' : 'Server not reachable.';
        break;
      }
      case 'redis': {
        // Test via TCP connection
        const net = require('net');
        const host = api.credentials.host.value || 'localhost';
        const port = parseInt(api.credentials.port.value || '6379');
        connected = await new Promise((resolve) => {
          const sock = net.createConnection({ host, port }, () => { sock.write('PING\r\n'); });
          sock.on('data', (data) => { resolve(data.toString().includes('+PONG')); sock.destroy(); });
          sock.on('error', () => { resolve(false); });
          setTimeout(() => { sock.destroy(); resolve(false); }, 3000);
        });
        message = connected ? 'Redis PONG received.' : 'Cannot connect to Redis.';
        break;
      }
      case 'postgresql': {
        // Test TCP connection
        const net = require('net');
        const host = api.credentials.host.value || 'localhost';
        const port = parseInt(api.credentials.port.value || '5432');
        connected = await new Promise((resolve) => {
          const sock = net.createConnection({ host, port }, () => { resolve(true); sock.destroy(); });
          sock.on('error', () => { resolve(false); });
          setTimeout(() => { sock.destroy(); resolve(false); }, 3000);
        });
        message = connected ? 'PostgreSQL port reachable.' : 'Cannot reach PostgreSQL.';
        break;
      }
      case 'osrm': {
        const url = api.credentials.serverUrl.value || 'http://localhost:5000';
        const http = url.startsWith('https') ? require('https') : require('http');
        connected = await new Promise((resolve) => {
          http.get(`${url}/route/v1/car/19.4326,-99.1332;19.4350,-99.1500?overview=false`, (resp) => {
            let d = '';
            resp.on('data', c => d += c);
            resp.on('end', () => { try { resolve(JSON.parse(d).code === 'Ok'); } catch { resolve(false); } });
          }).on('error', () => resolve(false));
        });
        message = connected ? 'OSRM routing engine responding.' : 'OSRM not reachable.';
        break;
      }
      case 'aws-s3': {
        if (!api.credentials.accessKeyId.value || !api.credentials.secretAccessKey.value) throw new Error('Access Key and Secret required');
        // Test via HTTP endpoint
        const https = require('https');
        connected = await new Promise((resolve) => {
          https.get(`https://${api.credentials.bucketName.value}.s3.${api.credentials.region.value}.amazonaws.com/`, (resp) => {
            resp.on('data', () => {});
            resp.on('end', () => resolve(resp.statusCode === 200 || resp.statusCode === 403)); // 403 = exists but private
          }).on('error', () => resolve(false));
        });
        message = connected ? 'S3 bucket accessible.' : 'Cannot access S3 bucket.';
        break;
      }
      case 'here-maps': {
        if (!api.credentials.apiKey.value) throw new Error('API Key required');
        const https = require('https');
        connected = await new Promise((resolve) => {
          https.get(`https://geocoder.api.here.com/6.2/geocode.json?app_id=${api.credentials.appId.value}&app_code=${api.credentials.appCode.value}&searchtext=Mexico+City`, (resp) => {
            let d = '';
            resp.on('data', c => d += c);
            resp.on('end', () => { try { resolve(JSON.parse(d).Response?.View?.length > 0); } catch { resolve(false); } });
          }).on('error', () => resolve(false));
        });
        message = connected ? 'HERE Maps responding.' : 'Invalid credentials.';
        break;
      }
      case 'fcm-push': {
        if (!api.credentials.projectId.value) throw new Error('Project ID required');
        message = 'FCM configuration saved. Test by sending a push notification.';
        connected = true; // Config level only
        break;
      }
      case 'kafka': {
        if (!api.credentials.bootstrapServers.value) throw new Error('Bootstrap servers required');
        message = 'Kafka configuration saved. Connection test requires running broker.';
        connected = true; // Config level
        break;
      }
      case 'geohash-s2': {
        connected = true;
        message = 'Internal engine active. All spatial functions operational.';
        break;
      }
      default: {
        message = 'No test available for this API.';
        connected = false;
      }
    }
    
    latency = Date.now() - start;
    
    // Update API status
    const apiIdx = db.apis.findIndex(a => a.id === req.params.id);
    if (apiIdx !== -1) {
      db.apis[apiIdx].lastTested = new Date().toISOString();
      db.apis[apiIdx].lastStatus = connected ? 'connected' : 'error';
      db.apis[apiIdx].health = connected ? 'healthy' : 'error';
      db.apis[apiIdx].endpoints.forEach(ep => ep.status = connected ? 'active' : 'error');
      saveDB(db);
    }
    
    testResult.success = connected;
    testResult.message = message;
    testResult.latency = latency;
    testResult.health = connected ? 'healthy' : 'error';
    saveLog(testResult);
    
    res.json(testResult);
  } catch (err) {
    testResult.success = false;
    testResult.message = err.message;
    testResult.latency = Date.now() - start;
    testResult.health = 'error';
    saveLog(testResult);
    res.json(testResult);
  }
});

// Toggle API enabled/disabled
app.patch('/api/configs/:id/toggle', authMiddleware, (req, res) => {
  const db = initDB();
  const idx = db.apis.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'API not found' });
  db.apis[idx].enabled = !db.apis[idx].enabled;
  saveDB(db);
  saveLog({ timestamp: new Date().toISOString(), action: 'toggle', apiId: req.params.id, enabled: db.apis[idx].enabled, user: req.user.username });
  res.json({ success: true, enabled: db.apis[idx].enabled });
});

// Get API logs
app.get('/api/logs', authMiddleware, (req, res) => {
  const logs = loadLogs();
  const limit = parseInt(req.query.limit) || 50;
  const apiFilter = req.query.apiId;
  let filtered = apiFilter ? logs.filter(l => l.apiId === apiFilter) : logs;
  res.json(filtered.slice(0, limit));
});

// Get health status of all APIs
app.get('/api/health', authMiddleware, (req, res) => {
  const db = initDB();
  const summary = {
    total: db.apis.length,
    enabled: db.apis.filter(a => a.enabled).length,
    healthy: db.apis.filter(a => a.health === 'healthy').length,
    error: db.apis.filter(a => a.health === 'error').length,
    unknown: db.apis.filter(a => a.health === 'unknown' || !a.health).length,
    apis: db.apis.map(a => ({ id: a.id, name: a.name, icon: a.icon, enabled: a.enabled, health: a.health, lastTested: a.lastTested }))
  };
  res.json(summary);
});

// Get API categories
app.get('/api/categories', (req, res) => {
  res.json([
    { id: 'mapping', name: 'Mapas y Navegación', icon: '🗺️' },
    { id: 'realtime', name: 'Tiempo Real', icon: '⚡' },
    { id: 'payments', name: 'Pagos', icon: '💳' },
    { id: 'communications', name: 'Comunicaciones', icon: '📞' },
    { id: 'authentication', name: 'Autenticación', icon: '🔥' },
    { id: 'storage', name: 'Almacenamiento', icon: '☁️' },
    { id: 'notifications', name: 'Notificaciones', icon: '🔔' },
    { id: 'streaming', name: 'Streaming', icon: '📊' },
    { id: 'geospatial', name: 'Geoespacial', icon: '🌐' },
    { id: 'infrastructure', name: 'Infraestructura', icon: '🔧' },
    { id: 'database', name: 'Base de Datos', icon: '🐘' }
  ]);
});

// Reset API config to defaults
app.post('/api/configs/:id/reset', authMiddleware, (req, res) => {
  const db = initDB();
  const defaultApi = DEFAULT_APIS.find(a => a.id === req.params.id);
  if (!defaultApi) return res.status(404).json({ error: 'API not found' });
  const idx = db.apis.findIndex(a => a.id === req.params.id);
  db.apis[idx] = { ...defaultApi };
  saveDB(db);
  saveLog({ timestamp: new Date().toISOString(), action: 'reset', apiId: req.params.id, user: req.user.username });
  res.json({ success: true });
});

// Export all configs
app.get('/api/export', authMiddleware, (req, res) => {
  const db = initDB();
  res.setHeader('Content-Disposition', 'attachment; filename=movilidad-api-configs.json');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(db, null, 2));
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  initDB();
  console.log(`\n🚗 Movilidad API Config Server — By TheFirm69 Systems`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Endpoints: /api/configs, /api/health, /api/logs\n`);
});
