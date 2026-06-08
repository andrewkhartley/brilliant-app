<?php

namespace App\Http\Requests;

use App\Models\Experiences\Cruise\Destination;
use App\Services\Experiences\Cruise\DestinationService;
use App\Services\Experiences\Cruise\EphemerisCatalog;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Server-side validation for POST /playground/cruise.
 *
 * Validates the shape the trip builder needs. The client-side zod schema owns
 * the "today or later" UX floor so browser-local dates do not get rejected by
 * a server timezone boundary with Laravel's generic after_or_equal message.
 *
 * Public access — `/playground/cruise` is a no-auth playground page,
 * so `authorize()` is `true` (the override from the make:request
 * default of `false` which would 403 anyone).
 *
 * Phase 10 T5.6 adds `layovers` — a parallel array of integers (1–90
 * days) where each entry pairs with the same-index destination. The
 * cross-field "must have one entry per destination" rule lives in
 * `withValidator()` rather than the rules() array because Laravel's
 * `size:` rule resolves its argument at rule-parse time using
 * `count($this->input('destinations'))`, which fires BEFORE the
 * destinations array has been validated as an array — passing a
 * non-array there throws a TypeError. Moving the length check into
 * the after-callback lets the array rules on `destinations` run
 * first, so by the time we count() it, we know it's safe.
 */
class StoreCruiseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'dataSource' => [
                'required',
                'string',
                'in:'.DestinationService::DATA_SOURCE_HORIZONS.','.DestinationService::DATA_SOURCE_EPHEMERIS,
            ],
            'destinations' => ['required', 'array', 'min:1', 'max:8'],
            'destinations.*' => [
                'required',
                'string',
            ],
            'tripStart' => ['required', 'date'],
            'layovers' => ['required', 'array'],
            'layovers.*' => ['required', 'integer', 'min:1', 'max:90'],
        ];
    }

    /**
     * Cross-field rule: `layovers` length MUST equal `destinations` length.
     *
     * Runs as an after-callback so the per-field array rules already
     * ran — if either input isn't an array (or destinations failed
     * min/max), the per-field bag already has the error and the length
     * check would be a duplicate-complaint, so we short-circuit on
     * `$validator->errors()->hasAny()` for those fields.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            if ($validator->errors()->hasAny(['destinations', 'layovers'])) {
                return;
            }

            $destinations = $this->input('destinations', []);
            $layovers = $this->input('layovers', []);

            if (! is_array($destinations) || ! is_array($layovers)) {
                return;
            }

            if (count($layovers) !== count($destinations)) {
                $validator->errors()->add(
                    'layovers',
                    'Layover counts must match destination count.',
                );
            }

            $dataSource = $this->input('dataSource', DestinationService::DATA_SOURCE_HORIZONS);
            $validCodes = $dataSource === DestinationService::DATA_SOURCE_EPHEMERIS
                ? collect(EphemerisCatalog::destinations())->pluck('code')
                : Destination::getCachedFacts()->pluck('destination_code');

            foreach ($destinations as $destination) {
                if (! is_string($destination) || ! $validCodes->contains($destination)) {
                    $validator->errors()->add(
                        'destinations',
                        'One or more destinations is not recognized.',
                    );

                    return;
                }
            }
        });
    }
}
