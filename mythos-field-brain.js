/**
 * LinerSync Mythos Field Brain
 * Version: 0.1.0
 *
 * Purpose:
 * - Centralize the field intelligence for geosynthetic liner QC logging.
 * - Keep UI files small by moving jobsite rules into one reusable engine.
 * - Designed for the current single-file app first, then React/cloud later.
 *
 * This file is intentionally framework-free. It can be loaded with:
 * <script src="./mythos-field-brain.js"></script>
 * and used as window.MythosFieldBrain.
 */
(function attachMythosFieldBrain(global) {
  'use strict';

  const VERSION = '0.1.0';

  const LOG_TYPES = Object.freeze({
    REPAIR: 'Repair',
    ROLL_USE: 'Roll Use',
    PANEL: 'Panel',
    SEAM: 'Seam',
    WEDGE_TEST: 'Wedge Test',
    EXTRUSION_TEST: 'Extrusion Test',
    AIR_TEST: 'Air Test',
    DESTRUCTIVE_TEST: 'Destructive Test',
    DAILY: 'Daily',
  });

  const REPAIR_TYPES = Object.freeze([
    'Patch',
    'Bead',
    'Burn Out',
    'Wrinkle Cutout',
    'Fishmouth',
    'Hole',
    'Cap Strip',
    'Extrusion Repair',
    'Other',
  ]);

  const REQUIRED_CONSTANTS = Object.freeze([
    'cell',
    'linerType',
    'linerThickness',
  ]);

  const ROLL_REQUIRED_TYPES = Object.freeze([
    LOG_TYPES.ROLL_USE,
    LOG_TYPES.PANEL,
    LOG_TYPES.SEAM,
    LOG_TYPES.WEDGE_TEST,
    LOG_TYPES.EXTRUSION_TEST,
    LOG_TYPES.AIR_TEST,
    LOG_TYPES.DESTRUCTIVE_TEST,
  ]);

  const TEST_TYPES = Object.freeze([
    LOG_TYPES.WEDGE_TEST,
    LOG_TYPES.EXTRUSION_TEST,
    LOG_TYPES.AIR_TEST,
    LOG_TYPES.DESTRUCTIVE_TEST,
  ]);

  const GPS_LIMITS = Object.freeze({
    greenMeters: 10,
    amberMeters: 30,
    redMeters: 60,
  });

  const AIR_TEST_RULES = Object.freeze({
    minimumHoldMinutes: 5,
  });

  const DT_RULES = Object.freeze({
    maximumSpacingFt: 500,
  });

  function clean(value) {
    return String(value ?? '').trim();
  }

  function hasValue(value) {
    return clean(value).length > 0;
  }

  function numberValue(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function normalizeGps(gps) {
    if (!gps) return null;
    const lat = Number(gps.lat);
    const lng = Number(gps.lng);
    const accuracy = Number(gps.accuracy ?? gps.accuracyMeters ?? gps.accuracyM ?? gps.accuracyFt);
    return {
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      accuracy: Number.isFinite(accuracy) ? accuracy : null,
      source: gps.source || 'phone',
      timestamp: gps.timestamp || new Date().toISOString(),
    };
  }

  function gpsConfidence(gps) {
    const point = normalizeGps(gps);
    if (!point || point.lat === null || point.lng === null) {
      return { level: 'red', label: 'GPS missing', ok: false, warning: 'Missing GPS.' };
    }
    if (point.accuracy === null) {
      return { level: 'amber', label: 'GPS accuracy unknown', ok: true, warning: 'GPS accuracy unknown.' };
    }
    if (point.accuracy <= GPS_LIMITS.greenMeters) {
      return { level: 'green', label: `GPS good ±${Math.round(point.accuracy)}m`, ok: true, warning: '' };
    }
    if (point.accuracy <= GPS_LIMITS.amberMeters) {
      return { level: 'amber', label: `GPS usable ±${Math.round(point.accuracy)}m`, ok: true, warning: `GPS accuracy is weak: ${Math.round(point.accuracy)}m.` };
    }
    return { level: 'red', label: `GPS poor ±${Math.round(point.accuracy)}m`, ok: false, warning: `GPS accuracy is poor: ${Math.round(point.accuracy)}m.` };
  }

  function warning(code, message, severity = 'warn', fix = '') {
    return { code, message, severity, fix };
  }

  function getConstants(projectOrContext) {
    return projectOrContext?.constants || projectOrContext?.project?.constants || {};
  }

  function getLogs(projectOrContext) {
    return projectOrContext?.logs || projectOrContext?.project?.logs || [];
  }

  function getOpenItems(projectOrContext) {
    return projectOrContext?.openItems || projectOrContext?.project?.openItems || [];
  }

  function validateLog(context) {
    const type = context?.type || context?.logType || LOG_TYPES.REPAIR;
    const fields = context?.fields || context || {};
    const constants = context?.constants || {};
    const logs = context?.logs || [];
    const gps = context?.gps || fields.gps || null;
    const photo = context?.photo || fields.photo || fields.photoData || '';
    const warnings = [];

    const gpsStatus = gpsConfidence(gps);
    if (gpsStatus.warning) {
      warnings.push(warning('GPS_CONFIDENCE', gpsStatus.warning, gpsStatus.level === 'red' ? 'danger' : 'warn', 'Retry GPS or save with override note.'));
    }

    if (!hasValue(photo)) {
      warnings.push(warning('PHOTO_MISSING', 'No photo attached.', 'warn', 'Attach photo or save with override.'));
    }

    REQUIRED_CONSTANTS.forEach((key) => {
      if (!hasValue(constants[key])) {
        warnings.push(warning(`CONSTANT_${key.toUpperCase()}_MISSING`, `${key} is blank.`, 'warn', 'Fill Setup constants so Mythos can auto-fill future logs.'));
      }
    });

    if (ROLL_REQUIRED_TYPES.includes(type) && !hasValue(constants.roll) && !hasValue(fields.roll)) {
      warnings.push(warning('ROLL_MISSING', 'Active roll number is blank.', 'danger', 'Enter active roll before logging roll/panel/seam/test work.'));
    }

    if (type === LOG_TYPES.REPAIR && !hasValue(fields.repairType)) {
      warnings.push(warning('REPAIR_TYPE_MISSING', 'Repair missing type: Patch, Bead, Burn Out, Wrinkle Cutout, Fishmouth, or Other.', 'danger', 'Select repair type.'));
    }

    if (type === LOG_TYPES.PANEL) {
      const panelNo = clean(fields.panel || fields.number || constants.panel);
      if (!panelNo) {
        warnings.push(warning('PANEL_NUMBER_MISSING', 'Panel number is blank.', 'danger', 'Enter or auto-generate panel number.'));
      }
      if (panelNo && logs.some((l) => l.type === LOG_TYPES.PANEL && clean(l.number || l.panel) === panelNo)) {
        warnings.push(warning('PANEL_DUPLICATE', `Panel number already exists: ${panelNo}.`, 'danger', 'Use a new panel number or edit the existing panel record.'));
      }
    }

    if (type === LOG_TYPES.SEAM) {
      const seamNo = clean(fields.seam || fields.number || constants.seam);
      if (!seamNo) {
        warnings.push(warning('SEAM_NUMBER_MISSING', 'Seam number is blank.', 'danger', 'Enter or auto-generate seam number.'));
      }
      if (!hasValue(constants.panel) && !hasValue(fields.panelA) && !hasValue(fields.panelB)) {
        warnings.push(warning('SEAM_PANEL_CONTEXT_MISSING', 'Seam is not tied to panel context.', 'warn', 'Set active panel or panel A/B.'));
      }
    }

    if (type === LOG_TYPES.AIR_TEST) {
      const duration = numberValue(fields.durationMin ?? fields.duration ?? fields.holdMinutes);
      const startPressure = fields.startPressure ?? fields.startPsi;
      const endPressure = fields.endPressure ?? fields.endPsi;
      if (duration < AIR_TEST_RULES.minimumHoldMinutes) {
        warnings.push(warning('AIR_TEST_UNDER_5_MIN', 'Air test duration is under 5 minutes.', 'danger', 'Continue test to at least 5 minutes or save with override.'));
      }
      if (!hasValue(startPressure) || !hasValue(endPressure)) {
        warnings.push(warning('AIR_TEST_PRESSURE_MISSING', 'Air test pressure fields are missing.', 'danger', 'Enter start and end pressure.'));
      }
      if (!hasValue(fields.result)) {
        warnings.push(warning('TEST_RESULT_MISSING', 'Air test missing pass/fail result.', 'danger', 'Select Pass, Fail, Retest Needed, or Pending.'));
      }
    }

    if (type === LOG_TYPES.DESTRUCTIVE_TEST) {
      const spacing = numberValue(fields.spacingFt ?? fields.spacing);
      if (spacing > DT_RULES.maximumSpacingFt) {
        warnings.push(warning('DT_SPACING_OVER_500', `Destructive test spacing is over ${DT_RULES.maximumSpacingFt} feet.`, 'danger', 'Add DT or record project-approved override.'));
      }
      if (!hasValue(fields.station) && !hasValue(fields.footage)) {
        warnings.push(warning('DT_STATION_MISSING', 'Destructive test station/footage is blank.', 'warn', 'Enter station or footage.'));
      }
    }

    if (TEST_TYPES.includes(type)) {
      if (!hasValue(fields.result)) {
        warnings.push(warning('TEST_RESULT_MISSING', 'Test result is missing.', 'warn', 'Select Pass, Fail, Retest Needed, or Pending.'));
      }
      if (clean(fields.result).toLowerCase() === 'fail') {
        warnings.push(warning('FAILED_TEST_FOLLOWUP', 'Failed test needs repair/retest follow-up.', 'danger', 'Mythos should create an open repair/retest item.'));
      }
    }

    return {
      ok: warnings.filter((w) => w.severity === 'danger').length === 0,
      warnings,
      gpsStatus,
    };
  }

  function createFollowUpItems(log) {
    const items = [];
    if (!log) return items;
    const result = clean(log.result || log.fields?.result).toLowerCase();
    if (TEST_TYPES.includes(log.type) && result === 'fail') {
      items.push({
        id: `OPEN-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'Repair/Retest',
        status: 'OPEN',
        priority: 'high',
        sourceLogId: log.id,
        sourceNumber: log.number,
        reason: `Failed ${log.type} requires repair/retest follow-up.`,
        createdAt: new Date().toISOString(),
      });
    }
    if (log.type === LOG_TYPES.DESTRUCTIVE_TEST) {
      items.push({
        id: `OPEN-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type: 'DT Patch',
        status: 'OPEN',
        priority: 'normal',
        sourceLogId: log.id,
        sourceNumber: log.number,
        reason: 'Destructive test cut needs patch/repair record.',
        createdAt: new Date().toISOString(),
      });
    }
    return items;
  }

  function carryForwardConstants(constants, log) {
    const next = Object.assign({}, constants || {});
    if (!log) return next;
    const number = clean(log.number);
    const fields = log.fields || log;

    if (log.type === LOG_TYPES.ROLL_USE && hasValue(fields.roll || number)) next.roll = clean(fields.roll || number);
    if (log.type === LOG_TYPES.PANEL && hasValue(fields.panel || number)) next.panel = clean(fields.panel || number);
    if (log.type === LOG_TYPES.SEAM && hasValue(fields.seam || number)) next.seam = clean(fields.seam || number);
    if (hasValue(fields.cell)) next.cell = clean(fields.cell);
    if (hasValue(fields.crew)) next.crew = clean(fields.crew);
    if (hasValue(fields.weather)) next.weather = clean(fields.weather);
    if (hasValue(fields.linerType)) next.linerType = clean(fields.linerType);
    if (hasValue(fields.linerThickness)) next.linerThickness = clean(fields.linerThickness);
    if (hasValue(fields.operator)) next.operator = clean(fields.operator);
    if (hasValue(fields.equipment)) next.equipment = clean(fields.equipment);
    return next;
  }

  function exportReadiness(project) {
    const constants = getConstants(project);
    const logs = getLogs(project);
    const openItems = getOpenItems(project);
    const issues = [];

    if (!logs.length) issues.push(warning('NO_LOGS', 'No logs saved.', 'danger', 'Capture at least one field log.'));
    if (!hasValue(constants.cell)) issues.push(warning('CELL_MISSING', 'Project cell/pond/lagoon is missing.', 'warn', 'Fill Setup constants.'));
    if (!hasValue(constants.roll)) issues.push(warning('ROLL_CONTEXT_MISSING', 'Active roll context is missing.', 'warn', 'Fill active roll if work has started.'));
    if (openItems.length) issues.push(warning('OPEN_ITEMS', `${openItems.length} open workflow item(s).`, 'danger', 'Finish open items before final export.'));

    let gpsMissing = 0;
    let photosMissing = 0;
    let overrideCount = 0;
    let dangerWarnings = 0;

    logs.forEach((log) => {
      if (!hasValue(log.lat) || !hasValue(log.lng)) gpsMissing += 1;
      if (!hasValue(log.photo)) photosMissing += 1;
      if (log.override) overrideCount += 1;
      const check = validateLog({
        type: log.type,
        fields: log,
        constants: log.constants || constants,
        gps: hasValue(log.lat) && hasValue(log.lng) ? { lat: log.lat, lng: log.lng, accuracy: log.accuracy } : null,
        photo: log.photo,
        logs,
      });
      dangerWarnings += check.warnings.filter((w) => w.severity === 'danger').length;
    });

    if (gpsMissing) issues.push(warning('GPS_MISSING_EXPORT', `${gpsMissing} log(s) missing GPS.`, 'danger', 'Retry GPS or document override reason.'));
    if (photosMissing) issues.push(warning('PHOTO_MISSING_EXPORT', `${photosMissing} log(s) missing photo.`, 'warn', 'Attach photos where required or document override.'));
    if (overrideCount) issues.push(warning('OVERRIDES_PRESENT', `${overrideCount} override(s) recorded.`, 'warn', 'Review overrides before final report.'));
    if (dangerWarnings) issues.push(warning('DANGER_WARNINGS_PRESENT', `${dangerWarnings} serious warning(s) detected.`, 'danger', 'Resolve before final export.'));

    const maxScore = 100;
    const penalty = Math.min(100,
      (issues.filter((i) => i.severity === 'danger').length * 20) +
      (issues.filter((i) => i.severity === 'warn').length * 8)
    );
    const score = Math.max(0, maxScore - penalty);

    return {
      score,
      status: score >= 90 ? 'ready' : score >= 70 ? 'review' : 'not_ready',
      issues,
      summary: `${score}% export ready — ${issues.length ? 'review warnings' : 'clean'}`,
    };
  }

  function nextAction(project) {
    const constants = getConstants(project);
    const logs = getLogs(project);
    const openItems = getOpenItems(project);

    if (!project) return 'Create or select a project.';
    if (!hasValue(project.name)) return 'Name the project.';
    if (!hasValue(constants.cell)) return 'Setup: enter pond/cell/lagoon.';
    if (!hasValue(constants.linerType) || !hasValue(constants.linerThickness)) return 'Setup: enter liner type and thickness.';
    if (!hasValue(constants.roll)) return 'Roll Inventory: capture active roll number.';
    if (openItems.length) return `Finish open item: ${openItems[openItems.length - 1].type}.`;
    if (!logs.length) return 'Capture first record: panel, seam, repair, or test.';
    const last = logs[logs.length - 1];
    if (last.type === LOG_TYPES.PANEL) return 'Next: start seam or continue panel placement.';
    if (last.type === LOG_TYPES.SEAM) return 'Next: add weld test or continue seam.';
    if (TEST_TYPES.includes(last.type) && clean(last.result).toLowerCase() === 'fail') return 'Next: create repair/retest item for failed test.';
    return 'Continue logging. Mythos will carry constants forward.';
  }

  function latestLogs(project, limit = 5) {
    return getLogs(project).slice(-limit).reverse();
  }

  function summarizeProject(project) {
    const logs = getLogs(project);
    const counts = logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {});
    const readiness = exportReadiness(project);
    return {
      name: project?.name || 'Unnamed Project',
      counts,
      totalLogs: logs.length,
      openItems: getOpenItems(project).length,
      readiness,
      nextAction: nextAction(project),
      latestLogs: latestLogs(project),
    };
  }

  global.MythosFieldBrain = Object.freeze({
    VERSION,
    LOG_TYPES,
    REPAIR_TYPES,
    GPS_LIMITS,
    AIR_TEST_RULES,
    DT_RULES,
    gpsConfidence,
    validateLog,
    createFollowUpItems,
    carryForwardConstants,
    exportReadiness,
    nextAction,
    latestLogs,
    summarizeProject,
  });
})(window);
