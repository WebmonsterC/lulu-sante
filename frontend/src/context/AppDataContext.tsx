import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fetchMetierBundle } from "../lib/metier-api";
import {
  clearRuntimeMetier,
  setRuntimeMetier,
  type MetierBundle,
} from "../data/runtime-metier";

type AppDataContextValue = {
  metier: MetierBundle;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const emptyMetier: MetierBundle = {
  agents: [],
  dossiers: [],
  alertes: [],
  arrets: [],
  saisinesCm: [],
  visitesMt: [],
  parcoursPpr: [],
  chronologie: {},
  kpiDirection: [],
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider() {
  const [metier, setMetier] = useState<MetierBundle>(emptyMetier);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchMetierBundle();
      setMetier(data);
      setRuntimeMetier(data);
      setError(null);
    } catch {
      clearRuntimeMetier();
      setMetier(emptyMetier);
      setError("Impossible de charger les données depuis la base SQLite.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    refresh().finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
      clearRuntimeMetier();
    };
  }, [refresh]);

  const value = useMemo(
    () => ({
      metier,
      loading,
      error,
      refresh,
    }),
    [metier, loading, error, refresh],
  );

  if (loading) {
    return (
      <div className="fr-container fr-mt-6w">
        <p className="fr-text--sm">Chargement des données depuis SQLite…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fr-container fr-mt-6w">
        <div className="fr-alert fr-alert--error fr-mb-3w">
          <p className="fr-alert__title">Erreur de connexion au serveur</p>
          <p className="fr-alert__desc">{error}</p>
        </div>
        <Button onClick={() => refresh()}>Réessayer</Button>
      </div>
    );
  }

  return <AppDataContext.Provider value={value}><Outlet /></AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData doit être utilisé dans AppDataProvider");
  }
  return context;
}
