# MAHATTATI2 — staged organization

This package keeps the original application behavior as the priority.

## Current phase
- The original CSS blocks are extracted into `css/_ordered/inline-style-*.css` and loaded in their original order via `css/core/utilities.css`.
- The named CSS files under `css/core`, `css/layout`, `css/components`, and `css/pages` contain semantic review copies. They are **not linked at runtime yet**; this avoids changing cascade order before visual regression testing.
- Inline JavaScript was externalized while preserving its original position in the HTML. Large mixed-responsibility blocks are not automatically split into guessed services/features because they depend on globals and execution order.
- `supabase/functions` and `tests` are structure scaffolds only; no business logic or tests have been fabricated.

## Before publishing
1. Run browser checks for home, map/location search, ride request/search/acceptance, driver dashboard, agent approval/funding/recharge, and admin.
2. Compare computed styles and screenshots against the original.
3. Map JS global dependencies and then move functions into the requested feature/service files with compatibility bridges.
4. Implement real Supabase functions/tests only after verifying the existing database schema and current workflows.
5. Deploy only after those checks pass.


## JavaScript responsibility mapping (phase 4)
- Renamed the two generic extracted blocks to `js/core/legacy-main-controller.js` and `js/services/cloud-session-tracking.js`; their script tags were updated in place, preserving execution order.
- Added `JS_MODULE_MAP.json` with the responsibilities actually found in each extracted block.
- The ride/map/fare/navigation logic is still a shared legacy controller. It has not been chopped into separate files because that would risk breaking globals, event handlers, realtime acceptance checks, and GPS/map flows.
- Empty target files remain placeholders, not claimed implementations. The next safe step is function-level extraction with compatibility bridges and browser tests.
