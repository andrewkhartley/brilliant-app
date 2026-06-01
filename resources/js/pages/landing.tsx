import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

import { ClosingScene } from './landing/sections/ClosingScene';
import { ContactFooter } from './landing/sections/ContactFooter';
import { CovidOrigin } from './landing/sections/CovidOrigin';
import { Hero } from './landing/sections/Hero';
import { TryOne } from './landing/sections/TryOne';
import { WhatElse } from './landing/sections/WhatElse';

/**
 * Landing page: the application's centerpiece and proof-of-work narrative.
 *
 * Current Phase 7 shape:
 * - Hero: title card + multi-plane scene
 * - CovidOrigin: Clubhouse origin + interactive-learning capstone
 * - TryOne: storytelling-experiences philosophy + inline relativity demo
 * - WhatElse: links to Interstellar, Sol Cruise, and Habitat
 * - ClosingScene: final multi-plane scene
 * - ContactFooter: page-specific CTA close
 */
export default function Landing() {
    const { t } = useTranslation();

    return (
        <AppLayout pageTitle={t('landing.pageTitle')}>
            <Hero />
            <CovidOrigin />
            <TryOne />
            <WhatElse />
            <ClosingScene />
            <ContactFooter />
        </AppLayout>
    );
}
