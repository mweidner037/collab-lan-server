import { BroadcastNetwork } from "@collabs/collabs";

/**
 * Unlike ws-client, has no "groups", and assumes the server
 * is reliable because it is local.
 */
export class LocalWebSocketNetwork implements BroadcastNetwork {
  onreceive!: (message: Uint8Array) => void;
  private readonly ws: WebSocket;

  constructor(webSocketArgs: string) {
    this.ws = new WebSocket(webSocketArgs);
    this.ws.binaryType = "arraybuffer";
    this.ws.addEventListener("message", this.receiveInternal.bind(this));
  }

  private receiveInternal(e: MessageEvent) {
    this.onreceive(new Uint8Array(e.data));
  }

  send(message: Uint8Array): void {
    this.ws.send(message);
  }

  save(): Uint8Array {
    throw new Error("Method not implemented.");
  }

  load(saveData: Uint8Array | null): void {
    throw new Error("Method not implemented.");
  }
}
