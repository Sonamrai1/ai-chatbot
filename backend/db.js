import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const db = await mysql.createConnection({
  host:               process.env.DB_HOST     || "localhost",
  user:               process.env.DB_USER     || "root",
  password:           process.env.DB_PASSWORD || "",
  database:           process.env.DB_NAME     || "chatbot_db",
  multipleStatements: true,
});

// ✅ Auto-create tables if they don't exist
await db.query(`
  CREATE TABLE IF NOT EXISTS ChatSessions (
    sessionID  INT AUTO_INCREMENT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS Messages (
    messageID  INT AUTO_INCREMENT PRIMARY KEY,
    sessionID  INT NOT NULL,
    sender     ENUM('User','Bot') NOT NULL,
    content    TEXT NOT NULL,
    timestamp  DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionID) REFERENCES ChatSessions(sessionID) ON DELETE CASCADE
  );
`);

console.log("✅ MySQL Connected & Tables Ready");

export default db;