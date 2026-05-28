import { createInertiaApp } from '@inertiajs/react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

if (import.meta.env.DEV) {
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
});
