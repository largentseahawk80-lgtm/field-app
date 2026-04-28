# LinerSync Mythos V7 — User Guide and Development Manual

Last updated: 2026-04-28
Repo: `largentseahawk80-lgtm/field-app`
Live test build: `workflow-mythos-v7.html`

## Current Live Test Link

`https://largentseahawk80-lgtm.github.io/field-app/workflow-mythos-v7.html`

## Purpose

This guide explains what Mythos does inside the LinerSync field app and how to use the current V7 workflow without guessing.

Mythos is the workflow brain running behind the app. It watches project setup, active roll, active panel, active seam, GPS, technician names, photos, tests, warnings, open items, logs, and exports.

## Big Rule: Mythos Should Not Nag You All Day

Mythos uses quiet field QC mode.

It separates checks into three buckets:

1. **Critical** — stop or override now.
2. **Review Later** — save quietly and clean up at export.
3. **Suggestions** — helpful notes only, not counted as issues.

This is meant to keep you focused on real QC responsibility instead of babysitting the app.

## V7 Main Upgrade: Visible Capture Packs

V7 makes the Capture screen visually obvious.

When you select a log type, the app shows a large workflow pack banner:

- **REPAIR PACK**
- **AIR TEST PACK**
- **DESTRUCTIVE TEST PACK**
- **PANEL PACK**
- **SEAM PACK**
- **ROLL PACK**
- **WEDGE TEST PACK**
- **EXTRUSION TEST PACK**

The goal is simple: you should immediately know what mode you are in before saving a log.

V7 is a safe wrapper around V6. It loads V6 and injects the visible capture pack banner. That means V6 logic stays intact while the screen becomes clearer.

## V6 Smart Capture Fields Still Apply

The form hides fields that do not belong to the selected log type.

### Repair form

Shows mainly:

- Technician
- Repair type
- Result
- Notes
- Photo

### Air Test form

Shows mainly:

- Technician
- Result
- Air hold minutes
- Start pressure
- End pressure
- Notes
- Photo

### Destructive Test form

Shows mainly:

- Technician
- Result
- DT spacing feet
- Station / footage
- Notes
- Photo

### Panel form

Shows mainly:

- Roll used / roll number
- Orientation / slope
- Station / footage
- Length feet
- Width feet
- Notes
- Photo

### Seam form

Shows mainly:

- Technician
- Result
- Panel A
- Panel B
- Orientation / slope
- Station / footage
- Length feet
- Notes
- Photo

### Roll Use form

Shows mainly:

- Roll used / roll number
- Notes
- Photo

### Wedge / Extrusion Test form

Shows mainly:

- Technician
- Result
- Notes
- Photo

## Home Dashboard

Home shows:

- **Logs** — number of saved logs.
- **Open** — number of open workflow items.
- **Critical** — items that need action now.
- **Review Later** — cleanup items for end-of-day/export.
- **Critical Now** — top 3 critical blockers.
- **Review Later** — top 3 cleanup items.
- **Next action** — what Mythos thinks should happen next.
- **Latest Logs** — newest saved records.

Critical and Review Later are intentionally separated so cleanup items do not feel like field blockers.

## Critical Items

Critical items are field blockers. Mythos should interrupt only for these:

- Missing or unusable GPS
- Missing active roll for panel/seam/test work
- Missing repair type
- Duplicate panel number
- Missing panel number
- Missing seam number
- Air test under 5 minutes
- Missing air test pressure fields
- Missing air test pass/fail result
- Destructive test spacing over 500 feet
- Failed test needing repair/retest
- Open workflow items before final export

Critical items require fixing or saving with override.

## Review Later Items

Review Later items should not stop the field flow.

Examples:

- Missing photo
- Weak but usable GPS
- Missing pond/cell/lagoon
- Missing active roll before work has started
- Seam not tied to panel context
- Missing destructive test station/footage
- Missing technician name on test logs
- Overrides present

These belong mostly in Export review, not as constant interruptions.

## The Simple Field Flow

1. **Project** — select or create the project.
2. **Setup** — enter constant job data and tech names.
3. **GPS** — tap GPS so the app has location.
4. **Capture** — choose the log type and confirm the visible Capture Pack.
5. **Logs** — review what was saved.
6. **Export** — review cleanup items and export CSV / JSON / KML / report.
7. **Guide** — open the built-in manual whenever the screen is confusing.

## Setup Tab

The Setup tab is where you enter data that should carry forward until changed.

Current setup fields:

- Pond / cell / lagoon
- Weather
- Liner type
- Liner thickness
- Active roll
- Active panel
- Active seam
- Equipment / machine
- Welders names
- Wedgers names
- Air tester names
- Default tech, optional

