import { ContainerHost } from "compoventuals-container";
import { Pre, Runtime } from "compoventuals";
import { LocalWebSocketNetwork } from "./network";

const CONTAINER_URL = "./container/plaintext.html";

(async function () {
  const wsAddr = location.origin.replace(/^http/, "ws");
  const network = new LocalWebSocketNetwork(wsAddr);
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

  // TODO: loading.  Make sure to block GUI until host says it's complete.
})();
