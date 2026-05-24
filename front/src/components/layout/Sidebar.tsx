export default function Sidebar({ active, setActive }: any) {
  const items = ["Dashboard", "Clients", "Expéditions", "Facturation"];

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-white/10">
      <div className="p-4 font-bold">UNISHIP</div>

      <nav className="p-2 space-y-1">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => setActive(item)}
            className={`w-full text-left px-3 py-2 rounded-lg transition
              ${
                active === item
                  ? "bg-white/15"
                  : "hover:bg-white/10 text-white/60"
              }`}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}