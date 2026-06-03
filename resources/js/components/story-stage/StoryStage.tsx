import { useEffect, useMemo, useState } from 'react';

import type {
    StoryStageChoice,
    StoryStageChoiceKind,
    StoryStageLabels,
    StoryStageProps,
    StoryStageScene,
    StoryStageSprite,
    StoryStageSpritePresence,
    StoryStageSpritePosition,
} from './types';

const DEFAULT_SPRITE_DURATION_MS = 900;
const DEFAULT_SCENE_TRANSITION_MS = 360;
const TEXT_REVEAL_INTERVAL_MS = 22;
const TEXT_FAST_FILL_MS = 250;
const CHOICE_OTHERS_FADE_MS = 250;
const CHOICE_SELECTED_HOLD_MS = 150;
const CHOICE_SELECTED_FADE_MS = 200;
const CHOICE_SELECT_DELAY_MS =
    CHOICE_OTHERS_FADE_MS + CHOICE_SELECTED_HOLD_MS + CHOICE_SELECTED_FADE_MS;

interface StoryStageBacklogEntry {
    dialogue: string;
    id: string;
    sceneId: string;
    speaker?: string;
    type: 'line' | 'choice';
}

interface StoryStageResumeState {
    history: string[];
    sceneId: string;
}

export function StoryStage({
    active,
    initialSceneId,
    reducedMotion,
    scenes,
    ...props
}: StoryStageProps) {
    const prefersReducedMotion = usePrefersReducedMotion();
    const shouldReduceMotion = reducedMotion ?? prefersReducedMotion;

    if (!active) {
        return null;
    }

    return (
        <StoryStagePlayer
            key={initialSceneId ?? scenes[0]?.id}
            initialSceneId={initialSceneId}
            reducedMotion={shouldReduceMotion}
            scenes={scenes}
            {...props}
        />
    );
}

