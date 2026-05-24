import { Navigate } from "react-router-dom";
import { useAuth, type Role } from "../../context/AuthContext";

interface Props {
  children: React.ReactNode;
  // Rôle minimum requis pour accéder à la route
  minRole?: Role;
  // Permission granulaire requise (ex: "canEditDelivery:123")
  permission?: string;
  // Où rediriger si accès refusé (défaut: /unauthorized)
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  minRole,
  permission,
  redirectTo = "/unauthorized",
}: Props) {
  const { user, isAtLeast, hasPermission } = useAuth();

  // Pas connecté → login
  if (!user) return <Navigate to="/login" replace />;

  // Rôle insuffisant
  if (minRole && !isAtLeast(minRole)) return <Navigate to={redirectTo} replace />;

  // Permission granulaire manquante
  if (permission && !hasPermission(permission)) return <Navigate to={redirectTo} replace />;

  return <>{children}</>;
}