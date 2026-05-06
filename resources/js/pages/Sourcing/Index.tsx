import CandidateTable from "@/components/CandidateTable";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { Briefcase, icons, Search, Users } from "lucide-react";

const sources = [
  {
    name: "LinkedIn",
    icon:<Search className="w-5 h-5 text-ds-text3" />,
    stats: "23 profils trouvés · 8 retenus",
    status: "connected",
  },
  {
    name: "Indeed",
    icon:<Briefcase className="w-5 h-5 text-ds-text3" />,
    stats: "11 CVs importés · 5 retenus",
    status: "connected",
  },
  {
    name: "Facebook Jobs",
    icon:<Users className="w-5 h-5 text-ds-text3" />,
    stats: "Non configuré",
    status: "not_configured",
  },
];

const candidates = [
  {
    id: 1,
    name: "Karim Benali",
    location: "Casablanca",
    source: "LinkedIn",
    job: "Dir. Commercial · Atlas Group",
    experience: "14 ans",
    score: 94,
  },
    {
    id: 1,
    name: "Karim Benali",
    location: "Casablanca",
    source: "LinkedIn",
    job: "Dir. Commercial · Atlas Group",
    experience: "14 ans",
    score: 94,
  },
    {
    id: 1,
    name: "Karim Benali",
    location: "Casablanca",
    source: "LinkedIn",
    job: "Dir. Commercial · Atlas Group",
    experience: "14 ans",
    score: 94,
  },
];

export default function SourcingPage() {
  return (
    <AppSidebarLayout>
      <div className="bg-ds-bg text-ds-text min-h-full px-6 py-8">
        
        {/* HEADER */}
        <div className="mb-6">
          <p className="font-heading text-ds-text3 text-xs">
            Sourcing <span className="text-ds-text2">› Sourcing automatisé</span>
          </p>

          <h1 className="font-heading text-[26px] font-bold">
            Sourcing IA · Directeur Commercial MENA
          </h1>

          <p className="font-heading text-ds-text2 mt-1 text-[14px]">
            Connectez vos plateformes · L'IA extrait et qualifie les profils automatiquement
          </p>
        </div>

        {/* SOURCES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {sources.map((s, i) => (
            <div
              key={i}
              className="bg-ds-surface border-ds-border hover:border-ds-border2 rounded-xl border p-4 transition"
            >
              <div className="mb-2 text-xl">{s.icon}</div>

              <h3 className="font-heading text-[14px] font-semibold">
                {s.name}
              </h3>

              <p className="font-heading text-ds-text2 text-[12px]">
                {s.stats}
              </p>

              {s.status === "connected" ? (
                <span className="font-heading text-[11px] text-green-400 mt-2 inline-block">
                  ● Connecté
                </span>
              ) : (
                <span className="font-heading text-ds-text3 text-[11px] mt-2 inline-block">
                  Configurer →
                </span>
              )}
            </div>
          ))}
        </div>

        {/* TABLE */}
        <div className="bg-ds-surface border-ds-border rounded-xl border p-4">
          
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-[14px] font-semibold">
              Profils sourcés & filtrés par IA
            </h2>

            <div className="flex items-center gap-3">
              <span className="font-heading text-ds-text3 text-xs">
                13 retenus / 34 analysés
              </span>

              <button className="bg-ds-accent hover:bg-[#7C74FF] text-white text-[12px] px-3 py-1 rounded-md">
                Voir le classement
              </button>
            </div>
          </div>

          <CandidateTable data={candidates} />

        </div>
      </div>
    </AppSidebarLayout>
  );
}