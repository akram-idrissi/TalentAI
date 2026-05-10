import { useState } from "react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";

import AppLayout from '@/layouts/app-layout';

import {
  Linkedin,
  Search,
  Award,
  Briefcase,
  MapPin,
  TrendingUp,
  Download,
  Phone,
} from "lucide-react";

type Candidate = {
  id: number;
  name: string;
  role: string;
  company: string;
  source: string;
  score: number;
  tags: string[];
  skills: {
    experience: number;
    education: number;
    sector: number;
    leadership: number;
    location: number;
  };
};

const candidates: Candidate[] = [
  {
    id: 1,
    name: "Karim Benali",
    role: "Dir. Commercial",
    company: "Atlas Group",
    source: "LinkedIn",
    score: 94,
    tags: ["B2B", "HEC Paris", "MENA", "Salesforce"],
    skills: {
      experience: 96,
      education: 90,
      sector: 88,
      leadership: 95,
      location: 100,
    },
  },
  {
    id: 2,
    name: "Nadia El Fassi",
    role: "VP Sales",
    company: "OCP Group",
    source: "LinkedIn",
    score: 89,
    tags: ["Enterprise", "Strategy", "CRM"],
    skills: {
      experience: 92,
      education: 85,
      sector: 90,
      leadership: 88,
      location: 95,
    },
  },
];

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className={`text-xs px-2 py-1 rounded border ${color}`}
    >
      {children}
    </span>
  );
}

export default function SourcingRankingPage() {
  const [selected, setSelected] = useState(candidates[0]);

  return (

    <AppLayout>

      <div className="min-h-screen bg-ds-bg dark:bg-[#0A0A0F] text-ds-text dark:text-white p-6">

        {/* HEADER */}
        <div className="mb-6">
          <p className="font-heading text-xs text-ds-text3 flex items-center gap-1">
            Candidats <span>› Classement IA</span>
          </p>

          <h1 className="text-2xl font-heading font-bold mt-1">
            Classement IA · Directeur Commercial MENA
          </h1>

          <p className="font-heading text-sm text-ds-text2 mt-1">
            {candidates.length} candidats analysés · Triés par score IA
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LIST */}
          <div className="lg:col-span-2 space-y-3">

            {candidates.map((c, index) => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition
                ${
                  selected.id === c.id
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-ds-border bg-ds-surface dark:border-white/10 dark:bg-[#1E1E28] hover:bg-ds-bg3 dark:hover:bg-[#252530]"
                }`}
              >

                {/* rank */}
                <div className="w-8 h-8 flex items-center justify-center rounded-md bg-ds-bg3 dark:bg-white/5 text-sm font-bold">
                  {index + 1}
                </div>

                {/* info */}
                <div className="flex-1">
                  <h3 className="font-heading flex items-center gap-2">
                    <Linkedin size={14} className="text-blue-400" />
                    {c.name}
                  </h3>

                  <p className="font-heading text-xs text-ds-text2">
                    <Briefcase size={12} className="inline mr-1" />
                    {c.role} · {c.company}
                  </p>

                  <div className="flex gap-2 mt-1 flex-wrap">
                    {c.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* score */}
                <div className="text-right">
                  <div
                    className={`text-lg font-bold ${
                      c.score > 85
                        ? "text-green-400"
                        : c.score > 70
                        ? "text-yellow-400"
                        : "text-red-400"
                    }`}
                  >
                    {c.score}
                  </div>
                  <div className="font-heading text-xs text-ds-text3">/100</div>
                </div>

              </div>
            ))}
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-ds-surface dark:bg-[#1E1E28] border border-ds-border dark:border-white/10 rounded-xl p-5">

            {/* HEADER */}
            <div className="text-center border-b border-ds-border dark:border-white/10 pb-4 mb-4">

              <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center font-bold">
                {selected.name.split(" ").map(n => n[0]).join("")}
              </div>

              <h2 className="mt-2 font-heading text-lg">{selected.name}</h2>

              <p className="font-heading text-xs text-ds-text2 flex justify-center items-center gap-1">
                <MapPin size={12} />
                {selected.role} · {selected.company}
              </p>

              <div className="flex justify-center gap-2 mt-3">
                <span className="text-xs px-2 py-1 rounded border bg-blue-500/10 text-blue-500 border-blue-500/20 flex items-center gap-1">
                  <Linkedin size={12} /> {selected.source}
                </span>

                <span className="text-xs px-2 py-1 rounded border bg-green-500/10 text-green-500 border-green-500/20">
                  Top match
                </span>
              </div>

              <div className="font-heading text-4xl font-bold text-green-400 mt-3">
                {selected.score}
              </div>

              <p className="font-heading text-xs text-ds-text3">/100 IA score</p>
            </div>

            {/* SKILLS */}
            <div className="space-y-3">

              {Object.entries(selected.skills).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">

                  <div className="font-heading w-28 text-xs text-ds-text2 capitalize">
                    {key}
                  </div>

                  <div className="flex-1 bg-ds-bg3 dark:bg-[#111118] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${value}%` }}
                    />
                  </div>

                  <div className="font-heading text-xs w-8 text-right text-ds-text2">
                    {value}
                  </div>
                </div>
              ))}

            </div>

            {/* ANALYSIS */}
            <div className="mt-5 text-xs text-ds-text2 leading-relaxed">
                <h1 className="font-heading text-xl">Analyse IA</h1>
                <p className="font-heading "> Profil très solide avec forte expérience commerciale MENA.</p>
             
            </div>

            {/* BUTTONS */}
            <button className="w-full mt-5 bg-indigo-400 hover:bg-indigo-300 text-sm py-2 rounded-lg flex items-center justify-center gap-2">
              <Phone size={14} />
              Planifier entretien
            </button>

            <button className="w-full mt-2 border border-ds-border dark:border-white/10 text-sm py-2 rounded-lg flex items-center justify-center gap-2 text-ds-text2 hover:bg-ds-bg3">
              <Download size={14} />
              Télécharger fiche
            </button>

          </div>
        </div>
      </div>
    </AppLayout>

  );
}