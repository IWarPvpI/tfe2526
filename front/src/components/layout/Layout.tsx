import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { Outlet } from "react-router-dom";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import UnishipLogo from "../ui/UnishipLogo";

const NAV_ITEMS = [
  { key: "dashboard", icon: "📊", path: "/dashboard" },
  { key: "demandes", icon: "📋", path: "/demandes" },
  { key: "expeditions", icon: "🚚", path: "/expeditions" },
  { key: "clients", icon: "👥", path: "/clients" },
  { key: "facturation", icon: "💶", path: "/facturation" },
  { key: "users", icon: "🛡️", path: "/admin/users" },
] as const;

export default function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const initials = user
    ? user.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <div className="h-screen flex" style={{ background: "var(--bg-app)", color: "var(--text-primary)" }}>

      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: isOpen ? 240 : 88 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="relative h-full flex flex-col border-r overflow-visible"
        style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        {/* TOP */}
        <div className="h-16 flex items-center justify-between px-4 border-b overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <UnishipLogo size="sm" showText={isOpen} />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="
    absolute top-4 right-[-12px]
    w-7 h-7
    rounded-md
    border shadow-md
    flex items-center justify-center
    text-xs cursor-pointer
    z-50
  "
            style={{ background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-1.5 p-2 mt-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-sm font-medium border-l-4 ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--bg-hover)] text-[var(--accent)] font-semibold"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`
              }
            >
              <span className="text-base w-6 text-center">{item.icon}</span>

              <motion.span
                animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? "auto" : 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden whitespace-nowrap"
              >
                {t(`nav.${item.key}`)}
              </motion.span>
            </NavLink>
          ))}
        </nav>
      </motion.aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 flex items-center justify-between px-6 border-b backdrop-blur-md" style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}>
          <Breadcrumbs />

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border flex items-center justify-center text-sm cursor-pointer"
              style={{ background: "var(--bg-app)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--accent)", color: "#ffffff" }}>
                {initials}
              </div>

              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                {user?.name}
              </span>
            </div>

            <button
              onClick={logout}
              className="text-xs px-2.5 py-1.5 rounded-lg border font-medium cursor-pointer"
              style={{ background: "var(--bg-hover)", borderColor: "var(--border)", color: "var(--text-primary)" }}
            >
              ⎋
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* 👇 ICI le routing injecte la page */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}