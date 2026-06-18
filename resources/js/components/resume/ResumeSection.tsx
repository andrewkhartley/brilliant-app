import { ResumeLine } from '@/components/resume/ResumeLine';
import { SectionWipe } from '@/components/resume/SectionWipe';

interface ResumeSectionLine {
    corporate: string;
    honest: string;
}

interface ResumeSectionProps {
    /** Plain section title (Summary, Technical Skills, Education). */
    heading?: string;
    /** Job header fields — rendered statically, never wiped. */
    company?: string;
    role?: string;
    dates?: string;
    location?: string;
    lines: ResumeSectionLine[];
    /** Accessible label for this section's wipe handle. */
    handleLabel: string;
    /** Builds the handle's spoken value text from the current corporate %. */
    valueText: (corporatePercent: number) => string;
}

/**
 * One résumé block with its own independent before/after wipe. The header
 * (section title OR company/role/dates/location) is a fact and renders once,
 * full-width, above the seam — never wiped. Only the lines carry corporate/
 * honest pairs, and they live inside a per-section SectionWipe so this
 * section's handle controls only this section. Logical Tailwind classes keep
 * it RTL-safe.
 */
export function ResumeSection({
    heading,
    company,
    role,
    dates,
    location,
    lines,
    handleLabel,
    valueText,
}: ResumeSectionProps) {
    return (
        <section className="border-t border-cyan-100/12 py-10 first:border-t-0">
            <header className="mb-6 px-10">
                {heading ? (
                    <h2 className="text-2xl font-semibold tracking-tight text-white">
                        {heading}
                    </h2>
                ) : (
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight text-white">
                            {company}
                        </h2>
                        <span className="text-sm font-medium text-cyan-200/70">
                            {dates}
                        </span>
                        <p className="w-full text-sm font-semibold tracking-wide text-cyan-100/80">
                            {role}
                            {location ? (
                                <span className="text-cyan-50/50"> · {location}</span>
                            ) : null}
                        </p>
                    </div>
                )}
            </header>

            <SectionWipe handleLabel={handleLabel} valueText={valueText}>
                <div className="space-y-5">
                    {lines.map((line, index) => (
                        <ResumeLine
                            key={index}
                            corporate={line.corporate}
                            honest={line.honest}
                        />
                    ))}
                </div>
            </SectionWipe>
        </section>
    );
}
