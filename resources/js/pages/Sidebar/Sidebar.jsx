import { useState, useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  LayoutDashboard,
  FileText,
  Search,
  Users,
  Trophy,
  Mic,
  BarChart3,
  Settings,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";


export default function Sidebar() {
  const { url } = usePage();
  const [collapsed, setCollapsed] = useState(false);
    const isActive = (routeName) => {
      return route().current(routeName);
    };


  // MENU SECTIONS
  const sections = [
    {
      title: "Tableau de bord",
      items: [
        { id: "dashboard", label: "Vue d'ensemble" , icon: LayoutDashboard, route: "dashboard" },
      ],
    },
    {
      title: "Sourcing",
      items: [
        { id: "brief", label: "Nouveau brief", icon: FileText, route: "briefs.index" },
        { id: "sourcing", label: "Sourcing auto", icon: Search, route: "dashboard" },
      ],
    },
    {
      title: "Entretiens",
      items: [
        { id: "interviews", label: "Entretiens", icon: Mic, route: "dashboard" },
        { id: "reports", label: "Rapports IA", icon: BarChart3, route: "dashboard" },
      ],
    },
    {
      title: "Paramètres",
      items: [
        { id: "settings", label: "Intégrations", icon: Settings, route: "dashboard" },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen flex flex-col border-r transition-all duration-300
      ${collapsed ? "w-[90px]" : "w-[300px]"}
      bg-white text-gray-900 border-gray-200
      dark:bg-[#111118] dark:text-white dark:border-white/10`}
    >

      {/* TOP HEADER */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-white/10">

        {/* LOGO */}
        {!collapsed && (
          <div>
            <h1
              className="text-[26px] font-extrabold tracking-tight"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Talent<span className="text-secondary">AI</span>
            </h1>
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">
              Recrutement Intelligent
            </p>
          </div>
        )}

        {/* COLLAPSE BUTTON */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1E1E28]"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto py-4 custom-scroll">

        {sections.map((section, i) => (
          <div key={i} className="mb-4">

            {/* SECTION TITLE */}
            {!collapsed && (
              <div className="px-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                {section.title}
              </div>
            )}

            {/* ITEMS */}
            {section.items.map((item) => {
              const Icon = item.icon;
              console.log(item.route);

              return (
                <Link
                  key={item.id}
                  href={route(item.route)}
                  className={`flex items-center gap-3 px-5 py-2 border-l-2 transition-all
                  ${
                    isActive(item.route)
                      ? "bg-secondary/10 border-secondary text-secondary font-medium"
                      : "border-transparent text-gray-400 hover:bg-secondary/5 hover:text-secondary"
                  }`}
                >
                  <Icon size={18} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}

            {/* DIVIDER */}
            <div className="mt-3 border-b border-gray-100 dark:border-white/5" />
          </div>
        ))}
      </nav>

      {/* USER */}
      <div className="p-4 border-t border-gray-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-cyan-400 flex items-center justify-center text-white text-xs font-bold">
            SA
          </div>

          {!collapsed && (
            <div>
              <p className="text-sm font-medium">Said Isium</p>
              <p className="text-xs text-gray-400">Admin RH</p>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
}