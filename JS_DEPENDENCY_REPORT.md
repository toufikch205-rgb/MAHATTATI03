# JavaScript dependency report

Generated from the current extracted files. This is a static map, not proof of runtime correctness.

## Script load order

All scripts in `index.html` are classic scripts loaded with `defer`; their source order is preserved so the DOM exists before UI modules initialize.

### index.html
1. `js/core/events.js`
2. `js/core/app.js`
3. `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`
4. `js/features/maps/map-controller.js`
5. `js/features/customer/ride-booking.js`
6. `js/core/legacy-main-controller.js`
7. `js/features/driver/ride-request-ui.js`
8. `js/features/driver/driver-dashboard.js`
9. `js/features/customer/customer-home.js`
10. `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
11. `js/features/customer/booking-history.js`
12. `js/services/cloud-session-tracking.js`
13. `js/core/navigation.js`
14. `js/services/supabase-client.js`
15. `js/features/driver/live-ride-dispatch.js`
16. `js/features/driver/merchant-portal.js`
17. `js/features/driver/ride-requests.js`
18. `js/features/agent/agent-registration.js`
19. `js/features/admin/driver-approval.js`

### admin.html
1. `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
2. `js/features/admin/agent-approval.js`

The old `ride-booking-fixes.js` reference was removed; Phase 8's `live-ride-dispatch.js` is the active driver-queue module. The legacy `customer-recharge.js` file is intentionally not loaded because it forcibly hid role-controlled menu shortcuts. Agent registration, funding requests, and driver recharge are handled by `customer-home.js`.

## Critical flow symbol check
### locations_and_routes
- Found: drawSelectedRoute, mahattatiSearchPlaces, reverseGeocode, setUser, locate, setSelectMode, searchDestinationPlaces, showTripMapPage, hideTripMapPage
- Not found by exact symbol name: none

### ride_request_and_acceptance
- Found: submitTripRequest, checkPassengerRequestStatus, startPassengerAcceptancePolling, stopPassengerAcceptancePolling, startRideSearchTimer, stopRideSearchTimer
- Not found by exact symbol name: none

### driver_dashboard_and_requests
- Found: mount, loadRequests, toggleOnline, accept, completeTrip, getDriver, getUser
- Not found by exact symbol name: none

### agent_and_funding
- Found in the existing customer-home module: agent application status, wallet balance lookup, `agent_request_wallet_funding`, `agent_find_approved_driver`, and `agent_recharge_driver`.
- `js/features/agent/agent-funding.js` is a placeholder and `js/features/agent/customer-recharge.js` is intentionally not loaded; the older latter script forcibly hid role-controlled menu shortcuts.

### admin_approvals
- Found: loadAgentFundingRequests, loadMerchantApplications, reviewMerchant, renderMerchantApplications
- Not found by exact symbol name: none

## Validation
- All 17 local scripts loaded by `index.html`, plus the standalone admin script, passed JavaScript syntax parsing.
- `index.html`: 19 script tags, all deferred; no duplicate IDs and no missing local references.
- `admin.html`: no duplicate IDs or missing local references. Its Supabase CDN script remains synchronous intentionally so the admin script at the end of the body can use the global.
- CSS: all 85 ordered imports exist; the 104 CSS files passed a basic brace-balance check.
- The repository file set matches the 162-file Phase 8 archive exactly.
- GitHub Pages build and deploy jobs succeeded for the audited commit.

## Outstanding risks and limitations
- Browser end-to-end tests have not been run, so map permissions, realtime delivery, ride acceptance, agent recharge receipts, and admin actions still require live interaction tests.
- The read-only Supabase advisor scan reported security findings: two tables with RLS enabled but no policies, two SECURITY DEFINER functions executable by `anon`, 18 SECURITY DEFINER functions executable by authenticated users, and leaked-password protection disabled. Performance findings include three unindexed foreign keys, nine RLS init-plan warnings, five sets of multiple permissive policies, two unused indexes, and one duplicate index. These database settings were not changed during this GitHub-only pass.
- The largest ride/map controller remains a shared global-scope block. Further extraction should be done in small function groups with browser regression tests.
