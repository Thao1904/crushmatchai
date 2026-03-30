function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submissions");
    const data = JSON.parse(e.postData.contents);

    if (!sheet) {
      throw new Error('Missing "Submissions" sheet');
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "id",
        "yourName",
        "crushName",
        "yourBirthDate",
        "crushBirthDate",
        "locale",
        "fakeScore",
        "attraction",
        "future",
        "chaos",
        "createdAt"
      ]);
    }

    sheet.appendRow([
      data.id || "",
      data.yourName || "",
      data.crushName || "",
      data.yourBirthDate || "",
      data.crushBirthDate || "",
      data.locale || "",
      data.fakeScore || "",
      data.fakeSignals?.attraction || "",
      data.fakeSignals?.future || "",
      data.fakeSignals?.chaos || "",
      data.createdAt || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
