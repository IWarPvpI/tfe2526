import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import Layout from "../components/layout/Layout";

import Dashboard    from "../pages/Dashboard";
import Demandes     from "../pages/Demande";
import Expeditions  from "../pages/Expedition";
import Facturation  from "../pages/Facturation";
import Clients      from "../pages/Client";
import ClientDetail  from "../pages/ClientDetail";
import Users         from "../pages/Users";
import Settings     from "../pages/Settings";
import Login        from "../pages/Login";
import Unauthorized from "../pages/Unauthorized";
import TestPage from "../pages/TestPage";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public */}
        <Route path="/login"        element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protégé — toutes les pages partagent le même Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute minRole="client">
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Accessible à tous les rôles connectés */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* Client + tous les rôles supérieurs */}
          <Route path="expeditions" element={<Expeditions />} />
          <Route path="facturation" element={<Facturation />} />

          {/* Client uniquement (ses settings / adresses) */}
          <Route
            path="settings"
            element={
              <ProtectedRoute minRole="client">
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Employé minimum */}
          <Route
            path="demandes"
            element={
              <ProtectedRoute minRole="client">
                <Demandes />
              </ProtectedRoute>
            }
          />
          <Route
            path="clients"
            element={
              <ProtectedRoute minRole="employee">
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="clients/:id"
            element={
              <ProtectedRoute minRole="employee">
                <ClientDetail />
              </ProtectedRoute>
            }
          />

          {/* Admin minimum - Gestion des Comptes EF8 */}
          <Route
            path="admin/users"
            element={
              <ProtectedRoute minRole="admin">
                <Users />
              </ProtectedRoute>
            }
          />

          {/* SuperAdmin uniquement */}
          <Route
            path="superadmin/*"
            element={
              <ProtectedRoute minRole="superadmin">
                {/* Sous-routes superadmin à ajouter ici */}
                <div>SuperAdmin panel</div>
              </ProtectedRoute>
            }
          />

          <Route
            path="test/*"
            element={
              <ProtectedRoute minRole="superadmin">
                {/* Sous-routes superadmin à ajouter ici */}
                <TestPage/>
              </ProtectedRoute>
            }
          />
        </Route>
        

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}