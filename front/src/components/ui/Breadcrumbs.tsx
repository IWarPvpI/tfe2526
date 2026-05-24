
import { useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const NAV_ITEMS = [
    { key: "dashboard", path: "/dashboard" },
    { key: "demandes", path: "/demandes" },
    { key: "expeditions", path: "/expeditions" },
    { key: "clients", path: "/clients" },
    { key: "facturation", path: "/facturation" },
] as const;

export default function Breadcrumbs() {
    const location = useLocation();
    const { t } = useTranslation();

    const segments = location.pathname.split("/").filter(Boolean);

    const crumbs = segments.map((_, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");

        const match = NAV_ITEMS.find((i) => i.path === path);

        return {
            label: match ? t(`nav.${match.key}`) : path,
            path,
        };
    });

    return (
        <nav className="flex items-center gap-2 text-sm text-gray-500">
            <span className="text-gray-400">Home</span>

            {crumbs.map((c, i) => (
                <div key={c.path} className="flex items-center gap-2">
                    <span className="text-gray-300">/</span>

                    {i === crumbs.length - 1 ? (
                        <span className="text-gray-900 dark:text-white font-medium">
                            {c.label}
                        </span>
                    ) : (
                        <Link
                            to={c.path}
                            className="hover:text-gray-900 dark:hover:text-white transition"
                        >
                            {c.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}