<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['paiement_id', 'guichet_id', 'montant_facture', 'montant_frais', 'part_plateforme', 'montant_commission', 'statut'])]
class Commission extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'montant_facture' => 'integer',
            'montant_frais' => 'integer',
            'part_plateforme' => 'integer',
            'montant_commission' => 'integer',
        ];
    }

    public function paiement(): BelongsTo
    {
        return $this->belongsTo(Paiement::class);
    }

    public function guichet(): BelongsTo
    {
        return $this->belongsTo(Guichet::class);
    }
}
