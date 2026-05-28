import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

import { ClosingScene } from './landing/sections/ClosingScene';
import { ContactFooter } from './landing/sections/ContactFooter';
import { CovidOrigin } from './landing/sections/CovidOrigin';
import { Hero } from './landing/sections/Hero';
import { TryOne } from './landing/sections/TryOne';
import { WhatElse } from './landing/sections/WhatElse';
import { WhyInteractive } from './landing/sections/WhyInteractive';

/**
 * Landing page — the site's centerpiece. Long-form vertical scroll composing
 * 7 section components in spec order. Replaces the Phase 4 welcome.tsx
 * placeholder.
 *
 * - Hero (P7.T2) — title card + multi-plane scene
 * - CovidOrigin (P7.T3) — the talk's origin story + multi-plane scene
 * - WhyInteractive (P7.T4) — prose, philosophy
 * - TryOne (P7.T5) — inline Interstellar demo (EquationCard + SliderInput + LiveResult)
 * - WhatElse (P7.T6) — ExperienceCard grid for Cruise + Habitat
 * - ClosingScene (P7.T7) — final multi-plane scene
 * - ContactFooter (P7.T8) — page-specific CTA close
 *
 * AppLayout's chrome <Nav /> and <Footer /> wrap all sections.
 */
export default function Landing() {
    const { t } = useTranslation();

    return (
        <AppLayout pageTitle={t('landing.pageTitle')}>
            <Hero />
            <CovidOrigin />
            <WhyInteractive />
            <TryOne />
            <WhatElse />
            <ClosingScene />
            <ContactFooter />
        </AppLayout>
    );
}
