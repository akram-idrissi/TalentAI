import { usePermission } from '@/hooks/usePermission';
import { router } from '@inertiajs/react';
import StatusBadge, { type BriefStatus } from './StatusBadge';
interface Brief {
    id: number;
    title: string;
    location: string;
    contractType: string;
    candidatesCount: number;
    status: BriefStatus;
}

export default function ActiveBriefsTable({ briefs }: { briefs: Brief[] }) {
    const { can, isSuperAdmin } = usePermission();
    const canCreateBriefs = isSuperAdmin() || can('briefs.create');
    return (
        <div className="border-ds-border bg-dash-card flex flex-col rounded-xl border p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
                <h2 className="font-heading text-ds-text text-[15px] font-semibold">Briefs actifs</h2>
                {canCreateBriefs && (
                    <button
                        onClick={() => router.visit(route('dashboard.briefs.create'))}
                        className="bg-ds-accent inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-medium text-white transition-all duration-150 hover:-translate-y-px hover:bg-[#7C74FF]"
                    >
                        + Nouveau
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-ds-border border-b">
                            <th className="text-ds-text3 pb-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase">Poste</th>
                            <th className="text-ds-text3 pb-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase">Candidats</th>
                            <th className="text-ds-text3 pb-3 text-left text-[10px] font-semibold tracking-[0.8px] uppercase">Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {briefs.map((brief) => (
                            <tr
                                key={brief.id}
                                className="border-ds-border hover:bg-ds-bg3/40 cursor-pointer border-b transition-colors last:border-0"
                                onClick={() => router.visit(route('dashboard.briefs.show', brief.id))}
                            >
                                <td className="py-3.5 pr-4">
                                    <p className="text-ds-text font-medium">{brief.title}</p>
                                    <p className="text-ds-text2 mt-0.5 text-[12px]">
                                        {brief.location} · {brief.contractType}
                                    </p>
                                </td>
                                <td className="text-ds-text py-3.5 pr-4 text-[13px]">{brief.candidatesCount}</td>
                                <td className="py-3.5">
                                    <StatusBadge status={brief.status} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
