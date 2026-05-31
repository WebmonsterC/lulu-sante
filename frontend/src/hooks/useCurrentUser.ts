import { useEffect, useState } from "react";
import type { AppUser } from "../data/users";
import { fetchCurrentUser } from "../lib/auth";

export function useCurrentUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchCurrentUser()
      .then((next) => {
        if (active) setUser(next);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { user, loading, setUser };
}
