import type { ReactNode } from 'react';

export type StoryStageSpritePosition =
    | 'left'
    | 'center'
    | 'right'
    | 'offLeft'
    | 'offRight';
export type StoryStageSpritePresence = 'active' | 'idle' | 'dormant';
export type StoryStageChoiceKind =
    | 'advance'
    | 'info'
    | 'navigation'
    | 'quiz'
    | 'reflection';
export type StoryStageChoiceResultTone = 'green' | 'cyan' | 'amber' | 'red';
export type StoryStageTransitionKind = 'fade' | 'lift' | 'none';

export interface StoryStageBackground {
    imageAlt: string;
    imageSrc: string;
}

export interface StoryStageTransition {
    durationMs?: number;
    kind: StoryStageTransitionKind;
}

export interface StoryStageSprite {
    alt?: string;
    bottom?: string;
    desaturation?: number;
    durationMs?: number;
    id: string;
    imageSrc?: string;
    maxHeight?: string;
    maxWidth?: string;
    name: string;
    position: StoryStageSpritePosition;
    presence?: StoryStageSpritePresence;
    scale?: number;
    tone?: 'cyan' | 'amber' | 'violet' | 'slate';
    x?: string;
}

export interface StoryStageChoice {
    description?: string;
    disabled?: boolean;
    id: string;
    isCorrect?: boolean;
    kind?: StoryStageChoiceKind;
    label: string;
    metadata?: Record<string, string | number | boolean>;
    nextSceneId?: string;
    onSelect?: () => void;
    resultTone?: StoryStageChoiceResultTone;
    scoreDelta?: number;
}

export interface StoryStageScene {
    activeSpriteIds?: string[];
    background: StoryStageBackground;
    choices?: StoryStageChoice[];
    dialogue: string;
    id: string;
    nextSceneId?: string;
    speaker?: string;
    sprites?: StoryStageSprite[];
    transition?: StoryStageTransition;
}

export interface StoryStageLabels {
    back: string;
    close: string;
    history: string;
    historyEmpty: string;
    historyTitle: string;
    next: string;
    progress: (current: number, total: number) => string;
    restart: string;
}

export interface StoryStageProps {
    active: boolean;
    children?: ReactNode;
    initialSceneId?: string;
    labels: StoryStageLabels;
    onClose: () => void;
    onSceneChange?: (scene: StoryStageScene) => void;
    reducedMotion?: boolean;
    resumeKey?: string;
    scenes: StoryStageScene[];
}
