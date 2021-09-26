import { ipcRenderer } from "electron";
import { ContainerHost } from "compoventuals-container";
import { Pre, Runtime } from "compoventuals";
import { MessagePortNetwork } from "./message_port_network";

const CONTAINER_URL = "./container/plaintext.html";

(async function () {
  const portPromise = new Promise<MessagePort>((resolve) => {
    ipcRenderer.on("port", (e) => {
      resolve(e.ports[0]);
    });
  });
  const port = await portPromise;

  const network = new MessagePortNetwork(port);
  const runtime = new Runtime(network);

  // Add the container in an IFrame.
  const iframe = document.createElement("iframe");
  iframe.src = CONTAINER_URL;
  document.body.appendChild(iframe);
  // Set title to that of the container.
  iframe.addEventListener("load", () => {
    // contentDocument is only non-null if IFrame is from the
    // same origin.
    if (iframe.contentDocument !== null) {
      document.title = iframe.contentDocument.title;
    } else {
      // TODO: use metadata from the container
      document.title = "Container";
    }
  });

  // Attach the container.
  const host = runtime.registerCrdt("host", Pre(ContainerHost)(iframe));

  port.start();

  // TODO: loading.  Make sure to block GUI until host says it's complete.
})();
