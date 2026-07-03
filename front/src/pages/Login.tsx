import { useNavigate } from "react-router-dom";
import { useAuth, type User } from "../context/AuthContext";
import UnishipLogo from "../components/ui/UnishipLogo";

// Mock users — à remplacer par un vrai appel API
const MOCK_USERS: User[] = [
  { id: "1", name: "Alice Client",    email: "alice@uniship.com",  role: "client",     permissions: [] },
  { id: "2", name: "Bob Employé",     email: "bob@uniship.com",    role: "employee",   permissions: [] },
  { id: "3", name: "Carol Admin",     email: "carol@uniship.com",  role: "admin",      permissions: [] },
  { id: "4", name: "Dave SuperAdmin", email: "dave@uniship.com",   role: "superadmin", permissions: [] },
];

const ROLE_LABELS: Record<string, string> = {
  client:     "Client",
  employee:   "Employé",
  admin:      "Admin",
  superadmin: "SuperAdmin",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (user: User) => {
    login(user);
    navigate("/dashboard");
  };

  return (
    <div
      className="h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--bg-app)" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-2xl space-y-6 relative overflow-hidden shadow-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        {/* Ligne d'accentuation Orange Uniship */}
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: "var(--accent)" }} />

        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <UnishipLogo size="lg" />
          <p className="text-xs tracking-wider uppercase font-semibold pt-1" style={{ color: "var(--text-muted)" }}>
            Plateforme de Gestion d'Expéditions & Devis
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-center" style={{ color: "var(--text-muted)" }}>
            Connexion Démo — Choisir un rôle
          </p>

          <div className="space-y-2">
            {MOCK_USERS.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left cursor-pointer transition-colors"
                style={{
                  background: "var(--bg-hover)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                }}
              >
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "var(--bg-active)", color: "var(--accent)" }}>
                  {ROLE_LABELS[user.role]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}