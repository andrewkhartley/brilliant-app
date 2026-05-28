import { Layer } from './Layer';
import type { LayerProps } from './types';

export type LayerStackItem = Omit<LayerProps, 'position'> & {
    id: string;
};

export interface LayerStackProps {
    middle?: LayerStackItem[];
    top?: LayerStackItem[];
    bottom?: LayerStackItem[];
}

export function LayerStack({
    middle = [],
    top = [],
    bottom = [],
}: LayerStackProps) {
    return (
        <>
            {middle.map((layer) => (
                <Layer key={layer.id} {...layer} position="full" />
            ))}
            {top.map((layer) => (
                <Layer key={layer.id} {...layer} position="top" />
            ))}
            {bottom.map((layer) => (
                <Layer key={layer.id} {...layer} position="bottom" />
            ))}
        </>
    );
}
