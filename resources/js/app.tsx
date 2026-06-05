import { createInertiaApp } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

declare global {
    interface Window {
        FontAwesomeConfig?: {
            autoReplaceSvg?: boolean;
            observeMutations?: boolean;
        };
    }
}

if (import.meta.env.DEV && !import.meta.env.SSR) {
    void (async () => {
        const [{ default: React }, { default: ReactDOM }, { default: axe }] =
            await Promise.all([
                import('react'),
                import('react-dom'),
                import('@axe-core/react'),
            ]);

        // 1000ms debounce: re-run axe at most once per second after any DOM mutation
        void axe(React, ReactDOM, 1000);
    })();
}

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
}).then(() => loadFontAwesomeKit());

function loadFontAwesomeKit() {
    if (import.meta.env.SSR || document.getElementById('fontawesome-kit')) {
        return;
    }

    window.FontAwesomeConfig = {
        autoReplaceSvg: false,
        observeMutations: false,
    };

    const script = document.createElement('script');

    script.id = 'fontawesome-kit';
    script.src = 'https://kit.fontawesome.com/f22762bc1a.js';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.dataset.autoReplaceSvg = 'false';
    script.dataset.observeMutations = 'false';

    document.head.appendChild(script);
}
