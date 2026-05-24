import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div
      className="h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: "var(--bg-app)" }}
    >
      <p className="text-4xl font-bold" style={{ color: "var(--text-primary)" }}>403</p>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Vous n'avez pas accès à cette page.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 rounded-lg text-sm transition-colors"
        style={{ background: "var(--bg-hover)", color: "var(--text-primary)", border: "1px solid var(--border)" }}
      >
        Retour
      </button>
    </div>
  );
}