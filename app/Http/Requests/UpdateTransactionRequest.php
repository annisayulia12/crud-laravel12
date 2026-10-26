<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTransactionRequest extends FormRequest
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
     * @return array<string, array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_id' => 'sometimes|required|integer|exists:project,id',
            'title' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:income,expense',
            'catogery' => 'nullable|string|max:100',
            'amount' => 'sometimes|required|numeric|gt:0',
            'transaction_date' => 'sometimes|required|date',
            'description' => 'nullable|string'
        ];
    }
}
