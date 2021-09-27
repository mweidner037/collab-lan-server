import express from "express";
import path from "path";

const app = express();
app.use("/", express.static(path.join(__dirname, "../site")));

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`Listening at http://localhost:${port}/`)
);

// Run a WebSocket server that connects to the P2P network.
