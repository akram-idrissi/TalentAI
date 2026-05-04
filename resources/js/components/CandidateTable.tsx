import React from "react";

type Candidate = {
  id: number;
  rank?: number;
  name: string;
  city: string;
  source: "LinkedIn" | "Indeed" | string;
  position: string;
  experience: number;
  score: number;
  status?: "invited" | "rejected" | "pending";
};

type Props = {
  candidates: Candidate[];
  onInvite?: (candidate: Candidate) => void;
};

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-emerald-400";
  if (score >= 80) return "text-cyan-400";
  if (score >= 70) return "text-amber-400";
  return "text-red-400";
};

const getRankStyle = (rank?: number) => {
  switch (rank) {
    case 1:
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case 2:
      return "bg-slate-400/20 text-slate-300 border-slate-400/30";
    case 3:
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default:
      return "bg-zinc-800 text-zinc-400 border-zinc-700";
  }
};

export default function CandidateTable({ candidates, onInvite }: Props) {
  return (
    <div className="bg-[#1E1E28] border border-white/10 rounded-xl p-5">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-white">
          Profils sourcés & filtrés par IA
        </h2>

        <span className="text-xs text-zinc-400">
          {candidates.filter(c => c.score >= 70).length} retenus /{" "}
          {candidates.length} analysés
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-zinc-500 border-b border-white/10">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Candidat</th>
              <th className="p-3 text-left">Source</th>
              <th className="p-3 text-left">Poste</th>
              <th className="p-3 text-left">Exp</th>
              <th className="p-3 text-left">Score IA</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {candidates.map((c, index) => (
              <tr
                key={c.id}
                className="border-b border-white/5 hover:bg-white/5 transition"
              >
                {/* Rank */}
                <td className="p-3">
                  <div
                    className={`w-6 h-6 flex items-center justify-center rounded-md text-xs border ${getRankStyle(
                      c.rank ?? index + 1
                    )}`}
                  >
                    {c.rank ?? index + 1}
                  </div>
                </td>

                {/* Name */}
                <td className="p-3">
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-xs text-zinc-500">{c.city}</div>
                </td>

                {/* Source */}
                <td className="p-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      c.source === "LinkedIn"
                        ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                        : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                    }`}
                  >
                    {c.source}
                  </span>
                </td>

                {/* Position */}
                <td className="p-3 text-zinc-300 text-xs">
                  {c.position}
                </td>

                {/* Experience */}
                <td className="p-3 text-zinc-300">
                  {c.experience} ans
                </td>

                {/* Score */}
                <td className="p-3">
                  <span
                    className={`font-bold ${getScoreColor(c.score)}`}
                  >
                    {c.score}
                  </span>
                </td>

                {/* Action */}
                <td className="p-3">
                  {c.score < 50 || c.status === "rejected" ? (
                    <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                      Écarté
                    </span>
                  ) : (
                    <button
                      onClick={() => onInvite?.(c)}
                      className="px-3 py-1 text-xs rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                    >
                      Inviter
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}