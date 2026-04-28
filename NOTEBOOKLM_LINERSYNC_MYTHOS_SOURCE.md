# LinerSync / Mythos Field Ready — NotebookLM Source Brief

## Purpose of This Source
This document is written as a clean source file for NotebookLM. It summarizes the current LinerSync / Mythos Field Ready application, its field workflow, its technical form, its competitive position, and its development roadmap.

This source is based on the current GitHub field app work in `largentseahawk80-lgtm/field-app`, including:

- `index.html` — current Mythos Workflow Engine V1 single-file app
- `workflow-hardening-v2.html` — Mythos Field Logic + Workflow Hardening V2 phone-ready build
- prior app planning notes and field workflow requirements

---

# 1. Application Name

The application is currently referred to as:

- LinerSync
- LinerSync Field Ready
- Mythos Field Ready
- Mythos Workflow Engine
- Mythos Field Logic + Workflow Hardening V2

The active working GitHub repository is:

`largentseahawk80-lgtm/field-app`

The active V2 build file is:

`workflow-hardening-v2.html`

---

# 2. What the Application Is

LinerSync / Mythos Field Ready is a phone-first field QC/CQA logging application designed specifically for geosynthetic liner installation work in mines, landfills, ponds, lagoons, containment cells, and similar liner construction projects.

It is not intended to be a generic checklist app. It is intended to match the real workflow of a liner field technician who needs to document:

- Roll numbers
- Panel placement
- Seams
- Wedge weld tests
- Extrusion weld tests
- Air tests
- Destructive tests
- Repairs
- Patches
- Beads
- Burn outs
- GPS locations
- Photos
- Time/date evidence
- Daily reports
- Google Earth / KML spatial review
- Job closeout documentation

The core idea is that a field technician should be able to capture defensible QC records quickly from a phone while standing on the liner, even when internet service is poor or unavailable.

---

# 3. Current Technical Form

The current application is a single-file HTML/CSS/JavaScript field app.

Important technical characteristics:

- Phone-first layout
- Offline-first local storage
- Browser GPS access
- Phone camera/photo input
- Leaflet map integration
- Local project memory
- Local logs stored in browser storage
- CSV export
- JSON backup export
- KML export for Google Earth
- Text daily report export

The current version is not yet the final backend/cloud product. It is a field-validation prototype and workflow proving build.

The backend/cloud version is planned for a later stage after field workflow validation.

---

# 4. Core Workflow

The current app workflow is:

Project creation → Setup constants → Choose guided workflow mode → Capture GPS/photo/time/data → Mythos warning check → Save log or save with override → Review last logs → Export data.

The intended field flow is simple:

1. Create or select project.
2. Enter constant job data.
3. Select job mode.
4. Tap start or capture.
5. Let the app record time, GPS, project data, and photo.
6. Let Mythos warn about missing or bad information.
7. Save the log.
8. Continue working.
9. Export at the end of day.

---

# 5. Constant Job Data

Mythos carries forward constant data until the technician changes it.

Constant data includes:

- Pond / cell / lagoon
- Crew
- Weather
- Liner type
- Liner thickness
- Active roll number
- Active panel number
- Active seam number
- Operator / welder
- Equipment / machine

This is important because field QC work repeats many values all day. Re-entering these values for every record wastes time and creates mistakes.

---

# 6. Mythos Assistant Concept

Mythos is intended to become the workflow brain of the application.

Mythos should:

- Remember active job conditions
- Carry forward repeated values
- Guide the technician through the next step
- Warn about missing data
- Warn about weak GPS
- Warn about missing photos
- Warn about failed tests
- Warn about destructive test spacing
- Warn about air test duration
- Track open workflow items
- Link failed tests to repair/retest needs
- Make daily export easier

Mythos is not just a chatbot. In this application, Mythos is a field workflow assistant embedded into the logging process.

---

# 7. Workflow Hardening V2

The newest development direction is called:

`MYTHOS FIELD LOGIC + WORKFLOW HARDENING V2`

The V2 build adds more guided workflow structure and better jobsite logic.

## V2 Guided Job Modes

The V2 app includes the following guided job modes:

- Start Day
- Roll Inventory
- Panel Placement
- Seam Welding
- Testing
- Repairs
- End Day / Export

## V2 Start / Finish Workflow Logic

The V2 app includes start/finish workflow logic for:

- Start roll / finish roll
- Start panel / finish panel
- Start seam / finish seam
- Start air test / finish air test
- Open workflow item tracking

This is important because many field actions happen as a start/end process, not a single form entry.

Examples:

- A panel has a start point and an end point.
- A seam has a start point and an end point.
- An air test has a start time, finish time, pressure start, pressure end, and duration.
- A roll may be active across multiple panels until it is ended or changed.

---

# 8. Log Types

The app supports these log types:

- Repair
- Roll Use
- Panel
- Seam
- Wedge Test
- Extrusion Test
- Air Test
- Destructive Test

Each log can include:

