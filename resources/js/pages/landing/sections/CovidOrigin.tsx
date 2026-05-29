import {
    Caption,
    Layer,
    MultiPlaneScene,
} from '@/components/multi-plane-scene';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * CovidOrigin section — March 2020 lecture hall scrollytelling.
 *
 * Composition uses 3 full-coverage layers stacked deep-to-shallow. The far
 * lecture-hall walls drift outward while the slide deck stays anchored,
 * producing a "camera dollies toward the slide" feel as the user scrolls. The
 * intro block (h2 + opening prose) sits ABOVE the scene as ordinary document
 * flow so the section heading lives in the page outline for a11y, while the
 * narrative progression lives inside the scene as three timed Captions.
 *
 * v1 ships with placeholder color layers; v2 art replaces each layer:
 * - Lecture hall walls (depth=0.85) → darkened auditorium walls / back rows,
 *   soft amber spill from the projector
 * - Zoom panel grid / seats (depth=0.45) → mid-distance grid of webcam tiles
 *   (the 47 panels of the spec) softened into a checkered glow
 * - Glowing slide deck (depth=0.05) → foreground projector slide — the focal
 *   point. Stays fixed (motion="static") while the back walls dolly outward.
 *
 * Travel is set to viewportAnchored on the two back layers, so the camera
 * reads as dollying forward toward the slide deck. Atmosphere haze attaches
 * to the deepest hall-walls layer (depth>0.7) for room-air feel.
 *
 * No top border: both Hero and CovidOrigin are dark MultiPlaneScenes — a
 * border-t would read as a stray hairline between two dark sections. The
 * scroll itself provides the transition.
 */
export function CovidOrigin() {
    const { t } = useTranslation();

    return (
        <section>
            <div className="mx-auto max-w-3xl px-4 py-16 text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                    {t('landing.covidOrigin.heading')}
                </h2>
                <p className="mt-4 text-lg text-neutral-700">
                    {t('landing.covidOrigin.intro')}
                </p>
            </div>

            <MultiPlaneScene height="120vh" parallaxStrength={0.85} atmosphere>
                <Layer
                    color="#0c0a09"
                    label={t('landing.covidOrigin.layers.lectureHall')}
                    position="full"
                    depth={0.85}
                    travel="viewportAnchored"
                />
                <Layer
                    color="#3f3f46"
                    label={t('landing.covidOrigin.layers.seats')}
                    position="full"
                    depth={0.45}
                    travel="viewportAnchored"
                />
                <Layer
                    color="#f59e0b"
                    label={t('landing.covidOrigin.layers.slideDeck')}
                    position="full"
                    depth={0.05}
                    motion="static"
                />

                <Caption at={0.15} align="center">
                    {t('landing.covidOrigin.caption.opening')}
                </Caption>
                <Caption at={0.5} align="center">
                    {t('landing.covidOrigin.caption.midReveal')}
                </Caption>
                <Caption at={0.85} align="center">
                    {t('landing.covidOrigin.caption.close')}
                </Caption>
            </MultiPlaneScene>
        </section>
    );
}
