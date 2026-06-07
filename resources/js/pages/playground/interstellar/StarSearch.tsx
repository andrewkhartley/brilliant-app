import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from '@/hooks/useTranslation';

export interface InterstellarTarget {
    id: string;
    name: string;
    ra: number;
    dec: number;
    distanceLy: number;
    source: string;
    sourceId?: string;
}

interface StarSearchProps {
    onSelect: (target: InterstellarTarget) => void;
    selectedTarget: InterstellarTarget | null;
}

export function StarSearch({ onSelect, selectedTarget }: StarSearchProps) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<InterstellarTarget[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const searchTargets = useCallback((searchQuery: string) => {
        const trimmedQuery = searchQuery.trim();

        const controller = new AbortController();
        setIsLoading(true);
        setError(null);

        fetch(`/api/interstellar/stars?q=${encodeURIComponent(trimmedQuery)}`, {
            signal: controller.signal,
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Unable to search targets.');
                }

                return response.json() as Promise<{
                    data: InterstellarTarget[];
                }>;
            })
            .then((payload) => setResults(payload.data))
            .catch((searchError: unknown) => {
                if (
                    searchError instanceof DOMException &&
                    searchError.name === 'AbortError'
                ) {
                    return;
                }

                setError(t('interstellar.starSearch.error'));
            })
            .finally(() => setIsLoading(false));

        return controller;
    }, [t]);

    useEffect(() => {
        let controller: AbortController | null = null;
        const timeout = window.setTimeout(() => {
            controller = searchTargets(query);
        }, query.trim().length === 0 ? 0 : 250);

        return () => {
            window.clearTimeout(timeout);
            controller?.abort();
        };
    }, [query, searchTargets]);

    return (
        <div className="space-y-3 rounded-lg border border-cyan-100/15 bg-slate-950/72 p-4 backdrop-blur-md">
            <label
                htmlFor="interstellar-star-search"
                className="block text-sm font-semibold text-cyan-100"
            >
                {t('interstellar.starSearch.label')}
            </label>
            <div className="relative">
                <input
                    id="interstellar-star-search"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('interstellar.starSearch.placeholder')}
                    className="block w-full rounded border border-cyan-100/25 bg-slate-950/80 py-2 ps-10 pe-10 text-base text-white placeholder:text-cyan-50/38 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                />
                <i
                    aria-hidden="true"
                    className="fa-solid fa-magnifying-glass pointer-events-none absolute top-1/2 start-3 -translate-y-1/2 text-sm text-cyan-200/70"
                />
                {isLoading && (
                    <span
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 end-3 size-4 -translate-y-1/2 rounded-full border-2 border-cyan-100/24 border-t-cyan-100 motion-safe:animate-spin"
                    />
                )}
            </div>
            <p className="text-xs leading-5 text-cyan-100/58">
                {t('interstellar.starSearch.hint')}
            </p>

            {selectedTarget && (
                <div className="rounded border border-amber-200/24 bg-amber-200/10 p-3">
                    <p className="text-xs font-semibold tracking-[0.16em] text-amber-200/78 uppercase">
                        {t('interstellar.starSearch.selectedLabel')}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                        {selectedTarget.name}
                    </p>
                    <p className="mt-1 font-mono text-xs leading-5 text-amber-50/72">
                        {t('interstellar.starSearch.coordinateFormat', {
                            ra: selectedTarget.ra.toFixed(4),
                            dec: selectedTarget.dec.toFixed(4),
                            distance: formatLightYears(
                                selectedTarget.distanceLy,
                            ),
                        })}
                    </p>
                </div>
            )}

            {isLoading && (
                <p className="text-xs font-semibold text-cyan-100/70">
                    {t('interstellar.starSearch.loading')}
                </p>
            )}

            {error && (
                <p className="text-xs font-semibold text-rose-200">{error}</p>
            )}

            {results.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200/64 uppercase">
                        {query.trim().length === 0
                            ? t('interstellar.starSearch.suggestionsLabel')
                            : t('interstellar.starSearch.resultsLabel')}
                    </p>
                    <div className="interstellar-target-scrollbar max-h-56 space-y-1.5 overflow-y-auto pr-3">
                        {results.map((target) => (
                            <button
                                key={target.id}
                                type="button"
                                onClick={() => onSelect(target)}
                                className="block w-full cursor-pointer rounded border border-cyan-100/12 bg-cyan-50/5 px-3 py-2 text-left transition hover:border-cyan-200/38 hover:bg-cyan-50/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                            >
                                <span className="block text-sm font-semibold text-white">
                                    {target.name}
                                </span>
                                <span className="mt-0.5 block font-mono text-[0.7rem] leading-5 text-cyan-50/62">
                                    {t('interstellar.starSearch.resultFormat', {
                                        distance: formatLightYears(
                                            target.distanceLy,
                                        ),
                                        ra: target.ra.toFixed(3),
                                        dec: target.dec.toFixed(3),
                                    })}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && !error && query.trim().length > 0 && results.length === 0 && (
                <p className="rounded border border-cyan-100/12 bg-cyan-50/5 p-3 text-xs leading-5 text-cyan-50/66">
                    {t('interstellar.starSearch.empty')}
                </p>
            )}
        </div>
    );
}

function formatLightYears(distanceLy: number): string {
    return distanceLy.toLocaleString(undefined, {
        maximumFractionDigits: distanceLy >= 1000 ? 0 : 2,
    });
}
