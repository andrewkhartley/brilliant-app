<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

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
        ];
    }
}
