import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageLoader } from "./components/PageLoader";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppDataProvider } from "./context/AppDataContext";
import { AppShell } from "./layouts/AppShell";
import { LoginPage } from "./pages/LoginPage";

const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const DossiersPage = lazy(() =>
  import("./pages/DossiersPage").then((m) => ({ default: m.DossiersPage })),
);
const DossierPage = lazy(() =>
  import("./pages/DossierPage").then((m) => ({ default: m.DossierPage })),
);
const IndicateursPage = lazy(() =>
  import("./pages/IndicateursPage").then((m) => ({ default: m.IndicateursPage })),
);
const KpiPage = lazy(() => import("./pages/KpiPage").then((m) => ({ default: m.KpiPage })));
const ExportsPage = lazy(() =>
  import("./pages/ExportsPage").then((m) => ({ default: m.ExportsPage })),
);
const ProfilePage = lazy(() =>
  import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const AdminPage = lazy(() => import("./pages/AdminPage").then((m) => ({ default: m.AdminPage })));
const UserFormPage = lazy(() =>
  import("./pages/UserFormPage").then((m) => ({ default: m.UserFormPage })),
);

export function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/connexion" element={<Navigate to="/" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppDataProvider />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dossiers" element={<DossiersPage />} />
              <Route path="/dossiers/:dossierId" element={<DossierPage />} />
              <Route path="/dossiers/:dossierId/:tab" element={<DossierPage />} />
              <Route path="/indicateurs" element={<Navigate to="/indicateurs/1" replace />} />
              <Route path="/indicateurs/:sectionId" element={<IndicateursPage />} />
              <Route path="/kpi" element={<KpiPage />} />
              <Route path="/exports" element={<ExportsPage />} />
              <Route path="/profil" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/utilisateurs/nouveau" element={<UserFormPage mode="create" />} />
              <Route
                path="/admin/utilisateurs/:userId/modifier"
                element={<UserFormPage mode="edit" />}
              />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
