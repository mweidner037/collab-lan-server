import Libp2p from "libp2p";
import TCP from "libp2p-tcp";
// @ts-ignore no types
import Mplex from "libp2p-mplex";
import { NOISE } from "@chainsafe/libp2p-noise";
// @ts-ignore no types
import MulticastDNS from "libp2p-mdns";
import Gossipsub from "libp2p-gossipsub";
import PeerId from "peer-id";
import BufferList from "bl/BufferList";

async function createNode() {
  const node = await Libp2p.create({
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0"],
    },
    modules: {
      transport: [TCP],
      streamMuxer: [Mplex],
      connEncryption: [NOISE],
      peerDiscovery: [MulticastDNS],
      pubsub: Gossipsub,
    },
    config: {
      peerDiscovery: {
        [MulticastDNS.tag]: {
          interval: 1000,
          enabled: true,
        },
      },
    },
  });

  return node;
}

// TODO: msgIdFn (see https://github.com/ChainSafe/js-libp2p-gossipsub)
// - get from Compoventuals (sender + uniqueNumber).

const TOPIC = "test";
const HISTORY_PROTOCOL = "compoventuals/history/0.1.0";

class Broadcaster {
  onreceive!: (message: Uint8Array) => void;

  readonly history: Uint8Array[] = [];

  constructor(readonly node: Libp2p) {}

  async start() {
    // History send.
    this.node.handle(HISTORY_PROTOCOL, async ({ stream }) => {
      // Send the full history to the stream.
      // @ts-ignore wrong type for sink
      await stream.sink(this.history.values());
    });

    // History receive.
    let first = true;
    this.node.on("peer:discovery", (peerId: PeerId) => {
      console.log("Discovered:", peerId.toB58String());
      if (first) {
        first = false;
        // TODO: more tries if they don't respond quickly.
        this.requestHistory(peerId);
      }
    });

    await this.node.start();

    // Pubsub receive.
    this.node.pubsub.on(TOPIC, (msg) => this.receiveInternal(msg.data));
    this.node.pubsub.subscribe(TOPIC);
  }

  async stop() {
    await this.node.stop();
  }

  send(message: Uint8Array) {
    this.history.push(message);
    this.node.pubsub.publish(TOPIC, message);
  }

  private receiveInternal(message: Uint8Array) {
    this.history.push(message);
    this.onreceive(message);
  }

  /**
   * Request old messages from other peers, which pubsub won't
   * give us.
   *
   * TODO: also request missing messages later?
   */
  private async requestHistory(peerId: PeerId) {
    const { stream } = await this.node.dialProtocol(peerId, HISTORY_PROTOCOL);
    for await (const chunk of stream.source) {
      this.receiveInternal((chunk as BufferList).slice());
    }
  }
}

export async function getP2P(): Promise<Broadcaster> {
  const node = await createNode();

  const bcast = new Broadcaster(node);

  return bcast;
}
