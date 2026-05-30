import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

import { Contact } from './about/sections/Contact';
import { Covid } from './about/sections/Covid';
import { Disney } from './about/sections/Disney';
import { Intro } from './about/sections/Intro';
import { WhatIMake } from './about/sections/WhatIMake';
import { WhyBrilliant } from './about/sections/WhyBrilliant';

/**
 * About page — the longer story. Where the landing carries a taste of
 * Andrew's work + the pitch, About is the depth. Disney chapter, Covid
 * talks, Undaunted's full origin, why Brilliant. Pure prose with a
 * single portrait photo slot at the top of the Intro section.
 *
 * Section order:
 * - Intro (P12.T2) — h1 + opening line + photo slot
 * - Disney chapter (P12.T2) — craft lineage
 * - Covid talks (P12.T2) — 2020 pivot, the pattern
 * - WhatIMake (P12.T2) — Undaunted; the transparency-attribution thread
 * - WhyBrilliant (P12.T2) — synthesis + trajectory
 * - Contact (P12.T2) — email + LinkedIn CTA
 *
 * AppLayout's chrome <Nav /> and <Footer /> wrap all sections.
 */
export default function AboutPage() {
    const { t } = useTranslation();

    return (
        <AppLayout pageTitle={t('about.pageTitle')}>
            <Intro />
            <Disney />
            <Covid />
            <WhatIMake />
            <WhyBrilliant />
            <Contact />
        </AppLayout>
    );
}
