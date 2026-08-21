import { createContext, useContext, useState } from "react";

export type Role = "client" | "user" | "employee" | "admin" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  login: (user: User, token?: string) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAtLeast: (role: Role) => boolean;
}

const ROLE_HIERARCHY: Role[] = ["client", "user", "employee", "admin", "superadmin"];

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  hasPermission: () => false,
  isAtLeast: () => false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("uniship_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const login = (user: User, token?: string) => {
    setUser(user);
    localStorage.setItem("uniship_user", JSON.stringify(user));
    if (token) {
      localStorage.setItem("access_token", token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("uniship_user");
    localStorage.removeItem("access_token");
  };

  const hasPermission = (permission: string) =>
    user?.permissions ? user.permissions.includes(permission) : false;

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