const crypto = require("crypto");

function generateKey() {
  return crypto.randomBytes(32);
}

function encryptData(data, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]);
}

function decryptData(data, key) {
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

function generateHash(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

module.exports = {
  generateKey,
  encryptData,
  decryptData,
  generateHash
};