- Project name
- Type
- Auto number
- Mode
- Cell / pond / lagoon
- Roll
- Panel
- Seam
- Result
- Repair type
- Duration
- Spacing
- Start pressure
- End pressure
- Temperature
- Speed
- Weld pressure
- Station / footage
- Notes
- GPS latitude
- GPS longitude
- GPS accuracy
- Time
- Warnings
- Override status
- Photo attachment reference

---

# 9. Repair Logic

Repair logging is designed for fast field capture.

Repair types include:

- Patch
- Bead
- Burn Out
- Wrinkle Cutout
- Fishmouth

The intended repair workflow:

1. Choose Repairs mode.
2. Tap/capture repair.
3. GPS and time are captured.
4. Attach photo.
5. Select repair type.
6. Add note if needed.
7. Mythos warns if anything is missing.
8. Save repair.

Mythos should flag repairs that have no GPS, no photo, or no repair type.

---

# 10. Panel Placement Logic

Panel placement should connect roll usage to panel placement.

The intended panel workflow:

1. Select active roll.
2. Start panel.
3. Capture start GPS/time.
4. Finish panel.
5. Capture end GPS/time.
6. Save panel log.
7. Carry forward roll number unless changed.
8. Ask or infer whether the next panel uses the same roll.

Mythos should warn about duplicate panel numbers and blank active roll numbers.

---

# 11. Seam Welding Logic

Seam welding should connect panel work to seam records and tests.

The intended seam workflow:

1. Select or confirm active panel/seam.
2. Start seam.
3. Capture start GPS/time.
4. Finish seam.
5. Capture end GPS/time.
6. Save seam.
7. Prompt for weld testing when appropriate.

Mythos should track the active seam so wedge weld, extrusion, air test, and destructive test records can be tied back to the seam.

---

# 12. Testing Logic

The application supports multiple liner QC test types.

## Wedge Weld Test

Fields may include:

- Seam number
- Roll number
- Panel number
- Operator/welder
- Machine/equipment
- Temperature
- Speed
- Weld pressure
- Result
- Notes
- GPS
- Photo
- Time/date

## Extrusion Weld Test

Fields may include:

- Repair or seam number
- Operator/welder
- Equipment
- Liner/material context
- Surface/prep notes
- Result
- GPS
- Photo
- Time/date

## Air Test

Fields may include:

- Seam number
- Start time
- End time
- Duration
- Start pressure
- End pressure
- Pressure information
- Result
- GPS
- Photo
- Notes

Mythos should warn when an air test is under 5 minutes or pressure fields are missing.

## Destructive Test

Fields may include:

- DT number
- Seam number
- Station/footage
- Distance/spacing from previous destructive test
- Lab/result status
- Repair/retest status
- GPS
- Photo
- Notes

Mythos should warn when destructive test spacing is over 500 feet.

---

# 13. Warning and Override Logic

Mythos currently warns for field problems such as:

- Missing GPS
- Weak GPS
- Missing photo
- Blank cell/pond
- Blank active roll
- Missing repair type
- Air test under 5 minutes
- Missing air pressure fields
- Destructive test spacing over 500 feet
- Failed test needing repair/retest
- Duplicate panel number

Warnings do not permanently block saving. The user can save with override, but the override is recorded.

This is important because field work cannot always stop for perfect data, but the final record should show what was overridden and why.

---

# 14. Open Workflow Items

V2 introduces open workflow item tracking.

Open workflow items can include:

- A started roll that has not been finished
- A started panel that has not been finished
- A started seam that has not been finished
- A failed test requiring repair/retest
- Pending or unresolved workflow items

This helps Mythos act more like an assistant and less like a simple form.

---

# 15. Exports

The app exports:

- CSV
- JSON backup
- KML
- Daily report text file

## CSV

CSV is used for spreadsheet review and data transfer.

## JSON Backup

JSON backup preserves full project data for restore or debugging.

## KML

KML allows captured points to be reviewed in Google Earth.

This matters because liner QC locations, repairs, seams, and test points are spatial records.

## Daily Report

The text daily report summarizes:

- Project
- Generated time
- Open items
- Log count
- Repair count
- Panel count
- Seam count
- Test count
- Recent logs

---

# 16. Industry Problem

Geosynthetic liner QC/CQA fieldwork creates many critical data points.

Common field documentation problems include:

- Paper logs are slow and error-prone
- Photos are separated from log entries
- GPS points are captured separately or not at all
- Roll numbers get reused or lost in notes
- Panel and seam tracking becomes confusing
- Test data can be incomplete
- Failed tests need follow-up but may not be linked cleanly
- Daily reports are often rebuilt manually
- Closeout documentation takes too much time
- Internet access may be poor on remote sites
- Generic construction apps do not understand liner workflow

LinerSync is intended to solve this by building around the actual liner QC workflow.

---

# 17. Competitive Landscape

The application should be compared against categories, not only individual companies.

Relevant categories include:

- General construction management apps
- General inspection apps
- GIS/mobile mapping apps
- Drone mapping platforms
- Generic form builders
- Enterprise QA/QC platforms
- Asset management systems
- Specialized CQA/geosynthetic documentation systems

