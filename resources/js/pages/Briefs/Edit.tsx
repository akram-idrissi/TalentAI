import { useForm } from "@inertiajs/react";
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import Select from "@/components/Select";

type Props = {
  brief: any;
};

export default function EditBrief({ brief }: Props) {

  const { data, setData, put, processing, errors } = useForm({
    title: brief.title || "",
    sector: brief.sector || "",
    contract_type: brief.contract_type || "",
    location: brief.location || "",
    salary_range: brief.salary_range || "",
    min_experience_years: brief.min_experience_years || "",
    education_level: brief.education_level || "",
    gender_pref: brief.gender_pref || "",
    age_range: brief.age_range || "",
    mission_description: brief.mission_description || "",
    required_skills: brief.required_skills || "",
    soft_skills: brief.soft_skills || "",
    scoring_weights: brief.scoring_weights || {
      experience: 0,
      education: 0,
      sector: 0,
      soft_skills: 0,
      location: 0,
    },
    status: brief.status || "draft",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    put(route("briefs.update", brief.id));
  }

  const inputClass =
    "w-full bg-gray-100 dark:bg-[#17171F] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-gray-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

  const cardClass =
    "bg-white dark:bg-[#111118] p-4 rounded-xl border border-gray-200 dark:border-white/10";

  return (
    <AppSidebarLayout>

      <div className="p-8 min-h-screen bg-gray-50 dark:bg-[#0A0A0F] text-gray-900 dark:text-white">

        {/* HEADER */}
        <div className="mb-6">
          <p className="text-gray-500 text-xs">Sourcing › Modifier brief</p>
          <h1 className="text-2xl font-bold text-secondary">Modifier un brief</h1>
        </div>

        <form onSubmit={submit} className="grid grid-cols-2 gap-6">

          {/* LEFT */}
          <div className="space-y-4">

            {/* INFO */}
            <div className={cardClass}>
              <h2 className="mb-3 font-semibold">Informations du poste</h2>

              <input
                className={inputClass}
                placeholder="Titre"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
              />
              {errors.title && <p className="text-red-500 text-xs">{errors.title}</p>}

              <div className="grid grid-cols-2 gap-3 mt-3">

                <input
                  className={inputClass}
                  placeholder="Secteur"
                  value={data.sector}
                  onChange={(e) => setData("sector", e.target.value)}
                />
                {errors.sector && <p className="text-red-500 text-xs">{errors.sector}</p>}

                <Select
                  value={data.contract_type}
                  onChange={(value: string) => setData("contract_type", value)}
                  placeholder="Type de contrat"
                  options={[
                    { value: "CDI", label: "CDI" },
                    { value: "CDD", label: "CDD" },
                    { value: "Freelance", label: "Freelance" },
                    { value: "Stage", label: "Stage" },
                  ]}
                />
                {errors.contract_type && <p className="text-red-500 text-xs">{errors.contract_type}</p>}

                <input
                  className={inputClass}
                  placeholder="Localisation"
                  value={data.location}
                  onChange={(e) => setData("location", e.target.value)}
                />
                {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}

                <input
                  className={inputClass}
                  placeholder="Salaire"
                  value={data.salary_range}
                  onChange={(e) => setData("salary_range", e.target.value)}
                />
                {errors.salary_range && <p className="text-red-500 text-xs">{errors.salary_range}</p>}
              </div>
            </div>

            {/* CRITERES */}
            <div className={cardClass}>
              <h2 className="mb-3 font-semibold">Critères candidat</h2>

              <input
                className={inputClass}
                placeholder="Expérience"
                value={data.min_experience_years}
                onChange={(e) => setData("min_experience_years", e.target.value)}
              />
              {errors.min_experience_years && <p className="text-red-500 text-xs">{errors.min_experience_years}</p>}

              <input
                className={`${inputClass} mt-3`}
                placeholder="Niveau d'étude"
                value={data.education_level}
                onChange={(e) => setData("education_level", e.target.value)}
              />

              <input
                className={`${inputClass} mt-3`}
                placeholder="Skills"
                value={data.required_skills}
                onChange={(e) => setData("required_skills", e.target.value)}
              />

              <input
                className={`${inputClass} mt-3`}
                placeholder="Age"
                value={data.age_range}
                onChange={(e) => setData("age_range", e.target.value)}
              />

              <div className="mt-3">
                <Select
                  value={data.gender_pref}
                  onChange={(v: string) => setData("gender_pref", v)}
                  placeholder="Gender"
                  options={[
                    { value: "M", label: "Homme" },
                    { value: "F", label: "Femme" },
                  ]}
                />
              </div>
            </div>

          </div>

          {/* RIGHT */}
          <div className="space-y-4">

            {/* DESCRIPTION */}
            <div className={cardClass}>
              <h2 className="mb-3 font-semibold">Description</h2>

              <textarea
                className={inputClass + " min-h-[100px]"}
                value={data.mission_description}
                onChange={(e) => setData("mission_description", e.target.value)}
              />

              <textarea
                className={inputClass + " mt-3"}
                value={data.soft_skills}
                onChange={(e) => setData("soft_skills", e.target.value)}
              />
            </div>

            {/* SCORING */}
            <div className={cardClass}>
              <h2 className="mb-3 font-semibold">Scoring</h2>

              {Object.keys(data.scoring_weights).map((key) => (
                <input
                  key={key}
                  type="number"
                  className={`${inputClass} mb-2`}
                  value={data.scoring_weights[key]}
                  onChange={(e) =>
                    setData("scoring_weights", {
                      ...data.scoring_weights,
                      [key]: Number(e.target.value),
                    })
                  }
                />
              ))}
            </div>

            {/* ACTION */}
            <button
              type="submit"
              disabled={processing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 py-2 rounded-lg text-white font-semibold"
            >
              {processing ? "Updating..." : "Update Brief"}
            </button>

          </div>

        </form>
      </div>

    </AppSidebarLayout>
  );
}