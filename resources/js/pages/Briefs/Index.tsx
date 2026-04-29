

import { Link, router } from '@inertiajs/react';
import AppSidebarLayout from "@/layouts/app/app-sidebar-layout";
import { useState } from "react";
import DataTable from "@/components/data-table";
import { RankBadge } from "@/components/RankBadge";
import { TableActions } from "@/components/TableActions";
import { Badge } from "@/components/Badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";

dayjs.extend(relativeTime);
dayjs.locale("fr");

type Brief = {
  id: number;
  title: string;
  sector: string;
  contract_type: string;
  education_level: string;
  gender_pref: string;
  status: string;
  created_at: string;
  created_by?: string;
};

type Props = {
  briefs: {
    data: Brief[];
  };
  filters: any;
};

export default function Index({ briefs }: Props) {
  const [search, setSearch] = useState('');

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this brief?')) {
      router.delete(route('briefs.destroy', id));
    }
  };

  return (
    <AppSidebarLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0f1117] px-6 py-10 transition-colors duration-300">

        {/* Page Header */}
{/* HEADER */}
<div className="mb-10">

  {/* TOP BAR */}
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

    {/* TITLE */}
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-2">
        Recruitment / Briefs
      </p>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        Brief Management
      </h1>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Manage and track all your recruitment briefs efficiently.
      </p>
    </div>

    {/* ACTION BUTTON */}
    <Link
      href={route('briefs.create')}
      className="
        inline-flex items-center gap-2
        bg-emerald-800 hover:bg-emerald-700
        text-white text-sm font-semibold
        px-5 py-2.5 rounded-xl
        shadow-lg shadow-emerald-600/20
        hover:shadow-emerald-600/30
        transition-all duration-200
      "
    >
      <span className="text-lg leading-none">＋</span>
      Create Brief
    </Link>

  </div>

  {/* SEARCH + FILTER BAR */}
  <div className="
    mt-6 flex flex-col lg:flex-row lg:items-center gap-3
    bg-white dark:bg-[#17171F]
    border border-gray-200 dark:border-gray-700/50
    rounded-2xl p-3 shadow-sm
  ">

    {/* SEARCH INPUT */}
    <div className="relative flex-1">


      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" &&
          router.get(route("briefs.index"), { search }, { preserveState: true })
        }
        placeholder="Search briefs by title..."
        className="
          w-full pl-9 pr-4 py-2.5
          rounded-xl
          bg-gray-50 dark:bg-[#0f1117]
          border border-gray-200 dark:border-gray-700
          text-gray-800 dark:text-gray-100 text-sm
          placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500
          transition
        "
      />
    </div>

    {/* BUTTONS */}
    <div className="flex items-center gap-2">

      {/* SEARCH */}
      <button
        onClick={() =>
          router.get(route("briefs.index"), { search }, { preserveState: true })
        }
        className="
          px-4 py-2.5 rounded-xl text-sm font-medium
          bg-indigo-600 hover:bg-indigo-700
          text-white
          transition-all duration-200
          shadow-sm hover:shadow-md
        "
      >
        Search
      </button>

      {/* RESET */}
      <button
        onClick={() => router.get(route("briefs.index"))}
        className="
          px-4 py-2.5 rounded-xl text-sm font-medium
          bg-gray-100 hover:bg-gray-200
          dark:bg-[#1E1E28] dark:hover:bg-[#2a2a35]
          text-gray-600 dark:text-gray-300
          border border-gray-200 dark:border-gray-700
          transition
        "
      >
        Reset
      </button>

    </div>

  </div>
</div>

        {/* Table Card */}
           <DataTable
  data={briefs.data}
  columns={[

    {
      header: "#",
      headerClassName: "text-center",
      cellClassName: "flex justify-center items-center",
      render: (_, index) => <RankBadge index={index} />,
    },

    {
      header: "Title",
      render: (b) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white">
            {b.title}
          </span>
        </div>
      ),
    },

    {
      header: "Sector",
      render: (b) => <Badge color="blue">{b.sector}</Badge>,
    },

    {
      header: "Contract",
      render: (b) => <Badge color="violet">{b.contract_type}</Badge>,
    },

    {
      header: "Gender Pref",
      render: (b) => (
        <span
          className={`font-semibold ${
            b.gender_pref === "M"
              ? "text-blue-600 dark:text-blue-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {b.gender_pref === "M"
            ? "Homme"
            : b.gender_pref === "F"
            ? "Femme"
            : b.gender_pref}
        </span>
      ),
    },

    {
      header: "Education Level",
      render: (b) => (
        <span className="text-gray-500 dark:text-gray-400">
          {b.education_level}
        </span>
      ),
    },
    {
      header: "Created At",
      render: (b) => (
        <span className="text-green-600 dark:text-green-400">
          {dayjs(b.created_at).fromNow()}
        </span>
      ),
    },

    {
      header: "Actions",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (b) => (
        <TableActions>

          <Link href={route('briefs.show', b.id)} className="hover:text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>

          </Link>

          <Link href={route('briefs.edit', b.id)} className="hover:text-amber-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
            </svg>

          </Link>

          <button onClick={() => handleDelete(b.id)} className="hover:text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>

          </button>

        </TableActions>
      ),
    },

  ]}
/>
      </div>
    </AppSidebarLayout>
  );
}