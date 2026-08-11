const TBTC = Object.freeze({
  SPREADSHEET_ID: '11_eZ6FrQD0yi8307Sf3yYK3zOuixDOM07o0bTEWRaO8',
  SHEET_NAME: 'Demandes',
  HEADER_ROW: 4,
  FIRST_DATA_ROW: 5,
  COLUMN_COUNT: 16,
  MAX_RESULTS: 500,
  TIMEZONE: 'Africa/Kinshasa'
});

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    if (String(payload.website || '').trim()) {
      return json_({ ok: true, ignored: true });
    }

    const required = ['nom', 'telephone', 'departement', 'objet', 'message'];
    const missing = required.filter(function (key) {
      return !String(payload[key] || '').trim();
    });
    if (missing.length) {
      return json_({ ok: false, error: 'Champs obligatoires manquants', fields: missing });
    }

    const now = new Date();
    const reference = 'TBTC-' + Utilities.formatDate(now, TBTC.TIMEZONE, 'yyyyMMdd-HHmmss') + '-' + randomCode_();
    const row = [
      reference,
      now,
      'Nouvelle',
      clean_(payload.priorite || 'Normale'),
      clean_(payload.departement),
      clean_(payload.nom),
      clean_(payload.telephone),
      clean_(payload.email || '#'),
      clean_(payload.objet),
      clean_(payload.message),
      clean_(payload.lieu || '#'),
      clean_(payload.budget || '#'),
      clean_(payload.delai || '#'),
      clean_(payload.source || 'Site web'),
      '',
      ''
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      const sheet = getRegister_();
      const targetRow = Math.max(sheet.getLastRow() + 1, TBTC.FIRST_DATA_ROW);
      sheet.getRange(targetRow, 1, 1, TBTC.COLUMN_COUNT).setValues([row]);
      sheet.getRange(targetRow, 2).setNumberFormat('dd/MM/yyyy HH:mm');

      if (targetRow > 204) {
        sheet.getRange(204, 3, 1, 12).copyTo(
          sheet.getRange(targetRow, 3, 1, 12),
          SpreadsheetApp.CopyPasteType.PASTE_DATA_VALIDATION,
          false
        );
      }
      sortDemandes_();
    } finally {
      lock.releaseLock();
    }

    return json_({ ok: true, reference: reference, receivedAt: now.toISOString() });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: 'Enregistrement impossible', detail: String(error.message || error) });
  }
}

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || 'health').toLowerCase();
    if (action === 'health') {
      return json_({ ok: true, service: 'TBTC Administration API', timestamp: new Date().toISOString() });
    }

    const suppliedKey = String((e && e.parameter && e.parameter.key) || '');
    const expectedKey = String(PropertiesService.getScriptProperties().getProperty('ADMIN_KEY') || '');
    if (!expectedKey || !safeEqual_(suppliedKey, expectedKey)) {
      return json_({ ok: false, error: 'Accès administratif refusé' });
    }

    if (action === 'list') return json_(readDemandes_());
    return json_({ ok: false, error: 'Action inconnue' });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: 'Lecture impossible', detail: String(error.message || error) });
  }
}

function setConfiguration(spreadsheetId, adminKey) {
  if (!spreadsheetId || !adminKey || adminKey.length < 24) {
    throw new Error('Indiquez un identifiant de classeur et une clé administrateur d’au moins 24 caractères.');
  }
  PropertiesService.getScriptProperties().setProperties({
    SPREADSHEET_ID: String(spreadsheetId).trim(),
    ADMIN_KEY: String(adminKey).trim()
  });
  sortDemandes_();
  return 'Configuration enregistrée.';
}

function shareWithAdministrators(emailList) {
  const emails = Array.isArray(emailList)
    ? emailList
    : String(emailList || '').split(',').map(function (value) { return value.trim(); }).filter(Boolean);
  if (!emails.length) throw new Error('Ajoutez au moins une adresse e-mail.');
  getSpreadsheet_().addEditors(emails);
  return emails.length + ' administrateur(s) ajouté(s).';
}

function sortDemandes() {
  sortDemandes_();
  return 'Demandes triées de la plus récente à la plus ancienne.';
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('TBTC Administration')
    .addItem('Trier les demandes', 'sortDemandes')
    .addToUi();
}

function getSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (id) return SpreadsheetApp.openById(id);
  if (TBTC.SPREADSHEET_ID) return SpreadsheetApp.openById(TBTC.SPREADSHEET_ID);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) throw new Error('Aucun classeur configuré. Exécutez setConfiguration().');
  return active;
}

function getRegister_() {
  const sheet = getSpreadsheet_().getSheetByName(TBTC.SHEET_NAME);
  if (!sheet) throw new Error('Onglet « ' + TBTC.SHEET_NAME + ' » introuvable.');
  return sheet;
}

function sortDemandes_() {
  const sheet = getRegister_();
  const lastRow = sheet.getLastRow();
  if (lastRow >= TBTC.FIRST_DATA_ROW) {
    sheet.getRange(TBTC.FIRST_DATA_ROW, 1, lastRow - TBTC.FIRST_DATA_ROW + 1, TBTC.COLUMN_COUNT)
      .sort({ column: 2, ascending: false });
  }
}

function readDemandes_() {
  const sheet = getRegister_();
  const lastRow = sheet.getLastRow();
  if (lastRow < TBTC.FIRST_DATA_ROW) return { ok: true, count: 0, records: [] };

  const rows = sheet.getRange(
    TBTC.FIRST_DATA_ROW,
    1,
    Math.min(lastRow - TBTC.FIRST_DATA_ROW + 1, TBTC.MAX_RESULTS),
    TBTC.COLUMN_COUNT
  ).getValues();
  const records = rows.filter(function (row) { return row[0]; }).map(function (row) {
    return {
      reference: row[0], dateReception: row[1] instanceof Date ? row[1].toISOString() : row[1],
      statut: row[2], priorite: row[3], departement: row[4], nom: row[5],
      telephone: row[6], email: row[7], objet: row[8], message: row[9],
      lieu: row[10], budget: row[11], delai: row[12], source: row[13],
      affecteA: row[14], notes: row[15]
    };
  });
  return { ok: true, count: records.length, records: records };
}

function parsePayload_(e) {
  if (e && e.parameter && Object.keys(e.parameter).length) return e.parameter;
  if (e && e.postData && e.postData.contents) return JSON.parse(e.postData.contents);
  return {};
}

function clean_(value) {
  const text = String(value == null ? '' : value).trim().slice(0, 5000);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function randomCode_() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
}

function safeEqual_(a, b) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
