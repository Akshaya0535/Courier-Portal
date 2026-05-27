# PRD — Delivery Service Portal
**Project:** Delivery Service Portal
**Owner:** Shrey Saxena
**Status:** Draft v1.0
**Last Updated:** May 26, 2026

---

## 1. Overview

The Delivery Service Portal is an end-to-end logistics platform that lets customers book doorstep pickups, track their parcels in real time, and receive deliveries anywhere across India. Internally, the platform gives the company full visibility into compliance, rider performance, facility throughput, and order status.

Think Porter meets DTDC — but smarter. Customers book a rider to pick up from their door, the parcel moves through our owned facility/warehouse network, and gets dispatched for last-mile delivery across India.

---

## 2. Problem Statement

Existing delivery platforms either:
- Handle only last-mile (customer to destination) — they don't do doorstep pickup
- Handle only intracity logistics (Porter, Dunzo) — no pan-India coverage
- Are B2B only (DTDC, Delhivery) — too complex for individual customers

There is no single platform where a regular customer can book a pickup rider, have their parcel stored safely at a facility, and get it delivered anywhere in India — with real-time tracking at every step.

---

## 3. Goals

**For Customers:**
- Book a pickup rider from their doorstep in <5 minutes
- Track their parcel from pickup → facility → in-transit → delivered
- Simple, transparent pricing with no hidden fees

**For the Company:**
- Full operational visibility — every order, every rider, every facility
- Compliance tracking — SLA adherence, missed pickups, late deliveries
- Dashboard for management to monitor revenue, throughput, and bottlenecks

**Non-Goals (v1):**
- International shipping
- Same-day or express delivery (future phase)
- In-app payments (COD and bank transfer first)

---

## 4. User Personas

### 4.1 Customer (End User)
- Individual or small business shipping parcels across India
- Wants simplicity: book → track → done
- Values transparency on price and parcel location

### 4.2 Pickup Rider
- Freelance or contracted delivery agent (like Porter driver)
- Uses the rider app to accept pickup jobs, navigate to customer, scan and hand off parcel at facility
- Needs: job notifications, navigation, scan/handoff confirmation

### 4.3 Facility Staff
- Works at the warehouse/sorting hub
- Receives parcels from riders, logs them in, dispatches for long-haul
- Needs: scan-in/scan-out, parcel status update, manifest generation

### 4.4 Company Admin / Operations Manager
- Monitors all active orders, compliance metrics, rider performance
- Needs: real-time dashboard, SLA breach alerts, exportable reports

---

## 5. Core User Flows

### 5.1 Customer — Booking a Pickup

1. Customer opens portal (web or app)
2. Enters pickup address, delivery address, parcel dimensions/weight
3. Gets instant price quote
4. Confirms booking → nearest available rider is assigned
5. Customer gets rider ETA + live tracking link
6. Rider arrives, picks up parcel, customer gets confirmation notification
7. Parcel moves to facility — customer notified

### 5.2 Customer — Tracking

1. Customer opens tracking link (no login required)
2. Sees current parcel status: Picked Up → At Facility → In Transit → Out for Delivery → Delivered
3. Each stage shows timestamp, location, and handler name
4. SMS/WhatsApp notifications at every stage change

### 5.3 Rider — Pickup Job

1. Rider receives push notification for new pickup job
2. Accepts job → gets customer address + parcel details
3. Navigates to customer, scans QR code on the booking
4. Delivers to facility → scans parcel in at facility counter
5. Job marked complete → payment triggered

### 5.4 Facility Staff — Receiving & Dispatch

1. Staff scans incoming parcel from rider
2. System logs: parcel ID, rider, timestamp, condition
3. Parcel assigned to outbound route/manifest
4. Staff scans parcel out when dispatched for long-haul
5. System updates parcel status to "In Transit"

### 5.5 Admin — Compliance Dashboard

1. Admin logs in → sees live order map + metrics
2. Filters by: city, date range, rider, facility, SLA status
3. Views: total orders, on-time %, breach count, avg delivery time
4. Exports CSV report for ops review

---

## 6. Feature List

### Phase 1 — MVP (0-3 months)

**Customer Portal (Web)**
- Booking flow: pickup + delivery address, parcel details, price quote
- Rider assignment and ETA display
- Real-time tracking page (shareable link, no login needed)
- SMS + WhatsApp notifications at each stage
- Order history (with login)

