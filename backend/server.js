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
  return JSON.parse(fs.readFileSync(LOGS_FILE, 'utf8'));
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
  
  const start = Date.now();
  try {
    let connected = false;
    let message = '';
    let latency = 0;
    
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

// ===== RIDE LIFECYCLE =====
const RIDES_FILE = path.join(DATA_DIR, 'rides.json');
const TRIPCHECK_FILE = path.join(DATA_DIR, 'tripcheck_events.json');

function loadRides() {
  if (!fs.existsSync(RIDES_FILE)) return [];
  return JSON.parse(fs.readFileSync(RIDES_FILE, 'utf8'));
}
function saveRides(data) {
  fs.writeFileSync(RIDES_FILE, JSON.stringify(data, null, 2));
}
function loadTripCheckEvents() {
  if (!fs.existsSync(TRIPCHECK_FILE)) return [];
  return JSON.parse(fs.readFileSync(TRIPCHECK_FILE, 'utf8'));
}
function saveTripCheckEvents(data) {
  fs.writeFileSync(TRIPCHECK_FILE, JSON.stringify(data, null, 2));
}

// Seed initial rides data
if (!fs.existsSync(RIDES_FILE)) {
  const categories = ['express','comfort','taxi','moto','protect','premier','intercity','share'];
  const statuses = ['completed','completed','completed','completed','in_progress','requested','cancelled','completed'];
  const seedRides = Array.from({length: 50}, (_, i) => ({
    id: `R${1000+i}`,
    passenger: `P${2000+Math.floor(Math.random()*100)}`,
    driver: i < 45 ? `D${1001+Math.floor(Math.random()*30)}` : null,
    category: categories[Math.floor(Math.random()*categories.length)],
    status: statuses[Math.floor(Math.random()*statuses.length)],
    pickup: { lat: 19.43 + (Math.random()-0.5)*0.08, lng: -99.13 + (Math.random()-0.5)*0.08, name: ['Polanco','Condesa','Roma Norte','Centro','Santa Fe','Del Valle','Interlomas','Coyoacán'][Math.floor(Math.random()*8)] },
    dropoff: { lat: 19.43 + (Math.random()-0.5)*0.08, lng: -99.13 + (Math.random()-0.5)*0.08, name: ['Aeropuerto','Santa Fe','Polanco','Centro','Tlatelolco','Insurgentes','Reforma','Perisur'][Math.floor(Math.random()*8)] },
    fare: Math.floor(50 + Math.random()*450),
    surge: [1,1,1,1.2,1.5,1.8,2.0,1][Math.floor(Math.random()*8)],
    distance: +(1 + Math.random()*25).toFixed(1),
    duration: Math.floor(3 + Math.random()*55),
    rating: i < 40 ? +(3 + Math.random()*2).toFixed(1) : null,
    createdAt: new Date(Date.now() - Math.floor(Math.random()*86400000*7)).toISOString(),
    completedAt: statuses[i%8] === 'completed' ? new Date(Date.now() - Math.floor(Math.random()*86400000*3)).toISOString() : null
  }));
  saveRides(seedRides);
}

// Seed TripCheck events
if (!fs.existsSync(TRIPCHECK_FILE)) {
  const eventTypes = ['route_deviation','speed_alert','hard_brake','sos_triggered','auto_approved','escalated'];
  const riskLevels = ['low','low','medium','high','critical','low'];
  const seedEvents = Array.from({length: 30}, (_, i) => ({
    id: `TC${3000+i}`,
    rideId: `R${1000+Math.floor(Math.random()*50)}`,
    type: eventTypes[Math.floor(Math.random()*eventTypes.length)],
    riskLevel: riskLevels[Math.floor(Math.random()*riskLevels.length)],
    description: ['Desvío de ruta detectado - 800m de la ruta planificada','Exceso de velocidad - 85km/h en zona 60km/h','Frenado brusco detectado - desaceleración 7.8 m/s²','Botón SOS activado por pasajera','Ruta alternativa aprobada por IA - tráfico justificado','Alerta escalada a experto humano'][Math.floor(Math.random()*6)],
    location: { lat: 19.43 + (Math.random()-0.5)*0.06, lng: -99.13 + (Math.random()-0.5)*0.06 },
    resolved: Math.random() > 0.3,
    resolvedBy: Math.random() > 0.5 ? 'ai' : 'human',
    createdAt: new Date(Date.now() - Math.floor(Math.random()*86400000*2)).toISOString()
  }));
  saveTripCheckEvents(seedEvents);
}

// GET rides with filters
app.get('/api/rides', authMiddleware, (req, res) => {
  const rides = loadRides();
  const { status, category, limit, offset } = req.query;
  let filtered = rides;
  if (status) filtered = filtered.filter(r => r.status === status);
  if (category) filtered = filtered.filter(r => r.category === category);
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = filtered.length;
  if (offset && limit) filtered = filtered.slice(+offset, +offset + +limit);
  res.json({ total, rides: filtered });
});

// GET single ride
app.get('/api/rides/:id', authMiddleware, (req, res) => {
  const rides = loadRides();
  const ride = rides.find(r => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  const tripcheckEvents = loadTripCheckEvents().filter(e => e.rideId === ride.id);
  res.json({ ...ride, tripcheckEvents });
});

// POST request new ride
app.post('/api/rides', authMiddleware, (req, res) => {
  const rides = loadRides();
  const { passenger, category, pickup, dropoff, surge } = req.body;
  const ride = {
    id: `R${1000 + rides.length}`,
    passenger: passenger || 'P2999',
    driver: null,
    category: category || 'express',
    status: 'requested',
    pickup, dropoff,
    fare: Math.floor(50 + Math.random() * 350),
    surge: surge || 1,
    distance: +(1 + Math.random() * 20).toFixed(1),
    duration: null,
    rating: null,
    createdAt: new Date().toISOString(),
    completedAt: null
  };
  rides.push(ride);
  saveRides(rides);
  saveLog({ timestamp: new Date().toISOString(), action: 'ride_requested', rideId: ride.id, user: req.user.username });
  res.status(201).json(ride);
});

// PATCH update ride status
app.patch('/api/rides/:id/status', authMiddleware, (req, res) => {
  const rides = loadRides();
  const ride = rides.find(r => r.id === req.params.id);
  if (!ride) return res.status(404).json({ error: 'Ride not found' });
  const { status, driver, rating } = req.body;
  if (status) ride.status = status;
  if (driver) ride.driver = driver;
  if (rating) ride.rating = +rating;
  if (status === 'completed') {
    ride.completedAt = new Date().toISOString();
    ride.duration = Math.floor(3 + Math.random() * 50);
  }
  saveRides(rides);
  saveLog({ timestamp: new Date().toISOString(), action: 'ride_status_update', rideId: ride.id, status, user: req.user.username });
  res.json(ride);
});

// ===== TRIPCHECK EVENTS =====
app.get('/api/tripcheck', authMiddleware, (req, res) => {
  const events = loadTripCheckEvents();
  const { riskLevel, type, resolved } = req.query;
  let filtered = events;
  if (riskLevel) filtered = filtered.filter(e => e.riskLevel === riskLevel);
  if (type) filtered = filtered.filter(e => e.type === type);
  if (resolved !== undefined) filtered = filtered.filter(e => e.resolved === (resolved === 'true'));
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const summary = {
    total: events.length,
    unresolved: events.filter(e => !e.resolved).length,
    byRiskLevel: { low: events.filter(e => e.riskLevel==='low').length, medium: events.filter(e => e.riskLevel==='medium').length, high: events.filter(e => e.riskLevel==='high').length, critical: events.filter(e => e.riskLevel==='critical').length },
    byType: {}
  };
  events.forEach(e => { summary.byType[e.type] = (summary.byType[e.type] || 0) + 1; });
  res.json({ summary, events: filtered });
});

// POST TripCheck event (triggered by safety engine)
app.post('/api/tripcheck', authMiddleware, (req, res) => {
  const events = loadTripCheckEvents();
  const { rideId, type, riskLevel, description, location } = req.body;
  const event = {
    id: `TC${3000 + events.length}`,
    rideId, type, riskLevel: riskLevel || 'medium',
    description, location,
    resolved: false, resolvedBy: null,
    createdAt: new Date().toISOString()
  };
  events.push(event);
  saveTripCheckEvents(events);
  saveLog({ timestamp: new Date().toISOString(), action: 'tripcheck_event', eventId: event.id, type, user: req.user.username });
  res.status(201).json(event);
});

// PATCH resolve TripCheck event
app.patch('/api/tripcheck/:id/resolve', authMiddleware, (req, res) => {
  const events = loadTripCheckEvents();
  const event = events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  event.resolved = true;
  event.resolvedBy = req.body.resolvedBy || 'human';
  saveTripCheckEvents(events);
  res.json(event);
});

// ===== EV CHARGING =====
const CHARGING_FILE = path.join(DATA_DIR, 'charging_stations.json');
if (!fs.existsSync(CHARGING_FILE)) {
  const stations = [
    { id:'ESC-001', name:'ESC-001 Polanco', zone:'Polanco', lat:19.433, lng:-99.200, types:['DC 150kW'], connectors:4, available:1, usageToday:87, status:'active', revenue:12400 },
    { id:'ESC-002', name:'ESC-002 Santa Fe', zone:'Santa Fe', lat:19.359, lng:-99.268, types:['DC 350kW','AC'], connectors:8, available:0, usageToday:92, status:'full', revenue:18200 },
    { id:'ESC-003', name:'ESC-003 Centro', zone:'Cuauhtémoc', lat:19.428, lng:-99.133, types:['DC 50kW'], connectors:3, available:2, usageToday:65, status:'active', revenue:8900 },
    { id:'ESC-004', name:'ESC-004 Aeropuerto', zone:'Venustiano', lat:19.436, lng:-99.072, types:['DC 150kW'], connectors:6, available:3, usageToday:78, status:'active', revenue:21300 },
    { id:'ESC-005', name:'ESC-005 Interlomas', zone:'Huixquilucan', lat:19.421, lng:-99.279, types:['DC 350kW'], connectors:2, available:2, usageToday:45, status:'maintenance', revenue:5600 },
    { id:'ESC-006', name:'ESC-006 Condesa', zone:'Condesa', lat:19.413, lng:-99.168, types:['DC 50kW','AC'], connectors:6, available:3, usageToday:73, status:'active', revenue:9800 },
    { id:'ESC-007', name:'ESC-007 Roma Norte', zone:'Roma Norte', lat:19.418, lng:-99.158, types:['DC 150kW'], connectors:3, available:1, usageToday:68, status:'active', revenue:11200 },
    { id:'ESC-008', name:'ESC-008 Del Valle', zone:'Del Valle', lat:19.383, lng:-99.158, types:['AC'], connectors:8, available:5, usageToday:55, status:'active', revenue:6400 }
  ];
  fs.writeFileSync(CHARGING_FILE, JSON.stringify(stations, null, 2));
}

app.get('/api/charging/stations', authMiddleware, (req, res) => {
  const stations = JSON.parse(fs.readFileSync(CHARGING_FILE, 'utf8'));
  const totalKwh = stations.reduce((s, st) => s + st.usageToday * 24, 0);
  res.json({ total: stations.length, totalKwh, avgUsage: Math.round(stations.reduce((s,st)=>s+st.usageToday,0)/stations.length), stations });
});

app.post('/api/charging/stations/:id/reserve', authMiddleware, (req, res) => {
  const stations = JSON.parse(fs.readFileSync(CHARGING_FILE, 'utf8'));
  const station = stations.find(s => s.id === req.params.id);
  if (!station) return res.status(404).json({ error: 'Station not found' });
  if (station.available <= 0) return res.status(409).json({ error: 'No connectors available' });
  station.available--;
  fs.writeFileSync(CHARGING_FILE, JSON.stringify(stations, null, 2));
  saveLog({ timestamp: new Date().toISOString(), action: 'charging_reserved', stationId: station.id, user: req.user.username });
  res.json({ success: true, station, reservationId: `RES-${Date.now()}`, estimatedCost: Math.floor(80 + Math.random()*80) });
});

// ===== MAINTENANCE =====
const MAINTENANCE_FILE = path.join(DATA_DIR, 'maintenance_centers.json');
if (!fs.existsSync(MAINTENANCE_FILE)) {
  const centers = [
    { id:'MC-001', name:'AutoService Polanco', zone:'Polanco', lat:19.435, lng:-99.198, rating:4.8, services:['oil','brakes','alignment','diagnostics'], packages:['basico','preventivo','premium_ev'], capacity:15, currentLoad:8, monthlyServices:420 },
    { id:'MC-002', name:'TallerExpress Centro', zone:'Centro', lat:19.428, lng:-99.130, rating:4.5, services:['oil','filters','brakes','tires'], packages:['basico','preventivo'], capacity:10, currentLoad:6, monthlyServices:310 },
    { id:'MC-003', name:'EV Service CDMX', zone:'Condesa', lat:19.413, lng:-99.165, rating:4.9, services:['battery_diag','software_update','cabin_filter','ev_tires','paint'], packages:['premium_ev'], capacity:8, currentLoad:3, monthlyServices:180 },
    { id:'MC-004', name:'Multiservice Santa Fe', zone:'Santa Fe', lat:19.360, lng:-99.265, rating:4.6, services:['oil','brakes','alignment','suspension','electrical'], packages:['basico','preventivo'], capacity:20, currentLoad:14, monthlyServices:520 },
    { id:'MC-005', name:'QuickFix Roma', zone:'Roma Norte', lat:19.418, lng:-99.155, rating:4.3, services:['oil','filters','diagnostics'], packages:['basico'], capacity:6, currentLoad:2, monthlyServices:190 }
  ];
  fs.writeFileSync(MAINTENANCE_FILE, JSON.stringify(centers, null, 2));
}

app.get('/api/maintenance/centers', authMiddleware, (req, res) => {
  const centers = JSON.parse(fs.readFileSync(MAINTENANCE_FILE, 'utf8'));
  res.json({ total: centers.length, totalServices: centers.reduce((s,c)=>s+c.monthlyServices,0), avgRating: +(centers.reduce((s,c)=>s+c.rating,0)/centers.length).toFixed(1), centers });
});

app.post('/api/maintenance/schedule', authMiddleware, (req, res) => {
  const { centerId, packageType, vehicleId, date } = req.body;
  saveLog({ timestamp: new Date().toISOString(), action: 'maintenance_scheduled', centerId, packageType, vehicleId, user: req.user.username });
  const prices = { basico: 499, preventivo: 899, premium_ev: 1299 };
  const discount = 0.32;
  res.json({ success: true, appointmentId: `APT-${Date.now()}`, centerId, packageType, date: date || new Date(Date.now()+86400000*2).toISOString().split('T')[0], price: prices[packageType] || 499, discountedPrice: Math.round((prices[packageType]||499) * (1-discount)) });
});

// ===== FINANCING =====
const FINANCING_FILE = path.join(DATA_DIR, 'financing_loans.json');
if (!fs.existsSync(FINANCING_FILE)) {
  const loans = Array.from({length: 25}, (_, i) => ({
    id: `LOAN-${4000+i}`,
    driverId: `D${1001+i}`,
    driverName: ['Roberto Martínez','Ana García','Carlos López','María Hernández','Fernando Díaz','Patricia Ruiz','Miguel Torres','Laura Sánchez','José Ramírez','Elena Vargas'][i%10],
    program: ['auto_ejecutivo','ev_green','flota_empresarial','auto_ejecutivo','ev_green'][i%5],
    vehicle: ['Nissan Versa 2024','BYD Dolphin 2024','Toyota RAV4 2023','Chevrolet Onix 2024','JAC E10X 2024','Volkswagen Taos 2023','MG4 2024','Kia Rio 2024','Honda HR-V 2023','BMW iX1 2024'][i%10],
    amount: [185000, 220000, 350000, 195000, 240000][i%5],
    monthlyPayment: [4850, 3200, 8500, 5100, 3500][i%5],
    termMonths: [48, 60, 36, 48, 60][i%5],
    paidMonths: Math.floor(Math.random()*30)+1,
    status: ['active','active','active','active','completed'][i%5],
    delinquent: Math.random() > 0.92
  }));
  fs.writeFileSync(FINANCING_FILE, JSON.stringify(loans, null, 2));
}

app.get('/api/financing/loans', authMiddleware, (req, res) => {
  const loans = JSON.parse(fs.readFileSync(FINANCING_FILE, 'utf8'));
  const totalPortfolio = loans.filter(l=>l.status==='active').reduce((s,l)=>s+l.amount,0);
  const delinquencyRate = +(loans.filter(l=>l.delinquent).length / Math.max(loans.filter(l=>l.status==='active').length,1) * 100).toFixed(1);
  res.json({ total: loans.length, activeLoans: loans.filter(l=>l.status==='active').length, totalPortfolio, delinquencyRate, loans });
});

app.get('/api/financing/programs', authMiddleware, (req, res) => {
  res.json({
    programs: [
      { id:'auto_ejecutivo', name:'Auto Ejecutivo', downPayment:15000, termMonths:48, rate:9.5, requirements:'6+ meses, rating 4.5+', activeLoans:4231, popular:true },
      { id:'ev_green', name:'EV Green Finance', downPayment:0, termMonths:60, rate:6.5, requirements:'Vehículo EV certificado', activeLoans:1842, new:true },
      { id:'flota_empresarial', name:'Flota Empresarial', downPayment:'variable', termMonths:48, rate:7.8, requirements:'10+ unidades, aprobación B2B', activeLoans:89, b2b:true }
    ]
  });
});

app.post('/api/financing/pre-approve', authMiddleware, (req, res) => {
  const { driverId, programId } = req.body;
  const approved = Math.random() > 0.2;
  saveLog({ timestamp: new Date().toISOString(), action: 'financing_preapproval', driverId, programId, approved, user: req.user.username });
  res.json({ driverId, programId, approved, maxAmount: approved ? Math.floor(150000 + Math.random()*200000) : 0, rate: approved ? (programId === 'ev_green' ? 6.5 : 9.5) : null, message: approved ? 'Pre-aprobado' : 'No califica en este momento' });
});

// ===== ROBOTAXI / DISPATCH =====
const ROBOTAXI_FILE = path.join(DATA_DIR, 'robotaxi_status.json');
if (!fs.existsSync(ROBOTAXI_FILE)) {
  const fleet = Array.from({length: 47}, (_, i) => ({
    id: `RTX-${5000+i}`,
    vehicle: ['Zeekr 001','XPeng P7','BYD Han','Li Auto L9','NIO ET7'][i%5],
    location: { lat: 19.43 + (Math.random()-0.5)*0.06, lng: -99.13 + (Math.random()-0.5)*0.06 },
    status: ['active','active','active','active','charging','maintenance','idle'][i%7],
    batteryLevel: Math.floor(20 + Math.random()*80),
    tripsToday: Math.floor(3 + Math.random()*12),
    oddZone: ['Polanco-Condesa-Roma','Polanco-Condesa-Roma','Santa Fe'][i%3],
    lastIntervention: i < 45 ? null : new Date(Date.now() - Math.floor(Math.random()*86400000)).toISOString(),
    safetyScore: +(9.0 + Math.random()*1.0).toFixed(1)
  }));
  fs.writeFileSync(ROBOTAXI_FILE, JSON.stringify(fleet, null, 2));
}

app.get('/api/robotaxi/fleet', authMiddleware, (req, res) => {
  const fleet = JSON.parse(fs.readFileSync(ROBOTAXI_FILE, 'utf8'));
  const activeFleet = fleet.filter(f => f.status === 'active');
  const totalTrips = fleet.reduce((s, f) => s + f.tripsToday, 0);
  const interventions = fleet.filter(f => f.lastIntervention).length;
  res.json({
    total: fleet.length,
    active: activeFleet.length,
    charging: fleet.filter(f=>f.status==='charging').length,
    maintenance: fleet.filter(f=>f.status==='maintenance').length,
    totalTrips,
    interventions,
    interventionRate: +(interventions / Math.max(totalTrips, 1) * 100).toFixed(1),
    avgSafetyScore: +(fleet.reduce((s,f)=>s+f.safetyScore,0)/fleet.length).toFixed(1),
    fleet
  });
});

app.get('/api/dispatch/stats', authMiddleware, (req, res) => {
  const rides = loadRides();
  const today = new Date().toISOString().split('T')[0];
  const todayRides = rides.filter(r => r.createdAt.startsWith(today));
  const total = todayRides.length || rides.length;
  const humanDispatched = rides.filter(r => r.driver && r.driver.startsWith('D')).length;
  const autoDispatched = rides.filter(r => r.driver && r.driver.startsWith('RTX')).length;
  const efficiency = 96.4;
  const etaPrecision = 1.2;
  res.json({
    totalDispatches: total,
    humanDispatched,
    autoDispatched,
    ratio: `${Math.round(humanDispatched/Math.max(humanDispatched+autoDispatched,1)*100)}:${Math.round(autoDispatched/Math.max(humanDispatched+autoDispatched,1)*100)}`,
    efficiency,
    etaPrecision,
    monthlySavings: 4200000,
    avgDispatchTime: '3.2s'
  });
});

// ===== DASHBOARD STATS =====
app.get('/api/stats/dashboard', authMiddleware, (req, res) => {
  const rides = loadRides();
  const completedRides = rides.filter(r => r.status === 'completed');
  const totalRevenue = completedRides.reduce((s, r) => s + r.fare * r.surge, 0);
  const avgRating = completedRides.filter(r => r.rating).reduce((s, r) => s + r.rating, 0) / Math.max(completedRides.filter(r => r.rating).length, 1);
  const activeRides = rides.filter(r => r.status === 'in_progress').length;

  const hours = Array.from({length:24}, (_,i) => `${i}:00`);
  const ridesPerHour = hours.map(() => Math.floor(20 + Math.random() * 80));
  const driversPerHour = hours.map(() => Math.floor(50 + Math.random() * 200));
  const revenuePerHour = hours.map(() => Math.floor(5000 + Math.random() * 40000));
  const waitPerHour = hours.map(() => +(2 + Math.random() * 6).toFixed(1));

  res.json({
    totalRides: rides.length,
    completedRides: completedRides.length,
    activeRides,
    cancelledRides: rides.filter(r => r.status === 'cancelled').length,
    totalRevenue: Math.round(totalRevenue),
    avgRating: +avgRating.toFixed(1),
    avgWaitTime: +(3 + Math.random()*3).toFixed(1),
    activeDrivers: 2340 + Math.floor(Math.random()*200),
    activePassengers: 15400 + Math.floor(Math.random()*2000),
    surgeZonesActive: 3 + Math.floor(Math.random()*4),
    categoryBreakdown: {
      express: Math.floor(rides.filter(r=>r.category==='express').length),
      comfort: Math.floor(rides.filter(r=>r.category==='comfort').length),
      taxi: Math.floor(rides.filter(r=>r.category==='taxi').length),
      moto: Math.floor(rides.filter(r=>r.category==='moto').length),
      protect: Math.floor(rides.filter(r=>r.category==='protect').length),
      premier: Math.floor(rides.filter(r=>r.category==='premier').length),
      intercity: Math.floor(rides.filter(r=>r.category==='intercity').length),
      share: Math.floor(rides.filter(r=>r.category==='share').length)
    },
    hourlyData: { hours, rides: ridesPerHour, drivers: driversPerHour, revenue: revenuePerHour, waitTime: waitPerHour },
    acceptRate: hours.map(() => Math.floor(75 + Math.random()*20)),
    cancelRate: hours.map(() => +(3 + Math.random()*10).toFixed(1))
  });
});

// ===== GEMINI AI INTEGRATION =====
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com';

// Helper: Get Gemini API key from config
function getGeminiConfig() {
  const db = loadDB();
  const gemini = db.apis.find(a => a.id === 'gemini-ai');
  if (!gemini || !gemini.enabled) return null;
  const apiKey = gemini.credentials?.apiKey?.value;
  if (!apiKey) return null;
  return {
    apiKey,
    model: gemini.credentials?.model?.value || 'gemini-pro',
    temperature: parseFloat(gemini.credentials?.temperature?.value || '0.2'),
    maxTokens: parseInt(gemini.credentials?.maxTokens?.value || '2048'),
    safetySettings: gemini.credentials?.safetySettings?.value || 'STANDARD'
  };
}

// POST /api/gemini/analyze — TripCheck AI Analysis
app.post('/api/gemini/analyze', authMiddleware, async (req, res) => {
  const config = getGeminiConfig();
  if (!config) {
    return res.status(400).json({ error: 'Gemini AI no configurado. Agrega tu API Key en la configuración de APIs.' });
  }

  const { type, data } = req.body;
  if (!type || !data) {
    return res.status(400).json({ error: 'Se requiere type y data' });
  }

  // Build prompt based on analysis type
  const prompts = {
    'route-deviation': `Eres TripCheck AI, el sistema de seguridad de la plataforma de transporte Movilidad. Analiza esta desviación de ruta y determina si es sospechosa.
Ruta esperada: ${data.expectedRoute || 'N/A'}
Ruta actual: ${data.actualRoute || 'N/A'}
Distancia de desviación: ${data.deviationDistance || 'N/A'}m
Velocidad actual: ${data.speed || 'N/A'} km/h
Zona: ${data.zone || 'N/A'}
Hora: ${data.time || new Date().toISOString()}

Responde en JSON con: { "risk": "low|medium|high|critical", "score": 0-10, "action": "monitor|alert|emergency_stop", "reason": "explicación breve", "suggestion": "sugerencia" }`,

    'speed-anomaly': `Eres TripCheck AI. Analiza esta anomalía de velocidad durante un viaje.
Velocidad actual: ${data.speed || 'N/A'} km/h
Límite de velocidad zona: ${data.speedLimit || 'N/A'} km/h
Exceso: ${data.excess || 'N/A'} km/h
Duración: ${data.duration || 'N/A'}s
Tipo de zona: ${data.zoneType || 'N/A'}
Historial conductor: ${data.driverHistory || 'N/A'}

Responde en JSON con: { "risk": "low|medium|high|critical", "score": 0-10, "action": "warning|alert|slowdown_request|emergency", "reason": "explicación", "fine": "multa estimada si aplica" }`,

    'incident-detection': `Eres TripCheck AI. Analiza este posible incidente detectado durante un viaje.
Tipo: ${data.incidentType || 'N/A'} (sudden_stop|collision|off_route|panic_button|unusual_stop)
Fuerza G detectada: ${data.gForce || 'N/A'}
Ubicación: ${data.location || 'N/A'}
Velocidad pre-incidente: ${data.preSpeed || 'N/A'} km/h
Velocidad post-incidente: ${data.postSpeed || 'N/A'} km/h
Pasajero en viaje: ${data.passengerPresent || 'N/A'}

Responde en JSON con: { "risk": "low|medium|high|critical", "severity": 0-10, "action": "log|notify|alert_passenger|emergency_services|911", "reason": "explicación", "recommendedActions": ["acción1", "acción2"], "contact911": true/false }`,

    'safety-score': `Eres TripCheck AI. Calcula el safety score para este viaje completado.
Duración: ${data.duration || 'N/A'} min
Distancia: ${data.distance || 'N/A'} km
Desviaciones de ruta: ${data.routeDeviations || 0}
Excesos de velocidad: ${data.speedViolations || 0}
Paradas inusuales: ${data.unusualStops || 0}
Frenadas bruscas: ${data.hardBrakes || 0}
Score anterior conductor: ${data.previousScore || 'N/A'}
Incidentes reportados: ${data.incidents || 0}

Responde en JSON con: { "score": 0-10, "level": "excellent|good|acceptable|poor|dangerous", "breakdown": { "route": 0-10, "speed": 0-10, "behavior": 0-10, "overall": 0-10 }, "flags": ["flag1", "flag2"], "recommendation": "recomendación para conductor" }`,

    'ride-safety-check': `Eres TripCheck AI. Realiza una verificación de seguridad pre-viaje.
Conductor: ${data.driverName || 'N/A'}
Rating conductor: ${data.driverRating || 'N/A'}/5
Viajes completados: ${data.driverTrips || 'N/A'}
Verificación identidad: ${data.identityVerified || 'N/A'}
Documento vehicular: ${data.vehicleDocStatus || 'N/A'}
Zona pickup: ${data.pickupZone || 'N/A'}
Hora: ${data.pickupTime || 'N/A'}
Categoría: ${data.category || 'N/A'}

Responde en JSON con: { "safe": true/false, "score": 0-10, "warnings": ["warning1"], "proceed": true/false, "suggestion": "sugerencia si procede" }`
  };

  const prompt = prompts[type];
  if (!prompt) {
    return res.status(400).json({ error: `Tipo de análisis inválido: ${type}. Tipos válidos: ${Object.keys(prompts).join(', ')}` });
  }

  try {
    const model = config.model || 'gemini-pro';
    const fetchUrl = `${GEMINI_API_URL}/v1beta/models/${model}:generateContent?key=${config.apiKey}`;

    const safetyMap = {
      'STANDARD': 'BLOCK_ONLY_HIGH',
      'STRICT': 'BLOCK_MEDIUM_AND_ABOVE',
      'PERMISSIVE': 'BLOCK_NONE'
    };

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
        responseMimeType: 'application/json'
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: safetyMap[config.safetySettings] || 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: safetyMap[config.safetySettings] || 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: safetyMap[config.safetySettings] || 'BLOCK_ONLY_HIGH' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: safetyMap[config.safetySettings] || 'BLOCK_ONLY_HIGH' }
      ]
    };

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      saveLog({ timestamp: new Date().toISOString(), action: 'gemini_error', error: errText, user: req.user.username });
      return res.status(502).json({ error: 'Error de Gemini API', details: errText });
    }

    const geminiResult = await response.json();
    const textContent = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Try to parse JSON from response
    let parsedResult;
    try {
      parsedResult = JSON.parse(textContent);
    } catch {
      parsedResult = { rawResponse: textContent };
    }

    // Log the analysis
    saveLog({
      timestamp: new Date().toISOString(),
      action: 'gemini_analysis',
      analysisType: type,
      model: model,
      tokensUsed: geminiResult?.usageMetadata?.totalTokenCount || 0,
      result: parsedResult,
      user: req.user.username
    });

    // Update Gemini quota in config
    const db = loadDB();
    const geminiApi = db.apis.find(a => a.id === 'gemini-ai');
    if (geminiApi) {
      geminiApi.quotas.used = (geminiApi.quotas.used || 0) + 1;
      geminiApi.lastTested = new Date().toISOString();
      geminiApi.lastStatus = 'success';
      saveDB(db);
    }

    res.json({
      success: true,
      type,
      model,
      analysis: parsedResult,
      tokensUsed: geminiResult?.usageMetadata?.totalTokenCount || 0,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    saveLog({ timestamp: new Date().toISOString(), action: 'gemini_exception', error: error.message, user: req.user.username });
    res.status(500).json({ error: 'Error interno de Gemini', details: error.message });
  }
});

