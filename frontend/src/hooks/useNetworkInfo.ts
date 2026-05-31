import { useEffect, useState } from "react";
import { fetchNetworkInfo } from "../lib/network-api";
import type { NetworkInfo } from "../types/network";

export function useNetworkInfo() {
  const [info, setInfo] = useState<NetworkInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetchNetworkInfo()
      .then((data) => {
        if (active) setInfo(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { info, loading };
}
