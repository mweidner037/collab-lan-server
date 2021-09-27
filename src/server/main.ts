import express from "express";
import { Server } from "http";
import path from "path";
import { WebSocket } from "ws";
import { getP2P } from "./p2p";

(async function () {
  // P2P connection.
  const p2p = await getP2P();

  // Express server.
  const app = express();
  app.use("/", express.static(path.join(__dirname, "../site")));
  const port = process.env.PORT || 3000;
  let server!: Server;
  const expressReady = new Promise<void>((resolve) => {
    server = app.listen(port, resolve);
  });

  // Run a WebSocket server that connects to the P2P network.
  const clients = new Set<WebSocket>();
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    clients.add(ws);

    // Send all known messages to the new connection.
    p2p.history.forEach((message) => {
      ws.send(Buffer.from(message));
    });

    ws.on("message", (message: Uint8Array) => {
      // Send on p2p network.
      p2p.send(message);
      // Echo to other clients.
      const buffer = Buffer.from(message);
      for (const client of clients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(buffer);
        }
      }
    });

    ws.on("close", () => clients.delete(ws));
  });

  p2p.onreceive = (message) => {
    const buffer = Buffer.from(message);
    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(buffer);
      }
    }
  };

  await p2p.start();

  await expressReady;
  console.log(`Listening at http://localhost:${port}/`);
})();
