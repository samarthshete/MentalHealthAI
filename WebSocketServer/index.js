const WebSocket = require("ws");
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.SOCKET_PORT || 8802;
const wss = new WebSocket.Server({ port: port }, () => {
  console.log(`✅ WebSocket Server running on port ${port}`);
});

const map = new Map();
let counter = 0;

wss.on("connection", (ws, req) => {
  console.log("🔗 New WebSocket connection attempt...");

  try {
    const params = new URLSearchParams(req.url?.split("?")[1] || "");
    const id = params.get("id");
    const isServer = params.get("isServer") === "true";

    if (!id) {
      console.log("❌ Invalid Connection: No ID provided. Closing socket.");
      ws.terminate();
      return;
    }

    if (!isServer && (!map.has(id) || !map.get(id).server)) {
      console.log("❌ No Server Found for ID. Closing socket.");
      ws.terminate();
      return;
    }

    if (!map.has(id)) {
      map.set(id, {});
    }

    if (isServer) {
      map.get(id).server = ws;
      console.log(`✅ Server Connected with ID: ${id}`);
    } else {
      map.get(id).client = ws;
      console.log(`✅ Client Connected with ID: ${id}`);
    }

    ws.on("message", (data, isBinary) => {
      console.log(`📩 Message received from ID: ${id}`);
      if (isServer) {
        map.get(id)?.client?.send(data, { binary: isBinary });
      } else {
        map.get(id)?.server?.send(data, { binary: isBinary });
      }
    });

    ws.on("close", () => {
      console.log(`❌ Connection Closed for ID: ${id}`);
      if (isServer) {
        map.get(id)?.client?.terminate();
      } else {
        map.get(id)?.server?.terminate();
      }
      map.delete(id);
    });
  } catch (error) {
    console.error("❌ Error handling WebSocket connection:", error.message);
  }
});
