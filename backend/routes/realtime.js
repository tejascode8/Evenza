const express = require("express");
const router = express.Router();
const { addClient, getClientCount } = require("../utils/realtime");

// SSE streaming endpoint for live updates
router.get("/stream", addClient);

// Realtime health & client statistics
router.get("/status", (req, res) => {
  res.json({
    activeConnections: getClientCount(),
    status: "online",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
