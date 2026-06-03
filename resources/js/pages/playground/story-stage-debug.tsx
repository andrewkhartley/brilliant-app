import { useMemo, useState } from 'react';

import { StoryStage } from '@/components/story-stage';
import type { StoryStageScene } from '@/components/story-stage';
import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

export default function StoryStageDebugPage() {
    const { t } = useTranslation();
    const [isStageOpen, setIsStageOpen] = useState(false);
    const scenes = useMemo<StoryStageScene[]>(
        () => [
            {
                id: 'arrival',
                background: {
                    imageSrc: '/assets/img/bg/cylinder.jpg',
                    imageAlt: t('storyStage.demo.backgroundAlt'),
                },
                speaker: t('storyStage.demo.scenes.arrival.speaker'),
                dialogue: t('storyStage.demo.scenes.arrival.dialogue'),
                activeSpriteIds: ['guide'],
                transition: {
                    kind: 'fade',
                },
                sprites: [
                    {
                        id: 'guide',
                        alt: t('storyStage.demo.sprites.guide'),
                        bottom: '9%',
                        imageSrc: '/assets/sprites/andrew/andrew.webp',
                        maxHeight: '64vh',
                        maxWidth: '36vw',
                        mobileBottom: '25%',
                        mobileMaxHeight: '50vh',
                        mobileMaxWidth: '52vw',
                        mobileX: '29%',
                        name: t('storyStage.demo.sprites.guide'),
                        position: 'left',
                        scale: 1.06,
                        tone: 'cyan',
                        x: '27%',
                    },
                    {
                        id: 'city',
                        name: t('storyStage.demo.sprites.city'),
                        position: 'right',
                        tone: 'slate',
                        scale: 1.12,
                        presence: 'dormant',
                        desaturation: 0.88,
                    },
                ],
            },
            {
                id: 'ceiling',
                background: {
                    imageSrc: '/assets/img/bg/cylinder.jpg',
                    imageAlt: t('storyStage.demo.backgroundAlt'),
                },
                speaker: t('storyStage.demo.scenes.ceiling.speaker'),
                dialogue: t('storyStage.demo.scenes.ceiling.dialogue'),
                activeSpriteIds: ['city'],
                transition: {
                    durationMs: 520,
                    kind: 'lift',
                },
                sprites: [
                    {
                        id: 'guide',
                        alt: t('storyStage.demo.sprites.guide'),
                        bottom: '9%',
                        imageSrc: '/assets/sprites/andrew/andrew.webp',
                        maxHeight: '64vh',
                        maxWidth: '36vw',
                        mobileBottom: '25%',
                        mobileMaxHeight: '50vh',
                        mobileMaxWidth: '52vw',
                        mobileX: '35%',
                        name: t('storyStage.demo.sprites.guide'),
                        position: 'center',
                        scale: 1.06,
                        tone: 'cyan',
                        x: '37%',
                    },
                    {
                        id: 'city',
                        name: t('storyStage.demo.sprites.city'),
                        position: 'right',
                        tone: 'violet',
                    },
                ],
            },
            {
                id: 'choice',
                background: {
                    imageSrc: '/assets/img/bg/cylinder.jpg',
                    imageAlt: t('storyStage.demo.backgroundAlt'),
                },
                speaker: t('storyStage.demo.scenes.choice.speaker'),
                dialogue: t('storyStage.demo.scenes.choice.dialogue'),
                activeSpriteIds: ['guide'],
                transition: {
                    kind: 'fade',
                },
                sprites: [
                    {
                        id: 'guide',
                        alt: t('storyStage.demo.sprites.guide'),
                        bottom: '9%',
                        imageSrc: '/assets/sprites/andrew/andrew.webp',
                        maxHeight: '64vh',
                        maxWidth: '36vw',
                        mobileBottom: '25%',
                        mobileMaxHeight: '50vh',
                        mobileMaxWidth: '52vw',
                        mobileX: '29%',
                        name: t('storyStage.demo.sprites.guide'),
                        position: 'left',
                        scale: 1.06,
                        tone: 'cyan',
                        x: '27%',
                    },
                    {
                        id: 'gravity',
                        mobileBottom: '24%',
                        name: t('storyStage.demo.sprites.gravity'),
                        position: 'right',
                        tone: 'amber',
                    },
                ],
                choices: [
                    {
                        id: 'radius',
                        description: t(
                            'storyStage.demo.scenes.choice.radiusChoiceDescription',
                        ),
                        kind: 'info',
                        label: t('storyStage.demo.scenes.choice.radiusChoice'),
                        nextSceneId: 'radius',
                        resultTone: 'cyan',
                        scoreDelta: 1,
                    },
                    {
                        id: 'height',
                        description: t(
                            'storyStage.demo.scenes.choice.heightChoiceDescription',
                        ),
                        kind: 'advance',
                        label: t('storyStage.demo.scenes.choice.heightChoice'),
                        nextSceneId: 'height',
                        resultTone: 'amber',
                    },
                ],
            },
            {
                id: 'radius',
                background: {
                    imageSrc: '/assets/img/bg/construction-drum-light.jpg',
                    imageAlt: t('storyStage.demo.backgroundAlt'),
                },
                speaker: t('storyStage.demo.scenes.radius.speaker'),
                dialogue: t('storyStage.demo.scenes.radius.dialogue'),
                nextSceneId: 'choice',
                transition: {
                    durationMs: 420,
                    kind: 'lift',
                },
                sprites: [
                    {
                        id: 'gravity',
                        name: t('storyStage.demo.sprites.gravity'),
                        position: 'center',
                        tone: 'amber',
                        scale: 1.1,
                    },
                ],
            },
            {
                id: 'height',
                background: {
                    imageSrc: '/assets/img/bg/construction-drum-light-tilt.jpg',
                    imageAlt: t('storyStage.demo.backgroundAlt'),
                },
                speaker: t('storyStage.demo.scenes.height.speaker'),
                dialogue: t('storyStage.demo.scenes.height.dialogue'),
                nextSceneId: 'choice',
                transition: {
                    durationMs: 420,
                    kind: 'lift',
                },
                sprites: [
                    {
                        id: 'city',
                        name: t('storyStage.demo.sprites.city'),
                        position: 'center',
                        tone: 'violet',
                        scale: 1.1,
                    },
                ],
            },
        ],
        [t],
    );

    return (
        <AppLayout pageTitle={t('storyStage.pageTitle')}>
            <StoryStage
                active={isStageOpen}
                labels={{
                    back: t('storyStage.controls.back'),
                    close: t('storyStage.controls.close'),
                    history: t('storyStage.controls.history'),
                    historyEmpty: t('storyStage.controls.historyEmpty'),
                    historyTitle: t('storyStage.controls.historyTitle'),
                    next: t('storyStage.controls.next'),
                    progress: (current, total) =>
                        t('storyStage.controls.progress', {
                            current,
                            total,
                        }),
                    restart: t('storyStage.controls.restart'),
                    textSpeed: t('storyStage.controls.textSpeed'),
                    textSpeedFast: t('storyStage.controls.textSpeedFast'),
                    textSpeedInstant: t('storyStage.controls.textSpeedInstant'),
                    textSpeedSlow: t('storyStage.controls.textSpeedSlow'),
                }}
                onClose={() => setIsStageOpen(false)}
                resumeKey="story-stage-debug-progress"
                scenes={scenes}
            />

            <section className="relative overflow-hidden bg-[#08111f] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(125,211,252,0.18),transparent_30%),radial-gradient(circle_at_14%_72%,rgba(34,211,238,0.12),transparent_26%),linear-gradient(180deg,rgba(8,17,31,0.94),rgba(7,16,29,0.98)_72%,rgba(7,16,29,1))]" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.34)_1px,transparent_1px)] bg-size-[52px_52px] opacity-30"
                />
                <div className="relative mx-auto max-w-5xl px-4 py-16 sm:py-20">
                    <p className="text-xs font-semibold tracking-[0.28em] text-cyan-200/78 uppercase">
                        {t('storyStage.kicker')}
                    </p>
                    <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                        {t('storyStage.heading')}
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-cyan-50/76">
                        {t('storyStage.intro')}
                    </p>

                    <button
                        type="button"
                        onClick={() => setIsStageOpen(true)}
                        className="mt-8 cursor-pointer rounded bg-cyan-200 px-5 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-black/25 transition hover:bg-cyan-100 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:outline-none"
                    >
                        {t('storyStage.openButton')}
                    </button>
                </div>
            </section>
        </AppLayout>
    );
}
