import type { StoryStageLabels } from './types';

type TranslationFunction = (
    key: string,
    replacements?: Record<string, string | number>,
) => string;

export function buildStoryStageLabels(
    t: TranslationFunction,
): StoryStageLabels {
    return {
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
    };
}
