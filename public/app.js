const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const session = require("express-session");
const multer = require("multer");

const { registerUser, loginUser } = require("./auth");
const { createTables, get, all, run } = require("./database");
const { decryptData, encryptData, generateHash, generateKey } = require("./crypto-utils");

const BASE_DIR = path.resolve(__dirname, "..");
const UPLOAD_FOLDER = path.join(BASE_DIR, "uploads");
const CLIENT_DIST_DIR = path.join(BASE_DIR, "frontend", "dist");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: crypto.randomBytes(16).toString("hex"),
    resave: false,
    saveUninitialized: false
  })
);

function requireLogin(req, res, next) {
  if (!req.session.username) {
    res.status(401).json({ error: "Please log in to continue." });
    return;
  }
  next();
}

function buildStoragePath(fileId, originalFilename) {
  const safeName = originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_") || `file_${fileId}`;
  return path.join(UPLOAD_FOLDER, `${fileId}_${safeName}.enc`);
}

async function logActivity(username, action, targetType, targetId = null, details = null) {
  await run(
    `INSERT INTO audit_logs (username, action, target_type, target_id, details)
     VALUES (?, ?, ?, ?, ?)`,
    [username, action, targetType, targetId, details]
  );
}

async function fetchDashboardData(username) {
  const userFiles = await all(
    `SELECT id, filename, uploaded_at, file_size
     FROM files
     WHERE owner = ?
     ORDER BY id DESC`,
    [username]
  );

  const sharedFiles = await all(
    `SELECT files.id, files.filename, files.owner, files.uploaded_at, files.file_size,
            shared_files.created_at AS shared_at
     FROM shared_files
     JOIN files ON files.id = shared_files.file_id
     WHERE shared_files.shared_with = ?
     ORDER BY shared_files.id DESC`,
    [username]
  );

  const recentActivity = await all(
    `SELECT username, action, target_type, target_id, details, created_at
     FROM audit_logs
     WHERE username = ?
     ORDER BY id DESC
     LIMIT 8`,
    [username]
  );

  return { userFiles, sharedFiles, recentActivity };
}

async function fetchAuditLogs(username) {
  return all(
    `SELECT username, action, target_type, target_id, details, created_at
     FROM audit_logs
     WHERE username = ?
     ORDER BY id DESC`,
    [username]
  );
}

function sendAuth(res, username = null) {
  res.json({
    authenticated: Boolean(username),
    username
  });
}

app.get("/api/auth/session", (req, res) => {
  sendAuth(res, req.session.username || null);
});

app.post("/api/auth/login", async (req, res) => {
  const username = (req.body.username || "").trim();
  const password = req.body.password || "";

  if (!username || !password) {
    res.status(400).json({ error: "Please enter both username and password." });
    return;
  }

  const valid = await loginUser(username, password);
  if (!valid) {
    res.status(401).json({ error: "Login failed. Check your username and password." });
    return;
  }

  req.session.username = username;
  await logActivity(username, "login", "session", null, "User logged in successfully.");
  sendAuth(res, username);
});

