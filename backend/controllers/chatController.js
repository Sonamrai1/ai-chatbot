import fetch from "node-fetch";
import db from "../db.js";

// ✅ Create a new chat session
export async function newSessionHandler(req, res) {
  try {
    const [result] = await db.query(
"INSERT INTO ChatSessions () VALUES ()"    );
    res.json({ sessionId: result.insertId });
  } catch (err) {
    console.error("❌ Session error:", err);
    res.status(500).json({ error: "Could not create session" });
  }
}

// ✅ Get all sessions (for sidebar)
export async function sessionsHandler(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT s.sessionID, 
              MIN(m.content) AS firstMessage,
              MAX(m.timestamp) AS lastActivity
       FROM ChatSessions s
       LEFT JOIN Messages m ON s.sessionID = m.sessionID AND m.sender = 'User'
       GROUP BY s.sessionID
       ORDER BY lastActivity DESC
       LIMIT 20`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json([]);
  }
}

// ✅ Handle chat message (with full conversation history for context)
export async function chatHandler(req, res) {
  const { message, sessionId } = req.body;

  if (!message || !sessionId) {
    return res.status(400).json({ error: "Message and sessionId are required" });
  }

  try {
    // 1) Get previous messages for context
    const [history] = await db.query(
      "SELECT sender, content FROM Messages WHERE sessionID = ? ORDER BY messageID",
      [sessionId]
    );

    // 2) Save user message to DB
    await db.query(
      "INSERT INTO Messages (sessionID, sender, content) VALUES (?, ?, ?)",
      [sessionId, "User", message]
    );

    // 3) Build Gemini conversation format
    const contents = history.map((row) => ({
      role: row.sender === "User" ? "user" : "model",
      parts: [{ text: row.content }],
    }));
    // Add current message
    contents.push({ role: "user", parts: [{ text: message }] });

    // 4) Call Gemini API
    const apiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    const data = await apiRes.json();

    if (data.error) {
      console.error("❌ Gemini API error:", data.error);
      return res.status(500).json({ error: data.error.message });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Sorry, I could not generate a response. Please try again.";

    // 5) Save bot reply to DB
    await db.query(
      "INSERT INTO Messages (sessionID, sender, content) VALUES (?, ?, ?)",
      [sessionId, "Bot", reply]
    );

    res.json({ reply });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// ✅ Get message history for a session
export async function historyHandler(req, res) {
  const { sessionId } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT sender, content FROM Messages WHERE sessionID = ? ORDER BY messageID",
      [sessionId]
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ History error:", err);
    res.status(500).json([]);
  }
}
