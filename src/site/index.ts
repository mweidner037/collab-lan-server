import { ContainerHost } from "@collabs/container";
import { CRDTApp, Pre } from "@collabs/collabs";
import { LocalWebSocketNetwork } from "./network";

const CONTAINER_URL = "./container/container.html";

(async function () {
  const wsAddr = location.origin.replace(/^http/, "ws");
  const network = new LocalWebSocketNetwork(wsAddr);
  const app = new CRDTApp(network);

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
  const host = app.registerCollab("host", Pre(ContainerHost)(iframe));

  // TODO: loading.  Make sure to block GUI until host says it's complete.
})();
