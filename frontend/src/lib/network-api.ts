import type { NetworkInfo } from "../types/network";

function browserFallback(): NetworkInfo {
  const port = window.location.port ? Number(window.location.port) : 80;
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const localUrl = `${protocol}//${window.location.host}/`;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  const primaryAddress = isLocalHost ? null : hostname;
  const inviteUrl = primaryAddress ? `${protocol}//${primaryAddress}:${port}/` : null;

  return {
    hostname,
    port,
    addresses: primaryAddress ? [{ name: "navigateur", address: primaryAddress }] : [],
    primaryAddress,
    localUrl,
    inviteUrl,
    mode: "browser",
  };
}

export async function fetchNetworkInfo(): Promise<NetworkInfo> {
  try {
    const response = await fetch("/api/network", { cache: "no-store" });
    if (!response.ok) throw new Error("network-info-unavailable");
    return (await response.json()) as NetworkInfo;
  } catch {
    return browserFallback();
  }
}
