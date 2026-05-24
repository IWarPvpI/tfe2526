import { useState } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import { Outlet, useLocation } from "react-router-dom";
import Breadcrumbs from "../../components/ui/Breadcrumbs";

const NAV_ITEMS = [
  { key: "dashboard", icon: "📊", path: "/dashboard" },
  { key: "demandes", icon: "📋", path: "/demandes" },
  { key: "expeditions", icon: "🚚", path: "/expeditions" },
  { key: "clients", icon: "👥", path: "/clients" },
  { key: "facturation", icon: "💶", path: "/facturation" },
] as const;

export default function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const location = useLocation();
  const initials = user
    ? user.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";


  const getTitle = () => {
    const path = location.pathname;

    const item = NAV_ITEMS.find((i) => i.path === path);

    return item ? t(`nav.${item.key}`) : "App";
  };
  return (
    <div className="h-screen flex">

      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: isOpen ? 240 : 100 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="relative h-full flex flex-col border-r bg-[#f9fafb] dark:bg-[#0b0f19] dark:border-white/5 overflow-visible"
      >
        {/* TOP */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-black/5 dark:border-white/5">
          <span className="font-semibold tracking-wide text-sm text-gray-900 dark:text-white">
            UNISHIP
          </span>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="
    absolute top-4 right-[-12px]
    w-8 h-8
    rounded-md
    bg-white dark:bg-[#111827]
    border border-black/10 dark:border-white/10
    shadow-md
    flex items-center justify-center
    text-sm
    hover:scale-105 transition
    z-50
  "
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </div>

        {/* NAV */}
        <nav className="flex flex-col gap-1 p-2 mt-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `
          flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
          text-sm font-medium
          ${isActive
                  ? "bg-black/5 dark:bg-white/10 text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }
          `
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
        <header className="h-16 flex items-center justify-between px-6 border-b border-black/5 dark:border-white/5 bg-white/70 dark:bg-[#0b0f19]/60 backdrop-blur-md">
          <Breadcrumbs />

          <div className="flex items-center gap-3">
            <LanguageSwitcher />

            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-medium">
                {initials}
              </div>

              <span className="text-sm text-gray-600 dark:text-gray-300">
                {user?.name}
              </span>
            </div>

            <button
              onClick={logout}
              className="text-xs px-2 py-1 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/10 transition"
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