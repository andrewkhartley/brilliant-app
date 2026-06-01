import { Layer, MultiPlaneScene } from '@/components/multi-plane-scene';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Hero section — landing page first impression.
 *
 * Composition uses 5 layers, all positioned `full` (back) or `bottom`
 * (foreground) — no top-anchored layers, so the upper half of the scene is
 * unobstructed sky and the user's eye is drawn up toward it.
 *
 * The image set maps directly onto the MultiPlaneScene depth model:
 * - Sky (depth=0.95): far background, full frame
 * - Distant nebula (depth=0.7): full-frame atmospheric overlay
 * - Near nebula veil (depth=0.45): closer overlay with center kept readable
 * - Horizon band (depth=0.2): bottom-anchored, viewport-height scaled
 * - Observation rail (depth=0.05): bottom-anchored foreground POV
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
    const showHorizonLayer = true;
    const showRailLayer = true;

    return (
        <MultiPlaneScene height="100vh" parallaxStrength={0.6} atmosphere>
            <Layer
                src="/assets/scenes/landing-hero/sky.png"
                label={t('landing.hero.layers.sky')}
                position="full"
                depth={0.95}
                imagePosition="center top"
            />
            <Layer
                src="/assets/scenes/landing-hero/distant-nebula.png"
                label={t('landing.hero.layers.distantNebula')}
                position="full"
                depth={0.7}
                opacity={{ from: 0.5 }}
                imagePosition="center center"
            />
            <Layer
                src="/assets/scenes/landing-hero/near-veil.png"
                label={t('landing.hero.layers.nearNebula')}
                position="full"
                depth={0.45}
                opacity={{ from: 0.42 }}
                imagePosition="center center"
            />
            {showHorizonLayer && (
                <Layer
                    src="/assets/scenes/landing-hero/horizon.png"
                    label={t('landing.hero.layers.horizon')}
                    position="full"
                    depth={0.2}
                    opacity={{ from: 0.72 }}
                    imagePosition="center bottom"
                />
            )}
            {showRailLayer && (
                <Layer
                    src="/assets/scenes/landing-hero/foreground-rail.png"
                    label={t('landing.hero.layers.rail')}
                    position="bottom"
                    depth={0.05}
                    motion="static"
                    opacity={{ from: 0.92 }}
                    size="30vh"
                    edgeBleed="1vh"
                    imagePosition="center bottom"
                />
            )}

            <div className="pointer-events-auto absolute inset-x-0 top-[43%] z-[110] mx-auto max-w-4xl -translate-y-1/2 px-6 text-center text-white select-text">
                <h1 className="text-4xl font-semibold tracking-normal drop-shadow-lg sm:text-5xl md:text-7xl">
                    <span className="block">
                        {t('landing.hero.titleLine1')}
                    </span>
                    <span className="mt-1 block text-cyan-100 [text-shadow:0_0_28px_rgba(125,211,252,0.42)] sm:mt-2">
                        {t('landing.hero.titleLine2')}
                    </span>
                </h1>
                <div className="mx-auto mt-7 flex max-w-3xl items-center justify-center gap-4 sm:gap-5">
                    <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-gradient-to-l from-cyan-200/58 to-transparent"
                    />
                    <p className="shrink-0 text-xs leading-5 font-semibold tracking-[0.26em] text-cyan-200/90 uppercase drop-shadow-md sm:text-sm">
                        <span>{t('landing.hero.subtitleLine1')}</span>
                        <span className="block sm:inline">
                            <span className="hidden sm:inline"> </span>
                            {t('landing.hero.subtitleLine2')}
                        </span>
                    </p>
                    <span
                        aria-hidden="true"
                        className="h-px flex-1 bg-gradient-to-r from-cyan-200/58 to-transparent"
                    />
                </div>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/82 drop-shadow-md sm:text-base">
                    {t('landing.hero.pitchPrefix')}{' '}
                    <strong className="font-semibold whitespace-nowrap text-cyan-100 [text-shadow:0_0_18px_rgba(125,211,252,0.36)]">
                        {t('landing.hero.pitchEmphasis')}
                    </strong>
                    {' and '}
                    {t('landing.hero.pitchSecond')}
                    {', '}
                    {t('landing.hero.pitchThird')}
                    {'.'}
                </p>
            </div>
        </MultiPlaneScene>
    );
}
