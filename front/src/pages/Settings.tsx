import { useState } from "react";

interface Adresse {
  id: string;
  label: string;
  rue: string;
  ville: string;
  cp: string;
  pays: string;
  defaut: boolean;
}

const MOCK_ADRESSES: Adresse[] = [
  { id: "ADR-001", label: "Siège social",   rue: "Rue de la Loi 42",       ville: "Bruxelles", cp: "1000", pays: "BE", defaut: true  },
  { id: "ADR-002", label: "Entrepôt Nord",  rue: "Industrielaan 15",       ville: "Gand",      cp: "9000", pays: "BE", defaut: false },
  { id: "ADR-003", label: "Bureau Paris",   rue: "Avenue des Champs 88",   ville: "Paris",     cp: "75008",pays: "FR", defaut: false },
];

const EMPTY = { label: "", rue: "", ville: "", cp: "", pays: "BE" };

export default function Settings() {
  const [adresses, setAdresses] = useState<Adresse[]>(MOCK_ADRESSES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const handleAdd = () => {
    if (!form.label || !form.rue || !form.ville) return;
    const nouvelle: Adresse = {
      id: `ADR-${String(adresses.length + 1).padStart(3, "0")}`,
      defaut: false,
      ...form,
    };
    setAdresses((prev) => [...prev, nouvelle]);
    setForm(EMPTY);
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setAdresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefaut = (id: string) => {
    setAdresses((prev) => prev.map((a) => ({ ...a, defaut: a.id === id })));
  };

  return (
    <div className="space-y-8 max-w-2xl">

      {/* Section adresses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Adresses prédéfinies
            </h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
              Utilisées pour vos demandes de livraison
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {showForm ? "Annuler" : "+ Ajouter"}
          </button>
        </div>

        {/* Formulaire ajout */}
        {showForm && (
          <div
            className="p-5 rounded-2xl space-y-3"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Nouvelle adresse
            </p>

            {[
              { key: "label", placeholder: "Libellé (ex: Entrepôt Sud)", label: "Libellé" },
              { key: "rue",   placeholder: "Rue et numéro",              label: "Rue"     },
            ].map(({ key, placeholder, label }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</label>
                <input
                  type="text"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--bg-app)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>
            ))}

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "cp",    label: "Code postal", placeholder: "1000"   },
                { key: "ville", label: "Ville",        placeholder: "Bruxelles" },
                { key: "pays",  label: "Pays",         placeholder: "BE"     },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{
                      background: "var(--bg-app)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleAdd}
              className="w-full py-2 rounded-xl text-sm font-medium transition-colors mt-2"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Enregistrer
            </button>
          </div>
        )}

        {/* Liste adresses */}
        <div className="space-y-3">
          {adresses.map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-2xl flex items-start justify-between gap-4"
              style={{
                background: "var(--bg-surface)",
                border: a.defaut
                  ? "1px solid var(--accent)"
                  : "1px solid var(--border)",
              }}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {a.label}
                  </p>
                  {a.defaut && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "#E6F1FB", color: "#0C447C" }}
                    >
                      Défaut
                    </span>
                  )}
                </div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {a.rue}, {a.cp} {a.ville} · {a.pays}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!a.defaut && (
                  <button
                    onClick={() => handleSetDefaut(a.id)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{
                      background: "var(--bg-hover)",
                      color: "var(--text-muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    Définir défaut
                  </button>
                )}
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{
                    background: "#FCEBEB",
                    color: "#791F1F",
                    border: "1px solid #F7C1C1",
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section profil (stub) */}
      <div
        className="p-5 rounded-2xl space-y-1"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Profil & préférences
        </h3>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Modification du mot de passe, langue, notifications — à venir.
        </p>
      </div>

    </div>
  );
}