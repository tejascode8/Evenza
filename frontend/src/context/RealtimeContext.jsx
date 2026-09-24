import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { AuthContext } from "./AuthContext";

export const RealtimeContext = createContext(null);

export const RealtimeProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const listenersRef = useRef(new Map());
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Subscribe to specific event types
  const subscribe = useCallback((eventType, callback) => {
    if (!listenersRef.current.has(eventType)) {
      listenersRef.current.set(eventType, new Set());
    }
    listenersRef.current.get(eventType).add(callback);

    // Return un-subscribe function
    return () => {
      const callbacks = listenersRef.current.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          listenersRef.current.delete(eventType);
        }
      }
    };
  }, []);

  // Connect to SSE stream
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api");
    const queryParams = new URLSearchParams();
    if (user?._id || user?.id) queryParams.set("userId", user._id || user.id);
    if (user?.role) queryParams.set("role", user.role);

    const streamUrl = `${apiBase}/realtime/stream?${queryParams.toString()}`;

    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      try {
        const es = new EventSource(streamUrl);
        eventSourceRef.current = es;

        es.onopen = () => {
          setIsConnected(true);
        };

        es.onmessage = (e) => {
          try {
            const parsed = JSON.parse(e.data);
            setLastEvent(parsed);

            // Dispatch to registered listeners
            if (parsed?.type && listenersRef.current.has(parsed.type)) {
              listenersRef.current.get(parsed.type).forEach((cb) => {
                try {
                  cb(parsed.data, parsed);
                } catch (err) {
                  // Silently handled
                }
              });
            }

            // Also dispatch to catch-all '*' listeners
            if (listenersRef.current.has("*")) {
              listenersRef.current.get("*").forEach((cb) => {
                try {
                  cb(parsed);
                } catch (err) {
                  // Silently handled
                }
              });
            }
          } catch (parseErr) {
            // Ignore non-JSON heartbeat pings
          }
        };

        es.onerror = () => {
          setIsConnected(false);
          es.close();
          // Schedule reconnect attempt in 3 seconds
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(connect, 3000);
        };
      } catch (err) {
        setIsConnected(false);
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user?._id, user?.id, user?.role]);

  return (
    <RealtimeContext.Provider value={{ isConnected, lastEvent, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  );
};

/**
 * Custom React hook to listen to real-time events
 * @param {string} eventType - The event type to listen to (e.g. 'BOOKING_CREATED', 'BOOKING_CONFIRMED', etc.)
 * @param {function} callback - Callback to invoke on event
 */
export const useRealtime = (eventType, callback) => {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error("useRealtime must be used within a RealtimeProvider");
  }

  const { subscribe, isConnected } = context;

  useEffect(() => {
    if (!eventType || !callback) return;
    const unsubscribe = subscribe(eventType, callback);
    return unsubscribe;
  }, [eventType, callback, subscribe]);

  return { isConnected };
};
