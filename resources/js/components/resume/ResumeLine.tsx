interface ResumeLineProps {
    corporate: string;
    honest: string;
}

/**
 * One résumé line rendered as a before/after wipe pair.
 *
 * Both layers occupy the same CSS grid cell (col-start-1 / row-start-1), so
 * the grid row auto-sizes to the taller of the two and they overlap exactly —
 * no absolute positioning and no separate height sizer. Each layer clips
 * against the shared `--wipe` CSS variable set by SectionWipe on an ancestor:
 *  - corporate shows from the start edge to the seam
 *  - honest shows from the seam to the end edge
 *
 * The `px-10` gutters keep the text clear of the seam handle's travel: clip
 * percentages are relative to the full border box, so the seam still spans the
 * whole line, but the text inside is inset far enough that the handle never
 * covers a character at the wipe extremes.
 *
 * Accessibility: both full strings are real DOM text, always present, so
 * screen readers read corporate then honest regardless of the wipe position.
 * The clip is purely visual.
 */
export function ResumeLine({ corporate, honest }: ResumeLineProps) {
    return (
        <div className="grid">
            <p
                data-layer="corporate"
                className="col-start-1 row-start-1 px-10 text-base leading-7 text-slate-400"
                style={{ clipPath: 'inset(0 calc(100% - var(--wipe)) 0 0)' }}
            >
                {corporate}
            </p>
            <p
                data-layer="honest"
                className="col-start-1 row-start-1 px-10 text-base leading-7 text-cyan-50"
                style={{ clipPath: 'inset(0 0 0 var(--wipe))' }}
            >
                {honest}
            </p>
        </div>
    );
}
