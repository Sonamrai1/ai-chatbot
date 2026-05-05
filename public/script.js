// ── Config ──
// Auto-detect: same origin in production, localhost in dev
const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5000/api/chat"
  : "/api/chat";

// ── State ──
let currentSessionId = null;
let isLoading = false;

// ── DOM refs ──
const messagesEl   = document.getElementById("messages");
const userInputEl  = document.getElementById("userInput");
const sendBtn      = document.getElementById("sendBtn");
const sessionList  = document.getElementById("sessionList");
const newChatBtn   = document.getElementById("newChatBtn");
const chatTitle    = document.getElementById("chatTitle");
const sidebarEl    = document.getElementById("sidebar");
const sidebarTogle = document.getElementById("sidebarToggle");
const welcomeEl    = document.getElementById("welcomeScreen");

// ── Init ──
document.addEventListener("DOMContentLoaded", async () => {
  await loadSessions();
  setupEventListeners();
});

function setupEventListeners() {
  sendBtn.addEventListener("click", sendMessage);
  newChatBtn.addEventListener("click", createNewSession);
  sidebarTogle.addEventListener("click", () => sidebarEl.classList.toggle("hidden"));

  userInputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  userInputEl.addEventListener("input", () => {
    userInputEl.style.height = "auto";
    userInputEl.style.height = Math.min(userInputEl.scrollHeight, 160) + "px";
  });
}

// ── Sessions ──
async function loadSessions() {
  try {
    const res = await fetch(`${API_BASE}/sessions`);
    const sessions = await res.json();

    sessionList.innerHTML = "";

    if (!sessions.length) {
      sessionList.innerHTML = '<li class="session-empty">No chats yet</li>';
      return;
    }

    sessions.forEach(session => {
      const li = document.createElement("li");
      li.className = "session-item" + (session.sessionID === currentSessionId ? " active" : "");
      li.textContent = session.firstMessage
        ? truncate(session.firstMessage, 28)
        : "New Chat";
      li.dataset.id = session.sessionID;
      li.addEventListener("click", () => loadSession(session.sessionID));
      sessionList.appendChild(li);
    });
  } catch (err) {
    console.error("Could not load sessions:", err);
  }
}

async function createNewSession() {
  try {
    const res = await fetch(`${API_BASE}/session`, { method: "POST" });
    const data = await res.json();
    currentSessionId = data.sessionId;

    // Clear messages, show welcome
    messagesEl.innerHTML = "";
    if (welcomeEl) messagesEl.appendChild(welcomeEl);
    welcomeEl.style.display = "flex";

    chatTitle.textContent = "New Chat";
    userInputEl.focus();
    await loadSessions();
    highlightSession(currentSessionId);
  } catch (err) {
    console.error("Could not create session:", err);
  }
}

async function loadSession(sessionId) {
  currentSessionId = sessionId;
  messagesEl.innerHTML = "";

  highlightSession(sessionId);

  try {
    const res = await fetch(`${API_BASE}/history/${sessionId}`);
    const history = await res.json();

    if (!history.length) {
      if (welcomeEl) messagesEl.appendChild(welcomeEl);
      welcomeEl.style.display = "flex";
      chatTitle.textContent = "New Chat";
      return;
    }

    history.forEach(({ sender, content }) => {
      appendMessage(sender === "User" ? "user" : "bot", content, false);
    });

    // Set title from first user message
    const first = history.find(r => r.sender === "User");
    if (first) chatTitle.textContent = truncate(first.content, 40);

    scrollToBottom();
  } catch (err) {
    console.error("Could not load history:", err);
  }
}

function highlightSession(id) {
  document.querySelectorAll(".session-item").forEach(li => {
    li.classList.toggle("active", parseInt(li.dataset.id) === id);
  });
}

// ── Send Message ──
async function sendMessage() {
  const msg = userInputEl.value.trim();
  if (!msg || isLoading) return;

  // Create session on first message if none exists
  if (!currentSessionId) {
    await createNewSession();
  }

  // Hide welcome screen
  if (welcomeEl) welcomeEl.style.display = "none";

  // Append user message
  appendMessage("user", msg);
  userInputEl.value = "";
  userInputEl.style.height = "auto";

  // Update title
  if (chatTitle.textContent === "New Chat") {
    chatTitle.textContent = truncate(msg, 40);
  }

  // Show typing indicator
  const typingEl = showTyping();
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg, sessionId: currentSessionId }),
    });

    const data = await res.json();
    removeTyping(typingEl);

    if (data.error) {
      appendMessage("bot", `⚠️ Error: ${data.error}`);
    } else {
      appendMessage("bot", data.reply);
    }

    await loadSessions(); // Refresh sidebar
  } catch (err) {
    removeTyping(typingEl);
    appendMessage("bot", "❌ Could not reach the server. Please check your connection.");
    console.error(err);
  } finally {
    setLoading(false);
  }
}

// ── UI Helpers ──
function appendMessage(sender, text, shouldScroll = true) {
  const row = document.createElement("div");
  row.className = `message-row ${sender}`;

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = sender === "user" ? "You" : "AI";

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";

  if (sender === "bot") {
    // Render markdown for bot messages
    bubble.innerHTML = marked.parse(text);
    // Open links in new tab
    bubble.querySelectorAll("a").forEach(a => a.setAttribute("target", "_blank"));
  } else {
    bubble.textContent = text;
  }

  row.appendChild(label);
  row.appendChild(bubble);
  messagesEl.appendChild(row);

  if (shouldScroll) scrollToBottom();
  return row;
}

function showTyping() {
  const row = document.createElement("div");
  row.className = "message-row bot";

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = "AI";

  const indicator = document.createElement("div");
  indicator.className = "typing-indicator";
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement("div");
    dot.className = "typing-dot";
    indicator.appendChild(dot);
  }

  row.appendChild(label);
  row.appendChild(indicator);
  messagesEl.appendChild(row);
  scrollToBottom();
  return row;
}

function removeTyping(el) {
  if (el && el.parentNode) el.remove();
}

function setLoading(val) {
  isLoading = val;
  sendBtn.disabled = val;
  userInputEl.disabled = val;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n) + "…" : str;
}

// ── Suggestion chips ──
function useSuggestion(btn) {
  userInputEl.value = btn.textContent;
  userInputEl.focus();
  sendMessage();
}
