import {
    DndContext,
    
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import type {DragEndEvent} from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useTranslation } from '@/hooks/useTranslation';

export interface Destination {
    code: string;
    name: string;
}

interface DestinationPickerProps {
    /** Full destination catalog from the controller. */
    destinations: Destination[];
    /** Ordered list of selected destination codes (controlled by parent). */
    selected: string[];
    /** Bubble the next ordered selection up to the page. */
    onChange: (next: string[]) => void;
}

/**
 * DestinationPicker — dnd-kit Sortable list + add-button rail.
 *
 * Two visual zones make the form's affordances explicit:
 *  - "Selected" — the ordered itinerary, drag-or-keyboard reorderable;
 *    each row has a Remove button that lifts the destination back to
 *    the available rail
 *  - "Available" — the remaining catalog as add-buttons; clicking one
 *    appends it to the end of the selection
 *
 * Keyboard reorder UX (dnd-kit's built-in pattern, used as-is):
 *  - Tab to a selected item → focus-visible ring on the row
 *  - Space → grab the item (ARIA-live announces "Picked up <name>")
 *  - ↑ / ↓ → move one position; ARIA-live announces the new spot
 *  - Space → drop; Escape cancels
 *
 * Phase 10 T3 ships the UI scaffold only. T4 adds zod validation +
 * Inertia.post so this picker's selection actually flows to the
 * server-side trip builder. Copy is PLACEHOLDER — Andrew refines
 * over the weekend; the keys are what's load-bearing.
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-.
 */
export function DestinationPicker({
    destinations,
    selected,
    onChange,
}: DestinationPickerProps) {
    const { t } = useTranslation();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // Resolve ordered selection to full destination shape; filter
    // out any code that no longer exists (defensive — should never
    // happen in normal flows but keeps the render pure).
    const selectedItems = selected
        .map((code) => destinations.find((d) => d.code === code))
        .filter((d): d is Destination => Boolean(d));

    const available = destinations.filter((d) => !selected.includes(d.code));

    function handleDragEnd(event: DragEndEvent) {
        if (event.over && event.active.id !== event.over.id) {
            const oldIndex = selected.indexOf(String(event.active.id));
            const newIndex = selected.indexOf(String(event.over.id));

            if (oldIndex !== -1 && newIndex !== -1) {
                onChange(arrayMove(selected, oldIndex, newIndex));
            }
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-neutral-900">
                    {t('cruise.form.destinations.label')}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                    {t('cruise.form.destinations.hint')}
                </p>
            </div>

            {selectedItems.length === 0 ? (
                <p className="rounded border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
                    {t('cruise.form.destinations.emptyState')}
                </p>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={selected}
                        strategy={verticalListSortingStrategy}
                    >
                        <ol
                            className="space-y-2"
                            aria-label={t(
                                'cruise.form.destinations.selectedAriaLabel',
                            )}
                        >
                            {selectedItems.map((destination, index) => (
                                <SortableItem
                                    key={destination.code}
                                    destination={destination}
                                    position={index + 1}
                                    onRemove={() =>
                                        onChange(
                                            selected.filter(
                                                (c) => c !== destination.code,
                                            ),
                                        )
                                    }
                                />
                            ))}
                        </ol>
                    </SortableContext>
                </DndContext>
            )}

            <div>
                <h4 className="text-sm font-medium text-neutral-700">
                    {t('cruise.form.destinations.availableLabel')}
                </h4>
                {available.length === 0 ? (
                    <p className="mt-2 text-sm text-neutral-500">
                        {t('cruise.form.destinations.allAddedState')}
                    </p>
                ) : (
                    <ul className="mt-2 flex flex-wrap gap-2">
                        {available.map((destination) => (
                            <li key={destination.code}>
                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange([
                                            ...selected,
                                            destination.code,
                                        ])
                                    }
                                    className="rounded border border-neutral-300 bg-white px-3 py-1 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    {t('cruise.form.destinations.add', {
                                        name: destination.name,
                                    })}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

interface SortableItemProps {
    destination: Destination;
    /** 1-based ordinal for the ARIA label. */
    position: number;
    onRemove: () => void;
}

/**
 * SortableItem — single row in the ordered selection list.
 *
 * The whole row is the drag handle (spreads `listeners` + `attributes`
 * onto the <li>) so pointer-drag works anywhere on the row. The
 * Remove button stops propagation via type="button" + its own
 * onClick — dnd-kit's PointerSensor ignores button presses by
 * default, so the Remove click doesn't trigger a drag.
 */
function SortableItem({ destination, position, onRemove }: SortableItemProps) {
    const { t } = useTranslation();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: destination.code });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 rounded border border-neutral-300 bg-white px-3 py-2 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            {...attributes}
            {...listeners}
        >
            <span
                aria-hidden="true"
                className="font-mono text-sm text-neutral-400"
            >
                {t('cruise.form.destinations.positionLabel', {
                    position: String(position),
                })}
            </span>
            <span className="flex-1 text-neutral-900">{destination.name}</span>
            <button
                type="button"
                onClick={onRemove}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label={t('cruise.form.destinations.removeAriaLabel', {
                    name: destination.name,
                })}
                className="rounded px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
                {t('cruise.form.destinations.removeLabel')}
            </button>
        </li>
    );
}
