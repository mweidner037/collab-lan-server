import { app, BrowserWindow, MessageChannelMain } from "electron";
import * as path from "path";
import { getP2P } from "./p2p";

let mainWindow!: BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../site/index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  // Establish a MessageChannel with the window.
  const { port1, port2 } = new MessageChannelMain();
  mainWindow.webContents.postMessage("port", null, [port1]);

  // Connect the MessageChannel's "data" messages to the P2P network.
  const bcast = await getP2P();
  bcast.onreceive = (message) => {
    port2.postMessage({ type: "message", message });
  };
  port2.on("message", (e) => {
    switch (e.data.type) {
      case "message":
        bcast.send(e.data.message);
        break;
    }
  });
  await bcast.start();
  port2.start();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
