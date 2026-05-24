import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
  { code: "nl", label: "NL" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language.slice(0, 2);

  return (
    <div
      className="flex items-center rounded-lg overflow-hidden text-xs font-medium"
      style={{ border: "1px solid var(--border)" }}
    >
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => i18n.changeLanguage(code)}
          className="px-2.5 py-1.5 transition-colors"
          style={{
            background: current === code ? "var(--bg-active)" : "transparent",
            color: current === code ? "var(--text-primary)" : "var(--text-muted)",
          }}
          aria-label={`Langue : ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}