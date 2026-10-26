<?php

namespace App\Http\Requests;


use Illuminate\Foundation\Http\FormRequest;

class StoreTransactionRequest extends FormRequest
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
            'project_id' => 'required|integer|exists:project,id',
            'title' => 'required|string|max:255',
            'type' => 'required|in:income,expense',
            'catogery' => 'nullable|string|max:100',
            'amount' => 'required|numeric|gt:0',
            'transaction_date' => 'required|date',
            'description' => 'nullable|string'
        ];
    }
}
