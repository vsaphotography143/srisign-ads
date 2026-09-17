/********************************************************************
 *  SriSign Ads - Enquiry to Google Sheet + WhatsApp
 *
 *  HOW TO SET UP (one time):
 *  1. Go to https://sheets.google.com and create a new Google Sheet.
 *  2. Menu: Extensions  >  Apps Script.  (Editor opens with Code.gs)
 *  3. Delete any default code, paste ALL of this file into Code.gs.
 *  4. Set CALLMEBOT_KEY (get free key at https://www.callmebot.com
 *     - WhatsApp the bot "activate" via your number, it replies with a key)
 *     and keep WHATSAPP_NUMBER as the number that will RECEIVE updates.
 *  5. Click Deploy > New deployment:
 *       - Choose type: Web app
 *       - Execute as: Me
 *       - Who has access: Anyone
 *       - Click Deploy, then copy the "Web app URL"
 *  6. Paste that URL into script.js  as ENQUIRY_ENDPOINT (REPLACE... line).
 *  7. Run setupTriggers() once (in the Apps Script editor) to schedule
 *     the daily evening WhatsApp report.
 ********************************************************************/

const SHEET_NAME = 'Enquiries';

// Number that receives the WhatsApp messages (country code + number, NO "+")
const WHATSAPP_NUMBER = '918328536203';

// Free WhatsApp bridge - get your key from https://www.callmebot.com
const CALLMEBOT_KEY = 'YOUR_CALLMEBOT_API_KEY'; // <-- REPLACE ME


/* ---------- Receive form data from the website ---------- */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getSheet();
    sheet.appendRow([
      new Date(),
      data.name  || '',
      data.phone || '',
      data.email || '',
      data.service || '',
      data.message || ''
    ]);

    var msg = 'NEW ENQUIRY - SriSign Ads%0A' +
      'Name: ' + (data.name || '') + '%0A' +
      'Phone: ' + (data.phone || '') + '%0A' +
      'Email: ' + (data.email || '') + '%0A' +
      'Service: ' + (data.service || '') + '%0A' +
      'Message: ' + (data.message || '');
    sendWhatsApp(msg);

    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, error: String(err) });
  }
}

/* ---------- Daily evening report to WhatsApp ---------- */
function dailySummary() {
  var sheet = getSheet();
  var values = sheet.getDataRange().getValues();
  var today = new Date();
  var todayKey = formatDate(today);
  var lines = [];
  var count = 0;

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var ts = row[0];
    if (ts && formatDate(new Date(ts)) === todayKey) {
      count++;
      lines.push(count + '. ' + row[1] + ' | ' + row[2] + ' | ' + row[3] + ' | ' + row[4]);
    }
  }

  var msg;
  if (count === 0) {
    msg = 'SriSign Ads Daily Report (' + todayKey + '):%0ANo new enquiries today.';
  } else {
    msg = 'SriSign Ads Daily Enquiry Report (%0A' + todayKey + '):%0A' +
      'Total: ' + count + ' enquiry(s).%0A%0A' + lines.join('%0A');
  }
  sendWhatsApp(msg);
}

/* ---------- Schedule daily trigger (run once) ---------- */
function setupTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (t) { ScriptApp.deleteTrigger(t); });

  // Runs every day at 7:00 PM. Change time/minutes as needed.
  ScriptApp.newTrigger('dailySummary')
    .timeBased()
    .everyDays(1)
    .atHour(19)
    .create();
}

/* ---------- Helpers ---------- */
function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(['Timestamp', 'Name', 'Phone', 'Email', 'Service', 'Message']);
  }
  return sheet;
}

function sendWhatsApp(message) {
  var url = 'https://api.callmebot.com/whatsapp.php?phone=' + WHATSAPP_NUMBER +
    '&text=' + message +
    '&apikey=' + CALLMEBOT_KEY;
  UrlFetchApp.fetch(url);
}

function formatDate(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}