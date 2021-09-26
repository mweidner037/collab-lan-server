import Libp2p from "libp2p";
import TCP from "libp2p-tcp";
// @ts-ignore no types
import Mplex from "libp2p-mplex";
import { NOISE } from "@chainsafe/libp2p-noise";
// @ts-ignore no types
import MulticastDNS from "libp2p-mdns";
import Gossipsub from "libp2p-gossipsub";

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

(async function () {
  const node = await createNode();

  node.on("peer:discovery", (peerId) => {
    console.log("Discovered:", peerId.toB58String());
  });

  await node.start();

  node.pubsub.on(TOPIC, (msg) => {
    console.log("received: " + Buffer.from(msg.data).toString());
  });
  node.pubsub.subscribe(TOPIC);

  console.log("Ready.");

  let i = 0;
  setInterval(() => {
    node.pubsub.publish(TOPIC, new Uint8Array(Buffer.from("Message" + i)));
    console.log("Sent: Message" + i);
    i++;
  }, 1000);
})();