function StoryStagePlayer({
    children,
    initialSceneId,
    labels,
    onClose,
    onSceneChange,
    reducedMotion,
    resumeKey,
    scenes,
}: Omit<StoryStageProps, 'active' | 'reducedMotion'> & {
    reducedMotion: boolean;
}) {
    const firstSceneId = initialSceneId ?? scenes[0]?.id;
    const initialResumeState = readResumeState(resumeKey, firstSceneId, scenes);
    const [sceneId, setSceneId] = useState(initialResumeState.sceneId);
    const [history, setHistory] = useState<string[]>(
        initialResumeState.history,
    );
    const [backlog, setBacklog] = useState<StoryStageBacklogEntry[]>(() => {
        const initialScene =
            scenes.find((scene) => scene.id === initialResumeState.sceneId) ??
            scenes[0];

        return initialScene ? [createLineBacklogEntry(initialScene, 0)] : [];
    });
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const sceneIndex = useMemo(
        () => scenes.findIndex((scene) => scene.id === sceneId),
        [sceneId, scenes],
    );
    const scene = scenes[sceneIndex] ?? scenes[0];
    const hasPrevious = history.length > 0;
    const hasNext = Boolean(resolveNextSceneId(scene, scenes, sceneIndex));

    useEffect(() => {
        if (scene) {
            onSceneChange?.(scene);
        }
    }, [onSceneChange, scene]);

    useEffect(() => {
        if (scene) {
            writeResumeState(resumeKey, {
                history,
                sceneId: scene.id,
            });
        }
    }, [history, resumeKey, scene]);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    if (!scene) {
        return null;
    }

    function goTo(nextSceneId: string) {
        const nextScene = scenes.find((scene) => scene.id === nextSceneId);

        setHistory((current) => [...current, scene.id]);

        if (nextScene) {
            setBacklog((current) => [
                ...current,
                createLineBacklogEntry(nextScene, current.length),
            ]);
        }

        setSceneId(nextSceneId);
    }

    function advance() {
        const nextSceneId = resolveNextSceneId(scene, scenes, sceneIndex);

        if (nextSceneId) {
            goTo(nextSceneId);
        }
    }

    function goBack() {
        const previousSceneId = history.at(-1);

        if (!previousSceneId) {
            return;
        }

        setHistory((current) => current.slice(0, -1));
        setBacklog((current) => {
            const previousScene = scenes.find(
                (scene) => scene.id === previousSceneId,
            );

            return previousScene
                ? [
                      ...current,
                      createLineBacklogEntry(previousScene, current.length),
                  ]
                : current;
        });
        setSceneId(previousSceneId);
    }

    function restart() {
        const restartScene =
            scenes.find((scene) => scene.id === firstSceneId) ?? scenes[0];

        setHistory([]);
        setBacklog(
            restartScene ? [createLineBacklogEntry(restartScene, 0)] : [],
        );
        setSceneId(firstSceneId);
        clearResumeState(resumeKey);
    }

    function choose(choice: StoryStageChoice) {
        if (choice.disabled) {
            return;
        }

        choice.onSelect?.();
        setBacklog((current) => [
            ...current,
            {
                dialogue: choice.label,
                id: `${scene.id}-${choice.id}-${current.length}`,
                sceneId: scene.id,
                type: 'choice',
            },
        ]);

        if (choice.nextSceneId) {
            goTo(choice.nextSceneId);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 overflow-hidden bg-slate-950 text-white"
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-stage-speaker"
        >
            <StoryStageKeyframes />

            <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-3 p-4">
                <p className="rounded border border-cyan-100/16 bg-slate-950/58 px-3 py-2 font-mono text-xs font-semibold text-cyan-100/78 backdrop-blur-md">
                    {labels.progress(sceneIndex + 1, scenes.length)}
                </p>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setIsHistoryOpen(true)}
                        className="cursor-pointer rounded border border-cyan-100/16 bg-slate-950/58 px-3 py-2 text-sm font-semibold text-cyan-50/78 backdrop-blur-md transition hover:bg-cyan-50/10 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                    >
                        {labels.history}
                    </button>
                    <button
                        type="button"
                        onClick={restart}
                        className="cursor-pointer rounded border border-cyan-100/16 bg-slate-950/58 px-3 py-2 text-sm font-semibold text-cyan-50/78 backdrop-blur-md transition hover:bg-cyan-50/10 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                    >
                        {labels.restart}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded border border-cyan-100/16 bg-slate-950/58 px-3 py-2 text-sm font-semibold text-cyan-50/78 backdrop-blur-md transition hover:bg-cyan-50/10 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                    >
                        {labels.close}
                    </button>
                </div>
            </div>

            <div
                key={scene.id}
                className="absolute inset-0"
                style={{
                    animation: sceneTransitionAnimation(scene, reducedMotion),
                }}
            >
                <img
                    src={scene.background.imageSrc}
                    alt={scene.background.imageAlt}
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(125,211,252,0.18),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.25),rgba(2,6,23,0.88))]" />
            </div>

            <div className="absolute inset-0 z-10">
                {(scene.sprites ?? []).map((sprite) => (
                    <StorySprite
                        key={sprite.id}
                        activeSpriteIds={scene.activeSpriteIds}
                        reducedMotion={reducedMotion}
                        sprite={sprite}
                    />
                ))}
            </div>

            {children}

            <StoryDialogue
                key={scene.id}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                labels={labels}
                onBack={goBack}
                onChoice={choose}
                onNext={advance}
                reducedMotion={reducedMotion}
                scene={scene}
            />

            {isHistoryOpen && (
                <StoryBacklogModal
                    entries={backlog}
                    labels={labels}
                    onClose={() => setIsHistoryOpen(false)}
                />
            )}
        </div>
    );
}

