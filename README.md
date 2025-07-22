Authorization: Bearer <your_token>
# Assumptions & Design Decisions

This document outlines design decisions, trade-offs, and interpretations made during development of the Aamira Courier Package Tracker backend.

---

## 1. Idempotency for Courier Updates

- We consider an event **duplicate** if the `package_id`, `status`, and `event_timestamp` match an existing record.
- Such duplicates are ignored silently and do not trigger a re-save or broadcast.

## 2. Out-of-Order Events

- All events are saved regardless of their timestamp.
- The current "live view" is computed from the **most recent event by `event_timestamp`**.
- Out-of-order events are kept for historical traceability but do **not** override the latest view.

## 3. Package Status Lifecycle

We use these status values:
- `CREATED`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, `EXCEPTION`, `CANCELLED`

Only `DELIVERED` and `CANCELLED` are considered **terminal**.

## 4. Stuck Package Detection

- A package is marked as "stuck" if:
  - It is **active** (not delivered/cancelled)
  - Its **last event** is older than 30 minutes
- A background job runs every 5 minutes to check for this.
- When stuck:
  - A one-time alert is emitted via `Socket.io`
  - The alert is saved in an `Alert` collection
- The alert is **cleared** automatically if a new event is received for that package.

## 5. Authentication

- Backend uses **JWT authentication**.
- All `/api/packages` routes are protected.
- Clients must pass a valid token in the `Authorization` header as:


## 6. Persistence

- All package events are stored in MongoDB (`PackageEvent` model).
- Active state is computed using aggregation (latest event per package).
- If the server restarts, state is rebuilt from persisted events.

## 7. Real-Time Updates

- Socket.io is used to push live updates to connected dispatcher clients:
- `package_updated` → when a courier sends a new update
- `package_stuck` → when a package is detected as stuck


## Shortcuts / Trade-offs
In-Memory State:
- All filtering and display logic is handled on the client side using in-memory state. No -server-side filtering/pagination.

## Hardcoded Backend URL:
- Socket connection uses http://localhost:3000 directly. In production, this should be configurable or dynamically set.

## Map Not Implemented:
- Package location (latitude & longitude) is shown as raw coordinates only. No map or geolocation visualization was included to keep scope minimal.

## Limited Error Handling:
- Network failures or socket connection issues are logged but not shown to the user in the UI.

## Known Limitations
Non-Persistent State:
- UI state like selected filters/search is not saved between reloads.

## Mobile Responsiveness:
- The table is responsive, but on very narrow devices, it may still require scrolling. Card-based layouts could further improve mobile UX.

## Time Calculation Precision:
- timeSince() only shows time in minutes (Xm ago). Could be enhanced to show "hours ago", "days ago", etc.

## Search is Simple:
- The current search only works for full or partial package_id. No fuzzy search or multi-field queries.

## Deploy
- As i have deployed the backend on the render and frontend on vercel sometimes it takes time to load as a result the frontend may take time to work.