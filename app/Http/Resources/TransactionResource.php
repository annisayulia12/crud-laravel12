<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'project_id' => $this->project_id,
            'created_by' => $this->created_by,
            'title' => $this->title,
            'type' => $this->type,
            'category' => $this->category,
            'amount' => $this->amount,
            'transaction_date' => $this->transaction_date,
            'description' => $this->description,
            'project' => $this->whenLoaded('project', function(){
                return [
                    'id' => $this->project->id,
                    'name' => $this->project->name,
                ];
            }),
            'creator' => $this->whenLoaded('creator', function(){
                return[
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'created_at' => $this->created_at,
            'update_at' => $this->update_at,
        ];
    }
}
