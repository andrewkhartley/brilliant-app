import { useState } from 'react';

import { EquationCard } from '@/components/equations/EquationCard';
import { LiveResult } from '@/components/equations/LiveResult';
import { SliderInput } from '@/components/equations/SliderInput';
import { useTranslation } from '@/hooks/useTranslation';
import { SPEED_OF_LIGHT, STANDARD_GRAVITY } from '@/lib/constants';
import { relativisticSpeed } from '@/lib/equations/relativistic-speed';

export function TryOne() {
    const { t } = useTranslation();
    const [acceleration, setAcceleration] = useState<number>(STANDARD_GRAVITY);

    const oneYearSeconds = 365.25 * 24 * 60 * 60;
    const velocityMetersPerSecond = relativisticSpeed.compute({
        a: acceleration,
        t: oneYearSeconds,
    });
    const fractionOfLightSpeed = velocityMetersPerSecond / SPEED_OF_LIGHT;
    const formattedFraction = fractionOfLightSpeed.toFixed(4);
    const eras = [
        t('landing.tryOne.era1900'),
        t('landing.tryOne.era1940'),
        t('landing.tryOne.era1980'),
        t('landing.tryOne.era2020'),
        t('landing.tryOne.eraFuture'),
    ];

    return (
        <section className="relative overflow-hidden border-t border-cyan-100/15 bg-[#08111f] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(125,211,252,0.17),transparent_30%),radial-gradient(circle_at_16%_70%,rgba(34,211,238,0.1),transparent_26%),linear-gradient(135deg,rgba(8,17,31,0.94),rgba(15,23,42,0.98))]" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:72px_72px] opacity-35"
            />

            <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24">
                <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.26em] text-cyan-200/76 uppercase">
                            {t('landing.tryOne.kicker')}
                        </p>
                        <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                            {t('landing.tryOne.heading')}
                        </h2>
                        <p className="mt-5 text-lg leading-8 text-cyan-50/78">
                            {t('landing.tryOne.intro')}
                        </p>

                        <div className="mt-7 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
                            {eras.map((era) => (
                                <span
                                    key={era}
                                    className="rounded border border-cyan-100/12 bg-cyan-50/6 px-3 py-2 text-center font-semibold text-cyan-50/78"
                                >
                                    {era}
                                </span>
                            ))}
                        </div>

                        <div className="mt-7 space-y-4 text-sm leading-7 text-cyan-50/72 sm:text-base sm:leading-8">
                            <p>{t('landing.tryOne.paragraph1')}</p>
                            <p>{t('landing.tryOne.paragraph2')}</p>
                            <p>{t('landing.tryOne.paragraph3')}</p>
                        </div>
                        <p className="mt-6 rounded border border-cyan-100/14 bg-cyan-50/7 p-4 text-sm leading-7 font-semibold text-cyan-50/86 shadow-lg shadow-black/20">
                            {t('landing.tryOne.capstone')}
                        </p>
                    </div>

                    <div className="relative">
                        <div
                            aria-hidden="true"
                            className="absolute -inset-4 rounded-xl bg-cyan-300/7 blur-2xl"
                        />
                        <div className="relative overflow-hidden rounded-lg border border-cyan-100/16 bg-slate-950/68 p-5 shadow-2xl shadow-black/35 backdrop-blur-md sm:p-6">
                            <p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/78 uppercase">
                                {t('landing.tryOne.demoKicker')}
                            </p>
                            <h3 className="mt-3 text-2xl font-semibold tracking-normal text-white">
                                {t('landing.tryOne.demoHeading')}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-cyan-50/70">
                                {t('landing.tryOne.demoIntro')}
                            </p>

                            <div className="mt-6 space-y-6">
                                <EquationCard equation={relativisticSpeed} />

                                <SliderInput
                                    id="try-one-acceleration"
                                    label={t('landing.tryOne.sliderLabel')}
                                    min={0.1}
                                    max={100}
                                    step={0.1}
                                    value={acceleration}
                                    onChange={setAcceleration}
                                    formatValue={(v) => `${v.toFixed(1)} m/s^2`}
                                    formatAriaValueText={(v) =>
                                        `${v.toFixed(1)} meters per second squared`
                                    }
                                />

                                <LiveResult
                                    label={t('landing.tryOne.resultLabel')}
                                >
                                    {`${formattedFraction} c`}
                                </LiveResult>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
