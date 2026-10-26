<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $transactions = Transaction::with(['project', 'creator'])
        ->when(
            $request->filled('project_id'),
            fn($query) => $query->where(
                'project_id',
                $request->query('project_id')
            )
        )
        ->orderBy('transaction_date', 'desc')
        ->orderBy('id', 'desc')
        ->get();
        
        return TransactionResource::collection($transactions);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTransactionRequest $request)
    {
        $data = $request->validated();
        $data['created_by'] = $request->user()->id;

        $transaction = Transaction::create($data);

        return response(new TransactionResource($transaction->load(['project', 'creator'])), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Transaction $transaction)
    {
         return new TransactionResource($transaction->load(['project', 'creator']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction)
    {
        $data = $request->validated();
        $transaction->update($data);

        return new TransactionResource($transaction->fresh()->load(['project', 'creator']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Transaction $transaction)
    {
        $transaction->delete();
        return response("", 204);
    }
}
