import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import type {
    StoryStageChoice,
    StoryStageChoiceKind,
    StoryStageLabels,
    StoryStageProps,
    StoryStageScene,
    StoryStageSprite,
    StoryStageSpritePresence,
    StoryStageSpritePosition,
    StoryStageTextSpeed,
} from './types';

const DEFAULT_SPRITE_DURATION_MS = 900;
const DEFAULT_SCENE_TRANSITION_MS = 360;
const TEXT_SPEED_STORAGE_KEY = 'story-stage:text-speed';
const DEFAULT_TEXT_SPEED: StoryStageTextSpeed = 'fast';
const TEXT_REVEAL_INTERVAL_MS: Record<StoryStageTextSpeed, number> = {
    fast: 16,
    instant: 0,
    slow: 38,
};
const TEXT_FAST_FILL_MS = 250;
const CHOICE_OTHERS_FADE_MS = 250;
const CHOICE_SELECTED_HOLD_MS = 150;
const CHOICE_SELECTED_FADE_MS = 200;
const CHOICE_SELECT_DELAY_MS =
    CHOICE_OTHERS_FADE_MS + CHOICE_SELECTED_HOLD_MS + CHOICE_SELECTED_FADE_MS;
const CHOICE_ENTER_DURATION_MS = 360;
const CHOICE_ENTER_STAGGER_MS = 240;
const STORY_MENU_ANIMATION_MS = 180;
const STORY_MENU_ITEM_COUNT = 6;

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
    const [areChoicesVisible, setAreChoicesVisible] = useState(false);
    const [textSpeed, setTextSpeed] = useState<StoryStageTextSpeed>(() =>
        readTextSpeedState(),
    );

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

    function updateTextSpeed(nextTextSpeed: StoryStageTextSpeed) {
        setTextSpeed(nextTextSpeed);
        writeTextSpeedState(nextTextSpeed);
    }

    if (!scene) {
        return null;
    }

    function goTo(nextSceneId: string) {
        const nextScene = scenes.find((scene) => scene.id === nextSceneId);

        setAreChoicesVisible(false);
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

        setAreChoicesVisible(false);
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
        setAreChoicesVisible(false);
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
            className="story-stage fixed inset-0 z-50 overflow-hidden bg-slate-950 text-white"
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-stage-speaker"
        >
            <StoryStageKeyframes />

            <div
                key={scene.background.imageSrc}
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
                        lift={areChoicesVisible && !reducedMotion}
                        reducedMotion={reducedMotion}
                        sprite={sprite}
                    />
                ))}
            </div>

            {children}

            <StoryDialogue
                key={`dialogue-${scene.id}-${history.length}`}
                hasNext={hasNext}
                hasPrevious={hasPrevious}
                labels={labels}
                onBack={goBack}
                onClose={onClose}
                onChoice={choose}
                onChoicesVisibleChange={setAreChoicesVisible}
                onHistory={() => setIsHistoryOpen(true)}
                onNext={advance}
                onRestart={restart}
                reducedMotion={reducedMotion}
                scene={scene}
                textSpeed={textSpeed}
                onTextSpeedChange={updateTextSpeed}
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
    onClose,
    onChoice,
    onChoicesVisibleChange,
    onHistory,
    onNext,
    onRestart,
    onTextSpeedChange,
    reducedMotion,
    scene,
    textSpeed,
}: {
    hasNext: boolean;
    hasPrevious: boolean;
    labels: StoryStageLabels;
    onBack: () => void;
    onClose: () => void;
    onChoice: (choice: StoryStageChoice) => void;
    onChoicesVisibleChange: (isVisible: boolean) => void;
    onHistory: () => void;
    onNext: () => void;
    onRestart: () => void;
    onTextSpeedChange: (textSpeed: StoryStageTextSpeed) => void;
    reducedMotion: boolean;
    scene: StoryStageScene;
    textSpeed: StoryStageTextSpeed;
}) {
    const [visibleCharacterCount, setVisibleCharacterCount] = useState(
        reducedMotion || textSpeed === 'instant' ? scene.dialogue.length : 0,
    );
    const [isFastFilling, setIsFastFilling] = useState(false);
    const [activeChoiceIndex, setActiveChoiceIndex] = useState(0);
    const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(
        null,
    );
    const [isSelectedChoiceFading, setIsSelectedChoiceFading] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const [activeMenuIndex, setActiveMenuIndex] = useState(0);
    const menuCloseTimeoutRef = useRef<number | null>(null);
    const visibleDialogue = reducedMotion
        ? scene.dialogue
        : scene.dialogue.slice(0, visibleCharacterCount);
    const isDialogueComplete =
        reducedMotion ||
        textSpeed === 'instant' ||
        visibleCharacterCount >= scene.dialogue.length;
    const choices = useMemo(() => scene.choices ?? [], [scene.choices]);
    const hasChoices = isDialogueComplete && choices.length > 0;
    const isMenuVisible = isMenuOpen || isMenuClosing;

    useEffect(() => {
        onChoicesVisibleChange(hasChoices);

        return () => onChoicesVisibleChange(false);
    }, [hasChoices, onChoicesVisibleChange]);

    function fastFillDialogue() {
        if (reducedMotion || textSpeed === 'instant') {
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

    function changeTextSpeed(nextTextSpeed: StoryStageTextSpeed) {
        onTextSpeedChange(nextTextSpeed);

        if (nextTextSpeed === 'instant') {
            setVisibleCharacterCount(scene.dialogue.length);
        }
    }

    function clearMenuCloseTimeout() {
        if (menuCloseTimeoutRef.current !== null) {
            window.clearTimeout(menuCloseTimeoutRef.current);
            menuCloseTimeoutRef.current = null;
        }
    }

    function openMenu() {
        clearMenuCloseTimeout();
        setActiveMenuIndex(textSpeedToMenuIndex(textSpeed));
        setIsMenuClosing(false);
        setIsMenuOpen(true);
    }

    function closeMenu(afterClose?: () => void) {
        clearMenuCloseTimeout();

        if (reducedMotion) {
            setIsMenuOpen(false);
            setIsMenuClosing(false);
            afterClose?.();

            return;
        }

        setIsMenuOpen(false);
        setIsMenuClosing(true);
        menuCloseTimeoutRef.current = window.setTimeout(() => {
            setIsMenuClosing(false);
            menuCloseTimeoutRef.current = null;
            afterClose?.();
        }, STORY_MENU_ANIMATION_MS);
    }

    function activateMenuItem(index: number) {
        if (index === 0) {
            changeTextSpeed('slow');

            return;
        }

        if (index === 1) {
            changeTextSpeed('fast');

            return;
        }

        if (index === 2) {
            changeTextSpeed('instant');

            return;
        }

        if (index === 3) {
            closeMenu(onHistory);

            return;
        }

        if (index === 4) {
            closeMenu(onRestart);

            return;
        }

        closeMenu(onClose);
    }

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape' && isMenuVisible) {
                event.preventDefault();
                event.stopImmediatePropagation();
                closeMenu();

                return;
            }

            if (isMenuVisible) {
                if (isMenuClosing) {
                    return;
                }

                if (
                    ![
                        ' ',
                        'Enter',
                        'ArrowRight',
                        'ArrowLeft',
                        'ArrowUp',
                        'ArrowDown',
                    ].includes(event.key)
                ) {
                    return;
                }

                event.preventDefault();
                event.stopImmediatePropagation();

                if (event.key === ' ' || event.key === 'Enter') {
                    activateMenuItem(activeMenuIndex);

                    return;
                }

                setActiveMenuIndex((current) =>
                    nextMenuIndex(current, event.key, textSpeed),
                );

                return;
            }

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

        window.addEventListener('keydown', handleKeyDown, true);

        return () => window.removeEventListener('keydown', handleKeyDown, true);
    });

    useEffect(() => {
        return () => clearMenuCloseTimeout();
    }, []);

    useEffect(() => {
        if (reducedMotion || isDialogueComplete || isFastFilling) {
            return;
        }

        const timeout = window.setTimeout(() => {
            setVisibleCharacterCount((current) =>
                Math.min(current + 1, scene.dialogue.length),
            );
        }, TEXT_REVEAL_INTERVAL_MS[textSpeed]);

        return () => window.clearTimeout(timeout);
    }, [
        isDialogueComplete,
        isFastFilling,
        reducedMotion,
        scene.dialogue.length,
        textSpeed,
        visibleCharacterCount,
    ]);

    return (
        <div
            className="story-stage-dialogue absolute inset-x-0 bottom-0 z-30"
            data-choices-visible={hasChoices ? 'true' : undefined}
        >
            <div className={dialogueShellClass()}>
                <div className={dialogueTopRuleClass()} />
                <div className={dialogueBottomRuleClass()} />
                <div className={dialogueAtmosphereClass()} />
                <div
                    aria-hidden="true"
                    className={dialogueCornerClass('top')}
                />
                <div
                    aria-hidden="true"
                    className={dialogueCornerClass('bottom')}
                />

                <div className={dialogueContentClass()}>
                    <div className="flex items-center justify-between gap-3">
                        {scene.speaker ? (
                            <p
                                id="story-stage-speaker"
                                className={dialogueSpeakerClass()}
                                style={{
                                    transform: 'skewX(-12deg)',
                                }}
                            >
                                <span className="inline-block skew-x-12">
                                    {scene.speaker}
                                </span>
                            </p>
                        ) : (
                            <span />
                        )}
                        <div className="flex shrink-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={onBack}
                                disabled={!hasPrevious}
                                className={dialogueControlClass('secondary')}
                                style={{
                                    transform: 'skewX(-12deg)',
                                }}
                            >
                                <span className="inline-block skew-x-12">
                                    {labels.back}
                                </span>
                            </button>
                            {isDialogueComplete && !hasChoices && (
                                <button
                                    type="button"
                                    onClick={onNext}
                                    disabled={!hasNext}
                                    className={dialogueControlClass('primary')}
                                    style={{
                                        transform: 'skewX(-12deg)',
                                    }}
                                >
                                    <span className="inline-block skew-x-12">
                                        {labels.next}
                                    </span>
                                </button>
                            )}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isMenuVisible) {
                                            closeMenu();
                                        } else {
                                            openMenu();
                                        }
                                    }}
                                    aria-expanded={isMenuVisible}
                                    aria-label="Story menu"
                                    className={dialogueControlClass(
                                        'secondary',
                                    )}
                                    style={{
                                        transform: 'skewX(-12deg)',
                                    }}
                                >
                                    <span className="inline-block skew-x-12 tracking-[0.08em]">
                                        {'...'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <p className={dialogueTextClass()}>{visibleDialogue}</p>

                    <div
                        className={[
                            'mt-auto grid w-full max-w-full grid-cols-1 items-stretch gap-1.5 overflow-visible transition-[grid-template-rows,padding,opacity,transform] duration-420 ease-out sm:w-auto sm:grid-cols-[max-content]',
                            hasChoices
                                ? 'translate-y-0 grid-rows-[1fr] pt-3 pb-2 opacity-100 sm:pt-2 sm:pb-1'
                                : 'pointer-events-none translate-y-3 grid-rows-[0fr] pt-0 pb-0 opacity-0',
                        ].join(' ')}
                    >
                        <div className="grid min-h-0 gap-2 overflow-visible px-3 py-1">
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
                                            'group relative flex w-full max-w-full cursor-pointer items-center gap-2 overflow-visible border px-2.5 py-1.5 text-start text-sm font-semibold transition-all ease-out focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:outline-none',
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
                                            animation:
                                                !reducedMotion &&
                                                !selectedChoiceId
                                                    ? `story-stage-choice-enter ${CHOICE_ENTER_DURATION_MS}ms ease-out ${index * CHOICE_ENTER_STAGGER_MS}ms both`
                                                    : undefined,
                                            transform: isSelected
                                                ? 'skewX(-10deg) scale(1.02)'
                                                : 'skewX(-10deg)',
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
                                                        'pointer-events-none absolute -top-1.5 -left-1.5 z-10 h-4 w-4 border-t-3 border-l-3',
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
                                                        'pointer-events-none absolute -right-1.5 -bottom-1.5 z-10 h-4 w-4 border-r-3 border-b-3',
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
                                                    : 'border-black/35 bg-black/8 text-black/70',
                                            ].join(' ')}
                                            style={{
                                                transform: 'skewX(10deg)',
                                            }}
                                        >
                                            {index + 1}
                                        </span>
                                        <span
                                            className="min-w-0 leading-5"
                                            style={{
                                                transform: 'skewX(10deg)',
                                            }}
                                        >
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
                    </div>
                </div>
            </div>
            {isMenuVisible && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/46 px-4 backdrop-blur-[2px]"
                    onClick={() => closeMenu()}
                    style={{
                        animation: reducedMotion
                            ? undefined
                            : isMenuClosing
                              ? `story-stage-menu-backdrop-out ${STORY_MENU_ANIMATION_MS}ms ease-in both`
                              : 'story-stage-menu-backdrop-in 160ms ease-out both',
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Story menu"
                        className={dialogueMenuModalClass()}
                        onClick={(event) => event.stopPropagation()}
                        style={{
                            animation: reducedMotion
                                ? undefined
                                : isMenuClosing
                                  ? `story-stage-menu-out ${STORY_MENU_ANIMATION_MS}ms ease-in both`
                                  : 'story-stage-menu-in 180ms cubic-bezier(.2,1,.2,1) both',
                        }}
                    >
                        <div className="pointer-events-none absolute top-2 left-3 h-4 w-8 -skew-x-12 border-t-4 border-l-4 border-black" />
                        <div className="pointer-events-none absolute right-3 bottom-2 h-4 w-8 -skew-x-12 border-r-4 border-b-4 border-black" />
                        <div className="mb-2">
                            <p className="mb-2 font-mono text-[0.65rem] font-black tracking-[0.18em] text-black uppercase">
                                {labels.textSpeed}
                            </p>
                            <div className="grid grid-cols-3 gap-1.5">
                                {(
                                    [
                                        ['slow', labels.textSpeedSlow],
                                        ['fast', labels.textSpeedFast],
                                        ['instant', labels.textSpeedInstant],
                                    ] as const
                                ).map(([speed, label]) => (
                                    <button
                                        key={speed}
                                        type="button"
                                        onClick={() => {
                                            setActiveMenuIndex(
                                                textSpeedToMenuIndex(speed),
                                            );
                                            changeTextSpeed(speed);
                                        }}
                                        onFocus={() =>
                                            setActiveMenuIndex(
                                                textSpeedToMenuIndex(speed),
                                            )
                                        }
                                        aria-pressed={textSpeed === speed}
                                        className={dialogueTextSpeedClass(
                                            textSpeed === speed,
                                            activeMenuIndex ===
                                                textSpeedToMenuIndex(speed),
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            type="button"
                            onFocus={() => setActiveMenuIndex(3)}
                            onClick={() => {
                                closeMenu(onHistory);
                            }}
                            className={dialogueMenuItemClass(
                                activeMenuIndex === 3,
                            )}
                            style={{
                                transform: 'skewX(-10deg)',
                            }}
                        >
                            <span className="inline-block skew-x-10">
                                {labels.history}
                            </span>
                        </button>
                        <button
                            type="button"
                            onFocus={() => setActiveMenuIndex(4)}
                            onClick={() => {
                                closeMenu(onRestart);
                            }}
                            className={dialogueMenuItemClass(
                                activeMenuIndex === 4,
                            )}
                            style={{
                                transform: 'skewX(-10deg)',
                            }}
                        >
                            <span className="inline-block skew-x-10">
                                {labels.restart}
                            </span>
                        </button>
                        <button
                            type="button"
                            onFocus={() => setActiveMenuIndex(5)}
                            onClick={() => {
                                closeMenu(onClose);
                            }}
                            className={dialogueMenuItemClass(
                                activeMenuIndex === 5,
                            )}
                            style={{
                                transform: 'skewX(-10deg)',
                            }}
                        >
                            <span className="inline-block skew-x-10">
                                {labels.close}
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function StorySprite({
    activeSpriteIds,
    lift,
    reducedMotion,
    sprite,
}: {
    activeSpriteIds?: string[];
    lift: boolean;
    reducedMotion: boolean;
    sprite: StoryStageSprite;
}) {
    const presence = resolveSpritePresence(sprite, activeSpriteIds);
    const presenceScale = spritePresenceScale(presence);
    const baseScale = sprite.scale ?? 1;
    const hasCustomX = Boolean(sprite.mobileX || sprite.x);
    const style = {
        '--story-sprite-bottom': sprite.bottom ?? '18%',
        '--story-sprite-max-height': sprite.maxHeight ?? '54vh',
        '--story-sprite-max-width': sprite.maxWidth ?? '34vw',
        '--story-sprite-mobile-bottom':
            sprite.mobileBottom ?? sprite.bottom ?? '18%',
        '--story-sprite-mobile-max-height':
            sprite.mobileMaxHeight ?? sprite.maxHeight ?? '54vh',
        '--story-sprite-mobile-max-width':
            sprite.mobileMaxWidth ?? sprite.maxWidth ?? '34vw',
        '--story-sprite-mobile-x': sprite.mobileX ?? sprite.x,
        bottom: 'var(--story-sprite-mobile-bottom)',
        filter: spritePresenceFilter(presence, sprite.desaturation),
        left: sprite.mobileX ?? sprite.x,
        transform: `translateX(-50%) translateY(${lift ? '-3rem' : '0'}) scale(${baseScale * presenceScale})`,
    } as CSSProperties;

    return (
        <div
            className={[
                'story-stage-sprite absolute transition-all duration-500 ease-out sm:bottom-(--story-sprite-bottom)',
                hasCustomX ? 'sm:left-(--story-sprite-x)' : '',
                spritePresenceClass(presence),
                hasCustomX ? '' : spritePositionClass(sprite.position),
            ].join(' ')}
            style={
                {
                    ...style,
                    '--story-sprite-x': sprite.x,
                    transitionDuration: `${reducedMotion ? 0 : (sprite.durationMs ?? DEFAULT_SPRITE_DURATION_MS)}ms`,
                } as CSSProperties
            }
        >
            {sprite.imageSrc ? (
                <img
                    src={sprite.imageSrc}
                    alt={sprite.alt ?? sprite.name}
                    className="max-h-(--story-sprite-mobile-max-height) max-w-(--story-sprite-mobile-max-width) object-contain drop-shadow-2xl sm:max-h-(--story-sprite-max-height) sm:max-w-(--story-sprite-max-width)"
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
            className="absolute inset-0 z-40 grid place-items-center bg-black/58 p-4 backdrop-blur-[2px]"
            onClick={onClose}
            style={{
                animation: 'story-stage-menu-backdrop-in 160ms ease-out both',
            }}
        >
            <section
                aria-labelledby="story-stage-history-title"
                className={storyHistoryModalClass()}
                onClick={(event) => event.stopPropagation()}
                style={{
                    animation:
                        'story-stage-menu-in 180ms cubic-bezier(.2,1,.2,1) both',
                }}
            >
                <div className="pointer-events-none absolute top-3 left-3 h-5 w-12 -skew-x-12 border-t-4 border-l-4 border-black" />
                <div className="pointer-events-none absolute right-4 bottom-4 h-4 w-10 -skew-x-12 border-r-4 border-b-4 border-black" />
                <div className="flex items-center justify-between gap-3 border-b-4 border-black px-5 py-4">
                    <h2
                        id="story-stage-history-title"
                        className="font-mono text-sm font-black tracking-[0.22em] text-black uppercase"
                    >
                        {labels.historyTitle}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className={dialogueControlClass('secondary')}
                        style={{
                            transform: 'skewX(-12deg)',
                        }}
                    >
                        <span className="inline-block skew-x-12">
                            {labels.close}
                        </span>
                    </button>
                </div>
                <div className="max-h-[calc(76vh-5.5rem)] overflow-y-auto bg-[repeating-linear-gradient(135deg,rgba(0,0,0,0.06)_0,rgba(0,0,0,0.06)_10px,transparent_10px,transparent_22px)] px-5 pt-5 pb-10">
                    {entries.length === 0 ? (
                        <p className="border-2 border-black bg-white px-4 py-3 text-sm font-black text-black shadow-[5px_5px_0_rgba(0,0,0,0.9)]">
                            {labels.historyEmpty}
                        </p>
                    ) : (
                        <ol className="space-y-3">
                            {entries.map((entry) => (
                                <li
                                    key={entry.id}
                                    className={[
                                        'relative border-2 border-black px-4 py-3 text-black shadow-[5px_5px_0_rgba(0,0,0,0.88)]',
                                        entry.type === 'choice'
                                            ? 'bg-emerald-100'
                                            : 'bg-white',
                                    ].join(' ')}
                                >
                                    {entry.speaker && (
                                        <p className="font-mono text-[0.65rem] font-black tracking-[0.18em] text-black/66 uppercase">
                                            {entry.speaker}
                                        </p>
                                    )}
                                    <p
                                        className={[
                                            'text-sm leading-6 font-black',
                                            entry.speaker ? 'mt-1' : '',
                                            entry.type === 'choice'
                                                ? 'text-emerald-950'
                                                : 'text-black',
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
                    0%, 100% { opacity: 0.78; scale: 1; }
                    50% { opacity: 1; scale: 1.16; }
                }

                @keyframes story-stage-choice-enter {
                    from { opacity: 0; translate: -10px 0; }
                    to { opacity: 1; translate: 0 0; }
                }

                @keyframes story-stage-menu-backdrop-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes story-stage-menu-backdrop-out {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }

                @keyframes story-stage-menu-in {
                    0% { opacity: 0; transform: translateY(10px) scale(0.94) skewX(-1deg); }
                    70% { opacity: 1; transform: translateY(-2px) scale(1.02) skewX(0deg); }
                    100% { opacity: 1; transform: translateY(0) scale(1) skewX(0deg); }
                }

                @keyframes story-stage-menu-out {
                    from { opacity: 1; transform: translateY(0) scale(1); }
                    to { opacity: 0; transform: translateY(8px) scale(0.96); }
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
            'border-transparent bg-white text-black shadow-[5px_5px_0_rgba(0,0,0,0.86)] hover:-translate-y-0.5 hover:bg-amber-200',
        info: 'border-transparent bg-white text-black shadow-[5px_5px_0_rgba(0,0,0,0.86)] hover:-translate-y-0.5 hover:bg-sky-100',
        navigation:
            'border-transparent bg-white text-black shadow-[5px_5px_0_rgba(0,0,0,0.86)] hover:-translate-y-0.5 hover:bg-cyan-100',
        quiz: 'border-transparent bg-white text-black shadow-[5px_5px_0_rgba(0,0,0,0.86)] hover:-translate-y-0.5 hover:bg-emerald-100',
        reflection:
            'border-transparent bg-white text-black shadow-[5px_5px_0_rgba(0,0,0,0.86)] hover:-translate-y-0.5 hover:bg-violet-100',
    };
    const activeClasses: Record<StoryStageChoiceKind, string> = {
        advance:
            'border-amber-200 bg-amber-300 text-black shadow-[6px_6px_0_rgba(0,0,0,0.94)]',
        info: 'border-sky-100 bg-sky-200 text-black shadow-[6px_6px_0_rgba(0,0,0,0.94)]',
        navigation:
            'border-cyan-100 bg-cyan-200 text-black shadow-[6px_6px_0_rgba(0,0,0,0.94)]',
        quiz: 'border-emerald-100 bg-emerald-200 text-black shadow-[6px_6px_0_rgba(0,0,0,0.94)]',
        reflection:
            'border-violet-100 bg-violet-200 text-black shadow-[6px_6px_0_rgba(0,0,0,0.94)]',
    };

    return isActive ? activeClasses[kind] : inactiveClasses[kind];
}

function dialogueShellClass(): string {
    return 'relative overflow-hidden border-t-4 border-black bg-black text-white shadow-[0_-28px_60px_rgba(0,0,0,0.42)]';
}

function dialogueTopRuleClass(): string {
    return 'pointer-events-none absolute inset-x-0 top-0 h-1 bg-white';
}

function dialogueBottomRuleClass(): string {
    return 'pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white';
}

function dialogueAtmosphereClass(): string {
    return 'pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.16),transparent_18%,transparent_76%,rgba(255,255,255,0.08)),repeating-linear-gradient(135deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_10px,transparent_10px,transparent_22px)]';
}

function dialogueCornerClass(position: 'top' | 'bottom'): string {
    return position === 'top'
        ? 'pointer-events-none absolute top-2 left-3 h-4 w-8 -skew-x-12 border-t-4 border-l-4 border-white sm:left-8 sm:h-5 sm:w-12'
        : 'pointer-events-none absolute right-3 bottom-2 h-4 w-8 -skew-x-12 border-r-4 border-b-4 border-white sm:right-8 sm:h-5 sm:w-12';
}

function dialogueContentClass(): string {
    return 'relative mx-auto flex min-h-42 max-w-6xl flex-col px-8 pt-4 pb-3 sm:min-h-46 sm:px-12 sm:py-4';
}

function dialogueSpeakerClass(): string {
    return 'min-w-0 border-2 border-black bg-white px-4 py-1 font-mono text-xs font-black tracking-[0.18em] text-black uppercase shadow-[5px_5px_0_rgba(0,0,0,0.95)]';
}

function dialogueControlClass(priority: 'primary' | 'secondary'): string {
    return [
        'cursor-pointer border-2 border-black px-3 py-1.5 font-mono text-xs font-black tracking-[0.18em] uppercase text-black shadow-[4px_4px_0_rgba(0,0,0,0.95)] transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35',
        priority === 'primary' ? 'bg-amber-300' : 'bg-white',
    ].join(' ');
}

function dialogueMenuItemClass(isKeyboardActive = false): string {
    return [
        'cursor-pointer border-2 border-black px-3 py-2 font-mono text-xs font-black tracking-[0.16em] text-black uppercase shadow-[4px_4px_0_rgba(0,0,0,0.95)] transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
        isKeyboardActive ? 'bg-amber-300 -translate-y-0.5' : 'bg-white',
    ].join(' ');
}

function dialogueMenuModalClass(): string {
    return 'relative grid w-full max-w-64 gap-2 border-4 border-black bg-white px-6 py-7 shadow-[10px_10px_0_rgba(0,0,0,0.92)]';
}

function storyHistoryModalClass(): string {
    return 'relative max-h-[76vh] w-full max-w-3xl overflow-hidden border-4 border-black bg-white shadow-[12px_12px_0_rgba(0,0,0,0.92)]';
}

function dialogueTextSpeedClass(
    isActive: boolean,
    isKeyboardActive = false,
): string {
    return [
        'cursor-pointer border-2 px-2 py-1.5 font-mono text-[0.65rem] font-black tracking-[0.08em] text-black uppercase transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-black focus-visible:outline-none',
        isKeyboardActive
            ? 'border-black bg-amber-300 shadow-[3px_3px_0_rgba(0,0,0,0.95)] -translate-y-0.5'
            : isActive
              ? 'border-black bg-amber-300 shadow-[3px_3px_0_rgba(0,0,0,0.95)]'
              : 'border-black/45 bg-white hover:bg-cyan-100',
    ].join(' ');
}

function textSpeedToMenuIndex(textSpeed: StoryStageTextSpeed): number {
    const indexByTextSpeed: Record<StoryStageTextSpeed, number> = {
        slow: 0,
        fast: 1,
        instant: 2,
    };

    return indexByTextSpeed[textSpeed];
}

function nextMenuIndex(
    currentIndex: number,
    key: string,
    textSpeed: StoryStageTextSpeed,
): number {
    if (key === 'ArrowDown') {
        return currentIndex <= 2
            ? 3
            : (currentIndex + 1) % STORY_MENU_ITEM_COUNT;
    }

    if (key === 'ArrowUp') {
        if (currentIndex === 3) {
            return textSpeedToMenuIndex(textSpeed);
        }

        return currentIndex > 3 ? currentIndex - 1 : STORY_MENU_ITEM_COUNT - 1;
    }

    if (key === 'ArrowRight') {
        return currentIndex <= 2 ? (currentIndex + 1) % 3 : currentIndex;
    }

    if (key === 'ArrowLeft') {
        return currentIndex <= 2 ? (currentIndex + 2) % 3 : currentIndex;
    }

    return currentIndex;
}

function dialogueTextClass(): string {
    return 'mt-2 min-h-14 max-w-4xl text-base leading-6 font-black text-white [text-shadow:2px_2px_0_rgba(0,0,0,0.95)] sm:min-h-16 sm:text-lg sm:leading-7';
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

function readTextSpeedState(): StoryStageTextSpeed {
    if (typeof window === 'undefined') {
        return DEFAULT_TEXT_SPEED;
    }

    const savedTextSpeed = window.localStorage.getItem(TEXT_SPEED_STORAGE_KEY);

    if (
        savedTextSpeed === 'slow' ||
        savedTextSpeed === 'fast' ||
        savedTextSpeed === 'instant'
    ) {
        return savedTextSpeed;
    }

    return DEFAULT_TEXT_SPEED;
}

function writeTextSpeedState(textSpeed: StoryStageTextSpeed) {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(TEXT_SPEED_STORAGE_KEY, textSpeed);
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
