const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dataRoot = process.env.DATA_DIR || process.env.RENDER_DISK_ROOT || __dirname;
const dbPath = path.resolve(dataRoot, "app_data.db");
const db = new sqlite3.Database(dbPath);

function printTable(tableName) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      console.log(`\n${tableName.toUpperCase()}`);
      console.log("-".repeat(tableName.length));
      if (!rows.length) {
        console.log("No records found.");
      } else {
        rows.forEach((row) => console.log(row));
      }
      resolve();
    });
  });
}

async function main() {
  for (const tableName of ["users", "files", "shared_files", "audit_logs"]) {
    await printTable(tableName);
  }
  db.close();
}

main().catch((error) => {
  console.error(error);
  db.close();
  process.exit(1);
});
