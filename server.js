const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

const rootDir = __dirname;
const publicDir = path.join(rootDir, "public");
const dataDir = path.join(rootDir, "data");
const dataFile = path.join(dataDir, "submissions.json");
const envFile = path.join(rootDir, ".env");

loadEnv(envFile);

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me-now";
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const sessions = new Map();

ensureStorage();

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "POST" && url.pathname === "/api/submit") {
      return handleSubmit(req, res);
    }

    if (req.method === "POST" && url.pathname === "/api/admin/login") {
      return handleAdminLogin(req, res);
    }

    if (req.method === "POST" && url.pathname === "/api/admin/logout") {
      return handleAdminLogout(req, res);
    }

    if (req.method === "GET" && url.pathname === "/api/admin/submissions") {
      return handleAdminSubmissions(req, res);
    }

    if (req.method === "GET" && url.pathname === "/api/admin/export.csv") {
      return handleAdminExport(req, res);
    }

    if (req.method === "GET" && url.pathname === "/api/health") {
      return sendJson(res, 200, {
        ok: true,
        totalSubmissions: readSubmissions().length
      });
    }

    if (req.method === "GET") {
      return serveStatic(url.pathname, res);
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "Internal server error" });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`CrushMatch prank site running at http://${HOST}:${PORT}`);
});

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function ensureStorage() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]\n", "utf8");
  }
}

function readSubmissions() {
  try {
    const raw = fs.readFileSync(dataFile, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Failed to read submissions:", error);
    return [];
  }
}

function saveSubmissions(submissions) {
  fs.writeFileSync(dataFile, JSON.stringify(submissions, null, 2) + "\n", "utf8");
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
      if (body.length > 1_000_000) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

async function handleSubmit(req, res) {
  const body = await parseBody(req);
  const yourName = cleanText(body.yourName, 80);
  const crushName = cleanText(body.crushName, 80);
  const yourBirthDate = cleanDate(body.yourBirthDate);
  const crushBirthDate = cleanDate(body.crushBirthDate);
  const locale = cleanText(body.locale, 10) || "eng";

  if (!yourName || !crushName) {
    return sendJson(res, 400, { error: "Both names are required." });
  }

  const scoreSeed = `${yourName}|${crushName}|${yourBirthDate}|${crushBirthDate}`;
  const fakeScore = seededNumber(scoreSeed, 62, 99);
  const fakeSignals = {
    attraction: seededNumber(`a:${scoreSeed}`, 55, 98),
    future: seededNumber(`f:${scoreSeed}`, 41, 97),
    chaos: seededNumber(`c:${scoreSeed}`, 33, 100)
  };

  const submissions = readSubmissions();
  const record = {
    id: crypto.randomUUID(),
    yourName,
    crushName,
    yourBirthDate,
    crushBirthDate,
    locale,
    fakeScore,
    fakeSignals,
    createdAt: new Date().toISOString()
  };

  submissions.unshift(record);
  saveSubmissions(submissions);

  sendJson(res, 201, {
    ok: true,
    record: {
      id: record.id,
      fakeScore,
      fakeSignals,
      createdAt: record.createdAt
    }
  });
}

async function handleAdminLogin(req, res) {
  const body = await parseBody(req);
  const password = String(body.password || "");

  if (!constantTimeMatch(password, ADMIN_PASSWORD)) {
    return sendJson(res, 401, { error: "Wrong password." });
  }

  const token = createSessionToken();
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  sendJson(
    res,
    200,
    { ok: true },
    {
      "Set-Cookie": buildCookie("admin_session", signToken(token), {
        httpOnly: true,
        maxAge: SESSION_TTL_MS / 1000,
        path: "/",
        sameSite: "Strict"
      })
    }
  );
}

function handleAdminLogout(req, res) {
  const token = getAuthedToken(req);
  if (token) {
    sessions.delete(token);
  }

  sendJson(
    res,
    200,
    { ok: true },
    {
      "Set-Cookie": buildCookie("admin_session", "", {
        httpOnly: true,
        maxAge: 0,
        path: "/",
        sameSite: "Strict"
      })
    }
  );
}

function handleAdminSubmissions(req, res) {
  if (!isAuthed(req)) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }

  sendJson(res, 200, { submissions: readSubmissions() });
}

function handleAdminExport(req, res) {
  if (!isAuthed(req)) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }

  const rows = readSubmissions();
  const csv = toCsv(rows);
  res.writeHead(200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": 'attachment; filename="crushmatch-prank-export.csv"'
  });
  res.end(csv);
}

