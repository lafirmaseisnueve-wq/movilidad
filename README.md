# 🚗 Movilidad — Ride-Hailing Platform

**By TheFirm69 Systems** · DiDi-like Ecosystem · Purple Theme #7C3AED

---

## 📋 Overview

Movilidad is a full-spectrum ride-hailing platform modeled after DiDi's 4 pillars: **Shared Transport**, **Automotive Solutions**, **Smart Cities & Multimodality**, and **Autonomous & EV**. The platform features a transversal AI security core called **TripCheck** that monitors every ride in real-time.

### Three-App Architecture
- **Passenger App** — Phone mockup (390×844px) with Express, Comfort, Premier, Intercity, Pon tu Precio, Multimodal, and TripCheck safety flows
- **Driver App** — Phone mockup with GPS breadcrumbs, TripCheck live alerts, EV charging, maintenance, financing, performance dashboard, and referral system
- **Admin Panel** — Sidebar + main layout with 21 modules: Dashboard, Live Map, CRM, Surge Pricing, Commissions, SOC, TripCheck AI, Robotaxi Console, API Config, Analytics & BI

---

## 🏗️ Architecture

```
movilidad/
├── passenger/          # Passenger App (phone mockup)
│   └── index.html      # All screens + JS
├── driver/             # Driver App (phone mockup)
│   └── index.html      # All screens + JS
├── admin/              # Admin Panel (sidebar + main)
│   ├── index.html      # All 21 page sections
│   ├── admin.js        # Core functionality + charts
│   └── api-config.js   # 16 API configuration panel
├── backend/            # Express.js API server
│   ├── server.js       # All REST endpoints
│   └── data/
│       ├── api_configs.json  # 16 API credentials + endpoints
│       ├── rides.json        # 50 mock rides
│       └── tripcheck.json    # 30 safety events
├── css/
│   └── styles.css      # Design system (purple theme)
└── js/
    └── api.js          # Shared utilities
```

---

## 🔌 16 API Integrations

| API | Category | Purpose |
|-----|----------|---------|
| Google Maps | Mapping | Routes, geocoding, places |
| Mapbox | Mapping | Custom map styles, navigation SDK |
| HERE Technologies | Mapping | Traffic, routing, fleet telematics |
| Socket.IO | Real-time | Driver GPS, ride status, notifications |
| Stripe | Payments | Card processing, payouts, subscriptions |
| Twilio | Communications | Masked calls, SMS, chat |
| Firebase Auth | Authentication | Login, registration, SSO |
| Cloudinary | Storage | Driver documents, profile photos |
| SendGrid | Email | Transactional & marketing email |
| FCM Push | Notifications | Real-time push to Android & iOS |
| Apache Kafka | Streaming | Surge pricing, event sourcing, analytics |
| Geohash/S2 | Geospatial | Efficient geolocation indexing |
| OSRM | Routing | Open-source route optimization |
| Redis | Caching | Session store, rate limiting, geofences |
| PostgreSQL+PostGIS | Database | Spatial queries, core data |
| AWS S3 | Storage | Static assets, backups, compliance docs |

---

## 🛡️ TripCheck AI — Safety Engine

TripCheck is the transversal AI security core monitoring every ride:
- **Route Deviation Detection** — Alerts if driver strays >300m from optimal route
- **Speed Monitoring** — Notifies if speed exceeds zone limits
- **Human Validation** — Expert review when AI detects anomalous behavior
- **Incident Detection** — Auto-SOS on impact or extreme braking (8.2+ m/s²)
- **GPS Breadcrumbs** — Position logged every 3 seconds during active rides
- **Safety Score** — Real-time 0-10 score for both passenger and driver

---

## 🤖 Robotaxi — Autonomous Driving

SAE Level 4 autonomous fleet operating in Polanco-Condesa-Roma corridor (CDMX):
- 47 robotaxis (BYD Dolphin Auto, JAC E10X Auto, MG4 Auto)
- 12 cameras, 5 LiDAR, 8 radars, 500 TOPS compute box
- Remote control capability in <200ms
- Hybrid Dispatch: 85% human / 15% autonomous assignment

---

## 🚀 Getting Started

### Start Backend
```bash
cd backend && node server.js  # http://localhost:3001
```

### Start Frontend
```bash
python3 -m http.server 8080    # http://localhost:8080
```

### Access Apps
- **Passenger**: http://localhost:8080/passenger/
- **Driver**: http://localhost:8080/driver/
- **Admin**: http://localhost:8080/admin/
- **Admin Login**: admin@movilidad.app / TheFirm69!Admin

---

## 📱 Screen Inventory

### Passenger App (14 screens)
Home · Ride · Tracking · Rating · Premier · Intercity · Pon tu Precio · TripCheck · Multimodal · Receipt

### Driver App (13 screens)
Map · Request · Active Ride · Cash · Earnings · Incentives · Safety · Profile · EV Charging · Maintenance · Financing · Performance · Referral

### Admin Panel (21 modules)
Dashboard · Live Map · Users CRM · Fleets · Documents · Surge Pricing · Commissions · Incentives · SOC · TripCheck AI · Tickets · Charging EV · Maintenance · Financing · Smart Cities · Traffic AI · Mapping · Robotaxi · Hybrid Dispatch · API Config · Analytics

---

## 🎨 Design System

- **Primary**: #7C3AED · **Success**: #10B981 · **Warning**: #F59E0B · **Danger**: #EF4444
- **Font**: Inter (400-900) · **Radius**: 12px cards · **Shadow**: 0 4px 20px rgba(0,0,0,.1)

---

## 📦 Deployment

**GitHub**: https://github.com/lafirmaseisnueve-wq/movilidad  
**Version**: 2.0.1 · **By TheFirm69 Systems**
