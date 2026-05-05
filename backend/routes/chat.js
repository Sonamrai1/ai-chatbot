import express from "express";
import {
  chatHandler,
  historyHandler,
  newSessionHandler,
  sessionsHandler,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/session", newSessionHandler);       // Create new chat session
router.get("/sessions", sessionsHandler);          // Get all sessions (sidebar)
router.post("/message", chatHandler);              // Send message
router.get("/history/:sessionId", historyHandler); // Get history for a session

export default router;