function serveStatic(requestPath, res) {
  const safePath = normalizePath(requestPath);
  let filePath = path.join(publicDir, safePath);

  if (requestPath === "/" || requestPath === "") {
    filePath = path.join(publicDir, "index.html");
  } else if (requestPath === "/admin") {
    filePath = path.join(publicDir, "admin.html");
  }

  if (!filePath.startsWith(publicDir)) {
    return sendJson(res, 403, { error: "Forbidden" });
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      const fallback = path.join(publicDir, "index.html");
      if (requestPath !== "/" && requestPath !== "/admin" && fs.existsSync(fallback)) {
        return fs.readFile(fallback, (fallbackError, fallbackContent) => {
          if (fallbackError) {
            return sendJson(res, 404, { error: "Not found" });
          }
          res.writeHead(200, { "Content-Type": mimeTypes[".html"] });
          res.end(fallbackContent);
        });
      }

      return sendJson(res, 404, { error: "Not found" });
    }

    const extension = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream"
    });
    res.end(content);
  });
}

function normalizePath(requestPath) {
  const cleaned = requestPath.replace(/^\/+/, "");
  return path.normalize(cleaned);
}

function cleanText(value, maxLength) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanDate(value) {
  const date = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "";
}

function seededNumber(seed, min, max) {
  const hex = crypto.createHash("sha256").update(seed).digest("hex").slice(0, 8);
  const decimal = Number.parseInt(hex, 16);
  const range = max - min + 1;
  return min + (decimal % range);
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
}

function constantTimeMatch(input, expected) {
  const left = Buffer.from(String(input));
  const right = Buffer.from(String(expected));
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

function createSessionToken() {
  return crypto.randomBytes(24).toString("hex");
}

function signToken(token) {
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(token).digest("hex");
  return `${token}.${signature}`;
}

function verifyToken(signedToken) {
  if (!signedToken || !signedToken.includes(".")) {
    return "";
  }

  const [token, signature] = signedToken.split(".");
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(token).digest("hex");
  if (!constantTimeMatch(signature, expected)) {
    return "";
  }

  return token;
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce((acc, part) => {
    const index = part.indexOf("=");
    if (index === -1) {
      return acc;
    }
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function getAuthedToken(req) {
  const cookies = parseCookies(req);
  const signedToken = cookies.admin_session;
  const token = verifyToken(signedToken);
  const expiresAt = sessions.get(token);
  if (!token || !expiresAt || expiresAt < Date.now()) {
    if (token) {
      sessions.delete(token);
    }
    return "";
  }
  return token;
}

function isAuthed(req) {
  return Boolean(getAuthedToken(req));
}

function buildCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }
  return parts.join("; ");
}

function escapeCsv(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function toCsv(rows) {
  const headers = [
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
  ];

  const lines = [headers.map(escapeCsv).join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.id,
        row.yourName,
        row.crushName,
        row.yourBirthDate,
        row.crushBirthDate,
        row.locale,
        row.fakeScore,
        row.fakeSignals?.attraction,
        row.fakeSignals?.future,
        row.fakeSignals?.chaos,
        row.createdAt
      ]
        .map(escapeCsv)
        .join(",")
    );
  }

  return lines.join("\n");
}
