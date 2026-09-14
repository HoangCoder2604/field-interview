const SHEET_NAME = "Interviews";
const DRIVE_FOLDER_NAME = "Field Interview Photos";

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");

    if (body.action !== "saveInterview" || !body.interview) {
      return json_({ ok: false, error: "Invalid payload" });
    }

    const item = body.interview;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Session ID",
        "Interviewer",
        "Respondent",
        "Topic",
        "Interview Type",
        "Started At",
        "Ended At",
        "Latitude",
        "Longitude",
        "Accuracy (m)",
        "Notes",
        "Photo URL",
        "Synced At"
      ]);
      sheet.setFrozenRows(1);
    }

    // Tránh ghi trùng khi app retry sync.
    const found = sheet.createTextFinder(String(item.id)).matchEntireCell(true).findNext();
    if (found) {
      return json_({ ok: true, duplicate: true, imageUrl: "" });
    }

    let imageUrl = "";
    if (item.photoDataUrl) {
      imageUrl = saveImage_(item.photoDataUrl, item.id);
    }

    const loc = item.location || {};
    sheet.appendRow([
      safeCell_(item.id),
      safeCell_(item.interviewer),
      safeCell_(item.respondent),
      safeCell_(item.topic),
      safeCell_(item.interviewType),
      safeCell_(item.startedAt),
      safeCell_(item.endedAt),
      loc.lat || "",
      loc.lng || "",
      loc.accuracy || "",
      safeCell_(item.notes),
      imageUrl,
      new Date().toISOString()
    ]);

    return json_({ ok: true, imageUrl: imageUrl });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function doGet() {
  return json_({ ok: true, service: "Field Interview API" });
}

function saveImage_(dataUrl, sessionId) {
  const parts = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!parts) throw new Error("Invalid image data");

  const mime = parts[1];
  const bytes = Utilities.base64Decode(parts[2]);
  const ext = mime.includes("png") ? "png" : "jpg";
  const blob = Utilities.newBlob(bytes, mime, sessionId + "." + ext);

  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  const folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
  const file = folder.createFile(blob);

  // Chỉ dùng dòng dưới nếu bạn chấp nhận ảnh có link xem được bởi người có link.
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file.getUrl();
}

function safeCell_(value) {
  if (value === null || value === undefined) return "";
  const text = String(value);
  // Tránh spreadsheet formula injection từ nội dung người dùng.
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
