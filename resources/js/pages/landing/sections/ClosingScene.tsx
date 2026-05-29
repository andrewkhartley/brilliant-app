import {
    Caption,
    Layer,
    MultiPlaneScene,
} from '@/components/multi-plane-scene';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * ClosingScene section — dawn inside an O'Neill Cylinder.
 *
 * The landing page's final multi-plane scene. Per spec: "Caption-only prose
 * tying Andrew's craft to Brilliant's" — the multi-plane scene IS the visual
 * and the captions carry the closing narrative. Unlike CovidOrigin (which has
 * a visible h2 + intro block ABOVE the scene), this section's h2 is sr-only:
 * it sits in the document outline for AT users and SEO but does not appear
 * visually, keeping the closing impact purely cinematic.
 *
 * Composition uses 3 full-coverage layers stacked deep-to-shallow. All layers
 * use travel="centered" — a window-onto-world perspective. The user is
 * looking THROUGH a window AT the cylinder dawn; the camera doesn't dolly
 * forward, it sits and watches the sun-line catch the curved horizon.
 *
 * v1 ships with placeholder color layers; v2 art replaces each layer:
 * - Cylinder horizon (depth=0.9) → wide-field painting of the O'Neill interior
 *   at dawn, curving land visible to the top and bottom of the cylinder's
 *   central axis
 * - Sun-line haze (depth=0.55) → mid-distance amber atmospheric glow from the
 *   cylinder's axial mirror system catching the rotation's "dawn"
 * - Cylinder frame (depth=0.1) → foreground rendering of structural ribbing
 *   or window mullions through which the dawn scene is viewed
 *
 * parallaxStrength=0.55 is gentler than Hero's 0.6 and CovidOrigin's 0.85 —
 * a contemplative closing scene asks for restraint. atmosphere haze attaches
 * to the deepest cylinder-horizon layer (depth>0.7) for distant-air feel.
 *
 * No top border: the WhatElse section above is light prose-with-cards; this
 * section is a dark MultiPlaneScene. The color contrast itself defines the
 * visual break — a hairline border between them would read as a stray
 * underline (same reason Hero and CovidOrigin drop the border).
 */
export function ClosingScene() {
    const { t } = useTranslation();

    return (
        <section>
            <h2 className="sr-only">{t('landing.closingScene.heading')}</h2>

            <MultiPlaneScene height="100vh" parallaxStrength={0.55} atmosphere>
                <Layer
                    color="#082f49"
                    label={t('landing.closingScene.layers.cylinderHorizon')}
                    position="full"
                    depth={0.9}
                    travel="centered"
                />
                <Layer
                    color="#fb923c"
                    label={t('landing.closingScene.layers.sunLine')}
                    position="full"
                    depth={0.55}
                    travel="centered"
                />
                <Layer
                    color="#334155"
                    label={t('landing.closingScene.layers.frame')}
                    position="full"
                    depth={0.1}
                    travel="centered"
                />

                <Caption at={0.15} align="center">
                    {t('landing.closingScene.caption.opening')}
                </Caption>
                <Caption at={0.5} align="center">
                    {t('landing.closingScene.caption.midReflection')}
                </Caption>
                <Caption at={0.85} align="center">
                    {t('landing.closingScene.caption.close')}
                </Caption>
            </MultiPlaneScene>
        </section>
    );
}