## Tech Name Lists

- **Welders** — used for Seam, Extrusion Test, and Repair.
- **Wedgers** — used for Wedge Test.
- **Air Testers** — used for Air Test.

Names can be separated by commas or one per line.

## Technician Dropdown Rules

| Log type | Dropdown source |
|---|---|
| Wedge Test | Wedgers list |
| Air Test | Air Testers list |
| Seam | Welders list |
| Extrusion Test | Welders list |
| Repair | Welders list |
| Destructive Test | All tech names |
| Panel | All tech names |
| Roll Use | All tech names |

## Save Log

Tap **Save Log** after entering the needed information.

Mythos only blocks for **Critical** items. Review Later items should not stop normal logging.

## Save Override

Use override only when the field condition is real and you need to save anyway.

Overrides are recorded in the log and export.

## Open Items

Open items are things Mythos believes still need follow-up.

Examples:

- A started repair that has not been finished.
- A failed test that needs repair or retest.
- A destructive test that needs a patch record.

## Logs Tab

The Logs tab shows saved records.

Each log shows:

- Log number
- Log type
- Time
- Override status
- Critical count
- Review Later count
- Technician
- Roll
- Panel
- Seam
- Result or repair type
- Notes
- GPS status

## Export Tab

Export is where Review Later cleanup belongs.

Exports available:

- CSV
- JSON backup
- KML
- Daily report

V7 uses V6 exports underneath, including orientation, length, width, roll used, station, critical, and review later.

## Guide Tab

The Guide tab is built into V6 underneath V7 so the field user does not have to remember what every tab does.

## Current Development Rule

Every repo development edit should also update this guide when the change affects user workflow, field data, app behavior, exports, warning logic, or screen layout.

## Development Change Log

### 2026-04-28 — V7 Visible Capture Packs

- Added `workflow-mythos-v7.html`.
- V7 safely wraps V6 and injects a large visible Capture Pack banner.
- Capture now clearly displays REPAIR PACK, AIR TEST PACK, DT PACK, PANEL PACK, SEAM PACK, ROLL PACK, WEDGE TEST PACK, or EXTRUSION TEST PACK.
- The pack banner changes color and text based on selected log type.
- V7 keeps V6 logic and data behavior intact.

### 2026-04-28 — V6 Smart Capture Fields

- Added `workflow-mythos-v6.html`.
- Capture now hides irrelevant fields based on log type.
- Added smart capture hint text for each log type.
- Added Panel A / Panel B fields for seams.
- Added Roll Used field for roll and panel workflows.
- Added Length feet and Width feet fields for panel/seam workflows.
- CSV export now includes orientation, length, width, station, roll used, critical, and review-later fields.
- V6 uses local storage key `linersync-mythos-v6` so it does not corrupt V5 test data.
- V6 keeps quiet QC mode: Critical blocks save, Review Later does not.

### 2026-04-28 — V5 Quiet QC Dashboard

- Added `workflow-mythos-v5.html`.
- Changed Home dashboard labels from generic `Issues` to separate **Critical** and **Review Later** counters.
- Added separate Home sections for **Critical Now** and **Review Later**.
- Capture now saves Review Later items without blocking normal work.
- CSV export now includes separate `critical` and `review_later` columns.
- Daily Report now separates Critical and Review Later sections.
- V5 uses local storage key `linersync-mythos-v5` so it does not corrupt V4 test data.
- V5 loads `mythos-field-brain.js?v=0.2.0` to avoid stale browser cache.

### 2026-04-28 — Quiet Field QC warning mode

- Updated `mythos-field-brain.js` to Version 0.2.0.
- Split warning logic into Critical, Review Later, and Suggestions.
- Capture now only interrupts for Critical items.
- Missing photo, weak-but-usable GPS, missing tech name, missing station, and similar cleanup items are Review Later instead of field blockers.
- Export readiness still tracks review cleanup for end-of-day review.

### 2026-04-28 — V4 built-in Guide tab

- Added `workflow-mythos-v4.html`.
- Added a sixth app tab: **Guide**.
- Guide explains Home, Setup, Capture, Logs, Export, Open Items, Save Override, Top 3 Active Issues, and warning behavior.
- V4 uses separate local storage key `linersync-mythos-v4` so it does not corrupt V3 test data.
- V4 exports use filenames ending in `mythos-v4`.

### 2026-04-28 — Guide started

- Added this manual.
- Clarified that Mythos is the workflow brain, not just a tab.
- Documented Home, Setup, Capture, Logs, Export.
- Documented technician name dropdown logic.
- Documented top 3 active issues behavior.
- Documented current warning logic.
