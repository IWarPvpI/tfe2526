import { useState } from "react";
import { motion } from "framer-motion";

const menuItems = ["Dashboard", "Demandes", "Expéditions", "Clients", "Facturation"];

export default function Layout() {
  const [isOpen, setIsOpen] = useState(true);
  const [active, setActive] = useState("Dashboard");

  return (
    <div className="h-screen flex bg-[#0b0f1a] text-white">

      {/* SIDEBAR */}
      <motion.aside
        animate={{ width: isOpen ? 260 : 72 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="h-full bg-[#0f172a] border-r border-white/10 overflow-hidden flex flex-col"
      >

        {/* HEADER */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <span className="font-bold">
            {isOpen ? "UNISHIP" : "U"}
          </span>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 transition"
          >
            ☰
          </button>
        </div>

        {/* MENU */}
        <nav className="p-2 space-y-1">
          {menuItems.map((item) => {
            const isActive = active === item;

            return (
              <button
                key={item}
                onClick={() => setActive(item)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition
                  ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />

                {/* TEXTE ANIMÉ PROPRE */}
                <motion.span
                  animate={{
                    opacity: isOpen ? 1 : 0,
                    width: isOpen ? "auto" : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {item}
                </motion.span>
              </button>
            );
          })}
        </nav>
      </motion.aside>

      {/* CONTENT (SANS MARGIN, SANS HACK) */}
      <div className="flex-1 flex flex-col">

        {/* NAVBAR */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <h2 className="text-lg font-semibold">
            {active}
          </h2>

          <div className="flex items-center gap-3 text-sm text-white/70">
            <div className="w-8 h-8 rounded-full bg-white/20" />
            John Doe
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-6">
          <div className="text-white/60">
            Contenu : {active}
          </div>
        </main>
      </div>
    </div>
  );
}