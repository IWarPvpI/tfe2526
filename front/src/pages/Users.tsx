import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api.service";
import UserForm from "../components/Form/UserForm";

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: "client" | "employee" | "admin" | "superadmin";
  enterprise?: string;
  isActive: boolean;
  createdAt: string;
}

const MOCK_USERS_LIST: UserAccount[] = [
  { id: "USR-001", name: "Alice Client",    email: "alice@uniship.com",  role: "client",     enterprise: "Dupont SA",    isActive: true,  createdAt: "2026-01-15" },
  { id: "USR-002", name: "Bob Employé",     email: "bob@uniship.com",    role: "employee",   enterprise: "Uniship Logistics", isActive: true, createdAt: "2025-11-04" },
  { id: "USR-003", name: "Carol Admin",     email: "carol@uniship.com",  role: "admin",      enterprise: "Uniship HQs",  isActive: true,  createdAt: "2025-08-20" },
  { id: "USR-004", name: "Dave SuperAdmin", email: "dave@uniship.com",   role: "superadmin", enterprise: "Uniship HQs",  isActive: true,  createdAt: "2025-01-10" },
  { id: "USR-005", name: "Jean Dupont",     email: "jean@dupont.be",     role: "client",     enterprise: "Dupont SA",    isActive: true,  createdAt: "2026-03-12" },
  { id: "USR-006", name: "Sophie Leroy",    email: "sophie@leroy.be",    role: "client",     enterprise: "Leroy SPRL",   isActive: false, createdAt: "2026-04-05" },
];

const ROLE_BADGES: Record<string, { label: string; bg: string; color: string }> = {
  client:     { label: "Client",     bg: "rgba(59, 130, 246, 0.15)",  color: "#3B82F6" },
  employee:   { label: "Employé",    bg: "rgba(16, 185, 129, 0.15)",  color: "#10B981" },
  admin:      { label: "Admin",      bg: "rgba(242, 122, 23, 0.15)",  color: "#F27A17" },
  superadmin: { label: "SuperAdmin", bg: "rgba(168, 85, 247, 0.15)",  color: "#A855F7" },
};

const initials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function Users() {
  const { isAtLeast } = useAuth();
  const [users, setUsers] = useState<UserAccount[]>(MOCK_USERS_LIST);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    apiService.getUsers()
      .then((res) => {
        if (Array.isArray(res) && res.length > 0) {
          const mapped: UserAccount[] = res.map((u: any) => ({
            id: u.id,
            name: u.firstName ? `${u.firstName} ${u.lastName}` : u.name || u.email,
            email: u.email,
            role: u.role?.name || "client",
            enterprise: u.enterprise?.name || "Particulier",
            isActive: u.isActive !== false,
            createdAt: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : "2026-01-01",
          }));
          setUsers(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddUser = async (data: any) => {
    const newUser: UserAccount = {
      id: `USR-00${users.length + 1}`,
      name: `${data.firstName} ${data.lastName}`.trim() || data.email,
      email: data.email,
      role: "client",
      enterprise: "Particulier",
      isActive: true,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    try {
      await apiService.createUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
      });
    } catch (err) {
    }

    setUsers([newUser, ...users]);
    setShowModal(false);
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
  };

  const filtered = users
    .filter((u) => (roleFilter !== "" ? u.role === roleFilter : true))
    .filter((u) =>
      [u.name, u.email, u.enterprise, u.id].join(" ").toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Gestion des Comptes Utilisateurs (EF8)
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Module d'administration des accès, rôles et permissions de la plateforme
          </p>
        </div>

        {isAtLeast("admin") && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)", color: "#ffffff" }}
          >
            + Nouvel Utilisateur
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Rechercher nom, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs outline-none border"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
            width: "240px",
          }}
        />

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl text-xs outline-none border cursor-pointer"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border)",
            color: "var(--text-primary)",
          }}
        >
          <option value="">Tous les rôles</option>
          <option value="client">Client</option>
          <option value="employee">Employé</option>
          <option value="admin">Admin</option>
          <option value="superadmin">SuperAdmin</option>
        </select>
      </div>

      {/* Tableau des utilisateurs */}
      <div
        className="rounded-2xl border overflow-hidden shadow-sm"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                <th className="py-3 px-4 font-semibold">Utilisateur</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Rôle Access</th>
                <th className="py-3 px-4 font-semibold">Entreprise</th>
                <th className="py-3 px-4 font-semibold">Statut</th>
                <th className="py-3 px-4 font-semibold">Date Création</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const badge = ROLE_BADGES[u.role] || ROLE_BADGES.client;

                return (
                  <tr
                    key={u.id}
                    className="border-b transition-colors"
                    style={{ borderColor: "var(--border)", opacity: u.isActive ? 1 : 0.6 }}
                  >
                    {/* Nom + Avatar */}
                    <td className="py-3 px-4 font-medium" style={{ color: "var(--text-primary)" }}>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {initials(u.name)}
                        </div>
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{u.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4" style={{ color: "var(--text-muted)" }}>
                      {u.email}
                    </td>

                    {/* Rôle */}
                    <td className="py-3 px-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                        style={{ background: badge.bg, color: badge.color }}
                      >
                        {badge.label}
                      </span>
                    </td>

                    {/* Entreprise */}
                    <td className="py-3 px-4 font-medium" style={{ color: "var(--text-primary)" }}>
                      {u.enterprise || "Non associée"}
                    </td>

                    {/* Statut */}
                    <td className="py-3 px-4">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                        style={
                          u.isActive
                            ? { background: "rgba(16, 185, 129, 0.15)", color: "#10B981" }
                            : { background: "rgba(239, 68, 68, 0.15)", color: "#EF4444" }
                        }
                      >
                        {u.isActive ? "● Actif" : "○ Suspendu"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4" style={{ color: "var(--text-muted)" }}>
                      {u.createdAt}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(u.id)}
                          className="px-2.5 py-1 rounded-lg text-[11px] border cursor-pointer transition-colors"
                          style={{ background: "var(--bg-hover)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                        >
                          {u.isActive ? "Suspendre" : "Réactiver"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
          Total : {filtered.length} compte(s) utilisateur(s)
        </div>
      </div>

      {showModal && (
        <UserForm
          onClose={() => setShowModal(false)}
          onSubmit={handleAddUser}
        />
      )}
    </div>
  );
}