function StoryDialogue({
    hasNext,
    hasPrevious,
    labels,
    onBack,
    onChoice,
    onNext,
    reducedMotion,
    scene,
}: {
    hasNext: boolean;
    hasPrevious: boolean;
    labels: StoryStageLabels;
    onBack: () => void;
    onChoice: (choice: StoryStageChoice) => void;
    onNext: () => void;
    reducedMotion: boolean;
    scene: StoryStageScene;
}) {
    const [visibleCharacterCount, setVisibleCharacterCount] = useState(
        reducedMotion ? scene.dialogue.length : 0,
    );
    const [isFastFilling, setIsFastFilling] = useState(false);
    const [activeChoiceIndex, setActiveChoiceIndex] = useState(0);
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
        null,
    );
    const [isSelectedChoiceFading, setIsSelectedChoiceFading] = useState(false);
    const visibleDialogue = reducedMotion
        ? scene.dialogue
        : scene.dialogue.slice(0, visibleCharacterCount);
    const isDialogueComplete =
        reducedMotion || visibleCharacterCount >= scene.dialogue.length;
    const choices = useMemo(() => scene.choices ?? [], [scene.choices]);
    const hasChoices = isDialogueComplete && choices.length > 0;

    function fastFillDialogue() {
        if (reducedMotion) {
            setVisibleCharacterCount(scene.dialogue.length);

            return;
        }

        setIsFastFilling(true);

        const startCount = visibleCharacterCount;
        const remainingCount = scene.dialogue.length - startCount;
        const startedAt = performance.now();

        function tick(now: number) {
            const progress = Math.min((now - startedAt) / TEXT_FAST_FILL_MS, 1);

            setVisibleCharacterCount(
                Math.min(
                    scene.dialogue.length,
                    startCount + Math.ceil(remainingCount * progress),
                ),
            );

            if (progress < 1) {
                window.requestAnimationFrame(tick);
            } else {
                setIsFastFilling(false);
            }
        }

        window.requestAnimationFrame(tick);
    }

    function selectChoice(choice: StoryStageChoice) {
        if (choice.disabled || selectedChoiceId) {
            return;
        }

        setSelectedChoiceId(choice.id);

        if (reducedMotion) {
            onChoice(choice);

            return;
        }

        window.setTimeout(() => {
            setIsSelectedChoiceFading(true);
        }, CHOICE_OTHERS_FADE_MS + CHOICE_SELECTED_HOLD_MS);

        window.setTimeout(() => {
            onChoice(choice);
        }, CHOICE_SELECT_DELAY_MS);
    }

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (
                ![
                    ' ',
                    'Enter',
                    'ArrowRight',
                    'ArrowLeft',
                    'ArrowUp',
                    'ArrowDown',
                    ...choices.map((_, index) => String(index + 1)),
                ].includes(event.key)
            ) {
                return;
            }

            event.preventDefault();

            if (!isDialogueComplete) {
                if (
                    (event.key === ' ' ||
                        event.key === 'Enter' ||
                        event.key === 'ArrowRight') &&
                    !isFastFilling
                ) {
                    fastFillDialogue();
                }

                return;
            }

            if (hasChoices) {
                const numericChoice = Number(event.key);

                if (
                    Number.isInteger(numericChoice) &&
                    numericChoice >= 1 &&
                    numericChoice <= choices.length
                ) {
                    selectChoice(choices[numericChoice - 1]);

                    return;
                }

                if (event.key === ' ' || event.key === 'Enter') {
                    selectChoice(choices[activeChoiceIndex]);

                    return;
                }

                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    setActiveChoiceIndex((current) =>
                        nextSelectableChoiceIndex(choices, current, 'forward'),
                    );
                }

                if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    setActiveChoiceIndex((current) =>
                        nextSelectableChoiceIndex(choices, current, 'backward'),
                    );
                }

                return;
            }

            if (event.key === 'ArrowLeft') {
                onBack();

                return;
            }

            if (hasNext) {
                onNext();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    });

    useEffect(() => {
        if (reducedMotion || isDialogueComplete || isFastFilling) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setVisibleCharacterCount((current) =>
                Math.min(current + 1, scene.dialogue.length),
            );
        }, TEXT_REVEAL_INTERVAL_MS);

        return () => window.clearTimeout(timeout);
    }, [
        isDialogueComplete,
        isFastFilling,
        reducedMotion,
        scene.dialogue.length,
        visibleCharacterCount,
    ]);

    return (
        <div className="absolute inset-x-0 bottom-0 z-30">
            <div className="relative overflow-hidden border-t border-cyan-100/16 bg-slate-950/84 shadow-[0_-22px_64px_rgba(8,145,178,0.14),0_22px_72px_rgba(0,0,0,0.44)] backdrop-blur-xl">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-100/82 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-amber-200/32 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(34,211,238,0.08),transparent_18%,transparent_82%,rgba(251,191,36,0.07)),radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.16),transparent_28%),radial-gradient(circle_at_82%_100%,rgba(251,191,36,0.11),transparent_26%)]" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.045)_0,rgba(255,255,255,0.045)_1px,transparent_1px,transparent_12px)] opacity-28"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute top-2 left-2 h-5 w-5 border-t border-l border-cyan-100/36"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-2 bottom-2 h-5 w-5 border-r border-b border-amber-100/30"
                />

                <div className="relative mx-auto flex min-h-42 max-w-6xl flex-col px-4 py-3 sm:min-h-46 sm:px-6 sm:py-4">
                    <div className="flex items-center justify-between gap-3">
                        {scene.speaker ? (
                            <p
                                id="story-stage-speaker"
                                className="min-w-0 border border-cyan-100/18 bg-cyan-100/8 px-3 py-1 font-mono text-xs font-semibold tracking-[0.2em] text-cyan-100/86 uppercase shadow-lg shadow-cyan-950/20"
                            >
                                {scene.speaker}
                            </p>
                        ) : (
                            <span />
                        )}
                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={onBack}
                                disabled={!hasPrevious}
                                className="cursor-pointer border border-cyan-100/16 bg-cyan-50/5 px-3 py-1.5 text-xs font-semibold text-cyan-50/72 transition hover:bg-cyan-50/10 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35"
                            >
                                {labels.back}
                            </button>
                            {!hasChoices && (
                                <button
                                    type="button"
                                    onClick={onNext}
                                    disabled={!hasNext}
                                    className="cursor-pointer border border-amber-100/44 bg-amber-300 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-lg shadow-amber-950/24 transition hover:bg-amber-200 focus-visible:ring-2 focus-visible:ring-amber-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35"
                                >
                                    {labels.next}
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="mt-2 min-h-14 text-base leading-7 text-cyan-50/88 sm:min-h-16 sm:text-lg sm:leading-8">
                        {visibleDialogue}
                    </p>

                    {hasChoices && (
                        <div className="mt-auto flex max-w-4xl flex-col items-start gap-1.5 pt-2">
                            {choices.map((choice, index) => {
                                const isSelected =
                                    selectedChoiceId === choice.id;
                                const isInactiveSelection =
                                    selectedChoiceId && !isSelected;
                                const isActive = index === activeChoiceIndex;
                                const choiceKind = choice.kind ?? 'navigation';

                                return (
                                    <button
                                        key={choice.id}
                                        type="button"
                                        disabled={choice.disabled}
                                        onClick={() => selectChoice(choice)}
                                        aria-current={
                                            index === activeChoiceIndex
                                                ? 'true'
                                                : undefined
                                        }
                                        className={[
                                            'group relative inline-flex max-w-full cursor-pointer items-center gap-2 overflow-visible border px-2.5 py-1.5 text-start text-sm font-semibold transition-all ease-out focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none',
                                            isSelected
                                                ? [
                                                      'scale-[1.02]',
                                                      choiceResultToneClass(
                                                          choice.resultTone ??
                                                              'green',
                                                      ),
                                                      isSelectedChoiceFading
                                                          ? 'opacity-0'
                                                          : 'opacity-100',
                                                  ].join(' ')
                                                : isInactiveSelection
                                                  ? 'border-cyan-100/18 bg-cyan-50/8 text-cyan-50/84 opacity-0'
                                                  : choice.disabled
                                                    ? 'cursor-not-allowed border-cyan-100/10 bg-cyan-50/5 text-cyan-50/34'
                                                    : choiceKindClass(
                                                          choiceKind,
                                                          isActive,
                                                      ),
                                        ].join(' ')}
                                        style={{
                                            transitionDuration: isSelected
                                                ? isSelectedChoiceFading
                                                    ? `${CHOICE_SELECTED_FADE_MS}ms`
                                                    : `${CHOICE_OTHERS_FADE_MS}ms`
                                                : `${CHOICE_OTHERS_FADE_MS}ms`,
                                        }}
                                    >
                                        {isActive && !selectedChoiceId && (
                                            <>
                                                <span
                                                    aria-hidden="true"
                                                    className={[
                                                        'pointer-events-none absolute -top-1 -left-1 h-3.5 w-3.5 border-t-2 border-l-2',
                                                        choiceKindCornerClass(
                                                            choiceKind,
                                                        ),
                                                    ].join(' ')}
                                                    style={{
                                                        animation: reducedMotion
                                                            ? undefined
                                                            : 'story-stage-choice-pulse 1400ms ease-in-out infinite',
                                                    }}
                                                />
                                                <span
                                                    aria-hidden="true"
                                                    className={[
                                                        'pointer-events-none absolute -right-1 -bottom-1 h-3.5 w-3.5 border-r-2 border-b-2',
                                                        choiceKindCornerClass(
                                                            choiceKind,
                                                        ),
                                                    ].join(' ')}
                                                    style={{
                                                        animation: reducedMotion
                                                            ? undefined
                                                            : 'story-stage-choice-pulse 1400ms ease-in-out infinite',
                                                    }}
                                                />
                                            </>
                                        )}
                                        <span
                                            className={[
                                                'grid size-5 shrink-0 place-items-center rounded-full border font-mono text-[0.65rem] transition-colors',
                                                isSelected ||
                                                index === activeChoiceIndex
                                                    ? 'border-current/42 bg-white/10 text-current'
                                                    : 'border-cyan-100/20 bg-cyan-50/8 text-cyan-100/78',
                                            ].join(' ')}
                                        >
                                            {index + 1}
                                        </span>
                                        <span className="min-w-0 leading-5">
                                            <span>{choice.label}</span>
                                            {choice.description && (
                                                <span className="mt-0.5 block text-xs leading-4 font-medium opacity-[.72]">
                                                    {choice.description}
                                                </span>
                                            )}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StorySprite({
    activeSpriteIds,
    reducedMotion,
    sprite,
}: {
    activeSpriteIds?: string[];
    reducedMotion: boolean;
    sprite: StoryStageSprite;
}) {
    const presence = resolveSpritePresence(sprite, activeSpriteIds);
    const presenceScale = spritePresenceScale(presence);
    const baseScale = sprite.scale ?? 1;
    const style = {
        bottom: sprite.bottom ?? '18%',
        filter: spritePresenceFilter(presence, sprite.desaturation),
        left: sprite.x,
        transform: `translateX(-50%) scale(${baseScale * presenceScale})`,
    };

    return (
        <div
            className={[
                'absolute transition-all duration-500 ease-out',
                spritePresenceClass(presence),
                sprite.x ? '' : spritePositionClass(sprite.position),
            ].join(' ')}
            style={{
                ...style,
                transitionDuration: `${reducedMotion ? 0 : (sprite.durationMs ?? DEFAULT_SPRITE_DURATION_MS)}ms`,
            }}
        >
            {sprite.imageSrc ? (
                <img
                    src={sprite.imageSrc}
                    alt={sprite.alt ?? sprite.name}
                    className="object-contain drop-shadow-2xl"
                    style={{
                        maxHeight: sprite.maxHeight ?? '54vh',
                        maxWidth: sprite.maxWidth ?? '34vw',
                    }}
                />
            ) : (
                <div
                    className={[
                        'grid h-54 w-40 place-items-end rounded-t-full border p-4 text-center shadow-2xl backdrop-blur-sm sm:h-72 sm:w-52',
                        spriteToneClass(sprite.tone ?? 'cyan'),
                    ].join(' ')}
                >
                    <p className="w-full rounded bg-slate-950/58 px-3 py-2 text-sm font-semibold text-white">
                        {sprite.name}
                    </p>
                </div>
            )}
        </div>
    );
}

function StoryBacklogModal({
    entries,
    labels,
    onClose,
}: {
    entries: StoryStageBacklogEntry[];
    labels: StoryStageLabels;
    onClose: () => void;
}) {
    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div
            className="absolute inset-0 z-40 grid place-items-center bg-slate-950/62 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <section
                aria-labelledby="story-stage-history-title"
                className="max-h-[74vh] w-full max-w-3xl overflow-hidden rounded border border-cyan-100/18 bg-slate-950/92 shadow-2xl shadow-black/50"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-center justify-between gap-3 border-b border-cyan-100/12 px-4 py-3">
                    <h2
                        id="story-stage-history-title"
                        className="text-sm font-semibold tracking-[0.2em] text-cyan-100/82 uppercase"
                    >
                        {labels.historyTitle}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded border border-cyan-100/16 px-3 py-2 text-sm font-semibold text-cyan-50/78 transition hover:bg-cyan-50/10 focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none"
                    >
                        {labels.close}
                    </button>
                </div>
                <div className="max-h-[calc(74vh-4rem)] overflow-y-auto p-4">
                    {entries.length === 0 ? (
                        <p className="text-sm text-cyan-50/62">
                            {labels.historyEmpty}
                        </p>
                    ) : (
                        <ol className="space-y-4">
                            {entries.map((entry) => (
                                <li
                                    key={entry.id}
                                    className={[
                                        'border-l-2 pl-4',
                                        entry.type === 'choice'
                                            ? 'border-emerald-200/54'
                                            : 'border-cyan-200/44',
                                    ].join(' ')}
                                >
                                    {entry.speaker && (
                                        <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200/72 uppercase">
                                            {entry.speaker}
                                        </p>
                                    )}
                                    <p
                                        className={[
                                            'mt-1 text-sm leading-6',
                                            entry.type === 'choice'
                                                ? 'text-emerald-100/86'
                                                : 'text-cyan-50/82',
                                        ].join(' ')}
                                    >
                                        {entry.dialogue}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    )}
                </div>
            </section>
        </div>
    );
}

function createLineBacklogEntry(
    scene: StoryStageScene,
    index: number,
): StoryStageBacklogEntry {
    return {
        dialogue: scene.dialogue,
        id: `${scene.id}-${index}`,
        sceneId: scene.id,
        speaker: scene.speaker,
        type: 'line',
    };
}

function StoryStageKeyframes() {
    return (
        <style>
            {`
                @keyframes story-stage-fade {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes story-stage-lift {
                    from { opacity: 0; transform: translateY(14px) scale(1.015); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }

                @keyframes story-stage-choice-pulse {
                    0%, 100% { opacity: 0.78; }
                    50% { opacity: 1; }
                }
            `}
        </style>
    );
}

function nextSelectableChoiceIndex(
    choices: StoryStageChoice[],
    currentIndex: number,
    direction: 'forward' | 'backward',
): number {
    if (choices.every((choice) => choice.disabled)) {
        return currentIndex;
    }

    const offset = direction === 'forward' ? 1 : -1;
    let nextIndex = currentIndex;

    do {
        nextIndex = (nextIndex + offset + choices.length) % choices.length;
    } while (choices[nextIndex]?.disabled);

    return nextIndex;
}

function resolveSpritePresence(
    sprite: StoryStageSprite,
    activeSpriteIds?: string[],
): StoryStageSpritePresence {
    if (sprite.presence) {
        return sprite.presence;
    }

    if (!activeSpriteIds?.length) {
        return 'active';
    }

    return activeSpriteIds.includes(sprite.id) ? 'active' : 'idle';
}

function spritePresenceScale(presence: StoryStageSpritePresence): number {
    const scales: Record<StoryStageSpritePresence, number> = {
        active: 1.06,
        dormant: 0.9,
        idle: 0.94,
    };

    return scales[presence];
}

function spritePresenceFilter(
    presence: StoryStageSpritePresence,
    desaturation = 0.72,
): string {
    const clampedDesaturation = Math.max(0, Math.min(desaturation, 1));

    if (presence === 'active') {
        return 'saturate(1) brightness(1)';
    }

    if (presence === 'dormant') {
        return `saturate(${1 - clampedDesaturation}) brightness(0.68)`;
    }

    return 'saturate(0.72) brightness(0.82)';
}

function spritePresenceClass(presence: StoryStageSpritePresence): string {
    const classes: Record<StoryStageSpritePresence, string> = {
        active: 'opacity-100',
        dormant: 'opacity-50',
        idle: 'opacity-[.72]',
    };

    return classes[presence];
}

function resolveNextSceneId(
    scene: StoryStageScene,
    scenes: StoryStageScene[],
    sceneIndex: number,
): string | undefined {
    return scene.nextSceneId ?? scenes[sceneIndex + 1]?.id;
}

function spritePositionClass(position: StoryStageSpritePosition): string {
    const classes: Record<StoryStageSpritePosition, string> = {
        left: 'left-[26%]',
        center: 'left-1/2',
        right: 'left-[74%]',
        offLeft: '-left-[18%] opacity-0',
        offRight: 'left-[118%] opacity-0',
    };

    return classes[position];
}

function choiceResultToneClass(
    tone: NonNullable<StoryStageChoice['resultTone']>,
): string {
    const classes: Record<
        NonNullable<StoryStageChoice['resultTone']>,
        string
    > = {
        amber: 'border-amber-100 bg-amber-300 text-slate-950 shadow-2xl shadow-amber-950/28',
        cyan: 'border-cyan-100 bg-cyan-200 text-slate-950 shadow-2xl shadow-cyan-950/28',
        green: 'border-emerald-100 bg-emerald-300 text-slate-950 shadow-2xl shadow-emerald-950/28',
        red: 'border-rose-100 bg-rose-300 text-slate-950 shadow-2xl shadow-rose-950/28',
    };

    return classes[tone];
}

function choiceKindClass(
    kind: StoryStageChoiceKind,
    isActive: boolean,
): string {
    const inactiveClasses: Record<StoryStageChoiceKind, string> = {
        advance:
            'border-transparent bg-transparent text-amber-100/88 hover:border-amber-100/38 hover:bg-amber-300/10',
        info: 'border-transparent bg-transparent text-sky-100/88 hover:border-sky-100/38 hover:bg-sky-300/10',
        navigation:
            'border-transparent bg-transparent text-cyan-50/84 hover:border-cyan-200/34 hover:bg-cyan-100/10',
        quiz: 'border-transparent bg-transparent text-emerald-100/88 hover:border-emerald-100/38 hover:bg-emerald-300/10',
        reflection:
            'border-transparent bg-transparent text-violet-100/88 hover:border-violet-100/38 hover:bg-violet-300/10',
    };
    const activeClasses: Record<StoryStageChoiceKind, string> = {
        advance:
            'border-amber-100/66 bg-amber-300/18 text-amber-50 shadow-lg shadow-amber-950/20',
        info: 'border-sky-100/66 bg-sky-300/16 text-sky-50 shadow-lg shadow-sky-950/20',
        navigation:
            'border-cyan-200/60 bg-cyan-200/14 text-cyan-50 shadow-lg shadow-cyan-950/20',
        quiz: 'border-emerald-100/66 bg-emerald-300/16 text-emerald-50 shadow-lg shadow-emerald-950/20',
        reflection:
            'border-violet-100/66 bg-violet-300/16 text-violet-50 shadow-lg shadow-violet-950/20',
    };

    return isActive ? activeClasses[kind] : inactiveClasses[kind];
}

function choiceKindCornerClass(kind: StoryStageChoiceKind): string {
    const classes: Record<StoryStageChoiceKind, string> = {
        advance: 'border-amber-50 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]',
        info: 'border-sky-50 drop-shadow-[0_0_8px_rgba(125,211,252,0.95)]',
        navigation:
            'border-cyan-50 drop-shadow-[0_0_8px_rgba(103,232,249,0.9)]',
        quiz: 'border-emerald-50 drop-shadow-[0_0_8px_rgba(110,231,183,0.9)]',
        reflection:
            'border-violet-50 drop-shadow-[0_0_8px_rgba(196,181,253,0.9)]',
    };

    return classes[kind];
}

function spriteToneClass(tone: NonNullable<StoryStageSprite['tone']>): string {
    const classes: Record<NonNullable<StoryStageSprite['tone']>, string> = {
        amber: 'border-amber-100/24 bg-amber-300/18 shadow-amber-900/22',
        cyan: 'border-cyan-100/24 bg-cyan-300/18 shadow-cyan-900/22',
        slate: 'border-slate-100/20 bg-slate-300/16 shadow-slate-950/30',
        violet: 'border-violet-100/24 bg-violet-300/18 shadow-violet-900/22',
    };

    return classes[tone];
}

function sceneTransitionAnimation(
    scene: StoryStageScene,
    reducedMotion: boolean,
): string | undefined {
    if (reducedMotion || scene.transition?.kind === 'none') {
        return undefined;
    }

    const transitionKind = scene.transition?.kind ?? 'fade';
    const duration =
        scene.transition?.durationMs ?? DEFAULT_SCENE_TRANSITION_MS;

    return `story-stage-${transitionKind} ${duration}ms ease-out both`;
}

function readResumeState(
    resumeKey: string | undefined,
    firstSceneId: string | undefined,
    scenes: StoryStageScene[],
): StoryStageResumeState {
    const fallback = {
        history: [],
        sceneId: firstSceneId ?? scenes[0]?.id ?? '',
    };

    if (!resumeKey || typeof window === 'undefined') {
        return fallback;
    }

    try {
        const savedState = window.localStorage.getItem(resumeKey);

        if (!savedState) {
            return fallback;
        }

        const parsed = JSON.parse(savedState) as Partial<StoryStageResumeState>;
        const savedSceneExists = scenes.some(
            (scene) => scene.id === parsed.sceneId,
        );

        if (!parsed.sceneId || !savedSceneExists) {
            return fallback;
        }

        return {
            history: Array.isArray(parsed.history) ? parsed.history : [],
            sceneId: parsed.sceneId,
        };
    } catch {
        return fallback;
    }
}

function writeResumeState(
    resumeKey: string | undefined,
    state: StoryStageResumeState,
) {
    if (!resumeKey || typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(resumeKey, JSON.stringify(state));
}

function clearResumeState(resumeKey: string | undefined) {
    if (!resumeKey || typeof window === 'undefined') {
        return;
    }

    window.localStorage.removeItem(resumeKey);
}

function usePrefersReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }

        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQuery = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );

        function handleChange(event: MediaQueryListEvent) {
            setPrefersReducedMotion(event.matches);
        }

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return prefersReducedMotion;
}
