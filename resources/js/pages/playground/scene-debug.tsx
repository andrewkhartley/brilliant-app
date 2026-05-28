import {
    Caption,
    LayerStack,
    MultiPlaneScene
    
} from '@/components/multi-plane-scene';
import type {LayerStackItem} from '@/components/multi-plane-scene';
import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

const bridgeMiddleLayers: LayerStackItem[] = [
    {
        id: 'bridge-background',
        src: '/assets/scenes/starship-bridge-test/bridge-background.png',
        depth: 0.64,
        motion: 'track',
        size: '164vh',
        travel: 'viewportAnchored',
        imageFit: 'cover',
        imagePosition: 'center top',
        alt: '',
    },
];

const bridgeTopLayers: LayerStackItem[] = [
    {
        id: 'mid-top',
        src: '/assets/scenes/starship-bridge-test/mid-top.png',
        depth: 0.42,
        motion: 'track',
        size: '22vh',
        edgeBleed: '16vh',
        travel: 'viewportAnchored',
        imageFit: 'cover',
        imagePosition: 'center top',
        alt: '',
    },
    {
        id: 'near-top',
        src: '/assets/scenes/starship-bridge-test/near-top.png',
        depth: 0,
        motion: 'track',
        size: '40vh',
        edgeBleed: '10vh',
        travel: 'viewportAnchored',
        imageFit: 'cover',
        imagePosition: 'center top',
        alt: '',
    },
];

const bridgeBottomLayers: LayerStackItem[] = [
    {
        id: 'mid-bottom',
        src: '/assets/scenes/starship-bridge-test/mid-bottom.png',
        depth: 0.42,
        motion: 'track',
        size: '24vh',
        edgeBleed: '32vh',
        travel: 'viewportAnchored',
        imageFit: 'cover',
        imagePosition: 'center bottom',
        alt: '',
    },
    {
        id: 'near-bottom',
        src: '/assets/scenes/starship-bridge-test/near-bottom.png',
        depth: 0,
        motion: 'track',
        size: '44vh',
        edgeBleed: '28vh',
        travel: 'viewportAnchored',
        imageFit: 'cover',
        imagePosition: 'center bottom',
        alt: '',
    },
];

export default function SceneDebug() {
    const { t } = useTranslation();

    return (
        <AppLayout pageTitle={t('playground.sceneDebug.title')}>
            <section className="mx-auto max-w-3xl px-4 py-12">
                <h1 className="text-3xl font-bold tracking-tight">
                    {t('playground.sceneDebug.title')}
                </h1>
                <p className="mt-4 text-neutral-700">
                    {t('playground.sceneDebug.intro')}
                </p>
                <p className="mt-2 text-sm text-neutral-500">
                    {t('playground.sceneDebug.reducedMotionNote')}
                </p>
            </section>

            <section className="h-screen bg-neutral-50" aria-hidden="true" />

            <MultiPlaneScene height="100vh" parallaxStrength={0.72} atmosphere>
                <LayerStack
                    middle={bridgeMiddleLayers}
                    top={bridgeTopLayers}
                    bottom={bridgeBottomLayers}
                />
                <Caption at={0.12}>
                    {t('playground.sceneDebug.caption.opening')}
                </Caption>
                <Caption at={0.52}>
                    {t('playground.sceneDebug.caption.midReveal')}
                </Caption>
                <Caption at={0.88}>
                    {t('playground.sceneDebug.caption.close')}
                </Caption>
            </MultiPlaneScene>

            <section className="h-[150vh] bg-neutral-50" aria-hidden="true" />
        </AppLayout>
    );
}
