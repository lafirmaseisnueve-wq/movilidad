/* ================================================
   MOVILIDAD - API Configuration & Services
   All API integrations for 100% functionality
   ================================================ */

const MovilidadAPI = {
  // ===== API KEYS CONFIG =====
  config: {
    GOOGLE_MAPS_KEY: 'AIzaSyDemo-Key-Replace-With-Real',
    MAPBOX_TOKEN: 'pk.eyJ1IjoibW92aWxpZGFkIiwiYSI6ImNrdGVzdCJ9.demo',
    HERE_APP_ID: 'demo-here-app-id',
    HERE_APP_CODE: 'demo-here-app-code',
    STRIPE_PK: 'pk_test_demo_stripe_key',
    TWILIO_SID: 'ACdemo_twilio_sid',
    FIREBASE_CONFIG: {
      apiKey: "AIzaSyDemo-firebase-key",
      authDomain: "movilidad.firebaseapp.com",
      projectId: "movilidad-app",
      storageBucket: "movilidad-app.appspot.com",
      messagingSenderId: "123456789",
      appId: "1:123456789:web:demo"
    },
    SOCKET_URL: 'https://api.movilidad.app',
    CLOUDINARY_CLOUD: 'movilidad-uploads',
    SENDGRID_KEY: 'SG.demo_sendgrid_key'
  },

  // ===== ENDPOINTS =====
  endpoints: {
    base: 'https://api.movilidad.app/v1',
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      refreshToken: '/auth/refresh',
      verifyPhone: '/auth/verify-phone',
      forgotPassword: '/auth/forgot-password'
    },
    riders: {
      profile: '/riders/profile',
      updateProfile: '/riders/profile/update',
      rideHistory: '/riders/rides',
      favorites: '/riders/favorites',
      paymentMethods: '/riders/payment-methods',
      promoCodes: '/riders/promo-codes',
      rateDriver: '/riders/rate-driver'
    },
    drivers: {
      profile: '/drivers/profile',
      updateProfile: '/drivers/profile/update',
      documents: '/drivers/documents',
      documentUpload: '/drivers/documents/upload',
      rideHistory: '/drivers/rides',
      earnings: '/drivers/earnings',
      wallet: '/drivers/wallet',
      withdraw: '/drivers/wallet/withdraw',
      incentives: '/drivers/incentives',
      acceptanceRate: '/drivers/metrics/acceptance',
      goOnline: '/drivers/status/online',
      goOffline: '/drivers/status/offline'
    },
    rides: {
      request: '/rides/request',
      accept: '/rides/{id}/accept',
      reject: '/rides/{id}/reject',
      cancel: '/rides/{id}/cancel',
      start: '/rides/{id}/start',
      complete: '/rides/{id}/complete',
      track: '/rides/{id}/track',
      estimate: '/rides/estimate',
      directions: '/rides/directions',
      scheduled: '/rides/scheduled'
    },
    admin: {
      dashboard: '/admin/dashboard',
      users: '/admin/users',
      drivers: '/admin/drivers',
      driverApprove: '/admin/drivers/{id}/approve',
      driverReject: '/admin/drivers/{id}/reject',
      driverBan: '/admin/drivers/{id}/ban',
      riderBan: '/admin/riders/{id}/ban',
      fleets: '/admin/fleets',
      fleetCreate: '/admin/fleets/create',
      surgeConfig: '/admin/surge/config',
      surgeZones: '/admin/surge/zones',
      incentivesCreate: '/admin/incentives/create',
      promoCreate: '/admin/promo-codes/create',
      liveMap: '/admin/live-map',
      sosAlerts: '/admin/sos-alerts',
      tripCheckAlerts: '/admin/tripcheck-alerts',
      tickets: '/admin/tickets',
      ticketUpdate: '/admin/tickets/{id}/update',
      analytics: '/admin/analytics',
      geofences: '/admin/geofences',
      cityConfig: '/admin/cities/{id}/config',
      commissions: '/admin/commissions',
      billingDisperse: '/admin/billing/disperse'
    },
    payments: {
      createPaymentIntent: '/payments/create-intent',
      confirmPayment: '/payments/confirm',
      refund: '/payments/refund',
      cashConfirm: '/payments/cash-confirm'
    },
    safety: {
      sosTrigger: '/safety/sos-trigger',
      shareTrip: '/safety/share-trip',
      tripCheckStatus: '/safety/tripcheck/{rideId}',
      emergencyContacts: '/safety/emergency-contacts',
      maskedCall: '/safety/masked-call',
      maskedChat: '/safety/masked-chat'
    },
    geospatial: {
      geocode: '/geospatial/geocode',
      reverseGeocode: '/geospatial/reverse-geocode',
      nearbyDrivers: '/geospatial/nearby-drivers',
      route: '/geospatial/route',
      eta: '/geospatial/eta',
      heatmap: '/geospatial/heatmap',
      geofenceCheck: '/geospatial/geofence-check'
    }
  },

  // ===== SOCKET EVENTS =====
  socketEvents: {
    DRIVER_LOCATION_UPDATE: 'driver:location',
    RIDE_REQUEST: 'ride:request',
    RIDE_ACCEPTED: 'ride:accepted',
    RIDE_STARTED: 'ride:started',
    RIDE_COMPLETED: 'ride:completed',
    RIDE_CANCELLED: 'ride:cancelled',
    SURGE_UPDATE: 'surge:update',
    SOS_ALERT: 'sos:alert',
    TRIPCHECK_ALERT: 'tripcheck:alert',
    DRIVER_ONLINE: 'driver:online',
    DRIVER_OFFLINE: 'driver:offline'
  }
};

