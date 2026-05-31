import os from "node:os";

/** Adresses IPv4 non loopback de la machine (réseau local). */
export function listLanAddresses() {
  const addresses = [];

  for (const [name, interfaces] of Object.entries(os.networkInterfaces())) {
    for (const iface of interfaces ?? []) {
      if (iface.family === "IPv4" && !iface.internal) {
        addresses.push({ name, address: iface.address });
      }
    }
  }

  return addresses;
}

export function buildNetworkInfo(port) {
  const addresses = listLanAddresses();
  const primaryAddress = addresses[0]?.address ?? null;
  const localUrl = `http://127.0.0.1:${port}/`;
  const inviteUrl = primaryAddress ? `http://${primaryAddress}:${port}/` : null;

  return {
    hostname: os.hostname(),
    port,
    addresses,
    primaryAddress,
    localUrl,
    inviteUrl,
    mode: "server",
  };
}
