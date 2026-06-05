import type {
    StoryStageScene,
    StoryStageSprite,
} from '@/components/story-stage';

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

interface HabitatStoryMetrics {
    innerBand: string;
    population: string;
    spinRate: string;
}

interface HabitatStoryOptions {
    metrics: HabitatStoryMetrics;
    onOpenControls: () => void;
    t: TranslationFunction;
}

const HABITAT_BACKGROUND = {
    imageAlt: 'Futuristic orbital habitat realtor office',
    imageSrc: '/assets/img/bg/habitat-realtor-office.png',
};

const CYLINDER_INTERIOR_BACKGROUND = {
    imageAlt: "Interior view of a large O'Neill Cylinder habitat",
    imageSrc: '/assets/img/bg/habitat-cylinder-interior-v3.png',
};

const REALTOR_SPRITE = {
    id: 'realtor',
    bottom: '13%',
    maxHeight: '54vh',
    maxWidth: '30vw',
    mobileBottom: '25%',
    mobileMaxHeight: '42vh',
    mobileMaxWidth: '48vw',
    mobileX: '30%',
    name: 'Realtor',
    position: 'left',
    scale: 0.98,
    tone: 'violet',
    x: '28%',
} satisfies StoryStageSprite;

const CENTERED_REALTOR_SPRITE = {
    ...REALTOR_SPRITE,
    mobileX: '50%',
    position: 'center',
    x: '50%',
} satisfies StoryStageSprite;

const CENTERED_MARIS_SPRITE = {
    ...CENTERED_REALTOR_SPRITE,
    name: 'Maris',
} satisfies StoryStageSprite;

const MARIS_SPRITE = {
    ...REALTOR_SPRITE,
    name: 'Maris',
} satisfies StoryStageSprite;

const CYLINDER_SPRITE = {
    id: 'cylinder',
    alt: "O'Neill Cylinder habitat sprite",
    bottom: '17%',
    imageSrc: '/assets/sprites/habitat/oneill-cylinder-v3.webp',
    maxHeight: '46vh',
    maxWidth: '28vw',
    mobileBottom: '26%',
    mobileMaxHeight: '34vh',
    mobileMaxWidth: '38vw',
    mobileX: '71%',
    name: 'Can City',
    position: 'right',
    tone: 'cyan',
    x: '73%',
} satisfies StoryStageSprite;

const TORUS_SPRITE = {
    id: 'torus',
    alt: 'Stanford Torus habitat sprite',
    bottom: '17%',
    imageSrc: '/assets/sprites/habitat/stanford-torus.webp',
    maxHeight: '46vh',
    maxWidth: '28vw',
    mobileBottom: '26%',
    mobileMaxHeight: '34vh',
    mobileMaxWidth: '38vw',
    mobileX: '71%',
    name: 'Stanford Torus',
    position: 'right',
    tone: 'amber',
    x: '73%',
} satisfies StoryStageSprite;

export function buildHabitatStoryScenes({
    metrics,
    onOpenControls,
    t,
}: HabitatStoryOptions): StoryStageScene[] {
    return [
        {
            id: 'habitat-arrival',
            background: HABITAT_BACKGROUND,
            speaker: t('habitat.stage.scenes.arrival.speaker'),
            dialogue: t('habitat.stage.scenes.arrival.dialogue'),
            activeSpriteIds: ['realtor'],
            nextSceneId: 'habitat-introduction',
            sprites: [CENTERED_REALTOR_SPRITE],
            transition: {
                kind: 'fade',
            },
        },
        {
            id: 'habitat-introduction',
            background: HABITAT_BACKGROUND,
            speaker: t('habitat.stage.scenes.introduction.speaker'),
            dialogue: t('habitat.stage.scenes.introduction.dialogue'),
            activeSpriteIds: ['realtor'],
            nextSceneId: 'habitat-upside-down',
            sprites: [CENTERED_MARIS_SPRITE],
            transition: {
                kind: 'fade',
            },
        },
        {
            id: 'habitat-upside-down',
            background: CYLINDER_INTERIOR_BACKGROUND,
            speaker: t('habitat.stage.scenes.upsideDown.speaker'),
            dialogue: t('habitat.stage.scenes.upsideDown.dialogue'),
            activeSpriteIds: ['cylinder'],
            nextSceneId: 'habitat-torus',
            sprites: [
                {
                    ...MARIS_SPRITE,
                    presence: 'idle',
                },
                CYLINDER_SPRITE,
            ],
            transition: {
                durationMs: 520,
                kind: 'lift',
            },
        },
        {
            id: 'habitat-torus',
            background: CYLINDER_INTERIOR_BACKGROUND,
            speaker: t('habitat.stage.scenes.torus.speaker'),
            dialogue: t('habitat.stage.scenes.torus.dialogue'),
            activeSpriteIds: ['torus'],
            nextSceneId: 'habitat-readout',
            sprites: [
                {
                    ...MARIS_SPRITE,
                    presence: 'idle',
                },
                TORUS_SPRITE,
            ],
            transition: {
                durationMs: 640,
                kind: 'lift',
            },
        },
        {
            id: 'habitat-readout',
            background: CYLINDER_INTERIOR_BACKGROUND,
            speaker: t('habitat.stage.scenes.readout.speaker'),
            dialogue: t('habitat.stage.scenes.readout.dialogue', {
                area: metrics.innerBand,
                population: metrics.population,
                spin: metrics.spinRate,
            }),
            activeSpriteIds: ['realtor'],
            nextSceneId: 'habitat-choice',
            sprites: [
                MARIS_SPRITE,
                {
                    ...CYLINDER_SPRITE,
                    presence: 'idle',
                },
            ],
            transition: {
                kind: 'fade',
            },
        },
        {
            id: 'habitat-choice',
            background: CYLINDER_INTERIOR_BACKGROUND,
            speaker: t('habitat.stage.scenes.choice.speaker'),
            dialogue: t('habitat.stage.scenes.choice.dialogue'),
            activeSpriteIds: ['realtor'],
            choices: [
                {
                    id: 'open-controls',
                    kind: 'advance',
                    label: t('habitat.stage.scenes.choice.openControls'),
                    onSelect: onOpenControls,
                    resultTone: 'green',
                },
                {
                    id: 'stay-in-story',
                    kind: 'info',
                    label: t('habitat.stage.scenes.choice.stayInStory'),
                    nextSceneId: 'habitat-upside-down',
                    resultTone: 'cyan',
                },
            ],
            sprites: [
                MARIS_SPRITE,
                {
                    ...CYLINDER_SPRITE,
                    presence: 'idle',
                },
            ],
            transition: {
                kind: 'fade',
            },
        },
    ];
}
