import { useState } from "react";
import { useTranslation } from "react-i18next";

interface UserFormProps {
  onClose?: () => void;
  onSubmit: (data: any) => void;
}

export default function UserForm({ onClose, onSubmit }: UserFormProps) {
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [passwordHash, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !email.trim() || !passwordHash.trim()) {
      alert("Veuillez remplir le prénom, l'email et le mot de passe.");
      return;
    }

    const newUserData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      passwordHash: passwordHash,
    };

    onSubmit(newUserData);

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md p-6 rounded-2xl space-y-4 shadow-2xl relative overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
            Créer un Compte Utilisateur
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Prénom *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Marc"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)]"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Nom *
              </label>
              <input
                type="text"
                required
                placeholder="ex: Dubois"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)]"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Email *
              </label>
              <input
                type="email"
                required
                placeholder="marc@dupont.be"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)]"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Téléphone
              </label>
              <input
                type="text"
                placeholder="+32 470 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)]"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                Mot de passe *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordHash}
                onChange={(e) => setPassword(e.target.value)}
                className="px-3 py-2 rounded-xl text-sm outline-none border bg-[var(--bg-app)]"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl border cursor-pointer transition-colors"
                style={{ background: "var(--bg-hover)", borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                {t("common.cancel", "Annuler")}
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-xl shadow-md cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)", color: "#ffffff" }}
            >
              {t("common.create", "Créer l'Utilisateur")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
