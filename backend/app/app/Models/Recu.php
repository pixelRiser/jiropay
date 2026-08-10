<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['paiement_id', 'numero_recu', 'date_emission', 'destinataire', 'envoye'])]
class Recu extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'date_emission' => 'datetime',
            'envoye' => 'boolean',
        ];
    }

    public function paiement(): BelongsTo
    {
        return $this->belongsTo(Paiement::class);
    }
}