The main difference is that LinerSync is being designed from the liner field technician’s workflow upward.

Generic platforms may be powerful, but they often require configuration, office setup, subscription cost, internet access, or workflows that are not designed around roll-panel-seam-test-repair relationships.

---

# 18. How LinerSync Challenges Industry Leaders

LinerSync can challenge larger tools by focusing on a narrow but painful field niche.

Potential strengths:

- Built around geosynthetic liner installation instead of generic construction
- Phone-first field use
- Offline-first local saving
- GPS/photo/time-backed records
- Strong roll/panel/seam/test/repair relationships
- Fast tap-to-capture workflow
- KML/Google Earth export
- Mythos field assistant logic
- Warning/override system
- Designed by someone who understands actual liner QC work

The strategic idea is not to out-feature massive construction platforms immediately. The edge is to be faster, simpler, and more workflow-specific for liner QC.

---

# 19. Possible Edge / Advantage

The application may have an edge because it is being built from real field pain instead of office assumptions.

Potential edge areas:

- Deep domain-specific workflow knowledge
- Simpler phone-first interface
- Designed for jobsite speed
- Works offline
- GPS and photo evidence built into capture flow
- Carry-forward constants reduce repeated typing
- Open items reduce missed follow-up
- Mythos can act like a QC assistant
- Exports match field needs such as CSV and KML
- Liner-specific record relationships are built into the concept

This could give the app an advantage over generic systems that do not naturally understand geosynthetic liner installation.

---

# 20. Current Weaknesses

The current app is promising, but it is not final production software.

Current weaknesses:

- Still a single-file prototype
- Local browser storage is not enough for final production
- Photo handling needs cloud storage
- No user login yet
- No cloud sync yet
- No multi-device restore yet
- No audit trail yet
- No role-based permissions yet
- No final database schema yet
- No Excel template export yet
- No PDF report generator yet
- Needs more real jobsite testing
- Needs validation against actual CQA/owner reporting requirements

The app should be field-tested before backend/cloud development is locked in.

---

# 21. Backend / Cloud Roadmap

The final backend/cloud version should include:

- User authentication
- Cloud database
- Project sync
- Offline sync queue
- Photo storage
- Multi-device restore
- Admin/project dashboard
- Audit trail
- Report generator
- Excel template export
- PDF daily report
- KML package export
- Mythos project memory
- Role-based access later if needed
- Secure backup
- Conflict handling for offline/online sync

The backend should not replace offline field use. The phone app should still capture data offline. Cloud should handle backup, sync, reporting, and restore.

---

# 22. Strategic Positioning Statement

LinerSync / Mythos Field Ready is not just another construction checklist app. It is a specialized geosynthetic liner QC workflow system designed to help field technicians capture defensible GPS/photo/time-backed installation records while Mythos reduces missed data and guides the technician through the actual liner installation workflow.

---

# 23. Short Pitch Versions

## Contractor Pitch

LinerSync helps liner crews and QC teams capture roll, panel, seam, repair, and test records from the phone while keeping GPS, photo, and time evidence tied to each log.

## CQA Firm Pitch

LinerSync gives CQA technicians a field-first way to document liner installation with fewer missed fields, better traceability, and cleaner exports for reporting and closeout.

## Landfill Owner Pitch

LinerSync improves installation documentation by tying repairs, panels, seams, tests, photos, GPS, and daily reports into a cleaner digital record.

## Mine Owner Pitch

LinerSync supports remote containment projects by allowing offline field capture with GPS/photo-backed QC records and later export for review.

## Software Investor Pitch

LinerSync targets a specialized construction documentation niche where generic platforms are often too broad. Its edge is domain-specific workflow intelligence for geosynthetic liner QC.

## Field Technician Pitch

LinerSync is built to reduce typing, remember the repeated job info, capture GPS/photos automatically, warn about missing data, and help build the daily report without rebuilding everything by hand.

---

# 24. Final Assessment

LinerSync / Mythos Field Ready is promising because it attacks a real field documentation problem with a specialized workflow. The current prototype already shows the core logic: phone-first capture, constant data memory, GPS/photo/time evidence, guided modes, warnings, overrides, open items, exports, and Google Earth compatibility.

It is not production-ready yet. The next stage should be continued field testing and workflow refinement, followed by backend/cloud architecture once the data model and field workflow are proven.

If completed correctly, LinerSync could matter because geosynthetic liner QC documentation is high-consequence work. Missing or disorganized records can cause reporting problems, disputes, rework, and closeout delays. A field-first QC assistant that understands liner workflow could create a practical advantage over generic construction apps.

---

# 25. Suggested NotebookLM Question Prompt

After adding this document as a source, use this prompt in NotebookLM:

Analyze LinerSync / Mythos Field Ready as a serious construction technology and geosynthetic liner QC/CQA application. Explain what it does, what problem it solves, how Mythos changes the workflow, how it compares to general construction management or inspection apps, where it may have an industry edge, what risks remain, and what should be built next before final backend/cloud development. Be direct, practical, and industry-aware. Do not overhype the app. Explain both the promise and the weaknesses.
