import axios from 'axios';
import { ChevronDown, ChevronUp, FileText, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface Props {
    interviewId: number;
    open: boolean;
    onClose: () => void;
}

export default function TranscriptSearchModal({ interviewId, open, onClose }: Props) {
    const [loading, setLoading] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [search, setSearch] = useState('');
    const [currentMatch, setCurrentMatch] = useState(0);

    const matchRefs = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        if (!open) return;

        setLoading(true);

        axios
            .get(`/dashboard/interviews/${interviewId}/transcription/search`)
            .then((res) => {
                setTranscript(res.data.transcript ?? '');
            })
            .finally(() => setLoading(false));
    }, [open, interviewId]);

    const matchesCount = useMemo(() => {
        if (!search.trim()) return 0;

        const regex = new RegExp(search, 'gi');

        return [...transcript.matchAll(regex)].length;
    }, [search, transcript]);

    useEffect(() => {
        if (!search || matchesCount === 0) return;

        const element = matchRefs.current[currentMatch];

        element?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
    }, [currentMatch, matchesCount, search]);

    const renderHighlightedText = () => {
        if (!search.trim()) {
            return transcript;
        }

        const regex = new RegExp(`(${search})`, 'gi');

        let matchIndex = -1;

        return transcript.split(regex).map((part, index) => {
            if (part.toLowerCase() === search.toLowerCase()) {
                matchIndex++;

                const isActive = matchIndex === currentMatch;

                return (
                    <span
                        key={index}
                        ref={(el) => {
                            matchRefs.current[matchIndex] = el;
                        }}
                        className={isActive ? 'rounded bg-orange-400 px-1 text-black' : 'rounded bg-yellow-300 px-1'}
                    >
                        {part}
                    </span>
                );
            }

            return part;
        });
    };

    const nextMatch = () => {
        if (matchesCount === 0) return;

        setCurrentMatch((prev) => (prev === matchesCount - 1 ? 0 : prev + 1));
    };

    const previousMatch = () => {
        if (matchesCount === 0) return;

        setCurrentMatch((prev) => (prev === 0 ? matchesCount - 1 : prev - 1));
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-ds-surface border-ds-border flex h-[80vh] w-[900px] flex-col rounded-xl border">
                {/* Header */}
                <div className="border-ds-border flex items-center justify-between border-b px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-ds-accent/10 flex h-10 w-10 items-center justify-center rounded-lg">
                            <FileText size={20} className="text-ds-accent" />
                        </div>

                        <div>
                            <h2 className="text-ds-text text-[16px] font-semibold">Recherche dans la transcription</h2>

                            <p className="text-ds-text3 text-xs">Rechercher un mot-clé dans l'entretien</p>
                        </div>
                    </div>

                    <button onClick={onClose} className="text-ds-text3 hover:bg-ds-bg3 rounded-lg p-2 transition">
                        <X size={18} />
                    </button>
                </div>

                {/* Search */}

                <div className="border-ds-border flex items-center gap-3 border-b p-4">
                    <div className="relative flex-1">
                        <Search size={16} className="text-ds-text3 absolute top-1/2 left-3 -translate-y-1/2" />

                        <input
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentMatch(0);
                            }}
                            placeholder="Rechercher un mot-clé..."
                            className="border-ds-border bg-ds-bg3 text-ds-text focus:border-ds-accent focus:ring-ds-accent/20 w-full rounded-xl border py-2.5 pr-3 pl-10 text-[13px] outline-none focus:ring-2"
                        />
                    </div>
                    {search && (
                        <div>
                            <div className="text-ds-text2 min-w-[70px] text-center text-sm font-medium">
                                {matchesCount > 0 ? `${currentMatch + 1}/${matchesCount}` : '0'}
                            </div>
                            {matchesCount > 0 && (
                                <div>
                                    <button
                                        onClick={previousMatch}
                                        disabled={matchesCount === 0}
                                        className="border-ds-border hover:bg-ds-bg3 rounded-lg border p-2 transition disabled:opacity-40"
                                    >
                                        <ChevronUp size={16} />
                                    </button>

                                    <button
                                        onClick={nextMatch}
                                        disabled={matchesCount === 0}
                                        className="border-ds-border hover:bg-ds-bg3 rounded-lg border p-2 transition disabled:opacity-40"
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}

                <div className="overflow-y-auto p-6">
                    {loading ? (
                        <div className="space-y-3">
                            <div className="bg-ds-surface2 h-4 w-full animate-pulse rounded" />
                            <div className="bg-ds-surface2 h-4 w-11/12 animate-pulse rounded" />
                            <div className="bg-ds-surface2 h-4 w-9/12 animate-pulse rounded" />
                        </div>
                    ) : (
                        <div className="text-ds-text text-sm leading-7 whitespace-pre-wrap">{renderHighlightedText()}</div>
                    )}
                </div>
            </div>
        </div>
    );
}