app.post("/api/auth/register", async (req, res) => {
  const username = (req.body.username || "").trim();
  const password = req.body.password || "";

  try {
    await registerUser(username, password);
    await logActivity(username, "register", "user", null, "New account created.");
    res.status(201).json({ message: "Registration successful. Please log in." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  if (req.session.username) {
    await logActivity(req.session.username, "logout", "session", null, "User logged out.");
  }

  req.session.destroy(() => {
    res.json({ success: true });
  });
});

app.get("/api/dashboard", requireLogin, async (req, res) => {
  const { userFiles, sharedFiles, recentActivity } = await fetchDashboardData(req.session.username);
  res.json({
    username: req.session.username,
    userFiles,
    sharedFiles,
    recentActivity,
    totalUploads: userFiles.length,
    totalShared: sharedFiles.length,
    activityCount: recentActivity.length
  });
});

app.get("/api/vault", requireLogin, async (req, res) => {
  const { userFiles } = await fetchDashboardData(req.session.username);
  res.json({
    username: req.session.username,
    userFiles,
    totalUploads: userFiles.length
  });
});

app.get("/api/downloads", requireLogin, async (req, res) => {
  const { userFiles, sharedFiles } = await fetchDashboardData(req.session.username);
  res.json({
    username: req.session.username,
    userFiles,
    sharedFiles,
    totalDownloads: userFiles.length + sharedFiles.length
  });
});

app.get("/api/logs", requireLogin, async (req, res) => {
  const auditLogs = await fetchAuditLogs(req.session.username);
  res.json({
    username: req.session.username,
    auditLogs,
    activityCount: auditLogs.length
  });
});

app.post("/api/uploads", requireLogin, upload.single("file"), async (req, res) => {
  if (!req.file || !req.file.originalname) {
    res.status(400).json({ error: "Please choose a file to upload." });
    return;
  }

  const originalFilename = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const data = req.file.buffer;

  if (!originalFilename) {
    res.status(400).json({ error: "That filename is not valid." });
    return;
  }

  if (!data || !data.length) {
    res.status(400).json({ error: "The selected file is empty." });
    return;
  }

  const key = generateKey();
  const encrypted = encryptData(data, key);
  const fileHash = generateHash(data);
  const fileSize = data.length;

  const result = await run(
    `INSERT INTO files (filename, owner, encrypted_key, file_hash, file_size, uploaded_at)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [originalFilename, req.session.username, key, fileHash, fileSize]
  );

  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
  fs.writeFileSync(buildStoragePath(result.lastID, originalFilename), encrypted);

  await logActivity(
    req.session.username,
    "upload",
    "file",
    result.lastID,
    `Uploaded ${originalFilename} (${fileSize} bytes).`
  );

  res.status(201).json({
    message: "File uploaded and encrypted successfully.",
    fileId: result.lastID
  });
});

app.post("/api/share/:fileId", requireLogin, async (req, res) => {
  const fileId = Number(req.params.fileId);
  const targetUser = (req.body.sharedWith || "").trim();

  if (!targetUser) {
    res.status(400).json({ error: "Enter a username to share the file with." });
    return;
  }

  if (targetUser === req.session.username) {
    res.status(400).json({ error: "You already own this file, so sharing it with yourself is not needed." });
    return;
  }

  const fileRow = await get("SELECT id, filename FROM files WHERE id = ? AND owner = ?", [fileId, req.session.username]);
  if (!fileRow) {
    res.status(404).json({ error: "That file was not found or does not belong to you." });
    return;
  }

  const userRow = await get("SELECT id FROM users WHERE username = ?", [targetUser]);
  if (!userRow) {
    res.status(404).json({ error: "That user does not exist." });
    return;
  }

  try {
    await run("INSERT INTO shared_files (file_id, owner, shared_with) VALUES (?, ?, ?)", [
      fileId,
      req.session.username,
      targetUser
    ]);
  } catch (error) {
    res.status(400).json({ error: "That file is already shared with this user." });
    return;
  }

  await logActivity(req.session.username, "share", "file", fileId, `Shared ${fileRow.filename} with ${targetUser}.`);
  await logActivity(targetUser, "received_share", "file", fileId, `Received shared access to ${fileRow.filename} from ${req.session.username}.`);
  res.json({ message: `Shared ${fileRow.filename} with ${targetUser}.` });
});

async function sendValidatedFile(res, fileId, filename, encryptedKey, fileHash) {
  const filepath = buildStoragePath(fileId, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error("Encrypted file is missing from storage.");
  }

  const encryptedData = fs.readFileSync(filepath);
  const decryptedData = decryptData(encryptedData, encryptedKey);
  const newHash = generateHash(decryptedData);
  if (newHash !== fileHash) {
    throw new Error("File integrity check failed.");
  }

  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(decryptedData);
}

function sendEncryptedFile(res, fileId, filename) {
  const filepath = buildStoragePath(fileId, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error("Encrypted file is missing from storage.");
  }

  const encryptedFilename = `${filename}.enc`;
  res.download(filepath, encryptedFilename);
}

app.get("/api/download/:fileId", requireLogin, async (req, res) => {
  const fileId = Number(req.params.fileId);
  const row = await get(
    "SELECT filename, encrypted_key, file_hash FROM files WHERE id = ? AND owner = ?",
    [fileId, req.session.username]
  );

  if (!row) {
    res.status(404).json({ error: "File not found." });
    return;
  }

  await logActivity(
    req.session.username,
    "download",
    "file",
    fileId,
    `Downloaded owned file: ${row.filename}.`
  );

  try {
    await sendValidatedFile(res, fileId, row.filename, row.encrypted_key, row.file_hash);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/download-encrypted/:fileId", requireLogin, async (req, res) => {
  const fileId = Number(req.params.fileId);
  const row = await get("SELECT filename FROM files WHERE id = ? AND owner = ?", [fileId, req.session.username]);

  if (!row) {
    res.status(404).json({ error: "File not found." });
    return;
  }

  await logActivity(
    req.session.username,
    "download_encrypted",
    "file",
    fileId,
    `Downloaded encrypted owned file: ${row.filename}.`
  );

  try {
    sendEncryptedFile(res, fileId, row.filename);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/shared-download/:fileId", requireLogin, async (req, res) => {
  const fileId = Number(req.params.fileId);
  const row = await get(
    `SELECT files.filename, files.encrypted_key, files.file_hash, files.owner
     FROM shared_files
     JOIN files ON files.id = shared_files.file_id
     WHERE shared_files.file_id = ? AND shared_files.shared_with = ?`,
    [fileId, req.session.username]
  );

  if (!row) {
    res.status(404).json({ error: "You do not have access to this shared file." });
    return;
  }

  await logActivity(
    req.session.username,
    "shared_download",
    "file",
    fileId,
    `Downloaded shared file from ${row.owner}: ${row.filename}.`
  );

  try {
    await sendValidatedFile(res, fileId, row.filename, row.encrypted_key, row.file_hash);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/api/shared-download-encrypted/:fileId", requireLogin, async (req, res) => {
  const fileId = Number(req.params.fileId);
  const row = await get(
    `SELECT files.filename, files.owner
     FROM shared_files
     JOIN files ON files.id = shared_files.file_id
     WHERE shared_files.file_id = ? AND shared_files.shared_with = ?`,
    [fileId, req.session.username]
  );

  if (!row) {
    res.status(404).json({ error: "You do not have access to this shared file." });
    return;
  }

  await logActivity(
    req.session.username,
    "shared_download_encrypted",
    "file",
    fileId,
    `Downloaded encrypted shared file from ${row.owner}: ${row.filename}.`
  );

  try {
    sendEncryptedFile(res, fileId, row.filename);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

if (fs.existsSync(CLIENT_DIST_DIR)) {
  app.use(express.static(CLIENT_DIST_DIR));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/")) {
      res.status(404).json({ error: "API route not found." });
      return;
    }
    res.sendFile(path.join(CLIENT_DIST_DIR, "index.html"));
  });
}

async function start() {
  fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
  await createTables();
  const port = 5000;
  app.listen(port, () => {
    console.log(`Node app running at http://127.0.0.1:${port}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
