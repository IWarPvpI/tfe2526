import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api.service";

export default function Profile() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "Les deux nouveaux mots de passe ne correspondent pas." });
      return;
    }

    if (newPassword.length < 4) {
      setFeedback({ type: "error", message: "Le nouveau mot de passe doit comporter au moins 4 caractères." });
      return;
    }

    setLoading(true);
    try {
      await apiService.changePassword({ currentPassword, newPassword });
      setFeedback({ type: "success", message: "Votre mot de passe a été modifié avec succès." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setFeedback({ type: "error", message: err?.message ? err.message : "Erreur lors du changement de mot de passe." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Mon Profil & Sécurité</h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Gérez les paramètres de sécurité et modifiez votre mot de passe</p>
      </div>

      <div className="p-6 rounded-2xl space-y-4" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4 border-b pb-4" style={{ borderColor: "var(--border)" }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shadow-sm" style={{ background: "var(--accent)" }}>
            {user?.name ? user.name.slice(0, 2).toUpperCase() : "U"}
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{user?.name}</h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--bg-hover)", color: "var(--accent)" }}>
              {user?.role}
            </span>
          </div>
        </div>

        {feedback && (
          <div
            className="p-3 rounded-xl text-xs font-medium flex items-center gap-2"
            style={{
              background: feedback.type === "success" ? "#E1F5EE" : "#FCEBEB",
              color: feedback.type === "success" ? "#085041" : "#791F1F",
              border: `1px solid ${feedback.type === "success" ? "#9FE1CB" : "#F7C1C1"}`,
            }}
          >
            <span>{feedback.type === "success" ? "✓" : "⚠️"}</span>
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-primary)" }}>
            Changer de mot de passe
          </h4>

          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Ancien mot de passe</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: "var(--bg-app)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: "var(--bg-app)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
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
            {loading ? "Mise à jour en cours..." : "Enregistrer le nouveau mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}