// ===== API SERVICE CLASS =====
class ApiService {
  constructor() {
    this.baseUrl = MovilidadAPI.endpoints.base;
    this.token = localStorage.getItem('mov_token') || null;
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('mov_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('mov_token');
  }

  async request(method, endpoint, data = null, params = null) {
    const url = new URL(this.baseUrl + endpoint);
    if (params) Object.entries(params).forEach(([k,v]) => url.searchParams.set(k,v));
    
    const headers = {
      'Content-Type': 'application/json',
      'X-App-Version': '1.0.0',
      'X-Platform': 'web'
    };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

    const opts = { method, headers };
    if (data && method !== 'GET') opts.body = JSON.stringify(data);

    try {
      const res = await fetch(url.toString(), opts);
      if (res.status === 401) { this.clearToken(); window.location.href = '/login'; return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'API Error');
      return json;
    } catch (err) {
      console.error(`[Movilidad API] ${method} ${endpoint}:`, err);
      throw err;
    }
  }

  get(endpoint, params) { return this.request('GET', endpoint, null, params); }
  post(endpoint, data) { return this.request('POST', endpoint, data); }
  put(endpoint, data) { return this.request('PUT', endpoint, data); }
  patch(endpoint, data) { return this.request('PATCH', endpoint, data); }
  delete(endpoint) { return this.request('DELETE', endpoint); }
}

const api = new ApiService();

// ===== GOOGLE MAPS SERVICE =====
class GoogleMapsService {
  constructor() {
    this.placesService = null;
    this.directionsService = null;
    this.geocoder = null;
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return;
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${MovilidadAPI.config.GOOGLE_MAPS_KEY}&libraries=places,geometry,drawing,visualization&callback=gmapsReady`;
      window.gmapsReady = () => {
        this.placesService = new google.maps.places.PlacesService(document.createElement('div'));
        this.directionsService = new google.maps.DirectionsService();
        this.geocoder = new google.maps.Geocoder();
        this.loaded = true;
        resolve();
      };
      document.head.appendChild(script);
    });
  }

  async autocomplete(input, bounds = null) {
    if (!this.loaded) await this.load();
    return new Promise((resolve, reject) => {
      this.placesService.getPlacePredictions({
        input,
        componentRestrictions: { country: 'MX' },
        bounds: bounds
      }, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) resolve(results);
        else reject(status);
      });
    });
  }

  async geocode(address) {
    if (!this.loaded) await this.load();
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') resolve(results[0]);
        else reject(status);
      });
    });
  }

  async reverseGeocode(lat, lng) {
    if (!this.loaded) await this.load();
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK') resolve(results[0]);
        else reject(status);
      });
    });
  }

  async getRoute(origin, destination, waypoints = []) {
    if (!this.loaded) await this.load();
    return new Promise((resolve, reject) => {
      this.directionsService.route({
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
        drivingOptions: { departureTime: new Date(), trafficModel: 'bestguess' }
      }, (result, status) => {
        if (status === 'OK') resolve(result);
        else reject(status);
      });
    });
  }

  async getETA(origin, destination) {
    const route = await this.getRoute(origin, destination);
    const leg = route.routes[0].legs[0];
    return {
      duration: leg.duration.text,
      durationValue: leg.duration.value,
      distance: leg.distance.text,
      distanceValue: leg.distance.value,
      durationInTraffic: leg.duration_in_traffic?.text || leg.duration.text
    };
  }

  createMap(element, center, zoom = 14) {
    return new google.maps.Map(element, {
      center, zoom, disableDefaultUI: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] }
      ]
    });
  }
}

const mapsService = new GoogleMapsService();

// ===== REAL-TIME SERVICE (Socket.IO) =====
class RealtimeService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.handlers = {};
  }

  connect(token) {
    if (this.connected) return;
    this.socket = io(MovilidadAPI.config.SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      upgrade: true
    });
    this.socket.on('connect', () => { this.connected = true; console.log('[Socket] Connected'); });
    this.socket.on('disconnect', () => { this.connected = false; console.log('[Socket] Disconnected'); });
    this.socket.on('connect_error', (err) => console.error('[Socket] Error:', err));
  }

  disconnect() {
    if (this.socket) { this.socket.disconnect(); this.connected = false; }
  }

  on(event, callback) {
    if (!this.handlers[event]) this.handlers[event] = [];
    this.handlers[event].push(callback);
    if (this.socket) this.socket.on(event, callback);
  }

  off(event, callback) {
    if (this.socket) this.socket.off(event, callback);
  }

  emit(event, data) {
    if (this.socket && this.connected) this.socket.emit(event, data);
  }

  // Driver sends GPS position every 3 seconds
  sendDriverLocation(lat, lng, heading, speed) {
    this.emit(MovilidadAPI.socketEvents.DRIVER_LOCATION_UPDATE, {
      lat, lng, heading, speed, timestamp: Date.now()
    });
  }

  // Admin listens to all driver positions
  onDriverLocationUpdate(callback) { this.on(MovilidadAPI.socketEvents.DRIVER_LOCATION_UPDATE, callback); }

  // Driver receives ride requests
  onRideRequest(callback) { this.on(MovilidadAPI.socketEvents.RIDE_REQUEST, callback); }

  // Rider gets ride accepted
  onRideAccepted(callback) { this.on(MovilidadAPI.socketEvents.RIDE_ACCEPTED, callback); }

  // SOS alerts for admin SOC
  onSOSAlert(callback) { this.on(MovilidadAPI.socketEvents.SOS_ALERT, callback); }

  // TripCheck deviation alerts
  onTripCheckAlert(callback) { this.on(MovilidadAPI.socketEvents.TRIPCHECK_ALERT, callback); }

  // Surge pricing updates
  onSurgeUpdate(callback) { this.on(MovilidadAPI.socketEvents.SURGE_UPDATE, callback); }
}

const realtimeService = new RealtimeService();

// ===== PAYMENT SERVICE (Stripe) =====
class PaymentService {
  constructor() {
    this.stripe = null;
  }

  async init() {
    this.stripe = Stripe(MovilidadAPI.config.STRIPE_PK);
  }

  async createPaymentIntent(amount, currency = 'MXN', metadata = {}) {
    return api.post(MovilidadAPI.endpoints.payments.createPaymentIntent, {
      amount: Math.round(amount * 100), currency, metadata
    });
  }

  async confirmPayment(paymentIntentId, paymentMethodId) {
    return api.post(MovilidadAPI.endpoints.payments.confirmPayment, {
      payment_intent_id: paymentIntentId,
      payment_method_id: paymentMethodId
    });
  }

  async refund(paymentIntentId, amount = null) {
    return api.post(MovilidadAPI.endpoints.payments.refund, {
      payment_intent_id: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : null
    });
  }

  async confirmCashRide(rideId) {
    return api.post(MovilidadAPI.endpoints.payments.cashConfirm, { ride_id: rideId });
  }

  async getPaymentMethods() {
    return api.get(MovilidadAPI.endpoints.riders.paymentMethods);
  }
}

const paymentService = new PaymentService();

// ===== SAFETY SERVICE =====
class SafetyService {
  async triggerSOS(rideId, lat, lng, type = 'rider') {
    return api.post(MovilidadAPI.endpoints.safety.sosTrigger, {
      ride_id: rideId, lat, lng, type, timestamp: Date.now()
    });
  }

  async shareTrip(rideId, contactPhone, contactName) {
    return api.post(MovilidadAPI.endpoints.safety.shareTrip, {
      ride_id: rideId, contact_phone: contactPhone, contact_name: contactName
    });
  }

  async getTripCheckStatus(rideId) {
    return api.get(MovilidadAPI.endpoints.safety.tripCheckStatus.replace('{rideId}', rideId));
  }

  async addEmergencyContact(name, phone, relation) {
    return api.post(MovilidadAPI.endpoints.safety.emergencyContacts, { name, phone, relation });
  }

  async initiateMaskedCall(riderPhone, driverPhone) {
    return api.post(MovilidadAPI.endpoints.safety.maskedCall, {
      rider_phone: riderPhone, driver_phone: driverPhone
    });
  }

  async sendMaskedChat(rideId, message, senderType) {
    return api.post(MovilidadAPI.endpoints.safety.maskedChat, {
      ride_id: rideId, message, sender_type: senderType
    });
  }
}

const safetyService = new SafetyService();

// ===== GEOSPATIAL SERVICE (Geohash / S2) =====
class GeospatialService {
  // Geohash encoding
  static BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';

  static encodeGeohash(lat, lng, precision = 12) {
    const BASE32 = GeospatialService.BASE32;
    let hash = '';
    let bits = 0, bit = 0, idx = 0;
    let latRange = [-90, 90], lngRange = [-180, 180];
    while (hash.length < precision) {
      if (idx % 2 === 0) {
        const mid = (lngRange[0] + lngRange[1]) / 2;
        if (lng >= mid) { bit = bit * 2 + 1; lngRange[0] = mid; }
        else { bit = bit * 2; lngRange[1] = mid; }
      } else {
        const mid = (latRange[0] + latRange[1]) / 2;
        if (lat >= mid) { bit = bit * 2 + 1; latRange[0] = mid; }
        else { bit = bit * 2; latRange[1] = mid; }
      }
      idx++;
      bits++;
      if (bits === 5) { hash += BASE32[bit]; bits = 0; bit = 0; }
    }
    return hash;
  }

  static decodeGeohash(hash) {
    const BASE32 = GeospatialService.BASE32;
    let latRange = [-90, 90], lngRange = [-180, 180];
    let isLng = true;
    for (const ch of hash) {
      const idx = BASE32.indexOf(ch);
      for (let i = 4; i >= 0; i--) {
        const bit = (idx >> i) & 1;
        if (isLng) {
          const mid = (lngRange[0] + lngRange[1]) / 2;
          if (bit) lngRange[0] = mid; else lngRange[1] = mid;
        } else {
          const mid = (latRange[0] + latRange[1]) / 2;
          if (bit) latRange[0] = mid; else latRange[1] = mid;
        }
        isLng = !isLng;
      }
    }
    return {
      lat: (latRange[0] + latRange[1]) / 2,
      lng: (lngRange[0] + lngRange[1]) / 2
    };
  }

  // Haversine distance in km
  static haversineKm(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }

  // Find nearest drivers using Geohash prefix matching
  static findNearbyDrivers(driverGeohashes, riderLat, riderLng, radiusKm = 5) {
    const riderHash = GeospatialService.encodeGeohash(riderLat, riderLng, 8);
    const prefix4 = riderHash.substring(0, 4);
    return driverGeohashes
      .filter(d => d.geohash.startsWith(prefix4))
      .map(d => {
        const pos = GeospatialService.decodeGeohash(d.geohash);
        return { ...d, ...pos, distance: GeospatialService.haversineKm(riderLat, riderLng, pos.lat, pos.lng) };
      })
      .filter(d => d.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }
}

const geospatialService = GeospatialService;

// ===== SURGE PRICING ENGINE =====
class SurgeEngine {
  constructor() {
    this.zones = {};
    this.baseMultiplier = 1.0;
  }

  // Process real-time supply/demand events (Kafka-style)
  processEvent(event) {
    const { zoneId, type, timestamp } = event;
    if (!this.zones[zoneId]) {
      this.zones[zoneId] = { requests: 0, drivers: 0, multiplier: 1.0 };
    }
    const zone = this.zones[zoneId];
    if (type === 'ride_request') zone.requests++;
    else if (type === 'ride_complete') zone.requests = Math.max(0, zone.requests - 1);
    else if (type === 'driver_online') zone.drivers++;
    else if (type === 'driver_offline') zone.drivers = Math.max(0, zone.drivers - 1);

    // Calculate multiplier based on ratio
    const ratio = zone.drivers > 0 ? zone.requests / zone.drivers : 5;
    if (ratio > 3) zone.multiplier = 3.0;
    else if (ratio > 2) zone.multiplier = 2.0;
    else if (ratio > 1.5) zone.multiplier = 1.5;
    else if (ratio > 1) zone.multiplier = 1.2;
    else zone.multiplier = 1.0;

    return { zoneId, ...zone };
  }

  getSurgeForZone(zoneId) {
    return this.zones[zoneId] || { requests: 0, drivers: 0, multiplier: 1.0 };
  }

  calculatePrice(basePrice, zoneId) {
    const surge = this.getSurgeForZone(zoneId);
    return {
      base: basePrice,
      multiplier: surge.multiplier,
      total: +(basePrice * surge.multiplier).toFixed(2),
      surgeActive: surge.multiplier > 1.0
    };
  }
}

const surgeEngine = new SurgeEngine();

// ===== TRIP CHECK ENGINE =====
class TripCheckEngine {
  constructor() {
    this.activeTrips = {};
    this.deviationThreshold = 500; // meters
    this.stopDurationThreshold = 180; // seconds (3 min)
  }

  startTrip(rideId, plannedRoute) {
    this.activeTrips[rideId] = {
      plannedRoute,
      lastUpdate: Date.now(),
      lastPosition: null,
      deviations: 0,
      stops: 0,
      status: 'normal'
    };
  }

  updatePosition(rideId, lat, lng) {
    const trip = this.activeTrips[rideId];
    if (!trip) return null;

    const now = Date.now();
    const position = { lat, lng, timestamp: now };

    // Check deviation from route
    const deviation = this.calculateDeviationFromRoute(lat, lng, trip.plannedRoute);
    if (deviation > this.deviationThreshold) {
      trip.deviations++;
      if (trip.deviations > 3) {
        trip.status = 'deviation_alert';
        return { rideId, status: 'deviation_alert', deviation, message: 'Unusual route deviation detected' };
      }
    } else {
      trip.deviations = Math.max(0, trip.deviations - 1);
    }

    // Check for unusual stops
    if (trip.lastPosition) {
      const distance = GeospatialService.haversineKm(trip.lastPosition.lat, trip.lastPosition.lng, lat, lng);
      if (distance < 0.01) { // Less than 10m movement
        const stoppedTime = (now - trip.lastUpdate) / 1000;
        if (stoppedTime > this.stopDurationThreshold) {
          trip.stops++;
          trip.status = 'stop_alert';
          return { rideId, status: 'stop_alert', duration: stoppedTime, message: 'Unusual long stop detected' };
        }
      } else {
        trip.stops = 0;
      }
    }

    trip.lastPosition = position;
    trip.lastUpdate = now;
    if (trip.deviations === 0 && trip.stops === 0) trip.status = 'normal';

    return { rideId, status: trip.status, deviation, deviations: trip.deviations };
  }

  endTrip(rideId) {
    delete this.activeTrips[rideId];
  }

  calculateDeviationFromRoute(lat, lng, route) {
    // Simplified: find minimum distance to any point on planned route
    let minDist = Infinity;
    for (const point of route) {
      const d = GeospatialService.haversineKm(lat, lng, point.lat, point.lng) * 1000; // meters
      if (d < minDist) minDist = d;
    }
    return minDist;
  }
}

const tripCheckEngine = new TripCheckEngine();

// ===== DISPATCH ENGINE (Matchmaking) =====
class DispatchEngine {
  constructor() {
    this.onlineDrivers = [];
  }

  updateDrivers(drivers) {
    this.onlineDrivers = drivers;
  }

  findBestMatch(riderLat, riderLng, category = 'express', maxResults = 3) {
    const nearby = GeospatialService.findNearbyDrivers(
      this.onlineDrivers.map(d => ({ id: d.id, geohash: d.geohash, rating: d.rating, category: d.category })),
      riderLat, riderLng, 10
    );

    return nearby
      .filter(d => d.category === category || category === 'any')
      .sort((a, b) => {
        // Priority: distance first, then rating
        const distDiff = a.distance - b.distance;
        if (Math.abs(distDiff) < 0.5) return b.rating - a.rating;
        return distDiff;
      })
      .slice(0, maxResults);
  }
}

const dispatchEngine = new DispatchEngine();

// ===== MOCK DATA GENERATOR =====
class MockData {
  static cities = ['CDMX', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Mérida', 'Querétaro'];
  static categories = ['express', 'comfort', 'taxi', 'moto', 'protect', 'share'];

  static randomLocations(count = 20) {
    const locations = [];
    // CDMX approximate bounds
    for (let i = 0; i < count; i++) {
      locations.push({
        id: `loc_${i}`,
        lat: 19.38 + (Math.random() - 0.5) * 0.15,
        lng: -99.13 + (Math.random() - 0.5) * 0.15,
        geohash: '', // will be computed
        heading: Math.random() * 360,
        speed: 5 + Math.random() * 40,
        category: this.categories[Math.floor(Math.random() * this.categories.length)],
        rating: 3.5 + Math.random() * 1.5,
        name: `Conductor ${i + 1}`,
        plate: `M${Math.floor(Math.random() * 900 + 100)}ABC`,
        vehicle: ['Nissan Versa', 'Toyota Corolla', 'Chevrolet Aveo', 'Kia Rio', 'Honda Fit'][Math.floor(Math.random() * 5)]
      });
      locations[i].geohash = GeospatialService.encodeGeohash(locations[i].lat, locations[i].lng, 8);
    }
    return locations;
  }

  static surgeZones() {
    return [
      { id: 'z1', name: 'Polanco', lat: 19.4326, lng: -99.1936, multiplier: 2.5, requests: 45, drivers: 8, color: '#7C3AED' },
      { id: 'z2', name: 'Condesa', lat: 19.4135, lng: -99.1865, multiplier: 1.5, requests: 22, drivers: 12, color: '#F59E0B' },
      { id: 'z3', name: 'Roma Norte', lat: 19.4180, lng: -99.1690, multiplier: 1.2, requests: 15, drivers: 14, color: '#A78BFA' },
      { id: 'z4', name: 'Santa Fe', lat: 19.3593, lng: -99.2770, multiplier: 3.0, requests: 60, drivers: 5, color: '#EC4899' },
      { id: 'z5', name: 'Centro Histórico', lat: 19.4326, lng: -99.1332, multiplier: 1.0, requests: 10, drivers: 20, color: '#10B981' },
      { id: 'z6', name: 'Del Valle', lat: 19.3950, lng: -99.1600, multiplier: 1.8, requests: 30, drivers: 10, color: '#EF4444' }
    ];
  }

  static riders() {
    return [
      { id: 'r1', name: 'María García', phone: '+525512345678', rating: 4.8, trips: 156, verified: true, avatar: '👩' },
      { id: 'r2', name: 'Carlos López', phone: '+525587654321', rating: 4.2, trips: 42, verified: true, avatar: '👨' },
      { id: 'r3', name: 'Ana Martínez', phone: '+525511122233', rating: 3.1, trips: 8, verified: false, avatar: '👩‍🦰' },
      { id: 'r4', name: 'Roberto Sánchez', phone: '+525544556677', rating: 2.5, trips: 3, verified: false, avatar: '🧑' },
      { id: 'r5', name: 'Laura Hernández', phone: '+525599887766', rating: 4.9, trips: 230, verified: true, avatar: '👩‍🦱' }
    ];
  }

  static tickets() {
    return [
      { id: 't1', rider: 'María García', type: 'cargo_incorrecto', status: 'open', priority: 'high', date: '2024-01-15', description: 'Se cobró el doble del viaje express' },
      { id: 't2', rider: 'Carlos López', type: 'objeto_olvidado', status: 'in_progress', priority: 'medium', date: '2024-01-15', description: 'Olvidé mi mochila en el asiento trasero' },
      { id: 't3', driver: 'Conductor 5', type: 'accidente', status: 'open', priority: 'critical', date: '2024-01-14', description: 'Choque menor en Periférico' },
      { id: 't4', rider: 'Ana Martínez', type: 'mal_comportamiento', status: 'resolved', priority: 'low', date: '2024-01-13', description: 'Conductor grosero' }
    ];
  }

  static analytics() {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const drivers = hours.map(() => Math.floor(50 + Math.random() * 200));
    const rides = hours.map(() => Math.floor(30 + Math.random() * 180));
    const revenue = hours.map(() => Math.floor(2000 + Math.random() * 15000));
    const waitTime = hours.map(() => +(2 + Math.random() * 8).toFixed(1));
    const acceptRate = hours.map(() => +(70 + Math.random() * 25).toFixed(1));
    const cancelRate = hours.map(() => +(5 + Math.random() * 15).toFixed(1));
    return { hours, drivers, rides, revenue, waitTime, acceptRate, cancelRate };
  }

  static driverDocuments() {
    return [
      { id: 'd1', name: 'Juan Pérez', doc: 'licencia', status: 'pending', uploaded: '2024-01-10' },
      { id: 'd2', name: 'Pedro Gómez', doc: 'antecedentes', status: 'approved', uploaded: '2024-01-08' },
      { id: 'd3', name: 'Miguel Torres', doc: 'tarjeta_circulacion', status: 'rejected', uploaded: '2024-01-12' },
      { id: 'd4', name: 'Luis Ramírez', doc: 'seguro', status: 'pending', uploaded: '2024-01-14' },
      { id: 'd5', name: 'Rosa Díaz', doc: 'licencia', status: 'approved', uploaded: '2024-01-09' }
    ];
  }

  static incentives() {
    return [
      { id: 'i1', title: 'Completa 20 viajes', bonus: 500, target: 20, current: 14, deadline: 'Hoy 23:59', type: 'trips', active: true },
      { id: 'i2', title: 'Horario nocturno', bonus: 300, target: 10, current: 3, deadline: '06:00 AM', type: 'night', active: true },
      { id: 'i3', title: 'Zona Polanco', bonus: 200, target: 5, current: 5, deadline: '22:00', type: 'zone', active: false },
      { id: 'i4', title: 'Conductor de la semana', bonus: 1500, target: 80, current: 52, deadline: 'Domingo', type: 'weekly', active: true }
    ];
  }
}

// ===== NOTIFICATION SERVICE =====
class NotificationService {
  static async requestPermission() {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  }

  static send(title, body, icon = '/assets/icon.png') {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon, badge: '/assets/badge.png' });
    }
  }

  static async pushToken() {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      return sub ? sub.endpoint : null;
    }
    return null;
  }
}

// ===== UPLOAD SERVICE (Cloudinary) =====
class UploadService {
  static async uploadImage(file, folder = 'documents') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'movilidad_upload');
    formData.append('folder', folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${MovilidadAPI.config.CLOUDINARY_CLOUD}/image/upload`, {
      method: 'POST', body: formData
    });
    return res.json();
  }
}

// Export all
window.MovilidadAPI = MovilidadAPI;
window.api = api;
window.mapsService = mapsService;
window.realtimeService = realtimeService;
window.paymentService = paymentService;
window.safetyService = safetyService;
window.geospatialService = geospatialService;
window.surgeEngine = surgeEngine;
window.tripCheckEngine = tripCheckEngine;
window.dispatchEngine = dispatchEngine;
window.MockData = MockData;
window.NotificationService = NotificationService;
window.UploadService = UploadService;
