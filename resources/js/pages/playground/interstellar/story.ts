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
    id: 'guide',
    alt: 'Andrew',
    bottom: '9%',
    imageSrc: '/assets/sprites/andrew/andrew.webp',
    maxHeight: '64vh',
    maxWidth: '36vw',
    mobileBottom: '25%',
    mobileMaxHeight: '50vh',
    mobileMaxWidth: '52vw',
    mobileX: '29%',
    name: 'Andrew',
    position: 'left',
    scale: 1.06,
    tone: 'cyan',
    x: '27%',
} satisfies StoryStageSprite;

const CLOCK_SPRITE = {
    id: 'clock',
    mobileBottom: '24%',
    name: 'Ship clock',
    position: 'right',
    tone: 'violet',
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
            activeSpriteIds: ['guide'],
            nextSceneId: 'interstellar-time',
            sprites: [
                GUIDE_SPRITE,
                {
                    ...CLOCK_SPRITE,
                    presence: 'dormant',
                    desaturation: 0.75,
                },
            ],
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
            activeSpriteIds: ['clock'],
            nextSceneId: 'interstellar-energy',
            sprites: [
                {
                    ...GUIDE_SPRITE,
                    position: 'center',
                    x: '37%',
                    mobileX: '35%',
                    presence: 'idle',
                },
                CLOCK_SPRITE,
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
            activeSpriteIds: ['guide'],
            nextSceneId: 'interstellar-choice',
            sprites: [
                GUIDE_SPRITE,
                {
                    ...CLOCK_SPRITE,
                    presence: 'idle',
                },
            ],
            transition: {
                kind: 'fade',
            },
        },
        {
            id: 'interstellar-choice',
            background: INTERSTELLAR_BACKGROUND,
            speaker: t('interstellar.stage.scenes.choice.speaker'),
            dialogue: t('interstellar.stage.scenes.choice.dialogue'),
            activeSpriteIds: ['guide'],
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
            sprites: [
                GUIDE_SPRITE,
                {
                    ...CLOCK_SPRITE,
                    presence: 'idle',
                },
            ],
            transition: {
                kind: 'fade',
            },
        },
    ];
}
