-- ✅ Create database
CREATE DATABASE IF NOT EXISTS chatbot_db;
USE chatbot_db;

-- ✅ Chat Sessions table (simple — no user auth needed)
CREATE TABLE IF NOT EXISTS ChatSessions (
    sessionID   INT AUTO_INCREMENT PRIMARY KEY,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ✅ Messages table
CREATE TABLE IF NOT EXISTS Messages (
    messageID   INT AUTO_INCREMENT PRIMARY KEY,
    sessionID   INT NOT NULL,
    sender      ENUM('User', 'Bot') NOT NULL,
    content     TEXT NOT NULL,
    timestamp   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionID) REFERENCES ChatSessions(sessionID) ON DELETE CASCADE
);

-- ✅ Insert a default session so sessionID=1 always exists
INSERT INTO ChatSessions (created_at) VALUES (NOW());
