import CandidateTable from '@/components/Candidats/CandidatsTable';
import AppLayout from '@/layouts/app-layout';
import { Candidat } from '@/types/candidat';
import { Head, router } from '@inertiajs/react';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Briefcase, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Select from 'react-select';

dayjs.extend(relativeTime);
dayjs.locale('fr');

interface Brief {
    id: number;
    title: string;
}

interface Props {
    briefs: Brief[];
    filters: {
        brief_id?: number;
    };
}

type StreamStatus = 'idle' | 'starting' | 'running' | 'polling' | 'importing' | 'done' | 'error';

const statusLabel: Record<StreamStatus, string> = {
    idle: '',
    starting: 'Démarrage du sourcing…',
    running: 'Recherche en cours sur LinkedIn…',
    polling: 'Attente des résultats Apify…',
    importing: 'Import et scoring des candidats…',
    done: '',
    error: '',
};

/* ---------------- PAGE ---------------- */

export default function Index({ briefs, filters }: Props) {
    const [briefId, setBriefId] = useState<number | ''>(filters.brief_id ?? '');
    const [candidates, setCandidates] = useState<Candidat[]>([]);
    const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const esRef = useRef<EventSource | null>(null);
    const doneRef = useRef(false); // guards onerror from firing after a clean done

    const briefOptions = briefs.map((b) => ({ value: b.id, label: b.title }));
    const selectedOption = briefOptions.find((o) => o.value === briefId) ?? null;
    const isStreaming = streamStatus !== 'idle' && streamStatus !== 'done' && streamStatus !== 'error';

    function openStream(id: number) {
        // Close any existing stream
        if (esRef.current) {
            esRef.current.close();
            esRef.current = null;
        }

        doneRef.current = false;
        setCandidates([]);
        setErrorMsg(null);
        setStreamStatus('starting');

        const url = route('dashboard.sourcing.stream') + '?brief_id=' + id;
        const es = new EventSource(url);
        esRef.current = es;

        es.addEventListener('status', (e) => {
            const { message } = JSON.parse(e.data) as { message: string };
            if (message === 'cached') {
                // DB results — no loading label needed, just let candidates flow in
                setStreamStatus('importing');
            } else if (message === 'starting') {
                setStreamStatus('starting');
            } else if (message === 'running') {
                setStreamStatus('running');
            } else if (message === 'polling') {
                setStreamStatus('polling');
            } else if (message === 'importing') {
                setStreamStatus('importing');
            }
        });

        es.addEventListener('candidate', (e) => {
            const candidate = JSON.parse(e.data) as Candidat;
            setCandidates((prev) => [...prev, candidate]);
        });

        es.addEventListener('error', (e) => {
            if ((e as MessageEvent).data) {
                const { message } = JSON.parse((e as MessageEvent).data) as { message: string };
                setErrorMsg(message);
            }
            setStreamStatus('error');
            es.close();
            esRef.current = null;
        });

        es.addEventListener('done', () => {
            doneRef.current = true;
            setStreamStatus('done');
            es.close();
            esRef.current = null;
        });

        // Native onerror fires on connection drop or reconnect after server closes
        es.onerror = () => {
            if (!doneRef.current) {
                setStreamStatus('error');
                setErrorMsg('La connexion au serveur a été interrompue.');
            }
            es.close();
            esRef.current = null;
        };
    }

    function handleSelect(id: number | '') {
        setBriefId(id);
        router.get(route('dashboard.sourcing.index'), id ? { brief_id: id } : {}, {
            preserveState: true,
            replace: true,
        });

        if (id) {
            openStream(id);
        } else {
            if (esRef.current) {
                esRef.current.close();
                esRef.current = null;
            }
            setCandidates([]);
            setStreamStatus('idle');
            setErrorMsg(null);
        }
    }

    // Auto-start stream if brief_id comes from URL on initial load
    useEffect(() => {
        if (filters.brief_id) {
            setBriefId(filters.brief_id);
            openStream(filters.brief_id);
        }
        return () => {
            esRef.current?.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Head title="Sourcing" />

            <AppLayout>
                <div className="bg-ds-bg min-h-full px-4 py-6 sm:px-6 sm:py-8">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="font-heading text-ds-text text-[24px] font-bold sm:text-[26px]">Sourcing</h1>
                        <p className="text-ds-text2 mt-1 text-[13px] sm:text-[14px]">Sélectionnez un brief pour lancer le sourcing automatique</p>
                    </div>

                    {/* Brief selector */}
                    <div className="mb-6 max-w-md">
                        <label className="text-ds-text3 mb-1.5 block text-[12px] font-semibold tracking-[0.8px] uppercase">
                            Brief de recrutement
                        </label>
                        <Select
                            classNamePrefix="rs"
                            options={briefOptions}
                            value={selectedOption}
                            onChange={(opt) => handleSelect(opt ? opt.value : '')}
                            placeholder="Choisir un brief…"
                            isClearable
                            isDisabled={isStreaming}
                            noOptionsMessage={() => 'Aucun brief disponible'}
                        />
                    </div>

                    {/* No brief selected */}
                    {!briefId && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border px-4 py-16 text-center sm:py-24">
                            <div className="bg-ds-accent/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl">
                                <Briefcase className="text-ds-accent" size={24} />
                            </div>
                            <p className="font-heading text-ds-text text-[15px] font-semibold">Aucun brief sélectionné</p>
                            <p className="text-ds-text2 mt-1 text-[13px]">Choisissez un brief pour lancer le sourcing</p>
                        </div>
                    )}

                    {/* Loader */}
                    {briefId && isStreaming && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center gap-4 rounded-xl border px-4 py-16 text-center sm:py-24">
                            <Loader2 className="text-ds-accent animate-spin" size={32} />
                            <p className="text-ds-text2 text-[13px]">{statusLabel[streamStatus]}</p>
                        </div>
                    )}

                    {/* Error */}
                    {streamStatus === 'error' && errorMsg && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-[13px] text-red-700">{errorMsg}</div>
                    )}

                    {/* Candidates streaming in or done with no results */}
                    {briefId && !isStreaming && streamStatus !== 'idle' && candidates.length === 0 && !errorMsg && (
                        <div className="border-ds-border bg-ds-surface flex flex-col items-center justify-center rounded-xl border py-16 text-center">
                            <p className="text-ds-text2 text-[13px]">Aucun candidat trouvé pour ce brief</p>
                        </div>
                    )}

                    {/* Table — appears as candidates stream in */}
                    {candidates.length > 0 && (
                        <div className="border-ds-border bg-ds-surface overflow-hidden rounded-xl border">
                            <div className="overflow-x-auto">
                                <CandidateTable data={candidates} onDelete={() => {}} />
                            </div>
                        </div>
                    )}
                </div>
            </AppLayout>
        </>
    );
}
