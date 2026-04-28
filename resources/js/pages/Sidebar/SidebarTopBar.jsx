import { useState } from "react";
import { Search, ShieldCheck, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import  Select  from "@/components/Select";

export default function SidebarTopBar() {
  const [lang, setLang] = useState("fr");
  const [collapsed] = useState(false);

  const { dark, toggleTheme } = useTheme();

  return (
    <div className="px-10 py-3 border-b border-gray-200 dark:border-white/10">

      <div className="flex items-center justify-between gap-3">

        {/* LEFT - SEARCH */}
        {!collapsed && (
          <div className="flex items-center gap-2 flex-1 max-w-[620px] bg-gray-100 dark:bg-[#1E1E28] px-3 py-2 rounded-lg">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none text-sm w-full text-gray-700 dark:text-white"
            />
          </div>
        )}

        {/* CENTER */}
        <div className="flex items-center gap-4">

          {!collapsed && (
              <Select
                value={lang}
                onChange={setLang}
                placeholder="Select language"
                options={[
                  { value: "fr", label: "Fr" },
                  { value: "en", label: "En" },

                ]}
              />
          )}

        </div>

        {/* RIGHT - DARK MODE */}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-[#1E1E28] hover:scale-105 transition"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}