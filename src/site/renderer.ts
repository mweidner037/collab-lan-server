import { ipcRenderer } from "electron";

(async function () {
  const portPromise = new Promise<MessagePort>((resolve) => {
    ipcRenderer.on("port", (e) => {
      resolve(e.ports[0]);
    });
  });
  const port = await portPromise;

  port.postMessage({ type: "test" });
  port.onmessage = (e) => {
    switch (e.data.type) {
      case "test":
        console.log("got test");
        break;
    }
  };
})();
