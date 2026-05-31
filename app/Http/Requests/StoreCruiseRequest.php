<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Server-side validation for POST /playground/cruise.
 *
 * Mirrors the rules in `resources/js/lib/validation/cruise-form-schema.ts`
 * so the client can short-circuit obviously-bad input but the server
 * remains the source of truth. Defense-in-depth: a curl request or
 * a user with DevTools open can bypass the zod check, so every rule
 * here has a counterpart on the client and the inverse must also hold.
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
            'destinations' => ['required', 'array', 'min:1', 'max:8'],
            'destinations.*' => [
                'required',
                'string',
                'exists:solar_system_facts,destination_code',
            ],
            'tripStart' => ['required', 'date', 'after_or_equal:today'],
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
        });
    }
}
