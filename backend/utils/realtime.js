// Server-Sent Events (SSE) Real-Time Hub for Evenza
// Provides zero-latency bi-directional synchronization across Admin & Attendee clients

let clients = [];

/**
 * Handle new SSE client connection
 */
const addClient = (req, res) => {
  // Set SSE streaming headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
    "Access-Control-Allow-Origin": "*",
  });

  const clientId = Date.now() + "-" + Math.random().toString(36).substring(2, 9);
  const newClient = {
    id: clientId,
    res,
    userId: req.query.userId || null,
    role: req.query.role || null,
  };

  clients.push(newClient);

  // Send initial connection handshake
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", clientId, timestamp: Date.now() })}\n\n`);

  // Handle client disconnection
  req.on("close", () => {
    clients = clients.filter((c) => c.id !== clientId);
  });
};

/**
 * Broadcast event to all connected clients (or filter by criteria)
 * @param {string} type - Event action type (e.g. 'BOOKING_CREATED', 'BOOKING_CONFIRMED', 'SEATS_UPDATED')
 * @param {object} data - Payload data
 */
const broadcast = (type, data = {}) => {
  const message = `data: ${JSON.stringify({ type, data, timestamp: Date.now() })}\n\n`;
  
  clients.forEach((client) => {
    try {
      client.res.write(message);
    } catch (err) {
      console.error(`Failed to send real-time event to client ${client.id}:`, err.message);
    }
  });
};

/**
 * Send event to a specific user (by userId)
 */
const sendToUser = (userId, type, data = {}) => {
  if (!userId) return;
  const targetId = userId.toString();
  const message = `data: ${JSON.stringify({ type, data, timestamp: Date.now() })}\n\n`;

  clients
    .filter((client) => client.userId && client.userId.toString() === targetId)
    .forEach((client) => {
      try {
        client.res.write(message);
      } catch (err) {
        console.error(`Failed to send real-time event to user ${userId}:`, err.message);
      }
    });
};

// Periodic heartbeat ping to keep connection alive across reverse proxies & firewalls
setInterval(() => {
  clients.forEach((client) => {
    try {
      client.res.write(": ping\n\n");
    } catch (err) {
      // Ignore dead clients; cleanup handled by req.on('close')
    }
  });
}, 25000);

module.exports = {
  addClient,
  broadcast,
  sendToUser,
  getClientCount: () => clients.length,
};
