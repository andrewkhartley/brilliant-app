import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ChangeEvent } from 'react';

import { useTranslation } from '@/hooks/useTranslation';

export interface Destination {
    code: string;
    name: string;
}

/**
 * One row in the selected-destinations list. The `slotId` is a stable
 * per-selection identifier (NOT the destination code) — it's what
 * dnd-kit's SortableContext keys items by, which is what unblocks
 * picking the same planet twice (two slots with code='mer' but
 * different slotIds reorder + remove independently). Generated at
 * "Add" time via `crypto.randomUUID()`; the `Date.now()`+`Math.random()`
 * fallback handles environments without Web Crypto (Vitest jsdom, old
 * Safari) without an extra polyfill.
 */
export interface SelectedSlot {
    slotId: string;
    code: string;
    layoverDays: number;
}

interface DestinationPickerProps {
    /** Full destination catalog from the controller. */
    destinations: Destination[];
    /** Ordered list of selected slots (controlled by parent). */
    selected: SelectedSlot[];
    /** Bubble the next ordered selection up to the page. */
    onChange: (next: SelectedSlot[]) => void;
}

/** Default days at a freshly-added stop. Matches the lifted-form initial value
 *  and the PHP `DEFAULT_LAYOVER_DAYS` fallback. Kept module-local so the
 *  client can override without a round-trip to the server. */
const DEFAULT_LAYOVER_DAYS = 5;

/** Layover bounds — kept in lock-step with the zod schema + PHP rules
 *  (`layovers.*: integer min:1 max:90`). Native number inputs clamp UX,
 *  but the schema is still the authority on the wire. */
const MIN_LAYOVER_DAYS = 1;
const MAX_LAYOVER_DAYS = 90;

/**
 * DestinationPicker — dnd-kit Sortable list + add-button rail.
 *
 * Two visual zones make the form's affordances explicit:
 *  - "Selected" — the ordered itinerary, drag-or-keyboard reorderable;
 *    each row has a per-stop "days at X" input + a Remove button.
 *  - "Available" — the full catalog as add-buttons; clicking one
 *    appends a new slot. Picking the same destination twice creates
 *    two independent slots (T5.6 — was filtered-out pre-T5.6).
 *
 * Keyboard reorder UX (dnd-kit's built-in pattern, used as-is):
 *  - Tab to a selected item → focus-visible ring on the row
 *  - Space → grab the item (ARIA-live announces "Picked up <name>")
 *  - ↑ / ↓ → move one position; ARIA-live announces the new spot
 *  - Space → drop; Escape cancels
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

    // Map slotId -> sort index for the dnd-end handler. dnd-kit's
    // `active.id` / `over.id` are the same opaque IDs we passed to
    // `SortableContext` (slotIds), so the lookup is symmetric.
    const slotIds = selected.map((slot) => slot.slotId);

    function handleAdd(destination: Destination) {
        const newSlot: SelectedSlot = {
            slotId: mintSlotId(),
            code: destination.code,
            layoverDays: DEFAULT_LAYOVER_DAYS,
        };

        onChange([...selected, newSlot]);
    }

    function handleRemove(slotId: string) {
        onChange(selected.filter((slot) => slot.slotId !== slotId));
    }

    function handleLayoverChange(slotId: string, nextDays: number) {
        // The native <input type="number"> can hand us NaN if the user
        // clears the field; treat that as "intent to retype" and hold
        // the bounded value at MIN so the wire payload stays valid.
        const clamped = clampLayover(nextDays);

        onChange(
            selected.map((slot) =>
                slot.slotId === slotId
                    ? { ...slot, layoverDays: clamped }
                    : slot,
            ),
        );
    }

    function handleDragEnd(event: DragEndEvent) {
        if (event.over && event.active.id !== event.over.id) {
            const oldIndex = slotIds.indexOf(String(event.active.id));
            const newIndex = slotIds.indexOf(String(event.over.id));

            if (oldIndex !== -1 && newIndex !== -1) {
                onChange(arrayMove(selected, oldIndex, newIndex));
            }
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-white">
                    {t('cruise.form.destinations.label')}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                    {t('cruise.form.destinations.hint')}
                </p>
            </div>

            {selected.length === 0 ? (
                <div className="rounded border border-dashed border-cyan-200/35 bg-cyan-50/8 px-4 py-5 text-sm text-slate-300">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded bg-cyan-200/12 text-cyan-100">
                            <EmptyRouteIcon />
                        </span>
                        <p>{t('cruise.form.destinations.emptyState')}</p>
                    </div>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={slotIds}
                        strategy={verticalListSortingStrategy}
                    >
                        <ol
                            className="space-y-2"
                            aria-label={t(
                                'cruise.form.destinations.selectedAriaLabel',
                            )}
                        >
                            {selected.map((slot, index) => {
                                const destination = destinations.find(
                                    (d) => d.code === slot.code,
                                );

                                if (!destination) {
                                    return null;
                                }

                                return (
                                    <SortableItem
                                        key={slot.slotId}
                                        slot={slot}
                                        destination={destination}
                                        position={index + 1}
                                        onRemove={() =>
                                            handleRemove(slot.slotId)
                                        }
                                        onLayoverChange={(next) =>
                                            handleLayoverChange(
                                                slot.slotId,
                                                next,
                                            )
                                        }
                                    />
                                );
                            })}
                        </ol>
                    </SortableContext>
                </DndContext>
            )}

            <div>
                <h4 className="text-sm font-bold text-cyan-100">
                    {t('cruise.form.destinations.availableLabel')}
                </h4>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {destinations.map((destination) => (
                        <li key={destination.code}>
                            <button
                                type="button"
                                onClick={() => handleAdd(destination)}
                                aria-label={t('cruise.form.destinations.add', {
                                    name: destination.name,
                                })}
                                className="group flex min-h-20 w-full cursor-pointer items-center gap-3 rounded border border-cyan-100/20 bg-white/6 p-3 text-left transition-colors hover:border-cyan-200/70 hover:bg-cyan-200/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                            >
                                <span className="flex size-12 shrink-0 items-center justify-center rounded bg-slate-950/70 ring-1 ring-cyan-100/15">
                                    <img
                                        src={destinationImageSrc(destination)}
                                        alt=""
                                        className="size-9 object-contain transition-transform group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </span>
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-bold text-white">
                                        {destination.name}
                                    </span>
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function EmptyRouteIcon() {
    return (
        <span aria-hidden="true" className="relative block size-5">
            <span className="absolute top-0.5 left-0 size-2 rounded-full border-2 border-current bg-current/12" />
            <span className="absolute right-0 bottom-0.5 size-2 rounded-full border-2 border-current bg-current/12" />
            <span className="absolute top-[0.58rem] left-[0.55rem] h-0.5 w-3 rotate-45 rounded-full bg-current" />
        </span>
    );
}

interface SortableItemProps {
    slot: SelectedSlot;
    destination: Destination;
    /** 1-based ordinal for the ARIA label. */
    position: number;
    onRemove: () => void;
    onLayoverChange: (nextDays: number) => void;
}

