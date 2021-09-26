import Libp2p from "libp2p";
import TCP from "libp2p-tcp";
// @ts-ignore no types
import Mplex from "libp2p-mplex";
import { NOISE } from "@chainsafe/libp2p-noise";
// @ts-ignore no types
import MulticastDNS from "libp2p-mdns";

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

// class Broadcaster {
//
// }

function runApp() {
  console.log("Ready.");

  const messages = [];
}

(async function () {
  const node = await createNode();

  // Run the app in two terminals on the same machine
  // (hopefully same LAN as well, but not tested)
  // and they should print each other's random peerIds.
  node.on("peer:discovery", (peerId) =>
    console.log("Discovered:", peerId.toB58String())
  );

  await node.start();

  runApp();
})();
