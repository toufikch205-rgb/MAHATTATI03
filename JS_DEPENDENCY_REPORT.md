# JavaScript dependency report

Generated from the current extracted files. This is a static map, not proof of runtime correctness.

## Script load order
### index.html
1. `js/core/events.js`
2. `js/core/app.js`
3. `https://unpkg.com/leaflet@1.9.4/dist/leaflet.js`
4. `js/core/legacy-main-controller.js`
5. `js/features/customer/ride-booking.js`
6. `js/features/customer/customer-home.js`
7. `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
8. `js/features/customer/booking-history.js`
9. `js/services/cloud-session-tracking.js`
10. `js/core/navigation.js`
11. `js/services/supabase-client.js`
12. `js/features/customer/ride-booking-fixes.js`
13. `js/features/driver/driver-dashboard.js`
14. `js/features/driver/ride-requests.js`
15. `js/features/agent/agent-registration.js`
16. `js/features/admin/driver-approval.js`
17. `js/features/agent/customer-recharge.js`
18. `js/features/maps/map-controller.js`

### admin.html
1. `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`
2. `js/features/admin/agent-approval.js`

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
- Found: loadAgentFundingRequests, loadMerchantApplications, reviewMerchant
- Not found by exact symbol name: customerRecharge, agentFunding

### admin_approvals
- Found: loadAgentFundingRequests, loadMerchantApplications, reviewMerchant, renderMerchantApplications
- Not found by exact symbol name: none

## Validation
- JavaScript syntax errors: 0
- Missing local HTML references: 0
- JavaScript files inspected: 32

## Important limitation
The largest ride/map controller remains a shared global-scope block. Its functions call other functions and reference DOM nodes and state initialized elsewhere. Automatically moving them now would risk changing when listeners attach and when the ride-acceptance polling starts. The next edit should be function-group extraction with a compatibility bridge, tested in a browser before deployment.
