import { createContext, useContext, useState } from "react";

export type Role = "client" | "employee" | "admin" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[]; // ex: ["canEditDelivery:123", "canEditDelivery:456"]
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAtLeast: (role: Role) => boolean;
}

const ROLE_HIERARCHY: Role[] = ["client", "employee", "admin", "superadmin"];

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  hasPermission: () => false,
  isAtLeast: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (user: User) => setUser(user);
  const logout = () => setUser(null);

  // Vérifie une permission granulaire (ex: "canEditDelivery:123")
  const hasPermission = (permission: string) =>
    user?.permissions.includes(permission) ?? false;

  // Vérifie si le rôle de l'user est >= au rôle requis
  const isAtLeast = (role: Role) => {
    if (!user) return false;
    return ROLE_HIERARCHY.indexOf(user.role) >= ROLE_HIERARCHY.indexOf(role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, isAtLeast }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);