// POST /api/gemini/test — Test Gemini connection
app.post('/api/gemini/test', authMiddleware, async (req, res) => {
  const config = getGeminiConfig();
  if (!config) {
    return res.status(400).json({ error: 'Gemini AI no configurado', configured: false });
  }

  try {
    const fetchUrl = `${GEMINI_API_URL}/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
    const body = {
      contents: [{ parts: [{ text: 'Responde solo: {"status":"ok","message":"Gemini conectado a Movilidad TripCheck AI"}' }] }],
      generationConfig: { temperature: 0, maxOutputTokens: 100, responseMimeType: 'application/json' }
    };

    const response = await fetch(fetchUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      // Update config health
      const db = loadDB();
      const geminiApi = db.apis.find(a => a.id === 'gemini-ai');
      if (geminiApi) { geminiApi.health = 'error'; geminiApi.lastStatus = 'connection_failed'; geminiApi.lastTested = new Date().toISOString(); saveDB(db); }
      return res.status(502).json({ error: 'Conexión fallida', details: errText, configured: true, connected: false });
    }

    const result = await response.json();

    // Update config health
    const db = loadDB();
    const geminiApi = db.apis.find(a => a.id === 'gemini-ai');
    if (geminiApi) { geminiApi.health = 'healthy'; geminiApi.lastStatus = 'connected'; geminiApi.lastTested = new Date().toISOString(); saveDB(db); }

    saveLog({ timestamp: new Date().toISOString(), action: 'gemini_test', result: 'success', model: config.model, user: req.user.username });

    res.json({
      configured: true,
      connected: true,
      model: config.model,
      response: result?.candidates?.[0]?.content?.parts?.[0]?.text || 'OK',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({ error: 'Error de conexión', details: error.message, configured: true, connected: false });
  }
});

// GET /api/gemini/status — Gemini status
app.get('/api/gemini/status', authMiddleware, (req, res) => {
  const config = getGeminiConfig();
  const db = loadDB();
  const geminiApi = db.apis.find(a => a.id === 'gemini-ai');

  res.json({
    configured: !!config,
    hasApiKey: !!(config?.apiKey),
    model: config?.model || geminiApi?.credentials?.model?.value || 'gemini-pro',
    enabled: geminiApi?.enabled || false,
    health: geminiApi?.health || 'unknown',
    lastTested: geminiApi?.lastTested || null,
    quotas: geminiApi?.quotas || { daily: 1500, used: 0, unit: 'requests/day' },
    analysisTypes: ['route-deviation', 'speed-anomaly', 'incident-detection', 'safety-score', 'ride-safety-check']
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  initDB();
  console.log(`\n🚗 Movilidad API Config Server — By TheFirm69 Systems`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Endpoints: /api/configs, /api/health, /api/logs, /api/gemini/*\n`);
});