**Rider App (Mobile)**
- Job notifications and acceptance
- Navigation to pickup address
- QR scan at pickup and facility drop-off
- Earnings summary

**Facility Dashboard (Web, internal)**
- Scan in / scan out parcels
- View active parcels at facility
- Generate dispatch manifests

**Admin Dashboard (Web, internal)**
- Live order map
- Order status board (all active orders)
- SLA compliance tracker
- Rider performance table
- Basic revenue report

### Phase 2 — Growth (3-6 months)

- Customer mobile app (iOS + Android)
- In-app payments (UPI, cards)
- Multi-parcel / bulk booking for businesses
- Proof of delivery (photo + signature capture)
- Rider ratings and reviews
- Automated SLA breach alerts (email/SMS to ops team)

### Phase 3 — Scale (6-12 months)

- API for business integrations (D2C brands, e-commerce)
- Express delivery option
- Multi-facility routing optimization
- Analytics and forecasting for ops

---

## 7. Technical Requirements

### Architecture Overview

```
Customer Portal (Web/App)
        ↓
    API Gateway
        ↓
  Core Backend Services
  ├── Order Service       — booking, status, pricing
  ├── Rider Service       — assignment, tracking, payments
  ├── Facility Service    — scan in/out, manifests
  ├── Notification Service — SMS, WhatsApp, push
  └── Analytics Service   — compliance, reporting
        ↓
    Database Layer
    ├── Orders DB (PostgreSQL)
    ├── Tracking Events (time-series / append-only)
    └── Rider/Facility Master Data
```

### Key Technical Specs

- **Real-time tracking:** WebSocket or polling every 30s for live location updates
- **QR codes:** Generated per order at booking, scanned at pickup + each facility touchpoint
- **Notifications:** Twilio (SMS) + WhatsApp Business API for customer updates
- **Maps:** Google Maps API for rider navigation and ETA calculation
- **Authentication:** OTP-based login for customers; username/password for riders and staff

---

## 8. Pricing Model (Draft)

| Route Type | Base Price | Per KG |
|---|---|---|
| Intracity (same city) | ₹49 | ₹10/kg |
| Intercity (same state) | ₹99 | ₹15/kg |
| Pan-India | ₹149 | ₹20/kg |

- Doorstep pickup included in all tiers
- Fragile/oversized items: +30% surcharge
- COD available: +₹30 flat fee

*(These are draft numbers — validate against actual ops cost before launch)*

---

## 9. Success Metrics

| Metric | Phase 1 Target | Phase 2 Target |
|---|---|---|
| Orders per month | 100 | 500 |
| On-time pickup rate | >85% | >92% |
| On-time delivery rate | >80% | >90% |
| Customer satisfaction (CSAT) | >3.8/5 | >4.2/5 |
| Avg booking-to-pickup time | <60 min | <45 min |
| SLA breach rate | <15% | <8% |

---

## 10. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Not enough riders in early cities | High | High | Partner with existing gig platforms (Rapido, Porter) as supply source |
| Facility ops complexity | Medium | High | Start with 1 hub city, expand after ops are stable |
| Customer trust on parcel safety | Medium | High | Parcel photos at pickup and facility, insurance option |
| Compliance tracking accuracy | Medium | Medium | QR scan mandatory at every touchpoint, no manual override |
| Tech build time | Medium | Medium | Hire a dev team or use no-code tools for MVP |

---

## 11. Open Questions

- [ ] Which city are we launching in first?
- [ ] Do we own facilities or partner with 3PL warehouses?
- [ ] Are riders full-time employees, freelancers, or third-party fleet?
- [ ] What's our tech build strategy — custom dev, no-code, or white-label logistics software?
- [ ] What's the initial funding/runway for Phase 1?

---

## 12. Next Steps

1. Validate pricing model against real ops costs
2. Decide launch city and facility strategy
3. Define tech build approach (custom vs. no-code MVP)
4. Map out rider acquisition strategy for launch city
5. Build customer booking flow wireframes
6. Set up Phase 1 dev sprints

---

*PRD v1.0 — Created by Stella (Claude) for Shrey Saxena | May 26, 2026*
