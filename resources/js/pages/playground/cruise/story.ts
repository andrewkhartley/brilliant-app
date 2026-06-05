import type {
    StoryStageScene,
    StoryStageSprite,
} from '@/components/story-stage';

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

interface CruiseStoryOptions {
    onStartPlanning: () => void;
    t: TranslationFunction;
}

const CRUISE_BACKGROUND = {
    imageAlt: 'Star field background',
    imageSrc: '/assets/img/bg/stars.jpg',
};

const GUIDE_SPRITE = {
    id: 'mateo',
    alt: 'Mateo Silva, Sol Cruise travel agent',
    bottom: '-8%',
    imageSrc: '/assets/sprites/mateo/mateo.webp',
    maxHeight: '75vh',
    maxWidth: '42vw',
    mobileBottom: '7%',
    mobileMaxHeight: '60vh',
    mobileMaxWidth: '66vw',
    mobileX: '29%',
    name: 'Mateo',
    position: 'left',
    scale: 1.06,
    tone: 'cyan',
    x: '27%',
} satisfies StoryStageSprite;

export function buildCruiseStoryScenes({
    onStartPlanning,
    t,
}: CruiseStoryOptions): StoryStageScene[] {
    return [
        {
            id: 'cruise-desk',
            background: CRUISE_BACKGROUND,
            speaker: t('cruise.stage.scenes.desk.speaker'),
            dialogue: t('cruise.stage.scenes.desk.dialogue'),
            activeSpriteIds: ['mateo'],
            nextSceneId: 'cruise-motion',
            sprites: [GUIDE_SPRITE],
            transition: {
                kind: 'fade',
            },
        },
        {
            id: 'cruise-motion',
            background: CRUISE_BACKGROUND,
            speaker: t('cruise.stage.scenes.motion.speaker'),
            dialogue: t('cruise.stage.scenes.motion.dialogue'),
            activeSpriteIds: ['mateo'],
            nextSceneId: 'cruise-manifest',
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
            id: 'cruise-manifest',
            background: CRUISE_BACKGROUND,
            speaker: t('cruise.stage.scenes.manifest.speaker'),
            dialogue: t('cruise.stage.scenes.manifest.dialogue'),
            activeSpriteIds: ['mateo'],
            nextSceneId: 'cruise-choice',
            sprites: [GUIDE_SPRITE],
            transition: {
                kind: 'fade',
            },
        },
        {
            id: 'cruise-choice',
            background: CRUISE_BACKGROUND,
            speaker: t('cruise.stage.scenes.choice.speaker'),
            dialogue: t('cruise.stage.scenes.choice.dialogue'),
            activeSpriteIds: ['mateo'],
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
            sprites: [GUIDE_SPRITE],
            transition: {
                kind: 'fade',
            },
        },
    ];
}
