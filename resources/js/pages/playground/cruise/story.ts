import type {
    StoryStageScene,
    StoryStageSprite,
} from '@/components/story-stage';

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

interface CruiseStoryState {
    departure: string;
    route: string;
}

interface CruiseStoryOptions {
    onStartPlanning: () => void;
    state: CruiseStoryState;
    t: TranslationFunction;
}

const CRUISE_BACKGROUND = {
    imageAlt: 'Star field background',
    imageSrc: '/assets/img/bg/stars.jpg',
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

const ROUTE_SPRITE = {
    id: 'route',
    mobileBottom: '24%',
    name: 'Route desk',
    position: 'right',
    tone: 'amber',
} satisfies StoryStageSprite;

export function buildCruiseStoryScenes({
    onStartPlanning,
    state,
    t,
}: CruiseStoryOptions): StoryStageScene[] {
    return [
        {
            id: 'cruise-desk',
            background: CRUISE_BACKGROUND,
            speaker: t('cruise.stage.scenes.desk.speaker'),
            dialogue: t('cruise.stage.scenes.desk.dialogue'),
            activeSpriteIds: ['guide'],
            nextSceneId: 'cruise-motion',
            sprites: [
                GUIDE_SPRITE,
                {
                    ...ROUTE_SPRITE,
                    presence: 'dormant',
                    desaturation: 0.72,
                },
            ],
            transition: {
                kind: 'fade',
            },
        },
        {
            id: 'cruise-motion',
            background: CRUISE_BACKGROUND,
            speaker: t('cruise.stage.scenes.motion.speaker'),
            dialogue: t('cruise.stage.scenes.motion.dialogue'),
            activeSpriteIds: ['route'],
            nextSceneId: 'cruise-manifest',
            sprites: [
                {
                    ...GUIDE_SPRITE,
                    position: 'center',
                    x: '37%',
                    mobileX: '35%',
                    presence: 'idle',
                },
                ROUTE_SPRITE,
            ],
            transition: {
                durationMs: 520,
                kind: 'lift',
            },
        },
        {
            id: 'cruise-manifest',
            background: CRUISE_BACKGROUND,
            speaker: t('cruise.stage.scenes.manifest.speaker'),
            dialogue: t('cruise.stage.scenes.manifest.dialogue', {
                departure: state.departure,
                route: state.route,
            }),
            activeSpriteIds: ['guide'],
            nextSceneId: 'cruise-choice',
            sprites: [
                GUIDE_SPRITE,
                {
                    ...ROUTE_SPRITE,
                    presence: 'idle',
                },
            ],
            transition: {
                kind: 'fade',
            },
        },
        {
            id: 'cruise-choice',
            background: CRUISE_BACKGROUND,
            speaker: t('cruise.stage.scenes.choice.speaker'),
            dialogue: t('cruise.stage.scenes.choice.dialogue'),
            activeSpriteIds: ['guide'],
            choices: [
                {
                    id: 'planner',
                    kind: 'advance',
                    label: t('cruise.stage.scenes.choice.planner'),
                    onSelect: onStartPlanning,
                    resultTone: 'green',
                },
                {
                    id: 'motion',
                    kind: 'info',
                    label: t('cruise.stage.scenes.choice.motion'),
                    nextSceneId: 'cruise-motion',
                    resultTone: 'cyan',
                },
            ],
            sprites: [
                GUIDE_SPRITE,
                {
                    ...ROUTE_SPRITE,
                    presence: 'idle',
                },
            ],
            transition: {
                kind: 'fade',
            },
        },
    ];
}
