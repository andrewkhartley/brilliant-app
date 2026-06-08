import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect, useRef } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

import { ContactFooter } from './landing/sections/ContactFooter';
import { CovidOrigin } from './landing/sections/CovidOrigin';
import { Hero } from './landing/sections/Hero';
import { Orientation } from './landing/sections/Orientation';
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
 * - ContactFooter: page-specific CTA close
 */
export default function Landing() {
    const { t } = useTranslation();
    const pageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const page = pageRef.current;

        if (
            page === null ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const context = gsap.context(() => {
            gsap.utils
                .toArray<HTMLElement>('[data-landing-reveal]')
                .forEach((element) => {
                    const delay = Number(element.dataset.landingDelay ?? 0);

                    gsap.fromTo(
                        element,
                        { autoAlpha: 0, y: 24, filter: 'blur(8px)' },
                        {
                            autoAlpha: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            delay,
                            duration: 0.78,
                            ease: 'power3.out',
                            scrollTrigger: {
                                trigger: element,
                                start: 'top 82%',
                                once: true,
                            },
                        },
                    );
                });

            gsap.utils
                .toArray<HTMLElement>('[data-landing-stagger]')
                .forEach((container) => {
                    gsap.fromTo(
                        Array.from(container.children),
                        { autoAlpha: 0, y: 18, filter: 'blur(6px)' },
                        {
                            autoAlpha: 1,
                            y: 0,
                            filter: 'blur(0px)',
                            duration: 0.68,
                            ease: 'power2.out',
                            stagger: 0.08,
                            scrollTrigger: {
                                trigger: container,
                                start: 'top 82%',
                                once: true,
                            },
                        },
                    );
                });
        }, page);

        return () => context.revert();
    }, []);

    return (
        <AppLayout
            pageTitle={t('landing.pageTitle')}
            hideFooterLinks
            showNavActions
        >
            <div ref={pageRef}>
                <Hero />
                <Orientation />
                <CovidOrigin />
                <TryOne />
                <WhatElse />
                <ContactFooter />
            </div>
        </AppLayout>
    );
}
