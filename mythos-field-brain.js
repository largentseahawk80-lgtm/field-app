/**
 * LinerSync Mythos Field Brain
 * Version: 0.2.0
 *
 * Field QC mode:
 * - critical = interrupt now / requires override
 * - review = save quietly, clean up at export
 * - suggestion = helpful note, not counted as an issue
 */
(function attachMythosFieldBrain(global) {
  'use strict';

  const VERSION = '0.2.0';

  const LOG_TYPES = Object.freeze({
    REPAIR: 'Repair', ROLL_USE: 'Roll Use', PANEL: 'Panel', SEAM: 'Seam',
    WEDGE_TEST: 'Wedge Test', EXTRUSION_TEST: 'Extrusion Test', AIR_TEST: 'Air Test',
    DESTRUCTIVE_TEST: 'Destructive Test', DAILY: 'Daily'
  });

  const REPAIR_TYPES = Object.freeze(['Patch','Bead','Burn Out','Wrinkle Cutout','Fishmouth','Hole','Cap Strip','Extrusion Repair','Other']);
  const ROLL_REQUIRED_TYPES = Object.freeze([LOG_TYPES.ROLL_USE,LOG_TYPES.PANEL,LOG_TYPES.SEAM,LOG_TYPES.WEDGE_TEST,LOG_TYPES.EXTRUSION_TEST,LOG_TYPES.AIR_TEST,LOG_TYPES.DESTRUCTIVE_TEST]);
  const TEST_TYPES = Object.freeze([LOG_TYPES.WEDGE_TEST,LOG_TYPES.EXTRUSION_TEST,LOG_TYPES.AIR_TEST,LOG_TYPES.DESTRUCTIVE_TEST]);
  const GPS_LIMITS = Object.freeze({ greenMeters: 10, amberMeters: 30, redMeters: 60 });
  const AIR_TEST_RULES = Object.freeze({ minimumHoldMinutes: 5 });
  const DT_RULES = Object.freeze({ maximumSpacingFt: 500 });

  function clean(value){ return String(value ?? '').trim(); }
  function hasValue(value){ return clean(value).length > 0; }
  function numberValue(value){ const n = Number(value); return Number.isFinite(n) ? n : 0; }
  function item(code, message, category='review', fix=''){
    const severity = category === 'critical' ? 'danger' : category === 'review' ? 'warn' : 'info';
    return { code, message, category, severity, fix };
  }

  function normalizeGps(gps){
    if(!gps) return null;
    const lat = Number(gps.lat), lng = Number(gps.lng);
    const accuracy = Number(gps.accuracy ?? gps.accuracyMeters ?? gps.accuracyM);
    return {
      lat: Number.isFinite(lat) ? lat : null,
      lng: Number.isFinite(lng) ? lng : null,
      accuracy: Number.isFinite(accuracy) ? accuracy : null,
      source: gps.source || 'phone',
      timestamp: gps.timestamp || new Date().toISOString()
    };
  }

  function gpsConfidence(gps){
    const point = normalizeGps(gps);
    if(!point || point.lat === null || point.lng === null) return { level:'red', label:'GPS missing', ok:false, warning:'Missing GPS.' };
    if(point.accuracy === null) return { level:'amber', label:'GPS accuracy unknown', ok:true, warning:'GPS accuracy unknown.' };
    if(point.accuracy <= GPS_LIMITS.greenMeters) return { level:'green', label:`GPS good ±${Math.round(point.accuracy)}m`, ok:true, warning:'' };
    if(point.accuracy <= GPS_LIMITS.amberMeters) return { level:'amber', label:`GPS usable ±${Math.round(point.accuracy)}m`, ok:true, warning:`GPS accuracy is weak: ${Math.round(point.accuracy)}m.` };
    return { level:'red', label:`GPS poor ±${Math.round(point.accuracy)}m`, ok:false, warning:`GPS accuracy is poor: ${Math.round(point.accuracy)}m.` };
  }

  function getConstants(projectOrContext){ return projectOrContext?.constants || projectOrContext?.project?.constants || {}; }
  function getLogs(projectOrContext){ return projectOrContext?.logs || projectOrContext?.project?.logs || []; }
  function getOpenItems(projectOrContext){ return projectOrContext?.openItems || projectOrContext?.project?.openItems || []; }

  function validateLog(context){
    const type = context?.type || context?.logType || LOG_TYPES.REPAIR;
    const fields = context?.fields || context || {};
    const constants = context?.constants || {};
    const logs = context?.logs || [];
    const gps = context?.gps || fields.gps || null;
    const photo = context?.photo || fields.photo || fields.photoData || '';
    const critical = [], review = [], suggestions = [];

    const gpsStatus = gpsConfidence(gps);
    if(gpsStatus.warning){
      if(gpsStatus.level === 'red') critical.push(item('GPS_MISSING_OR_POOR', gpsStatus.warning, 'critical', 'Retry GPS or save with override.'));
      else review.push(item('GPS_WEAK', gpsStatus.warning, 'review', 'Accept if usable, review at export.'));
    }

    if(!hasValue(photo)) review.push(item('PHOTO_MISSING','No photo attached.','review','Attach if needed before export.'));
    if(!hasValue(constants.cell)) review.push(item('CELL_MISSING','Project cell/pond/lagoon is missing.','review','Fill Setup when convenient.'));
    if(!hasValue(constants.linerType)) suggestions.push(item('LINER_TYPE_MISSING','Liner type is blank.','suggestion','Fill Setup for cleaner reports.'));
    if(!hasValue(constants.linerThickness)) suggestions.push(item('LINER_THICKNESS_MISSING','Liner thickness is blank.','suggestion','Fill Setup for cleaner reports.'));

    if(ROLL_REQUIRED_TYPES.includes(type) && !hasValue(constants.roll) && !hasValue(fields.roll)){
      critical.push(item('ROLL_MISSING','Active roll number is blank.','critical','Enter active roll before logging roll/panel/seam/test work.'));
    }

    if(type === LOG_TYPES.REPAIR && !hasValue(fields.repairType)){
      critical.push(item('REPAIR_TYPE_MISSING','Repair missing type: Patch, Bead, Burn Out, Wrinkle Cutout, Fishmouth, or Other.','critical','Select repair type.'));
    }

    if(type === LOG_TYPES.PANEL){
      const panelNo = clean(fields.panel || fields.number || constants.panel);
      if(!panelNo) critical.push(item('PANEL_NUMBER_MISSING','Panel number is blank.','critical','Enter or auto-generate panel number.'));
      if(panelNo && logs.some(l => l.type === LOG_TYPES.PANEL && clean(l.number || l.panel) === panelNo)){
        critical.push(item('PANEL_DUPLICATE',`Panel number already exists: ${panelNo}.`,'critical','Use a new panel number or edit existing panel record.'));
      }
    }

    if(type === LOG_TYPES.SEAM){
      const seamNo = clean(fields.seam || fields.number || constants.seam);
      if(!seamNo) critical.push(item('SEAM_NUMBER_MISSING','Seam number is blank.','critical','Enter or auto-generate seam number.'));
      if(!hasValue(constants.panel) && !hasValue(fields.panelA) && !hasValue(fields.panelB)){
        review.push(item('SEAM_PANEL_CONTEXT_MISSING','Seam is not tied to panel context.','review','Set active panel or panel A/B before export.'));
      }
    }

    if(type === LOG_TYPES.AIR_TEST){
      const duration = numberValue(fields.durationMin ?? fields.duration ?? fields.holdMinutes);
      const startPressure = fields.startPressure ?? fields.startPsi;
      const endPressure = fields.endPressure ?? fields.endPsi;
      if(duration < AIR_TEST_RULES.minimumHoldMinutes) critical.push(item('AIR_TEST_UNDER_5_MIN','Air test duration is under 5 minutes.','critical','Continue test to at least 5 minutes or override.'));
      if(!hasValue(startPressure) || !hasValue(endPressure)) critical.push(item('AIR_TEST_PRESSURE_MISSING','Air test pressure fields are missing.','critical','Enter start and end pressure.'));
      if(!hasValue(fields.result)) critical.push(item('TEST_RESULT_MISSING','Air test missing pass/fail result.','critical','Select Pass, Fail, Retest Needed, or Pending.'));
    }

    if(type === LOG_TYPES.DESTRUCTIVE_TEST){
      const spacing = numberValue(fields.spacingFt ?? fields.spacing);
      if(spacing > DT_RULES.maximumSpacingFt) critical.push(item('DT_SPACING_OVER_500',`Destructive test spacing is over ${DT_RULES.maximumSpacingFt} feet.`,'critical','Add DT or record approved override.'));
      if(!hasValue(fields.station) && !hasValue(fields.footage)) review.push(item('DT_STATION_MISSING','Destructive test station/footage is blank.','review','Enter station or footage before export.'));
    }

    if(TEST_TYPES.includes(type)){
      if(!hasValue(fields.result)) review.push(item('TEST_RESULT_REVIEW','Test result is missing.','review','Add result when known.'));
      if(clean(fields.result).toLowerCase() === 'fail') critical.push(item('FAILED_TEST_FOLLOWUP','Failed test needs repair/retest follow-up.','critical','Create repair/retest open item.'));
      if(!hasValue(fields.technician)) review.push(item('TECH_MISSING','Technician name is missing.','review','Choose from dropdown before export.'));
    }

    const warnings = critical;
    return { ok: critical.length === 0, warnings, critical, review, reviewItems: review, suggestions, gpsStatus, counts:{ critical:critical.length, review:review.length, suggestions:suggestions.length } };
  }

  function createFollowUpItems(log){
    const items = [];
    if(!log) return items;
    const result = clean(log.result || log.fields?.result).toLowerCase();
    if(TEST_TYPES.includes(log.type) && result === 'fail') items.push({ id:`OPEN-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, type:'Repair/Retest', status:'OPEN', priority:'high', sourceLogId:log.id, sourceNumber:log.number, reason:`Failed ${log.type} requires repair/retest follow-up.`, createdAt:new Date().toISOString() });
    if(log.type === LOG_TYPES.DESTRUCTIVE_TEST) items.push({ id:`OPEN-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, type:'DT Patch', status:'OPEN', priority:'normal', sourceLogId:log.id, sourceNumber:log.number, reason:'Destructive test cut needs patch/repair record.', createdAt:new Date().toISOString() });
    return items;
  }

  function carryForwardConstants(constants, log){
    const next = Object.assign({}, constants || {});
    if(!log) return next;
    const number = clean(log.number), fields = log.fields || log;
    if(log.type === LOG_TYPES.ROLL_USE && hasValue(fields.roll || number)) next.roll = clean(fields.roll || number);
    if(log.type === LOG_TYPES.PANEL && hasValue(fields.panel || number)) next.panel = clean(fields.panel || number);
    if(log.type === LOG_TYPES.SEAM && hasValue(fields.seam || number)) next.seam = clean(fields.seam || number);
    ['cell','crew','weather','linerType','linerThickness','operator','equipment'].forEach(k => { if(hasValue(fields[k])) next[k] = clean(fields[k]); });
    return next;
  }

  function exportReadiness(project){
    const constants = getConstants(project), logs = getLogs(project), openItems = getOpenItems(project);
    const critical = [], review = [], suggestions = [];
    if(!logs.length) review.push(item('NO_LOGS','No logs saved.','review','Capture at least one field log.'));
    if(!hasValue(constants.cell)) review.push(item('CELL_MISSING','Project cell/pond/lagoon is missing.','review','Fill Setup constants.'));
    if(!hasValue(constants.roll)) review.push(item('ROLL_CONTEXT_MISSING','Active roll context is missing.','review','Fill active roll if work has started.'));
    if(openItems.length) critical.push(item('OPEN_ITEMS',`${openItems.length} open workflow item(s).`,'critical','Finish open items before final export.'));

    let gpsMissing=0, photosMissing=0, overrideCount=0;
    logs.forEach(log => {
      if(!hasValue(log.lat) || !hasValue(log.lng)) gpsMissing += 1;
      if(!hasValue(log.photo)) photosMissing += 1;
      if(log.override) overrideCount += 1;
      const check = validateLog({ type:log.type, fields:log, constants:log.constants||constants, gps:hasValue(log.lat)&&hasValue(log.lng)?{lat:log.lat,lng:log.lng,accuracy:log.accuracy}:null, photo:log.photo, logs });
      critical.push(...check.critical);
      review.push(...check.reviewItems);
      suggestions.push(...check.suggestions);
    });
    if(gpsMissing) critical.push(item('GPS_MISSING_EXPORT',`${gpsMissing} log(s) missing GPS.`,'critical','Retry GPS or document override reason.'));
    if(photosMissing) review.push(item('PHOTO_MISSING_EXPORT',`${photosMissing} log(s) missing photo.`,'review','Attach photos where required before final report.'));
    if(overrideCount) review.push(item('OVERRIDES_PRESENT',`${overrideCount} override(s) recorded.`,'review','Review overrides before final report.'));

    const seen = new Set();
    function dedupe(arr){ return arr.filter(x => { const key=x.code+'|'+x.message; if(seen.has(key)) return false; seen.add(key); return true; }); }
    const criticalD = dedupe(critical), reviewD = dedupe(review), suggestionsD = dedupe(suggestions);
    const penalty = Math.min(100, criticalD.length*25 + reviewD.length*6);
    const score = Math.max(0, 100 - penalty);
    const status = criticalD.length ? 'not_ready' : reviewD.length ? 'review' : 'ready';
    return { score, status, critical:criticalD, review:reviewD, reviewItems:reviewD, suggestions:suggestionsD, issues:criticalD, allItems:[...criticalD,...reviewD,...suggestionsD], counts:{critical:criticalD.length, review:reviewD.length, suggestions:suggestionsD.length}, summary: criticalD.length ? `${criticalD.length} critical — fix/override now` : reviewD.length ? `No critical issues — ${reviewD.length} review later` : 'No critical issues — clean' };
  }

  function nextAction(project){
    const constants = getConstants(project), logs = getLogs(project), openItems = getOpenItems(project);
    const readiness = exportReadiness(project);
    if(!project) return 'Create or select a project.';
    if(readiness.critical.length) return `Critical: ${readiness.critical[0].message}`;
    if(!hasValue(constants.cell)) return 'Setup when convenient: enter pond/cell/lagoon.';
    if(!hasValue(constants.roll)) return 'Roll Inventory: capture active roll number before panel/seam/test work.';
    if(openItems.length) return `Finish open item: ${openItems[openItems.length - 1].type}.`;
    if(!logs.length) return 'Capture first record: panel, seam, repair, or test.';
    const last = logs[logs.length - 1];
    if(last.type === LOG_TYPES.PANEL) return 'Next: start seam or continue panel placement.';
    if(last.type === LOG_TYPES.SEAM) return 'Next: add weld test or continue seam.';
    return 'No critical issues. Keep logging QC.';
  }

  function latestLogs(project, limit=5){ return getLogs(project).slice(-limit).reverse(); }
  function summarizeProject(project){
    const logs = getLogs(project);
    const counts = logs.reduce((acc, log) => { acc[log.type] = (acc[log.type] || 0) + 1; return acc; }, {});
    const readiness = exportReadiness(project);
    return { name:project?.name || 'Unnamed Project', counts, totalLogs:logs.length, openItems:getOpenItems(project).length, readiness, nextAction:nextAction(project), latestLogs:latestLogs(project) };
  }

  global.MythosFieldBrain = Object.freeze({ VERSION, LOG_TYPES, REPAIR_TYPES, GPS_LIMITS, AIR_TEST_RULES, DT_RULES, gpsConfidence, validateLog, createFollowUpItems, carryForwardConstants, exportReadiness, nextAction, latestLogs, summarizeProject });
})(window);
