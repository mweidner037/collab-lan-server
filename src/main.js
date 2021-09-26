"use strict";

const Libp2p = require("libp2p");
const TCP = require("libp2p-tcp");
const Mplex = require("libp2p-mplex");
const { NOISE } = require("@chainsafe/libp2p-noise");
const MulticastDNS = require("libp2p-mdns");

const createNode = async () => {
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
};

(async function () {
  const node = await createNode();

  // Run the app in two terminals on the same machine
  // (hopefully same LAN as well, but not tested)
  // and they should print each other's random peerIds.
  node.on("peer:discovery", (peerId) =>
    console.log("Discovered:", peerId.toB58String())
  );

  await node.start();
})();
