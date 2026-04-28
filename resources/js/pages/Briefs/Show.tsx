import { Link } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";

type Props = {
  brief: any;
};

export default function ShowBrief({ brief }: Props) {

  const cardClass =
    "bg-white dark:bg-[#111118] p-5 rounded-xl border border-gray-200 dark:border-white/10";

  const labelClass =
    "text-xs text-gray-500 dark:text-gray-400 mb-1";

  const valueClass =
    "text-sm font-medium text-gray-900 dark:text-white";

  return (
    <AppSidebarLayout>

      <div className="p-8 min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs text-gray-500">Sourcing › Détails brief</p>
            <h1 className="text-2xl text-secondary font-bold">{brief.title}</h1>
          </div>

          {/* BACK BUTTON */}
          <Link
            href={route("briefs.index")}
            className="bg-secondary  text-white px-4 py-2 rounded-lg"
          >
            ← Retour
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-6">

          {/* LEFT */}
          <div className="space-y-4">

            {/* INFO */}
            <div className={cardClass}>
              <h2 className="font-semibold mb-4">Informations du poste</h2>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className={labelClass}>Titre</p>
                  <p className={valueClass}>{brief.title}</p>
                </div>

                <div>
                  <p className={labelClass}>Secteur</p>
                  <p className={valueClass}>{brief.sector}</p>
                </div>

                <div>
                  <p className={labelClass}>Type de contrat</p>
                  <p className={valueClass}>{brief.contract_type}</p>
                </div>

                <div>
                  <p className={labelClass}>Localisation</p>
                  <p className={valueClass}>{brief.location}</p>
                </div>

                <div>
                  <p className={labelClass}>Salaire</p>
                  <p className={valueClass}>{brief.salary_range}</p>
                </div>

                <div>
                  <p className={labelClass}>Statut</p>
                  <span className="px-2 py-1 rounded bg-indigo-100 text-indigo-600 text-xs">
                    {brief.status}
                  </span>
                </div>

              </div>
            </div>

            {/* CRITERES */}
            <div className={cardClass}>
              <h2 className="font-semibold mb-4">Critères candidat</h2>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <p className={labelClass}>Expérience</p>
                  <p className={valueClass}>{brief.min_experience_years} ans</p>
                </div>

                <div>
                  <p className={labelClass}>Niveau d'étude</p>
                  <p className={valueClass}>{brief.education_level}</p>
                </div>

                <div>
                  <p className={labelClass}>Age</p>
                  <p className={valueClass}>{brief.age_range}</p>
                </div>

                <div>
                  <p className={labelClass}>Genre</p>
                  <p className={valueClass}>{brief.gender_pref}</p>
                </div>

              </div>

              <div className="mt-4">
                <p className={labelClass}>Compétences</p>
                <p className={valueClass}>{brief.required_skills}</p>
              </div>

            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-4">

            {/* DESCRIPTION */}
            <div className={cardClass}>
              <h2 className="font-semibold mb-3">Description</h2>

              <p className="text-sm text-gray-700 dark:text-gray-300">
                {brief.mission_description || "—"}
              </p>

              <div className="mt-4">
                <p className={labelClass}>Soft skills</p>
                <p className={valueClass}>{brief.soft_skills}</p>
              </div>
            </div>

            {/* SCORING */}
            <div className={cardClass}>
              <h2 className="font-semibold mb-3">Scoring IA</h2>

              {brief.scoring_weights &&
                Object.entries(brief.scoring_weights).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm mb-2">
                    <span className="capitalize text-gray-500">{key}</span>
                    <span className="font-medium">{value}%</span>
                  </div>
                ))}
            </div>

            {/* META */}
            <div className={cardClass}>
              <h2 className="font-semibold mb-3">Informations système</h2>

              <div className="text-sm space-y-2">
                <p>
                  <span className="text-gray-500">Créé par :</span>{" "}
                  {brief.created_by || "—"}
                </p>
                <p>
                  <span className="text-gray-500">Date :</span>{" "}
                  {brief.created_at}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </AppSidebarLayout>
  );
}