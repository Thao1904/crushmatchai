function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submissions");
    const payload = JSON.parse(e.postData.contents);
    const data = payload.record || {};
    const secret = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET") || "";

    if (!sheet) {
      throw new Error('Missing "Submissions" sheet');
    }

    if (secret && payload.secret !== secret) {
      throw new Error("Unauthorized");
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

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Submissions");
    const secret = PropertiesService.getScriptProperties().getProperty("SHARED_SECRET") || "";
    const action = e.parameter.action || "list";

    if (!sheet) {
      throw new Error('Missing "Submissions" sheet');
    }

    if (secret && e.parameter.secret !== secret) {
      throw new Error("Unauthorized");
    }

    if (action !== "list") {
      throw new Error("Unsupported action");
    }

    const values = sheet.getDataRange().getValues();
    if (values.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ ok: true, rows: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const headers = values[0];
    const rows = values.slice(1).reverse().map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });

      item.fakeSignals = {
        attraction: Number(item.attraction || 0),
        future: Number(item.future || 0),
        chaos: Number(item.chaos || 0)
      };

      return {
        id: item.id || "",
        yourName: item.yourName || "",
        crushName: item.crushName || "",
        yourBirthDate: item.yourBirthDate || "",
        crushBirthDate: item.crushBirthDate || "",
        locale: item.locale || "",
        fakeScore: Number(item.fakeScore || 0),
        fakeSignals: item.fakeSignals,
        createdAt: item.createdAt || ""
      };
    });

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, rows: rows }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
