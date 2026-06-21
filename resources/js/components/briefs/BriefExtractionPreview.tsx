import { useI18n } from '@/hooks/useI18n';
import type { BriefFormData } from '@/types/brief';
import { AlertCircle, Check, X } from 'lucide-react';

interface Props {
    extracted: Partial<BriefFormData> & { _confidence?: Record<string, 'high' | 'low'> };
    onConfirm: (data: Partial<BriefFormData> & { _confidence?: Record<string, 'high' | 'low'> }) => void;
    onDiscard: () => void;
}

export default function BriefExtractionPreview({ extracted, onConfirm, onDiscard }: Props) {
    const { t } = useI18n();
    const FIELD_LABELS: Partial<Record<keyof BriefFormData, string>> = {
        title: t('briefs.extraction_preview.fields.title'),
        sector: t('briefs.extraction_preview.fields.sector'),
        contract_type: t('briefs.extraction_preview.fields.contract_type'),
        location: t('briefs.extraction_preview.fields.location'),
        salary_range: t('briefs.extraction_preview.fields.salary_range'),
        min_experience_years: t('briefs.extraction_preview.fields.min_experience_years'),
        education_level: t('briefs.extraction_preview.fields.education_level'),
        seniority_level: t('briefs.extraction_preview.fields.seniority_level'),
        languages: t('briefs.extraction_preview.fields.languages'),
        gender_pref: t('briefs.extraction_preview.fields.gender_pref'),
        age_range: t('briefs.extraction_preview.fields.age_range'),
        target_companies: t('briefs.extraction_preview.fields.target_companies'),
        mission_description: t('briefs.extraction_preview.fields.mission_description'),
        required_skills: t('briefs.extraction_preview.fields.required_skills'),
        soft_skills: t('briefs.extraction_preview.fields.soft_skills'),
    };
    const filled = Object.entries(FIELD_LABELS).filter(([k]) => extracted[k as keyof BriefFormData]);
    const missing = Object.entries(FIELD_LABELS).filter(([k]) => !extracted[k as keyof BriefFormData]);

    const detectedLabel =
        filled.length > 1
            ? t('briefs.extraction_preview.detected_plural').replace('{count}', String(filled.length))
            : t('briefs.extraction_preview.detected').replace('{count}', String(filled.length));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div
                className="bg-ds-surface border-ds-border relative flex w-full max-w-lg flex-col rounded-2xl border shadow-xl"
                style={{ maxHeight: '85vh' }}
            >
                <div className="border-ds-border flex items-start justify-between border-b p-5">
                    <div>
                        <h2 className="font-heading text-ds-text text-[17px] font-bold">{t('briefs.extraction_preview.title')}</h2>
                        <p className="text-ds-text3 mt-0.5 text-[12px]">{detectedLabel}</p>
                    </div>
                    <button onClick={onDiscard} className="text-ds-text3 hover:text-ds-text transition">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto p-5">
                    {filled.map(([key, label]) => {
                        const val = extracted[key as keyof BriefFormData];
                        const confRaw = extracted._confidence?.[key];
                        const conf = confRaw === 'low' ? 'low' : confRaw === 'high' ? 'high' : undefined;
                        const display = typeof val === 'object' ? JSON.stringify(val) : String(val);
                        const truncated = display.length > 120 ? display.slice(0, 120) + '…' : display;
                        return (
                            <div key={key} className="border-ds-border flex items-start gap-3 rounded-lg border p-3">
                                <Check size={14} className="text-ds-accent mt-0.5 shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-ds-text3 text-[11px]">{label}</p>
                                        {conf === 'low' && (
                                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700">
                                                {t('briefs.extraction_preview.to_verify')}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-ds-text2 mt-0.5 text-[13px] break-words">{truncated}</p>
                                </div>
                            </div>
                        );
                    })}

                    {missing.length > 0 && (
                        <div className="border-ds-border mt-3 rounded-lg border p-3">
                            <div className="mb-2 flex items-center gap-2">
                                <AlertCircle size={14} className="text-ds-text3 shrink-0" />
                                <p className="text-ds-text3 text-[11px]">{t('briefs.extraction_preview.not_detected')}</p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {missing.map(([, label]) => (
                                    <span key={label} className="bg-ds-bg3 text-ds-text3 rounded-full px-2 py-0.5 text-[11px]">
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-ds-border flex gap-3 border-t p-4">
                    <button
                        onClick={onDiscard}
                        className="border-ds-border text-ds-text2 hover:bg-ds-bg3 flex-1 rounded-lg border py-2 text-[13px] transition"
                    >
                        {t('briefs.extraction_preview.discard')}
                    </button>
                    <button
                        onClick={() => onConfirm(extracted)}
                        className="bg-ds-accent flex-1 rounded-lg py-2 text-[13px] font-semibold text-white transition hover:bg-[#7C74FF]"
                    >
                        {t('briefs.extraction_preview.confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
}
