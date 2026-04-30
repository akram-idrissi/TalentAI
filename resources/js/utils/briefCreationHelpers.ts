import type { ScoringWeights } from '@/types/brief';

export function calculateWeightTotal(weights: ScoringWeights): number {
    return Object.values(weights).reduce((a, b) => a + b, 0);
}

export function getWeightColor(total: number): string {
    if (total === 100) return 'text-green-500';
    if (total > 100) return 'text-red-500';
    return 'text-yellow-500';
}
