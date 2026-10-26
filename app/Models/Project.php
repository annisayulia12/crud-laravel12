<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $table = 'project';
    
    protected $fillable = [
        'name',
        'description',
        'status',
        'start_date',
        'due_date',
        'created_by'
    ];

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'project_id');
    }
}
