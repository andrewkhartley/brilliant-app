interface GlowPhraseProps {
    className?: string;
    phrase: string;
    text: string;
}

export function GlowPhrase({
    className = 'story-glow-emphasis',
    phrase,
    text,
}: GlowPhraseProps) {
    const phraseIndex = text.indexOf(phrase);

    if (phraseIndex === -1) {
        return <>{text}</>;
    }

    return (
        <>
            {text.slice(0, phraseIndex)}
            <strong className={className}>{phrase}</strong>
            {text.slice(phraseIndex + phrase.length)}
        </>
    );
}
