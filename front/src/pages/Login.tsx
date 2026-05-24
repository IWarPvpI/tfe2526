import { useNavigate } from "react-router-dom";
import { useAuth, type User } from "../context/AuthContext";

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
      className="h-screen flex items-center justify-center"
      style={{ background: "var(--bg-app)" }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-2xl space-y-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <h1
          className="text-lg font-bold tracking-widest mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          UNISHIP
        </h1>

        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          Connexion mock — choisir un rôle
        </p>

        <div className="space-y-2">
          {MOCK_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left"
              style={{
                background: "var(--bg-hover)",
                color: "var(--text-primary)",
                border: "1px solid var(--border)",
              }}
            >
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {ROLE_LABELS[user.role]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}