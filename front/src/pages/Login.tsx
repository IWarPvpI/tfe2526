import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api.service";
import UnishipLogo from "../components/ui/UnishipLogo";

const DEMO_USERS = [
  { name: "Goku (Admin)", email: "goku@saiyan.com", role: "admin" },
  { name: "Krillin (Client)", email: "krillin@earth.com", role: "client" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const executeLogin = async (userEmail: string, userPassword?: string) => {
    setError("");
    setLoading(true);
    try {
      const res = await apiService.authLogin({
        email: userEmail,
        password: userPassword ? userPassword : "hash",
      });
      if (res?.accessToken && res?.user) {
        login(res.user, res.accessToken);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err?.message ? err.message : "Échec de connexion. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      executeLogin(email, password);
    }
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
        <div className="absolute top-0 left-0 right-0 h-1.5" style={{ background: "var(--accent)" }} />

        <div className="flex flex-col items-center text-center space-y-2 pt-2">
          <UnishipLogo size="lg" />
          <p className="text-xs tracking-wider uppercase font-semibold pt-1" style={{ color: "var(--text-muted)" }}>
            Plateforme Sécurisée d'Expéditions
          </p>
        </div>

        {error && (
          <div
            className="p-3 rounded-xl text-xs font-medium"
            style={{ background: "#FCEBEB", color: "#791F1F", border: "1px solid #F7C1C1" }}
          >
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
              Adresse Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: goku@saiyan.com"
              required
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: "var(--bg-app)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-muted)" }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: "var(--bg-app)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-opacity"
            style={{ background: "var(--accent)" }}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-center" style={{ color: "var(--text-muted)" }}>
            Accès Rapide Démo (JWT)
          </p>

          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((user) => (
              <button
                key={user.email}
                type="button"
                onClick={() => executeLogin(user.email)}
                disabled={loading}
                className="p-2.5 rounded-xl text-left transition-colors border"
                style={{ background: "var(--bg-app)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                <p className="text-xs font-semibold">{user.name}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{user.email}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}