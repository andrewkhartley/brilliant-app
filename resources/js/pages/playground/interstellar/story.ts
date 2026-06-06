import type {
    StoryStageScene,
    StoryStageSprite,
} from '@/components/story-stage';

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

interface InterstellarStoryMetrics {
    destination: string;
    earthTime: string;
    fuel: string;
    massRatio: string;
    travelerTime: string;
}

interface InterstellarStoryOptions {
    metrics: InterstellarStoryMetrics;
    onReturnToCalculator: () => void;
    t: TranslationFunction;
}

const INTERSTELLAR_BACKGROUND = {
    imageAlt: 'Deep star field and nebula background',
    imageSrc: '/assets/img/bg/jwst-nebula.jpg',
};

const GUIDE_SPRITE = {
    id: 'planner',
    alt: 'Nisha, interstellar settlement planner',
    bottom: '-8%',
    imageSrc: '/assets/sprites/nisha/nisha.webp',
    maxHeight: '75vh',
    maxWidth: '42vw',
    mobileBottom: '7%',
    mobileMaxHeight: '60vh',
    mobileMaxWidth: '66vw',
    mobileX: '32%',
    name: 'Nisha',
    position: 'left',
    scale: 1.06,
    tone: 'cyan',
    x: '27%',
} satisfies StoryStageSprite;

export function buildInterstellarStoryScenes({
    metrics,
    onReturnToCalculator,
    t,
}: InterstellarStoryOptions): StoryStageScene[] {
    return [
        {
            id: 'interstellar-arrival',
            background: INTERSTELLAR_BACKGROUND,
            speaker: t('interstellar.stage.scenes.arrival.speaker'),
            dialogue: t('interstellar.stage.scenes.arrival.dialogue', {
                destination: metrics.destination,
            }),
            activeSpriteIds: ['planner'],
            nextSceneId: 'interstellar-time',
            sprites: [GUIDE_SPRITE],
            transition: {
                kind: 'fade',
            },
        },
        {
            id: 'interstellar-time',
            background: INTERSTELLAR_BACKGROUND,
            speaker: t('interstellar.stage.scenes.time.speaker'),
            dialogue: t('interstellar.stage.scenes.time.dialogue', {
                earthTime: metrics.earthTime,
                travelerTime: metrics.travelerTime,
            }),
            activeSpriteIds: ['planner'],
            nextSceneId: 'interstellar-energy',
            sprites: [
                {
                    ...GUIDE_SPRITE,
                    position: 'center',
                    x: '37%',
                    mobileX: '35%',
                },
            ],
            transition: {
                durationMs: 520,
                kind: 'lift',
            },
        },
        {
            id: 'interstellar-energy',
            background: INTERSTELLAR_BACKGROUND,
            speaker: t('interstellar.stage.scenes.energy.speaker'),
            dialogue: t('interstellar.stage.scenes.energy.dialogue', {
                fuel: metrics.fuel,
                massRatio: metrics.massRatio,
            }),
            activeSpriteIds: ['planner'],
            nextSceneId: 'interstellar-choice',
            sprites: [GUIDE_SPRITE],
            transition: {
                kind: 'fade',
            },
        },
        {
            id: 'interstellar-choice',
            background: INTERSTELLAR_BACKGROUND,
            speaker: t('interstellar.stage.scenes.choice.speaker'),
            dialogue: t('interstellar.stage.scenes.choice.dialogue'),
            activeSpriteIds: ['planner'],
            choices: [
                {
                    id: 'calculator',
                    kind: 'advance',
                    label: t('interstellar.stage.scenes.choice.calculator'),
                    onSelect: onReturnToCalculator,
                    resultTone: 'green',
                },
                {
                    id: 'time-again',
                    kind: 'info',
                    label: t('interstellar.stage.scenes.choice.timeAgain'),
                    nextSceneId: 'interstellar-time',
                    resultTone: 'cyan',
                },
            ],
            sprites: [GUIDE_SPRITE],
            transition: {
                kind: 'fade',
            },
        },
    ];
}
