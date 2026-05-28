import {
    Caption,
    Layer,
    MultiPlaneScene,
} from '@/components/multi-plane-scene';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Hero section — landing page first impression.
 *
 * Composition uses 5 layers, all positioned `full` (back) or `bottom`
 * (foreground) — no top-anchored layers, so the upper half of the scene is
 * unobstructed sky and the user's eye is drawn up toward it.
 *
 * v1 ships with placeholder color layers; v2 art replaces each layer:
 * - JWST sky (depth=0.95) → wide-field JWST-style deep sky image
 * - Distant nebula (depth=0.7) → far-distance nebula band
 * - Near nebula veil (depth=0.45) → closer nebula with stars peeking through
 * - Horizon band (depth=0.2) → atmospheric horizon line (curving land, mist,
 *   or distant landscape) anchored to the bottom edge
 * - Observation deck rail (depth=0.05) → foreground brass rail anchored to
 *   the bottom edge; the viewer's POV
 *
 * Camera tracks forward (viewportAnchored travel mode) — the far sky drifts
 * most, the foreground rail stays anchored. Two full-coverage nebula layers
 * create cosmic depth between the sky and the horizon line.
 *
 * Composition: static title block overlaid on the multi-plane scene. The
 * page's single <h1> + subtitle + pitch render as a centered, always-visible
 * overlay above the colored layers; one Caption fades in later in the scroll
 * arc for a secondary line. The h1 stays in the DOM unconditionally so
 * semantics and SEO are preserved (it is NOT a Caption — Caption uses
 * scroll-driven opacity, which would make the page's only h1 transiently
 * invisible). The Caption-overlay path was rejected for this reason; the
 * static-title-block keeps the title legible at all scroll positions while
 * still letting the scene's parallax do its work behind it.
 *
 * No top border: this is the first section after <Nav> — a border-t would
 * read as a stray underline. The MultiPlaneScene's own dark background
 * delimits the section visually.
 */
export function Hero() {
    const { t } = useTranslation();

    return (
        <MultiPlaneScene height="100vh" parallaxStrength={0.6} atmosphere>
            <Layer
                color="#1e1b4b"
                label={t('landing.hero.layers.sky')}
                position="full"
                depth={0.95}
            />
            <Layer
                color="#4c1d95"
                label={t('landing.hero.layers.distantNebula')}
                position="full"
                depth={0.7}
            />
            <Layer
                color="#7c3aed"
                label={t('landing.hero.layers.nearNebula')}
                position="full"
                depth={0.45}
            />
            <Layer
                color="#3f3f46"
                label={t('landing.hero.layers.horizon')}
                position="bottom"
                depth={0.2}
            />
            <Layer
                color="#44403c"
                label={t('landing.hero.layers.rail')}
                position="bottom"
                depth={0.05}
            />

            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[110] mx-auto max-w-3xl -translate-y-1/2 px-6 text-center text-white">
                <h1 className="text-4xl font-semibold tracking-tight drop-shadow-lg sm:text-5xl md:text-6xl">
                    {t('landing.hero.title')}
                </h1>
                <p className="mt-6 text-lg font-medium tracking-wide text-white/90 drop-shadow-md sm:text-xl">
                    {t('landing.hero.subtitle')}
                </p>
                <p className="mx-auto mt-4 max-w-xl text-sm text-white/80 drop-shadow-md sm:text-base">
                    {t('landing.hero.pitch')}
                </p>
            </div>

            <Caption at={0.75} align="center">
                {t('landing.hero.caption.subtitle')}
            </Caption>
        </MultiPlaneScene>
    );
}
