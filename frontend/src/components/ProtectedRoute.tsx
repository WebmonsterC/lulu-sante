import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCurrentUser } from "../lib/auth";

export function ProtectedRoute() {
  const location = useLocation();
  const [status, setStatus] = useState<"loading" | "ok" | "guest">("loading");

  useEffect(() => {
    let active = true;
    fetchCurrentUser()
      .then((user) => {
        if (!active) return;
        setStatus(user ? "ok" : "guest");
      })
      .catch(() => {
        if (active) setStatus("guest");
      });
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="fr-container fr-mt-6w">
        <p className="fr-text--sm">Vérification de la session…</p>
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
