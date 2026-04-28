# LinerSync Mythos V4 — User Guide and Development Manual

Last updated: 2026-04-28
Repo: `largentseahawk80-lgtm/field-app`
Live test build: `workflow-mythos-v4.html`

## Purpose

This guide explains what Mythos does inside the LinerSync field app and how to use the current V4 workflow without guessing.

Mythos is the workflow brain running behind the app. It watches project setup, active roll, active panel, active seam, GPS, technician names, photos, tests, warnings, open items, logs, and exports.

## Current Live Test Link

Use this build for the new built-in guide:

`https://largentseahawk80-lgtm.github.io/field-app/workflow-mythos-v4.html`

The older V3 test file remains in the repo for reference.

## The Simple Field Flow

Use the app in this order:

1. **Project** — select or create the project.
2. **Setup** — enter constant job data and tech names.
3. **GPS** — tap GPS so the app has location.
4. **Capture** — choose the log type and save records.
5. **Logs** — review what was saved.
6. **Export** — check readiness and export CSV / JSON / KML / report.
7. **Guide** — open the built-in manual whenever the screen is confusing.

## Home Tab

The Home tab is the command center.

It shows:

- **Logs** — number of saved logs.
- **Open** — number of open workflow items.
- **Ready** — export readiness score.
- **Issues** — total active issues.
- **Next action** — what Mythos thinks you should do next.
- **Top 3 Active Issues** — the three most important warnings right now.
- **Fast Workflow buttons** — quick launch buttons for Roll Use, Panel, Seam, Repair, Wedge Test, Air Test, DT, and Guide.
- **Latest Logs** — newest saved records.

### Top 3 Active Issues

Mythos only shows the top three issues at once so the screen stays readable. When you fix one issue, Mythos recalculates and shows the next issue in line.

Example:

1. Project cell/pond/lagoon is missing.
2. Active roll context is missing.
3. No logs saved.

After you enter the cell and save constants, issue #1 disappears and the next issue moves up.

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

### Tech Name Lists

Use these setup fields for technician dropdowns:

- **Welders** — used for Seam, Extrusion Test, and Repair.
- **Wedgers** — used for Wedge Test.
- **Air Testers** — used for Air Test.

You can enter names separated by commas or one per line.

Example:

```text
SHAWN, MIKE, ROBERT
```

or

```text
SHAWN
MIKE
ROBERT
```

After saving constants, the Capture tab gives you a dropdown of the correct names based on log type.

## Capture Tab

The Capture tab is where field logs are created.

Current log types:

- Repair
- Roll Use
- Panel
- Seam
- Wedge Test
- Extrusion Test
- Air Test
- Destructive Test

Capture fields include:

- Log type
- Auto number
- Technician dropdown
- Repair type
- Result
- Air hold minutes
- DT spacing feet
- Start pressure
- End pressure
- Station / footage
- Orientation / slope
- Notes
- Photo attachment

### Technician Dropdown Rules

The technician dropdown changes automatically:

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

### Save Log

Tap **Save Log** after entering the needed information.

Mythos checks the log before saving. If it finds issues, it shows warnings and asks you to fix them or save with override.

### Save Override

Use override only when field conditions require saving anyway.

Overrides are recorded in the log and export.

## Open Items

Open items are things Mythos believes still need follow-up.

Examples:

- A started repair that has not been finished.
- A failed test that needs repair or retest.
- A destructive test that needs a patch record.

Use:

- **Start Open Item** — starts a workflow item.
- **Finish Open Item** — pulls the item back into Capture so it can be completed.

## Logs Tab

The Logs tab shows saved records.

Each log shows:

- Log number
- Log type
- Time
- Override status
- Warning count
- Technician
- Roll
- Panel
- Seam
- Result or repair type
- Notes
- GPS status

Use **Undo Last** if you accidentally save the wrong record.

## Export Tab

The Export tab shows the readiness check and download buttons.

Exports available:

- CSV
- JSON backup
- KML
- Daily report

### CSV

Spreadsheet-style export for review and office processing.

Includes technician, project, type, number, cell, roll, panel, seam, result, repair type, duration, pressure, station, notes, GPS, warnings, and override status.

### JSON Backup

Full backup of the project data.

### KML

Google Earth point export for GPS-backed records.

### Daily Report

Plain text summary with project, readiness, top issues, open items, total logs, next action, and latest logs.

## Guide Tab

The Guide tab is built into V4 so the field user does not have to remember what every tab does.

It explains:

- Home
- Top 3 Active Issues
- Setup
- Tech Lists
- Capture
- Warnings
- Save Override
- Open Items
- Logs
- Export

Use it any time the app feels confusing.

## Mythos Warning Logic

Mythos currently checks for:

- Missing GPS
- Weak GPS
- Missing photo
- Missing cell / pond / lagoon
- Missing liner type
- Missing liner thickness
- Missing active roll on roll/panel/seam/test work
- Missing repair type
- Duplicate panel number
- Seam not tied to panel context
- Air test under 5 minutes
- Missing air test pressure fields
- Missing test result
- Failed test needing repair/retest
- Destructive test spacing over 500 feet
- Missing destructive test station/footage
- Missing technician name on test logs

## What Mythos Is Doing Behind the Screen

Mythos is calculating:

- GPS confidence
- Export readiness score
- Top 3 active issues
- Next action
- Open follow-up items
- Log validation
- Carry-forward constants
- Technician dropdown options
- Failed test follow-up needs
- DT patch follow-up needs

## Current Development Rule

Every repo development edit should also update this guide when the change affects user workflow, field data, app behavior, exports, warning logic, or screen layout.

## Development Change Log

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