/**
 * SortableItem — single row in the ordered selection list.
 *
 * The row is the drag handle (spreads `listeners` + `attributes`
 * onto the <li>) so pointer-drag works anywhere on the row that
 * isn't an interactive child. The layover <input> and Remove button
 * both stop pointer propagation so dragging the row doesn't fire
 * when the user is editing days or clicking remove — dnd-kit's
 * PointerSensor ignores native button presses by default but
 * <input> elements need the explicit guard.
 */
function SortableItem({
    slot,
    destination,
    position,
    onRemove,
    onLayoverChange,
}: SortableItemProps) {
    const { t } = useTranslation();
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: slot.slotId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const parsed = Number(event.target.value);
        onLayoverChange(Number.isFinite(parsed) ? parsed : MIN_LAYOVER_DAYS);
    }

    const layoverInputId = `layover-${slot.slotId}`;

    return (
        <li
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-3 rounded border border-cyan-100/20 bg-white/8 px-3 py-2 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            {...attributes}
            {...listeners}
        >
            <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded bg-cyan-200 text-sm font-bold text-slate-950"
            >
                {t('cruise.form.destinations.positionLabel', {
                    position: String(position),
                })}
            </span>
            <span className="flex size-10 shrink-0 items-center justify-center rounded bg-slate-950/80 ring-1 ring-cyan-100/15">
                <img
                    src={destinationImageSrc(destination)}
                    alt=""
                    className="size-8 object-contain"
                    loading="lazy"
                />
            </span>
            <span className="flex-1 font-semibold text-white">
                {destination.name}
            </span>
            <label htmlFor={layoverInputId} className="text-xs text-slate-400">
                {t('cruise.form.destinations.layoverLabel', {
                    name: destination.name,
                })}
            </label>
            <input
                id={layoverInputId}
                type="number"
                inputMode="numeric"
                min={MIN_LAYOVER_DAYS}
                max={MAX_LAYOVER_DAYS}
                step={1}
                value={slot.layoverDays}
                onChange={handleInputChange}
                onPointerDown={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
                aria-label={t(
                    'cruise.form.destinations.layoverInputAriaLabel',
                    { name: destination.name },
                )}
                className="w-16 rounded border border-cyan-100/25 bg-slate-950/80 px-2 py-1 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            />
            <span aria-hidden="true" className="text-xs text-slate-400">
                {t('cruise.form.destinations.layoverUnitLabel')}
            </span>
            <button
                type="button"
                onClick={onRemove}
                onPointerDown={(event) => event.stopPropagation()}
                aria-label={t('cruise.form.destinations.removeAriaLabel', {
                    name: destination.name,
                })}
                className="cursor-pointer rounded px-2 py-1 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
                {t('cruise.form.destinations.removeLabel')}
            </button>
        </li>
    );
}

function destinationImageSrc(destination: Destination): string {
    return `/assets/img/destinations/${destination.code}.png`;
}

/**
 * Build a stable per-slot identifier. Prefers `crypto.randomUUID()`
 * (available in all modern browsers + the test environment when
 * jsdom enables it), falls back to a timestamp+random pair for the
 * narrow edge cases where Web Crypto isn't reachable. The fallback
 * isn't cryptographically strong but it doesn't need to be — slotId
 * is purely a UI key, never written to the server or storage.
 */
function mintSlotId(): string {
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return crypto.randomUUID();
    }

    return `slot-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Clamp a (possibly NaN, possibly fractional) layover input to the
 * inclusive [MIN, MAX] window of integer days. The native number
 * input's `min`/`max` attributes constrain UI affordances but the
 * user can still type 500 and we want the form state to stay valid.
 */
function clampLayover(value: number): number {
    if (!Number.isFinite(value)) {
        return MIN_LAYOVER_DAYS;
    }

    const integer = Math.round(value);

    if (integer < MIN_LAYOVER_DAYS) {
        return MIN_LAYOVER_DAYS;
    }

    if (integer > MAX_LAYOVER_DAYS) {
        return MAX_LAYOVER_DAYS;
    }

    return integer;
}
